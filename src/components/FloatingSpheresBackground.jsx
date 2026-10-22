import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

/* ============================================================
   FloatingSpheresBackground & Responsive Hero Artwork
   Matches exact standards:
   - Full HD 1920 × 1080 px (16:9) for laptops & standard monitors
   - 2K / Retina 2560 × 1440 px (16:9) for ultra sharp displays
   - Mobile Hero 1080 × 1920 px (9:16 vertical) for smartphones
   - Preserves 3D floating glossy spheres, ambient glows & parallax
   ============================================================ */
export default function FloatingSpheresBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('vyvy_hero_theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    localStorage.setItem('vyvy_hero_theme', nextMode);
  };

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
      {/* 1. Base Dark Floor */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#07080a',
        zIndex: 0,
      }} />

      {/* 2. Responsive Hero & Page Background Picture */}
      <div
        className="global-hero-bg-container"
        style={{
          transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px) scale(1.04)`,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <picture className="global-hero-bg-picture">
          {/* Mobile Hero: 9:16 vertical (1080x1920) */}
          <source
            media="(max-width: 768px)"
            srcSet={themeMode === 'light' ? '/images/hero-bg-light-mobile-1080.jpg' : '/images/hero-bg-dark-mobile-1080.jpg'}
          />
          {/* High-res 2K / Retina (2560x1440) */}
          <source
            media="(min-width: 1920px) or (-webkit-min-device-pixel-ratio: 2)"
            srcSet={themeMode === 'light' ? '/images/hero-bg-light-2560.jpg' : '/images/hero-bg-dark-2560.jpg'}
          />
          {/* Standard Full HD Desktop / Laptop (1920x1080) */}
          <img
            src={themeMode === 'light' ? '/images/hero-bg-light-1920.jpg' : '/images/hero-bg-dark-1920.jpg'}
            alt="Vy Vy Flower Luxury Hero Background"
            className="global-hero-bg-img"
          />
        </picture>
      </div>

      {/* 3. Luxury Vignette & Contrast Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: themeMode === 'light'
            ? 'radial-gradient(ellipse at 50% 35%, rgba(10, 12, 18, 0.50) 0%, rgba(10, 12, 18, 0.35) 60%, rgba(10, 12, 18, 0.20) 100%)'
            : 'radial-gradient(ellipse at 50% 35%, rgba(12, 14, 20, 0.42) 0%, rgba(10, 11, 16, 0.68) 55%, rgba(7, 8, 10, 0.92) 100%)',
          zIndex: 2,
          transition: 'background 0.5s ease',
        }}
      />

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

      {/* Theme Switcher Pill (Interactive) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 99,
          pointerEvents: 'auto',
        }}
        className="hero-theme-toggle-container"
      >
        <button
          onClick={toggleTheme}
          title="Chuyển đổi giao diện hình nền Dạ Nguyệt / Nắng Sớm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '9999px',
            background: 'rgba(15, 17, 24, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.6)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(22, 25, 36, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(15, 17, 24, 0.82)';
          }}
        >
          {themeMode === 'light' ? (
            <>
              <Sun size={14} color="#facc15" />
              <span>Nền: Nắng Sớm (Gốc)</span>
            </>
          ) : (
            <>
              <Moon size={14} color="#38bdf8" />
              <span>Nền: Dạ Nguyệt Luxe</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
