import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getSubscribers, deleteSubscriber } from '@/lib/subscriber-db';

export async function GET(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const subscribers = await getSubscribers();
    return NextResponse.json(subscribers);
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminSession(request);
    if (auth.error) return auth.error;

    const { id } = await request.json();
    const success = await deleteSubscriber(id);
    return NextResponse.json({ success });
}
