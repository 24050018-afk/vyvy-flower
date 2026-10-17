import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { User, MessageSquare, ShoppingBag, Sparkles, Menu, X, Shield } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

export default function Navbar() {
  const { customer, logout, setAuthModalOpen, setOrdersModalOpen } = useCustomer();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: scrolled ? '12px 0' : '20px 0',
      background: scrolled ? 'rgba(10, 11, 16, 0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1320,
        margin: '0 auto',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* ================= BRAND LOGO (Vy Vy FLOWER) ================= */}
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#ffffff',
        }}>
          <img
            src="/images/vyvy_avatar.jpg"
            alt="Vy Vy Flower"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.5px solid #facc15',
              boxShadow: '0 0 12px rgba(250, 204, 21, 0.4)',
            }}
          />
          <span style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: '#ffffff',
          }}>
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
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
          }}>
            FLOWER
          </span>
        </Link>

        {/* ================= DESKTOP NAV LINKS ================= */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
        }} className="desktop-nav">
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
              transition: 'color 0.2s ease',
            })}
          >
            Trang Chủ
          </NavLink>

          <NavLink
            to="/products"
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
              transition: 'color 0.2s ease',
            })}
          >
            Bộ Sưu Tập
          </NavLink>

          <a
            href="/#workshop"
            style={{
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.65)',
              transition: 'color 0.2s ease',
            }}
          >
            Workshop
          </a>

          <a
            href="/#services"
            style={{
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.65)',
              transition: 'color 0.2s ease',
            }}
          >
            Dịch Vụ VIP
          </a>
        </nav>

        {/* ================= RIGHT TOOLS & CONTACT ================= */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Customer Account / Orders */}
          {customer ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdown(!userDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(250, 204, 21, 0.12)',
                  border: '1px solid rgba(250, 204, 21, 0.4)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <img
                  src={customer.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customer.name)}`}
                  alt={customer.name}
                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {customer.name}
                </span>
                <span style={{ fontSize: '10px', color: '#facc15' }}>▼</span>
              </button>

              {userDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    borderRadius: '20px',
                    background: 'rgba(18, 20, 29, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                    padding: '8px',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                  onClick={() => setUserDropdown(false)}
                >
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{customer.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{customer.phone}</div>
                    <div style={{ fontSize: '10px', color: '#facc15', fontWeight: 700, marginTop: '2px' }}>
                      Hạng: {customer.status || 'Thành viên'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOrdersModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span>📦</span>
                    <span>Đơn hoa của tôi</span>
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#f43f5e',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '9999px',
                background: 'rgba(250, 204, 21, 0.12)',
                border: '1.5px solid #facc15',
                color: '#facc15',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 16px rgba(250, 204, 21, 0.2)',
              }}
            >
              <User size={15} />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Quick Orders Tracking Button for customers */}
          {customer && (
            <button
              type="button"
              onClick={() => setOrdersModalOpen(true)}
              title="Xem đơn hàng của bạn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={15} style={{ color: '#a3e635' }} />
              <span>Đơn Của Tôi</span>
            </button>
          )}

          {/* Admin link icon */}
          <Link
            to="/admin"
            title="Khu vực Quản trị Florist Studio"
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
            }}
          >
            <Shield size={16} />
          </Link>

          {/* Contact Pill */}
          <Link
            to="/contact"
            className="btn-pill-outline"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Liên Hệ
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
            }}
            className="mobile-toggle"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          background: 'rgba(12, 13, 18, 0.96)',
          backdropFilter: 'blur(25px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}>
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>Trang Chủ</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>Bộ Sưu Tập</Link>
          <a href="/#workshop" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>Workshop</a>
          <a href="/#services" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>Dịch Vụ VIP</a>
          <Link to="/contact" onClick={() => setMenuOpen(false)} style={{ color: '#facc15', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>Đặt Hoa / Contact</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ color: '#ec4899', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>Khu Vực Quản Trị (Admin)</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
