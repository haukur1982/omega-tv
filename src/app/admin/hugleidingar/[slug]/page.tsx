'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, ArrowRight, ExternalLink, Check, Sparkles, Volume2, Square,
    Undo2, BookMarked, Languages, Maximize2, Minimize2, Flag as FlagIcon,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';
import ProseLine from '@/components/hugleidingar/ProseLine';
import ParagraphSheet from '@/components/hugleidingar/ParagraphSheet';
import { SHEET_CSS } from '@/components/hugleidingar/sheet-css';
import SuggestionCard, {
    type Suggestion, type TakenEdit,
} from '@/components/hugleidingar/SuggestionCard';
import {
    flagParagraph, applyEdit,
    type Edit, type Flag, type GlossaryTerm,
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
 * Two shapes, one state. On a laptop the paragraphs are editable in place and
 * the suggestion card unfolds beneath the one you are working on. On a phone
 * (≤768px) the same piece is a reading page and a tap lifts ONE paragraph into
 * a bottom sheet — because a screen that small cannot hold prose and tools at
 * the same time. Draft restore, warn-on-leave, revert, ⌘S and ⌥↓ are the same
 * state underneath both.
 */

const SLOT_IS: Record<string, string> = { morning: 'Morgunn', evening: 'Kvöld' };
const draftKey = (slug: string) => `omega:devo-draft:${slug}`;
/** Read-aloud keys for suggestions, kept clear of the paragraph indices. */
const optKey = (i: number, k: number) => 1000 + i * 10 + k;

interface Item {
    id: string; day: number; slot: 'morning' | 'evening'; slug: string;
    title_is: string; title_en: string | null;
    body_is: string[]; body_en: string[];
    scripture_refs: string[]; source_url: string | null;
    reviewed: boolean; review_note: string | null; status: 'draft' | 'published';
}
interface Nav { prev: string | null; next: string | null; position: number; total: number }

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
    const [taken, setTaken] = useState<Record<number, TakenEdit[]>>({});
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
    const [isPhone, setIsPhone] = useState(false);
    const [sheetIdx, setSheetIdx] = useState<number | null>(null);
    const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

    /* Which shape the room takes. The two render differently, so this is a
       state and not only a media query. */
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const sync = () => setIsPhone(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);
    useEffect(() => { if (!isPhone) setSheetIdx(null); }, [isPhone]);

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
            setSugg({}); setTaken({}); setShowEn({}); setActive(null); setUsedSuggestion(false);
            setSheetIdx(null);

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
    const dropSuggestion = (i: number) => {
        setSugg((x) => { const n = { ...x }; delete n[i]; return n; });
        setTaken((x) => { const n = { ...x }; delete n[i]; return n; });
    };
    const revertPara = (i: number) => { if (item) { setPara(i, item.body_is[i]); dropSuggestion(i); } };

    /**
     * One small edit, taken. It goes in through `setPara` — the same path a
     * keystroke takes — so autosave, revert and the corrections record all see
     * it as the reviewer's own text, which is what it is.
     *
     * Every chip on screen was grouped against the paragraph as it stands, so
     * a refusal here means the anchor moved under it; the chip is dropped
     * rather than guessed at.
     */
    const takeEdit = (i: number, edit: Edit, label: string) => {
        const next = applyEdit(paras[i], edit);
        if (next === null) return;
        setPara(i, next);
        setUsedSuggestion(true);
        setTaken((t) => ({
            ...t,
            [i]: [...(t[i] ?? []), { label, removed: edit.removed, added: edit.added }],
        }));
    };

    const takeWholeOption = (i: number, text: string) => {
        setPara(i, text);
        setUsedSuggestion(true);
        setTaken((t) => ({ ...t, [i]: [] }));
    };

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

    const saveMsg = () => (item && !item.reviewed
        ? 'Vistað — smelltu á „Yfirlesin“ þegar hún er tilbúin.'
        : 'Vistað.');

    /**
     * Jumping, and there are two jumps because he has two moves: read on to
     * the next paragraph, or go straight to the next thing that is wrong.
     *
     * 1,851 paragraphs and about a hundred flags — reviewing has to be able to
     * start where the problems are, so the flagged jump wraps: the last flag
     * takes you back to the first, and when the piece is clean there is
     * nothing to jump to and the button is gone.
     *
     * The cursor is the paragraph he is ON, not what is on screen. Stepping
     * from the viewport alone stalls: the target lands mid-screen, is still
     * "the first one below the bar", and the second press picks it again.
     * Only the first jump, before anything is chosen, reads the viewport.
     */
    const paraCount = paras.length;
    const jump = useCallback((dir: 1 | -1, flaggedOnly: boolean) => {
        const pool = flaggedOnly ? flaggedIdx : Array.from({ length: paraCount }, (_, i) => i);
        if (pool.length === 0) return;

        let target: number;
        if (active === null) {
            const tops = pool.map((i) => ({ i, top: rowRefs.current[i]?.getBoundingClientRect().top ?? 0 }));
            target = dir === 1
                ? (tops.find((t) => t.top > 120) ?? tops[0]).i
                : ([...tops].reverse().find((t) => t.top < -20) ?? tops[tops.length - 1]).i;
        } else {
            target = dir === 1
                ? pool.find((i) => i > active) ?? pool[0]
                : [...pool].reverse().find((i) => i < active) ?? pool[pool.length - 1];
        }

        rowRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setActive(target);
    }, [flaggedIdx, paraCount, active]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault(); if (!saving) save(); return;
            }
            if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                jump(e.key === 'ArrowDown' ? 1 : -1, e.shiftKey);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [save, saving, jump]);

    const askSuggestion = async (i: number) => {
        if (!item) return;
        setBusyIdx(i);
        try {
            const res = await authedFetch('/api/admin/devotionals/suggest', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                // The id and the index are what let the route answer from the
                // pre-warmed cache — and write the row when it has to generate.
                body: JSON.stringify({
                    en: item.body_en?.[i] ?? '', is: paras[i], instruction: instr[i] ?? '',
                    devotionalId: item.id, index: i,
                }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || `Villa ${res.status}`);
            setSugg((s) => ({ ...s, [i]: { options: d.options ?? [], note: d.note ?? '', learnedFrom: d.learnedFrom ?? 0 } }));
            setTaken((t) => ({ ...t, [i]: [] }));
        } catch (e) {
            setNotice(e instanceof Error ? e.message : 'Tillaga mistókst');
        }
        setBusyIdx(null);
    };

    /** The suggestion card, wired to one paragraph. Shared by both shapes. */
    const cardFor = (i: number) => {
        const s = sugg[i];
        if (!s) return null;
        const base = optKey(i, 0);
        return (
            <SuggestionCard
                current={paras[i]}
                suggestion={s}
                taken={taken[i] ?? []}
                onTakeEdit={(edit, label) => takeEdit(i, edit, label)}
                onUseAll={(text) => takeWholeOption(i, text)}
                onClose={() => dropSuggestion(i)}
                onSpeak={(k, text) => speak(optKey(i, k), text)}
                speakingOption={
                    speaking !== null && speaking >= base && speaking < base + 10 ? speaking - base : null
                }
            />
        );
    };

    const sheetOpen = isPhone && sheetIdx !== null && sheetIdx < paras.length;

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
                {flaggedIdx.length > 0 && (
                    <button
                        onClick={() => jump(1, true)}
                        className="devo-ghost devo-flagjump"
                        title="Næsta flöggaða málsgrein (⌥⇧↓)"
                    >
                        <FlagIcon size={13} />
                        {isPhone ? flaggedIdx.length : `Næsta flagg ↓ (${flaggedIdx.length})`}
                    </button>
                )}
                {!isPhone && (
                    <>
                        <button onClick={() => setAllEn((v) => !v)} className="devo-ghost" title="Sýna enska frumtextann alls staðar">
                            <Languages size={15} /> {allEn ? 'Fela frumtexta' : 'Frumtexti'}
                        </button>
                        <button onClick={() => setFocusMode((v) => !v)} className="devo-ghost" title="Fela hliðarstiku">
                            {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>
                        <button onClick={() => save({}, saveMsg())} disabled={saving} className="devo-ghost">
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
                    </>
                )}
                {isPhone && item?.reviewed && (
                    <span className="devo-done"><Check size={12} /> yfirlesin</span>
                )}
            </div>

            {notice && !sheetOpen && <div className="devo-notice">{notice}</div>}
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
                        {!isPhone && item.reviewed && <span className="devo-done"><Check size={12} /> yfirlesin</span>}
                    </div>

                    <input className="devo-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    {item.title_en && <p className="devo-title-en">{item.title_en}</p>}

                    {/* PHONE — the piece is a reading page; a tap opens the sheet. */}
                    {isPhone ? (
                        <div className="devo-read">
                            {paras.map((p, i) => {
                                const f = flags[i];
                                const changed = item.body_is[i] !== undefined && p !== item.body_is[i];
                                return (
                                    <div
                                        key={i}
                                        ref={(el) => { rowRefs.current[i] = el; }}
                                        role="button"
                                        tabIndex={0}
                                        className={`devo-rpara${sheetIdx === i ? ' is-open' : ''}${changed ? ' is-changed' : ''}${active === i && sheetIdx === null ? ' is-focus' : ''}`}
                                        onClick={() => setSheetIdx(i)}
                                        onKeyDown={(e) => {
                                            if (e.key !== 'Enter' && e.key !== ' ') return;
                                            e.preventDefault();
                                            setSheetIdx(i);
                                        }}
                                    >
                                        <span className="devo-rmark" title={f.map((x) => x.hint).join('\n')}>
                                            {f.length > 0 && <span className={f.some((x) => x.kind === 'term') ? 'dot dot-term' : 'dot'} />}
                                        </span>
                                        <p>{p}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="devo-body">
                            {paras.map((p, i) => {
                                const f = flags[i];
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

                                            {cardFor(i)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <footer className="devo-foot">
                        <input
                            className="devo-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Athugasemd yfirlesara (birtist ekki)"
                        />
                        <div className="devo-foot-links">
                            <Link href="/admin/hugleidingar/hugtok"><BookMarked size={13} /> Hugtakaskrá ({glossary.length})</Link>
                            {item.source_url && (
                                <a href={item.source_url} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Frumtexti á vefnum</a>
                            )}
                            {!isPhone && (
                                <span className="devo-hint">⌘S vistar · ⌥↓ næsta málsgrein · ⌥⇧↓ næsta flagg</span>
                            )}
                        </div>
                    </footer>

                    {/* PHONE — the piece's own state and its two decisions, at the bottom. */}
                    {isPhone && (
                        <div className="devo-mfoot">
                            <button onClick={() => save({}, saveMsg())} disabled={saving} className="devo-ghost">
                                {saving ? 'Vista…' : 'Vista'}
                            </button>
                            {!item.reviewed && (
                                <button onClick={() => save({ reviewed: true }, 'Merkt yfirlesin.')} disabled={saving} className="devo-solid">
                                    Yfirlesin
                                </button>
                            )}
                            {item.reviewed && item.status === 'draft' && (
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
                    )}
                </article>
            )}

            {sheetOpen && item && sheetIdx !== null && (
                <ParagraphSheet
                    key={sheetIdx}
                    position={sheetIdx + 1}
                    total={paras.length}
                    value={paras[sheetIdx]}
                    english={item.body_en?.[sheetIdx] ?? null}
                    flags={flags[sheetIdx] ?? []}
                    changed={item.body_is[sheetIdx] !== undefined && paras[sheetIdx] !== item.body_is[sheetIdx]}
                    busy={busyIdx === sheetIdx}
                    saving={saving}
                    speaking={speaking === sheetIdx}
                    notice={notice}
                    instruction={instr[sheetIdx] ?? ''}
                    instructionOpen={!!openInstr[sheetIdx]}
                    onChange={(v) => setPara(sheetIdx, v)}
                    onInstruction={(v) => setInstr((x) => ({ ...x, [sheetIdx]: v }))}
                    onToggleInstruction={() => setOpenInstr((o) => ({ ...o, [sheetIdx]: !o[sheetIdx] }))}
                    onAsk={() => askSuggestion(sheetIdx)}
                    onRevert={() => revertPara(sheetIdx)}
                    onSpeak={() => speak(sheetIdx, paras[sheetIdx])}
                    onSave={() => save({}, saveMsg())}
                    onClose={() => setSheetIdx(null)}
                >
                    {cardFor(sheetIdx)}
                </ParagraphSheet>
            )}

            {isLoading && !item && <p className="devo-loading">Sæki…</p>}
        </div>
    );

    return focusMode ? body : <AdminLayout>{body}</AdminLayout>;
}
