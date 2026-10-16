import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Shield, Volume2, VolumeX, CheckSquare, Square,
  Sparkles, ShoppingCart, Zap, HeartPulse, ArrowRight
} from 'lucide-react';
import { PREPARATION_STACK } from '../data/constants';
import { audioEngine } from '../services/audioEngine';

export const PrepLabPage: React.FC = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('shaar_prep_completed');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  const toggleDayCompletion = (dayNumber: number) => {
    let next: number[];
    if (completedDays.includes(dayNumber)) {
      next = completedDays.filter(d => d !== dayNumber);
    } else {
      next = [...completedDays, dayNumber];
    }
    setCompletedDays(next);
    localStorage.setItem('shaar_prep_completed', JSON.stringify(next));
  };

  const current = PREPARATION_STACK[activeDay];

  const handlePlayTone = () => {
    if (isPlaying) {
      audioEngine.stopTone();
      setIsPlaying(false);
    } else {
      audioEngine.playTone(current.hz, 0, 'sine', 0.15);
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#0c0822_0%,#000008_70%)]">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-[10px] font-mono text-[#10b981] uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Shield size={12} />
              Bio-Field Synchronization Protocol · 7 Days
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight text-glow-cyan">
              7-Day Body Reset Lab
            </h1>
            <p className="text-white/50 text-xs sm:text-sm max-w-2xl mt-1">
              Ancient natural remedies administered in sequential order. Purge parasites, align cellular polarity, and induce acoustic immunity before approaching the 33rd parallel gateway.
            </p>
          </div>

          <Link to="/checkout?plan=field-pass">
            <button className="px-4 py-2.5 rounded-xl bg-[#10b981] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <ShoppingCart size={14} />
              Order Prep Bio-Kit ($497)
            </button>
          </Link>
        </div>

        {/* 7 Day Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {PREPARATION_STACK.map((day, i) => {
            const isDone = completedDays.includes(day.dayNumber);
            const isSelected = activeDay === i;
            return (
              <button
                key={i}
                onClick={() => {
                  if (isPlaying) audioEngine.stopTone();
                  setIsPlaying(false);
                  setActiveDay(i);
                }}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-white/10 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-white/40 mb-1">
                  <span>{day.day}</span>
                  {isDone && <span className="text-[#10b981]">✓</span>}
                </div>
                <div className="text-xs font-bold text-white uppercase">{day.label}</div>
                <div className="text-[10px] font-mono mt-1" style={{ color: day.color }}>
                  {day.hz} Hz
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Protocol Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#090616]/90 relative overflow-hidden backdrop-blur-xl shadow-2xl space-y-6"
          >
            {/* Background Watermark Frequency */}
            <div className="absolute top-2 right-4 text-8xl sm:text-9xl font-black font-mono opacity-5 pointer-events-none select-none" style={{ color: current.color }}>
              {current.hz}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-mono mb-2"
                  style={{ backgroundColor: `${current.color}20`, color: current.color, border: `1px solid ${current.color}40` }}
                >
                  HARMONIC LOCK: {current.hz} Hz · PHASE {current.dayNumber} OF 7
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
                  {current.label} Synchronization Protocol
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayTone}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {isPlaying ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isPlaying ? `Stop ${current.hz}Hz Tone` : `Synthesize ${current.hz}Hz`}</span>
                </button>

                <button
                  onClick={() => toggleDayCompletion(current.dayNumber)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    completedDays.includes(current.dayNumber)
                      ? 'bg-[#10b981] text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {completedDays.includes(current.dayNumber) ? (
                    <>
                      <CheckSquare size={15} /> Marked Complete
                    </>
                  ) : (
                    <>
                      <Square size={15} /> Mark Phase Complete
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Remedy Box */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> Prescribed Natural Formula
                </div>
                <div className="text-lg font-bold text-white">{current.remedy}</div>
                <p className="text-xs text-white/60 leading-relaxed">{current.instructions}</p>
              </div>

              {/* Biomarker Box */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-[10px] font-mono text-[#06b6d4] uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse size={12} /> Targeted Bio-Marker & Frequency Effect
                </div>
                <div className="text-base font-bold text-white">{current.biomarker}</div>
                <p className="text-xs text-white/60 leading-relaxed italic">
                  Cellular vibrations at {current.hz}Hz eliminate foreign acoustic distortion, anchoring the nervous system against portal nausea and temporal dislocation.
                </p>
              </div>
            </div>

            {/* Checklist items for this day */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 relative z-10">
              <div className="text-[10px] font-mono text-white/40 uppercase">Operational Checklist For {current.day}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span>Morning Dosage of {current.remedy.split('+')[0]}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                  <span>30 Min {current.hz}Hz Acoustic Immersion</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                  <span>Pure Spring Water Hydration</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
