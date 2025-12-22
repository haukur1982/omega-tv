import fs from 'fs/promises';
import path from 'path';

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
        // We do not throw, to keep the UI valid for the user session
    }
}

async function ensureDB() {
    try {
        await fs.access(DB_PATH);
    } catch {
        try {
            // Create dir if needed
            await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
            // Create empty array
            await fs.writeFile(DB_PATH, '[]', 'utf-8');
        } catch (e) {
            console.warn("Could not create DB file:", e);
        }
    }
}

export async function getPrayers(): Promise<Prayer[]> {
    await ensureDB();
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        const prayers = JSON.parse(data);
        // Sort by timestamp desc (newest first)
        return prayers.sort((a: Prayer, b: Prayer) => b.timestamp - a.timestamp);
    } catch (e) {
        console.warn("Could not read DB:", e);
        return [];
    }
}

export async function addPrayer(prayer: Omit<Prayer, 'id' | 'timestamp' | 'prayCount' | 'isAnswered'>): Promise<Prayer> {
    await ensureDB();
    // Default to empty if read fails
    let prayers: Prayer[] = [];
    try {
        prayers = await getPrayers();
    } catch (e) { }

    const newPrayer: Prayer = {
        ...prayer,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        prayCount: 0,
        isAnswered: false,
    };

    prayers.unshift(newPrayer);

    // Limit to last 500 prayers to prevent file bloat
    const trimmed = prayers.slice(0, 500);

    await safeWrite(trimmed);
    return newPrayer;
}

export async function incrementPrayCount(id: string): Promise<number | null> {
    await ensureDB();
    let prayers: Prayer[] = [];
    try {
        prayers = await getPrayers();
    } catch (e) { return null; }

    const index = prayers.findIndex(p => p.id === id);

    if (index === -1) return null;

    prayers[index].prayCount += 1;
    await safeWrite(prayers);

    return prayers[index].prayCount;
}
