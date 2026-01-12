'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: React.ReactNode;
    subtitle?: string;
}

export default function StatCard({ label, value, trend, icon, subtitle }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card"
        >
            <div className="flex items-start justify-between mb-3">
                <span className="admin-label">{label}</span>
                {icon && (
                    <div className="w-8 h-8 rounded-lg bg-[var(--admin-accent-subtle)] flex items-center justify-center text-[var(--admin-accent)]">
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end gap-3">
                <span className="admin-stat-number">{value}</span>

                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium mb-1 ${trend.isPositive ? 'text-[var(--admin-success)]' : 'text-[var(--admin-error)]'
                        }`}>
                        {trend.isPositive ? (
                            <TrendingUp size={14} />
                        ) : trend.value === 0 ? (
                            <Minus size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                        <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                    </div>
                )}
            </div>

            {subtitle && (
                <p className="admin-caption mt-2">{subtitle}</p>
            )}
        </motion.div>
    );
}
