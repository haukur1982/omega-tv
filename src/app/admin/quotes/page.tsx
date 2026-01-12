'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Image as ImageIcon, Type, Palette, Share2, Save, Layout, Sliders } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

// Presets for social media sizes
const SIZES = {
    instagram: { width: 1080, height: 1080, label: 'Instagram Post', ratio: '1:1' },
    portrait: { width: 1080, height: 1350, label: 'Portrait', ratio: '4:5' },
    story: { width: 1080, height: 1920, label: 'Story', ratio: '9:16' },
};

// Premium Themes
const THEMES = [
    {
        id: 'aurora',
        name: 'Norðurljós',
        image: '/backgrounds/background_aurora_1768175924156.png',
        font: 'Inter',
        overlayColor: '#000000',
        overlayOpacity: 0.3,
        textColor: '#ffffff',
        accentColor: '#4ade80' // Green aurora
    },
    {
        id: 'beach',
        name: 'Reynisfjara',
        image: '/backgrounds/background_black_beach_1768175936487.png',
        font: 'Playfair Display', // Elegant Serif
        overlayColor: '#000000',
        overlayOpacity: 0.5,
        textColor: '#ffffff',
        accentColor: '#fcd34d' // Gold
    },
    {
        id: 'highlands',
        name: 'Hálendið',
        image: '/backgrounds/background_highlands_1768175949412.png',
        font: 'Inter',
        overlayColor: '#000000',
        overlayOpacity: 0.2, // Let the rusty colors shine
        textColor: '#ffffff',
        accentColor: '#fdba74' // Orange
    },
    {
        id: 'moss',
        name: 'Eldhraun',
        image: '/backgrounds/background_moss_1768175963874.png',
        font: 'Merriweather', // Classic Serif
        overlayColor: '#000000',
        overlayOpacity: 0.4,
        textColor: '#ffffff',
        accentColor: '#86efac' // Pale green
    },
] as const;

import UnsplashPicker from '@/components/admin/UnsplashPicker';

export default function QuoteGeneratorPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // State
    const [text, setText] = useState('Allt er mögulegt þeim sem trúir.');
    const [reference, setReference] = useState('Markús 9:23');
    const [selectedSize, setSelectedSize] = useState<keyof typeof SIZES>('instagram');
    const [activeThemeId, setActiveThemeId] = useState<string>(THEMES[0].id);
    const [overlayOpacity, setOverlayOpacity] = useState(0.4);

    // Unsplash Integration
    const [sourceTab, setSourceTab] = useState<'presets' | 'unsplash'>('presets');
    const [unsplashImage, setUnsplashImage] = useState<any | null>(null);

    // Image Loading
    const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});

    useEffect(() => {
        // Preload icons/logos if needed
        THEMES.forEach(theme => {
            const img = new Image();
            img.src = theme.image;
            img.onload = () => {
                setLoadedImages(prev => ({ ...prev, [theme.id]: img }));
            };
        });
    }, []);

    // Load Unsplash Image when selected
    useEffect(() => {
        if (unsplashImage) {
            const img = new Image();
            // Use query param to avoid caching issues if same ID
            img.crossOrigin = "Anonymous"; // Crucial for canvas export
            img.src = unsplashImage.url;
            img.onload = () => {
                setLoadedImages(prev => ({ ...prev, 'f_unsplash': img }));
                drawCanvas(); // Force draw immediately after load
            };
        }
    }, [unsplashImage]);

    // Draw Trigger
    useEffect(() => {
        drawCanvas();
    }, [text, reference, selectedSize, activeThemeId, overlayOpacity, loadedImages, unsplashImage]);

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = SIZES[selectedSize];
        const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

        // Determine Background Image
        let bgImage = loadedImages[activeThemeId];
        if (unsplashImage && loadedImages['f_unsplash']) {
            bgImage = loadedImages['f_unsplash'];
        }

        // 1. Setup Canvas
        canvas.width = size.width;
        canvas.height = size.height;

        // 2. Draw Background Image (Cover Fit)
        if (bgImage) {
            const scale = Math.max(size.width / bgImage.width, size.height / bgImage.height);
            const x = (size.width / 2) - (bgImage.width / 2) * scale;
            const y = (size.height / 2) - (bgImage.height / 2) * scale;
            ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
        } else {
            // Fallback
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, size.width, size.height);
        }

        // 3. Draw Overlay (Vignette + Dim)
        const gradient = ctx.createRadialGradient(size.width / 2, size.height / 2, 0, size.width / 2, size.height / 2, size.width);
        gradient.addColorStop(0, `rgba(0,0,0,${overlayOpacity * 0.5})`); // Center lighter
        gradient.addColorStop(1, `rgba(0,0,0,${overlayOpacity + 0.3})`); // Edges darker
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size.width, size.height);

        // 4. Typography Layout
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        const maxWidth = size.width * 0.8;

        // Quote Text
        // Dynamic font sizing
        let fontSize = size.width * 0.08;
        if (text.length > 100) fontSize = size.width * 0.06;
        if (text.length > 200) fontSize = size.width * 0.05;

        ctx.font = `bold ${fontSize}px ${theme.font}, sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow for readibility
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Word Wrap
        const words = text.split(' ');
        let line = '';
        const lines = [];
        const lineHeight = fontSize * 1.4;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Vertical Center Calculation
        const totalTextHeight = lines.length * lineHeight;
        const refHeight = size.width * 0.05; // Spacing
        const refFontSize = size.width * 0.04;
        const totalBlockHeight = totalTextHeight + refHeight + refFontSize;

        let startY = centerY - (totalBlockHeight / 2) + (fontSize / 2);

        // Draw Lines
        lines.forEach((l, i) => {
            ctx.fillText(l.trim(), centerX, startY + (i * lineHeight));
        });

        // 5. Draw Reference
        ctx.font = `500 ${refFontSize}px ${theme.font}, sans-serif`;
        ctx.fillStyle = theme.accentColor;
        ctx.shadowBlur = 10; // Less shadow on reference
        ctx.fillText(reference.toUpperCase(), centerX, startY + (lines.length * lineHeight));

        // 6. Draw "OMEGA" Watermark
        const logoSize = size.width * 0.08;
        ctx.font = `900 ${logoSize}px Inter, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3;
        ctx.shadowBlur = 0;
        ctx.fillText('OMEGA', centerX, size.height - (size.height * 0.08));
        ctx.globalAlpha = 1.0;
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `omega-quote-${activeThemeId}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const activeTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

    // New Save Logic
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsSaving(true);
        try {
            // 1. Convert to Blob
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error("Canvas could not export");

            // 2. Upload to Supabase Storage
            const filename = `quote-${Date.now()}.png`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('quotes')
                .upload(filename, blob);

            if (uploadError) {
                // Try fallback bucket 'images' if 'quotes' fails
                console.warn("Quotes bucket failed, trying images...", uploadError);
                const { error: fallbackError } = await supabase.storage
                    .from('images')
                    .upload(`quotes/${filename}`, blob);

                if (fallbackError) throw fallbackError;
            }

            // 3. Get Public URL
            // Determine which bucket worked
            const bucket = uploadError ? 'images' : 'quotes';
            const path = uploadError ? `quotes/${filename}` : filename;

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

            // 4. Save to Database
            const { error: dbError } = await supabase
                .from('quotes')
                .insert({
                    content: text,
                    author: reference,
                    image_url: publicUrl,
                    theme: activeThemeId,
                    status: 'published'
                });

            if (dbError) throw dbError;

            alert("Mynd vistuð í gagnagrunn!");

        } catch (e) {
            console.error("Save failed:", e);
            alert("Vistun mistókst. Athugaðu console.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col xl:flex-row gap-8 h-[calc(100vh-100px)]">
                {/* Left Controls */}
                <div className="w-full xl:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2">
                    <div>
                        <h1 className="text-3xl font-bold font-serif mb-2">Efnisverksmiðjan</h1>
                        <p className="text-[var(--text-secondary)]">Búðu til stórkostlegt efni fyrir samfélagsmiðla.</p>
                    </div>

                    {/* Text Input Block */}
                    <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--glass-border)] space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Type size={18} className="text-[var(--accent-gold)]" />
                            <h3 className="font-bold">Texti & Vers</h3>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-xl p-3 text-lg focus:border-[var(--accent-gold)] outline-none min-h-[120px]"
                            placeholder="Skrifaðu textann hér..."
                        />
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-xl p-3 font-medium focus:border-[var(--accent-gold)] outline-none"
                            placeholder="Tilvísun (t.d. Sálmarnir 23:1)"
                        />
                    </div>

                    {/* Theme Selector */}
                    <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--glass-border)] space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={18} className="text-[var(--accent-gold)]" />
                                <h3 className="font-bold">Bakgrunnur</h3>
                            </div>
                            <div className="flex bg-[var(--bg-deep)] p-1 rounded-lg">
                                <button
                                    onClick={() => setSourceTab('presets')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sourceTab === 'presets' ? 'bg-[var(--bg-surface)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'}`}
                                >
                                    Þemu
                                </button>
                                <button
                                    onClick={() => setSourceTab('unsplash')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sourceTab === 'unsplash' ? 'bg-[var(--bg-surface)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'}`}
                                >
                                    Leita (Unsplash)
                                </button>
                            </div>
                        </div>

                        {sourceTab === 'presets' ? (
                            <div className="grid grid-cols-2 gap-3">
                                {THEMES.map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => {
                                            setActiveThemeId(theme.id);
                                            setOverlayOpacity(theme.overlayOpacity);
                                            setUnsplashImage(null); // Clear unsplash
                                        }}
                                        className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all group ${activeThemeId === theme.id && !unsplashImage ? 'border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]/30' : 'border-transparent hover:border-white/20'
                                            }`}
                                    >
                                        <img src={theme.image} className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                        <span className="absolute bottom-2 left-2 text-xs font-bold text-white shadow-black drop-shadow-md">
                                            {theme.name}
                                        </span>
                                        {activeThemeId === theme.id && !unsplashImage && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent-gold)] shadow-[0_0_10px_var(--accent-gold)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <UnsplashPicker onSelect={(img) => {
                                setUnsplashImage(img);
                                // Trigger redraw
                            }} />
                        )}

                        {/* Attribution for Unsplash */}
                        {unsplashImage && (
                            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 bg-[var(--bg-deep)] p-2 rounded-lg">
                                <span>Valin mynd eftir</span>
                                <a href={`${unsplashImage.photographer_url}?utm_source=omega_tv&utm_medium=referral`} target="_blank" className="text-white underline">{unsplashImage.photographer}</a>
                            </div>
                        )}
                    </div>

                    {/* Fine Tuning */}
                    <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--glass-border)] space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sliders size={18} className="text-[var(--accent-gold)]" />
                            <h3 className="font-bold">Fínstilling</h3>
                        </div>

                        <div>
                            <label className="text-xs uppercase font-bold text-[var(--text-muted)] mb-2 block">Myrkvun bakgrunns</label>
                            <input
                                type="range"
                                min="0" max="0.9" step="0.05"
                                value={overlayOpacity}
                                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                                className="w-full accent-[var(--accent-gold)]"
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase font-bold text-[var(--text-muted)] mb-2 block">Stærð</label>
                            <div className="flex bg-[var(--bg-deep)] p-1 rounded-lg">
                                {(Object.entries(SIZES) as [keyof typeof SIZES, typeof SIZES['instagram']][]).map(([key, conf]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedSize(key)}
                                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${selectedSize === key ? 'bg-[var(--bg-surface)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
                                            }`}
                                    >
                                        {conf.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleDownload}
                            className="flex-1 py-4 bg-[var(--bg-surface)] border border-[var(--glass-border)] text-white font-bold rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Sækja
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-4 bg-[var(--accent-gold)] text-black font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                            {isSaving ? 'Vistar...' : 'Vista'}
                        </button>
                    </div>
                </div>

                {/* Canvas Preview */}
                <div className="flex-1 bg-[#050505] p-8 rounded-3xl border border-[var(--glass-border)] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

                    <div
                        className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out"
                        style={{
                            transform: `scale(${selectedSize === 'story' ? 0.45 : 0.6})`
                        }}
                    >
                        <canvas ref={canvasRef} className="rounded-sm" />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
