'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Globe, Trophy, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [lastWinner, setLastWinner] = useState({ name: "Player777", amount: "$1,240" });

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/user-api/profile', { method: 'GET', credentials: 'include' });
        if (res.ok) router.replace('/game');
      } catch (err) {} 
      finally { setCheckingSession(false); }
    }
    checkSession();

    const winners = [
        { name: "HighRoller", amount: "$5,000" },
        { name: "DiceKing", amount: "$820" },
        { name: "VIP_User", amount: "$2,100" },
        { name: "NeonSamurai", amount: "$12,450" }
    ];
    let i = 0;
    const interval = setInterval(() => {
        setLastWinner(winners[i % winners.length]);
        i++;
    }, 4000);
    return () => clearInterval(interval);
  }, [router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/user-api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.replace('/game');
        router.refresh();
      }
    } catch (err) {
      setError('Connection lost');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-16 h-[2px] bg-gray-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-yellow-500 animate-loading-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#050505] overflow-hidden text-slate-200">
      
      {/* 🖼️ DESKTOP LEFT SIDE */}
      <div className="hidden lg:block lg:w-3/5 relative overflow-hidden group">
        <img
          src="/signup2.jpg" 
          alt="Casino"
          className="absolute inset-0 w-full h-full object-cover scale-110 transition-transform duration-[20s] group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]"></div>
        
        <div className="absolute top-10 left-10 flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-[11px] font-bold tracking-widest uppercase">1,248 Online</span>
            </div>
        </div>

        <div className="absolute bottom-20 left-16 max-w-md" style={{padding: "8px"}}>
          <h1 className="text-8xl font-black tracking-tighter italic leading-none text-white drop-shadow-2xl">
            DICE<br/><span className="inline-block pb-1 text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800" style={{padding: "0px 14px"}}>RUSH</span>
          </h1>
          <p className="mt-6 text-gray-400 font-medium leading-relaxed">
            Roll the dice and climb the leaderboard. Quick matches, fair play, real-time wins.
          </p>
        </div>
      </div>

      {/* 🎰 RIGHT SIDE: FORM & MOBILE BG */}
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center relative p-6 md:p-12">
        
        {/* MOBILE BACKGROUND IMAGE (Visible only on small screens) */}
        <div className="absolute inset-0 lg:hidden">
            <img 
                src="/signup2.jpg" 
                alt="Mobile Background" 
                className="w-full h-full object-cover opacity-40"
            />
            {/* Dark radial gradient to make the form pop */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505]"></div>
        </div>

        {/* Global Language Switch */}
        <div className="absolute top-6 right-6 z-20">
             <div className="flex items-center gap-2 bg-white/5 p-2 px-3 rounded-lg border border-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 transition">
                <Globe size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">EN</span>
             </div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xs md:max-w-sm relative z-10"
        >
          {/* LOGO FOR MOBILE/DESKTOP */}
          <div className="mb-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <img src="/dice_rush_logo.png" alt="Logo" className="w-20 h-20 md:w-24 md:h-24 mb-3 object-contain" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Login</h2>
            <p className="text-gray-400 text-sm mt-1">Enter the arena to start winning.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Identity</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/80 z-10" size={18} />
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email address"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:bg-white/10 backdrop-blur-md transition-all outline-none"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-end mb-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Password</label>
                    <Link href="/forgot-password" className="text-[10px] text-yellow-600 hover:text-yellow-400 font-bold uppercase cursor-pointer transition">Forgot?</Link>
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/80 z-10" size={18} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:bg-white/10 backdrop-blur-md transition-all outline-none"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-5 -translate-y-1/2 text-gray-500 hover:text-white transition">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold">{error}</div>}

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full group relative overflow-hidden py-3.5 rounded-xl font-bold text-black bg-gradient-to-b from-yellow-400 to-yellow-600 hover:to-yellow-300 transition-all active:scale-[0.98] shadow-lg shadow-yellow-900/20"
            >
                <div className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                    {loading ? 'Authenticating...' : 'Sign In'}
                    {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <Link href="/register">
              <span className="text-xs text-gray-500 font-medium italic">
                New to Dice Rush? <span className="text-yellow-500 hover:text-yellow-300 font-bold transition not-italic">Create your account</span>
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
            animation: loading-bar 1.5s infinite linear;
        }
        .animate-shimmer {
            animation: shimmer 1s infinite;
        }
      `}</style>
    </div>
  );
}
