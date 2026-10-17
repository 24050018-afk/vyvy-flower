import 'dotenv/config';
import mysql from 'mysql2/promise';

export const DB_CONFIG = {
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || '3bJEh3ZP6bEQWpn.root',
  password: process.env.DB_PASSWORD || 'MAT_KHAU_TIDB_CUA_BAN',
  database: process.env.DB_NAME || 'test',
  ssl: process.env.DB_SSL === 'false' ? undefined : {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const DB_NAME = DB_CONFIG.database;

let pool = mysql.createPool(DB_CONFIG);

export async function initMySQL() {
  console.log(`[TiDB/MySQL] Connecting to ${DB_CONFIG.host}:${DB_CONFIG.port} (database: ${DB_NAME}, user: ${DB_CONFIG.user})...`);

  // Verify connection
  try {
    await pool.query('SELECT 1 as connected');
    console.log(`[TiDB/MySQL] Connected successfully to TiDB Cloud (${DB_NAME})!`);
  } catch (err) {
    console.error(`[TiDB/MySQL Connection Error] ${err.message}`);
    if (err.message && (err.message.includes('Access denied') || err.message.includes('password'))) {
      console.warn('⚠️ [TiDB Cloud] Vui lòng cấu hình mật khẩu chính xác vào biến DB_PASSWORD trong file .env hoặc trên Render/Vercel dashboard!');
    }
  }

  // Ensure Tables exist
  console.log('[TiDB/MySQL] Ensuring tables exist in database...');

  // 1. PRODUCTS TABLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price INT NOT NULL,
      original_price INT NULL,
      image TEXT NULL,
      description TEXT NULL,
      rating DECIMAL(2,1) DEFAULT 5.0,
      reviews INT DEFAULT 0,
      badge VARCHAR(50) NULL,
      badge_color VARCHAR(50) DEFAULT '#facc15',
      stock INT DEFAULT 10,
      occasions JSON NULL,
      featured TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. CUSTOMERS TABLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NULL,
      auth_provider VARCHAR(50) DEFAULT 'phone',
      email VARCHAR(255) NULL,
      address TEXT NULL,
      status VARCHAR(50) DEFAULT 'Mới',
      total_spent INT DEFAULT 0,
      orders_count INT DEFAULT 0,
      avatar TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Safely ensure new columns exist for existing databases
  try { await pool.query('ALTER TABLE customers ADD COLUMN password VARCHAR(255) NULL'); } catch (e) {}
  try { await pool.query("ALTER TABLE customers ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'phone'"); } catch (e) {}

  // 3. ORDERS TABLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_code VARCHAR(100) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_email VARCHAR(255) NULL,
      delivery_date DATE NULL,
      delivery_address TEXT NULL,
      occasion VARCHAR(100) NULL,
      items_json JSON NOT NULL,
      total_amount INT NOT NULL,
      status VARCHAR(50) DEFAULT 'Chờ xác nhận',
      payment_status VARCHAR(50) DEFAULT 'Chưa thanh toán',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. INVENTORY TABLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      unit VARCHAR(50) NOT NULL,
      min_stock INT NOT NULL,
      price_per_unit INT NOT NULL,
      supplier VARCHAR(255) NULL,
      last_restocked DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. ADMINS TABLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(255) NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. NOTIFICATIONS TABLE (Admin Live Alerts)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(50) DEFAULT 'new_order',
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      order_id INT NULL,
      order_code VARCHAR(100) NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Seed default admin if none exists
  const [adminRows] = await pool.query('SELECT COUNT(*) as count FROM admins');
  if (adminRows[0].count === 0) {
    await pool.query(`
      INSERT INTO admins (username, password, display_name, role)
      VALUES (?, ?, ?, ?)
    `, ['admin', 'bloom2026', 'Vy Vy Master Florist', 'superadmin']);
    console.log('[MySQL] Default admin account seeded: admin / bloom2026');
  }

  // Seed products if empty
  const [prodRows] = await pool.query('SELECT COUNT(*) as count FROM products');
  if (prodRows[0].count === 0) {
    await seedMySQLData();
  } else {
    console.log(`[MySQL] Existing database has ${prodRows[0].count} products.`);
  }

  return pool;
}

export function getPool() {
  if (!pool) throw new Error('MySQL pool not initialized! Call initMySQL() first.');
  return pool;
}

async function seedMySQLData() {
  console.log('[MySQL] Seeding realistic flower atelier data into MySQL tables...');

  // 1. Seed Products
  const initialProducts = [
    {
      name: "Bó Hồng Tình Yêu",
      category: "Bó hoa",
      price: 450000,
      original_price: 550000,
      image: "/images/product_rose.jpg",
      description: "Bó hoa hồng đỏ và hồng phấn cao cấp, được trang trí tinh tế với ruy băng lụa sang trọng. Phù hợp cho lễ kỷ niệm, tình nhân.",
      rating: 4.9,
      reviews: 128,
      badge: "Bán chạy",
      badge_color: "#ff4757",
      stock: 15,
      occasions: ["Tình nhân", "Kỷ niệm", "Sinh nhật"],
      featured: 1,
    },
    {
      name: "Lan Hồ Điệp Hoàng Gia",
      category: "Hoa chậu",
      price: 850000,
      original_price: 1000000,
      image: "/images/product_orchid.jpg",
      description: "Lan hồ điệp tím và trắng trong bình thủy tinh hiện đại. Biểu tượng của sự thanh lịch và trường tồn.",
      rating: 4.8,
      reviews: 89,
      badge: "Cao cấp",
      badge_color: "#8e44ad",
      stock: 8,
      occasions: ["Khai trương", "Tặng sếp", "Lễ tân"],
      featured: 1,
    },
    {
      name: "Bó Hoa Mùa Xuân",
      category: "Bó hoa",
      price: 380000,
      original_price: 420000,
      image: "/images/product_mixed.jpg",
      description: "Bó hoa hỗn hợp đầy màu sắc với mẫu đơn, lily, ranunculus. Tươi vui, rực rỡ như mùa xuân.",
      rating: 4.7,
      reviews: 203,
      badge: "Mới",
      badge_color: "#2ecc71",
      stock: 22,
      occasions: ["Sinh nhật", "Chúc mừng", "Khai trương"],
      featured: 1,
    },
    {
      name: "Giỏ Hoa Sen Đỏ Hoàng Triều",
      category: "Giỏ hoa",
      price: 520000,
      original_price: 600000,
      image: "/images/hero_banner.jpg",
      description: "Giỏ hoa sang trọng với hoa sen đỏ, hoa loa kèn trắng và lá xanh tươi mát. Thích hợp làm quà tặng doanh nghiệp.",
      rating: 4.6,
      reviews: 67,
      badge: "Bespoke",
      badge_color: "#f59e0b",
      stock: 12,
      occasions: ["Doanh nghiệp", "Khai trương", "Tri ân"],
      featured: 1,
    },
    {
      name: "Bó Hoa Cưới Cẩm Tú Cầu",
      category: "Hoa cưới",
      price: 950000,
      original_price: 1200000,
      image: "/images/spheres_purple.jpg",
      description: "Bó hoa cưới cầm tay cô dâu với cẩm tú cầu xanh pastel, hồng trắng David Austin, phủ sương tinh tế.",
      rating: 5.0,
      reviews: 45,
      badge: "Độc bản",
      badge_color: "#c084fc",
      stock: 6,
      occasions: ["Hoa cưới", "Đính hôn"],
      featured: 1,
    },
    {
      name: "Electro Bloom 3D Edition",
      category: "Bó hoa",
      price: 950000,
      original_price: 1100000,
      image: "/images/spheres_green.jpg",
      description: "Tác phẩm hoa nghệ thuật kết hợp lan Vanda xanh, lá cọ nhiệt đới và phong cách Cyberpunk 3D đương đại.",
      rating: 4.9,
      reviews: 78,
      badge: "Signature",
      badge_color: "#a3e635",
      stock: 9,
      occasions: ["Sinh nhật", "Triển lãm", "Kỷ niệm"],
      featured: 1,
    },
    {
      name: "Foam Sunshine Euphoria",
      category: "Hoa chậu",
      price: 1450000,
      original_price: 1650000,
      image: "/images/spheres_yellow.jpg",
      description: "Hoa hồng sa mạc vàng hoàng kim cắm bình gốm nghệ thuật, toát lên năng lượng thịnh vượng rực rỡ.",
      rating: 5.0,
      reviews: 92,
      badge: "Prestige",
      badge_color: "#facc15",
      stock: 7,
      occasions: ["Khai trương", "Tặng sếp", "Tân gia"],
      featured: 1,
    },
    {
      name: "Velvet Dream Luxe",
      category: "Giỏ hoa",
      price: 1850000,
      original_price: 2100000,
      image: "/images/spheres_purple.jpg",
      description: "Cẩm tú cầu tím nhung huyền thoại phối cùng phi yến, thạch thảo và cành khô nghệ thuật đương đại.",
      rating: 4.9,
      reviews: 110,
      badge: "Limited",
      badge_color: "#ec4899",
      stock: 5,
      occasions: ["Kỷ niệm", "VIP Event", "Tình nhân"],
      featured: 1,
    }
  ];

  for (const p of initialProducts) {
    await pool.query(`
      INSERT INTO products (name, category, price, original_price, image, description, rating, reviews, badge, badge_color, stock, occasions, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.name, p.category, p.price, p.original_price, p.image, p.description,
      p.rating, p.reviews, p.badge, p.badge_color, p.stock, JSON.stringify(p.occasions), p.featured
    ]);
  }

  // 2. Seed Customers
  const initialCustomers = [
    { name: "Nguyễn Thị Mai", phone: "0901234567", email: "mai.nguyen@gmail.com", address: "123 Lê Lợi, Q1, TP.HCM", status: "VIP", total_spent: 4250000, orders_count: 5 },
    { name: "Trần Văn Hùng", phone: "0912345678", email: "hung.tran@yahoo.com", address: "45 Nguyễn Huệ, Q1, TP.HCM", status: "Thân thiết", total_spent: 2850000, orders_count: 3 },
    { name: "Lê Hoàng Yến", phone: "0923456789", email: "yen.le@outlook.com", address: "78 Hai Bà Trưng, Q3, TP.HCM", status: "Thường", total_spent: 950000, orders_count: 1 },
    { name: "Phạm Minh Tuấn", phone: "0934567890", email: "tuan.pham@company.vn", address: "12 Tôn Đức Thắng, Q1, TP.HCM", status: "VIP", total_spent: 6200000, orders_count: 6 },
    { name: "Võ Ngọc Bích", phone: "0945678901", email: "bich.vo@gmail.com", address: "89 Thảo Điền, TP. Thủ Đức", status: "Mới", total_spent: 450000, orders_count: 1 },
  ];

  for (const c of initialCustomers) {
    await pool.query(`
      INSERT INTO customers (name, phone, email, address, status, total_spent, orders_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [c.name, c.phone, c.email, c.address, c.status, c.total_spent, c.orders_count]);
  }

  // 3. Seed Orders
  const initialOrders = [
    {
      order_code: "ORD-2026-001",
      customer_name: "Nguyễn Thị Mai",
      customer_phone: "0901234567",
      customer_email: "mai.nguyen@gmail.com",
      delivery_date: "2026-10-18",
      delivery_address: "123 Lê Lợi, Q1, TP.HCM",
      occasion: "Sinh nhật",
      items_json: [{ id: 1, name: "Bó Hồng Tình Yêu", price: 450000, quantity: 1 }],
      total_amount: 450000,
      status: "Hoàn thành",
      payment_status: "Đã thanh toán",
      notes: "Thiệp chúc mừng sinh nhật tuổi 30 tràn ngập niềm vui và thành công.",
    },
    {
      order_code: "ORD-2026-002",
      customer_name: "Trần Văn Hùng",
      customer_phone: "0912345678",
      customer_email: "hung.tran@yahoo.com",
      delivery_date: "2026-10-19",
      delivery_address: "45 Nguyễn Huệ, Q1, TP.HCM",
      occasion: "Khai trương",
      items_json: [{ id: 2, name: "Lan Hồ Điệp Hoàng Gia", price: 850000, quantity: 2 }],
      total_amount: 1700000,
      status: "Đang xử lý",
      payment_status: "Đã cọc 50%",
      notes: "Giao trước 9h sáng khai trương chi nhánh công ty.",
    },
    {
      order_code: "ORD-2026-003",
      customer_name: "Lê Hoàng Yến",
      customer_phone: "0923456789",
      customer_email: "yen.le@outlook.com",
      delivery_date: "2026-10-20",
      delivery_address: "78 Hai Bà Trưng, Q3, TP.HCM",
      occasion: "Kỷ niệm",
      items_json: [{ id: 6, name: "Electro Bloom 3D Edition", price: 950000, quantity: 1 }],
      total_amount: 950000,
      status: "Chờ xác nhận",
      payment_status: "Chưa thanh toán",
      notes: "Cần gói phong cách Cyberpunk độc bản tặng sếp.",
    },
    {
      order_code: "ORD-2026-004",
      customer_name: "Phạm Minh Tuấn",
      customer_phone: "0934567890",
      customer_email: "tuan.pham@company.vn",
      delivery_date: "2026-10-21",
      delivery_address: "12 Tôn Đức Thắng, Q1, TP.HCM",
      occasion: "Sự kiện VIP",
      items_json: [
        { id: 7, name: "Foam Sunshine Euphoria", price: 1450000, quantity: 1 },
        { id: 8, name: "Velvet Dream Luxe", price: 1850000, quantity: 1 }
      ],
      total_amount: 3300000,
      status: "Đang xử lý",
      payment_status: "Đã thanh toán",
      notes: "Giao sảnh lễ tân khách sạn 5 sao.",
    }
  ];

  for (const o of initialOrders) {
    await pool.query(`
      INSERT INTO orders (order_code, customer_name, customer_phone, customer_email, delivery_date, delivery_address, occasion, items_json, total_amount, status, payment_status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      o.order_code, o.customer_name, o.customer_phone, o.customer_email,
      o.delivery_date, o.delivery_address, o.occasion, JSON.stringify(o.items_json),
      o.total_amount, o.status, o.payment_status, o.notes
    ]);
  }

  // 4. Seed Inventory
  const initialInventory = [
    { name: "Hoa hồng đỏ Ecuador", category: "Hoa tươi", quantity: 180, unit: "cành", min_stock: 50, price_per_unit: 28000, supplier: "Đà Lạt Farm Premium", last_restocked: "2026-10-14" },
    { name: "Lan hồ điệp tím loại 1", category: "Hoa tươi", quantity: 35, unit: "cây", min_stock: 15, price_per_unit: 185000, supplier: "Vườn Lan Bảo Lộc", last_restocked: "2026-10-12" },
    { name: "Cẩm tú cầu Đà Lạt", category: "Hoa tươi", quantity: 18, unit: "bông", min_stock: 20, price_per_unit: 35000, supplier: "HTX Hoa Vạn Thành", last_restocked: "2026-10-10" },
    { name: "Giấy gói Hologram 3D", category: "Phụ liệu", quantity: 240, unit: "cuộn", min_stock: 60, price_per_unit: 45000, supplier: "Bao Bì Nghệ Thuật HCM", last_restocked: "2026-10-15" },
    { name: "Ruy băng lụa tơ tằm", category: "Phụ liệu", quantity: 85, unit: "cuộn", min_stock: 30, price_per_unit: 38000, supplier: "Dệt Lụa Hà Đông", last_restocked: "2026-10-08" },
    { name: "Bình gốm tráng men mờ", category: "Bình/Chậu", quantity: 12, unit: "bình", min_stock: 15, price_per_unit: 140000, supplier: "Gốm Sứ Bát Tràng", last_restocked: "2026-10-05" },
    { name: "Mút xốp cắm hoa Oasis", category: "Phụ liệu", quantity: 95, unit: "viên", min_stock: 40, price_per_unit: 18000, supplier: "Oasis Floral VN", last_restocked: "2026-10-14" },
  ];

  for (const inv of initialInventory) {
    await pool.query(`
      INSERT INTO inventory (name, category, quantity, unit, min_stock, price_per_unit, supplier, last_restocked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      inv.name, inv.category, inv.quantity, inv.unit, inv.min_stock,
      inv.price_per_unit, inv.supplier, inv.last_restocked
    ]);
  }

  console.log('[TiDB/MySQL] Seeding completed! Database is ready.');
}

export default pool;
export { pool };
