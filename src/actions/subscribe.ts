'use server';

import { addSubscriber } from '@/lib/subscriber-db';
import { parseSubscription } from '@/lib/subscription-input';

/** Collects explicit opt-ins. No email is sent by this action. */
export async function subscribeAction(formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
    const input = parseSubscription(formData);
    if ('error' in input) return { success: false, error: input.error };
    if (formData.get('website')) return { success: false, error: 'Ekki tókst að skrá netfangið.' };
    try {
        const result = await addSubscriber(input.email, input.name, [input.segment], {
            textVersion: input.consentText,
            source: input.segment,
        });
        if (!result.success) return result;
        return {
            success: true,
            message: input.segment === 'devotionals'
                ? 'Takk fyrir skráninguna! Við látum þig vita þegar sendingar hefjast.'
                : 'Takk fyrir skráninguna á póstlista Omega.',
        };
    } catch (error) {
        console.error('Subscription failed:', error);
        return { success: false, error: 'Ekki tókst að skrá netfangið. Reyndu aftur.' };
    }
}
