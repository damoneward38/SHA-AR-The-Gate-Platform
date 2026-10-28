import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Radio, Volume2, VolumeX, Filter, Search,
  Download, ExternalLink, ShieldAlert, Sparkles, Check,
  Navigation, Compass, Play, Pause, RotateCcw, AlertTriangle,
  WifiOff, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { LOCATIONS_33 } from '../data/constants';
import { Location33 } from '../types';
import { audioEngine } from '../services/audioEngine';
import { voiceService } from '../services/voiceService';
import { localAiEngine } from '../services/localAiEngine';

export const GateMapPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGate, setSelectedGate] = useState<Location33>(LOCATIONS_33[0]);
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Dynamic Navigation & Approach states (Getting closer to the point)
  const [isApproaching, setIsApproaching] = useState<boolean>(false);
  const [approachDistanceMeters, setApproachDistanceMeters] = useState<number>(5000);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);
  const [lastAnnouncedMilestone, setLastAnnouncedMilestone] = useState<number>(5000);
  const [tacticalLog, setTacticalLog] = useState<string[]>([
    "Offline Sovereign Radar System Initialized.",
    "Axis aligned to Parallel 33.4000°N · Zero tokens consumed.",
    "Target locked: Mount Hermon (33.4°N, 111Hz).",
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      audioEngine.playTone(freq, 0, 'sine', 0.14);
      setPlayingFreq(freq);
    }
  };

  const handleExportCoords = () => {
    const data = filteredLocations
      .map(
        (l) =>
          `${l.name} | ${l.country} | Lat: ${l.lat}°N, Lon: ${l.lon}°E | Freq: ${l.freq}Hz | Priority: ${l.priority}`
      )
      .join('\n');
    navigator.clipboard.writeText(data);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Speak offline tactical guidance using voiceService (No signal / no tokens needed)
  const speakTacticalGuidance = (text: string) => {
    if (!voiceGuidanceEnabled) return;
    voiceService.speak(text);
  };

  // Approach Milestone Voice Prompts
  const triggerApproachVoiceCue = (dist: number, gate: Location33) => {
    let message = '';
    if (dist <= 50) {
      message = `Aperture proximity reached: ${dist} meters from ${gate.name}. Resonance lock engaged at ${gate.freq} Hertz. Damone Ward sovereign protocol active.`;
    } else if (dist <= 450) {
      message = `Barometric anomaly detected at ${dist} meters. Infrasound gradient rising. Maintain direct visual contact with the bedrock.`;
    } else if (dist <= 1000) {
      message = `Perimeter breached: 1 kilometer out from ${gate.name}. Ingesting Day 7 spring water. Switching carrier to ${gate.freq} Hertz.`;
    } else if (dist <= 2500) {
      message = `Range 2.5 kilometers to ${gate.name}. Axis locked on parallel ${gate.lat} degrees North. Theta field steady.`;
    } else {
      message = `Tactical navigation engaged to ${gate.name}. Distance: 5 kilometers. Carrier: ${gate.freq} Hertz.`;
    }

    setTacticalLog((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 8)]);
    speakTacticalGuidance(message);
  };

  // Simulated GPS Approach Animation (Gets smoothly closer to the point)
  useEffect(() => {
    let animInterval: ReturnType<typeof setInterval> | null = null;

    if (isApproaching && approachDistanceMeters > 33) {
      animInterval = setInterval(() => {
        setApproachDistanceMeters((prev) => {
          const next = Math.max(33, prev - Math.max(25, Math.round(prev * 0.08)));

          // Check if crossed a key milestone to speak voice guidance
          const milestones = [2500, 1000, 450, 50];
          for (const m of milestones) {
            if (prev > m && next <= m) {
              triggerApproachVoiceCue(m, selectedGate);
              setLastAnnouncedMilestone(m);
              break;
            }
          }

          if (next <= 33) {
            setIsApproaching(false);
            triggerApproachVoiceCue(33, selectedGate);
          }
          return next;
        });
      }, 350);
    }

    return () => {
      if (animInterval) clearInterval(animInterval);
    };
  }, [isApproaching, approachDistanceMeters, selectedGate]);

  // Canvas Radar Render Loop (Dynamic Zoom as you get closer to the point)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let scanAngle = 0;

    const renderRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.min(cx, cy) - 20;

      // Zoom factor increases as distance decreases (5000m = 1x zoom, 33m = 8x zoom)
      const zoomFactor = 1 + (1 - approachDistanceMeters / 5000) * 5;

      // Background grid
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 33.4°N Latitude Axis Gold Line
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.stroke();

      // Concentric Radar Rings
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      ringSteps.forEach((step, i) => {
        const r = maxRadius * step;
        ctx.strokeStyle = i === ringSteps.length - 1 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rotating Radar Sweep Line
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(scanAngle);
      const sweepGradient = ctx.createLinearGradient(0, 0, maxRadius, 0);
      sweepGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      sweepGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, 0, Math.PI / 4);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();

      // Draw Selected Gateway Target (Moves closer to center cx, cy as distance drops!)
      // At 5000m, target is offset on outer ring; at 33m, target is right in the crosshairs!
      const normalizedDist = approachDistanceMeters / 5000;
      const targetOffsetDist = normalizedDist * (maxRadius * 0.75);
      const targetAngle = -Math.PI / 4; // NE direction
      const targetX = cx + Math.cos(targetAngle) * targetOffsetDist;
      const targetY = cy + Math.sin(targetAngle) * targetOffsetDist;

      // Target pulsing reticle
      ctx.strokeStyle = selectedGate.color || '#fbbf24';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = selectedGate.color || '#fbbf24';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 10 * zoomFactor * 0.35 + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Target Crosshairs
      ctx.beginPath();
      ctx.moveTo(targetX - 12, targetY);
      ctx.lineTo(targetX + 12, targetY);
      ctx.moveTo(targetX, targetY - 12);
      ctx.lineTo(targetX, targetY + 12);
      ctx.stroke();

      // Label on Target Point
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`${selectedGate.name} (${approachDistanceMeters}m)`, targetX + 16, targetY + 4);

      // User Position at center
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      scanAngle += 0.03;
      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [approachDistanceMeters, selectedGate]);

  const selectAndEngageGate = (gate: Location33) => {
    setSelectedGate(gate);
    setApproachDistanceMeters(5000);
    setIsApproaching(true);
    triggerApproachVoiceCue(5000, gate);
    if (playingFreq !== gate.freq) {
      audioEngine.playTone(gate.freq, 0, 'sine', 0.14);
      setPlayingFreq(gate.freq);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#0c0620_0%,#000008_70%)]">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header with Offline Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-widest flex items-center gap-1.5 mb-1 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></span>
              Sovereign Field Radar · 100% Offline Tactical Navigation
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight text-glow-gold flex items-center gap-2">
              33rd Parallel Gateway Map
            </h1>
            <p className="text-white/50 text-xs sm:text-sm max-w-2xl mt-1">
              Move closer to anomaly coordinates with live distance telemetry, dynamic zoom, and local offline voice guidance (zero tokens / zero API keys required).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Voice Guidance Toggle */}
            <button
              onClick={() => {
                const next = !voiceGuidanceEnabled;
                setVoiceGuidanceEnabled(next);
                if (next) {
                  voiceService.speak("Offline voice guidance enabled. Parallel 33.4°N radar locked.");
                } else {
                  voiceService.stopSpeaking();
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                voiceGuidanceEnabled
                  ? 'bg-[#10b981] text-black border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
              }`}
              title="Toggle Offline Spoken Approach Cues"
            >
              <Volume2 size={14} />
              <span>{voiceGuidanceEnabled ? 'Voice Guidance: ON' : 'Voice Guidance: OFF'}</span>
            </button>

            {/* Offline Mode Indicator Badge */}
            <div className="px-3 py-2 rounded-xl bg-black/60 border border-[#10b981]/30 text-xs font-mono text-[#10b981] flex items-center gap-2">
              <WifiOff size={13} />
              <span>OFFLINE READY (0 TOKENS)</span>
            </div>

            <button
              onClick={handleExportCoords}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedCoords ? <Check size={14} className="text-[#10b981]" /> : <Download size={14} />}
              <span>{copiedCoords ? 'Copied' : 'Export Matrix'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Approach Radar Display Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#080718] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Left Canvas Radar (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-white">
                <Navigation size={15} className="text-[#fbbf24] animate-spin" />
                <span className="font-bold uppercase tracking-wider">
                  Target Vector: {selectedGate.name}
                </span>
              </div>
              <div className="text-[#06b6d4] font-bold">
                Parallel {selectedGate.lat}°N · Bearing 033° NE
              </div>
            </div>

            {/* Canvas Visualizer */}
            <div className="relative rounded-2xl bg-black/80 border border-white/10 overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={560}
                height={340}
                className="w-full h-[320px] max-h-[360px]"
              />

              {/* Dynamic Overlay HUD */}
              <div className="absolute top-3 left-3 bg-black/70 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono space-y-1 backdrop-blur-md">
                <div className="text-white/40 uppercase">Proximity Range</div>
                <div className="text-xl font-black text-[#fbbf24] text-glow-gold">
                  {approachDistanceMeters} m
                </div>
                <div className="text-[#10b981]">
                  {approachDistanceMeters <= 50 ? '● APERTURE THRESHOLD LOCKED' : '○ APPROACH VECTOR ACTIVE'}
                </div>
              </div>

              <div className="absolute top-3 right-3 bg-black/70 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono space-y-1 text-right backdrop-blur-md">
                <div className="text-white/40 uppercase">Carrier Lock</div>
                <div className="text-base font-black text-[#06b6d4]">
                  {selectedGate.freq} Hz
                </div>
                <div className="text-white/60">
                  {playingFreq === selectedGate.freq ? 'TRANSMITTING' : 'STANDBY'}
                </div>
              </div>
            </div>

            {/* Approach Navigation Controls: Start / Pause Moving Closer */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!isApproaching ? (
                <button
                  onClick={() => setIsApproaching(true)}
                  className="flex-1 py-3 rounded-xl bg-[#10b981] hover:bg-[#10b981]/90 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <Play size={14} />
                  <span>Start Approach (Move Closer to Gate)</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsApproaching(false)}
                  className="flex-1 py-3 rounded-xl bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <Pause size={14} />
                  <span>Pause Approach Navigation</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsApproaching(false);
                  setApproachDistanceMeters(5000);
                  triggerApproachVoiceCue(5000, selectedGate);
                }}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset distance to 5,000m"
              >
                <RotateCcw size={14} />
                <span>Reset 5km</span>
              </button>

              <button
                onClick={() => {
                  const msg = `Distance to ${selectedGate.name} is ${approachDistanceMeters} meters. Carrier frequency is ${selectedGate.freq} Hertz. Alignment 33.4000°N.`;
                  voiceService.speak(msg);
                }}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#06b6d4] font-mono text-xs uppercase border border-[#06b6d4]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Speak current tactical direction"
              >
                <Volume2 size={14} />
                <span>Speak Directions</span>
              </button>
            </div>

            {/* Manual Distance Waypoint Quick Jump Buttons */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[9px] font-mono text-white/40 uppercase">
                Rapid Distance Simulation Waypoints
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "5.0 km", dist: 5000, desc: "Recon" },
                  { label: "1.0 km", dist: 1000, desc: "Perimeter" },
                  { label: "450 m", dist: 450, desc: "Gradient" },
                  { label: "33 m", dist: 33, desc: "Aperture" },
                ].map((wp) => (
                  <button
                    key={wp.dist}
                    onClick={() => {
                      setApproachDistanceMeters(wp.dist);
                      triggerApproachVoiceCue(wp.dist, selectedGate);
                    }}
                    className={`p-2 rounded-xl text-center border font-mono transition-all cursor-pointer ${
                      approachDistanceMeters === wp.dist
                        ? 'bg-[#fbbf24] text-black font-bold border-[#fbbf24] shadow-md'
                        : 'bg-black/40 text-white/70 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-bold">{wp.label}</div>
                    <div className="text-[9px] opacity-70">{wp.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Telemetry & Voice Log Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Target Profile Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase"
                  style={{
                    backgroundColor: `${selectedGate.color}20`,
                    color: selectedGate.color,
                    border: `1px solid ${selectedGate.color}40`,
                  }}
                >
                  {selectedGate.priority} PRIORITY · {selectedGate.type.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-white/40">
                  {selectedGate.lat}°N, {selectedGate.lon}°E
                </span>
              </div>

              <h2 className="text-xl font-bold text-white flex items-center justify-between">
                <span>{selectedGate.name}</span>
                <span className="text-xs font-mono text-[#fbbf24]">{selectedGate.country}</span>
              </h2>

              <p className="text-xs text-white/60 leading-relaxed">
                {selectedGate.desc}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div className="text-xs font-mono font-bold text-[#fbbf24]">
                  {selectedGate.freq} Hz CARRIER
                </div>
                <button
                  onClick={() => handleToggleSound(selectedGate.freq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    playingFreq === selectedGate.freq
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-[#fbbf24] text-black'
                  }`}
                >
                  {playingFreq === selectedGate.freq ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{playingFreq === selectedGate.freq ? 'Halt Wave' : 'Emit Tone'}</span>
                </button>
              </div>
            </div>

            {/* Offline Tactical Voice Log */}
            <div className="flex-1 flex flex-col p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/40 uppercase font-bold flex items-center gap-1.5">
                  <Radio size={13} className="text-[#10b981]" />
                  Offline Voice Navigator Log
                </span>
                <span className="text-[10px] text-[#10b981]">LOCAL LLAMA ENGINE</span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[180px]">
                {tacticalLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-white/80 leading-relaxed"
                  >
                    {log}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>Director: Damone Ward (443-210-6995)</span>
                <span>100% IP Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar & All 12 Gate Anomaly Cards */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLocations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                  selectedGate.id === loc.id
                    ? 'bg-gradient-to-br from-[#120e26] to-black border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => selectAndEngageGate(loc)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase"
                      style={{
                        backgroundColor: `${loc.color}20`,
                        color: loc.color,
                        border: `1px solid ${loc.color}40`,
                      }}
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

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: loc.color }} />
                    <span className="text-[10px] font-mono text-[#fbbf24] font-bold">
                      {loc.freq} Hz PROTOCOL
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAndEngageGate(loc);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24] text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Approach Target</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
