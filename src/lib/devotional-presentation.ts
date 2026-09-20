/** Presentation only: the reviewed wording is never rewritten. */
export function isScriptureParagraph(text: string) {
    return /^[„“"]/.test(text.trim()) && /[“”"]\s*[^“”"]*\d+[.:]\d/.test(text.trim());
}

/** Keeps even the original separator so presentation never changes the text. */
export function splitScriptureParagraph(text: string) {
    if (!isScriptureParagraph(text)) return null;
    const parts = text.match(/^([\s\S]*[“”"])(\s+)([^“”"]*\d+[.:]\d[^\n]*)$/u);
    return parts ? { quote: parts[1], separator: parts[2], reference: parts[3] } : null;
}

export function devotionalReadingMinutes(paragraphs: string[]) {
    const words = paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 180));
}

export function escapeEmailHtml(text: string) {
    return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
