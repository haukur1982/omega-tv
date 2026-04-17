'use client';

import HorizontalRail from '@/components/layout/HorizontalRail';
import VODRailCard from '@/components/vod/VODRailCard';

export default function IsraelVOD() {
    // Placeholder mock data specifically for Israel documentaries
    const mockIsraelVideos = [
        {
            id: 'israel-miracle-1',
            title: 'Kraftaverkið Ísrael: 1948',
            speaker: 'Omega Heimildarmynd',
            duration: '45:00',
            thumbnail: 'https://images.unsplash.com/photo-1544626053-8985dc34ae63?auto=format&fit=crop&q=80&w=800',
            date: '2025-05-14'
        },
        {
            id: 'israel-prophecy-2',
            title: 'Spádómar Esekíels Uppfylltir',
            speaker: 'Biblíukennsla',
            duration: '32:15',
            thumbnail: 'https://images.unsplash.com/photo-1600862080350-b8c71510ecfa?auto=format&fit=crop&q=80&w=800',
            date: '2025-10-12'
        },
        {
            id: 'jerusalem-capital-3',
            title: 'Jerúsalem: Borg hins Mikla Konungs',
            speaker: 'Söguleg Yfirferð',
            duration: '50:20',
            thumbnail: 'https://images.unsplash.com/photo-1527784288031-155eabfa6bf8?auto=format&fit=crop&q=80&w=800',
            date: '2025-11-20'
        },
        {
            id: 'covenant-4',
            title: 'Sáttmáli Abrahams í Nútímanum',
            speaker: 'Biblíukennsla',
            duration: '28:40',
            thumbnail: 'https://images.unsplash.com/photo-1533154832595-5dbec88b1b59?auto=format&fit=crop&q=80&w=800',
            date: '2026-01-05'
        }
    ];

    return (
        <section 
            id="heimildarmyndir"
            style={{
                backgroundColor: '#0A0A0A', // Slightly lighter than the hero/foundation for contrast
                padding: 'clamp(4rem, 8vw, 6rem) 0',
                overflow: 'hidden',
                borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
            }}
        >
            <div style={{ padding: '0 clamp(1rem, 4vw, 3rem)' }}>
                <h2 
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        marginBottom: '1rem',
                    }}
                >
                    Heimildarmyndir & Kennsla
                </h2>
                <div 
                    style={{
                        width: '60px',
                        height: '3px',
                        backgroundColor: '#D4AF37',
                        marginBottom: '2rem',
                    }}
                />
            </div>

            <HorizontalRail>
                {mockIsraelVideos.map(video => (
                    <VODRailCard key={video.id} video={video} />
                ))}
            </HorizontalRail>
        </section>
    );
}
