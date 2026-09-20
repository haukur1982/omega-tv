// Render the canonical SVG lockup with the same fonts as the website.
// PNG keeps the mark and lettering intact in email clients without SVG/fonts.
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const svg = readFileSync(path.join(root, 'brand-assets/omega-lockup-horizontal.svg'), 'utf8')
    // The email sets the tagline as readable text beneath the compact logo.
    .replace(/<text x="252" y="262"[\s\S]*?<\/text>/, '')
    // Leave clear space around the lettering; the source's A reaches its edge.
    .replace('viewBox="0 0 1000 300"', 'viewBox="-20 -10 1100 275"')
    .replaceAll('currentColor', '#14120F');
const logo = new Resvg(svg, {
    background: '#fffdf8',
    fitTo: { mode: 'width', value: 800 },
    font: {
        fontFiles: ['Fraunces.ttf', 'Inter.ttf', 'Newsreader.ttf'].map(name => path.join(root, 'src/assets/poster-fonts', name)),
        loadSystemFonts: false,
        defaultFontFamily: 'Fraunces',
    },
}).render().asPng();
mkdirSync(path.join(root, 'public/email'), { recursive: true });
writeFileSync(path.join(root, 'public/email/omega-wordmark.png'), logo);
console.log(`Omega email logo: 800 × 200, ${logo.byteLength} bytes`);
