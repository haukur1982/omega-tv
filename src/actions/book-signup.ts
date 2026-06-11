'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { addSubscriber } from '@/lib/subscriber-db';

/**
 * Bókavinir Omega — book ministry signup.
 *
 * Inserts the signup (name + home address so the book can be mailed)
 * and, when the reader opts in, also adds them to the newsletter list.
 * Mirrors the promise in the June letter: leave your address and the
 * book is sent home to you.
 */
export async function bookSignupAction(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const phone = String(formData.get('phone') ?? '').trim();
    const address = String(formData.get('address') ?? '').trim();
    const postal = String(formData.get('postal') ?? '').trim();
    const wantsNewsletter = formData.get('newsletter') === 'on';

    if (name.length < 2) {
        return { success: false, error: 'Vinsamlegast sláðu inn nafnið þitt.' };
    }
    if (!email.includes('@')) {
        return { success: false, error: 'Vinsamlegast sláðu inn gilt netfang.' };
    }
    if (address.length < 4) {
        return { success: false, error: 'Vinsamlegast sláðu inn heimilisfang svo við getum sent bókina.' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabaseAdmin as any;
    const { error } = await sb.from('book_signups').insert([{
        name,
        email,
        phone: phone || null,
        address,
        postal_code: postal || null,
        wants_newsletter: wantsNewsletter,
        book_slug: '90-minutur-a-himnum',
    }]);

    if (error) {
        console.error('Book signup failed:', error);
        return { success: false, error: 'Villa kom upp. Reyndu aftur — eða hringdu í síma 800 9700.' };
    }

    if (wantsNewsletter) {
        // Best-effort; the signup itself already succeeded.
        await addSubscriber(email, name, ['newsletter']).catch(() => null);
    }

    return {
        success: true,
        message: 'Takk fyrir — þú ert orðin(n) bókavinur Omega. Bókin verður send heim til þín, og þú heyrir frá okkur þegar næsta bók kemur út.',
    };
}
