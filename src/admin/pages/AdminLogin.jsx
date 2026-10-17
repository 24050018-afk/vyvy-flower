import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../../services/api';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(credentials.username, credentials.password);
      if (res.success) {
        onLogin(res.user);
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Sai thông tin đăng nhập!');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối tới cơ sở dữ liệu MySQL!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '44px 36px',
        borderRadius: '32px',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
      }}>
        {/* Brand Logo matching Vy Vy Flower */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}>
            <img
              src="/images/vyvy_avatar.jpg"
              alt="Vy Vy Flower"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid #facc15',
                boxShadow: '0 0 16px rgba(250, 204, 21, 0.4)',
              }}
            />
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              Vy Vy
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
              color: '#ffffff',
              padding: '3px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.8px',
            }}>
              FLOWER
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
            Cổng Quản Trị Hệ Thống
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
            Xác thực tài khoản trực tiếp qua cơ sở dữ liệu MySQL (Workbench)
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fecdd3',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              Tên tài khoản
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="admin"
                className="dark-input"
                style={{ paddingLeft: '44px' }}
                value={credentials.username}
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="password"
                placeholder="••••••••"
                className="dark-input"
                style={{ paddingLeft: '44px' }}
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="hero-cta-btn"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            <span>{loading ? 'Đang xác thực qua MySQL...' : 'Đăng Nhập Quản Trị'}</span>
            <div className="cta-icon-badge">
              <ArrowRight size={18} />
            </div>
          </button>
        </form>

        {/* Demo credentials tip */}
        <div style={{
          marginTop: '28px',
          padding: '14px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <div><strong>Tài khoản trong MySQL:</strong> <code style={{ color: '#facc15' }}>admin</code></div>
          <div><strong>Mật khẩu trong MySQL:</strong> <code style={{ color: '#facc15' }}>bloom2026</code></div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', textDecoration: 'none' }}>
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
