import fs from 'fs/promises';
import path from 'path';

export interface Newsletter {
    id: string;
    title: string;
    date: string;
    author: string;
    content: string; // Markdown or simple text
}

const DB_PATH = path.join(process.cwd(), 'data', 'newsletters.json');

export async function getNewsletters(): Promise<Newsletter[]> {
    try {
        await fs.access(DB_PATH);
        const data = await fs.readFile(DB_PATH, 'utf-8');
        const items = JSON.parse(data);
        return items.sort((a: Newsletter, b: Newsletter) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
        return [];
    }
}
