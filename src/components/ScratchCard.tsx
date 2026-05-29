/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { musicEngine } from '../utils/audio';

interface ScratchCardProps {
  onComplete: () => void;
  width?: number;
  height?: number;
}

interface JitterParticle {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number;
  color: string;
  rotation: number; rotSpeed: number;
  type: 'star' | 'orb' | 'diamond';
}

export default function ScratchCard({ onComplete, width = 220, height = 200 }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const shimmerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const checkPointsRef = useRef<{ x: number; y: number; scratched: boolean }[]>([]);
  const floatingParticlesRef = useRef<JitterParticle[]>([]);
  const shimmerOffsetRef = useRef(0);

  // ── Draw initial gold foil ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grid for scratch detection
    const points: typeof checkPointsRef.current = [];
    const rows = 9, cols = 9;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        points.push({
          x: (width / (cols + 1)) * (c + 1),
          y: (height / (rows + 1)) * (r + 1),
          scratched: false,
        });
    checkPointsRef.current = points;

    ctx.save();

    // Rich multi-stop gold foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0,    '#FFF9C4');
    grad.addColorStop(0.15, '#FFD700');
    grad.addColorStop(0.30, '#FFC200');
    grad.addColorStop(0.50, '#D4AF37');
    grad.addColorStop(0.70, '#AA7C11');
    grad.addColorStop(0.85, '#F3C430');
    grad.addColorStop(1,    '#FFFDE0');

    ctx.fillStyle = grad;
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(0, 0, width, height, 20);
    } else {
      ctx.rect(0, 0, width, height);
    }
    ctx.fill();

    // Dense sparkle dots on the foil
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cross-hatch shimmer lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.5;
    for (let i = -height; i < width + height; i += 14) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // Gold foil border
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(1.5, 1.5, width - 3, height - 3, 19);
    } else {
      ctx.rect(1.5, 1.5, width - 3, height - 3);
    }
    ctx.stroke();

    // Text instructions
    ctx.fillStyle = '#5C3D0A';
    ctx.font = 'bold 13px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ SCRATCH WITH LOVE ✦', width / 2, height / 2 - 14);
    ctx.fillStyle = 'rgba(92,61,10,0.75)';
    ctx.font = '9px "Poppins", sans-serif';
    ctx.fillText('Reveal Your Birthday Cake', width / 2, height / 2 + 8);
    ctx.font = '8px "Poppins", sans-serif';
    ctx.fillStyle = 'rgba(92,61,10,0.5)';
    ctx.fillText('Swipe your finger across the foil', width / 2, height / 2 + 24);

    ctx.restore();
  }, [width, height]);

  // ── Shimmer sweep animation on foil ──────────────────────────────────────
  useEffect(() => {
    if (completed) return;
    let animId: number;
    const shimmerCanvas = shimmerCanvasRef.current;
    if (!shimmerCanvas) return;
    const sCtx = shimmerCanvas.getContext('2d');
    if (!sCtx) return;

    const drawShimmer = () => {
      sCtx.clearRect(0, 0, width, height);
      shimmerOffsetRef.current = (shimmerOffsetRef.current + 2.2) % (width * 2 + 80);
      const x = shimmerOffsetRef.current - width * 0.5;

      const sg = sCtx.createLinearGradient(x - 40, 0, x + 60, 0);
      sg.addColorStop(0,    'rgba(255,255,255,0)');
      sg.addColorStop(0.35, 'rgba(255,255,255,0.28)');
      sg.addColorStop(0.5,  'rgba(255,255,255,0.55)');
      sg.addColorStop(0.65, 'rgba(255,255,255,0.28)');
      sg.addColorStop(1,    'rgba(255,255,255,0)');

      sCtx.save();
      sCtx.fillStyle = sg;
      sCtx.fillRect(0, 0, width, height);
      sCtx.restore();

      animId = requestAnimationFrame(drawShimmer);
    };
    drawShimmer();
    return () => cancelAnimationFrame(animId);
  }, [width, height, completed]);

  // ── Floating stardust render loop ─────────────────────────────────────────
  useEffect(() => {
    let animId: number;
    const pc = particleCanvasRef.current;
    if (!pc) return;
    const pCtx = pc.getContext('2d');
    if (!pCtx) return;

    const update = () => {
      pCtx.clearRect(0, 0, width, height);
      const ps = floatingParticlesRef.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx; p.y += p.vy;
        p.alpha -= 0.022; p.size *= 0.975; p.rotation += p.rotSpeed;
        if (p.alpha <= 0 || p.size <= 0.15) { ps.splice(i, 1); continue; }
        pCtx.save();
        pCtx.globalAlpha = p.alpha;
        pCtx.translate(p.x, p.y);
        pCtx.rotate(p.rotation);
        pCtx.fillStyle = p.color;
        pCtx.shadowBlur = p.size * 2.5;
        pCtx.shadowColor = p.color;

        if (p.type === 'star') {
          pCtx.beginPath();
          for (let s = 0; s < 5; s++) {
            pCtx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * p.size,
                        Math.sin((18 + s * 72) * Math.PI / 180) * p.size);
            pCtx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (p.size / 2.5),
                        Math.sin((54 + s * 72) * Math.PI / 180) * (p.size / 2.5));
          }
          pCtx.closePath(); pCtx.fill();
        } else if (p.type === 'diamond') {
          pCtx.beginPath();
          pCtx.moveTo(0, -p.size); pCtx.lineTo(p.size * 0.6, 0);
          pCtx.lineTo(0, p.size); pCtx.lineTo(-p.size * 0.6, 0);
          pCtx.closePath(); pCtx.fill();
        } else {
          pCtx.beginPath();
          pCtx.arc(0, 0, p.size, 0, Math.PI * 2);
          pCtx.fill();
        }
        pCtx.restore();
      }
      animId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  // ── Scratch logic ─────────────────────────────────────────────────────────
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setShowHint(false);

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Erase foil in organic cluster
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const spray = [
      { dx: 0, dy: 0, r: 14 },
      { dx: -12, dy: -5, r: 8 },
      { dx: 10, dy: -12, r: 6 },
      { dx: -7, dy: 11, r: 9 },
      { dx: 13, dy: 7, r: 7 },
      { dx: 0, dy: -16, r: 5 },
      { dx: 15, dy: -2, r: 4 },
    ];
    spray.forEach(pt => {
      ctx.beginPath();
      ctx.arc(x + pt.dx, y + pt.dy, pt.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Spawn richer stardust
    const colors = ['#FFF3A1','#FFFFFF','#F3C430','#D4AF37','#FFD700','#FFFCF0','#FBBF24'];
    const types: JitterParticle['type'][] = ['star','orb','diamond'];
    for (let i = 0; i < 5; i++) {
      floatingParticlesRef.current.push({
        id: Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -(Math.random() * 1.8 + 0.7),
        size: Math.random() * 6 + 2.5,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    // Check scratch coverage
    let count = 0;
    checkPointsRef.current.forEach(pt => {
      if (!pt.scratched && Math.hypot(pt.x - x, pt.y - y) < 22) pt.scratched = true;
      if (pt.scratched) count++;
    });
    const pct = Math.floor((count / checkPointsRef.current.length) * 100);
    setScratchPercent(pct);

    if (pct >= 50 && !completed) {
      setCompleted(true);
      musicEngine.playSparkleTransition();
      onComplete();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center pointer-events-auto" style={{ width, height }}>
      {/* Backing reveal layer */}
      <div className="absolute inset-0 rounded-2xl bg-amber-50/20 border border-dashed border-amber-300/40 z-10 flex flex-col items-center justify-center text-center p-4">
        <Sparkles className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
        <span className="text-xs text-amber-700 font-sans tracking-wide">Your Cake Awaits!</span>
      </div>

      {/* Main scratch canvas */}
      <canvas
        ref={canvasRef}
        width={width} height={height}
        onMouseDown={() => setIsScratching(true)}
        onMouseUp={() => setIsScratching(false)}
        onMouseLeave={() => setIsScratching(false)}
        onMouseMove={(e) => { if (isScratching) scratch(e.clientX, e.clientY); }}
        onTouchStart={() => setIsScratching(true)}
        onTouchEnd={() => setIsScratching(false)}
        onTouchMove={(e) => { if (e.touches.length > 0) scratch(e.touches[0].clientX, e.touches[0].clientY); }}
        className="absolute inset-0 z-30 cursor-crosshair rounded-2xl select-none"
        style={{ touchAction: 'none' }}
      />

      {/* Moving shimmer sweep on top of foil */}
      <canvas
        ref={shimmerCanvasRef}
        width={width} height={height}
        className="absolute inset-0 z-35 pointer-events-none select-none rounded-2xl"
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* Stardust particles */}
      <canvas
        ref={particleCanvasRef}
        width={width} height={height}
        className="absolute inset-0 z-40 pointer-events-none select-none rounded-2xl"
      />

      {/* Swipe hint */}
      {showHint && !completed && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-amber-800/70 text-amber-100 text-[9px] font-mono tracking-wider px-3 py-1 rounded-full animate-pulse">
            ← swipe to scratch →
          </div>
        </div>
      )}

      {/* Progress bar */}
      {scratchPercent > 0 && !completed && (
        <div className="absolute bottom-[-18px] left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="h-1 w-3/4 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-200"
              style={{ width: `${scratchPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
