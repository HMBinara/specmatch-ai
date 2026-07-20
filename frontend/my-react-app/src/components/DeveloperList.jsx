import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Users, FileText } from 'lucide-react';
import api from '../api';

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
        fetchDevelopers();
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
            <div className="flex items-center gap-2 text-[#8b93a0] text-sm font-body py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading developers…
            </div>
        );
    }

    if (developers.length === 0) {
        return (
            <div className="text-center py-16 bg-[#1c2027]/40 border border-dashed border-[#2c313a] rounded-xl">
                <Users className="w-10 h-10 text-[#3a4048] mx-auto mb-4" />
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
                <tbody className="divide-y divide-[#2c313a]/60">
                    {developers.map((dev) => (
                        <tr key={dev.id} className="hover:bg-[#0e1013]/50 transition-colors">
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}