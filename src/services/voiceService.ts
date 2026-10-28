// Web Speech API Service for Microphone Input and Text-to-Speech Output
// Provides speech recognition and synthesis for SHA'AR AI Command Center

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
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

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural / high-clarity English voices (female or calm tactical assistant tone)
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

  // --- Speech Recognition (Microphone) ---

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startListening(handlers: SpeechRecognitionHandlers): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      handlers.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    try {
      this.stopListening();

      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
        this.isListeningActive = false;
        console.warn('[SHA\'AR Voice] Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          handlers.onError?.('Microphone access denied. Please allow microphone permissions in your browser.');
        } else if (event.error !== 'no-speech') {
          handlers.onError?.(`Microphone error: ${event.error}`);
        }
      };

      rec.onend = () => {
        this.isListeningActive = false;
        handlers.onEnd?.();
      };

      this.recognition = rec;
      rec.start();
      return true;
    } catch (err) {
      this.isListeningActive = false;
      console.error('[SHA\'AR Voice] Failed to start speech recognition:', err);
      handlers.onError?.('Failed to access microphone.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.isListeningActive = false;
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
      // Strip action trigger tags
      .replace(/\[ACTION:[^\]]+\]/gi, '')
      // Strip markdown bold / italic / code
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      // Strip markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Strip bullet asterisks or dashes
      .replace(/^\s*[-*]\s+/gm, '')
      // Replace URLs
      .replace(/https?:\/\/\S+/g, 'link')
      // Clean multiple spaces
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
