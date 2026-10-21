import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { products as fallbackProducts } from '../data/mockData';
import { getProducts } from '../services/api';
import { ToastContext } from '../App';
import Card3D from '../components/Card3D';
import { Sparkles, ArrowRight, Heart, Star, ShieldCheck, Truck, Clock, Palette, ShoppingCart, X, Check, Plus, Minus } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const addToast = useContext(ToastContext);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [dbProducts, setDbProducts] = useState(fallbackProducts);
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  useEffect(() => {
    getProducts()
      .then(data => {
        if (data && data.length > 0) {
          const clean = data.filter(p => !p.image?.includes('spheres_') && p.name !== 'aaaa');
          if (clean.length > 0) setDbProducts(clean);
        }
      })
      .catch(() => {});
  }, []);

  const { startOrderFlow } = useCustomer();
  const { addToCart, startDirectOrder } = useCart();

  const handleQuickOrder = (productObj) => {
    startDirectOrder(productObj);
  };

  const handleAddSignatureToCart = (card, priceNum) => {
    addToCart({
      id: card.id,
      name: card.title,
      price: priceNum,
      image: card.image,
      category: 'Signature 3D Edition',
      badge: card.badge,
      badgeColor: card.themeColor,
    });
  };

  // The 3 signature showcase cards with real Vy Vy Flower designs
  const signature3DCards = [
    {
      id: 'sig-1',
      title: 'BLUE CELESTIAL',
      subtitle: 'BABY BIỂN & TULIP TRẮNG • 2026',
      badge: 'POPULAR',
      price: '680.000₫',
      image: '/images/vyvy_baby_tulip_xanh.jpg',
      themeColor: '#38bdf8',
      icon: '❄️',
    },
    {
      id: 'sig-2',
      title: 'JULIET SUNSHINE',
      subtitle: 'GOLDEN JULIET & CÚC TANA • ATELIER',
      badge: 'SIGNATURE',
      price: '520.000₫',
      image: '/images/vyvy_hong_juliet_tana.jpg',
      themeColor: '#facc15',
      icon: '✨',
    },
    {
      id: 'sig-3',
      title: 'ROYAL PINK LILY',
      subtitle: 'LY KÉP HỒNG CÔNG CHÚA • LUXE',
      badge: 'PRESTIGE',
      price: '750.000₫',
      image: '/images/vyvy_ly_kep_hong.jpg',
      themeColor: '#f472b6',
      icon: '🌸',
    },
  ];

  const categories = ['Tất cả', 'Bó hoa', 'Hoa chậu', 'Giỏ hoa', 'Hoa cưới'];

  const filteredProducts = activeCategory === 'Tất cả'
    ? dbProducts
    : dbProducts.filter(p => p.category === activeCategory);

  return (
    <div style={{ position: 'relative', zIndex: 1, overflowX: 'hidden' }}>
      
      {/* ========================================================
          HERO SECTION (Replicating exact MR.studio composition)
          ======================================================== */}
      <section style={{
        minHeight: '100vh',
        paddingTop: '130px',
        paddingBottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '0 28px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 5,
        }}>

          {/* Sub-badge pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '1px',
            color: 'rgba(255, 255, 255, 0.75)',
            marginBottom: '28px',
          }}>
            <span>✦</span>
            <span>VY VY FLOWER • TIỆM HOA NGHỆ THUẬT SÓC TRĂNG</span>
          </div>

          {/* Headline - exact layout with neon yellow accent */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6.2vw, 4.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            maxWidth: '920px',
            margin: '0 auto 24px',
          }}>
            Collect and gift super<br />
            rare <span className="text-highlight-yellow">Floral Arts</span>
          </h1>

          {/* Subtitle text */}
          <p style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            color: 'rgba(255, 255, 255, 0.65)',
            maxWidth: '620px',
            margin: '0 auto 36px',
            lineHeight: 1.65,
            fontWeight: 400,
          }}>
            Vy Vy Flower — Tiệm hoa tươi nghệ thuật độc bản Sóc Trăng. Nơi từng đóa hoa được tuyển chọn thủ công, kết tinh cùng ngôn ngữ thiết kế 3D vị lai.
          </p>

          {/* Hero CTA Button (Exact rounded pill with inner circle) */}
          <div style={{ marginBottom: '60px' }}>
            <Link to="/products" className="hero-cta-btn">
              <span>Khám Phá Bộ Sưu Tập</span>
              <div className="cta-icon-badge">
                <Sparkles size={18} />
              </div>
            </Link>
          </div>

          {/* ========================================================
              THE 3 SIGNATURE 3D CARDS (Exact match to bottom of image)
              ======================================================== */}
          <div
            className="home-signature-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '24px',
              maxWidth: '1060px',
              margin: '0 auto',
              textAlign: 'left',
            }}
          >
            {signature3DCards.map((card) => (
              <Card3D key={card.id} intensity={14} style={{ borderRadius: '28px' }}>
                <div className="showcase-card" style={{ height: '360px' }}>
                  
                  {/* Card 3D sphere background image */}
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      inset: 0,
                    }}
                  />

                  {/* Dark subtle gradient overlay to keep text legible */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(12,13,18,0.3) 0%, rgba(12,13,18,0.1) 40%, rgba(12,13,18,0.85) 100%)',
                    zIndex: 2,
                  }} />

                  {/* Top content on card */}
                  <div style={{ position: 'relative', zIndex: 3, padding: '24px 22px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      background: 'rgba(12, 13, 18, 0.7)',
                      border: `1px solid ${card.themeColor}55`,
                      backdropFilter: 'blur(10px)',
                      color: card.themeColor,
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                    }}>
                      <span>{card.icon}</span>
                      <span>{card.badge}</span>
                    </div>

                    <h3 style={{
                      color: '#ffffff',
                      fontSize: '22px',
                      fontWeight: 800,
                      marginTop: '12px',
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    }}>
                      {card.title}
                    </h3>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                    }}>
                      {card.subtitle}
                    </div>
                  </div>

                  {/* Capsule bottom bar (Exact replica from the reference image) */}
                  <div className="card-capsule-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                      }}>
                        {card.icon}
                      </div>
                      <span style={{
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '-0.3px',
                      }}>
                        {card.price}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        title="Thêm vào giỏ hàng"
                        onClick={(e) => {
                          e.stopPropagation();
                          const priceNum = card.id === 'sig-1' ? 950000 : card.id === 'sig-2' ? 1450000 : 1850000;
                          handleAddSignatureToCart(card, priceNum);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#facc15';
                          e.currentTarget.style.color = '#facc15';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                      >
                        <ShoppingCart size={14} />
                      </button>

                      <button
                        className="btn-card-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          const priceNum = card.id === 'sig-1' ? 950000 : card.id === 'sig-2' ? 1450000 : 1850000;
                          handleQuickOrder({
                            id: card.id,
                            name: card.title,
                            price: priceNum,
                            image: card.image,
                            category: 'Signature 3D Edition',
                          });
                        }}
                      >
                        Đặt Ngay
                      </button>
                    </div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          CATALOG SECTION: BỘ SƯU TẬP HOA CAO CẤP
          ======================================================== */}
      <section style={{
        padding: '100px 28px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 5,
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '40px',
        }}>
          <div>
            <div className="cross-marks" style={{ marginBottom: '12px' }}>
              <span>+</span><span>+</span><span>+</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, color: '#fff' }}>
              Bộ Sưu Tập <span className="text-highlight-yellow">Nổi Bật</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px', fontSize: '15px' }}>
              Những tác phẩm hoa tươi được thiết kế công phu bởi nghệ nhân bậc thầy
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="home-categories-scroll" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  background: activeCategory === cat ? 'var(--c-yellow)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeCategory === cat ? '#0b0c10' : 'rgba(255, 255, 255, 0.75)',
                  border: activeCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div
          className="home-catalog-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredProducts.map((p) => (
            <Card3D key={p.id} intensity={10} style={{ borderRadius: '24px' }}>
              <div
                className="glass-panel"
                style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setActiveModalProduct(p);
                  setModalQuantity(1);
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    background: 'rgba(12, 13, 18, 0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: p.badgeColor || '#facc15',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    {p.badge || 'ATELIER'}
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(12, 13, 18, 0.7)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                  }}
                  onClick={() => addToast(`Đã thích "${p.name}"!`)}>
                    <Heart size={16} />
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                      {p.category}
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                      {p.name}
                    </h4>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {p.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#facc15' }}>
                        {p.price.toLocaleString('vi-VN')}₫
                      </div>
                      {p.originalPrice && (
                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.35)', textDecoration: 'line-through' }}>
                          {p.originalPrice.toLocaleString('vi-VN')}₫
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        title="Thêm vào giỏ hàng"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#facc15';
                          e.currentTarget.style.color = '#facc15';
                          e.currentTarget.style.background = 'rgba(250, 204, 21, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }}
                      >
                        <ShoppingCart size={14} />
                      </button>

                      <button
                        className="btn-card-action"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        onClick={() => handleQuickOrder(p)}
                      >
                        Đặt Ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* ========================================================
          VIP SERVICES & VALUE PROPOSITION
          ======================================================== */}
      <section id="services" style={{
        padding: '80px 28px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{
          background: 'rgba(18, 20, 29, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          padding: '48px 36px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              Đặc Quyền Dịch Vụ <span className="text-highlight-yellow">VIP</span>
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}>
              Trải nghiệm dịch vụ chuẩn mực quốc tế từ khâu tuyển chọn hoa tươi đến giao tận tay
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: <Palette size={26} color="#a3e635" />,
                title: 'Thiết Kế Độc Bản',
                desc: 'Mỗi tác phẩm được cắm riêng theo câu chuyện và sở thích độc nhất của bạn.',
              },
              {
                icon: <Truck size={26} color="#facc15" />,
                title: 'Giao Nhanh 2 Giờ',
                desc: 'Đội ngũ giao xe hơi giữ ẩm chuyên dụng, cam kết hoa giữ nguyên phom dáng.',
              },
              {
                icon: <ShieldCheck size={26} color="#06b6d4" />,
                title: 'Cam Kết Độ Tươi 5-7 Ngày',
                desc: 'Hoa nhập khẩu trực tiếp từ Ecuador & Hà Lan với gói dinh dưỡng đi kèm.',
              },
              {
                icon: <Clock size={26} color="#ec4899" />,
                title: 'Hỗ Trợ 24/7',
                desc: 'Florist chuyên nghiệp tư vấn phong thủy và phối màu mọi lúc.',
              },
            ].map((f, i) => (
              <div key={i} className="glass-panel-subtle" style={{ padding: '28px 24px', textAlign: 'left' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  {f.icon}
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  {f.title}
                </h4>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          WORKSHOP SECTION
          ======================================================== */}
      <section id="workshop" style={{
        padding: '80px 28px 120px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
        }}>
          <div>
            <div className="cross-marks" style={{ marginBottom: '16px' }}>
              <span>x</span><span>x</span><span>x</span>
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '20px' }}>
              Workshop Cắm Hoa <br />
              <span className="text-highlight-yellow">Nghệ Thuật 3D</span>
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
              Khóa học trải nghiệm cuối tuần cùng Master Florist. Học cách cảm thụ hình khối, phối sắc tương phản và tự tay cắm một tác phẩm mang phong cách studio vị lai để mang về nhà.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/contact" className="hero-cta-btn" style={{ padding: '8px 24px' }}>
                <span>Đăng Ký Khóa Học</span>
                <div className="cta-icon-badge">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Card3D intensity={12} style={{ borderRadius: '28px' }}>
              <div className="showcase-card" style={{ height: '380px' }}>
                <img
                  src="/images/vyvy_lily_hong.jpg"
                  alt="Workshop Nghệ Thuật Vy Vy Flower"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(12,13,18,0.2) 0%, rgba(12,13,18,0.85) 100%)',
                }} />
                <div style={{ position: 'absolute', bottom: '28px', left: '28px', right: '28px' }}>
                  <div style={{ color: '#c084fc', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>
                    WORKSHOP WEEKEND • LIMITED SEATS
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                    Masterclass: Form, Light & Living Petals
                  </h3>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
                    Thứ 7 & Chủ Nhật hàng tuần | Tại Studio Quận 1, TP.HCM
                  </div>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* Modal for detail view */}
      {activeModalProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveModalProduct(null)}
        >
          <div
            className="product-modal-card"
            style={{
              background: '#12141c',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '28px',
              maxWidth: '860px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 25px 70px rgba(0,0,0,0.9), 0 0 40px rgba(250,204,21,0.08)',
              display: 'flex',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveModalProduct(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 30,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={18} />
            </button>

            {/* Left Column: Full Product Image Showcase (No Cropping!) */}
            <div
              className="product-modal-img-col"
              style={{
                flex: '1 1 48%',
                minHeight: '440px',
                position: 'relative',
                overflow: 'hidden',
                background: '#090a0f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Ambient Blurred Backdrop matching flower colors */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-30px',
                  backgroundImage: `url(${activeModalProduct.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(32px) brightness(0.28) saturate(1.4)',
                  transform: 'scale(1.25)',
                  pointerEvents: 'none',
                }}
              />

              {/* Full Uncropped High-Detail Bouquet Image */}
              <img
                src={activeModalProduct.image}
                alt={activeModalProduct.name}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  maxWidth: '100%',
                  maxHeight: '480px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  padding: '16px',
                  filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.7))',
                  transition: 'transform 0.3s ease',
                }}
              />

              {/* Badge Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  zIndex: 10,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(12, 13, 18, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: activeModalProduct.badgeColor || '#facc15',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {activeModalProduct.badge || 'BESPOKE'}
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  zIndex: 10,
                  background: activeModalProduct.stock > 0 ? 'rgba(163, 230, 53, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${activeModalProduct.stock > 0 ? '#a3e635' : '#f43f5e'}66`,
                  color: activeModalProduct.stock > 0 ? '#a3e635' : '#f43f5e',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {activeModalProduct.stock > 0 ? `Còn ${activeModalProduct.stock} bó hoa tươi` : 'Tạm hết hàng'}
              </div>
            </div>

            {/* Right Column: Information & Actions */}
            <div
              className="product-modal-content-col"
              style={{
                flex: '1 1 52%',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflowY: 'auto',
                maxHeight: '90vh',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: '#facc15', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                    {activeModalProduct.category?.toUpperCase()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    ⭐ {activeModalProduct.rating || 4.9} ({activeModalProduct.reviews || 88} đánh giá)
                  </span>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px', lineHeight: 1.3 }}>
                  {activeModalProduct.name}
                </h2>

                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                  {activeModalProduct.description}
                </p>

                {/* Commitments & Value Props */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '22px' }}>
                  <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🌸</span> <span>Hoa tươi loại 1 trong ngày</span>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎀</span> <span>Tặng nơ lụa & thiệp ghi lời</span>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚡</span> <span>Giao hỏa tốc 2 giờ</span>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📸</span> <span>Chụp ảnh thật trước khi giao</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#facc15' }}>
                      {activeModalProduct.price?.toLocaleString('vi-VN')}₫
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>
                      Đơn giá niêm yết (Đã bao gồm VAT & nơ lụa)
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)' }}>Số lượng:</span>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '9999px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '3px 8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setModalQuantity(prev => Math.max(1, prev - 1))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '14px',
                          minWidth: '28px',
                          textAlign: 'center',
                        }}
                      >
                        {modalQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQuantity(prev => prev + 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(activeModalProduct, modalQuantity);
                      setActiveModalProduct(null);
                      setModalQuantity(1);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: '9999px',
                      background: 'rgba(250, 204, 21, 0.12)',
                      border: '1.5px solid #facc15',
                      color: '#facc15',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ShoppingCart size={16} />
                    <span>Thêm Vào Giỏ Hàng</span>
                  </button>

                  <button
                    type="button"
                    className="hero-cta-btn"
                    style={{ flex: 1, justifyContent: 'center', padding: '12px 24px', fontSize: '14px' }}
                    onClick={() => {
                      handleQuickOrder(activeModalProduct, modalQuantity);
                      setActiveModalProduct(null);
                      setModalQuantity(1);
                    }}
                  >
                    <span>Đặt Hoa Ngay</span>
                    <div className="cta-icon-badge"><Check size={18} /></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .home-signature-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .home-categories-scroll {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            width: 100% !important;
            padding-bottom: 6px !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          .home-categories-scroll::-webkit-scrollbar {
            display: none !important;
          }
          .home-categories-scroll button {
            flex-shrink: 0 !important;
          }
          .home-catalog-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        @media (max-width: 768px) {
          .product-modal-card {
            flex-direction: column !important;
            max-height: 88vh !important;
            overflow-y: auto !important;
            border-radius: 22px !important;
          }
          .product-modal-img-col {
            min-height: 320px !important;
            height: 320px !important;
            flex: none !important;
          }
          .product-modal-content-col {
            padding: 22px 18px !important;
            flex: none !important;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}
