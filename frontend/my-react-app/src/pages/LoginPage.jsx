import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const { signup, login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignup) {
                if (!companyName.trim()) throw new Error('Company name is required.');
                await signup(companyName, email, password);
            } else {
                await login(email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#15181d] text-[#eef0f3] font-body flex items-center justify-center px-6">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

            <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 justify-center mb-8">
                    <div className="w-10 h-10 rounded-lg bg-[#1c2027] border border-[#2c313a] flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#5eead4]" />
                    </div>
                    <h1 className="font-display text-lg font-700">SpecMatch AI</h1>
                </div>

                <div className="bg-[#1c2027] border border-[#2c313a] rounded-xl p-7">
                    <h2 className="font-display text-xl font-700 mb-1">
                        {isSignup ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="font-body text-sm text-[#8b93a0] mb-6">
                        {isSignup ? 'Set up your company workspace' : 'Sign in to your workspace'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignup && (
                            <div>
                                <label className="block font-body text-xs uppercase tracking-wider text-[#5b636e] mb-2">
                                    Company name
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g. Zenith Global Solutions"
                                    className="w-full bg-[#0e1013] border border-[#2c313a] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-[#5b636e]"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block font-body text-xs uppercase tracking-wider text-[#5b636e] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full bg-[#0e1013] border border-[#2c313a] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-[#5b636e]"
                            />
                        </div>
                        <div>
                            <label className="block font-body text-xs uppercase tracking-wider text-[#5b636e] mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#0e1013] border border-[#2c313a] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-[#5b636e]"
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-[#fb7862] font-body">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#5eead4] text-[#0b0e12] rounded-lg py-2.5 text-sm font-600 hover:bg-[#7ff2e2] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSignup ? 'Create account' : 'Sign in'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[#2c313a]" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#5b636e]">or</span>
                        <div className="flex-1 h-px bg-[#2c313a]" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full bg-[#0e1013] border border-[#2c313a] rounded-lg py-2.5 text-sm font-600 hover:border-[#3a4048] disabled:opacity-50 transition-all flex items-center justify-center gap-2.5"
                    >
                        {googleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z" />
                                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C34 6.5 29.3 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z" />
                                <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.4 0-9.9-3.6-11.5-8.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z" />
                                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 5l6.2 5.2C41.4 34.7 43.5 30 43.5 24c0-1.2-.1-2.4-.4-3.5z" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    <p className="text-center text-xs text-[#5b636e] mt-6 font-body">
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => { setIsSignup(!isSignup); setError(''); }}
                            className="text-[#5eead4] hover:underline"
                        >
                            {isSignup ? 'Sign in' : 'Sign up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}