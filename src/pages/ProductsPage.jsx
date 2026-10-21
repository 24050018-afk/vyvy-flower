import React, { useState, useEffect, useContext } from 'react';
import { products as fallbackProducts } from '../data/mockData';
import { getProducts } from '../services/api';
import { ToastContext } from '../App';
import Card3D from '../components/Card3D';
import { Search, X, Check, RefreshCw, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useCart } from '../context/CartContext';

const categories = ['Tất cả', 'Bó hoa', 'Hoa chậu', 'Hoa cưới', 'Giỏ hoa'];
const sortOptions = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

export default function ProductsPage() {
  const addToast = useContext(ToastContext);
  const { startOrderFlow } = useCustomer();
  const { addToCart, startDirectOrder } = useCart();
  const [productList, setProductList] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  const loadData = () => {
    setLoading(true);
    getProducts()
      .then(data => {
        if (data && data.length > 0) {
          const clean = data.filter(p => !p.image?.includes('spheres_') && p.name !== 'aaaa');
          if (clean.length > 0) setProductList(clean);
        }
      })
      .catch(err => {
        console.error('Failed to fetch products from backend:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOrderProduct = (product, qty = 1) => {
    startDirectOrder(product, qty);
  };

  // Filter
  let filtered = productList.filter(p => {
    const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // Sort
  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '130px',
      paddingBottom: '100px',
      position: 'relative',
      zIndex: 5,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="cross-marks" style={{ marginBottom: '12px' }}>
            <span>x</span><span>x</span><span>x</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
            Bộ Sưu Tập <span className="text-highlight-yellow">Độc Bản</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '580px', margin: '0 auto', fontSize: '15px' }}>
            Tuyển tập những thiết kế hoa tươi nghệ thuật cao cấp, kết tinh từ niềm đam mê và thẩm mỹ đương đại.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          className="products-filter-bar"
          style={{
            background: 'rgba(18, 20, 29, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '24px',
            padding: '18px 24px',
            marginBottom: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Categories */}
          <div className="products-categories-scroll" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  background: selectedCategory === c ? '#facc15' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === c ? '#0b0c10' : 'rgba(255, 255, 255, 0.75)',
                  border: selectedCategory === c ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="products-search-sort-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flexGrow: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="Tìm tác phẩm hoa..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(10, 11, 16, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9999px',
                  padding: '9px 16px 9px 38px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background: 'rgba(10, 11, 16, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '9999px',
                padding: '9px 16px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value} style={{ background: '#12141c', color: '#fff' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginBottom: '24px' }}>
          <div>
            Hiển thị <strong style={{ color: '#fff' }}>{filtered.length}</strong> mẫu hoa trong cơ sở dữ liệu
          </div>
          <button
            onClick={loadData}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Đồng bộ DB</span>
          </button>
        </div>

        {/* Product Grid / Empty State */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'rgba(18, 20, 29, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '28px',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ fontSize: '42px', marginBottom: '14px' }}>🌿</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Không tìm thấy mẫu hoa nào phù hợp
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 22px' }}>
              Thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc để khám phá toàn bộ bộ sưu tập hoa tươi.
            </p>
            <button
              onClick={() => { setSelectedCategory('Tất cả'); setSearchTerm(''); }}
              className="hero-cta-btn"
              style={{ margin: '0 auto', padding: '10px 24px', fontSize: '13px' }}
            >
              <span>Xem Tất Cả Mẫu Hoa</span>
            </button>
          </div>
        ) : (
          <div
            className="products-grid-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {filtered.map(p => (
              <Card3D key={p.id} intensity={12} style={{ borderRadius: '24px' }}>
                <div
                  className="glass-panel"
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveModalProduct(p)}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                      {p.badge || 'BESPOKE'}
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: p.stock > 0 ? 'rgba(163, 230, 53, 0.18)' : 'rgba(244, 63, 94, 0.2)',
                      border: `1px solid ${p.stock > 0 ? '#a3e635' : '#f43f5e'}55`,
                      color: p.stock > 0 ? '#a3e635' : '#f43f5e',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      {p.stock > 0 ? `Còn ${p.stock} bó` : 'Hết hàng'}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                        {p.category}
                      </div>
                      <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                        {p.name}
                      </h3>
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
                        <div style={{ fontSize: '19px', fontWeight: 800, color: '#facc15' }}>
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
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
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
                          <ShoppingCart size={15} />
                        </button>

                        <button
                          className="btn-card-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderProduct(p);
                          }}
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
        )}

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
                      {activeModalProduct.category.toUpperCase()}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                      ⭐ {activeModalProduct.rating} ({activeModalProduct.reviews} đánh giá)
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
                        {activeModalProduct.price.toLocaleString('vi-VN')}₫
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
                        handleOrderProduct(activeModalProduct, modalQuantity);
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
            .products-filter-bar {
              padding: 14px 16px !important;
              border-radius: 18px !important;
              gap: 12px !important;
            }
            .products-categories-scroll {
              flex-wrap: nowrap !important;
              overflow-x: auto !important;
              width: 100% !important;
              padding-bottom: 6px !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
            }
            .products-categories-scroll::-webkit-scrollbar {
              display: none !important;
            }
            .products-categories-scroll button {
              flex-shrink: 0 !important;
            }
            .products-search-sort-row {
              width: 100% !important;
              flex-direction: column !important;
              gap: 10px !important;
            }
            .products-search-sort-row > div {
              width: 100% !important;
              min-width: 100% !important;
            }
            .products-search-sort-row select {
              width: 100% !important;
            }
            .products-grid-container {
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
    </div>
  );
}
