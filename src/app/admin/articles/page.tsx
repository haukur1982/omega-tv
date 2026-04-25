'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Calendar, User, Eye, Trash2, Edit3, Search, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author_name: string | null;
    featured_image: string | null;
    published_at: string | null;
    created_at: string | null;
    category: string | null;
}

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Create/Edit modal state
    const [showEditor, setShowEditor] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        author_name: 'Omega',
        featured_image: '',
        category: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/articles');
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
            }
        } catch (e) {
            console.error('Failed to load articles:', e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateNew = () => {
        setEditingArticle(null);
        setFormData({
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            author_name: 'Omega',
            featured_image: '',
            category: '',
        });
        setShowEditor(true);
    };

    const handleEdit = async (article: Article) => {
        // We need to fetch full content for editing
        setEditingArticle(article);
        setFormData({
            title: article.title,
            slug: article.slug,
            content: '', // Will be loaded from API when full edit is implemented
            excerpt: article.excerpt || '',
            author_name: article.author_name || 'Omega',
            featured_image: article.featured_image || '',
            category: article.category || '',
        });
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.slug) {
            alert('Titill og slóð eru nauðsynleg.');
            return;
        }

        setIsSaving(true);
        try {
            const method = editingArticle ? 'PATCH' : 'POST';
            const body = editingArticle
                ? { id: editingArticle.id, ...formData }
                : formData;

            const res = await fetch('/api/admin/articles', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowEditor(false);
                loadData();
            } else {
                const err = await res.json();
                alert(err.error || 'Villa við vistun');
            }
        } catch (e) {
            alert('Villa við vistun');
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Ertu viss um að þú viljir eyða þessari grein?')) return;
        try {
            const res = await fetch('/api/admin/articles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setArticles(prev => prev.filter(a => a.id !== id));
            }
        } catch (e) {
            alert('Villa við eyðingu');
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[áàâã]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòôõö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/[ðþ]/g, 'd')
            .replace(/æ/g, 'ae')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.author_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="admin-h1">Greinar</h1>
                    <p className="admin-body mt-1">{articles.length} greinar í gagnagrunni</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        className="admin-btn admin-btn-secondary admin-btn-icon"
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} className={isLoading ? 'admin-spinner' : ''} />
                    </button>
                    <button
                        onClick={handleCreateNew}
                        className="admin-btn admin-btn-primary"
                    >
                        <Plus size={18} />
                        <span>Ný grein</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="admin-card mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Leita eftir titli eða höfundi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-input pl-10"
                    />
                </div>
            </div>

            {/* Article List */}
            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="admin-card">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-14 rounded-lg admin-skeleton" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-1/3 admin-skeleton" />
                                    <div className="h-4 w-2/3 admin-skeleton" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="admin-card admin-empty">
                    <FileText className="admin-empty-icon" />
                    <p className="admin-body">Engar greinar fundust</p>
                    <button onClick={handleCreateNew} className="mt-4 text-[var(--admin-accent)] hover:underline text-sm">
                        Búa til fyrstu grein
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredArticles.map((article) => (
                        <div key={article.id} className="admin-card admin-card-hover group">
                            <div className="flex items-start gap-4">
                                {/* Thumbnail */}
                                <div className="w-20 h-14 rounded-lg bg-[var(--admin-surface-hover)] overflow-hidden flex-shrink-0">
                                    {article.featured_image ? (
                                        <img
                                            src={article.featured_image}
                                            alt={article.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                                            <FileText size={20} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="admin-h3 truncate">{article.title}</h3>
                                        <span className={`admin-badge ${article.published_at ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                                            {article.published_at ? 'Útgefin' : 'Drög'}
                                        </span>
                                    </div>
                                    {article.excerpt && (
                                        <p className="admin-body text-sm line-clamp-1 mb-2">{article.excerpt}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-[var(--admin-text-muted)]">
                                        {article.author_name && (
                                            <span className="flex items-center gap-1">
                                                <User size={12} />
                                                {article.author_name}
                                            </span>
                                        )}
                                        {article.published_at && (
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(article.published_at).toLocaleDateString('is-IS')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/greinar/${article.slug}`}
                                        target="_blank"
                                        className="admin-btn admin-btn-icon admin-btn-ghost"
                                        title="Skoða"
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleEdit(article)}
                                        className="admin-btn admin-btn-icon admin-btn-ghost"
                                        title="Breyta"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="admin-btn admin-btn-icon bg-[var(--admin-error-subtle)] text-[var(--admin-error)] hover:bg-[var(--admin-error)] hover:text-white"
                                        title="Eyða"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[var(--admin-text)]">
                                {editingArticle ? 'Breyta grein' : 'Ný grein'}
                            </h2>
                            <button
                                onClick={() => setShowEditor(false)}
                                className="p-1 hover:bg-[var(--admin-surface-hover)] rounded-full transition-colors text-[var(--admin-text-muted)]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="admin-label mb-2 block">Titill</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={formData.title}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            title,
                                            // Auto-generate slug only for new articles
                                            ...(editingArticle ? {} : { slug: generateSlug(title) }),
                                        }));
                                    }}
                                    placeholder="Titill greinar..."
                                />
                            </div>

                            <div>
                                <label className="admin-label mb-2 block">Slóð (slug)</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    placeholder="titill-greinar"
                                />
                            </div>

                            <div>
                                <label className="admin-label mb-2 block">Ágrip</label>
                                <textarea
                                    className="admin-input min-h-[80px]"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                    placeholder="Stuttur texti sem sýnist á yfirlitssíðu..."
                                />
                            </div>

                            <div>
                                <label className="admin-label mb-2 block">Innihald (HTML/Markdown)</label>
                                <textarea
                                    className="admin-input min-h-[200px] font-mono text-sm"
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Skrifaðu efni greinarinnar hér..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label mb-2 block">Höfundur</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.author_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                        placeholder="Nafn höfundar"
                                    />
                                </div>
                                <div>
                                    <label className="admin-label mb-2 block">Forsíðumynd (URL)</label>
                                    <input
                                        type="url"
                                        className="admin-input"
                                        value={formData.featured_image}
                                        onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label mb-2 block">Flokkur</label>
                                <select
                                    className="admin-input"
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    <option value="">Almenn grein (Greinar)</option>
                                    <option value="israel">Ísrael — sýnist í /israel og /israel/greinar</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setShowEditor(false)}
                                    className="admin-btn admin-btn-secondary flex-1 justify-center"
                                >
                                    Hætta við
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="admin-btn admin-btn-primary flex-1 justify-center py-3"
                                >
                                    {isSaving ? <div className="admin-spinner" /> : editingArticle ? 'Vista breytingar' : 'Búa til grein'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
