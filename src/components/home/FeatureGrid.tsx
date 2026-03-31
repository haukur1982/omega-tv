'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
    { label: "Bein Útsending", desc: "Horfa á Omega í beinni", href: "/live" },
    { label: "Þáttasafn", desc: "Hundruð þátta á íslensku", href: "/sermons" },
    { label: "Bænatorg", desc: "Samfélag í bæn", href: "/baenatorg" },
    { label: "Styrkja", desc: "Vertu hluti af boðskapnum", href: "/give" },
];

export default function FeatureGrid() {
    return (
        <section className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border)]">
                {features.map((item, idx) => (
                    <Link key={idx} href={item.href} className="group">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            viewport={{ once: true }}
                            className="bg-[var(--bg-deep)] p-8 text-center hover:bg-[var(--bg-surface)] transition-colors duration-300"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--text-primary)] mb-2">
                                {item.label}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)]">
                                {item.desc}
                            </p>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
