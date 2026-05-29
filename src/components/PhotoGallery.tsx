/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, Play, Pause } from 'lucide-react';

/**
 * ─── YOUR GITHUB IMAGES ───────────────────────────────────────────────────────
 * Update BASE_URL to your repo path. The four image filenames match what you
 * uploaded to /public/ in your GitHub repo:
 *   IMG_20260529_135235_489.jpg
 *   IMG_20260529_135235_576.jpg
 *   IMG_20260529_135235_717.jpg
 *   IMG_20260529_135250_060.jpg
 *
 * If you're running locally (Vite), just put the files in /public/ and they'll
 * be served at /IMG_20260529_135235_489.jpg etc.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const BASE_URL = '/'; // Vite public folder — images served at root

const GALLERY_IMAGES = [
  `${BASE_URL}IMG_20260529_135235_489.jpg`,
  `${BASE_URL}IMG_20260529_135235_576.jpg`,
  `${BASE_URL}IMG_20260529_135235_717.jpg`,
  `${BASE_URL}IMG_20260529_135250_060.jpg`,
];

interface GalleryItem {
  id: string;
  imageUrl: string;
  defaultTitle: string;
  defaultCaption: string;
  celebrationContent: string;
  themeColor: string;
  tiltDeg: number; // polaroid rotation
}

interface PhotoGalleryProps {
  onComplete?: () => void;
}

const ITEMS: GalleryItem[] = [
  {
    id: 'gallery-item-1',
    imageUrl: GALLERY_IMAGES[0],
    defaultTitle: 'A Brilliant Horizon',
    defaultCaption: 'Capturing the golden essence of new paths and infinite opportunities.',
    celebrationContent:
      'May your steps always fall on paths of brilliant inspiration and endless success! You bring deep wisdom and strength to everyone you walk alongside.',
    themeColor: 'from-amber-200 to-yellow-100',
    tiltDeg: 1.5,
  },
  {
    id: 'gallery-item-2',
    imageUrl: GALLERY_IMAGES[1],
    defaultTitle: 'Moments of Pure Joy',
    defaultCaption: 'The heartwarming laughter that echoes in our happiest times.',
    celebrationContent:
      'Here is to the unforgettable sparkles in your eyes when you laugh, for they kindle a warm fire of gladness in everyone honored to share your space!',
    themeColor: 'from-rose-200 to-pink-100',
    tiltDeg: -1.2,
  },
  {
    id: 'gallery-item-3',
    imageUrl: GALLERY_IMAGES[2],
    defaultTitle: 'Peace & Serenity',
    defaultCaption: 'Finding a perfectly quiet oasis amidst this bustling adventure.',
    celebrationContent:
      'Wishing you beautifully peaceful waters, calm mornings, and quiet milestones that glow from the inside out with absolute celestial harmony.',
    themeColor: 'from-sky-200 to-indigo-100',
    tiltDeg: 2.0,
  },
  {
    id: 'gallery-item-4',
    imageUrl: GALLERY_IMAGES[3],
    defaultTitle: 'Infinite Spark of Wonder',
    defaultCaption: 'Unleashing radiant creativity and watching dreams materialize.',
    celebrationContent:
      'May your magical imagination continue to spark brilliant wonders and illuminate the path toward every single one of your magnificent dreams!',
    themeColor: 'from-amber-100 to-indigo-200',
    tiltDeg: -0.8,
  },
];

export default function PhotoGallery({ onComplete }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === ITEMS.length - 1) {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, onComplete]);

  const goPrev = () => {
    setAutoPlay(false);
    setActiveIndex((prev) => (prev === 0 ? ITEMS.length - 1 : prev - 1));
  };

  const goNext = () => {
    setAutoPlay(false);
    setActiveIndex((prev) => {
      if (prev === ITEMS.length - 1) { if (onComplete) onComplete(); return prev; }
      return prev + 1;
    });
  };

  const currentItem = ITEMS[activeIndex];

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Progress header */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono tracking-widest text-amber-600/80 uppercase">
            Memory {activeIndex + 1} of {ITEMS.length}
          </span>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="w-5 h-5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 flex items-center justify-center transition-colors outline-none cursor-pointer"
            title={autoPlay ? 'Pause Slideshow' : 'Start Slideshow'}
          >
            {autoPlay ? <Pause className="w-2.5 h-2.5 stroke-[2.5]" /> : <Play className="w-2.5 h-2.5 stroke-[2.5]" />}
          </button>
        </div>
        <div className="flex gap-1.5 items-center">
          {ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setAutoPlay(false); setActiveIndex(idx); }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex ? 'bg-amber-500 w-4' : 'bg-amber-200 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Polaroid frame */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-[1/1.2] max-w-[340px] mb-6 pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -4, y: 20 }}
            animate={{
              opacity: 1,
              scale: isHovered ? 1.03 : 1,
              rotate: isHovered ? 0 : currentItem.tiltDeg,
              y: isHovered ? -8 : 0,
            }}
            exit={{ opacity: 0, scale: 0.9, rotate: 4, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full bg-white rounded-3xl p-4 flex flex-col items-center justify-between relative"
            style={{
              boxShadow: isHovered
                ? '0 28px 50px rgba(218,165,32,0.22), 0 8px 20px rgba(0,0,0,0.08)'
                : '0 15px 35px rgba(218,165,32,0.1), 0 4px 12px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.4s ease',
              border: '1px solid rgba(251,191,36,0.15)',
            }}
          >
            {/* Golden clip at top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-gradient-to-b from-amber-200/60 to-amber-300/10 rounded-t-lg border-t border-amber-300/30 shadow-inner z-20 pointer-events-none" />

            {/* Shimmer overlay on hover */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: '200%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-3xl pointer-events-none z-30"
              />
            )}

            {/* Photo */}
            <div
              className={`w-full aspect-square rounded-2xl overflow-hidden relative bg-gradient-to-br ${currentItem.themeColor}`}
              style={{ border: '1px solid rgba(251,191,36,0.15)' }}
            >
              <img
                src={currentItem.imageUrl}
                alt={currentItem.defaultTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  filter: isHovered ? 'brightness(1.05) saturate(1.1)' : 'brightness(1) saturate(1)',
                  transition: 'filter 0.4s ease',
                }}
                onError={(e) => {
                  // Fallback gradient if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Vignette overlay */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.12) 100%)'}} />
            </div>

            {/* Caption */}
            <div className="w-full pt-4 pb-2 text-center overflow-hidden">
              <h3 className="font-serif text-amber-800 text-sm font-semibold tracking-wide mb-1.5">
                {currentItem.defaultTitle}
              </h3>
              <p className="font-serif font-light text-[11px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                {currentItem.defaultCaption}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <div className="absolute inset-y-1/2 -left-2 sm:-left-12 -right-2 sm:-right-12 flex justify-between items-center pointer-events-none z-30">
          <motion.button
            whileHover={{ scale: 1.15, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            className="w-9 h-9 rounded-full bg-white/95 border border-amber-200/60 shadow-md text-amber-600 flex items-center justify-center pointer-events-auto cursor-pointer outline-none hover:text-amber-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            className="w-9 h-9 rounded-full bg-white/95 border border-amber-200/60 shadow-md text-amber-600 flex items-center justify-center pointer-events-auto cursor-pointer outline-none hover:text-amber-700"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Celebration message */}
      <div className="w-full min-h-[90px] border-t border-amber-200/10 pt-4 px-2 select-text">
        <div className="flex justify-center gap-1.5 mb-2.5">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-300 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-amber-600/90 uppercase font-semibold">
            Celebration Message
          </span>
          <Heart className="w-4 h-4 text-rose-400 fill-rose-300 animate-pulse" />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentItem.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className="text-gray-600 text-xs leading-relaxed font-sans font-light italic text-center max-w-[340px] mx-auto select-none"
          >
            "{currentItem.celebrationContent}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
