export const EMAIL_LOGO_URL = 'https://omega.is/email/omega-wordmark.png?v=2';

// The opaque reading-paper background keeps the dark mark legible. Dimensions
// reserve its space, and alternate text identifies Omega if images are blocked.
export const EMAIL_LOGO_HTML = `<a href="https://omega.is" style="display:inline-block;text-decoration:none;"><img src="${EMAIL_LOGO_URL}" width="200" height="50" alt="Omega" style="display:block;width:200px;max-width:100%;height:auto;border:0;background-color:#fffdf8;color:#14120f;font-family:Georgia,'Times New Roman',serif;font-size:16px;"></a><span class="muted" style="display:block;margin-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#665e54;">Ljós og von fyrir Ísland</span>`;
