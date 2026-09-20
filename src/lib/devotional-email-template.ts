import { devotionalReadingMinutes, escapeEmailHtml as esc, isScriptureParagraph } from './devotional-presentation';
import { DEVOTIONAL_ATTRIBUTION } from './devotional-attribution';
import { EMAIL_LOGO_HTML } from './email-brand';

export interface DevotionalEmailPiece {
    slug: string;
    day: number;
    slot: 'morning' | 'evening';
    title_is: string;
    body_is: string[];
    reviewed: boolean;
    status: string;
}

/** Produces a complete reading; does not schedule or send any email. */
export function devotionalEmailTemplate(piece: DevotionalEmailPiece, unsubscribeToken: string) {
    if (!piece.reviewed || piece.status !== 'published') throw new Error('Only reviewed, published devotionals can become emails');
    if (!piece.body_is.some(p => p.trim())) throw new Error('The devotional is empty');
    const readUrl = `https://omega.is/hugleidingar/${encodeURIComponent(piece.slug)}`;
    const unsubscribeUrl = `https://omega.is/api/subscribers/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&list=devotionals`;
    const minutes = devotionalReadingMinutes(piece.body_is);
    const slot = piece.slot === 'morning' ? 'Morgunn' : 'Kvöld';
    const subject = `${piece.title_is} — Hugleiðingar Omega`;
    const preheader = `${minutes} mínútna lestur með Wade E. Taylor. Stund í orði Guðs.`;
    const text = `OMEGA · HUGLEIÐINGAR
${piece.title_is}
Dagur ${piece.day} · ${slot} · ${minutes} mínútna lestur
Wade E. Taylor · Íslensk þýðing

${piece.body_is.join('\n\n')}

STÖLDRUM VIÐ
Gefðu þér stund með Drottni. Taktu það sem snerti þig í lestrinum með þér í bæn og inn í daginn.

Lesa á vefnum: ${readUrl}
Hugleiðingin er opin öllum. Þú mátt deila vefslóðinni með öðrum.

${DEVOTIONAL_ATTRIBUTION.author}
${DEVOTIONAL_ATTRIBUTION.scripture}
${DEVOTIONAL_ATTRIBUTION.sources}
Um þýðinguna: https://omega.is/hugleidingar/thydingin

Þú færð hugleiðingar vegna skráningar á omega.is.
Afskrá hugleiðingar: ${unsubscribeUrl}
Sjónvarpsstöðin Omega · Reykjavík, Ísland`;
    const paragraphs = piece.body_is.map(paragraph => {
        const scripture = isScriptureParagraph(paragraph);
        const style = scripture
            ? 'margin:30px 0;padding:4px 0 4px 20px;border-left:2px solid #416b97;color:#31577f;'
            : 'margin:0 0 24px;color:#302b25;';
        return `<p class="reading ${scripture ? 'scripture' : 'prose'}" style="${style}font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.8;word-wrap:break-word;">${esc(paragraph).replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
    const html = `<!doctype html>
<html lang="is"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(subject)}</title>
<style>
@media only screen and (max-width:620px){.outer{padding:16px 8px!important}.content{padding:32px 24px!important}.headline{font-size:36px!important}.reading{font-size:19px!important}.footer{padding:24px!important}}
@media (prefers-color-scheme:dark){body,.outer-table{background-color:#17191c!important}.paper{background-color:#24272b!important}.prose,.headline,.brand{color:#f2eee7!important}.muted,.footer p{color:#c4c5c8!important}.scripture,.link,.eyebrow{color:#9ec5ec!important}.pause{background-color:#30363e!important}.divider{border-color:#4b5159!important}}
</style></head>
<body style="margin:0;padding:0;background-color:#eeeae3;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>
<table class="outer-table" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eeeae3;"><tr><td class="outer" align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="620" align="center"><tr><td><![endif]-->
<table class="paper" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background-color:#fffdf8;border-top:3px solid #416b97;">
<tr><td class="content" style="padding:44px 48px 32px;">
<p style="margin:0 0 20px;line-height:0;">${EMAIL_LOGO_HTML}</p>
<p class="muted" style="margin:0 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#665e54;">Stund í orði Guðs · <a class="link" href="${readUrl}" style="color:#416b97;text-decoration:underline;">Lesa á vefnum</a></p>
<p class="eyebrow" style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;letter-spacing:1.5px;font-weight:bold;color:#416b97;">DAGUR ${piece.day} · ${slot.toUpperCase()}</p>
<h1 class="headline" style="margin:0 0 22px;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.15;font-weight:normal;color:#25221d;">${esc(piece.title_is)}</h1>
<p class="muted divider" style="margin:0 0 34px;padding-bottom:28px;border-bottom:1px solid #e3ddd3;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.8;color:#665e54;">Wade E. Taylor · Íslensk þýðing<br>${minutes} mínútna lestur</p>
${paragraphs}
<table class="pause" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px;background-color:#f0ece3;"><tr><td style="padding:24px;">
<p class="eyebrow" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;font-weight:bold;letter-spacing:1.5px;color:#416b97;">STÖLDRUM VIÐ</p>
<p class="prose" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.7;color:#302b25;">Gefðu þér stund með Drottni. Taktu það sem snerti þig í lestrinum með þér í bæn og inn í daginn.</p>
</td></tr></table>
<p class="muted" style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#665e54;">Hugleiðingin er opin öllum.<br><a class="link" href="${readUrl}" style="color:#416b97;text-decoration:underline;">Opna á vefnum og deila með öðrum</a></p>
</td></tr>
<tr><td class="footer divider" style="padding:28px 48px;border-top:1px solid #e3ddd3;">
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#665e54;">${esc(DEVOTIONAL_ATTRIBUTION.author)}</p>
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#665e54;">${esc(DEVOTIONAL_ATTRIBUTION.scripture)} ${esc(DEVOTIONAL_ATTRIBUTION.sources)}<br><a class="link" href="https://omega.is/hugleidingar/thydingin" style="color:#416b97;text-decoration:underline;">Um þýðinguna og frumtexta ritningarstaða</a></p>
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#665e54;">Þú færð hugleiðingar vegna skráningar á omega.is.<br><a class="link" href="${esc(unsubscribeUrl)}" style="color:#416b97;text-decoration:underline;">Afskrá hugleiðingar</a></p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#665e54;">Sjónvarpsstöðin Omega · Reykjavík, Ísland</p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
    return { subject, preheader, html, text, readUrl, unsubscribeUrl };
}
