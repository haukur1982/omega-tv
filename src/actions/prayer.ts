'use server';

import { revalidatePath } from 'next/cache';
import { addPrayer, incrementPrayCount } from '@/lib/prayer-db';

export async function submitPrayerAction(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const topic = formData.get('topic') as string;
    const content = formData.get('content') as string;

    if (!topic || !content) {
        return { success: false, error: 'Vinsamlegast fylltu út efni og bæn.' };
    }

    // Basic spam filter (optional: simple length check)
    if (content.length > 500) {
        return { success: false, error: 'Bænin er of löng (hámark 500 stafir).' };
    }

    await addPrayer({
        name: name || "Nafnlauser",
        email,
        topic,
        content
    });

    revalidatePath('/baenatorg');
    return { success: true };
}

export async function prayForAction(id: string) {
    const newCount = await incrementPrayCount(id);
    if (newCount !== null) {
        revalidatePath('/baenatorg');
        return { success: true, count: newCount };
    }
    return { success: false };
}
