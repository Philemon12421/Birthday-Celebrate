/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';
import { ExperienceStep } from './types';
import { musicEngine } from './utils/audio';
import ParticleCanvas from './components/ParticleCanvas';
import CardStoryteller from './components/CardStoryteller';

export default function App() {
  const [step, setStep] = useState<ExperienceStep>('SPLASH');

  // Ensure Audio Context stops when the window shuts down/cleanups
  useEffect(() => {
    return () => {
      musicEngine.stop();
    };
  }, []);

  // Handle entry transition trigger and prompt music context play
  const handleStartExperience = () => {
    // Play harp glide transition chime
    musicEngine.playSparkleTransition();
    
    // Start synthesizers Loop sequence
    musicEngine.start();
    
    // Move to first story popup
    setStep('INTRO');
  };

  // Reset storyteller sequencing and return to splash safely (turns off audio or leaves active as preferred)
  const handleResetExperience = () => {
    musicEngine.stop();
    setStep('SPLASH');
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col items-center justify-center font-sans text-gray-800 overflow-y-auto overflow-x-hidden py-4 sm:py-8">
      
      {/* High-Performance floating gold/white sparkle & balloon canvas background */}
      <ParticleCanvas />

      {/* Ambient background glowing gold halos */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-amber-100/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-amber-100/10 blur-[120px] pointer-events-none" />

      {/* MAIN SCREEN CO-ORDINATOR */}
      <AnimatePresence mode="wait">
        {step === 'SPLASH' && (
          <motion.div
            id="splash-screen"
            key="splash"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.1,
              filter: 'blur(10px)'
            }}
            transition={{ duration: 1.0, ease: [0.33, 1, 0.68, 1] }}
            className="relative min-h-[500px] w-full flex flex-col items-center justify-center text-center z-10 px-6 select-none pointer-events-none py-12"
          >
            {/* Elegant Outer Circular Dashed Rings */}
            <div className="absolute w-[360px] h-[360px] md:w-[420px] md:h-[420px] border border-amber-300/20 rounded-full animate-[spin_50s_linear_infinite] pointer-events-none" />
            <div className="absolute w-[320px] h-[320px] md:w-[385px] md:h-[385px] border-2 border-dashed border-amber-200/20 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

            {/* Glowing Golden Center Aura */}
            <div className="absolute w-[180px] h-[180px] rounded-full bg-amber-100/30 blur-3xl pointer-events-none animate-pulse" />

            {/* Title display layout with space tracking */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="flex flex-col items-center gap-2 mb-10 z-10"
            >
              <div className="flex items-center gap-1 text-[11px] font-mono tracking-[0.22em] text-amber-600/80 uppercase font-semibold">
                <Sparkles className="w-3.5 h-3.5 shrink-0 fill-amber-300 stroke-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                Premium Surprise
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-normal mt-2">
                A Beautiful Surprise Awaits
              </h1>
              <p className="text-gray-400 text-xs tracking-wide max-w-[260px] leading-relaxed font-light font-sans">
                A dedicated cinematic birthday card crafted elegantly for you.
              </p>
            </motion.div>

            {/* Circular Glow Start Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="z-10 pointer-events-auto flex flex-col items-center gap-4"
            >
              <motion.button
                id="start-experience-button"
                onClick={handleStartExperience}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 0 35px rgba(251, 191, 36, 0.45)'
                }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-200 shadow-[0_15px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_20px_45px_rgba(251,191,36,0.45)] text-white flex items-center justify-center transition-shadow cursor-pointer outline-none relative group ring-8 ring-amber-50/50"
              >
                {/* Internal Shimmer Wave Component */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                <Play className="w-8 h-8 fill-white translate-x-[2px] transition-transform group-hover:scale-110" />
              </motion.button>
              
              <span className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-medium font-sans animate-pulse">
                Tap to Open
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Storyteller Modals */}
      {step !== 'SPLASH' && (
        <CardStoryteller
          currentStep={step}
          onNext={(nextStep) => setStep(nextStep)}
          onReset={handleResetExperience}
        />
      )}
    </div>
  );
}
