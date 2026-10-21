import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    startCartCheckout,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleExplore = () => {
    closeCart();
    navigate('/products');
  };

  return (
    <div
      className="cart-drawer-backdrop"
      onClick={closeCart}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <div
        className="cart-drawer-panel glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          background: 'linear-gradient(180deg, rgba(18, 20, 29, 0.98) 0%, rgba(10, 11, 16, 0.98) 100%)',
          backdropFilter: 'blur(25px)',
          borderLeft: '1px solid rgba(250, 204, 21, 0.25)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(250, 204, 21, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ================= HEADER ================= */}
        <div
          className="cart-drawer-header"
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(250, 204, 21, 0.15)',
                border: '1.5px solid #facc15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#facc15',
                boxShadow: '0 0 15px rgba(250, 204, 21, 0.3)',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <div style={{ marginBottom: '4px' }}>
                <img
                  src="/images/logo-white.png"
                  alt="Vy Vy Flower"
                  style={{ height: '26px', width: 'auto', maxWidth: '120px', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Giỏ Hoa Của Bạn
              </h3>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)' }}>
                {cartCount > 0 ? `${cartCount} đóa hoa nghệ thuật đã chọn` : 'Chưa có sản phẩm'}
              </span>
            </div>
          </div>

          <button
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {cart.length === 0 ? (
            /* Empty State */
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                margin: 'auto 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed rgba(250, 204, 21, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: '#facc15',
                }}
              >
                <ShoppingBag size={40} style={{ opacity: 0.6 }} />
              </div>
              <h4 style={{ fontSize: '19px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Giỏ hàng của bạn đang trống
              </h4>
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.55)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  maxWidth: '300px',
                  marginBottom: '24px',
                }}
              >
                Hãy chọn những tác phẩm hoa tươi nghệ thuật độc bản để dành tặng người thương hoặc trang hoàng không gian sống.
              </p>
              <button
                type="button"
                onClick={handleExplore}
                className="hero-cta-btn"
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                <span>Khám Phá Bộ Sưu Tập</span>
                <div className="cta-icon-badge">
                  <Sparkles size={16} />
                </div>
              </button>
            </div>
          ) : (
            /* Items List */
            <>
              {/* Perks Banner */}
              <div
                style={{
                  background: 'rgba(250, 204, 21, 0.08)',
                  border: '1px solid rgba(250, 204, 21, 0.25)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '18px' }}>🚚</span>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
                  <strong style={{ color: '#facc15' }}>Ưu đãi Florist Studio:</strong> Miễn phí vận chuyển nội thành & tặng kèm thiệp thiết kế cao cấp cho mọi đơn hoa!
                </div>
              </div>

              {/* Items Card List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cart.map((item) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1);
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '14px',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        <img
                          src={item.image || '/images/vyvy_lily_hong.jpg'}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {item.category}
                            </div>
                            <h5
                              style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#ffffff',
                                margin: '2px 0 4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.name}
                            </h5>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            title="Xóa khỏi giỏ"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(255, 255, 255, 0.4)',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '6px',
                              transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Price & Stepper Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#facc15' }}>
                              {itemTotal.toLocaleString('vi-VN')}₫
                            </div>
                            {item.quantity > 1 && (
                              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                                {item.price.toLocaleString('vi-VN')}₫ x {item.quantity}
                              </div>
                            )}
                          </div>

                          {/* Stepper */}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: 'rgba(255, 255, 255, 0.06)',
                              borderRadius: '9999px',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              padding: '2px 6px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ffffff',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <span
                              style={{
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '13px',
                                minWidth: '22px',
                                textAlign: 'center',
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ffffff',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clear Cart link */}
              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Xóa tất cả món trong giỏ
                </button>
              </div>
            </>
          )}
        </div>

        {/* ================= FOOTER / CHECKOUT ACTIONS ================= */}
        {cart.length > 0 && (
          <div
            className="cart-drawer-footer"
            style={{
              padding: '20px 24px 28px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(12, 13, 18, 0.8)',
              backdropFilter: 'blur(15px)',
            }}
          >
            {/* Calculation summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)' }}>
                <span>Tạm tính ({cartCount} món):</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{cartTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)' }}>
                <span>Phí vận chuyển:</span>
                <span style={{ color: '#a3e635', fontWeight: 700 }}>Miễn phí (0₫)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#ffffff',
                  paddingTop: '10px',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                }}
              >
                <span>Tổng Thanh Toán:</span>
                <span style={{ color: '#facc15', fontSize: '20px' }}>{cartTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={startCartCheckout}
              className="hero-cta-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 800,
              }}
            >
              <span>Tiến Hành Đặt Hàng & Xác Nhận</span>
              <div className="cta-icon-badge">
                <ArrowRight size={18} />
              </div>
            </button>

            <button
              type="button"
              onClick={closeCart}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.55)',
                fontSize: '12px',
                fontWeight: 600,
                marginTop: '12px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              ← Tiếp tục chọn thêm hoa
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 600px) {
          .cart-drawer-panel {
            max-width: 100% !important;
            width: 100% !important;
          }
          .cart-drawer-header {
            padding: 16px !important;
          }
          .cart-drawer-footer {
            padding: 16px 16px calc(18px + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
      `}</style>
    </div>
  );
}
