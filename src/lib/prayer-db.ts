import fs from 'fs/promises';
import path from 'path';

export interface Prayer {
    id: string;
    name: string;
    topic: string;
    content: string;
    timestamp: number;
    prayCount: number;
    isAnswered: boolean;
}

const DB_PATH = path.join(process.cwd(), 'data', 'prayers.json');

async function ensureDB() {
    try {
        await fs.access(DB_PATH);
    } catch {
        // Create dir if needed
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        // Create empty array
        await fs.writeFile(DB_PATH, '[]', 'utf-8');
    }
}

export async function getPrayers(): Promise<Prayer[]> {
    await ensureDB();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    try {
        const prayers = JSON.parse(data);
        // Sort by timestamp desc (newest first)
        return prayers.sort((a: Prayer, b: Prayer) => b.timestamp - a.timestamp);
    } catch {
        return [];
    }
}

export async function addPrayer(prayer: Omit<Prayer, 'id' | 'timestamp' | 'prayCount' | 'isAnswered'>): Promise<Prayer> {
    await ensureDB();
    const prayers = await getPrayers();

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

    await fs.writeFile(DB_PATH, JSON.stringify(trimmed, null, 2), 'utf-8');
    return newPrayer;
}

export async function incrementPrayCount(id: string): Promise<number | null> {
    await ensureDB();
    const prayers = await getPrayers();
    const index = prayers.findIndex(p => p.id === id);

    if (index === -1) return null;

    prayers[index].prayCount += 1;
    await fs.writeFile(DB_PATH, JSON.stringify(prayers, null, 2), 'utf-8');

    return prayers[index].prayCount;
}
