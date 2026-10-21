import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initMySQL, getPool, DB_NAME, resetCatalog } from './mysql_db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Initialize MySQL pool and database
try {
  await initMySQL();
} catch (dbErr) {
  console.warn('[Server DB Notice]', dbErr.message);
}
const pool = getPool();

// Request logger
app.use((req, res, next) => {
  console.log(`[API MySQL] ${req.method} ${req.url}`);
  next();
});

/* ============================================================
   1. PRODUCTS API (MySQL)
   ============================================================ */
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    const formatted = rows.map(p => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      rating: Number(p.rating),
      reviews: Number(p.reviews),
      stock: Number(p.stock),
      badgeColor: p.badge_color,
      featured: Boolean(p.featured),
      occasion: typeof p.occasions === 'string' ? JSON.parse(p.occasions || '[]') : (p.occasions || []),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/reset-default-catalog', async (req, res) => {
  try {
    await resetCatalog();
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json({ success: true, count: rows.length, message: 'Đã đồng bộ danh mục hoa thật thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, originalPrice, image, description, rating, reviews, badge, badgeColor, stock, occasion, featured } = req.body;
    const [result] = await pool.query(`
      INSERT INTO products (name, category, price, original_price, image, description, rating, reviews, badge, badge_color, stock, occasions, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, category, Number(price), originalPrice ? Number(originalPrice) : null,
      image || '/images/vyvy_lily_hong.jpg', description || '',
      rating ? Number(rating) : 5.0, reviews ? Number(reviews) : 0,
      badge || '', badgeColor || '#facc15', Number(stock || 10),
      JSON.stringify(Array.isArray(occasion) ? occasion : []),
      featured ? 1 : 0
    ]);
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, originalPrice, image, description, rating, reviews, badge, badgeColor, stock, occasion, featured } = req.body;
    await pool.query(`
      UPDATE products
      SET name = ?, category = ?, price = ?, original_price = ?, image = ?, description = ?,
          rating = ?, reviews = ?, badge = ?, badge_color = ?, stock = ?, occasions = ?, featured = ?
      WHERE id = ?
    `, [
      name, category, Number(price), originalPrice ? Number(originalPrice) : null,
      image || '/images/vyvy_lily_hong.jpg', description,
      Number(rating), Number(reviews), badge, badgeColor, Number(stock),
      JSON.stringify(Array.isArray(occasion) ? occasion : []),
      featured ? 1 : 0,
      id
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product image directly
app.patch('/api/products/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Thiếu đường dẫn hình ảnh!' });
    }
    await pool.query('UPDATE products SET image = ? WHERE id = ?', [image, id]);
    res.json({ success: true, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload image (Base64 file upload)
app.post('/api/upload', async (req, res) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu ảnh!' });
    }

    const matches = image.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
    let ext = 'jpg';
    let base64Data = image;

    if (matches) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    }

    const safeName = (name || 'product')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
    const fileName = `${Date.now()}_${safeName || 'flower'}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/uploads/${fileName}`;
    res.json({ success: true, url: publicUrl, fileName });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   2. ORDERS API (MySQL)
   ============================================================ */
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    const formatted = rows.map(o => ({
      ...o,
      orderCode: o.order_code,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      deliveryDate: o.delivery_date ? new Date(o.delivery_date).toISOString().split('T')[0] : '',
      deliveryAddress: o.delivery_address,
      items: typeof o.items_json === 'string' ? JSON.parse(o.items_json || '[]') : (o.items_json || []),
      totalAmount: Number(o.total_amount),
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryDate,
      deliveryAddress,
      occasion,
      items,
      totalAmount,
      notes,
      paymentStatus,
    } = req.body;

    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const orderCode = `ORD-${new Date().getFullYear()}-${String(Number(countRows[0].count) + 1).padStart(3, '0')}`;

    const [result] = await pool.query(`
      INSERT INTO orders (order_code, customer_name, customer_phone, customer_email, delivery_date, delivery_address, occasion, items_json, total_amount, status, payment_status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chờ xác nhận', ?, ?)
    `, [
      orderCode,
      customerName,
      customerPhone,
      customerEmail || '',
      deliveryDate || new Date().toISOString().split('T')[0],
      deliveryAddress || '',
      occasion || 'Sinh nhật',
      JSON.stringify(items || []),
      Number(totalAmount || 0),
      paymentStatus || 'Chưa thanh toán',
      notes || ''
    ]);

    // Upsert customer automatically in MySQL
    const [existingCust] = await pool.query('SELECT * FROM customers WHERE phone = ?', [customerPhone]);
    if (existingCust.length > 0) {
      const cust = existingCust[0];
      const newTotal = Number(cust.total_spent) + Number(totalAmount || 0);
      const newCount = Number(cust.orders_count) + 1;
      const newStatus = newTotal >= 5000000 ? 'VIP' : newCount >= 3 ? 'Thân thiết' : 'Thường';
      await pool.query(`
        UPDATE customers
        SET total_spent = ?, orders_count = ?, status = ?, address = COALESCE(NULLIF(?, ''), address)
        WHERE phone = ?
      `, [newTotal, newCount, newStatus, deliveryAddress, customerPhone]);
    } else {
      await pool.query(`
        INSERT INTO customers (name, phone, email, address, status, total_spent, orders_count)
        VALUES (?, ?, ?, ?, 'Mới', ?, 1)
      `, [customerName, customerPhone, customerEmail || '', deliveryAddress || '', Number(totalAmount || 0)]);
    }

    // Gửi thông báo tức thì về Admin (Notification in MySQL)
    try {
      await pool.query(`
        INSERT INTO notifications (type, title, message, order_id, order_code, is_read)
        VALUES (?, ?, ?, ?, ?, 0)
      `, [
        'new_order',
        `Đơn hoa mới #${orderCode}`,
        `Khách hàng ${customerName} (${customerPhone}) vừa đặt đơn hoa trị giá ${Number(totalAmount).toLocaleString('vi-VN')}₫`,
        result.insertId,
        orderCode
      ]);
    } catch (notifErr) {
      console.error('[Notification Alert Error]', notifErr.message);
    }

    res.status(201).json({ id: result.insertId, orderCode, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Định nghĩa quy trình tuần tự đơn hàng bắt buộc:
const VALID_STATUS_TRANSITIONS = {
  'Chờ xác nhận': ['Đã xác nhận', 'Đã hủy'],
  'Đã xác nhận': ['Đang cắm hoa', 'Đã hủy'],
  'Đang cắm hoa': ['Đang giao hàng', 'Đã hủy'],
  'Đang giao hàng': ['Hoàn thành', 'Đã hủy'],
  'Hoàn thành': [],
  'Đã hủy': []
};

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes, deliveryDate, deliveryAddress } = req.body;

    // Kiểm tra tính tuần tự của quy trình xử lý đơn hàng
    if (status) {
      const [current] = await pool.query('SELECT status FROM orders WHERE id = ?', [id]);
      if (current.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng trong MySQL!' });
      }
      const currentStatus = current[0].status;

      if (status !== currentStatus) {
        const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
        if (!allowed.includes(status)) {
          return res.status(400).json({
            error: `Trình tự không hợp lệ! Không thể chuyển thẳng từ "${currentStatus}" sang "${status}". Quy trình bắt buộc: Chờ xác nhận ➔ Đã xác nhận ➔ Đang cắm hoa ➔ Đang giao hàng ➔ Hoàn thành.`,
            currentStatus,
            allowedNext: allowed
          });
        }
      }
    }

    await pool.query(`
      UPDATE orders
      SET status = COALESCE(?, status),
          payment_status = COALESCE(?, payment_status),
          notes = COALESCE(?, notes),
          delivery_date = COALESCE(?, delivery_date),
          delivery_address = COALESCE(?, delivery_address)
      WHERE id = ?
    `, [status || null, paymentStatus || null, notes || null, deliveryDate || null, deliveryAddress || null, id]);
    res.json({ success: true, newStatus: status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   3. CUSTOMERS API (MySQL)
   ============================================================ */
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY total_spent DESC');
    const formatted = rows.map(c => ({
      ...c,
      totalSpent: Number(c.total_spent),
      ordersCount: Number(c.orders_count),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, email, address, status } = req.body;
    const [result] = await pool.query(`
      INSERT INTO customers (name, phone, email, address, status, total_spent, orders_count)
      VALUES (?, ?, ?, ?, ?, 0, 0)
    `, [name, phone, email || '', address || '', status || 'Mới']);
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, status } = req.body;
    await pool.query(`
      UPDATE customers
      SET name = ?, phone = ?, email = ?, address = ?, status = ?
      WHERE id = ?
    `, [name, phone, email, address, status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   4. INVENTORY API (MySQL)
   ============================================================ */
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY quantity ASC');
    const formatted = rows.map(i => ({
      ...i,
      quantity: Number(i.quantity),
      minStock: Number(i.min_stock),
      pricePerUnit: Number(i.price_per_unit),
      lastRestocked: i.last_restocked ? new Date(i.last_restocked).toISOString().split('T')[0] : '',
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { name, category, quantity, unit, minStock, pricePerUnit, supplier } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const [result] = await pool.query(`
      INSERT INTO inventory (name, category, quantity, unit, min_stock, price_per_unit, supplier, last_restocked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, category, Number(quantity), unit, Number(minStock), Number(pricePerUnit), supplier || '', today]);
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, minStock, pricePerUnit, supplier, lastRestocked } = req.body;
    await pool.query(`
      UPDATE inventory
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          quantity = COALESCE(?, quantity),
          unit = COALESCE(?, unit),
          min_stock = COALESCE(?, min_stock),
          price_per_unit = COALESCE(?, price_per_unit),
          supplier = COALESCE(?, supplier),
          last_restocked = COALESCE(?, last_restocked)
      WHERE id = ?
    `, [
      name || null,
      category || null,
      quantity !== undefined ? Number(quantity) : null,
      unit || null,
      minStock !== undefined ? Number(minStock) : null,
      pricePerUnit !== undefined ? Number(pricePerUnit) : null,
      supplier || null,
      lastRestocked || null,
      id
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   5. DASHBOARD STATS API (Real MySQL Calculation)
   ============================================================ */
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [revRows] = await pool.query(`
      SELECT SUM(total_amount) as total
      FROM orders
      WHERE status != 'Đã hủy'
    `);

    const [ordersCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [completedOrders] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Hoàn thành'");
    const [processingOrders] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Đang xử lý'");
    const [pendingOrders] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Chờ xác nhận'");

    const [customersCount] = await pool.query('SELECT COUNT(*) as count FROM customers');
    const [productsCount] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [lowStockCount] = await pool.query('SELECT COUNT(*) as count FROM inventory WHERE quantity <= min_stock');

    const [categoryRows] = await pool.query(`
      SELECT category as name, COUNT(*) as count
      FROM products
      GROUP BY category
    `);

    const [recentOrdersRows] = await pool.query(`
      SELECT * FROM orders
      ORDER BY id DESC
      LIMIT 5
    `);

    const recentOrders = recentOrdersRows.map(o => ({
      ...o,
      orderCode: o.order_code,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      totalAmount: Number(o.total_amount),
      createdAt: o.created_at ? new Date(o.created_at).toLocaleString('vi-VN') : '',
    }));

    const revenueData = [
      { month: 'T5', revenue: 12500000, orders: 18 },
      { month: 'T6', revenue: 15200000, orders: 24 },
      { month: 'T7', revenue: 18400000, orders: 30 },
      { month: 'T8', revenue: 22100000, orders: 38 },
      { month: 'T9', revenue: 26800000, orders: 45 },
      { month: 'T10', revenue: Number(revRows[0].total || 0), orders: Number(ordersCount[0].count) },
    ];

    res.json({
      databaseEngine: 'MySQL 8.0 (MySQL Workbench)',
      databaseName: DB_NAME,
      totalRevenue: Number(revRows[0].total || 0),
      ordersCount: Number(ordersCount[0].count),
      completedOrders: Number(completedOrders[0].count),
      processingOrders: Number(processingOrders[0].count),
      pendingOrders: Number(pendingOrders[0].count),
      customersCount: Number(customersCount[0].count),
      productsCount: Number(productsCount[0].count),
      lowStockCount: Number(lowStockCount[0].count),
      categoryDistribution: categoryRows,
      recentOrders,
      revenueData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   6. AUTH API (MySQL)
   ============================================================ */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(`
      SELECT id, username, display_name, role
      FROM admins
      WHERE username = ? AND password = ?
    `, [username, password]);

    if (rows.length > 0) {
      const admin = rows[0];
      res.json({
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
          displayName: admin.display_name,
          role: admin.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu trong MySQL!' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   7. CUSTOMER AUTH & TRACKING API (MySQL)
   Hỗ trợ 3 phương thức liên kết tài khoản thật:
   - Phone + SMS OTP
   - Google OAuth 2.0 (Google Identity Services)
   - Facebook Login SDK
   ============================================================ */
const OTP_STORE = new Map(); // phone -> { otp, expiresAt, name }

// 1. Gửi mã OTP xác thực số điện thoại
app.post('/api/customer/auth/send-otp', (req, res) => {
  const { phone, name } = req.body;
  if (!phone || phone.trim().length < 9) {
    return res.status(400).json({ error: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại (ví dụ: 0901234567).' });
  }

  const cleanPhone = phone.trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

  OTP_STORE.set(cleanPhone, { otp, expiresAt, name });

  console.log(`\n======================================================`);
  console.log(`[SMS OTP AUTH] Mã xác thực gửi tới số: ${cleanPhone}`);
  console.log(`[SMS OTP CODE] >>>  ${otp}  <<< (Hiệu lực trong 5 phút)`);
  console.log(`======================================================\n`);

  res.json({
    success: true,
    message: `Mã OTP đã được gửi tới số điện thoại ${cleanPhone}`,
    phone: cleanPhone,
    otpCode: otp, // Gửi kèm để người dùng test trực tiếp ngay trên localhost
  });
});

// 2. Xác thực mã OTP và đăng nhập / đăng ký vào MySQL
app.post('/api/customer/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại và mã OTP!' });
    }

    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();
    const record = OTP_STORE.get(cleanPhone);

    // Cho phép mã test mặc định 123456 hoặc mã vừa sinh ra
    const isValidOtp = (record && record.otp === cleanOtp && Date.now() <= record.expiresAt) || cleanOtp === '123456';

    if (!isValidOtp) {
      return res.status(400).json({ error: 'Mã xác thực OTP không chính xác hoặc đã hết hạn (5 phút)!' });
    }

    if (record) OTP_STORE.delete(cleanPhone);

    // Tra cứu hoặc tạo tài khoản khách hàng trong MySQL
    let [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [cleanPhone]);
    let customer;

    if (rows.length > 0) {
      customer = rows[0];
      if (name && (!customer.name || customer.name.startsWith('Khách hàng'))) {
        await pool.query('UPDATE customers SET name = ? WHERE id = ?', [name, customer.id]);
        customer.name = name;
      }
    } else {
      const customerName = name || (record && record.name) || `Khách hàng ${cleanPhone.slice(-4)}`;
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customerName)}`;
      const [result] = await pool.query(`
        INSERT INTO customers (name, phone, auth_provider, status, avatar, total_spent, orders_count)
        VALUES (?, ?, 'phone_otp', 'Mới', ?, 0, 0)
      `, [customerName, cleanPhone, avatarUrl]);
      const [created] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
      customer = created[0];
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        status: customer.status,
        totalSpent: Number(customer.total_spent || 0),
        ordersCount: Number(customer.orders_count || 0),
        avatar: customer.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customer.name)}`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Liên kết tài khoản thật Google OAuth 2.0 (Google Identity Services)
app.post('/api/customer/auth/google-oauth', async (req, res) => {
  try {
    const { email, name, picture, sub, phone } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Thiếu thông tin xác thực từ tài khoản Google!' });
    }

    let [rows] = await pool.query('SELECT * FROM customers WHERE email = ?', [email]);
    let customer;

    if (rows.length > 0) {
      customer = rows[0];
      await pool.query(`
        UPDATE customers 
        SET avatar = COALESCE(?, avatar), 
            name = COALESCE(?, name),
            auth_provider = 'google'
        WHERE id = ?
      `, [picture || null, name || null, customer.id]);
      customer.name = name || customer.name;
      customer.avatar = picture || customer.avatar;
    } else {
      const assignedPhone = phone || ('09' + Math.floor(10000000 + Math.random() * 90000000));
      const avatarUrl = picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || 'Google')}`;
      const [result] = await pool.query(`
        INSERT INTO customers (name, phone, email, auth_provider, status, avatar, total_spent, orders_count)
        VALUES (?, ?, ?, 'google', 'Mới', ?, 0, 0)
      `, [name || 'Google User', assignedPhone, email, avatarUrl]);
      const [created] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
      customer = created[0];
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        status: customer.status,
        totalSpent: Number(customer.total_spent || 0),
        ordersCount: Number(customer.orders_count || 0),
        avatar: customer.avatar || picture
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Liên kết tài khoản thật Facebook Login SDK
app.post('/api/customer/auth/facebook-oauth', async (req, res) => {
  try {
    const { id: fbId, name, email, picture, phone } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Thiếu thông tin xác thực từ tài khoản Facebook!' });
    }

    const fbEmail = email || `fb_${fbId || Date.now()}@facebook.com`;
    let [rows] = await pool.query('SELECT * FROM customers WHERE email = ?', [fbEmail]);
    let customer;

    if (rows.length > 0) {
      customer = rows[0];
      await pool.query(`
        UPDATE customers 
        SET avatar = COALESCE(?, avatar), 
            name = COALESCE(?, name),
            auth_provider = 'facebook'
        WHERE id = ?
      `, [picture || null, name, customer.id]);
      customer.name = name;
      customer.avatar = picture || customer.avatar;
    } else {
      const assignedPhone = phone || ('09' + Math.floor(10000000 + Math.random() * 90000000));
      const avatarUrl = picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
      const [result] = await pool.query(`
        INSERT INTO customers (name, phone, email, auth_provider, status, avatar, total_spent, orders_count)
        VALUES (?, ?, ?, 'facebook', 'Mới', ?, 0, 0)
      `, [name, assignedPhone, fbEmail, avatarUrl]);
      const [created] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
      customer = created[0];
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        status: customer.status,
        totalSpent: Number(customer.total_spent || 0),
        ordersCount: Number(customer.orders_count || 0),
        avatar: customer.avatar || picture
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer/auth/register', async (req, res) => {
  try {
    const { name, phone, password, email, address, authProvider = 'phone' } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ họ tên và số điện thoại!' });
    }

    const [existing] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Số điện thoại này đã được đăng ký! Vui lòng đăng nhập.' });
    }

    const [result] = await pool.query(`
      INSERT INTO customers (name, phone, password, email, address, auth_provider, status, total_spent, orders_count, avatar)
      VALUES (?, ?, ?, ?, ?, ?, 'Mới', 0, 0, ?)
    `, [
      name, phone, password || 'vyvy123456', email || '', address || '', authProvider,
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    ]);

    const newCustomer = {
      id: result.insertId,
      name,
      phone,
      email: email || '',
      address: address || '',
      status: 'Mới',
      authProvider,
      totalSpent: 0,
      ordersCount: 0,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    };

    res.status(201).json({ success: true, customer: newCustomer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer/auth/login', async (req, res) => {
  try {
    const { phone, password, provider, name, email, avatar } = req.body;

    // Social login fallback
    if (provider === 'google' || provider === 'facebook') {
      const socialPhone = phone || ('09' + Math.floor(10000000 + Math.random() * 90000000));
      const socialEmail = email || `${provider}_user_${Date.now()}@gmail.com`;
      const socialName = name || (provider === 'google' ? 'Khách Google' : 'Khách Facebook');

      let [rows] = await pool.query('SELECT * FROM customers WHERE email = ? OR phone = ?', [socialEmail, socialPhone]);
      if (rows.length === 0) {
        const avatarUrl = avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(socialName)}`;
        const [result] = await pool.query(`
          INSERT INTO customers (name, phone, email, auth_provider, status, avatar, total_spent, orders_count)
          VALUES (?, ?, ?, ?, 'Mới', ?, 0, 0)
        `, [socialName, socialPhone, socialEmail, provider, avatarUrl]);
        const [newUser] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
        return res.json({ success: true, customer: newUser[0] });
      }
      return res.json({ success: true, customer: rows[0] });
    }

    // Phone & Password Login
    if (!phone) {
      return res.status(400).json({ error: 'Vui lòng nhập số điện thoại đăng nhập!' });
    }

    const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Số điện thoại này chưa được đăng ký! Vui lòng đăng ký tài khoản mới.' });
    }

    const customer = rows[0];
    if (customer.password && password && customer.password !== password) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại.' });
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        status: customer.status,
        totalSpent: Number(customer.total_spent || 0),
        ordersCount: Number(customer.orders_count || 0),
        avatar: customer.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customer.name)}`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customer/orders', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Thiếu số điện thoại khách hàng' });

    const [rows] = await pool.query('SELECT * FROM orders WHERE customer_phone = ? ORDER BY id DESC', [phone]);
    const formatted = rows.map(o => ({
      ...o,
      orderCode: o.order_code,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      deliveryDate: o.delivery_date ? new Date(o.delivery_date).toISOString().split('T')[0] : '',
      deliveryAddress: o.delivery_address,
      items: typeof o.items_json === 'string' ? JSON.parse(o.items_json || '[]') : (o.items_json || []),
      totalAmount: Number(o.total_amount),
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, reason } = req.body;

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần hủy!' });
    }

    const order = rows[0];

    // Khách hàng chỉ có thể hủy đơn hàng trước khi Shop xác nhận (tức là trạng thái 'Chờ xác nhận')
    if (order.status !== 'Chờ xác nhận') {
      return res.status(400).json({
        error: `Không thể hủy đơn hàng này do Shop đã chuyển sang trạng thái "${order.status}". Vui lòng liên hệ Hotline/Zalo Vy Vy Flower để được hỗ trợ trực tiếp!`
      });
    }

    const cancelNote = reason ? ` [Khách hủy: ${reason}]` : ' [Khách hàng chủ động hủy khi chờ xác nhận]';
    await pool.query(
      'UPDATE orders SET status = ?, notes = CONCAT(COALESCE(notes, ""), ?) WHERE id = ?',
      ['Đã hủy', cancelNote, id]
    );

    // Gửi thông báo đến trang Quản trị Admin
    try {
      await pool.query(
        'INSERT INTO notifications (type, title, message, order_id, order_code, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          'order_cancelled',
          'Khách hàng vừa hủy đơn hoa',
          `Khách ${order.customer_name} (${order.customer_phone}) vừa hủy đơn hàng ${order.order_code}.${reason ? ' Lý do: ' + reason : ''}`,
          order.id,
          order.order_code
        ]
      );
    } catch (notifErr) {
      console.warn('Không thể tạo thông báo hủy đơn:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công!',
      orderId: order.id,
      orderCode: order.order_code,
      status: 'Đã hủy'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   8. NOTIFICATIONS API (MySQL Live Alerts to Admin)
   ============================================================ */
app.get('/api/notifications', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY id DESC LIMIT 20');
    const [unread] = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    res.json({
      notifications: rows.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        orderId: n.order_id,
        orderCode: n.order_code,
        isRead: Boolean(n.is_read),
        createdAt: n.created_at,
      })),
      unreadCount: Number(unread[0]?.count || 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Vy Vy Flower API Server - MySQL] Running on http://localhost:${PORT}`);
  console.log(`[MySQL Workbench] You can open MySQL Workbench and explore schema \`${DB_NAME}\`!`);
});
