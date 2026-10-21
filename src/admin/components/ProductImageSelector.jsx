import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/api';

const PRESET_IMAGES = [
  { url: '/images/vyvy_lily_hong.jpg', name: 'Bó Hoa Lily Trắng & Hồng Đỏ Quý Phái' },
  { url: '/images/vyvy_baby_tulip_xanh.jpg', name: 'Bó Baby Xanh Biển & Tulip Trắng' },
  { url: '/images/vyvy_traicay_saurieng.jpg', name: 'Bó Hoa Trái Cây Sầu Riêng & Măng Cụt' },
  { url: '/images/vyvy_hong_juliet_tana.jpg', name: 'Bó Hoa Hồng Juliet & Cúc Tana Nắng Hạ' },
  { url: '/images/vyvy_ly_kep_hong.jpg', name: 'Bó Hoa Ly Kép Hồng Công Chúa' },
  { url: '/images/vyvy_chucmung_2010.jpg', name: 'Bó Hoa Chúc Mừng 20/10 Vy Vy Edition' },
  { url: '/images/vyvy_hong_camchuong.jpg', name: 'Bó Hoa Hồng & Cẩm Chướng Pastel' },
  { url: '/images/vyvy_sac_mau_nang_ha.jpg', name: 'Bó Hoa Sắc Màu Nắng Hạ' },
  { url: '/images/vyvy_lily_trang.jpg', name: 'Bó Hoa Lily Trắng Tinh Khôi' },
  { url: '/images/vyvy_pastel_hong.jpg', name: 'Bó Đồng Tiền & Cẩm Chướng Pastel' },
  { url: '/images/vyvy_baby_xanh_gocnghieng.jpg', name: 'Bó Baby Xanh Biển Nghệ Thuật' },
  { url: '/images/vyvy_dongtien_pastel.jpg', name: 'Bó Đồng Tiền Pastel (Góc cận)' },
  { url: '/images/vyvy_sac_mau_nang_ha_2.jpg', name: 'Bó Sắc Màu Nắng Hạ (Góc cận)' },
];

export default function ProductImageSelector({ value, onChange, productName = 'flower', onError }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url' | 'presets'
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onError) onError('Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WebP, GIF)!');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      if (onError) onError('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 15MB.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result;
          const res = await uploadImage(base64Data, productName);
          if (res.success && res.url) {
            onChange(res.url);
            setUrlInput(res.url);
          } else {
            throw new Error(res.error || 'Tải ảnh thất bại!');
          }
        } catch (uploadErr) {
          if (onError) onError(uploadErr.message || 'Lỗi khi tải ảnh lên máy chủ!');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      if (onError) onError('Không thể đọc file ảnh!');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Preview Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '14px',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#090a0f',
          border: '1px solid rgba(163, 230, 53, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}>
          {uploading ? (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)'
            }}>
              <Loader2 size={24} className="spin" color="#a3e635" />
            </div>
          ) : (
            <img
              src={value || '/images/vyvy_lily_hong.jpg'}
              alt="Preview"
              onError={(e) => { e.target.src = '/images/vyvy_lily_hong.jpg'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a3e635' }}>
              ● ẢNH ĐANG CHỌN
            </span>
            {value?.startsWith('/uploads/') && (
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                fontWeight: 600
              }}>
                Ảnh tải lên từ máy
              </span>
            )}
            {value?.startsWith('http') && (
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#ec4899',
                fontWeight: 600
              }}>
                URL Online
              </span>
            )}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.65)',
            fontSize: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace'
          }}>
            {value || 'Chưa chọn hình ảnh'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`img-selector-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
        >
          <Upload size={14} />
          <span>Tải Ảnh Từ Máy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`img-selector-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
        >
          <LinkIcon size={14} />
          <span>Nhập URL Ảnh</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`img-selector-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
        >
          <ImageIcon size={14} />
          <span>Bộ Sưu Tập Mẫu</span>
        </button>
      </div>

      {/* Tab 1: Upload from computer */}
      {activeTab === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div
            className={`img-drop-zone ${isDragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={28} className="spin" color="#a3e635" />
                <span style={{ fontSize: '13px', color: '#a3e635', fontWeight: 600 }}>
                  Đang tải ảnh lên máy chủ lưu trữ...
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(163, 230, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a3e635'
                }}>
                  <Upload size={20} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                    Nhấp để duyệt ảnh hoặc kéo thả vào đây
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', marginTop: '2px' }}>
                    Hỗ trợ PNG, JPG, JPEG, WebP, GIF (tối đa 15MB)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: URL Input */}
      {activeTab === 'url' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="dark-input"
            placeholder="Dán link ảnh tại đây (VD: https://... hoặc /images/...)"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlApply();
              }
            }}
            style={{ fontSize: '13px' }}
          />
          <button
            type="button"
            onClick={handleUrlApply}
            style={{
              padding: '0 16px',
              borderRadius: '12px',
              background: 'rgba(163, 230, 53, 0.15)',
              border: '1px solid rgba(163, 230, 53, 0.35)',
              color: '#a3e635',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Áp Dụng
          </button>
        </div>
      )}

      {/* Tab 3: Presets */}
      {activeTab === 'presets' && (
        <div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Nhấp vào ảnh để chọn nhanh:
          </div>
          <div className="preset-img-grid">
            {PRESET_IMAGES.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <div
                  key={preset.url}
                  onClick={() => {
                    onChange(preset.url);
                    setUrlInput(preset.url);
                  }}
                  className={`preset-img-item ${isSelected ? 'selected' : ''}`}
                  title={preset.name}
                >
                  <img src={preset.url} alt={preset.name} />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '9999px',
                      background: '#a3e635',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
