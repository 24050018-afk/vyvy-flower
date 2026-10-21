import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { User, ShoppingBag, ShoppingCart, Menu, X, Shield } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { customer, logout, setAuthModalOpen, setOrdersModalOpen } = useCustomer();
  const { openCart, cartCount } = useCart();
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
      padding: scrolled ? '10px 0' : '16px 0',
      background: scrolled ? 'rgba(10, 11, 16, 0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div
        className="nav-inner-container"
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* ================= BRAND LOGO (Vy Vy FLOWER) ================= */}
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          color: '#ffffff',
          transition: 'transform 0.2s ease',
        }}>
          <img
            src="/images/logo-white.png"
            alt="Vy Vy Flower - Tiệm Hoa Sóc Trăng"
            className="nav-brand-logo"
            style={{
              height: scrolled ? '52px' : '66px',
              width: 'auto',
              maxWidth: '260px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.7))',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
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
              <span className="auth-btn-text">Đăng Nhập</span>
            </button>
          )}

          {/* Quick Orders Tracking Button for customers */}
          {customer && (
            <button
              type="button"
              onClick={() => setOrdersModalOpen(true)}
              title="Xem đơn hàng của bạn"
              className="nav-hide-mobile"
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

          {/* Shopping Cart Button */}
          <button
            type="button"
            onClick={openCart}
            title="Xem giỏ hoa tươi"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: cartCount > 0 ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: cartCount > 0 ? '1.5px solid #facc15' : '1px solid rgba(255, 255, 255, 0.15)',
              color: cartCount > 0 ? '#facc15' : '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: cartCount > 0 ? '0 0 16px rgba(250, 204, 21, 0.25)' : 'none',
            }}
          >
            <ShoppingCart size={16} />
            <span style={{ display: 'none' }} className="cart-text-desktop">Giỏ Hàng</span>
            {cartCount > 0 && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 800,
                  lineHeight: '1.2',
                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin link icon */}
          <Link
            to="/admin"
            title="Khu vực Quản trị Florist Studio"
            className="nav-hide-mobile"
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
            className="btn-pill-outline nav-hide-mobile"
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
          top: scrolled ? '65px' : '76px',
          left: 0,
          right: 0,
          maxHeight: 'calc(100vh - 76px)',
          overflowY: 'auto',
          background: 'rgba(10, 11, 16, 0.98)',
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(250, 204, 21, 0.25)',
          padding: '24px 20px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Customer Banner in Drawer */}
          {customer ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'rgba(250, 204, 21, 0.1)',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={customer.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customer.name)}`}
                  alt={customer.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{customer.name}</div>
                  <div style={{ fontSize: '11px', color: '#facc15' }}>Hạng: {customer.status || 'Thành viên'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setOrdersModalOpen(true);
                }}
                style={{
                  background: '#facc15',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '5px 12px',
                  cursor: 'pointer',
                }}
              >
                Đơn hoa
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setAuthModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(250, 204, 21, 0.15)',
                border: '1px solid #facc15',
                color: '#facc15',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '6px',
              }}
            >
              <User size={16} />
              <span>Đăng Nhập / Tra Cứu Đơn Hàng</span>
            </button>
          )}

          {/* Quick Cart Trigger */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
              border: '1.5px solid #facc15',
              borderRadius: '16px',
              padding: '12px 18px',
              color: '#facc15',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={20} />
              <span>Giỏ Hoa Của Bạn</span>
            </div>
            <span
              style={{
                background: '#facc15',
                color: '#000',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 900,
              }}
            >
              {cartCount} món
            </span>
          </button>

          <Link to="/" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '8px 12px', borderRadius: '10px' }}>Trang Chủ</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '8px 12px', borderRadius: '10px' }}>Bộ Sưu Tập Hoa Tươi</Link>
          <a href="/#workshop" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '8px 12px', borderRadius: '10px' }}>Workshop Cắm Hoa VIP</a>
          <a href="/#services" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '8px 12px', borderRadius: '10px' }}>Dịch Vụ Hoa Sự Kiện</a>
          <Link to="/contact" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '8px 12px', borderRadius: '10px' }}>Liên Hệ & Bản Đồ Tiệm</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ color: '#ec4899', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '8px 12px', borderRadius: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>Khu Vực Quản Trị Hệ Thống (Admin)</Link>

          {/* Hotline Quick Call in Drawer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <a
              href="tel:0901234567"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '12px',
                background: 'rgba(163, 230, 53, 0.15)',
                border: '1px solid #a3e635',
                color: '#a3e635',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <PhoneCall size={16} />
              <span>0901.234.567</span>
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid #06b6d4',
                color: '#06b6d4',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <span>💬 Nhắn Zalo</span>
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .cart-text-desktop { display: inline !important; }
        }
        @media (max-width: 820px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .nav-hide-mobile { display: none !important; }
          .nav-inner-container {
            padding: 0 16px !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .auth-btn-text { display: none !important; }
        }
        @media (max-width: 600px) {
          .nav-brand-logo {
            height: 46px !important;
            max-width: 170px !important;
          }
        }
      `}</style>
    </header>
  );
}
