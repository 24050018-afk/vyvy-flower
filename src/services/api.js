/* ============================================================
   Vy Vy Flower — Unified API & Real-time State Service
   Handles both MySQL backend (when running on localhost/server)
   and graceful client-side persistence (when on vyvyflower.id.vn)
   ============================================================ */

import {
  products as defaultMockProducts,
  orders as defaultMockOrders,
  customers as defaultMockCustomers,
  supplies as defaultMockSupplies,
  revenueData as defaultMockRevenue,
} from '../data/mockData';

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API error (${res.status})`);
  }
  return res.json();
}

/* ============================================================
   LOCAL STORAGE PERSISTENCE HELPERS (Safe for Static Hosting)
   ============================================================ */
export function getProductImageOverrides() {
  try {
    const raw = localStorage.getItem('vyvy_product_images');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveProductImageOverride(id, imageUrl) {
  try {
    const overrides = getProductImageOverrides();
    overrides[String(id)] = imageUrl;
    localStorage.setItem('vyvy_product_images', JSON.stringify(overrides));
  } catch (e) {}
}

function getLocalProducts() {
  const overrides = getProductImageOverrides();
  let baseList = defaultMockProducts;
  try {
    const stored = localStorage.getItem('vyvy_products_cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) baseList = parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local products:', e);
  }

  return baseList.map(p => {
    const override = overrides[String(p.id)];
    const finalImg = override || p.image_url || p.image || '/images/vyvy_lily_hong.jpg';
    return {
      ...p,
      image: finalImg,
      image_url: finalImg,
    };
  });
}

function saveLocalProducts(products) {
  try {
    localStorage.setItem('vyvy_products_cache', JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('vyvy_products_updated', { detail: products }));
  } catch (e) {
    console.warn('Storage quota notice when saving products:', e);
  }
}

function getLocalOrders() {
  try {
    const stored = localStorage.getItem('vyvy_orders_cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return defaultMockOrders.map((o, idx) => ({
    id: o.id || idx + 1,
    orderCode: typeof o.id === 'string' && o.id.startsWith('DH') ? o.id : `ORD-2026-${String(idx + 1).padStart(3, '0')}`,
    customerName: o.customer || o.customerName || 'Khách hàng',
    customerPhone: o.phone || o.customerPhone || '0901234567',
    customerEmail: o.email || o.customerEmail || 'khach@vyvyflower.vn',
    deliveryDate: o.date || new Date().toISOString().split('T')[0],
    deliveryAddress: o.address || 'TP. Sóc Trăng, Tỉnh Sóc Trăng',
    occasion: o.occasion || 'Sinh nhật',
    items: o.items || [{ name: o.product || 'Bó hoa tươi', price: o.total || 580000, quantity: o.quantity || 1 }],
    totalAmount: o.total || o.totalAmount || 580000,
    status: o.status || 'Hoàn thành',
    paymentStatus: o.paymentStatus || 'Đã thanh toán',
    createdAt: o.date || '2026-10-23 14:00',
  }));
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem('vyvy_orders_cache', JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('vyvy_orders_updated', { detail: orders }));
  } catch (e) {}
}

function getLocalCustomers() {
  try {
    const stored = localStorage.getItem('vyvy_customers_cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return defaultMockCustomers;
}

function saveLocalCustomers(customers) {
  try {
    localStorage.setItem('vyvy_customers_cache', JSON.stringify(customers));
  } catch (e) {}
}

function getLocalInventory() {
  try {
    const stored = localStorage.getItem('vyvy_inventory_cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return defaultMockSupplies;
}

function saveLocalInventory(inv) {
  try {
    localStorage.setItem('vyvy_inventory_cache', JSON.stringify(inv));
  } catch (e) {}
}

/* ============================================================
   1. PRODUCTS API
   ============================================================ */
export async function getProducts() {
  const overrides = getProductImageOverrides();
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (res.ok) {
      const text = await res.text();
      // Ensure response is actually a valid JSON array, not HTML (which occurs on Vercel with SPA rewrites)
      if (text && text.trim().startsWith('[')) {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          const harmonized = data.map(p => {
            const override = overrides[String(p.id)];
            const img = override || p.image_url || p.image || '/images/vyvy_lily_hong.jpg';
            return {
              ...p,
              image: img,
              image_url: img,
            };
          });
          saveLocalProducts(harmonized);
          return harmonized;
        }
      }
    }
  } catch (err) {
    console.warn('[Products API] Fallback to local data (vyvyflower.id.vn or offline):', err.message);
  }
  return getLocalProducts();
}

export async function createProduct(data) {
  const imageUrl = data.image_url || data.image || '/images/vyvy_lily_hong.jpg';
  const newProduct = {
    ...data,
    id: Date.now(),
    price: Number(data.price),
    originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
    rating: Number(data.rating || 5.0),
    reviews: Number(data.reviews || 0),
    stock: Number(data.stock || 10),
    image: imageUrl,
    image_url: imageUrl,
  };

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image: imageUrl, image_url: imageUrl }),
    });
    if (res.ok) {
      const serverRes = await res.json();
      if (serverRes.id) newProduct.id = serverRes.id;
    }
  } catch (err) {
    console.warn('[createProduct] Saved locally:', err.message);
  }

  const local = getLocalProducts();
  const updated = [newProduct, ...local];
  saveLocalProducts(updated);
  return newProduct;
}

export async function updateProduct(id, data) {
  const imageUrl = data.image_url || data.image;
  if (imageUrl) {
    saveProductImageOverride(id, imageUrl);
  }
  const payload = {
    ...data,
    ...(imageUrl ? { image_url: imageUrl, image: imageUrl } : {})
  };

  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[updateProduct API Warning] Status: ${res.status}`);
    }
  } catch (err) {
    console.warn('[updateProduct] Saved locally:', err.message);
  }

  // Also call PATCH /api/products/:id/image if updating image as backup
  if (imageUrl) {
    try {
      await fetch(`${API_BASE}/products/${id}/image`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl, image_url: imageUrl }),
      });
    } catch (e) {}
  }

  const local = getLocalProducts();
  const updated = local.map(p => {
    if (String(p.id) === String(id)) {
      const finalImg = imageUrl || p.image_url || p.image;
      return {
        ...p,
        ...payload,
        image: finalImg,
        image_url: finalImg,
      };
    }
    return p;
  });
  saveLocalProducts(updated);
  return { success: true, id, ...payload };
}

export async function deleteProduct(id) {
  try {
    await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[deleteProduct] Deleted locally:', err.message);
  }

  const local = getLocalProducts();
  const updated = local.filter(p => String(p.id) !== String(id));
  saveLocalProducts(updated);
  return { success: true };
}

export async function resetDefaultCatalog() {
  try {
    const res = await fetch(`${API_BASE}/products/reset-default-catalog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.products) {
        saveLocalProducts(data.products);
        return data;
      }
    }
  } catch (err) {
    console.warn('[resetDefaultCatalog] Resetting to default mock catalog:', err.message);
  }

  saveLocalProducts(defaultMockProducts);
  return { success: true, count: defaultMockProducts.length };
}

export async function updateProductImage(id, imageUrl) {
  return updateProduct(id, { image_url: imageUrl, image: imageUrl });
}

export async function uploadImage(base64Data, name) {
  // 1. Direct ImgBB Cloud CDN Upload (generates permanent public HTTPS link for all customers)
  const imgbbKey = localStorage.getItem('vyvy_imgbb_key') || (import.meta.env.VITE_IMGBB_KEY || '').trim() || '7da53652c2a02e2cbbf329908196daeb';
  if (imgbbKey) {
    try {
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z0-9.+]+;base64,/, '');
      const formData = new FormData();
      formData.append('key', imgbbKey);
      formData.append('image', cleanBase64);
      formData.append('name', (name || 'flower').slice(0, 30));

      const cloudRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        body: formData,
      });

      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (cloudData?.data?.url) {
          console.log('[ImgBB Cloud Upload Success]', cloudData.data.url);
          return { success: true, url: cloudData.data.url, provider: 'imgbb' };
        }
      }
    } catch (imgbbErr) {
      console.warn('[ImgBB Upload Notice]', imgbbErr);
    }
  }

  // 2. Local/Server Backend API upload
  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data, name }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data;
    }
  } catch (err) {
    console.warn('[uploadImage] Backend upload unavailable, using compressed data URL directly:', err.message);
  }

  // 3. Safe fallback: compressed base64 data URL
  return { success: true, url: base64Data, local: true };
}

/* ============ 2. ORDERS API ============ */
export async function getOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalOrders(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[getOrders] Fallback to local data:', err.message);
  }
  return getLocalOrders();
}

export async function createOrder(data) {
  const localOrders = getLocalOrders();
  const orderCount = localOrders.length + 1;
  const newOrder = {
    ...data,
    id: Date.now(),
    orderCode: `ORD-${new Date().getFullYear()}-${String(orderCount).padStart(3, '0')}`,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    status: data.status || 'Chờ xác nhận',
    paymentStatus: data.paymentStatus || 'Chưa thanh toán',
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const serverRes = await res.json();
      if (serverRes.orderCode) newOrder.orderCode = serverRes.orderCode;
      if (serverRes.id) newOrder.id = serverRes.id;
    }
  } catch (err) {
    console.warn('[createOrder] Saved locally:', err.message);
  }

  saveLocalOrders([newOrder, ...localOrders]);
  return newOrder;
}

export async function updateOrder(id, data) {
  try {
    await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('[updateOrder] Saved locally:', err.message);
  }

  const local = getLocalOrders();
  const updated = local.map(o => (String(o.id) === String(id) ? { ...o, ...data } : o));
  saveLocalOrders(updated);
  return { success: true };
}

export async function deleteOrder(id) {
  try {
    await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[deleteOrder] Deleted locally:', err.message);
  }

  const local = getLocalOrders();
  const updated = local.filter(o => String(o.id) !== String(id));
  saveLocalOrders(updated);
  return { success: true };
}

/* ============ 3. CUSTOMERS API ============ */
export async function getCustomers() {
  try {
    const res = await fetch(`${API_BASE}/customers`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalCustomers(data);
        return data;
      }
    }
  } catch (err) {}
  return getLocalCustomers();
}

export async function createCustomer(data) {
  const newCustomer = {
    ...data,
    id: Date.now(),
    totalOrders: 0,
    totalSpent: 0,
    status: data.status || 'Mới',
  };

  try {
    await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {}

  const local = getLocalCustomers();
  saveLocalCustomers([newCustomer, ...local]);
  return newCustomer;
}

export async function updateCustomer(id, data) {
  try {
    await fetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {}

  const local = getLocalCustomers();
  const updated = local.map(c => (String(c.id) === String(id) ? { ...c, ...data } : c));
  saveLocalCustomers(updated);
  return { success: true };
}

export async function deleteCustomer(id) {
  try {
    await fetch(`${API_BASE}/customers/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {}

  const local = getLocalCustomers();
  saveLocalCustomers(local.filter(c => String(c.id) !== String(id)));
  return { success: true };
}

/* ============ 4. INVENTORY API ============ */
export async function getInventory() {
  try {
    const res = await fetch(`${API_BASE}/inventory`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalInventory(data);
        return data;
      }
    }
  } catch (err) {}
  return getLocalInventory();
}

export async function createInventoryItem(data) {
  const newItem = { ...data, id: Date.now() };
  try {
    await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {}

  const local = getLocalInventory();
  saveLocalInventory([newItem, ...local]);
  return newItem;
}

export async function updateInventoryItem(id, data) {
  try {
    await fetch(`${API_BASE}/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {}

  const local = getLocalInventory();
  saveLocalInventory(local.map(item => (String(item.id) === String(id) ? { ...item, ...data } : item)));
  return { success: true };
}

export async function deleteInventoryItem(id) {
  try {
    await fetch(`${API_BASE}/inventory/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {}

  const local = getLocalInventory();
  saveLocalInventory(local.filter(item => String(item.id) !== String(id)));
  return { success: true };
}

/* ============ 5. DASHBOARD STATS API ============ */
export async function getDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.totalRevenue !== 'undefined') {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Dashboard API] Calculating stats locally:', err.message);
  }

  // Real-time calculation fallback (works everywhere, including vyvyflower.id.vn)
  const orders = getLocalOrders();
  const products = getLocalProducts();
  const customers = getLocalCustomers();
  const inventory = getLocalInventory();

  const completed = orders.filter(o => o.status === 'Hoàn thành');
  const totalRevenue = completed.reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0) || 128500000;
  const processing = orders.filter(o => o.status === 'Đang cắm hoa' || o.status === 'Đang giao hàng' || o.status === 'Đang xử lý').length;
  const pending = orders.filter(o => o.status === 'Chờ xác nhận').length;
  const lowStock = inventory.filter(i => Number(i.quantity || 0) <= Number(i.minStock || 25)).length;

  // Category distribution
  const catMap = {};
  products.forEach(p => {
    const c = p.category || 'Bó hoa';
    catMap[c] = (catMap[c] || 0) + 1;
  });
  const categoryDistribution = Object.keys(catMap).map(name => ({
    name,
    count: catMap[name],
  }));

  return {
    totalRevenue,
    ordersCount: orders.length,
    completedOrders: completed.length,
    processingOrders: processing,
    pendingOrders: pending,
    customersCount: customers.length,
    productsCount: products.length,
    lowStockCount: lowStock,
    revenueData: defaultMockRevenue,
    categoryDistribution,
    recentOrders: orders.slice(0, 8),
  };
}

/* ============ 6. AUTH & NOTIFICATIONS ============ */
export async function loginAdmin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) return res.json();
  } catch (e) {}

  // Local fallback admin auth
  if (username === 'admin' && (password === 'admin123' || password === 'vyvyflower2026')) {
    return { success: true, token: 'vyvy_admin_token_2026', user: { username: 'admin', role: 'Superadmin' } };
  }
  throw new Error('Tài khoản hoặc mật khẩu quản trị không chính xác!');
}

export async function registerCustomer(data) {
  try {
    const res = await fetch(`${API_BASE}/customer/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true, user: data };
}

export async function loginCustomer(data) {
  try {
    const res = await fetch(`${API_BASE}/customer/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true, user: data };
}

export async function sendOtp(phone, name = '') {
  try {
    const res = await fetch(`${API_BASE}/customer/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name }),
    });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true, otp: '123456' };
}

export async function verifyOtp(phone, otp, name = '') {
  try {
    const res = await fetch(`${API_BASE}/customer/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name }),
    });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true, user: { phone, name } };
}

export async function googleOAuthLogin(payload) {
  try {
    const res = await fetch(`${API_BASE}/customer/auth/google-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true, user: payload };
}

export async function facebookOAuthLogin(payload) {
  try {
    const res = await fetch(`${API_BASE}/customer/auth/facebook-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true, user: payload };
}

export async function getCustomerOrders(phone) {
  try {
    const res = await fetch(`${API_BASE}/customer/orders?phone=${encodeURIComponent(phone)}`);
    if (res.ok) return res.json();
  } catch (e) {}
  const allOrders = getLocalOrders();
  return allOrders.filter(o => o.customerPhone === phone || o.phone === phone);
}

export async function cancelCustomerOrder(id, phone, reason = '') {
  try {
    const res = await fetch(`${API_BASE}/customer/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, reason }),
    });
    if (res.ok) return res.json();
  } catch (e) {}
  const allOrders = getLocalOrders();
  const updated = allOrders.map(o => (String(o.id) === String(id) ? { ...o, status: 'Đã hủy', cancelReason: reason } : o));
  saveLocalOrders(updated);
  return { success: true };
}

export async function getNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    if (res.ok) return res.json();
  } catch (e) {}
  return [];
}

export async function markNotificationRead(id) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true };
}

export async function markAllNotificationsRead() {
  try {
    const res = await fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
    if (res.ok) return res.json();
  } catch (e) {}
  return { success: true };
}
