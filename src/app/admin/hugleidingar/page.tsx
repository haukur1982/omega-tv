'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookMarked, ArrowRight, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { authedFetch } from '@/lib/admin-fetch';

/**
 * /admin/hugleidingar — the month.
 *
 * The entry point a reviewer opens every morning, so it is set on the same
 * vellum as the reading room rather than in dashboard chrome. Thirty-one
 * days, morning and evening, laid out as a month that visibly fills up —
 * progress you can feel at a glance, and one button that drops you exactly
 * where you left off.
 */

interface Row {
    id: string;
    day: number;
    slot: 'morning' | 'evening';
    slug: string;
    title_is: string;
    reviewed: boolean;
    status: 'draft' | 'published';
    paragraphs: number;
}

export default function AdminHugleidingarPage() {
    const router = useRouter();
    const [rows, setRows] = useState<Row[]>([]);
    const [progress, setProgress] = useState({ total: 0, reviewed: 0, published: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authedFetch('/api/admin/devotionals');
            if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
            const d = await res.json();
            setRows(d.items ?? []);
            setProgress(d.progress ?? { total: 0, reviewed: 0, published: 0 });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Tókst ekki að sækja hugleiðingar');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const byDay = useMemo(() => {
        const m = new Map<number, { morning?: Row; evening?: Row }>();
        for (const r of rows) {
            const e = m.get(r.day) ?? {};
            e[r.slot] = r;
            m.set(r.day, e);
        }
        return m;
    }, [rows]);

    // Where to pick up: the first piece not yet read, in reading order.
    const nextUp = useMemo(() => {
        const ordered = [...rows].sort((a, b) =>
            a.day - b.day || (a.slot === 'morning' ? -1 : 1) - (b.slot === 'morning' ? -1 : 1));
        return ordered.find((r) => !r.reviewed) ?? null;
    }, [rows]);

    const pct = progress.total > 0 ? Math.round((progress.reviewed / progress.total) * 100) : 0;
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <AdminLayout>
            <div className="hug-sheet">
                <style>{SHEET_CSS}</style>

                <div className="hug-head">
                    <div>
                        <div className="hug-kicker">Hugleiðingar · Wade E. Taylor</div>
                        <h1 className="hug-title">Mánuður af morgnum.</h1>
                        <p className="hug-sub">
                            Þrjátíu og einn dagur, morgunn og kvöld. Vélþýtt — hver hugleiðing bíður
                            þess að vera lesin yfir áður en hún fer út til fólks.
                        </p>
                    </div>
                    <button onClick={load} className="hug-ghost" disabled={isLoading} aria-label="Endurhlaða">
                        <RefreshCw size={16} className={isLoading ? 'hug-spin' : ''} />
                    </button>
                </div>

                <div className="hug-stats">
                    <div className="hug-stat">
                        <span className="hug-stat-n">{progress.reviewed}</span>
                        <span className="hug-stat-l">yfirlesnar af {progress.total}</span>
                    </div>
                    <div className="hug-stat">
                        <span className="hug-stat-n">{progress.published}</span>
                        <span className="hug-stat-l">birtar</span>
                    </div>
                    <div className="hug-bar-wrap">
                        <div className="hug-bar"><div className="hug-bar-fill" style={{ width: `${pct}%` }} /></div>
                        <span className="hug-stat-l">{pct}% lokið</span>
                    </div>
                    {nextUp && (
                        <button className="hug-solid" onClick={() => router.push(`/admin/hugleidingar/${nextUp.slug}`)}>
                            {progress.reviewed === 0 ? 'Byrja' : 'Halda áfram'} · dagur {nextUp.day}
                            {nextUp.slot === 'morning' ? ' morgunn' : ' kvöld'}
                            <ArrowRight size={15} />
                        </button>
                    )}
                    {!nextUp && progress.total > 0 && (
                        <span className="hug-done-all">Allt yfirlesið.</span>
                    )}
                </div>

                {error && <div className="hug-error">{error}</div>}

                <div className="hug-month">
                    {days.map((day) => {
                        const e = byDay.get(day);
                        if (!e) return <div key={day} className="hug-day is-empty"><span className="hug-daynum">{day}</span></div>;
                        const both = [e.morning, e.evening].filter(Boolean) as Row[];
                        const doneCount = both.filter((r) => r.reviewed).length;
                        const state = doneCount === both.length ? 'is-done' : doneCount > 0 ? 'is-part' : '';
                        return (
                            <div key={day} className={`hug-day ${state}`}>
                                <span className="hug-daynum">{day}</span>
                                <div className="hug-slots">
                                    {(['morning', 'evening'] as const).map((slot) => {
                                        const r = e[slot];
                                        if (!r) return <span key={slot} className="hug-slot is-missing" />;
                                        return (
                                            <Link
                                                key={slot}
                                                href={`/admin/hugleidingar/${r.slug}`}
                                                className={`hug-slot${r.reviewed ? ' is-read' : ''}${r.status === 'published' ? ' is-live' : ''}`}
                                                title={`${slot === 'morning' ? 'Morgunn' : 'Kvöld'} — ${r.title_is}`}
                                            >
                                                <span className="hug-slot-label">{slot === 'morning' ? 'M' : 'K'}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                                {e.morning && <span className="hug-day-title">{e.morning.title_is}</span>}
                            </div>
                        );
                    })}
                </div>

                <div className="hug-foot">
                    <Link href="/admin/hugleidingar/hugtok"><BookMarked size={14} /> Hugtakaskrá</Link>
                    <span className="hug-legend">
                        <span className="lg lg-todo" /> á eftir
                        <span className="lg lg-read" /> yfirlesin
                        <span className="lg lg-live" /> birt
                    </span>
                </div>
            </div>
        </AdminLayout>
    );
}

const SHEET_CSS = `
.hug-sheet{
  --ink:#1B1814; --ink-soft:#4A4339; --ink-faint:#7A7268;
  --paper:#F3EDE0; --paper-warm:#EDE6D6; --gold:#C88A3E; --kerti:#E9A860;
  background:var(--paper); color:var(--ink); margin:-2rem; padding:clamp(2rem,5vw,3.5rem) clamp(1.25rem,4vw,3.5rem) 4rem;
  min-height:100vh; font-family:var(--font-serif),Georgia,serif;
}
.hug-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; max-width:64rem; }
.hug-kicker{ font-family:var(--font-sans),sans-serif; font-size:.72rem; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); }
.hug-title{ margin:.7rem 0 .4rem; font-family:var(--font-display),var(--font-serif),Georgia,serif; font-weight:300; font-size:clamp(2rem,4.2vw,2.8rem); line-height:1.12; letter-spacing:-.01em; }
.hug-sub{ margin:0; max-width:48ch; font-size:1.02rem; line-height:1.65; color:var(--ink-soft); }
.hug-ghost{ background:transparent; border:1px solid rgba(27,24,20,.16); border-radius:6px; color:var(--ink-soft); padding:.45rem; cursor:pointer; }
.hug-ghost:hover{ border-color:rgba(27,24,20,.32); color:var(--ink); }
.hug-spin{ animation:hugspin 1s linear infinite; }
@keyframes hugspin{ to{ transform:rotate(360deg); } }

.hug-stats{ display:flex; align-items:center; gap:2rem; flex-wrap:wrap; margin:2.2rem 0 2.5rem; padding-bottom:1.6rem; border-bottom:1px solid rgba(27,24,20,.12); }
.hug-stat{ display:flex; align-items:baseline; gap:.5rem; }
.hug-stat-n{ font-family:var(--font-display),var(--font-serif),serif; font-size:2.1rem; font-weight:300; font-variant-numeric:tabular-nums; }
.hug-stat-l{ font-family:var(--font-sans),sans-serif; font-size:.8rem; letter-spacing:.06em; color:var(--ink-faint); }
.hug-bar-wrap{ display:flex; align-items:center; gap:.75rem; min-width:200px; flex:1; }
.hug-bar{ flex:1; height:6px; border-radius:3px; background:rgba(27,24,20,.1); overflow:hidden; }
.hug-bar-fill{ height:100%; background:var(--gold); transition:width .6s cubic-bezier(.2,0,.1,1); }
.hug-solid{ display:inline-flex; align-items:center; gap:.5rem; background:var(--ink); color:var(--paper); border:none; border-radius:7px; padding:.65rem 1.1rem; cursor:pointer; font-family:var(--font-sans),sans-serif; font-size:.88rem; font-weight:500; }
.hug-solid:hover{ background:#000; }
.hug-done-all{ font-family:var(--font-sans),sans-serif; font-size:.85rem; color:var(--gold); font-weight:600; }
.hug-error{ margin-bottom:1.5rem; padding:.8rem 1rem; border-radius:8px; background:rgba(216,75,58,.1); border:1px solid rgba(216,75,58,.3); font-family:var(--font-sans),sans-serif; font-size:.85rem; }

.hug-month{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:.75rem; max-width:70rem; }
.hug-day{ position:relative; padding:.7rem .8rem .8rem; border-radius:9px; background:rgba(27,24,20,.028); border:1px solid rgba(27,24,20,.08); transition:all .2s ease; }
.hug-day.is-part{ background:rgba(200,138,62,.07); border-color:rgba(200,138,62,.25); }
.hug-day.is-done{ background:rgba(200,138,62,.13); border-color:rgba(200,138,62,.4); }
.hug-day.is-empty{ opacity:.35; }
.hug-daynum{ font-family:var(--font-sans),sans-serif; font-size:.7rem; font-weight:700; letter-spacing:.1em; color:var(--ink-faint); }
.hug-slots{ display:flex; gap:.35rem; margin:.45rem 0 .5rem; }
.hug-slot{ display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:6px;
  background:rgba(27,24,20,.07); border:1px solid rgba(27,24,20,.12); text-decoration:none; transition:all .15s ease; }
.hug-slot:hover{ border-color:var(--gold); transform:translateY(-1px); }
.hug-slot-label{ font-family:var(--font-sans),sans-serif; font-size:.66rem; font-weight:700; color:var(--ink-faint); }
.hug-slot.is-read{ background:var(--kerti); border-color:var(--kerti); }
.hug-slot.is-read .hug-slot-label{ color:#3A2A12; }
.hug-slot.is-live{ background:var(--ink); border-color:var(--ink); }
.hug-slot.is-live .hug-slot-label{ color:var(--paper); }
.hug-slot.is-missing{ opacity:.25; }
.hug-day-title{ display:block; font-size:.86rem; line-height:1.35; color:var(--ink-soft);
  overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

.hug-foot{ display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; margin-top:2.5rem; padding-top:1.25rem; border-top:1px solid rgba(27,24,20,.12);
  font-family:var(--font-sans),sans-serif; font-size:.8rem; color:var(--ink-faint); }
.hug-foot a{ display:inline-flex; align-items:center; gap:.4rem; color:var(--ink-soft); text-decoration:none; }
.hug-foot a:hover{ color:var(--ink); text-decoration:underline; }
.hug-legend{ display:inline-flex; align-items:center; gap:.45rem; margin-left:auto; }
.lg{ display:inline-block; width:12px; height:12px; border-radius:4px; margin-left:.6rem; }
.lg-todo{ background:rgba(27,24,20,.07); border:1px solid rgba(27,24,20,.12); }
.lg-read{ background:var(--kerti); }
.lg-live{ background:var(--ink); }
`;
