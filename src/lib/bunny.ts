const API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
const LIVE_STREAM_ID = process.env.NEXT_PUBLIC_BUNNY_LIVE_STREAM_ID;
const BASE_URL = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`;
// Note: You should configure a Pull Zone in Bunny for optimized delivery.
// For now we use the direct thumbnail pattern:
const CDN_HOSTNAME = 'https://vz-dd90f302-e7e.b-cdn.net';

export interface BunnyVideo {
    guid: string;
    title: string;
    date: string; // created at
    length: number; // seconds
    views: number;
    category: string;
    thumbnailFileName: string;
    metaTags?: { property: string; value: string }[];
}

export function getThumbnailUrl(videoId: string) {
    // Standard Bunny Stream thumbnail path
    // Format: https://{libraryId}.b-cdn.net/{videoId}/thumbnail.jpg
    // Note: This often requires a custom hostname set in Bunny. 
    // Fallback if no custom domain: https://iframe.mediadelivery.net/thumbnail/{library_id}/{video_id}/thumbnail.jpg
    return `https://iframe.mediadelivery.net/thumbnail/${LIBRARY_ID}/${videoId}/thumbnail.jpg`;
}

// ---------------------------------------------------------------------------
// SERIES THUMBNAIL SYSTEM
// ---------------------------------------------------------------------------
// Instead of uploading a custom image for every episode, we map the "Show Name"
// to a single master image. This saves hours of work.
const SERIES_THUMBNAILS: Record<string, string> = {
    // Vertical Posters (2:3 Aspect Ratio)
    "Í snertingu": "https://omega-tv.b-cdn.net/InTouch.png",
    "Í snertingu með dr. Charles Stanley": "https://omega-tv.b-cdn.net/InTouch.png", // Exact match fix
    "Jólaskraut": "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=1000&auto=format&fit=crop", // Red Ornament
    "Bænakvöld": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop", // Praying Hands
    "Omega": "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?q=80&w=1000&auto=format&fit=crop", // Blue/Abstract
    "Sunnudagssamkoma": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop",
};

export function parseVideoMetadata(video: BunnyVideo) {
    // Remove extension
    const cleanName = video.title.replace(/\.[^/.]+$/, "");

    // Default values
    let show = "Omega";
    let title = cleanName;
    let category = video.category || "Almennt";
    let dateStr = video.date;

    // Enhanced Detection: Check if title starts with any known Series Name
    // This fixes the issue where "Í snertingu" (no date/hyphen) wasn't being detected
    for (const knownShow of Object.keys(SERIES_THUMBNAILS)) {
        if (cleanName.startsWith(knownShow)) {
            show = knownShow;
            // If the name is basically just the show name, keep title as is or clean it slightly
            // e.g. "Í snertingu" -> show="Í snertingu", title="Í snertingu"
            break;
        }
    }

    // Try to parse "Show - Date - Title" format for better Metadata if possible
    // Example: "Í snertingu - 21. des - Jólin"
    const parts = cleanName.split(' - ');

    if (parts.length >= 3) {
        show = parts[0].trim();
        const potentialDate = parts[1].trim();
        title = parts.slice(2).join(' - ').trim();
        dateStr = potentialDate;
    } else if (parts.length === 2) {
        show = parts[0].trim();
        title = parts[1].trim();
    }

    // Determine Thumbnail (Series Override vs Generated)
    // If we have a preset for this show, use it. Otherwise, use the auto-generated one from Bunny.
    const thumbnail = SERIES_THUMBNAILS[show] || getThumbnailUrl(video.guid);

    return {
        title,
        show,
        dateDisplay: dateStr.includes('T') ? new Date(dateStr).toLocaleDateString('is-IS') : dateStr,
        category,
        thumbnail
    };
}

export async function getVideos(page = 1, itemsPerPage = 50): Promise<BunnyVideo[]> {
    if (!API_KEY || !LIBRARY_ID) {
        console.warn("Bunny.net keys missing");
        return [];
    }

    try {
        const res = await fetch(`${BASE_URL}?page=${page}&itemsPerPage=${itemsPerPage}&orderBy=date`, {
            headers: {
                AccessKey: API_KEY,
                Accept: 'application/json',
            },
            next: { revalidate: 60 }
        });

        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();
        return data.items || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════════
// Caption / subtitle tracks
//
// Azotus (sister project) uploads subtitled MP4s + separate caption
// tracks to this Bunny library. Bunny exposes tracks per video via
// the video detail endpoint. We surface them in the UI as a language
// switcher on the player (see plan §4.2).
// ═══════════════════════════════════════════════════════════════════

export interface BunnyCaption {
    srclang: string;      // ISO 639-1 or BCP47 language code — e.g. 'is', 'en', 'de'
    label: string;        // Human label — e.g. 'Íslenska', 'English'
    url?: string;         // Direct WebVTT URL (see getCaptionUrl)
}

export interface BunnyVideoDetail extends BunnyVideo {
    captions?: BunnyCaption[];
    chapters?: { title: string; start: number; end?: number }[];
}

/**
 * Build the canonical WebVTT URL for a Bunny caption track.
 * Bunny stores captions at /{library}/{video}/captions/{lang}.vtt on the
 * iframe.mediadelivery.net CDN.
 */
export function getCaptionUrl(videoId: string, srclang: string): string {
    return `https://iframe.mediadelivery.net/${LIBRARY_ID}/${videoId}/captions/${srclang}.vtt`;
}

/**
 * Fetch full detail for a single Bunny video, including its caption tracks.
 * Returns null on any error so callers can render an empty state gracefully.
 */
export async function getBunnyVideoDetail(videoId: string): Promise<BunnyVideoDetail | null> {
    if (!API_KEY || !LIBRARY_ID) return null;
    if (!videoId) return null;

    try {
        const res = await fetch(`${BASE_URL}/${videoId}`, {
            headers: {
                AccessKey: API_KEY,
                Accept: 'application/json',
            },
            next: { revalidate: 300 },
        });
        if (!res.ok) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await res.json();

        const captions: BunnyCaption[] = Array.isArray(data.captions)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? data.captions.map((c: any) => ({
                srclang: c.srclang,
                label: c.label || c.srclang,
                url: getCaptionUrl(videoId, c.srclang),
            }))
            : [];

        // Bunny stores chapters as an array of { title, start, end } when present.
        const chapters = Array.isArray(data.chapters) ? data.chapters : undefined;

        return {
            guid: data.guid,
            title: data.title,
            date: data.dateUploaded || data.date,
            length: data.length,
            views: data.views,
            category: data.category,
            thumbnailFileName: data.thumbnailFileName,
            metaTags: data.metaTags,
            captions,
            chapters,
        };
    } catch (error) {
        console.error('Bunny video detail fetch failed:', error);
        return null;
    }
}

/**
 * Build an embed URL for the Bunny iframe player, with optional caption
 * preferences and chapter support. Supports `t` param for seek.
 */
export function getBunnyEmbedUrl(
    videoId: string,
    options: {
        autoplay?: boolean;
        muted?: boolean;
        loop?: boolean;
        captionsDefault?: string;  // language code
        chapters?: boolean;
        startSeconds?: number;
    } = {},
): string {
    const params = new URLSearchParams();
    if (options.autoplay ?? true) params.set('autoplay', 'true');
    if (options.muted) params.set('muted', 'true');
    if (options.loop) params.set('loop', 'true');
    if (options.chapters ?? true) params.set('chapters', 'true');
    if (options.captionsDefault) params.set('captions', options.captionsDefault);
    if (options.startSeconds && options.startSeconds > 0) {
        params.set('t', Math.floor(options.startSeconds).toString());
    }
    return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?${params.toString()}`;
}

export async function getLiveStream() {
    // Return the configured Live Stream ID if available
    if (LIVE_STREAM_ID) {
        return {
            isLive: true, // The player handles the offline state gracefully
            videoId: LIVE_STREAM_ID,
            viewerCount: 0, // Would need value from API
        };
    }

    // Fallback/Placeholder
    return {
        isLive: true,
        viewerCount: 125,
        videoId: undefined
    };
}
