import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CompanyNameModal() {
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { completeCompanyProfile } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyName.trim()) {
            setError('Company name is required.');
            return;
        }
        setLoading(true);
        await completeCompanyProfile(companyName);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-50">
            <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-7 w-full max-w-sm">
                <h2 className="font-display text-xl font-700 mb-1">One more step</h2>
                <p className="font-body text-sm text-[#8b93a0] mb-5">
                    What's your company name? This sets up your workspace.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Zenith Global Solutions"
                        className="w-full bg-[#0e1013] border border-[#2c313a] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-[#5b636e]"
                    />
                    {error && <p className="text-xs text-[#fb7862]">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#5eead4] text-[#0b0e12] rounded-lg py-2.5 text-sm font-600 hover:bg-[#7ff2e2] disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Setting up...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}