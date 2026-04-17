#!/usr/bin/env python3
"""
vod_publish.py — Publish videos to Omega TV
Uploads an MP4 to Bunny CDN and creates series/episode records in Supabase.

Usage:
    python3 scripts/vod_publish.py "path/to/video.mp4" \
        --series "Í snertingu" \
        --title "Jólin koma" \
        --episode 1 \
        --description "Dr. Charles Stanley"

    # Or just auto-detect from filename:
    python3 scripts/vod_publish.py "4_DELIVERY/VIDEO/I_snertingu_ep01_Jolin_koma.mp4"

Reads config from .env.local in the project root.
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# Load .env.local
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env.local'
    load_dotenv(env_path)
except ImportError:
    print("⚠️  python-dotenv not found, relying on shell environment variables")

# ─── Config ───
BUNNY_API_KEY = os.environ.get('BUNNY_API_KEY', '')
BUNNY_LIBRARY_ID = os.environ.get('NEXT_PUBLIC_BUNNY_LIBRARY_ID', '')
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

def check_config():
    missing = []
    if not BUNNY_API_KEY: missing.append('BUNNY_API_KEY')
    if not BUNNY_LIBRARY_ID: missing.append('NEXT_PUBLIC_BUNNY_LIBRARY_ID')
    if not SUPABASE_URL: missing.append('NEXT_PUBLIC_SUPABASE_URL')
    if not SUPABASE_SERVICE_KEY: missing.append('SUPABASE_SERVICE_ROLE_KEY')
    if missing:
        print(f"❌ Missing env vars: {', '.join(missing)}")
        print(f"   Looked in: {Path(__file__).parent.parent / '.env.local'}")
        sys.exit(1)


# ─── Bunny API ───

def bunny_request(method: str, path: str, body=None) -> dict:
    """Make a request to Bunny Stream API."""
    url = f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('AccessKey', BUNNY_API_KEY)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ''
        print(f"❌ Bunny API error {e.code}: {error_body}")
        sys.exit(1)


def create_bunny_video(title: str) -> str:
    """Create a video entry in Bunny, returns the GUID."""
    result = bunny_request('POST', '/videos', {'title': title})
    guid = result.get('guid')
    if not guid:
        print(f"❌ Failed to create video entry: {result}")
        sys.exit(1)
    print(f"✅ Video entry created: {guid}")
    return guid


def upload_to_bunny(guid: str, filepath: str):
    """Upload the actual MP4 file to Bunny."""
    url = f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{guid}"
    file_size = os.path.getsize(filepath)
    print(f"📤 Uploading {file_size / (1024*1024):.1f} MB to Bunny CDN...")

    with open(filepath, 'rb') as f:
        req = urllib.request.Request(url, data=f.read(), method='PUT')
        req.add_header('AccessKey', BUNNY_API_KEY)
        req.add_header('Content-Type', 'application/octet-stream')

        try:
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read().decode())
                if result.get('success'):
                    print(f"✅ Upload complete!")
                else:
                    print(f"⚠️  Upload response: {result}")
        except urllib.error.HTTPError as e:
            print(f"❌ Upload failed: {e.code} {e.read().decode()}")
            sys.exit(1)


def wait_for_encoding(guid: str, timeout: int = 600):
    """Wait for Bunny to finish encoding the video."""
    print("⏳ Waiting for Bunny encoding...", end='', flush=True)
    start = time.time()
    while time.time() - start < timeout:
        result = bunny_request('GET', f'/videos/{guid}')
        status = result.get('status', -1)
        # Bunny statuses: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
        if status >= 4:
            if status == 5:
                print(f"\n❌ Encoding failed!")
                sys.exit(1)
            print(f"\n✅ Encoding complete! ({time.time() - start:.0f}s)")
            return result
        print('.', end='', flush=True)
        time.sleep(10)
    print(f"\n⚠️  Encoding timed out after {timeout}s — video may still be processing")
    return bunny_request('GET', f'/videos/{guid}')


# ─── Supabase API ───

def supabase_request(method: str, table: str, body=None, params='') -> dict | list | None:
    """Make a request to Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}{params}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('apikey', SUPABASE_SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=representation')

    try:
        with urllib.request.urlopen(req) as resp:
            text = resp.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ''
        print(f"❌ Supabase error {e.code} on {table}: {error_body}")
        return None


def find_or_create_series(title: str, slug: str = '') -> str:
    """Find existing series by title, or create a new one. Returns series ID."""
    if not slug:
        slug = title.lower().replace(' ', '-').replace('í', 'i').replace('ð', 'd').replace('þ', 'th').replace('ö', 'o').replace('ó', 'o').replace('á', 'a').replace('ú', 'u').replace('é', 'e').replace('ý', 'y').replace('æ', 'ae')

    # Try to find existing
    encoded_title = urllib.parse.quote(title)
    result = supabase_request('GET', 'series', params=f'?title=eq.{encoded_title}&select=id')
    if result and len(result) > 0:
        series_id = result[0]['id']
        print(f"📺 Found existing series: {title} ({series_id})")
        return series_id

    # Create new
    result = supabase_request('POST', 'series', {
        'title': title,
        'slug': slug,
        'description': '',
    })
    if result and len(result) > 0:
        series_id = result[0]['id']
        print(f"📺 Created new series: {title} ({series_id})")
        return series_id

    print(f"❌ Failed to create series: {title}")
    sys.exit(1)


def find_or_create_season(series_id: str, season_number: int = 1) -> str:
    """Find or create Season 1 for a series. Returns season ID."""
    result = supabase_request('GET', 'seasons',
        params=f'?series_id=eq.{series_id}&season_number=eq.{season_number}&select=id')
    if result and len(result) > 0:
        return result[0]['id']

    # Create season
    result = supabase_request('POST', 'seasons', {
        'series_id': series_id,
        'season_number': season_number,
        'title': f'Sería {season_number}',
    })
    if result and len(result) > 0:
        print(f"📁 Created Season {season_number}")
        return result[0]['id']

    print(f"❌ Failed to create season")
    sys.exit(1)


def create_episode(series_id: str, season_id: str, bunny_guid: str,
                   title: str, episode_number: int, description: str = ''):
    """Create an episode record linked to the Bunny video."""
    result = supabase_request('POST', 'episodes', {
        'series_id': series_id,
        'season_id': season_id,
        'bunny_video_id': bunny_guid,
        'title': title,
        'episode_number': episode_number,
        'description': description,
    })
    if result and len(result) > 0:
        episode_id = result[0]['id']
        print(f"🎬 Episode created: {title} (#{episode_number})")
        return episode_id

    print(f"❌ Failed to create episode")
    sys.exit(1)


# ─── Main ───

def main():
    parser = argparse.ArgumentParser(
        description='Publish a video to Omega TV (Bunny CDN + Supabase)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 scripts/vod_publish.py video.mp4 --series "Í snertingu" --title "Ep 1" --episode 1
  python3 scripts/vod_publish.py video.mp4 --series "Í snertingu" --title "Ep 1" --episode 1 --no-wait
        """
    )
    parser.add_argument('file', help='Path to MP4 file')
    parser.add_argument('--series', required=True, help='Series name (created if not exists)')
    parser.add_argument('--title', help='Episode title (defaults to filename)')
    parser.add_argument('--episode', type=int, default=1, help='Episode number (default: 1)')
    parser.add_argument('--season', type=int, default=1, help='Season number (default: 1)')
    parser.add_argument('--description', default='', help='Episode description')
    parser.add_argument('--no-wait', action='store_true', help='Skip waiting for Bunny encoding')
    parser.add_argument('--dry-run', action='store_true', help='Show what would happen without doing it')

    args = parser.parse_args()

    # Validate file
    filepath = os.path.abspath(args.file)
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        sys.exit(1)

    if not filepath.lower().endswith('.mp4'):
        print(f"⚠️  Warning: File doesn't end in .mp4 — proceeding anyway")

    # Config check
    check_config()

    title = args.title or Path(filepath).stem.replace('_', ' ')
    file_mb = os.path.getsize(filepath) / (1024 * 1024)

    print(f"""
╔══════════════════════════════════════════════════╗
║           Ω  OMEGA TV — VOD Publisher            ║
╠══════════════════════════════════════════════════╣
║  File:    {Path(filepath).name[:40]:<40} ║
║  Size:    {file_mb:.1f} MB{' ' * (35 - len(f'{file_mb:.1f} MB'))}║
║  Series:  {args.series[:40]:<40} ║
║  Title:   {title[:40]:<40} ║
║  Episode: {args.episode:<40} ║
╚══════════════════════════════════════════════════╝
""")

    if args.dry_run:
        print("🏁 Dry run — no changes made.")
        return

    # Step 1: Create video entry in Bunny
    print("─── Step 1: Create Bunny video entry ───")
    bunny_guid = create_bunny_video(title)

    # Step 2: Upload file
    print("\n─── Step 2: Upload MP4 to Bunny CDN ───")
    upload_to_bunny(bunny_guid, filepath)

    # Step 3: Wait for encoding (optional)
    if not args.no_wait:
        print("\n─── Step 3: Wait for encoding ───")
        wait_for_encoding(bunny_guid)
    else:
        print("\n─── Step 3: Skipped (--no-wait) ───")

    # Step 4: Create/find series in Supabase
    print("\n─── Step 4: Series & Episode in Supabase ───")
    series_id = find_or_create_series(args.series)
    season_id = find_or_create_season(series_id, args.season)
    create_episode(series_id, season_id, bunny_guid, title, args.episode, args.description)

    # Done!
    print(f"""
╔══════════════════════════════════════════════════╗
║  ✅ PUBLISHED SUCCESSFULLY                       ║
║                                                  ║
║  Bunny ID:  {bunny_guid[:38]:<38} ║
║  Player:    iframe.mediadelivery.net/embed/      ║
║             {BUNNY_LIBRARY_ID}/{bunny_guid[:20]}...  ║
║                                                  ║
║  The video will appear on omega.is/sermons       ║
╚══════════════════════════════════════════════════╝
""")


if __name__ == '__main__':
    import urllib.parse
    main()
