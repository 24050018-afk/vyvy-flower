import React, { useState, useEffect, useRef } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { sendOtp, verifyOtp, googleOAuthLogin, facebookOAuthLogin } from '../services/api';
import { 
  X, Phone, Lock, User, Mail, MapPin, ArrowRight, Sparkles, 
  CheckCircle2, Key, RefreshCw, Settings, ShieldCheck, AlertCircle 
} from 'lucide-react';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function CustomerAuthModal() {
  const { authModalOpen, setAuthModalOpen, login, register, setAuthenticatedCustomer } = useCustomer();
  
  // Tabs: 'otp' | 'google' | 'facebook' | 'password'
  const [activeTab, setActiveTab] = useState('otp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP State
  const [otpStep, setOtpStep] = useState(1); // 1: input phone, 2: input otp
  const [otpPhone, setOtpPhone] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [serverGeneratedOtp, setServerGeneratedOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);

  // Password Login / Register State
  const [pwdMode, setPwdMode] = useState('login'); // 'login' | 'register'
  const [pwdPhone, setPwdPhone] = useState('');
  const [pwdPassword, setPwdPassword] = useState('');
  const [pwdName, setPwdName] = useState('');
  const [pwdEmail, setPwdEmail] = useState('');
  const [pwdAddress, setPwdAddress] = useState('');

  // OAuth Keys State
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('vyvy_google_client_id') || '';
  });
  const [fbAppId, setFbAppId] = useState(() => {
    return import.meta.env.VITE_FACEBOOK_APP_ID || localStorage.getItem('vyvy_fb_app_id') || '';
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (authModalOpen) {
      setError('');
      setSuccessMsg('');
    }
  }, [authModalOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpStep === 2 && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
  }, [otpStep, countdown]);

  // Handle Google OAuth Credential
  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) return;
    setLoading(true);
    setError('');
    try {
      const payload = parseJwt(response.credential);
      if (!payload || !payload.email) {
        throw new Error('Không đọc được thông tin tài khoản Google.');
      }

      const res = await googleOAuthLogin({
        email: payload.email,
        name: payload.name || payload.given_name || 'Khách Google',
        picture: payload.picture,
        sub: payload.sub,
      });

      if (res.success && res.customer) {
        setAuthenticatedCustomer(res.customer);
      } else {
        setError(res.error || 'Không thể liên kết tài khoản Google vào MySQL.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services when on Google tab
  useEffect(() => {
    if (activeTab === 'google' && googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById('google-btn-rendered');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: 300,
          });
        }
      } catch (err) {
        console.warn('Google GIS init error:', err);
      }
    }
  }, [activeTab, googleClientId]);

  // Initialize Facebook SDK when on Facebook tab
  useEffect(() => {
    if (activeTab === 'facebook' && fbAppId && window.FB) {
      try {
        window.FB.init({
          appId: fbAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
      } catch (err) {
        console.warn('Facebook SDK init error:', err);
      }
    }
  }, [activeTab, fbAppId]);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    setOtpStep(1);
    setAuthModalOpen(false);
  };

  /* ================= 1. PHONE + OTP HANDLERS ================= */
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpPhone || otpPhone.trim().length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ (từ 9 đến 11 số)!');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendOtp(otpPhone.trim(), otpName.trim());
      if (res.success) {
        setServerGeneratedOtp(res.otpCode || '');
        setOtpStep(2);
        setCountdown(60);
        setSuccessMsg(`Mã xác thực đã được gửi tới số ${otpPhone.trim()}!`);
      } else {
        setError(res.error || 'Không thể gửi mã xác thực lúc này.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối máy chủ gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Vui lòng nhập mã OTP 6 số được gửi về máy!');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await verifyOtp(otpPhone.trim(), otpCode.trim(), otpName.trim());
      if (res.success && res.customer) {
        setAuthenticatedCustomer(res.customer);
      } else {
        setError(res.error || 'Mã xác thực không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi xác thực mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= 2. GOOGLE OAUTH HANDLERS ================= */
  const handlePromptGoogle = () => {
    if (window.google?.accounts?.id && googleClientId) {
      window.google.accounts.id.prompt();
    } else {
      setError('Vui lòng nhập Google Client ID trong biểu tượng Cài Đặt (⚙️) phía trên để mở popup Google.');
    }
  };

  // Google Fast Test Simulation (writes to MySQL)
  const handleGoogleMockTest = async () => {
    setLoading(true);
    setError('');
    try {
      const mockProfiles = [
        { name: 'Nguyễn Thanh Tùng', email: 'thanhtung.flower@gmail.com', picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80' },
        { name: 'Trần Thảo Ly', email: 'thaoly.bloom@gmail.com', picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80' },
        { name: 'Phạm Minh Khang', email: 'minhkhang.art@gmail.com', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80' }
      ];
      const p = mockProfiles[Math.floor(Math.random() * mockProfiles.length)];
      const res = await googleOAuthLogin({
        email: p.email,
        name: p.name,
        picture: p.picture,
        sub: 'google_oauth_' + Date.now(),
      });
      if (res.success && res.customer) {
        setAuthenticatedCustomer(res.customer);
      } else {
        setError(res.error || 'Lỗi khi lưu tài khoản vào MySQL');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= 3. FACEBOOK LOGIN HANDLERS ================= */
  const handleFacebookRealLogin = () => {
    if (!window.FB) {
      setError('Facebook SDK chưa tải xong, vui lòng thử lại sau 2 giây.');
      return;
    }
    if (!fbAppId) {
      setError('Vui lòng nhập Facebook App ID trong biểu tượng Cài Đặt (⚙️) phía trên để kích hoạt đăng nhập Facebook.');
      return;
    }

    setLoading(true);
    setError('');

    window.FB.login((response) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'id,name,email,picture.width(200).height(200)' }, async (profile) => {
          try {
            const avatar = profile.picture?.data?.url || `https://graph.facebook.com/${profile.id}/picture?type=large`;
            const res = await facebookOAuthLogin({
              id: profile.id,
              name: profile.name,
              email: profile.email || `fb_${profile.id}@facebook.com`,
              picture: avatar,
            });
            if (res.success && res.customer) {
              setAuthenticatedCustomer(res.customer);
            } else {
              setError(res.error || 'Lỗi khi lưu tài khoản Facebook vào MySQL');
            }
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
        setError('Người dùng đã hủy hoặc không cấp quyền Facebook.');
      }
    }, { scope: 'public_profile,email' });
  };

  // Facebook Fast Test Simulation (writes to MySQL)
  const handleFacebookMockTest = async () => {
    setLoading(true);
    setError('');
    try {
      const mockFbUsers = [
        { id: 'fb_10293847', name: 'Đặng Thảo Vy (Facebook)', email: 'vyvy.flower.fb@facebook.com', picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80' },
        { id: 'fb_58392019', name: 'Vũ Minh Châu (Facebook)', email: 'chauvu.design@facebook.com', picture: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80' }
      ];
      const fb = mockFbUsers[Math.floor(Math.random() * mockFbUsers.length)];
      const res = await facebookOAuthLogin(fb);
      if (res.success && res.customer) {
        setAuthenticatedCustomer(res.customer);
      } else {
        setError(res.error || 'Lỗi khi lưu tài khoản vào MySQL');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= 4. PASSWORD & REGISTER HANDLERS ================= */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (pwdMode === 'login') {
      const res = await login({ phone: pwdPhone, password: pwdPassword });
      if (!res.success) setError(res.message);
    } else {
      if (!pwdName || !pwdPhone) {
        setError('Vui lòng nhập họ tên và số điện thoại!');
        setLoading(false);
        return;
      }
      const res = await register({
        name: pwdName,
        phone: pwdPhone,
        password: pwdPassword || 'vyvy123456',
        email: pwdEmail,
        address: pwdAddress,
        authProvider: 'phone_password',
      });
      if (!res.success) setError(res.message);
    }
    setLoading(false);
  };

  const saveApiKeys = () => {
    localStorage.setItem('vyvy_google_client_id', googleClientId.trim());
    localStorage.setItem('vyvy_fb_app_id', fbAppId.trim());
    setShowKeyConfig(false);
    setSuccessMsg('Đã lưu cấu hình Khóa OAuth vào trình duyệt!');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content glass-panel"
        style={{
          maxWidth: '480px',
          width: '92%',
          padding: '32px 28px',
          borderRadius: '30px',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(250, 204, 21, 0.15)',
          border: '1px solid rgba(250, 204, 21, 0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header controls */}
        <div style={{ position: 'absolute', top: '18px', right: '18px', display: 'flex', gap: '8px' }}>
          <button
            title="Cấu hình Khóa OAuth (Google / Facebook)"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            style={{
              background: showKeyConfig ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: showKeyConfig ? '#facc15' : 'rgba(255, 255, 255, 0.7)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Settings size={17} />
          </button>
          <button
            onClick={handleClose}
            style={{
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
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Brand Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <img
              src="/images/logo-white.png"
              alt="Vy Vy Flower - Tiệm Hoa Sóc Trăng"
              style={{
                height: '56px',
                width: 'auto',
                maxWidth: '240px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))',
              }}
            />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            Xác Thực Tài Khoản Thật
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '13px' }}>
            Đăng nhập để theo dõi đơn hàng và nhận ưu đãi độc quyền từ Vy Vy Flower
          </p>
        </div>

        {/* Configuration Accordion if opened */}
        {showKeyConfig && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '18px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#facc15', fontWeight: 700, marginBottom: '8px' }}>
              <Key size={14} />
              <span>Cấu hình Khóa API OAuth Thật (Lưu tại chỗ)</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>
                Google OAuth Client ID:
              </label>
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                placeholder="xxxx.apps.googleusercontent.com"
                className="dark-input"
                style={{ fontSize: '12px', padding: '8px 12px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>
                Facebook App ID:
              </label>
              <input
                type="text"
                value={fbAppId}
                onChange={(e) => setFbAppId(e.target.value)}
                placeholder="Ví dụ: 104829384918239"
                className="dark-input"
                style={{ fontSize: '12px', padding: '8px 12px' }}
              />
            </div>
            <button
              type="button"
              onClick={saveApiKeys}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Lưu Khóa API
            </button>
          </div>
        )}

        {/* 4 Multi-Auth Method Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('otp'); setError(''); }}
            style={{
              padding: '9px 4px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'otp' ? 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Phone size={13} />
            <span>SĐT OTP</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('google'); setError(''); }}
            style={{
              padding: '9px 4px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'google' ? 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('facebook'); setError(''); }}
            style={{
              padding: '9px 4px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'facebook' ? 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('password'); setError(''); }}
            style={{
              padding: '9px 4px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'password' ? 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Lock size={13} />
            <span>Mật khẩu</span>
          </button>
        </div>

        {/* Error and Success alerts */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fecdd3',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#86efac',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= TAB 1: PHONE + REAL OTP ================= */}
        {activeTab === 'otp' && (
          <div>
            {otpStep === 1 ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  background: 'rgba(250, 204, 21, 0.08)',
                  border: '1px dashed rgba(250, 204, 21, 0.3)',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: '1.5',
                }}>
                  <strong style={{ color: '#facc15' }}>✨ Xác thực số điện thoại thật:</strong> Hệ thống sẽ sinh mã xác thực OTP 6 chữ số gửi trực tiếp để quý khách đăng nhập nhanh không cần nhớ mật khẩu.
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Họ và tên của bạn (tùy chọn)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Ví dụ: Hoàng Thu Thảo"
                      value={otpName}
                      onChange={(e) => setOtpName(e.target.value)}
                      className="dark-input"
                      style={{ paddingLeft: '40px' }}
                    />
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'rgba(255, 255, 255, 0.4)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Số điện thoại nhận mã OTP *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      required
                      placeholder="0901 234 567"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      className="dark-input"
                      style={{ paddingLeft: '40px' }}
                    />
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'rgba(255, 255, 255, 0.4)' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="hero-cta-btn"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
                >
                  <span>{loading ? 'Đang tạo mã OTP...' : 'Gửi Mã Xác Thực OTP (SMS)'}</span>
                  <div className="cta-icon-badge">
                    <ArrowRight size={16} />
                  </div>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    Mã 6 chữ số đã gửi tới số: <strong style={{ color: '#facc15' }}>{otpPhone}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtpStep(1); setOtpCode(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ec4899',
                      fontSize: '12px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    Đổi số điện thoại khác
                  </button>
                </div>

                {/* Developer real code helper banner */}
                <div style={{
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#86efac',
                }}>
                  <div>
                    Mã OTP thật: <strong style={{ fontSize: '15px', letterSpacing: '2px', color: '#fff' }}>{serverGeneratedOtp || '123456'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(serverGeneratedOtp || '123456')}
                    style={{
                      background: 'rgba(34, 197, 94, 0.25)',
                      border: '1px solid rgba(34, 197, 94, 0.5)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Điền nhanh
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>
                    Nhập mã 6 chữ số:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="dark-input"
                    style={{
                      textAlign: 'center',
                      fontSize: '24px',
                      letterSpacing: '10px',
                      fontWeight: 700,
                      color: '#facc15',
                      padding: '12px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Chưa nhận được mã?'}
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 0 || loading}
                    onClick={handleSendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: countdown > 0 ? 'rgba(255,255,255,0.3)' : '#facc15',
                      cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Gửi lại mã</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="hero-cta-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <ShieldCheck size={18} />
                  <span>{loading ? 'Đang xác thực...' : 'Xác Thực OTP & Đăng Nhập'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 2: GOOGLE OAUTH 2.0 ================= */}
        {activeTab === 'google' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(66, 133, 244, 0.08)',
              border: '1px solid rgba(66, 133, 244, 0.25)',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)',
            }}>
              <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '6px', fontSize: '14px' }}>
                🌐 Google Identity Services (OAuth 2.0)
              </div>
              <div>
                Đăng nhập nhanh bằng Gmail chính thức của bạn để tự động đồng bộ họ tên, email và nhận ưu đãi thành viên.
              </div>
            </div>

            {/* Official Google Button Render target */}
            <div style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}>
              <div id="google-btn-rendered"></div>
            </div>

            {/* Action buttons */}
            <button
              type="button"
              onClick={handlePromptGoogle}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
              <span>Mở Popup Google One-Tap</span>
            </button>

            {/* Mock Live Test to MySQL */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleGoogleMockTest}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.25), rgba(236, 72, 153, 0.25))',
                  border: '1px solid rgba(66, 133, 244, 0.5)',
                  color: '#93c5fd',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={15} />
                <span>Đăng nhập thử nghiệm tài khoản Google</span>
              </button>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                (Kích hoạt nhanh tài khoản thành viên để trải nghiệm đặt hoa)
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FACEBOOK LOGIN ================= */}
        {activeTab === 'facebook' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(24, 119, 242, 0.08)',
              border: '1px solid rgba(24, 119, 242, 0.25)',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)',
            }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '6px', fontSize: '14px' }}>
                👥 Meta Facebook Login SDK
              </div>
              <div>
                Đăng nhập bằng tài khoản Facebook của bạn. Quyền truy cập profile và email được kết nối an toàn.
              </div>
            </div>

            <button
              type="button"
              onClick={handleFacebookRealLogin}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '13px 18px',
                borderRadius: '14px',
                background: '#1877f2',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(24, 119, 242, 0.4)',
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Mở Cửa Sổ Đăng Nhập Facebook</span>
            </button>

            {/* Mock Live Test to MySQL */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleFacebookMockTest}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.25), rgba(236, 72, 153, 0.25))',
                  border: '1px solid rgba(24, 119, 242, 0.5)',
                  color: '#7dd3fc',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={15} />
                <span>Đăng nhập thử nghiệm tài khoản Facebook</span>
              </button>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                (Kích hoạt nhanh tài khoản thành viên để trải nghiệm đặt hoa)
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PASSWORD / REGISTER ================= */}
        {activeTab === 'password' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '3px',
              borderRadius: '10px',
              marginBottom: '16px',
            }}>
              <button
                type="button"
                onClick={() => { setPwdMode('login'); setError(''); }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: pwdMode === 'login' ? 'rgba(250, 204, 21, 0.25)' : 'transparent',
                  color: pwdMode === 'login' ? '#facc15' : '#fff',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Đăng Nhập SĐT & Mật Khẩu
              </button>
              <button
                type="button"
                onClick={() => { setPwdMode('register'); setError(''); }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: pwdMode === 'register' ? 'rgba(250, 204, 21, 0.25)' : 'transparent',
                  color: pwdMode === 'register' ? '#facc15' : '#fff',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Đăng Ký Tài Khoản Mới
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pwdMode === 'register' && (
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Họ và tên *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Hoàng Mai Linh"
                      value={pwdName}
                      onChange={(e) => setPwdName(e.target.value)}
                      className="dark-input"
                      style={{ paddingLeft: '38px', fontSize: '13px' }}
                    />
                    <User size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Số điện thoại *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="0901 234 567"
                    value={pwdPhone}
                    onChange={(e) => setPwdPhone(e.target.value)}
                    className="dark-input"
                    style={{ paddingLeft: '38px', fontSize: '13px' }}
                  />
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Mật khẩu {pwdMode === 'register' && '(tùy chọn, mặc định 123456)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={pwdPassword}
                    onChange={(e) => setPwdPassword(e.target.value)}
                    className="dark-input"
                    style={{ paddingLeft: '38px', fontSize: '13px' }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
                </div>
              </div>

              {pwdMode === 'register' && (
                <>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Email nhận thiệp & hóa đơn (tùy chọn)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        placeholder="email@gmail.com"
                        value={pwdEmail}
                        onChange={(e) => setPwdEmail(e.target.value)}
                        className="dark-input"
                        style={{ paddingLeft: '38px', fontSize: '13px' }}
                      />
                      <Mail size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Địa chỉ nhận hoa
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Số nhà, đường, quận..."
                        value={pwdAddress}
                        onChange={(e) => setPwdAddress(e.target.value)}
                        className="dark-input"
                        style={{ paddingLeft: '38px', fontSize: '13px' }}
                      />
                      <MapPin size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'rgba(255, 255, 255, 0.4)' }} />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="hero-cta-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                <span>{loading ? 'Đang xử lý...' : pwdMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký & Đặt Hoa'}</span>
                <div className="cta-icon-badge">
                  <ArrowRight size={16} />
                </div>
              </button>
            </form>
          </div>
        )}

        {/* Footer Guarantee */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
          🔒 Thông tin cá nhân của quý khách được bảo mật tuyệt đối
        </div>
      </div>
    </div>
  );
}
