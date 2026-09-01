import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getAllPrayers,
    approvePrayer,
    deletePrayer,
    markPrayerAnswered,
    addPrayer,
    isPrayerMinistryReady,
} from '@/lib/prayer-db';

/**
 * The prayer queue — moderation, and the phone door's intake.
 *
 * Section `samskipti` (docs/plans/08-admin-users-roles.md): bænaverðir live
 * here, and this is the only section they reach.
 *
 *   GET                                    → every prayer, newest first
 *   GET  ?ready=1                          → { ready } — is the ministry migration applied?
 *   POST { action:'phone', … }             → a prayer taken down over the phone
 *   PATCH { id, action:'approve'|'answered' }
 *   DELETE { id }
 *
 * GET deliberately still answers a bare array: /admin/dashboard counts it.
 */

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'samskipti' });
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    if (searchParams.get('ready') === '1') {
        return NextResponse.json({ ready: await isPrayerMinistryReady() });
    }

    const prayers = await getAllPrayers();
    return NextResponse.json(prayers);
}

export async function POST(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'samskipti' });
    if (auth.error) return auth.error;

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt JSON' }, { status: 400 });
    }

    if (body.action !== 'phone') {
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    if (!content || !topic) {
        return NextResponse.json({ error: 'Bænaefni og flokkur eru nauðsynleg.' }, { status: 400 });
    }

    // The volunteer ticks these while the caller says them out loud. Nothing
    // here is inferred: an unticked box is a no, exactly as on the web form.
    const publishConsent = body.publishConsent === true;
    const airConsent = body.airConsent === true;
    const contactConsent = body.contactConsent === true;
    const email = contactConsent && typeof body.email === 'string' ? body.email.trim() : '';
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Nafnlaus/t';

    const created = await addPrayer({
        name,
        email: email || undefined,
        topic,
        content,
        categoryType: typeof body.categoryType === 'string' ? body.categoryType : 'personal',
        source: 'simi',
        airConsent,
        // No "birta á vefnum" means it never reaches the wall, approved or
        // not. They still get prayed for; they just asked not to be read.
        isPrivate: !publishConsent,
        // Unapproved as usual — a phone prayer joins the same queue a web
        // prayer does, and the same person reads it before it goes on the wall.
        autoApprove: false,
    });

    if (!created) {
        return NextResponse.json({ error: 'Tókst ekki að skrá bænina.' }, { status: 500 });
    }

    // Written after the insert so a failed save never reports a consent that
    // was never stored. `ready` false means addPrayer fell back to the narrow
    // column set and the consents did NOT persist — the UI says so plainly.
    const ready = await isPrayerMinistryReady();
    return NextResponse.json({
        success: true,
        prayer: created,
        ready,
        publishConsent,
    });
}

export async function PATCH(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'samskipti' });
    if (auth.error) return auth.error;

    const { id, action } = await request.json();

    if (action === 'approve') {
        const success = await approvePrayer(id);
        return NextResponse.json({ success });
    }

    if (action === 'answered') {
        const success = await markPrayerAnswered(id);
        return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request, { section: 'samskipti' });
    if (auth.error) return auth.error;

    const { id } = await request.json();
    const success = await deletePrayer(id);
    return NextResponse.json({ success });
}
