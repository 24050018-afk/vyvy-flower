/**
 * ============================================================
 * CSV EXPORT & AUTOMATIC DATA CLEANING (TIỀN XỬ LÝ DỮ LIỆU)
 * Chuẩn hóa và làm sạch toàn bộ dữ liệu trước khi xuất CSV cho Excel:
 * 1. Tiền tệ (Money): Làm sạch dấu chấm hàng nghìn, ký hiệu tiền để xuất dạng số nguyên thuần tính toán được.
 * 2. Số điện thoại (Phone): Chuẩn hóa đầu số, bảo toàn số 0 đầu trong Excel (không bị Excel tự xóa số 0).
 * 3. Văn bản (Text): Xóa khoảng trắng thừa, thẻ HTML, ký tự điều khiển, ngắt dòng.
 * 4. Ngày tháng (Date): Chuẩn hóa sang DD/MM/YYYY hoặc DD/MM/YYYY HH:mm của Việt Nam (không bị tràn ô ######).
 * 5. Mảng & Danh sách (List): Tự động bóc tách JSON và Array thành văn bản rõ ràng.
 * 6. Mã hóa UTF-8 BOM (\uFEFF): Tiếng Việt hiển thị chuẩn 100% không lỗi font trong Excel.
 * ============================================================
 */

/**
 * 1. Làm sạch văn bản: Loại bỏ khoảng trắng thừa, ký tự điều khiển, HTML tags và dấu xuống dòng
 */
export function cleanText(val, fallback = '—') {
  if (val === null || val === undefined) return fallback;
  const str = String(val)
    .replace(/<[^>]*>/g, '') // Xóa thẻ HTML
    .replace(/[\r\n\t]+/g, ' ') // Thay thế xuống dòng/tab bằng 1 khoảng cách
    .replace(/[\x00-\x1F\x7F]/g, '') // Xóa ký tự điều khiển không in được
    .replace(/\s+/g, ' ') // Gom các khoảng trắng liên tiếp
    .trim();
  return str.length > 0 ? str : fallback;
}

/**
 * 2. Làm sạch số tiền (Currency/Money):
 * Chuyển đổi mọi định dạng ("140.000", "1.680.000₫", "140,000", 140000) về số nguyên thuần tính toán được.
 */
export function cleanMoney(val, fallback = 0) {
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? fallback : Math.round(val);
  }
  if (!val) return fallback;
  // Bóc tách các ký hiệu tiền tệ và khoảng trắng
  let str = String(val).trim().replace(/₫|đ|VND|vnd|\$|,/g, '');
  // Xóa các dấu chấm phân cách hàng nghìn (ví dụ 140.000 -> 140000)
  str = str.replace(/\./g, '');
  const num = parseInt(str, 10);
  return isNaN(num) ? fallback : num;
}

/**
 * 3. Làm sạch số lượng, chỉ số (Number)
 */
export function cleanNumber(val, fallback = 0) {
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? fallback : val;
  }
  if (!val) return fallback;
  const cleaned = String(val).trim().replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? fallback : num;
}

/**
 * 4. Làm sạch số điện thoại:
 * - Chuẩn hóa định dạng (+84 hoặc 84 về đầu 0).
 * - Sử dụng công thức Excel text format ='="..."' để Excel không tự ý cắt bỏ số 0 ở đầu.
 */
export function cleanPhone(val, fallback = '—') {
  if (!val) return fallback;
  let p = String(val).replace(/[^0-9+]/g, '');
  if (p.startsWith('+84')) p = '0' + p.slice(3);
  else if (p.startsWith('84') && p.length > 9) p = '0' + p.slice(2);
  if (!p || p.length < 9) return cleanText(val, fallback);
  // Định dạng công thức text của Excel để bảo lưu số 0 đầu tiên
  return `="${p}"`;
}

/**
 * 5. Làm sạch Email: Trim, lowercase và xử lý placeholder ảo
 */
export function cleanEmail(val, fallback = '—') {
  if (!val) return fallback;
  const str = String(val).trim().toLowerCase();
  if (!str || str === 'null' || str === 'undefined') return fallback;
  if (str.startsWith('fb_') && str.endsWith('@facebook.com')) {
    return 'Liên kết Facebook (Chưa có email)';
  }
  if (str.includes('_user_') && str.endsWith('@gmail.com')) {
    return 'Chưa cập nhật email';
  }
  return str;
}

/**
 * 6. Làm sạch ngày tháng theo chuẩn Việt Nam (DD/MM/YYYY)
 */
export function cleanDate(dateStr, fallback = '—') {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return cleanText(dateStr, fallback);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * 7. Làm sạch thời gian đầy đủ (DD/MM/YYYY HH:mm)
 */
export function cleanDateTime(dateStr, fallback = '—') {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return cleanText(dateStr, fallback);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * 8. Làm sạch mảng & đối tượng danh sách:
 * Tự động parse JSON và chuyển mảng đối tượng thành chuỗi dễ đọc trong bảng tính Excel
 */
export function cleanList(val, fallback = '—') {
  if (!val) return fallback;
  let items = val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        items = JSON.parse(trimmed);
      } catch (e) {
        items = trimmed;
      }
    }
  }
  if (Array.isArray(items)) {
    if (!items.length) return fallback;
    return items.map(it => {
      if (typeof it === 'string') return cleanText(it);
      if (typeof it === 'object' && it !== null) {
        const name = it.name || it.title || it.productName || 'Sản phẩm';
        const qty = it.quantity || it.qty || 1;
        const price = it.price ? ` (${cleanMoney(it.price).toLocaleString('vi-VN')}₫)` : '';
        return `${name} (x${qty}${price})`;
      }
      return String(it);
    }).join('; ');
  }
  return cleanText(items, fallback);
}

/**
 * Tự động tiền xử lý giá trị từng ô trước khi đóng gói CSV:
 * - Bảo vệ số nguyên/số thực
 * - Bảo vệ công thức text Excel ="..."
 * - Escape dấu ngoặc kép an toàn
 */
function preprocessCell(val) {
  if (val === null || val === undefined) return '""';

  // 1. Nếu đã là công thức bảo toàn text của Excel (ví dụ ="0901234567")
  if (typeof val === 'string' && val.startsWith('="') && val.endsWith('"')) {
    return val;
  }

  // 2. Nếu là kiểu số (pure number): trả về số thuần không nháy kép để Excel tính toán được
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return '0';
    return String(val);
  }

  // 3. Nếu là boolean: chuyển sang Có / Không
  if (typeof val === 'boolean') {
    return `"${val ? 'Có' : 'Không'}"`;
  }

  // 4. Nếu là mảng hoặc đối tượng: tự động parse thành danh sách văn bản gọn gàng
  if (typeof val === 'object') {
    const listStr = cleanList(val, '—');
    return `"${listStr.replace(/"/g, '""')}"`;
  }

  const rawStr = String(val).trim();
  const str = cleanText(rawStr, '');

  if (!str) return '""';

  // 5. Tự động nhận diện chuỗi tiền tệ Việt Nam có dấu chấm nghìn (ví dụ "140.000", "1.680.000", "140.000₫", "10.800.000 VNĐ")
  // Chuyển hóa trực tiếp thành số nguyên thuần (140000, 1680000) để Excel không bị hiểu nhầm thành số thập phân 140
  const potentialMoney = str.replace(/[₫đVNĐvnd\s]/gi, '');
  if (/^-?\d{1,3}(\.\d{3})+$/.test(potentialMoney)) {
    const intVal = potentialMoney.replace(/\./g, '');
    return intVal;
  }

  // 6. Tự động nhận diện số điện thoại (ví dụ: "0901234567", "+84912345678", "038...")
  // Giữ nguyên số 0 ở đầu bằng công thức Excel ="..."
  const digitsOnly = str.replace(/[\s.-]/g, '');
  if (/^(\+84|84|0)(3|5|7|8|9)\d{8}$/.test(digitsOnly)) {
    return cleanPhone(str);
  }

  // 7. Tự động nhận diện chuỗi thời gian ISO (ví dụ: "2026-10-16T08:30:00.000Z" hoặc "2026-10-16")
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(str)) {
    if (str.includes('T')) {
      return `"${cleanDateTime(str)}"`;
    } else {
      return `"${cleanDate(str)}"`;
    }
  }

  // 8. Nếu là số nguyên hoặc số thập phân chuẩn (không phải chuỗi bắt đầu bằng 0 như "0123")
  if (/^-?([1-9]\d*|0)(\.\d+)?$/.test(str)) {
    return str;
  }

  // 9. Chuỗi văn bản thông thường: đóng nháy kép và escape nháy kép chuẩn RFC 4180
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Hàm xuất CSV chính có tích hợp TỰ ĐỘNG TIỀN XỬ LÝ & LÀM SẠCH DỮ LIỆU
 * 
 * @param {string} filename - Tên file tải về (ví dụ: 'Ton_Kho_VyVy.csv')
 * @param {Array<{ label: string, key: string | ((item: any) => any) }>} columns - Danh sách cấu hình cột
 * @param {Array<object>} data - Dữ liệu cần làm sạch và xuất
 */
export function exportToCsv(filename, columns, data) {
  if (!data || !data.length) {
    throw new Error('Không có dữ liệu nào trên trang để xuất file CSV!');
  }

  // Tiền xử lý dòng tiêu đề (Header row)
  const headerRow = columns.map(col => `"${cleanText(col.label).replace(/"/g, '""')}"`).join(',');

  // Tiền xử lý và làm sạch từng dòng dữ liệu (Data rows)
  const dataRows = data.map(item => {
    return columns.map(col => {
      let val;
      if (typeof col.key === 'function') {
        val = col.key(item);
      } else {
        val = item[col.key];
      }
      return preprocessCell(val);
    }).join(',');
  });

  // Gắn mã UTF-8 BOM (\uFEFF) đảm bảo Excel nhận diện đúng bộ mã Unicode Tiếng Việt
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const finalName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', finalName);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
