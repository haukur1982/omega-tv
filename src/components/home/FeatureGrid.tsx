'use client';

import { motion } from 'framer-motion';
import { Tv, Heart, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: Tv,
        label: "Í Loftinu",
        desc: "24/7 Útsending",
        href: "/live",
        color: "bg-blue-600"
    },
    {
        icon: BookOpen,
        label: "Brunnurinn",
        desc: "Eldri Þættir",
        href: "/sermons",
        color: "bg-emerald-600"
    },
    {
        icon: Heart,
        label: "Sáðkorn",
        desc: "Efla Ríkið",
        href: "/give",
        color: "bg-rose-600"
    },
    {
        icon: Users,
        label: "Hjartað",
        desc: "33 Ár af Náð",
        href: "/about",
        color: "bg-violet-600"
    },
];

export default function FeatureGrid() {
    return (
        <section className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {features.map((item, idx) => (
                    <Link key={idx} href={item.href} className="group">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="relative p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--glass-border)] hover:border-[var(--glass-shine)] transition-colors overflow-hidden group-hover:-translate-y-1 duration-300"
                        >
                            {/* Hover Glow Background */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${item.color}`} />

                            <div className="relative z-10 flex flex-col items-center text-center gap-4">
                                <div className={`p-4 rounded-full ${item.color} text-white shadow-lg shadow-black/50 group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{item.label}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
