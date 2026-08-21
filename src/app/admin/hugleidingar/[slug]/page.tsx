'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Save, Check, Sparkles, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';
import { flagParagraph, type Flag } from '@/lib/devotional-review';

/**
 * /admin/hugleidingar/[slug] — bilingual review desk for one devotional.
 *
 * The English source sits beside every Icelandic paragraph (the snapshot is
 * paragraph-aligned 1:1), flagged paragraphs are marked so 40+ paragraphs
 * don't need equal attention, and each paragraph can ask for a second
 * opinion against its source. The reviewer accepts or ignores — the
 * judgement stays human, which is the whole point of the read.
 */

const SLOT_IS: Record<string, string> = { morning: 'Morgunn', evening: 'Kvöld' };

interface Item {
    id: string; day: number; slot: 'morning' | 'evening'; slug: string;
    title_is: string; title_en: string | null;
    body_is: string[]; body_en: string[];
    scripture_refs: string[]; source_url: string | null;
    reviewed: boolean; review_note: string | null; status: 'draft' | 'published';
}

interface Suggestion { text: string; note: string; changed: boolean }

const NARROW_CSS =
    '@media (max-width: 1100px){ .devo-row{ grid-template-columns: minmax(0,1fr) !important; } ' +
    '.devo-en{ border-right: none !important; border-bottom: 1px solid var(--admin-border); padding-bottom: 0.6rem; } }';

export default function ReviewDevotionalPage() {
    const params = useParams();
    const router = useRouter();
    const slug = String(params?.slug ?? '');

    const [item, setItem] = useState<Item | null>(null);
    const [title, setTitle] = useState('');
    const [paras, setParas] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [onlyFlagged, setOnlyFlagged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [busyIdx, setBusyIdx] = useState<number | null>(null);
    const [sugg, setSugg] = useState<Record<number, Suggestion>>({});

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await authedFetch(`/api/admin/devotionals?slug=${encodeURIComponent(slug)}`);
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const d = await res.json();
            const it: Item = d.item;
            setItem(it);
            setTitle(it.title_is);
            setParas(it.body_is);
            setNote(it.review_note ?? '');
            setSugg({});
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Tókst ekki að sækja');
        }
        setIsLoading(false);
    }, [slug]);

    useEffect(() => { if (slug) load(); }, [slug, load]);

    const flags: Flag[][] = useMemo(
        () => paras.map((p, i) => flagParagraph(p, item?.body_en?.[i])),
        [paras, item],
    );
    const flaggedCount = flags.filter((f) => f.length > 0).length;
    const dirty = !!item && (title !== item.title_is || paras.join(' ') !== item.body_is.join(' '));

    const setPara = (i: number, v: string) =>
        setParas((prev) => prev.map((p, j) => (j === i ? v : p)));

    const dropSuggestion = (i: number) =>
        setSugg((x) => { const n = { ...x }; delete n[i]; return n; });

    const save = async (extra: Record<string, unknown> = {}, msg = 'Vistað.') => {
        if (!item) return;
        setSaving(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/devotionals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    slug: item.slug,
                    title_is: title,
                    body_is: paras.map((p) => p.trim()).filter(Boolean),
                    review_note: note,
                    ...extra,
                }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || `Villa ${res.status}`);
            }
            setNotice(msg);
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSaving(false);
    };

    const askSuggestion = async (i: number) => {
        if (!item) return;
        setBusyIdx(i);
        try {
            const res = await authedFetch('/api/admin/devotionals/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ en: item.body_en?.[i] ?? '', is: paras[i] }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || `Villa ${res.status}`);
            setSugg((s) => ({ ...s, [i]: { text: d.suggestion, note: d.note, changed: d.changed } }));
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Tillaga mistókst');
        }
        setBusyIdx(null);
    };

    const visible = paras.map((_, i) => i).filter((i) => !onlyFlagged || flags[i].length > 0);

    return (
        <AdminLayout>
            <button
                onClick={() => router.push('/admin/hugleidingar')}
                className="admin-btn admin-btn-secondary"
                style={{ marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
                <ArrowLeft size={15} /> Til baka
            </button>

            {item && (
                <>
                    <div className="flex items-center justify-between mb-5" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <div className="admin-label">Dagur {item.day} · {SLOT_IS[item.slot]}</div>
                            <h1 className="admin-h1" style={{ marginTop: '0.25rem' }}>{item.title_is}</h1>
                            {item.title_en && (
                                <p className="admin-body" style={{ opacity: 0.6, fontStyle: 'italic', marginTop: '0.15rem' }}>
                                    {item.title_en}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.reviewed && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-accent)' }}>
                                    <Check size={14} /> Yfirlesin
                                </span>
                            )}
                            {item.source_url && (
                                <a
                                    href={item.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="admin-btn admin-btn-secondary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                                >
                                    <ExternalLink size={14} /> Frumtexti
                                </a>
                            )}
                        </div>
                    </div>

                    <div
                        className="admin-card"
                        style={{ position: 'sticky', top: '1rem', zIndex: 20, display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: flaggedCount ? 'var(--admin-accent)' : 'var(--admin-text-secondary)' }}>
                            <AlertTriangle size={15} />
                            {flaggedCount === 0 ? 'Engar ábendingar' : `${flaggedCount} málsgreinar með ábendingu`}
                        </span>
                        <label className="admin-body" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} />
                            Sýna aðeins ábendingar
                        </label>
                        <div style={{ flex: 1 }} />
                        {dirty && <span className="admin-body" style={{ fontSize: '0.8rem', opacity: 0.75 }}>óvistað</span>}
                        <button onClick={() => save()} disabled={saving} className="admin-btn admin-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Save size={15} /> {saving ? 'Vista…' : 'Vista'}
                        </button>
                        {!item.reviewed ? (
                            <button onClick={() => save({ reviewed: true }, 'Merkt yfirlesin.')} disabled={saving} className="admin-btn admin-btn-primary">
                                Merkja yfirlesna
                            </button>
                        ) : item.status === 'draft' ? (
                            <button onClick={() => save({ status: 'published' }, 'Birt.')} disabled={saving} className="admin-btn admin-btn-primary">
                                Birta
                            </button>
                        ) : (
                            <button onClick={() => save({ status: 'draft' }, 'Tekin úr birtingu.')} disabled={saving} className="admin-btn admin-btn-secondary">
                                Taka úr birtingu
                            </button>
                        )}
                        {notice && <span className="admin-body" style={{ fontSize: '0.82rem' }}>{notice}</span>}
                    </div>

                    <div className="admin-card mb-4">
                        <label style={{ display: 'grid', gap: '0.35rem' }}>
                            <span className="admin-label">Titill</span>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                        </label>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {visible.map((i) => {
                            const f = flags[i];
                            const s = sugg[i];
                            return (
                                <div key={i} className="admin-card" style={{ borderColor: f.length ? 'rgba(233,168,96,0.45)' : undefined }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                                        <span className="admin-label" style={{ minWidth: '2.5rem' }}>{i + 1}</span>
                                        {f.map((fl, k) => (
                                            <span
                                                key={k}
                                                title={fl.hint}
                                                style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.15rem 0.45rem', borderRadius: '5px', background: 'rgba(233,168,96,0.16)', color: 'var(--admin-accent)' }}
                                            >
                                                {fl.label}
                                            </span>
                                        ))}
                                        <div style={{ flex: 1 }} />
                                        <button
                                            onClick={() => askSuggestion(i)}
                                            disabled={busyIdx === i}
                                            className="admin-btn admin-btn-secondary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                                        >
                                            <Sparkles size={13} /> {busyIdx === i ? 'Hugsa…' : 'Tillaga'}
                                        </button>
                                    </div>

                                    <div className="devo-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
                                        <div
                                            className="devo-en"
                                            style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--admin-text-secondary)', opacity: 0.85, paddingRight: '0.5rem', borderRight: '1px solid var(--admin-border)' }}
                                        >
                                            {item.body_en?.[i] ?? <em style={{ opacity: 0.5 }}>(enginn frumtexti)</em>}
                                        </div>
                                        <textarea
                                            value={paras[i]}
                                            onChange={(e) => setPara(i, e.target.value)}
                                            rows={Math.max(3, Math.ceil((paras[i]?.length ?? 0) / 60))}
                                            spellCheck
                                            lang="is"
                                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1rem', lineHeight: 1.7 }}
                                        />
                                    </div>

                                    {s && (
                                        <div style={{ marginTop: '0.75rem', padding: '0.75rem 0.9rem', borderRadius: '9px', background: 'var(--admin-bg)', border: '1px solid rgba(233,168,96,0.35)' }}>
                                            <div className="admin-label" style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Sparkles size={12} /> Tillaga {s.changed ? '' : '(engin breyting lögð til)'}
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '0.98rem', lineHeight: 1.7 }}>{s.text}</p>
                                            {s.note && (
                                                <p className="admin-body" style={{ margin: '0 0 0.6rem', fontSize: '0.82rem', opacity: 0.8 }}>{s.note}</p>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => { setPara(i, s.text); dropSuggestion(i); }}
                                                    className="admin-btn admin-btn-primary"
                                                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                                                >
                                                    Nota
                                                </button>
                                                <button
                                                    onClick={() => dropSuggestion(i)}
                                                    className="admin-btn admin-btn-secondary"
                                                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                                                >
                                                    Hafna
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="admin-card" style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                        <label style={{ display: 'grid', gap: '0.35rem' }}>
                            <span className="admin-label">Athugasemd yfirlesara (birtist ekki)</span>
                            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="t.d. lagaði ritningarstaði" style={inputStyle} />
                        </label>
                        {item.scripture_refs.length > 0 && (
                            <div>
                                <span className="admin-label">Ritningarstaðir í frumtexta</span>
                                <p className="admin-body" style={{ fontSize: '0.85rem', lineHeight: 1.7, margin: '0.3rem 0 0', opacity: 0.8 }}>
                                    {item.scripture_refs.join(' · ')}
                                </p>
                            </div>
                        )}
                    </div>

                    <style>{NARROW_CSS}</style>
                </>
            )}

            {isLoading && !item && (
                <div className="admin-card"><p className="admin-body" style={{ margin: 0 }}>Sæki…</p></div>
            )}
        </AdminLayout>
    );
}

const inputStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--admin-border, rgba(255,255,255,0.12))',
    background: 'var(--admin-bg, #14120F)',
    color: 'var(--admin-text, #fff)',
    fontSize: '0.95rem',
    width: '100%',
};
