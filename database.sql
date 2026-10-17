-- =======================================================================
-- FILE DATABASE: vyvy_flower_db.sql
-- DỰ ÁN: WEBSITE SHOP HOA NGHỆ THUẬT VY VY FLOWER (CYBER FLORAL STUDIO)
-- HỆ QUẢN TRỊ: MySQL 8.0 / MySQL Workbench
-- =======================================================================
-- HƯỚNG DẪN SỬ DỤNG TRÊN MYSQL WORKBENCH:
-- 1. Mở MySQL Workbench, chọn kết nối của bạn (ví dụ: "web" hoặc "Local instance 3306")
-- 2. Vào menu File -> Open SQL Script... (hoặc nhấn phím tắt Ctrl + O)
-- 3. Chọn file này: database.sql
-- 4. Nhấn vào biểu tượng Tia Sét ⚡ (Execute) trên thanh công cụ để tạo toàn bộ Database & Dữ liệu
-- 5. Bấm nút Refresh ở mục SCHEMAS bên trái để thấy xuất hiện `vyvy_flower_db`
-- =======================================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU
CREATE DATABASE IF NOT EXISTS `vyvy_flower_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `vyvy_flower_db`;

-- Tạm thời tắt kiểm tra khóa ngoại khi khởi tạo lại bảng
SET FOREIGN_KEY_CHECKS = 0;

-- 2. XÓA BẢNG CŨ NẾU ĐÃ TỒN TẠI (ĐỂ RE-IMPORT SẠCH SẼ KHI CẦN)
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `admins`;

SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================================
-- BẢNG 1: products (Danh sách các mẫu hoa, giá bán, kho, trạng thái)
-- =======================================================================
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Tên mẫu hoa nghệ thuật',
  `category` VARCHAR(100) NOT NULL COMMENT 'Danh mục: Bó hoa, Giỏ hoa, Hoa chậu, Hoa cưới',
  `price` INT NOT NULL COMMENT 'Giá bán (VNĐ)',
  `original_price` INT NULL COMMENT 'Giá gốc trước khi giảm (VNĐ)',
  `image` TEXT NULL COMMENT 'Đường dẫn ảnh mẫu hoa',
  `description` TEXT NULL COMMENT 'Mô tả chi tiết cảm hứng cắm hoa',
  `rating` DECIMAL(2,1) DEFAULT 5.0 COMMENT 'Điểm đánh giá từ khách',
  `reviews` INT DEFAULT 0 COMMENT 'Số lượt đánh giá',
  `badge` VARCHAR(50) NULL COMMENT 'Nhãn: Bán chạy, Mới, Cao cấp, Độc bản...',
  `badge_color` VARCHAR(50) DEFAULT '#facc15' COMMENT 'Mã màu hiển thị nhãn',
  `stock` INT DEFAULT 10 COMMENT 'Số lượng sản phẩm còn trong kho',
  `occasions` JSON NULL COMMENT 'Dịp tặng dạng JSON array',
  `featured` TINYINT(1) DEFAULT 0 COMMENT '1: Nổi bật trang chủ, 0: Bình thường',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- BẢNG 2: customers (Quản lý khách hàng, tài khoản đăng nhập SĐT/GG/FB)
-- =======================================================================
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Họ tên khách hàng',
  `phone` VARCHAR(50) UNIQUE NOT NULL COMMENT 'Số điện thoại liên lạc / Đăng nhập',
  `password` VARCHAR(255) NULL COMMENT 'Mật khẩu đăng nhập',
  `auth_provider` VARCHAR(50) DEFAULT 'phone' COMMENT 'Nguồn: phone, google, facebook',
  `email` VARCHAR(255) NULL COMMENT 'Email khách hàng',
  `address` TEXT NULL COMMENT 'Địa chỉ giao hoa mặc định',
  `status` VARCHAR(50) DEFAULT 'Mới' COMMENT 'Hạng: Mới, Thường, Thân thiết, VIP',
  `total_spent` INT DEFAULT 0 COMMENT 'Tổng số tiền đã chi tiêu (VNĐ)',
  `orders_count` INT DEFAULT 0 COMMENT 'Tổng số đơn hàng đã đặt',
  `avatar` TEXT NULL COMMENT 'Ảnh đại diện',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- BẢNG 3: orders (Đơn đặt hàng hoa từ website với tiến trình tuần tự)
-- =======================================================================
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Mã đơn hàng, ví dụ: ORD-2026-001',
  `customer_name` VARCHAR(255) NOT NULL COMMENT 'Người nhận hoa',
  `customer_phone` VARCHAR(50) NOT NULL COMMENT 'SĐT người nhận',
  `customer_email` VARCHAR(255) NULL COMMENT 'Email người đặt',
  `delivery_date` DATE NULL COMMENT 'Ngày hẹn giao hoa',
  `delivery_address` TEXT NULL COMMENT 'Địa chỉ giao hoa',
  `occasion` VARCHAR(100) NULL COMMENT 'Dịp tặng hoa',
  `items_json` JSON NOT NULL COMMENT 'Chi tiết các bó hoa đặt trong đơn',
  `total_amount` INT NOT NULL COMMENT 'Tổng giá trị đơn hàng (VNĐ)',
  `status` VARCHAR(50) DEFAULT 'Chờ xác nhận' COMMENT 'Quy trình tuần tự: Chờ xác nhận -> Đã xác nhận -> Đang cắm hoa -> Đang giao hàng -> Hoàn thành (hoặc Đã hủy)',
  `payment_status` VARCHAR(50) DEFAULT 'Chưa thanh toán' COMMENT 'Chưa thanh toán, Đã cọc 50%, Đã thanh toán',
  `notes` TEXT NULL COMMENT 'Lời nhắn thiệp đính kèm bó hoa',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- BẢNG 4: inventory (Quản lý nguyên vật liệu hoa tươi & phụ liệu shop)
-- =======================================================================
CREATE TABLE `inventory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Tên cành hoa tươi hoặc phụ liệu cắm',
  `category` VARCHAR(100) NOT NULL COMMENT 'Hoa tươi, Bình/Chậu, Phụ liệu, Ruy băng',
  `quantity` INT NOT NULL COMMENT 'Số lượng thực tế trong kho',
  `unit` VARCHAR(50) NOT NULL COMMENT 'Đơn vị tính: cành, cây, bông, bình, cuộn...',
  `min_stock` INT NOT NULL COMMENT 'Mức cảnh báo tồn kho tối thiểu',
  `price_per_unit` INT NOT NULL COMMENT 'Giá nhập mỗi đơn vị (VNĐ)',
  `supplier` VARCHAR(255) NULL COMMENT 'Nhà cung cấp',
  `last_restocked` DATE NULL COMMENT 'Ngày nhập kho gần nhất',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- BẢNG 5: admins (Tài khoản quản trị viên website)
-- =======================================================================
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Tên đăng nhập',
  `password` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu',
  `display_name` VARCHAR(255) NULL COMMENT 'Tên hiển thị người quản lý',
  `role` VARCHAR(50) DEFAULT 'admin' COMMENT 'Vai trò: admin, superadmin, florist',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- BẢNG 6: notifications (Thông báo đơn hàng mới gửi tức thì về Admin)
-- =======================================================================
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(50) DEFAULT 'new_order' COMMENT 'Loại: new_order, alert',
  `title` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề thông báo',
  `message` TEXT NOT NULL COMMENT 'Nội dung chi tiết thông báo',
  `order_id` INT NULL COMMENT 'ID đơn hàng liên quan',
  `order_code` VARCHAR(100) NULL COMMENT 'Mã đơn hàng liên quan',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '0: Chưa đọc, 1: Đã đọc',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================================
-- NẠP DỮ LIỆU MẪU THỰC TẾ CHO SHOP VY VY FLOWER
-- =======================================================================

-- 1. NẠP TÀI KHOẢN ADMIN (Đăng nhập tại /admin/login)
INSERT INTO `admins` (`username`, `password`, `display_name`, `role`) VALUES
('admin', 'bloom2026', 'Vy Vy Master Florist', 'superadmin');

-- 2. NẠP DANH SÁCH MẪU HOA CAO CẤP
INSERT INTO `products` (`name`, `category`, `price`, `original_price`, `image`, `description`, `rating`, `reviews`, `badge`, `badge_color`, `stock`, `occasions`, `featured`) VALUES
(
  'Bó Hồng Tình Yêu',
  'Bó hoa',
  450000,
  550000,
  '/images/product_rose.jpg',
  'Bó hoa hồng đỏ và hồng phấn cao cấp, được trang trí tinh tế với ruy băng lụa sang trọng. Phù hợp cho lễ kỷ niệm, tình nhân.',
  4.9,
  128,
  'Bán chạy',
  '#ff4757',
  15,
  '["Tình nhân", "Kỷ niệm", "Sinh nhật"]',
  1
),
(
  'Lan Hồ Điệp Hoàng Gia',
  'Hoa chậu',
  850000,
  1000000,
  '/images/product_orchid.jpg',
  'Lan hồ điệp tím và trắng trong bình thủy tinh hiện đại. Biểu tượng của sự thanh lịch và trường tồn.',
  4.8,
  89,
  'Cao cấp',
  '#8e44ad',
  8,
  '["Khai trương", "Tặng sếp", "Lễ tân"]',
  1
),
(
  'Bó Hoa Mùa Xuân',
  'Bó hoa',
  380000,
  420000,
  '/images/product_mixed.jpg',
  'Bó hoa hỗn hợp đầy màu sắc với mẫu đơn, lily, ranunculus. Tươi vui, rực rỡ như mùa xuân.',
  4.7,
  203,
  'Mới',
  '#2ecc71',
  22,
  '["Sinh nhật", "Chúc mừng", "Khai trương"]',
  1
),
(
  'Giỏ Hoa Sen Đỏ Hoàng Triều',
  'Giỏ hoa',
  520000,
  600000,
  '/images/hero_banner.jpg',
  'Giỏ hoa sang trọng với hoa sen đỏ, hoa loa kèn trắng và lá xanh tươi mát. Thích hợp làm quà tặng doanh nghiệp.',
  4.6,
  67,
  'Bespoke',
  '#f59e0b',
  12,
  '["Doanh nghiệp", "Khai trương", "Tri ân"]',
  1
),
(
  'Bó Hoa Cưới Cẩm Tú Cầu',
  'Hoa cưới',
  950000,
  1200000,
  '/images/spheres_purple.jpg',
  'Bó hoa cưới cầm tay cô dâu với cẩm tú cầu xanh pastel, hồng trắng David Austin, phủ sương tinh tế.',
  5.0,
  45,
  'Độc bản',
  '#c084fc',
  6,
  '["Hoa cưới", "Đính hôn"]',
  1
),
(
  'Electro Bloom 3D Edition',
  'Bó hoa',
  950000,
  1100000,
  '/images/spheres_green.jpg',
  'Tác phẩm hoa nghệ thuật kết hợp lan Vanda xanh, lá cọ nhiệt đới và phong cách Cyberpunk 3D đương đại.',
  4.9,
  78,
  'Signature',
  '#a3e635',
  9,
  '["Sinh nhật", "Triển lãm", "Kỷ niệm"]',
  1
),
(
  'Foam Sunshine Euphoria',
  'Hoa chậu',
  1450000,
  1650000,
  '/images/spheres_yellow.jpg',
  'Hoa hồng sa mạc vàng hoàng kim cắm bình gốm nghệ thuật, toát lên năng lượng thịnh vượng rực rỡ.',
  5.0,
  92,
  'Prestige',
  '#facc15',
  7,
  '["Khai trương", "Tặng sếp", "Tân gia"]',
  1
),
(
  'Velvet Dream Luxe',
  'Giỏ hoa',
  1850000,
  2100000,
  '/images/spheres_purple.jpg',
  'Cẩm tú cầu tím nhung huyền thoại phối cùng phi yến, thạch thảo và cành khô nghệ thuật đương đại.',
  4.9,
  110,
  'Limited',
  '#ec4899',
  5,
  '["Kỷ niệm", "VIP Event", "Tình nhân"]',
  1
);

-- 3. NẠP DANH SÁCH KHÁCH HÀNG (Mật khẩu mặc định: 123456)
INSERT INTO `customers` (`name`, `phone`, `password`, `auth_provider`, `email`, `address`, `status`, `total_spent`, `orders_count`) VALUES
('Nguyễn Thị Mai', '0901234567', '123456', 'phone', 'mai.nguyen@gmail.com', '123 Lê Lợi, Q1, TP.HCM', 'VIP', 4250000, 5),
('Trần Văn Hùng', '0912345678', '123456', 'phone', 'hung.tran@yahoo.com', '45 Nguyễn Huệ, Q1, TP.HCM', 'Thân thiết', 2850000, 3),
('Lê Hoàng Yến', '0923456789', '123456', 'phone', 'yen.le@outlook.com', '78 Hai Bà Trưng, Q3, TP.HCM', 'Thường', 950000, 1),
('Phạm Minh Tuấn', '0934567890', '123456', 'phone', 'tuan.pham@company.vn', '12 Tôn Đức Thắng, Q1, TP.HCM', 'VIP', 6200000, 6),
('Võ Ngọc Bích', '0945678901', '123456', 'phone', 'bich.vo@gmail.com', '89 Thảo Điền, TP. Thủ Đức', 'Mới', 450000, 1);

-- 4. NẠP ĐƠN ĐẶT HÀNG THỰC TẾ
INSERT INTO `orders` (`order_code`, `customer_name`, `customer_phone`, `customer_email`, `delivery_date`, `delivery_address`, `occasion`, `items_json`, `total_amount`, `status`, `payment_status`, `notes`) VALUES
(
  'ORD-2026-001',
  'Nguyễn Thị Mai',
  '0901234567',
  'mai.nguyen@gmail.com',
  '2026-10-18',
  '123 Lê Lợi, Q1, TP.HCM',
  'Sinh nhật',
  '[{"id": 1, "name": "Bó Hồng Tình Yêu", "price": 450000, "quantity": 1}]',
  450000,
  'Hoàn thành',
  'Đã thanh toán',
  'Thiệp chúc mừng sinh nhật tuổi 30 tràn ngập niềm vui và thành công.'
),
(
  'ORD-2026-002',
  'Trần Văn Hùng',
  '0912345678',
  'hung.tran@yahoo.com',
  '2026-10-19',
  '45 Nguyễn Huệ, Q1, TP.HCM',
  'Khai trương',
  '[{"id": 2, "name": "Lan Hồ Điệp Hoàng Gia", "price": 850000, "quantity": 2}]',
  1700000,
  'Đang xử lý',
  'Đã cọc 50%',
  'Giao trước 9h sáng khai trương chi nhánh công ty.'
),
(
  'ORD-2026-003',
  'Lê Hoàng Yến',
  '0923456789',
  'yen.le@outlook.com',
  '2026-10-20',
  '78 Hai Bà Trưng, Q3, TP.HCM',
  'Kỷ niệm',
  '[{"id": 6, "name": "Electro Bloom 3D Edition", "price": 950000, "quantity": 1}]',
  950000,
  'Chờ xác nhận',
  'Chưa thanh toán',
  'Cần gói phong cách Cyberpunk độc bản tặng sếp.'
),
(
  'ORD-2026-004',
  'Phạm Minh Tuấn',
  '0934567890',
  'tuan.pham@company.vn',
  '2026-10-21',
  '12 Tôn Đức Thắng, Q1, TP.HCM',
  'Sự kiện VIP',
  '[{"id": 7, "name": "Foam Sunshine Euphoria", "price": 1450000, "quantity": 1}, {"id": 8, "name": "Velvet Dream Luxe", "price": 1850000, "quantity": 1}]',
  3300000,
  'Đang xử lý',
  'Đã thanh toán',
  'Giao sảnh lễ tân khách sạn 5 sao.'
);

-- 5. NẠP KHO NGUYÊN VẬT LIỆU CẮM HOA
INSERT INTO `inventory` (`name`, `category`, `quantity`, `unit`, `min_stock`, `price_per_unit`, `supplier`, `last_restocked`) VALUES
('Hoa hồng đỏ Ecuador', 'Hoa tươi', 180, 'cành', 50, 28000, 'Đà Lạt Farm Premium', '2026-10-14'),
('Lan hồ điệp tím loại 1', 'Hoa tươi', 35, 'cây', 15, 185000, 'Vườn Lan Bảo Lộc', '2026-10-12'),
('Cẩm tú cầu Đà Lạt', 'Hoa tươi', 18, 'bông', 20, 35000, 'HTX Hoa Vạn Thành', '2026-10-10'),
('Giấy gói Hologram 3D', 'Phụ liệu', 240, 'cuộn', 60, 45000, 'Bao Bì Nghệ Thuật HCM', '2026-10-15'),
('Ruy băng lụa tơ tằm', 'Phụ liệu', 85, 'cuộn', 30, 38000, 'Dệt Lụa Hà Đông', '2026-10-08'),
('Bình gốm tráng men mờ', 'Bình/Chậu', 12, 'bình', 15, 140000, 'Gốm Sứ Bát Tràng', '2026-10-05'),
('Mút xốp cắm hoa Oasis', 'Phụ liệu', 95, 'viên', 40, 18000, 'Oasis Floral VN', '2026-10-14');

-- 6. NẠP THÔNG BÁO MẪU CHO ADMIN
INSERT INTO `notifications` (`type`, `title`, `message`, `order_id`, `order_code`, `is_read`) VALUES
('new_order', 'Đơn hoa mới #ORD-2026-003', 'Khách hàng Lê Hoàng Yến vừa đặt bó Electro Bloom 3D Edition (950.000₫)', 3, 'ORD-2026-003', 0),
('new_order', 'Đơn hoa mới #ORD-2026-004', 'Khách hàng Phạm Minh Tuấn vừa đặt 2 bó hoa cao cấp (3.300.000₫)', 4, 'ORD-2026-004', 0);

-- =======================================================================
-- KIỂM TRA NHANH KẾT QUẢ IMPORT
-- =======================================================================
SELECT 'Số mẫu hoa:' AS info, COUNT(*) AS total FROM `products`
UNION ALL
SELECT 'Số khách hàng:' AS info, COUNT(*) AS total FROM `customers`
UNION ALL
SELECT 'Số đơn hàng:' AS info, COUNT(*) AS total FROM `orders`
UNION ALL
SELECT 'Kho phụ liệu:' AS info, COUNT(*) AS total FROM `inventory`
UNION ALL
SELECT 'Thông báo mới:' AS info, COUNT(*) AS total FROM `notifications`;

