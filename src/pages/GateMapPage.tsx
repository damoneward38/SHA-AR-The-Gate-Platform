import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Radio, Volume2, VolumeX, Filter, Search,
  Download, ExternalLink, ShieldAlert, Sparkles, Check
} from 'lucide-react';
import { LOCATIONS_33 } from '../data/constants';
import { Location33 } from '../types';
import { audioEngine } from '../services/audioEngine';

export const GateMapPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGate, setSelectedGate] = useState<Location33 | null>(null);
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const filteredLocations = LOCATIONS_33.filter((loc) => {
    const matchesType = filterType === 'all' || loc.type === filterType;
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleToggleSound = (freq: number) => {
    if (playingFreq === freq) {
      audioEngine.stopTone();
      setPlayingFreq(null);
    } else {
      audioEngine.playTone(freq, 0, 'sine', 0.12);
      setPlayingFreq(freq);
    }
  };

  const handleExportCoords = () => {
    const data = filteredLocations.map(l => `${l.name} | ${l.country} | Lat: ${l.lat}°N, Lon: ${l.lon}°E | Freq: ${l.freq}Hz | Priority: ${l.priority}`).join('\n');
    navigator.clipboard.writeText(data);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#0c0620_0%,#000008_70%)]">
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-ping"></span>
              Sovereign Field Matrix · Parallel 33.4°N
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight text-glow-gold">
              33rd Parallel Axis Mapped
            </h1>
            <p className="text-white/50 text-xs sm:text-sm max-w-2xl mt-1">
              Every critical anomaly, ancient portal foundation, and giant doorway aligns with mathematical precision along the 33rd parallel latitude band.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCoords}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedCoords ? <Check size={14} className="text-[#10b981]" /> : <Download size={14} />}
              <span>{copiedCoords ? 'Coordinates Copied' : 'Export Coordinate Grid'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
          {/* Type Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Gates (12)' },
              { id: 'giant_door', label: 'Giant Doors' },
              { id: 'anomaly', label: 'Electromagnetic' },
              { id: 'ancient', label: 'Ancient Sites' },
              { id: 'vortex', label: 'Natural Vortices' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-[#fbbf24] text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, country, hz..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#fbbf24] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid of Locations */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLocations.map((loc, i) => (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase"
                  style={{ backgroundColor: `${loc.color}20`, color: loc.color, border: `1px solid ${loc.color}40` }}
                >
                  {loc.priority} PRIORITY
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {loc.lat}°N · {loc.lon}°E
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-[#fbbf24] transition-colors flex items-center justify-between">
                <span>{loc.name}</span>
                <span className="text-xs font-mono font-normal text-white/40">{loc.country}</span>
              </h3>

              <p className="text-xs text-white/60 leading-relaxed mt-2.5 mb-4">
                {loc.desc}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: loc.color }} />
                <span className="text-[10px] font-mono text-[#fbbf24] font-bold">
                  {loc.freq} Hz PROTOCOL
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSound(loc.freq)}
                  className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                    playingFreq === loc.freq
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Emit acoustic wave"
                >
                  {playingFreq === loc.freq ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span className="text-[10px]">{playingFreq === loc.freq ? 'Halt' : 'Tune'}</span>
                </button>

                <button
                  onClick={() => setSelectedGate(loc)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                >
                  Inspect →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Detail for Selected Gate */}
      <AnimatePresence>
        {selectedGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#090616] border border-[#fbbf24]/30 rounded-2xl p-6 shadow-2xl relative space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                    style={{ backgroundColor: `${selectedGate.color}20`, color: selectedGate.color }}
                  >
                    {selectedGate.type.toUpperCase()} · {selectedGate.priority}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">{selectedGate.name}</h2>
                  <p className="text-xs font-mono text-white/50">{selectedGate.country} · Parallel {selectedGate.lat}°N, {selectedGate.lon}°E</p>
                </div>
                <button
                  onClick={() => setSelectedGate(null)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-[10px] font-mono text-white/40 uppercase">Anomalous Telemetry</div>
                <p className="text-xs text-white/80 leading-relaxed">{selectedGate.desc}</p>
                <div className="text-[11px] font-mono text-[#06b6d4]">
                  Acoustic Signature: {selectedGate.acousticSignature}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[9px] font-mono text-white/40 uppercase">Carrier Frequency</div>
                  <div className="text-lg font-bold font-mono text-[#fbbf24]">{selectedGate.freq} Hz</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[9px] font-mono text-white/40 uppercase">Status</div>
                  <div className="text-lg font-bold font-mono text-[#10b981]">{selectedGate.status || 'SURGING'}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleToggleSound(selectedGate.freq)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center gap-2"
                >
                  {playingFreq === selectedGate.freq ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{playingFreq === selectedGate.freq ? 'Silence Resonator' : `Broadcast ${selectedGate.freq}Hz`}</span>
                </button>
                <button
                  onClick={() => setSelectedGate(null)}
                  className="px-4 py-2 rounded-xl bg-[#fbbf24] text-black text-xs font-mono font-bold"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
