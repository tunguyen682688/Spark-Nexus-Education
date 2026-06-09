# 📈 Logging Taxonomy & Structured JSON Law

Tài liệu quy định tiêu chuẩn thiết kế cấu trúc dữ liệu ghi nhận nhật ký hệ thống (**Logging**) trong toàn bộ các cấu phần phần mềm của hệ sinh thái **SparkNestEd**. 

Trên môi trường Production phân tán, việc sử dụng các dòng log chữ trần trụi (Plain Text) hoàn toàn vô giá trị do các máy chủ phân tích tự động (ElasticSearch, Loki) không thể bóc tách cấu trúc để tìm kiếm hiệu quả. Log bắt buộc phải viết dưới dạng **JSON cấu trúc (Structured JSON Log)**.

---

## 📊 1. Bảng Định Nghĩa Cấu Trúc JSON Log Schema

Mỗi dòng log xuất ra từ mã nguồn ứng dụng bắt buộc phải tuân thủ đúng định dạng JSON có cấu trúc chứa đầy đủ các trường siêu dữ liệu (Metadata) dưới đây:

| Thuộc tính JSON Key | Kiểu Dữ Liệu | Vai trò & Mục đích sử dụng | Ví dụ thực tế |
| :--- | :--- | :--- | :--- |
| **`timestamp`** | ISO-8601 String | Ghi nhận thời gian chính xác (UTC offset 0) xảy ra sự kiện. | `"2026-05-24T06:40:00.000Z"` |
| **`level`** | Enum string | Phân cấp sự cố hệ thống (`INFO`, `WARN`, `ERROR`...). | `"ERROR"` |
| **`traceId`** | UUID / String | Mã liên kết Trace ID toàn cuộc phục vụ truy vết phân tán. | `"req-1a2b3c-4d5e"` |
| **`spanId`** | UUID / String | Mã định danh Span ID cho luồng con cụ thể. | `"span-550e84"` |
| **`context`** | String | Vị trí phát sinh log (Tên Class, Service hoặc Controller). | `"VocabularySetService"` |
| **`message`** | String | Nội dung log ngắn gọn, mô tả rõ hành vi nghiệp vụ/lỗi. | `"Failed to update database record."` |
| **`error`** | Object | Chứa thông tin Stack Trace chi tiết (chỉ ghi nhận khi Level = ERROR). | `{"message": "...", "stack": "..."}` |
| **`userId`** | String | Mã định danh người dùng kích hoạt request (nếu có). | `"google-oauth2\|11228249"` |
| **`meta`** | Object | Các thông tin nghiệp vụ bổ trợ để lọc (ví dụ: `setId`, `itemsCount`). | `{"setId": "uuid-123", "count": 10}` |

---

## 🏛️ 2. Quy Chuẩn Sử Dụng Log Levels Nghiêm Ngặt

*   `FATAL`: Lỗi cực kỳ nghiêm trọng phá hủy cấu phần lõi hoặc làm sập toàn bộ hệ thống (ví dụ: mất kết nối Database chính, cạn kiệt ổ cứng). Kích hoạt báo động PagerDuty tự động lập tức.
*   `ERROR`: Lỗi phát sinh trong một luồng request cụ thể làm gián đoạn nghiệp vụ của người dùng nhưng hệ thống tổng thể vẫn hoạt động (ví dụ: lỗi gọi API Stripe thất bại, lỗi ném Custom Exception).
*   `WARN`: Các sự kiện bất thường không gây lỗi hệ thống nhưng cần lưu ý đề phòng sự cố (ví dụ: đăng nhập sai mật khẩu, tốc độ phản hồi API vượt quá 1.5 giây, cache miss liên tục).
*   `INFO`: Ghi nhận các tiến trình vận hành bình thường có giá trị theo dõi (ví dụ: ứng dụng khởi chạy thành công, kết thúc import tệp từ vựng chạy nền).
*   `DEBUG`: Chỉ ghi nhận các log phục vụ phân tích sâu luồng chạy trong quá trình Dev. **Cấm tuyệt đối cho phép in log DEBUG trên môi trường Production.**

---

## 💻 3. Cài Đặt Winston Logger Động Trong NestJS

Để đảm bảo hiệu năng tối đa trên Production nhưng vẫn giữ trải nghiệm phát triển mượt mà, trực quan cho lập trình viên trên máy local:

*   **Production:** Log định dạng JSON structured trần trụi cực nhanh gửi trực tiếp ra stdout/stderr để Docker/K8s collector thu thập.
*   **Development:** Log định dạng màu sắc rực rỡ, phân cấp dễ nhìn để lập trình viên đọc hiểu trực tiếp.

```typescript
// packages/backend/infrastructure/logging/winston-logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const NestJSLoggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        isProduction
          ? winston.format.json() // Production: Xuất JSON thô chuẩn hóa
          : winston.format.combine(
              winston.format.colorize(), // Local: Xuất màu sắc rực rỡ
              winston.format.printf(({ timestamp, level, message, context, traceId }) => {
                const traceStr = traceId ? ` [Trace: ${traceId}]` : '';
                return `${timestamp} [${level}] [${context || 'App'}]${traceStr}: ${message}`;
              })
            )
      ),
    }),
  ],
});
```
