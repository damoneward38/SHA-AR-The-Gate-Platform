import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck, CheckCircle2,
  LogIn, UserCheck, AlertCircle, Sparkles, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, logout, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMessage('Authentication successful. Welcome.');
        setTimeout(() => {
          navigate('/admin');
        }, 800);
      } else {
        setErrorMessage(res.message || 'Invalid credentials');
      }
    } catch {
      setErrorMessage('Communication error with authentication server.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#120822_0%,#000008_70%)] overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#090618]/90 border border-[#fbbf24]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(251,191,36,0.15)] relative overflow-hidden backdrop-blur-xl space-y-6"
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#fbbf24]/10 blur-2xl pointer-events-none" />

        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#ef4444] text-black font-bold font-hebrew text-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            ש
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
            Director & Operator Access
          </h1>
          <p className="text-xs text-white/50">
            SHA'AR Platform · Level-V Sovereign Gate Clearance
          </p>
        </div>

        {/* Current Session Banner if already logged in */}
        {user && (
          <div className="p-4 rounded-2xl bg-white/5 border border-[#10b981]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#10b981] uppercase font-bold flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Currently Logged In
              </span>
              <span className="text-[10px] font-mono text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded">
                {isAdmin ? 'DIRECTOR ADMIN' : 'OPERATOR'}
              </span>
            </div>
            <div className="text-xs font-bold text-white">{user.name}</div>
            <div className="text-[11px] font-mono text-white/50">{user.email}</div>
            <div className="pt-2 flex items-center gap-2 border-t border-white/10">
              <Link to="/admin" className="flex-1">
                <button className="w-full py-1.5 rounded-lg bg-[#fbbf24] text-black text-xs font-bold font-mono uppercase tracking-wider">
                  Admin Console →
                </button>
              </Link>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white/70 hover:text-white transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin-damoneward38@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fbbf24]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase mb-1.5">
              Clearance Passcode
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fbbf24]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="flex-none" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-xs text-[#10b981] flex items-center gap-2">
              <CheckCircle2 size={14} className="flex-none" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn size={15} />
            <span>{isLoading ? 'Authenticating...' : 'Sign In To Platform'}</span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-4 border-t border-white/10 text-center space-y-1">
          <p className="text-[10px] text-white/40">
            Damone Ward retains 100% IP ownership permanently.
          </p>
          <div className="text-[10px] font-mono text-[#fbbf24]">
            Direct Support: 443-210-6995
          </div>
        </div>
      </motion.div>
    </div>
  );
};
