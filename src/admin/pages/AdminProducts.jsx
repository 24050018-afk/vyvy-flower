import React, { useState, useEffect, useContext } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, updateProductImage } from '../../services/api';
import { ToastContext } from '../../App';
import { Plus, Search, Edit3, Trash2, X, Check, RefreshCw, Camera, Download } from 'lucide-react';
import ProductImageSelector from '../components/ProductImageSelector';
import { exportToCsv, cleanText, cleanMoney, cleanNumber, cleanList } from '../../utils/csvExport';

const categories = ['Bó hoa', 'Hoa chậu', 'Hoa cưới', 'Giỏ hoa'];

export default function AdminProducts() {
  const addToast = useContext(ToastContext);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [quickImageProduct, setQuickImageProduct] = useState(null);
  const [quickImageUrl, setQuickImageUrl] = useState('');
  const [savingImage, setSavingImage] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'Bó hoa',
    price: '',
    originalPrice: '',
    description: '',
    stock: '10',
    badge: 'Mới',
    occasion: 'Sinh nhật, Kỷ niệm',
    rating: '5.0',
    reviews: '0',
    image: '/images/vyvy_lily_hong.jpg',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProductList(data);
    } catch (err) {
      addToast('Không thể tải danh sách sản phẩm!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({
      name: '',
      category: 'Bó hoa',
      price: '',
      originalPrice: '',
      description: '',
      stock: '10',
      badge: 'Mới',
      occasion: 'Sinh nhật, Kỷ niệm',
      rating: '5.0',
      reviews: '0',
      image: '/images/vyvy_lily_hong.jpg',
    });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditItem(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      description: product.description || '',
      stock: String(product.stock),
      badge: product.badge || '',
      occasion: Array.isArray(product.occasion) ? product.occasion.join(', ') : '',
      rating: String(product.rating || '5.0'),
      reviews: String(product.reviews || '0'),
      image: product.image || '/images/vyvy_lily_hong.jpg',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      addToast('Vui lòng điền tên và giá sản phẩm!', 'error');
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock || 10),
      rating: Number(form.rating || 5.0),
      reviews: Number(form.reviews || 0),
      occasion: form.occasion.split(',').map(s => s.trim()).filter(Boolean),
      badgeColor: '#facc15',
    };

    try {
      if (editItem) {
        await updateProduct(editItem.id, payload);
        addToast(`Đã cập nhật "${form.name}" thành công!`);
      } else {
        await createProduct(payload);
        addToast(`Đã thêm mới "${form.name}" thành công!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xác nhận xóa sản phẩm "${name}" khỏi hệ thống?`)) {
      try {
        await deleteProduct(id);
        addToast(`Đã xóa "${name}" vĩnh viễn!`);
        loadData();
      } catch (err) {
        addToast('Lỗi khi xóa sản phẩm!', 'error');
      }
    }
  };

  const openQuickImageEdit = (product) => {
    setQuickImageProduct(product);
    setQuickImageUrl(product.image || '/images/vyvy_lily_hong.jpg');
  };

  const handleSaveQuickImage = async () => {
    if (!quickImageProduct) return;
    setSavingImage(true);
    try {
      await updateProductImage(quickImageProduct.id, quickImageUrl);
      setProductList(prev => prev.map(p => p.id === quickImageProduct.id ? { ...p, image: quickImageUrl } : p));
      addToast(`Đã cập nhật hình ảnh cho "${quickImageProduct.name}" thành công!`);
      setQuickImageProduct(null);
    } catch (err) {
      addToast(err.message || 'Lỗi khi cập nhật ảnh sản phẩm!', 'error');
    } finally {
      setSavingImage(false);
    }
  };

  const filtered = productList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: 'Mã ID', key: (p) => cleanNumber(p.id) },
        { label: 'Tên sản phẩm', key: (p) => cleanText(p.name) },
        { label: 'Danh mục', key: (p) => cleanText(p.category) },
        { label: 'Giá bán (VNĐ)', key: (p) => cleanMoney(p.price) },
        { label: 'Giá gốc niêm yết (VNĐ)', key: (p) => (p.originalPrice ? cleanMoney(p.originalPrice) : '') },
        { label: 'Tồn kho (bó/chậu)', key: (p) => cleanNumber(p.stock) },
        { label: 'Đánh giá (Sao)', key: (p) => cleanNumber(p.rating, 5.0) },
        { label: 'Lượt đánh giá', key: (p) => cleanNumber(p.reviews, 0) },
        { label: 'Huy hiệu', key: (p) => cleanText(p.badge, '—') },
        { label: 'Dịp phù hợp', key: (p) => cleanList(p.occasion) },
        { label: 'Mô tả chi tiết', key: (p) => cleanText(p.description, '') },
        { label: 'Đường dẫn ảnh', key: (p) => cleanText(p.image, '') },
      ];

      const today = new Date().toISOString().split('T')[0];
      exportToCsv(`San_Pham_VyVy_${today}`, columns, filtered);
      addToast(`Đã xuất thành công ${filtered.length} sản phẩm ra file CSV!`);
    } catch (err) {
      addToast(err.message || 'Lỗi khi xuất file CSV!', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: 700, letterSpacing: '1px' }}>
              ● QUẢN LÝ SẢN PHẨM
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              Quản Lý Sản Phẩm
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginTop: '4px' }}>
              Danh mục hoa tươi nghệ thuật, cập nhật thời gian thực
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '9999px',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Xuất danh sách sản phẩm đang hiển thị ra file CSV Excel"
            >
              <Download size={15} />
              <span>Xuất CSV ({filtered.length})</span>
            </button>

            <button
              onClick={loadData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
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
              <span>Tải Lại</span>
            </button>

            <button
              onClick={openAdd}
              className="hero-cta-btn"
              style={{ padding: '8px 22px', fontSize: '13px' }}
            >
              <span>Thêm Sản Phẩm</span>
              <div className="cta-icon-badge" style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                <Plus size={16} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ marginBottom: '20px', width: '100%', maxWidth: '380px', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
        <input
          type="text"
          placeholder="Tìm sản phẩm theo tên, danh mục..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="dark-input"
          style={{ paddingLeft: '44px', borderRadius: '9999px' }}
        />
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản Phẩm</th>
                <th>Danh Mục</th>
                <th>Giá Bán</th>
                <th>Tồn Kho</th>
                <th>Đánh Giá</th>
                <th>Huy Hiệu</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        className="admin-product-thumb-wrap"
                        title="Nhấp để đổi nhanh hình ảnh sản phẩm"
                        onClick={() => openQuickImageEdit(p)}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          onError={(e) => { e.target.src = '/images/vyvy_lily_hong.jpg'; }}
                        />
                        <div className="admin-product-thumb-overlay">
                          <Camera size={18} />
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{p.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      background: 'rgba(250, 204, 21, 0.1)',
                      border: '1px solid rgba(250, 204, 21, 0.25)',
                      color: '#facc15',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      {p.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#facc15' }}>
                      {p.price?.toLocaleString('vi-VN')}₫
                    </div>
                    {p.originalPrice && (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
                        {p.originalPrice.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: p.stock > 10 ? 'rgba(163, 230, 53, 0.12)' : p.stock > 0 ? 'rgba(250, 204, 21, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                      color: p.stock > 10 ? '#a3e635' : p.stock > 0 ? '#facc15' : '#f43f5e',
                    }}>
                      {p.stock} bó
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#fff', fontSize: '13px' }}>⭐ {p.rating}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginLeft: '4px' }}>({p.reviews})</span>
                  </td>
                  <td>
                    {p.badge ? (
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: p.badgeColor || '#facc15',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}>
                        {p.badge}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => openQuickImageEdit(p)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(163, 230, 53, 0.12)',
                          border: '1px solid rgba(163, 230, 53, 0.3)',
                          color: '#a3e635',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                        title="Đổi nhanh hình ảnh cho sản phẩm này"
                      >
                        <Camera size={13} /> Đổi ảnh
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          color: '#06b6d4',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <Edit3 size={13} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(244, 63, 94, 0.12)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          color: '#f43f5e',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                {editItem ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="dark-input"
                  placeholder="Ví dụ: Bó Hoa Dạ Khúc 3D"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Danh mục
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="dark-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Giá bán (₫) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="dark-input"
                    placeholder="950000"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Giá gốc niêm yết (₫)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                    className="dark-input"
                    placeholder="1200000"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="dark-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="dark-input"
                  placeholder="Mô tả các loài hoa chính, ý nghĩa thiết kế..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Huy hiệu (Badge)
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                    className="dark-input"
                    placeholder="Bán chạy / Độc bản / Mới..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Dịp tặng phù hợp
                  </label>
                  <input
                    type="text"
                    value={form.occasion}
                    onChange={e => setForm({ ...form, occasion: e.target.value })}
                    className="dark-input"
                    placeholder="Sinh nhật, Khai trương, Tình nhân..."
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Hình ảnh sản phẩm (Tải lên từ máy, URL online hoặc chọn mẫu)
                </label>
                <ProductImageSelector
                  value={form.image}
                  onChange={(newImg) => setForm({ ...form, image: newImg })}
                  productName={form.name}
                  onError={(msg) => addToast(msg, 'error')}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="hero-cta-btn"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  <span>{editItem ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm Mới'}</span>
                  <div className="cta-icon-badge" style={{ width: '28px', height: '28px' }}>
                    <Check size={16} />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Image Edit Modal */}
      {quickImageProduct && (
        <div className="modal-overlay" onClick={() => !savingImage && setQuickImageProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#a3e635', fontWeight: 700, letterSpacing: '0.5px' }}>
                  ● HÌNH ẢNH SẢN PHẨM
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                  Đổi Hình Ảnh Sản Phẩm
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', marginTop: '2px' }}>
                  {quickImageProduct.name} • Danh mục: {quickImageProduct.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !savingImage && setQuickImageProduct(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <ProductImageSelector
              value={quickImageUrl}
              onChange={setQuickImageUrl}
              productName={quickImageProduct.name}
              onError={(msg) => addToast(msg, 'error')}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                disabled={savingImage}
                onClick={() => setQuickImageProduct(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingImage}
                onClick={handleSaveQuickImage}
                className="hero-cta-btn"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <span>{savingImage ? 'Đang Lưu...' : 'Cập Nhật Ảnh'}</span>
                <div className="cta-icon-badge" style={{ width: '28px', height: '28px' }}>
                  <Check size={16} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
