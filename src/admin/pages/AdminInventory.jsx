import React, { useState, useEffect, useContext } from 'react';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../services/api';
import { ToastContext } from '../../App';
import { Plus, Search, Edit3, Trash2, X, Check, RefreshCw, AlertTriangle, Download } from 'lucide-react';
import { exportToCsv, cleanMoney, cleanNumber, cleanText, cleanDate } from '../../utils/csvExport';

const categories = ['Tất cả', 'Hoa tươi', 'Phụ liệu', 'Bình/Chậu'];

export default function AdminInventory() {
  const addToast = useContext(ToastContext);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Hoa tươi',
    quantity: '50',
    unit: 'cành',
    minStock: '20',
    pricePerUnit: '25000',
    supplier: '',
  });

  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      addToast('Không thể tải kho nguyên vật liệu!', 'error');
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
      category: 'Hoa tươi',
      quantity: '50',
      unit: 'cành',
      minStock: '20',
      pricePerUnit: '25000',
      supplier: '',
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minStock: String(item.minStock),
      pricePerUnit: String(item.pricePerUnit),
      supplier: item.supplier || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity) {
      addToast('Vui lòng điền tên và số lượng!', 'error');
      return;
    }

    try {
      if (editItem) {
        await updateInventoryItem(editItem.id, {
          name: form.name,
          category: form.category,
          quantity: Number(form.quantity),
          unit: form.unit,
          minStock: Number(form.minStock),
          pricePerUnit: Number(form.pricePerUnit),
          supplier: form.supplier,
        });
        addToast(`Đã cập nhật "${form.name}" thành công!`);
      } else {
        await createInventoryItem({
          name: form.name,
          category: form.category,
          quantity: Number(form.quantity),
          unit: form.unit,
          minStock: Number(form.minStock),
          pricePerUnit: Number(form.pricePerUnit),
          supplier: form.supplier,
        });
        addToast(`Đã thêm mới "${form.name}" thành công!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      addToast('Lỗi khi lưu vật tư!', 'error');
    }
  };

  const handleRestock = async (item) => {
    const addAmount = Number(restockQty);
    if (!addAmount || addAmount <= 0) {
      addToast('Vui lòng nhập số lượng hợp lệ!', 'error');
      return;
    }

    try {
      const newQty = Number(item.quantity) + addAmount;
      const today = new Date().toISOString().split('T')[0];
      await updateInventoryItem(item.id, {
        quantity: newQty,
        lastRestocked: today,
      });
      addToast(`Đã nhập thêm +${addAmount} ${item.unit} cho "${item.name}"!`);
      setRestockId(null);
      setRestockQty('');
      loadData();
    } catch (err) {
      addToast('Lỗi khi nhập kho!', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xác nhận xóa vật tư "${name}"?`)) {
      try {
        await deleteInventoryItem(id);
        addToast(`Đã xóa "${name}"!`);
        loadData();
      } catch (err) {
        addToast('Lỗi khi xóa vật tư!', 'error');
      }
    }
  };

  const filtered = inventory
    .filter(i => filterCategory === 'Tất cả' || i.category === filterCategory)
    .filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.supplier || '').toLowerCase().includes(search.toLowerCase())
    );

  const lowStockList = inventory.filter(i => i.quantity <= i.minStock);

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: 'Mã ID', key: (i) => cleanNumber(i.id) },
        { label: 'Tên vật tư / hoa', key: (i) => cleanText(i.name) },
        { label: 'Danh mục', key: (i) => cleanText(i.category) },
        { label: 'Số lượng tồn', key: (i) => cleanNumber(i.quantity) },
        { label: 'Đơn vị tính', key: (i) => cleanText(i.unit) },
        { label: 'Mức tồn tối thiểu', key: (i) => cleanNumber(i.minStock) },
        { label: 'Đơn giá nhập (VNĐ)', key: (i) => cleanMoney(i.pricePerUnit) },
        { label: 'Tổng giá trị tồn (VNĐ)', key: (i) => cleanMoney(cleanNumber(i.quantity) * cleanMoney(i.pricePerUnit)) },
        { label: 'Nhà cung cấp', key: (i) => cleanText(i.supplier, 'Chưa cập nhật') },
        { label: 'Lần nhập gần nhất', key: (i) => cleanDate(i.lastRestocked) },
        { label: 'Trạng thái tồn kho', key: (i) => (cleanNumber(i.quantity) <= cleanNumber(i.minStock) ? 'Cảnh báo sắp hết hàng' : 'Đầy đủ') },
      ];

      const today = new Date().toISOString().split('T')[0];
      exportToCsv(`Ton_Kho_VyVy_${today}`, columns, filtered);
      addToast(`Đã xuất thành công ${filtered.length} mục tồn kho ra file CSV!`);
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
              ● QUẢN LÝ KHO NGUYÊN LIỆU
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              Quản Lý Tồn Kho & Nguyên Liệu
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', marginTop: '4px' }}>
              Kiểm soát số lượng hoa tươi, giấy gói, bình gốm và phụ liệu theo thời gian thực
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
              title="Xuất các mục tồn kho đang hiển thị ra file CSV Excel"
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
              <span>Thêm Vật Tư</span>
              <div className="cta-icon-badge" style={{ width: '30px', height: '30px' }}>
                <Plus size={16} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Low stock warning banner */}
      {lowStockList.length > 0 && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '18px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <AlertTriangle size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#f43f5e', fontSize: '14px' }}>
              Cảnh Báo Tồn Kho Thấp ({lowStockList.length} mặt hàng):
            </strong>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', marginLeft: '8px' }}>
              {lowStockList.map(i => `${i.name} (còn ${i.quantity} ${i.unit})`).join(', ')} cần nhập thêm ngay.
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div className="admin-filter-scroll-row">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                background: filterCategory === c ? '#facc15' : 'rgba(255, 255, 255, 0.05)',
                color: filterCategory === c ? '#0b0c10' : 'rgba(255, 255, 255, 0.7)',
                border: filterCategory === c ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '260px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên vật tư, nhà cung cấp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dark-input"
            style={{ paddingLeft: '44px', borderRadius: '9999px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên Vật Tư</th>
                <th>Phân Loại</th>
                <th>Số Lượng Tồn</th>
                <th>Đơn Vị</th>
                <th>Đơn Giá Vốn</th>
                <th>Nhà Cung Cấp</th>
                <th>Lần Nhập Gần Nhất</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.quantity <= item.minStock;
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ color: '#fff', fontWeight: 700 }}>{item.name}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          color: isLow ? '#f43f5e' : '#a3e635',
                          fontWeight: 800,
                          fontSize: '15px',
                        }}>
                          {item.quantity}
                        </span>
                        {isLow && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#f43f5e',
                            background: 'rgba(244, 63, 94, 0.15)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}>
                            Thấp
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{item.unit}</td>
                    <td style={{ color: '#facc15', fontWeight: 600 }}>
                      {item.pricePerUnit?.toLocaleString('vi-VN')}₫
                    </td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{item.supplier || '—'}</td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                      {item.lastRestocked || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {restockId === item.id ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            placeholder="+SL"
                            value={restockQty}
                            onChange={e => setRestockQty(e.target.value)}
                            style={{
                              width: '65px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background: '#12141c',
                              border: '1px solid #facc15',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          />
                          <button
                            onClick={() => handleRestock(item)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#a3e635',
                              border: 'none',
                              color: '#000',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setRestockId(null)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => { setRestockId(item.id); setRestockQty('20'); }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              background: 'rgba(163, 230, 53, 0.12)',
                              border: '1px solid rgba(163, 230, 53, 0.3)',
                              color: '#a3e635',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            + Nhập Kho
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              background: 'rgba(6, 182, 212, 0.12)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              color: '#06b6d4',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '8px',
                              background: 'rgba(244, 63, 94, 0.1)',
                              border: '1px solid rgba(244, 63, 94, 0.25)',
                              color: '#f43f5e',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                {editItem ? 'Chỉnh Sửa Vật Tư' : 'Thêm Vật Tư Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Tên vật tư / nguyên liệu *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="dark-input"
                  placeholder="Ví dụ: Hoa Hồng Red Naomi"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Phân loại
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="dark-input"
                  >
                    <option value="Hoa tươi">Hoa tươi</option>
                    <option value="Phụ liệu">Phụ liệu</option>
                    <option value="Bình/Chậu">Bình/Chậu</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    required
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="dark-input"
                    placeholder="cành, cây, bông, cuộn..."
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Số lượng hiện có *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="dark-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Ngưỡng báo động tồn kho
                  </label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={e => setForm({ ...form, minStock: e.target.value })}
                    className="dark-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Đơn giá vốn (₫)
                  </label>
                  <input
                    type="number"
                    value={form.pricePerUnit}
                    onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                    className="dark-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Nhà cung cấp
                  </label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                    className="dark-input"
                    placeholder="Đà Lạt Farm / Nhập khẩu"
                  />
                </div>
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
                  <span>{editItem ? 'Cập Nhật Kho' : 'Thêm Vào Kho'}</span>
                  <div className="cta-icon-badge" style={{ width: '28px', height: '28px' }}>
                    <Check size={16} />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
