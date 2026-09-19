export const DEVOTIONAL_CONSENT = 'Ég samþykki að fá hugleiðingar frá Omega í tölvupósti og tilkynningu þegar sendingar hefjast.';

const SEGMENTS = ['newsletter', 'vision', 'tv', 'devotionals'];

/** Shared by the form and action; consent wording is recorded server-side. */
export function parseSubscription(form: FormData) {
    const emailValue = form.get('email');
    const segmentValue = form.get('segment') ?? 'newsletter';
    const nameValue = form.get('name');
    const email = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: 'Vinsamlegast sláðu inn gilt netfang.' } as const;
    }
    if (typeof segmentValue !== 'string' || !SEGMENTS.includes(segmentValue)) {
        return { error: 'Ógildur póstlisti.' } as const;
    }
    const consent = form.get('consent');
    if ((segmentValue === 'devotionals' || segmentValue === 'tv' || consent !== null)
        && consent !== 'true' && consent !== 'on') {
        return { error: 'Vinsamlegast samþykktu að fá tölvupóst frá okkur.' } as const;
    }
    const suppliedText = form.get('consent_text');
    return {
        email,
        name: typeof nameValue === 'string' ? nameValue.trim().slice(0, 160) : undefined,
        segment: segmentValue,
        consentText: segmentValue === 'devotionals' ? DEVOTIONAL_CONSENT
            : typeof suppliedText === 'string' ? suppliedText.slice(0, 1000) : undefined,
    } as const;
}
