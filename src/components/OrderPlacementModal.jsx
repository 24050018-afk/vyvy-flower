import React, { useState, useEffect, useContext } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import { ToastContext } from '../App';
import { X, CheckCircle2, Send, ArrowRight, ArrowLeft, MapPin, User, Gift, Edit3, Copy, Check } from 'lucide-react';

const occasionsList = [
  'Sinh nhật',
  'Khai trương',
  'Tình nhân (Valentine)',
  'Kỷ niệm ngày yêu/cưới',
  'Hoa cưới cầm tay',
  'Tri ân / Cảm ơn',
  'Chúc mừng tốt nghiệp',
  'Kính viếng / Chia buồn',
  'Khác',
];

const timeSlots = [
  'Giao giờ hành chính (08:30 - 11:30)',
  'Giao buổi chiều (13:30 - 17:00)',
  'Giao buổi tối (17:30 - 20:30)',
  'Giao hỏa tốc trong 2 giờ',
  'Giao giờ chính xác theo yêu cầu',
];

const cities = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Cần Thơ',
  'Tỉnh thành khác',
];

export default function OrderPlacementModal() {
  const { customer, setOrdersModalOpen, orderPlacementModal, setOrderPlacementModal, setAuthModalOpen } = useCustomer();
  const { checkoutModal, closeCheckout, clearCart } = useCart();
  const addToast = useContext(ToastContext);

  // Combine trigger from either CartContext or CustomerContext
  const isOpen = checkoutModal.open || orderPlacementModal.open;
  const rawItems = checkoutModal.open
    ? checkoutModal.items
    : orderPlacementModal.product
    ? [{
        id: orderPlacementModal.product.id,
        name: orderPlacementModal.product.name,
        price: orderPlacementModal.product.price,
        image: orderPlacementModal.product.image || '/images/vyvy_lily_hong.jpg',
        category: orderPlacementModal.product.category || 'Hoa tươi',
        quantity: 1,
      }]
    : [];

  // Wizard Step: 1 = Form Entry, 2 = Personal Info Confirmation & Review, 3 = Success
  const [step, setStep] = useState(1);

  // Form states: Thông tin người đặt (Personal info of orderer)
  const [ordererName, setOrdererName] = useState('');
  const [ordererPhone, setOrdererPhone] = useState('');
  const [ordererEmail, setOrdererEmail] = useState('');

  // Người nhận (Recipient)
  const [forWhom, setForWhom] = useState('self'); // 'self' or 'other'
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  // Địa chỉ & Thời gian giao
  const [deliveryCity, setDeliveryCity] = useState('TP. Hồ Chí Minh');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(timeSlots[0]);

  // Thông điệp & Dặn dò
  const [occasion, setOccasion] = useState('Sinh nhật');
  const [notes, setNotes] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('Chưa thanh toán (COD khi nhận hoa)');

  // Submission state
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  // Total price calculation
  const totalAmount = rawItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  // Sync customer information when modal opens or customer changes
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setOrdererName(customer.name || '');
        setOrdererPhone(customer.phone || '');
        setOrdererEmail(customer.email || '');
        if (forWhom === 'self') {
          setRecipientName(customer.name || '');
          setRecipientPhone(customer.phone || '');
          if (customer.address && !deliveryAddress) {
            setDeliveryAddress(customer.address);
          }
        }
      }

      // Default delivery date: tomorrow
      if (!deliveryDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDeliveryDate(tomorrow.toISOString().split('T')[0]);
      }
    }
  }, [customer, isOpen, forWhom]);

  // Handle close
  const handleClose = () => {
    setStep(1);
    setSuccessOrder(null);
    closeCheckout();
    setOrderPlacementModal({ open: false, product: null });
  };

  // Sync recipient when 'self' is chosen
  const handleForWhomChange = (type) => {
    setForWhom(type);
    if (type === 'self') {
      setRecipientName(ordererName);
      setRecipientPhone(ordererPhone);
    } else {
      setRecipientName('');
      setRecipientPhone('');
    }
  };

  // Validate Step 1 and proceed to Step 2 (Xác nhận thông tin cá nhân)
  const handleProceedToConfirmation = (e) => {
    e.preventDefault();

    if (!ordererName.trim()) {
      if (addToast) addToast('Vui lòng nhập Họ và tên người đặt hoa!', 'error');
      return;
    }

    if (!ordererPhone.trim() || ordererPhone.replace(/\D/g, '').length < 9) {
      if (addToast) addToast('Vui lòng nhập Số điện thoại người đặt hợp lệ (từ 10 số)!', 'error');
      return;
    }

    const finalRecipientName = forWhom === 'self' ? ordererName : recipientName;
    const finalRecipientPhone = forWhom === 'self' ? ordererPhone : recipientPhone;

    if (!finalRecipientName.trim()) {
      if (addToast) addToast('Vui lòng nhập Họ và tên người nhận hoa!', 'error');
      return;
    }

    if (!finalRecipientPhone.trim() || finalRecipientPhone.replace(/\D/g, '').length < 9) {
      if (addToast) addToast('Vui lòng nhập Số điện thoại người nhận hoa hợp lệ!', 'error');
      return;
    }

    if (!deliveryAddress.trim()) {
      if (addToast) addToast('Vui lòng nhập Địa chỉ giao hoa chi tiết!', 'error');
      return;
    }

    if (!deliveryDate) {
      if (addToast) addToast('Vui lòng chọn Ngày hẹn giao hoa!', 'error');
      return;
    }

    // Validation passed -> Go to Step 2: Confirmation
    setStep(2);
  };

  // Final Order Placement (from Step 2)
  const handleFinalSubmit = async () => {
    setLoading(true);

    const finalRecipientName = forWhom === 'self' ? ordererName : recipientName;
    const finalRecipientPhone = forWhom === 'self' ? ordererPhone : recipientPhone;
    const fullAddress = `${deliveryAddress.trim()}, ${deliveryCity}`;

    // Detailed notes compiling customer info, card message, and time slot
    let compiledNotes = '';
    if (notes.trim()) {
      compiledNotes += `[Thiệp mừng]: "${notes.trim()}" | `;
    }
    compiledNotes += `[Khung giờ]: ${deliveryTimeSlot} | [Người đặt]: ${ordererName} (${ordererPhone})`;
    if (ordererEmail) compiledNotes += ` - Email: ${ordererEmail}`;
    if (forWhom === 'other') {
      compiledNotes += ` | [Quà tặng người nhận]: ${recipientName} (${recipientPhone})`;
    }
    if (shippingNotes.trim()) {
      compiledNotes += ` | [Dặn dò giao hàng]: ${shippingNotes.trim()}`;
    }

    const orderPayload = {
      customerName: finalRecipientName,
      customerPhone: finalRecipientPhone,
      customerEmail: ordererEmail || customer?.email || '',
      deliveryDate,
      deliveryAddress: fullAddress,
      occasion,
      items: rawItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image,
      })),
      totalAmount,
      notes: compiledNotes,
      paymentStatus: paymentMethod.includes('VietQR') ? 'Chờ kiểm tra chuyển khoản' : 'Chưa thanh toán',
    };

    try {
      const res = await createOrder(orderPayload);
      if (res.success) {
        setSuccessOrder({
          orderCode: res.orderCode,
          ...orderPayload,
        });

        // Clear cart if ordered from cart
        if (checkoutModal.open && !checkoutModal.isDirect) {
          clearCart();
        }

        if (addToast) {
          addToast(`🎉 Đã đặt thành công đơn hoa #${res.orderCode}! Florist đã nhận được thông báo.`);
        }
        setStep(3);
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Lỗi khi tạo đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    if (addToast) addToast(`Đã sao chép ${label}!`);
    setTimeout(() => setCopiedText(''), 2500);
  };

  if (!isOpen || rawItems.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content glass-panel order-modal-panel"
        style={{
          maxWidth: '680px',
          width: '94%',
          padding: '36px 32px',
          borderRadius: '32px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(250, 204, 21, 0.25)',
          border: '1px solid rgba(250, 204, 21, 0.35)',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Đóng cửa sổ đặt hàng"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src="/images/logo-white.png"
            alt="Vy Vy Flower - Tiệm Hoa Sóc Trăng"
            style={{
              height: '52px',
              width: 'auto',
              maxWidth: '220px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))',
            }}
          />
        </div>

        {/* ================= STEPPER PROGRESS BAR ================= */}
        {step < 3 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  background: step === 1 ? 'rgba(250, 204, 21, 0.15)' : 'rgba(163, 230, 53, 0.15)',
                  border: step === 1 ? '1px solid #facc15' : '1px solid #a3e635',
                  color: step === 1 ? '#facc15' : '#a3e635',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                <span>{step === 1 ? '1' : '✓'}</span>
                <span>Thông tin cá nhân & giao hoa</span>
              </div>

              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>➔</span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  background: step === 2 ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: step === 2 ? '1.5px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: step === 2 ? '#facc15' : 'rgba(255, 255, 255, 0.45)',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                <span>2</span>
                <span>Xác nhận thông tin & Đặt hàng</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 1: THÔNG TIN CÁ NHÂN & GIAO HOA
            ======================================================== */}
        {step === 1 && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                BƯỚC 1: THIẾT LẬP THÔNG TIN ĐƠN HOA
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Thông Tin Khách Hàng & Giao Nhận
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', marginTop: '4px' }}>
                Điền thông tin chính xác để nghệ nhân Vy Vy Florist chuẩn bị hoa và giao tận tay đúng hẹn.
              </p>
            </div>

            {/* Product Summary Capsule */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '14px 18px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
                  Đơn hoa đã chọn ({rawItems.length} tác phẩm):
                </span>
                <span style={{ fontSize: '15px', color: '#facc15', fontWeight: 800 }}>
                  Tổng: {totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {rawItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.image || '/images/vyvy_lily_hong.jpg'}
                      alt={item.name}
                      style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '12px', color: '#fff', fontWeight: 700, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a3e635', fontWeight: 700 }}>
                        {item.price.toLocaleString('vi-VN')}₫ x {item.quantity || 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleProceedToConfirmation} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* KHỐI 1: THÔNG TIN NGƯỜI ĐẶT (Personal Info) */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '20px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#facc15' }}><User size={18} /></div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                      1. Thông Tin Người Đặt Hoa
                    </span>
                  </div>

                  {customer ? (
                    <span
                      style={{
                        fontSize: '11px',
                        background: 'rgba(250, 204, 21, 0.15)',
                        border: '1px solid #facc15',
                        color: '#facc15',
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                      }}
                    >
                      ✨ {customer.status || 'Thành viên'} ({customer.name})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#facc15',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Đã có tài khoản? Đăng nhập
                    </button>
                  )}
                </div>

                <div className="order-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Họ và tên người đặt *
                    </label>
                    <input
                      type="text"
                      required
                      value={ordererName}
                      onChange={(e) => {
                        setOrdererName(e.target.value);
                        if (forWhom === 'self') setRecipientName(e.target.value);
                      }}
                      className="dark-input"
                      placeholder="Ví dụ: Nguyễn Văn An"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Số điện thoại người đặt *
                    </label>
                    <input
                      type="tel"
                      required
                      value={ordererPhone}
                      onChange={(e) => {
                        setOrdererPhone(e.target.value);
                        if (forWhom === 'self') setRecipientPhone(e.target.value);
                      }}
                      className="dark-input"
                      placeholder="Ví dụ: 0912 345 678"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Email người đặt (nhận hóa đơn & mã tra cứu)
                  </label>
                  <input
                    type="email"
                    value={ordererEmail}
                    onChange={(e) => setOrdererEmail(e.target.value)}
                    className="dark-input"
                    placeholder="nguyenvanan@gmail.com (tùy chọn)"
                  />
                </div>
              </div>

              {/* KHỐI 2: MỤC ĐÍCH & NGƯỜI NHẬN */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '20px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ color: '#ec4899' }}><Gift size={18} /></div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                    2. Người Nhận Hoa
                  </span>
                </div>

                {/* For Whom Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleForWhomChange('self')}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: forWhom === 'self' ? '1.5px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                      background: forWhom === 'self' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: forWhom === 'self' ? '#facc15' : 'rgba(255,255,255,0.7)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>🌸</span>
                    <span>Giao cho chính tôi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleForWhomChange('other')}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: forWhom === 'other' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                      background: forWhom === 'other' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: forWhom === 'other' ? '#ec4899' : 'rgba(255,255,255,0.7)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>🎁</span>
                    <span>Tặng người thương / Bạn bè</span>
                  </button>
                </div>

                {forWhom === 'other' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', animation: 'fadeIn 0.2s ease' }}>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        Tên người nhận hoa *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="dark-input"
                        placeholder="Họ tên người nhận..."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        Số điện thoại người nhận *
                      </label>
                      <input
                        type="tel"
                        required
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="dark-input"
                        placeholder="SĐT để shipper liên hệ..."
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)', fontStyle: 'italic', padding: '6px 2px' }}>
                    ✓ Hoa sẽ được giao trực tiếp cho bạn theo thông tin người đặt: <strong>{ordererName || '...'}</strong> ({ordererPhone || '...'})
                  </div>
                )}
              </div>

              {/* KHỐI 3: ĐỊA CHỈ & THỜI GIAN NHẬN HOA */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '20px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ color: '#a3e635' }}><MapPin size={18} /></div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                    3. Địa Chỉ & Lịch Trình Giao Hoa
                  </span>
                </div>

                <div className="order-form-grid-city-addr" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Tỉnh / Thành phố
                    </label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="dark-input"
                    >
                      {cities.map((c) => (
                        <option key={c} value={c} style={{ background: '#12141c', color: '#fff' }}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Địa chỉ chi tiết (Số nhà, đường, phường, quận...) *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="dark-input"
                      placeholder="Số nhà, tên toà nhà, căn hộ, tên đường..."
                    />
                  </div>
                </div>

                <div className="order-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Ngày hẹn giao hoa *
                    </label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="dark-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Khung giờ giao hoa
                    </label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                      className="dark-input"
                    >
                      {timeSlots.map((ts) => (
                        <option key={ts} value={ts} style={{ background: '#12141c', color: '#fff' }}>
                          {ts}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* KHỐI 4: DỊP TẶNG & THIỆP CHÚC MỪNG */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '20px',
                  padding: '18px',
                }}
              >
                <div className="order-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Dịp tặng hoa
                    </label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="dark-input"
                    >
                      {occasionsList.map((occ) => (
                        <option key={occ} value={occ} style={{ background: '#12141c', color: '#fff' }}>
                          {occ}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Phương thức thanh toán
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="dark-input"
                    >
                      <option value="Chưa thanh toán (COD khi nhận hoa)" style={{ background: '#12141c', color: '#fff' }}>
                        💵 COD / Thanh toán khi nhận hoa
                      </option>
                      <option value="Đã thanh toán (Chuyển khoản VietQR)" style={{ background: '#12141c', color: '#fff' }}>
                        📲 Chuyển khoản VietQR (Mã QR tự động)
                      </option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Nội dung thiệp chúc mừng viết tay (Miễn phí)
                  </label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="dark-input"
                    placeholder="Florist sẽ nắn nót viết thiệp nghệ thuật đính kèm bó hoa..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Ghi chú dặn dò giao hàng (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    className="dark-input"
                    placeholder="Ví dụ: Gọi trước 15 phút, giấu tên người gửi tạo bất ngờ, để ở quầy lễ tân..."
                  />
                </div>
              </div>

              {/* Action Button: Proceed to Confirmation */}
              <button
                type="submit"
                className="hero-cta-btn"
                style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: '15px' }}
              >
                <span>Kiểm Tra & Xác Nhận Thông Tin Cá Nhân</span>
                <div className="cta-icon-badge">
                  <ArrowRight size={18} />
                </div>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            STEP 2: MÀN HÌNH XÁC NHẬN THÔNG TIN CÁ NHÂN & ĐƠN HÀNG
            ======================================================== */}
        {step === 2 && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#a3e635', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                BƯỚC 2: XÁC NHẬN THÔNG TIN CÁ NHÂN & ĐƠN HÀNG
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Xác Nhận Trước Khi Đặt Hoa
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '13px', marginTop: '4px' }}>
                Vui lòng kiểm tra kỹ thông tin người nhận, địa chỉ giao hàng và thiệp mừng trước khi gửi yêu cầu.
              </p>
            </div>

            {/* CONFIRMATION CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {/* Card 1: Thông tin người đặt & Người nhận */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(250, 204, 21, 0.3)',
                  borderRadius: '20px',
                  padding: '18px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>👤</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#facc15' }}>
                      Thông Tin Cá Nhân & Liên Hệ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Sửa</span>
                  </button>
                </div>

                <div className="order-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '11px' }}>Người đặt hoa:</span>
                    <strong style={{ color: '#fff' }}>{ordererName}</strong>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{ordererPhone}</div>
                    {ordererEmail && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{ordererEmail}</div>}
                  </div>

                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '11px' }}>Người nhận hoa:</span>
                    <strong style={{ color: forWhom === 'other' ? '#ec4899' : '#fff' }}>
                      {forWhom === 'self' ? ordererName : recipientName}
                    </strong>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                      {forWhom === 'self' ? ordererPhone : recipientPhone}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: forWhom === 'self' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                        color: forWhom === 'self' ? '#facc15' : '#ec4899',
                        fontWeight: 700,
                      }}
                    >
                      {forWhom === 'self' ? '🌸 Tự nhận hoa' : '🎁 Gửi tặng người thân'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Địa chỉ & Thời gian */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📍</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                      Địa Chỉ & Lịch Trình Giao
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Sửa</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', display: 'block' }}>Địa chỉ nhận hoa:</span>
                    <strong style={{ color: '#fff' }}>{deliveryAddress}, {deliveryCity}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '6px' }}>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', display: 'block' }}>Ngày hẹn giao:</span>
                      <strong style={{ color: '#facc15' }}>{deliveryDate}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', display: 'block' }}>Khung giờ:</span>
                      <strong style={{ color: '#a3e635' }}>{deliveryTimeSlot}</strong>
                    </div>
                  </div>

                  {notes && (
                    <div style={{ marginTop: '6px', background: 'rgba(250, 204, 21, 0.06)', padding: '10px 12px', borderRadius: '12px', border: '1px dashed rgba(250, 204, 21, 0.25)' }}>
                      <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 700, display: 'block' }}>💌 Lời chúc thiệp viết tay:</span>
                      <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', fontSize: '12px' }}>
                        "{notes}"
                      </p>
                    </div>
                  )}

                  {shippingNotes && (
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
                      <strong>Dặn dò shipper:</strong> {shippingNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Chi tiết đơn hoa & Thanh toán */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '18px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💐</span>
                  <span>Danh Sách Tác Phẩm Hoa & Thanh Toán</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {rawItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.image || '/images/vyvy_lily_hong.jpg'}
                          alt={item.name}
                          style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{item.price.toLocaleString('vi-VN')}₫ x {item.quantity || 1}</div>
                        </div>
                      </div>
                      <div style={{ color: '#a3e635', fontWeight: 700 }}>
                        {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tạm tính:</span>
                    <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Phí vận chuyển:</span>
                    <span style={{ color: '#a3e635', fontWeight: 700 }}>Miễn phí (0₫)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hình thức thanh toán:</span>
                    <span style={{ color: '#facc15', fontWeight: 700 }}>{paymentMethod}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
                      fontSize: '17px',
                      fontWeight: 800,
                      color: '#ffffff',
                    }}
                  >
                    <span>Tổng Thanh Toán:</span>
                    <span style={{ color: '#facc15' }}>{totalAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="order-action-buttons-wrap" style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={16} />
                <span>Quay Lại Sửa</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="hero-cta-btn"
                style={{ flex: 1, justifyContent: 'center', padding: '14px 24px', fontSize: '15px' }}
              >
                <span>{loading ? 'Đang gửi thông báo đến Florist...' : 'Xác Nhận & Hoàn Tất Đặt Hoa'}</span>
                <div className="cta-icon-badge">
                  <Send size={16} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: ĐẶT HÀNG THÀNH CÔNG
            ======================================================== */}
        {step === 3 && successOrder && (
          <div style={{ textAlign: 'center', padding: '10px 6px' }}>
            {/* Success Icon */}
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'rgba(163, 230, 53, 0.15)',
                border: '2px solid #a3e635',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                color: '#a3e635',
                boxShadow: '0 0 35px rgba(163, 230, 53, 0.4)',
              }}
            >
              <CheckCircle2 size={44} />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Đặt Hoa Thành Công!
            </h2>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 20px',
                borderRadius: '9999px',
                background: 'rgba(250, 204, 21, 0.15)',
                border: '1px solid #facc15',
                color: '#facc15',
                fontWeight: 800,
                fontSize: '16px',
                marginBottom: '16px',
              }}
            >
              <span>Mã Đơn: {successOrder.orderCode}</span>
              <button
                type="button"
                onClick={() => handleCopy(successOrder.orderCode, 'Mã đơn')}
                title="Sao chép mã đơn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#facc15',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {copiedText === 'Mã đơn' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 24px' }}>
              Đơn hàng của quý khách đã được tiếp nhận thành công. Đội ngũ nghệ nhân Florist Studio đã nhận được thông báo và sẽ liên hệ xác nhận trong ít phút.
            </p>

            {/* VietQR Chuyển Khoản nếu chọn QR */}
            {paymentMethod.includes('VietQR') && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1.5px solid rgba(250, 204, 21, 0.35)',
                  borderRadius: '24px',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#facc15', marginBottom: '10px' }}>
                  Quét Mã VietQR Chuyển Khoản Tự Động
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                  <img
                    src={`https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent('VYVY ' + successOrder.orderCode)}&accountName=${encodeURIComponent('VY VY FLOWER STUDIO')}`}
                    alt="VietQR Chuyển Khoản"
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '16px',
                      background: '#ffffff',
                      padding: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                  />
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                  <div>Ngân hàng: <strong>MBBank (Quân Đội)</strong></div>
                  <div>
                    Số tài khoản: <strong style={{ color: '#a3e635' }}>0901234567</strong>{' '}
                    <button
                      type="button"
                      onClick={() => handleCopy('0901234567', 'STK')}
                      style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                    >
                      {copiedText === 'STK' ? '✓ Đã chép' : '[Chép STK]'}
                    </button>
                  </div>
                  <div>Chủ tài khoản: <strong>VY VY FLOWER STUDIO</strong></div>
                  <div>
                    Số tiền: <strong style={{ color: '#facc15' }}>{totalAmount.toLocaleString('vi-VN')}₫</strong>
                  </div>
                  <div>
                    Nội dung CK: <strong style={{ color: '#facc15' }}>VYVY {successOrder.orderCode}</strong>{' '}
                    <button
                      type="button"
                      onClick={() => handleCopy(`VYVY ${successOrder.orderCode}`, 'Nội dung CK')}
                      style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                    >
                      {copiedText === 'Nội dung CK' ? '✓ Đã chép' : '[Chép nội dung]'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Summary Pill */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '14px 18px',
                textAlign: 'left',
                marginBottom: '24px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Người nhận:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{forWhom === 'self' ? ordererName : recipientName} ({forWhom === 'self' ? ordererPhone : recipientPhone})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Ngày hẹn giao:</span>
                <span style={{ color: '#facc15', fontWeight: 700 }}>{deliveryDate} ({deliveryTimeSlot})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Địa chỉ:</span>
                <span style={{ color: '#fff', maxWidth: '300px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {deliveryAddress}, {deliveryCity}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Tổng thanh toán:</span>
                <span style={{ color: '#a3e635', fontWeight: 800 }}>{totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Actions */}
            <div className="order-action-buttons-wrap" style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setOrdersModalOpen(true);
                }}
                className="hero-cta-btn"
                style={{ flex: 1, justifyContent: 'center', padding: '12px 20px' }}
              >
                <span>Xem Tiến Độ Đơn Của Tôi</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
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
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 640px) {
          .order-modal-panel {
            padding: 22px 16px !important;
            border-radius: 24px 24px 16px 16px !important;
            max-height: 94vh !important;
            width: 100% !important;
          }
          .order-form-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .order-form-grid-city-addr {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .order-action-buttons-wrap {
            flex-direction: column-reverse !important;
            gap: 10px !important;
          }
          .order-action-buttons-wrap button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
