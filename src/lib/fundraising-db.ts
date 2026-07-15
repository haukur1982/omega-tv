import { supabaseAdmin } from '@/lib/supabase';
import type { ProjectItem, PublicGift, ProjectUpdate } from '@/lib/fundraising-shared';

/**
 * Fundraising data layer — vision projects (first: Nýtt stúdíó).
 * SERVER-ONLY (imports supabaseAdmin). Client components must import
 * types + formatIsk from fundraising-shared.ts instead.
 *
 * All three tables are RLS-locked with no public policies: reads happen
 * HERE, server-side, and only sanitized aggregates ever reach the page.
 * A donor's name is exposed only when they explicitly opted in
 * (show_name=true); everyone else renders as "Nafnlaus".
 */

export type { ProjectItem, PublicGift, ProjectUpdate };

export interface FundraisingProject {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    goal_isk: number;
    items: ProjectItem[];
    status: 'draft' | 'active' | 'completed';
}

export interface ProjectProgress {
    project: FundraisingProject;
    raised_isk: number;
    gift_count: number;
    last_gift_at: string | null;
    recent_gifts: PublicGift[];
    updates: ProjectUpdate[];
}

// Generated Supabase types don't include these tables yet — same cast
// pattern as daily-word-db.ts / featured-prayer-db.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabaseAdmin as any;

function normalizeItems(raw: unknown): ProjectItem[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((i) => i && typeof i === 'object' && typeof (i as ProjectItem).label === 'string')
        .map((i) => ({
            key: String((i as ProjectItem).key ?? ''),
            label: String((i as ProjectItem).label),
            amount_isk: Number((i as ProjectItem).amount_isk) || 0,
            note: typeof (i as ProjectItem).note === 'string' ? (i as ProjectItem).note : undefined,
        }));
}

export async function getProjectProgress(slug: string): Promise<ProjectProgress | null> {
    const { data: project } = await sb
        .from('fundraising_projects')
        .select('id, slug, title, subtitle, goal_isk, items, status')
        .eq('slug', slug)
        .maybeSingle();
    if (!project) return null;

    const [{ data: gifts }, { data: updates }] = await Promise.all([
        sb
            .from('fundraising_gifts')
            .select('amount_isk, given_at, donor_name, show_name')
            .eq('project_id', project.id)
            .order('given_at', { ascending: false })
            .order('created_at', { ascending: false }),
        sb
            .from('fundraising_updates')
            .select('id, title, body, published_at')
            .eq('project_id', project.id)
            .order('published_at', { ascending: false })
            .limit(6),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (gifts ?? []) as any[];
    const raised = rows.reduce((sum, g) => sum + (Number(g.amount_isk) || 0), 0);

    return {
        project: {
            id: project.id,
            slug: project.slug,
            title: project.title,
            subtitle: project.subtitle,
            goal_isk: Number(project.goal_isk) || 0,
            items: normalizeItems(project.items),
            status: project.status,
        },
        raised_isk: raised,
        gift_count: rows.length,
        last_gift_at: rows.length > 0 ? rows[0].given_at : null,
        recent_gifts: rows.slice(0, 8).map((g) => ({
            amount_isk: Number(g.amount_isk) || 0,
            given_at: g.given_at,
            donor_name: g.show_name && g.donor_name ? String(g.donor_name) : null,
        })),
        updates: (updates ?? []) as ProjectUpdate[],
    };
}
