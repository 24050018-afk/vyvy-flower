import React, { useState, useEffect, useContext } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/api';
import { ToastContext } from '../../App';
import { Plus, Search, Edit3, Trash2, X, Check, RefreshCw, UserCheck, Download, Phone, Mail, MapPin, LayoutGrid, List } from 'lucide-react';
import { exportToCsv, cleanPhone, cleanEmail, cleanMoney, cleanNumber, cleanText, cleanDateTime } from '../../utils/csvExport';

const statusColors = {
  'VIP': { bg: 'rgba(250, 204, 21, 0.15)', color: '#facc15', border: 'rgba(250, 204, 21, 0.4)' },
  'Thân thiết': { bg: 'rgba(163, 230, 53, 0.12)', color: '#a3e635', border: 'rgba(163, 230, 53, 0.3)' },
  'Thường': { bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' },
  'Mới': { bg: 'rgba(192, 132, 252, 0.12)', color: '#c084fc', border: 'rgba(192, 132, 252, 0.3)' },
};

export default function AdminCustomers() {
  const addToast = useContext(ToastContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewMode, setViewMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'Mới',
  });

  const statuses = ['Tất cả', 'VIP', 'Thân thiết', 'Thường', 'Mới'];

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      addToast('Không thể tải khách hàng từ database!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', phone: '', email: '', address: '', status: 'Mới' });
    setShowModal(true);
  };

  const openEdit = (cust) => {
    setEditItem(cust);
    setForm({
      name: cust.name,
      phone: cust.phone,
      email: cust.email || '',
      address: cust.address || '',
      status: cust.status || 'Mới',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      addToast('Vui lòng điền họ tên và số điện thoại!', 'error');
      return;
    }

    try {
      if (editItem) {
        await updateCustomer(editItem.id, form);
        addToast(`Đã cập nhật thông tin "${form.name}" trong MySQL Database!`);
      } else {
        await createCustomer(form);
        addToast(`Đã thêm khách hàng "${form.name}" vào MySQL Database!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      addToast('Lỗi khi lưu khách hàng!', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xác nhận xóa khách hàng "${name}" khỏi cơ sở dữ liệu MySQL?`)) {
      try {
        await deleteCustomer(id);
        addToast(`Đã xóa khách hàng "${name}"!`);
        loadData();
      } catch (err) {
        addToast('Lỗi khi xóa khách hàng!', 'error');
      }
    }
  };

  const filtered = customers
    .filter(c => filterStatus === 'Tất cả' || c.status === filterStatus)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    );

  const vipCount = customers.filter(c => c.status === 'VIP').length;
  const loyalCount = customers.filter(c => c.status === 'Thân thiết').length;

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: 'Mã ID', key: (c) => cleanNumber(c.id) },
        { label: 'Họ và tên', key: (c) => cleanText(c.name) },
        { label: 'Số điện thoại', key: (c) => cleanPhone(c.phone) },
        { label: 'Email', key: (c) => cleanEmail(c.email) },
        { label: 'Địa chỉ', key: (c) => cleanText(c.address) },
        { label: 'Hạng thành viên', key: (c) => cleanText(c.status, 'Mới') },
        { label: 'Tổng chi tiêu (VNĐ)', key: (c) => cleanMoney(c.totalSpent) },
        { label: 'Số đơn hàng đã mua', key: (c) => cleanNumber(c.ordersCount) },
        { label: 'Phương thức liên kết', key: (c) => cleanText(c.auth_provider === 'google' ? 'Google' : c.auth_provider === 'facebook' ? 'Facebook' : 'Số điện thoại / OTP') },
        { label: 'Thời điểm tạo', key: (c) => cleanDateTime(c.created_at) },
      ];

      const today = new Date().toISOString().split('T')[0];
      exportToCsv(`Khach_Hang_VyVy_${today}`, columns, filtered);
      addToast(`Đã xuất thành công ${filtered.length} khách hàng ra file CSV!`);
    } catch (err) {
      addToast(err.message || 'Lỗi khi xuất file CSV!', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#a3e635', fontWeight: 700, letterSpacing: '1px' }}>
              ● MYSQL TABLE: vyvy_flower_db.customers
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              Quản Lý Khách Hàng
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', marginTop: '4px' }}>
              Danh sách khách hàng, phân hạng VIP và lịch sử chi tiêu
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '420px', justifyContent: 'flex-start' }}>
            <button
              onClick={openAdd}
              className="hero-cta-btn"
              style={{
                flex: '1 1 auto',
                padding: '9px 18px',
                fontSize: '13px',
                minHeight: '42px',
                justifyContent: 'center',
              }}
            >
              <Plus size={16} />
              <span>Thêm Khách Hàng</span>
            </button>

            <button
              onClick={handleExportCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '9999px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '42px',
              }}
              title="Xuất danh sách khách hàng ra file CSV Excel đã làm sạch"
            >
              <Download size={14} />
              <span>Xuất CSV ({filtered.length})</span>
            </button>

            <button
              onClick={loadData}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 14px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '12.5px',
                cursor: 'pointer',
                minHeight: '42px',
              }}
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats (2x2 grid on mobile) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {[
          { label: 'Tổng Khách Hàng', value: customers.length, color: '#06b6d4' },
          { label: 'Hạng VIP', value: vipCount, color: '#facc15' },
          { label: 'Thân Thiết', value: loyalCount, color: '#a3e635' },
          { label: 'Tỉ Lệ Quay Lại', value: '78%', color: '#ec4899' },
        ].map(item => (
          <div key={item.label} className="glass-card" style={{ padding: '14px 16px', borderRadius: '18px' }}>
            <div style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Horizontal scrollable status chips for mobile */}
        <div className="admin-filter-scroll-row">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                background: filterStatus === st ? '#facc15' : 'rgba(255, 255, 255, 0.05)',
                color: filterStatus === st ? '#0b0c10' : 'rgba(255, 255, 255, 0.7)',
                border: filterStatus === st ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search input with Clear button & View mode toggle */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dark-input"
              style={{
                paddingLeft: '40px',
                paddingRight: search ? '36px' : '14px',
                borderRadius: '9999px',
                width: '100%',
                fontSize: '14px',
                minHeight: '42px',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View toggle (Cards vs Table) */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', padding: '3px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Dạng thẻ di động (Mobile Cards)"
              style={{
                background: viewMode === 'cards' ? '#facc15' : 'transparent',
                color: viewMode === 'cards' ? '#0b0c10' : 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '9999px',
                padding: '7px 11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Dạng bảng chi tiết (Desktop Table)"
              style={{
                background: viewMode === 'table' ? '#facc15' : 'transparent',
                color: viewMode === 'table' ? '#0b0c10' : 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '9999px',
                padding: '7px 11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer List: Cards View vs Table View */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center', borderRadius: '24px' }}>
          <UserCheck size={36} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
            Không tìm thấy khách hàng nào
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
            Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Tất cả"
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Mobile Cards Layout (Ưu tiên di động) */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '12px' }}>
          {filtered.map(cust => (
            <div key={cust.id} className="admin-customer-card">
              {/* Header row: Avatar, Name, Auth method, Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  {cust.avatar ? (
                    <img 
                      src={cust.avatar} 
                      alt={cust.name} 
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #facc15', flexShrink: 0 }} 
                    />
                  ) : (
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#facc15', fontWeight: 800, fontSize: '15px',
                      border: '1px solid rgba(250, 204, 21, 0.3)',
                      flexShrink: 0,
                    }}>
                      {cust.name.charAt(0)}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cust.name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                      {cust.auth_provider === 'google' ? (
                        <span style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>🌐 Google</span>
                      ) : cust.auth_provider === 'facebook' ? (
                        <span style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>👥 Facebook</span>
                      ) : cust.auth_provider === 'phone_otp' ? (
                        <span style={{ color: '#4ade80', background: 'rgba(74,222,128,0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>📱 SMS OTP</span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>🔑 Mật khẩu</span>
                      )}
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>#{cust.id}</span>
                    </div>
                  </div>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: statusColors[cust.status]?.bg || 'rgba(255,255,255,0.1)',
                  color: statusColors[cust.status]?.color || '#fff',
                  border: `1px solid ${statusColors[cust.status]?.border || 'transparent'}`,
                  flexShrink: 0,
                }}>
                  {cust.status === 'VIP' ? '★ VIP' : cust.status}
                </span>
              </div>

              {/* Direct Tap-to-Call Phone Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
                  <Phone size={14} style={{ color: '#4ade80' }} />
                  <span style={{ fontWeight: 600 }}>{cust.phone}</span>
                </div>
                <a
                  href={`tel:${cust.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    background: 'rgba(74, 222, 128, 0.15)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    color: '#4ade80',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>Gọi Ngay</span>
                </a>
              </div>

              {/* Key Metrics: Orders and Total Spent */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>Đơn mua</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {cust.ordersCount || 0} đơn
                  </div>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.15)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(250, 204, 21, 0.8)' }}>Tổng chi tiêu</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#facc15', marginTop: '2px' }}>
                    {cust.totalSpent ? `${cust.totalSpent.toLocaleString('vi-VN')}₫` : '0₫'}
                  </div>
                </div>
              </div>

              {/* Address & Email Meta */}
              {(cust.address || cust.email) && (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  {cust.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cust.email}</span>
                    </div>
                  )}
                  {cust.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cust.address}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Touch Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => openEdit(cust)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#06b6d4',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '40px',
                  }}
                >
                  <Edit3 size={13} />
                  <span>Sửa Thông Tin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cust.id, cust.name)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    color: '#f43f5e',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '40px',
                  }}
                  title="Xóa khách hàng"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Layout (Bảng truyền thống) */
        <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách Hàng</th>
                  <th>Số Điện Thoại</th>
                  <th>Email</th>
                  <th>Địa Chỉ</th>
                  <th>Hạng Thành Viên</th>
                  <th>Số Đơn</th>
                  <th>Tổng Chi Tiêu</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(cust => (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {cust.avatar ? (
                          <img 
                            src={cust.avatar} 
                            alt={cust.name} 
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(250, 204, 21, 0.4)' }} 
                          />
                        ) : (
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#facc15', fontWeight: 700, fontSize: '14px',
                          }}>
                            {cust.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700 }}>{cust.name}</div>
                          <div style={{ fontSize: '11px', marginTop: '2px' }}>
                            {cust.auth_provider === 'google' ? (
                              <span style={{ color: '#60a5fa', background: 'rgba(59,130,246,0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>🌐 Google</span>
                            ) : cust.auth_provider === 'facebook' ? (
                              <span style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>👥 Facebook</span>
                            ) : cust.auth_provider === 'phone_otp' ? (
                              <span style={{ color: '#4ade80', background: 'rgba(74,222,128,0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>📱 SMS OTP</span>
                            ) : (
                              <span style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>🔑 Mật khẩu</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      <a href={`tel:${cust.phone}`} style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 600 }}>
                        {cust.phone}
                      </a>
                    </td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{cust.email || '—'}</td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cust.address || '—'}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: statusColors[cust.status]?.bg || 'rgba(255,255,255,0.1)',
                        color: statusColors[cust.status]?.color || '#fff',
                        border: `1px solid ${statusColors[cust.status]?.border || 'transparent'}`,
                      }}>
                        {cust.status === 'VIP' ? '★ VIP' : cust.status}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{cust.ordersCount}</strong> đơn
                    </td>
                    <td>
                      <strong style={{ color: '#facc15', fontSize: '14px' }}>
                        {cust.totalSpent?.toLocaleString('vi-VN')}₫
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEdit(cust)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'rgba(6, 182, 212, 0.12)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            color: '#06b6d4',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                          }}
                        >
                          <Edit3 size={12} /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(cust.id, cust.name)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            color: '#f43f5e',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                {editItem ? 'Chỉnh Sửa Khách Hàng (MySQL Workbench)' : 'Thêm Khách Hàng Mới (MySQL)'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="dark-input"
                  placeholder="Ví dụ: Hoàng Thu Thảo"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="dark-input"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Phân hạng
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="dark-input"
                  >
                    <option value="Mới">Mới</option>
                    <option value="Thường">Thường</option>
                    <option value="Thân thiết">Thân thiết</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="dark-input"
                  placeholder="name@gmail.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Địa chỉ giao hàng mặc định
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="dark-input"
                  placeholder="Số nhà, đường, quận, thành phố..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="hero-cta-btn"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  <span>{editItem ? 'Cập Nhật Khách Hàng' : 'Thêm Vào MySQL'}</span>
                  <div className="cta-icon-badge" style={{ width: '28px', height: '28px' }}>
                    <Check size={16} />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
