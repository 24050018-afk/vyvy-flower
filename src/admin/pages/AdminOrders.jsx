import React, { useState, useEffect, useContext } from 'react';
import { getOrders, updateOrder, deleteOrder } from '../../services/api';
import { ToastContext } from '../../App';
import { Search, RefreshCw, Eye, Trash2, ArrowRight, X, Download, Printer } from 'lucide-react';
import { exportToCsv, cleanPhone, cleanEmail, cleanMoney, cleanText, cleanDate, cleanDateTime, cleanList } from '../../utils/csvExport';

const STATUS_PIPELINE = [
  {
    key: 'Chờ xác nhận',
    stepNumber: 1,
    title: 'Chờ xác nhận',
    desc: 'Khách vừa đặt đơn qua web, chờ florist duyệt thông tin',
    next: 'Đã xác nhận',
    nextLabel: 'Xác Nhận Đơn ➔',
    nextColor: '#3b82f6',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  {
    key: 'Đã xác nhận',
    stepNumber: 2,
    title: 'Đã xác nhận',
    desc: 'Đã xác nhận với khách, chờ đưa vào xưởng cắm hoa',
    next: 'Đang cắm hoa',
    nextLabel: 'Bắt Đầu Cắm Hoa ➔',
    nextColor: '#facc15',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.35)',
  },
  {
    key: 'Đang cắm hoa',
    stepNumber: 3,
    title: 'Đang cắm hoa',
    desc: 'Florist nghệ thuật đang cắm, tỉa và đính kèm thiệp',
    next: 'Đang giao hàng',
    nextLabel: 'Bàn Giao Vận Chuyển ➔',
    nextColor: '#c084fc',
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.12)',
    border: 'rgba(250, 204, 21, 0.35)',
  },
  {
    key: 'Đang giao hàng',
    stepNumber: 4,
    title: 'Đang giao hàng',
    desc: 'Shipper đang trên đường giao hoa tận tay người nhận',
    next: 'Hoàn thành',
    nextLabel: 'Xác Nhận Giao Xong ✔',
    nextColor: '#a3e635',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: 'rgba(192, 132, 252, 0.35)',
  },
  {
    key: 'Hoàn thành',
    stepNumber: 5,
    title: 'Hoàn thành',
    desc: 'Người nhận đã nhận hoa trọn vẹn, đơn hàng kết thúc',
    next: null,
    nextLabel: null,
    color: '#a3e635',
    bg: 'rgba(163, 230, 53, 0.12)',
    border: 'rgba(163, 230, 53, 0.35)',
  },
];

const CANCELLED_STATUS = {
  key: 'Đã hủy',
  title: 'Đã hủy',
  desc: 'Đơn hàng đã hủy',
  color: '#f43f5e',
  bg: 'rgba(244, 63, 94, 0.12)',
  border: 'rgba(244, 63, 94, 0.35)',
};

export default function AdminOrders() {
  const addToast = useContext(ToastContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [detailOrder, setDetailOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filterOptions = ['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang cắm hoa', 'Đang giao hàng', 'Hoàn thành', 'Đã hủy'];

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      addToast('Không thể tải danh sách đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh orders every 12 seconds so admin sees incoming orders
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  // Update order status through sequential validation
  const handleAdvanceStep = async (order) => {
    const stepConfig = STATUS_PIPELINE.find(s => s.key === order.status);
    if (!stepConfig || !stepConfig.next) {
      addToast('Đơn hàng đã ở bước cuối cùng, không thể chuyển tiếp!', 'error');
      return;
    }

    const nextStatus = stepConfig.next;
    setUpdatingId(order.id);

    try {
      await updateOrder(order.id, { status: nextStatus });
      addToast(`Đã chuyển đơn "${order.orderCode}" sang bước: [${nextStatus}]!`);
      if (detailOrder?.id === order.id) {
        setDetailOrder(prev => ({ ...prev, status: nextStatus }));
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Lỗi khi cập nhật trạng thái!', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    if (order.status === 'Hoàn thành') {
      addToast('Đơn hàng đã hoàn thành không thể hủy!', 'error');
      return;
    }

    if (window.confirm(`Xác nhận HỦY đơn hàng "${order.orderCode}"?`)) {
      setUpdatingId(order.id);
      try {
        await updateOrder(order.id, { status: 'Đã hủy' });
        addToast(`Đã chuyển đơn "${order.orderCode}" sang trạng thái [Đã hủy]!`);
        if (detailOrder?.id === order.id) {
          setDetailOrder(prev => ({ ...prev, status: 'Đã hủy' }));
        }
        loadData();
      } catch (err) {
        addToast('Lỗi khi hủy đơn hàng!', 'error');
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Xác nhận xóa vĩnh viễn đơn hàng "${code}"?`)) {
      try {
        await deleteOrder(id);
        addToast(`Đã xóa đơn hàng "${code}" thành công!`);
        if (detailOrder?.id === id) setDetailOrder(null);
        loadData();
      } catch (err) {
        addToast('Lỗi khi xóa đơn hàng!', 'error');
      }
    }
  };

  const filtered = orders
    .filter(o => filterStatus === 'Tất cả' || o.status === filterStatus)
    .filter(o =>
      (o.orderCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone || '').toLowerCase().includes(search.toLowerCase())
    );

  const pendingCount = orders.filter(o => o.status === 'Chờ xác nhận').length;
  const confirmedCount = orders.filter(o => o.status === 'Đã xác nhận').length;
  const arrangingCount = orders.filter(o => o.status === 'Đang cắm hoa').length;
  const shippingCount = orders.filter(o => o.status === 'Đang giao hàng').length;
  const completedCount = orders.filter(o => o.status === 'Hoàn thành').length;
  const totalRevenue = orders.filter(o => o.status === 'Hoàn thành').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const getStatusStyle = (status) => {
    const found = STATUS_PIPELINE.find(s => s.key === status);
    if (found) return found;
    return CANCELLED_STATUS;
  };

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: 'Mã đơn hàng', key: (o) => cleanText(o.orderCode) },
        { label: 'Khách hàng', key: (o) => cleanText(o.customerName) },
        { label: 'Số điện thoại', key: (o) => cleanPhone(o.customerPhone) },
        { label: 'Email', key: (o) => cleanEmail(o.customerEmail) },
        { label: 'Địa chỉ nhận hàng', key: (o) => cleanText(o.deliveryAddress) },
        { label: 'Ngày giao', key: (o) => cleanDate(o.deliveryDate) },
        { label: 'Dịp tặng', key: (o) => cleanText(o.occasion) },
        { label: 'Sản phẩm đặt', key: (o) => cleanList(o.items) },
        { label: 'Tổng tiền (VNĐ)', key: (o) => cleanMoney(o.totalAmount) },
        { label: 'Trạng thái đơn hàng', key: (o) => cleanText(o.status) },
        { label: 'Trạng thái thanh toán', key: (o) => cleanText(o.paymentStatus, 'Chưa thanh toán') },
        { label: 'Ghi chú', key: (o) => cleanText(o.notes, 'Không có') },
        { label: 'Thời gian đặt', key: (o) => cleanDateTime(o.createdAt) },
      ];

      const today = new Date().toISOString().split('T')[0];
      exportToCsv(`Don_Hang_VyVy_${today}`, columns, filtered);
      addToast(`Đã xuất thành công ${filtered.length} đơn hàng ra file CSV!`);
    } catch (err) {
      addToast(err.message || 'Lỗi khi xuất file CSV!', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: 700, letterSpacing: '1px' }}>
              ● WORKFLOW PIPELINE: vyvy_flower_db.orders
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              Quy Trình & Quản Lý Đơn Hàng
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '14px', marginTop: '4px' }}>
              Quy trình chuẩn: <strong style={{ color: '#06b6d4' }}>Chờ xác nhận</strong> ➔ <strong style={{ color: '#3b82f6' }}>Đã xác nhận</strong> ➔ <strong style={{ color: '#facc15' }}>Đang cắm hoa</strong> ➔ <strong style={{ color: '#c084fc' }}>Đang giao</strong> ➔ <strong style={{ color: '#a3e635' }}>Hoàn thành</strong> (Bắt buộc theo từng bước)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '9999px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Xuất danh sách đơn hàng đang hiển thị ra file CSV Excel"
            >
              <Download size={15} />
              <span>Xuất CSV ({filtered.length})</span>
            </button>

            <button
              onClick={loadData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* 5-Step Pipeline Overview Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          marginTop: '20px',
        }}>
          <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '16px', borderLeft: '3px solid #06b6d4' }}>
            <div style={{ fontSize: '10.5px', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>1. Chờ xác nhận</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{pendingCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '16px', borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '10.5px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase' }}>2. Đã xác nhận</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{confirmedCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '16px', borderLeft: '3px solid #facc15' }}>
            <div style={{ fontSize: '10.5px', color: '#facc15', fontWeight: 700, textTransform: 'uppercase' }}>3. Đang cắm hoa</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{arrangingCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '16px', borderLeft: '3px solid #c084fc' }}>
            <div style={{ fontSize: '10.5px', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>4. Đang giao hàng</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{shippingCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '16px', borderLeft: '3px solid #a3e635' }}>
            <div style={{ fontSize: '10.5px', color: '#a3e635', fontWeight: 700, textTransform: 'uppercase' }}>5. Hoàn thành</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{completedCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '16px', borderLeft: '3px solid #facc15' }}>
            <div style={{ fontSize: '10.5px', color: '#facc15', fontWeight: 700, textTransform: 'uppercase' }}>Doanh thu hoàn thành</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#facc15', marginTop: '6px' }}>{totalRevenue.toLocaleString('vi-VN')}₫</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginTop: '16px' }}>
        {/* Filter bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
            <input
              type="text"
              placeholder="Tìm theo mã đơn (ORD-2026), tên khách, SĐT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: '40px', width: '100%', fontSize: '13.5px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
          </div>

          <div className="admin-filter-scroll-row" style={{ width: '100%' }}>
            {filterOptions.map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filterStatus === st ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: filterStatus === st ? '#facc15' : 'rgba(255, 255, 255, 0.65)',
                  border: filterStatus === st ? '1px solid #facc15' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table View with Sequential Actions */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Mẫu Hoa Đặt</th>
                <th>Tổng Tiền</th>
                <th>Ngày Hẹn</th>
                <th>Trạng Thái Hiện Tại</th>
                <th style={{ textAlign: 'center' }}>Thao Tác Theo Trình Tự Bắt Buộc</th>
                <th style={{ textAlign: 'right' }}>Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const stepConfig = getStatusStyle(order.status);
                const isUpdating = updatingId === order.id;
                const canAdvance = !!stepConfig.next;
                const isFinished = order.status === 'Hoàn thành' || order.status === 'Đã hủy';

                return (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#facc15', fontWeight: 800 }}>
                        {order.orderCode}
                      </span>
                    </td>
                    <td>
                      <div style={{ color: '#fff', fontWeight: 700 }}>{order.customerName}</div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '12px' }}>{order.customerPhone}</div>
                    </td>
                    <td>
                      <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', fontWeight: 500 }}>
                        {Array.isArray(order.items) && order.items.length > 0
                          ? order.items.map(it => it.name).join(', ')
                          : 'Tác phẩm hoa yêu cầu'}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#fff', fontWeight: 700 }}>
                        {order.totalAmount?.toLocaleString('vi-VN')}₫
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                        {order.paymentStatus}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px' }}>
                        {order.deliveryDate}
                      </div>
                      <div style={{ fontSize: '11px', color: '#facc15' }}>
                        {order.occasion}
                      </div>
                    </td>
                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: stepConfig.bg,
                        color: stepConfig.color,
                        border: `1px solid ${stepConfig.border}`,
                      }}>
                        <span>●</span>
                        <span>{order.status}</span>
                      </div>
                    </td>

                    {/* Sequential Workflow Actions: NO skipping allowed */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {canAdvance && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleAdvanceStep(order)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: `1px solid ${stepConfig.nextColor}`,
                              color: stepConfig.nextColor,
                              fontWeight: 700,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: `0 0 10px ${stepConfig.nextColor}33`,
                            }}
                            title={`Chuyển sang bước tiếp theo: ${stepConfig.next}`}
                          >
                            <span>{isUpdating ? 'Đang lưu...' : stepConfig.nextLabel}</span>
                          </button>
                        )}

                        {!isFinished && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleCancelOrder(order)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '9999px',
                              background: 'rgba(244, 63, 94, 0.1)',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                              color: '#f43f5e',
                              fontWeight: 600,
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                            title="Hủy đơn hàng này"
                          >
                            Hủy
                          </button>
                        )}

                        {order.status === 'Hoàn thành' && (
                          <span style={{ color: '#a3e635', fontSize: '12px', fontWeight: 700 }}>
                            ✓ Đã giao trọn vẹn
                          </span>
                        )}

                        {order.status === 'Đã hủy' && (
                          <span style={{ color: '#f43f5e', fontSize: '12px', fontWeight: 600 }}>
                            ✕ Đã hủy đơn
                          </span>
                        )}
                      </div>
                    </td>

                    {/* View Details / Delete */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setDetailOrder(order)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                          }}
                        >
                          <Eye size={13} />
                          <span>Xem</span>
                        </button>
                        <button
                          onClick={() => handleDelete(order.id, order.orderCode)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            color: '#f43f5e',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal with Interactive 5-Step Pipeline */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div
            className="modal-content glass-panel"
            style={{
              maxWidth: '680px',
              width: '92%',
              padding: '36px 30px',
              borderRadius: '32px',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(250, 204, 21, 0.25)',
              border: '1px solid rgba(250, 204, 21, 0.35)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontFamily: 'monospace', color: '#facc15', fontSize: '14px', fontWeight: 800 }}>
                  {detailOrder.orderCode}
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  Tiến Trình & Chi Tiết Đơn Hàng
                </h3>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper Pipeline Visual */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '20px',
              padding: '18px 14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Trình tự xử lý đơn hoa bắt buộc:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {STATUS_PIPELINE.map((step, idx) => {
                  const currentIdx = STATUS_PIPELINE.findIndex(s => s.key === detailOrder.status);
                  const isDone = currentIdx > idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div
                      key={step.key}
                      style={{
                        textAlign: 'center',
                        padding: '10px 4px',
                        borderRadius: '14px',
                        background: isCurrent ? 'rgba(250, 204, 21, 0.15)' : isDone ? 'rgba(163, 230, 53, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: isCurrent ? '1.5px solid #facc15' : isDone ? '1px solid rgba(163, 230, 53, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
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
                        {step.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><strong>Người nhận:</strong> {detailOrder.customerName}</div>
                  <div><strong>Số điện thoại:</strong> {detailOrder.customerPhone}</div>
                  <div><strong>Ngày hẹn giao:</strong> <span style={{ color: '#facc15' }}>{detailOrder.deliveryDate}</span></div>
                  <div><strong>Dịp tặng:</strong> {detailOrder.occasion}</div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <strong>Địa chỉ giao:</strong> {detailOrder.deliveryAddress || 'Nhận tại cửa hàng'}
                </div>
              </div>

              {/* Itemized Products Ordered */}
              {Array.isArray(detailOrder.items) && detailOrder.items.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    Danh Sách Hoa Đã Đặt ({detailOrder.items.length} tác phẩm):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {detailOrder.items.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                          borderBottom: idx < detailOrder.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={it.image || '/images/vyvy_lily_hong.jpg'}
                            alt={it.name}
                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{it.name}</div>
                            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>
                              {Number(it.price || 0).toLocaleString('vi-VN')}₫ x {it.quantity || 1}
                            </div>
                          </div>
                        </div>
                        <div style={{ color: '#a3e635', fontWeight: 700, fontSize: '13px' }}>
                          {((Number(it.price) || 0) * (Number(it.quantity) || 1)).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailOrder.notes && (
                <div style={{ background: 'rgba(250, 204, 21, 0.05)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
                  <strong style={{ color: '#facc15' }}>Lời chúc thiệp đính kèm:</strong>
                  <p style={{ marginTop: '4px', color: 'rgba(255, 255, 255, 0.95)', fontStyle: 'italic' }}>
                    "{detailOrder.notes}"
                  </p>
                </div>
              )}

              {/* Action bar: ONLY ALLOW NEXT SEQUENTIAL STEP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Tổng thanh toán ({detailOrder.paymentStatus})</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#facc15' }}>
                    {detailOrder.totalAmount?.toLocaleString('vi-VN')}₫
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    title="In phiếu giao hoa kèm thiệp mừng cho shipper"
                  >
                    <Printer size={15} />
                    <span>In Phiếu Giao</span>
                  </button>
                  {(() => {
                    const stepConfig = getStatusStyle(detailOrder.status);
                    if (stepConfig.next) {
                      return (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStep(detailOrder)}
                          className="hero-cta-btn"
                          style={{ padding: '10px 22px' }}
                        >
                          <span>{stepConfig.nextLabel}</span>
                          <div className="cta-icon-badge">
                            <ArrowRight size={16} />
                          </div>
                        </button>
                      );
                    }
                    if (detailOrder.status === 'Hoàn thành') {
                      return (
                        <div style={{ color: '#a3e635', fontWeight: 800, padding: '10px 16px', background: 'rgba(163,230,53,0.1)', borderRadius: '9999px', border: '1px solid #a3e635' }}>
                          ✓ Đã hoàn tất toàn bộ quy trình
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {detailOrder.status !== 'Hoàn thành' && detailOrder.status !== 'Đã hủy' && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(detailOrder)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '9999px',
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        color: '#f43f5e',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      Hủy Đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
