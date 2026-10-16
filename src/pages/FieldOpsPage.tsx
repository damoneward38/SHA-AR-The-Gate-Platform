import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Radio, Shield, AlertTriangle, CheckCircle, Brain,
  Activity, Zap, Compass, Volume2, ShieldAlert
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export const FieldOpsPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [sensorsChecked, setSensorsChecked] = useState<{ [key: string]: boolean }>({
    schumannLock: true,
    bioRemedyDay7: true,
    emfFieldNeutral: false,
    infrasoundShield: true,
    gps33Sync: true,
    ndaClearance: true,
  });
  const [emergencyActivated, setEmergencyActivated] = useState(false);

  const toggleSensor = (id: string) => {
    setSensorsChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allSensorsPass = Object.values(sensorsChecked).every(Boolean);

  const steps = [
    {
      title: "01. Perimeter Reconnaissance (5km Out)",
      action: "Deploy electromagnetic spectrum analyzer. Verify absence of civilian or unregistered surveillance drones.",
      hz: 7.83,
      protocol: "Ingest Day 7 Spring Water. Engage personal 7.83Hz acoustic transmitter."
    },
    {
      title: "02. Acoustic Boundary Alignment (1km Out)",
      action: "Locate primary bedrock outcropping. Scan for hollow resonance chambers using ultrasound acoustic ping.",
      hz: 111,
      protocol: "Switch neural headset to 111Hz King's Chamber tone to prevent spatial disorientation."
    },
    {
      title: "03. Gateway Threshold Approach (100m)",
      action: "Verify barometric pressure differential. Infrasound waves at 144Hz may induce localized optical warping.",
      hz: 528,
      protocol: "Recite Hebrew directional protection root: רוּחַ · שַׁעַר · דַּעַת. Maintain direct eye line."
    },
    {
      title: "04. Aperture Entry & Harmonic Extraction",
      action: "Touch bedrock with calibrated acoustic tuning rod. Log holographic anomalies into SHA'AR tactical cache.",
      hz: 963,
      protocol: "Full return telemetry broadcast to Director Damone Ward at 443-210-6995."
    }
  ];

  const handleEmergencyPulse = () => {
    setEmergencyActivated(true);
    audioEngine.playTone(40, 0, 'sine', 0.2);
    setTimeout(() => {
      audioEngine.stopTone();
      setEmergencyActivated(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#14050d_0%,#000008_70%)]">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Radio size={12} />
              Tactical Field Directive · Parallel 33.4°N
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight text-glow-red">
              Field Operations & Approach Protocol
            </h1>
            <p className="text-white/50 text-xs sm:text-sm max-w-2xl mt-1">
              Strict sequential ingress procedures for entering active 33rd parallel anomaly sectors. Never bypass bio-frequency safeguards.
            </p>
          </div>

          {/* Go / No-Go Indicator */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
              allSensorsPass
                ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${allSensorsPass ? 'bg-[#10b981] animate-ping' : 'bg-red-500'}`} />
              <span className="font-mono text-xs font-bold uppercase">
                {allSensorsPass ? 'SYSTEM STATUS: GO FOR ENTRY' : 'SYSTEM STATUS: NO-GO HOLD'}
              </span>
            </div>
          </div>
        </div>

        {/* NESHER Brain Monitor & EEG Status */}
        <div className="p-6 rounded-3xl bg-[#0d0614] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Brain className="text-[#fbbf24]" size={16} />
              <span>NESHER Live Neural Telemetry Feed</span>
            </div>
            <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30">
              PHASE COHERENCE: 99.4%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-[9px] font-mono text-white/40 uppercase">Theta / Schumann (7.83 Hz)</div>
              <div className="text-xl font-mono font-bold text-[#10b981]">LOCKED (0.998α)</div>
              <p className="text-[10px] text-white/50">Biofield grounded to terrestrial Schumann harmonic.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-[9px] font-mono text-white/40 uppercase">Acoustic Pressure Gradient</div>
              <div className="text-xl font-mono font-bold text-[#06b6d4]">1,850 Pa/m</div>
              <p className="text-[10px] text-white/50">Below tissue disruption threshold (Safe).</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-[9px] font-mono text-white/40 uppercase">Emergency Defense</div>
              <button
                onClick={handleEmergencyPulse}
                className="w-full mt-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold uppercase transition-colors"
              >
                {emergencyActivated ? 'PULSING 40Hz INFRASOUND' : 'TRIGGER COUNTERMEASURE'}
              </button>
            </div>
          </div>
        </div>

        {/* Step by Step Approach Phases */}
        <div className="space-y-4">
          <div className="text-xs font-mono text-white/40 uppercase tracking-wider">
            Operational Approach Sequence
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((st, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeStep === i
                    ? 'bg-white/10 border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-white">{st.title}</h3>
                  <span className="text-xs font-mono text-[#fbbf24] font-bold bg-[#fbbf24]/10 px-2 py-0.5 rounded">
                    {st.hz} Hz
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-3">{st.action}</p>
                <div className="text-[11px] font-mono text-[#06b6d4] bg-black/40 p-2.5 rounded-lg border border-white/5">
                  Protocol: {st.protocol}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sensor Checklist Matrix */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tactical Sensor Interlock Checklist
            </h3>
            <span className="text-xs font-mono text-white/50">
              Toggle items to update Go / No-Go status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'schumannLock', label: '7.83Hz Schumann Entrainment Confirmed' },
              { id: 'bioRemedyDay7', label: '7-Day Body Reset Protocol Completed' },
              { id: 'emfFieldNeutral', label: 'EMF Ambient Shield Neutralized' },
              { id: 'infrasoundShield', label: 'Infrasound Harmonic Attenuation Ready' },
              { id: 'gps33Sync', label: 'GPS Coordinate 33.4000°N Precision Lock' },
              { id: 'ndaClearance', label: 'Damone Ward Sovereign NDA Executed' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSensor(item.id)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  sensorsChecked[item.id]
                    ? 'bg-[#10b981]/10 border-[#10b981]/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-none ${
                  sensorsChecked[item.id] ? 'bg-[#10b981] border-[#10b981] text-black font-bold text-[10px]' : 'border-white/20'
                }`}>
                  {sensorsChecked[item.id] && '✓'}
                </div>
                <span className="text-xs leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
