import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Flower2, Package, Users, MessageSquare, ExternalLink, LogOut, Bell, CheckCheck, Menu, X } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/orders', icon: <ShoppingCart size={18} />, label: 'Đơn Hàng' },
  { to: '/admin/products', icon: <Flower2 size={18} />, label: 'Sản Phẩm' },
  { to: '/admin/inventory', icon: <Package size={18} />, label: 'Tồn Kho' },
  { to: '/admin/customers', icon: <Users size={18} />, label: 'Khách Hàng' },
  { to: '/admin/reviews', icon: <MessageSquare size={18} />, label: 'Đánh Giá' },
];

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('vyvy_admin_user') || '{}');
    } catch {
      return {};
    }
  })();

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // fail silently
    }
  };

  useEffect(() => {
    // Admin dashboard workspace always operates in cohesive, high-contrast dark luxury mode
    const prevHeroTheme = localStorage.getItem('vyvy_hero_theme');
    document.body.classList.remove('theme-light-floral');
    document.documentElement.setAttribute('data-theme', 'dark');

    return () => {
      if (prevHeroTheme === 'light') {
        document.body.classList.add('theme-light-floral');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleReadNotification = async (notif) => {
    try {
      await markNotificationRead(notif.id);
      fetchNotifs();
      if (notif.orderId || notif.orderCode) {
        setShowNotifMenu(false);
        navigate('/admin/orders');
      }
    } catch (e) {}
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifs();
    } catch (e) {}
  };

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo & Mobile close button */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo-white.png"
                alt="Vy Vy Flower - Tiệm Hoa Sóc Trăng"
                style={{
                  height: '48px',
                  width: 'auto',
                  maxWidth: '200px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
                }}
              />
            </Link>
            <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Quản Trị Hệ Thống
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="admin-mobile-close-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Menu Quản Lý
          </div>

          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '14px',
                textDecoration: 'none',
                background: isActive ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                color: isActive ? '#facc15' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                border: isActive ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer controls */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Admin User Badge */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '4px',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px',
              color: '#fff',
            }}>
              {(user.displayName || 'V')[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.displayName || 'Vy Vy Florist'}
              </div>
              <div style={{ fontSize: '11px', color: '#facc15', textTransform: 'capitalize' }}>
                {user.role || 'Superadmin'}
              </div>
            </div>
          </div>

          <Link
            to="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'all 0.2s',
            }}
          >
            <ExternalLink size={16} />
            <span>Xem Trang Khách Hàng</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#f43f5e',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={16} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Top bar with Notification Bell */}
        <div className="admin-top-bar" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 12, 18, 0.65)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="admin-mobile-menu-btn"
              title="Mở menu quản lý"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <Menu size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a3e635', boxShadow: '0 0 10px #a3e635', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Hệ Thống: <span style={{ color: '#a3e635' }}>Trực Tuyến</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              title="Thông báo đơn đặt hoa mới từ khách"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: unreadCount > 0 ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: unreadCount > 0 ? '1.5px solid #facc15' : '1px solid rgba(255, 255, 255, 0.12)',
                color: unreadCount > 0 ? '#facc15' : 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: unreadCount > 0 ? '0 0 16px rgba(250, 204, 21, 0.4)' : 'none',
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '9999px',
                  background: '#f43f5e',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px #f43f5e',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '360px',
                  borderRadius: '24px',
                  background: 'rgba(18, 20, 29, 0.98)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(250, 204, 21, 0.3)',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 30px rgba(250, 204, 21, 0.15)',
                  padding: '16px',
                  zIndex: 100,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Thông Báo Đơn Mới</span>
                    {unreadCount > 0 && (
                      <span style={{ background: 'rgba(250,204,21,0.2)', color: '#facc15', fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px' }}>
                        {unreadCount} chưa đọc
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleReadAll}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCheck size={13} />
                      <span>Đọc tất cả</span>
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                      Chưa có thông báo đơn hàng nào
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleReadNotification(n)}
                        style={{
                          padding: '12px',
                          borderRadius: '16px',
                          background: n.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(250, 204, 21, 0.08)',
                          border: n.isRead ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(250, 204, 21, 0.25)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: n.isRead ? '#fff' : '#facc15' }}>
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f43f5e', flexShrink: 0 }} />
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', margin: 0 }}>
                          {n.message}
                        </p>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed 5-tabs) */}
      <nav className="admin-mobile-bottom-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
