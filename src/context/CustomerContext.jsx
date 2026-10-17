import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginCustomer, registerCustomer, getCustomerOrders } from '../services/api';

const CustomerContext = createContext(null);

export function CustomerProvider({ children, addToast }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('vyvy_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [orderPlacementModal, setOrderPlacementModal] = useState({ open: false, product: null });

  useEffect(() => {
    if (customer) {
      localStorage.setItem('vyvy_customer_user', JSON.stringify(customer));
    } else {
      localStorage.removeItem('vyvy_customer_user');
    }
  }, [customer]);

  const login = async (credentials) => {
    try {
      const res = await loginCustomer(credentials);
      if (res.success && res.customer) {
        setCustomer(res.customer);
        if (addToast) addToast(`Chào mừng ${res.customer.name} quay trở lại! ✨`);
        setAuthModalOpen(false);

        // Resume action if user was trying to place an order
        if (pendingAction) {
          pendingAction(res.customer);
          setPendingAction(null);
        }
        return { success: true };
      }
      return { success: false, message: res.error || 'Đăng nhập không thành công' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (data) => {
    try {
      const res = await registerCustomer(data);
      if (res.success && res.customer) {
        setCustomer(res.customer);
        if (addToast) addToast(`Đăng ký tài khoản thành công! Chào mừng ${res.customer.name} 🌸`);
        setAuthModalOpen(false);

        if (pendingAction) {
          pendingAction(res.customer);
          setPendingAction(null);
        }
        return { success: true };
      }
      return { success: false, message: res.error || 'Đăng ký không thành công' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const setAuthenticatedCustomer = (customerData) => {
    setCustomer(customerData);
    if (addToast) addToast(`Chào mừng ${customerData.name} đến với Vy Vy Flower! ✨`);
    setAuthModalOpen(false);
    if (pendingAction) {
      pendingAction(customerData);
      setPendingAction(null);
    }
  };

  const logout = () => {
    setCustomer(null);
    if (addToast) addToast('Đã đăng xuất tài khoản khách hàng.');
  };

  /**
   * Yêu cầu xác thực trước khi thực hiện hành động (ví dụ đặt hoa)
   */
  const requireAuth = (callback) => {
    if (customer) {
      callback(customer);
    } else {
      setPendingAction(() => callback);
      setAuthModalOpen(true);
    }
  };

  const startOrderFlow = (product) => {
    requireAuth((activeCustomer) => {
      setOrderPlacementModal({ open: true, product, customer: activeCustomer });
    });
  };

  return (
    <CustomerContext.Provider value={{
      customer,
      isLoggedIn: !!customer,
      login,
      register,
      setAuthenticatedCustomer,
      logout,
      requireAuth,
      authModalOpen,
      setAuthModalOpen,
      ordersModalOpen,
      setOrdersModalOpen,
      orderPlacementModal,
      setOrderPlacementModal,
      startOrderFlow,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
