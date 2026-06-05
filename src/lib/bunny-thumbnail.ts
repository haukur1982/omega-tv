const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || 'https://vz-dd90f302-e7e.b-cdn.net';

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

    const url = getBunnyThumbnailCdnUrl(videoId);
    const res = await fetch(url, {
        headers: {
            Accept: 'image/jpeg,image/png,image/*',
            Referer: getBunnyEmbedReferer(videoId),
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch Bunny thumbnail: ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return {
        buffer: Buffer.from(arrayBuffer),
        contentType: res.headers.get('content-type') || 'image/jpeg',
    };
}
