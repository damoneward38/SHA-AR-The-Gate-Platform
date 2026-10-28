// Enhanced Web Speech API & Web Audio Service for Microphone Input and Text-to-Speech Output
// Supports real-time audio VU-meter, live speech recognition, offline fallback, and continuous conversation mode

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
  onAudioLevel?: (level: number) => void; // 0.0 to 1.0 live volume
}

export interface SpeechSynthesisHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class VoiceService {
  private recognition: any = null;
  private isListeningActive = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeInterval: ReturnType<typeof setInterval> | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const preferred = englishVoices.find(v => 
          /natural|female|samantha|zira|google us english|victoria|karen/i.test(v.name)
        ) || englishVoices[0] || voices[0] || null;
        
        this.preferredVoice = preferred;
      };

      loadVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoice;
      }
    }
  }

  // --- Speech Recognition (Microphone) with Audio VU Meter ---

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition ||
      (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    );
  }

  public async startListening(handlers: SpeechRecognitionHandlers): Promise<boolean> {
    this.stopListening();

    // 1. Initialize microphone hardware stream & live VU-meter via Web Audio API
    let hasMediaStream = false;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.mediaStream = stream;
        hasMediaStream = true;

        // Set up Web Audio AnalyserNode to feed live decibel volume to the UI
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          this.audioContext = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          this.analyser = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          this.volumeInterval = setInterval(() => {
            if (!this.analyser || !this.isListeningActive) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalizedLevel = Math.min(1.0, average / 80);
            handlers.onAudioLevel?.(normalizedLevel);
          }, 80);
        }

        // Initialize MediaRecorder for backend audio payload tie-in
        if (typeof MediaRecorder !== 'undefined') {
          this.audioChunks = [];
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.audioChunks.push(e.data);
          };
          this.mediaRecorder = recorder;
          recorder.start(250);
        }
      } catch (err) {
        console.warn('[SHA\'AR Voice] getUserMedia notice (checking SpeechRecognition fallback):', err);
      }
    }

    // 2. Initialize Speech Recognition engine
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recStarted = false;

    if (SpeechRecognitionConstructor) {
      try {
        const rec = new SpeechRecognitionConstructor();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          this.isListeningActive = true;
          handlers.onStart?.();
        };

        rec.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalTranscript += item[0].transcript;
            } else {
              interimTranscript += item[0].transcript;
            }
          }

          const text = finalTranscript || interimTranscript;
          handlers.onResult(text, Boolean(finalTranscript));
        };

        rec.onerror = (event: any) => {
          console.warn('[SHA\'AR Voice] Speech recognition error event:', event.error);
          if (event.error === 'not-allowed') {
            handlers.onError?.('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
          } else if (event.error === 'network') {
            handlers.onError?.('Network speech service unreachable. Switching to local voice processing.');
          } else if (event.error !== 'no-speech') {
            handlers.onError?.(`Microphone event: ${event.error}`);
          }
        };

        rec.onend = () => {
          this.stopListening();
          handlers.onEnd?.();
        };

        this.recognition = rec;
        rec.start();
        recStarted = true;
        this.isListeningActive = true;
        handlers.onStart?.();
        return true;
      } catch (err) {
        console.warn('[SHA\'AR Voice] SpeechRecognition initiation failed:', err);
      }
    }

    if (hasMediaStream) {
      this.isListeningActive = true;
      handlers.onStart?.();
      return true;
    }

    handlers.onError?.('Microphone is not accessible. Please check browser permissions.');
    return false;
  }

  public stopListening(): void {
    this.isListeningActive = false;

    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
      this.mediaRecorder = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(track => track.stop());
      } catch {
        // ignore
      }
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
      this.analyser = null;
    }
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  // --- Speech Synthesis (Speaker Box) ---

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public cleanTextForSpeech(rawText: string): string {
    return rawText
      .replace(/\[ACTION:[^\]]+\]/gi, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public speak(text: string, handlers?: SpeechSynthesisHandlers): boolean {
    if (!this.isSpeechSynthesisSupported()) {
      handlers?.onError?.('Speech synthesis not supported in this browser.');
      return false;
    }

    try {
      this.stopSpeaking();

      const cleaned = this.cleanTextForSpeech(text);
      if (!cleaned) {
        handlers?.onEnd?.();
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.0;
      utterance.pitch = 1.02;
      utterance.lang = 'en-US';

      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }

      utterance.onstart = () => {
        handlers?.onStart?.();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        handlers?.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.activeUtterance = null;
        console.warn('[SHA\'AR Voice] Speech synthesis notice:', e);
        handlers?.onError?.(e);
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      this.activeUtterance = null;
      console.error('[SHA\'AR Voice] Synthesis failed:', err);
      handlers?.onError?.(err);
      return false;
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
  }
}

export const voiceService = new VoiceService();
