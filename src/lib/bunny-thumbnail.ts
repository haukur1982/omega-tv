const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || 'https://vz-dd90f302-e7e.b-cdn.net';

/**
 * The canonical thumbnail filename for a video. Defaults to "thumbnail.jpg",
 * but a video whose cover was set to a custom/time-based frame gets a hashed
 * name (e.g. "thumbnail_965ee98e.jpg"). Resolve it from the API so the proxy
 * never 404s on those videos.
 */
async function resolveThumbnailFileName(videoId: string): Promise<string | null> {
    if (!LIBRARY_ID || !BUNNY_API_KEY) return null;
    try {
        const res = await fetch(
            `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${encodeURIComponent(videoId)}`,
            { headers: { AccessKey: BUNNY_API_KEY, accept: 'application/json' }, cache: 'no-store' },
        );
        if (!res.ok) return null;
        const data = (await res.json()) as { thumbnailFileName?: string };
        return data.thumbnailFileName || null;
    } catch {
        return null;
    }
}

export function getBunnyThumbnailProxyUrl(videoId: string | null | undefined): string | null {
    if (!videoId) return null;
    return `/api/bunny/thumbnail/${encodeURIComponent(videoId)}`;
}

export function getBunnyThumbnailCdnUrl(videoId: string, fileName = 'thumbnail.jpg'): string {
    return `${CDN_HOSTNAME.replace(/\/$/, '')}/${encodeURIComponent(videoId)}/${fileName}`;
}

export function getBunnyEmbedReferer(videoId: string): string {
    return `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${encodeURIComponent(videoId)}`;
}

export async function fetchBunnyThumbnailBuffer(videoId: string): Promise<{
    buffer: Buffer;
    contentType: string;
}> {
    if (!LIBRARY_ID) {
        throw new Error('NEXT_PUBLIC_BUNNY_LIBRARY_ID is not configured.');
    }

    const headers = {
        Accept: 'image/jpeg,image/png,image/*',
        Referer: getBunnyEmbedReferer(videoId),
    };

    // Try the default thumbnail.jpg first (covers the common case with no extra
    // API call). If it's missing — e.g. the cover was set to a custom/time-based
    // frame and now has a hashed filename — resolve the real name and retry.
    let res = await fetch(getBunnyThumbnailCdnUrl(videoId), { headers, cache: 'no-store' });
    if (res.status === 404) {
        const realName = await resolveThumbnailFileName(videoId);
        if (realName && realName !== 'thumbnail.jpg') {
            res = await fetch(getBunnyThumbnailCdnUrl(videoId, realName), { headers, cache: 'no-store' });
        }
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch Bunny thumbnail: ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return {
        buffer: Buffer.from(arrayBuffer),
        contentType: res.headers.get('content-type') || 'image/jpeg',
    };
}
