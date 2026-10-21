import React, { useState, useEffect, useContext } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { getCustomerOrders, cancelCustomerOrder } from '../services/api';
import { ToastContext } from '../App';
import { X, Package, RefreshCw, XCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ORDER_STEPS = [
  { key: 'Chờ xác nhận', label: 'Chờ xác nhận', desc: 'Shop đang duyệt đơn' },
  { key: 'Đã xác nhận', label: 'Đã xác nhận', desc: 'Duyệt thành công' },
  { key: 'Đang cắm hoa', label: 'Đang cắm hoa', desc: 'Florist nghệ thuật' },
  { key: 'Đang giao hàng', label: 'Đang giao hàng', desc: 'Shipper hỏa tốc' },
  { key: 'Hoàn thành', label: 'Hoàn thành', desc: 'Đã nhận hoa tận tay' },
];

const CANCEL_REASONS = [
  'Đổi ý, không còn nhu cầu',
  'Muốn đổi mẫu hoa hoặc đổi số lượng',
  'Thay đổi thời gian / địa chỉ nhận hoa',
  'Đặt nhầm thông tin người nhận',
  'Lý do khác'
];

export default function MyOrdersModal() {
  const addToast = useContext(ToastContext);
  const { customer, ordersModalOpen, setOrdersModalOpen } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal xác nhận hủy đơn
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchOrders = async () => {
    if (!customer?.phone) return;
    setLoading(true);
    try {
      const data = await getCustomerOrders(customer.phone);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ordersModalOpen && customer?.phone) {
      fetchOrders();
    }
  }, [ordersModalOpen, customer]);

  if (!ordersModalOpen) return null;

  const getStepIndex = (status) => {
    if (status === 'Đã hủy') return -1;
    return ORDER_STEPS.findIndex(s => s.key === status);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    setCancelError('');
    const finalReason = cancelReason === 'Lý do khác' && customReason.trim()
      ? customReason.trim()
      : cancelReason;

    try {
      const res = await cancelCustomerOrder(cancellingOrder.id, customer?.phone, finalReason);
      if (res.success) {
        if (addToast) addToast(`Đã hủy đơn hàng ${cancellingOrder.orderCode} thành công!`);
        setOrders(prev => prev.map(o => o.id === cancellingOrder.id ? {
          ...o,
          status: 'Đã hủy',
          notes: (o.notes || '') + ` [Khách hủy: ${finalReason}]`
        } : o));
        setCancellingOrder(null);
      } else {
        setCancelError(res.error || 'Không thể hủy đơn hàng này!');
      }
    } catch (err) {
      setCancelError(err.message || 'Lỗi kết nối máy chủ!');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setOrdersModalOpen(false)}>
      <div
        className="modal-content glass-panel"
        style={{
          maxWidth: '680px',
          width: '92%',
          padding: '36px 30px',
          borderRadius: '32px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(250, 204, 21, 0.2)',
          border: '1px solid rgba(250, 204, 21, 0.3)',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setOrdersModalOpen(false)}
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
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 700, letterSpacing: '1px' }}>
              ● THEO DÕI THỜI GIAN THỰC
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              Đơn Hoa Của Tôi
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>
              Khách hàng: <strong style={{ color: '#fff' }}>{customer?.name}</strong> ({customer?.phone})
            </p>
          </div>

          <button
            onClick={fetchOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Cập nhật</span>
          </button>
        </div>

        {/* Orders list */}
        {loading && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
            Đang tải danh sách đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
            <Package size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Bạn chưa có đơn đặt hoa nào
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '20px' }}>
              Khám phá bộ sưu tập hoa nghệ thuật 3D và tạo đơn hàng đầu tiên ngay!
            </p>
            <button
              onClick={() => setOrdersModalOpen(false)}
              className="hero-cta-btn"
              style={{ margin: '0 auto' }}
            >
              <span>Xem Bộ Sưu Tập</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => {
              const currentStepIdx = getStepIndex(order.status);
              const isCancelled = order.status === 'Đã hủy';

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '20px',
                    position: 'relative',
                  }}
                >
                  {/* Order header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{
                        fontFamily: 'monospace',
                        color: '#facc15',
                        fontWeight: 800,
                        fontSize: '15px',
                        marginRight: '10px',
                      }}>
                        {order.orderCode}
                      </span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                        Ngày hẹn giao: {order.deliveryDate || 'Trong ngày'}
                      </span>
                    </div>

                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: isCancelled ? 'rgba(244,63,94,0.15)' : order.status === 'Hoàn thành' ? 'rgba(163,230,53,0.15)' : 'rgba(250,204,21,0.15)',
                      color: isCancelled ? '#f43f5e' : order.status === 'Hoàn thành' ? '#a3e635' : '#facc15',
                      border: `1px solid ${isCancelled ? '#f43f5e' : order.status === 'Hoàn thành' ? '#a3e635' : '#facc15'}`,
                    }}>
                      ● {order.status}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div style={{ marginBottom: '18px' }}>
                    {Array.isArray(order.items) && order.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                        <span>{it.name} x {it.quantity || 1}</span>
                        <span style={{ color: '#a3e635' }}>{Number(it.price || order.totalAmount).toLocaleString('vi-VN')}₫</span>
                      </div>
                    ))}
                    {order.notes && (
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: '6px' }}>
                        Thiệp: "{order.notes}"
                      </div>
                    )}
                  </div>

                  {/* Stepper Pipeline: Visual Workflow */}
                  {!isCancelled ? (
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                        Tiến độ chuẩn bị & giao hàng:
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '6px',
                        position: 'relative',
                      }}>
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;

                          return (
                            <div
                              key={step.key}
                              style={{
                                textAlign: 'center',
                                padding: '8px 4px',
                                borderRadius: '12px',
                                background: isCurrent
                                  ? 'rgba(250, 204, 21, 0.15)'
                                  : isDone
                                    ? 'rgba(163, 230, 53, 0.1)'
                                    : 'rgba(255, 255, 255, 0.02)',
                                border: isCurrent
                                  ? '1.5px solid #facc15'
                                  : isDone
                                    ? '1px solid rgba(163, 230, 53, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.06)',
                              }}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: isDone ? '#a3e635' : isCurrent ? '#facc15' : 'rgba(255,255,255,0.1)',
                                color: isDone || isCurrent ? '#000' : 'rgba(255,255,255,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 6px',
                                fontSize: '11px',
                                fontWeight: 800,
                              }}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                fontWeight: isCurrent ? 800 : 600,
                                color: isCurrent ? '#facc15' : isDone ? '#fff' : 'rgba(255,255,255,0.4)',
                                lineHeight: '1.2',
                              }}>
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cho phép khách hàng hủy đơn hàng trước khi Shop duyệt */}
                      {order.status === 'Chờ xác nhận' && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          background: 'rgba(250, 204, 21, 0.05)',
                          border: '1px solid rgba(250, 204, 21, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Info size={16} style={{ color: '#facc15', flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)' }}>
                              Đơn đang chờ Shop duyệt. Bạn có thể <strong>hủy đơn miễn phí</strong> lúc này.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelReason(CANCEL_REASONS[0]);
                              setCustomReason('');
                              setCancelError('');
                            }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              background: 'rgba(244, 63, 94, 0.12)',
                              border: '1px solid rgba(244, 63, 94, 0.35)',
                              color: '#f43f5e',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.25)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
                            }}
                          >
                            <XCircle size={14} />
                            <span>Hủy Đơn Hàng</span>
                          </button>
                        </div>
                      )}

                      {order.status !== 'Chờ xác nhận' && !isCancelled && (
                        <div style={{
                          marginTop: '14px',
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <CheckCircle size={14} style={{ color: '#a3e635' }} />
                          <span>Shop đã duyệt đơn & chuẩn bị cắm hoa. Nếu cần đổi thông tin gấp, vui lòng liên hệ Hotline Vy Vy Flower.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(244,63,94,0.1)',
                      color: '#f43f5e',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}>
                      Đơn hàng đã được hủy theo yêu cầu.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal xác nhận hủy đơn hàng dành cho khách */}
        {cancellingOrder && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => !isCancelling && setCancellingOrder(null)}
          >
            <div
              style={{
                background: '#13151f',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '24px',
                maxWidth: '480px',
                width: '100%',
                padding: '28px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(244,63,94,0.15)',
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Xác Nhận Hủy Đơn Hàng
                  </h3>
                  <span style={{ fontSize: '13px', color: '#facc15', fontFamily: 'monospace', fontWeight: 700 }}>
                    {cancellingOrder.orderCode}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, marginBottom: '18px' }}>
                Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi xác nhận hủy, đơn hàng sẽ dừng xử lý ngay lập tức.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  Lý do bạn muốn hủy đơn:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {CANCEL_REASONS.map(r => (
                    <label
                      key={r}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: cancelReason === r ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255,255,255,0.03)',
                        border: cancelReason === r ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: cancelReason === r ? '#facc15' : 'rgba(255,255,255,0.8)',
                      }}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        style={{ accentColor: '#facc15' }}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {cancelReason === 'Lý do khác' && (
                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    placeholder="Vui lòng chia sẻ lý do chi tiết..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>
              )}

              {cancelError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid #f43f5e',
                  color: '#f43f5e',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  {cancelError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancellingOrder(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Giữ Đơn Hàng
                </button>

                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '9999px',
                    background: '#f43f5e',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: isCancelling ? 'not-allowed' : 'pointer',
                    opacity: isCancelling ? 0.7 : 1,
                    boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)',
                  }}
                >
                  {isCancelling ? 'Đang Hủy...' : 'Xác Nhận Hủy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
