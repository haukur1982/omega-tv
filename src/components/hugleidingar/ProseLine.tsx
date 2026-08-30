'use client';

import { useEffect, useRef } from 'react';

/**
 * Prose that happens to be editable — never looks like a form field.
 *
 * THE RULE, borrowed from the phone review in book-system: this must never
 * grow an inner scrollbar. It is sized to its content, so a long paragraph
 * makes the page (or the sheet) taller rather than hiding its own tail.
 * `scrollHeight` is the padding box, so any borders are added back — the
 * bordered variant in the sheet ends up 2px short otherwise, and 2px short is
 * exactly the scrollbar this is not allowed to have.
 */
export default function ProseLine({
    value, onChange, onFocus, className = 'devo-prose-input',
}: {
    value: string;
    onChange: (v: string) => void;
    onFocus?: () => void;
    className?: string;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const s = window.getComputedStyle(el);
        const borders =
            parseFloat(s.borderTopWidth || '0') + parseFloat(s.borderBottomWidth || '0');
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight + borders}px`;
    }, [value, className]);
    return (
        <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            spellCheck
            lang="is"
            rows={1}
            className={className}
        />
    );
}
