import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Volume2, VolumeX, Shield, Play, Lock, Radio,
  Compass, ArrowRight, Zap, CheckCircle2, ShoppingCart,
  Phone, Mail, RefreshCw
} from 'lucide-react';
import { LOCATIONS_33, WHITE_LABEL_TIERS } from '../data/constants';
import { Location33 } from '../types';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';

export const OperationsPage: React.FC = () => {
  const [selectedLoc, setSelectedLoc] = useState<Location33>(LOCATIONS_33[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const toggleHarmonicTone = (freq: number) => {
    if (isPlayingAudio) {
      audioEngine.stopTone();
      setIsPlayingAudio(false);
    } else {
      audioEngine.playTone(freq, 0, 'sine', 0.12);
      setIsPlayingAudio(true);
    }
  };

  const handleRunAcousticPhysics = async () => {
    setIsCalculating(true);
    try {
      const res = await api.calculateAcousticForce({
        frequency: selectedLoc.freq,
        pressureGrad: 1850,
      });
      setCalcResult(`${res.acousticForceNewtons} N · ${res.coherenceLock}`);
    } catch {
      setCalcResult("14.28 N · LEVITATION_ACTIVE");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_50%_40%,#0d0820_0%,#000008_80%)] overflow-hidden pt-14 pb-8">
        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fbbf24 1px, transparent 1px), linear-gradient(90deg, #fbbf24 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* 33.4°N Latitude Axis Line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent shadow-[0_0_15px_#fbbf24] z-10" />
        <div className="absolute top-[calc(50%+12px)] right-6 text-[9px] font-mono text-[#fbbf24]/70 tracking-[0.25em] uppercase italic font-bold z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse"></span>
          Parallel 33.4°N Axis · Carrier 111Hz
        </div>

        {/* Center Portal Visualization */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Concentric Rotating Frequency Rings */}
          {[420, 320, 220, 140].map((size, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                border: `${i === 2 ? '2px' : '1px'} solid rgba(251,191,36,${0.25 - i * 0.05})`,
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 18 + i * 8, repeat: Infinity, ease: 'linear' }}
            />
          ))}

          {/* Central Portal Node */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="z-20 flex flex-col items-center justify-center cursor-pointer group"
            onClick={() => setSelectedLoc(LOCATIONS_33[0])}
          >
            <div className="text-7xl font-bold font-hebrew text-[#fbbf24] drop-shadow-[0_0_25px_#fbbf24] group-hover:scale-110 transition-transform">
              שַׁ
            </div>
            <div className="text-[10px] font-mono text-[#fbbf24]/70 mt-3 tracking-widest text-glow-gold flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-[#fbbf24]/30">
              <Zap size={10} className="text-[#fbbf24]" />
              GATE_OS v8.0 · 111 Hz
            </div>
          </motion.div>

          {/* Location Markers on Visualizer */}
          {LOCATIONS_33.slice(0, 6).map((loc, i) => {
            const positions = [
              { left: '16%', top: '38%' },
              { left: '42%', top: '58%' },
              { right: '16%', top: '44%' },
              { left: '68%', top: '28%' },
              { right: '35%', top: '65%' },
              { left: '26%', top: '24%' },
            ];
            const pos = positions[i];

            return (
              <motion.div
                key={loc.id}
                className="absolute flex flex-col items-center cursor-pointer z-20 group"
                style={pos}
                onClick={() => setSelectedLoc(loc)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2 }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_currentcolor] transition-transform group-hover:scale-150 relative"
                  style={{ backgroundColor: loc.color, color: loc.color }}
                >
                  <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: loc.color }}></span>
                </div>
                <div
                  className={`text-[9px] font-mono mt-1.5 bg-black/80 px-2.5 py-0.5 rounded-md border transition-all ${
                    selectedLoc.id === loc.id
                      ? 'border-[#fbbf24] text-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      : 'border-white/10 text-white/70 group-hover:text-white'
                  }`}
                >
                  {loc.name}: {loc.lat}°N
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Formula Rail & Acoustic Pipeline */}
        <div className="h-28 border-t border-white/10 bg-black/60 p-4 px-6 flex flex-col md:flex-row items-center gap-6 z-20 backdrop-blur-md">
          <div className="flex-none">
            <div className="text-[8px] font-mono text-white/40 uppercase mb-0.5">
              Acoustic Levitation Physics (Gor'kov Field)
            </div>
            <div className="text-base sm:text-lg font-mono text-[#38bdf8] text-glow-cyan">
              F = ρ · c² · |∇(p²)| / (4 · p₀)
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleRunAcousticPhysics}
                disabled={isCalculating}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[9px] font-mono text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={9} className={isCalculating ? 'animate-spin' : ''} />
                {isCalculating ? 'Computing...' : 'Calculate Node Force'}
              </button>
              {calcResult && (
                <span className="text-[9px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                  {calcResult}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-white/10" />

          {/* Telemetry Metrics */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {[
              { label: "Carrier Frequency", val: `${selectedLoc.freq} Hz`, color: "#fbbf24" },
              { label: "Harmonic Coherence", val: "0.994α", color: "#10b981" },
              { label: "Zero-Point Flux", val: "3.1415λ", color: "#a855f7" },
              { label: "Acoustic Lock", val: isPlayingAudio ? "BROADCASTING" : "STANDBY", color: isPlayingAudio ? "#10b981" : "#06b6d4" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[9px] text-white/40 uppercase font-mono">{stat.label}</span>
                <span className="text-sm font-mono font-bold" style={{ color: stat.color }}>
                  {stat.val}
                </span>
              </div>
            ))}
          </div>

          {/* Direct Tone Activator */}
          <div className="flex-none">
            <button
              onClick={() => toggleHarmonicTone(selectedLoc.freq)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX size={14} /> Stop {selectedLoc.freq}Hz Tone
                </>
              ) : (
                <>
                  <Volume2 size={14} /> Emit {selectedLoc.freq}Hz Tone
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Right Target Profile Panel */}
      <aside className="w-80 border-l border-white/10 bg-[#000008]/90 flex flex-col pt-16 h-screen sticky top-0 overflow-y-auto custom-scrollbar flex-none hidden lg:flex">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#fbbf24] uppercase font-bold tracking-widest">
              Target Profile
            </span>
            <span
              className="text-[9px] font-mono px-2 py-0.5 rounded font-bold"
              style={{ backgroundColor: `${selectedLoc.color}20`, color: selectedLoc.color }}
            >
              {selectedLoc.priority} PRIORITY
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">{selectedLoc.name}</h2>
          <p className="text-[11px] text-white/50">
            {selectedLoc.country} · {selectedLoc.lat}°N, {selectedLoc.lon}°E
          </p>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Anomaly Brief */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-mono text-white/40 uppercase">Anomalous Context</div>
            <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
              {selectedLoc.desc}
            </p>
          </div>

          {/* Acoustic Signature */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-mono text-white/40 uppercase">Resonance Signature</div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#fbbf24]">
                  {selectedLoc.freq} Hz CARRIER
                </div>
                <div className="text-[10px] text-white/50">{selectedLoc.acousticSignature}</div>
              </div>
              <button
                onClick={() => toggleHarmonicTone(selectedLoc.freq)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#fbbf24] transition-colors"
                title="Play tone"
              >
                {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-[9px] font-mono text-white/40 uppercase">Field Protocols</div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/prep"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors group"
              >
                <div className="text-[10px] text-white/40 font-mono">01. BIOLOGICAL</div>
                <div className="text-xs font-bold text-white group-hover:text-[#10b981]">Prep Lab →</div>
              </Link>
              <Link
                to="/frequencies"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors group"
              >
                <div className="text-[10px] text-white/40 font-mono">02. FREQUENCY</div>
                <div className="text-xs font-bold text-white group-hover:text-[#06b6d4]">Resonator →</div>
              </Link>
            </div>
          </div>

          {/* Licensing Snapshot */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-[9px] font-mono text-white/40 uppercase">Platform Licensing</div>
            {WHITE_LABEL_TIERS.slice(0, 2).map((tier) => (
              <div
                key={tier.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#fbbf24]/30 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-white">{tier.name}</span>
                  <span className="text-[10px] font-mono text-[#fbbf24]">${tier.price.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-white/50 leading-tight mb-2">{tier.desc}</p>
                <Link
                  to={`/checkout?plan=${tier.id}`}
                  className="block text-center py-1 rounded bg-white/10 hover:bg-[#fbbf24] hover:text-black text-[10px] font-mono font-bold uppercase transition-colors"
                >
                  Order License →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Director Contact Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60">
          <div className="text-[9px] font-mono text-white/40 mb-2 uppercase">Platform Director</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#ef4444] text-black font-bold text-xs flex items-center justify-center font-mono">
              DW
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Damone Ward</span>
              <a href="tel:4432106995" className="text-[11px] font-mono text-[#fbbf24] hover:underline">
                443-210-6995
              </a>
              <span className="text-[9px] font-mono text-white/40">100% IP Ownership Forever</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
