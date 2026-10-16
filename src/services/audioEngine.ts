/**
 * Web Audio API Engine for SHA'AR Frequency Synchronization
 * Generates true acoustic carrier tones (Schumann 7.83Hz, King's Chamber 111Hz, Solfeggio 528Hz, etc.)
 * Engineered for continuous playback without dropouts or cutoff glitches.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc: OscillatorNode | null = null;
  private oscGain: GainNode | null = null;
  private binauralOsc: OscillatorNode | null = null;
  private binauralGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentFrequency: number = 111;
  private currentBinauralDelta: number = 0;
  private currentWaveType: OscillatorType = 'sine';
  private currentVolume: number = 0.18;
  private stopTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private async ensureContext(): Promise<AudioContext | null> {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  public async playTone(
    frequency: number,
    binauralDelta = 0,
    type: OscillatorType = 'sine',
    volume = 0.18
  ) {
    try {
      // Clear any pending stop timeouts immediately so they cannot cancel the new tone
      if (this.stopTimeoutId) {
        clearTimeout(this.stopTimeoutId);
        this.stopTimeoutId = null;
      }

      const ctx = await this.ensureContext();
      if (!ctx) return;

      this.currentFrequency = frequency;
      this.currentBinauralDelta = binauralDelta;
      this.currentWaveType = type;
      this.currentVolume = Math.min(Math.max(volume, 0.01), 0.5);

      // Infrasound carrier adaptation: 7.83Hz is below human hearing & standard device speakers (<20Hz),
      // so frequencies under 20Hz are rendered using a 111Hz fundamental modulated with the infrasound delta
      const effectiveFreq = frequency < 20 ? 111 : frequency;

      // IF ALREADY PLAYING: Seamlessly glide to the new frequency and parameters WITHOUT cutting off
      if (this.isPlaying && this.osc && this.masterGain) {
        const now = ctx.currentTime;
        this.osc.type = type;
        this.osc.frequency.cancelScheduledValues(now);
        this.osc.frequency.setTargetAtTime(effectiveFreq, now, 0.03);

        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setTargetAtTime(this.currentVolume, now, 0.03);

        if (binauralDelta > 0) {
          if (!this.binauralOsc) {
            // Spawn binaural channel if not already active
            this.binauralOsc = ctx.createOscillator();
            this.binauralGain = ctx.createGain();
            this.binauralOsc.type = type;
            this.binauralOsc.frequency.setValueAtTime(effectiveFreq + binauralDelta, now);
            this.binauralGain.gain.setValueAtTime(0.7, now);
            this.binauralOsc.connect(this.binauralGain);
            this.binauralGain.connect(this.masterGain);
            this.binauralOsc.start(now);
          } else {
            this.binauralOsc.type = type;
            this.binauralOsc.frequency.cancelScheduledValues(now);
            this.binauralOsc.frequency.setTargetAtTime(effectiveFreq + binauralDelta, now, 0.03);
          }
        } else if (this.binauralOsc) {
          try {
            this.binauralOsc.stop(now);
            this.binauralOsc.disconnect();
          } catch {}
          this.binauralOsc = null;
          this.binauralGain = null;
        }

        return;
      }

      // OTHERWISE: Brand new startup sequence
      this.cleanupNodes();

      const now = ctx.currentTime;

      // Master output gain node
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      // Smooth fade-in over 60ms to avoid audio pop/click
      this.masterGain.gain.exponentialRampToValueAtTime(this.currentVolume, now + 0.06);
      this.masterGain.connect(ctx.destination);

      // Primary carrier oscillator
      this.osc = ctx.createOscillator();
      this.oscGain = ctx.createGain();
      this.osc.type = type;
      this.osc.frequency.setValueAtTime(effectiveFreq, now);
      this.oscGain.gain.setValueAtTime(1.0, now);

      this.osc.connect(this.oscGain);
      this.oscGain.connect(this.masterGain);
      this.osc.start(now);

      // Binaural beat oscillator (if requested)
      if (binauralDelta > 0) {
        this.binauralOsc = ctx.createOscillator();
        this.binauralGain = ctx.createGain();
        this.binauralOsc.type = type;
        this.binauralOsc.frequency.setValueAtTime(effectiveFreq + binauralDelta, now);
        this.binauralGain.gain.setValueAtTime(0.7, now);

        this.binauralOsc.connect(this.binauralGain);
        this.binauralGain.connect(this.masterGain);
        this.binauralOsc.start(now);
      }

      this.isPlaying = true;
    } catch (err) {
      console.warn('Audio tone activation notice:', err);
    }
  }

  public stopTone() {
    if (this.stopTimeoutId) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }

    this.isPlaying = false;

    if (!this.ctx || !this.masterGain) {
      this.cleanupNodes();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      // Smooth fade-out over 80ms
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      const capturedOsc = this.osc;
      const capturedBinaural = this.binauralOsc;
      const capturedMaster = this.masterGain;

      this.osc = null;
      this.oscGain = null;
      this.binauralOsc = null;
      this.binauralGain = null;
      this.masterGain = null;

      this.stopTimeoutId = setTimeout(() => {
        try {
          if (capturedOsc) {
            capturedOsc.stop();
            capturedOsc.disconnect();
          }
          if (capturedBinaural) {
            capturedBinaural.stop();
            capturedBinaural.disconnect();
          }
          if (capturedMaster) {
            capturedMaster.disconnect();
          }
        } catch {}
      }, 100);
    } catch {
      this.cleanupNodes();
    }
  }

  private cleanupNodes() {
    try {
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
      if (this.binauralOsc) {
        this.binauralOsc.stop();
        this.binauralOsc.disconnect();
        this.binauralOsc = null;
      }
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
    } catch {}
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentFrequency(): number {
    return this.currentFrequency;
  }
}

export const audioEngine = new AudioEngine();
