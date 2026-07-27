import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Cpu, FileText, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#15181d] text-[#eef0f3] font-body">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }

                @keyframes driftMesh {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    33% { transform: translate3d(18px, -12px, 0) scale(1.03); }
                    66% { transform: translate3d(-14px, 10px, 0) scale(0.98); }
                }
                .animate-driftMesh { animation: driftMesh 16s ease-in-out infinite; }

                .landing-tilt {
                    transform-style: preserve-3d;
                    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
                }
                .landing-tilt:hover {
                    transform: translateY(-3px) perspective(1000px) rotateX(1.6deg) rotateY(-1.2deg);
                    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
                }
      `}</style>

            {/* Header */}
            <header className="border-b border-[#2c313a] sticky top-0 bg-[#15181d]/80 backdrop-blur-md z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1c2027] border border-[#2c313a] flex items-center justify-center">
                            <Target className="w-5 h-5 text-[#5eead4]" />
                        </div>
                        <h1 className="font-display text-lg font-700">SpecMatch AI</h1>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-[#5eead4] text-[#0b0e12] px-5 py-2 rounded-lg text-sm font-600 hover:bg-[#7ff2e2] transition-all"
                    >
                        Sign in
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-4xl mx-auto px-6 py-24 text-center overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-[#5eead4]/10 blur-3xl animate-driftMesh" />
                    <div className="absolute left-[18%] top-20 h-56 w-56 rounded-full bg-[#7f77dd]/10 blur-3xl animate-driftMesh" />
                    <div className="absolute right-[12%] top-28 h-64 w-64 rounded-full bg-[#5eead4]/8 blur-3xl animate-driftMesh" />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#5eead4] border border-[#5eead4]/20 bg-[#5eead4]/5 px-3 py-1 rounded-full inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5eead4] animate-pulse" /> AI-driven resource allocation
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-700 mt-6 mb-5 leading-tight">
                    Match your engineering team<br />to every RFP, instantly
                </h2>
                <p className="font-body text-[#8b93a0] text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                    Upload client requirements and your developer CVs. SpecMatch AI reads both,
                    finds the best-fit team, and flags the skills gaps before you commit.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="group relative overflow-hidden bg-[#5eead4] text-[#0b0e12] px-7 py-3.5 rounded-lg text-sm font-600 hover:bg-[#7ff2e2] transition-all duration-200 active:scale-[0.98] inline-flex items-center gap-2 shadow-[0_0_0_1px_rgba(94,234,212,0.12)] hover:shadow-[0_14px_28px_rgba(94,234,212,0.18)]"
                >
                    <span className="absolute inset-x-4 bottom-2 h-px origin-left scale-x-0 bg-[#0b0e12]/70 transition-transform duration-200 group-hover:scale-x-100" />
                    Get started <ArrowRight className="w-4 h-4" />
                </button>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
                {[
                    {
                        icon: Users,
                        title: 'Ingest your talent pool',
                        text: 'Upload developer CVs once. Each résumé becomes a searchable skill profile in a persistent vector store.',
                    },
                    {
                        icon: FileText,
                        title: 'Analyze any RFP',
                        text: "Drop in a client's requirements document. Gemini extracts the tech stack, features, and team size needed.",
                    },
                    {
                        icon: Cpu,
                        title: 'Get an honest match',
                        text: 'A match score, proposed team allocation, and a clear list of skill gaps — no guesswork, no overselling.',
                    },
                ].map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.title}
                            className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6 landing-tilt"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
                        >
                            <Icon className="w-5 h-5 text-[#5eead4] mb-4" />
                            <h3 className="font-display text-base font-600 mb-2">{card.title}</h3>
                            <p className="font-body text-sm text-[#8b93a0] leading-relaxed">{card.text}</p>
                        </motion.div>
                    );
                })}
            </section>

            {/* Footer */}
            <footer className="border-t border-[#2c313a] py-8">
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between font-mono text-[11px] text-[#5b636e]">
                    <span>SpecMatch AI &copy; 2026</span>
                    <span>DOC-ID: RAG-RESOURCE-ALLOC // REV 2.4</span>
                </div>
            </footer>
        </div>
    );
}