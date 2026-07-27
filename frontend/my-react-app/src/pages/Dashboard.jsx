import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload, FileText, Users, Cpu, CheckCircle, AlertTriangle,
    TrendingUp, ScanLine, X, Loader2, FilePlus2, Target, History as HistoryIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import api from '../api';
import DeveloperList from '../components/DeveloperList';
import HistoryList from '../components/HistoryList';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import HistoryDetail from '../components/HistoryDetail';

/* ---------------------------------------------------------
   Global styles: fonts + keyframes for the signature
   "scan sweep" motion and toast/panel transitions.
--------------------------------------------------------- */
const GlobalStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .font-body { font-family: 'IBM Plex Sans', sans-serif; }

    @keyframes sweepX {
      0% { transform: translateX(-110%); }
      100% { transform: translateX(110%); }
    }
    .animate-sweep { animation: sweepX 1.4s ease-in-out infinite; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeUp { animation: fadeUp 0.35s ease-out both; }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-toastIn { animation: toastIn 0.25s ease-out both; }

        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 1.7s linear infinite;
        }

        @keyframes floatSoft {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
        }
        .animate-floatSoft { animation: floatSoft 4.8s ease-in-out infinite; }

        .premium-tilt {
            transform-style: preserve-3d;
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .premium-tilt:hover {
            transform: translateY(-2px) perspective(1000px) rotateX(1.4deg) rotateY(-1.2deg);
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
        }

    @keyframes dash {
      to { stroke-dashoffset: 0; }
    }

    ::selection { background: #5eead4; color: #0b0e12; }

    :focus-visible {
      outline: 2px solid #5eead4;
      outline-offset: 2px;
    }
  `}</style>
);

/* ---------------------------------------------------------
   Corner-bracket frame — the recurring "spec sheet" motif
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
   Toast system
--------------------------------------------------------- */
function useToasts() {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((message, tone = 'ok') => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, tone }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
    }, []);
    const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));
    return { toasts, push, dismiss };
}

const ToastStack = ({ toasts, dismiss }) => {
    const toneStyle = {
        ok: 'border-[#2c313a] bg-[#1c2027]',
        error: 'border-[#fb7862]/40 bg-[#1c2027]',
    };
    const dot = { ok: 'bg-[#4ade80]', error: 'bg-[#fb7862]' };
    return (
        <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-80">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 18, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 18, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className={`flex items-start gap-3 rounded-xl border ${toneStyle[t.tone]} px-4 py-3 shadow-xl shadow-black/30`}
                    >
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot[t.tone]}`} />
                        <p className="font-body text-sm text-[#dfe2e6] leading-snug flex-1">{t.message}</p>
                        <button onClick={() => dismiss(t.id)} className="text-[#8b93a0] hover:text-white shrink-0 transition-colors duration-150">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

const SkeletonBlock = ({ className = '' }) => (
    <div className={`rounded-md bg-gradient-to-r from-[#1a1e25] via-[#2a3039] to-[#1a1e25] animate-shimmer ${className}`} />
);

const CountUp = ({ value = 0, className = '', duration = 700 }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let rafId;
        const start = performance.now();
        const initialValue = displayValue;
        const target = Number(value) || 0;

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const nextValue = Math.round(initialValue + (target - initialValue) * progress);
            setDisplayValue(nextValue);
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            }
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [value, duration]);

    return <>{displayValue}</>;
};

const StructuredOutputSkeleton = () => (
    <CornerFrame className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2c313a] pb-4 mb-6">
            <div className="space-y-2">
                <SkeletonBlock className="h-3 w-32" />
                <SkeletonBlock className="h-6 w-56" />
            </div>
            <SkeletonBlock className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[#0e1013] p-5 rounded-lg border border-[#2c313a] space-y-4">
                <SkeletonBlock className="h-3 w-28" />
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((item) => (
                        <SkeletonBlock key={item} className="h-6 w-20 rounded-md" />
                    ))}
                </div>
            </div>
            <div className="bg-[#0e1013] p-5 rounded-lg border border-[#2c313a] md:col-span-2 space-y-4">
                <SkeletonBlock className="h-3 w-44" />
                <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                        <SkeletonBlock key={item} className="h-3 w-full" />
                    ))}
                </div>
            </div>
        </div>
    </CornerFrame>
);

/* ---------------------------------------------------------
   Drag & drop upload zone
--------------------------------------------------------- */
const DropZone = ({ file, onFile, label, accept = '.pdf' }) => {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onFile(dropped);
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 active:scale-[0.98]
        ${dragOver ? 'border-[#5eead4] bg-[#5eead4]/5' : 'border-[#2c313a] bg-[#0e1013] hover:border-[#3a4048]'}`}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            <FilePlus2 className={`w-5 h-5 mx-auto mb-2 ${dragOver ? 'text-[#5eead4]' : 'text-[#5b636e]'}`} />
            {file ? (
                <p className="font-mono text-xs text-[#dfe2e6] truncate">{file.name}</p>
            ) : (
                <>
                    <p className="font-body text-sm text-[#a7adb6]">{label}</p>
                    <p className="font-mono text-[11px] text-[#5b636e] mt-1 uppercase tracking-wider">drop file or click to browse</p>
                </>
            )}
        </div>
    );
};

/* ---------------------------------------------------------
   Scan-sweep overlay — signature loading motion
--------------------------------------------------------- */
const ScanOverlay = ({ label }) => (
    <div className="relative overflow-hidden rounded-xl border border-[#2c313a] bg-[#0e1013] px-5 py-6 shadow-[0_0_0_1px_rgba(94,234,212,0.04),0_18px_36px_rgba(0,0,0,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,234,212,0.12),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(127,119,221,0.10),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5eead4]/50 to-transparent" />
        <div className="flex items-center gap-3">
            <ScanLine className="w-4 h-4 text-[#5eead4] shrink-0 animate-floatSoft" />
            <p className="font-mono text-xs uppercase tracking-wider text-[#a7adb6]">{label}</p>
        </div>
        <div className="mt-4 h-1.5 w-full bg-[#1c2027] rounded-full overflow-hidden relative border border-[#2c313a]">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#5eead4] to-transparent animate-sweep shadow-[0_0_14px_rgba(94,234,212,0.45)]" />
        </div>
    </div>
);

/* ---------------------------------------------------------
   Radial gauge for the match score
--------------------------------------------------------- */
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
            <text x="38" y="34" textAnchor="middle" className="font-display" fill="#eef0f3" fontSize="16" fontWeight="700">
                <CountUp value={pct} />
            </text>
            <text x="38" y="48" textAnchor="middle" className="font-mono" fill="#5b636e" fontSize="8" letterSpacing="0.5">PERCENT</text>
        </svg>
    );
};

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('upload');
    const { toasts, push, dismiss } = useToasts();

    // CV Upload
    const [devName, setDevName] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [uploadingCv, setUploadingCv] = useState(false);

    // RFP Analysis
    const [rfpFile, setRfpFile] = useState(null);
    const [rfpData, setRfpData] = useState(null);
    const [loadingRfp, setLoadingRfp] = useState(false);

    // Matching
    const [matchReport, setMatchReport] = useState(null);
    const [loadingMatch, setLoadingMatch] = useState(false);
    const [savingReport, setSavingReport] = useState(false);

    const [historyDetail, setHistoryDetail] = useState(null);



    const handleCvUpload = async (e) => {
        e.preventDefault();
        if (!devName || !cvFile) {
            push('Add a developer name and choose a CV before indexing.', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('file', cvFile);
        setUploadingCv(true);
        try {
            const res = await api.post(
                `/upload-cv/?developer_name=${encodeURIComponent(devName)}`,
                formData
            );
            push(res.data.message || `${devName}'s CV was parsed and indexed.`, 'ok');
            setDevName('');
            setCvFile(null);
        } catch (err) {
            push(err.response?.data?.detail || 'Could not index that CV. Try again.', 'error');
        } finally {
            setUploadingCv(false);
        }
    };

    const handleRfpAnalysis = async (e) => {
        e.preventDefault();
        if (!rfpFile) return;
        setLoadingRfp(true);
        setRfpData(null);
        const formData = new FormData();
        formData.append('file', rfpFile);
        try {
            const res = await api.post('/analyze-rfp/', formData);
            setRfpData(res.data.data);
        } catch (err) {
            push(err.response?.data?.detail || 'Could not read that RFP. Try a different file.', 'error');
        } finally {
            setLoadingRfp(false);
        }
    };

    const triggerResourceMatching = async () => {
        if (!rfpData) return;
        setLoadingMatch(true);
        setMatchReport(null);
        try {
            const res = await api.post('/match-resources/', rfpData);
            setMatchReport(res.data.report);
            setActiveTab('match');
        } catch (err) {
            push(err.response?.data?.detail || 'Matching failed. Try running it again.', 'error');
        } finally {
            setLoadingMatch(false);
        }
    };

    const handleSaveReport = async () => {
        if (!currentUser || !matchReport || !rfpData) return;
        setSavingReport(true);
        try {
            await addDoc(collection(db, 'companies', currentUser.uid, 'reports'), {
                projectName: rfpData.project_name || 'Untitled project',
                rfpData,
                matchReport,
                createdAt: new Date().toISOString(),
            });
            push('Fitment saved to history.', 'ok');
        } catch (err) {
            push('Could not save this fitment. Try again.', 'error');
        } finally {
            setSavingReport(false);
        }
    };

    const handleSelectHistoryReport = (report) => {
        setHistoryDetail(report);
    };
    return (
        <div className="min-h-screen bg-[#15181d] text-[#eef0f3] font-body flex">
            <GlobalStyle />
            <ToastStack toasts={toasts} dismiss={dismiss} />
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 min-w-0">
                <main className="max-w-6xl mx-auto px-6 py-8">

                    {/* STEP 01 — INGEST TALENT */}
                    {activeTab === 'upload' && (
                        <div className="grid md:grid-cols-3 gap-6 items-start animate-fadeUp">
                            <CornerFrame className="md:col-span-1 bg-[#1c2027] border border-[#2c313a] rounded-xl p-6">
                                <h2 className="font-display text-base font-600 mb-1">Add developer profile</h2>
                                <p className="font-body text-sm text-[#8b93a0] mb-5 leading-relaxed">
                                    Index a CV into the vector store so it can be matched against future specs.
                                </p>
                                <form onSubmit={handleCvUpload} className="space-y-4">
                                    <div>
                                        <label className="block font-mono text-[10px] uppercase tracking-wider text-[#5b636e] mb-2">
                                            Developer name
                                        </label>
                                        <input
                                            type="text"
                                            value={devName}
                                            onChange={(e) => setDevName(e.target.value)}
                                            placeholder="e.g. Kasun Perera"
                                            className="w-full bg-[#0e1013] border border-[#2c313a] rounded-lg px-3.5 py-2.5 text-sm font-body focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-[#5b636e]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-mono text-[10px] uppercase tracking-wider text-[#5b636e] mb-2">
                                            CV document
                                        </label>
                                        <DropZone file={cvFile} onFile={setCvFile} label="Upload a PDF resume" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={uploadingCv}
                                        className="w-full bg-[#5eead4] text-[#0b0e12] rounded-lg py-2.5 text-sm font-600 hover:bg-[#7ff2e2] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {uploadingCv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        {uploadingCv ? 'Indexing…' : 'Parse & embed CV'}
                                    </button>
                                </form>
                                {uploadingCv && <div className="mt-4"><ScanOverlay label="Extracting skills & generating embeddings" /></div>}
                            </CornerFrame>

                            <CornerFrame className="md:col-span-2 bg-[#1c2027] border border-[#2c313a] rounded-xl p-8 flex flex-col justify-between min-h-[320px]">
                                <div>
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#5eead4] border border-[#5eead4]/20 bg-[#5eead4]/5 px-2.5 py-1 rounded-full">
                                        Vector store ingestion
                                    </span>
                                    <h2 className="font-display text-2xl font-700 mt-4 mb-3">Semantic knowledge base</h2>
                                    <p className="font-body text-sm text-[#8b93a0] leading-relaxed max-w-xl">
                                        Each résumé is converted from PDF to plain text, then passed through Gemini text embeddings
                                        (<code className="font-mono text-[#5eead4] text-xs">gemini-embedding-001</code>) so skills, domain
                                        experience, and seniority become vectors stored permanently in ChromaDB.
                                    </p>
                                </div>
                                <div className="border-t border-[#2c313a] pt-5 flex items-center justify-between font-mono text-[11px] text-[#5b636e] flex-wrap gap-2">
                                    <span>NODE STATUS: <span className="text-[#4ade80] font-600">● ACTIVE</span></span>
                                    <span>STORAGE: PERSISTENT VECTOR LOG</span>
                                </div>
                            </CornerFrame>
                        </div>
                    )}

                    {/* DEVELOPERS TAB */}
                    {activeTab === 'developers' && (
                        <div className="animate-fadeUp">
                            <h2 className="font-display text-xl font-700 mb-1">Talent pool</h2>
                            <p className="font-body text-sm text-[#8b93a0] mb-6">
                                Everyone currently indexed in your company's vector store.
                            </p>
                            <DeveloperList push={push} />
                        </div>
                    )}

                    {/* STEP 02 — ANALYZE RFP */}
                    {activeTab === 'rfp' && (
                        <div className="space-y-6 animate-fadeUp">
                            <CornerFrame className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6 max-w-2xl">
                                <h2 className="font-display text-base font-600 mb-1">Analyze client requirements</h2>
                                <p className="font-body text-sm text-[#8b93a0] mb-5 leading-relaxed">
                                    Upload an incoming RFP to extract the stack, features, and constraints it's asking for.
                                </p>
                                <form onSubmit={handleRfpAnalysis} className="flex flex-col sm:flex-row gap-4 sm:items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block font-mono text-[10px] uppercase tracking-wider text-[#5b636e] mb-2">
                                            RFP document
                                        </label>
                                        <DropZone file={rfpFile} onFile={setRfpFile} label="Upload the RFP as PDF" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loadingRfp || !rfpFile}
                                        className="w-full sm:w-auto bg-[#5eead4] text-[#0b0e12] px-5 py-2.5 rounded-lg text-sm font-600 hover:bg-[#7ff2e2] disabled:opacity-40 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {loadingRfp ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                                        {loadingRfp ? 'Reading…' : 'Analyze architecture'}
                                    </button>
                                </form>
                                {loadingRfp && <div className="mt-4"><ScanOverlay label="Extracting stack, features & constraints" /></div>}
                            </CornerFrame>

                            {loadingRfp && !rfpData && (
                                <div className="mt-2">
                                    <StructuredOutputSkeleton />
                                </div>
                            )}

                            {rfpData && (
                                <CornerFrame className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6 animate-fadeUp">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2c313a] pb-4 mb-6">
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#5eead4]">
                                                Structured output
                                            </span>
                                            <h3 className="font-display text-xl font-700 mt-1">{rfpData.project_name}</h3>
                                        </div>
                                        <button
                                            onClick={triggerResourceMatching}
                                            disabled={loadingMatch}
                                            className="bg-[#fbbf24] text-[#0b0e12] text-sm font-700 px-5 py-2.5 rounded-lg hover:bg-[#ffd35c] transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {loadingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                                            {loadingMatch ? 'Matching…' : 'Run fitment match'}
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-5">
                                        <div className="bg-[#0e1013] p-5 rounded-lg border border-[#2c313a]">
                                            <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#5b636e] mb-3 flex items-center gap-1.5">
                                                <Cpu className="w-3.5 h-3.5 text-[#5eead4]" /> Target stack
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {rfpData.technical_stack?.map((tech, idx) => (
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
                                                {rfpData.core_features?.map((feat, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-[#5eead4] font-bold mt-0.5">›</span> {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CornerFrame>
                            )}
                        </div>
                    )}

                    {/* STEP 03 — FITMENT MATRIX */}
                    {activeTab === 'match' && (
                        <div className="space-y-6 animate-fadeUp">

                            {loadingMatch ? (
                                <ScanOverlay label="Scoring candidates against the requirement vector" />
                            ) : !matchReport ? (
                                <CornerFrame className="text-center py-16 bg-[#1c2027]/40 border border-dashed border-[#2c313a] rounded-xl">
                                    <Users className="w-10 h-10 text-[#3a4048] mx-auto mb-4" />
                                    <h3 className="font-display text-base font-600 mb-1">No fitment report yet</h3>
                                    <p className="font-body text-sm text-[#5b636e] max-w-sm mx-auto">
                                        Analyze an RFP first, then run the fitment match to see who covers it and where the gaps are.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('rfp')}
                                        className="mt-5 font-mono text-xs uppercase tracking-wider text-[#5eead4] border border-[#5eead4]/30 px-4 py-2 rounded-lg hover:bg-[#5eead4]/5 transition-colors"
                                    >
                                        Go to RFP intelligence →
                                    </button>
                                </CornerFrame>
                            ) : (
                                <div className="space-y-6 animate-fadeUp">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-display text-xl font-700">Fitment results</h2>
                                        <button
                                            onClick={handleSaveReport}
                                            disabled={savingReport}
                                            className="bg-[#5eead4] text-[#0b0e12] px-5 py-2.5 rounded-lg text-sm font-600 hover:bg-[#7ff2e2] disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {savingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            {savingReport ? 'Saving…' : 'Save fitment'}
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-5">
                                        <CornerFrame className="bg-[#1c2027] border border-[#2c313a] p-5 rounded-xl flex items-center gap-4">
                                            <MatchGauge score={matchReport.overall_match_score} />
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
                                                {matchReport.critical_skills_gap?.length > 0 ? (
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
                                                    {matchReport.allocated_team?.map((member, idx) => (
                                                        <tr key={idx} className="hover:bg-[#0e1013]/50 transition-colors">
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
                                        <p className="font-body text-sm text-[#dfe2e6] leading-relaxed">{matchReport.hiring_recommendation}</p>
                                    </CornerFrame>
                                </div>
                            )}
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="animate-fadeUp">
                            {!historyDetail ? (
                                <>
                                    <h2 className="font-display text-xl font-700 mb-1">Fitment history</h2>
                                    <p className="font-body text-sm text-[#8b93a0] mb-6">
                                        Saved match results from previous RFPs.
                                    </p>
                                    <HistoryList onSelectReport={handleSelectHistoryReport} push={push} />
                                </>
                            ) : (
                                <HistoryDetail report={historyDetail} onBack={() => setHistoryDetail(null)} />
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}