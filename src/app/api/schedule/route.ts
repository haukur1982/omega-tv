
import { NextResponse } from 'next/server';
import { Client } from 'basic-ftp';
import { XMLParser } from 'fast-xml-parser';

// Cache structure
let scheduleCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

export async function GET() {
    // Check cache
    const nowTime = Date.now();
    if (scheduleCache && (nowTime - lastFetchTime < CACHE_DURATION)) {
        return NextResponse.json(scheduleCache);
    }

    const client = new Client();
    // client.ftp.verbose = true; // Enable for debugging

    try {
        await client.access({
            host: "212.30.195.77",
            user: "MBLuser",
            password: "omegaftp21",
            secure: false
        });

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // Construct filename: YYYY_MM_DD_00_00_00.xml
        // Note: The sample file was 2026_01_12_00_00_00.xml, matching the requested date format.
        const filename = `${year}_${month}_${day}_00_00_00.xml`;

        // Download to buffer
        // basic-ftp downloadTo requires a writable stream or path. 
        // Since we are in an edge/serverless-like env, let's use a temp string buffer approach or just download to a temp file if filesystem is available. 
        // Given we have filesystem access in this environment, downloading to a temp file is safer.
        const tempPath = `/tmp/${filename}`;
        await client.downloadTo(tempPath, filename);

        // Read file content
        const fs = require('fs');
        const xmlData = fs.readFileSync(tempPath, 'utf8');

        // Parse XML
        const parser = new XMLParser();
        const jObj = parser.parse(xmlData);

        // The root element varies based on date, e.g. <_x0032_026_01_12_00_00_00>
        // We need to find the array of program entries.
        // Usually fast-xml-parser puts the root object keys in jObj.
        // Let's inspect the structure from the sample. 
        // sample: <dataroot><_TAG>...</_TAG><_TAG>...</_TAG></dataroot>
        // so jObj.dataroot should contain the entries.

        // The entries key is dynamic, e.g. `_x0032_026_01_12_00_00_00`
        // We can just take the first key of jObj.dataroot that starts with '_' or is not expected metadata.

        const root = jObj.dataroot;
        const keys = Object.keys(root).filter(k => k !== 'generated');
        if (keys.length === 0) throw new Error("No schedule data found in XML");

        // fast-xml-parser might group same-named tags into an array
        const entriesKey = keys[0];
        let entries = root[entriesKey]; // This should be an array of programs

        if (!Array.isArray(entries)) {
            entries = [entries];
        }

        // Map to our structure
        const programs = entries.map((e: any) => {
            const timeStr = e.Start_x0020_time; // "HH:mm"
            const [hours, minutes] = timeStr.split(':').map(Number);

            // Create date object for today in UTC
            // We want to preserve the YYYY-MM-DD from 'today' but set hours in UTC.
            const startTime = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0));

            return {
                title: e.Title?.trim() || "Dagskrá",
                startTime: startTime, /** Storing as Date object, toISOString() called later */
                originalTime: timeStr
            };
        });

        // Sort by time just in case
        programs.sort((a: any, b: any) => a.startTime.getTime() - b.startTime.getTime());

        // Calculate end times and duration
        const finalSchedule = programs.map((prog: any, i: number) => {
            let endTime;
            if (i < programs.length - 1) {
                endTime = programs[i + 1].startTime;
            } else {
                // Last program of the day
                const endOfDay = new Date(prog.startTime);
                endOfDay.setUTCHours(23, 59, 59, 999);
                endTime = endOfDay;
            }

            const durationSeconds = (endTime.getTime() - prog.startTime.getTime()) / 1000;

            return {
                title: prog.title,
                startTime: prog.startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: durationSeconds
            };
        });

        // Determine current and next
        const now = new Date();
        const currentProgram = finalSchedule.find((p: any) => {
            const s = new Date(p.startTime);
            const e = new Date(p.endTime);
            return now >= s && now < e;
        });

        const nextPrograms = finalSchedule
            .filter((p: any) => new Date(p.startTime) > now)
            .slice(0, 10);

        const responseData = {
            current: currentProgram || null,
            next: nextPrograms
        };

        // Update cache
        scheduleCache = responseData;
        lastFetchTime = Date.now();

        // Clean up temp file
        try { fs.unlinkSync(tempPath); } catch { }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("FTP Schedule Error:", error);
        return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    } finally {
        client.close();
    }
}
