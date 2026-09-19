'use server';

import { addSubscriber } from '@/lib/subscriber-db';
import { sendDevotionalWelcome, type WelcomeStatus } from '@/lib/devotional-welcome';
import { parseSubscription } from '@/lib/subscription-input';

/** Saves opt-in first, then sends a receipt for devotional subscriptions. */
export async function subscribeAction(formData: FormData): Promise<{ success: boolean; error?: string; message?: string; confirmation?: WelcomeStatus }> {
    const input = parseSubscription(formData);
    if ('error' in input) return { success: false, error: input.error };
    if (formData.get('website')) return { success: false, error: 'Ekki tókst að skrá netfangið.' };
    try {
        const result = await addSubscriber(input.email, input.name, [input.segment], {
            textVersion: input.consentText,
            source: input.segment,
        });
        if (!result.success) return result;
        const confirmation = input.segment === 'devotionals'
            ? await sendDevotionalWelcome(input.email) : undefined;
        return {
            success: true,
            confirmation,
            message: input.segment === 'devotionals'
                ? 'Takk fyrir skráninguna! Við látum þig vita þegar sendingar hefjast.'
                : 'Takk fyrir skráninguna á póstlista Omega.',
        };
    } catch (error) {
        console.error('Subscription failed:', error);
        return { success: false, error: 'Ekki tókst að skrá netfangið. Reyndu aftur.' };
    }
}
