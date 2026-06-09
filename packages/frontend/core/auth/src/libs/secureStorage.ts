import { AES, enc } from 'crypto-js';

// Cache cho encryption key để tránh tính toán lại nhiều lần
let encryptionKeyCache: string | null = null;

/**
 * Tạo khóa mã hóa dựa trên thông tin trình duyệt và nguồn gốc
 * Sử dụng caching để tối ưu hiệu suất
 */
const getEncryptionKey = (): string => {
  if (encryptionKeyCache) {
    return encryptionKeyCache;
  }
  
  // Tạo khóa duy nhất dựa trên fingerprint trình duyệt và nguồn gốc
  const browserInfo = [
    navigator.userAgent,
    navigator.language,
    window.screen.colorDepth,
    window.screen.width,
    window.screen.height,
    window.location.origin
  ].join('|');
  
  encryptionKeyCache = browserInfo;
  return encryptionKeyCache;
};

// Prefix cho các khóa lưu trữ để dễ quản lý
const STORAGE_PREFIX = 'reelnet_';

/**
 * Secure storage utility cho việc xử lý dữ liệu nhạy cảm như token xác thực
 * Sử dụng mã hóa AES trước khi lưu vào localStorage
 */
export const secureStorage = {
  /**
   * Lưu trữ một mục đã mã hóa trong localStorage
   * @param key - Khóa lưu trữ
   * @param value - Giá trị cần lưu trữ
   */
  setItem(key: string, value: string): void {
    try {
      const prefixedKey = `${STORAGE_PREFIX}${key}`;
      const encryptionKey = getEncryptionKey();
      const encryptedValue = AES.encrypt(value, encryptionKey).toString();
      localStorage.setItem(prefixedKey, encryptedValue);
    } catch (error) {
      console.error('Error encrypting and storing data:', error);
      // Fallback to unencrypted storage only in case of encryption failure
      const prefixedKey = `${STORAGE_PREFIX}${key}`;
      localStorage.setItem(prefixedKey, value);
    }
  },

  /**
   * Lấy và giải mã một mục từ localStorage
   * @param key - Khóa lưu trữ
   * @returns Giá trị đã giải mã hoặc null nếu không tìm thấy
   */
  getItem(key: string): string | null {
    try {
      const prefixedKey = `${STORAGE_PREFIX}${key}`;
      const encryptedValue = localStorage.getItem(prefixedKey);
      if (!encryptedValue) return null;
      
      const encryptionKey = getEncryptionKey();
      const decryptedBytes = AES.decrypt(encryptedValue, encryptionKey);
      const decryptedValue = decryptedBytes.toString(enc.Utf8);
      
      // Kiểm tra xem giải mã có thành công không
      if (!decryptedValue) {
        throw new Error('Decryption resulted in empty string');
      }
      
      return decryptedValue;
    } catch (error) {
      console.error('Error decrypting data:', error);
      // Nếu giải mã thất bại, thử trả về giá trị gốc làm fallback
      const prefixedKey = `${STORAGE_PREFIX}${key}`;
      return localStorage.getItem(prefixedKey);
    }
  },

  /**
   * Xóa một mục khỏi localStorage
   * @param key - Khóa lưu trữ cần xóa
   */
  removeItem(key: string): void {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(prefixedKey);
  },

  /**
   * Xóa tất cả các mục của ứng dụng khỏi localStorage
   */
  clear(): void {
    // Chỉ xóa các mục có prefix của ứng dụng
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },
  
  /**
   * Kiểm tra xem một khóa có tồn tại trong localStorage không
   * @param key - Khóa cần kiểm tra
   * @returns true nếu khóa tồn tại, ngược lại là false
   */
  hasItem(key: string): boolean {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    return localStorage.getItem(prefixedKey) !== null;
  }
};

// Thêm event listener để xử lý lưu trữ trên nhiều tab/cửa sổ
window.addEventListener('storage', (event) => {
  // Nếu tab khác xóa token xác thực, đồng bộ hóa đăng xuất trên tất cả các tab
  if (event.key?.startsWith(STORAGE_PREFIX) && event.key?.includes('auth_') && event.newValue === null) {
    // Gửi một sự kiện tùy chỉnh mà hệ thống xác thực có thể lắng nghe
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: { action: 'logout' } }));
  }
}); 