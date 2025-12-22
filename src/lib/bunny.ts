const API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
const BASE_URL = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`;
// Note: You should configure a Pull Zone in Bunny for optimized delivery.
// For now we use the direct thumbnail pattern:
const CDN_HOSTNAME = 'https://pull.b-cdn.net'; // Placeholder, user might need to configure this

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
    "Í snertingu": "https://omega-tv.b-cdn.net/InTouch.png", // Dr. Charles Stanley
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

export async function getLiveStream() {
    // Bunny Stream Live API logic (placeholder until Stream created)
    return {
        isLive: true,
        viewerCount: 125,
        hlsUrl: `https://video.bunnycdn.com/play/${LIBRARY_ID}/default` // Logic to be refined
    };
}
