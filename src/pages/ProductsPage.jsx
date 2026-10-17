import React, { useState, useEffect, useContext } from 'react';
import { products as fallbackProducts } from '../data/mockData';
import { getProducts } from '../services/api';
import { ToastContext } from '../App';
import Card3D from '../components/Card3D';
import { Search, X, Check, RefreshCw } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

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
  const [productList, setProductList] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  const loadData = () => {
    setLoading(true);
    getProducts()
      .then(data => {
        if (data && data.length > 0) setProductList(data);
      })
      .catch(err => {
        console.error('Failed to fetch products from MySQL:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOrderProduct = (product) => {
    startOrderFlow(product);
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
            Dữ liệu sản phẩm cập nhật trực tiếp từ cơ sở dữ liệu MySQL (Workbench) thời gian thực.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
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
        }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flexGrow: 1, justifyContent: 'flex-end' }}>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
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
              </Card3D>
            ))}
          </div>
        )}

        {/* Modal for detail view */}
        {activeModalProduct && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setActiveModalProduct(null)}>
            <div
              style={{
                background: '#12141c',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '28px',
                maxWidth: '680px',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalProduct(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <X size={18} />
              </button>

              <div style={{ maxHeight: '280px', overflow: 'hidden' }}>
                <img src={activeModalProduct.image} alt={activeModalProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#facc15', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                    {activeModalProduct.category.toUpperCase()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    ⭐ {activeModalProduct.rating} ({activeModalProduct.reviews} đánh giá)
                  </span>
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                  {activeModalProduct.name}
                </h2>

                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  {activeModalProduct.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#facc15' }}>
                      {activeModalProduct.price.toLocaleString('vi-VN')}₫
                    </div>
                  </div>

                  <button
                    className="hero-cta-btn"
                    style={{ padding: '8px 24px' }}
                    onClick={() => {
                      handleOrderProduct(activeModalProduct);
                      setActiveModalProduct(null);
                    }}
                  >
                    <span>Lưu Đơn Vào Database</span>
                    <div className="cta-icon-badge"><Check size={18} /></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
