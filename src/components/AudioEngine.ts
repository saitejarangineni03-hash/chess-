/**
 * AudioEngine.ts
 * A lazy-initialized Web Audio API Synthesizer to play solid, pleasant retro-tactile sound effects
 * for chess moves, captures, and game end alerts.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // --- Background Music Sequencer State ---
  private bgTimerId: any = null;
  private isBgPlaying: boolean = false;
  private bgStep: number = 0;
  private bgMood: "victory" | "defeat" | "draw" = "victory";

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopCompletedMusic();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playMove() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(350, this.ctx.currentTime); // Standard tactile tap
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio failure omitted: ", e);
    }
  }

  public playCapture() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      // Tap + Snare-like noise snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);

      // Play metallic noise click
      const bufferSize = this.ctx.sampleRate * 0.04; // Very short snap
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseNode.start();
      noiseNode.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio failure omitted: ", e);
    }
  }

  public playCheck() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      // Minor second warning sound
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.type = "sawtooth";
      osc2.type = "sawtooth";

      // Filter to dampen the harshness of sawtooth
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      osc1.disconnect(gain);
      osc2.disconnect(gain);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);

      osc1.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(440, this.ctx.currentTime); // Dissonant dual frequency

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.3);
      osc2.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio failure omitted: ", e);
    }
  }

  public playVictory() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Beautiful major arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });
    } catch (e) {
      console.warn("Audio failure omitted: ", e);
    }
  }

  public playDefeat() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Play a sad minor or descending scale
      const notes = [293.66, 277.18, 261.63, 220.00]; // D4, C#4, C4, A3

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "sawtooth";
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, now);
        osc.disconnect(gain);
        osc.connect(filter);
        filter.connect(gain);

        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } catch (e) {
      console.warn("Audio failure omitted: ", e);
    }
  }

  public playDraw() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn("Audio failure omitted: ", e);
    }
  }

  // --- Generative Background Ending Music Engine ---
  public startCompletedMusic(mood: "victory" | "defeat" | "draw") {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      // Stop any running track first
      this.stopCompletedMusic();

      this.bgMood = mood;
      this.bgStep = 0;
      this.isBgPlaying = true;

      // Trigger the introductory flourish immediately
      if (mood === "victory") {
        this.playVictory();
      } else if (mood === "defeat") {
        this.playDefeat();
      } else {
        this.playDraw();
      }

      // Start tick interval generator (400ms per step)
      this.bgTimerId = setInterval(() => {
        this.handleMusicStep();
      }, 400);

    } catch (e) {
      console.warn("Background music scheduler failed: ", e);
    }
  }

  public stopCompletedMusic() {
    if (this.bgTimerId) {
      clearInterval(this.bgTimerId);
      this.bgTimerId = null;
    }
    this.isBgPlaying = false;
    this.bgStep = 0;
  }

  public getIsBgPlaying(): boolean {
    return this.isBgPlaying;
  }

  private handleMusicStep() {
    if (!this.isBgPlaying || this.isMuted || !this.ctx) return;

    try {
      const step = this.bgStep;
      const mood = this.bgMood;

      // Setup current musical patterns
      let bassFreq = 0;
      let padNotes: number[] = [];
      let melodyFreq = 0;

      if (mood === "victory") {
        // Chord progression: C (steps 0-3), G (steps 4-7), Am (steps 8-11), F (steps 12-15)
        const chordIdx = Math.floor(step / 4);
        const roots = [65.41, 98.00, 110.00, 87.31]; // C2, G2, A2, F2
        const chords = [
          [261.63, 329.63, 392.00], // C
          [246.94, 293.66, 392.00], // G
          [261.63, 329.63, 440.00], // Am
          [261.63, 349.23, 440.00]  // F
        ];
        const melodies = [
          659.25, 783.99, 1046.50, 1318.51,
          587.33, 783.99, 987.77, 1174.66,
          659.25, 880.00, 1046.50, 1318.51,
          698.46, 880.00, 1046.50, 1396.91
        ];

        bassFreq = roots[chordIdx];
        padNotes = chords[chordIdx];
        melodyFreq = melodies[step];

      } else if (mood === "defeat") {
        // Chord progression: Am (steps 0-3), F (steps 4-7), C (steps 8-11), G (steps 12-15)
        const chordIdx = Math.floor(step / 4);
        const roots = [110.00, 87.31, 130.81, 98.00]; // A2, F2, C3, G2
        const chords = [
          [220.00, 261.63, 329.63], // Am
          [220.00, 261.63, 349.23], // F
          [196.00, 261.63, 329.63], // C
          [196.00, 246.94, 293.66]  // G
        ];
        const melodies = [
          659.25, 0, 523.25, 0,
          440.00, 0, 349.23, 0,
          392.00, 0, 329.63, 0,
          293.66, 0, 246.94, 0
        ];

        bassFreq = roots[chordIdx];
        padNotes = chords[chordIdx];
        melodyFreq = melodies[step];

      } else {
        // Mood is Draw / Timeout
        // Chord progression: Fmaj7 (steps 0-3), Cmaj7 (steps 4-7) repeating
        const chordIdx = Math.floor(step / 4) % 2;
        const roots = [87.31, 130.81]; // F2, C3
        const chords = [
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [164.81, 196.00, 246.94, 293.66]  // Cmaj7
        ];
        const melodies = [
          783.99, 0, 880.00, 0,
          659.25, 0, 783.99, 0,
          1046.50, 0, 987.77, 0,
          880.00, 0, 783.99, 0
        ];

        bassFreq = roots[chordIdx];
        padNotes = chords[chordIdx];
        melodyFreq = melodies[step];
      }

      // Play matching voices depending on step structure
      const now = this.ctx.currentTime;

      // 1. Warm Bass Base note on bar change
      if (step % 4 === 0) {
        this.playStepBass(bassFreq, now);
      }

      // 2. Slow soft pad chord fade in on bar change
      if (step % 8 === 0) {
        this.playStepPad(padNotes, now);
      }

      // 3. Ambient Lead design
      if (melodyFreq > 0) {
        this.playStepLead(melodyFreq, now, mood === "victory" ? "triangle" : "sine");
      }

      // Advance clock cycle
      this.bgStep = (this.bgStep + 1) % 16;

    } catch (err) {
      console.warn("Melody generator error: ", err);
    }
  }

  private playStepBass(freq: number, now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  private playStepPad(notes: number[], now: number) {
    if (!this.ctx) return;
    
    notes.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.5); // long slow attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }

  private playStepLead(freq: number, now: number, type: "sine" | "triangle") {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);

    // Dynamic echo response
    const echoOsc = this.ctx.createOscillator();
    const echoGainNode = this.ctx.createGain();

    echoOsc.type = type;
    echoOsc.frequency.setValueAtTime(freq, now + 0.15); // delay offset

    echoGainNode.gain.setValueAtTime(0, now + 0.15);
    echoGainNode.gain.linearRampToValueAtTime(0.025, now + 0.17);
    echoGainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55 + 0.15);

    echoOsc.connect(echoGainNode);
    echoGainNode.connect(this.ctx.destination);

    echoOsc.start(now + 0.15);
    echoOsc.stop(now + 0.8);
  }
}

export const audio = new AudioEngine();
