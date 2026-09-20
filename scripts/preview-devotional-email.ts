import { copyFileSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { devotionalEmailTemplate, type DevotionalEmailPiece } from '../src/lib/devotional-email-template';
import { devotionalWelcomeTemplate } from '../src/lib/devotional-welcome-template';
import { EMAIL_LOGO_URL } from '../src/lib/email-brand';

// A reviewed/published snapshot, never a subscriber export. No emails are sent.
const input = process.argv[2];
if (!input) throw new Error('Provide a JSON snapshot of one published devotional');
const piece = JSON.parse(readFileSync(input, 'utf8')) as DevotionalEmailPiece;
const email = devotionalEmailTemplate(piece, 'preview-not-a-real-subscriber');
const directory = 'output/email';
mkdirSync(directory, { recursive: true });
copyFileSync('public/email/omega-wordmark.png', `${directory}/omega-wordmark.png`);
const html = email.html.replaceAll(email.unsubscribeUrl.replaceAll('&', '&amp;'), '#preview-unsubscribe')
    .replaceAll(EMAIL_LOGO_URL, './omega-wordmark.png')
    .replace('Afskrá hugleiðingar</a>', 'Afskrá hugleiðingar</a><span id="preview-unsubscribe" style="display:block;margin-top:12px;">Forskoðun · enginn tölvupóstur sendur. Afskráning er óvirk hér.</span>');
writeFileSync(`${directory}/omega-first-devotional.html`, html);
writeFileSync(`${directory}/omega-first-devotional.txt`, `Efni: ${email.subject}\nForskoðun: ${email.preheader}\n\n${email.text}`);
const welcome = devotionalWelcomeTemplate('preview-not-a-real-subscriber', piece);
writeFileSync(`${directory}/omega-welcome.html`, welcome.html.replaceAll(welcome.unsubscribeUrl.replaceAll('&', '&amp;'), '#preview-unsubscribe')
    .replaceAll(EMAIL_LOGO_URL, './omega-wordmark.png')
    .replace('Afskrá hugleiðingar</a>', 'Afskrá hugleiðingar</a><span id="preview-unsubscribe" style="display:block;margin-top:12px;">Forskoðun · enginn tölvupóstur sendur. Afskráning er óvirk hér.</span>'));
console.log({ subject: email.subject, paragraphs: piece.body_is.length, bytes: Buffer.byteLength(email.html) });
