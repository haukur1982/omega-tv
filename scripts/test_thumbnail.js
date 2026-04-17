const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
    const width = 1280, height = 720;
    const outDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Generate a base frame locally — no network needed
    const base = await sharp({
        create: { width, height, channels: 3, background: { r: 60, g: 40, b: 30 } }
    }).jpeg().toBuffer();

    const vignette = Buffer.from(`<svg width="${width}" height="${height}"><defs><radialGradient id="v" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="black" stop-opacity="0"/><stop offset="70%" stop-color="black" stop-opacity="0.15"/><stop offset="100%" stop-color="black" stop-opacity="0.55"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#v)"/></svg>`);

    const gh = Math.round(height * 0.55);
    const gradient = Buffer.from(`<svg width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="black" stop-opacity="0"/><stop offset="40%" stop-color="black" stop-opacity="0.3"/><stop offset="100%" stop-color="black" stop-opacity="0.85"/></linearGradient></defs><rect y="${height-gh}" width="${width}" height="${gh}" fill="url(#g)"/></svg>`);

    const p = 64, by = height - p;
    const text = Buffer.from(`<svg width="${width}" height="${height}"><defs><filter id="s" x="-2%" y="-2%" width="104%" height="104%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="black" flood-opacity="0.5"/></filter></defs><text x="${p}" y="${by-57}" font-family="Inter,sans-serif" font-size="23" font-weight="700" fill="#5b8abf" letter-spacing="0.2em" opacity="0.9">OMEGA TV</text><text x="${p}" y="${by-8}" font-family="Georgia,serif" font-size="41" font-weight="700" fill="white"><tspan filter="url(#s)">Gu\u00F0 er tryggur — Hann yfirgefur okkur aldrei</tspan></text></svg>`);

    const result = await sharp(base)
        .resize(width, height, { fit: 'cover' })
        .modulate({ saturation: 1.2, brightness: 1.05 })
        .composite([
            { input: vignette, top: 0, left: 0 },
            { input: gradient, top: 0, left: 0 },
            { input: text, top: 0, left: 0 },
        ])
        .png()
        .toBuffer();

    const outPath = path.join(outDir, 'thumb_cinematic.png');
    fs.writeFileSync(outPath, result);
    console.log('Done:', outPath, '(' + Math.round(result.length/1024) + ' KB)');
}

main().catch(e => console.error(e.message));
