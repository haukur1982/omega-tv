import { escapeEmailHtml as esc } from './devotional-presentation';
import type { UnsubscribeList } from './subscription-unsubscribe';

const headers = {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};
function page(title: string, body: string, status = 200) {
    return new Response(`<!doctype html><html lang="is"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Omega</title>
<style>body{margin:0;background:#1b1814;color:#25221d;font:18px/1.7 Arial,Helvetica,sans-serif}main{box-sizing:border-box;max-width:600px;margin:8vh auto;padding:40px 32px;background:#fffdf8;border-top:3px solid #416b97}h1{font:normal 36px/1.2 Georgia,serif}p{margin:0 0 24px}a{color:#31577f}button{font:600 17px/1.4 Arial,sans-serif;background:#416b97;color:white;border:0;border-radius:4px;padding:16px 22px;cursor:pointer;min-height:48px}button:focus-visible,a:focus-visible{outline:3px solid #416b97;outline-offset:5px}.brand{font:23px Georgia,serif;letter-spacing:2px;margin-bottom:32px}footer{margin-top:32px;font-size:15px}@media(max-width:600px){main{margin:24px 12px;padding:32px 24px}}</style></head>
<body><main><p class="brand">Ω OMEGA</p><h1>${title}</h1>${body}<footer><a href="/hugleidingar#lesa">Lesa hugleiðingar</a> · <a href="/">Omega.is</a></footer></main></body></html>`, {
        status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
    });
}
function parse(url: string) {
    const params = new URL(url).searchParams;
    const token = params.get('token');
    const list = params.get('list') ?? 'all';
    if (!token || !/^[A-Za-z0-9_-]{16,200}$/.test(token) || !['all', 'devotionals'].includes(list)) return null;
    return { token, list: list as UnsubscribeList };
}
const invalid = () => page('Slóðin virkar ekki', '<p>Opnaðu afskráningarslóðina í síðasta tölvupóstinum frá Omega.</p>', 400);

export function unsubscribeHandlers(remove: (token: string, list: UnsubscribeList) => Promise<void>) {
    return {
        async GET(request: Request) {
            const input = parse(request.url);
            if (!input) return invalid();
            const devotional = input.list === 'devotionals';
            const action = `/api/subscribers/unsubscribe?token=${encodeURIComponent(input.token)}&list=${input.list}`;
            return page(devotional ? 'Afskrá hugleiðingar?' : 'Afskrá tölvupósta frá Omega?',
                `<p>${devotional ? 'Þú hættir að fá hugleiðingar í tölvupósti. Aðrir póstlistar Omega sem þú hefur valið haldast óbreyttir.' : 'Þú hættir að fá tölvupósta af póstlistum Omega.'}</p><p>Hugleiðingarnar verða áfram opnar þér á vefnum.</p><form method="post" action="${esc(action)}"><input type="hidden" name="intent" value="unsubscribe"><button type="submit">${devotional ? 'Afskrá hugleiðingar' : 'Afskrá alla póstlista Omega'}</button></form>`);
        },
        async POST(request: Request) {
            const input = parse(request.url);
            if (!input) return invalid();
            let form: FormData;
            try { form = await request.formData(); } catch { return invalid(); }
            const oneClick = form.get('List-Unsubscribe') === 'One-Click';
            if (!oneClick && form.get('intent') !== 'unsubscribe') return invalid();
            try {
                await remove(input.token, input.list);
                if (oneClick) return new Response(null, { status: 200, headers });
                return page('Afskráning tókst', `<p>${input.list === 'devotionals' ? 'Þú ert ekki lengur á póstlista hugleiðinga. Aðrir póstlistar sem þú hefur valið haldast óbreyttir.' : 'Þú ert ekki lengur á póstlistum Omega.'}</p><p>Takk fyrir samfylgdina. Þú ert alltaf velkomin eða velkominn að lesa á vefnum.</p>`);
            } catch {
                console.error('Unsubscribe could not be completed');
                if (oneClick) return new Response(null, { status: 503, headers });
                const retryUrl = `/api/subscribers/unsubscribe?token=${encodeURIComponent(input.token)}&list=${input.list}`;
                return page('Ekki tókst að afskrá', `<p>Reyndu aftur eftir smástund. Ekki tókst að staðfesta afskráninguna.</p><p><a href="${esc(retryUrl)}">Reyna aftur</a></p>`, 503);
            }
        },
    };
}
