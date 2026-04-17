#!/usr/bin/env python3
"""
folder_watcher.py — Watch a folder for new MP4 files and auto-upload to Omega TV.

When a new MP4 appears in the watched folder:
1. Waits for the file to finish writing
2. Uploads to Bunny Stream
3. Creates a DRAFT episode in Supabase (no series/metadata — admin finishes in panel)
4. Moves the file to a "Done" subfolder

Usage:
    python3 scripts/folder_watcher.py ~/OmegaTV/Upload

    # Or with a custom done folder:
    python3 scripts/folder_watcher.py ~/OmegaTV/Upload --done ~/OmegaTV/Done

    # Dry run (no uploads):
    python3 scripts/folder_watcher.py ~/OmegaTV/Upload --dry-run

Install as auto-start service:
    python3 scripts/folder_watcher.py ~/OmegaTV/Upload --install-service

Reads config from .env.local in the omega-tv project root.
"""

import argparse
import json
import os
import shutil
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from datetime import datetime

# Load .env.local
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env.local'
    load_dotenv(env_path)
except ImportError:
    pass

# ─── Config ───
BUNNY_API_KEY = os.environ.get('BUNNY_API_KEY', '')
BUNNY_LIBRARY_ID = os.environ.get('NEXT_PUBLIC_BUNNY_LIBRARY_ID', '')
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

POLL_INTERVAL = 5  # seconds between folder checks
STABLE_WAIT = 3    # seconds to confirm file size is stable (done writing)


def log(msg: str):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{timestamp}] {msg}"
    print(line)
    # Also append to log file next to script
    try:
        log_path = Path(__file__).parent.parent / 'omega-watcher.log'
        with open(log_path, 'a') as f:
            f.write(line + '\n')
    except:
        pass


def check_config():
    missing = []
    if not BUNNY_API_KEY: missing.append('BUNNY_API_KEY')
    if not BUNNY_LIBRARY_ID: missing.append('NEXT_PUBLIC_BUNNY_LIBRARY_ID')
    if not SUPABASE_URL: missing.append('NEXT_PUBLIC_SUPABASE_URL')
    if not SUPABASE_SERVICE_KEY: missing.append('SUPABASE_SERVICE_ROLE_KEY')
    if missing:
        log(f"❌ Missing env vars: {', '.join(missing)}")
        sys.exit(1)


def is_video_file(path: Path) -> bool:
    return path.suffix.lower() in {'.mp4', '.mov', '.mkv', '.avi', '.webm'}


def wait_for_stable(filepath: Path, timeout: int = 300) -> bool:
    """Wait for file to stop growing (writing complete)."""
    prev_size = -1
    stable_count = 0
    start = time.time()

    while time.time() - start < timeout:
        try:
            curr_size = filepath.stat().st_size
        except FileNotFoundError:
            return False

        if curr_size == prev_size and curr_size > 0:
            stable_count += 1
            if stable_count >= 2:
                return True
        else:
            stable_count = 0

        prev_size = curr_size
        time.sleep(STABLE_WAIT)

    return False


# ─── Bunny API ───

def create_bunny_video(title: str) -> str:
    url = f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos"
    data = json.dumps({'title': title}).encode()
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('AccessKey', BUNNY_API_KEY)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')

    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode())
        return result['guid']


def upload_to_bunny(guid: str, filepath: Path):
    url = f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{guid}"
    file_size = filepath.stat().st_size

    with open(filepath, 'rb') as f:
        req = urllib.request.Request(url, data=f.read(), method='PUT')
        req.add_header('AccessKey', BUNNY_API_KEY)
        req.add_header('Content-Type', 'application/octet-stream')

        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            return result.get('success', True)


# ─── Supabase API ───

def create_draft_episode(bunny_guid: str, filename: str):
    """Create a draft episode in Supabase — no series, just the video reference."""
    url = f"{SUPABASE_URL}/rest/v1/episodes"
    title = Path(filename).stem.replace('_', ' ').replace('-', ' ')

    data = json.dumps({
        'bunny_video_id': bunny_guid,
        'title': title,
        'episode_number': 1,
        'status': 'draft',
        'source': 'folder',
        'description': f'Sjálfvirk upphleðsla úr möppu: {filename}',
    }).encode()

    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('apikey', SUPABASE_SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=representation')

    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode())
        if result and len(result) > 0:
            return result[0].get('id')
        return None


# ─── Process a file ───

def process_file(filepath: Path, done_dir: Path, dry_run: bool = False):
    filename = filepath.name
    file_mb = filepath.stat().st_size / (1024 * 1024)

    log(f"📁 New file detected: {filename} ({file_mb:.1f} MB)")

    # Wait for file to finish writing
    log(f"   Waiting for file to stabilize...")
    if not wait_for_stable(filepath):
        log(f"   ⚠️  File didn't stabilize, skipping: {filename}")
        return

    if dry_run:
        log(f"   🏁 Dry run — would upload {filename}")
        return

    try:
        # Step 1: Create video entry in Bunny
        log(f"   📤 Creating Bunny entry...")
        title = filepath.stem.replace('_', ' ').replace('-', ' ')
        guid = create_bunny_video(title)
        log(f"   ✅ Bunny ID: {guid}")

        # Step 2: Upload file
        log(f"   📤 Uploading to Bunny CDN ({file_mb:.1f} MB)...")
        upload_to_bunny(guid, filepath)
        log(f"   ✅ Upload complete!")

        # Step 3: Create draft in Supabase
        log(f"   📝 Creating draft episode...")
        episode_id = create_draft_episode(guid, filename)
        log(f"   ✅ Draft created: {episode_id}")

        # Step 4: Move to Done folder
        done_dir.mkdir(parents=True, exist_ok=True)
        dest = done_dir / filename
        if dest.exists():
            dest = done_dir / f"{filepath.stem}_{int(time.time())}{filepath.suffix}"
        shutil.move(str(filepath), str(dest))
        log(f"   📂 Moved to: {dest.name}")

        log(f"   ✅ Done! Video is now a draft at omega.is/admin/videos")

    except Exception as e:
        log(f"   ❌ Error processing {filename}: {e}")


# ─── Install launchd service ───

def install_service(watch_dir: str):
    """Install as a macOS launchd service for auto-start."""
    script_path = os.path.abspath(__file__)
    plist_name = 'is.omega.folder-watcher'
    plist_path = Path.home() / 'Library' / 'LaunchAgents' / f'{plist_name}.plist'

    plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>{plist_name}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>{script_path}</string>
        <string>{watch_dir}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>{Path.home()}/Library/Logs/omega-watcher.log</string>
    <key>StandardErrorPath</key>
    <string>{Path.home()}/Library/Logs/omega-watcher-error.log</string>
</dict>
</plist>"""

    plist_path.parent.mkdir(parents=True, exist_ok=True)
    with open(plist_path, 'w') as f:
        f.write(plist_content)

    os.system(f'launchctl unload {plist_path} 2>/dev/null')
    os.system(f'launchctl load {plist_path}')

    log(f"✅ Service installed: {plist_name}")
    log(f"   Plist: {plist_path}")
    log(f"   Watching: {watch_dir}")
    log(f"   Logs: ~/Library/Logs/omega-watcher.log")
    log(f"")
    log(f"   To stop:  launchctl unload {plist_path}")
    log(f"   To start: launchctl load {plist_path}")


# ─── Main watcher loop ───

def watch_folder(watch_dir: Path, done_dir: Path, dry_run: bool = False):
    """Poll the folder for new video files."""
    processed = set()

    # Pre-populate with existing files (don't re-process on restart)
    for f in watch_dir.iterdir():
        if is_video_file(f):
            processed.add(f.name)
    log(f"📂 Ignoring {len(processed)} existing files")

    log(f"👁️  Watching: {watch_dir}")
    log(f"📂 Done folder: {done_dir}")
    log(f"   Drop MP4 files into the watched folder to auto-publish as drafts.")
    log(f"")

    while True:
        try:
            for f in watch_dir.iterdir():
                if is_video_file(f) and f.name not in processed:
                    processed.add(f.name)
                    process_file(f, done_dir, dry_run)
        except Exception as e:
            log(f"⚠️  Watcher error: {e}")

        time.sleep(POLL_INTERVAL)


# ─── Entry point ───

def main():
    parser = argparse.ArgumentParser(
        description='Watch a folder and auto-upload videos to Omega TV as drafts',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument('folder', help='Folder to watch for new MP4 files')
    parser.add_argument('--done', help='Folder to move processed files to (default: <folder>/Done)')
    parser.add_argument('--dry-run', action='store_true', help='Log what would happen without uploading')
    parser.add_argument('--install-service', action='store_true', help='Install as macOS launchd auto-start service')

    args = parser.parse_args()

    watch_dir = Path(args.folder).expanduser().resolve()
    done_dir = Path(args.done).expanduser().resolve() if args.done else watch_dir / 'Done'

    if not watch_dir.exists():
        watch_dir.mkdir(parents=True)
        log(f"📁 Created watch folder: {watch_dir}")

    check_config()

    if args.install_service:
        install_service(str(watch_dir))
        return

    log(f"""
╔══════════════════════════════════════════════════╗
║      Ω  OMEGA TV — Folder Watcher                ║
╠══════════════════════════════════════════════════╣
║  Watching:  {str(watch_dir)[:38]:<38} ║
║  Done:      {str(done_dir)[:38]:<38} ║
║  Dry run:   {'Yes' if args.dry_run else 'No':<38} ║
╚══════════════════════════════════════════════════╝
""")

    watch_folder(watch_dir, done_dir, args.dry_run)


if __name__ == '__main__':
    main()
