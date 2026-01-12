import { NextResponse } from 'next/server';
import { getSubscribers } from '@/lib/subscriber-db';

export async function GET() {
    const subscribers = await getSubscribers();
    return NextResponse.json(subscribers);
}
