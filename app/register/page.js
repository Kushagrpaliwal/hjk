'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Phone, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user-api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setSuccess('Account created successfully');
        setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setTimeout(() => { window.location.href = "/login"; }, 1500);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#050505] overflow-hidden text-slate-200">
      <div className="hidden lg:block lg:w-3/5 relative overflow-hidden group">
        <img
          src="/signup.jpg"
          alt="Casino"
          className="absolute inset-0 w-full h-full object-cover scale-110 transition-transform duration-[20s] group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]"></div>

        <div className="absolute top-10 left-10 flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <span className="text-[11px] font-bold tracking-widest uppercase">Create Your Profile</span>
          </div>
        </div>

        <div className="absolute bottom-20 left-16 max-w-md" style={{ padding: "8px" }}>
          <h1 className="text-7xl font-black tracking-tighter italic leading-none text-white drop-shadow-2xl">
            JOIN<br /><span className="inline-block pb-1 text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800" style={{padding: "0px 10px"}}>DICE RUSH</span>
          </h1>
          <p className="mt-6 text-gray-400 font-medium leading-relaxed">
            Build your player card, unlock rewards, and roll into the action in seconds.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center relative p-6 md:p-12">
        <div className="absolute inset-0 lg:hidden">
          <img
            src="/signup2.jpg"
            alt="Mobile Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505]"></div>
        </div>

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
          <div className="mb-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <img src="/dice_rush_logo.png" alt="Logo" className="w-20 h-20 md:w-24 md:h-24 mb-3 object-contain" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-gray-400 text-sm mt-1">Register to unlock rewards and compete.</p>
          </div>

          <form className="space-y-2" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/80 z-10" size={18} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:bg-white/10 backdrop-blur-md transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/80 z-10" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:bg-white/10 backdrop-blur-md transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/80 z-10" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:bg-white/10 backdrop-blur-md transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/80 z-10" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="..........."
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:bg-white/10 backdrop-blur-md transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-4 -translate-y-1/2 text-gray-500 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/80 z-10" size={18} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="..........."
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:bg-white/10 backdrop-blur-md transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-1 top-4 -translate-y-1/2 text-gray-500 hover:text-white transition"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold">{error}</div>}
            {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden py-3 rounded-xl font-bold text-black bg-gradient-to-b from-yellow-400 to-yellow-600 hover:to-yellow-300 transition-all active:scale-[0.98] shadow-lg shadow-yellow-900/20"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                {loading ? 'Creating...' : 'Create Account'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </button>
          </form>

          <div className="mt-4 pt-2 border-t border-white/5 text-center">
            <Link href="/login">
              <span className="text-xs text-gray-500 font-medium italic">
                Already have an account? <span className="text-yellow-500 hover:text-yellow-300 font-bold transition not-italic">Sign in</span>
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
        .animate-shimmer {
            animation: shimmer 1s infinite;
        }
      `}</style>
    </div>
  );
}
