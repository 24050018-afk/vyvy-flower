import React, { useEffect, useRef, useState } from 'react';

/* =====================================================
   FlowerCursor — 3D Floral cursor tracking component
   Renders an SVG bouquet that tilts & follows the mouse
   ===================================================== */

const PETALS = [
  { emoji: '🌸', size: 28, ox: -40, oy: -30, delay: 0 },
  { emoji: '🌹', size: 24, ox:  20, oy: -45, delay: 0.15 },
  { emoji: '🌺', size: 22, ox: -50, oy:  10, delay: 0.25 },
  { emoji: '🌷', size: 20, ox:  35, oy:  15, delay: 0.1 },
  { emoji: '💐', size: 32, ox:  -5, oy: -55, delay: 0.05 },
  { emoji: '🍃', size: 18, ox: -30, oy:  30, delay: 0.3 },
  { emoji: '🌿', size: 16, ox:  40, oy:  35, delay: 0.2 },
];

export default function FlowerCursor() {
  const cursorRef = useRef(null);
  const posRef = useRef({ x: -200, y: -200 });
  const currentRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [visible, setVisible] = useState(false);
  const prevPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Tilt based on velocity
      const dx = e.clientX - prevPos.current.x;
      const dy = e.clientY - prevPos.current.y;
      prevPos.current = { x: e.clientX, y: e.clientY };

      setTilt({
        rx: Math.max(-20, Math.min(20, -dy * 0.8)),
        ry: Math.max(-20, Math.min(20, dx * 0.8)),
      });
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // Smooth follow animation
    const animate = () => {
      const lerp = 0.12;
      currentRef.current.x += (posRef.current.x - currentRef.current.x) * lerp;
      currentRef.current.y += (posRef.current.y - currentRef.current.y) * lerp;

      if (cursorRef.current) {
        cursorRef.current.style.left = (currentRef.current.x - 18) + 'px';
        cursorRef.current.style.top  = (currentRef.current.y - 18) + 'px';
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        transformOrigin: 'center bottom',
        transform: `perspective(200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      {/* Stem */}
      <svg width="36" height="36" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="glowGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,75,139,0.6)" />
            <stop offset="100%" stopColor="rgba(255,75,139,0)" />
          </radialGradient>
        </defs>
        {/* Glow ring */}
        <circle cx="18" cy="18" r="16" fill="url(#glowGrad)" />
        {/* Flower emoji */}
        <text x="18" y="24" textAnchor="middle" fontSize="22" style={{ userSelect: 'none' }}>🌸</text>
      </svg>

      {/* Orbiting petals */}
      {PETALS.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 0, left: 0,
          fontSize: p.size,
          animation: `orbit-petal-${i} ${2.5 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
          transform: `translate(${p.ox}px, ${p.oy}px)`,
          transition: 'transform 0.3s ease',
          filter: 'drop-shadow(0 2px 6px rgba(255,75,139,0.5))',
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {p.emoji}
        </div>
      ))}

      <style>{`
        ${PETALS.map((p, i) => `
          @keyframes orbit-petal-${i} {
            0%,100% { transform: translate(${p.ox}px, ${p.oy}px) rotate(0deg) scale(1); }
            50%     { transform: translate(${p.ox + (i%2===0?6:-6)}px, ${p.oy - 8}px) rotate(${i%2===0?15:-15}deg) scale(1.15); }
          }
        `).join('')}
      `}</style>
    </div>
  );
}
