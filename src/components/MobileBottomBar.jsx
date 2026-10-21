import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { Home, Sparkles, ShoppingBag, PhoneCall, User } from 'lucide-react';

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, openCart } = useCart();
  const { customer, setAuthModalOpen, setOrdersModalOpen } = useCustomer();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isHome = location.pathname === '/';
  const isProducts = location.pathname === '/products';

  const handleAccountClick = () => {
    if (customer) {
      setOrdersModalOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <nav
      className="mobile-bottom-nav-bar"
      aria-label="Thanh điều hướng di động"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 95,
        background: 'rgba(12, 13, 19, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.7)',
        padding: '6px 8px calc(6px + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
    >
      {/* 1. Trang Chủ */}
      <button
        type="button"
        onClick={() => {
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`mobile-bottom-nav-btn ${isHome ? 'active' : ''}`}
        style={{
          background: 'none',
          border: 'none',
          color: isHome ? '#facc15' : 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          cursor: 'pointer',
          borderRadius: '12px',
          flex: 1,
          transition: 'all 0.2s ease',
        }}
      >
        <Home size={20} strokeWidth={isHome ? 2.5 : 1.8} />
        <span style={{ fontSize: '10px', fontWeight: isHome ? 700 : 500 }}>Trang Chủ</span>
      </button>

      {/* 2. Bộ Sưu Tập */}
      <button
        type="button"
        onClick={() => {
          navigate('/products');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`mobile-bottom-nav-btn ${isProducts ? 'active' : ''}`}
        style={{
          background: 'none',
          border: 'none',
          color: isProducts ? '#facc15' : 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          cursor: 'pointer',
          borderRadius: '12px',
          flex: 1,
          transition: 'all 0.2s ease',
        }}
      >
        <Sparkles size={20} strokeWidth={isProducts ? 2.5 : 1.8} />
        <span style={{ fontSize: '10px', fontWeight: isProducts ? 700 : 500 }}>Bộ Sưu Tập</span>
      </button>

      {/* 3. Giỏ Hàng (Center Highlight Pill) */}
      <button
        type="button"
        onClick={openCart}
        className="mobile-bottom-nav-btn mobile-cart-highlight"
        style={{
          background: 'none',
          border: 'none',
          color: cartCount > 0 ? '#facc15' : 'rgba(255, 255, 255, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          cursor: 'pointer',
          borderRadius: '12px',
          flex: 1,
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={21} strokeWidth={cartCount > 0 ? 2.5 : 1.8} />
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                minWidth: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxShadow: '0 2px 8px rgba(236, 72, 153, 0.6)',
                border: '1.5px solid #0c0d13',
              }}
            >
              {cartCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: '10px', fontWeight: cartCount > 0 ? 700 : 500 }}>Giỏ Hàng</span>
      </button>

      {/* 4. Hotline / Gọi Tư Vấn */}
      <a
        href="tel:0901234567"
        className="mobile-bottom-nav-btn"
        style={{
          textDecoration: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          cursor: 'pointer',
          borderRadius: '12px',
          flex: 1,
          transition: 'all 0.2s ease',
        }}
      >
        <PhoneCall size={20} strokeWidth={1.8} style={{ color: '#a3e635' }} />
        <span style={{ fontSize: '10px', fontWeight: 500 }}>Hotline</span>
      </a>

      {/* 5. Tài Khoản / Đơn Hàng */}
      <button
        type="button"
        onClick={handleAccountClick}
        className="mobile-bottom-nav-btn"
        style={{
          background: 'none',
          border: 'none',
          color: customer ? '#a3e635' : 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          cursor: 'pointer',
          borderRadius: '12px',
          flex: 1,
          transition: 'all 0.2s ease',
        }}
      >
        {customer && customer.avatar ? (
          <img
            src={customer.avatar}
            alt={customer.name}
            style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #a3e635' }}
          />
        ) : (
          <User size={20} strokeWidth={customer ? 2.5 : 1.8} />
        )}
        <span style={{ fontSize: '10px', fontWeight: customer ? 700 : 500, maxWidth: '58px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {customer ? 'Đơn Hàng' : 'Tài Khoản'}
        </span>
      </button>
    </nav>
  );
}
