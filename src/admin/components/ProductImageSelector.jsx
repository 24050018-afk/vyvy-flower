import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, Loader2, Cloud, Key, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { uploadImage, updateProduct } from '../../services/api';

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

// Client-side image compressor: scales high-res images to max 1200px at 0.82 JPEG quality
function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProductImageSelector({
  value = '',
  onChange,
  onSelect,
  onClose,
  productName = 'flower',
  productId = null,
  onSuccess,
  onError
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url' | 'presets'
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imgbbKey, setImgbbKey] = useState(() => {
    try {
      return localStorage.getItem('vyvy_imgbb_key') || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMGBB_KEY) || '7da53652c2a02e2cbbf329908196daeb';
    } catch {
      return '7da53652c2a02e2cbbf329908196daeb';
    }
  });
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const [keyInput, setKeyInput] = useState(() => {
    try {
      return localStorage.getItem('vyvy_imgbb_key') || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMGBB_KEY) || '7da53652c2a02e2cbbf329908196daeb';
    } catch {
      return '7da53652c2a02e2cbbf329908196daeb';
    }
  });
  const fileInputRef = useRef(null);

  // Sync internal urlInput state if parent value prop changes
  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  // Safe handler that supports both onChange and onSelect props and immediate DB sync
  const handleSelect = async (url) => {
    if (!url) return;
    if (productId) {
      try {
        await updateProduct(productId, { image_url: url, image: url });
      } catch (dbErr) {
        console.warn('[Auto-update PUT /api/products/:id error]:', dbErr);
      }
    }
    if (typeof onChange === 'function') onChange(url);
    if (typeof onSelect === 'function') onSelect(url);
    if (typeof onSuccess === 'function') onSuccess(url);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onError) onError('Vui lòng chọn tệp định dạng hình ảnh (JPG, PNG, WebP, GIF)!');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      if (onError) onError('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 25MB.');
      return;
    }

    setUploading(true);
    try {
      // 1. Compress image to clean, sharp, lightweight JPEG (~80-120KB)
      const compressedDataUrl = await compressImageFile(file);

      // 2. Attempt server / cloud upload (ImgBB Cloud CDN)
      let finalUrl = compressedDataUrl;
      try {
        const res = await uploadImage(compressedDataUrl, productName);
        if (res && res.url) {
          finalUrl = res.url;
        }
      } catch (uploadErr) {
        console.warn('[Upload Notice] Backend API upload not available, using compressed image data directly:', uploadErr);
      }

      // 3. Immediately persist to database (TiDB Cloud) via PUT /api/products/:id if productId provided
      if (productId) {
        try {
          await updateProduct(productId, { image_url: finalUrl, image: finalUrl });
        } catch (dbErr) {
          console.warn('[Auto-save to TiDB Cloud error]:', dbErr);
        }
      }

      // 4. Apply the final URL and trigger callbacks
      handleSelect(finalUrl);
      setUrlInput(finalUrl);
      if (typeof onSuccess === 'function') {
        onSuccess(finalUrl);
      }
    } catch (err) {
      console.error('File read error:', err);
      if (onError) onError('Không thể xử lý hình ảnh này! Vui lòng thử ảnh khác.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (urlInput && urlInput.trim()) {
      handleSelect(urlInput.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {typeof onClose === 'function' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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

          {/* Cloud Storage Integration Card */}
          <div style={{
            marginTop: '12px',
            padding: '12px 14px',
            borderRadius: '14px',
            background: imgbbKey ? 'rgba(34, 197, 94, 0.08)' : 'rgba(250, 204, 21, 0.08)',
            border: `1px solid ${imgbbKey ? 'rgba(34, 197, 94, 0.25)' : 'rgba(250, 204, 21, 0.25)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cloud size={16} color={imgbbKey ? '#22c55e' : '#facc15'} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: imgbbKey ? '#22c55e' : '#facc15' }}>
                  {imgbbKey ? 'Đã Kích Hoạt Cloud ImgBB (Lưu Vĩnh Viễn)' : 'Lưu Ảnh Vĩnh Viễn Trên Cloud (Khuyên dùng)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCloudConfig(!showCloudConfig)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: imgbbKey ? '#22c55e' : '#facc15',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {showCloudConfig ? 'Đóng' : (imgbbKey ? 'Đổi Key' : 'Cài Đặt')}
              </button>
            </div>

            <div style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.4 }}>
              {imgbbKey
                ? 'Ảnh tải từ máy sẽ tự động up lên Cloud ImgBB và tạo link trực tuyến (https://i.ibb.co/...) cho mọi khách hàng xem được ngay!'
                : 'Để up ảnh trực tiếp trên web cho mọi khách hàng cùng thấy mà không cần cập nhật code, hãy dán API Key ImgBB (miễn phí 100%) bên dưới.'}
            </div>

            {showCloudConfig && (
              <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Dán ImgBB API Key tại đây..."
                    className="dark-input"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value.trim())}
                    style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('vyvy_imgbb_key', keyInput);
                      setImgbbKey(keyInput);
                      setShowCloudConfig(false);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: '#22c55e',
                      color: '#000',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Lưu Key
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Chưa có key?</span>
                  <a
                    href="https://api.imgbb.com/"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                  >
                    <span>Lấy Key miễn phí trong 30 giây tại api.imgbb.com</span>
                    <ExternalLink size={11} />
                  </a>
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
              handleSelect(e.target.value);
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
                    handleSelect(preset.url);
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
