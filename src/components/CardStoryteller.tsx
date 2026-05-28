/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Gift,
  MailOpen,
  ArrowRight,
  RotateCcw,
  Check,
  PartyPopper,
  Volume2,
  VolumeX,
  Mail
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

export default function CardStoryteller({ currentStep, onNext, onReset }: CardStorytellerProps) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Envelope State
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [letterTyped, setLetterTyped] = useState(false);

  // For the floating wishes cinematic feel
  const [wishTyped, setWishTyped] = useState(false);
  const [visibleParagraphs, setVisibleParagraphs] = useState<number>(0);
  const messageParagraphs = [
    "On this exceptionally beautiful day, we celebrate the incredible individual that you are.",
    "May your coming year be beautifully illuminated with endless creativity, your heart hold boundless peace, and your footsteps lead to magnificent triumphs.",
    "You bring a bright, golden inspiration to active communities and everyone honored to share in your journey.",
    "We reflect that glorious light back on you today with absolute joy, sincere gratitude, and endless celebration.",
    "Here is to a brilliant new chapter of happiness, graceful wisdom, and every single one of your dreams coming spectacular to life."
  ];

  // Typewriter Text Effect for handwriting letter
  const [letterText, setLetterText] = useState('');
  const letterFullText = "Dear Celebrant,\n\nTake time to celebrate yourself today. Reflect on every lesson, appreciate every victory, and embrace the beautiful masterpiece you are becoming. Drenchack Tech is honored to dedicate this digital surprise to your special day. May the year ahead bring you unprecedented heights, boundless inspiration, and deep serenity.\n\nHappy Birthday, with highest regards!";

  // Birthday Cake State
  const [candlesBlownCount, setCandlesBlownCount] = useState<number>(0);
  const [candlesFlameStatus, setCandlesFlameStatus] = useState<boolean[]>([true, true, true]);
  const [cakeRevealed, setCakeRevealed] = useState(false);
  const [isWishClicked, setIsWishClicked] = useState(false);

  // Sync mute state with synth engine
  const handleToggleVolume = () => {
    const muted = musicEngine.toggleMute();
    setIsMutedState(muted);
  };

  const [isMutedState, setIsMutedState] = useState(false);

  useEffect(() => {
    setIsMutedState(musicEngine.getMuteState());
  }, []);

  // Trigger cinematic floating paragraphs for step 4 (MESSAGE)
  useEffect(() => {
    if (currentStep === 'MESSAGE') {
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
      }, 2400); // Shift every 2.4 seconds to craft magnificent cinematic floating pacing
      
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Trigger typewriter for letter inside step 5 (LETTER)
  useEffect(() => {
    if (currentStep === 'LETTER' && isEnvelopeOpen) {
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
      }, 25);
      return () => clearInterval(timer);
    }
  }, [currentStep, isEnvelopeOpen]);

  // Reset internal game states on step changes
  useEffect(() => {
    if (currentStep === 'SPLASH') {
      setIsEnvelopeOpen(false);
      setLetterTyped(false);
      setWishTyped(false);
      setCandlesBlownCount(0);
      setCandlesFlameStatus([true, true, true]);
      setCakeRevealed(false);
      setIsWishClicked(false);
    }
  }, [currentStep]);

  // Handle individual candle blowout click
  const handleBlowCandle = (index: number) => {
    if (!candlesFlameStatus[index]) return;
    
    // Play blowout audio puff and mini chimes
    musicEngine.playCandleBlowout();

    const newFlames = [...candlesFlameStatus];
    newFlames[index] = false;
    setCandlesFlameStatus(newFlames);

    const blownCount = candlesBlownCount + 1;
    setCandlesBlownCount(blownCount);

    // If all blown out, auto congrats confetti rain trigger
    if (blownCount === 3) {
      // Trigger multiple celebratory pop effects in brief successions!
      setTimeout(() => musicEngine.playPopSound(), 400);
      setTimeout(() => musicEngine.playPopSound(), 800);
      // Give an initial gentle central splash of fireworks stardust!
      setTimeout(() => {
        const initEvent = new CustomEvent('birthday-confetti-explode', {
          detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 120 }
        });
        window.dispatchEvent(initEvent);
      }, 1000);
    }
  };

  // Trigger screen-wide confetti burst from clicked position
  const triggerConfettiExplosion = (e: React.MouseEvent) => {
    if (isWishClicked) return;
    setIsWishClicked(true);
    musicEngine.playSparkleTransition();
    
    // Dispatch custom burst event
    const event = new CustomEvent('birthday-confetti-explode', {
      detail: {
        x: e.clientX || window.innerWidth / 2,
        y: e.clientY || window.innerHeight / 2 - 120,
      }
    });
    window.dispatchEvent(event);
  };

  // Convert current step into steps number for elegant UI progress indicators
  const getStepProgress = () => {
    const steps: ExperienceStep[] = ['INTRO', 'SURPRISE', 'PHOTO', 'MESSAGE', 'LETTER', 'CELEBRATION', 'FINAL'];
    const idx = steps.indexOf(currentStep);
    return {
      current: idx + 1,
      total: steps.length,
      percentage: ((idx + 1) / steps.length) * 100
    };
  };

  const progress = getStepProgress();

  // Helper to transition sound + slide
  const goNext = (nextStep: ExperienceStep) => {
    musicEngine.playSparkleTransition();
    onNext(nextStep);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center z-10 px-4 py-4 md:py-8 select-none pointer-events-none">
      
      {/* Dynamic Sound Knob (Always accessible in golden corner) */}
      <div className="absolute top-6 right-6 z-50 pointer-events-auto">
        <motion.button
          id="audio-toggle-button"
          onClick={handleToggleVolume}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 border border-amber-200/50 shadow-md text-amber-500 hover:text-amber-600 transition-colors cursor-pointer outline-none"
          title={isMutedState ? "Unmute Ambiance" : "Mute Ambiance"}
        >
          {isMutedState ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {currentStep !== 'SPLASH' && progress.current > 0 && (
          <motion.div
            id="experience-card-container"
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full ${currentStep === 'PHOTO' ? 'max-w-[510px]' : 'max-w-[500px]'} bg-white/90 backdrop-blur-md border border-amber-100/60 rounded-[24px] sm:rounded-[30px] shadow-[0_20px_50px_rgba(218,165,32,0.08)] p-4 sm:p-6 md:p-8 flex flex-col items-center text-center relative pointer-events-auto overflow-hidden`}
          >
            {/* Top Header Grid Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-100 via-amber-400 to-amber-100" />

            {/* Step Count Progress Bar */}
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

            {/* CONTENT ROUTER */}

            {/* --- 1. INTRO STEP --- */}
            {currentStep === 'INTRO' && (
              <div id="step-intro" className="flex flex-col items-center py-4 w-full">
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 flex items-center justify-center text-amber-500 mb-6"
                >
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </motion.div>
                <h2 className="font-serif text-3xl font-bold text-gray-800 tracking-tight leading-snug mb-4">
                  Today is all about you.
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[320px] mb-8 font-sans font-light">
                  A beautiful chapter unfolds. Today, let the noise of the world wash away, and let yourself bask in pure warmth.
                </p>
                <motion.button
                  id="intro-next-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goNext('SURPRISE')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:shadow-[0_12px_24px_rgba(251,191,36,0.35)] hover:from-amber-500 hover:to-amber-600 transition-all duration-300 flex items-center gap-2 cursor-pointer outline-none capitalize"
                >
                  Unveil The Surprise <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* --- 2. SURPRISE STEP --- */}
            {currentStep === 'SURPRISE' && (
              <div id="step-surprise" className="flex flex-col items-center py-4 w-full">
                <motion.div
                  animate={{ 
                    scale: [1, 1.08, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.2,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-100/60 flex items-center justify-center text-amber-500 mb-6"
                >
                  <Heart className="w-8 h-8 fill-amber-400 stroke-amber-500" />
                </motion.div>
                <h2 className="font-serif text-3xl font-bold text-gray-800 tracking-tight mb-4">
                  A Special Celebration
                </h2>
                <blockquote className="italic text-gray-400 text-xs font-serif leading-relaxed px-6 max-w-[340px] mb-6 border-l-2 border-amber-300/60 text-center">
                  "Some days are clean, some days are memorable, but today is extraordinary because of who we celebrate."
                </blockquote>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[320px] mb-8 font-light">
                  Drenchack Tech wishes to create a magnificent, peaceful oasis just to say thank you for being incredible.
                </p>
                <motion.button
                  id="surprise-next-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goNext('PHOTO')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 transition-all duration-300 flex items-center gap-2 cursor-pointer outline-none"
                >
                  See What Is Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* --- 3. PHOTO REVEAL STEP (Interactive Polaroid Gallery Slider with Upload Support) --- */}
            {currentStep === 'PHOTO' && (
              <div id="step-photo" className="flex flex-col items-center py-2 w-full">
                <h2 className="font-serif text-2xl font-bold text-gray-850 mb-1 tracking-tight">
                  Golden Gallery of Memories
                </h2>
                <p className="text-amber-600 text-[10px] font-mono tracking-wide uppercase mb-6 flex items-center justify-center gap-1.5 select-none">
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-300 animate-pulse" /> Interactive Polaroid Archive & Messages <Sparkles className="w-3 h-3 text-amber-500 fill-amber-300 animate-pulse" />
                </p>
                
                {/* Full Featured Polaroid Slideshow Deck */}
                <PhotoGallery onComplete={() => goNext('MESSAGE')} />

                <div className="w-full h-px bg-amber-100/40 my-6" />

                <motion.button
                  id="photo-next-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goNext('MESSAGE')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 transition-all duration-300 flex items-center gap-2 cursor-pointer outline-none"
                >
                  Unfold Your Wish <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* --- 4. HEARTFELT MESSAGE (Typewriter Effect) --- */}
            {currentStep === 'MESSAGE' && (
              <div id="step-message" className="flex flex-col items-center py-4 w-full">
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
                
                {/* Cinematic Floating Wishes Container with luxury border style & flowing gold stars background */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full relative min-h-[220px] bg-gradient-to-b from-amber-50/20 via-white to-white border border-amber-200/30 rounded-2xl p-6 mb-8 text-left overflow-hidden shadow-[0_8px_32px_rgba(218,165,32,0.03)]"
                >
                  {/* Floating starlight background bubbles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 220, x: 20 + i * 50 }}
                        animate={{ 
                          opacity: [0, 0.45, 0],
                          y: [-10, -230],
                          x: [20 + i * 50, (20 + i * 50) + Math.sin(i) * 30]
                        }}
                        transition={{
                          duration: 5.5 + i * 0.9,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5
                        }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      />
                    ))}
                  </div>

                  {/* Subtle luxurious glowing particle dots appearing upon completion */}
                  {wishTyped && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.2 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                      <div className="absolute bottom-3 left-6 w-1 h-1 rounded-full bg-amber-400/55 animate-[pulse_2s_infinite]" />
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-4 relative z-10">
                    {messageParagraphs.map((para, idx) => (
                      idx <= visibleParagraphs && (
                        <motion.p
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: 1, 
                            y: [20, 0, -2, 0],
                          }}
                          transition={{ 
                            y: {
                              times: [0, 0.4, 0.7, 1],
                              duration: 1.4,
                              ease: "easeOut"
                            },
                            opacity: { duration: 1.1, ease: "easeInOut" }
                          }}
                          className="text-gray-600 text-xs sm:text-sm leading-relaxed font-sans font-light font-[Poppins] border-l-2 border-amber-300/30 pl-3 py-0.5"
                        >
                          {para}
                          {idx === visibleParagraphs && !wishTyped && (
                            <span className="inline-block w-2.5 h-3.5 ml-1.5 bg-amber-400 animate-pulse rounded-sm align-middle" />
                          )}
                          {idx === messageParagraphs.length - 1 && wishTyped && (
                            <motion.span 
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-block ml-2 text-amber-500"
                            >
                              <Sparkles className="w-4 h-4 inline fill-amber-300 stroke-amber-500 animate-[bounce_1.5s_infinite]" style={{ verticalAlign: 'text-top' }} />
                            </motion.span>
                          )}
                        </motion.p>
                      )
                    ))}
                  </div>
                </motion.div>

                <motion.button
                  id="message-next-button"
                  disabled={!wishTyped}
                  whileHover={wishTyped ? { scale: 1.05 } : {}}
                  whileTap={wishTyped ? { scale: 0.95 } : {}}
                  onClick={() => goNext('LETTER')}
                  className={`px-6 py-3 rounded-full text-white font-medium text-xs tracking-wider transition-all duration-300 flex items-center gap-2 outline-none ${
                    wishTyped 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 cursor-pointer' 
                      : 'bg-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  Open Sealed Letter <Mail className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* --- 5. INTERACTIVE 3D FOLDER LETTER --- */}
            {currentStep === 'LETTER' && (
              <div id="step-letter" className="flex flex-col items-center py-2 w-full">
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-6 tracking-tight">
                  Sealed Devoted Note
                </h2>
                
                {/* 3D Looking Envelope Interactive Assembly */}
                <div className="w-full max-w-[340px] h-[220px] relative mb-10 overflow-visible select-none z-10">
                  <AnimatePresence>
                    {!isEnvelopeOpen ? (
                      // SEALED ENVELOPE BUTTON
                      <motion.div
                        key="sealed-envelope"
                        exit={{ opacity: 0, y: 15, rotateX: 60 }}
                        onClick={() => {
                          setIsEnvelopeOpen(true);
                          musicEngine.playEnvelopeWhoosh();
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="absolute inset-0 bg-gradient-to-br from-amber-50 to-[#FFFDF0] rounded-2xl border-2 border-amber-200/50 shadow-[0_12px_24px_rgba(218,165,32,0.06)] flex flex-col items-center justify-center p-6 cursor-pointer pointer-events-auto"
                      >
                        <div className="w-14 h-14 rounded-full bg-amber-100/50 flex items-center justify-center text-amber-500 mb-4 shadow-[0_4px_10px_rgba(218,165,32,0.04)]">
                          <MailOpen className="w-7 h-7" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium">Click to Unseal Envelope</span>
                        <span className="text-amber-600 font-mono text-[9px] mt-1.5 uppercase tracking-widest animate-pulse">
                          Personal & Warm
                        </span>
                      </motion.div>
                    ) : (
                      // UNSEALED ENVELOPE OPEN & PAPER SLIDES UP
                      <motion.div
                        key="unsealed-letter"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-end overflow-visible pointer-events-none w-full h-full"
                      >
                        {/* Lower envelope backing */}
                        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-amber-50/70 border-x border-b border-amber-200/40 rounded-b-2xl z-0 shadow-sm" />
                        
                        {/* Sliding Paper Component */}
                        <motion.div
                          initial={{ y: 90, opacity: 0 }}
                          animate={{ y: -10, opacity: 1 }}
                          transition={{ delay: 0.4, type: "spring", stiffness: 70 }}
                          className="w-[92%] h-[240px] bg-white border border-amber-100 rounded-xl shadow-[0_-5px_15px_rgba(0,0,0,0.03)] p-5 z-20 text-left overflow-y-auto relative pointer-events-auto"
                        >
                          {/* Faint gold lined watermark paper texture */}
                          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(218,165,32,0.8)_1px,transparent_1px)] bg-[size:100%_24px]" />
                          
                          {/* Letter script body */}
                          <p className="font-handwritten text-lg text-amber-900 leading-relaxed whitespace-pre-line relative z-10 select-text">
                            {letterText}
                            {!letterTyped && (
                              <span className="inline-block w-1.5 h-4 ml-0.5 bg-amber-500 animate-[bounce_0.8s_infinite]" />
                            )}
                          </p>
                        </motion.div>

                        {/* Front overlapping triangle flap cover overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-[92px] bg-gradient-to-t from-amber-50 to-[#FFFDF0] border border-amber-200/40 rounded-b-2xl z-30 flex items-center justify-center pointer-events-none">
                          <div className="text-[10px] font-mono tracking-widest text-amber-600/60 uppercase">
                            Drenchack Tech Card
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  id="letter-next-button"
                  disabled={!letterTyped}
                  whileHover={letterTyped ? { scale: 1.05 } : {}}
                  whileTap={letterTyped ? { scale: 0.95 } : {}}
                  onClick={() => goNext('CELEBRATION')}
                  className={`px-6 py-3 rounded-full text-white font-medium text-xs tracking-wider transition-all duration-300 flex items-center gap-2 outline-none relative z-40 ${
                    letterTyped 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 cursor-pointer pointer-events-auto' 
                      : 'bg-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  Light The Candles <PartyPopper className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* --- 6. CELEBRATION (Bake Cake & Blow candles interaction) --- */}
            {currentStep === 'CELEBRATION' && (
              <div id="step-celebration" className="flex flex-col items-center py-2 w-full">
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                  {!cakeRevealed ? "Scratch to Unveil" : "Make A Wish"}
                </h2>
                
                {!cakeRevealed ? (
                  <p className="text-amber-600 text-[10px] font-mono tracking-wide uppercase mb-6 animate-pulse">
                    Foil Scratch: Swipe to reveal your cake and candles!
                  </p>
                ) : candlesBlownCount < 3 ? (
                  <p className="text-amber-600 text-[10px] font-mono tracking-wide uppercase mb-6 animate-pulse">
                    Tap each burning candle flame to blow it out!
                  </p>
                ) : (
                  <p className="text-emerald-600 text-[10px] font-mono tracking-wide uppercase mb-6 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> All wishes sent to the universe!
                  </p>
                )}

                {/* Container for Cake or Scratch Card */}
                <div className="w-[220px] h-[200px] relative mb-8 flex items-center justify-center overflow-visible">
                  <AnimatePresence mode="wait">
                    {!cakeRevealed ? (
                      <motion.div
                        key="scratch-layer"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 z-30 flex items-center justify-center"
                      >
                        <ScratchCard onComplete={() => setCakeRevealed(true)} width={220} height={200} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cake-layer"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-[200px] h-[190px] relative overflow-visible"
                      >
                        {/* Floating sparkles behind cake */}
                        <div className="absolute inset-0 bg-radial-gradient from-amber-200/10 via-transparent to-transparent animate-pulse" />

                        {/* SVG Cake Engine */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                          
                          {/* CANDLES GROUP */}
                          {[0, 1, 2].map((idx) => {
                            const posX = 37 + idx * 13;
                            const hasFlame = candlesFlameStatus[idx];
                            return (
                              <g key={idx} className="origin-bottom">
                                {/* Candle Stick */}
                                <rect
                                  x={posX - 1.5}
                                  y="14"
                                  width="3"
                                  height="16"
                                  className="fill-amber-300 stroke-amber-400/50 stroke-[0.5]"
                                />
                                {/* Elegant spiral bands */}
                                <line x1={posX - 1.5} y1="18" x2={posX + 1.5} y2="21" className="stroke-white stroke-[0.7]" />
                                <line x1={posX - 1.5} y1="24" x2={posX + 1.5} y2="27" className="stroke-white stroke-[0.7]" />

                                {/* Wick */}
                                <line x1={posX} y1="14" x2={posX} y2="10" className="stroke-gray-700 stroke-[0.8]" />

                                {/* Burning Flame Activator */}
                                {hasFlame ? (
                                  <motion.path
                                    id={`candle-flame-${idx}`}
                                    d={`M ${posX} -2 Q ${posX - 3.5} 4 ${posX} 10 Q ${posX + 3.5} 4 ${posX} -2 Z`}
                                    fill="#FF9F1C"
                                    stroke="#FFD700"
                                    strokeWidth="0.5"
                                    onClick={() => handleBlowCandle(idx)}
                                    className="cursor-pointer origin-bottom pointer-events-auto filter drop-shadow-[0_0_4px_rgba(255,160,0,0.8)]"
                                    animate={{
                                      scaleY: [1, 1.2, 0.95, 1.1, 1],
                                      scaleX: [1, 0.9, 1.1, 0.95, 1],
                                      y: [0, -1, 0, 0.5, 0]
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 1.2 + idx * 0.2, // varied flicker cycles
                                      ease: "easeInOut"
                                    }}
                                    whileHover={{ scale: 1.5 }}
                                  />
                                ) : (
                                  // Candle grey smoke drifting
                                  <motion.path
                                    d={`M ${posX} 8 Q ${posX - 3} 3 ${posX - 1} -2 Q ${posX + 1} -7 ${posX - 2} -12`}
                                    fill="none"
                                    stroke="rgba(150, 150, 150, 0.45)"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0, opacity: 1 }}
                                    animate={{ pathLength: 1, opacity: 0, y: -6 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                  />
                                )}
                              </g>
                            );
                          })}

                          {/* CAKE 3RD TIER (TOP) */}
                          <rect x="30" y="30" width="40" height="15" rx="3" className="fill-amber-50/50 stroke-amber-100 stroke-[0.5]" />
                          {/* Frosting drips */}
                          <path d="M 30 35 Q 35 39 40 35 Q 45 40 50 35 Q 55 39 60 35 Q 65 39 70 35 L 70 30 L 30 30 Z" className="fill-[#FFFAC2]" />

                          {/* CAKE 2ND TIER (MIDDLE) */}
                          <rect x="22" y="45" width="56" height="18" rx="4" className="fill-white stroke-amber-100/60 stroke-[0.5]" />
                          <rect x="22" y="52" width="56" height="4" className="fill-amber-100" /> {/* Chocolate inner layer line */}

                          {/* CAKE 1ST TIER (BOTTOM) */}
                          <rect x="12" y="63" width="76" height="23" rx="5" className="fill-amber-50/70 stroke-amber-100/80 stroke-[0.5]" />
                          {/* Cream decorations bottom */}
                          <circle cx="16" cy="80" r="3" className="fill-white" />
                          <circle cx="28" cy="80" r="3" className="fill-white" />
                          <circle cx="40" cy="80" r="3" className="fill-white" />
                          <circle cx="52" cy="80" r="3" className="fill-white" />
                          <circle cx="64" cy="80" r="3" className="fill-white" />
                          <circle cx="76" cy="80" r="3" className="fill-white" />
                          <circle cx="84" cy="80" r="3" className="fill-white" />

                          {/* Stand base / Golden Plate */}
                          <path d="M 6 86 Q 50 90 94 86" stroke="#E6B800" strokeWidth="2.5" strokeLinecap="round" />
                          <ellipse cx="50" cy="88" rx="38" ry="4" className="fill-amber-100/30 border border-amber-300" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Interactive Slowly Fading-In "Make a Wish" Prompt after blowout */}
                <AnimatePresence>
                  {candlesBlownCount === 3 && !isWishClicked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)', y: -10 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      onClick={triggerConfettiExplosion}
                      className="mb-8 cursor-pointer group flex flex-col items-center bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/30 hover:border-amber-400/60 px-6 py-3.5 rounded-2xl transition-all duration-300 select-none shadow-[0_4px_15px_rgba(251,191,36,0.03)] hover:shadow-[0_8px_25px_rgba(251,191,36,0.08)] active:scale-[0.97]"
                    >
                      <div className="flex items-center gap-2 text-amber-600 font-sans text-xs font-semibold tracking-wider uppercase">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-200 animate-[bounce_1.5s_infinite]" />
                        Make a Wish, Release the Magic!
                      </div>
                      <span className="text-gray-500 text-[10px] font-sans mt-1.5 group-hover:text-amber-700 transition-colors text-center max-w-[280px] flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500/80 shrink-0 inline" /> Click here to manifest your wish and ignite a stardust starlight celebration!
                      </span>
                    </motion.div>
                  )}
                  
                  {isWishClicked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="mb-8 flex items-center justify-center gap-2 text-amber-600 font-sans text-xs font-semibold tracking-wider uppercase bg-amber-500/5 border border-amber-200/20 px-6 py-3.5 rounded-2xl"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300 animate-spin" />
                      Wish and Stardust unleashed!
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  id="celebration-next-button"
                  disabled={!cakeRevealed || candlesBlownCount < 3}
                  whileHover={cakeRevealed && candlesBlownCount >= 3 ? { scale: 1.05 } : {}}
                  whileTap={cakeRevealed && candlesBlownCount >= 3 ? { scale: 0.95 } : {}}
                  onClick={() => goNext('FINAL')}
                  className={`px-6 py-3 rounded-full text-white font-medium text-xs tracking-wider transition-all duration-300 flex items-center gap-2 outline-none ${
                    cakeRevealed && candlesBlownCount >= 3 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 cursor-pointer pointer-events-auto' 
                      : 'bg-gray-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  Unveil Deep Wish <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* --- 7. FINAL DETAILED CELEBRATION MOMENT --- */}
            {currentStep === 'FINAL' && (
              <div id="step-final" className="flex flex-col items-center py-4 w-full">
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: [1, 1.15, 1], rotate: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
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

                <div className="flex gap-4">
                  {/* Restart Experience Button */}
                  <motion.button
                    id="replay-experience-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReset}
                    className="px-5 py-2.5 rounded-full bg-white border border-amber-300 text-amber-600 font-medium text-xs tracking-wider shadow-sm hover:bg-amber-50 transition-colors duration-305 flex items-center gap-1.5 cursor-pointer outline-none"
                  >
                    <RotateCcw className="w-4 h-4" /> Loop Magic
                  </motion.button>

                  {/* Closing Scene Exit Ring */}
                  <motion.button
                    id="close-experience-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goNext('COMPLETED')}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.25)] hover:from-amber-500 hover:to-amber-600 transition-colors flex items-center gap-1.5 cursor-pointer outline-none"
                  >
                    Finish Surprise <Check className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* --- 8. COMPLETED STEP (CLOSING LOGO SPLASH SCREEN) --- */}
        {currentStep === 'COMPLETED' && (
          <motion.div
            id="closing-screen"
            key="exit-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[500px] bg-white/95 backdrop-blur-md border border-amber-100 rounded-[28px] sm:rounded-[35px] shadow-[0_30px_70px_rgba(218,165,32,0.12)] p-6 sm:p-10 md:p-14 flex flex-col items-center text-center relative pointer-events-auto"
          >
            {/* Top golden lines style */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100" />

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center text-amber-500 mb-8"
            >
              <Sparkles className="w-8 h-8 fill-amber-300 stroke-amber-500" />
            </motion.div>

            <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight leading-snug mb-4">
              Drenchack Tech
            </h1>
            
            <p className="text-amber-600 font-mono text-[10px] uppercase tracking-[0.25em] mb-8 font-medium">
              We Wish You A Happy Birthday
            </p>

            <p className="text-gray-400 text-xs leading-relaxed max-w-[300px] mb-10 font-light">
              This interactive celebration space is proudly curated. Have a spectacular birthday celebration!
            </p>

            <motion.button
              id="replay-experience-exit-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium text-xs tracking-wider shadow-[0_10px_20px_rgba(251,191,36,0.2)] hover:from-amber-50 hover:to-amber-600 transition-all cursor-pointer outline-none flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Restart Surprises
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
