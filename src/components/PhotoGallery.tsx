/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, Play, Pause } from 'lucide-react';

interface GalleryItem {
  id: string;
  defaultTitle: string;
  defaultCaption: string;
  celebrationContent: string;
  themeColor: string;
  defaultImage: string;
  illustrationSvg: React.ReactNode;
}

interface PhotoGalleryProps {
  onComplete?: () => void;
}

export default function PhotoGallery({ onComplete }: PhotoGalleryProps) {
  const [items] = useState<GalleryItem[]>([
    {
      id: 'gallery-item-1',
      defaultTitle: 'A Brilliant Horizon',
      defaultCaption: 'Capturing the golden essence of new paths and infinite opportunities.',
      celebrationContent: 'May your steps always fall on paths of brilliant inspiration and endless success! You bring deep wisdom and strength to everyone you walk alongside.',
      themeColor: 'from-amber-200 to-yellow-100',
      defaultImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop',
      illustrationSvg: (
        <svg className="w-full h-full text-amber-500/80" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="30" className="stroke-amber-300 stroke-[1.5]" strokeDasharray="3 3" />
          <path d="M 25 70 C 40 50, 60 55, 75 70" className="stroke-amber-400 stroke-2" fill="none" />
          <path d="M 20 85 C 40 70, 60 75, 80 85" className="stroke-amber-550 stroke-[2.5]" fill="none" />
          <circle cx="50" cy="40" r="10" className="fill-amber-300" />
          <path d="M 50 15 L 50 22 M 50 58 L 50 65 M 25 40 L 32 40 M 68 40 L 75 40" className="stroke-amber-400 stroke-[1.5]" />
        </svg>
      )
    },
    {
      id: 'gallery-item-2',
      defaultTitle: 'Moments of Pure Joy',
      defaultCaption: 'The heartwarming laughter that echoes in our happiest times.',
      celebrationContent: 'Here is to the unforgettable sparkles in your eyes when you laugh, for they kindle a warm fire of gladness in everyone honored to share your space!',
      themeColor: 'from-rose-200 to-pink-100',
      defaultImage: 'https://images.unsplash.com/photo-1496843916299-fc0902249513?q=80&w=600&auto=format&fit=crop',
      illustrationSvg: (
        <svg className="w-full h-full text-pink-500/80" viewBox="0 0 100 100" fill="none">
          <path d="M 50 78 C 25 50, 25 35, 50 20 C 75 35, 75 50, 50 78 Z" className="fill-pink-200 stroke-pink-300 stroke-[1.5]" />
          <circle cx="28" cy="22" r="1.5" className="fill-pink-400" />
          <circle cx="72" cy="65" r="2" className="fill-pink-300" />
          <path d="M 40 45 Q 50 58 60 45" className="stroke-pink-500/80 stroke-2" strokeLinecap="round" fill="none" />
        </svg>
      )
    },
    {
      id: 'gallery-item-3',
      defaultTitle: 'Peace & Serenity',
      defaultCaption: 'Finding a perfectly quiet oasis amidst this bustling adventure.',
      celebrationContent: 'Wishing you beautifully peaceful waters, calm mornings, and quiet milestones that glow from the inside out with absolute celestial harmony.',
      themeColor: 'from-sky-200 to-indigo-100',
      defaultImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop',
      illustrationSvg: (
        <svg className="w-full h-full text-sky-500/80" viewBox="0 0 100 100" fill="none">
          <path d="M 15 75 Q 35 60 50 75 T 85 75" className="stroke-sky-300 stroke-2" fill="none" />
          <path d="M 10 85 Q 30 75 50 85 T 90 85" className="stroke-sky-400 stroke-[1.5]" fill="none" />
          <path d="M 45 42 L 55 42 M 50 35 L 50 49 M 42 45 C 42 45, 50 30, 58 45" className="stroke-sky-500 stroke-[1.5]" fill="none" />
          <circle cx="80" cy="25" r="3" className="fill-sky-100" />
        </svg>
      )
    },
    {
      id: 'gallery-item-4',
      defaultTitle: 'Infinite Spark of Wonder',
      defaultCaption: 'Unleashing radiant creativity and watching dreams materialize.',
      celebrationContent: 'May your magical imagination continue to spark brilliant wonders and illuminate the path toward every single one of your magnificent dreams!',
      themeColor: 'from-amber-100 to-indigo-200',
      defaultImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
      illustrationSvg: (
        <svg className="w-full h-full text-indigo-500/80" viewBox="0 0 100 100" fill="none">
          <polygon points="50,15 54,32 71,32 57,42 62,59 50,49 38,59 43,42 29,32 46,32" className="fill-indigo-200 stroke-indigo-300 stroke-[1.5]" />
          <circle cx="20" cy="25" r="1.5" className="fill-indigo-300" />
          <circle cx="82" cy="70" r="1" className="fill-amber-400" />
          <circle cx="15" cy="80" r="2" className="fill-amber-300" />
        </svg>
      )
    }
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto swapping rotation effect (slide interval)
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === items.length - 1) {
          // Reached the end of the items loop! Call onComplete to advance to the next step
          if (onComplete) {
            clearInterval(interval);
            setTimeout(() => {
              onComplete();
            }, 1000); // 1s beautiful fade layout delay
            return prev;
          }
          return 0; // fallback loop
        }
        return prev + 1;
      });
    }, 4500); // Swaps every 4.5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, items.length, onComplete]);

  const goPrev = () => {
    setAutoPlay(false); // Pause so user has control
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goNext = () => {
    setAutoPlay(false); // Pause so user has control
    setActiveIndex((prev) => {
      if (prev === items.length - 1) {
        if (onComplete) {
          onComplete();
          return prev;
        }
        return 0;
      }
      return prev + 1;
    });
  };

  const currentItem = items[activeIndex];

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Slide Controls and Pagination Header */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono tracking-widest text-amber-600/80 uppercase select-none">
            Memory {activeIndex + 1} of {items.length}
          </span>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="w-5 h-5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 flex items-center justify-center transition-colors outline-none cursor-pointer"
            title={autoPlay ? "Pause Slideshow" : "Start Slideshow"}
          >
            {autoPlay ? <Pause className="w-2.5 h-2.5 stroke-[2.5]" /> : <Play className="w-2.5 h-2.5 stroke-[2.5]" />}
          </button>
        </div>
        <div className="flex gap-1.5 items-center">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAutoPlay(false); // User selected manually
                setActiveIndex(idx);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                idx === activeIndex ? 'bg-amber-500 w-4' : 'bg-amber-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Photographic Polaroid Framing */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[1/1.2] max-w-[340px] mb-6 pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.94, rotate: -1.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, rotate: -2, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full bg-white rounded-3xl p-4 shadow-[0_15px_35px_rgba(218,165,32,0.1)] border border-amber-100/50 flex flex-col items-center justify-between relative"
          >
            {/* Hanging / Decorative Golden Clip Effect */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-gradient-to-b from-amber-200/50 to-amber-300/10 rounded-t-lg border-t border-amber-300/20 shadow-inner z-20 pointer-events-none" />

            {/* Inner Photo Display Frame */}
            <div className={`w-full aspect-square rounded-2xl overflow-hidden border border-amber-150/50 relative flex flex-col items-center justify-center transition-all duration-300 bg-gradient-to-br ${currentItem.themeColor}`}>
              <img
                src={currentItem.defaultImage}
                alt={currentItem.defaultTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300 select-none pointer-events-none"
              />
            </div>

            {/* Polaroid handwritten-styled celebration caption under image */}
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

        {/* Floating Side Carousels Navigation Arrows */}
        <div className="absolute inset-y-1/2 -left-2 sm:-left-12 -right-2 sm:-right-12 flex justify-between items-center pointer-events-none z-30">
          <motion.button
            whileHover={{ scale: 1.15, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            className="w-9 h-9 rounded-full bg-white/95 border border-amber-200/60 shadow-md text-amber-600 flex items-center justify-center pointer-events-auto cursor-pointer outline-none hover:text-amber-700 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={goNext}
            className="w-9 h-9 rounded-full bg-white/95 border border-amber-200/60 shadow-md text-amber-600 flex items-center justify-center pointer-events-auto cursor-pointer outline-none hover:text-amber-700 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Nice Celebration Content below Polaroid Frame with clean scale effect */}
      <div className="w-full min-h-[90px] bg-gradient-to-b from-amber-50/20 to-transparent border-t border-amber-200/10 pt-4 px-2 select-text">
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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-gray-650 text-xs leading-relaxed font-sans font-light italic text-center max-w-[340px] mx-auto select-none"
          >
            "{currentItem.celebrationContent}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
