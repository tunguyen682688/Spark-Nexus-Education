# 🔌 Application Resilience & Defense Matrix

Hệ thống Backend của **SparkNestEd** phải được thiết kế để tự bảo vệ trước các lỗi dây chuyền (Cascading Failures) và duy trì sự ổn định của hệ thống ngay cả khi các dịch vụ bên thứ ba (Third-party APIs) hoặc cơ sở dữ liệu gặp sự cố. Chúng tôi áp dụng triệt để bộ khung phòng thủ dưới đây.

---

## 🧭 1. Mô Hình 3 Trạng Thái Của Cầu Chì (Circuit Breaker)

Cơ chế cầu chì theo dõi các lỗi kết nối đến các dịch vụ bên ngoài và hoạt động theo 3 trạng thái nghiêm ngặt:

```text
       ┌──────────────────────────────────────────────┐
       │             1. CLOSED (Đóng mạch)            │◀───┐
       │ - Mọi request đi qua bình thường.            │    │ (Gọi thành công liên tiếp)
       │ - Theo dõi tỷ lệ lỗi (Error Rate).           │    │
       └──────────────────────┬───────────────────────┘    │
                              │                            │
                              │ (Tỷ lệ lỗi > 50% / 10s)     │
                              ▼                            │
       ┌──────────────────────────────────────────────┐    │
       │              2. OPEN (Ngắt mạch)             │    │
       │ - Chặn đứng toàn bộ request đến dịch vụ lỗi. │    │
       │ - Trả về kết quả dự phòng (Fallback) tức thì.│    │
       └──────────────────────┬───────────────────────┘    │
                              │                            │
                              │ (Sau thời gian nguội 10s)  │
                              ▼                            │
       ┌──────────────────────────────────────────────┐    │
       │            3. HALF-OPEN (Nửa đóng)           │────┘
       │ - Thử nghiệm gửi một vài request nhỏ.        │
       │ - Thất bại ➡️ OPEN lại; Thành công ➡️ CLOSED. │
       └──────────────────────────────────────────────┘
```

---

## 💻 2. Ví Dụ Triển Khai Thực Tế Với Thư Viện `opossum`

Mọi cuộc gọi sang dịch vụ ngoài (như API kiểm tra từ điển Oxford, cổng thanh toán Stripe) bắt buộc phải được bọc trong Circuit Breaker:

```typescript
// packages/backend/infrastructure/resilience/dictionary-breaker.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import axios from 'axios';

@Injectable()
export class DictionaryBreakerService {
  private readonly logger = new Logger(DictionaryBreakerService.name);
  private breaker: CircuitBreaker;

  constructor() {
    const options = {
      timeout: 3000,          // Kích hoạt Timeout nếu API ngoài ko phản hồi sau 3s
      errorThresholdPercentage: 50, // Ngắt mạch nếu tỷ lệ gọi lỗi vượt quá 50%
      resetTimeout: 10000     // Thời gian chờ nguội (10s) trước khi thử Half-Open
    };

    // Bọc hàm gọi API ngoài vào Circuit Breaker
    this.breaker = new CircuitBreaker(this.fetchExternalDictionary, options);
    
    // Đăng ký cơ chế Fallback (Kết quả dự phòng khi mạch hở)
    this.breaker.fallback((word: string) => this.fallbackDictionaryQuery(word));

    // Đăng ký giám sát trạng thái cầu chì
    this.breaker.on('open', () => this.logger.warn('Circuit Breaker is now OPEN for Dictionary API'));
    this.breaker.on('close', () => this.logger.log('Circuit Breaker is now CLOSED for Dictionary API'));
    this.breaker.on('halfOpen', () => this.logger.log('Circuit Breaker is now HALF-OPEN for Dictionary API'));
  }

  public async queryWord(word: string): Promise<any> {
    return this.breaker.fire(word);
  }

  // Hàm gọi API thực tế
  private async fetchExternalDictionary(word: string): Promise<any> {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.data;
  }

  // Hàm dự phòng (Fallback) khi dịch vụ ngoài sập
  private fallbackDictionaryQuery(word: string): any {
    this.logger.warn(`Fallback triggered for word: ${word}. Returning minimal schema.`);
    return {
      word: word,
      phonetic: '/.../',
      meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'Dữ liệu tạm thời thời điểm offline.' }] }]
    };
  }
}
```

---

## 🔄 3. Chiến Lược Retry Hợp Lý (Exponential Backoff & Jitter)

> [!CAUTION]
> **Tấn công tự phát (Thảm họa Thundering Herd):** Việc cấu hình hệ thống tự động gọi lại (Retry) liên tục các API sập với khoảng thời gian cố định (ví dụ cứ 1s gọi lại) sẽ tạo ra một cuộc tấn công từ chối dịch vụ (DDoS) tự phát của hệ thống chúng ta vào chính server của đối tác, khiến họ không có cơ hội phục hồi.

Khi gọi API ngoài bị lỗi do chập chờn mạng, bắt buộc phải áp dụng thuật toán **Thử lại có giãn cách lũy thừa kèm nhiễu ngẫu nhiên (Exponential Backoff & Jitter)**:

$$\text{Delay} = \text{Minimum\_Delay} \times 2^{\text{Attempt}} + \text{Jitter}$$

*   **Giãn cách lũy thừa (Exponential Backoff):** Lần thử 1 cách 1s, lần 2 cách 2s, lần 3 cách 4s, lần 4 cách 8s...
*   **Nhiễu ngẫu nhiên (Jitter):** Cộng/trừ thêm một số mili-giây ngẫu nhiên để tránh việc toàn bộ các máy chủ khách hàng cùng gửi yêu cầu gọi lại vào đúng một thời điểm.

---

## 🏛️ 4. Mô Hình Vách Ngăn Thủy Thủ (Bulkhead Pattern)

Để bảo vệ hạ tầng máy chủ NestJS không bị sập dây chuyền khi một thành phần bị quá tải, chúng tôi áp dụng nguyên lý **Bulkhead (Vách ngăn tàu thủy)**:

*   **Cô lập nhóm tài nguyên (Resource Isolation):**
    *   Phân tách rõ ràng các nhóm kết nối cơ sở dữ liệu (Database Connection Pools) riêng biệt cho phân khu nghiệp vụ Từ vựng (Vocabulary) và phân khu Đấu trường (Quiz).
    *   Một lỗi rò rỉ kết nối (Connection Leak) ở phân khu Đấu trường chỉ làm sập phân khu đó, các vách ngăn tài nguyên giữ cho phân khu học từ vựng vẫn hoạt động bình thường 100%.
*   **Giới hạn số luồng xử lý đồng thời:** Sử dụng hàng đợi BullMQ để khống chế nghiêm ngặt số lượng Worker chạy ngầm đồng thời xử lý các tác vụ nặng (nhập dữ liệu), không cho phép chúng chiếm dụng toàn bộ bộ nhớ và luồng CPU của ứng dụng chính.
