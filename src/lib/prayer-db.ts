import { supabase, supabaseAdmin } from './supabase';

export interface Prayer {
    id: string;
    name: string;
    email?: string;
    topic: string;
    content: string;
    categoryType: string;
    timestamp: number;
    prayCount: number;
    isAnswered: boolean;
    isApproved: boolean;
}

export interface PrayerCampaign {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
    prayCount: number;
    createdAt: string;
}

function mapPrayer(row: any): Prayer {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        topic: row.topic,
        content: row.content,
        categoryType: row.category_type || 'personal',
        timestamp: new Date(row.created_at).getTime(),
        prayCount: row.pray_count || 0,
        isAnswered: row.is_answered || false,
        isApproved: row.is_approved || false,
    };
}

function mapCampaign(row: any): PrayerCampaign {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.image_url,
        startDate: row.start_date,
        endDate: row.end_date,
        isActive: row.is_active,
        prayCount: row.pray_count || 0,
        createdAt: row.created_at,
    };
}

// ===== PRAYERS =====

export async function getPrayers(filters?: { topic?: string; categoryType?: string }): Promise<Prayer[]> {
    let query = supabase
        .from('prayers')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (filters?.topic) query = query.eq('topic', filters.topic);
    if (filters?.categoryType) query = query.eq('category_type', filters.categoryType);

    const { data, error } = await query;
    if (error) { console.error("Failed to fetch prayers:", error); return []; }
    return (data || []).map(mapPrayer);
}

export async function getAllPrayers(): Promise<Prayer[]> {
    const { data, error } = await supabaseAdmin
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error("Failed to fetch all prayers:", error); return []; }
    return (data || []).map(mapPrayer);
}

export async function addPrayer(prayer: {
    name: string;
    email?: string;
    topic: string;
    content: string;
    categoryType?: string;
    autoApprove?: boolean;
}): Promise<Prayer | null> {
    const { data, error } = await supabase
        .from('prayers')
        .insert([{
            name: prayer.name,
            email: prayer.email,
            topic: prayer.topic,
            content: prayer.content,
            category_type: prayer.categoryType || 'personal',
            pray_count: 0,
            is_approved: prayer.autoApprove || false,
            is_answered: false,
        }])
        .select()
        .single();

    if (error) { console.error("Failed to add prayer:", error); return null; }
    return mapPrayer(data);
}

export async function incrementPrayCount(id: string): Promise<number | null> {
    const { data: current } = await supabase
        .from('prayers')
        .select('pray_count')
        .eq('id', id)
        .single();
    if (!current) return null;

    const newCount = (current.pray_count || 0) + 1;
    const { error } = await supabase
        .from('prayers')
        .update({ pray_count: newCount })
        .eq('id', id);
    if (error) return null;
    return newCount;
}

export async function approvePrayer(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .update({ is_approved: true })
        .eq('id', id);
    return !error;
}

export async function markPrayerAnswered(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .update({ is_answered: true })
        .eq('id', id);
    return !error;
}

export async function deletePrayer(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('prayers')
        .delete()
        .eq('id', id);
    return !error;
}

export async function getTotalPrayCount(): Promise<number> {
    const { data, error } = await supabase
        .from('prayers')
        .select('pray_count')
        .eq('is_approved', true);
    if (error || !data) return 0;
    return data.reduce((sum: number, row: any) => sum + (row.pray_count || 0), 0);
}

// ===== CAMPAIGNS =====

export async function getActiveCampaigns(): Promise<PrayerCampaign[]> {
    const { data, error } = await supabase
        .from('prayer_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) { console.error("Failed to fetch campaigns:", error); return []; }
    return (data || []).map(mapCampaign);
}

export async function getAllCampaigns(): Promise<PrayerCampaign[]> {
    const { data, error } = await supabaseAdmin
        .from('prayer_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error("Failed to fetch campaigns:", error); return []; }
    return (data || []).map(mapCampaign);
}

export async function createCampaign(campaign: {
    title: string;
    description?: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
}): Promise<PrayerCampaign | null> {
    const { data, error } = await supabaseAdmin
        .from('prayer_campaigns')
        .insert([{
            title: campaign.title,
            description: campaign.description,
            image_url: campaign.imageUrl,
            start_date: campaign.startDate,
            end_date: campaign.endDate,
            is_active: true,
            pray_count: 0,
        }])
        .select()
        .single();
    if (error) { console.error("Failed to create campaign:", error); return null; }
    return mapCampaign(data);
}

export async function incrementCampaignPrayCount(id: string): Promise<number | null> {
    const { data: current } = await supabase
        .from('prayer_campaigns')
        .select('pray_count')
        .eq('id', id)
        .single();
    if (!current) return null;

    const newCount = (current.pray_count || 0) + 1;
    const { error } = await supabaseAdmin
        .from('prayer_campaigns')
        .update({ pray_count: newCount })
        .eq('id', id);
    if (error) return null;
    return newCount;
}
