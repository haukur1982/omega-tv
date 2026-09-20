import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase';
import { devotionalWelcomeTemplate } from './devotional-welcome-template';

export type WelcomeStatus = 'sent' | 'already_sent' | 'failed';
export interface WelcomeRecipient { id: string; email: string; unsubscribe_token: string }
export interface WelcomeDelivery {
    wasSent: (subscriberId: string) => Promise<boolean>;
    send: (subscriber: WelcomeRecipient) => Promise<string>;
    record: (subscriberId: string, emailId: string) => Promise<void>;
}
const EVENT = 'devotional.welcome.sent';

/** Successful sends are remembered beyond the provider's 24-hour retry window. */
export async function deliverDevotionalWelcome(subscriber: WelcomeRecipient, delivery: WelcomeDelivery): Promise<WelcomeStatus> {
    try {
        if (await delivery.wasSent(subscriber.id)) return 'already_sent';
        const emailId = await delivery.send(subscriber);
        // The provider accepted the email even if recording that result fails.
        try { await delivery.record(subscriber.id, emailId); }
        catch { console.error('Could not record devotional welcome:', subscriber.id, emailId); }
        return 'sent';
    } catch (error) {
        console.error('Devotional welcome failed:', error instanceof Error ? error.message : 'Unknown error');
        return 'failed';
    }
}

export async function sendDevotionalWelcome(email: string): Promise<WelcomeStatus> {
    const db = supabaseAdmin as unknown as SupabaseClient;
    try {
        const { data, error } = await db.from('subscribers')
            .select('id,email,unsubscribe_token').eq('email', email.trim().toLowerCase())
            .contains('segments', ['devotionals']).maybeSingle();
        if (error || !data?.unsubscribe_token) return 'failed';
        return deliverDevotionalWelcome(data as WelcomeRecipient, {
            async wasSent(subscriberId) {
                const result = await db.from('system_events').select('id')
                    .eq('event_type', EVENT).eq('payload->>subscriber_id', subscriberId).limit(1);
                if (result.error) throw new Error('Could not check welcome history');
                return !!result.data?.length;
            },
            async send(subscriber) {
                const key = process.env.RESEND_API_KEY;
                const from = process.env.RESEND_FROM_EMAIL;
                if (!key || !from) throw new Error('Welcome email sender is not configured');
                const first = await db.from('devotionals').select('slug,title_is,body_is')
                    .eq('reviewed', true).eq('status', 'published').order('day').order('slot', { ascending: false }).limit(1).maybeSingle();
                // A temporary content failure must not prevent the signup receipt.
                if (first.error) console.error('Welcome reading unavailable:', first.error.code);
                const { subject, html, text, unsubscribeUrl } = devotionalWelcomeTemplate(subscriber.unsubscribe_token, first.data ?? undefined);
                const result = await new Resend(key).emails.send({
                    from, to: subscriber.email, replyTo: process.env.EMAIL_REPLY_TO || undefined,
                    subject, html, text,
                    headers: {
                        'List-Unsubscribe': `<${unsubscribeUrl}>`,
                        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    },
                }, { idempotencyKey: `devotional-welcome/${subscriber.id}` });
                if (result.error || !result.data?.id) {
                    throw new Error(`Email provider rejected welcome: ${result.error?.name ?? 'missing_id'}`);
                }
                return result.data.id;
            },
            async record(subscriberId, emailId) {
                const result = await db.from('system_events').insert({
                    event_type: EVENT, severity: 'info',
                    message: 'Devotional signup confirmation accepted by email provider.',
                    payload: { subscriber_id: subscriberId, email_id: emailId },
                });
                if (result.error) throw new Error('Could not record welcome');
            },
        });
    } catch {
        return 'failed';
    }
}
