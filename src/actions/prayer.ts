'use server';

import { revalidatePath } from 'next/cache';
import { addPrayer, incrementPrayCount, incrementCampaignPrayCount } from '@/lib/prayer-db';

export async function submitPrayerAction(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const topic = formData.get('topic') as string;
    const content = formData.get('content') as string;
    const categoryType = formData.get('categoryType') as string || 'personal';

    if (!topic || !content) {
        return { success: false, error: 'Vinsamlegast fylltu út efni og bæn.' };
    }

    if (content.length > 500) {
        return { success: false, error: 'Bænin er of löng (hámark 500 stafir).' };
    }

    await addPrayer({
        name: name || "Nafnlaus/t",
        email,
        topic,
        content,
        categoryType,
    });

    revalidatePath('/baenatorg');
    return { success: true };
}

/**
 * Quick national prayer — pre-written text, auto-approved
 */
export async function submitQuickPrayerAction(topic: string, name: string = 'Nafnlaus/t') {
    const messages: Record<string, string> = {
        'Ísland': 'Ég bid fyrir Íslandi — fyrir friði, einingu og veru Guðs yfir þjóðinni.',
        'Ríkisstjórnin': 'Ég bid fyrir leiðtogum landsins — fyrir visku, réttlæti og auðmýkt.',
        'Ísrael': 'Ég bid fyrir Ísrael — fyrir friði Jerúsalem og verndun þjóðar Guðs.',
        'Kirkjan': 'Ég bid fyrir kirkjunni á Íslandi — fyrir vakningu, einingu og ást.',
    };

    const content = messages[topic];
    if (!content) return { success: false, error: 'Óþekkt efni.' };

    await addPrayer({
        name,
        topic,
        content,
        categoryType: 'national',
        autoApprove: true,
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

export async function prayForCampaignAction(campaignId: string) {
    const newCount = await incrementCampaignPrayCount(campaignId);
    if (newCount !== null) {
        revalidatePath('/baenatorg');
        return { success: true, count: newCount };
    }
    return { success: false };
}
