/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class BirthdaySynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private sequenceTimer: number | null = null;
  private padTimer: number | null = null;

  // F Major Frequencies for the "Happy Birthday" melody
  // Notes: C4, C4, D4, C4, F4, E4, G4, A4, Bb4, C5
  private notes = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    Bb4: 466.16,
    C5: 523.25,
    D5: 587.33,
  };

  constructor() {
    // AudioContext will be lazily loaded after first user click.
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      // Setup master graph
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      // Setup clean luxury delay/space effect
      this.delayNode = this.ctx.createDelay(2.0);
      this.feedbackGain = this.ctx.createGain();
      
      this.delayNode.delayTime.setValueAtTime(0.6, this.ctx.currentTime);
      this.feedbackGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      // Connect delay loop
      this.masterGain.connect(this.delayNode);
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode); // loop

      // Connect master output
      this.masterGain.connect(this.ctx.destination);
      this.delayNode.connect(this.ctx.destination);
    } catch (e) {
      console.error('Web Audio API not supported or blocked in this browser.', e);
    }
  }

  public start() {
    this.init();
    if (!this.ctx) return;
    
    // Resume context if suspended (common browser restriction)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.isMuted = false;
    
    // Set dynamic volume
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3.0); // Slow luxurious volume fade-in
    }

    this.startMelodyLoop();
    this.startAmbientPads();
  }

  public toggleMute(): boolean {
    if (!this.ctx || !this.masterGain) return this.isMuted;
    
    this.isMuted = !this.isMuted;
    const targetVolume = this.isMuted ? 0 : 0.18;
    
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 0.4);
    
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  public stop() {
    this.isPlaying = false;
    if (this.sequenceTimer) {
      window.clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    if (this.padTimer) {
      window.clearInterval(this.padTimer);
      this.padTimer = null;
    }
  }

  // Plays a beautiful soft sine wave chime (music box timbre)
  private playChime(freq: number, duration: number, delayTime: number = 0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    
    const time = this.ctx.currentTime + delayTime;
    
    // Dual oscillator for rich, slightly out-of-tune organic chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc1.type = 'triangle'; // Sweet fundamental tone
    osc2.type = 'sine';     // Bright octave chime
    
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2.004, time); // Subtle crystalline detune

    chimeGain.gain.setValueAtTime(0, time);
    chimeGain.gain.linearRampToValueAtTime(0.35, time + 0.02); // Sharp clean attack
    chimeGain.gain.exponentialRampToValueAtTime(0.001, time + duration); // Long lingering decay

    osc1.connect(chimeGain);
    osc2.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    
    osc1.stop(time + duration + 0.1);
    osc2.stop(time + duration + 0.1);
  }

  // Ambient Pad to hold the harmonies (Luxury celestial feeling)
  private playPad(frequencies: number[], duration: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    
    const time = this.ctx.currentTime;
    
    frequencies.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const padGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      // Low pass filter with nice slow sweeping warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, time);
      filter.frequency.exponentialRampToValueAtTime(800, time + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(120, time + duration);

      padGain.gain.setValueAtTime(0, time);
      padGain.gain.linearRampToValueAtTime(0.06, time + duration * 0.3); // Warm slow entry
      padGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(padGain);
      padGain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + duration + 0.2);
    });
  }

  // Play "Happy Birthday to You" notes dreamily
  private startMelodyLoop() {
    let noteIndex = 0;
    
    // Sequence of [frequency, beatDuration]
    // A dreamy tempo of 0.8s per beat
    const melody: [number, number][] = [
      [this.notes.C4, 0.7],
      [this.notes.C4, 0.3],
      [this.notes.D4, 1.0],
      [this.notes.C4, 1.0],
      [this.notes.F4, 1.0],
      [this.notes.E4, 2.0], // Birthday to you
      
      [this.notes.C4, 0.7],
      [this.notes.C4, 0.3],
      [this.notes.D4, 1.0],
      [this.notes.C4, 1.0],
      [this.notes.G4, 1.0],
      [this.notes.F4, 2.0], // Birthday to you
      
      [this.notes.C4, 0.7],
      [this.notes.C4, 0.3],
      [this.notes.C5, 1.0],
      [this.notes.A4, 1.0],
      [this.notes.F4, 1.0],
      [this.notes.E4, 1.0],
      [this.notes.D4, 2.0], // Birthday dear friend
      
      [this.notes.Bb4, 0.7],
      [this.notes.Bb4, 0.3],
      [this.notes.A4, 1.0],
      [this.notes.F4, 1.0],
      [this.notes.G4, 1.1],
      [this.notes.F4, 3.5], // Birthday to you
    ];

    const runNextNote = () => {
      if (!this.isPlaying) return;
      const [freq, beats] = melody[noteIndex % melody.length];
      
      this.playChime(freq, beats * 1.5);
      
      noteIndex++;
      
      const intervalMs = beats * 1050; // Dreamy space tempo mapping
      this.sequenceTimer = window.setTimeout(runNextNote, intervalMs);
    };

    // Begin looping melody
    runNextNote();
  }

  // Ambient slow pad progression
  private startAmbientPads() {
    // Chords (Fmaj7, C6, Bbmaj9, Fmaj7)
    const progressions = [
      [174.61, 220.00, 261.63, 329.63], // F, A, C, E (Fmaj7)
      [130.81, 196.00, 246.94, 293.66], // C, G, B, D (Cmaj9)
      [116.54, 174.61, 220.00, 293.66], // Bb, F, A, D (Bbmaj9)
      [174.61, 220.00, 261.63, 349.23], // F, A, C, F (F major open)
    ];

    let padIndex = 0;
    
    const playNextPad = () => {
      if (!this.isPlaying) return;
      const chord = progressions[padIndex % progressions.length];
      this.playPad(chord, 14.0); // Super lingering, slowly overlapping pads
      padIndex++;
      
      this.padTimer = window.setTimeout(playNextPad, 12000); // Overlay every 12 seconds
    };

    playNextPad();
  }

  // --- SOUND EFFECTS ---

  // Sparkling harp transition sound (Arpeggio sweep)
  public playSparkleTransition() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    
    const time = this.ctx.currentTime;
    const notesToPlay = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Beautiful C Major upward wave
    
    notesToPlay.forEach((freq, idx) => {
      this.playChime(freq, 2.5, idx * 0.08); // Speed sparkle sweeping UP
    });
  }

  // Envelope Opening Swish Sound
  public playEnvelopeWhoosh() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    
    const time = this.ctx.currentTime;
    const duration = 0.6;
    
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();

    // Create a beautiful sweeping sine whoosh
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(1200, time + duration); // Sweeps up high

    noiseGain.gain.setValueAtTime(0, time);
    noiseGain.gain.linearRampToValueAtTime(0.12, time + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(noiseGain);
    noiseGain.connect(this.masterGain ?? this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  // Balloon pop sound (sharp popping noise then release)
  public playPopSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    
    // Synthesize a pop with buffer noise or sharp oscillators
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.15); // sharp drop

    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain ?? this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.2);

    // Complementary little high-frequency sparkle for the released confetti
    this.playChime(this.notes.C5, 0.4);
    setTimeout(() => this.playChime(659.25, 0.5), 50);
  }

  // Blowing the physical candles blowout sound
  public playCandleBlowout() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    
    // Synthesize the "puff of air" white noise sweep
    const duration = 0.8;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, time);
    osc.frequency.linearRampToValueAtTime(40, time + duration);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain ?? this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.1);

    // Follow up: Play rapid magical harp chimes as a celebratory reaction!
    setTimeout(() => {
      this.playSparkleTransition();
    }, 200);
  }
}

export const musicEngine = new BirthdaySynthesizer();
