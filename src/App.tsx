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

  useEffect(() => {
    return () => { musicEngine.stop(); };
  }, []);

  const handleStartExperience = () => {
    musicEngine.playSparkleTransition();
    musicEngine.start();
    setStep('INTRO');
  };

  const handleResetExperience = () => {
    musicEngine.stop();
    setStep('SPLASH');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #fffdf5 0%, #fff9e6 40%, #fffbf0 70%, #fefefe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins', system-ui, sans-serif",
      color: '#1f2937',
      overflowX: 'hidden',
      overflowY: 'auto',
      padding: '2rem 0',
    }}>
      {/* Particle canvas background */}
      <ParticleCanvas />

      {/* Soft gold halo blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '50vw', height: '50vh', borderRadius: '50%',
        background: 'rgba(251,191,36,0.07)', filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '50vw', height: '50vh', borderRadius: '50%',
        background: 'rgba(253,224,71,0.06)', filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      <AnimatePresence mode="wait">
        {step === 'SPLASH' && (
          <motion.div
            key="splash"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 1.0, ease: [0.33, 1, 0.68, 1] }}
            style={{
              position: 'relative',
              minHeight: 500,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 10,
              padding: '3rem 1.5rem',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {/* Spinning outer ring 1 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: 360, height: 360,
                border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
            {/* Spinning outer ring 2 — dashed, reverse */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: 320, height: 320,
                border: '1.5px dashed rgba(251,191,36,0.3)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
            {/* Inner glow ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: 270, height: 270,
                border: '1px solid rgba(251,191,36,0.15)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            {/* Golden center aura glow */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: 200, height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(253,224,71,0.15) 50%, transparent 80%)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />

            {/* Title block */}
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 40, zIndex: 10 }}
            >
              {/* Premium label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontFamily: 'Courier New, monospace',
                letterSpacing: '0.22em', color: 'rgba(180,100,20,0.85)',
                textTransform: 'uppercase', fontWeight: 600,
              }}>
                <Sparkles style={{
                  width: 14, height: 14, flexShrink: 0,
                  fill: '#FCD34D', stroke: '#D97706',
                  animation: 'spin 4s linear infinite',
                }} />
                Premium Surprise
              </div>

              {/* Main heading */}
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(26px, 5vw, 42px)',
                fontWeight: 900,
                color: '#111827',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: '8px 0 0',
                background: 'linear-gradient(135deg, #92400e 0%, #d97706 35%, #fbbf24 60%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                A Beautiful Surprise Awaits
              </h1>

              <p style={{
                color: '#9ca3af',
                fontSize: 12,
                letterSpacing: '0.04em',
                maxWidth: 260,
                lineHeight: 1.7,
                fontWeight: 300,
                margin: '4px 0 0',
              }}>
                A dedicated cinematic birthday card crafted elegantly for you.
              </p>
            </motion.div>

            {/* Start button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{ zIndex: 10, pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            >
              <motion.button
                onClick={handleStartExperience}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.93 }}
                style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
                  border: '2px solid rgba(253,224,71,0.6)',
                  boxShadow: '0 0 0 10px rgba(251,191,36,0.12), 0 16px 32px rgba(251,191,36,0.35)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <Play style={{ width: 32, height: 32, fill: '#fff', marginLeft: 4 }} />
              </motion.button>

              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  color: '#9ca3af',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  fontWeight: 500,
                }}
              >
                Tap to Open
              </motion.span>
            </motion.div>

            {/* Decorative sparkle dots at corners */}
            {[
              { top: '15%', left: '12%' }, { top: '20%', right: '15%' },
              { bottom: '20%', left: '18%' }, { bottom: '15%', right: '12%' },
            ].map((pos, i) => (
              <motion.div
                key={i}
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.6 }}
                style={{
                  position: 'absolute',
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFD700, #F59E0B)',
                  boxShadow: '0 0 8px rgba(251,191,36,0.6)',
                  pointerEvents: 'none',
                  ...pos,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {step !== 'SPLASH' && (
        <CardStoryteller
          currentStep={step}
          onNext={(nextStep) => setStep(nextStep)}
          onReset={handleResetExperience}
        />
      )}

      {/* Inline keyframes for spin (used by lucide Sparkles above) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
