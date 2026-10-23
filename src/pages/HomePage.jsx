import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { products as fallbackProducts } from '../data/mockData';
import { getProducts } from '../services/api';
import { ToastContext } from '../App';
import Card3D from '../components/Card3D';
import ProductDetailModal from '../components/ProductDetailModal';
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
            <span>TIỆM HOA TƯƠI NGHỆ THUẬT • SÓC TRĂNG</span>
          </div>

          {/* Headline - Vy Vy Flower with red highlight */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 6.2vw, 4.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            maxWidth: '920px',
            margin: '0 auto 24px',
          }}>
            Vy Vy Flower<br />
            <span className="text-highlight-red">Tiệm hoa Sóc Trăng</span>
          </h1>

          {/* Subtitle text */}
          <p style={{
            fontSize: 'clamp(15px, 2vw, 17.5px)',
            color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
            fontWeight: 500,
          }}>
            Nơi cảm xúc nở thành hoa, mang đến cho bạn độc bản cho những dịp đặc biệt của mình
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
              <Card3D key={card.id} intensity={10} style={{ borderRadius: '26px', height: '100%' }}>
                <div
                  className="signature-showcase-card"
                  onClick={() => {
                    const priceNum = card.id === 'sig-1' ? 680000 : card.id === 'sig-2' ? 520000 : 750000;
                    const fullProduct = dbProducts.find(p => p.id === card.id) || {
                      id: card.id,
                      name: card.title,
                      category: 'Bó hoa',
                      price: priceNum,
                      image: card.image,
                      badge: card.badge,
                      description: card.subtitle,
                      rating: 5.0,
                      reviews: 36,
                    };
                    setActiveModalProduct(fullProduct);
                    setModalQuantity(1);
                  }}
                >
                  {/* Clean, vibrant bouquet photography — 100% unobstructed */}
                  <div className="signature-img-wrap">
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                    />
                    <div className="signature-badge-pill">
                      <span>{card.icon}</span>
                      <span>{card.badge}</span>
                    </div>
                    <div className="signature-curator-tag">
                      <span>✦ VY VY ATELIER</span>
                    </div>
                  </div>

                  {/* Clean, high-contrast dedicated info base (Zero blur, 100% crisp) */}
                  <div className="signature-info-base">
                    <div className="signature-meta-row">
                      <span className="signature-flower-types">{card.subtitle}</span>
                    </div>

                    <h3 className="signature-card-title">
                      {card.title}
                    </h3>

                    <div className="signature-card-bottom-row">
                      <div>
                        <div className="signature-price-label">Giá tác phẩm</div>
                        <div className="signature-card-price">{card.price}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="signature-cart-btn"
                          title="Thêm vào giỏ hàng"
                          onClick={(e) => {
                            e.stopPropagation();
                            const priceNum = card.id === 'sig-1' ? 680000 : card.id === 'sig-2' ? 520000 : 750000;
                            handleAddSignatureToCart(card, priceNum);
                          }}
                        >
                          <ShoppingCart size={15} />
                        </button>

                        <button
                          type="button"
                          className="signature-order-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const priceNum = card.id === 'sig-1' ? 680000 : card.id === 'sig-2' ? 520000 : 750000;
                            handleQuickOrder({
                              id: card.id,
                              name: card.title,
                              price: priceNum,
                              image: card.image,
                              category: 'Signature Atelier Edition',
                            });
                          }}
                        >
                          <span>Đặt Ngay</span>
                        </button>
                      </div>
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
            <div className="catalog-header-badge">
              <span className="badge-sparkle">✦</span>
              <span>TUYỂN TẬP HOA TƯƠI ĐỘC BẢN</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800 }}>
              Bộ Sưu Tập <span className="text-highlight-yellow">Nổi Bật</span>
            </h2>
            <p className="catalog-header-sub" style={{ marginTop: '8px', fontSize: '15px' }}>
              Những tác phẩm hoa tươi được thiết kế công phu bởi nghệ nhân bậc thầy Vy Vy Flower
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="home-categories-scroll" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`catalog-filter-btn ${activeCategory === cat ? 'active' : ''}`}
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
            <Card3D key={p.id} intensity={8} style={{ borderRadius: '26px' }}>
              <div
                className="product-card-luxury"
                onClick={() => {
                  setActiveModalProduct(p);
                  setModalQuantity(1);
                }}
              >
                {/* Image Showcase */}
                <div className="product-card-img-wrap">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                  />
                  <div className="product-card-img-gradient" />

                  {/* Badge */}
                  <div className="product-card-badge">
                    <span>✦</span>
                    <span>{p.badge || 'ATELIER'}</span>
                  </div>

                  {/* Stock Tag if low */}
                  {p.stock !== undefined && p.stock <= 5 && (
                    <div className="product-card-stock-tag">
                      {p.stock > 0 ? `Còn ${p.stock} bó` : 'Tạm hết hàng'}
                    </div>
                  )}

                  {/* Favorite / Heart Button */}
                  <button
                    type="button"
                    className="product-card-heart-btn"
                    title="Thêm vào danh sách yêu thích"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToast(`Đã lưu "${p.name}" vào danh sách yêu thích!`);
                    }}
                  >
                    <Heart size={16} />
                  </button>
                </div>

                {/* Card Body */}
                <div className="product-card-body">
                  <div>
                    <div className="product-card-cat-row">
                      <span className="product-card-category">{p.category}</span>
                      <div className="product-card-rating">
                        <Star size={12} fill="currentColor" />
                        <span>{p.rating || 4.9}</span>
                        <span className="product-card-reviews">({p.reviews || 48})</span>
                      </div>
                    </div>

                    <h4 className="product-card-title" title={p.name}>
                      {p.name}
                    </h4>

                    <p className="product-card-desc">
                      {p.description}
                    </p>

                    <div className="product-card-trust-tag">
                      <Sparkles size={12} />
                      <span>Hoa tươi nhập mới trong ngày • Nở chuẩn phom</span>
                    </div>
                  </div>

                  {/* Footer with Price & Actions */}
                  <div className="product-card-footer">
                    <div>
                      <div className="product-card-price">
                        {p.price.toLocaleString('vi-VN')}₫
                      </div>
                      {p.originalPrice && (
                        <div className="product-card-original-price">
                          {p.originalPrice.toLocaleString('vi-VN')}₫
                        </div>
                      )}
                    </div>

                    <div className="product-card-actions">
                      <button
                        type="button"
                        className="product-card-cart-btn"
                        title="Thêm vào giỏ hàng"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                      >
                        <ShoppingCart size={15} />
                      </button>

                      <button
                        type="button"
                        className="product-card-order-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickOrder(p);
                        }}
                      >
                        <span>Đặt Ngay</span>
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

      {/* Modal for detail view with Reviews & Replies */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          quantity={modalQuantity}
          onQuantityChange={setModalQuantity}
          onAddToCart={(prod, qty) => addToCart(prod, qty)}
          onQuickOrder={(prod, qty) => handleQuickOrder(prod, qty)}
          addToast={addToast}
        />
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
