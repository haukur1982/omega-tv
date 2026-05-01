'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import {
    Loader2, Plus, Trash2, Save, X, Radio, Star, CheckCircle2, Clock,
    ChevronLeft, ChevronRight, Download, AlertCircle,
} from 'lucide-react';

/**
 * /admin/schedule — Dagskrá editor
 *
 * Edit weekly schedule_slots that power /live's day switcher + home's
 * DagskraStrip. UX: day switcher across the top (Mán-Sun), list of
 * slots for the selected day below, inline "Add slot" + row-level
 * expand-to-edit. Week navigation via prev/next week arrows.
 *
 * Design goals:
 *   - Fast Monday-morning rhythm: open, scan week, fix things, done
 *   - No modal dialogs — everything inline
 *   - Pre-fill sensible defaults when adding a new slot
 */

type Slot = {
    id: string;
    starts_at: string;
    ends_at: string;
    program_title: string;
    program_subtitle: string | null;
    program_type: string;
    host_name: string | null;
    description: string | null;
    is_live_broadcast: boolean;
    is_featured: boolean;
    episode_id: string | null;
    series_id: string | null;
}

interface EpisodePickerOption {
    id: string;
    label: string;
    date: string | null;
};

type ProgramType = 'service' | 'prayer_night' | 'teaching' | 'broadcast' | 'rerun' | 'special' | 'filler';

const PROGRAM_TYPES: { value: ProgramType; label: string }[] = [
    { value: 'service', label: 'Sunnudagssamkoma' },
    { value: 'prayer_night', label: 'Bænastund' },
    { value: 'teaching', label: 'Fræðsla' },
    { value: 'broadcast', label: 'Útsending' },
    { value: 'rerun', label: 'Endurtekning' },
    { value: 'special', label: 'Sérstakur' },
    { value: 'filler', label: 'Uppfylling' },
];

const WEEKDAY_NAMES_IS = ['Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau', 'Sun'];
const MONTH_NAMES_IS = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];

function mondayOfWeek(anchor: Date): Date {
    const dow = anchor.getUTCDay();
    const daysFromMonday = (dow + 6) % 7;
    return new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate() - daysFromMonday));
}

function isoDate(d: Date): string { return d.toISOString().slice(0, 10); }

function formatClockUtc(iso: string): string {
    const d = new Date(iso);
    const h = d.getUTCHours().toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

/** Combine YYYY-MM-DD + HH:MM into an ISO string in UTC (Iceland = UTC year-round). */
function combineToIso(date: string, time: string): string {
    // date: "2026-04-19", time: "20:00"
    return `${date}T${time}:00.000Z`;
}

export default function AdminSchedulePage() {
    const [weekStart, setWeekStart] = useState<Date>(() => mondayOfWeek(new Date()));
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => ((new Date().getUTCDay() + 6) % 7));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [creatingOnDay, setCreatingOnDay] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ imported: number; unlabeled: string[]; skipped_manual: number } | null>(null);

    const weekStartIso = useMemo(() => isoDate(weekStart), [weekStart]);
    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + i));
            return d;
        });
    }, [weekStart]);

    const selectedDate = days[selectedDayIdx];
    const selectedDateIso = isoDate(selectedDate);

    const slotsForSelectedDay = useMemo(() => {
        return slots.filter((s) => s.starts_at.slice(0, 10) === selectedDateIso);
    }, [slots, selectedDateIso]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/schedule-slots?week=${weekStartIso}`, {
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        if (res.ok) {
            const data = await res.json();
            setSlots(data.items ?? []);
        } else {
            setError('Tókst ekki að sækja dagskrá.');
        }
        setLoading(false);
    }, [weekStartIso]);

    useEffect(() => { load(); }, [load]);

    const shiftWeek = (delta: number) => {
        const next = new Date(weekStart.getTime() + delta * 7 * 24 * 60 * 60 * 1000);
        setWeekStart(mondayOfWeek(next));
        setEditingId(null);
        setCreatingOnDay(null);
    };

    const startCreate = (dayIdx: number) => {
        setEditingId(null);
        setCreatingOnDay(dayIdx);
    };

    const cancelEditOrCreate = () => {
        setEditingId(null);
        setCreatingOnDay(null);
        setError(null);
    };

    const syncXml = useCallback(async () => {
        setSyncing(true);
        setSyncResult(null);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };
        const res = await fetch('/api/admin/schedule/sync-xml', {
            method: 'POST',
            headers,
            body: JSON.stringify({ date: selectedDateIso }),
        });
        const data = await res.json().catch(() => ({ error: 'Villa' }));
        if (!res.ok) {
            setError(data.error ?? 'Innflutningur tókst ekki.');
            setSyncing(false);
            return;
        }
        setSyncResult({ imported: data.imported, unlabeled: data.unlabeled ?? [], skipped_manual: data.skipped_manual ?? 0 });
        setSyncing(false);
        await load();
    }, [selectedDateIso, load]);

    const handleDelete = async (slotId: string) => {
        if (!confirm('Eyða þessu dagskrárhorfi?')) return;
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`/api/admin/schedule-slots/${slotId}`, {
            method: 'DELETE',
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            alert(data.error ?? 'Villa');
            return;
        }
        await load();
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <header style={{ marginBottom: '1.75rem' }}>
                    <p className="type-merki" style={{ color: 'var(--admin-accent, #E9A860)', margin: 0, marginBottom: '8px', letterSpacing: '0.22em', fontSize: '0.68rem' }}>
                        Forsíðan · Dagskrá vikunnar
                    </p>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 2.8vw, 2.1rem)', fontWeight: 700, color: 'var(--admin-text, #eee)', letterSpacing: '-0.02em' }}>
                        Dagskrá
                    </h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--admin-text-muted, #888)', fontSize: '0.92rem', lineHeight: 1.55, maxWidth: '58ch' }}>
                        Breyttu vikulegu dagskránni sem birtist á <code style={{ fontSize: '0.88em', color: 'var(--admin-accent, #E9A860)' }}>/beint</code> og <em>Dagskráin</em> hlutnum á forsíðunni. Veldu dag, smelltu á hólf til að laga, bættu nýjum þáttum við með + hnappnum.
                    </p>
                </header>

                {/* Week nav */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '10px 14px',
                        background: 'var(--admin-surface, #1f1d1a)',
                        border: '1px solid var(--admin-border, #333)',
                        borderRadius: '6px',
                        marginBottom: '16px',
                    }}
                >
                    <button type="button" onClick={() => shiftWeek(-1)} style={btnGhostSm}>
                        <ChevronLeft size={14} /> Fyrri vika
                    </button>
                    <p className="type-merki" style={{ margin: 0, color: 'var(--admin-text, #eee)', letterSpacing: '0.2em', fontSize: '0.7rem' }}>
                        Vika byrjar {weekStart.getUTCDate()}. {MONTH_NAMES_IS[weekStart.getUTCMonth()]} {weekStart.getUTCFullYear()}
                    </p>
                    <button type="button" onClick={() => shiftWeek(1)} style={btnGhostSm}>
                        Næsta vika <ChevronRight size={14} />
                    </button>
                </div>

                {/* Day switcher */}
                <div
                    role="tablist"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                        padding: '4px',
                        background: 'var(--admin-surface, #1f1d1a)',
                        border: '1px solid var(--admin-border, #333)',
                        borderRadius: '6px',
                        marginBottom: '20px',
                    }}
                >
                    {days.map((d, i) => {
                        const active = i === selectedDayIdx;
                        const count = slots.filter((s) => s.starts_at.slice(0, 10) === isoDate(d)).length;
                        return (
                            <button
                                type="button"
                                key={i}
                                role="tab"
                                aria-selected={active}
                                onClick={() => { setSelectedDayIdx(i); setEditingId(null); setCreatingOnDay(null); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '10px 6px',
                                    borderRadius: '4px',
                                    background: active ? 'var(--admin-bg, #14120F)' : 'transparent',
                                    border: 'none',
                                    color: active ? 'var(--admin-text, #eee)' : 'var(--admin-text-muted, #888)',
                                    cursor: 'pointer',
                                    transition: 'background 200ms ease',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <span className="type-merki" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: active ? 'var(--admin-accent, #E9A860)' : 'var(--admin-text-muted, #888)' }}>
                                    {WEEKDAY_NAMES_IS[i]}
                                </span>
                                <span style={{ fontSize: '1.05rem', fontFamily: 'var(--font-serif, serif)', fontWeight: 400, color: 'inherit' }}>
                                    {d.getUTCDate()}.
                                </span>
                                <span className="type-merki" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'var(--admin-text-muted, #666)' }}>
                                    {count} {count === 1 ? 'þáttur' : 'þættir'}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Slots for selected day */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '10px', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text, #eee)' }}>
                            {WEEKDAY_NAMES_IS[selectedDayIdx]} {selectedDate.getUTCDate()}. {MONTH_NAMES_IS[selectedDate.getUTCMonth()]}
                        </h2>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button type="button" onClick={syncXml} disabled={syncing} style={{ ...btnGhostSm, opacity: syncing ? 0.5 : 1 }} title="Fá dagskrá þessa dags frá playout FTP">
                                {syncing ? <Loader2 size={12} className="admin-spinner" /> : <Download size={12} />}
                                Flytja inn XML
                            </button>
                            <button type="button" onClick={() => startCreate(selectedDayIdx)} style={btnAmberSm}>
                                <Plus size={14} /> Bæta við þætti
                            </button>
                        </div>
                    </div>

                    {/* Sync result banner */}
                    {syncResult && (
                        <div
                            style={{
                                marginBottom: '12px',
                                padding: '10px 14px',
                                background: 'rgba(233, 168, 96, 0.08)',
                                border: '1px solid rgba(233, 168, 96, 0.3)',
                                borderRadius: '4px',
                                fontSize: '0.84rem',
                                color: 'var(--admin-text, #eee)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                            }}
                        >
                            <div>
                                <CheckCircle2 size={13} style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: '6px', color: 'var(--admin-accent, #E9A860)' }} />
                                Flutti inn <strong>{syncResult.imported}</strong> þætti
                                {syncResult.skipped_manual > 0 && <> · varðveitti <strong>{syncResult.skipped_manual}</strong> handvirka</>}
                            </div>
                            {syncResult.unlabeled.length > 0 && (
                                <div style={{ paddingTop: '4px', borderTop: '1px solid rgba(233, 168, 96, 0.2)' }}>
                                    <AlertCircle size={13} style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: '6px', color: '#e8a14a' }} />
                                    <strong>{syncResult.unlabeled.length} óþekktar sýningar</strong>, vantar í{' '}
                                    <a href="/admin/programs" style={{ color: 'var(--admin-accent, #E9A860)', textDecoration: 'underline' }}>Sýningarskrá</a>:{' '}
                                    <span style={{ fontStyle: 'italic', color: 'var(--admin-text-muted, #aaa)' }}>
                                        {syncResult.unlabeled.slice(0, 5).join(' · ')}
                                        {syncResult.unlabeled.length > 5 && ` … og ${syncResult.unlabeled.length - 5} fleiri`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <p style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.88rem' }}>
                            <Loader2 size={14} className="admin-spinner" style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '6px' }} />
                            Sæki…
                        </p>
                    ) : (
                        <>
                            {creatingOnDay === selectedDayIdx && (
                                <SlotForm
                                    key="new"
                                    mode="create"
                                    defaultDate={selectedDateIso}
                                    defaultStart="18:00"
                                    defaultEnd="19:00"
                                    onCancel={cancelEditOrCreate}
                                    onSaved={async () => { cancelEditOrCreate(); await load(); }}
                                    onError={setError}
                                />
                            )}

                            {slotsForSelectedDay.length === 0 && creatingOnDay !== selectedDayIdx && (
                                <div style={{ padding: '30px 20px', textAlign: 'center', background: 'var(--admin-surface, #1f1d1a)', border: '1px dashed var(--admin-border, #333)', borderRadius: '6px' }}>
                                    <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.92rem', fontStyle: 'italic' }}>
                                        Engin dagskrá skráð fyrir þennan dag.
                                    </p>
                                </div>
                            )}

                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {slotsForSelectedDay.map((slot) => (
                                    <li key={slot.id}>
                                        {editingId === slot.id ? (
                                            <SlotForm
                                                mode="edit"
                                                slot={slot}
                                                onCancel={cancelEditOrCreate}
                                                onSaved={async () => { cancelEditOrCreate(); await load(); }}
                                                onError={setError}
                                            />
                                        ) : (
                                            <SlotRow slot={slot} onEdit={() => setEditingId(slot.id)} onDelete={() => handleDelete(slot.id)} />
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {error && (
                                <p style={{ color: 'var(--admin-error, #e55)', fontSize: '0.84rem', marginTop: '12px' }}>
                                    {error}
                                </p>
                            )}
                        </>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

// ══════════════════════════════════════════════════════════════════════
// Row (collapsed view)
// ══════════════════════════════════════════════════════════════════════

function SlotRow({ slot, onEdit, onDelete }: { slot: Slot; onEdit: () => void; onDelete: () => void }) {
    const typeLabel = PROGRAM_TYPES.find((t) => t.value === slot.program_type)?.label ?? slot.program_type;
    const startClock = formatClockUtc(slot.starts_at);
    const endClock = formatClockUtc(slot.ends_at);

    return (
        <article
            style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                gap: '14px',
                padding: '12px 16px',
                background: 'var(--admin-surface, #1f1d1a)',
                border: `1px solid ${slot.is_featured ? 'rgba(233, 168, 96, 0.3)' : 'var(--admin-border, #333)'}`,
                borderRadius: '6px',
                alignItems: 'center',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', color: slot.is_featured ? 'var(--admin-accent, #E9A860)' : 'var(--admin-text, #eee)', fontSize: '0.95rem', fontWeight: 600 }}>
                    {startClock}
                </span>
                <span style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', color: 'var(--admin-text-muted, #888)', fontSize: '0.75rem' }}>
                    – {endClock}
                </span>
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-serif, serif)', color: 'var(--admin-text, #eee)', fontSize: '1.02rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {slot.program_title}
                    </h3>
                    {slot.is_live_broadcast && (
                        <span className="type-merki" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D84B3A', fontSize: '0.58rem', letterSpacing: '0.22em', padding: '2px 8px', background: 'rgba(216, 75, 58, 0.14)', border: '1px solid rgba(216, 75, 58, 0.4)', borderRadius: '2px' }}>
                            <Radio size={10} /> BEINT
                        </span>
                    )}
                    {slot.is_featured && (
                        <span className="type-merki" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--admin-accent, #E9A860)', fontSize: '0.58rem', letterSpacing: '0.22em' }}>
                            <Star size={10} /> ÚRVAL
                        </span>
                    )}
                    <span className="type-merki" style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.58rem', letterSpacing: '0.18em' }}>
                        {typeLabel}
                    </span>
                </div>
                {slot.description && (
                    <p style={{ margin: 0, color: 'var(--admin-text-muted, #888)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {slot.description}
                    </p>
                )}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={onEdit} style={btnGhostSm}>Laga</button>
                <button type="button" onClick={onDelete} style={{ ...btnGhostSm, color: 'var(--admin-error, #e55)' }} title="Eyða">
                    <Trash2 size={12} />
                </button>
            </div>
        </article>
    );
}

// ══════════════════════════════════════════════════════════════════════
// Inline form (create + edit)
// ══════════════════════════════════════════════════════════════════════

function SlotForm({
    mode,
    slot,
    defaultDate,
    defaultStart,
    defaultEnd,
    onCancel,
    onSaved,
    onError,
}: {
    mode: 'create' | 'edit';
    slot?: Slot;
    defaultDate?: string;
    defaultStart?: string;
    defaultEnd?: string;
    onCancel: () => void;
    onSaved: () => Promise<void> | void;
    onError: (msg: string | null) => void;
}) {
    const initialDate = slot ? slot.starts_at.slice(0, 10) : (defaultDate ?? isoDate(new Date()));
    const initialStart = slot ? formatClockUtc(slot.starts_at) : (defaultStart ?? '18:00');
    const initialEnd = slot ? formatClockUtc(slot.ends_at) : (defaultEnd ?? '19:00');

    const [date, setDate] = useState<string>(initialDate);
    const [startClock, setStartClock] = useState<string>(initialStart);
    const [endClock, setEndClock] = useState<string>(initialEnd);
    const [title, setTitle] = useState<string>(slot?.program_title ?? '');
    const [subtitle, setSubtitle] = useState<string>(slot?.program_subtitle ?? '');
    const [host, setHost] = useState<string>(slot?.host_name ?? '');
    const [description, setDescription] = useState<string>(slot?.description ?? '');
    const [programType, setProgramType] = useState<ProgramType>((slot?.program_type as ProgramType) ?? 'rerun');
    const [isLive, setIsLive] = useState<boolean>(slot?.is_live_broadcast ?? false);
    const [isFeatured, setIsFeatured] = useState<boolean>(slot?.is_featured ?? false);
    const [episodeId, setEpisodeId] = useState<string | null>(slot?.episode_id ?? null);
    const [episodeOptions, setEpisodeOptions] = useState<EpisodePickerOption[]>([]);
    const [saving, setSaving] = useState(false);

    // Pull recent published episodes once when the form mounts so the
    // optional "Tengt myndband" picker can offer a list without a blank
    // search step. Caps at 50 so the dropdown stays usable.
    useEffect(() => {
        (async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sb = supabase as any;
            const { data } = await sb
                .from('episodes')
                .select('id, title, bunny_video_id, published_at, series:series_id ( title )')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(50);
            type Row = { id: string; title: string; bunny_video_id: string | null; published_at: string | null; series: { title: string } | null };
            setEpisodeOptions(((data ?? []) as Row[]).map((r) => ({
                id: r.id,
                label: r.series?.title ? `${r.series.title} — ${r.title}` : r.title,
                date: r.published_at,
            })));
        })();
    }, []);

    const save = useCallback(async () => {
        setSaving(true);
        onError(null);
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        };

        const payload = {
            starts_at: combineToIso(date, startClock),
            ends_at: combineToIso(date, endClock),
            program_title: title.trim(),
            program_subtitle: subtitle.trim() || null,
            program_type: programType,
            host_name: host.trim() || null,
            description: description.trim() || null,
            is_live_broadcast: isLive,
            is_featured: isFeatured,
            episode_id: episodeId,
        };

        const url = mode === 'edit' && slot
            ? `/api/admin/schedule-slots/${slot.id}`
            : '/api/admin/schedule-slots';
        const method = mode === 'edit' ? 'PATCH' : 'POST';

        const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'Villa' }));
            onError(data.error ?? 'Villa');
            setSaving(false);
            return;
        }
        setSaving(false);
        await onSaved();
    }, [mode, slot, date, startClock, endClock, title, subtitle, programType, host, description, isLive, isFeatured, episodeId, onSaved, onError]);

    return (
        <div
            style={{
                padding: '18px 20px',
                background: 'var(--admin-surface, #1f1d1a)',
                border: '1px solid var(--admin-accent, #E9A860)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
            }}
        >
            {/* Row 1: time + date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: '10px', alignItems: 'end' }}>
                <FieldCompact label="Dagur">
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
                </FieldCompact>
                <FieldCompact label="Byrjar">
                    <input type="time" value={startClock} onChange={(e) => setStartClock(e.target.value)} style={inputStyle} required />
                </FieldCompact>
                <FieldCompact label="Endar">
                    <input type="time" value={endClock} onChange={(e) => setEndClock(e.target.value)} style={{ ...inputStyle, maxWidth: '120px' }} required />
                </FieldCompact>
            </div>

            {/* Row 2: title + type */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <FieldCompact label="Þáttur (titill)">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="t.d. Bænakvöld" style={inputStyle} required />
                </FieldCompact>
                <FieldCompact label="Tegund">
                    <select value={programType} onChange={(e) => setProgramType(e.target.value as ProgramType)} style={inputStyle}>
                        {PROGRAM_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                </FieldCompact>
            </div>

            {/* Row 3: host + subtitle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FieldCompact label="Gestgjafi (valfr.)">
                    <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="t.d. Eiríkur Sigurbjörnsson" style={inputStyle} />
                </FieldCompact>
                <FieldCompact label="Undirtitill (valfr.)">
                    <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="t.d. Þáttur 12" style={inputStyle} />
                </FieldCompact>
            </div>

            {/* Row 4: description */}
            <FieldCompact label="Lýsing (ein lína)">
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Stutt lýsing sem birtist við þátturinn" style={inputStyle} />
            </FieldCompact>

            {/* Row 5: flags */}
            <div style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--admin-text, #eee)', fontSize: '0.88rem' }}>
                    <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--admin-accent, #E9A860)' }} />
                    <Radio size={13} /> Bein útsending
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--admin-text, #eee)', fontSize: '0.88rem' }}>
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--admin-accent, #E9A860)' }} />
                    <Star size={13} /> Úrvalsþáttur (áhersla)
                </label>
            </div>

            {/* Row 6: optional VOD episode link.
                When set, this slot points at the published episode so the
                live broadcast and the on-demand version are connected.
                Leave empty for slots that don't have a VOD counterpart yet. */}
            <FieldCompact label="Tengt myndband (valfrjálst)">
                <select
                    value={episodeId ?? ''}
                    onChange={(e) => setEpisodeId(e.target.value || null)}
                    style={inputStyle}
                >
                    <option value="">— ekkert tengt —</option>
                    {episodeOptions.map((ep) => (
                        <option key={ep.id} value={ep.id}>
                            {ep.label}
                            {ep.date ? ` (${new Date(ep.date).toLocaleDateString('is-IS')})` : ''}
                        </option>
                    ))}
                </select>
            </FieldCompact>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid var(--admin-border, #333)' }}>
                <button type="button" onClick={onCancel} style={btnGhost}>
                    <X size={14} /> Hætta við
                </button>
                <button type="button" onClick={save} disabled={saving || !title.trim()} style={{ ...btnAmber, opacity: saving || !title.trim() ? 0.5 : 1 }}>
                    {saving ? <Loader2 size={14} className="admin-spinner" /> : (mode === 'edit' ? <Save size={14} /> : <CheckCircle2 size={14} />)}
                    {mode === 'edit' ? 'Vista breytingar' : 'Bæta við'}
                </button>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════
// Shared styles
// ══════════════════════════════════════════════════════════════════════

function FieldCompact({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ color: 'var(--admin-text-muted, #888)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
            {children}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    background: 'var(--admin-bg, #14120F)',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    outline: 'none',
    minWidth: 0,
};

const btnGhost: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
};

const btnGhostSm: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid var(--admin-border, #333)',
    borderRadius: '4px',
    color: 'var(--admin-text, #eee)',
    fontSize: '0.74rem',
    fontWeight: 600,
    cursor: 'pointer',
};

const btnAmber: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '4px',
    color: '#14120F',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
};

const btnAmberSm: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'var(--admin-accent, #E9A860)',
    border: '1px solid var(--admin-accent, #E9A860)',
    borderRadius: '4px',
    color: '#14120F',
    fontSize: '0.76rem',
    fontWeight: 700,
    cursor: 'pointer',
};
