import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Crown, Lock, Phone, Mail, ArrowRight,
  Shield, Check, Sparkles, UserCheck
} from 'lucide-react';
import { WHITE_LABEL_TIERS } from '../data/constants';

export const BuyersPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#140d04_0%,#000008_70%)]">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="font-hebrew text-4xl sm:text-5xl font-black text-[#fbbf24] text-glow-gold">
            מִי צָרִיךְ אֶת הַשַּׁעַר
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
            Licensing & White Label Deployment
          </h1>
          <p className="text-white/60 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed italic">
            DAMONE WARD retains 100% intellectual property ownership of all SHA'AR systems, formulas, acoustic signatures, and gate telemetry permanently. Licenses grant operational usage rights only.
          </p>
        </div>

        {/* Pricing & Licensing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHITE_LABEL_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between group relative overflow-hidden backdrop-blur-xl ${
                tier.recommended
                  ? 'bg-gradient-to-b from-[#06b6d4]/10 to-black/60 border-[#06b6d4]/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {tier.recommended && (
                <div className="absolute top-0 right-0 bg-[#06b6d4] text-black font-mono font-bold text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Recommended For Research
                </div>
              )}

              <div>
                <div className="font-hebrew text-lg mb-2" style={{ color: tier.color }}>
                  {tier.hebrew}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-mono font-bold text-white mb-4">
                  ${tier.price.toLocaleString()}
                  <span className="text-xs text-white/40 ml-1.5 font-normal">/{tier.period}</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed mb-6">{tier.desc}</p>

                {/* Features */}
                <div className="space-y-2.5 mb-8">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-white/70">
                      <Check size={14} className="text-[#10b981] mt-0.5 flex-none" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to={`/checkout?plan=${tier.id}`} className="block">
                <button
                  className="w-full py-3.5 rounded-xl text-black font-bold text-xs uppercase tracking-widest transition-transform hover:scale-105 cursor-pointer shadow-lg"
                  style={{ backgroundColor: tier.color }}
                >
                  Order License & Deploy →
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* IP Protection Terms */}
        <div className="p-8 rounded-3xl border border-red-500/30 bg-red-950/20 space-y-6">
          <div className="flex items-center gap-3 text-red-400">
            <Lock size={22} />
            <h3 className="text-lg font-bold uppercase tracking-widest">
              Sovereign Intellectual Property Terms
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3.5">
            {[
              "DAMONE WARD retains 100% IP ownership forever and unconditionally.",
              "No technology transfer, patent rights, or source code reverse-engineering.",
              "Licensees are granted encrypted field execution rights solely under active subscription.",
              "Subject to quarterly technical audit by the Director.",
              "Revocation possible immediately upon policy or ethical boundary violation.",
              "Mutual NDA required prior to direct physical briefing at Mount Hermon or Bucegi."
            ].map((rule, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-none" />
                <span className="text-xs text-white/70 leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Director Briefing Console */}
        <div className="p-8 rounded-3xl border border-[#fbbf24]/30 bg-gradient-to-br from-[#fbbf24]/10 to-transparent backdrop-blur-xl text-center space-y-5">
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.25em]">
            Chief Executive & Platform Director
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#ef4444] flex items-center justify-center font-black text-black text-3xl font-hebrew border-4 border-white/10 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              ד
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">Damone Ward</div>
              <div className="text-sm font-mono text-[#fbbf24]">443-210-6995</div>
              <div className="text-xs font-mono text-white/50">admin-damoneward38@gmail.com</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a href="tel:4432106995">
                <button className="px-8 py-3 rounded-xl bg-[#fbbf24] text-black font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-105 transition-transform cursor-pointer">
                  Direct Briefing Line
                </button>
              </a>
              <Link to="/checkout?plan=white-label-standard">
                <button className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider border border-white/20 transition-colors cursor-pointer">
                  Go To Checkout Page
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
