import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children, addToast }) {
  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('vyvy_flower_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout modal state: { open: boolean, items: [], isDirect: boolean }
  const [checkoutModal, setCheckoutModal] = useState({
    open: false,
    items: [],
    isDirect: false,
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('vyvy_flower_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1, silent = false) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            image: product.image || '/images/vyvy_lily_hong.jpg',
            category: product.category || 'Hoa tươi',
            badge: product.badge || '',
            badgeColor: product.badgeColor || '#facc15',
            quantity: qty,
          },
        ];
      }
    });

    if (!silent && addToast) {
      addToast(`Đã thêm "${product.name}" vào giỏ hàng! 🌸`);
    }
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    if (addToast) {
      addToast('Đã xóa mẫu hoa khỏi giỏ hàng.');
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Quick total calculations
  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  // Drawer helpers
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Checkout flow from Cart
  const startCartCheckout = () => {
    if (cart.length === 0) {
      if (addToast) addToast('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }
    setIsCartOpen(false);
    setCheckoutModal({
      open: true,
      items: [...cart],
      isDirect: false,
    });
  };

  // Direct "Đặt Ngay / Mua Ngay" single item flow
  const startDirectOrder = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    const item = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      image: product.image || '/images/vyvy_lily_hong.jpg',
      category: product.category || 'Hoa tươi',
      badge: product.badge || '',
      badgeColor: product.badgeColor || '#facc15',
      quantity: qty,
    };
    setCheckoutModal({
      open: true,
      items: [item],
      isDirect: true,
    });
  };

  const closeCheckout = () => {
    setCheckoutModal({ open: false, items: [], isDirect: false });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        checkoutModal,
        setCheckoutModal,
        startCartCheckout,
        startDirectOrder,
        closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
