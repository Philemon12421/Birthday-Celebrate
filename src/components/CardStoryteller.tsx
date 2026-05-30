/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Heart, Gift, MailOpen, ArrowRight, RotateCcw,
  Check, PartyPopper, Volume2, VolumeX, Mail, Music2,
} from 'lucide-react';
import { ExperienceStep } from '../types';
import { musicEngine } from '../utils/audio';
import ScratchCard from './ScratchCard';
import PhotoGallery from './PhotoGallery';

/* ─── Design tokens (all inline) ──────────────────────────────────────────── */
const C = {
  gold:        '#F59E0B',
  goldLight:   '#FCD34D',
  goldDark:    '#D97706',
  goldPale:    '#FFFBEB',
  goldBorder:  'rgba(251,191,36,0.25)',
  white:       '#ffffff',
  cardBg:      'rgba(255,253,245,0.95)',
  textPrimary: '#1f2937',
  textMuted:   '#6b7280',
  textAmber:   '#92400e',
  rose:        '#fb7185',
  emerald:     '#10b981',
};

const btnPrimary: React.CSSProperties = {
  padding: '12px 24px',
  borderRadius: 50,
  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 60%, #D97706 100%)',
  color: '#fff',
  fontWeight: 500,
  fontSize: 12,
  letterSpacing: '0.08em',
  boxShadow: '0 8px 20px rgba(251,191,36,0.30)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  outline: 'none',
  fontFamily: "'Poppins', system-ui, sans-serif",
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  background: '#d1d5db',
  boxShadow: 'none',
  cursor: 'not-allowed',
  opacity: 0.65,
};

const card: React.CSSProperties = {
  width: '100%',
  background: C.cardBg,
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(251,191,36,0.18)',
  borderRadius: 28,
  boxShadow: '0 20px 60px rgba(218,165,32,0.10), 0 4px 16px rgba(0,0,0,0.04)',
  padding: '28px 24px 32px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  textAlign: 'center' as const,
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

/* ─── Floating heart ────────────────────────────────────────────────────── */
function FloatingHeart({ delay }: { delay: number }) {
  const left = 8 + Math.random() * 84;
  return (
    <motion.div
      style={{ position: 'absolute', left: `${left}%`, bottom: '-5%', fontSize: 16 + Math.random() * 16, color: C.rose, pointerEvents: 'none', userSelect: 'none' }}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: '-115vh', scale: [0.5, 1.1, 1], rotate: Math.random() * 30 - 15 }}
      transition={{ duration: 3.5 + Math.random() * 2, delay, ease: 'easeOut' }}
    >♥</motion.div>
  );
}

/* ─── Progress bar ──────────────────────────────────────────────────────── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <span style={{ fontSize: 10, fontFamily: 'Courier New, monospace', letterSpacing: '0.2em', color: 'rgba(180,100,20,0.7)', textTransform: 'uppercase' }}>
        Step {current} of {total}
      </span>
      <div style={{ width: 96, height: 4, background: 'rgba(251,191,36,0.12)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #FCD34D, #D97706)',
          borderRadius: 4,
          transition: 'width 0.7s ease',
          boxShadow: '0 0 6px rgba(251,191,36,0.5)',
        }} />
      </div>
    </div>
  );
}

/* ─── Icon badge ─────────────────────────────────────────────────────────── */
function IconBadge({ children, pulse = false }: { children: React.ReactNode; pulse?: boolean }) {
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.08, 1] } : { rotate: [0, 5, -5, 0] }}
      transition={pulse ? { repeat: Infinity, duration: 2.2 } : { repeat: Infinity, duration: 3, repeatDelay: 2 }}
      style={{
        width: 64, height: 64, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(253,243,199,0.8), rgba(254,243,199,0.4))',
        border: '1px solid rgba(251,191,36,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, color: C.gold, flexShrink: 0,
      }}
    >{children}</motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
interface Props {
  currentStep: ExperienceStep;
  onNext: (s: ExperienceStep) => void;
  onReset: () => void;
}

export default function CardStoryteller({ currentStep, onNext, onReset }: Props) {
  const [isMuted, setIsMuted]             = useState(false);
  const [songLabel, setSongLabel]         = useState('');
  const [isEnvelopeOpen, setEnvelopeOpen] = useState(false);
  const [letterTyped, setLetterTyped]     = useState(false);
  const [wishTyped, setWishTyped]         = useState(false);
  const [visibleParas, setVisibleParas]   = useState(0);
  const [letterText, setLetterText]       = useState('');
  const [candlesOut, setCandlesOut]       = useState(0);
  const [flames, setFlames]               = useState([true, true, true]);
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);
  const [cakeRevealed, setCakeRevealed]   = useState(false);
  const [wishClicked, setWishClicked]     = useState(false);
  const [hearts, setHearts]               = useState<number[]>([]);

  const PARAS = [
    "On this exceptionally beautiful day, we celebrate the incredible individual that you are.",
    "May your coming year be illuminated with endless creativity, your heart hold boundless peace, and your footsteps lead to magnificent triumphs.",
    "You bring a bright, golden inspiration to every community and everyone honoured to share in your journey.",
    "We reflect that glorious light back on you today with absolute joy, sincere gratitude, and endless celebration.",
    "Here is to a brilliant new chapter of happiness, graceful wisdom, and every single one of your dreams coming spectacular to life.",
  ];

  const LETTER = "Dear Celebrant,\n\nTake time to celebrate yourself today. Reflect on every lesson, appreciate every victory, and embrace the beautiful masterpiece you are becoming.\n\nDrenchack Tech is honoured to dedicate this digital surprise to your special day. May the year ahead bring you unprecedented heights, boundless inspiration, and deep serenity.\n\nYou are loved, cherished, and celebrated beyond words.\n\nHappy Birthday, with highest regards!\n— Drenchack Tech ✦";

  // Sync audio
  useEffect(() => {
    setIsMuted(musicEngine.getMuteState());
    setSongLabel(musicEngine.getCurrentSongLabel());
  }, []);

  // Message paragraphs reveal
  useEffect(() => {
    if (currentStep !== 'MESSAGE') return;
    setVisibleParas(0); setWishTyped(false);
    const t = setInterval(() => {
      setVisibleParas(p => {
        const n = p + 1;
        if (n >= PARAS.length - 1) { setWishTyped(true); clearInterval(t); }
        return n;
      });
    }, 2400);
    return () => clearInterval(t);
  }, [currentStep]);

  // Letter typewriter
  useEffect(() => {
    if (currentStep !== 'LETTER' || !isEnvelopeOpen) return;
    setLetterText(''); setLetterTyped(false);
    let i = 0;
    const t = setInterval(() => {
      if (i < LETTER.length) { setLetterText(p => p + LETTER[i]); i++; }
      else { setLetterTyped(true); clearInterval(t); }
    }, 20);
    return () => clearInterval(t);
  }, [currentStep, isEnvelopeOpen]);

  // Hearts on FINAL
  useEffect(() => {
    if (currentStep !== 'FINAL') return;
    musicEngine.playHeartBurst?.();
    setHearts(Array.from({ length: 20 }, (_, i) => i));
    const t = setTimeout(() => setHearts([]), 9000);
    return () => clearTimeout(t);
  }, [currentStep]);

  // Reset
  useEffect(() => {
    if (currentStep !== 'SPLASH') return;
    setEnvelopeOpen(false); setLetterTyped(false); setWishTyped(false);
    setCandlesOut(0); setFlames([true, true, true]); setCakeRevealed(false);
    setWishClicked(false); setHoveredCandle(null);
  }, [currentStep]);

  const blowCandle = (idx: number) => {
    if (!flames[idx]) return;
    musicEngine.playCandleBlowout();
    const nf = [...flames]; nf[idx] = false; setFlames(nf);
    setHoveredCandle(null);
    const n = candlesOut + 1; setCandlesOut(n);
    if (n === 3) {
      setTimeout(() => musicEngine.playPopSound(), 400);
      setTimeout(() => musicEngine.playPopSound(), 800);
      setTimeout(() => window.dispatchEvent(new CustomEvent('birthday-confetti-explode', {
        detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 120 },
      })), 1000);
    }
  };

  const triggerWish = (e: React.MouseEvent) => {
    if (wishClicked) return;
    setWishClicked(true);
    musicEngine.playSparkleTransition();
    window.dispatchEvent(new CustomEvent('birthday-confetti-explode', {
      detail: { x: e.clientX, y: e.clientY },
    }));
  };

  const STEPS: ExperienceStep[] = ['INTRO','SURPRISE','PHOTO','MESSAGE','LETTER','CELEBRATION','FINAL'];
  const stepIdx = STEPS.indexOf(currentStep);
  const goNext = (s: ExperienceStep) => { musicEngine.playSparkleTransition(); onNext(s); };

  const maxW = currentStep === 'PHOTO' ? 520
             : currentStep === 'LETTER' ? 700
             : 500;

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: '16px', userSelect: 'none' }}>

      {/* Floating hearts */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
        <AnimatePresence>{hearts.map(i => <FloatingHeart key={i} delay={i * 0.22} />)}</AnimatePresence>
      </div>

      {/* Audio controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        {[
          { icon: isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>, onClick: () => { const m = musicEngine.toggleMute(); setIsMuted(m); }, title: isMuted ? 'Unmute' : 'Mute' },
          { icon: <Music2 size={20}/>, onClick: () => { const l = musicEngine.nextSong(); setSongLabel(l); }, title: 'Next Song' },
        ].map((btn, i) => (
          <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
            onClick={btn.onClick} title={btn.title}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(251,191,36,0.35)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', outline: 'none',
            }}>
            {btn.icon}
          </motion.button>
        ))}
        <AnimatePresence>
          {songLabel && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              style={{
                background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 10, padding: '6px 12px', maxWidth: 160,
                fontSize: 9, fontFamily: 'Courier New, monospace', color: 'rgba(180,100,20,0.8)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
              {songLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main card */}
      <AnimatePresence mode="wait">
        {currentStep !== 'SPLASH' && stepIdx >= 0 && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -32, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...card, maxWidth: maxW, pointerEvents: 'auto' }}
          >
            {/* Top gradient bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #FDE68A, #F59E0B, #FDE68A)', borderRadius: '28px 28px 0 0' }} />

            <ProgressBar current={stepIdx + 1} total={STEPS.length} />

            {/* ── INTRO ─────────────────────────────────────────────────── */}
            {currentStep === 'INTRO' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '16px 0' }}>
                <IconBadge><Sparkles size={32} style={{ fill: '#FCD34D', stroke: '#D97706' }} /></IconBadge>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.01em', marginBottom: 12 }}>Today is all about you.</h2>
                <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.75, maxWidth: 320, marginBottom: 32, fontWeight: 300 }}>
                  A beautiful chapter unfolds. Today, let the noise of the world wash away, and let yourself bask in pure warmth.
                </p>
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 12px 28px rgba(251,191,36,0.4)' }} whileTap={{ scale: 0.95 }} onClick={() => goNext('SURPRISE')} style={btnPrimary}>
                  Unveil The Surprise <ArrowRight size={16} />
                </motion.button>
              </div>
            )}

            {/* ── SURPRISE ──────────────────────────────────────────────── */}
            {currentStep === 'SURPRISE' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '16px 0' }}>
                <IconBadge pulse><Heart size={32} style={{ fill: '#FCD34D', stroke: '#D97706' }} /></IconBadge>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 800, color: C.textPrimary, letterSpacing: '-0.01em', marginBottom: 12 }}>A Special Celebration</h2>
                <blockquote style={{ fontStyle: 'italic', color: '#9ca3af', fontSize: 12, fontFamily: "'Playfair Display', serif", lineHeight: 1.7, maxWidth: 340, marginBottom: 20, borderLeft: '2px solid rgba(251,191,36,0.5)', paddingLeft: 16, textAlign: 'left' }}>
                  "Some days are clean, some days are memorable, but today is extraordinary because of who we celebrate."
                </blockquote>
                <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.75, maxWidth: 320, marginBottom: 32, fontWeight: 300 }}>
                  Drenchack Tech wishes to create a magnificent, peaceful oasis just to say thank you for being incredible.
                </p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => goNext('PHOTO')} style={btnPrimary}>
                  See What Is Next <ArrowRight size={16} />
                </motion.button>
              </div>
            )}

            {/* ── PHOTO ─────────────────────────────────────────────────── */}
            {currentStep === 'PHOTO' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: 8 }}>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 800, color: C.textPrimary, marginBottom: 4 }}>Golden Gallery of Memories</h2>
                <p style={{ fontSize: 10, fontFamily: 'Courier New, monospace', letterSpacing: '0.18em', color: 'rgba(180,100,20,0.7)', textTransform: 'uppercase', marginBottom: 24 }}>
                  ✦ Interactive Polaroid Archive ✦
                </p>
                <PhotoGallery onComplete={() => goNext('MESSAGE')} />
                <div style={{ width: '100%', height: 1, background: 'rgba(251,191,36,0.15)', margin: '24px 0' }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => goNext('MESSAGE')} style={btnPrimary}>
                  Unfold Your Wish <ArrowRight size={16} />
                </motion.button>
              </div>
            )}

            {/* ── MESSAGE ───────────────────────────────────────────────── */}
            {currentStep === 'MESSAGE' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '16px 0' }}>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(253,243,199,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: C.gold }}>
                  <Gift size={24} />
                </motion.div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 800, color: C.textPrimary, marginBottom: 16 }}>Heartfelt Wishes</h2>

                <div style={{
                  width: '100%', minHeight: 220, background: 'linear-gradient(to bottom, rgba(253,243,199,0.15), #fff)',
                  border: '1px solid rgba(251,191,36,0.2)', borderRadius: 18, padding: 24, marginBottom: 28,
                  textAlign: 'left', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(218,165,32,0.04)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {PARAS.map((p, idx) => idx <= visibleParas && (
                      <motion.p key={idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }}
                        style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.8, fontWeight: 300, borderLeft: '2px solid rgba(251,191,36,0.35)', paddingLeft: 12, margin: 0 }}>
                        {p}
                        {idx === visibleParas && !wishTyped && (
                          <span style={{ display: 'inline-block', width: 10, height: 14, marginLeft: 6, background: C.gold, borderRadius: 2, verticalAlign: 'middle', animation: 'blink 1s infinite' }} />
                        )}
                      </motion.p>
                    ))}
                  </div>
                </div>

                <motion.button whileHover={wishTyped ? { scale: 1.05 } : {}} whileTap={wishTyped ? { scale: 0.95 } : {}}
                  onClick={() => goNext('LETTER')} disabled={!wishTyped} style={wishTyped ? btnPrimary : btnDisabled}>
                  Open Sealed Letter <Mail size={16} />
                </motion.button>
              </div>
            )}

            {/* ── LETTER ────────────────────────────────────────────────── */}
            {currentStep === 'LETTER' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: 8 }}>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 800, color: C.textPrimary, marginBottom: 24 }}>Sealed Devoted Note</h2>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
                  {/* Left: photo */}
                  <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
                    style={{ flex: '0 0 auto', width: 'min(45%, 200px)' }}>
                    <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 18, overflow: 'hidden', position: 'relative', boxShadow: '0 16px 36px rgba(218,165,32,0.18)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <img src="/IMG_20260529_135235_489.jpg" alt="Celebrant"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, rgba(218,165,32,0.3) 100%)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 8px', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 600, margin: 0 }}>✦ The Celebrant ✦</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                      {[0,1,2,3,4].map(i => (
                        <motion.span key={i} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.4, delay: i * 0.18, repeat: Infinity }}
                          style={{ color: C.rose, fontSize: 12 }}>♥</motion.span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Right: letter */}
                  <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                    style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
                    <AnimatePresence>
                      {!isEnvelopeOpen ? (
                        <motion.div key="sealed" exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => { setEnvelopeOpen(true); musicEngine.playEnvelopeWhoosh(); }}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          style={{
                            flex: 1, background: 'linear-gradient(135deg, rgba(253,243,199,0.8), rgba(255,253,245,0.9))',
                            borderRadius: 18, border: '1.5px solid rgba(251,191,36,0.35)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: 24, cursor: 'pointer', boxShadow: '0 8px 24px rgba(218,165,32,0.1)',
                            minHeight: 280,
                          }}>
                          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                            style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(253,243,199,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: C.gold }}>
                            <MailOpen size={28} />
                          </motion.div>
                          <span style={{ color: C.textPrimary, fontSize: 14, fontWeight: 500 }}>Click to Unseal Envelope</span>
                          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{ color: 'rgba(180,100,20,0.7)', fontSize: 9, fontFamily: 'Courier New, monospace', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}>
                            Personal &amp; Warm
                          </motion.span>
                        </motion.div>
                      ) : (
                        <motion.div key="open" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{
                            flex: 1, background: '#fff', border: '1px solid rgba(251,191,36,0.2)',
                            borderRadius: 18, padding: 20, overflowY: 'auto', position: 'relative',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)', minHeight: 240, maxHeight: 320,
                          }}>
                            {/* Paper lines */}
                            <div style={{ position: 'absolute', inset: 0, borderRadius: 18, opacity: 0.025,
                              background: 'repeating-linear-gradient(transparent, transparent 23px, rgba(218,165,32,1) 24px)', pointerEvents: 'none' }} />
                            {/* Wax seal */}
                            <div style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%',
                              background: 'rgba(253,243,199,0.9)', border: '2px solid rgba(251,191,36,0.5)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.gold,
                              boxShadow: '0 0 0 0 rgba(251,191,36,0.4)', animation: 'wax-pulse 2s ease-in-out infinite' }}>✦</div>
                            <p style={{ fontFamily: "'Dancing Script', 'Courier New', cursive", fontSize: 16, color: '#78350f', lineHeight: 1.9, whiteSpace: 'pre-line', margin: 0, position: 'relative', zIndex: 1 }}>
                              {letterText}
                              {!letterTyped && <span style={{ display: 'inline-block', width: 6, height: 16, marginLeft: 2, background: C.gold, animation: 'blink 0.8s infinite' }} />}
                            </p>
                          </div>
                          <div style={{ height: 40, background: 'rgba(253,243,199,0.6)', borderRadius: '0 0 18px 18px', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 9, fontFamily: 'Courier New, monospace', letterSpacing: '0.2em', color: 'rgba(180,100,20,0.55)', textTransform: 'uppercase' }}>Drenchack Tech ✦ With Love</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <motion.button whileHover={letterTyped ? { scale: 1.05 } : {}} whileTap={letterTyped ? { scale: 0.95 } : {}}
                  onClick={() => goNext('CELEBRATION')} disabled={!letterTyped} style={letterTyped ? btnPrimary : btnDisabled}>
                  Light The Candles <PartyPopper size={16} />
                </motion.button>
              </div>
            )}

            {/* ── CELEBRATION ───────────────────────────────────────────── */}
            {currentStep === 'CELEBRATION' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: 8 }}>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 800, color: C.textPrimary, marginBottom: 6 }}>
                  {!cakeRevealed ? 'Scratch to Unveil' : 'Make A Wish'}
                </h2>
                <motion.p animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2 }}
                  style={{ fontSize: 10, fontFamily: 'Courier New, monospace', letterSpacing: '0.18em', color: 'rgba(180,100,20,0.7)', textTransform: 'uppercase', marginBottom: 24 }}>
                  {!cakeRevealed ? '✦ Swipe the foil to reveal your cake ✦'
                   : candlesOut < 3 ? '✦ Hover & tap each flame to blow it out ✦'
                   : '✦ All wishes sent to the universe! ✦'}
                </motion.p>

                <div style={{ width: 220, height: 200, position: 'relative', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
                  <AnimatePresence mode="wait">
                    {!cakeRevealed ? (
                      <motion.div key="scratch" exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }} transition={{ duration: 0.5 }}
                        style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ScratchCard onComplete={() => setCakeRevealed(true)} width={220} height={200} />
                      </motion.div>
                    ) : (
                      <motion.div key="cake" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                        style={{ width: 200, height: 190, overflow: 'visible' }}>
                        <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 100 100">
                          {[0,1,2].map(idx => {
                            const px = 37 + idx * 13;
                            const hasFlame = flames[idx];
                            const hov = hoveredCandle === idx;
                            return (
                              <g key={idx}>
                                <rect x={px-1.5} y="14" width="3" height="16" fill="#FCD34D" stroke="rgba(245,158,11,0.5)" strokeWidth="0.5" />
                                <line x1={px-1.5} y1="18" x2={px+1.5} y2="21" stroke="white" strokeWidth="0.7" />
                                <line x1={px-1.5} y1="24" x2={px+1.5} y2="27" stroke="white" strokeWidth="0.7" />
                                <line x1={px} y1="14" x2={px} y2="10" stroke="#374151" strokeWidth="0.8" />
                                {hasFlame ? (
                                  <motion.g style={{ cursor: 'pointer', originX: px, originY: 10 }}
                                    animate={{ scale: hov ? 1.8 : 1 }} transition={{ duration: 0.2 }}
                                    onClick={() => blowCandle(idx)}
                                    onMouseEnter={() => setHoveredCandle(idx)}
                                    onMouseLeave={() => setHoveredCandle(null)}
                                    onTouchStart={() => { setHoveredCandle(idx); setTimeout(() => blowCandle(idx), 100); }}>
                                    {hov && <ellipse cx={px} cy={4} rx={8} ry={11} fill="rgba(255,160,0,0.2)" />}
                                    <motion.path d={`M ${px} -2 Q ${px-3.5} 4 ${px} 10 Q ${px+3.5} 4 ${px} -2 Z`}
                                      fill={hov ? '#FF6B00' : '#FF9F1C'} stroke="#FFD700" strokeWidth="0.5"
                                      animate={{ scaleY: [1,1.2,0.95,1.1,1], scaleX: [1,0.9,1.1,0.95,1] }}
                                      transition={{ repeat: Infinity, duration: 1.1+idx*0.2, ease: 'easeInOut' }} />
                                    {hov && <text x={px} y={-10} textAnchor="middle" fontSize="4.5" fill="#92400e" fontFamily="Poppins, sans-serif">Tap!</text>}
                                  </motion.g>
                                ) : (
                                  <motion.path d={`M ${px} 8 Q ${px-3} 3 ${px-1} -2 Q ${px+1} -7 ${px-2} -12`}
                                    fill="none" stroke="rgba(156,163,175,0.5)" strokeWidth="1.2" strokeLinecap="round"
                                    initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 0, y: -6 }}
                                    transition={{ duration: 1.5 }} />
                                )}
                              </g>
                            );
                          })}
                          {/* Cake */}
                          <rect x="30" y="30" width="40" height="15" rx="3" fill="rgba(253,243,199,0.6)" stroke="rgba(253,243,199,0.8)" strokeWidth="0.5"/>
                          <path d="M 30 35 Q 35 39 40 35 Q 45 40 50 35 Q 55 39 60 35 Q 65 39 70 35 L 70 30 L 30 30 Z" fill="#FFFAC2"/>
                          <rect x="22" y="45" width="56" height="18" rx="4" fill="white" stroke="rgba(253,243,199,0.6)" strokeWidth="0.5"/>
                          <rect x="22" y="52" width="56" height="4" fill="rgba(253,243,199,0.8)"/>
                          <rect x="12" y="63" width="76" height="23" rx="5" fill="rgba(253,246,220,0.8)" stroke="rgba(253,243,199,0.8)" strokeWidth="0.5"/>
                          {[16,28,40,52,64,76,84].map(cx => <circle key={cx} cx={cx} cy="80" r="3" fill="white"/>)}
                          <path d="M 6 86 Q 50 90 94 86" stroke="#E6B800" strokeWidth="2.5" strokeLinecap="round"/>
                          <ellipse cx="50" cy="88" rx="38" ry="4" fill="rgba(253,243,199,0.4)"/>
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {candlesOut === 3 && !wishClicked && (
                    <motion.div initial={{ opacity:0, scale:0.9, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9 }} transition={{ duration:1.2 }}
                      onClick={triggerWish}
                      style={{ marginBottom: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: 'linear-gradient(135deg, rgba(253,243,199,0.5), rgba(255,251,235,0.3))',
                        border: '1px solid rgba(251,191,36,0.35)', borderRadius: 18, padding: '14px 24px',
                        transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(251,191,36,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.textAmber, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        <motion.span animate={{ scale: [1,1.3,1] }} transition={{ repeat:Infinity, duration:1.2 }}><Sparkles size={16} style={{ fill:'#FDE68A', stroke:C.gold }} /></motion.span>
                        Make a Wish, Release the Magic!
                      </div>
                      <span style={{ color: C.textMuted, fontSize: 10, marginTop: 6, textAlign: 'center', maxWidth: 260 }}>Click here to manifest your wish &amp; ignite a stardust celebration!</span>
                    </motion.div>
                  )}
                  {wishClicked && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, color: C.textAmber, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(253,243,199,0.4)', border: '1px solid rgba(251,191,36,0.2)', padding: '10px 20px', borderRadius: 16 }}>
                      <Sparkles size={16} style={{ fill:'#FDE68A', stroke:C.gold, animation:'spin 2s linear infinite' }} />
                      Wish &amp; Stardust Unleashed!
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button disabled={!cakeRevealed || candlesOut < 3}
                  whileHover={cakeRevealed && candlesOut >= 3 ? { scale: 1.05 } : {}}
                  whileTap={cakeRevealed && candlesOut >= 3 ? { scale: 0.95 } : {}}
                  onClick={() => goNext('FINAL')} style={cakeRevealed && candlesOut >= 3 ? btnPrimary : btnDisabled}>
                  Unveil Deep Wish <ArrowRight size={16} />
                </motion.button>
              </div>
            )}

            {/* ── FINAL ─────────────────────────────────────────────────── */}
            {currentStep === 'FINAL' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '16px 0' }}>
                <motion.div initial={{ scale:0.5, rotate:-45 }} animate={{ scale:[1,1.15,1], rotate:0 }} transition={{ duration:0.8 }}
                  style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(253,243,199,0.8), rgba(254,243,199,0.4))', border: '2px solid rgba(251,191,36,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: C.gold, boxShadow: '0 8px 20px rgba(251,191,36,0.2)' }}>
                  <PartyPopper size={36} style={{ stroke: C.gold, fill: 'rgba(253,243,199,0.5)' }} />
                </motion.div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.02em', marginBottom: 8 }}>A Masterpiece Year</h2>
                <p style={{ color: 'rgba(180,100,20,0.75)', fontSize: 10, fontFamily: 'Courier New, monospace', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20, fontWeight: 600 }}>Sincerest Wishes</p>
                <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.8, maxWidth: 340, marginBottom: 20, fontWeight: 300 }}>
                  Today, we raise a glass to your light, your strength, and your beautiful journey of success. Keep glowing and making the universe spectacular.
                </p>
                <motion.blockquote initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
                  style={{ fontStyle:'italic', color:'rgba(180,100,20,0.65)', fontSize:12, fontFamily:"'Playfair Display', serif", borderLeft:'2px solid rgba(251,191,36,0.5)', paddingLeft:16, textAlign:'left', maxWidth:320, marginBottom:32, lineHeight:1.7 }}>
                  "Another year of being amazing, of growing stronger, of shining brighter — the world is so lucky to have you."
                </motion.blockquote>
                <div style={{ display: 'flex', gap: 16 }}>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onReset}
                    style={{ ...btnPrimary, background:'#fff', color:C.gold, border:`1px solid rgba(251,191,36,0.5)`, boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }}>
                    <RotateCcw size={16} /> Loop Magic
                  </motion.button>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => goNext('COMPLETED')} style={btnPrimary}>
                    Finish Surprise <Check size={16} />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── COMPLETED ─────────────────────────────────────────────────── */}
        {currentStep === 'COMPLETED' && (
          <motion.div key="completed" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:0.8 }}
            style={{ ...card, maxWidth:500, pointerEvents:'auto' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background:'linear-gradient(90deg, #FDE68A, #F59E0B, #D97706, #F59E0B, #FDE68A)', borderRadius:'28px 28px 0 0' }} />
            <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ repeat:Infinity, duration:4 }}
              style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg, rgba(253,243,199,0.9), rgba(254,243,199,0.5))', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28, color:C.gold, boxShadow:'0 8px 20px rgba(251,191,36,0.2)' }}>
              <Sparkles size={32} style={{ fill:'#FCD34D', stroke:C.gold }} />
            </motion.div>
            <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:32, fontWeight:900, color:C.textPrimary, letterSpacing:'-0.02em', marginBottom:8 }}>Drenchack Tech</h1>
            <p style={{ color:'rgba(180,100,20,0.75)', fontSize:10, fontFamily:'Courier New, monospace', letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:28, fontWeight:600 }}>We Wish You A Happy Birthday</p>
            <p style={{ color:C.textMuted, fontSize:12, lineHeight:1.8, maxWidth:300, marginBottom:36, fontWeight:300 }}>
              This interactive celebration space is proudly curated. Have a spectacular birthday celebration!
            </p>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onReset} style={btnPrimary}>
              <RotateCcw size={16} /> Restart Surprises
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes wax-pulse {
          0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0.4)}
          50%{box-shadow:0 0 0 6px rgba(251,191,36,0)}
        }
      `}</style>
    </div>
  );
}
