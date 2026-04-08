'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type AuthTab = 'login' | 'signup';

export default function LoginPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<AuthTab>('login');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signupData, setSignupData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false, role: 'TENANT'
    });

    const [errorMsg, setErrorMsg] = useState('');


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (email && password) {
            try {
                const res = await signIn('credentials', { email, password, redirect: false });
                if (res?.error) { setErrorMsg('Invalid email or password.'); return; }
                router.push('/dashboard/tenant/profile');
                router.refresh();
            } catch { setErrorMsg('An error occurred. Please try again.'); }
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!signupData.terms) { setErrorMsg('Please agree to the Terms of Service.'); return; }
        if (signupData.password !== signupData.confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: signupData.name, 
                    email: signupData.email, 
                    phone: signupData.phone, 
                    password: signupData.password, 
                    role: signupData.role
                })
            });
            if (!res.ok) { const err = await res.json(); setErrorMsg(`Signup failed: ${err.message}`); return; }
            const signInRes = await signIn('credentials', { email: signupData.email, password: signupData.password, redirect: false });
            if (signInRes?.error) { setActiveTab('login'); return; }
            router.push('/dashboard/tenant/profile');
            router.refresh();
        } catch { setErrorMsg('An error occurred during signup.'); }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all font-[inherit] focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100";
    const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left hero — hidden on mobile */}
            <div className="hidden md:flex flex-col justify-center w-[45%] bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 px-12 py-16 relative overflow-hidden">
                {/* Background circles */}
                <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-white/5" />

                <button className="flex items-center gap-2 text-white font-bold text-2xl mb-10 self-start" onClick={() => router.push('/')}>
                    <i className="fas fa-home" /> Roomefy
                </button>

                <h2 className="text-3xl font-black text-white leading-tight mb-4">
                    Unlock premium living across India's top corporate spaces.
                </h2>
                <p className="text-rose-100 text-sm leading-relaxed mb-10">
                    Thousands of verified rooms for working professionals. Move in as fast as tomorrow.
                </p>

                <div className="flex flex-col gap-5">
                    {[
                        { icon: 'fa-shield-alt', title: '100% Verified',  desc: 'Every host and property is strictly vetted.' },
                        { icon: 'fa-headset',    title: '24/7 Support',   desc: 'We\'re here to help whenever you need.' },
                        { icon: 'fa-key',        title: 'Instant Move-in',desc: 'Book today, move in tomorrow.' },
                        { icon: 'fa-rupee-sign', title: 'No Broker Fees', desc: 'Zero hidden charges, ever.' },
                    ].map(f => (
                        <div key={f.title} className="flex items-start gap-4">
                            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/15 flex items-center justify-center">
                                <i className={`fas ${f.icon} text-white text-sm`} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{f.title}</p>
                                <p className="text-rose-200 text-xs mt-0.5">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right auth panel */}
            <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-12 overflow-y-auto">
                {/* Mobile logo */}
                <button className="flex items-center justify-center gap-2 text-rose-600 font-bold text-xl mb-6 md:hidden" onClick={() => router.push('/')}>
                    <i className="fas fa-home" /> Roomefy
                </button>

                <div className="max-w-sm w-full mx-auto">
                    <h1 className="text-2xl font-black text-slate-900 mb-1">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-sm text-slate-400 mb-6">
                        {activeTab === 'login' ? 'Sign in to access your Roomefy dashboard' : 'Join thousands of professionals finding perfect spaces'}
                    </p>

                    {/* Tabs */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                        {(['login', 'signup'] as const).map(tab => (
                            <button
                                key={tab}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => { setActiveTab(tab); setErrorMsg(''); }}
                            >
                                {tab === 'login' ? 'Log In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    {/* Error / info */}
                    {errorMsg && (
                        <div className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-medium mb-4 ${errorMsg.includes('OTP sent') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`} role="alert">
                            <i className={`fas ${errorMsg.includes('OTP sent') ? 'fa-check-circle' : 'fa-exclamation-circle'} mt-0.5 flex-shrink-0`} />
                            {errorMsg}
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {activeTab === 'login' && (
                        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="email" className={labelCls}>Email Address</label>
                                <div className="relative">
                                    <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input id="email" type="email" className={inputCls} placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className={labelCls}>Password</label>
                                <div className="relative">
                                    <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input id="password" type={showLoginPassword ? 'text' : 'password'} className={inputCls} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                                    <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                                        <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                                    <input type="checkbox" className="rounded" /> Remember me
                                </label>
                                <a href="#" className="text-rose-600 font-semibold hover:underline">Forgot password?</a>
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.25)]">
                                <i className="fas fa-sign-in-alt" /> Sign In
                            </button>
                            <div className="flex items-center gap-3 my-1">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-xs text-slate-400 font-medium">Or continue with</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[{ icon: 'fa-google', label: 'Google', fab: true }, { icon: 'fa-facebook', label: 'Facebook', fab: true }].map(s => (
                                    <button key={s.label} type="button" className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                                        <i className={`${s.fab ? 'fab' : 'fas'} ${s.icon} text-sm`} /> {s.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-xs text-slate-400">
                                Don't have an account?{' '}
                                <a href="#" className="text-rose-600 font-bold hover:underline" onClick={e => { e.preventDefault(); setActiveTab('signup'); }}>Sign up free</a>
                            </p>
                        </form>
                    )}

                    {/* SIGNUP FORM */}
                    {activeTab === 'signup' && (
                        <form className="flex flex-col gap-4" onSubmit={handleSignup}>
                            {/* Role Selection */}
                            <div>
                                <label className={labelCls}>I am a</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['TENANT', 'OWNER', 'BROKER'].map((r) => (
                                        <label key={r} className={`flex items-center justify-center py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${signupData.role === r ? 'bg-rose-50 border-rose-500 text-rose-600 ring-1 ring-rose-500 flex-shrink-0' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                                            <input type="radio" className="hidden" name="role" value={r} checked={signupData.role === r} onChange={(e) => setSignupData({ ...signupData, role: e.target.value })} />
                                            {r.charAt(0) + r.slice(1).toLowerCase()}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Full Name</label>
                                <div className="relative">
                                    <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input type="text" className={inputCls} placeholder="Rohan Sharma" value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Email Address</label>
                                <div className="relative">
                                    <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input type="email" className={inputCls} placeholder="rohan@company.com" value={signupData.email} onChange={e => setSignupData({ ...signupData, email: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Phone Number (Optional)</label>
                                <div className="relative">
                                    <i className="fas fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input type="tel" className={inputCls} placeholder="+91 98765 43210" value={signupData.phone} onChange={e => setSignupData({ ...signupData, phone: e.target.value })} />
                                </div>
                            </div>


                            <div>
                                <label className={labelCls}>Password</label>
                                <div className="relative">
                                    <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input type={showSignupPassword ? 'text' : 'password'} className={inputCls} placeholder="Create a strong password" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} required />
                                    <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                                        <i className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Confirm Password</label>
                                <div className="relative">
                                    <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input type={showSignupPassword ? 'text' : 'password'} className={inputCls} placeholder="Confirm your password" value={signupData.confirmPassword} onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })} required />
                                </div>
                            </div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" id="terms" checked={signupData.terms} onChange={e => setSignupData({ ...signupData, terms: e.target.checked })} className="mt-0.5 w-4 h-4 rounded accent-rose-600 cursor-pointer" />
                                <span className="text-xs text-slate-500">
                                    I agree to Roomefy's{' '}
                                    <a href="#" className="text-rose-600 font-semibold hover:underline">Terms of Service</a> and{' '}
                                    <a href="#" className="text-rose-600 font-semibold hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                            <button type="submit" className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.25)]">
                                <i className="fas fa-user-plus" /> Create Account
                            </button>
                            <p className="text-center text-xs text-slate-400">
                                Already have an account?{' '}
                                <a href="#" className="text-rose-600 font-bold hover:underline" onClick={e => { e.preventDefault(); setActiveTab('login'); }}>Sign in</a>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
