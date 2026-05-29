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

interface CardStorytellerProps {
  currentStep: ExperienceStep;
  onNext: (step: ExperienceStep) => void;
  onReset: () => void;
}

// ─── Floating heart component ────────────────────────────────────────────────
function FloatingHeart({ delay }: { delay: number }) {
  const left = 10 + Math.random() * 80;
  return (
    <motion.div
      className="absolute pointer-events-none text-rose-400 select-none"
      style={{ left: `${left}%`, bottom: '-10%', fontSize: `${14 + Math.random() * 18}px` }}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: '-120vh', scale: [0.5, 1.1, 1], rotate: Math.random() * 30 - 15 }}
      transition={{ duration: 3.5 + Math.random() * 2, delay, ease: 'easeOut' }}
    >
      ♥
    </motion.div>
  );
}

export default function CardStoryteller({ currentStep, onNext, onReset }: CardStorytellerProps) {
  const [isMutedState, setIsMutedState] = useState(false);
  const [songLabel, setSongLabel] = useState('');

  // Envelope
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [letterTyped, setLetterTyped] = useState(false);

  // Message step
  const [wishTyped, setWishTyped] = useState(false);
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const messageParagraphs = [
    "On this exceptionally beautiful day, we celebrate the incredible individual that you are.",
    "May your coming year be beautifully illuminated with endless creativity, your heart hold boundless peace, and your footsteps lead to magnificent triumphs.",
    "You bring a bright, golden inspiration to every community and everyone honored to share in your journey.",
    "We reflect that glorious light back on you today with absolute joy, sincere gratitude, and endless celebration.",
    "Here is to a brilliant new chapter of happiness, graceful wisdom, and every single one of your dreams coming spectacular to life.",
  ];

  // Typewriter for letter
  const [letterText, setLetterText] = useState('');
  const letterFullText =
    "Dear Celebrant,\n\nTake time to celebrate yourself today. Reflect on every lesson, appreciate every victory, and embrace the beautiful masterpiece you are becoming.\n\nDrenchack Tech is honoured to dedicate this digital surprise to your special day. May the year ahead bring you unprecedented heights, boundless inspiration, and deep serenity.\n\nYou are loved, cherished, and celebrated beyond words.\n\nHappy Birthday, with highest regards!\n— Drenchack Tech ✦";

  // Cake / candles
  const [candlesBlownCount, setCandlesBlownCount] = useState(0);
  const [candlesFlameStatus, setCandlesFlameStatus] = useState([true, true, true]);
  const [candleHovered, setCandleHovered] = useState<number | null>(null);
  const [cakeRevealed, setCakeRevealed] = useState(false);
  const [isWishClicked, setIsWishClicked] = useState(false);

  // Floating hearts on FINAL
  const [hearts, setHearts] = useState<number[]>([]);

  // ─── Sync audio state ──────────────────────────────────────────────────────
  useEffect(() => {
    setIsMutedState(musicEngine.getMuteState());
    setSongLabel(musicEngine.getCurrentSongLabel());
  }, []);

  const handleToggleVolume = () => {
    const muted = musicEngine.toggleMute();
    setIsMutedState(muted);
  };

  const handleNextSong = () => {
    const label = musicEngine.nextSong();
    setSongLabel(label);
    musicEngine.playSparkleTransition();
  };

  // ─── Message step animation ────────────────────────────────────────────────
  useEffect(() => {
    if (currentStep !== 'MESSAGE') return;
    setVisibleParagraphs(0);
    setWishTyped(false);
    const interval = setInterval(() => {
      setVisibleParagraphs((prev) => {
        const next = prev + 1;
        if (next >= messageParagraphs.length - 1) {
          setWishTyped(true);
          clearInterval(interval);
        }
        return next;
      });
    }, 2400);
    return () => clearInterval(interval);
  }, [currentStep]);

  // ─── Typewriter for letter ─────────────────────────────────────────────────
  useEffect(() => {
    if (currentStep !== 'LETTER' || !isEnvelopeOpen) return;
    setLetterText('');
    setLetterTyped(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < letterFullText.length) {
        setLetterText((prev) => prev + letterFullText.charAt(index));
        index++;
      } else {
        setLetterTyped(true);
        clearInterval(timer);
      }
    }, 22);
    return () => clearInterval(timer);
  }, [currentStep, isEnvelopeOpen]);

  // ─── Floating hearts on FINAL step ────────────────────────────────────────
  useEffect(() => {
    if (currentStep !== 'FINAL') return;
    musicEngine.playHeartBurst();
    setHearts(Array.from({ length: 18 }, (_, i) => i));
    const t = setTimeout(() => setHearts([]), 8000);
    return () => clearTimeout(t);
  }, [currentStep]);

  // ─── Reset on splash ──────────────────────────────────────────────────────
  useEffect(() => {
    if (currentStep !== 'SPLASH') return;
    setIsEnvelopeOpen(false);
    setLetterTyped(false);
    setWishTyped(false);
    setCandlesBlownCount(0);
    setCandlesFlameStatus([true, true, true]);
    setCakeRevealed(false);
    setIsWishClicked(false);
    setCandleHovered(null);
  }, [currentStep]);

  // ─── Candle interaction ───────────────────────────────────────────────────
  const handleBlowCandle = (index: number) => {
    if (!candlesFlameStatus[index]) return;
    musicEngine.playCandleBlowout();
    const newFlames = [...candlesFlameStatus];
    newFlames[index] = false;
    setCandlesFlameStatus(newFlames);
    setCandleHovered(null);
    const blown = candlesBlownCount + 1;
    setCandlesBlownCount(blown);
    if (blown === 3) {
      setTimeout(() => musicEngine.playPopSound(), 400);
      setTimeout(() => musicEngine.playPopSound(), 800);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('birthday-confetti-explode', {
          detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 120 },
        }));
      }, 1000);
    }
  };

  const triggerConfettiExplosion = (e: React.MouseEvent) => {
    if (isWishClicked) return;
    setIsWishClicked(true);
    musicEngine.playSparkleTransition();
    window.dispatchEvent(new CustomEvent('birthday-confetti-explode', {
      detail: { x: e.clientX || window.innerWidth / 2, y: e.clientY || window.innerHeight / 2 - 120 },
    }));
  };

  // ─── Progress ─────────────────────────────────────────────────────────────
  const getStepProgress = () => {
    const steps: ExperienceStep[] = ['INTRO','SURPRISE','PHOTO','MESSAGE','LETTER','CELEBRATION','FINAL'];
    const idx = steps.indexOf(currentStep);
    return { current: idx + 1, total: steps.length, percentage: ((idx + 1) / steps.length) * 100 };
  };
  const progress = getStepProgress();

  const goNext = (nextStep: ExperienceStep) => {
    musicEngine.playSparkleTransition();
    onNext(nextStep);
  };

  // ─── Candle flame size based on hover ────────────────────────────────────
  const flameScale = (idx: number) => (candleHovered === idx ? 1.7 : 1.0);

  // ─── Card width: wider on LETTER step for split layout ───────────────────
  const cardMaxWidth =
    currentStep === 'PHOTO' ? 'max-w-[510px]' :
    currentStep === 'LETTER' ? 'max-w-[680px]' :
    'max-w-[500px]';

  return (
    <div className="relative w-full flex flex-col items-center justify-center z-10 px-4 py-4 md:py-8 select-none pointer-events-none">

      {/* Floating hearts (FINAL step) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        <AnimatePresence>
          {hearts.map((i) => <FloatingHeart key={i} delay={i * 0.25} />)}
        </AnimatePresence>
      </div>

      {/* Audio controls top-right */}
      <div className="absolute top-6 right-6 z-50 pointer-events-auto flex flex-col gap-2 items-end">
        {/* Mute toggle */}
        <motion.button
          onClick={handleToggleVolume}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 border border-amber-200/50 shadow-md text-amber-500 hover:text-amber-600 transition-colors cursor-pointer outline-none"
          title={isMutedState ? 'Unmute' : 'Mute'}
        >
          {isMutedState ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </motion.button>

        {/* Song switcher */}
        <motion.button
          onClick={handleNextSong}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 border border-amber-200/50 shadow-md text-amber-500 hover:text-amber-600 transition-colors cursor-pointer outline-none"
          title={`Now playing: ${songLabel} — click to change`}
        >
          <Music2 className="w-5 h-5" />
        </motion.button>

        {/* Song name tooltip */}
        <AnimatePresence>
          {songLabel && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-white/90 border border-amber-100 rounded-lg px-3 py-1.5 shadow-sm max-w-[160px]"
            >
              <p className="text-[9px] font-mono text-amber-600/80 uppercase tracking-wider truncate">
                {songLabel}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {currentStep !== 'SPLASH' && progress.current > 0 && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -30, rotateX: -8 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className={`w-full ${cardMaxWidth} bg-white/90 backdrop-blur-md border border-amber-100/60 rounded-[24px] sm:rounded-[30px] shadow-[0_20px_50px_rgba(218,165,32,0.08)] p-4 sm:p-6 md:p-8 flex flex-col items-center text-center relative pointer-events-auto overflow-hidden`}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-100 via-amber-400 to-amber-100" />

            {/* Progress bar */}
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[10px] font-mono tracking-widest text-amber-600/80 uppercase">
                Step {progress.current} of {progress.total}
              </span>
              <div className="w-24 h-1 bg-amber-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* ── INTRO ── */}
            {currentStep === 'INTRO' && (
              <div className="flex flex-col items-center py-4 w-full">
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: [0, 5, -5, 0], scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100, repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 flex items-center justify-center text-amber-500 mb-6"
                >
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </motion.div>
                <h2 className="font-serif text-3xl font-bold text-gray-800 tracking-tight leading-snug mb-4">
                  Today is all about you.
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[320px] mb-8 font-light">
                  A beautiful chapter unfolds. Today, let the noise of the world wash away, and let yourself bask in pure warmth.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => goNext('SURPRISE')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 transition-all flex items-center gap-2 cursor-pointer outline-none"
                >
                  Unveil The Surprise <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* ── SURPRISE ── */}
            {currentStep === 'SURPRISE' && (
              <div className="flex flex-col items-center py-4 w-full">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-100/60 flex items-center justify-center text-amber-500 mb-6"
                >
                  <Heart className="w-8 h-8 fill-amber-400 stroke-amber-500" />
                </motion.div>
                <h2 className="font-serif text-3xl font-bold text-gray-800 tracking-tight mb-4">
                  A Special Celebration
                </h2>
                <blockquote className="italic text-gray-400 text-xs font-serif leading-relaxed px-6 max-w-[340px] mb-6 border-l-2 border-amber-300/60 text-left">
                  "Some days are clean, some days are memorable, but today is extraordinary because of who we celebrate."
                </blockquote>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[320px] mb-8 font-light">
                  Drenchack Tech wishes to create a magnificent, peaceful oasis just to say thank you for being incredible.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => goNext('PHOTO')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 transition-all flex items-center gap-2 cursor-pointer outline-none"
                >
                  See What Is Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* ── PHOTO ── */}
            {currentStep === 'PHOTO' && (
              <div className="flex flex-col items-center py-2 w-full">
                <h2 className="font-serif text-2xl font-bold text-gray-850 mb-1 tracking-tight">
                  Golden Gallery of Memories
                </h2>
                <p className="text-amber-600 text-[10px] font-mono tracking-wide uppercase mb-6 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 fill-amber-300 animate-pulse" />
                  Interactive Polaroid Archive
                  <Sparkles className="w-3 h-3 fill-amber-300 animate-pulse" />
                </p>
                <PhotoGallery onComplete={() => goNext('MESSAGE')} />
                <div className="w-full h-px bg-amber-100/40 my-6" />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => goNext('MESSAGE')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 transition-all flex items-center gap-2 cursor-pointer outline-none"
                >
                  Unfold Your Wish <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* ── MESSAGE ── */}
            {currentStep === 'MESSAGE' && (
              <div className="flex flex-col items-center py-4 w-full">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-6"
                >
                  <Gift className="w-6 h-6 animate-bounce" />
                </motion.div>
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-4 tracking-tight">
                  Heartfelt Wishes
                </h2>
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full relative min-h-[220px] bg-gradient-to-b from-amber-50/20 via-white to-white border border-amber-200/30 rounded-2xl p-6 mb-8 text-left overflow-hidden shadow-[0_8px_32px_rgba(218,165,32,0.03)]"
                >
                  {/* Floating bubbles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[1,2,3,4,5,6].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 220, x: 20 + i * 50 }}
                        animate={{ opacity: [0, 0.45, 0], y: [-10, -230], x: [20 + i * 50, (20 + i * 50) + Math.sin(i) * 30] }}
                        transition={{ duration: 5.5 + i * 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-4 relative z-10">
                    {messageParagraphs.map((para, idx) =>
                      idx <= visibleParagraphs && (
                        <motion.p
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className="text-gray-600 text-xs sm:text-sm leading-relaxed font-light border-l-2 border-amber-300/30 pl-3 py-0.5"
                        >
                          {para}
                          {idx === visibleParagraphs && !wishTyped && (
                            <span className="inline-block w-2.5 h-3.5 ml-1.5 bg-amber-400 animate-pulse rounded-sm align-middle" />
                          )}
                          {idx === messageParagraphs.length - 1 && wishTyped && (
                            <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="inline-block ml-2 text-amber-500">
                              <Sparkles className="w-4 h-4 inline fill-amber-300 stroke-amber-500" />
                            </motion.span>
                          )}
                        </motion.p>
                      )
                    )}
                  </div>
                </motion.div>
                <motion.button
                  disabled={!wishTyped}
                  whileHover={wishTyped ? { scale: 1.05 } : {}}
                  whileTap={wishTyped ? { scale: 0.95 } : {}}
                  onClick={() => goNext('LETTER')}
                  className={`px-6 py-3 rounded-full text-white font-medium text-xs tracking-wider transition-all flex items-center gap-2 outline-none ${
                    wishTyped
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 cursor-pointer'
                      : 'bg-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  Open Sealed Letter <Mail className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* ── LETTER — Split layout ─────────────────────────────────────
             *  Left panel: celebrant photo (first gallery image)
             *  Right panel: appreciation letter with typewriter
             * ──────────────────────────────────────────────────────────────*/}
            {currentStep === 'LETTER' && (
              <div className="flex flex-col items-center py-2 w-full">
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-6 tracking-tight">
                  Sealed Devoted Note
                </h2>

                <div className="w-full flex flex-col md:flex-row gap-4 mb-8">
                  {/* ── Left: photo panel ── */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="md:w-[45%] w-full flex-shrink-0"
                  >
                    <div
                      className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative"
                      style={{
                        boxShadow: '0 16px 40px rgba(218,165,32,0.15), 0 4px 12px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(251,191,36,0.2)',
                      }}
                    >
                      {/* Your first photo as the "celebrant portrait" */}
                      <img
                        src="/IMG_20260529_135235_489.jpg"
                        alt="Celebrant"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback elegant gradient if image not available
                          const el = e.target as HTMLImageElement;
                          el.style.display = 'none';
                        }}
                      />
                      {/* Golden overlay vignette */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(to bottom, transparent 50%, rgba(218,165,32,0.25) 100%)',
                        }}
                      />
                      {/* Name tag at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                        <p className="text-white/90 font-serif text-sm font-semibold tracking-wide drop-shadow-md">
                          ✦ The Celebrant ✦
                        </p>
                        <p className="text-amber-200/80 text-[10px] font-mono tracking-widest uppercase mt-0.5">
                          Drenchack Tech Wishes You
                        </p>
                      </div>
                    </div>

                    {/* Small decorative hearts row */}
                    <div className="flex justify-center gap-2 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.4, delay: i * 0.18, repeat: Infinity }}
                          className="text-rose-400 text-xs"
                        >
                          ♥
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  {/* ── Right: envelope + letter ── */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="relative h-[320px] md:h-full min-h-[320px]">
                      <AnimatePresence>
                        {!isEnvelopeOpen ? (
                          <motion.div
                            key="sealed"
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            onClick={() => {
                              setIsEnvelopeOpen(true);
                              musicEngine.playEnvelopeWhoosh();
                            }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="absolute inset-0 bg-gradient-to-br from-amber-50 to-[#FFFDF0] rounded-2xl border-2 border-amber-200/50 flex flex-col items-center justify-center p-6 cursor-pointer"
                            style={{ boxShadow: '0 8px 24px rgba(218,165,32,0.08)' }}
                          >
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              className="w-14 h-14 rounded-full bg-amber-100/50 flex items-center justify-center text-amber-500 mb-4"
                            >
                              <MailOpen className="w-7 h-7" />
                            </motion.div>
                            <span className="text-gray-700 text-sm font-medium">Click to Unseal Envelope</span>
                            <span className="text-amber-600 font-mono text-[9px] mt-1.5 uppercase tracking-widest animate-pulse">
                              Personal & Warm
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="open"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col"
                          >
                            {/* Letter paper */}
                            <div
                              className="flex-1 bg-white border border-amber-100 rounded-2xl p-5 overflow-y-auto relative"
                              style={{ boxShadow: '0 4px 20px rgba(218,165,32,0.06)' }}
                            >
                              {/* Paper lines texture */}
                              <div
                                className="absolute inset-0 pointer-events-none opacity-[0.03] rounded-2xl"
                                style={{
                                  background: 'repeating-linear-gradient(transparent, transparent 23px, rgba(218,165,32,0.8) 24px)',
                                }}
                              />
                              {/* Wax seal decoration */}
                              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-300/60 flex items-center justify-center text-amber-600 text-[10px] font-bold">
                                ✦
                              </div>
                              <p className="font-handwritten text-base text-amber-900 leading-relaxed whitespace-pre-line relative z-10">
                                {letterText}
                                {!letterTyped && (
                                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-amber-500 animate-[bounce_0.8s_infinite]" />
                                )}
                              </p>
                            </div>

                            {/* Envelope bottom flap */}
                            <div
                              className="mt-2 h-10 bg-amber-50/70 border border-amber-200/40 rounded-b-2xl rounded-t flex items-center justify-center"
                            >
                              <div className="text-[9px] font-mono tracking-widest text-amber-600/60 uppercase">
                                Drenchack Tech ✦ With Love
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                <motion.button
                  disabled={!letterTyped}
                  whileHover={letterTyped ? { scale: 1.05 } : {}}
                  whileTap={letterTyped ? { scale: 0.95 } : {}}
                  onClick={() => goNext('CELEBRATION')}
                  className={`px-6 py-3 rounded-full text-white font-medium text-xs tracking-wider transition-all flex items-center gap-2 outline-none relative z-40 ${
                    letterTyped
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 cursor-pointer pointer-events-auto'
                      : 'bg-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  Light The Candles <PartyPopper className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* ── CELEBRATION ─────────────────────────────────────────────────
             *  Improved candle: hover to grow flame → click/touch to blow out
             * ────────────────────────────────────────────────────────────── */}
            {currentStep === 'CELEBRATION' && (
              <div className="flex flex-col items-center py-2 w-full">
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                  {!cakeRevealed ? 'Scratch to Unveil' : 'Make A Wish'}
                </h2>

                {!cakeRevealed ? (
                  <p className="text-amber-600 text-[10px] font-mono tracking-wide uppercase mb-6 animate-pulse">
                    Foil Scratch: Swipe to reveal your cake!
                  </p>
                ) : candlesBlownCount < 3 ? (
                  <p className="text-amber-600 text-[10px] font-mono tracking-wide uppercase mb-6 animate-pulse">
                    Hover &amp; tap each flame to blow it out!
                  </p>
                ) : (
                  <p className="text-emerald-600 text-[10px] font-mono tracking-wide uppercase mb-6 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> All wishes sent to the universe!
                  </p>
                )}

                <div className="w-[220px] h-[200px] relative mb-8 flex items-center justify-center overflow-visible">
                  <AnimatePresence mode="wait">
                    {!cakeRevealed ? (
                      <motion.div
                        key="scratch"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 z-30 flex items-center justify-center"
                      >
                        <ScratchCard onComplete={() => setCakeRevealed(true)} width={220} height={200} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cake"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-[200px] h-[190px] relative overflow-visible"
                      >
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                          {/* ── Candles ── */}
                          {[0, 1, 2].map((idx) => {
                            const posX = 37 + idx * 13;
                            const hasFlame = candlesFlameStatus[idx];
                            const hovered = candleHovered === idx;
                            return (
                              <g key={idx}>
                                {/* Candle body */}
                                <rect x={posX - 1.5} y="14" width="3" height="16"
                                  className="fill-amber-300 stroke-amber-400/50 stroke-[0.5]" />
                                <line x1={posX - 1.5} y1="18" x2={posX + 1.5} y2="21" className="stroke-white stroke-[0.7]" />
                                <line x1={posX - 1.5} y1="24" x2={posX + 1.5} y2="27" className="stroke-white stroke-[0.7]" />
                                {/* Wick */}
                                <line x1={posX} y1="14" x2={posX} y2="10" className="stroke-gray-700 stroke-[0.8]" />

                                {hasFlame ? (
                                  <motion.g
                                    style={{ originX: posX, originY: 10, cursor: 'pointer' }}
                                    animate={{ scale: hovered ? 1.7 : 1 }}
                                    transition={{ duration: 0.25 }}
                                    onClick={() => handleBlowCandle(idx)}
                                    onMouseEnter={() => setCandleHovered(idx)}
                                    onMouseLeave={() => setCandleHovered(null)}
                                    onTouchStart={() => {
                                      setCandleHovered(idx);
                                      // Slight delay so the glow shows before blowing
                                      setTimeout(() => handleBlowCandle(idx), 120);
                                    }}
                                    className="pointer-events-auto"
                                  >
                                    {/* Outer glow when hovered */}
                                    {hovered && (
                                      <motion.ellipse
                                        cx={posX} cy={4}
                                        rx={7} ry={10}
                                        fill="rgba(255,160,0,0.18)"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                      />
                                    )}
                                    <motion.path
                                      d={`M ${posX} -2 Q ${posX - 3.5} 4 ${posX} 10 Q ${posX + 3.5} 4 ${posX} -2 Z`}
                                      fill={hovered ? '#FF6B00' : '#FF9F1C'}
                                      stroke="#FFD700" strokeWidth="0.5"
                                      className="filter drop-shadow-[0_0_4px_rgba(255,160,0,0.8)]"
                                      animate={{ scaleY: [1, 1.2, 0.95, 1.1, 1], scaleX: [1, 0.9, 1.1, 0.95, 1] }}
                                      transition={{ repeat: Infinity, duration: 1.2 + idx * 0.2, ease: 'easeInOut' }}
                                    />
                                    {/* "Blow" hint on hover */}
                                    {hovered && (
                                      <motion.text
                                        x={posX} y={-8}
                                        textAnchor="middle"
                                        fontSize="4"
                                        fill="#854F0B"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                      >
                                        Tap!
                                      </motion.text>
                                    )}
                                  </motion.g>
                                ) : (
                                  <motion.path
                                    d={`M ${posX} 8 Q ${posX - 3} 3 ${posX - 1} -2 Q ${posX + 1} -7 ${posX - 2} -12`}
                                    fill="none" stroke="rgba(150,150,150,0.45)"
                                    strokeWidth="1" strokeLinecap="round"
                                    initial={{ pathLength: 0, opacity: 1 }}
                                    animate={{ pathLength: 1, opacity: 0, y: -6 }}
                                    transition={{ duration: 1.5 }}
                                  />
                                )}
                              </g>
                            );
                          })}

                          {/* Cake tiers */}
                          <rect x="30" y="30" width="40" height="15" rx="3" className="fill-amber-50/50 stroke-amber-100 stroke-[0.5]" />
                          <path d="M 30 35 Q 35 39 40 35 Q 45 40 50 35 Q 55 39 60 35 Q 65 39 70 35 L 70 30 L 30 30 Z" className="fill-[#FFFAC2]" />
                          <rect x="22" y="45" width="56" height="18" rx="4" className="fill-white stroke-amber-100/60 stroke-[0.5]" />
                          <rect x="22" y="52" width="56" height="4" className="fill-amber-100" />
                          <rect x="12" y="63" width="76" height="23" rx="5" className="fill-amber-50/70 stroke-amber-100/80 stroke-[0.5]" />
                          {[16,28,40,52,64,76,84].map((cx) => (
                            <circle key={cx} cx={cx} cy="80" r="3" className="fill-white" />
                          ))}
                          <path d="M 6 86 Q 50 90 94 86" stroke="#E6B800" strokeWidth="2.5" strokeLinecap="round" />
                          <ellipse cx="50" cy="88" rx="38" ry="4" className="fill-amber-100/30" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Make a wish prompt */}
                <AnimatePresence>
                  {candlesBlownCount === 3 && !isWishClicked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)', y: -10 }}
                      transition={{ duration: 1.5 }}
                      onClick={triggerConfettiExplosion}
                      className="mb-8 cursor-pointer group flex flex-col items-center bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/30 hover:border-amber-400/60 px-6 py-3.5 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-2 text-amber-600 font-sans text-xs font-semibold tracking-wider uppercase">
                        <Sparkles className="w-4 h-4 fill-amber-200 animate-bounce" />
                        Make a Wish, Release the Magic!
                      </div>
                      <span className="text-gray-500 text-[10px] mt-1.5 text-center max-w-[280px]">
                        Click here to manifest your wish and ignite a stardust celebration!
                      </span>
                    </motion.div>
                  )}
                  {isWishClicked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="mb-8 flex items-center gap-2 text-amber-600 font-sans text-xs font-semibold tracking-wider uppercase bg-amber-500/5 border border-amber-200/20 px-6 py-3.5 rounded-2xl"
                    >
                      <Sparkles className="w-4 h-4 fill-amber-300 animate-spin" />
                      Wish and Stardust unleashed!
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  disabled={!cakeRevealed || candlesBlownCount < 3}
                  whileHover={cakeRevealed && candlesBlownCount >= 3 ? { scale: 1.05 } : {}}
                  whileTap={cakeRevealed && candlesBlownCount >= 3 ? { scale: 0.95 } : {}}
                  onClick={() => goNext('FINAL')}
                  className={`px-6 py-3 rounded-full text-white font-medium text-xs tracking-wider transition-all flex items-center gap-2 outline-none ${
                    cakeRevealed && candlesBlownCount >= 3
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 cursor-pointer pointer-events-auto'
                      : 'bg-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  Unveil Deep Wish <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* ── FINAL ── */}
            {currentStep === 'FINAL' && (
              <div className="flex flex-col items-center py-4 w-full">
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: [1, 1.15, 1], rotate: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-18 h-18 rounded-full bg-amber-50/50 border-2 border-amber-400 flex items-center justify-center text-amber-500 mb-6 shadow-md"
                >
                  <PartyPopper className="w-9 h-9 stroke-amber-500 fill-amber-300/30" />
                </motion.div>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-gray-900 leading-tight mb-3">
                  A Masterpiece Year
                </h2>
                <p className="text-amber-600 text-[10px] font-mono tracking-widest uppercase mb-6 font-semibold">
                  Sincerest Wishes
                </p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[340px] mb-8 font-light">
                  Today, we raise a glass to your light, your strength, and your beautiful journey of success. Keep glowing and making the universe spectacular.
                </p>

                {/* Animated quote */}
                <motion.blockquote
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="italic text-amber-700/70 text-xs font-serif border-l-2 border-amber-300/60 pl-4 mb-8 text-left max-w-[320px]"
                >
                  "Another year of being amazing, of growing stronger, of shining brighter — the world is so lucky to have you."
                </motion.blockquote>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={onReset}
                    className="px-5 py-2.5 rounded-full bg-white border border-amber-300 text-amber-600 font-medium text-xs tracking-wider shadow-sm hover:bg-amber-50 transition-colors flex items-center gap-1.5 cursor-pointer outline-none"
                  >
                    <RotateCcw className="w-4 h-4" /> Loop Magic
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => goNext('COMPLETED')}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 flex items-center gap-1.5 cursor-pointer outline-none"
                  >
                    Finish Surprise <Check className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── COMPLETED ── */}
        {currentStep === 'COMPLETED' && (
          <motion.div
            key="exit-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[500px] bg-white/95 backdrop-blur-md border border-amber-100 rounded-[28px] sm:rounded-[35px] shadow-[0_30px_70px_rgba(218,165,32,0.12)] p-6 sm:p-10 md:p-14 flex flex-col items-center text-center relative pointer-events-auto"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center text-amber-500 mb-8"
            >
              <Sparkles className="w-8 h-8 fill-amber-300 stroke-amber-500" />
            </motion.div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Drenchack Tech
            </h1>
            <p className="text-amber-600 font-mono text-[10px] uppercase tracking-[0.25em] mb-8 font-medium">
              We Wish You A Happy Birthday
            </p>
            <p className="text-gray-400 text-xs leading-relaxed max-w-[300px] mb-10 font-light">
              This interactive celebration space is proudly curated. Have a spectacular birthday celebration!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.2)] hover:from-amber-500 hover:to-amber-600 transition-all cursor-pointer outline-none flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Restart Surprises
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
