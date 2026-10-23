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
    <div className="cart-drawer-backdrop" onClick={closeCart}>
      <div
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="cart-header-icon-wrap">
              <ShoppingBag size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ marginBottom: '3px' }}>
                <img
                  src="/images/logo.png"
                  alt="Vy Vy Flower"
                  className="cart-logo-dark-mode"
                />
                <img
                  src="/images/logo-white.png"
                  alt="Vy Vy Flower"
                  className="cart-logo-light-mode"
                />
              </div>
              <h3 className="cart-drawer-title">
                Giỏ Hoa Của Bạn
              </h3>
              <span className="cart-drawer-subtitle">
                {cartCount > 0 ? `${cartCount} đóa hoa nghệ thuật đã chọn` : 'Chưa có sản phẩm trong giỏ'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
            className="cart-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            /* Empty State */
            <div className="cart-empty-state">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={38} />
              </div>
              <h4 className="cart-empty-title">
                Giỏ hoa của bạn đang trống
              </h4>
              <p className="cart-empty-desc">
                Hãy chọn những đóa hoa tươi rạng rỡ và tinh tế nhất của Vy Vy Flower để trao gửi yêu thương đến người thương nhé!
              </p>
              <button
                type="button"
                onClick={handleExplore}
                className="cart-empty-cta-btn"
              >
                <span>Khám Phá Bộ Sưu Tập Hoa</span>
                <Sparkles size={16} />
              </button>
            </div>
          ) : (
            /* Items List */
            <>
              {/* Perks Banner */}
              <div className="cart-perks-banner">
                <span style={{ fontSize: '20px', flexShrink: 0 }}>🌸</span>
                <div className="cart-perks-text">
                  <strong>Ưu đãi Florist Studio:</strong> Miễn phí giao hoa hỏa tốc nội thành & tặng kèm thiệp thiết kế tay cao cấp!
                </div>
              </div>

              {/* Items Card List */}
              <div className="cart-items-list">
                {cart.map((item) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1);
                  return (
                    <div key={item.id} className="cart-item-card">
                      {/* Thumbnail */}
                      <div className="cart-item-thumb">
                        <img
                          src={item.image_url || item.image || '/images/vyvy_lily_hong.jpg'}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Content */}
                      <div className="cart-item-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <span className="cart-item-category">
                              {item.category || 'BÓ HOA TƯƠI'}
                            </span>
                            <h5 className="cart-item-name" title={item.name}>
                              {item.name}
                            </h5>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            title="Xóa khỏi giỏ"
                            className="cart-item-delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Price & Stepper Row */}
                        <div className="cart-item-price-row">
                          <div>
                            <div className="cart-item-total-price">
                              {itemTotal.toLocaleString('vi-VN')}₫
                            </div>
                            {item.quantity > 1 && (
                              <div className="cart-item-unit-price">
                                {item.price?.toLocaleString('vi-VN')}₫ × {item.quantity}
                              </div>
                            )}
                          </div>

                          {/* Stepper */}
                          <div className="cart-item-stepper">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Giảm số lượng"
                              className="cart-stepper-btn"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="cart-stepper-num">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Tăng số lượng"
                              className="cart-stepper-btn"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clear Cart link */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={clearCart}
                  className="cart-clear-all-btn"
                >
                  <Trash2 size={12} />
                  <span>Xóa tất cả món trong giỏ</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ================= FOOTER / CHECKOUT ACTIONS ================= */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Calculation summary */}
            <div className="cart-calc-box">
              <div className="cart-calc-row">
                <span>Tạm tính ({cartCount} món):</span>
                <span className="cart-calc-val">{cartTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="cart-calc-row">
                <span>Phí vận chuyển:</span>
                <span className="cart-calc-free">Miễn phí (0₫)</span>
              </div>
              <div className="cart-calc-total-row">
                <span>Tổng Thanh Toán:</span>
                <span className="cart-total-amount">{cartTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={startCartCheckout}
              className="cart-checkout-btn"
            >
              <span>Tiến Hành Đặt Hàng & Xác Nhận</span>
              <div className="cart-checkout-icon-wrap">
                <ArrowRight size={17} />
              </div>
            </button>

            <button
              type="button"
              onClick={closeCart}
              className="cart-continue-shopping-btn"
            >
              ← Tiếp tục chọn thêm hoa tươi
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* ================= BASE DRAWER ================= */
        .cart-drawer-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1050;
          display: flex;
          justify-content: flex-end;
          animation: cartFadeIn 0.25s ease;
        }

        .cart-drawer-panel {
          width: 100%;
          max-width: 480px;
          height: 100vh;
          background: #ffffff;
          box-shadow: -20px 0 60px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          position: relative;
          animation: cartSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Dark Mode Theme */
        body:not(.theme-light-floral) .cart-drawer-panel {
          background: #10121a !important;
          border-left: 1px solid rgba(250, 204, 21, 0.25) !important;
          box-shadow: -20px 0 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(250, 204, 21, 0.1) !important;
        }

        /* Light Mode Theme */
        body.theme-light-floral .cart-drawer-panel {
          background: #fdfbf9 !important;
          border-left: 1px solid rgba(225, 215, 200, 0.85) !important;
          box-shadow: -20px 0 60px rgba(80, 50, 30, 0.15) !important;
        }

        /* Header */
        .cart-drawer-header {
          padding: 22px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
        }

        body.theme-light-floral .cart-drawer-header {
          background: #ffffff !important;
          border-bottom: 1px solid #f0e8df !important;
        }

        body:not(.theme-light-floral) .cart-drawer-header {
          background: #141724 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .cart-header-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e11d48 0%, #fb923c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
          flex-shrink: 0;
        }

        /* Logos Switch */
        .cart-logo-dark-mode {
          height: 28px;
          width: auto;
          max-width: 130px;
          object-fit: contain;
          display: none;
        }

        .cart-logo-light-mode {
          height: 28px;
          width: auto;
          max-width: 130px;
          object-fit: contain;
          display: block;
        }

        body.theme-light-floral .cart-logo-dark-mode {
          display: block !important;
        }

        body.theme-light-floral .cart-logo-light-mode {
          display: none !important;
        }

        .cart-drawer-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.2px;
        }

        body:not(.theme-light-floral) .cart-drawer-title {
          color: #ffffff !important;
        }

        .cart-drawer-subtitle {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        body:not(.theme-light-floral) .cart-drawer-subtitle {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        /* Close Button */
        .cart-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cart-close-btn:hover {
          background: #ffe4e6;
          border-color: #fecdd3;
          color: #e11d48;
          transform: scale(1.05);
        }

        body:not(.theme-light-floral) .cart-close-btn {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
        }

        body:not(.theme-light-floral) .cart-close-btn:hover {
          background: #e11d48 !important;
          color: #ffffff !important;
        }

        /* Body */
        .cart-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Perks Banner */
        .cart-perks-banner {
          background: linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%);
          border: 1.5px solid #fecdd3;
          border-radius: 16px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.06);
        }

        body:not(.theme-light-floral) .cart-perks-banner {
          background: rgba(250, 204, 21, 0.08) !important;
          border: 1px solid rgba(250, 204, 21, 0.3) !important;
        }

        .cart-perks-text {
          font-size: 12.5px;
          line-height: 1.45;
          color: #475569;
        }

        body.theme-light-floral .cart-perks-text strong {
          color: #be123c !important;
        }

        body:not(.theme-light-floral) .cart-perks-text {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        body:not(.theme-light-floral) .cart-perks-text strong {
          color: #facc15 !important;
        }

        /* Items List */
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Item Card */
        .cart-item-card {
          display: flex;
          gap: 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        body.theme-light-floral .cart-item-card {
          background: #ffffff !important;
          border: 1px solid #ede4db !important;
          box-shadow: 0 4px 14px rgba(120, 80, 60, 0.05) !important;
        }

        body:not(.theme-light-floral) .cart-item-card {
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: none !important;
        }

        .cart-item-thumb {
          width: 76px;
          height: 76px;
          border-radius: 14px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
        }

        .cart-item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cart-item-category {
          font-size: 10px;
          color: #be123c;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          display: block;
        }

        body:not(.theme-light-floral) .cart-item-category {
          color: #facc15 !important;
        }

        .cart-item-name {
          font-size: 14.5px;
          font-weight: 800;
          color: #0f172a;
          margin: 2px 0 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.3;
        }

        body.theme-light-floral .cart-item-name {
          color: #1c1917 !important;
        }

        body:not(.theme-light-floral) .cart-item-name {
          color: #ffffff !important;
        }

        .cart-item-delete-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .cart-item-delete-btn:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        body:not(.theme-light-floral) .cart-item-delete-btn {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        body:not(.theme-light-floral) .cart-item-delete-btn:hover {
          color: #f43f5e !important;
          background: rgba(244, 63, 94, 0.15) !important;
        }

        .cart-item-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .cart-item-total-price {
          font-size: 15px;
          font-weight: 800;
          color: #e11d48;
        }

        body:not(.theme-light-floral) .cart-item-total-price {
          color: #facc15 !important;
        }

        .cart-item-unit-price {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        body:not(.theme-light-floral) .cart-item-unit-price {
          color: rgba(255, 255, 255, 0.45) !important;
        }

        /* Stepper */
        .cart-item-stepper {
          display: inline-flex;
          align-items: center;
          background: #f1f5f9;
          border-radius: 9999px;
          border: 1px solid #cbd5e1;
          padding: 2px 6px;
        }

        body.theme-light-floral .cart-item-stepper {
          background: #f8f4ef !important;
          border: 1px solid #e0d4c8 !important;
        }

        body:not(.theme-light-floral) .cart-item-stepper {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
        }

        .cart-stepper-btn {
          background: none;
          border: none;
          color: #0f172a;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.15s;
        }

        .cart-stepper-btn:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        body:not(.theme-light-floral) .cart-stepper-btn {
          color: #ffffff !important;
        }

        body:not(.theme-light-floral) .cart-stepper-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }

        .cart-stepper-num {
          color: #0f172a;
          font-weight: 800;
          font-size: 13.5px;
          min-width: 24px;
          text-align: center;
        }

        body:not(.theme-light-floral) .cart-stepper-num {
          color: #ffffff !important;
        }

        /* Clear All Button */
        .cart-clear-all-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .cart-clear-all-btn:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        body:not(.theme-light-floral) .cart-clear-all-btn {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        body:not(.theme-light-floral) .cart-clear-all-btn:hover {
          color: #f43f5e !important;
          background: rgba(244, 63, 94, 0.15) !important;
        }

        /* Footer */
        .cart-drawer-footer {
          padding: 20px 24px calc(24px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05);
        }

        body.theme-light-floral .cart-drawer-footer {
          background: #ffffff !important;
          border-top: 1px solid #ede4db !important;
          box-shadow: 0 -10px 30px rgba(120, 80, 60, 0.06) !important;
        }

        body:not(.theme-light-floral) .cart-drawer-footer {
          background: #141724 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.4) !important;
        }

        .cart-calc-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .cart-calc-row {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          color: #64748b;
          font-weight: 500;
        }

        body:not(.theme-light-floral) .cart-calc-row {
          color: rgba(255, 255, 255, 0.65) !important;
        }

        .cart-calc-val {
          color: #0f172a;
          font-weight: 700;
        }

        body:not(.theme-light-floral) .cart-calc-val {
          color: #ffffff !important;
        }

        .cart-calc-free {
          color: #16a34a;
          font-weight: 800;
        }

        body:not(.theme-light-floral) .cart-calc-free {
          color: #a3e635 !important;
        }

        .cart-calc-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          padding-top: 10px;
          border-top: 1.5px dashed #cbd5e1;
        }

        body.theme-light-floral .cart-calc-total-row {
          border-top: 1.5px dashed #e0d4c8 !important;
        }

        body:not(.theme-light-floral) .cart-calc-total-row {
          color: #ffffff !important;
          border-top: 1.5px dashed rgba(255, 255, 255, 0.15) !important;
        }

        .cart-total-amount {
          color: #e11d48;
          font-size: 22px;
          font-weight: 900;
        }

        body:not(.theme-light-floral) .cart-total-amount {
          color: #facc15 !important;
        }

        /* Checkout Button */
        .cart-checkout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #e11d48 0%, #fb923c 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(225, 29, 72, 0.35);
          transition: all 0.25s ease;
        }

        .cart-checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(225, 29, 72, 0.5);
        }

        .cart-checkout-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          color: #e11d48;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .cart-continue-shopping-btn {
          width: 100%;
          background: none;
          border: none;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          margin-top: 12px;
          cursor: pointer;
          text-align: center;
          transition: color 0.2s ease;
        }

        .cart-continue-shopping-btn:hover {
          color: #e11d48;
        }

        body:not(.theme-light-floral) .cart-continue-shopping-btn {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        body:not(.theme-light-floral) .cart-continue-shopping-btn:hover {
          color: #facc15 !important;
        }

        /* Empty State */
        .cart-empty-state {
          text-align: center;
          padding: 60px 20px;
          margin: auto 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cart-empty-icon-wrap {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #fff1f2;
          border: 1.5px dashed #fecdd3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: #e11d48;
        }

        body:not(.theme-light-floral) .cart-empty-icon-wrap {
          background: rgba(250, 204, 21, 0.08) !important;
          border: 1.5px dashed rgba(250, 204, 21, 0.4) !important;
          color: #facc15 !important;
        }

        .cart-empty-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px;
        }

        body:not(.theme-light-floral) .cart-empty-title {
          color: #ffffff !important;
        }

        .cart-empty-desc {
          color: #64748b;
          font-size: 13.5px;
          line-height: 1.6;
          max-width: 300px;
          margin: 0 0 24px;
        }

        body:not(.theme-light-floral) .cart-empty-desc {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .cart-empty-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #e11d48 0%, #fb923c 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(225, 29, 72, 0.35);
          transition: all 0.2s ease;
        }

        .cart-empty-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(225, 29, 72, 0.5);
        }

        /* Animations */
        @keyframes cartSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes cartFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 600px) {
          .cart-drawer-panel {
            max-width: 100% !important;
            width: 100% !important;
          }
          .cart-drawer-header {
            padding: 18px 20px !important;
          }
          .cart-drawer-body {
            padding: 16px !important;
          }
          .cart-drawer-footer {
            padding: 16px 20px calc(20px + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
      `}</style>
    </div>
  );
}
