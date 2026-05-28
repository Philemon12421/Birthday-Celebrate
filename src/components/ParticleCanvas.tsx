/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { musicEngine } from '../utils/audio';

interface CanvasBalloon {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  colorType: 'gold' | 'yellow' | 'white' | 'cream';
  stringPhase: number;
  stringSpeed: number;
  isPopping: boolean;
  popProgress: number; // 0 to 1
}

interface CanvasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  speedY: number;
  wobble: number;
  wobbleSpeed: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  gravity: number;
  wobble: number;
  wobbleSpeed: number;
  shape: 'circle' | 'rect' | 'star';
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const balloonsRef = useRef<CanvasBalloon[]>([]);
  const particlesRef = useRef<CanvasParticle[]>([]);
  const confettiRef = useRef<ConfettiParticle[]>([]);
  const nextBalloonId = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Handle container resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize ambient golden sparkle dust particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createSparkleParticle(true));
      }
    };

    const createSparkleParticle = (randomY = false): CanvasParticle => {
      return {
        x: Math.random() * window.innerWidth,
        y: randomY ? Math.random() * window.innerHeight : window.innerHeight + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.3), // Drifts gently upward
        size: Math.random() * 2.5 + 1.2,
        color: Math.random() > 0.4 ? '#FFD700' : '#FFFDF0', // Gold or soft white
        alpha: Math.random() * 0.5 + 0.3,
        speedY: -(Math.random() * 0.5 + 0.3),
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.005,
      };
    };

    // Helper to spawn a classic confetti splash
    const spawnSplashConfetti = (originX: number, originY: number) => {
      const colors = [
        '#FF3366', // Hot pink-rose gold
        '#FDFFB6', // Soft luxury yellow
        '#FFD166', // Pure shiny gold
        '#06D6A0', // Emerald shimmer
        '#118AB2', // Ocean teal
        '#FFF',    // Pearl white
        '#D4AF37', // Pure premium gold
        '#FF9F1C', // Amber bronze
        '#C0C0C0'  // Silver metallic
      ];
      const shapes: ('circle' | 'rect' | 'star')[] = ['rect', 'circle', 'star'];
      
      // Spawn 160 vivid floating physical confetti flakes
      for (let i = 0; i < 160; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 9 + 3.5; // High initial explosion thrust
        
        confettiRef.current.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(angle) * velocity - (Math.random() * 5 + 3), // Bias skyward
          size: Math.random() * 6.5 + 3.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.28,
          opacity: 1.0,
          gravity: 0.18, // Slow floaty downward gravity drop
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.08 + 0.03,
          shape: shapes[Math.floor(Math.random() * shapes.length)]
        });
      }
    };

    // Global custom event action handler
    const handleConfettiExplodeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ x?: number; y?: number } | undefined>;
      const x = customEvent.detail?.x ?? window.innerWidth / 2;
      const y = customEvent.detail?.y ?? window.innerHeight / 2 - 100;
      spawnSplashConfetti(x, y);
    };

    window.addEventListener('birthday-confetti-explode', handleConfettiExplodeEvent);

    // Helper to spawn a single balloon
    const spawnBalloon = (initialY = false): CanvasBalloon => {
      const types: ('gold' | 'yellow' | 'white' | 'cream')[] = ['gold', 'yellow', 'white', 'cream'];
      const colorType = types[Math.floor(Math.random() * types.length)];
      
      const width = Math.random() * 15 + 38; // 38 to 53 wide
      const height = width * 1.25; // elegant proportional shape

      return {
        id: nextBalloonId.current++,
        x: Math.random() * (window.innerWidth - 80) + 40,
        y: initialY ? Math.random() * (window.innerHeight - 100) + 100 : window.innerHeight + 60,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.5 + 0.45), // slow drift
        width,
        height,
        colorType,
        stringPhase: Math.random() * Math.PI * 2,
        stringSpeed: Math.random() * 0.015 + 0.005,
        isPopping: false,
        popProgress: 0,
      };
    };

    // Populate initial balloons spread across height
    const initBalloons = () => {
      balloonsRef.current = [];
      const count = Math.min(5, Math.floor(window.innerWidth / 250) + 2);
      for (let i = 0; i < count; i++) {
        balloonsRef.current.push(spawnBalloon(true));
      }
    };

    initParticles();
    initBalloons();

    // Spawn a new balloon strictly if count drops
    const spawnTimer = setInterval(() => {
      if (balloonsRef.current.filter(b => !b.isPopping).length < 6) {
        balloonsRef.current.push(spawnBalloon(false));
      }
    }, 4500);

    // Animation Tick
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- 1. RENDER AMBIENT GOLD SPARKLES IN BACKGROUND ---
      particlesRef.current.forEach((p, idx) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 0.25;
        p.wobble += p.wobbleSpeed;

        // Soft flicker glow
        const currentAlpha = p.alpha * (0.6 + Math.sin(p.wobble * 2) * 0.4);

        ctx.save();
        ctx.shadowBlur = p.size * 2.5;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Recycle particles that move off-screen
        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
          particlesRef.current[idx] = createSparkleParticle(false);
        }
      });

      // --- 2. RENDER DRIFTING BALLOONS ---
      balloonsRef.current.forEach((b) => {
        if (b.isPopping) {
          // Render pop shockwave and explode confetti shards
          b.popProgress += 0.08;
          
          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.width * (1 + b.popProgress * 1.5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 215, 0, ${1 - b.popProgress})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Spark particles splashing out
          for (let s = 0; s < 12; s++) {
            const angle = (s / 12) * Math.PI * 2 + b.popProgress * 2;
            const distance = b.width * (0.2 + b.popProgress * 2.2);
            const px = b.x + Math.cos(angle) * distance;
            const py = b.y + Math.sin(angle) * distance;
            
            ctx.fillStyle = b.colorType === 'gold' || b.colorType === 'yellow' ? '#FFD700' : '#FFFFFF';
            ctx.globalAlpha = 1 - b.popProgress;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          return;
        }

        // Standard floating update
        b.y += b.vy;
        b.x += b.vx + Math.sin(b.stringPhase) * 0.18;
        b.stringPhase += b.stringSpeed;

        // Boundary checks
        if (b.x < b.width) b.vx = Math.abs(b.vx);
        if (b.x > canvas.width - b.width) b.vx = -Math.abs(b.vx);

        ctx.save();

        // Draw Balloon Wavy String
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.height / 2);
        // Animate a swaying string ending
        const sx = b.x + Math.sin(b.stringPhase * 1.5) * 12;
        const sy = b.y + b.height / 2 + 55;
        const cx1 = b.x - Math.sin(b.stringPhase) * 6;
        const cy1 = b.y + b.height / 2 + 20;
        ctx.bezierCurveTo(cx1, cy1, b.x + Math.sin(b.stringPhase) * 6, b.y + b.height / 2 + 38, sx, sy);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Elegant tiny balloon tie knot at bottom
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y + b.height / 2);
        ctx.lineTo(b.x + 4, b.y + b.height / 2);
        ctx.lineTo(b.x, b.y + b.height / 2 - 3);
        ctx.closePath();
        ctx.fillStyle = b.colorType === 'gold' || b.colorType === 'yellow' ? '#DAA520' : '#CCCCCC';
        ctx.fill();

        // Generate luxury 3D dimensional gradient lighting
        const grad = ctx.createRadialGradient(
          b.x - b.width * 0.18, b.y - b.height * 0.18, b.width * 0.05,
          b.x, b.y, b.width
        );

        if (b.colorType === 'gold') {
          grad.addColorStop(0, '#FFFCE6'); // glistening highlight
          grad.addColorStop(0.2, '#FFD700'); // premium gold
          grad.addColorStop(0.8, '#D4AF37'); // rich mid-gold
          grad.addColorStop(1, '#996515'); // shadow metallic base
        } else if (b.colorType === 'yellow') {
          grad.addColorStop(0, '#FFFFF2');
          grad.addColorStop(0.3, '#FFF68F');
          grad.addColorStop(0.8, '#F4D03F');
          grad.addColorStop(1, '#9A7D0A');
        } else if (b.colorType === 'white') {
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.3, '#FDFCFA');
          grad.addColorStop(0.8, '#EAE9E5');
          grad.addColorStop(1, '#BBBAB8');
        } else { // Cream
          grad.addColorStop(0, '#FFFDF0');
          grad.addColorStop(0.2, '#FFF8DC');
          grad.addColorStop(0.8, '#F3E5AB');
          grad.addColorStop(1, '#B9A975');
        }

        // Core visual path: Elegant pear-shaped balloon vector
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

        // Apply luxury dropshadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 12;

        ctx.fillStyle = grad;
        ctx.fill();

        // Smooth subtle gloss white highlight overlay on the top left
        ctx.beginPath();
        ctx.ellipse(
          b.x - b.width * 0.16,
          b.y - b.height * 0.22,
          b.width * 0.12,
          b.height * 0.08,
          Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fill();

        ctx.restore();
      });

      // --- 3. RENDER GRAVITY-BOUND ACTIVE CONFETTI ---
      const activeConfetti = confettiRef.current;
      for (let idx = activeConfetti.length - 1; idx >= 0; idx--) {
        const c = activeConfetti[idx];
        
        // Apply physics
        c.vy += c.gravity;
        c.x += c.vx + Math.sin(c.wobble) * 0.45;
        c.y += c.vy;
        c.wobble += c.wobbleSpeed;
        c.rotation += c.rotationSpeed;

        // Friction dampening
        c.vx *= 0.985;
        c.vy *= 0.985;

        // Graceful alpha fadeout as it gets close to bottom half
        if (c.y > canvas.height - 180) {
          c.opacity -= 0.015;
        }

        if (c.opacity <= 0 || c.y > canvas.height + 25 || c.x < -40 || c.x > canvas.width + 40) {
          activeConfetti.splice(idx, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = c.opacity;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;

        // Draw depending on custom geometric shape
        if (c.shape === 'rect') {
          ctx.fillRect(-c.size, -c.size / 1.5, c.size * 2, c.size * 1.2);
        } else if (c.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * c.size, Math.sin((18 + s * 72) * Math.PI / 180) * c.size);
            ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (c.size / 2.5), Math.sin((54 + s * 72) * Math.PI / 180) * (c.size / 2.5));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, c.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Clear popped balloons once finished animation
      balloonsRef.current = balloonsRef.current.filter(
        (b) => !(b.isPopping && b.popProgress >= 1.0) && b.y > -b.height - 80
      );

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup routines
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('birthday-confetti-explode', handleConfettiExplodeEvent);
      clearInterval(spawnTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Click & Touch listeners: Detect click directly on balloon body
  const handleInteraction = (clientX: number, clientY: number) => {
    let poppedAny = false;
    balloonsRef.current.forEach((b) => {
      if (b.isPopping) return;

      // Distance checking inside pear shape approximating box
      const dx = clientX - b.x;
      const dy = clientY - b.y;
      
      // Ellipse formula check
      const radiusX = b.width * 0.52;
      const radiusY = b.height * 0.52;
      const isInside = (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1.0;

      if (isInside) {
        b.isPopping = true;
        poppedAny = true;
        musicEngine.playPopSound();
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  return (
    <canvas
      id="birthday-particle-canvas"
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full block z-0 cursor-default select-none pointer-events-auto"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    />
  );
}
