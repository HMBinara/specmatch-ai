import React, { useState, useEffect } from 'react';
import { Loader2, History as HistoryIcon, ChevronRight, Trash2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function HistoryList({ onSelectReport, push }) {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'companies', currentUser.uid, 'reports'),
                    orderBy('createdAt', 'desc')
                );
                const snap = await getDocs(q);
                setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error('Could not load report history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [currentUser]);

    const handleDelete = async (e, reportId) => {
        e.stopPropagation();   // row click event එක fire වෙන එක prevent කරනවා
        setDeletingId(reportId);
        try {
            await deleteDoc(doc(db, 'companies', currentUser.uid, 'reports', reportId));
            setReports((prev) => prev.filter((r) => r.id !== reportId));
            push?.('Fitment removed from history.', 'ok');
        } catch (err) {
            push?.('Could not delete this fitment.', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const scoreColor = (score) => {
        if (score >= 75) return 'text-[#4ade80]';
        if (score >= 45) return 'text-[#fbbf24]';
        return 'text-[#fb7862]';
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-[#8b93a0] text-sm font-body py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading history…
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-16 bg-[#1c2027]/40 border border-dashed border-[#2c313a] rounded-xl">
                <HistoryIcon className="w-10 h-10 text-[#3a4048] mx-auto mb-4" />
                <h3 className="font-display text-base font-600 mb-1">No saved fitments yet</h3>
                <p className="font-body text-sm text-[#5b636e]">
                    Run a fitment match and click "Save fitment" to see it here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="border-b border-[#2c313a] font-mono text-[10px] uppercase tracking-wider text-[#5b636e] bg-[#0e1013]">
                        <th className="p-3.5">Project</th>
                        <th className="p-3.5">Match</th>
                        <th className="p-3.5">Saved</th>
                        <th className="p-3.5"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#2c313a]/60">
                    {reports.map((r) => (
                        <tr
                            key={r.id}
                            onClick={() => onSelectReport(r)}
                            className="hover:bg-[#0e1013]/50 transition-colors cursor-pointer"
                        >
                            <td className="p-3.5 font-body font-600 text-[#eef0f3]">{r.projectName || 'Untitled project'}</td>
                            <td className={`p-3.5 font-mono font-700 ${scoreColor(r.matchReport?.overall_match_score || 0)}`}>
                                {r.matchReport?.overall_match_score ?? '—'}%
                            </td>
                            <td className="p-3.5 text-[#8b93a0] text-xs font-mono">
                                {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                            </td>
                            <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={(e) => handleDelete(e, r.id)}
                                        disabled={deletingId === r.id}
                                        className="text-[#8b93a0] hover:text-[#fb7862] disabled:opacity-40 transition-colors"
                                    >
                                        {deletingId === r.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                    <ChevronRight className="w-4 h-4 text-[#5b636e]" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}