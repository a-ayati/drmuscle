// Audio synthesizer and speech service for the interactive live coach

class AudioCoachService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Play a pleasant chime tone using web audio synthesis
  playTone(freq: number, type: OscillatorType, durationMs: number, gainValue = 0.15) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio context might be restricted before first interaction
    }
  }

  // Rest started chime
  playRestStart() {
    this.playTone(523.25, 'sine', 180, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 240, 0.2), 120); // E5
  }

  // Countdown tick (for 3, 2, 1 seconds)
  playCountdownTick() {
    this.playTone(440, 'triangle', 100, 0.15); // A4
  }

  // Rest finished / Work set ready chime
  playRestComplete() {
    this.playTone(587.33, 'sine', 150, 0.25); // D5
    setTimeout(() => this.playTone(880, 'sine', 350, 0.3), 150); // A5
  }

  // Haptic vibration feedback for silent mode
  vibrate(ms = 200) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignored
      }
    }
  }

  // Text-to-speech for full guidance mode
  speak(text: string, mode: 'full_guidance' | 'essential_beeps' | 'silent_visual', volume = 1.0) {
    if (mode === 'silent_visual') {
      this.vibrate(150);
      return;
    }

    if (mode === 'essential_beeps') {
      this.playTone(600, 'sine', 200, volume * 0.2);
      return;
    }

    // Full guidance voice
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel any pending utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = Math.max(0.1, Math.min(1.0, volume));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to locate Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) {
          utterance.voice = arabicVoice;
          utterance.lang = arabicVoice.lang;
        } else {
          utterance.lang = 'ar-SA';
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback to tone if speech synthesis blocked
        this.playTone(520, 'sine', 200, volume * 0.2);
      }
    }
  }
}

export const audioCoach = new AudioCoachService();
