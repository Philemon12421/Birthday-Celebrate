/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ─── SONG DEFINITIONS ────────────────────────────────────────────────────────
// Each song is an array of [frequency_hz, beat_duration_seconds]
// Tempo is applied at playback time. 

type SongId = 'BIRTHDAY_SIMI' | 'SEVEN_YEARS' | 'LOVE_IS_GONE';

interface SongDef {
  label: string;
  bpm: number;
  melody: [number, number][]; // [freq, beats]
  chords: number[][];         // chord progression (looping)
  chordDuration: number;      // seconds per chord
}

const NOTES = {
  // Octave 3
  A3: 220.00, Bb3: 233.08, B3: 246.94,
  // Octave 4
  C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13,
  E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00,
  Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  // Octave 5
  C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25,
  E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99,
  Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
  // Octave 6
  C6: 1046.50,
};

// ─── 1. Happy Birthday (Simi & Adekunle Gold inspired – Afropop lilt, Bb major) ───
const BIRTHDAY_SIMI_MELODY: [number, number][] = [
  // "Happy birthday to you" x2, "Happy birthday dear friend", "Happy birthday to you"
  [NOTES.F4, 0.75], [NOTES.F4, 0.25], [NOTES.G4, 1.0],
  [NOTES.F4, 1.0],  [NOTES.Bb4, 1.0], [NOTES.A4, 2.0],

  [NOTES.F4, 0.75], [NOTES.F4, 0.25], [NOTES.G4, 1.0],
  [NOTES.F4, 1.0],  [NOTES.C5, 1.0],  [NOTES.Bb4, 2.0],

  [NOTES.F4, 0.75], [NOTES.F4, 0.25], [NOTES.F5, 1.0],
  [NOTES.D5, 1.0],  [NOTES.Bb4, 1.0], [NOTES.A4, 1.0], [NOTES.G4, 2.0],

  [NOTES.Eb5, 0.75],[NOTES.Eb5, 0.25],[NOTES.D5, 1.0],
  [NOTES.Bb4, 1.0], [NOTES.C5, 1.2],  [NOTES.Bb4, 3.5],
];

// ─── 2. 7 Years – Lukas Graham (iconic opening piano line, Eb major) ───────
const SEVEN_YEARS_MELODY: [number, number][] = [
  // "Once I was seven years old..."
  [NOTES.Eb4, 0.5], [NOTES.Eb4, 0.5], [NOTES.Eb4, 0.5],
  [NOTES.Eb4, 0.5], [NOTES.F4, 1.0], [NOTES.G4, 1.0], [NOTES.Bb4, 1.0],
  [NOTES.Bb4, 0.5], [NOTES.Ab4, 0.5], [NOTES.G4, 0.5], [NOTES.F4, 0.5],
  [NOTES.Eb4, 2.0],

  [NOTES.Eb4, 0.5], [NOTES.Eb4, 0.5], [NOTES.Eb4, 0.5],
  [NOTES.Eb4, 0.5], [NOTES.F4, 1.0], [NOTES.Ab4, 1.0], [NOTES.Bb4, 1.0],
  [NOTES.Bb4, 0.5], [NOTES.Ab4, 0.5], [NOTES.G4, 0.5], [NOTES.F4, 0.5],
  [NOTES.Eb4, 2.5],

  // "I only saw my goals, I didn't see the road"
  [NOTES.Bb4, 0.5], [NOTES.Bb4, 0.5], [NOTES.Bb4, 0.5],
  [NOTES.Ab4, 0.5], [NOTES.G4, 1.0], [NOTES.F4, 1.5],
  [NOTES.Eb4, 0.5], [NOTES.F4, 0.5], [NOTES.G4, 1.5],
  [NOTES.G4, 2.0],
];

// ─── 3. Love Is Gone – SLANDER (atmospheric synth-pad, C minor) ─────────────
const LOVE_IS_GONE_MELODY: [number, number][] = [
  [NOTES.C5, 1.0], [NOTES.Eb5, 0.5], [NOTES.G4, 0.5], [NOTES.Bb4, 2.0],
  [NOTES.G4, 0.5], [NOTES.Ab4, 0.5], [NOTES.Bb4, 2.0],
  [NOTES.C5, 1.0], [NOTES.D5, 0.5],  [NOTES.Eb5, 1.5],
  [NOTES.D5, 0.5], [NOTES.C5, 0.5],  [NOTES.Bb4, 3.0],

  [NOTES.Ab4, 1.0],[NOTES.Bb4, 0.5], [NOTES.C5, 2.0],
  [NOTES.G4, 1.0], [NOTES.Ab4, 1.0], [NOTES.Bb4, 2.5],
  [NOTES.G4, 0.5], [NOTES.F4, 0.5],  [NOTES.Eb4, 3.0],
];

const SONGS: Record<SongId, SongDef> = {
  BIRTHDAY_SIMI: {
    label: 'Happy Birthday – Simi & Adekunle Gold',
    bpm: 92,
    melody: BIRTHDAY_SIMI_MELODY,
    chords: [
      [174.61, 220.00, 261.63, 349.23], // Bb major open
      [130.81, 196.00, 246.94, 329.63], // F/C
      [116.54, 174.61, 207.65, 311.13], // Eb
      [98.00,  146.83, 185.00, 246.94], // Cm
    ],
    chordDuration: 10,
  },
  SEVEN_YEARS: {
    label: '7 Years – Lukas Graham',
    bpm: 78,
    melody: SEVEN_YEARS_MELODY,
    chords: [
      [155.56, 196.00, 233.08, 311.13], // Eb maj7
      [116.54, 155.56, 196.00, 233.08], // Cm
      [130.81, 164.81, 220.00, 261.63], // Fm/Ab
      [146.83, 185.00, 220.00, 293.66], // Bb sus
    ],
    chordDuration: 12,
  },
  LOVE_IS_GONE: {
    label: 'Love Is Gone – SLANDER',
    bpm: 68,
    melody: LOVE_IS_GONE_MELODY,
    chords: [
      [130.81, 155.56, 196.00, 233.08], // Cm
      [103.83, 130.81, 164.81, 220.00], // Ab
      [116.54, 146.83, 174.61, 233.08], // Eb
      [98.00,  123.47, 146.83, 185.00], // Gm
    ],
    chordDuration: 14,
  },
};

const SONG_ORDER: SongId[] = ['BIRTHDAY_SIMI', 'SEVEN_YEARS', 'LOVE_IS_GONE'];

// ─── ENGINE ──────────────────────────────────────────────────────────────────

class BirthdaySynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private sequenceTimer: number | null = null;
  private padTimer: number | null = null;
  private currentSongIdx: number = 0;

  constructor() {}

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      this.delayNode = this.ctx.createDelay(2.0);
      this.feedbackGain = this.ctx.createGain();

      this.delayNode.delayTime.setValueAtTime(0.55, this.ctx.currentTime);
      this.feedbackGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.masterGain.connect(this.delayNode);
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);

      this.masterGain.connect(this.ctx.destination);
      this.delayNode.connect(this.ctx.destination);
    } catch (e) {
      console.error('Web Audio API not supported.', e);
    }
  }

  public start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.isMuted = false;

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3.0);
    }

    this._startCurrentSong();
  }

  /** Cycle to next song, returns new label */
  public nextSong(): string {
    this.stop();
    this.currentSongIdx = (this.currentSongIdx + 1) % SONG_ORDER.length;
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    this.isPlaying = false;
    this.start();
    return SONGS[SONG_ORDER[this.currentSongIdx]].label;
  }

  public getCurrentSongLabel(): string {
    return SONGS[SONG_ORDER[this.currentSongIdx]].label;
  }

  public toggleMute(): boolean {
    if (!this.ctx || !this.masterGain) return this.isMuted;
    this.isMuted = !this.isMuted;
    const vol = this.isMuted ? 0 : 0.18;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.4);
    return this.isMuted;
  }

  public getMuteState(): boolean { return this.isMuted; }

  public stop() {
    this.isPlaying = false;
    if (this.sequenceTimer) { window.clearTimeout(this.sequenceTimer); this.sequenceTimer = null; }
    if (this.padTimer) { window.clearTimeout(this.padTimer); this.padTimer = null; }
  }

  // ─── Internal helpers ────────────────────────────────────────────────────

  private _startCurrentSong() {
    const song = SONGS[SONG_ORDER[this.currentSongIdx]];
    this._startMelodyLoop(song);
    this._startAmbientPads(song);
  }

  private playChime(freq: number, duration: number, delayTime: number = 0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const time = this.ctx.currentTime + delayTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2.003, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.32, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(gain); osc2.connect(gain);
    gain.connect(this.masterGain);
    osc1.start(time); osc2.start(time);
    osc1.stop(time + duration + 0.1); osc2.stop(time + duration + 0.1);
  }

  private playPad(frequencies: number[], duration: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    frequencies.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const padGain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, time);
      filter.frequency.exponentialRampToValueAtTime(700, time + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(110, time + duration);
      padGain.gain.setValueAtTime(0, time);
      padGain.gain.linearRampToValueAtTime(0.055, time + duration * 0.3);
      padGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(filter); filter.connect(padGain); padGain.connect(this.masterGain!);
      osc.start(time); osc.stop(time + duration + 0.2);
    });
  }

  private _startMelodyLoop(song: SongDef) {
    let noteIndex = 0;
    const beatMs = (60 / song.bpm) * 1000;

    const runNextNote = () => {
      if (!this.isPlaying) return;
      const [freq, beats] = song.melody[noteIndex % song.melody.length];
      this.playChime(freq, beats * 1.4);
      noteIndex++;
      this.sequenceTimer = window.setTimeout(runNextNote, beats * beatMs);
    };
    runNextNote();
  }

  private _startAmbientPads(song: SongDef) {
    let padIdx = 0;
    const playNextPad = () => {
      if (!this.isPlaying) return;
      this.playPad(song.chords[padIdx % song.chords.length], song.chordDuration + 2);
      padIdx++;
      this.padTimer = window.setTimeout(playNextPad, song.chordDuration * 1000);
    };
    playNextPad();
  }

  // ─── Sound effects ────────────────────────────────────────────────────────

  public playSparkleTransition() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const wave = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    wave.forEach((f, i) => this.playChime(f, 2.5, i * 0.07));
  }

  public playEnvelopeWhoosh() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(1400, time + 0.6);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
    osc.connect(gain); gain.connect(this.masterGain ?? this.ctx.destination);
    osc.start(time); osc.stop(time + 0.7);
  }

  public playPopSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(28, time + 0.15);
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain); gain.connect(this.masterGain ?? this.ctx.destination);
    osc.start(time); osc.stop(time + 0.2);
    this.playChime(NOTES.C5, 0.4);
    setTimeout(() => this.playChime(NOTES.E5, 0.5), 55);
  }

  public playCandleBlowout() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.linearRampToValueAtTime(35, time + 0.9);
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);
    osc.connect(gain); gain.connect(this.masterGain ?? this.ctx.destination);
    osc.start(time); osc.stop(time + 1.0);
    setTimeout(() => this.playSparkleTransition(), 200);
  }

  public playHeartBurst() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    // Sweet ascending arpeggio
    const chord = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6];
    chord.forEach((f, i) => this.playChime(f, 1.8, i * 0.12));
  }
}

export const musicEngine = new BirthdaySynthesizer();
