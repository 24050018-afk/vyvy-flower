import React, { useState, useEffect, useContext } from 'react';
import {
  Star, MessageSquare, Edit3, Trash2, Send, CornerDownRight,
  Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle, X,
  ExternalLink, Sparkles, User, RefreshCw
} from 'lucide-react';
import { ToastContext } from '../../App';
import { getProducts } from '../../services/api';

const DEFAULT_SEEDS = {
  'sig-1': [
    {
      id: 'rev-101',
      userName: 'Ngọc Mai',
      userAvatar: 'NM',
      rating: 5,
      date: 'Hôm qua lúc 14:20',
      isBuyer: true,
      comment: 'Bó baby xanh với tulip trắng xuất sắc luôn Vy Vy ơi! Hoa tươi rói, phối màu nhã nhặn sang trọng. Bạn mình nhận khen nức nở!',
      tags: ['Hoa tươi như hình', 'Thợ cắm khéo'],
      likes: 12,
      replies: [
        {
          id: 'rep-101-1',
          authorName: 'Vy Vy Flower',
          authorRole: 'Nghệ nhân chủ tiệm',
          isShop: true,
          isAdmin: true,
          date: 'Hôm qua lúc 15:05',
          comment: 'Vy Vy Flower cảm ơn bạn Ngọc Mai rất nhiều ạ! Chúc bạn và người nhận luôn xinh đẹp và ngập tràn niềm vui nhé 🌸'
        }
      ]
    },
    {
      id: 'rev-102',
      userName: 'Trần Anh Tuấn',
      userAvatar: 'AT',
      rating: 5,
      date: '3 ngày trước',
      isBuyer: true,
      comment: 'Giao hỏa tốc chuẩn giờ hẹn ở Sóc Trăng. Shop gói hàng cẩn thận, có bọc chân hoa giữ ẩm tốt. Nơ lụa thêu rất sang. 10/10 điểm phục vụ!',
      tags: ['Giao đúng giờ', 'Nơ lụa đẹp'],
      likes: 6,
      replies: [
        {
          id: 'rep-102-1',
          authorName: 'Vy Vy Flower',
          authorRole: 'Chăm sóc khách hàng',
          isShop: true,
          isAdmin: true,
          date: '3 ngày trước',
          comment: 'Dạ tiệm cảm ơn anh Tuấn đã tin tưởng chọn hoa tại Vy Vy Flower. Rất vui được tiếp tục phục vụ anh vào các dịp sắp tới ạ ✨'
        }
      ]
    }
  ],
  'sig-2': [
    {
      id: 'rev-201',
      userName: 'Lê Thảo Vy',
      userAvatar: 'TV',
      rating: 5,
      date: '2 ngày trước',
      isBuyer: true,
      comment: 'Hoa hồng Juliet thơm dịu nhẹ kết hợp cúc Tana nhỏ xinh nhìn mê ly luôn. Đúng chuẩn phong cách thơ mộng atelier!',
      tags: ['Hoa thơm dịu', 'Đúng mô tả'],
      likes: 9,
      replies: [
        {
          id: 'rep-201-1',
          authorName: 'Vy Vy Flower',
          authorRole: 'Nghệ nhân chủ tiệm',
          isShop: true,
          isAdmin: true,
          date: '2 ngày trước',
          comment: 'Cảm ơn Thảo Vy nhiều nhen, bó này bên mình chọn từng búp Juliet nở chuẩn phom nhất trong ngày đó ạ!'
        }
      ]
    }
  ]
};

export default function AdminReviews() {
  const addToast = useContext(ToastContext);
  const [products, setProducts] = useState([]);
  const [reviewsDB, setReviewsDB] = useState(() => {
    try {
      const stored = localStorage.getItem('vyvy_product_reviews');
      return stored ? JSON.parse(stored) : DEFAULT_SEEDS;
    } catch {
      return DEFAULT_SEEDS;
    }
  });

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState('all'); // 'all' | '5' | '4' | '3' | '1-2'
  const [replyFilter, setReplyFilter] = useState('all'); // 'all' | 'replied' | 'pending'
  const [productFilter, setProductFilter] = useState('all');

  // Edit Review Modal
  const [editingReview, setEditingReview] = useState(null); // { productId, review }
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editTags, setEditTags] = useState([]);

  // Reply Modal
  const [replyingReview, setReplyingReview] = useState(null); // { productId, review }
  const [replyText, setReplyText] = useState('');

  // Delete Confirm Dialog
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'review'|'reply', productId, reviewId, replyId, authorName }

  // Quick Reply Templates
  const adminQuickReplies = [
    '🌸 Vy Vy Flower chân thành cảm ơn quý khách đã tin yêu và ủng hộ tiệm hoa ạ!',
    '🌷 Tiệm luôn cam kết chọn hoa tươi loại 1 trong ngày và trao gửi trọn vẹn yêu thương.',
    '✨ Chúc bạn và người nhận luôn xinh đẹp, rạng rỡ và ngập tràn niềm vui!',
    '📞 Cảm ơn góp ý quý báu của bạn, quản lý tiệm sẽ liên hệ trực tiếp để phục vụ bạn chu đáo hơn ạ!'
  ];

  // Load products
  useEffect(() => {
    const fetchProds = async () => {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (e) {
        console.error('Error fetching products', e);
      }
    };
    fetchProds();
  }, []);

  // Sync reviews with localStorage
  const saveReviews = (updated) => {
    setReviewsDB(updated);
    try {
      localStorage.setItem('vyvy_product_reviews', JSON.stringify(updated));
      window.dispatchEvent(new Event('vyvy_reviews_updated'));
    } catch (e) {
      console.error('Error saving reviews', e);
    }
  };

  // Flatten all reviews with product metadata for table display
  const allReviewsList = [];
  Object.keys(reviewsDB).forEach((prodId) => {
    const pInfo = products.find((p) => String(p.id) === String(prodId));
    const prodReviews = reviewsDB[prodId] || [];
    prodReviews.forEach((rev) => {
      allReviewsList.push({
        ...rev,
        productId: prodId,
        productName: pInfo?.name || `Bó hoa #${prodId}`,
        productImage: pInfo?.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=100&q=80',
        productPrice: pInfo?.price,
      });
    });
  });

  // Calculate statistics
  const totalReviews = allReviewsList.length;
  const avgRating = totalReviews
    ? (allReviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';
  const fiveStarCount = allReviewsList.filter((r) => r.rating === 5).length;
  const pendingReplyCount = allReviewsList.filter((r) => !r.replies || r.replies.length === 0).length;

  // Filtered reviews
  const filteredReviews = allReviewsList.filter((rev) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      rev.userName?.toLowerCase().includes(term) ||
      rev.comment?.toLowerCase().includes(term) ||
      rev.productName?.toLowerCase().includes(term);

    // Star
    let matchStar = true;
    if (starFilter === '5') matchStar = rev.rating === 5;
    else if (starFilter === '4') matchStar = rev.rating === 4;
    else if (starFilter === '3') matchStar = rev.rating === 3;
    else if (starFilter === '1-2') matchStar = rev.rating <= 2;

    // Reply status
    let matchReply = true;
    const hasReplies = rev.replies && rev.replies.length > 0;
    if (replyFilter === 'replied') matchReply = hasReplies;
    else if (replyFilter === 'pending') matchReply = !hasReplies;

    // Product
    let matchProduct = true;
    if (productFilter !== 'all') matchProduct = String(rev.productId) === String(productFilter);

    return matchSearch && matchStar && matchReply && matchProduct;
  });

  // Start Edit Review
  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setEditRating(rev.rating);
    setEditComment(rev.comment);
    setEditTags(rev.tags || []);
  };

  // Save Edit Review
  const handleSaveEdit = () => {
    if (!editingReview || !editComment.trim()) {
      if (addToast) addToast('Nội dung đánh giá không được để trống!', 'error');
      return;
    }

    const { productId, id } = editingReview;
    const updatedProdReviews = (reviewsDB[productId] || []).map((r) => {
      if (r.id === id) {
        return {
          ...r,
          rating: editRating,
          comment: editComment.trim(),
          tags: editTags,
          editedByAdmin: true,
          editedAt: 'Đã cập nhật bởi Quản trị viên',
        };
      }
      return r;
    });

    const updatedDB = {
      ...reviewsDB,
      [productId]: updatedProdReviews,
    };

    saveReviews(updatedDB);
    setEditingReview(null);
    if (addToast) addToast('Admin đã cập nhật nội dung đánh giá thành công! ✏️');
  };

  // Submit Shop Reply
  const handleSubmitReply = () => {
    if (!replyingReview || !replyText.trim()) {
      if (addToast) addToast('Vui lòng nhập nội dung câu trả lời!', 'error');
      return;
    }

    const { productId, id } = replyingReview;
    const newReply = {
      id: `rep-${Date.now()}`,
      authorName: 'Vy Vy Flower',
      authorRole: 'Chủ tiệm / Quản trị viên',
      isShop: true,
      isAdmin: true,
      date: 'Vừa xong',
      comment: replyText.trim(),
    };

    const updatedProdReviews = (reviewsDB[productId] || []).map((r) => {
      if (r.id === id) {
        return {
          ...r,
          replies: [...(r.replies || []), newReply],
        };
      }
      return r;
    });

    const updatedDB = {
      ...reviewsDB,
      [productId]: updatedProdReviews,
    };

    saveReviews(updatedDB);
    setReplyingReview(null);
    setReplyText('');
    if (addToast) addToast('Đã gửi phản hồi với tư cách Shop Vy Vy Flower! 🌸');
  };

  // Execute Delete
  const handleExecuteDelete = () => {
    if (!confirmDelete) return;
    const { type, productId, reviewId, replyId } = confirmDelete;

    if (type === 'review') {
      const updatedProdReviews = (reviewsDB[productId] || []).filter((r) => r.id !== reviewId);
      const updatedDB = {
        ...reviewsDB,
        [productId]: updatedProdReviews,
      };
      saveReviews(updatedDB);
      if (addToast) addToast('Admin đã xóa đánh giá vĩnh viễn! 🗑️');
    } else if (type === 'reply') {
      const updatedProdReviews = (reviewsDB[productId] || []).map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            replies: (r.replies || []).filter((rep) => rep.id !== replyId),
          };
        }
        return r;
      });
      const updatedDB = {
        ...reviewsDB,
        [productId]: updatedProdReviews,
      };
      saveReviews(updatedDB);
      if (addToast) addToast('Admin đã xóa câu trả lời thành công! 🗑️');
    }

    setConfirmDelete(null);
  };

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={26} color="#facc15" />
            <span>Quản Lý Đánh Giá & Bình Luận</span>
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px', marginTop: '4px' }}>
            Quản trị toàn quyền: Sửa, Xóa và Trả lời các đánh giá của khách hàng trên toàn hệ thống Vy Vy Flower
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '12px', fontWeight: 600 }}>TỔNG BÌNH LUẬN</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>{totalReviews}</div>
          <div style={{ color: '#38bdf8', fontSize: '12px', marginTop: '4px' }}>Tất cả các sản phẩm</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '12px', fontWeight: 600 }}>ĐÁNH GIÁ TRUNG BÌNH</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#facc15', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⭐ {avgRating} <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>/ 5.0</span>
          </div>
          <div style={{ color: '#a3e635', fontSize: '12px', marginTop: '4px' }}>Chất lượng hài lòng rất cao</div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '12px', fontWeight: 600 }}>ĐÁNH GIÁ 5 SAO TUYỆT ĐỐI</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#a3e635', marginTop: '6px' }}>{fiveStarCount}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginTop: '4px' }}>
            Chiếm {totalReviews ? Math.round((fiveStarCount / totalReviews) * 100) : 100}% tổng đánh giá
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '12px', fontWeight: 600 }}>CẦN PHẢN HỒI</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: pendingReplyCount > 0 ? '#f59e0b' : '#34d399', marginTop: '6px' }}>
            {pendingReplyCount}
          </div>
          <div style={{ color: pendingReplyCount > 0 ? '#fbbf24' : '#34d399', fontSize: '12px', marginTop: '4px' }}>
            {pendingReplyCount > 0 ? 'Khách đang chờ Shop hồi đáp' : 'Đã phản hồi chu đáo 100%'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '18px', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            className="modal-form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Tìm theo tên khách hàng, nội dung hoặc tên hoa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Star */}
        <select
          className="modal-form-input"
          style={{ width: 'auto', minWidth: '130px' }}
          value={starFilter}
          onChange={(e) => setStarFilter(e.target.value)}
        >
          <option value="all">⭐ Tất cả số sao</option>
          <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
          <option value="4">⭐⭐⭐⭐ (4 sao)</option>
          <option value="3">⭐⭐⭐ (3 sao)</option>
          <option value="1-2">⭐⭐ (1 - 2 sao)</option>
        </select>

        {/* Filter Reply Status */}
        <select
          className="modal-form-input"
          style={{ width: 'auto', minWidth: '150px' }}
          value={replyFilter}
          onChange={(e) => setReplyFilter(e.target.value)}
        >
          <option value="all">💬 Tất cả trạng thái</option>
          <option value="pending">⏳ Chưa có phản hồi ({pendingReplyCount})</option>
          <option value="replied">✅ Đã có phản hồi</option>
        </select>

        {/* Filter Product */}
        <select
          className="modal-form-input"
          style={{ width: 'auto', minWidth: '170px' }}
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
        >
          <option value="all">🌸 Tất cả sản phẩm</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredReviews.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderRadius: '22px' }}>
            <MessageSquare size={40} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 12px' }} />
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '16px' }}>Không tìm thấy đánh giá nào</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '6px' }}>
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </div>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={`${rev.productId}-${rev.id}`}
              className="glass-card review-admin-card-row"
              style={{ padding: '20px 24px', borderRadius: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                {/* Product Meta Link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={rev.productImage}
                    alt={rev.productName}
                    style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#facc15' }}>
                      {rev.productName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                      Mã hoa: #{rev.productId} • {rev.productPrice ? `${rev.productPrice.toLocaleString('vi-VN')}₫` : 'Hoa tươi'}
                    </div>
                  </div>
                </div>

                {/* Admin Actions for Review */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-admin-action btn-admin-reply"
                    onClick={() => {
                      setReplyingReview(rev);
                      setReplyText('');
                    }}
                    title="Trả lời với tư cách Shop Vy Vy Flower"
                  >
                    <CornerDownRight size={13} />
                    <span>Trả Lời</span>
                  </button>

                  <button
                    type="button"
                    className="btn-admin-action btn-admin-edit"
                    onClick={() => handleOpenEdit(rev)}
                    title="Sửa nội dung đánh giá của khách"
                  >
                    <Edit3 size={13} />
                    <span>Sửa</span>
                  </button>

                  <button
                    type="button"
                    className="btn-admin-action btn-admin-delete"
                    onClick={() => setConfirmDelete({ type: 'review', productId: rev.productId, reviewId: rev.id, authorName: rev.userName })}
                    title="Xóa vĩnh viễn đánh giá này"
                  >
                    <Trash2 size={13} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>

              {/* Customer Review Info */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="review-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                      {rev.userAvatar || rev.userName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '13px', color: '#ffffff' }}>{rev.userName}</strong>
                        {rev.isBuyer && (
                          <span className="review-buyer-badge">
                            <ShieldCheck size={10} /> Đã mua hàng
                          </span>
                        )}
                        {rev.editedByAdmin && (
                          <span className="review-edited-admin-badge">
                            ✏️ Đã duyệt / sửa bởi Admin
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={11} fill="#facc15" color="#facc15" />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{rev.date}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    👍 {rev.likes || 0} lượt thích
                  </span>
                </div>

                {/* Review Body */}
                <p style={{ margin: '8px 0', fontSize: '13.5px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
                  {rev.comment}
                </p>

                {/* Tags */}
                {rev.tags && rev.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {rev.tags.map((t, idx) => (
                      <span key={idx} className="review-pill-tag">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Replies Thread */}
              {rev.replies && rev.replies.length > 0 && (
                <div style={{ marginTop: '12px', paddingLeft: '20px', borderLeft: '2px solid rgba(250, 204, 21, 0.4)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rev.replies.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: rep.isShop ? 'rgba(250, 204, 21, 0.06)' : 'rgba(255, 255, 255, 0.04)',
                        border: rep.isShop ? '1px solid rgba(250, 204, 21, 0.2)' : '1px solid rgba(255, 255, 255, 0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#ffffff' }}>{rep.authorName}</span>
                          {rep.isShop ? (
                            <span className="reply-shop-badge">🌸 {rep.authorRole || 'Vy Vy Flower'}</span>
                          ) : (
                            <span className="reply-customer-badge"><User size={10} /> Khách</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{rep.date}</span>
                          <button
                            type="button"
                            className="btn-admin-mini-action btn-danger"
                            onClick={() => setConfirmDelete({ type: 'reply', productId: rev.productId, reviewId: rev.id, replyId: rep.id, authorName: rep.authorName })}
                            title="Xóa phản hồi này"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>
                        {rep.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL SỬA ĐÁNH GIÁ (ADMIN EDIT) ================= */}
      {editingReview && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setEditingReview(null)}>
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '520px', padding: '28px', borderRadius: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  Sửa Đánh Giá Khách Hàng
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ position: 'static' }}
                onClick={() => setEditingReview(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
              Bình luận của: <strong style={{ color: '#ffffff' }}>{editingReview.userName}</strong> trên sản phẩm <em>{editingReview.productName}</em>
            </div>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Chất lượng sao:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEditRating(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star
                      size={22}
                      fill={editRating >= s ? '#facc15' : 'none'}
                      color={editRating >= s ? '#facc15' : '#78716c'}
                    />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#facc15', fontWeight: 700 }}>({editRating} sao)</span>
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                Nội dung bình luận:
              </label>
              <textarea
                className="modal-form-textarea"
                rows={4}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Nhập nội dung đánh giá..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setEditingReview(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-save-admin-edit"
                onClick={handleSaveEdit}
              >
                <span>Lưu Thay Đổi</span>
                <CheckCircle2 size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TRẢ LỜI ĐÁNH GIÁ (ADMIN REPLY) ================= */}
      {replyingReview && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setReplyingReview(null)}>
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '540px', padding: '28px', borderRadius: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CornerDownRight size={18} color="#facc15" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  Trả Lời Bình Luận Của {replyingReview.userName}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ position: 'static' }}
                onClick={() => setReplyingReview(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px' }}>Bình luận của khách:</div>
              <div style={{ color: '#ffffff', fontStyle: 'italic' }}>"{replyingReview.comment}"</div>
            </div>

            {/* Quick Templates */}
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                Chọn câu trả lời mẫu nhanh:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {adminQuickReplies.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    className="quick-template-pill"
                    onClick={() => setReplyText(tpl)}
                  >
                    {tpl.slice(0, 38)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Textarea */}
            <div style={{ marginBottom: '16px' }}>
              <textarea
                className="modal-form-textarea"
                rows={3}
                placeholder="Nhập nội dung phản hồi từ Shop Vy Vy Flower..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setReplyingReview(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-submit-reply"
                onClick={handleSubmitReply}
              >
                <span>Gửi Phản Hồi</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA (ADMIN DELETE) ================= */}
      {confirmDelete && (
        <div className="admin-confirm-modal-overlay" style={{ zIndex: 1300 }} onClick={() => setConfirmDelete(null)}>
          <div className="admin-confirm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-icon-wrap">
              <AlertTriangle size={28} color="#f43f5e" />
            </div>
            <h3 className="admin-confirm-title">
              Xác Nhận Xóa {confirmDelete.type === 'review' ? 'Bình Luận' : 'Câu Trả Lời'}
            </h3>
            <p className="admin-confirm-desc">
              Bạn có chắc chắn muốn xóa vĩnh viễn {confirmDelete.type === 'review' ? 'bình luận đánh giá' : 'câu trả lời'} của <strong>{confirmDelete.authorName}</strong> không? Hành động này không thể hoàn tác.
            </p>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setConfirmDelete(null)}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleExecuteDelete}
              >
                <Trash2 size={14} />
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
