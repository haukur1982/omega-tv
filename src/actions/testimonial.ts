'use server';

import { createTestimonial } from '@/lib/testimonials-db';
import { revalidatePath } from 'next/cache';

export async function submitTestimonial(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const content = formData.get('content') as string;

    if (!name || !content) {
        return { success: false, message: 'Vinsamlegast fylltu út nafn og skilaboð.' };
    }

    try {
        const created = await createTestimonial({
            name,
            email: email || undefined,
            content
        });

        if (!created) {
            return { success: false, message: 'Eitthvað fór úrskeiðis. Vinsamlegast reyndu aftur.' };
        }

        revalidatePath('/admin/testimonials');
        return { success: true, message: 'Takk fyrir að deila sögu þinni!' };
    } catch (error) {
        console.error('Testimonial error:', error);
        return { success: false, message: 'Eitthvað fór úrskeiðis. Vinsamlegast reyndu aftur.' };
    }
}
