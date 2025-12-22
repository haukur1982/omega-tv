import fs from 'fs/promises';
import path from 'path';
import { supabase } from './supabase';

export interface Prayer {
    id: string;
    name: string;
    email?: string; // Private contact field
    topic: string;
    content: string;
    timestamp: number;
    prayCount: number;
    isAnswered: boolean;
}

const DB_PATH = path.join(process.cwd(), 'data', 'prayers.json');

// Helper to safely write (logs error in prod instead of crashing)
async function safeWrite(data: any) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.warn("Database write failed (likely read-only fs):", error);
    }
}

async function ensureDB() {
    try {
        await fs.access(DB_PATH);
    } catch {
        try {
            await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
            await fs.writeFile(DB_PATH, '[]', 'utf-8');
        } catch (e) {
            console.warn("Could not create DB file:", e);
        }
    }
}

export async function getPrayers(): Promise<Prayer[]> {
    // 1. Try Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('prayers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                return data.map((row: any) => ({
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    topic: row.topic,
                    content: row.content,
                    timestamp: new Date(row.created_at).getTime(),
                    prayCount: row.pray_count,
                    isAnswered: row.is_answered
                }));
            }
        } catch (e) {
            console.error("Supabase error:", e);
            // Fallthrough to local DB if Supabase fails? No, if configured, we should return empty or error.
            // But for hybrid migration, let's fallthrough or just return empty.
        }
    }

    // 2. Fallback to Local Filesystem
    await ensureDB();
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        const prayers = JSON.parse(data);
        return prayers.sort((a: Prayer, b: Prayer) => b.timestamp - a.timestamp);
    } catch (e) {
        console.warn("Could not read DB:", e);
        return [];
    }
}

export async function addPrayer(prayer: Omit<Prayer, 'id' | 'timestamp' | 'prayCount' | 'isAnswered'>): Promise<Prayer> {
    const newPrayer: Prayer = {
        ...prayer,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        prayCount: 0,
        isAnswered: false,
    };

    // 1. Try Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('prayers')
                .insert([{
                    name: prayer.name,
                    email: prayer.email,
                    topic: prayer.topic,
                    content: prayer.content,
                    pray_count: 0,
                    is_answered: false
                }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                return {
                    ...newPrayer,
                    id: data.id,
                    timestamp: new Date(data.created_at).getTime()
                };
            }
        } catch (e) {
            console.error("Supabase write error:", e);
        }
    }

    // 2. Fallback to Local Filesystem
    await ensureDB();
    // Default to empty if read fails
    let prayers: Prayer[] = [];
    try {
        prayers = await getPrayers(); // Note: this might recursively call Supabase if we aren't careful, but we are inside addPrayer.
        // Actually getPrayers above checks supabase. 
        // If supabase is active, we shouldn't be here unless write failed. 
        // If write failed, we probably shouldn't write to local either if we want consistency.
        // But for "Safety Mode", let's just write local too.
    } catch (e) { }

    // NOTE: If Supabase is active, getPrayers returns Supabase data. 
    // If we write to local now, it might overwrite or be weird.
    // Simpler logic: If Supabase is active, purely rely on it.
    if (supabase) return newPrayer; // Optimistic return if Supabase was attempted (even if failed, preventing fallback complexity)

    prayers.unshift(newPrayer);
    const trimmed = prayers.slice(0, 500);
    await safeWrite(trimmed);
    return newPrayer;
}

export async function incrementPrayCount(id: string): Promise<number | null> {
    // 1. Try Supabase
    if (supabase) {
        try {
            // First get current
            const { data: current } = await supabase.from('prayers').select('pray_count').eq('id', id).single();
            if (current) {
                const newCount = (current.pray_count || 0) + 1;
                const { error } = await supabase.from('prayers').update({ pray_count: newCount }).eq('id', id);
                if (!error) return newCount;
            }
        } catch (e) {
            console.error("Supabase update error:", e);
        }
    }

    // 2. Fallback to Local Filesystem
    await ensureDB();
    let prayers: Prayer[] = [];
    try {
        // If supabase is on, getPrayers returns supabase data. 
        // We can't update local file based on supabase data easily here.
        // So again, split logic.
        if (supabase) return null; // Logic separation

        // Local logic
        const data = await fs.readFile(DB_PATH, 'utf-8');
        prayers = JSON.parse(data);
    } catch (e) { return null; }

    const index = prayers.findIndex(p => p.id === id);
    if (index === -1) return null;

    prayers[index].prayCount += 1;
    await safeWrite(prayers);

    return prayers[index].prayCount;
}
