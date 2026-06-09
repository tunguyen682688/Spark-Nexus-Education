# 🔐 Data Privacy & Log Masking Laws

Bảo vệ an toàn thông tin dữ liệu cá nhân của người học (**PII - Personally Identifiable Information**) không chỉ là một yêu cầu kỹ thuật mà còn là trách nhiệm đạo đức hàng đầu và nghĩa vụ tuân thủ pháp lý quốc tế bắt buộc tại **SparkNestEd**.

---

## 🗂️ 1. Danh Mục Dữ Liệu Cá Nhân Nhạy Cảm (PII Dictionary)

Mọi lập trình viên bắt buộc phải nắm rõ danh sách các trường thông tin nhạy cảm của dự án được phân loại dưới đây:

| Loại dữ liệu | Các trường cụ thể | Mức độ rủi ro | Quy tắc xử lý bắt buộc |
| :--- | :--- | :--- | :--- |
| **Identity PII** | Email, Số điện thoại, Họ và Tên | CAO | Tự động làm mờ (Masking) trong log hệ thống. |
| **Credentials** | Mật khẩu (Password), API Keys, JWT Tokens | CỰC CAO | **Tuyệt đối cấm** không cho phép ghi vào log. |
| **Financial PII** | Số thẻ tín dụng, Lịch sử hóa đơn chi tiết | CỰC CAO | Cấm lưu trữ trực tiếp (Ủy quyền hoàn toàn cho Stripe). |
| **Activity Logs** | Địa chỉ IP, Lịch sử ôn tập chi tiết | TRUNG BÌNH | Ẩn danh hóa (Anonymization) khi chạy các báo cáo thống kê. |

---

## 💻 2. Cài Đặt Bộ Lọc Làm Sạch Log Tự Động (Log Masking Engine)

Để chặn đứng việc vô tình in thông tin nhạy cảm ra các hệ thống lưu trữ log tập trung (như ElasticSearch, Loki), toàn bộ ghi chép log của Backend bắt buộc phải đi qua một bộ lọc làm sạch tự động sử dụng biểu thức chính quy (Regex):

```typescript
// packages/backend/infrastructure/logging/log-masking.processor.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogMaskingProcessor {
  // Định nghĩa các Regex bắt các mẫu thông tin nhạy cảm
  private readonly EMAIL_REGEX = /([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/g;
  private readonly PHONE_REGEX = /(?:\+84|0)(?:\d){9,10}\b/g;
  private readonly AUTH_HEADER_REGEX = /(Bearer\s)[a-zA-Z0-9\-\._~\+\/]+=*/g;

  /**
   * Quét và làm mờ tự động mọi PII trong chuỗi log thô hoặc đối tượng.
   */
  public mask(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
      return this.maskString(data);
    }

    if (typeof data === 'object') {
      // Đệ quy làm sạch sâu mọi thuộc tính trong JSON Object
      const sanitized = JSON.stringify(data, (key, value) => {
        // Cấm tuyệt đối in mật khẩu
        if (key.toLowerCase().includes('password')) return '********';
        if (key.toLowerCase().includes('token')) return '***masked_token***';
        if (key.toLowerCase().includes('apikey')) return '***masked_key***';
        
        if (typeof value === 'string') {
          return this.maskString(value);
        }
        return value;
      });
      
      return JSON.parse(sanitized);
    }

    return data;
  }

  private maskString(text: string): string {
    return text
      .replace(this.EMAIL_REGEX, (match, emailUser, emailDomain, tld) => {
        // Biến johndoe@example.com -> j***e@example.com
        return `${emailUser[0]}***${emailUser[emailUser.length - 1]}@${emailDomain}.${tld}`;
      })
      .replace(this.PHONE_REGEX, '0xxxxxxxxx')
      .replace(this.AUTH_HEADER_REGEX, '$1***masked_jwt***');
  }
}
```

---

## 🏛️ 3. Tiêu Chuẩn Tuân Thủ Pháp Lý Quốc Tế (GDPR & CCPA)

Hệ thống của SparkNestEd cam kết tuân thủ đúng các đặc tả của bộ luật bảo vệ dữ liệu châu Âu **GDPR** và bang California **CCPA**:

1.  **Quyền được lãng quên (Right to be Forgotten):** Khi người học thực hiện xóa tài khoản, hệ thống bắt buộc phải dọn dẹp sạch sẽ toàn bộ thông tin cá nhân và dữ liệu PII liên đới trong vòng 30 ngày (áp dụng qua luồng xử lý bất đồng bộ Event Broker dọn dẹp các Context).
2.  **Đồng ý rõ ràng (Consent Governance):** Client cấm sử dụng cơ chế tự động tích chọn đồng ý (Auto-check). Người học phải tự tay click xác nhận cho phép xử lý dữ liệu cá nhân khi tạo tài khoản.
