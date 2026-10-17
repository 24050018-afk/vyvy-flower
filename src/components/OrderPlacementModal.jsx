import React, { useState, useEffect, useContext } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { createOrder } from '../services/api';
import { ToastContext } from '../App';
import { X, CheckCircle2, Send } from 'lucide-react';

const occasionsList = ['Sinh nhật', 'Khai trương', 'Tình nhân', 'Kỷ niệm', 'Hoa cưới', 'Tri ân', 'Khác'];

export default function OrderPlacementModal() {
  const { orderPlacementModal, setOrderPlacementModal, setOrdersModalOpen } = useCustomer();
  const addToast = useContext(ToastContext);

  const { open, product, customer } = orderPlacementModal;

  const [forWhom, setForWhom] = useState('self'); // 'self' or 'other'
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [occasion, setOccasion] = useState('Sinh nhật');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Chưa thanh toán (COD khi nhận hoa)');
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    if (customer) {
      if (forWhom === 'self') {
        setRecipientName(customer.name || '');
        setRecipientPhone(customer.phone || '');
        setDeliveryAddress(customer.address || '');
      } else {
        setRecipientName('');
        setRecipientPhone('');
      }
    }
    // Default delivery date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
  }, [customer, forWhom, open]);

  if (!open || !product) return null;

  const handleClose = () => {
    setSuccessOrder(null);
    setOrderPlacementModal({ open: false, product: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName || !recipientPhone || !deliveryAddress) {
      if (addToast) addToast('Vui lòng điền đầy đủ người nhận, số điện thoại và địa chỉ giao!', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerName: recipientName,
        customerPhone: recipientPhone,
        customerEmail: customer?.email || '',
        deliveryDate,
        deliveryAddress,
        occasion,
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        }],
        totalAmount: product.price,
        notes: notes ? `${notes} (Người đặt: ${customer?.name} - SĐT: ${customer?.phone})` : `Người đặt: ${customer?.name} - SĐT: ${customer?.phone}`,
        paymentStatus: paymentMethod.includes('COD') ? 'Chưa thanh toán' : 'Đã thanh toán',
      };

      const res = await createOrder(orderPayload);
      if (res.success) {
        setSuccessOrder({
          orderCode: res.orderCode,
          ...orderPayload
        });
        if (addToast) addToast(`🎉 Đã đặt thành công đơn hàng #${res.orderCode}! Florist đã nhận được thông báo.`);
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Lỗi khi tạo đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content glass-panel"
        style={{
          maxWidth: '560px',
          width: '92%',
          padding: '36px 30px',
          borderRadius: '32px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 45px rgba(250, 204, 21, 0.2)',
          border: '1px solid rgba(250, 204, 21, 0.35)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#fff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={18} />
        </button>

        {/* If Order Placed Successfully */}
        {successOrder ? (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(163, 230, 53, 0.15)',
              border: '2px solid #a3e635',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#a3e635',
              boxShadow: '0 0 25px rgba(163, 230, 53, 0.4)',
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Đặt Hoa Thành Công!
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'rgba(250, 204, 21, 0.15)',
              border: '1px solid #facc15',
              color: '#facc15',
              fontWeight: 800,
              fontSize: '15px',
              marginBottom: '16px',
            }}>
              Mã Đơn: {successOrder.orderCode}
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto 24px' }}>
              Đơn hàng của bạn đã được chuyển tới Florist Studio. Quản trị viên đã nhận được thông báo tức thì và đang chuẩn bị hoa theo trình tự chuẩn nghệ thuật.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Tác phẩm:</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{product.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Người nhận:</span>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{recipientName} ({recipientPhone})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Ngày giao:</span>
                <span style={{ color: '#facc15', fontWeight: 700, fontSize: '13px' }}>{deliveryDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Tổng thanh toán:</span>
                <span style={{ color: '#a3e635', fontWeight: 800, fontSize: '15px' }}>
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {paymentMethod.includes('VietQR') && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(250, 204, 21, 0.3)',
                borderRadius: '20px',
                padding: '16px',
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#facc15', marginBottom: '8px' }}>
                  Quét Mã VietQR Chuyển Khoản Tự Động
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <img
                    src={`https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${product.price}&addInfo=${encodeURIComponent('VYVY ' + successOrder.orderCode)}&accountName=${encodeURIComponent('VY VY FLOWER STUDIO')}`}
                    alt="VietQR"
                    style={{ width: '190px', height: '190px', borderRadius: '12px', background: '#fff', padding: '6px' }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  <div>Ngân hàng: <strong>MBBank</strong> • STK: <strong style={{ color: '#a3e635' }}>0901234567</strong></div>
                  <div>Chủ TK: <strong>VY VY FLOWER STUDIO</strong></div>
                  <div>Nội dung CK: <strong style={{ color: '#facc15' }}>VYVY {successOrder.orderCode}</strong></div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setOrdersModalOpen(true);
                }}
                className="hero-cta-btn"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <span>Xem Tiến Độ Đơn Của Tôi</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Bước 2: Xác Nhận Đơn Hoa Nghệ Thuật
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                Thông Tin Giao Hoa
              </h2>
            </div>

            {/* Product Card Summary */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              marginBottom: '20px',
            }}>
              <img
                src={product.image || '/images/product_rose.jpg'}
                alt={product.name}
                style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 700 }}>{product.category}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{product.name}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#a3e635' }}>
                  {product.price.toLocaleString('vi-VN')}₫
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Option: For Self or Gift */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  Mục đích gửi tặng:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setForWhom('self')}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: forWhom === 'self' ? '1.5px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                      background: forWhom === 'self' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: forWhom === 'self' ? '#facc15' : 'rgba(255,255,255,0.7)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    🌸 Giao cho tôi
                  </button>
                  <button
                    type="button"
                    onClick={() => setForWhom('other')}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: forWhom === 'other' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                      background: forWhom === 'other' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: forWhom === 'other' ? '#ec4899' : 'rgba(255,255,255,0.7)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    🎁 Tặng người thương
                  </button>
                </div>
              </div>

              {/* Recipient info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Tên người nhận *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="dark-input"
                    placeholder="Họ và tên..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    SĐT người nhận *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={e => setRecipientPhone(e.target.value)}
                    className="dark-input"
                    placeholder="09xx..."
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Địa chỉ giao hoa chi tiết *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="dark-input"
                  placeholder="Số nhà, đường, phường, quận..."
                />
              </div>

              {/* Delivery Date & Occasion */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Ngày hẹn giao *
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="dark-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Dịp tặng
                  </label>
                  <select
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    className="dark-input"
                  >
                    {occasionsList.map(occ => (
                      <option key={occ} value={occ} style={{ background: '#12141c', color: '#fff' }}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card message */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Nội dung thiệp chúc mừng viết tay (tùy chọn)
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="dark-input"
                  placeholder="Lời chúc ý nghĩa đính kèm bó hoa..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Payment selector */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="dark-input"
                >
                  <option value="Chưa thanh toán (COD khi nhận hoa)" style={{ background: '#12141c', color: '#fff' }}>
                    Thanh toán khi nhận hoa (COD / Đặt cọc 50%)
                  </option>
                  <option value="Đã thanh toán (Chuyển khoản VietQR)" style={{ background: '#12141c', color: '#fff' }}>
                    Chuyển khoản VietQR / MoMo (Xác nhận tự động)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hero-cta-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                <span>{loading ? 'Đang gửi thông báo tới Florist...' : 'Hoàn Tất Đặt Hàng Ngay'}</span>
                <div className="cta-icon-badge">
                  <Send size={16} />
                </div>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
