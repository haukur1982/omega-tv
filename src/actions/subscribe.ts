'use server';

import { addSubscriber } from '@/lib/subscriber-db';
import { sendVerificationEmail } from '@/lib/email';

/**
 * Public subscribe action — invoked from EmailSignupForm.
 *
 * Flow:
 *   1. Insert (or find existing pending) subscriber row
 *   2. Send the verification email containing a tokenised link
 *   3. Show the user a "check your inbox" confirmation message
 *
 * The subscriber is NOT considered verified until they click the link
 * — only verified subscribers receive newsletters. This is non-negotiable
 * (deliverability + GDPR).
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

    if (result.success && result.verificationToken) {
        // Fire and forget — don't block the user on the email roundtrip.
        sendVerificationEmail(email, result.verificationToken, name).catch(console.error);
        return {
            success: true,
            error: undefined,
            message: 'Við sendum þér staðfestingarpóst. Smelltu á hlekkinn í póstinum til að ljúka skráningunni.',
        };
    }

    return result;
}
