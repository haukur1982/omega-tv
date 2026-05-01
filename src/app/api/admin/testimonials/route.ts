import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
    getAllTestimonials,
    approveTestimonial,
    deleteTestimonial,
} from '@/lib/testimonials-db';

/**
 * /api/admin/testimonials
 *
 * GET    — list every testimonial (incl. unapproved) for the admin inbox
 * PATCH  — approve a testimonial: { id, action: 'approve' | 'unapprove' }
 * DELETE — remove a testimonial: { id }
 *
 * The previous flow imported the DB helpers directly into a client
 * component, which forced testimonials-db.ts (and its supabaseAdmin
 * reference) into the browser bundle. This route runs server-side and
 * authenticates with verifyAdminSession() so the service-role client
 * stays where it belongs.
 */

export async function GET(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    const rows = await getAllTestimonials();
    return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: { id?: string; action?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }
    if (!body.id) return NextResponse.json({ error: 'ID vantar.' }, { status: 400 });

    if (body.action === 'approve') {
        const ok = await approveTestimonial(body.id);
        if (!ok) return NextResponse.json({ error: 'Tókst ekki að samþykkja.' }, { status: 500 });
        return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Ógild aðgerð.' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
    const auth = await verifyAdminSession(req);
    if (auth.error) return auth.error;

    let body: { id?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Ógilt form.' }, { status: 400 });
    }
    if (!body.id) return NextResponse.json({ error: 'ID vantar.' }, { status: 400 });

    const ok = await deleteTestimonial(body.id);
    if (!ok) return NextResponse.json({ error: 'Tókst ekki að eyða.' }, { status: 500 });
    return NextResponse.json({ ok: true });
}
