'use server';

import { addSubscriber } from '@/lib/subscriber-db';
import { sendWelcomeEmail } from '@/lib/email';

export async function subscribeAction(formData: FormData) {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string | undefined;
    const segment = formData.get('segment') as string | undefined;

    if (!email || !email.includes('@')) {
        return { success: false, error: 'Vinsamlegast sláðu inn gilt netfang.' };
    }

    const segments = segment ? [segment] : ['newsletter'];
    const result = await addSubscriber(email, name, segments);

    // Send welcome email if subscription was successful
    if (result.success) {
        // Fire and forget - don't block on email sending
        sendWelcomeEmail(email, name).catch(console.error);
    }

    return result;
}
