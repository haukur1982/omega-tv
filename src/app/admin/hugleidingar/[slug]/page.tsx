'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, ArrowRight, ExternalLink, Save, Check, Sparkles, AlertTriangle,
    Volume2, Square, Undo2, BookMarked,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';
import {
    flagParagraph, diffWords, isDifferent,
    type Flag, type GlossaryTerm,
} from '@/lib/devotional-review';

/**
 * /admin/hugleidingar/[slug] — the bilingual review desk.
 *
 * Built to be lived in for hours:
 *  - English source beside every Icelandic paragraph (1:1 aligned snapshot)
 *  - flags point at what deserves a second look, including locked terminology
 *  - the assistant offers three registers, takes free-form instructions, and
 *    learns from every correction the reviewer makes
 *  - read-aloud, because the ear catches what the eye lets through
 *  - work is never lost: local draft restore, revert-to-original per
 *    paragraph, warn-on-leave, ⌘S to save
 *  - straight into the next piece without returning to the index
 */

const SLOT_IS: Record<string, string> = { morning: 'Morgunn', evening: 'Kvöld' };
const draftKey = (slug: string) => `omega:devo-draft:${slug}`;

interface Item {
    id: string; day: number; slot: 'morning' | 'evening'; slug: string;
    title_is: string; title_en: string | null;
    body_is: string[]; body_en: string[];
    scripture_refs: string[]; source_url: string | null;
    reviewed: boolean; review_note: string | null; status: 'draft' | 'published';
}
interface Nav { prev: string | null; next: string | null; position: number; total: number }
interface SuggestOption { label: string; text: string }
interface Suggestion { options: SuggestOption[]; note: string; learnedFrom: number }

const NARROW_CSS =
    '@media (max-width: 1100px){ .devo-row{ grid-template-columns: minmax(0,1fr) !important; } ' +
    '.devo-en{ border-right: none !important; border-bottom: 1px solid var(--admin-border); padding-bottom: 0.6rem; } }';

export default function ReviewDevotionalPage() {
    const params = useParams();
    const router = useRouter();
    const slug = String(params?.slug ?? '');

    const [item, setItem] = useState<Item | null>(null);
    const [nav, setNav] = useState<Nav>({ prev: null, next: null, position: 0, total: 0 });
    const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
    const [title, setTitle] = useState('');
    const [paras, setParas] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [onlyFlagged, setOnlyFlagged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [busyIdx, setBusyIdx] = useState<number | null>(null);
    const [sugg, setSugg] = useState<Record<number, Suggestion>>({});
    const [instr, setInstr] = useState<Record<number, string>>({});
    const [openInstr, setOpenInstr] = useState<Record<number, boolean>>({});
    const [usedSuggestion, setUsedSuggestion] = useState(false);
    const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [restored, setRestored] = useState(false);
    const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

    /* ── Icelandic system voice, if this machine has one ── */
    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        const pick = () => {
            const vs = window.speechSynthesis.getVoices();
            setVoice(vs.find((v) => v.lang?.toLowerCase().startsWith('is')) ?? null);
        };
        pick();
        window.speechSynthesis.addEventListener('voiceschanged', pick);
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', pick);
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = (key: number, text: string) => {
        if (!window.speechSynthesis) return;
        if (speakingIdx === key) { window.speechSynthesis.cancel(); setSpeakingIdx(null); return; }
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.lang = 'is-IS';
        u.rate = 0.95;
        u.onend = () => setSpeakingIdx(null);
        u.onerror = () => setSpeakingIdx(null);
        setSpeakingIdx(key);
        window.speechSynthesis.speak(u);
    };

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await authedFetch(`/api/admin/devotionals?slug=${encodeURIComponent(slug)}`);
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const d = await res.json();
            const it: Item = d.item;
            setItem(it);
            setNav(d.nav ?? { prev: null, next: null, position: 0, total: 0 });
            setGlossary(d.glossary ?? []);
            setTitle(it.title_is);
            setNote(it.review_note ?? '');
            setSugg({});
            setUsedSuggestion(false);

            // Unsaved local draft wins — losing an hour of edits to a stray
            // refresh is the worst thing this tool could do to someone.
            let restoredDraft = false;
            try {
                const raw = localStorage.getItem(draftKey(slug));
                if (raw) {
                    const dr = JSON.parse(raw);
                    if (Array.isArray(dr.paras) && dr.paras.length === it.body_is.length) {
                        const differs = dr.paras.some((p: string, i: number) => p !== it.body_is[i])
                            || (dr.title && dr.title !== it.title_is);
                        if (differs) {
                            setParas(dr.paras);
                            if (dr.title) setTitle(dr.title);
                            restoredDraft = true;
                        }
                    }
                }
            } catch { /* corrupt draft — fall through to server copy */ }

            if (!restoredDraft) setParas(it.body_is);
            setRestored(restoredDraft);
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Tókst ekki að sækja');
        }
        setIsLoading(false);
    }, [slug]);

    useEffect(() => { if (slug) load(); }, [slug, load]);

    const flags: Flag[][] = useMemo(
        () => paras.map((p, i) => flagParagraph(p, item?.body_en?.[i], glossary)),
        [paras, item, glossary],
    );
    const flaggedIdx = useMemo(
        () => flags.map((f, i) => (f.length ? i : -1)).filter((i) => i >= 0),
        [flags],
    );
    const dirty = !!item && (title !== item.title_is || paras.some((p, i) => p !== item.body_is[i]));

    /* ── keep a local draft while dirty ── */
    useEffect(() => {
        if (!item || !dirty) return;
        const t = setTimeout(() => {
            try { localStorage.setItem(draftKey(slug), JSON.stringify({ title, paras, at: Date.now() })); }
            catch { /* storage full or unavailable — the server copy still stands */ }
        }, 600);
        return () => clearTimeout(t);
    }, [title, paras, dirty, item, slug]);

    /* ── warn before losing unsaved work ── */
    useEffect(() => {
        if (!dirty) return;
        const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', h);
        return () => window.removeEventListener('beforeunload', h);
    }, [dirty]);

    const setPara = (i: number, v: string) =>
        setParas((prev) => prev.map((p, j) => (j === i ? v : p)));

    const revertPara = (i: number) => {
        if (!item) return;
        setPara(i, item.body_is[i]);
        setSugg((x) => { const n = { ...x }; delete n[i]; return n; });
    };

    const dropSuggestion = (i: number) =>
        setSugg((x) => { const n = { ...x }; delete n[i]; return n; });

    const save = useCallback(async (extra: Record<string, unknown> = {}, msg = 'Vistað.', goTo?: string | null) => {
        if (!item) return;
        setSaving(true);
        setNotice(null);
        try {
            const res = await authedFetch('/api/admin/devotionals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id, slug: item.slug, title_is: title,
                    body_is: paras.map((p) => p.trim()).filter(Boolean),
                    review_note: note,
                    origin: usedSuggestion ? 'edited' : 'manual',
                    ...extra,
                }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || `Villa ${res.status}`);
            }
            try { localStorage.removeItem(draftKey(item.slug)); } catch { /* ignore */ }
            setRestored(false);
            if (goTo) { router.push(`/admin/hugleidingar/${goTo}`); return; }
            setNotice(msg);
            await load();
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Villa kom upp.');
        }
        setSaving(false);
    }, [item, title, paras, note, usedSuggestion, load, router]);

    /* ── keyboard: ⌘S saves, ⌥↓/↑ jump between flagged paragraphs ── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (!saving) save();
                return;
            }
            if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                if (flaggedIdx.length === 0) return;
                e.preventDefault();
                const tops = flaggedIdx.map((i) => ({ i, top: rowRefs.current[i]?.getBoundingClientRect().top ?? 0 }));
                const target = e.key === 'ArrowDown'
                    ? tops.find((t) => t.top > 80) ?? tops[0]
                    : [...tops].reverse().find((t) => t.top < -20) ?? tops[tops.length - 1];
                rowRefs.current[target.i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [save, saving, flaggedIdx]);

    const askSuggestion = async (i: number) => {
        if (!item) return;
        setBusyIdx(i);
        try {
            const res = await authedFetch('/api/admin/devotionals/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ en: item.body_en?.[i] ?? '', is: paras[i], instruction: instr[i] ?? '' }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || `Villa ${res.status}`);
            setSugg((s) => ({ ...s, [i]: { options: d.options ?? [], note: d.note ?? '', learnedFrom: d.learnedFrom ?? 0 } }));
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Tillaga mistókst');
        }
        setBusyIdx(null);
    };

    const visible = paras.map((_, i) => i).filter((i) => !onlyFlagged || flags[i].length > 0);

    return (
        <AdminLayout>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <button onClick={() => router.push('/admin/hugleidingar')} className="admin-btn admin-btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <ArrowLeft size={15} /> Yfirlit
                </button>
                {nav.total > 0 && (
                    <span className="admin-body" style={{ fontSize: '0.82rem', opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>
                        {nav.position} af {nav.total}
                    </span>
                )}
                <div style={{ flex: 1 }} />
                <button onClick={() => nav.prev && router.push(`/admin/hugleidingar/${nav.prev}`)}
                    disabled={!nav.prev} className="admin-btn admin-btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                    <ArrowLeft size={14} /> Fyrri
                </button>
                <button onClick={() => nav.next && router.push(`/admin/hugleidingar/${nav.next}`)}
                    disabled={!nav.next} className="admin-btn admin-btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                    Næsta <ArrowRight size={14} />
                </button>
            </div>

            {restored && (
                <div className="admin-card" style={{ marginBottom: '1rem', borderColor: 'rgba(233,168,96,0.45)' }}>
                    <p className="admin-body" style={{ margin: 0, fontSize: '0.88rem' }}>
                        Óvistuð vinna frá fyrri lotu var endurheimt. Vistaðu til að staðfesta, eða
                        <button onClick={() => { if (item) { setParas(item.body_is); setTitle(item.title_is); setRestored(false); try { localStorage.removeItem(draftKey(slug)); } catch { /* ignore */ } } }}
                            className="admin-btn admin-btn-secondary" style={{ marginLeft: '0.5rem', fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}>
                            hentu henni
                        </button>
                    </p>
                </div>
            )}

            {item && (
                <>
                    <div className="flex items-center justify-between mb-5" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <div className="admin-label">Dagur {item.day} · {SLOT_IS[item.slot]}</div>
                            <h1 className="admin-h1" style={{ marginTop: '0.25rem' }}>{item.title_is}</h1>
                            {item.title_en && (
                                <p className="admin-body" style={{ opacity: 0.6, fontStyle: 'italic', marginTop: '0.15rem' }}>{item.title_en}</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.reviewed && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-accent)' }}>
                                    <Check size={14} /> Yfirlesin
                                </span>
                            )}
                            {item.source_url && (
                                <a href={item.source_url} target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                                    <ExternalLink size={14} /> Frumtexti
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="admin-card" style={{ position: 'sticky', top: '1rem', zIndex: 20, display: 'flex', gap: '0.7rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: flaggedIdx.length ? 'var(--admin-accent)' : 'var(--admin-text-secondary)' }}>
                            <AlertTriangle size={15} />
                            {flaggedIdx.length === 0 ? 'Engar ábendingar' : `${flaggedIdx.length} með ábendingu`}
                        </span>
                        <label className="admin-body" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} />
                            Aðeins ábendingar
                        </label>
                        <span className="admin-body" style={{ fontSize: '0.75rem', opacity: 0.55 }}>⌘S vistar · ⌥↓ næsta ábending</span>
                        <div style={{ flex: 1 }} />
                        {dirty && <span className="admin-body" style={{ fontSize: '0.8rem', color: 'var(--admin-accent)' }}>óvistað</span>}
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
                        {nav.next && (
                            <button onClick={() => save({ reviewed: true }, '', nav.next)} disabled={saving} className="admin-btn admin-btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                Vista og næsta <ArrowRight size={14} />
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
                            const changed = item.body_is[i] !== undefined && paras[i] !== item.body_is[i];
                            return (
                                <div key={i} ref={(el) => { rowRefs.current[i] = el; }} className="admin-card"
                                    style={{ borderColor: f.length ? 'rgba(233,168,96,0.45)' : undefined }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                                        <span className="admin-label" style={{ minWidth: '2.5rem' }}>{i + 1}</span>
                                        {f.map((fl, k) => (
                                            <span key={k} title={fl.hint}
                                                style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.15rem 0.45rem', borderRadius: '5px', background: fl.kind === 'term' ? 'rgba(111,165,216,0.18)' : 'rgba(233,168,96,0.16)', color: fl.kind === 'term' ? 'var(--admin-info, #6FA5D8)' : 'var(--admin-accent)' }}>
                                                {fl.label}
                                            </span>
                                        ))}
                                        <div style={{ flex: 1 }} />
                                        {changed && (
                                            <button onClick={() => revertPara(i)} title="Aftur í upprunalegan texta"
                                                className="admin-btn admin-btn-secondary"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                                                <Undo2 size={12} /> Afturkalla
                                            </button>
                                        )}
                                        <button onClick={() => speak(i, paras[i])}
                                            title={voice ? 'Lesa upphátt' : 'Engin íslensk rödd fannst í þessu tæki'}
                                            className="admin-btn admin-btn-secondary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', padding: '0.3rem 0.55rem' }}>
                                            {speakingIdx === i ? <Square size={12} /> : <Volume2 size={13} />}
                                        </button>
                                        <button onClick={() => setOpenInstr((o) => ({ ...o, [i]: !o[i] }))}
                                            className="admin-btn admin-btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.55rem' }}>
                                            Ósk
                                        </button>
                                        <button onClick={() => askSuggestion(i)} disabled={busyIdx === i}
                                            className="admin-btn admin-btn-secondary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
                                            <Sparkles size={13} /> {busyIdx === i ? 'Hugsa…' : 'Tillögur'}
                                        </button>
                                    </div>

                                    {openInstr[i] && (
                                        <input value={instr[i] ?? ''} onChange={(e) => setInstr((x) => ({ ...x, [i]: e.target.value }))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') askSuggestion(i); }}
                                            placeholder="Segðu hvað þú vilt — t.d. „of stíft, mýkri“ eða „eins og úr prédikunarstól“"
                                            style={{ ...inputStyle, marginBottom: '0.6rem' }} />
                                    )}

                                    <div className="devo-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>
                                        <div className="devo-en"
                                            style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--admin-text-secondary)', opacity: 0.85, paddingRight: '0.5rem', borderRight: '1px solid var(--admin-border)' }}>
                                            {item.body_en?.[i] ?? <em style={{ opacity: 0.5 }}>(enginn frumtexti)</em>}
                                        </div>
                                        <textarea value={paras[i]} onChange={(e) => setPara(i, e.target.value)}
                                            rows={Math.max(3, Math.ceil((paras[i]?.length ?? 0) / 60))}
                                            spellCheck lang="is"
                                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1rem', lineHeight: 1.7 }} />
                                    </div>

                                    {s && (
                                        <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                                            {s.note && (
                                                <p className="admin-body" style={{ margin: 0, fontSize: '0.82rem', opacity: 0.8 }}>
                                                    {s.note}
                                                    {s.learnedFrom > 0 && <span style={{ opacity: 0.6 }}> · lærir af fyrri lagfæringum þínum</span>}
                                                </p>
                                            )}
                                            {s.options.map((o, k) => {
                                                const key = 1000 + i * 10 + k;
                                                const diff = isDifferent(paras[i], o.text) ? diffWords(paras[i], o.text) : null;
                                                return (
                                                    <div key={k} style={{ padding: '0.7rem 0.85rem', borderRadius: '9px', background: 'var(--admin-bg)', border: '1px solid rgba(233,168,96,0.3)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                            <span className="admin-label" style={{ margin: 0 }}>{o.label}</span>
                                                            <div style={{ flex: 1 }} />
                                                            <button onClick={() => speak(key, o.text)} className="admin-btn admin-btn-secondary"
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}>
                                                                {speakingIdx === key ? <Square size={11} /> : <Volume2 size={12} />}
                                                            </button>
                                                            <button onClick={() => { setPara(i, o.text); setUsedSuggestion(true); dropSuggestion(i); }}
                                                                className="admin-btn admin-btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                                                                Nota
                                                            </button>
                                                        </div>
                                                        <p style={{ margin: 0, fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '0.97rem', lineHeight: 1.7 }}>
                                                            {diff
                                                                ? diff.map((d, di) => (
                                                                    <span key={di} style={
                                                                        d.added ? { background: 'rgba(122,190,140,0.22)', borderRadius: '3px' }
                                                                            : d.removed ? { background: 'rgba(216,75,58,0.16)', textDecoration: 'line-through', opacity: 0.7, borderRadius: '3px' }
                                                                                : undefined
                                                                    }>{d.text}</span>
                                                                ))
                                                                : o.text}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                            <button onClick={() => dropSuggestion(i)} className="admin-btn admin-btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', justifySelf: 'start' }}>
                                                Loka tillögum
                                            </button>
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
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <a href="/admin/hugleidingar/hugtok" className="admin-btn admin-btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                                <BookMarked size={14} /> Hugtakaskrá ({glossary.length})
                            </a>
                            {item.scripture_refs.length > 0 && (
                                <span className="admin-body" style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                                    Ritningarstaðir: {item.scripture_refs.slice(0, 6).join(' · ')}
                                    {item.scripture_refs.length > 6 ? ' …' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <style>{NARROW_CSS}</style>
                </>
            )}

            {isLoading && !item && <div className="admin-card"><p className="admin-body" style={{ margin: 0 }}>Sæki…</p></div>}
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
