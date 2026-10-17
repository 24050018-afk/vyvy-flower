import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { products as fallbackProducts } from '../data/mockData';
import { getProducts } from '../services/api';
import { ToastContext } from '../App';
import Card3D from '../components/Card3D';
import { Sparkles, ArrowRight, Heart, Star, ShieldCheck, Truck, Clock, Palette } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

export default function HomePage() {
  const addToast = useContext(ToastContext);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [dbProducts, setDbProducts] = useState(fallbackProducts);

  useEffect(() => {
    getProducts()
      .then(data => {
        if (data && data.length > 0) setDbProducts(data);
      })
      .catch(() => {});
  }, []);

  const { startOrderFlow } = useCustomer();

  const handleQuickOrder = (title, priceNum) => {
    startOrderFlow({
      id: Date.now(),
      name: title,
      price: priceNum,
      image: '/images/spheres_green.jpg',
      category: 'Signature 3D Edition'
    });
  };

  // The 3 signature 3D showcase cards from the reference image
  const signature3DCards = [
    {
      id: 'sig-1',
      title: 'ELECTRO BLOOM',
      subtitle: 'TROPICAL BOTANICALS • 2026',
      badge: 'POPULAR',
      price: '950.000₫',
      image: '/images/spheres_green.jpg',
      themeColor: '#a3e635',
      icon: '🌿',
    },
    {
      id: 'sig-2',
      title: 'FOAM SUNSHINE',
      subtitle: 'GOLDEN ROSE & AMBER • ATELIER',
      badge: 'SIGNATURE',
      price: '1.450.000₫',
      image: '/images/spheres_yellow.jpg',
      themeColor: '#facc15',
      icon: '✨',
    },
    {
      id: 'sig-3',
      title: 'VELVET DREAM',
      subtitle: 'LAVENDER & HYDRANGEA • LUXE',
      badge: 'PRESTIGE',
      price: '1.850.000₫',
      image: '/images/spheres_purple.jpg',
      themeColor: '#c084fc',
      icon: '🔮',
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
            <span style={{ color: '#facc15' }}>✦</span>
            <span>NEXT-GEN FLORAL ATELIER & BESPOKE ART</span>
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
            Không gian nghệ thuật cắm hoa đương đại độc bản. Nơi từng đóa hoa được tuyển chọn thủ công, kết tinh cùng ngôn ngữ thiết kế 3D vị lai.
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '24px',
            maxWidth: '1060px',
            margin: '0 auto',
            textAlign: 'left',
          }}>
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

                    <button
                      className="btn-card-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        const priceNum = card.id === 'sig-1' ? 950000 : card.id === 'sig-2' ? 1450000 : 1850000;
                        handleQuickOrder(card.title, priceNum);
                      }}
                    >
                      Place a Bid
                    </button>
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {filteredProducts.map((p) => (
            <Card3D key={p.id} intensity={10} style={{ borderRadius: '24px' }}>
              <div className="glass-panel" style={{
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'all 0.3s ease',
              }}>
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

                    <button
                      className="btn-card-action"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                      onClick={() => handleQuickOrder(p.name, p.price)}
                    >
                      Đặt Ngay
                    </button>
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
                  src="/images/spheres_purple.jpg"
                  alt="Workshop 3D"
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

    </div>
  );
}
