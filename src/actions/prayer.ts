'use server';

import { revalidatePath } from 'next/cache';
import { addPrayer, incrementPrayCount } from '@/lib/prayer-db';

export async function submitPrayerAction(formData: FormData) {
    const name = formData.get('name') as string;
    const topic = formData.get('topic') as string;
    const content = formData.get('content') as string;

    if (!name || !topic || !content) {
        return { success: false, error: 'Vinsamlegast fylltu út alla reiti.' };
    }

    // Basic spam filter (optional: simple length check)
    if (content.length > 500) {
        return { success: false, error: 'Bænin er of löng (hámark 500 stafir).' };
    }

    await addPrayer({
        name,
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
