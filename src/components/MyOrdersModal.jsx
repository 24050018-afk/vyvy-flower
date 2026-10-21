import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { getCustomerOrders } from '../services/api';
import { X, Package, RefreshCw } from 'lucide-react';

const ORDER_STEPS = [
  { key: 'Chờ xác nhận', label: 'Chờ xác nhận', desc: 'Shop đang duyệt đơn' },
  { key: 'Đã xác nhận', label: 'Đã xác nhận', desc: 'Duyệt thành công' },
  { key: 'Đang cắm hoa', label: 'Đang cắm hoa', desc: 'Florist nghệ thuật' },
  { key: 'Đang giao hàng', label: 'Đang giao hàng', desc: 'Shipper hỏa tốc' },
  { key: 'Hoàn thành', label: 'Hoàn thành', desc: 'Đã nhận hoa tận tay' },
];

export default function MyOrdersModal() {
  const { customer, ordersModalOpen, setOrdersModalOpen } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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
      </div>
    </div>
  );
}
