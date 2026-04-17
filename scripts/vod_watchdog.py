import os
import time
import subprocess
import logging
from pathlib import Path

# ==============================================================================
# OMEGA TV VOD DROPZONE WATCHDOG
# ==============================================================================
# This script monitors a designated 'Dropzone' folder for new .mp4 files.
# When a new file is detected, it ensures the file has finished transferring
# (size stability) before calling Azotus `vod_publish.py` to push to Omega VOD.
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [WATCHDOG] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("vod_watchdog")

# --- Configuration ---
DROPZONE_DIR = os.getenv("VOD_DROPZONE", os.path.expanduser("~/Desktop/VOD_DROPZONE"))
ARCHIVE_DIR = os.path.join(DROPZONE_DIR, "_ARCHIVE_PUBLISHED")
AZOTUS_DIR = os.path.expanduser("~/Projects/Azotus")  # Path to Azotus on Mac Mini
PUBLISH_SCRIPT = os.path.join(AZOTUS_DIR, "vod_publish.py")

STABILITY_DELAY_SEC = 5    # How long size must remain unchanged
POLL_INTERVAL_SEC = 10     # How often to check for new files

def setup_directories():
    """Ensure our dropzone and archive directories exist."""
    os.makedirs(DROPZONE_DIR, exist_ok=True)
    os.makedirs(ARCHIVE_DIR, exist_ok=True)
    logger.info(f"📂 Dropzone ready at: {DROPZONE_DIR}")
    logger.info(f"📁 Archive ready at:  {ARCHIVE_DIR}")

def is_file_stable(filepath: Path) -> bool:
    """Check if file size has stopped changing (indicates copy is finished)."""
    try:
        initial_size = filepath.stat().st_size
        if initial_size == 0:
            return False
            
        time.sleep(STABILITY_DELAY_SEC)
        
        final_size = filepath.stat().st_size
        return initial_size == final_size
    except Exception as e:
        logger.debug(f"Stability check error on {filepath.name}: {e}")
        return False

def extract_series_name(filepath: Path) -> str:
    """
    Look at the parent directory name to determine the series.
    E.g. DROPZONE/I_Snertingu/video.mp4 -> "I Snertingu"
    If it's right in DROPZONE root, returns "Omega_Uncategorized"
    """
    parent_name = filepath.parent.name
    if parent_name == os.path.basename(DROPZONE_DIR) or parent_name.startswith("_"):
        return "Omega_Sjónvarp"
        
    return parent_name.replace("_", " ")

def publish_video(filepath: Path, series_name: str) -> bool:
    """Invoke the Azotus vod_publish.py script."""
    logger.info(f"🚀 Publishing: {filepath.name} to series '{series_name}'")
    
    cmd = [
        "python", PUBLISH_SCRIPT,
        str(filepath),
        "--series", series_name,
        # We can enable batch/skip-wait dynamically if needed
        # "--skip-wait" 
    ]
    
    try:
        # Run process via subprocess
        # Make sure to run in Azotus dir context if needed
        result = subprocess.run(
            cmd, 
            cwd=AZOTUS_DIR,
            capture_output=True, 
            text=True
        )
        
        if result.returncode == 0:
            logger.info(f"✅ Success publish for {filepath.name}")
            return True
        else:
            logger.error(f"❌ Publish failed for {filepath.name}")
            logger.error(f"Reason: {result.stderr or result.stdout}")
            return False
            
    except FileNotFoundError:
        logger.error(f"❌ Could not find python or vod_publish.py script at {PUBLISH_SCRIPT}")
        return False
    except Exception as e:
        logger.error(f"❌ Error during publishing: {e}")
        return False

def archive_video(filepath: Path):
    """Move file to archive so it isn't processed again."""
    try:
        dest_dir = os.path.join(ARCHIVE_DIR, datetime.now().strftime("%Y-%m"))
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, filepath.name)
        
        # Avoid overwrite
        counter = 1
        while os.path.exists(dest_path):
            base, ext = os.path.splitext(filepath.name)
            dest_path = os.path.join(dest_dir, f"{base}_{counter}{ext}")
            counter += 1
            
        filepath.rename(dest_path)
        logger.info(f"📦 Archived to {dest_path}")
    except Exception as e:
        logger.error(f"Failed to archive {filepath.name}: {e}")

def run_watchdog():
    logger.info("👀 Watchdog started. Waiting for videos (Ctrl+C to quit)...")
    
    while True:
        try:
            # Find all .mp4 files recursively inside DROPZONE 
            # (ignoring the _ARCHIVE_PUBLISHED dir)
            for path in Path(DROPZONE_DIR).rglob("*.mp4"):
                if "_ARCHIVE" in str(path):
                    continue
                    
                logger.info(f"🔎 Found new file: {path.name}")
                
                if is_file_stable(path):
                    series_name = extract_series_name(path)
                    
                    if publish_video(path, series_name):
                        from datetime import datetime
                        archive_video(path)
                    else:
                        logger.warning(f"⚠️ Will retry {path.name} logic next cycle or manually.")
                        # Rename slightly so we dont loop infinitely on failure
                        fail_path = path.with_name(path.name + ".failed")
                        try:
                            path.rename(fail_path)
                            logger.info(f"Renamed to .failed to prevent endless loops")
                        except Exception:
                            pass
                else:
                    logger.info(f"⏳ File is still transferring: {path.name}")
                    
            time.sleep(POLL_INTERVAL_SEC)
            
        except KeyboardInterrupt:
            logger.info("👋 Watchdog stopped.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in watchdog loop: {e}")
            time.sleep(POLL_INTERVAL_SEC)

if __name__ == "__main__":
    setup_directories()
    run_watchdog()
