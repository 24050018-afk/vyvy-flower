import React, { useRef, useEffect } from 'react';

/* ============================================================
   Card3D — wraps children in a 3D tilt card on mouse hover
   ============================================================ */
export default function Card3D({ children, style, className, intensity = 15 }) {
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const glowRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const currentRef = useRef({ rx: 0, ry: 0, gx: 50, gy: 50 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxX = rect.width / 2;
      const maxY = rect.height / 2;
      targetRef.current.ry = (dx / maxX) * intensity;
      targetRef.current.rx = -(dy / maxY) * intensity;
      targetRef.current.gx = ((e.clientX - rect.left) / rect.width) * 100;
      targetRef.current.gy = ((e.clientY - rect.top)  / rect.height) * 100;
    };

    const onLeave = () => {
      targetRef.current = { rx: 0, ry: 0, gx: 50, gy: 50 };
    };

    const animate = () => {
      const lerp = 0.1;
      const c = currentRef.current;
      const t = targetRef.current;
      c.rx += (t.rx - c.rx) * lerp;
      c.ry += (t.ry - c.ry) * lerp;
      c.gx += (t.gx - c.gx) * lerp;
      c.gy += (t.gy - c.gy) * lerp;

      if (innerRef.current) {
        innerRef.current.style.transform =
          `perspective(800px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) translateZ(10px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(circle at ${c.gx}% ${c.gy}%, rgba(250, 204, 21, 0.14) 0%, transparent 65%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return (
    <div ref={cardRef} style={{ position: 'relative', ...style }} className={className}>
      {/* Glow overlay */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none', zIndex: 1,
          transition: 'background 0.05s',
        }}
      />
      <div
        ref={innerRef}
        style={{
          width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.05s',
          willChange: 'transform',
          position: 'relative', zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
}
