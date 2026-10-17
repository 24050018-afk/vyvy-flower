import React, { useEffect, useRef } from 'react';

/* ============================================================
   PetalCanvas — Luxury Organic Floral Petals Engine
   100% Vector Canvas drawing (No cartoon emojis).
   Simulates authentic 3D tumbling sakura & rose petals with
   soft silk gradients, depth-of-field, and breeze physics.
   ============================================================ */

const PETAL_PALETTES = [
  // Sakura Soft Pink
  { tip: 'rgba(255, 192, 203, 0.75)', base: 'rgba(244, 114, 182, 0.55)', edge: 'rgba(255, 230, 240, 0.2)' },
  // Deep Velvet Rose
  { tip: 'rgba(251, 113, 133, 0.7)', base: 'rgba(225, 29, 72, 0.5)', edge: 'rgba(255, 228, 230, 0.15)' },
  // Golden Ambient Blossom
  { tip: 'rgba(253, 224, 71, 0.65)', base: 'rgba(245, 158, 11, 0.45)', edge: 'rgba(254, 240, 138, 0.2)' },
  // Lavender Orchid Petal
  { tip: 'rgba(216, 180, 254, 0.7)', base: 'rgba(168, 85, 247, 0.45)', edge: 'rgba(243, 232, 255, 0.15)' },
];

function createOrganicPetal(canvas) {
  const palette = PETAL_PALETTES[Math.floor(Math.random() * PETAL_PALETTES.length)];
  const size = 10 + Math.random() * 16;
  const depth = 0.5 + Math.random() * 0.7; // Depth factor: 0.5 = far/small/translucent, 1.2 = near/crisp

  return {
    x: Math.random() * canvas.width,
    y: -30 - Math.random() * 100,
    width: size * (0.7 + Math.random() * 0.4) * depth,
    height: size * (1.2 + Math.random() * 0.6) * depth,
    speedY: (0.7 + Math.random() * 1.1) * depth,
    speedX: (Math.random() - 0.5) * 0.6,
    swaySpeed: 0.015 + Math.random() * 0.02,
    swayAmp: 1.2 + Math.random() * 2.0,
    swayOffset: Math.random() * Math.PI * 2,
    flip: Math.random() * Math.PI * 2,
    flipSpeed: 0.02 + Math.random() * 0.03,
    roll: Math.random() * Math.PI * 2,
    rollSpeed: (Math.random() - 0.5) * 0.02,
    palette,
    opacity: (0.35 + Math.random() * 0.45) * depth,
  };
}

export default function PetalCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let petals = [];
    let animId;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initial 14 subtle luxury petals
    for (let i = 0; i < 14; i++) {
      const p = createOrganicPetal(canvas);
      p.y = Math.random() * canvas.height;
      petals.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Slowly spawn new petals (max 20 to keep it very minimal, peaceful and elegant)
      if (frame % 80 === 0 && petals.length < 20) {
        petals.push(createOrganicPetal(canvas));
      }

      petals = petals.filter(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.swayOffset + frame * p.swaySpeed) * p.swayAmp;
        p.flip += p.flipSpeed;
        p.roll += p.rollSpeed;

        // 3D perspective flip (simulates organic petal fluttering in gentle breeze)
        const flipX = Math.cos(p.flip);
        const flipY = Math.cos(p.roll * 0.7);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.roll);
        ctx.scale(Math.abs(flipX) * 0.75 + 0.25, Math.abs(flipY) * 0.5 + 0.5);

        // Draw organic curved petal with linear gradient
        ctx.beginPath();
        const w = p.width;
        const h = p.height;

        ctx.moveTo(0, -h * 0.5);
        // Left petal curve with subtle notch
        ctx.bezierCurveTo(-w * 0.7, -h * 0.25, -w * 0.6, h * 0.35, 0, h * 0.5);
        // Right petal curve
        ctx.bezierCurveTo(w * 0.6, h * 0.35, w * 0.7, -h * 0.25, 0, -h * 0.5);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
        grad.addColorStop(0, p.palette.tip);
        grad.addColorStop(0.65, p.palette.base);
        grad.addColorStop(1, p.palette.edge);

        ctx.fillStyle = grad;
        ctx.shadowColor = p.palette.base;
        ctx.shadowBlur = 6;
        ctx.fill();

        ctx.restore();

        return p.y < canvas.height + 50 && p.x > -50 && p.x < canvas.width + 50;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.8,
      }}
    />
  );
}
