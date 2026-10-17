/* ============================================================
   Vy Vy Flower — Real MySQL API Service (MySQL Workbench)
   Connects the React frontend to the Node.js + MySQL 8.0 backend.
   ============================================================ */

const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API error (${res.status})`);
  }
  return res.json();
}

/* ============ PRODUCTS ============ */
export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return handleResponse(res);
}

export async function createProduct(data) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateProduct(id, data) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function updateProductImage(id, imageUrl) {
  const res = await fetch(`${API_BASE}/products/${id}/image`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageUrl }),
  });
  return handleResponse(res);
}

export async function uploadImage(base64Data, name) {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Data, name }),
  });
  return handleResponse(res);
}

/* ============ ORDERS ============ */
export async function getOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  return handleResponse(res);
}

export async function createOrder(data) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateOrder(id, data) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

/* ============ CUSTOMERS ============ */
export async function getCustomers() {
  const res = await fetch(`${API_BASE}/customers`);
  return handleResponse(res);
}

export async function createCustomer(data) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateCustomer(id, data) {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

/* ============ INVENTORY ============ */
export async function getInventory() {
  const res = await fetch(`${API_BASE}/inventory`);
  return handleResponse(res);
}

export async function createInventoryItem(data) {
  const res = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateInventoryItem(id, data) {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteInventoryItem(id) {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

/* ============ DASHBOARD STATS ============ */
export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return handleResponse(res);
}

/* ============ AUTH ============ */
export async function loginAdmin(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

/* ============ CUSTOMER AUTH & ORDERS ============ */
export async function registerCustomer(data) {
  const res = await fetch(`${API_BASE}/customer/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function loginCustomer(data) {
  const res = await fetch(`${API_BASE}/customer/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* ============ REAL AUTH LINKING (OTP, GOOGLE, FACEBOOK) ============ */
export async function sendOtp(phone, name = '') {
  const res = await fetch(`${API_BASE}/customer/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name }),
  });
  return handleResponse(res);
}

export async function verifyOtp(phone, otp, name = '') {
  const res = await fetch(`${API_BASE}/customer/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp, name }),
  });
  return handleResponse(res);
}

export async function googleOAuthLogin(payload) {
  const res = await fetch(`${API_BASE}/customer/auth/google-oauth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function facebookOAuthLogin(payload) {
  const res = await fetch(`${API_BASE}/customer/auth/facebook-oauth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getCustomerOrders(phone) {
  const res = await fetch(`${API_BASE}/customer/orders?phone=${encodeURIComponent(phone)}`);
  return handleResponse(res);
}

/* ============ NOTIFICATIONS (Live Alerts to Admin) ============ */
export async function getNotifications() {
  const res = await fetch(`${API_BASE}/notifications`);
  return handleResponse(res);
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
  });
  return handleResponse(res);
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
  });
  return handleResponse(res);
}

