/**
 * scripts/publish-native-is.ts
 *
 * One-shot publisher for native Icelandic content that doesn't need
 * Azotus's translation pipeline.
 *
 * What it does (in order):
 *   1. Upload the video file to Bunny Stream (library 628621)
 *   2. Create a draft episode row in Supabase with status='draft'
 *   3. (Optional) Run the Gemini metadata generator against the
 *      transcript → populates title / description / editor_note /
 *      bible_ref / chapters / tags on the draft.
 *   4. Print the admin review URL.
 *
 * Usage:
 *   pnpm exec tsx --env-file=.env.local scripts/publish-native-is.ts \
 *     <video-path> \
 *     [--transcript <transcript-path>] \
 *     [--show "Sunnudagssamkoma"] \
 *     [--title "Trúin sem sigrar"] \
 *     [--episode 12]
 *
 * The transcript can be:
 *   - A plain .txt file (preferred)
 *   - A .vtt / WebVTT file (timing lines are stripped automatically)
 *   - Azotus's skeleton.json (transcript is extracted from the lines[])
 *
 * If --transcript is omitted, the draft is created with minimal metadata
 * and the reviewer fills in everything in /admin/drafts/[id].
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { generateMetadata, upsertDraftEpisode } from './generate-metadata';

// ══════════════════════════════════════════════════════════════════════
// Config
// ══════════════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!;
const BUNNY_BASE = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env');
    process.exit(1);
}
if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    console.error('Missing BUNNY_API_KEY / NEXT_PUBLIC_BUNNY_LIBRARY_ID in env');
    process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = createClient(SUPABASE_URL, SUPABASE_KEY) as any;

// ══════════════════════════════════════════════════════════════════════
// Argv parsing — simple, no dependency
// ══════════════════════════════════════════════════════════════════════

interface Args {
    videoPath: string;
    transcriptPath?: string;
    show?: string;
    title?: string;
    episode?: number;
    seriesId?: string;
    skipEncodingWait?: boolean;
}

function parseArgs(): Args {
    const argv = process.argv.slice(2);
    if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
        printHelpAndExit();
    }
    const videoPath = resolve(argv[0]);
    const args: Args = { videoPath };
    for (let i = 1; i < argv.length; i++) {
        const flag = argv[i];
        const val = argv[i + 1];
        switch (flag) {
            case '--transcript':
                args.transcriptPath = resolve(val);
                i++;
                break;
            case '--show':
                args.show = val;
                i++;
                break;
            case '--title':
                args.title = val;
                i++;
                break;
            case '--episode':
                args.episode = parseInt(val, 10);
                i++;
                break;
            case '--series-id':
                args.seriesId = val;
                i++;
                break;
            case '--skip-encoding-wait':
                args.skipEncodingWait = true;
                break;
            default:
                console.error(`Unknown flag: ${flag}`);
                printHelpAndExit(1);
        }
    }
    return args;
}

function printHelpAndExit(code = 0): never {
    console.log(`
Omega TV — Native Icelandic publisher

Usage:
  pnpm exec tsx --env-file=.env.local scripts/publish-native-is.ts <video-path> [options]

Options:
  --transcript <path>      Path to transcript file (.txt, .vtt, or skeleton.json).
                           When provided, Gemini metadata generation runs.
  --show <name>            Series name. Defaults to "Omega".
  --title <name>           Episode title. Defaults to a cleaned filename.
  --episode <n>            Episode number (integer). Defaults to 1.
  --series-id <uuid>       Explicit series_id. Takes precedence over --show lookup.
  --skip-encoding-wait     Skip waiting for Bunny to finish transcoding.

Examples:
  # Simple native-IS publish, no transcript — manual metadata review
  pnpm exec tsx scripts/publish-native-is.ts /path/to/sermon.mp4 \\
    --show "Sunnudagssamkoma" --title "Vikuleg lofgjörð"

  # Full pipeline with auto-generated metadata (Gemini)
  pnpm exec tsx --env-file=.env.local scripts/publish-native-is.ts /path/to/sermon.mp4 \\
    --transcript /path/to/transcript.txt \\
    --show "Sunnudagssamkoma" \\
    --title "Trúin sem sigrar" \\
    --episode 12

Output:
  The script prints the admin review URL when finished. Open it to fine-tune
  metadata and hit "Vista og birta" to publish to omega.is.
`);
    process.exit(code);
}

// ══════════════════════════════════════════════════════════════════════
// Bunny Stream API — minimal, just what we need
// ══════════════════════════════════════════════════════════════════════

async function bunnyCreateVideo(title: string): Promise<string> {
    const res = await fetch(BUNNY_BASE, {
        method: 'POST',
        headers: {
            AccessKey: BUNNY_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ title }),
    });
    if (!res.ok) {
        throw new Error(`Bunny create failed (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    return data.guid as string;
}

async function bunnyUpload(videoPath: string, videoId: string): Promise<void> {
    const size = statSync(videoPath).size;
    const sizeMb = (size / 1024 / 1024).toFixed(1);
    console.log(`  📤 Uploading ${sizeMb} MB to Bunny…`);
    const stream = createReadStream(videoPath);
    // Node 18+ supports streaming PUT via Blob-like input
    const res = await fetch(`${BUNNY_BASE}/${videoId}`, {
        method: 'PUT',
        headers: {
            AccessKey: BUNNY_API_KEY,
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(size),
        },
        // Node fetch accepts a Readable as body (via duplex:'half')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: stream as any,
        // @ts-expect-error Node-specific option required for request streams
        duplex: 'half',
    });
    if (!res.ok) {
        throw new Error(`Bunny upload failed (${res.status}): ${await res.text()}`);
    }
    console.log('  ✅ Upload complete');
}

async function bunnyWaitEncoding(videoId: string, timeoutMs = 15 * 60 * 1000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const res = await fetch(`${BUNNY_BASE}/${videoId}`, {
            headers: { AccessKey: BUNNY_API_KEY, Accept: 'application/json' },
        });
        if (!res.ok) {
            console.warn(`  ⚠️ Status check failed: ${res.status}`);
            break;
        }
        const data = await res.json();
        const status = data.status as number;
        // 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
        if (status === 4) {
            console.log('  ✅ Encoding complete');
            return true;
        }
        if (status === 5) {
            console.error('  ❌ Encoding failed on Bunny side');
            return false;
        }
        const elapsed = Math.floor((Date.now() - start) / 1000);
        console.log(`  ⏳ Encoding… (${elapsed}s, status=${status})`);
        await new Promise(r => setTimeout(r, 15000));
    }
    console.warn('  ⚠️ Encoding timeout — continuing anyway');
    return false;
}

// ══════════════════════════════════════════════════════════════════════
// Transcript loading — supports .txt, .vtt, skeleton.json
// ══════════════════════════════════════════════════════════════════════

function loadTranscript(path: string): string {
    const ext = extname(path).toLowerCase();
    const raw = readFileSync(path, 'utf8');

    if (ext === '.json') {
        // Azotus skeleton.json: { lines: [{ text: "..." }, ...] }
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.lines)) {
                return parsed.lines
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((l: any) => (typeof l?.text === 'string' ? l.text : ''))
                    .filter(Boolean)
                    .join(' ');
            }
            if (Array.isArray(parsed?.segments)) {
                return parsed.segments
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((s: any) => s.text ?? '')
                    .filter(Boolean)
                    .join(' ');
            }
        } catch {
            // Fall through to plain-text fallback
        }
    }
    // .vtt or .txt — strip VTT cue timings, keep text lines
    return raw
        .split('\n')
        .filter(l => !/^\d\d:\d\d/.test(l) && !/^WEBVTT/.test(l) && !/-->/.test(l))
        .join('\n')
        .trim();
}

// ══════════════════════════════════════════════════════════════════════
// Series lookup / creation
// ══════════════════════════════════════════════════════════════════════

async function findOrCreateSeries(name: string): Promise<string | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const { data: existing } = await sb
        .from('series')
        .select('id')
        .eq('title', trimmed)
        .maybeSingle();
    if (existing?.id) return existing.id as string;

    // Icelandic-safe slug
    const slug = trimmed
        .toLocaleLowerCase('is')
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o')
        .replace(/ú/g, 'u').replace(/ý/g, 'y').replace(/ð/g, 'd').replace(/þ/g, 'th')
        .replace(/æ/g, 'ae').replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);

    const { data: created, error } = await sb
        .from('series')
        .insert({ title: trimmed, slug, description: `${trimmed} — Omega TV` })
        .select('id')
        .single();
    if (error) {
        console.warn(`  ⚠️ Series create failed: ${error.message}`);
        return null;
    }
    console.log(`  📁 Created new series: ${trimmed}`);
    return created.id as string;
}

// ══════════════════════════════════════════════════════════════════════
// Main flow
// ══════════════════════════════════════════════════════════════════════

async function main() {
    const args = parseArgs();

    if (!statSync(args.videoPath).isFile()) {
        console.error(`Video file not found: ${args.videoPath}`);
        process.exit(1);
    }

    const filename = basename(args.videoPath);
    const fallbackTitle = filename
        .replace(/\.[^/.]+$/, '')
        .replace(/_NATIVE_IS$/i, '')
        .replace(/_SUBBED$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
    const title = args.title ?? fallbackTitle;
    const showName = args.show ?? 'Omega';
    const episodeNum = args.episode ?? 1;

    console.log(`📡 Publishing native-IS: ${filename}`);
    console.log(`   Show:    ${showName}`);
    console.log(`   Title:   ${title}`);
    console.log(`   Episode: #${episodeNum}`);
    if (args.transcriptPath) console.log(`   Transcript: ${args.transcriptPath}`);
    console.log('');

    // Step 1 — Bunny upload
    const bunnyTitle = `${showName} — ${title}`;
    console.log(`→ Creating Bunny video entry…`);
    const bunnyId = await bunnyCreateVideo(bunnyTitle);
    console.log(`  ✅ Bunny GUID: ${bunnyId}`);
    await bunnyUpload(args.videoPath, bunnyId);

    if (!args.skipEncodingWait) {
        console.log(`→ Waiting for Bunny to finish encoding…`);
        await bunnyWaitEncoding(bunnyId);
    }

    // Step 2 — resolve series
    const seriesId = args.seriesId ?? await findOrCreateSeries(showName);

    // Step 3 — metadata generation + episode upsert
    let transcript = '';
    if (args.transcriptPath) {
        console.log(`→ Loading transcript…`);
        transcript = loadTranscript(args.transcriptPath);
        console.log(`  ✅ Transcript loaded (${transcript.length} chars)`);
    }

    console.log(`→ Generating metadata${transcript ? ' (Gemini)' : ' (mock — no transcript)'}…`);
    const meta = await generateMetadata({
        transcriptText: transcript,
        bunnyVideoId: bunnyId,
        filename,
        show: showName,
        language: 'is',
    });

    // Override fields from CLI args
    if (args.title) meta.title = args.title;

    console.log(`→ Upserting draft episode in Supabase…`);
    const episodeId = await upsertDraftEpisode(bunnyId, meta, {
        transcript,
        language_primary: 'is',
    });

    // Link series + episode number if we have them
    if (episodeId) {
        const patch: Record<string, unknown> = { episode_number: episodeNum };
        if (seriesId) patch.series_id = seriesId;
        const { error } = await sb.from('episodes').update(patch).eq('id', episodeId);
        if (error) console.warn(`  ⚠️ Series/episode-number patch failed: ${error.message}`);
    }

    if (!episodeId) {
        console.error('✗ Draft creation failed');
        process.exit(1);
    }

    // Summary
    console.log(`\n═══════════════════════════════════════════════════════════════`);
    console.log(`✓ Native-IS draft ready`);
    console.log(`  Title:       ${meta.title}`);
    if (meta.bible_ref) console.log(`  Bible ref:   ${meta.bible_ref}`);
    if (meta.chapters.length > 0) console.log(`  Chapters:    ${meta.chapters.length}`);
    if (meta.tags.length > 0) console.log(`  Tags:        ${meta.tags.join(', ')}`);
    console.log(`  Bunny GUID:  ${bunnyId}`);
    console.log(``);
    console.log(`Review at: https://omega.is/admin/drafts/${episodeId}`);
    console.log(`(local dev: http://localhost:3005/admin/drafts/${episodeId})`);
    console.log(`═══════════════════════════════════════════════════════════════`);
}

main().catch((e) => {
    console.error('✗', e);
    process.exit(1);
});
