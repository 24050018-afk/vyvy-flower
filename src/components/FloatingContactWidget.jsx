import React, { useState } from 'react';
import { Phone, MessageCircle, X, Sparkles } from 'lucide-react';

export default function FloatingContactWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 90,
      fontFamily: 'inherit',
    }}>
      {/* Expanded popover */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: '68px',
          right: '0',
          width: '280px',
          background: 'rgba(18, 20, 29, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(250, 204, 21, 0.35)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(250, 204, 21, 0.15)',
          animation: 'fadeInUp 0.25s ease-out',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#facc15', fontWeight: 800, letterSpacing: '0.5px' }}>
                VY VY FLORIST
              </span>
              <Sparkles size={13} style={{ color: '#facc15' }} />
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5 }}>
            Cần tư vấn thiết kế mẫu hoa độc bản hoặc giao hoa gấp 2 giờ?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Zalo Button */}
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#06b6d4',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#06b6d4',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '11px',
              }}>
                Zalo
              </div>
              <span>Nhắn Zalo Tư Vấn</span>
            </a>

            {/* Hotline Phone */}
            <a
              href="tel:0901234567"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'rgba(163, 230, 53, 0.15)',
                border: '1px solid rgba(163, 230, 53, 0.35)',
                color: '#a3e635',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#a3e635',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Phone size={14} />
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 500 }}>Hotline 24/7</div>
                <div>0901.234.567</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        title="Tư vấn đặt hoa trực tiếp"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
          border: '2px solid rgba(250, 204, 21, 0.6)',
          boxShadow: '0 8px 30px rgba(245, 158, 11, 0.45)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: open ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
