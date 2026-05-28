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
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

export default function ScratchCard({ onComplete, width = 220, height = 200 }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  // Grid of points to check for scratch percentage
  const checkPointsRef = useRef<{ x: number; y: number; scratched: boolean }[]>([]);
  // Floating stardust particles array
  const floatingParticlesRef = useRef<JitterParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset points
    const points: { x: number; y: number; scratched: boolean }[] = [];
    const rows = 8;
    const cols = 8;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({
          x: (width / (cols + 1)) * (c + 1),
          y: (height / (rows + 1)) * (r + 1),
          scratched: false,
        });
      }
    }
    checkPointsRef.current = points;

    // Draw luxury gold foil layer
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFF3A1'); // bright golden glow
    grad.addColorStop(0.3, '#F3C430'); // beautiful metallic gold
    grad.addColorStop(0.5, '#D4AF37'); // luxury gold
    grad.addColorStop(0.7, '#AA7C11'); // deep gold
    grad.addColorStop(1, '#F3C430');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    // Rounded corners rectangle for scratch background
    ctx.roundRect ? ctx.roundRect(0, 0, width, height, 20) : ctx.rect(0, 0, width, height);
    ctx.fill();

    // Subtle gold sparkles on the foil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 20; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const size = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Elegant thin borders
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Write text instruction elegantly in serif style
    ctx.fillStyle = '#654B00';
    ctx.font = 'bold 12px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH WITH LOVE', width / 2, height / 2 - 12);

    ctx.fillStyle = 'rgba(101, 75, 0, 0.7)';
    ctx.font = '9px "Poppins", sans-serif';
    ctx.fillText('Reveal Your Cake', width / 2, height / 2 + 10);

    ctx.restore();
  }, [width, height]);

  // Render loop for floating stardust particles on secondary canvas
  useEffect(() => {
    let animId: number;
    const particleCanvas = particleCanvasRef.current;
    if (!particleCanvas) return;
    const pCtx = particleCanvas.getContext('2d');
    if (!pCtx) return;

    const updateParticles = () => {
      pCtx.clearRect(0, 0, width, height);
      
      const particles = floatingParticlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025; // fade out
        p.size *= 0.97; // shrink
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0 || p.size <= 0.2) {
          particles.splice(i, 1);
          continue;
        }

        pCtx.save();
        pCtx.globalAlpha = p.alpha;
        pCtx.translate(p.x, p.y);
        pCtx.rotate(p.rotation);

        // Draw glittering star-like particle or circular dot
        pCtx.fillStyle = p.color;
        pCtx.shadowBlur = p.size * 2;
        pCtx.shadowColor = p.color;

        if (i % 2 === 0) {
          // Draw star design for stardust
          pCtx.beginPath();
          for (let s = 0; s < 5; s++) {
            pCtx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * p.size, Math.sin((18 + s * 72) * Math.PI / 180) * p.size);
            pCtx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (p.size / 2.5), Math.sin((54 + s * 72) * Math.PI / 180) * (p.size / 2.5));
          }
          pCtx.closePath();
          pCtx.fill();
        } else {
          // Draw standard glowing orb
          pCtx.beginPath();
          pCtx.arc(0, 0, p.size, 0, Math.PI * 2);
          pCtx.fill();
        }

        pCtx.restore();
      }

      animId = requestAnimationFrame(updateParticles);
    };

    updateParticles();
    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Draw stardust clear path at cursor (textured cluster of different circle sizes to give organic stardust feel)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    
    const sprayPoints = [
      { dx: 0, dy: 0, r: 13 },
      { dx: -11, dy: -5, r: 7 },
      { dx: 9, dy: -11, r: 5 },
      { dx: -6, dy: 10, r: 8 },
      { dx: 12, dy: 6, r: 6 },
    ];

    sprayPoints.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(x + pt.dx, y + pt.dy, pt.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Spawn rich floating golden/white stardust dots
    const colors = ['#FFF3A1', '#FFFFFF', '#F3C430', '#D4AF37', '#FFD700', '#FFFCF0'];
    for (let i = 0; i < 3; i++) {
      floatingParticlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(Math.random() * 1.5 + 0.6), // slowly drifting up
        size: Math.random() * 5 + 2,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    // Check if points are scratched
    let count = 0;
    checkPointsRef.current.forEach((pt) => {
      if (!pt.scratched) {
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist < 20) {
          pt.scratched = true;
        }
      }
      if (pt.scratched) count++;
    });

    const percent = Math.floor((count / checkPointsRef.current.length) * 100);
    setScratchPercent(percent);

    if (percent >= 55 && !completed) {
      setCompleted(true);
      musicEngine.playSparkleTransition();
      onComplete();
    }
  };

  const handleMouseDown = () => setIsScratching(true);
  const handleMouseUp = () => setIsScratching(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleTouchStart = () => setIsScratching(true);
  const handleTouchEnd = () => setIsScratching(false);
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center pointer-events-auto"
      style={{ width, height }}
    >
      <canvas
        id="scratch-card-canvas"
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className="absolute inset-0 z-30 cursor-crosshair rounded-2xl select-none"
        style={{ touchAction: 'none' }}
      />
      
      {/* Floating particles upper canvas (draws stardust particles following touch/cursor) */}
      <canvas
        id="scratch-particles-canvas"
        ref={particleCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 z-40 pointer-events-none select-none rounded-2xl"
      />
      
      {/* Fallback backing box once fully scratched */}
      <div className="absolute inset-0 rounded-2xl bg-amber-50/20 border border-dashed border-amber-300/40 z-10 flex flex-col items-center justify-center text-center p-4">
        <Sparkles className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
        <span className="text-xs text-amber-700 font-sans tracking-wide">Foil Cleared!</span>
      </div>
    </div>
  );
}
