import React, { useState, useEffect, useContext } from 'react';
import { products as fallbackProducts } from '../data/mockData';
import { getProducts } from '../services/api';
import { ToastContext } from '../App';
import Card3D from '../components/Card3D';
import ProductDetailModal from '../components/ProductDetailModal';
import { Search, X, Check, RefreshCw, ShoppingCart, Plus, Minus, Star, Sparkles, Heart } from 'lucide-react';
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
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`catalog-filter-btn ${selectedCategory === c ? 'active' : ''}`}
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
              <Card3D key={p.id} intensity={8} style={{ borderRadius: '26px' }}>
                <div
                  className="product-card-luxury"
                  onClick={() => setActiveModalProduct(p)}
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

                    {/* Stock Tag */}
                    <div className="product-card-stock-tag">
                      {p.stock > 0 ? `Còn ${p.stock} bó` : 'Hết hàng'}
                    </div>

                    {/* Heart / Wishlist button */}
                    <button
                      type="button"
                      className="product-card-heart-btn"
                      title="Yêu thích"
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

                      <h3 className="product-card-title" title={p.name}>
                        {p.name}
                      </h3>

                      <p className="product-card-desc">
                        {p.description}
                      </p>

                      <div className="product-card-trust-tag">
                        <Sparkles size={12} />
                        <span>Hoa tươi loại 1 • Giao nhanh 2h</span>
                      </div>
                    </div>

                    {/* Footer */}
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
                            handleOrderProduct(p);
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
        )}

        {/* Modal for detail view with Reviews & Replies */}
        {activeModalProduct && (
          <ProductDetailModal
            product={activeModalProduct}
            onClose={() => setActiveModalProduct(null)}
            quantity={modalQuantity}
            onQuantityChange={setModalQuantity}
            onAddToCart={(prod, qty) => addToCart(prod, qty)}
            onQuickOrder={(prod, qty) => startDirectOrder(prod, qty)}
            addToast={addToast}
          />
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
