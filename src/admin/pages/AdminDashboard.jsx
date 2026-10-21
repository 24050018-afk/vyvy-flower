import React, { useState, useEffect, useContext } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../../services/api';
import { DollarSign, ShoppingBag, Users, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { ToastContext } from '../../App';
import { exportToCsv, cleanText, cleanMoney, cleanNumber, cleanPhone, cleanDateTime } from '../../utils/csvExport';

const PIE_COLORS = ['#facc15', '#a3e635', '#06b6d4', '#ec4899', '#c084fc'];

function StatCard({ icon, title, value, change, color, isWarning }) {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: `rgba(${color}, 0.12)`,
          border: `1px solid rgba(${color}, 0.25)`,
          color: `rgb(${color})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '9999px',
          background: isWarning ? 'rgba(244, 63, 94, 0.15)' : 'rgba(163, 230, 53, 0.15)',
          color: isWarning ? '#f43f5e' : '#a3e635',
          fontSize: '11px',
          fontWeight: 700,
        }}>
          {change}
        </div>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>
        {title}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(18, 20, 29, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '10px 14px',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: '#facc15', fontWeight: 700, fontSize: '13px' }}>
            {typeof p.value === 'number' && p.value >= 1000000
              ? `${(p.value / 1000000).toFixed(1)} tr₫`
              : `${p.value} đơn`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const addToast = useContext(ToastContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statusColor = {
    'Hoàn thành': { bg: 'rgba(163, 230, 53, 0.12)', color: '#a3e635' },
    'Đang xử lý': { bg: 'rgba(250, 204, 21, 0.12)', color: '#facc15' },
    'Chờ xác nhận': { bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' },
    'Đã hủy': { bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e' },
  };

  const handleExportDashboardReport = () => {
    try {
      const summaryRows = [
        { chiSo: 'Tổng doanh thu thực tế', giaTriSo: cleanMoney(stats?.totalRevenue), donVi: 'VNĐ', ghiChu: 'Doanh thu từ các đơn hàng hoàn thành' },
        { chiSo: 'Tổng số đơn hàng', giaTriSo: cleanNumber(stats?.ordersCount), donVi: 'Đơn', ghiChu: 'Tất cả các đơn đã tạo trong hệ thống' },
        { chiSo: 'Đơn hàng hoàn thành', giaTriSo: cleanNumber(stats?.completedOrders), donVi: 'Đơn', ghiChu: 'Giao hàng thành công' },
        { chiSo: 'Đơn hàng đang xử lý', giaTriSo: cleanNumber(stats?.processingOrders), donVi: 'Đơn', ghiChu: 'Đang chuẩn bị & cắm hoa' },
        { chiSo: 'Đơn hàng chờ xác nhận', giaTriSo: cleanNumber(stats?.pendingOrders), donVi: 'Đơn', ghiChu: 'Cần nhân viên liên hệ xác nhận' },
        { chiSo: 'Tổng khách hàng', giaTriSo: cleanNumber(stats?.customersCount), donVi: 'Khách', ghiChu: 'Tài khoản đăng ký và khách mua hàng' },
        { chiSo: 'Tổng số lượng sản phẩm', giaTriSo: cleanNumber(stats?.productsCount), donVi: 'Sản phẩm', ghiChu: 'Số mẫu hoa đang bán' },
        { chiSo: 'Vật tư sắp hết trong kho', giaTriSo: cleanNumber(stats?.lowStockCount), donVi: 'Vật tư', ghiChu: 'Cần nhập thêm ngay' },
      ];

      const columns = [
        { label: 'Chỉ số thống kê', key: (r) => cleanText(r.chiSo) },
        { label: 'Giá trị (Số tính toán)', key: (r) => cleanNumber(r.giaTriSo) },
        { label: 'Đơn vị tính', key: (r) => cleanText(r.donVi) },
        { label: 'Ghi chú giải thích', key: (r) => cleanText(r.ghiChu) },
      ];

      const today = new Date().toISOString().split('T')[0];
      exportToCsv(`Bao_Cao_Tong_Quan_VyVy_${today}`, columns, summaryRows);
      addToast?.('Đã xuất thành công báo cáo tổng quan chỉ số kinh doanh ra file CSV!');
    } catch (err) {
      addToast?.(err.message || 'Lỗi khi xuất file CSV!', 'error');
    }
  };

  const handleExportRecentOrders = () => {
    try {
      const columns = [
        { label: 'Mã đơn', key: (o) => cleanText(o.orderCode) },
        { label: 'Khách hàng', key: (o) => cleanText(o.customerName) },
        { label: 'Số điện thoại', key: (o) => cleanPhone(o.customerPhone) },
        { label: 'Tổng tiền (VNĐ)', key: (o) => cleanMoney(o.totalAmount) },
        { label: 'Trạng thái', key: (o) => cleanText(o.status) },
        { label: 'Thời gian', key: (o) => cleanDateTime(o.createdAt) },
      ];

      const today = new Date().toISOString().split('T')[0];
      exportToCsv(`Don_Hang_Moi_Nhat_VyVy_${today}`, columns, stats?.recentOrders || []);
      addToast?.(`Đã xuất thành công ${stats?.recentOrders?.length || 0} đơn hàng gần đây ra CSV!`);
    } catch (err) {
      addToast?.(err.message || 'Lỗi khi xuất file CSV!', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#a3e635', fontWeight: 700, letterSpacing: '1px' }}>● HỆ THỐNG QUẢN TRỊ VY VY FLOWER</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              Bảng Điều Khiển Quản Trị
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginTop: '4px' }}>
              Tổng quan đơn hàng, doanh thu và tồn kho cập nhật theo thời gian thực
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportDashboardReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9999px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Xuất báo cáo tổng quan chỉ số kinh doanh ra file CSV"
            >
              <Download size={15} />
              <span>Xuất Báo Cáo CSV</span>
            </button>

            <button
              onClick={fetchStats}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Làm Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stat-grid">
        <StatCard
          icon={<DollarSign size={22} />}
          title="Tổng Doanh Thu Thực Tế"
          value={stats ? `${(stats.totalRevenue / 1000000).toFixed(1)} tr₫` : '...'}
          change="+18.4%"
          color="250, 204, 21"
        />
        <StatCard
          icon={<ShoppingBag size={22} />}
          title="Đơn Hàng Trong DB"
          value={stats ? `${stats.ordersCount} đơn` : '...'}
          change={`${stats?.completedOrders || 0} xong`}
          color="163, 230, 53"
        />
        <StatCard
          icon={<Users size={22} />}
          title="Khách Hàng Đã Đặt"
          value={stats ? `${stats.customersCount} người` : '...'}
          change="Thực tế"
          color="6, 182, 212"
        />
        <StatCard
          icon={<AlertTriangle size={22} />}
          title="Vật Liệu Cần Nhập"
          value={stats ? `${stats.lowStockCount} loại` : '...'}
          change={stats?.lowStockCount > 0 ? "Cảnh báo" : "Ổn định"}
          color="244, 63, 94"
          isWarning={stats?.lowStockCount > 0}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Revenue Chart */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Biểu Đồ Doanh Thu Tháng
            </h3>
            <span style={{ fontSize: '12px', color: '#facc15' }}>6 Tháng Gần Nhất</span>
          </div>

          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" tickFormatter={v => `${(v/1000000).toFixed(0)}tr`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#facc15" strokeWidth={2.5} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
            Phân Bổ Danh Mục Sản Phẩm
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                >
                  {(stats?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
              {(stats?.categoryDistribution || []).map((cat, idx) => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{cat.name}</span>
                  <strong style={{ color: '#fff', marginLeft: 'auto' }}>{cat.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Đơn Hàng Gần Đây
          </h3>
          <button
            onClick={handleExportRecentOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Xuất danh sách đơn hàng gần đây ra file CSV Excel"
          >
            <Download size={13} />
            <span>Xuất CSV Đơn Mới</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Số Điện Thoại</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thời Gian</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map(order => (
                <tr key={order.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: '#facc15', fontWeight: 700 }}>
                      {order.orderCode}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{order.customerName}</td>
                  <td style={{ color: 'rgba(255,255,255,0.6)' }}>{order.customerPhone}</td>
                  <td style={{ color: '#fff', fontWeight: 700 }}>{order.totalAmount?.toLocaleString('vi-VN')}₫</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: statusColor[order.status]?.bg || 'rgba(255,255,255,0.1)',
                      color: statusColor[order.status]?.color || '#fff',
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
