import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Shield, ShoppingCart, Radio,
  Brain, Lock, Cpu, Sparkles, CheckSquare
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { label: "Operations", id: "ops", icon: <LayoutDashboard size={15} />, href: "/" },
    { label: "33rd Gate Map", id: "map", icon: <Map size={15} />, href: "/map" },
    { label: "Prep Lab", id: "prep", icon: <Shield size={15} />, href: "/prep" },
    { label: "Mind Frequency", id: "freq", icon: <Brain size={15} />, href: "/frequencies" },
    { label: "Field Ops", id: "operations", icon: <Radio size={15} />, href: "/operations" },
    { label: "Licensing Tiers", id: "buy", icon: <ShoppingCart size={15} />, href: "/buyers" },
    { label: "Checkout & Keys", id: "checkout", icon: <Sparkles size={15} />, href: "/checkout" },
  ];

  return (
    <aside className="w-56 border-r border-white/10 bg-black/30 flex flex-col p-4 pt-20 gap-6 h-screen sticky top-0 overflow-y-auto custom-scrollbar flex-none hidden md:flex">
      <div className="space-y-1">
        <div className="text-[9px] font-mono text-white/30 uppercase mb-2 tracking-widest">
          Platform Pipelines
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.id} to={item.href}>
              <div
                className={`p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.15)] font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className={`${isActive ? 'text-[#fbbf24]' : 'text-white/40'}`}>
                  {item.icon}
                </div>
                <span className="text-xs">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-3">
        {/* Quick Checkout CTA */}
        <Link to="/checkout" className="block">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#fbbf24]/20 to-[#a855f7]/20 border border-[#fbbf24]/40 hover:scale-[1.02] transition-transform">
            <div className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles size={12} /> Instant Checkout
            </div>
            <p className="text-[10px] text-white/70 leading-tight">
              Order White Label licenses or Field Passes with instant cryptographic provisioning.
            </p>
          </div>
        </Link>

        {/* IP Security Notice */}
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-red-400 uppercase font-bold">
            <Lock size={11} /> IP Ownership Sealed
          </div>
          <p className="text-[10px] text-white/50 leading-tight italic">
            Damone Ward retains 100% IP ownership of all SHA'AR systems permanently and irrevocably.
          </p>
        </div>
      </div>
    </aside>
  );
};
