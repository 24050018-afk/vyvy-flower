import React, { useEffect, useState } from 'react';

/* ============================================================
   FloatingSpheresBackground
   Matches the exact 3D floating glossy spheres, golden halo ring,
   and dot grid matrix from the reference design.
   Includes the customized 3D Vy Vy Flower shop avatar inside
   the spinning golden ring.
   ============================================================ */
export default function FloatingSpheresBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {/* Deep subtle background gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 20%, #161824 0%, #0c0d12 60%, #07080a 100%)',
      }} />

      {/* Ambient color light glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 65%)',
        filter: 'blur(70px)',
      }} />

      <div style={{
        position: 'absolute',
        top: '30%',
        left: '-5%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />



      {/* =======================================================
          3D GLOSSY SPHERES (Matched to positions in the image)
          ======================================================= */}

      {/* 1. TOP CENTER SPHERE: Lime green glossy sphere */}
      <div style={{
        position: 'absolute',
        top: '6%',
        left: '52%',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #d9f99d 18%, #84cc16 55%, #3f6212 90%, #1a2e05 100%)',
        boxShadow: `
          inset -8px -8px 18px rgba(0, 0, 0, 0.7),
          inset 6px 6px 14px rgba(255, 255, 255, 0.85),
          0 16px 36px rgba(0, 0, 0, 0.6),
          0 0 30px rgba(132, 204, 22, 0.35)
        `,
        transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`,
        transition: 'transform 0.3s ease-out',
        animation: 'float-sphere-1 5s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute',
          top: '18%',
          left: '25%',
          width: '14px',
          height: '8px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.95)',
          transform: 'rotate(-30deg)',
          filter: 'blur(0.5px)',
        }} />
      </div>

      {/* 2. LEFT LARGE SPHERE: Iridescent Cyan & Magenta */}
      <div style={{
        position: 'absolute',
        top: '38%',
        left: '12%',
        width: '88px',
        height: '88px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 32% 28%, #ffffff 0%, #67e8f9 22%, #06b6d4 50%, #ec4899 82%, #4a044e 100%)',
        boxShadow: `
          inset -10px -10px 22px rgba(0, 0, 0, 0.75),
          inset 8px 8px 18px rgba(255, 255, 255, 0.9),
          0 24px 50px rgba(0, 0, 0, 0.65),
          0 0 40px rgba(6, 182, 212, 0.35)
        `,
        transform: `translate(${mousePos.x * 22}px, ${mousePos.y * 22}px)`,
        transition: 'transform 0.35s ease-out',
        animation: 'float-sphere-2 6s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '26%',
          width: '18px',
          height: '10px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.95)',
          transform: 'rotate(-35deg)',
        }} />
      </div>

      {/* 3. LEFT LOWER SPHERE: Peach / Pink glossy mini sphere */}
      <div style={{
        position: 'absolute',
        top: '48%',
        left: '10%',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #fbcfe8 25%, #f43f5e 65%, #881337 100%)',
        boxShadow: `
          inset -4px -4px 10px rgba(0, 0, 0, 0.7),
          inset 4px 4px 8px rgba(255, 255, 255, 0.8),
          0 10px 24px rgba(0, 0, 0, 0.55),
          0 0 20px rgba(244, 63, 94, 0.3)
        `,
        transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
        transition: 'transform 0.25s ease-out',
        animation: 'float-sphere-3 4.5s ease-in-out infinite',
      }} />

      {/* 4. RIGHT SPHERE: Coral / Rose sphere with bright rim light */}
      <div style={{
        position: 'absolute',
        top: '48%',
        right: '12%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 28%, #ffffff 0%, #fed7aa 20%, #fb7185 55%, #e11d48 85%, #4c0519 100%)',
        boxShadow: `
          inset -8px -8px 18px rgba(0, 0, 0, 0.7),
          inset 6px 6px 14px rgba(255, 255, 255, 0.85),
          0 18px 40px rgba(0, 0, 0, 0.6),
          0 0 35px rgba(251, 113, 133, 0.35)
        `,
        transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -18}px)`,
        transition: 'transform 0.3s ease-out',
        animation: 'float-sphere-4 5.5s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '26%',
          width: '12px',
          height: '7px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.9)',
          transform: 'rotate(-30deg)',
        }} />
      </div>

      {/* 5. BOTTOM RIGHT SPHERE: Tiny Lime green accent sphere */}
      <div style={{
        position: 'absolute',
        top: '56%',
        right: '9%',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #bef264 25%, #65a30d 70%, #1a2e05 100%)',
        boxShadow: `
          inset -4px -4px 8px rgba(0, 0, 0, 0.7),
          inset 3px 3px 6px rgba(255, 255, 255, 0.85),
          0 8px 20px rgba(0, 0, 0, 0.5),
          0 0 15px rgba(101, 163, 13, 0.3)
        `,
        transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
        transition: 'transform 0.25s ease-out',
        animation: 'float-sphere-1 4s ease-in-out infinite',
      }} />

      {/* =======================================================
          DOT MATRIX & CROSS MARKS (x x x) DECOR
          ======================================================= */}
      <div style={{
        position: 'absolute',
        top: '43%',
        left: '20%',
        display: 'flex',
        gap: '8px',
        color: 'rgba(255, 255, 255, 0.18)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '2px',
        fontFamily: 'monospace',
      }}>
        <span>x</span><span>x</span><span>x</span>
      </div>

      <div style={{
        position: 'absolute',
        top: '53%',
        right: '18%',
        display: 'flex',
        gap: '8px',
        color: 'rgba(255, 255, 255, 0.18)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '2px',
        fontFamily: 'monospace',
      }}>
        <span>x</span><span>x</span><span>x</span>
      </div>

      <div style={{
        position: 'absolute',
        top: '36%',
        right: '25%',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 6px)',
        gap: '8px',
        opacity: 0.2,
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#fff' }} />
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '20%',
        display: 'flex',
        gap: '10px',
        color: 'rgba(255, 255, 255, 0.14)',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'monospace',
      }}>
        <span>x</span><span>x</span><span>x</span><span>x</span>
      </div>
    </div>
  );
}
