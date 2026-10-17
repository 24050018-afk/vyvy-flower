import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../App';
import { createOrder } from '../services/api';
import { useCustomer } from '../context/CustomerContext';
import { Sparkles, Phone, Mail, MapPin, Clock, Check, Send } from 'lucide-react';

const occasions = ['Sinh nhật', 'Tình nhân', 'Kỷ niệm', 'Khai trương', 'Hoa cưới', 'Sự kiện VIP', 'Chúc mừng'];

export default function ContactPage() {
  const addToast = useContext(ToastContext);
  const { customer, requireAuth } = useCustomer();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    occasion: 'Sinh nhật',
    product: '',
    budget: '',
    address: '',
    note: '',
  });

  useEffect(() => {
    if (customer) {
      setForm(prev => ({
        ...prev,
        name: customer.name || prev.name,
        phone: customer.phone || prev.phone,
        email: customer.email || prev.email,
        address: customer.address || prev.address,
      }));
    }
  }, [customer]);
  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) {
      addToast('Vui lòng đăng nhập hoặc tạo tài khoản để gửi yêu cầu đặt hoa!', 'error');
      requireAuth((authedUser) => {
        setForm(prev => ({
          ...prev,
          name: authedUser.name || prev.name,
          phone: authedUser.phone || prev.phone,
          email: authedUser.email || prev.email,
          address: authedUser.address || prev.address,
        }));
      });
      return;
    }

    if (!form.name || !form.phone) {
      addToast('Vui lòng điền họ tên và số điện thoại liên hệ!', 'error');
      return;
    }
    setLoading(true);

    try {
      // Calculate estimated price based on budget or default
      const budgetMap = {
        '500k-1tr': 750000,
        '1tr-2tr': 1500000,
        '2tr-5tr': 3000000,
        'tren-5tr': 5500000,
      };
      const totalAmount = budgetMap[form.budget] || 850000;

      const orderData = {
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        deliveryDate: form.date || new Date().toISOString().split('T')[0],
        deliveryAddress: form.address,
        occasion: form.occasion,
        items: [{ name: form.product || `Thiết kế riêng cho ${form.occasion}`, price: totalAmount, quantity: 1 }],
        totalAmount: totalAmount,
        notes: form.note,
      };

      const res = await createOrder(orderData);
      setSubmittedOrder({ ...orderData, orderCode: res.orderCode });
      addToast(`Đã lưu đơn hàng ${res.orderCode} vào MySQL Database thành công!`);
    } catch (err) {
      addToast(err.message || 'Lỗi khi tạo đơn hàng trong database!', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submittedOrder) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '140px',
        paddingBottom: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5,
      }}>
        <div className="glass-panel" style={{
          maxWidth: '560px',
          width: '100%',
          padding: '48px 36px',
          textAlign: 'center',
          borderRadius: '32px',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(250, 204, 21, 0.15)',
            border: '2px solid #facc15',
            color: '#facc15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Check size={36} />
          </div>

          <div style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '9999px',
            background: 'rgba(163, 230, 53, 0.15)',
            color: '#a3e635',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            LƯU VÀO SQLITE THÀNH CÔNG
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Đặt Hoa Thành Công!
          </h2>

          <div style={{ color: '#facc15', fontFamily: 'monospace', fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
            Mã đơn: {submittedOrder.orderCode}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
            Cảm ơn bạn <strong style={{ color: '#fff' }}>{submittedOrder.customerName}</strong>. Đơn hàng của bạn đã được ghi nhận trực tiếp vào cơ sở dữ liệu của MR.studio và hiển thị trên màn hình quản trị của Florist.
          </p>

          <div style={{
            background: 'rgba(10, 11, 16, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '32px',
            fontSize: '13px',
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.75)',
          }}>
            <div><strong>Điện thoại:</strong> {submittedOrder.customerPhone}</div>
            <div><strong>Dịp tặng:</strong> {submittedOrder.occasion}</div>
            <div><strong>Ngày hẹn giao:</strong> {submittedOrder.deliveryDate}</div>
            {submittedOrder.deliveryAddress && <div><strong>Địa chỉ:</strong> {submittedOrder.deliveryAddress}</div>}
            <div><strong>Tạm tính:</strong> <span style={{ color: '#facc15', fontWeight: 700 }}>{submittedOrder.totalAmount?.toLocaleString('vi-VN')}₫</span></div>
          </div>

          <button
            className="hero-cta-btn"
            style={{ padding: '8px 24px' }}
            onClick={() => {
              setSubmittedOrder(null);
              setForm({ name: '', phone: '', email: '', date: '', occasion: 'Sinh nhật', product: '', budget: '', address: '', note: '' });
            }}
          >
            <span>Tạo Đơn Hàng Mới</span>
            <div className="cta-icon-badge"><Sparkles size={18} /></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '130px',
      paddingBottom: '100px',
      position: 'relative',
      zIndex: 5,
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 28px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="cross-marks" style={{ marginBottom: '12px' }}>
            <span>x</span><span>x</span><span>x</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
            Liên Hệ & <span className="text-highlight-yellow">Đặt Hoa Riêng</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '580px', margin: '0 auto', fontSize: '15px' }}>
            Thông tin đặt hoa sẽ được lưu trữ trực tiếp vào MySQL Database và cập nhật lên MySQL Workbench
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
        }}>
          
          {/* Left Column: Form */}
          <div className="glass-panel" style={{ padding: '36px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>
              Thông Tin Yêu Cầu
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="dark-input"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    placeholder="0901 234 567"
                    className="dark-input"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="dark-input"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Dịp đặc biệt
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {occasions.map(occ => (
                    <button
                      type="button"
                      key={occ}
                      onClick={() => setForm({ ...form, occasion: occ })}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        background: form.occasion === occ ? '#facc15' : 'rgba(255,255,255,0.05)',
                        color: form.occasion === occ ? '#0b0c10' : 'rgba(255,255,255,0.7)',
                        border: form.occasion === occ ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                    Ngày nhận hoa
                  </label>
                  <input
                    type="date"
                    className="dark-input"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                    Ngân sách dự kiến
                  </label>
                  <select
                    className="dark-input"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Chọn khoảng giá...</option>
                    <option value="500k-1tr">500.000₫ - 1.000.000₫</option>
                    <option value="1tr-2tr">1.000.000₫ - 2.000.000₫</option>
                    <option value="2tr-5tr">2.000.000₫ - 5.000.000₫</option>
                    <option value="tren-5tr">Trên 5.000.000₫ (Bespoke VIP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Địa chỉ giao hoa
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường, quận..."
                  className="dark-input"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Ghi chú riêng / Nội dung thiệp viết tay
                </label>
                <textarea
                  rows="3"
                  placeholder="Yêu cầu loại hoa, màu sắc chủ đạo, hoặc lời chúc muốn in trên thiệp..."
                  className="dark-input"
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hero-cta-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                <span>{loading ? 'Đang lưu vào MySQL...' : 'Gửi Đơn Hàng Vào Database'}</span>
                <div className="cta-icon-badge">
                  <Send size={18} />
                </div>
              </button>
            </form>
          </div>

          {/* Right Column: Studio Info & 3D Visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '36px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>
                Atelier Studio
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'rgba(250, 204, 21, 0.12)', border: '1px solid rgba(250, 204, 21, 0.3)',
                    color: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>Địa Chỉ Trực Tiếp</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '2px' }}>
                      88 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'rgba(163, 230, 53, 0.12)', border: '1px solid rgba(163, 230, 53, 0.3)',
                    color: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>Hotline Tư Vấn 24/7</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '2px' }}>
                      0901 234 567 - 0988 765 432
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>Giờ Mở Cửa</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '2px' }}>
                      08:00 - 21:30 hàng ngày (kể cả Lễ, Tết)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="showcase-card" style={{ height: '260px' }}>
              <img
                src="/images/spheres_yellow.jpg"
                alt="Studio 3D art"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(12,13,18,0.9) 100%)',
              }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
                <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
                  VIP FLORAL CONCIERGE
                </span>
                <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
                  Đơn hàng được lưu tự động vào database
                </h4>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
