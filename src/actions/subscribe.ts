'use server';

import { addSubscriber } from '@/lib/subscriber-db';

/**
 * Public subscribe action — invoked from EmailSignupForm.
 *
 * List-building phase: the email is added to the list directly (the web form
 * is the opt-in). No double-opt-in email yet — the sending domain isn't set up.
 * When it is, re-enable verification + reinstate sendVerificationEmail here.
 */
export async function subscribeAction(formData: FormData) {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string | undefined;
    const segment = formData.get('segment') as string | undefined;

    if (!email || !email.includes('@')) {
        return { success: false, error: 'Vinsamlegast sláðu inn gilt netfang.' };
    }

    const segments = segment ? [segment] : ['newsletter'];
    const result = await addSubscriber(email, name, segments);

    if (result.success) {
        return {
            success: true,
            error: undefined,
            message: result.alreadyOnList
                ? 'Þú ert nú þegar á póstlistanum okkar — takk!'
                : 'Takk! Þú ert komin á póstlistann. Við sendum þér fréttir af Omega.',
        };
    }

    return result;
}
