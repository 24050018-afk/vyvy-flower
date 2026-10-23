import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import FloatingSpheresBackground from './components/FloatingSpheresBackground';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ContactPage from './pages/ContactPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PetalCanvas from './components/PetalCanvas';
import FloatingContactWidget from './components/FloatingContactWidget';
import MobileBottomBar from './components/MobileBottomBar';

// Customer Flow
import { CustomerProvider } from './context/CustomerContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import CustomerAuthModal from './components/CustomerAuthModal';
import OrderPlacementModal from './components/OrderPlacementModal';
import MyOrdersModal from './components/MyOrdersModal';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminInventory from './admin/pages/AdminInventory';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminOrders from './admin/pages/AdminOrders';
import AdminReviews from './admin/pages/AdminReviews';
import AdminLogin from './admin/pages/AdminLogin';

export const ToastContext = React.createContext(null);

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <PetalCanvas />
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
      <FloatingContactWidget />
      <Footer />
      <MobileBottomBar />
    </>
  );
}

function ProtectedRoute({ children, isLoggedIn }) {
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('vyvy_admin_logged_in') === 'true';
  });

  const handleLogin = (user) => {
    localStorage.setItem('vyvy_admin_logged_in', 'true');
    if (user) {
      localStorage.setItem('vyvy_admin_user', JSON.stringify(user));
    }
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('vyvy_admin_logged_in');
    localStorage.removeItem('vyvy_admin_user');
    setIsAdminLoggedIn(false);
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  return (
    <ToastContext.Provider value={addToast}>
      <BrowserRouter>
        <CustomerProvider addToast={addToast}>
          <CartProvider addToast={addToast}>
            {/* Global 3D Ambient Layer - No cursor followers */}
            <FloatingSpheresBackground />

            <Routes>
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

              <Route
                path="/admin/login"
                element={
                  isAdminLoggedIn ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <AdminLogin onLogin={handleLogin} />
                  )
                }
              />
              <Route path="/admin" element={
                <ProtectedRoute isLoggedIn={isAdminLoggedIn}>
                  <AdminLayout onLogout={handleLogout} />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>
            </Routes>

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Customer Interactive Modals */}
            <CustomerAuthModal />
            <OrderPlacementModal />
            <MyOrdersModal />

            {/* Floating Toasts */}
            <div className="toast-wrap">
              {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                  {t.type === 'success' ? '✨ ' : '❌ '}{t.message}
                </div>
              ))}
            </div>
          </CartProvider>
        </CustomerProvider>
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
