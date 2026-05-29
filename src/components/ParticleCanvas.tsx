/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { musicEngine } from '../utils/audio';

interface CanvasBalloon {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  width: number; height: number;
  colorType: 'gold' | 'yellow' | 'white' | 'cream' | 'rose';
  stringPhase: number; stringSpeed: number;
  isPopping: boolean; popProgress: number;
  wobbleAmp: number;
}

interface CanvasParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; color: string;
  alpha: number; speedY: number;
  wobble: number; wobbleSpeed: number;
}

interface ConfettiParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; color: string;
  rotation: number; rotationSpeed: number;
  opacity: number; gravity: number;
  wobble: number; wobbleSpeed: number;
  shape: 'circle' | 'rect' | 'star' | 'ribbon';
}

interface RibbonStreamer {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  width: number; height: number;
  rotation: number; rotationSpeed: number;
  opacity: number; gravity: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const balloonsRef = useRef<CanvasBalloon[]>([]);
  const particlesRef = useRef<CanvasParticle[]>([]);
  const confettiRef = useRef<ConfettiParticle[]>([]);
  const ribbonRef = useRef<RibbonStreamer[]>([]);
  const nextBalloonId = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Resize ──────────────────────────────────────────────────────────────
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ── Sparkle particles ───────────────────────────────────────────────────
    const createSparkle = (randomY = false): CanvasParticle => ({
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : window.innerHeight + 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 0.65 + 0.3),
      size: Math.random() * 2.8 + 1.0,
      // Mix of gold, cream, and soft rose dust
      color: Math.random() > 0.5 ? '#FFD700'
           : Math.random() > 0.5 ? '#FFFDF0'
           : '#FFCDD2',
      alpha: Math.random() * 0.55 + 0.25,
      speedY: -(Math.random() * 0.55 + 0.3),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.025 + 0.005,
    });

    const initParticles = () => {
      particlesRef.current = [];
      const count = Math.min(70, Math.floor(window.innerWidth / 18));
      for (let i = 0; i < count; i++) particlesRef.current.push(createSparkle(true));
    };

    // ── Confetti splash ─────────────────────────────────────────────────────
    const spawnConfetti = (ox: number, oy: number) => {
      const colors = [
        '#FF3366','#FDFFB6','#FFD166','#06D6A0',
        '#118AB2','#FFFFFF','#D4AF37','#FF9F1C',
        '#C0C0C0','#FF69B4','#7B61FF',
      ];
      const shapes: ConfettiParticle['shape'][] = ['rect','circle','star','ribbon'];
      for (let i = 0; i < 180; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = Math.random() * 10 + 3.5;
        confettiRef.current.push({
          x: ox, y: oy,
          vx: Math.cos(angle) * vel + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(angle) * vel - (Math.random() * 5.5 + 3),
          size: Math.random() * 7 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          opacity: 1.0, gravity: 0.17,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.09 + 0.03,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
    };

    // ── Ribbon streamers (launch on splash open) ────────────────────────────
    const spawnRibbons = () => {
      const colors = ['#FFD700','#FF69B4','#7B61FF','#06D6A0','#FF3366','#FDFFB6'];
      for (let i = 0; i < 30; i++) {
        ribbonRef.current.push({
          x: Math.random() * window.innerWidth,
          y: -Math.random() * 80,
          vx: (Math.random() - 0.5) * 2.5,
          vy: Math.random() * 2.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          width: 5 + Math.random() * 5,
          height: 18 + Math.random() * 14,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          opacity: 1.0,
          gravity: 0.06,
        });
      }
    };

    // ── Event listeners ─────────────────────────────────────────────────────
    const handleConfettiEvent = (e: Event) => {
      const ce = e as CustomEvent<{ x?: number; y?: number }>;
      spawnConfetti(ce.detail?.x ?? window.innerWidth / 2, ce.detail?.y ?? window.innerHeight / 2 - 100);
    };
    const handleRibbonEvent = () => spawnRibbons();

    window.addEventListener('birthday-confetti-explode', handleConfettiEvent);
    window.addEventListener('birthday-ribbons', handleRibbonEvent);

    // ── Balloons ─────────────────────────────────────────────────────────────
    const spawnBalloon = (initialY = false): CanvasBalloon => {
      const types: CanvasBalloon['colorType'][] = ['gold','yellow','white','cream','rose'];
      const w = Math.random() * 15 + 38;
      return {
        id: nextBalloonId.current++,
        x: Math.random() * (window.innerWidth - 80) + 40,
        y: initialY ? Math.random() * (window.innerHeight - 100) + 100 : window.innerHeight + 60,
        vx: (Math.random() - 0.5) * 0.38,
        vy: -(Math.random() * 0.5 + 0.45),
        width: w, height: w * 1.25,
        colorType: types[Math.floor(Math.random() * types.length)],
        stringPhase: Math.random() * Math.PI * 2,
        stringSpeed: Math.random() * 0.015 + 0.005,
        isPopping: false, popProgress: 0,
        wobbleAmp: Math.random() * 0.25 + 0.1,
      };
    };

    const initBalloons = () => {
      balloonsRef.current = [];
      const count = Math.min(6, Math.floor(window.innerWidth / 240) + 2);
      for (let i = 0; i < count; i++) balloonsRef.current.push(spawnBalloon(true));
    };

    initParticles();
    initBalloons();
    // Auto-spawn ribbon streamers shortly after page loads for a celebratory opening
    setTimeout(() => spawnRibbons(), 600);

    const spawnTimer = setInterval(() => {
      if (balloonsRef.current.filter(b => !b.isPopping).length < 7)
        balloonsRef.current.push(spawnBalloon(false));
    }, 4000);

    // ── Draw star shape helper ────────────────────────────────────────────────
    const drawStar = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * size,
                   Math.sin((18 + s * 72) * Math.PI / 180) * size);
        ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (size / 2.5),
                   Math.sin((54 + s * 72) * Math.PI / 180) * (size / 2.5));
      }
      ctx.closePath();
      ctx.fill();
    };

    // ── Main render loop ──────────────────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Sparkle particles
      particlesRef.current.forEach((p, idx) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 0.28;
        p.wobble += p.wobbleSpeed;
        const alpha = p.alpha * (0.55 + Math.sin(p.wobble * 2) * 0.45);
        ctx.save();
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20)
          particlesRef.current[idx] = createSparkle(false);
      });

      // 2. Ribbon streamers
      for (let i = ribbonRef.current.length - 1; i >= 0; i--) {
        const r = ribbonRef.current[i];
        r.vy += r.gravity;
        r.x += r.vx + Math.sin(r.rotation * 0.8) * 0.6;
        r.y += r.vy;
        r.rotation += r.rotationSpeed;
        if (r.y > canvas.height + 30) { r.opacity -= 0.06; }
        if (r.opacity <= 0) { ribbonRef.current.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = r.opacity;
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rotation);
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.roundRect(-r.width / 2, -r.height / 2, r.width, r.height, 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Balloons
      balloonsRef.current.forEach((b) => {
        if (b.isPopping) {
          b.popProgress += 0.08;
          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.width * (1 + b.popProgress * 1.5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,215,0,${1 - b.popProgress})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          for (let s = 0; s < 12; s++) {
            const ang = (s / 12) * Math.PI * 2 + b.popProgress * 2;
            const dist = b.width * (0.2 + b.popProgress * 2.2);
            ctx.fillStyle = b.colorType === 'gold' || b.colorType === 'yellow' ? '#FFD700' : '#FFFFFF';
            ctx.globalAlpha = 1 - b.popProgress;
            ctx.beginPath();
            ctx.arc(b.x + Math.cos(ang) * dist, b.y + Math.sin(ang) * dist, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          return;
        }

        b.y += b.vy;
        b.x += b.vx + Math.sin(b.stringPhase) * b.wobbleAmp;
        b.stringPhase += b.stringSpeed;
        if (b.x < b.width) b.vx = Math.abs(b.vx);
        if (b.x > canvas.width - b.width) b.vx = -Math.abs(b.vx);

        ctx.save();
        // String
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.height / 2);
        const sx = b.x + Math.sin(b.stringPhase * 1.5) * 12;
        const sy = b.y + b.height / 2 + 55;
        ctx.bezierCurveTo(
          b.x - Math.sin(b.stringPhase) * 6, b.y + b.height / 2 + 20,
          b.x + Math.sin(b.stringPhase) * 6, b.y + b.height / 2 + 38,
          sx, sy
        );
        ctx.strokeStyle = 'rgba(212,175,55,0.42)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Knot
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y + b.height / 2);
        ctx.lineTo(b.x + 4, b.y + b.height / 2);
        ctx.lineTo(b.x, b.y + b.height / 2 - 3);
        ctx.closePath();
        ctx.fillStyle = b.colorType === 'gold' || b.colorType === 'yellow' ? '#DAA520'
                      : b.colorType === 'rose' ? '#F9A8D4' : '#CCCCCC';
        ctx.fill();

        // Gradient fill
        const g = ctx.createRadialGradient(
          b.x - b.width * 0.18, b.y - b.height * 0.18, b.width * 0.05,
          b.x, b.y, b.width
        );
        if (b.colorType === 'gold') {
          g.addColorStop(0, '#FFFCE6'); g.addColorStop(0.2, '#FFD700');
          g.addColorStop(0.8, '#D4AF37'); g.addColorStop(1, '#996515');
        } else if (b.colorType === 'yellow') {
          g.addColorStop(0, '#FFFFF2'); g.addColorStop(0.3, '#FFF68F');
          g.addColorStop(0.8, '#F4D03F'); g.addColorStop(1, '#9A7D0A');
        } else if (b.colorType === 'white') {
          g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.3, '#FDFCFA');
          g.addColorStop(0.8, '#EAE9E5'); g.addColorStop(1, '#BBBAB8');
        } else if (b.colorType === 'rose') {
          g.addColorStop(0, '#FFF0F3'); g.addColorStop(0.2, '#FECDD3');
          g.addColorStop(0.8, '#FB7185'); g.addColorStop(1, '#BE123C');
        } else {
          g.addColorStop(0, '#FFFDF0'); g.addColorStop(0.2, '#FFF8DC');
          g.addColorStop(0.8, '#F3E5AB'); g.addColorStop(1, '#B9A975');
        }

        // Balloon path
        ctx.beginPath();
        ctx.moveTo(b.x, b.y - b.height / 2);
        ctx.bezierCurveTo(
          b.x + b.width * 0.65, b.y - b.height * 0.48,
          b.x + b.width * 0.65, b.y + b.height * 0.28,
          b.x, b.y + b.height * 0.5
        );
        ctx.bezierCurveTo(
          b.x - b.width * 0.65, b.y + b.height * 0.28,
          b.x - b.width * 0.65, b.y - b.height * 0.48,
          b.x, b.y - b.height / 2
        );
        ctx.closePath();
        ctx.shadowColor = 'rgba(0,0,0,0.05)';
        ctx.shadowBlur = 16; ctx.shadowOffsetY = 12;
        ctx.fillStyle = g;
        ctx.fill();

        // Gloss highlight
        ctx.beginPath();
        ctx.ellipse(b.x - b.width * 0.16, b.y - b.height * 0.22,
          b.width * 0.13, b.height * 0.09, Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.46)';
        ctx.fill();
        ctx.restore();
      });

      // 4. Confetti
      for (let i = confettiRef.current.length - 1; i >= 0; i--) {
        const c = confettiRef.current[i];
        c.vy += c.gravity; c.x += c.vx + Math.sin(c.wobble) * 0.48; c.y += c.vy;
        c.wobble += c.wobbleSpeed; c.rotation += c.rotationSpeed;
        c.vx *= 0.985; c.vy *= 0.985;
        if (c.y > canvas.height - 180) c.opacity -= 0.015;
        if (c.opacity <= 0 || c.y > canvas.height + 30) { confettiRef.current.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = c.opacity;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        if (c.shape === 'rect') {
          ctx.fillRect(-c.size, -c.size / 1.5, c.size * 2, c.size * 1.2);
        } else if (c.shape === 'star') {
          drawStar(ctx, c.size);
        } else if (c.shape === 'ribbon') {
          ctx.beginPath();
          ctx.ellipse(0, 0, c.size, c.size * 0.35, c.rotation * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, c.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Clean up popped balloons
      balloonsRef.current = balloonsRef.current.filter(
        b => !(b.isPopping && b.popProgress >= 1.0) && b.y > -b.height - 80
      );

      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('birthday-confetti-explode', handleConfettiEvent);
      window.removeEventListener('birthday-ribbons', handleRibbonEvent);
      clearInterval(spawnTimer);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleInteraction = (clientX: number, clientY: number) => {
    balloonsRef.current.forEach((b) => {
      if (b.isPopping) return;
      const dx = clientX - b.x, dy = clientY - b.y;
      const rx = b.width * 0.52, ry = b.height * 0.52;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) {
        b.isPopping = true;
        musicEngine.playPopSound();
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full block z-0 cursor-default select-none pointer-events-auto"
      onMouseDown={(e) => handleInteraction(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches.length > 0)
          handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }}
    />
  );
}
