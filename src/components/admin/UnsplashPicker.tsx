'use client';

import { useState } from 'react';
import { Search, Loader2, Download, ExternalLink, Shuffle } from 'lucide-react';

interface UnsplashImage {
    id: string;
    url: string;
    thumb: string;
    photographer: string;
    photographer_url: string;
    download_location: string;
}

interface UnsplashPickerProps {
    onSelect: (image: UnsplashImage) => void;
}

export default function UnsplashPicker({ onSelect }: UnsplashPickerProps) {
    const [query, setQuery] = useState('');
    const [images, setImages] = useState<UnsplashImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const searchImages = async (term?: string) => {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const url = term
                ? `/api/admin/unsplash?query=${encodeURIComponent(term)}`
                : `/api/admin/unsplash`; // Random nature

            const res = await fetch(url);
            if (!res.ok) throw new Error('Search failed');

            const data = await res.json();
            setImages(data);
        } catch (e) {
            console.error(e);
            // In a real app we'd show a toast here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchImages(query)}
                    placeholder="Leita að mynd (t.d. Stormur, Friður)..."
                    className="flex-1 bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-xl p-3 text-sm focus:border-[var(--accent)] outline-none"
                />
                <button
                    onClick={() => searchImages(query)}
                    disabled={isLoading}
                    className="p-3 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl hover:border-[var(--accent)] transition-colors"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
            </div>

            {/* Quick Tags / Random */}
            {!hasSearched && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => searchImages('')}
                        className="px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold hover:bg-[var(--accent)]/20 flex items-center gap-1 transition-colors"
                    >
                        <Shuffle size={12} />
                        Velja handahófskennt
                    </button>
                    {['Ísland', 'Fjöll', 'Hafs', 'Himinn', 'Biblía', 'Trú'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => {
                                setQuery(tag);
                                searchImages(tag);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--glass-border)] text-xs text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-muted)] transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img) => (
                    <div
                        key={img.id}
                        className="group relative aspect-[4/5] rounded-lg overflow-hidden cursor-pointer border border-transparent hover:border-[var(--accent)] transition-all bg-[var(--bg-deep)]"
                        onClick={() => onSelect(img)}
                    >
                        <img
                            src={img.thumb}
                            alt={`Photo by ${img.photographer}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                        {/* Photographer Credit (On Hover) */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white truncate">
                                {img.photographer}
                            </p>
                        </div>
                    </div>
                ))}

                {hasSearched && images.length === 0 && !isLoading && (
                    <div className="col-span-2 text-center py-8 text-[var(--text-muted)] text-sm">
                        Engar myndir fundust. Prófaðu annað leitarorð.
                    </div>
                )}
            </div>

            <div className="text-[10px] text-[var(--text-muted)] text-center flex items-center justify-center gap-1">
                Myndir frá <a href="https://unsplash.com/?utm_source=omega_tv&utm_medium=referral" target="_blank" className="underline hover:text-white">Unsplash</a>
            </div>
        </div>
    );
}
