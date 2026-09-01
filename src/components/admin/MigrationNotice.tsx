'use client';

import { Database } from 'lucide-react';

/**
 * "Keyrðu SQL-ið fyrst" — the honest state of an admin screen whose migration
 * has not been applied yet.
 *
 * The prayer ministry ships before its SQL runs (no DB password on the build
 * machine), so this is a real state, not a defensive stub. It names the file,
 * says where to paste it, and says plainly what still works meanwhile — a
 * producer who finds this mid-program needs a next step, not an error code.
 */

interface Props {
    /** The migration file to run, relative to the repo root. */
    file: string;
    /** What this particular screen needs it for. */
    what: string;
    /** What keeps working without it. */
    meanwhile?: string;
}

export default function MigrationNotice({ file, what, meanwhile }: Props) {
    return (
        <div className="admin-card max-w-2xl">
            <div className="flex items-start gap-3">
                <Database size={20} className="text-[var(--admin-warning)] mt-0.5 flex-shrink-0" />
                <div>
                    <h2 className="admin-h3 mb-1">Keyrðu SQL-ið fyrst</h2>
                    <p className="admin-body text-sm">
                        {what} Opnaðu Supabase → SQL Editor og keyrðu skrána
                        {' '}
                        <code className="px-1.5 py-0.5 rounded bg-[var(--admin-surface-hover)] text-xs font-mono text-[var(--admin-accent)]">
                            {file}
                        </code>
                        {' '}
                        einu sinni.
                        {meanwhile ? ` ${meanwhile}` : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
