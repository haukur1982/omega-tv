import { supabase, supabaseAdmin } from './supabase';

/**
 * Query helpers for the `programs` enrichment catalog.
 *
 * A `program` is a reusable show template — title + program_type +
 * host + description + default flags. The daily XML importer matches
 * each scheduled slot's title against this table to enrich bare
 * schedule data (time + title from playout) into rich UI metadata.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sbAdmin = supabaseAdmin as any;

export type Program = {
    id: string;
    title: string;
    program_type: string;
    host_name: string | null;
    description: string | null;
    is_usually_live: boolean;
    is_featured_default: boolean;
    default_bible_ref: string | null;
    default_tags: string[];
    series_id: string | null;
    created_at: string;
    updated_at: string;
};

export async function getAllPrograms(): Promise<Program[]> {
    const { data, error } = await sb
        .from('programs')
        .select('*')
        .order('title', { ascending: true });
    if (error || !data) return [];
    return data as Program[];
}

/**
 * Build a title → Program map for fast enrichment lookups.
 * Title keys are normalized (trimmed, lowercased) to be resilient to
 * whitespace / case drift in XML sources.
 */
export async function buildEnrichmentMap(): Promise<Map<string, Program>> {
    const all = await getAllPrograms();
    const map = new Map<string, Program>();
    for (const p of all) map.set(normalizeTitle(p.title), p);
    return map;
}

export function normalizeTitle(title: string): string {
    return title.trim().toLocaleLowerCase('is');
}

export async function getProgramByTitle(title: string): Promise<Program | null> {
    const { data, error } = await sbAdmin
        .from('programs')
        .select('*')
        .eq('title', title.trim())
        .maybeSingle();
    if (error || !data) return null;
    return data as Program;
}

/**
 * Given a title from the XML and the enrichment map, return the
 * fields to apply to a schedule_slots row (program_type, host, etc.).
 * Returns sensible defaults when no program is defined (program_type
 * 'rerun' is a safe neutral).
 */
export function enrichSlotFromTitle(
    title: string,
    programs: Map<string, Program>,
): {
    program_type: string;
    host_name: string | null;
    description: string | null;
    is_live_broadcast: boolean;
    is_featured: boolean;
    series_id: string | null;
} {
    const p = programs.get(normalizeTitle(title));
    if (!p) {
        return {
            program_type: 'rerun',
            host_name: null,
            description: null,
            is_live_broadcast: false,
            is_featured: false,
            series_id: null,
        };
    }
    return {
        program_type: p.program_type,
        host_name: p.host_name,
        description: p.description,
        is_live_broadcast: p.is_usually_live,
        is_featured: p.is_featured_default,
        series_id: p.series_id,
    };
}
