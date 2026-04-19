/**
 * src/lib/schedule-xml.ts
 *
 * Parse + fetch the daily broadcast schedule XML that the Omega playout
 * system posts to FTP. The cable network reads the same file; the
 * website imports it to populate schedule_slots.
 *
 * XML format (see sample_schedule.xml):
 *
 *   <?xml version="1.0" encoding="UTF-8"?>
 *   <dataroot generated="2026-01-07T22:58:27">
 *     <_x0032_026_01_12_00_00_00>
 *       <ID>1</ID>
 *       <Start_x0020_time>00:00</Start_x0020_time>
 *       <Title>Þjóðsöngur </Title>
 *     </_x0032_026_01_12_00_00_00>
 *     ...
 *   </dataroot>
 *
 * Quirks:
 *   - Repeated child element name encodes the filename, with digits
 *     escaped per XML spec: "_x0032_" = "2", so "<_x0032_026_01_12_00_00_00>"
 *     is the XML form of "<2026_01_12_00_00_00>" (same as filename).
 *   - Start_x0020_time = Microsoft Access export encoding; space in
 *     field name becomes "_x0020_".
 *   - Only 3 fields per entry: ID, Start_x0020_time (HH:MM), Title.
 *   - No end times — they're derived from consecutive start times.
 *   - Last program of day implicitly ends at 23:59:59.
 *
 * Filename convention: YYYY_MM_DD_00_00_00.xml (one per calendar day).
 */

import { Client as FtpClient } from 'basic-ftp';
import { XMLParser } from 'fast-xml-parser';
import { Writable } from 'node:stream';

const FTP_HOST = process.env.FTP_SCHEDULE_HOST || '212.30.195.77';
const FTP_USER = process.env.FTP_SCHEDULE_USER || 'MBLuser';
const FTP_PASSWORD = process.env.FTP_SCHEDULE_PASSWORD || 'omegaftp21';

export interface ParsedXmlProgram {
    id: string;              // The <ID> value from the XML (e.g. "1")
    startClock: string;      // HH:MM
    title: string;           // Trimmed
}

export interface ParsedSlot {
    /** ID string from the XML, used as xml_source_id in schedule_slots. */
    xml_source_id: string;
    /** ISO UTC start timestamp derived from clock + date. */
    starts_at: string;
    /** ISO UTC end timestamp derived from the next program's start (or 23:59:59). */
    ends_at: string;
    /** Title as it appears in the XML (trimmed). */
    program_title: string;
}

/**
 * Compute filename for a given date: YYYY_MM_DD_00_00_00.xml
 */
export function xmlFilenameForDate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}_${m}_${d}_00_00_00.xml`;
}

/**
 * Download today's (or the given date's) schedule XML as a UTF-8 string.
 * Returns null if the file doesn't exist on the FTP (e.g. weekend, not uploaded yet).
 */
export async function fetchScheduleXmlFromFtp(date: Date = new Date()): Promise<string | null> {
    const filename = xmlFilenameForDate(date);
    const client = new FtpClient();
    client.ftp.verbose = false;

    try {
        await client.access({
            host: FTP_HOST,
            user: FTP_USER,
            password: FTP_PASSWORD,
            secure: false,
        });

        // Download into an in-memory buffer via a Writable that collects chunks.
        const chunks: Buffer[] = [];
        const sink = new Writable({
            write(chunk, _enc, cb) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                cb();
            },
        });
        await client.downloadTo(sink, filename);
        return Buffer.concat(chunks).toString('utf8');
    } catch (err) {
        const msg = (err as Error).message ?? '';
        // File-not-found (550) = the day isn't uploaded yet. Return null, not a throw.
        if (msg.includes('550')) {
            console.warn(`[schedule-xml] FTP: ${filename} not found — playout may not have uploaded yet.`);
            return null;
        }
        throw err;
    } finally {
        client.close();
    }
}

/**
 * Parse the schedule XML text into flat {id, startClock, title} records.
 */
export function parseScheduleXml(xmlText: string): ParsedXmlProgram[] {
    const parser = new XMLParser({
        // Keep array form for the dynamic child tags even when only one child exists.
        isArray: () => false, // We'll force-array the entries ourselves below
        parseTagValue: false,
        trimValues: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = parser.parse(xmlText);
    const root = doc?.dataroot;
    if (!root || typeof root !== 'object') return [];

    // Find the dynamic child key (there's exactly one non-metadata key holding the entries).
    const dynamicKey = Object.keys(root).find((k) => k !== 'generated' && k !== 'generatedAt');
    if (!dynamicKey) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = root[dynamicKey];
    const entries = Array.isArray(raw) ? raw : [raw];

    const programs: ParsedXmlProgram[] = [];
    for (const e of entries) {
        if (!e) continue;
        const id = String(e.ID ?? '').trim();
        const startClock = String(e.Start_x0020_time ?? '').trim();
        const title = String(e.Title ?? '').trim();
        if (!id || !startClock || !title) continue;
        // Validate HH:MM format
        if (!/^\d{1,2}:\d{2}$/.test(startClock)) continue;
        programs.push({ id, startClock, title });
    }

    // Sort by start time — the XML claims to be ordered but we don't rely on it
    programs.sort((a, b) => toMinutes(a.startClock) - toMinutes(b.startClock));

    return programs;
}

/**
 * Convert flat parsed programs into ParsedSlot[] with derived end times,
 * all anchored to the given calendar date in UTC (= Iceland local).
 */
export function computeSlotsForDate(date: Date, programs: ParsedXmlProgram[]): ParsedSlot[] {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    const d = date.getUTCDate();

    const endOfDay = new Date(Date.UTC(y, m, d, 23, 59, 59));

    return programs.map((p, i) => {
        const [h, min] = p.startClock.split(':').map(Number);
        const starts = new Date(Date.UTC(y, m, d, h, min, 0));
        const next = programs[i + 1];
        const ends = next
            ? (() => {
                const [nh, nm] = next.startClock.split(':').map(Number);
                return new Date(Date.UTC(y, m, d, nh, nm, 0));
            })()
            : endOfDay;

        return {
            xml_source_id: p.id,
            starts_at: starts.toISOString(),
            ends_at: ends.toISOString(),
            program_title: p.title,
        };
    });
}

function toMinutes(clock: string): number {
    const [h, m] = clock.split(':').map(Number);
    return h * 60 + m;
}
