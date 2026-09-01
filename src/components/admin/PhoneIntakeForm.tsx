'use client';

import { useState } from 'react';
import { Phone, Save, X } from 'lucide-react';
import { authedFetch } from '@/lib/admin-fetch';
import { PRAYER_TAG_OPTIONS } from '@/lib/prayer-categories';
import { PRAYER_MINISTRY_MIGRATION } from '@/lib/ministry-shared';
import MigrationNotice from './MigrationNotice';

/**
 * "Skrá bæn úr síma" — the volunteer's intake form.
 *
 * Someone is on the phone RIGHT NOW, often an older caller who has waited to
 * ring. So this is built for one hand and no thought: a panel in the page (no
 * modal over a modal), targets big enough to hit while holding a handset, and
 * the three consents laid out as things you say out loud and tick as they are
 * answered. The email field only exists once "má hafa samband" is ticked —
 * there is no way to capture an address the caller did not agree to give.
 *
 * The prayer lands in the same queue as a web prayer, unapproved, with
 * source='simi'. Same basket, same moderation, same rules.
 */

interface Props {
    /** null = unknown; false = the ministry migration is not applied yet. */
    ministryReady: boolean | null;
    onSaved: () => void;
    onCancel: () => void;
}

export default function PhoneIntakeForm({ ministryReady, onSaved, onCancel }: Props) {
    const [name, setName] = useState('');
    const [tagId, setTagId] = useState(PRAYER_TAG_OPTIONS[0].id);
    const [content, setContent] = useState('');
    const [publishConsent, setPublishConsent] = useState(false);
    const [airConsent, setAirConsent] = useState(false);
    const [contactConsent, setContactConsent] = useState(false);
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (ministryReady === false) {
        return (
            <div className="mb-6">
                <MigrationNotice
                    file={PRAYER_MINISTRY_MIGRATION}
                    what="Símaskráning geymir hvað hringjandinn leyfði, og þeir dálkar eru ekki komnir í gagnagrunninn."
                    meanwhile="Bænir af vefnum berast áfram eðlilega á meðan."
                />
            </div>
        );
    }

    const canSave = content.trim().length > 0 && !isSaving;

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        setError(null);

        const tag = PRAYER_TAG_OPTIONS.find((t) => t.id === tagId) ?? PRAYER_TAG_OPTIONS[0];
        const res = await authedFetch('/api/admin/prayers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'phone',
                name: name.trim(),
                topic: tag.label,
                categoryType: tag.categoryType,
                content: content.trim(),
                publishConsent,
                airConsent,
                contactConsent,
                email: contactConsent ? email.trim() : '',
            }),
        });

        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            setError(d?.error ?? `Vistun mistókst (${res.status})`);
            setIsSaving(false);
            return;
        }

        const d = await res.json().catch(() => ({}));
        if (d?.ready === false) {
            // Saved, but the consent columns don't exist yet, so the ticks did
            // NOT persist. Say so rather than let a volunteer believe otherwise.
            setError(
                'Bænin er skráð, en samþykkin vistuðust EKKI — SQL-ið er ekki keyrt. '
                + 'Skrifaðu hjá þér hvað hringjandinn leyfði.',
            );
            setIsSaving(false);
            return;
        }

        setIsSaving(false);
        onSaved();
    };

    return (
        <div className="admin-card mb-6 border-l-2 border-l-[var(--admin-accent)]">
            <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-subtle)] flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-[var(--admin-accent)]" />
                    </div>
                    <div>
                        <h2 className="admin-h3">Bæn úr síma</h2>
                        <p className="admin-caption">Skrifaðu bænina meðan þú talar við viðkomandi.</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                    aria-label="Loka"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="grid gap-5">
                <div>
                    <label htmlFor="phone-name" className="admin-label block mb-2">Nafn</label>
                    <input
                        id="phone-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Skildu eftir autt ef hringjandinn vill vera nafnlaus"
                        className="admin-input"
                        style={{ minHeight: '48px' }}
                    />
                </div>

                <div>
                    <span className="admin-label block mb-2">Flokkur</span>
                    <div className="flex flex-wrap gap-2">
                        {PRAYER_TAG_OPTIONS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTagId(t.id)}
                                className={`admin-btn ${tagId === t.id ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                                style={{ minHeight: '44px' }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="phone-content" className="admin-label block mb-2">Bænaefnið</label>
                    <textarea
                        id="phone-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value.slice(0, 500))}
                        rows={5}
                        placeholder="Það sem hringjandinn ber fram…"
                        className="admin-input"
                        style={{ minHeight: '140px', resize: 'vertical', fontSize: '16px', lineHeight: 1.6 }}
                    />
                    <p className="admin-caption mt-1 text-right">{content.length} / 500</p>
                </div>

                {/* The three questions, in the order they are asked out loud. */}
                <fieldset className="rounded-lg border border-[var(--admin-border)] p-4">
                    <legend className="admin-label px-2">Spurðu hringjandann</legend>

                    <ConsentRow
                        id="c-publish"
                        checked={publishConsent}
                        onChange={setPublishConsent}
                        title="Má birta bænina á vefnum?"
                        note="Án nafns ef viðkomandi vill. Sé þetta ósvarað fer bænin aldrei á bænatorgið."
                    />
                    <ConsentRow
                        id="c-air"
                        checked={airConsent}
                        onChange={setAirConsent}
                        title="Má biðja fyrir henni í útsendingu?"
                        note="Aðeins þá kemst bænin í bunkann fyrir bænastund."
                    />
                    <ConsentRow
                        id="c-contact"
                        checked={contactConsent}
                        onChange={setContactConsent}
                        title="Má hafa samband um bænina?"
                        note="Spurðu um netfang aðeins ef svarið er já."
                    />

                    {contactConsent && (
                        <div className="mt-3 pl-9">
                            <label htmlFor="phone-email" className="admin-label block mb-2">Netfang</label>
                            <input
                                id="phone-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nafn@example.is"
                                className="admin-input"
                                style={{ minHeight: '48px' }}
                            />
                        </div>
                    )}
                </fieldset>

                {error && (
                    <div className="rounded-lg border border-[var(--admin-error)] bg-[var(--admin-error-subtle)] p-3">
                        <p className="admin-body text-sm">{error}</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className="admin-btn admin-btn-primary disabled:opacity-50"
                        style={{ minHeight: '52px', fontSize: '15px' }}
                    >
                        <Save size={17} />
                        {isSaving ? 'Vista…' : 'Skrá bænina'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="admin-btn admin-btn-secondary"
                        style={{ minHeight: '52px' }}
                    >
                        Hætta við
                    </button>
                </div>

                <p className="admin-caption">
                    Bænin fer í sömu röð og bænir af vefnum og bíður samþykkis.
                </p>
            </div>
        </div>
    );
}

function ConsentRow({
    id,
    checked,
    onChange,
    title,
    note,
}: {
    id: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    title: string;
    note: string;
}) {
    return (
        <label
            htmlFor={id}
            className="flex items-start gap-3 py-3 cursor-pointer"
            style={{ minHeight: '44px' }}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-1 flex-shrink-0"
                style={{ width: '22px', height: '22px', accentColor: 'var(--admin-accent)' }}
            />
            <span>
                <span className="block text-sm font-medium text-[var(--admin-text)]">{title}</span>
                <span className="block admin-caption mt-0.5">{note}</span>
            </span>
        </label>
    );
}
