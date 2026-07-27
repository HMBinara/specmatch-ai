import React, { useState, useRef } from 'react';
import {
    ArrowLeft, Cpu, FileText, Target, CheckCircle, AlertTriangle, TrendingUp, Loader2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const CornerFrame = ({ children, className = '' }) => (
    <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`relative premium-tilt ${className}`}
    >
        <span className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#3a4048] rounded-tl-md pointer-events-none" />
        <span className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#3a4048] rounded-tr-md pointer-events-none" />
        <span className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#3a4048] rounded-bl-md pointer-events-none" />
        <span className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#3a4048] rounded-br-md pointer-events-none" />
        {children}
    </motion.div>
);

const CountUp = ({ value = 0, duration = 700 }) => {
    const [displayValue, setDisplayValue] = useState(value);

    React.useEffect(() => {
        let rafId;
        const start = performance.now();
        const initialValue = displayValue;
        const target = Number(value) || 0;

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setDisplayValue(Math.round(initialValue + (target - initialValue) * progress));
            if (progress < 1) rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [value, duration]);

    return <>{displayValue}</>;
};

const MatchGauge = ({ score = 0 }) => {
    const r = 30;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, score));
    const offset = c - (pct / 100) * c;
    const color = pct >= 75 ? '#4ade80' : pct >= 45 ? '#fbbf24' : '#fb7862';
    const glow = pct >= 75 ? 'drop-shadow-[0_0_10px_rgba(74,222,128,0.32)]' : pct >= 45 ? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.28)]' : 'drop-shadow-[0_0_10px_rgba(251,120,98,0.28)]';
    return (
        <svg width="76" height="76" viewBox="0 0 76 76" className={`shrink-0 ${glow}`}>
            <circle cx="38" cy="38" r={r} fill="none" stroke="#23272f" strokeWidth="6" />
            <circle
                cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6"
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
                transform="rotate(-90 38 38)" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="38" y="34" textAnchor="middle" className="font-display" fill="#eef0f3" fontSize="16" fontWeight="700"><CountUp value={pct} /></text>
            <text x="38" y="48" textAnchor="middle" className="font-mono" fill="#5b636e" fontSize="8" letterSpacing="0.5">PERCENT</text>
        </svg>
    );
};

export default function HistoryDetail({ report, onBack }) {
    const [showMatch, setShowMatch] = useState(false);
    const matchRef = useRef(null);
    const { rfpData, matchReport } = report;

    const handleShowMatch = () => {
        setShowMatch(true);
        setTimeout(() => {
            matchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    };

    return (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-[#8b93a0] hover:text-[#eef0f3] transition-colors duration-200 active:scale-[0.98]"
            >
                <ArrowLeft className="w-4 h-4" /> Back to history
            </button>

            {/* RFP OUTPUT */}
            <CornerFrame className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2c313a] pb-4 mb-6">
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#5eead4]">
                            Structured output
                        </span>
                        <h3 className="font-display text-xl font-700 mt-1">{rfpData?.project_name}</h3>
                    </div>
                    {!showMatch && (
                        <button
                            onClick={handleShowMatch}
                            className="bg-[#fbbf24] text-[#0b0e12] text-sm font-700 px-5 py-2.5 rounded-lg hover:bg-[#ffd35c] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] hover:shadow-[0_12px_24px_rgba(251,191,36,0.18)]"
                        >
                            <Target className="w-4 h-4" /> Fitment match
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    <div className="bg-[#0e1013] p-5 rounded-lg border border-[#2c313a]">
                        <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#5b636e] mb-3 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-[#5eead4]" /> Target stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {rfpData?.technical_stack?.map((tech, idx) => (
                                <span key={idx} className="bg-[#1c2027] border border-[#2c313a] text-[#dfe2e6] text-xs px-2.5 py-1 rounded-md font-mono">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0e1013] p-5 rounded-lg border border-[#2c313a] md:col-span-2">
                        <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#5b636e] mb-3 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#5eead4]" /> Core capabilities requested
                        </h4>
                        <ul className="space-y-2 text-sm text-[#dfe2e6] font-body">
                            {rfpData?.core_features?.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-[#5eead4] font-bold mt-0.5">›</span> {feat}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CornerFrame>

            {/* FITMENT RESULTS - reveals below, on the same page */}
            <AnimatePresence>
                {showMatch && (
                    <motion.div
                        ref={matchRef}
                        className="space-y-6"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                    >
                        <div className="grid md:grid-cols-4 gap-5">
                            <CornerFrame className="bg-[#1c2027] border border-[#2c313a] p-5 rounded-xl flex items-center gap-4">
                                <MatchGauge score={matchReport?.overall_match_score} />
                                <div>
                                    <p className="font-mono text-[10px] uppercase text-[#5b636e] tracking-wider">Match affinity</p>
                                    <p className="font-body text-xs text-[#8b93a0] mt-1">vs. requirement vector</p>
                                </div>
                            </CornerFrame>

                            <CornerFrame className="bg-[#1c2027] border border-[#2c313a] p-5 rounded-xl md:col-span-3 flex flex-col justify-center">
                                <p className="font-mono text-[10px] uppercase text-[#fb7862] tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Critical gaps
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2.5">
                                    {matchReport?.critical_skills_gap?.length > 0 ? (
                                        matchReport.critical_skills_gap.map((gap, idx) => (
                                            <span key={idx} className="bg-[#fb7862]/10 border border-[#fb7862]/25 text-[#fb7862] text-xs px-2.5 py-1 rounded-md font-mono">
                                                {gap}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-[#8b93a0] flex items-center gap-1.5 font-body">
                                            <CheckCircle className="w-3.5 h-3.5 text-[#4ade80]" /> No coverage gaps detected.
                                        </span>
                                    )}
                                </div>
                            </CornerFrame>
                        </div>

                        <CornerFrame className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6">
                            <h3 className="font-display text-sm font-600 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#5eead4]" /> Proposed allocation
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#2c313a] font-mono text-[10px] uppercase tracking-wider text-[#5b636e] bg-[#0e1013]">
                                            <th className="p-3.5">Resource</th>
                                            <th className="p-3.5">Role</th>
                                            <th className="p-3.5">Overlapping skills</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2c313a]/60">
                                        {matchReport?.allocated_team?.map((member, idx) => (
                                            <tr key={idx} className="hover:bg-[#0e1013]/50 transition-all duration-200 hover:[transform:perspective(1000px)_translateY(-1px)_rotateX(1deg)]">
                                                <td className="p-3.5 font-body font-600 text-[#eef0f3]">{member.name}</td>
                                                <td className="p-3.5">
                                                    <span className="bg-[#5eead4]/10 text-[#5eead4] text-xs px-2.5 py-1 rounded-md font-mono border border-[#5eead4]/15">
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="p-3.5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {member.matched_skills?.map((skill, sIdx) => (
                                                            <span key={sIdx} className="bg-[#0e1013] text-[#a7adb6] text-xs px-2 py-0.5 rounded border border-[#2c313a] font-mono">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CornerFrame>

                        <CornerFrame className="bg-[#1c2027] border border-[#2c313a] p-6 rounded-xl">
                            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[#a7adb6] flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-[#4ade80]" /> Hiring & upskilling advisory
                            </h3>
                            <p className="font-body text-sm text-[#dfe2e6] leading-relaxed">{matchReport?.hiring_recommendation}</p>
                        </CornerFrame>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}