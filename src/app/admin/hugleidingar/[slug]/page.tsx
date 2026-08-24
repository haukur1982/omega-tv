'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, ArrowRight, ExternalLink, Check, Sparkles, Volume2, Square,
    Undo2, BookMarked, Languages, Maximize2, Minimize2,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';
import {
    flagParagraph, diffWords, isDifferent,
    type Flag, type GlossaryTerm,
} from '@/lib/devotional-review';

/**
 * /admin/hugleidingar/[slug] — the reading room.
 *
 * This is a devotional, not a data-entry form, so it is set the way the
 * reader will meet it: vellum, serif, one column at a proper measure. The
 * paragraphs ARE the interface — you click into prose and it stays prose.
 * Every tool (source text, suggestions, read-aloud, flags) is one tap away
 * and silent until called, so the page never argues with the reading.
 *
 * All the safety from the previous build stays: local draft restore,
 * warn-on-leave, per-paragraph revert, ⌘S, ⌥↓ between marks.
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

/* Prose that happens to be editable — never looks like a form field. */
function ProseLine({
    value, onChange, onFocus, dim,
}: { value: string; onChange: (v: string) => void; onFocus?: () => void; dim?: boolean }) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [value]);
    return (
        <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            spellCheck
            lang="is"
            rows={1}
            className="devo-prose-input"
            style={dim ? { opacity: 0.55 } : undefined}
        />
    );
}

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
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [busyIdx, setBusyIdx] = useState<number | null>(null);
    const [sugg, setSugg] = useState<Record<number, Suggestion>>({});
    const [instr, setInstr] = useState<Record<number, string>>({});
    const [openInstr, setOpenInstr] = useState<Record<number, boolean>>({});
    const [showEn, setShowEn] = useState<Record<number, boolean>>({});
    const [allEn, setAllEn] = useState(false);
    const [active, setActive] = useState<number | null>(null);
    const [usedSuggestion, setUsedSuggestion] = useState(false);
    const [speaking, setSpeaking] = useState<number | null>(null);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [restored, setRestored] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
        if (speaking === key) { window.speechSynthesis.cancel(); setSpeaking(null); return; }
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.lang = 'is-IS';
        u.rate = 0.95;
        u.onend = () => setSpeaking(null);
        u.onerror = () => setSpeaking(null);
        setSpeaking(key);
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
            setSugg({}); setShowEn({}); setActive(null); setUsedSuggestion(false);

            let restoredDraft = false;
            try {
                const raw = localStorage.getItem(draftKey(slug));
                if (raw) {
                    const dr = JSON.parse(raw);
                    if (Array.isArray(dr.paras) && dr.paras.length === it.body_is.length) {
                        const differs = dr.paras.some((p: string, i: number) => p !== it.body_is[i])
                            || (dr.title && dr.title !== it.title_is);
                        if (differs) { setParas(dr.paras); if (dr.title) setTitle(dr.title); restoredDraft = true; }
                    }
                }
            } catch { /* corrupt draft — fall through to the server copy */ }
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

    useEffect(() => {
        if (!item || !dirty) return;
        const t = setTimeout(() => {
            try { localStorage.setItem(draftKey(slug), JSON.stringify({ title, paras, at: Date.now() })); }
            catch { /* storage unavailable — server copy stands */ }
        }, 600);
        return () => clearTimeout(t);
    }, [title, paras, dirty, item, slug]);

    useEffect(() => {
        if (!dirty) return;
        const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', h);
        return () => window.removeEventListener('beforeunload', h);
    }, [dirty]);

    const setPara = (i: number, v: string) => setParas((prev) => prev.map((p, j) => (j === i ? v : p)));
    const dropSuggestion = (i: number) => setSugg((x) => { const n = { ...x }; delete n[i]; return n; });
    const revertPara = (i: number) => { if (item) { setPara(i, item.body_is[i]); dropSuggestion(i); } };

    const save = useCallback(async (extra: Record<string, unknown> = {}, msg = 'Vistað.', goTo?: string | null) => {
        if (!item) return;
        setSaving(true); setNotice(null);
        try {
            const res = await authedFetch('/api/admin/devotionals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id, slug: item.slug, title_is: title,
                    body_is: paras.map((p) => p.trim()).filter(Boolean),
                    review_note: note, origin: usedSuggestion ? 'edited' : 'manual', ...extra,
                }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Villa ${res.status}`); }
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

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault(); if (!saving) save(); return;
            }
            if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                if (flaggedIdx.length === 0) return;
                e.preventDefault();
                const tops = flaggedIdx.map((i) => ({ i, top: rowRefs.current[i]?.getBoundingClientRect().top ?? 0 }));
                const target = e.key === 'ArrowDown'
                    ? tops.find((t) => t.top > 120) ?? tops[0]
                    : [...tops].reverse().find((t) => t.top < -20) ?? tops[tops.length - 1];
                rowRefs.current[target.i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setActive(target.i);
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
                method: 'POST', headers: { 'Content-Type': 'application/json' },
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

    const body = (
        <div className={`devo-sheet${focusMode ? ' devo-focus' : ''}`}>
            <style>{SHEET_CSS}</style>

            {/* Quiet top bar — everything you need, nothing you don't */}
            <div className="devo-bar">
                <button onClick={() => router.push('/admin/hugleidingar')} className="devo-ghost">
                    <ArrowLeft size={15} /> Yfirlit
                </button>
                <span className="devo-count">{nav.position} af {nav.total}</span>
                <div style={{ flex: 1 }} />
                {dirty && <span className="devo-dirty">óvistað</span>}
                <button onClick={() => setAllEn((v) => !v)} className="devo-ghost" title="Sýna enska frumtextann alls staðar">
                    <Languages size={15} /> {allEn ? 'Fela frumtexta' : 'Frumtexti'}
                </button>
                <button onClick={() => setFocusMode((v) => !v)} className="devo-ghost" title="Fela hliðarstiku">
                    {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button onClick={() => save()} disabled={saving} className="devo-ghost">
                    {saving ? 'Vista…' : 'Vista'}
                </button>
                {item && !item.reviewed && (
                    <button onClick={() => save({ reviewed: true }, 'Merkt yfirlesin.')} disabled={saving} className="devo-solid">
                        Yfirlesin
                    </button>
                )}
                {item?.reviewed && item.status === 'draft' && (
                    <button onClick={() => save({ status: 'published' }, 'Birt.')} disabled={saving} className="devo-solid">
                        Birta
                    </button>
                )}
                {nav.next && (
                    <button onClick={() => save({ reviewed: true }, '', nav.next)} disabled={saving} className="devo-solid">
                        Næsta <ArrowRight size={14} />
                    </button>
                )}
            </div>

            {notice && <div className="devo-notice">{notice}</div>}
            {restored && (
                <div className="devo-notice">
                    Óvistuð vinna frá fyrri lotu var endurheimt.
                    <button className="devo-inline" onClick={() => {
                        if (item) { setParas(item.body_is); setTitle(item.title_is); setRestored(false); try { localStorage.removeItem(draftKey(slug)); } catch { /* ignore */ } }
                    }}>henda henni</button>
                </div>
            )}

            {item && (
                <article className="devo-page">
                    <div className="devo-kicker">
                        Dagur {item.day} · {SLOT_IS[item.slot]}
                        {item.reviewed && <span className="devo-done"><Check size={12} /> yfirlesin</span>}
                    </div>

                    <input className="devo-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    {item.title_en && <p className="devo-title-en">{item.title_en}</p>}

                    <div className="devo-body">
                        {paras.map((p, i) => {
                            const f = flags[i];
                            const s = sugg[i];
                            const changed = item.body_is[i] !== undefined && p !== item.body_is[i];
                            const isActive = active === i;
                            const enOpen = allEn || showEn[i];
                            return (
                                <div
                                    key={i}
                                    ref={(el) => { rowRefs.current[i] = el; }}
                                    className={`devo-para${isActive ? ' is-active' : ''}${f.length ? ' has-mark' : ''}`}
                                    onClick={() => setActive(i)}
                                >
                                    <span className="devo-mark" title={f.map((x) => x.hint).join('\n')}>
                                        {f.length > 0 && <span className={f.some((x) => x.kind === 'term') ? 'dot dot-term' : 'dot'} />}
                                    </span>

                                    <div className="devo-para-body">
                                        <ProseLine value={p} onChange={(v) => setPara(i, v)} onFocus={() => setActive(i)} />

                                        {enOpen && (
                                            <p className="devo-en">{item.body_en?.[i] ?? '—'}</p>
                                        )}

                                        {(isActive || f.length > 0) && (
                                            <div className="devo-tools">
                                                {f.map((fl, k) => (
                                                    <span key={k} className={`devo-flag${fl.kind === 'term' ? ' is-term' : ''}`} title={fl.hint}>
                                                        {fl.label}
                                                    </span>
                                                ))}
                                                <div style={{ flex: 1 }} />
                                                {changed && (
                                                    <button className="devo-tool" onClick={() => revertPara(i)} title="Aftur í upprunalegan texta">
                                                        <Undo2 size={13} />
                                                    </button>
                                                )}
                                                <button className="devo-tool" onClick={() => setShowEn((x) => ({ ...x, [i]: !x[i] }))} title="Sýna frumtexta">
                                                    <Languages size={13} />
                                                </button>
                                                <button className="devo-tool" onClick={() => speak(i, p)} title={voice ? 'Lesa upphátt' : 'Engin íslensk rödd í þessu tæki'}>
                                                    {speaking === i ? <Square size={12} /> : <Volume2 size={13} />}
                                                </button>
                                                <button className="devo-tool" onClick={() => setOpenInstr((o) => ({ ...o, [i]: !o[i] }))} title="Segðu hvað þú vilt">
                                                    Ósk
                                                </button>
                                                <button className="devo-tool is-go" onClick={() => askSuggestion(i)} disabled={busyIdx === i}>
                                                    <Sparkles size={13} /> {busyIdx === i ? 'Hugsa…' : 'Tillögur'}
                                                </button>
                                            </div>
                                        )}

                                        {openInstr[i] && (
                                            <input
                                                className="devo-instr"
                                                value={instr[i] ?? ''}
                                                onChange={(e) => setInstr((x) => ({ ...x, [i]: e.target.value }))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') askSuggestion(i); }}
                                                placeholder="t.d. „of stíft, mýkri“ eða „eins og úr prédikunarstól“"
                                            />
                                        )}

                                        {s && (
                                            <div className="devo-sugg">
                                                {s.note && (
                                                    <p className="devo-sugg-note">
                                                        {s.note}
                                                        {s.learnedFrom > 0 && <em> · lærir af lagfæringum þínum</em>}
                                                    </p>
                                                )}
                                                {s.options.map((o, k) => {
                                                    const key = 1000 + i * 10 + k;
                                                    const diff = isDifferent(p, o.text) ? diffWords(p, o.text) : null;
                                                    return (
                                                        <div key={k} className="devo-opt">
                                                            <div className="devo-opt-head">
                                                                <span className="devo-opt-label">{o.label}</span>
                                                                <div style={{ flex: 1 }} />
                                                                <button className="devo-tool" onClick={() => speak(key, o.text)}>
                                                                    {speaking === key ? <Square size={11} /> : <Volume2 size={12} />}
                                                                </button>
                                                                <button className="devo-tool is-go" onClick={() => { setPara(i, o.text); setUsedSuggestion(true); dropSuggestion(i); }}>
                                                                    Nota
                                                                </button>
                                                            </div>
                                                            <p className="devo-opt-text">
                                                                {diff
                                                                    ? diff.map((d, di) => (
                                                                        <span key={di} className={d.added ? 'ins' : d.removed ? 'del' : undefined}>{d.text}</span>
                                                                    ))
                                                                    : o.text}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                                <button className="devo-tool" onClick={() => dropSuggestion(i)}>Loka</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <footer className="devo-foot">
                        <input
                            className="devo-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Athugasemd yfirlesara (birtist ekki)"
                        />
                        <div className="devo-foot-links">
                            <a href="/admin/hugleidingar/hugtok"><BookMarked size={13} /> Hugtakaskrá ({glossary.length})</a>
                            {item.source_url && (
                                <a href={item.source_url} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Frumtexti á vefnum</a>
                            )}
                            <span className="devo-hint">⌘S vistar · ⌥↓ næsta merking</span>
                        </div>
                    </footer>
                </article>
            )}

            {isLoading && !item && <p className="devo-loading">Sæki…</p>}
        </div>
    );

    return focusMode ? body : <AdminLayout>{body}</AdminLayout>;
}

const SHEET_CSS = `
.devo-sheet{
  --ink:#1B1814; --ink-soft:#4A4339; --ink-faint:#7A7268;
  --paper:#F3EDE0; --paper-warm:#EDE6D6; --gold:#C88A3E; --kerti:#E9A860;
  background:var(--paper); color:var(--ink);
  margin:-2rem; padding:0 0 5rem; min-height:100vh;
  font-family:var(--font-serif),Georgia,serif;
}
.devo-sheet.devo-focus{ position:fixed; inset:0; margin:0; overflow-y:auto; z-index:60; }

.devo-bar{
  position:sticky; top:0; z-index:30; display:flex; align-items:center; gap:.5rem;
  padding:.7rem clamp(1rem,4vw,3rem); background:rgba(243,237,224,.92);
  backdrop-filter:blur(12px); border-bottom:1px solid rgba(27,24,20,.10);
  font-family:var(--font-sans),system-ui,sans-serif;
}
.devo-count{ font-size:.78rem; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-faint); font-variant-numeric:tabular-nums; }
.devo-dirty{ font-size:.75rem; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); }
.devo-ghost,.devo-solid{
  display:inline-flex; align-items:center; gap:.35rem; border-radius:6px; cursor:pointer;
  font-family:inherit; font-size:.82rem; font-weight:500; padding:.42rem .75rem; transition:all .15s ease;
}
.devo-ghost{ background:transparent; border:1px solid rgba(27,24,20,.16); color:var(--ink-soft); }
.devo-ghost:hover{ border-color:rgba(27,24,20,.32); color:var(--ink); }
.devo-solid{ background:var(--ink); border:1px solid var(--ink); color:var(--paper); }
.devo-solid:hover{ background:#000; }
.devo-ghost:disabled,.devo-solid:disabled{ opacity:.5; cursor:default; }

.devo-notice{
  max-width:42rem; margin:1rem auto 0; padding:.7rem 1rem; border-radius:8px;
  background:rgba(200,138,62,.12); border:1px solid rgba(200,138,62,.3);
  font-family:var(--font-sans),sans-serif; font-size:.85rem; color:var(--ink-soft);
}
.devo-inline{ margin-left:.5rem; background:none; border:none; text-decoration:underline; cursor:pointer; color:var(--ink); font:inherit; }

.devo-page{ max-width:44rem; margin:0 auto; padding:clamp(2.5rem,6vw,4.5rem) clamp(1.25rem,4vw,0) 0; }
.devo-kicker{
  font-family:var(--font-sans),sans-serif; font-size:.72rem; font-weight:600; letter-spacing:.22em;
  text-transform:uppercase; color:var(--gold); display:flex; align-items:center; gap:.75rem;
}
.devo-done{ display:inline-flex; align-items:center; gap:.25rem; color:var(--ink-faint); }
.devo-title{
  width:100%; margin:.9rem 0 .2rem; padding:0; border:none; background:transparent; outline:none;
  font-family:var(--font-display),var(--font-serif),Georgia,serif; font-weight:300;
  font-size:clamp(2rem,4.4vw,2.9rem); line-height:1.12; letter-spacing:-.01em; color:var(--ink);
}
.devo-title:focus{ background:rgba(200,138,62,.08); border-radius:4px; }
.devo-title-en{ margin:0 0 2.5rem; font-style:italic; font-size:1rem; color:var(--ink-faint); }

.devo-body{ display:flex; flex-direction:column; }
.devo-para{ position:relative; display:flex; gap:.75rem; padding:.15rem 0; border-radius:6px; transition:background .2s ease; }
.devo-para.is-active{ background:rgba(200,138,62,.055); }
.devo-mark{ flex:0 0 14px; padding-top:1.15rem; }
.dot{ display:block; width:7px; height:7px; border-radius:50%; background:var(--kerti); box-shadow:0 0 0 3px rgba(233,168,96,.18); }
.dot-term{ background:#6FA5D8; box-shadow:0 0 0 3px rgba(111,165,216,.18); }
.devo-para-body{ flex:1; min-width:0; }

.devo-prose-input{
  display:block; width:100%; border:none; outline:none; resize:none; overflow:hidden;
  background:transparent; color:var(--ink); padding:.55rem .5rem;
  font-family:var(--font-serif),Georgia,serif; font-size:1.19rem; line-height:1.78; letter-spacing:.002em;
  border-radius:5px; transition:background .15s ease;
}
.devo-prose-input:hover{ background:rgba(27,24,20,.028); }
.devo-prose-input:focus{ background:#fff; box-shadow:0 0 0 1px rgba(200,138,62,.35); }

.devo-en{
  margin:.15rem .5rem .6rem; padding:.6rem .9rem; border-left:2px solid rgba(200,138,62,.4);
  background:rgba(27,24,20,.03); border-radius:0 5px 5px 0;
  font-size:.98rem; line-height:1.65; color:var(--ink-faint); font-style:italic;
}

.devo-tools{ display:flex; align-items:center; gap:.35rem; padding:.1rem .5rem .5rem; flex-wrap:wrap; }
.devo-flag{
  font-family:var(--font-sans),sans-serif; font-size:.66rem; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; padding:.14rem .42rem; border-radius:4px;
  background:rgba(233,168,96,.2); color:#8A5A22;
}
.devo-flag.is-term{ background:rgba(111,165,216,.18); color:#2E5B85; }
.devo-tool{
  display:inline-flex; align-items:center; gap:.28rem; background:transparent;
  border:1px solid rgba(27,24,20,.14); border-radius:5px; cursor:pointer;
  font-family:var(--font-sans),sans-serif; font-size:.72rem; font-weight:500; color:var(--ink-soft);
  padding:.24rem .5rem; transition:all .15s ease;
}
.devo-tool:hover{ border-color:rgba(27,24,20,.3); color:var(--ink); }
.devo-tool.is-go{ background:var(--ink); border-color:var(--ink); color:var(--paper); }
.devo-tool:disabled{ opacity:.5; cursor:default; }

.devo-instr{
  width:calc(100% - 1rem); margin:0 .5rem .6rem; padding:.5rem .7rem;
  border:1px solid rgba(27,24,20,.18); border-radius:6px; background:#fff; outline:none;
  font-family:var(--font-sans),sans-serif; font-size:.85rem; color:var(--ink);
}

.devo-sugg{ margin:.2rem .5rem 1rem; display:grid; gap:.5rem; }
.devo-sugg-note{ margin:0; font-family:var(--font-sans),sans-serif; font-size:.8rem; color:var(--ink-faint); }
.devo-opt{ padding:.7rem .85rem; border-radius:8px; background:var(--paper-warm); border:1px solid rgba(200,138,62,.28); }
.devo-opt-head{ display:flex; align-items:center; gap:.4rem; margin-bottom:.35rem; }
.devo-opt-label{ font-family:var(--font-sans),sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); }
.devo-opt-text{ margin:0; font-size:1.06rem; line-height:1.7; color:var(--ink); }
.devo-opt-text .ins{ background:rgba(90,150,100,.22); border-radius:3px; }
.devo-opt-text .del{ background:rgba(190,70,55,.14); text-decoration:line-through; opacity:.65; border-radius:3px; }

.devo-foot{ margin-top:3rem; padding-top:1.5rem; border-top:1px solid rgba(27,24,20,.12); }
.devo-note{
  width:100%; padding:.55rem .7rem; border:1px solid rgba(27,24,20,.16); border-radius:6px;
  background:transparent; outline:none; font-family:var(--font-sans),sans-serif; font-size:.85rem; color:var(--ink);
}
.devo-foot-links{ display:flex; gap:1.25rem; align-items:center; margin-top:.9rem; flex-wrap:wrap;
  font-family:var(--font-sans),sans-serif; font-size:.78rem; color:var(--ink-faint); }
.devo-foot-links a{ display:inline-flex; align-items:center; gap:.35rem; color:var(--ink-soft); text-decoration:none; }
.devo-foot-links a:hover{ color:var(--ink); text-decoration:underline; }
.devo-hint{ margin-left:auto; opacity:.7; }
.devo-loading{ text-align:center; padding:4rem; color:var(--ink-faint); }
`;
