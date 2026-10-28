import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Send, Clock, Play, Pause, Square, Sparkles,
  ShieldAlert, ShieldCheck, Zap, Volume2, VolumeX,
  Compass, ArrowRight, RotateCcw, AlertCircle, CheckCircle2,
  Phone, User, Check, Mic, MicOff, Radio, Headphones,
  Cpu, Lock, Info, Volume1, Wifi, WifiOff, Activity
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FREQUENCY_PRESETS } from '../data/constants';
import { voiceService } from '../services/voiceService';
import { localAiEngine } from '../services/localAiEngine';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionExecuted?: string;
  engineBadge?: string;
}

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Audio & Timer states
  const [activeFreq, setActiveFreq] = useState<number>(111);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [autoShutoff, setAutoShutoff] = useState<boolean>(true);
  const [autoStartAudio, setAutoStartAudio] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // AI Model Engine: Local Sovereign (100% Offline / Zero Tokens / Llama) vs Hybrid Cloud
  const [selectedEngine, setSelectedEngine] = useState<'local' | 'auto'>('local');

  // Voice & Conversation Mode states
  const [isConversationMode, setIsConversationMode] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Chat states
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Greetings. I am SHA'AR AI Command Center, designed and directed by Damone Ward.\n\nI am operating in LOCAL SOVEREIGN ENGINE MODE (100% Offline / Zero Tokens / Zero API Keys Required). Your microphone is connected directly with real-time audio analysis and message-box speaker playback. I know all 12 parallel 33.4°N gateway coordinates, the 7-Day Body Reset Lab (including Day 5 Fish Bile), and acoustic levitation physics.\n\nYou can speak directly into your microphone, listen to any response, or toggle hands-free Conversation Mode below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engineBadge: 'LOCAL_SOVEREIGN_OFFLINE (0 Tokens)',
    },
  ]);

  // Recommended max safe duration for selected frequency
  const getSafetyGuideline = (freq: number) => {
    if (freq <= 10) return { maxMins: 60, note: 'Safe for extended grounding and neural synchronization (Schumann 7.83Hz)' };
    if (freq <= 150) return { maxMins: 45, note: 'Intense pyramid resonance. 20-45 minutes max recommended per session' };
    if (freq <= 600) return { maxMins: 45, note: 'Cellular & DNA harmonization. 30-45 minutes optimal' };
    return { maxMins: 20, note: 'High spiritual/pineal frequency. 15-20 minutes max recommended' };
  };

  const safetyInfo = getSafetyGuideline(activeFreq);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading, isListening]);

  // Clean up speech recognition & synthesis when unmounting
  useEffect(() => {
    return () => {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining]);

  // Handle session completion & automatic triggers
  const handleSessionComplete = () => {
    setIsTimerRunning(false);
    if (autoShutoff) {
      audioEngine.stopTone();
      setIsPlayingAudio(false);
    }

    const finishMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: `Session Complete: Your ${activeFreq}Hz acoustic harmonization session has concluded safely. Automatic shutdown triggered. Biofield stability verified.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engineBadge: 'LOCAL_INTERLOCK_TRIGGER',
    };
    setChatMessages((prev) => [...prev, finishMsg]);

    if (isConversationMode) {
      speakMessage(finishMsg.id, finishMsg.text);
    }
  };

  const startSession = (freq = activeFreq, seconds = durationMinutes * 60) => {
    setActiveFreq(freq);
    setSecondsRemaining(seconds);
    setIsTimerRunning(true);

    if (autoStartAudio) {
      audioEngine.playTone(freq, 0, 'sine', 0.16);
      setIsPlayingAudio(true);
    }
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
  };

  const resumeSession = () => {
    setIsTimerRunning(true);
    if (autoStartAudio && !isPlayingAudio) {
      audioEngine.playTone(activeFreq, 0, 'sine', 0.16);
      setIsPlayingAudio(true);
    }
  };

  const stopSessionAndAudio = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(durationMinutes * 60);
    audioEngine.stopTone();
    setIsPlayingAudio(false);
  };

  // --- Voice Input (Microphone) with Real-Time Decibel Meter ---

  const startListening = async () => {
    // Stop speech synthesis if currently speaking
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);

    setVoiceNotice('Microphone connected. Speak clearly into your mic...');
    const started = await voiceService.startListening({
      onStart: () => {
        setIsListening(true);
      },
      onAudioLevel: (level) => {
        setAudioLevel(level);
      },
      onResult: (text, isFinal) => {
        setInputMessage(text);
        if (isFinal) {
          setIsListening(false);
          setAudioLevel(0);
          setVoiceNotice(null);
          if (text.trim()) {
            handleSendMessage(text.trim());
          }
        }
      },
      onError: (err) => {
        setIsListening(false);
        setAudioLevel(0);
        setVoiceNotice(err);
        setTimeout(() => setVoiceNotice(null), 5000);
      },
      onEnd: () => {
        setIsListening(false);
        setAudioLevel(0);
        setVoiceNotice(null);
      },
    });

    if (!started) {
      setIsListening(false);
      setAudioLevel(0);
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setAudioLevel(0);
    setVoiceNotice(null);
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakMessage = (id: string, text: string) => {
    if (speakingMessageId === id) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    voiceService.stopListening();
    setIsListening(false);
    setAudioLevel(0);

    setSpeakingMessageId(id);
    voiceService.speak(text, {
      onStart: () => {
        setSpeakingMessageId(id);
      },
      onEnd: () => {
        setSpeakingMessageId(null);
        if (isConversationMode) {
          setTimeout(() => {
            startListening();
          }, 400);
        }
      },
      onError: () => {
        setSpeakingMessageId(null);
      },
    });
  };

  const toggleConversationMode = () => {
    const nextState = !isConversationMode;
    setIsConversationMode(nextState);

    if (nextState) {
      setVoiceNotice('Conversation Mode Active: Listening for your voice...');
      startListening();
    } else {
      stopListening();
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
      setVoiceNotice('Conversation Mode Deactivated.');
      setTimeout(() => setVoiceNotice(null), 2500);
    }
  };

  // Execute triggers returned by AI action tags
  const processAiActionTags = (replyText: string) => {
    let cleanText = replyText;
    let actionNotice = '';

    const sessionMatch = replyText.match(/\[ACTION:SET_SESSION\s+freq=([\d.]+)\s+duration=(\d+)(?:\s+label="([^"]*)")?(?:\s+autostart=(true|false))?\]/i);
    if (sessionMatch) {
      const freq = parseFloat(sessionMatch[1]);
      const durationSecs = parseInt(sessionMatch[2], 10);
      const autostart = sessionMatch[4] === 'true';

      setActiveFreq(freq);
      setDurationMinutes(Math.round(durationSecs / 60));
      setSecondsRemaining(durationSecs);

      if (autostart) {
        startSession(freq, durationSecs);
        actionNotice = `Action Executed: Started ${freq}Hz session (${Math.round(durationSecs / 60)} mins) with automatic shutdown.`;
      } else {
        actionNotice = `Action Executed: Configured ${freq}Hz timer for ${Math.round(durationSecs / 60)} minutes.`;
      }
      cleanText = cleanText.replace(sessionMatch[0], '').trim();
    }

    const stopMatch = replyText.match(/\[ACTION:STOP_AUDIO\]/i);
    if (stopMatch) {
      stopSessionAndAudio();
      actionNotice = 'Action Executed: Acoustic wave halted and session timer cleared.';
      cleanText = cleanText.replace(stopMatch[0], '').trim();
    }

    const navMatch = replyText.match(/\[ACTION:NAVIGATE\s+path="([^"]+)"\]/i);
    if (navMatch) {
      const targetPath = navMatch[1];
      actionNotice = `Action Executed: Redirecting to ${targetPath}...`;
      cleanText = cleanText.replace(navMatch[0], '').trim();
      setTimeout(() => {
        navigate(targetPath);
      }, 1500);
    }

    return { cleanText, actionNotice };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isAiLoading) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsAiLoading(true);

    try {
      const res = await api.sendAiChat({
        message: text.trim(),
        history: chatMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        engine: selectedEngine,
        clientContext: {
          currentFreq: activeFreq,
          isPlaying: isPlayingAudio,
          userEmail: user?.email || 'Damone Ward Admin',
          secondsRemaining,
          conversationMode: isConversationMode,
        },
      });

      const { cleanText, actionNotice } = processAiActionTags(res.reply);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: actionNotice || undefined,
        engineBadge: res.engineUsed || 'LOCAL_SOVEREIGN_ENGINE (Zero Tokens)',
      };

      setChatMessages((prev) => [...prev, aiMsg]);

      if (isConversationMode) {
        speakMessage(aiMsg.id, aiMsg.text);
      }
    } catch {
      const localFallback = localAiEngine.generateResponse(text.trim(), { currentFreq: activeFreq });
      const { cleanText, actionNotice } = processAiActionTags(localFallback.reply);

      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: actionNotice || undefined,
        engineBadge: 'LOCAL_SOVEREIGN_OFFLINE (0 Tokens)',
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);

      if (isConversationMode) {
        speakMessage(fallbackMsg.id, fallbackMsg.text);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100)
  );

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar pt-20 pb-16 bg-[radial-gradient(ellipse_at_top,#0f0824_0%,#000008_70%)]">
      <div className="max-w-7xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-[10px] font-mono text-[#fbbf24] uppercase font-bold tracking-widest flex items-center gap-1.5">
                SHA'AR Co-Pilot · Local Sovereign & Voice Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight text-glow-gold flex items-center gap-2">
              AI Command Center
            </h1>
            <p className="text-xs text-white/50 max-w-xl">
              Equipped with real-time microphone input, per-box audio speakers, hands-free conversation mode, and local offline reasoning (zero API keys / zero tokens required).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Model Engine Selector: Local Sovereign vs Hybrid */}
            <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs font-mono">
              <button
                onClick={() => setSelectedEngine('local')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                  selectedEngine === 'local'
                    ? 'bg-[#10b981] text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Runs 100% locally on device with zero API keys and zero tokens"
              >
                <WifiOff size={13} />
                <span>Local Llama Engine (Zero Tokens)</span>
              </button>
              <button
                onClick={() => setSelectedEngine('auto')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                  selectedEngine === 'auto'
                    ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Uses Cloud Gemini when online, switches to Local Model when offline"
              >
                <Wifi size={13} />
                <span>Hybrid Cloud (Auto)</span>
              </button>
            </div>

            {/* Conversation Mode Master Toggle Button */}
            <button
              onClick={toggleConversationMode}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isConversationMode
                  ? 'bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-black border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
              title="Toggle Hands-Free Two-Way Voice Conversation Mode"
            >
              <Headphones size={15} className={isConversationMode ? 'text-black' : 'text-[#fbbf24]'} />
              <span>{isConversationMode ? 'Conversation Mode: ACTIVE' : 'Conversation Mode: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Chat & Voice Interface on Left, Session Scheduler & Triggers on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Column: Conversational AI Chat & Voice Interface */}
          <div className="lg:col-span-7 flex flex-col bg-[#070614]/90 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex-1 min-h-[520px]">
            {/* Live Context Status Bar */}
            <div className="flex flex-wrap items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 mb-3 text-xs font-mono gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#fbbf24]/20 text-[#fbbf24] flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <span className="text-white/80 font-bold">SHA'AR Autonomous Co-Pilot</span>
                <span className="text-[9px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded border border-[#10b981]/30">
                  {selectedEngine === 'local' ? 'OFFLINE SOVEREIGN ENGINE ACTIVE' : 'HYBRID DUAL-LINK ACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {speakingMessageId && (
                  <span className="text-[10px] text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/20 flex items-center gap-1">
                    <Volume2 size={10} className="animate-pulse" /> Speaking...
                  </span>
                )}
                {isListening && (
                  <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1 font-bold animate-pulse">
                    <Mic size={10} /> MIC RECORDING
                  </span>
                )}
              </div>
            </div>

            {/* Voice Notice / Prompt Banner */}
            <AnimatePresence>
              {voiceNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4]/20 to-[#fbbf24]/20 border border-[#06b6d4]/40 text-xs font-mono text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-[#06b6d4] animate-pulse flex-none" />
                    <span>{voiceNotice}</span>
                  </div>
                  <button
                    onClick={() => setVoiceNotice(null)}
                    className="text-white/50 hover:text-white text-xs ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Message Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 mb-3">
              {chatMessages.map((msg) => {
                const isSpeakingThis = speakingMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/40 mb-1 px-1">
                      {msg.sender === 'ai' ? (
                        <>
                          <Bot size={11} className="text-[#fbbf24]" />
                          <span>SHA'AR Command AI</span>
                        </>
                      ) : (
                        <>
                          <User size={11} className="text-[#06b6d4]" />
                          <span>Director Damone Ward</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                      {msg.engineBadge && (
                        <>
                          <span>·</span>
                          <span className="text-[#10b981] font-bold">{msg.engineBadge}</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-2xl max-w-[92%] text-xs leading-relaxed whitespace-pre-wrap relative group transition-all ${
                        msg.sender === 'user'
                          ? 'bg-[#fbbf24] text-black font-medium shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                          : isSpeakingThis
                          ? 'bg-gradient-to-br from-[#0a1228] to-[#120826] text-white border-2 border-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : 'bg-white/5 text-white/90 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Message Text */}
                      {msg.text}

                      {/* Action notice badge if trigger was executed */}
                      {msg.actionExecuted && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-mono text-[11px] flex items-center gap-2">
                          <CheckCircle2 size={14} className="flex-none" />
                          <span>{msg.actionExecuted}</span>
                        </div>
                      )}

                      {/* Speaker in AI Box Controls */}
                      {msg.sender === 'ai' && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                          <button
                            onClick={() => speakMessage(msg.id, msg.text)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSpeakingThis
                                ? 'bg-[#06b6d4] text-black font-bold shadow-md'
                                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                            }`}
                            title={isSpeakingThis ? "Stop speaking this message" : "Listen to this response aloud"}
                          >
                            {isSpeakingThis ? (
                              <>
                                <Square size={11} className="fill-black" />
                                <span>Stop Voice</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={12} className="text-[#fbbf24]" />
                                <span>Listen (Speaker)</span>
                              </>
                            )}
                          </button>

                          {isSpeakingThis && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-[#06b6d4]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-ping" />
                              <span>AUDIO PLAYBACK</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isAiLoading && (
                <div className="flex flex-col items-start">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/50 flex items-center gap-2 font-mono">
                    <Sparkles size={13} className="text-[#fbbf24] animate-spin" />
                    <span>Synthesizing tactical response ({selectedEngine === 'local' ? 'Local Sovereign Engine' : 'Dual Link'})...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Live Audio VU-Meter Waveform Bar (Visible when Microphone is Active) */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 p-3 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-red-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      LIVE MICROPHONE AUDIO INPUT · SPEAK NOW
                    </span>
                    <span>Level: {Math.round(audioLevel * 100)}%</span>
                  </div>

                  {/* Dynamic Equalizer Audio Bars */}
                  <div className="flex items-end gap-1 h-8 w-full bg-black/60 rounded-xl p-1.5 border border-white/5 overflow-hidden">
                    {Array.from({ length: 32 }).map((_, i) => {
                      const barHeight = Math.max(
                        10,
                        Math.min(100, Math.sin((i / 32) * Math.PI) * (audioLevel * 100 + Math.random() * 20))
                      );
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-[#10b981] via-[#fbbf24] to-red-500 transition-all duration-75"
                          style={{ height: `${barHeight}%` }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Voice Phrases / Test Triggers */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
                <span>Direct Spoken Command Triggers (Click to Voice / Transcribe)</span>
                <span className="text-[#10b981]">Zero Tokens Needed</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Start 20-minute 111Hz session",
                  "Guide approach to Mount Hermon",
                  "Explain Day 5 Fish Bile cellular reset",
                  "How long can I run 7.83Hz safely?",
                  "Who retains 100% IP ownership?",
                  "Halt all frequency waves",
                ].map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(phrase)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-white/70 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <Mic size={10} className="text-[#fbbf24]" />
                    <span>"{phrase}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar with Microphone & Send Controls */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Microphone Toggle Button */}
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center flex-none ${
                  isListening
                    ? 'bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                }`}
                title={isListening ? "Stop microphone recording" : "Click to speak with microphone"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} className="text-[#fbbf24]" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? "Listening to your voice... Speak now..." : "Speak into mic or type frequency commands / safety questions..."}
                className={`flex-1 px-4 py-3 rounded-2xl bg-black/60 border text-xs text-white placeholder-white/30 focus:outline-none transition-colors ${
                  isListening ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-[#fbbf24]'
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isAiLoading || !inputMessage.trim()}
                className="px-5 py-3 rounded-2xl bg-[#fbbf24] hover:bg-[#fbbf24]/90 disabled:opacity-40 text-black font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-lg flex-none"
              >
                <span>Send</span>
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Right Column: Session Scheduler & Trigger Console */}
          <div className="lg:col-span-5 space-y-5 flex flex-col">
            {/* Live Countdown & Progress Card */}
            <div className="p-6 rounded-3xl bg-[#090b1c] border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                  <Clock size={15} className="text-[#fbbf24]" />
                  <span>Session Trigger Timer</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    isTimerRunning
                      ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 animate-pulse'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {isTimerRunning ? 'RUNNING' : 'STANDBY'}
                </span>
              </div>

              {/* Countdown Display */}
              <div className="text-center py-4 bg-black/40 rounded-2xl border border-white/5 relative">
                <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-wider text-glow-gold">
                  {formatTime(secondsRemaining)}
                </div>
                <div className="text-[10px] font-mono text-white/40 mt-1 uppercase">
                  Target Frequency: <span className="text-[#fbbf24] font-bold">{activeFreq} Hz</span>
                </div>

                {/* Progress Bar */}
                <div className="w-[85%] mx-auto h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fbbf24] to-[#10b981] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2">
                {!isTimerRunning ? (
                  <button
                    onClick={() => {
                      if (secondsRemaining <= 0) {
                        startSession(activeFreq, durationMinutes * 60);
                      } else {
                        resumeSession();
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#10b981] hover:bg-[#10b981]/90 text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-lg"
                  >
                    <Play size={14} />
                    <span>Start / Resume Session</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseSession}
                    className="flex-1 py-3 rounded-xl bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-black font-bold font-mono text-xs uppercase flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer shadow-lg"
                  >
                    <Pause size={14} />
                    <span>Pause Session</span>
                  </button>
                )}

                <button
                  onClick={stopSessionAndAudio}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Reset and stop audio"
                >
                  <Square size={13} className="text-red-400" />
                  <span>Stop</span>
                </button>
              </div>

              {/* Automatic Triggers Settings */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-[10px] font-mono text-white/40 uppercase">Automated Trigger Interlocks</div>
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer text-xs">
                  <span className="text-white/80">Auto-start acoustic tone on timer start</span>
                  <input
                    type="checkbox"
                    checked={autoStartAudio}
                    onChange={(e) => setAutoStartAudio(e.target.checked)}
                    className="accent-[#fbbf24]"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer text-xs">
                  <span className="text-white/80">Auto-shutoff tone when timer hits 00:00</span>
                  <input
                    type="checkbox"
                    checked={autoShutoff}
                    onChange={(e) => setAutoShutoff(e.target.checked)}
                    className="accent-[#fbbf24]"
                  />
                </label>
              </div>
            </div>

            {/* Target Frequency & Duration Setup Card */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Session Configuration
              </div>

              {/* Duration Buttons */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-white/40 uppercase">Duration Preset</div>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setDurationMinutes(mins);
                        setSecondsRemaining(mins * 60);
                      }}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        durationMinutes === mins
                          ? 'bg-[#fbbf24] text-black shadow-md'
                          : 'bg-black/40 text-white/60 hover:text-white border border-white/5'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency Presets */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-white/40 uppercase">Harmonic Protocol</div>
                <div className="grid grid-cols-2 gap-2">
                  {FREQUENCY_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setActiveFreq(p.hz);
                        if (isPlayingAudio) audioEngine.playTone(p.hz, 0, 'sine', 0.16);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        activeFreq === p.hz
                          ? 'bg-white/10 border-[#fbbf24] text-white shadow-sm'
                          : 'bg-black/40 border-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{p.name}</div>
                      <div className="text-[10px] font-mono text-[#fbbf24]">{p.hz} Hz</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Guideline Alert */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-[#06b6d4]/30 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#06b6d4] uppercase font-bold">
                  <ShieldCheck size={12} />
                  <span>Safety Protocol: Max {safetyInfo.maxMins} Minutes</span>
                </div>
                <p className="text-[11px] text-white/60 leading-tight">
                  {safetyInfo.note}. Damone Ward 100% IP terms active.
                </p>
              </div>
            </div>

            {/* Quick Director Help Line */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#ef4444] text-black font-bold text-xs flex items-center justify-center font-mono">
                  DW
                </div>
                <div>
                  <div className="font-bold text-white">Director Damone Ward</div>
                  <div className="text-[10px] font-mono text-white/40">Direct Briefing Line: 443-210-6995</div>
                </div>
              </div>
              <a href="tel:4432106995">
                <button className="px-3 py-1.5 rounded-xl bg-[#fbbf24] text-black text-[10px] font-mono font-bold uppercase hover:scale-105 transition-transform cursor-pointer">
                  Call
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
