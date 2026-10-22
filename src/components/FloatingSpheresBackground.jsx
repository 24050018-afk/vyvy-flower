import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

/* ============================================================
   FloatingSpheresBackground & Responsive Hero Artwork
   Matches exact standards:
   - Full HD 1920 × 1080 px (16:9) for laptops & standard monitors
   - 2K / Retina 2560 × 1440 px (16:9) for ultra sharp displays
   - Mobile Hero 1080 × 1920 px (9:16 vertical) for smartphones
   - Beautiful Light Floral Atelier (White / Ivory) & Dark Luxe
   - Preserves 3D floating glossy spheres, ambient glows & parallax
   ============================================================ */
export default function FloatingSpheresBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('vyvy_hero_theme') || 'light';
  });

  const isLight = themeMode === 'light';

  const toggleTheme = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    localStorage.setItem('vyvy_hero_theme', nextMode);
  };

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('theme-light-floral');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('theme-light-floral');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [isLight]);

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
      {/* 1. Base Canvas Floor */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: isLight ? '#faf8f5' : '#07080a',
        zIndex: 0,
        transition: 'background 0.5s ease',
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
            srcSet={isLight ? '/images/hero-bg-light-mobile-1080.jpg' : '/images/hero-bg-dark-mobile-1080.jpg'}
          />
          {/* High-res 2K / Retina (2560x1440) */}
          <source
            media="(min-width: 1920px) or (-webkit-min-device-pixel-ratio: 2)"
            srcSet={isLight ? '/images/hero-bg-light-2560.jpg' : '/images/hero-bg-dark-2560.jpg'}
          />
          {/* Standard Full HD Desktop / Laptop (1920x1080) */}
          <img
            src={isLight ? '/images/hero-bg-light-1920.jpg' : '/images/hero-bg-dark-1920.jpg'}
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
          background: isLight
            ? 'radial-gradient(ellipse at 50% 25%, rgba(255, 255, 255, 0.28) 0%, rgba(253, 250, 245, 0.50) 55%, rgba(246, 240, 230, 0.80) 100%)'
            : 'radial-gradient(ellipse at 50% 35%, rgba(12, 14, 20, 0.42) 0%, rgba(10, 11, 16, 0.68) 55%, rgba(7, 8, 10, 0.92) 100%)',
          zIndex: 2,
          transition: 'background 0.5s ease',
        }}
      />

      {/* 4. Ambient color light glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(245, 158, 11, 0.09) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 65%)',
        filter: 'blur(70px)',
      }} />

      <div style={{
        position: 'absolute',
        top: '30%',
        left: '-5%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle, rgba(236, 72, 153, 0.07) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      {/* =======================================================
          3D GLOSSY SPHERES (Customized for Luxury Floral Theme)
          ======================================================= */}

      {/* 1. TOP CENTER SPHERE: Rose Quartz in Light, Lime in Dark */}
      <div style={{
        position: 'absolute',
        top: '6%',
        left: '52%',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle at 35% 30%, #ffffff 0%, #fce7f3 22%, #f472b6 58%, #db2777 90%, #831843 100%)'
          : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #d9f99d 18%, #84cc16 55%, #3f6212 90%, #1a2e05 100%)',
        boxShadow: isLight
          ? `
            inset -6px -6px 14px rgba(190, 24, 93, 0.4),
            inset 6px 6px 14px rgba(255, 255, 255, 0.95),
            0 16px 36px rgba(225, 29, 72, 0.22),
            0 0 25px rgba(244, 114, 182, 0.35)
          `
          : `
            inset -8px -8px 18px rgba(0, 0, 0, 0.7),
            inset 6px 6px 14px rgba(255, 255, 255, 0.85),
            0 16px 36px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(132, 204, 22, 0.35)
          `,
        transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`,
        transition: 'transform 0.3s ease-out, background 0.5s ease',
        animation: 'float-sphere-1 5s ease-in-out infinite',
        zIndex: 3,
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

      {/* 2. LEFT LARGE SPHERE: Crystal Opal Dewdrop in Light, Cyan & Magenta in Dark */}
      <div style={{
        position: 'absolute',
        top: '38%',
        left: '12%',
        width: '88px',
        height: '88px',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle at 32% 28%, #ffffff 0%, #e0f2fe 25%, #38bdf8 52%, #ec4899 82%, #701a75 100%)'
          : 'radial-gradient(circle at 32% 28%, #ffffff 0%, #67e8f9 22%, #06b6d4 50%, #ec4899 82%, #4a044e 100%)',
        boxShadow: isLight
          ? `
            inset -8px -8px 18px rgba(112, 26, 117, 0.4),
            inset 8px 8px 18px rgba(255, 255, 255, 0.95),
            0 20px 45px rgba(56, 189, 248, 0.22),
            0 0 35px rgba(236, 72, 153, 0.28)
          `
          : `
            inset -10px -10px 22px rgba(0, 0, 0, 0.75),
            inset 8px 8px 18px rgba(255, 255, 255, 0.9),
            0 24px 50px rgba(0, 0, 0, 0.65),
            0 0 40px rgba(6, 182, 212, 0.35)
          `,
        transform: `translate(${mousePos.x * 22}px, ${mousePos.y * 22}px)`,
        transition: 'transform 0.35s ease-out, background 0.5s ease',
        animation: 'float-sphere-2 6s ease-in-out infinite',
        zIndex: 3,
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

      {/* 3. LEFT LOWER SPHERE: Peachy Sunrise Pearl */}
      <div style={{
        position: 'absolute',
        top: '48%',
        left: '10%',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ffedd5 28%, #fb923c 65%, #c2410c 100%)'
          : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #fbcfe8 25%, #f43f5e 65%, #881337 100%)',
        boxShadow: isLight
          ? `
            inset -4px -4px 10px rgba(194, 65, 12, 0.4),
            inset 4px 4px 8px rgba(255, 255, 255, 0.9),
            0 10px 24px rgba(251, 146, 60, 0.25),
            0 0 20px rgba(251, 146, 60, 0.3)
          `
          : `
            inset -4px -4px 10px rgba(0, 0, 0, 0.7),
            inset 4px 4px 8px rgba(255, 255, 255, 0.8),
            0 10px 24px rgba(0, 0, 0, 0.55),
            0 0 20px rgba(244, 63, 94, 0.3)
          `,
        transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
        transition: 'transform 0.25s ease-out, background 0.5s ease',
        animation: 'float-sphere-3 4.5s ease-in-out infinite',
        zIndex: 3,
      }} />

      {/* 4. RIGHT SPHERE: Golden Amber Citrine in Light, Coral Rose in Dark */}
      <div style={{
        position: 'absolute',
        top: '48%',
        right: '12%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle at 35% 28%, #ffffff 0%, #fef3c7 24%, #f59e0b 58%, #b45309 90%, #78350f 100%)'
          : 'radial-gradient(circle at 35% 28%, #ffffff 0%, #fed7aa 20%, #fb7185 55%, #e11d48 85%, #4c0519 100%)',
        boxShadow: isLight
          ? `
            inset -6px -6px 16px rgba(120, 53, 15, 0.4),
            inset 6px 6px 14px rgba(255, 255, 255, 0.9),
            0 18px 40px rgba(245, 158, 11, 0.25),
            0 0 35px rgba(245, 158, 11, 0.3)
          `
          : `
            inset -8px -8px 18px rgba(0, 0, 0, 0.7),
            inset 6px 6px 14px rgba(255, 255, 255, 0.85),
            0 18px 40px rgba(0, 0, 0, 0.6),
            0 0 35px rgba(251, 113, 133, 0.35)
          `,
        transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -18}px)`,
        transition: 'transform 0.3s ease-out, background 0.5s ease',
        animation: 'float-sphere-4 5.5s ease-in-out infinite',
        zIndex: 3,
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

      {/* 5. BOTTOM RIGHT SPHERE: Mint Jade Dewdrop */}
      <div style={{
        position: 'absolute',
        top: '56%',
        right: '9%',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: isLight
          ? 'radial-gradient(circle at 35% 30%, #ffffff 0%, #d1fae5 28%, #34d399 68%, #047857 100%)'
          : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #bef264 25%, #65a30d 70%, #1a2e05 100%)',
        boxShadow: isLight
          ? `
            inset -3px -3px 8px rgba(4, 120, 87, 0.4),
            inset 3px 3px 6px rgba(255, 255, 255, 0.9),
            0 8px 20px rgba(52, 211, 153, 0.25),
            0 0 15px rgba(52, 211, 153, 0.3)
          `
          : `
            inset -4px -4px 8px rgba(0, 0, 0, 0.7),
            inset 3px 3px 6px rgba(255, 255, 255, 0.85),
            0 8px 20px rgba(0, 0, 0, 0.5),
            0 0 15px rgba(101, 163, 13, 0.3)
          `,
        transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
        transition: 'transform 0.25s ease-out, background 0.5s ease',
        animation: 'float-sphere-1 4s ease-in-out infinite',
        zIndex: 3,
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
        color: isLight ? 'rgba(180, 130, 110, 0.38)' : 'rgba(255, 255, 255, 0.18)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '2px',
        fontFamily: 'monospace',
        zIndex: 2,
      }}>
        <span>x</span><span>x</span><span>x</span>
      </div>

      <div style={{
        position: 'absolute',
        top: '53%',
        right: '18%',
        display: 'flex',
        gap: '8px',
        color: isLight ? 'rgba(180, 130, 110, 0.38)' : 'rgba(255, 255, 255, 0.18)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '2px',
        fontFamily: 'monospace',
        zIndex: 2,
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
        opacity: isLight ? 0.35 : 0.2,
        zIndex: 2,
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: isLight ? '#e11d48' : '#fff' }} />
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '20%',
        display: 'flex',
        gap: '10px',
        color: isLight ? 'rgba(180, 130, 110, 0.3)' : 'rgba(255, 255, 255, 0.14)',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'monospace',
        zIndex: 2,
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
          title="Chuyển đổi giao diện Nền Sáng Hoa Tươi / Dạ Nguyệt Luxe"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '9999px',
            background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 17, 24, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isLight ? '1px solid rgba(225, 215, 200, 0.85)' : '1px solid rgba(255, 255, 255, 0.14)',
            color: isLight ? '#1c1917' : '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: isLight
              ? '0 8px 24px rgba(100, 70, 50, 0.12)'
              : '0 8px 24px rgba(0, 0, 0, 0.45)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#e11d48';
            e.currentTarget.style.transform = 'translateY(-2px)';
            if (isLight) {
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(225, 29, 72, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isLight ? 'rgba(225, 215, 200, 0.85)' : 'rgba(255, 255, 255, 0.14)';
            e.currentTarget.style.transform = 'translateY(0)';
            if (isLight) {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(100, 70, 50, 0.12)';
            }
          }}
        >
          {isLight ? (
            <>
              <Sun size={15} color="#e11d48" />
              <span>Nền Sáng: Hoa Tươi Tinh Khôi</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#38bdf8" />
              <span>Nền Tối: Dạ Nguyệt Luxe</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
