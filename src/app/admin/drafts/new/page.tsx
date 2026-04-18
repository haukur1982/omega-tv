'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Sparkles, FileVideo } from 'lucide-react';

/**
 * /admin/drafts/new — "Nýtt drag"
 *
 * Manual entry point for videos that don't come through Azotus:
 *   - Native Icelandic content uploaded directly to Bunny
 *   - Phone recordings, guest contributions, archive cleanup
 *
 * Minimum input: a Bunny video ID. Optional: paste a transcript to
 * light up the auto-generated metadata (bible_ref, chapters, tags,
 * editor_note, description). Optional: override title + pick series.
 *
 * After creation, redirects to /admin/drafts/[id] for fine-tuning.
 */

type SeriesRow = { id: string; title: string };

export default function NewDraftPage() {
    const router = useRouter();
    const [bunnyId, setBunnyId] = useState('');
    const [title, setTitle] = useState('');
    const [transcript, setTranscript] = useState('');
    const [seriesId, setSeriesId] = useState('');
    const [language, setLanguage] = useState<'is' | 'en'>('is');
    const [seriesList, setSeriesList] = useState<SeriesRow[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingId, setExistingId] = useState<string | null>(null);

    // Load series dropdown
    useEffect(() => {
        (async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sb = supabase as any;
            const { data } = await sb.from('series').select('id, title').order('title');
            if (data) setSeriesList(data as SeriesRow[]);
        })();
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setExistingId(null);

        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/drafts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({
                bunny_video_id: bunnyId.trim(),
                title: title.trim() || undefined,
                transcript: transcript.trim() || undefined,
                series_id: seriesId || undefined,
                language,
            }),
        });

        const data = await res.json().catch(() => ({ error: 'Villa' }));

        if (res.ok && data.id) {
            router.push(`/admin/drafts/${data.id}`);
            return;
        }

        if (res.status === 409 && data.existing_id) {
            setExistingId(data.existing_id);
        }
        setError(data.error ?? 'Villa');
        setSubmitting(false);
    };

    const canSubmit = bunnyId.trim().length > 0 && !submitting;
    const hasTranscript = transcript.trim().length > 40;

    return (
        <AdminLayout>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                <header style={{ marginBottom: '1.75rem' }}>
                    <Link
                        href="/admin/drafts"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--admin-text-muted, #888)',
                            fontSize: '0.82rem',
                            textDecoration: 'none',
                            marginBottom: '12px',
                        }}
                    >
                        <ArrowLeft size={14} /> Innhólf
                    </Link>
                    <p className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', margin: 0, marginBottom: '8px', letterSpacing: '0.22em', fontSize: '0.68rem' }}>
                        Stak­framlag
                    </p>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.02em' }}>
                        Nýtt drag
                    </h1>
                    <p style={{ margin: '6px 0 0', color: 'var(--admin-text-muted, #888)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '58ch' }}>
                        Fyrir myndbönd sem koma ekki í gegnum Azotus — íslenskt efni, símaupptökur, gestaframlög. Hladdu upp í Bunny, afritaðu ID-ið, límdu hér inn. Þú getur bætt við handriti til að fylla út ritningartilvísun + kafla sjálfvirkt.
                    </p>
                </header>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* ── Bunny ID ────────────────────────────────────────── */}
                    <FieldGroup label="Myndband í Bunny">
                        <Field
                            label="Bunny video ID"
                            hint="GUID-ið frá Bunny Stream dashboard — t.d. 2b3f98a1-7c4d-4e9f-b123-456789abcdef"
                        >
                            <input
                                type="text"
                                value={bunnyId}
                                onChange={(e) => setBunnyId(e.target.value)}
                                placeholder="2b3f98a1-7c4d-4e9f-..."
                                required
                                style={{ ...inputStyle, fontFamily: 'monospace' }}
                                autoFocus
                            />
                        </Field>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-text-muted, #888)' }}>
                            <FileVideo size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-1px' }} />
                            Myndbandið þarf að vera þegar hlaðið upp í Bunny Stream library 628621.
                            <a
                                href="https://dash.bunny.net/stream/628621"
                                target="_blank"
                                rel="noreferrer"
                                style={{ marginLeft: '8px', color: 'var(--admin-accent, #E9A860)', textDecoration: 'none' }}
                            >
                                Opna Bunny →
                            </a>
                        </p>
                    </FieldGroup>

                    {/* ── Optional overrides ─────────────────────────────── */}
                    <FieldGroup label="Valfrjáls yfirskrif">
                        <Field label="Titill" hint="Ef auður, notum við titilinn úr Bunny (eða býr­um til einn úr handriti).">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Fylltu inn ef þú vilt yfirskrifa sjálfvirka titilinn"
                                style={inputStyle}
                            />
                        </Field>
                        <Field label="Þátta­röð">
                            <select
                                value={seriesId}
                                onChange={(e) => setSeriesId(e.target.value)}
                                style={{ ...inputStyle, maxWidth: '420px' }}
                            >
                                <option value="">— Engin, set ég síðar —</option>
                                {seriesList.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Aðalungumál">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'is' | 'en')}
                                style={{ ...inputStyle, maxWidth: '160px' }}
                            >
                                <option value="is">Íslenska</option>
                                <option value="en">English</option>
                            </select>
                        </Field>
                    </FieldGroup>

                    {/* ── Transcript ─────────────────────────────────────── */}
                    <FieldGroup label={`Handrit ${hasTranscript ? '· tilbúið' : '· valfrjálst'}`}>
                        <Field
                            label="Handrit / transcript"
                            hint="Límdu inn handrit (VTT eða textaskjal). Ef þú gerir það fyllum við ritningartilvísun, kafla og lýsingu sjálfvirkt. Tómt = tómt drag sem þú fyllir út handvirkt."
                        >
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                rows={10}
                                placeholder={`WEBVTT\n\n00:00:00.000 --> 00:00:08.500\nVelkomin í þáttinn…`}
                                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-serif, serif)', minHeight: '180px' }}
                            />
                        </Field>
                        {hasTranscript && (
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-accent, #E9A860)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Sparkles size={13} />
                                {process.env.NEXT_PUBLIC_GEMINI_ENABLED
                                    ? 'Gemini mun búa til titil, lýsingu, ritningartilvísun og kafla.'
                                    : 'Mock stilling: titill + lýsing búin til. Fyrir betri útkomu, bættu GEMINI_API_KEY við .env.local.'}
                            </p>
                        )}
                    </FieldGroup>

                    {/* ── Actions ────────────────────────────────────────── */}
                    <div
                        style={{
                            padding: '16px 20px',
                            background: 'var(--admin-surface, #1f1d1a)',
                            border: '1px solid var(--admin-border, #333)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                            {error && (
                                <div>
                                    <p style={{ margin: 0, color: 'var(--admin-error, #e55)', fontSize: '0.88rem' }}>
                                        {error}
                                    </p>
                                    {existingId && (
                                        <Link
                                            href={`/admin/drafts/${existingId}`}
                                            style={{ fontSize: '0.8rem', color: 'var(--admin-accent, #E9A860)', textDecoration: 'none' }}
                                        >
                                            → Opna núverandi færslu
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link
                                href="/admin/drafts"
                                style={btnGhost}
                            >
                                Hætta við
                            </Link>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                style={{ ...btnAmber, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'default' }}
                            >
                                {submitting ? <Loader2 size={14} className="admin-spinner" /> : <Sparkles size={14} />}
                                Búa til drag
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <fieldset
            style={{
                border: '1px solid var(--admin-border, #333)',
                borderRadius: '8px',
                padding: '20px 22px 22px',
                background: 'var(--admin-surface, #1f1d1a)',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}
        >
            <legend
                style={{
                    padding: '0 8px',
                    color: 'var(--admin-accent, #E9A860)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </legend>
            {children}
        </fieldset>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--admin-text, #eee)', fontSize: '0.88rem', fontWeight: 500 }}>{label}</span>
            {children}
            {hint && <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.76rem', fontStyle: 'italic', lineHeight: 1.5 }}>{hint}</span>}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--admin-bg, #14120F)',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.92rem',
    fontFamily: 'inherit',
    outline: 'none',
};

const btnGhost: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '6px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.84rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
};

const btnAmber: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 22px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '6px',
    color: '#14120F',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
};
