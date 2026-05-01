import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Omega TV <onboarding@resend.dev>';

/**
 * Public site URL — used to build absolute links in emails. In dev we
 * fall back to the public-facing one rather than localhost so links in
 * test sends still work when sent to a real inbox.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://omega.is';

const VERIFICATION_EMAIL = {
    subject: 'Staðfestu netfangið þitt — Omega Stöðin',
    getHtml: (verifyUrl: string, name?: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#4a7ab5,#5b8abf);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Ω OMEGA</h1>
        </td></tr>
        <tr><td style="padding:40px;color:#a1a1aa;font-size:16px;line-height:1.6;">
          <h2 style="color:#fff;margin:0 0 20px 0;font-size:22px;">${name ? `Halló ${name},` : 'Halló,'}</h2>
          <p>Takk fyrir að skrá þig á póstlistann okkar. Til að klára skráninguna — staðfestu að þetta sé þitt netfang:</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
            <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#4a7ab5,#7aa3d4);color:#fff;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:bold;font-size:16px;">
              Staðfesta netfang
            </a>
          </td></tr></table>
          <p style="font-size:14px;color:#71717a;">Ef hnappurinn virkar ekki, afritaðu þessa slóð:<br><span style="word-break:break-all;color:#4a7ab5;">${verifyUrl}</span></p>
          <p style="font-size:13px;color:#52525b;margin-top:32px;">Þú getur hunsað þennan póst ef þú skráðir þig ekki — við sendum ekkert án staðfestingar.</p>
        </td></tr>
        <tr><td style="background:#0a0a0f;padding:20px;text-align:center;border-top:1px solid #27272a;">
          <p style="color:#52525b;font-size:12px;margin:0;">Sjónvarpsstöðin Omega · Reykjavík, Ísland</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
};

// Email templates
const WELCOME_EMAIL = {
    subject: 'Velkomin/n í Omega fjölskylduna! 🙏',
    getHtml: (name?: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4a7ab5, #5b8abf); padding: 40px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Ω OMEGA</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Sjónvarpsstöðin síðan 1992</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px;">
                                ${name ? `Kæri/kæra ${name},` : 'Kæri vinur,'}
                            </h2>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Takk fyrir að skrá þig á póstlistann okkar! Við erum svo þakklát fyrir stuðning þinn.
                            </p>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Með þessari skráningu muntu fá:
                            </p>
                            <ul style="color: #a1a1aa; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                                <li>Vikulega uppörvun og hugleiðingar</li>
                                <li>Fréttir af nýju efni og þýðingum</li>
                                <li>Bænabeiðnir og vitnisburði</li>
                                <li>Tilkynningar um sérstaka viðburði</li>
                            </ul>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="https://omega.is/baenatorg" style="display: inline-block; background: linear-gradient(135deg, #4a7ab5, #7aa3d4); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; font-size: 16px;">
                                            Sendu okkur bænabeiðni
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                                <em>"Sá sem hóf gott verk í yður mun fullkomna það allt til dags Krists Jesú."</em>
                                <br>
                                <span style="color: #5b8abf;">— Filippíbréfið 1:6</span>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a0a0f; padding: 30px; text-align: center; border-top: 1px solid #27272a;">
                            <p style="color: #71717a; font-size: 14px; margin: 0;">
                                Sjónvarpsstöðin Omega · Reykjavík, Ísland
                            </p>
                            <p style="color: #52525b; font-size: 12px; margin: 10px 0 0 0;">
                                Þú fékkst þennan póst vegna skráningar á omega.is
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
};

/**
 * Send a welcome email to a new subscriber
 */
export async function sendWelcomeEmail(to: string, name?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: to,
            subject: WELCOME_EMAIL.subject,
            html: WELCOME_EMAIL.getHtml(name)
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (e) {
        console.error('Email send failed:', e);
        return { success: false, error: 'Failed to send email' };
    }
}

/**
 * Send the double-opt-in verification email. The subscriber must click
 * the link before they're considered verified — only verified subscribers
 * receive newsletters.
 */
export async function sendVerificationEmail(
    to: string,
    verificationToken: string,
    name?: string,
): Promise<{ success: boolean; error?: string }> {
    const verifyUrl = `${SITE_URL}/api/subscribers/verify?token=${verificationToken}`;
    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: VERIFICATION_EMAIL.subject,
            html: VERIFICATION_EMAIL.getHtml(verifyUrl, name),
        });
        if (error) {
            console.error('Resend verification error:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (e) {
        console.error('Verification email send failed:', e);
        return { success: false, error: 'Failed to send verification email' };
    }
}

/**
 * Send a newsletter to verified subscribers. Each recipient gets a
 * personalised unsubscribe link in the footer (legal requirement). The
 * caller passes one entry per recipient — `unsubscribeToken` is the
 * subscriber's permanent token from the DB.
 */
export async function sendNewsletter(
    subject: string,
    content: string,
    recipients: { email: string; unsubscribeToken: string }[],
): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Resend supports batch sending; we send individually here so each
    // email's unsubscribe footer is personal. For very large lists,
    // switch to resend.batch.send() with per-recipient tokens.
    for (const recipient of recipients) {
        const unsubscribeUrl = `${SITE_URL}/api/subscribers/unsubscribe?token=${recipient.unsubscribeToken}`;
        try {
            const { error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: recipient.email,
                subject,
                headers: {
                    // RFC 8058 — lets gmail.com etc. show a one-click unsubscribe button.
                    'List-Unsubscribe': `<${unsubscribeUrl}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                },
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #4a7ab5, #5b8abf); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">Ω OMEGA</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px; color: #a1a1aa; font-size: 16px; line-height: 1.8;">
                            ${content.replace(/\n/g, '<br>')}
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #0a0a0f; padding: 24px; text-align: center; border-top: 1px solid #27272a;">
                            <p style="color: #52525b; font-size: 12px; margin: 0 0 10px 0;">
                                Sjónvarpsstöðin Omega · Reykjavík, Ísland
                            </p>
                            <p style="color: #52525b; font-size: 11px; margin: 0;">
                                <a href="${unsubscribeUrl}" style="color: #71717a; text-decoration: underline;">Afskrá</a>
                                &nbsp;·&nbsp;
                                <a href="${SITE_URL}" style="color: #71717a; text-decoration: underline;">omega.is</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                `,
            });

            if (error) {
                failed++;
            } else {
                sent++;
            }
        } catch {
            failed++;
        }
    }

    return { success: failed === 0, sent, failed };
}
