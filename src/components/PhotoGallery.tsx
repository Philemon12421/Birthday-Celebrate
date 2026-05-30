/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, Play, Pause } from 'lucide-react';

const BASE = '/';
const IMGS = [
  BASE + 'IMG_20260529_135235_489.jpg',
  BASE + 'IMG_20260529_135235_576.jpg',
  BASE + 'IMG_20260529_135235_717.jpg',
  BASE + 'IMG_20260529_135250_060.jpg',
];

const ITEMS = [
  { id:'g1', src:IMGS[0], title:'A Brilliant Horizon',     caption:'Capturing the golden essence of new paths.', msg:'May your steps always fall on paths of brilliant inspiration and endless success!', tilt:1.5, bg:'linear-gradient(135deg,#fde68a,#fef3c7)' },
  { id:'g2', src:IMGS[1], title:'Moments of Pure Joy',     caption:'The heartwarming laughter in our happiest times.', msg:'Here is to the unforgettable sparkles in your eyes when you laugh!', tilt:-1.2, bg:'linear-gradient(135deg,#fecdd3,#fff1f2)' },
  { id:'g3', src:IMGS[2], title:'Peace & Serenity',        caption:'Finding a quiet oasis in this bustling adventure.', msg:'Wishing you beautifully peaceful waters and calm milestones that glow.', tilt:2.0, bg:'linear-gradient(135deg,#bae6fd,#eff6ff)' },
  { id:'g4', src:IMGS[3], title:'Infinite Spark of Wonder',caption:'Unleashing radiant creativity towards your dreams.', msg:'May your magical imagination continue to spark brilliant wonders!', tilt:-0.8, bg:'linear-gradient(135deg,#ddd6fe,#faf5ff)' },
];

export default function PhotoGallery({ onComplete }: { onComplete?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setIdx(p => {
        if (p === ITEMS.length - 1) { clearInterval(t); if (onComplete) setTimeout(onComplete, 900); return p; }
        return p + 1;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [auto, onComplete]);

  const item = ITEMS[idx];

  const navBtn: React.CSSProperties = {
    width:36, height:36, borderRadius:'50%',
    background:'rgba(255,255,255,0.95)',
    border:'1px solid rgba(251,191,36,0.4)',
    boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
    color:'#D97706', display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', outline:'none', pointerEvents:'auto',
  };

  return (
    <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', userSelect:'none' }}>
      {/* Header */}
      <div style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:10, fontFamily:'Courier New, monospace', letterSpacing:'0.18em', color:'rgba(180,100,20,0.7)', textTransform:'uppercase' }}>
            Memory {idx+1} of {ITEMS.length}
          </span>
          <button onClick={() => setAuto(a => !a)}
            style={{ width:20, height:20, borderRadius:'50%', background:'rgba(251,191,36,0.12)', border:'none', color:'#D97706', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', outline:'none' }}>
            {auto ? <Pause size={10} strokeWidth={2.5}/> : <Play size={10} strokeWidth={2.5}/>}
          </button>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {ITEMS.map((_,i) => (
            <button key={i} onClick={() => { setAuto(false); setIdx(i); }}
              style={{ height:6, width: i===idx ? 16:6, borderRadius:6, background: i===idx ? '#F59E0B':'rgba(251,191,36,0.3)', border:'none', cursor:'pointer', transition:'all 0.3s', padding:0 }} />
          ))}
        </div>
      </div>

      {/* Polaroid */}
      <div style={{ position:'relative', width:'100%', maxWidth:340, marginBottom:24, pointerEvents:'auto' }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <AnimatePresence mode="wait">
          <motion.div key={item.id}
            initial={{ opacity:0, scale:0.9, rotate:-4, y:16 }}
            animate={{ opacity:1, scale: hov?1.03:1, rotate: hov?0:item.tilt, y: hov?-6:0 }}
            exit={{ opacity:0, scale:0.9, rotate:4, y:-16 }}
            transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
            style={{
              background:'#fff',
              borderRadius:24,
              padding:16,
              display:'flex', flexDirection:'column', alignItems:'center',
              position:'relative',
              boxShadow: hov
                ? '0 28px 50px rgba(218,165,32,0.22), 0 8px 20px rgba(0,0,0,0.08)'
                : '0 12px 30px rgba(218,165,32,0.10), 0 4px 10px rgba(0,0,0,0.04)',
              border:'1px solid rgba(251,191,36,0.12)',
              transition:'box-shadow 0.4s',
              aspectRatio:'4/5',
            }}>
            {/* Top clip */}
            <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', width:40, height:24,
              background:'linear-gradient(to bottom, rgba(251,191,36,0.5), rgba(251,191,36,0.1))',
              borderRadius:'8px 8px 0 0', border:'1px solid rgba(251,191,36,0.25)', zIndex:2 }} />

            {/* Photo */}
            <div style={{ width:'100%', aspectRatio:'1/1', borderRadius:16, overflow:'hidden', background:item.bg, position:'relative' }}>
              <img src={item.src} alt={item.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', filter: hov ? 'brightness(1.06) saturate(1.1)':'none', transition:'filter 0.4s' }}
                onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              <div style={{ position:'absolute', inset:0, borderRadius:16,
                background:'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.1) 100%)', pointerEvents:'none' }} />
            </div>

            {/* Caption */}
            <div style={{ width:'100%', padding:'14px 0 8px', textAlign:'center' }}>
              <h3 style={{ fontFamily:"'Playfair Display', Georgia, serif", color:'#92400e', fontSize:14, fontWeight:700, margin:'0 0 6px' }}>{item.title}</h3>
              <p style={{ fontFamily:"'Playfair Display', serif", fontWeight:300, fontSize:11, color:'#6b7280', lineHeight:1.6, margin:0 }}>{item.caption}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <div style={{ position:'absolute', top:'50%', left:-8, right:-8, display:'flex', justifyContent:'space-between', transform:'translateY(-50%)', pointerEvents:'none', zIndex:10 }}>
          <motion.button whileHover={{ scale:1.15, x:-2 }} whileTap={{ scale:0.9 }}
            onClick={() => { setAuto(false); setIdx(p => p===0?ITEMS.length-1:p-1); }} style={navBtn}>
            <ChevronLeft size={18} />
          </motion.button>
          <motion.button whileHover={{ scale:1.15, x:2 }} whileTap={{ scale:0.9 }}
            onClick={() => { setAuto(false); setIdx(p => { if(p===ITEMS.length-1){if(onComplete)onComplete();return p;}return p+1;}); }} style={navBtn}>
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>

      {/* Message */}
      <div style={{ width:'100%', borderTop:'1px solid rgba(251,191,36,0.1)', paddingTop:16, paddingBottom:4 }}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginBottom:10 }}>
          <Heart size={14} style={{ fill:'#fb7185', stroke:'#fb7185', animation:'pulse 1.5s infinite' }} />
          <span style={{ fontSize:10, fontFamily:'Courier New, monospace', letterSpacing:'0.18em', color:'rgba(180,100,20,0.8)', textTransform:'uppercase', fontWeight:600 }}>Celebration Message</span>
          <Heart size={14} style={{ fill:'#fb7185', stroke:'#fb7185', animation:'pulse 1.5s infinite' }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={item.id} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}
            style={{ color:'#4b5563', fontSize:12, lineHeight:1.8, fontStyle:'italic', textAlign:'center', maxWidth:340, margin:'0 auto' }}>
            "{item.msg}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
