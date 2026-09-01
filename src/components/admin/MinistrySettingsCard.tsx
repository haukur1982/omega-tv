'use client';

import { useEffect, useState } from 'react';
import { Phone, Radio, Save } from 'lucide-react';
import { authedFetch } from '@/lib/admin-fetch';
import {
    EMPTY_MINISTRY_SETTINGS,
    PRAYER_MINISTRY_MIGRATION,
    type MinistrySettings,
} from '@/lib/ministry-shared';
import MigrationNotice from './MigrationNotice';

/**
 * Bænaþjónustan — the four values the public wall and the broadcast share.
 *
 * The number here is the number said out loud on air and printed under the
 * cover on /baenatorg. Leave it empty and the panel on the wall disappears
 * entirely: better no door than a door with no handle.
 */

export default function MinistrySettingsCard() {
    const [settings, setSettings] = useState<MinistrySettings>(EMPTY_MINISTRY_SETTINGS);
    const [missing, setMissing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        authedFetch('/api/admin/ministry-settings')
            .then(async (res) => {
                if (!res.ok) throw new Error(`Server svaraði ${res.status}`);
                const d = await res.json();
                setMissing(!!d.missing);
                if (d.settings) setSettings(d.settings);
            })
            .catch((e) => setError(e instanceof Error ? e.message : 'Tókst ekki að sækja stillingar'))
            .finally(() => setIsLoading(false));
    }, []);

    const patch = (next: Partial<MinistrySettings>) => {
        setSettings((s) => ({ ...s, ...next }));
        setSaved(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        const res = await authedFetch('/api/admin/ministry-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            if (d?.missing) setMissing(true);
            setError(d?.error ?? `Vistun mistókst (${res.status})`);
        } else {
            setSaved(true);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="admin-card mb-6">
                <div className="h-5 w-1/3 admin-skeleton" />
            </div>
        );
    }

    if (missing) {
        return (
            <div className="mb-6">
                <MigrationNotice
                    file={PRAYER_MINISTRY_MIGRATION}
                    what="Bænasíminn og bænastundirnar geymast í nýrri töflu sem er ekki komin í gagnagrunninn."
                    meanwhile="Bænatorgið sýnir einfaldlega engan símapanel á meðan."
                />
            </div>
        );
    }

    return (
        <div className="admin-card mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-subtle)] flex items-center justify-center">
                    <Phone size={20} className="text-[var(--admin-accent)]" />
                </div>
                <div>
                    <h2 className="admin-h3">Bænaþjónustan</h2>
                    <p className="admin-caption">Síminn og bænastundirnar — birtist á bænatorginu.</p>
                </div>
            </div>

            <div className="grid gap-5">
                <div>
                    <label htmlFor="ms-phone" className="admin-label block mb-2">Símanúmer bænasímans</label>
                    <input
                        id="ms-phone"
                        type="tel"
                        value={settings.prayerPhone}
                        onChange={(e) => patch({ prayerPhone: e.target.value })}
                        placeholder="t.d. 5551234"
                        className="admin-input"
                        style={{ minHeight: '48px' }}
                    />
                    <p className="admin-caption mt-1">
                        Sé þetta autt birtist enginn símapanel á bænatorginu.
                    </p>
                </div>

                <div>
                    <label htmlFor="ms-hours" className="admin-label block mb-2">Opnunartími</label>
                    <input
                        id="ms-hours"
                        type="text"
                        value={settings.phoneHours}
                        onChange={(e) => patch({ phoneHours: e.target.value })}
                        placeholder="t.d. mán–fim kl. 20–22"
                        className="admin-input"
                        style={{ minHeight: '48px' }}
                    />
                </div>

                <div>
                    <label htmlFor="ms-note" className="admin-label block mb-2">Um bænastundirnar</label>
                    <input
                        id="ms-note"
                        type="text"
                        value={settings.scheduleNote}
                        onChange={(e) => patch({ scheduleNote: e.target.value })}
                        placeholder="t.d. Bænastund í beinni alla fimmtudaga kl. 20."
                        className="admin-input"
                        style={{ minHeight: '48px' }}
                    />
                </div>

                <label
                    htmlFor="ms-live"
                    className="flex items-start gap-3 p-4 rounded-lg border border-[var(--admin-border)] cursor-pointer"
                >
                    <input
                        id="ms-live"
                        type="checkbox"
                        checked={settings.liveNow}
                        onChange={(e) => patch({ liveNow: e.target.checked })}
                        className="mt-0.5 flex-shrink-0"
                        style={{ width: '22px', height: '22px', accentColor: 'var(--admin-accent)' }}
                    />
                    <span>
                        <span className="flex items-center gap-2 text-sm font-medium text-[var(--admin-text)]">
                            <Radio size={15} />
                            Bænastund er í beinni núna
                        </span>
                        <span className="block admin-caption mt-1">
                            Kveikir á heitum borða efst á bænatorginu: „Við biðjum með þér núna. Hringdu.“
                            Mundu að slökkva á honum þegar þættinum lýkur.
                        </span>
                    </span>
                </label>

                {error && (
                    <div className="rounded-lg border border-[var(--admin-error)] bg-[var(--admin-error-subtle)] p-3">
                        <p className="admin-body text-sm">{error}</p>
                    </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="admin-btn admin-btn-primary disabled:opacity-50"
                        style={{ minHeight: '48px' }}
                    >
                        <Save size={16} />
                        {isSaving ? 'Vista…' : 'Vista'}
                    </button>
                    {saved && <span className="admin-caption">Vistað. Bænatorgið sýnir þetta strax.</span>}
                </div>
            </div>
        </div>
    );
}
