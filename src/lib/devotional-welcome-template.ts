/** A signup receipt, not a request to verify the mailbox. */
export function devotionalWelcomeTemplate(unsubscribeToken: string) {
    const readUrl = 'https://omega.is/hugleidingar#lesa';
    const unsubscribeUrl = `https://omega.is/api/subscribers/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    const subject = 'Takk fyrir skráninguna — Hugleiðingar Omega';
    const text = `OMEGA · HUGLEIÐINGAR

Takk fyrir skráninguna.

Þú ert á póstlista hugleiðinga hjá Omega. Þú þarft ekkert meira að gera.

Við erum að undirbúa daglegar sendingar og látum þig vita þegar þær hefjast. Þangað til geturðu lesið birtar hugleiðingar á vefnum. Þær eru opnar öllum.

Lesa hugleiðingar: ${readUrl}

Guð blessi þig,
Omega

Þú færð þennan póst vegna skráningar á omega.is.
Afskrá alla tölvupósta frá Omega: ${unsubscribeUrl}
Sjónvarpsstöðin Omega · Reykjavík, Ísland`;
    const html = `<!doctype html>
<html lang="is">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${subject}</title>
<style>@media only screen and (max-width:600px){.outer{padding:16px 8px!important}.content{padding:32px 24px!important}.headline{font-size:32px!important}.footer{padding:24px!important}}</style>
</head>
<body style="margin:0;padding:0;background-color:#eeeae3;color:#25221d;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Þú ert á listanum. Hér geturðu lesið hugleiðingar á meðan daglegar sendingar eru í undirbúningi.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eeeae3;"><tr><td class="outer" align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#fffdf8;border-top:3px solid #416b97;">
<tr><td class="content" style="padding:44px 48px 40px;">
<p style="margin:0 0 40px;font-family:Georgia,'Times New Roman',serif;font-size:23px;letter-spacing:2px;color:#25221d;">Ω OMEGA</p>
<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;font-weight:bold;letter-spacing:2px;color:#416b97;">HUGLEIÐINGAR Á ÍSLENSKU</p>
<h1 class="headline" style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.2;font-weight:normal;color:#25221d;">Takk fyrir skráninguna.</h1>
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.7;color:#38342f;">Þú ert á póstlista hugleiðinga hjá Omega. Þú þarft ekkert meira að gera.</p>
<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.7;color:#38342f;">Við erum að undirbúa daglegar sendingar og látum þig vita þegar þær hefjast. Þangað til geturðu lesið birtar hugleiðingar á vefnum. Þær eru opnar öllum.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#416b97" style="border-radius:4px;mso-padding-alt:16px 24px;">
<a href="${readUrl}" style="display:inline-block;padding:16px 24px;border:1px solid #416b97;border-radius:4px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.3;font-weight:bold;text-decoration:none;color:#ffffff;">Lesa hugleiðingar</a>
</td></tr></table>
<p style="margin:36px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:1.6;color:#38342f;">Guð blessi þig,<br>Omega</p>
</td></tr>
<tr><td class="footer" style="padding:28px 48px;border-top:1px solid #e3ddd3;">
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#665e54;">Þú færð þennan póst vegna skráningar á omega.is.</p>
<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;"><a href="${unsubscribeUrl}" style="color:#416b97;text-decoration:underline;">Afskrá alla tölvupósta frá Omega</a></p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#665e54;">Sjónvarpsstöðin Omega · Reykjavík, Ísland<br><a href="https://omega.is" style="color:#665e54;text-decoration:none;">omega.is</a></p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
    return { subject, html, text, unsubscribeUrl };
}
