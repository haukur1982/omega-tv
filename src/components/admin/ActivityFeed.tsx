'use client';

import { motion } from 'framer-motion';
import { Heart, Mail, FileText, Check, Clock } from 'lucide-react';

interface Activity {
    id: string;
    type: 'prayer' | 'subscriber' | 'newsletter';
    title: string;
    subtitle?: string;
    timestamp: string;
    status?: 'pending' | 'approved' | 'sent';
}

interface ActivityFeedProps {
    activities: Activity[];
    isLoading?: boolean;
}

const icons = {
    prayer: Heart,
    subscriber: Mail,
    newsletter: FileText,
};

const statusColors = {
    pending: 'var(--admin-warning)',
    approved: 'var(--admin-success)',
    sent: 'var(--admin-info)',
};

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="admin-h3">Nýleg virkni</h3>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg admin-skeleton" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 admin-skeleton" />
                                <div className="h-3 w-1/2 admin-skeleton" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="admin-h3">Nýleg virkni</h3>
                </div>
                <div className="admin-empty py-8">
                    <Clock className="admin-empty-icon" />
                    <p className="admin-body">Engin virkni ennþá</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="admin-h3">Nýleg virkni</h3>
            </div>
            <div className="space-y-1">
                {activities.map((activity, index) => {
                    const Icon = icons[activity.type];
                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--admin-surface-hover)] transition-colors cursor-pointer group"
                        >
                            <div className={`
                                w-9 h-9 rounded-lg flex items-center justify-center
                                ${activity.type === 'prayer' ? 'bg-[var(--admin-error-subtle)] text-[var(--admin-error)]' : ''}
                                ${activity.type === 'subscriber' ? 'bg-[var(--admin-success-subtle)] text-[var(--admin-success)]' : ''}
                                ${activity.type === 'newsletter' ? 'bg-[var(--admin-info-subtle)] text-[var(--admin-info)]' : ''}
                            `}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[var(--admin-text)] truncate group-hover:text-[var(--admin-accent)] transition-colors">
                                    {activity.title}
                                </p>
                                {activity.subtitle && (
                                    <p className="admin-caption truncate">{activity.subtitle}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {activity.status && (
                                    <span className={`admin-badge ${activity.status === 'pending' ? 'admin-badge-warning' :
                                            activity.status === 'approved' ? 'admin-badge-success' :
                                                'admin-badge-info'
                                        }`}>
                                        {activity.status === 'pending' && 'Bíður'}
                                        {activity.status === 'approved' && 'Samþykkt'}
                                        {activity.status === 'sent' && 'Sent'}
                                    </span>
                                )}
                                <span className="admin-caption whitespace-nowrap">{activity.timestamp}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
