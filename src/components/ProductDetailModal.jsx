import React, { useState, useEffect } from 'react';
import {
  X, Star, ShoppingCart, Check, Heart, Minus, Plus, MessageSquare,
  CornerDownRight, ThumbsUp, Send, ShieldCheck, Sparkles, User,
  Edit3, Trash2, ShieldAlert, LogIn, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

/* ============================================================
   DEFAULT REVIEWS SEED DATA (Pre-loaded with authentic feedback)
   ============================================================ */
const INITIAL_REVIEWS_DB = {
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
          date: '2 ngày trước',
          comment: 'Cảm ơn Thảo Vy nhiều nhen, bó này bên mình chọn từng búp Juliet nở chuẩn phom nhất trong ngày đó ạ!'
        }
      ]
    }
  ],
  'sig-3': [
    {
      id: 'rev-301',
      userName: 'Hoàng Minh',
      userAvatar: 'HM',
      rating: 5,
      date: '4 ngày trước',
      isBuyer: true,
      comment: 'Bó ly kép hồng công chúa bự và sang trọng ngoài sức tưởng tượng. Mẹ mình nhận ngày sinh nhật thích mê!',
      tags: ['Sang trọng', 'Hoa to đẹp'],
      likes: 14,
      replies: [
        {
          id: 'rep-301-1',
          authorName: 'Vy Vy Flower',
          authorRole: 'Chủ tiệm',
          isShop: true,
          date: '4 ngày trước',
          comment: 'Dạ Vy Vy xin chúc mừng sinh nhật bác gái ạ! Cảm ơn anh Minh đã trao gửi yêu thương qua đóa hoa của tiệm ❤️'
        }
      ]
    }
  ]
};

// Generic seed reviews for any standard bouquet
const GENERIC_SEEDS = [
  {
    id: 'rev-gen-1',
    userName: 'Thanh Hằng',
    userAvatar: 'TH',
    rating: 5,
    date: '2 ngày trước',
    isBuyer: true,
    comment: 'Bó hoa bên ngoài đẹp hơn trong ảnh nữa, các cánh hoa căng mọng không hề bị dập nát. Tặng kèm thiệp viết chữ rất nắn nót!',
    tags: ['Hoa tươi lâu', 'Thiệp viết tay'],
    likes: 8,
    replies: [
      {
        id: 'rep-gen-1-1',
        authorName: 'Vy Vy Flower',
        authorRole: 'Tư vấn viên',
        isShop: true,
        date: '1 ngày trước',
        comment: 'Cảm ơn bạn Thanh Hằng đã dành lời khen quý báu cho đội ngũ cắm hoa của Vy Vy Flower ạ 🌷'
      }
    ]
  },
  {
    id: 'rev-gen-2',
    userName: 'Quốc Bảo',
    userAvatar: 'QB',
    rating: 5,
    date: '5 ngày trước',
    isBuyer: true,
    comment: 'Đặt hoa gấp kỷ niệm ngày cưới mà shop hỗ trợ nhanh như chớp. Vợ mình vui cả ngày. Sẽ ủng hộ dài lâu!',
    tags: ['Giao hỏa tốc', 'Phục vụ tận tâm'],
    likes: 5,
    replies: []
  }
];

export default function ProductDetailModal({
  product,
  onClose,
  quantity = 1,
  onQuantityChange,
  onAddToCart,
  onQuickOrder,
  addToast,
}) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'reviews'
  const { customer, isLoggedIn, requireAuth } = useCustomer();
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('vyvy_admin_logged_in') === 'true');

  const [reviewsDB, setReviewsDB] = useState(() => {
    try {
      const stored = localStorage.getItem('vyvy_product_reviews');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading reviews from storage', e);
    }
    return INITIAL_REVIEWS_DB;
  });

  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newUserName, setNewUserName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Inline Reply Form States
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [replyComment, setReplyComment] = useState('');
  const [isReplyAsShop, setIsReplyAsShop] = useState(false);

  // Admin Edit Review States
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editTags, setEditTags] = useState([]);

  // Admin Edit Reply States
  const [editingReply, setEditingReply] = useState(null); // { reviewId, replyId, comment }

  // Confirm Delete Dialog State
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'review'|'reply', reviewId, replyId, authorName }

  // Quick Reply Templates for Admin / Shop
  const adminQuickReplies = [
    '🌸 Vy Vy Flower chân thành cảm ơn quý khách đã tin yêu và ủng hộ tiệm hoa ạ!',
    '🌷 Tiệm luôn cam kết chọn hoa tươi loại 1 trong ngày và trao gửi trọn vẹn yêu thương.',
    '✨ Chúc bạn và người nhận luôn xinh đẹp, rạng rỡ và ngập tràn niềm vui!',
    '📞 Cảm ơn góp ý quý báu của bạn, quản lý tiệm sẽ liên hệ trực tiếp để phục vụ bạn chu đáo hơn ạ!'
  ];

  // Sync admin status and updates
  useEffect(() => {
    const checkAdmin = () => {
      const adminActive = localStorage.getItem('vyvy_admin_logged_in') === 'true';
      setIsAdmin(adminActive);
      if (adminActive) {
        setIsReplyAsShop(true);
        setReplyAuthorName('Vy Vy Flower');
      }
    };
    checkAdmin();

    const handleSync = () => {
      try {
        const stored = localStorage.getItem('vyvy_product_reviews');
        if (stored) setReviewsDB(JSON.parse(stored));
      } catch (e) {}
    };

    window.addEventListener('vyvy_reviews_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('vyvy_reviews_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Sync customer name when customer logs in
  useEffect(() => {
    if (customer?.name) {
      setNewUserName(customer.name);
    }
  }, [customer]);

  // Save reviews and broadcast to other components
  const saveReviews = (updated) => {
    setReviewsDB(updated);
    try {
      localStorage.setItem('vyvy_product_reviews', JSON.stringify(updated));
      window.dispatchEvent(new Event('vyvy_reviews_updated'));
    } catch (e) {
      console.error('Error saving reviews', e);
    }
  };

  if (!product) return null;

  // Get current product reviews
  const currentReviews = reviewsDB[product.id] || GENERIC_SEEDS;
  const totalReviewsCount = currentReviews.length;
  const averageRating = (
    currentReviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviewsCount || 1)
  ).toFixed(1);

  // Quick Tags options
  const quickTagsList = ['Hoa tươi lâu', 'Giao đúng giờ', 'Nơ lụa đẹp', 'Thợ cắm khéo', 'Giống ảnh mẫu 100%'];

  // Handle open review form (Strict login check for customers)
  const handleOpenReviewForm = () => {
    if (!isLoggedIn && !isAdmin) {
      if (addToast) addToast('Quý khách vui lòng đăng nhập hoặc đăng ký tài khoản để viết đánh giá nhé! 🌸', 'info');
      requireAuth((activeCust) => {
        setShowReviewForm(true);
        if (activeCust?.name) setNewUserName(activeCust.name);
      });
      return;
    }
    if (!newUserName && customer?.name) {
      setNewUserName(customer.name);
    }
    setShowReviewForm((prev) => !prev);
  };

  // Handle submit review
  const handleSubmitReview = (e) => {
    e.preventDefault();

    // Enforce login requirement
    if (!isLoggedIn && !isAdmin) {
      if (addToast) addToast('Bạn cần đăng nhập hoặc đăng ký tài khoản trước khi gửi đánh giá!', 'error');
      requireAuth((activeCust) => {
        if (activeCust?.name) setNewUserName(activeCust.name);
      });
      return;
    }

    const authorName = (isLoggedIn ? customer?.name : null) || newUserName.trim() || (isAdmin ? 'Vy Vy Flower (Admin)' : '');
    if (!authorName || !newComment.trim()) {
      if (addToast) addToast('Vui lòng nhập nội dung đánh giá của bạn nhé!');
      return;
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      userId: customer?.id || (customer?.phone ? `cust-${customer.phone}` : (isAdmin ? 'admin' : null)),
      userPhone: customer?.phone || '',
      userName: authorName,
      userAvatar: authorName.slice(0, 2).toUpperCase(),
      rating: newRating,
      date: 'Vừa xong',
      isBuyer: true,
      comment: newComment.trim(),
      tags: selectedTag ? [selectedTag] : ['Khách hàng hài lòng'],
      likes: 1,
      replies: [],
    };

    const updatedProductReviews = [newRev, ...currentReviews];
    const updatedDB = {
      ...reviewsDB,
      [product.id]: updatedProductReviews,
    };

    saveReviews(updatedDB);
    setNewComment('');
    setSelectedTag('');
    setShowReviewForm(false);
    if (addToast) addToast('Cảm ơn bạn đã gửi đánh giá! Bình luận đã được đăng thành công ✨');
  };

  // Handle trigger reply (Check auth for customers)
  const handleTriggerReply = (rev) => {
    if (replyingReviewId === rev.id) {
      setReplyingReviewId(null);
      return;
    }

    if (!isLoggedIn && !isAdmin) {
      if (addToast) addToast('Vui lòng đăng nhập hoặc đăng ký để gửi câu trả lời!', 'info');
      requireAuth((activeCust) => {
        setReplyingReviewId(rev.id);
        setReplyAuthorName(activeCust?.name || '');
        setIsReplyAsShop(false);
      });
      return;
    }

    setReplyingReviewId(rev.id);
    setReplyComment('');
    if (isAdmin) {
      setIsReplyAsShop(true);
      setReplyAuthorName('Vy Vy Flower');
    } else {
      setIsReplyAsShop(false);
      setReplyAuthorName(customer?.name || '');
    }
  };

  // Handle submit reply to review
  const handleSubmitReply = (reviewId) => {
    if (!replyComment.trim()) {
      if (addToast) addToast('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    const defaultShopName = 'Vy Vy Flower';
    const name = isReplyAsShop ? defaultShopName : (replyAuthorName.trim() || customer?.name || 'Khách hàng');
    const newReply = {
      id: `rep-${Date.now()}`,
      authorName: name,
      authorRole: isReplyAsShop ? 'Chủ tiệm / Quản trị viên' : 'Khách hàng',
      isShop: isReplyAsShop,
      isAdmin: isAdmin && isReplyAsShop,
      date: 'Vừa xong',
      comment: replyComment.trim(),
    };

    const updatedProductReviews = currentReviews.map((rev) => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          replies: [...(rev.replies || []), newReply],
        };
      }
      return rev;
    });

    const updatedDB = {
      ...reviewsDB,
      [product.id]: updatedProductReviews,
    };

    saveReviews(updatedDB);
    setReplyingReviewId(null);
    setReplyComment('');
    if (addToast) addToast('Đã gửi phản hồi thành công! 💬');
  };

  // Admin: Start editing review
  const handleStartEditReview = (rev) => {
    setEditingReviewId(rev.id);
    setEditRating(rev.rating);
    setEditComment(rev.comment);
    setEditTags(rev.tags || []);
  };

  // Admin: Save edited review
  const handleSaveEditReview = (reviewId) => {
    if (!editComment.trim()) {
      if (addToast) addToast('Nội dung bình luận không được để trống!');
      return;
    }

    const updatedProductReviews = currentReviews.map((rev) => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          rating: editRating,
          comment: editComment.trim(),
          tags: editTags,
          editedByAdmin: true,
          editedAt: 'Đã chỉnh sửa bởi Quản trị viên',
        };
      }
      return rev;
    });

    const updatedDB = {
      ...reviewsDB,
      [product.id]: updatedProductReviews,
    };

    saveReviews(updatedDB);
    setEditingReviewId(null);
    if (addToast) addToast('Quản trị viên đã cập nhật bình luận thành công! ✏️');
  };

  // Admin: Confirm delete execution (Review or Reply)
  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const { type, reviewId, replyId } = confirmDelete;

    if (type === 'review') {
      const updatedProductReviews = currentReviews.filter((rev) => rev.id !== reviewId);
      const updatedDB = {
        ...reviewsDB,
        [product.id]: updatedProductReviews,
      };
      saveReviews(updatedDB);
      if (addToast) addToast('Đã xóa bình luận thành công! 🗑️');
    } else if (type === 'reply') {
      const updatedProductReviews = currentReviews.map((rev) => {
        if (rev.id === reviewId) {
          return {
            ...rev,
            replies: (rev.replies || []).filter((rep) => rep.id !== replyId),
          };
        }
        return rev;
      });
      const updatedDB = {
        ...reviewsDB,
        [product.id]: updatedProductReviews,
      };
      saveReviews(updatedDB);
      if (addToast) addToast('Đã xóa câu trả lời thành công! 🗑️');
    }
    setConfirmDelete(null);
  };

  // Admin: Save edited reply
  const handleSaveEditReply = () => {
    if (!editingReply || !editingReply.comment.trim()) return;
    const { reviewId, replyId, comment } = editingReply;

    const updatedProductReviews = currentReviews.map((rev) => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          replies: (rev.replies || []).map((rep) => {
            if (rep.id === replyId) {
              return {
                ...rep,
                comment: comment.trim(),
                editedAt: 'Đã chỉnh sửa',
              };
            }
            return rep;
          }),
        };
      }
      return rev;
    });

    const updatedDB = {
      ...reviewsDB,
      [product.id]: updatedProductReviews,
    };

    saveReviews(updatedDB);
    setEditingReply(null);
    if (addToast) addToast('Đã cập nhật câu trả lời! ✏️');
  };

  // Handle like a review
  const handleLikeReview = (reviewId) => {
    const updatedProductReviews = currentReviews.map((rev) => {
      if (rev.id === reviewId) {
        return { ...rev, likes: (rev.likes || 0) + 1 };
      }
      return rev;
    });

    const updatedDB = {
      ...reviewsDB,
      [product.id]: updatedProductReviews,
    };

    saveReviews(updatedDB);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="product-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          title="Đóng cửa sổ"
        >
          <X size={18} />
        </button>

        {/* Left Column: Full Product Image Showcase */}
        <div className="product-modal-img-col">
          <div
            className="modal-img-ambient"
            style={{
              backgroundImage: `url(${product.image})`,
            }}
          />

          <img
            src={product.image}
            alt={product.name}
            className="modal-product-img"
          />

          {/* Badge Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 10,
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(250, 204, 21, 0.6)',
              color: '#facc15',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
            }}
          >
            {product.badge || 'BESPOKE'}
          </div>

          {/* High-Contrast Stock Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 10,
              background: product.stock > 0 ? '#0f172a' : '#450a0a',
              border: `2px solid ${product.stock > 0 ? '#22c55e' : '#f43f5e'}`,
              color: '#ffffff',
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(34, 197, 94, 0.25)',
              letterSpacing: '0.3px',
            }}
          >
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: product.stock > 0 ? '#22c55e' : '#f43f5e',
                boxShadow: `0 0 10px ${product.stock > 0 ? '#22c55e' : '#f43f5e'}`,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {product.stock > 0 ? `Còn ${product.stock} bó hoa tươi sẵn sàng` : 'Tạm hết hoa trong ngày'}
            </span>
          </div>
        </div>

        {/* Right Column: Tabbed Content (Info & Reviews with Replies) */}
        <div className="product-modal-content-col">
          {/* Top Category & Review Count Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="modal-cat-tag">
                {product.category?.toUpperCase() || 'BÓ HOA TƯƠI'}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                style={{
                  background: 'rgba(250, 204, 21, 0.12)',
                  border: '1px solid rgba(250, 204, 21, 0.35)',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                }}
                className="modal-rating-tag"
                title="Xem đánh giá của khách hàng"
              >
                ⭐ {averageRating} ({totalReviewsCount} đánh giá)
              </button>
            </div>

            {/* Product Title */}
            <h2 className="modal-product-title">
              {product.name}
            </h2>

            {/* Modal Tabs Navigation: Chi Tiết & Đánh Giá Bình Luận */}
            <div className="modal-tabs-nav">
              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <Sparkles size={14} />
                <span>Chi Tiết Bó Hoa</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <MessageSquare size={14} />
                <span>Đánh Giá & Bình Luận ({totalReviewsCount})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PRODUCT INFO */}
          {activeTab === 'info' && (
            <div className="modal-tab-pane">
              <p className="modal-product-desc">
                {product.description}
              </p>

              {/* Commitments & Value Props */}
              <div className="modal-features-grid">
                <div className="modal-feature-pill">
                  <span>🌸</span> <span>Hoa tươi loại 1 trong ngày</span>
                </div>
                <div className="modal-feature-pill">
                  <span>🎀</span> <span>Tặng nơ lụa & thiệp ghi lời</span>
                </div>
                <div className="modal-feature-pill">
                  <span>⚡</span> <span>Giao hỏa tốc 2 giờ</span>
                </div>
                <div className="modal-feature-pill">
                  <span>📸</span> <span>Chụp ảnh thật trước khi giao</span>
                </div>
              </div>

              {/* Trust Box */}
              <div className="modal-trust-box">
                <ShieldCheck size={18} color="#e11d48" />
                <div>
                  <strong>Bảo hành phom hoa 3 ngày</strong>: Cam kết hoa tươi mới cắt, đổi trả 100% nếu hoa héo dập trong quá trình vận chuyển.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEWS & COMMENTS (WITH REPLIES & ADMIN CONTROLS) */}
          {activeTab === 'reviews' && (
            <div className="modal-tab-pane modal-reviews-pane">
              {/* Admin Mode Ribbon */}
              {isAdmin && (
                <div className="admin-status-ribbon">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} color="#f59e0b" />
                    <span><strong>Chế độ Quản Trị Viên:</strong> Bạn có toàn quyền Sửa, Xóa và Trả lời phản hồi với tư cách Shop Vy Vy Flower.</span>
                  </div>
                  <span className="admin-badge-active">Admin Active</span>
                </div>
              )}

              {/* Rating Summary Bar */}
              <div className="reviews-summary-bar">
                <div className="reviews-score-block">
                  <div className="reviews-score-num">{averageRating}</div>
                  <div className="reviews-score-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="#facc15" color="#facc15" />
                    ))}
                  </div>
                  <div className="reviews-score-total">{totalReviewsCount} đánh giá từ người mua</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isLoggedIn && !isAdmin && (
                    <div className="review-active-user-chip" title={customer?.phone || customer?.email}>
                      <User size={12} />
                      <span>{customer?.name}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-open-review-form"
                    onClick={handleOpenReviewForm}
                  >
                    {!isLoggedIn && !isAdmin ? (
                      <>
                        <LogIn size={15} />
                        <span>Đăng Nhập Để Đánh Giá</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare size={15} />
                        <span>{showReviewForm ? 'Đóng Biểu Mẫu' : 'Viết Đánh Giá'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Callout if customer is not logged in */}
              {!isLoggedIn && !isAdmin && (
                <div className="review-auth-prompt-banner">
                  <div className="auth-prompt-content">
                    <Sparkles size={16} color="#facc15" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Bạn đã mua hoặc yêu thích bó hoa này?</strong> Đăng nhập hoặc đăng ký tài khoản Vy Vy Flower để gửi đánh giá và nhận điểm tích lũy thành viên 🌸
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-prompt-login"
                    onClick={() => requireAuth((cust) => { setShowReviewForm(true); if (cust?.name) setNewUserName(cust.name); })}
                  >
                    <LogIn size={13} />
                    <span>Đăng Nhập Ngay</span>
                  </button>
                </div>
              )}

              {/* Review Input Form (Requires Login) */}
              {showReviewForm && (isLoggedIn || isAdmin) && (
                <form className="modal-review-form" onSubmit={handleSubmitReview}>
                  {/* Logged in User Bar */}
                  <div className="review-logged-user-row">
                    <div className="review-logged-avatar">
                      {customer?.name ? customer.name.slice(0, 2).toUpperCase() : (isAdmin ? 'AD' : 'KH')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>
                        {customer?.name || (isAdmin ? 'Quản trị viên (Vy Vy Flower)' : 'Khách hàng')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={11} />
                        <span>{isAdmin ? '🛡️ Quản trị viên hệ thống' : 'Thành viên đã xác thực'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="review-form-title">Đánh giá trải nghiệm của bạn về bó hoa này</div>

                  {/* Interactive Star Picker */}
                  <div className="review-star-picker">
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Chất lượng:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                        >
                          <Star
                            size={20}
                            fill={(hoverRating || newRating) >= s ? '#facc15' : 'none'}
                            color={(hoverRating || newRating) >= s ? '#facc15' : '#a8a29e'}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="review-rating-label">
                      {newRating === 5 && 'Tuyệt vời, hoa rất đẹp!'}
                      {newRating === 4 && 'Rất tốt, hài lòng'}
                      {newRating === 3 && 'Bình thường'}
                      {newRating <= 2 && 'Cần cải thiện'}
                    </span>
                  </div>

                  {/* Quick Tag Selector */}
                  <div className="review-quick-tags">
                    {quickTagsList.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`review-tag-btn ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  {/* Comment Textarea */}
                  <textarea
                    className="modal-form-textarea"
                    rows={3}
                    placeholder="Chia sẻ cảm nhận về độ tươi, cách cắm hoa, thái độ phục vụ..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-cancel-review"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Hủy bỏ
                    </button>
                    <button type="submit" className="btn-submit-review">
                      <span>Đăng Đánh Giá</span>
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              )}

              {/* Review Cards List */}
              <div className="modal-reviews-list">
                {currentReviews.map((rev) => (
                  <div key={rev.id} className="review-card-item">
                    {/* Header: User Avatar, Name, Rating, Date */}
                    <div className="review-card-header">
                      <div className="review-user-info">
                        <div className="review-avatar-circle">
                          {rev.userAvatar || rev.userName?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="review-user-name-row">
                            <span className="review-user-name">{rev.userName}</span>
                            {rev.isBuyer && (
                              <span className="review-buyer-badge">
                                <Check size={10} /> Đã mua hàng
                              </span>
                            )}
                            {rev.editedByAdmin && (
                              <span className="review-edited-admin-badge" title="Đã được Admin chỉnh sửa">
                                ✏️ Đã duyệt / sửa
                              </span>
                            )}
                          </div>
                          <div className="review-meta-row">
                            <div className="review-stars-display">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} size={12} fill="#facc15" color="#facc15" />
                              ))}
                            </div>
                            <span className="review-date-text">{rev.date}</span>
                            {rev.editedAt && (
                              <span className="review-edited-at-text">({rev.editedAt})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions: Admin Controls & Like */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* ADMIN EDIT / DELETE CONTROLS */}
                        {isAdmin && (
                          <div className="admin-review-actions-group">
                            <button
                              type="button"
                              className="btn-admin-action btn-admin-edit"
                              onClick={() => handleStartEditReview(rev)}
                              title="Admin: Sửa đánh giá này"
                            >
                              <Edit3 size={13} />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              className="btn-admin-action btn-admin-delete"
                              onClick={() => setConfirmDelete({ type: 'review', reviewId: rev.id, authorName: rev.userName })}
                              title="Admin: Xóa vĩnh viễn đánh giá này"
                            >
                              <Trash2 size={13} />
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}

                        {/* Thumbs up like */}
                        <button
                          type="button"
                          className="review-like-btn"
                          onClick={() => handleLikeReview(rev.id)}
                          title="Hữu ích"
                        >
                          <ThumbsUp size={13} />
                          <span>{rev.likes || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* REVIEW BODY OR ADMIN EDIT INLINE FORM */}
                    {editingReviewId === rev.id ? (
                      <div className="admin-edit-review-inline-box">
                        <div className="admin-edit-header">
                          <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>
                            ✏️ Đang sửa đánh giá của <strong>{rev.userName}</strong>
                          </span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Chế độ Quản trị viên</span>
                        </div>

                        {/* Edit Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>Số sao:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setEditRating(s)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                              >
                                <Star
                                  size={18}
                                  fill={editRating >= s ? '#facc15' : 'none'}
                                  color={editRating >= s ? '#facc15' : '#78716c'}
                                />
                              </button>
                            ))}
                          </div>
                          <span style={{ fontSize: '12px', color: '#facc15', fontWeight: 700 }}>{editRating} sao</span>
                        </div>

                        {/* Edit Comment */}
                        <textarea
                          className="modal-form-textarea"
                          rows={3}
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Chỉnh sửa nội dung đánh giá..."
                        />

                        {/* Quick tags toggle during edit */}
                        <div className="review-quick-tags" style={{ marginTop: '6px' }}>
                          {quickTagsList.map((tag) => {
                            const isIncluded = editTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                className={`review-tag-btn ${isIncluded ? 'active' : ''}`}
                                onClick={() => {
                                  if (isIncluded) {
                                    setEditTags(editTags.filter((t) => t !== tag));
                                  } else {
                                    setEditTags([...editTags, tag]);
                                  }
                                }}
                              >
                                {isIncluded ? '✓ ' : '+ '} {tag}
                              </button>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                          <button
                            type="button"
                            className="btn-cancel-modal"
                            onClick={() => setEditingReviewId(null)}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            className="btn-save-admin-edit"
                            onClick={() => handleSaveEditReview(rev.id)}
                          >
                            <span>Lưu Thay Đổi</span>
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Review Text */}
                        <p className="review-body-text">{rev.comment}</p>

                        {/* Review Tags */}
                        {rev.tags && rev.tags.length > 0 && (
                          <div className="review-applied-tags">
                            {rev.tags.map((t, idx) => (
                              <span key={idx} className="review-pill-tag">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Actions: Trả lời button */}
                    <div className="review-actions-bar">
                      <button
                        type="button"
                        className={`btn-trigger-reply ${isAdmin ? 'admin-reply-btn' : ''}`}
                        onClick={() => handleTriggerReply(rev)}
                      >
                        <CornerDownRight size={13} />
                        <span>
                          {replyingReviewId === rev.id
                            ? 'Đóng Trả Lời'
                            : isAdmin
                              ? '🌸 Trả Lời (Vy Vy Flower)'
                              : 'Trả Lời'}
                        </span>
                      </button>
                    </div>

                    {/* REPLIES THREAD */}
                    {rev.replies && rev.replies.length > 0 && (
                      <div className="review-replies-thread">
                        {rev.replies.map((rep) => (
                          <div
                            key={rep.id}
                            className={`reply-bubble-item ${rep.isShop ? 'is-shop-reply' : ''}`}
                          >
                            <div className="reply-header-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="reply-author-name">{rep.authorName}</span>
                                {rep.isShop ? (
                                  <span className="reply-shop-badge">
                                    🌸 {rep.authorRole || 'Vy Vy Flower'}
                                  </span>
                                ) : (
                                  <span className="reply-customer-badge">
                                    <User size={10} /> Khách
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="reply-date-text">{rep.date}</span>

                                {/* Admin controls for replies */}
                                {isAdmin && (
                                  <div className="admin-reply-tools">
                                    <button
                                      type="button"
                                      className="btn-admin-mini-action"
                                      onClick={() => setEditingReply({ reviewId: rev.id, replyId: rep.id, comment: rep.comment })}
                                      title="Admin: Sửa câu trả lời này"
                                    >
                                      <Edit3 size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-admin-mini-action btn-danger"
                                      onClick={() => setConfirmDelete({ type: 'reply', reviewId: rev.id, replyId: rep.id, authorName: rep.authorName })}
                                      title="Admin: Xóa câu trả lời này"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Reply Comment or Edit Mode */}
                            {editingReply?.replyId === rep.id ? (
                              <div style={{ marginTop: '6px' }}>
                                <textarea
                                  className="modal-form-textarea"
                                  rows={2}
                                  value={editingReply.comment}
                                  onChange={(e) => setEditingReply({ ...editingReply, comment: e.target.value })}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                                  <button
                                    type="button"
                                    className="btn-cancel-modal"
                                    style={{ padding: '3px 8px', fontSize: '11px' }}
                                    onClick={() => setEditingReply(null)}
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-save-admin-edit"
                                    style={{ padding: '3px 10px', fontSize: '11px' }}
                                    onClick={handleSaveEditReply}
                                  >
                                    Lưu
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="reply-body-text">{rep.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* INLINE REPLY FORM */}
                    {replyingReviewId === rev.id && (
                      <div className="review-inline-reply-box">
                        <div className="inline-reply-header">
                          <span>Phản hồi bình luận của <strong>{rev.userName}</strong>:</span>
                          {isAdmin ? (
                            <label className="reply-shop-toggle">
                              <input
                                type="checkbox"
                                checked={isReplyAsShop}
                                onChange={(e) => {
                                  setIsReplyAsShop(e.target.checked);
                                  if (e.target.checked) setReplyAuthorName('Vy Vy Flower');
                                }}
                              />
                              <span>Phản hồi với tư cách Shop (Vy Vy Flower)</span>
                            </label>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#34d399' }}>
                              ✍️ Phản hồi với tài khoản: <strong>{customer?.name}</strong>
                            </span>
                          )}
                        </div>

                        {/* Admin Quick Templates */}
                        {isAdmin && isReplyAsShop && (
                          <div className="admin-quick-templates">
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                              Mẫu trả lời nhanh của Shop:
                            </span>
                            <div className="quick-templates-grid">
                              {adminQuickReplies.map((tpl, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  className="quick-template-pill"
                                  onClick={() => setReplyComment(tpl)}
                                >
                                  {tpl.slice(0, 36)}...
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {!isReplyAsShop && !customer && (
                          <input
                            type="text"
                            className="modal-form-input"
                            style={{ marginBottom: '8px' }}
                            placeholder="Tên của bạn..."
                            value={replyAuthorName}
                            onChange={(e) => setReplyAuthorName(e.target.value)}
                          />
                        )}

                        <textarea
                          className="modal-form-textarea"
                          rows={2}
                          placeholder={isReplyAsShop ? 'Nhập lời cảm ơn hoặc giải đáp thắc mắc của khách...' : 'Viết câu trả lời của bạn...'}
                          value={replyComment}
                          onChange={(e) => setReplyComment(e.target.value)}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            className="btn-cancel-reply"
                            onClick={() => setReplyingReviewId(null)}
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            className="btn-submit-reply"
                            onClick={() => handleSubmitReply(rev.id)}
                          >
                            <span>Gửi Phản Hồi</span>
                            <Send size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer: Price, Quantity Stepper & Action Buttons */}
          <div className="modal-bottom-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div className="modal-product-price">
                  {product.price?.toLocaleString('vi-VN')}₫
                </div>
                <div className="modal-price-note">
                  Đơn giá niêm yết (Đã bao gồm VAT & nơ lụa)
                </div>
              </div>

              {/* Quantity Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="modal-qty-label">Số lượng:</span>
                <div className="modal-qty-stepper">
                  <button
                    type="button"
                    className="modal-qty-btn"
                    onClick={() => onQuantityChange && onQuantityChange((prev) => Math.max(1, prev - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="modal-qty-num">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="modal-qty-btn"
                    onClick={() => onQuantityChange && onQuantityChange((prev) => prev + 1)}
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
                className="modal-add-cart-btn"
                onClick={() => {
                  if (onAddToCart) onAddToCart(product, quantity);
                  onClose();
                }}
              >
                <ShoppingCart size={16} />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>

              <button
                type="button"
                className="modal-order-now-btn"
                onClick={() => {
                  if (onQuickOrder) onQuickOrder(product, quantity);
                  onClose();
                }}
              >
                <span>Đặt Hoa Ngay</span>
                <div className="cta-icon-badge"><Check size={18} /></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Confirm Delete Modal */}
      {confirmDelete && (
        <div className="admin-confirm-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-confirm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-confirm-icon-wrap">
              <AlertTriangle size={28} color="#f43f5e" />
            </div>
            <h3 className="admin-confirm-title">
              Xác Nhận Xóa {confirmDelete.type === 'review' ? 'Bình Luận' : 'Câu Trả Lời'}
            </h3>
            <p className="admin-confirm-desc">
              Bạn có chắc chắn muốn xóa vĩnh viễn {confirmDelete.type === 'review' ? 'bình luận đánh giá' : 'câu trả lời'} của <strong>{confirmDelete.authorName}</strong> không?
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
                onClick={handleConfirmDelete}
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
