import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock, Heart, ShieldCheck, Truck, ArrowRight, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px' }}>
        
        {/* Top Guarantee Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          paddingBottom: '40px',
          marginBottom: '46px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }} className="footer-top-ribbon">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(250, 204, 21, 0.12)',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              color: '#facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }} className="footer-feature-title">Hoa Tươi Tuyển Chọn</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>100% hoa mới nhập mỗi sáng</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(163, 230, 53, 0.12)',
              border: '1px solid rgba(163, 230, 53, 0.3)',
              color: '#a3e635',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }} className="footer-feature-title">Thiết Kế Độc Bản</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Sáng tạo riêng theo từng dịp</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }} className="footer-feature-title">Giao Hỏa Tốc Sóc Trăng</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Giao nhanh 1 - 2 giờ hẹn chuẩn</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.12)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }} className="footer-feature-title">Chụp Ảnh Xác Nhận</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Khách duyệt hoa trước khi gửi</div>
            </div>
          </div>
        </div>

        {/* 4 Main Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px',
        }}>
          {/* Brand Column */}
          <div>
            <Link to="/" style={{
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '16px',
            }}>
              <img
                src="/images/logo-white.png"
                alt="Vy Vy Flower - Tiệm Hoa Sóc Trăng"
                className="footer-logo-dark"
              />
              <img
                src="/images/logo.png"
                alt="Vy Vy Flower - Tiệm Hoa Sóc Trăng"
                className="footer-logo-light"
              />
            </Link>

            <div style={{ marginBottom: '14px' }}>
              <span className="footer-badge">
                <Sparkles size={13} />
                <span>Tiệm Hoa Tươi Sóc Trăng</span>
              </span>
            </div>

            <p className="footer-slogan" style={{
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: 1.7,
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              Nơi cảm xúc nở thành hoa, mang đến cho bạn độc bản cho những dịp đặc biệt của mình.
            </p>

            {/* Quick Contact Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#06b6d4',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                <MessageCircle size={15} />
                <span>Nhắn Zalo</span>
              </a>

              <a
                href="tel:0901234567"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: 'rgba(163, 230, 53, 0.15)',
                  border: '1px solid rgba(163, 230, 53, 0.35)',
                  color: '#a3e635',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                <Phone size={15} />
                <span>0901 234 567</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">
              Khám Phá
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/" className="footer-link">
                <ArrowRight size={14} style={{ opacity: 0.6 }} /> Trang Chủ
              </Link>
              <Link to="/products" className="footer-link">
                <ArrowRight size={14} style={{ opacity: 0.6 }} /> Bộ Sưu Tập Hoa Tươi
              </Link>
              <Link to="/products?category=rose" className="footer-link">
                <ArrowRight size={14} style={{ opacity: 0.6 }} /> Bó Hoa Thiết Kế Riêng
              </Link>
              <Link to="/products?category=special" className="footer-link">
                <ArrowRight size={14} style={{ opacity: 0.6 }} /> Hoa Khai Trương & Sự Kiện
              </Link>
              <Link to="/contact" className="footer-link">
                <ArrowRight size={14} style={{ opacity: 0.6 }} /> Đặt Hoa Theo Yêu Cầu
              </Link>
            </div>
          </div>

          {/* Dịch vụ & Cam kết */}
          <div>
            <h4 className="footer-heading">
              Đặc Quyền Dịch Vụ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#facc15' }}>✦</span>
                <span>Bó Hoa Thiết Kế Bespoke</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#a3e635' }}>✦</span>
                <span>Hoa Bình & Hộp Hoa Cao Cấp</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#06b6d4' }}>✦</span>
                <span>Trang Trí Hoa Tiệc Cưới & Sự Kiện</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#ec4899' }}>✦</span>
                <span>Miễn phí thiệp viết tay & nơ lụa thêu</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8' }}>✦</span>
                <span>Giao hỏa tốc 2H tại TP. Sóc Trăng</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading">
              Tiệm Hoa Sóc Trăng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="footer-contact-item">
                <MapPin size={17} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Cửa hàng trực tiếp:</div>
                  <div style={{ opacity: 0.85, marginTop: '2px' }}>TP. Sóc Trăng, Tỉnh Sóc Trăng</div>
                </div>
              </div>

              <div className="footer-contact-item">
                <Phone size={17} color="#a3e635" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Hotline / Zalo:</div>
                  <div style={{ opacity: 0.85, marginTop: '2px' }}>0901 234 567 / 0988 765 432</div>
                </div>
              </div>

              <div className="footer-contact-item">
                <Mail size={17} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Hòm thư tiếp nhận:</div>
                  <div style={{ opacity: 0.85, marginTop: '2px' }}>vyvyflower.soctrang@gmail.com</div>
                </div>
              </div>

              <div className="footer-contact-item">
                <Clock size={17} color="#ec4899" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Thời gian phục vụ:</div>
                  <div style={{ opacity: 0.85, marginTop: '2px' }}>07:30 - 21:30 hàng ngày (kể cả Lễ, Tết)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom-bar">
          <div>
            © 2026 <strong>Vy Vy Flower - Tiệm Hoa Sóc Trăng</strong>. Tất cả quyền được bảo lưu.
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>
              Sản Phẩm
            </Link>
            <span>•</span>
            <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>
              Liên Hệ & Đặt Hoa
            </Link>
            <span>•</span>
            <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
              Quản Trị Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
