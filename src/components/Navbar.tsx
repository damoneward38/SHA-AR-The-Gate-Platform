import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, ShoppingCart, User, Cpu, Sparkles,
  LogOut, LogIn, ChevronDown, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ButtonAuditModal } from './ButtonAuditModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [showAudit, setShowAudit] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { label: "Operations", path: "/" },
    { label: "AI Command", path: "/command-center" },
    { label: "Gate Map", path: "/map" },
    { label: "Prep Lab", path: "/prep" },
    { label: "Frequencies", path: "/frequencies" },
    { label: "Field Ops", path: "/operations" },
    { label: "Licensing", path: "/buyers" },
    { label: "Checkout", path: "/checkout" },
  ];

  return (
    <>
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-[#000008]/80 backdrop-blur-md z-50 fixed top-0 w-full">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fbbf24] to-[#a855f7] flex items-center justify-center font-bold text-black font-hebrew text-lg shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:scale-105 transition-transform">
              ש
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-widest text-white flex items-center gap-1.5">
                SHA'AR <span className="text-[#fbbf24] font-light font-hebrew">שַׁעַר</span>
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-tighter">
                The Gate is a Frequency · Parallel 33.4°N
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Main Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path}>
                <div
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#fbbf24] text-black font-bold shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Right: Telemetry & Director Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Schumann Pulse */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"
            />
            <span className="text-[10px] font-mono text-[#10b981]">BRAIN LOCK: 7.83 Hz</span>
          </div>

          {/* Button Audit Quick Trigger */}
          <button
            onClick={() => setShowAudit(true)}
            title="Run Full Button & Pipeline Audit"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[10px] font-mono text-[#fbbf24] transition-all cursor-pointer"
          >
            <Cpu size={12} />
            <span>BUTTON AUDIT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
          </button>

          {/* Checkout Cart Link */}
          <Link
            to="/checkout"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors relative"
            title="Access Checkout"
          >
            <ShoppingCart size={16} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#fbbf24]"></span>
          </Link>

          {/* User / Director Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#fbbf24] to-[#ef4444] text-black font-bold text-xs flex items-center justify-center font-mono">
                {isAdmin ? 'DW' : 'OP'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-[11px] font-bold text-white leading-tight">
                  {user ? user.name : 'Director Login'}
                </span>
                <span className="text-[9px] font-mono text-[#fbbf24]">
                  {isAdmin ? 'Level-V Sovereign Admin' : 'Field Operator'}
                </span>
              </div>
              <ChevronDown size={14} className="text-white/40" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#0a0618] border border-white/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-2 z-50 backdrop-blur-xl"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="p-3 border-b border-white/10">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Logged in as</div>
                  <div className="text-xs font-bold text-white truncate">
                    {user?.email || 'admin-damoneward38@gmail.com'}
                  </div>
                  <div className="text-[10px] font-mono text-[#10b981] mt-1 flex items-center gap-1">
                    <CheckCircle size={10} /> Sovereign Clearance Active
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/command-center"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[#fbbf24] hover:bg-[#fbbf24]/10 rounded-lg transition-colors font-medium"
                  >
                    <Sparkles size={14} className="text-[#fbbf24]" />
                    <span>AI Command Center (Co-Pilot)</span>
                  </Link>

                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Shield size={14} className="text-[#fbbf24]" />
                    <span>Director Admin Console</span>
                  </Link>

                  <Link
                    to="/checkout"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ShoppingCart size={14} className="text-[#06b6d4]" />
                    <span>License Checkout Page</span>
                  </Link>

                  <button
                    onClick={() => setShowAudit(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    <Cpu size={14} className="text-[#10b981]" />
                    <span>Run Full System Audit</span>
                  </button>

                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <User size={14} className="text-[#a855f7]" />
                    <span>Switch / Manage Login</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-white/10">
                  {user ? (
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#fbbf24] hover:bg-[#fbbf24]/10 rounded-lg transition-colors"
                    >
                      <LogIn size={14} />
                      <span>Log In</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Button Audit Modal */}
      <ButtonAuditModal isOpen={showAudit} onClose={() => setShowAudit(false)} />
    </>
  );
};
