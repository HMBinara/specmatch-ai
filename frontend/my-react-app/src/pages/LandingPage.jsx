import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Cpu, FileText, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#15181d] text-[#eef0f3] font-body">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
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
            <section className="max-w-4xl mx-auto px-6 py-24 text-center">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#5eead4] border border-[#5eead4]/20 bg-[#5eead4]/5 px-3 py-1 rounded-full">
                    AI-driven resource allocation
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
                    className="bg-[#5eead4] text-[#0b0e12] px-7 py-3.5 rounded-lg text-sm font-600 hover:bg-[#7ff2e2] transition-all inline-flex items-center gap-2"
                >
                    Get started <ArrowRight className="w-4 h-4" />
                </button>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
                <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6">
                    <Users className="w-5 h-5 text-[#5eead4] mb-4" />
                    <h3 className="font-display text-base font-600 mb-2">Ingest your talent pool</h3>
                    <p className="font-body text-sm text-[#8b93a0] leading-relaxed">
                        Upload developer CVs once. Each résumé becomes a searchable skill profile in a persistent vector store.
                    </p>
                </div>
                <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6">
                    <FileText className="w-5 h-5 text-[#5eead4] mb-4" />
                    <h3 className="font-display text-base font-600 mb-2">Analyze any RFP</h3>
                    <p className="font-body text-sm text-[#8b93a0] leading-relaxed">
                        Drop in a client's requirements document. Gemini extracts the tech stack, features, and team size needed.
                    </p>
                </div>
                <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-6">
                    <Cpu className="w-5 h-5 text-[#5eead4] mb-4" />
                    <h3 className="font-display text-base font-600 mb-2">Get an honest match</h3>
                    <p className="font-body text-sm text-[#8b93a0] leading-relaxed">
                        A match score, proposed team allocation, and a clear list of skill gaps — no guesswork, no overselling.
                    </p>
                </div>
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