'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Upload, User, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { createSeries } from '@/lib/vod-db';
import { supabase } from '@/lib/supabase';

// Helper to slugify text
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export default function NewSeriesPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [host, setHost] = useState('');
    const [description, setDescription] = useState('');
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        setSlug(slugify(val));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPosterFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let posterUrl = null;

            // 1. Upload Image if present
            if (posterFile) {
                const fileName = `${slug}-${Date.now()}.${posterFile.name.split('.').pop()}`;
                const { data, error: uploadError } = await supabase.storage
                    .from('posters')
                    .upload(fileName, posterFile);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('posters')
                    .getPublicUrl(fileName);

                posterUrl = publicUrl;
            }

            // 2. Create Database Record
            await createSeries({
                title,
                slug,
                description,
                host,
                poster_vertical: posterUrl,
                status: 'active'
            });

            // 3. Create initial Season (2026 or Season 1)
            // Note: We'll skip this for now and handle it later or in a separate step

            router.push('/admin/series');
        } catch (error) {
            console.error(error);
            alert('Villa kom upp við að vista þáttaröðina.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/series"
                            className="p-2 rounded-lg hover:bg-[var(--admin-surface-hover)] text-[var(--admin-text-secondary)] transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="admin-h1">Ný þáttaröð</h1>
                            <p className="admin-body">Stofna nýjan flokk fyrir myndbönd</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="admin-card space-y-4">
                            <h3 className="admin-h3 mb-4">Grunnupplýsingar</h3>

                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                    Titill
                                </label>
                                <div className="relative">
                                    <Type size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                                    <input
                                        required
                                        type="text"
                                        value={title}
                                        onChange={handleTitleChange}
                                        placeholder="t.d. Í snertingu..."
                                        className="admin-input pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                    Vefslóð (Slug)
                                </label>
                                <div className="relative">
                                    <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                                    <input
                                        required
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="admin-input pl-10 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                    Kynnir / Stjórnandi
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                                    <input
                                        type="text"
                                        value={host}
                                        onChange={(e) => setHost(e.target.value)}
                                        placeholder="t.d. Dr. Charles Stanley"
                                        className="admin-input pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                                    Lýsing
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="admin-input"
                                    placeholder="Stutt lýsing á þáttunum..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Poster */}
                    <div className="space-y-6">
                        <div className="admin-card space-y-4">
                            <h3 className="admin-h3 mb-2">Mynd (Poster)</h3>
                            <p className="text-xs text-[var(--admin-text-muted)]">
                                Mælt með hlutföllunum 2:3 (t.d. 1000x1500px).
                            </p>

                            <div className="relative aspect-[2/3] bg-black/20 rounded-lg overflow-hidden border-2 border-dashed border-[var(--admin-border)] hover:border-[var(--admin-accent)] transition-colors group">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--admin-text-muted)]">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-sm">Smelltu til að velja</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="admin-btn admin-btn-primary w-full justify-center py-3 text-lg"
                        >
                            {isLoading ? (
                                <span className="admin-spinner" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Stofna þáttaröð</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
