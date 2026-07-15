'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Reveal — the brand's "ink on vellum" arrival (motion rule 1) as a
 * scroll-triggered primitive: opacity 0→1 + blur(6px) saturate(0.8)→none
 * over 650ms cubic-bezier(0.2,0,0.1,1), staggered by `delay`.
 * Fires once. Fully disabled under prefers-reduced-motion.
 */
export default function Reveal({
    children,
    delay = 0,
    style,
}: {
    children: ReactNode;
    delay?: number;
    style?: CSSProperties;
}) {
    const reduce = useReducedMotion();
    if (reduce) return <div style={style}>{children}</div>;
    return (
        <motion.div
            style={style}
            initial={{ opacity: 0, filter: 'blur(6px) saturate(0.8)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px) saturate(1)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay, ease: [0.2, 0, 0.1, 1] }}
        >
            {children}
        </motion.div>
    );
}
