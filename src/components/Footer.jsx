import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(8, 9, 13, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '70px 0 35px',
      position: 'relative',
      zIndex: 5,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px',
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
              marginBottom: '18px',
            }}>
              <img
                src="/images/vyvy_avatar.jpg"
                alt="Vy Vy Flower"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1.5px solid #facc15',
                }}
              />
              <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Vy Vy
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                color: '#ffffff',
                padding: '2px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.8px',
              }}>
                FLOWER
              </span>
            </Link>

            <p style={{
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: 1.7,
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              Không gian sáng tạo hoa nghệ thuật đương đại và trải nghiệm thị giác vị lai. Mang đến những bó hoa độc bản cho những khoảnh khắc quý giá.
            </p>

            <div className="cross-marks">
              <span>x</span><span>x</span><span>x</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
              Khám Phá
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Trang Chủ</Link>
              <Link to="/products" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Bộ Sưu Tập Độc Bản</Link>
              <a href="/#workshop" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Workshop 3D Nghệ Thuật</a>
              <a href="/#services" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Đặc Quyền Dịch Vụ VIP</a>
              <Link to="/contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Đặt Hoa Theo Yêu Cầu</Link>
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
              Dịch Vụ Nghệ Thuật
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              <p>✦ Bó Hoa Thiết Kế Bespoke</p>
              <p>✦ Hoa Bình & Hoa Chậu Nghệ Nhân</p>
              <p>✦ Trang Trí Tiệc Cưới & Sự Kiện</p>
              <p>✦ Gói Hội Viên Doanh Nghiệp VIP</p>
              <p>✦ Giao Hoa Hỏa Tốc Xe Hơi 2H</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
              Liên Hệ Trực Tiếp
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <MapPin size={16} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>88 Đồng Khởi, Q1, TP. Hồ Chí Minh</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Phone size={16} color="#a3e635" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>0901 234 567 / 0988 765 432</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Mail size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>contact@mrstudio.art</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Clock size={16} color="#ec4899" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>08:00 - 21:30 hàng ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '13px',
        }}>
          <div>
            © 2026 MR.studio. All rights reserved. Designed with 3D Cyber Art.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              Quản Trị Admin
            </Link>
            <span>•</span>
            <Link to="/contact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              Chính Sách Bảo Mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
