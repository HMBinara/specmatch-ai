import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Users, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const rowContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const rowItem = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
};

const SkeletonLine = ({ className = '' }) => (
    <div className={`rounded-md bg-gradient-to-r from-[#1a1e25] via-[#2a3039] to-[#1a1e25] animate-shimmer ${className}`} />
);

export default function DeveloperList({ push }) {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchDevelopers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/developers/');
            setDevelopers(res.data.developers || []);
        } catch (err) {
            push(err.response?.data?.detail || 'Could not load developers.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchDevelopers();
        };
        loadData();
    }, []);

    const handleDelete = async (docId, name) => {
        setDeletingId(docId);
        try {
            await api.delete(`/developers/${docId}`);
            setDevelopers((prev) => prev.filter((d) => d.id !== docId));
            push(`${name} removed from the talent pool.`, 'ok');
        } catch (err) {
            push(err.response?.data?.detail || 'Could not remove developer.', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl overflow-hidden p-4">
                <div className="space-y-3">
                    <SkeletonLine className="h-4 w-32" />
                    <div className="grid gap-3">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="grid grid-cols-12 gap-3 items-center rounded-lg border border-[#2c313a] bg-[#0e1013] p-3">
                                <SkeletonLine className="h-4 col-span-4" />
                                <SkeletonLine className="h-4 col-span-5" />
                                <SkeletonLine className="h-8 w-8 col-span-1 col-start-12 justify-self-end rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (developers.length === 0) {
        return (
            <div className="text-center py-16 bg-[#1c2027]/40 border border-dashed border-[#2c313a] rounded-xl">
                <Users className="w-10 h-10 text-[#3a4048] mx-auto mb-4 animate-floatSoft" />
                <h3 className="font-display text-base font-600 mb-1">No developers yet</h3>
                <p className="font-body text-sm text-[#5b636e]">
                    Upload a CV from the Ingest Talent tab to see it here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="border-b border-[#2c313a] font-mono text-[10px] uppercase tracking-wider text-[#5b636e] bg-[#0e1013]">
                        <th className="p-3.5">Developer</th>
                        <th className="p-3.5">CV file</th>
                        <th className="p-3.5 text-right">Action</th>
                    </tr>
                </thead>
                <motion.tbody
                    className="divide-y divide-[#2c313a]/60"
                    variants={rowContainer}
                    initial="hidden"
                    animate="show"
                >
                    {developers.map((dev) => (
                        <motion.tr
                            key={dev.id}
                            variants={rowItem}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="hover:bg-[#0e1013]/50 transition-all duration-200 hover:[transform:perspective(1000px)_translateY(-1px)_rotateX(1deg)]"
                        >
                            <td className="p-3.5 font-body font-600 text-[#eef0f3]">{dev.developer_name}</td>
                            <td className="p-3.5">
                                <span className="flex items-center gap-1.5 text-[#8b93a0] text-xs font-mono">
                                    <FileText className="w-3.5 h-3.5" /> {dev.filename}
                                </span>
                            </td>
                            <td className="p-3.5 text-right">
                                <button
                                    onClick={() => handleDelete(dev.id, dev.developer_name)}
                                    disabled={deletingId === dev.id}
                                    className="text-[#8b93a0] hover:text-[#fb7862] disabled:opacity-40 transition-colors"
                                >
                                    {deletingId === dev.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </motion.tbody>
            </table>
        </div>
    );
}