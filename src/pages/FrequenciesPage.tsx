import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Brain, Volume2, VolumeX, Sliders, Activity,
  Zap, Radio, Sparkles, CheckCircle2, RotateCcw
} from 'lucide-react';
import { FREQUENCY_PRESETS } from '../data/constants';
import { audioEngine } from '../services/audioEngine';

export const FrequenciesPage: React.FC = () => {
  const [activeFreq, setActiveFreq] = useState<number>(111);
  const [binauralDelta, setBinauralDelta] = useState<number>(0);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [volume, setVolume] = useState<number>(0.15);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop tone safely when navigating away
  useEffect(() => {
    return () => {
      audioEngine.stopTone();
    };
  }, []);

  const toggleSound = () => {
    if (isPlaying) {
      audioEngine.stopTone();
      setIsPlaying(false);
    } else {
      audioEngine.playTone(activeFreq, binauralDelta, waveType, volume);
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (hz: number) => {
    setActiveFreq(hz);
    if (isPlaying) {
      audioEngine.playTone(hz, binauralDelta, waveType, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isPlaying) {
      audioEngine.playTone(activeFreq, binauralDelta, waveType, newVol);
    }
  };

  // Animated wave visualizer on HTML5 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;

      // Draw background center grid line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Dynamic wave rendering
      const amplitude = isPlaying ? 35 : 8;
      const cycles = (activeFreq / 50) + 2;

      ctx.beginPath();
      ctx.strokeStyle = isPlaying ? '#06b6d4' : 'rgba(251, 191, 36, 0.4)';
      ctx.shadowBlur = isPlaying ? 15 : 0;
      ctx.shadowColor = '#06b6d4';

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin((x * cycles * 0.02) + step) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      step += isPlaying ? 0.08 : 0.02;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, activeFreq]);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#080f24_0%,#000008_70%)]">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="text-[10px] font-mono text-[#06b6d4] uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Brain size={12} />
            NESHER Neural Resonator & Mind Frequency Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight text-glow-cyan">
            Acoustic Frequency Synthesizer
          </h1>
          <p className="text-white/50 text-xs sm:text-sm max-w-2xl mt-1">
            Emit exact electromagnetic and acoustic carrier waves. The 7.83Hz Schumann lock prevents nervous system disintegration near the 33rd parallel threshold.
          </p>
        </div>

        {/* Oscilloscope Visualizer Card */}
        <div className="p-6 rounded-3xl bg-[#070b1a] border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#06b6d4] animate-pulse" />
              <span className="text-xs font-mono text-white/70 uppercase">
                Acoustic Wave Monitor · {activeFreq} Hz {isPlaying ? '(BROADCASTING)' : '(IDLE)'}
              </span>
            </div>
            <div className="text-xs font-mono text-[#06b6d4]">
              Binaural Beat: +{binauralDelta} Hz Delta
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={160}
            className="w-full h-40 rounded-xl bg-black/60 border border-white/5"
          />

          {/* Master Synthesizer Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSound}
                className={`px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                    : 'bg-[#06b6d4] text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105'
                }`}
              >
                {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isPlaying ? 'Halt Wave Emission' : `Activate ${activeFreq}Hz Wave`}</span>
              </button>

              <button
                onClick={() => {
                  setActiveFreq(111);
                  setBinauralDelta(0);
                  if (isPlaying) audioEngine.playTone(111, 0, waveType, volume);
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
                title="Reset to 111Hz King's Chamber default"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Volume Slider */}
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Volume2 size={13} className="text-[#06b6d4]" />
                <span className="text-[10px] font-mono text-white/50">VOL</span>
                <input
                  type="range"
                  min="0.02"
                  max="0.4"
                  step="0.01"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 sm:w-20 accent-[#06b6d4] cursor-pointer"
                  title="Volume level"
                />
                <span className="text-[10px] font-mono text-white/70 w-6">
                  {Math.round((volume / 0.4) * 100)}%
                </span>
              </div>

              {/* Waveform Selector */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {(['sine', 'triangle'] as OscillatorType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setWaveType(type);
                      if (isPlaying) audioEngine.playTone(activeFreq, binauralDelta, type, volume);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-colors ${
                      waveType === type ? 'bg-[#06b6d4] text-black font-bold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sliders: Frequency & Binaural Delta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-white/60 uppercase">Manual Carrier Wave (Hz)</span>
              <span className="text-xl font-mono font-bold text-[#fbbf24]">{activeFreq} Hz</span>
            </div>
            <input
              type="range"
              min="7"
              max="1000"
              step="1"
              value={activeFreq}
              onChange={(e) => {
                const val = Number(e.target.value);
                setActiveFreq(val);
                if (isPlaying) audioEngine.playTone(val, binauralDelta, waveType, volume);
              }}
              className="w-full accent-[#fbbf24] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>7.83Hz (Schumann)</span>
              <span>111Hz (Pyramid)</span>
              <span>432Hz</span>
              <span>528Hz</span>
              <span>963Hz (Pineal)</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-white/60 uppercase">Binaural Delta Offset (Hz)</span>
              <span className="text-xl font-mono font-bold text-[#06b6d4]">+{binauralDelta} Hz</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={binauralDelta}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBinauralDelta(val);
                if (isPlaying) audioEngine.playTone(activeFreq, val, waveType, volume);
              }}
              className="w-full accent-[#06b6d4] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>0 Hz (Mono)</span>
              <span>3 Hz (Delta Sleep)</span>
              <span>7.83 Hz (Schumann Theta)</span>
              <span>12 Hz (Alpha)</span>
            </div>
          </div>
        </div>

        {/* Preset Cards */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-white/40 uppercase tracking-wider">
            Canonical Harmonic Presets
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FREQUENCY_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset.hz)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeFreq === preset.hz
                    ? 'bg-white/10 border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="text-sm font-bold text-white">{preset.name}</div>
                  <span className="text-xs font-mono font-bold" style={{ color: preset.color }}>
                    {preset.hz} Hz
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
