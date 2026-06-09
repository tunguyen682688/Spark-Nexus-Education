# 🛡️ Stream Normalization Rules

Tài liệu quy định các quy chuẩn thiết lập, quản trị vòng đời và kiểm soát lỗi đối với các luồng truyền tải dữ liệu liên tục (**Streams / Event Events / WebSockets**) và hàng đợi xử lý bất đồng bộ (**BullMQ Workers**) trong toàn bộ hệ sinh thái **SparkNestEd**.

---

## 🎨 1. Phòng Chống Rò Rỉ Bộ Nhớ Frontend (React & RxJS Unsubscribe)

> [!CAUTION]
> **Thảm họa rò rỉ bộ nhớ (Memory Leak):** Việc đăng ký lắng nghe một luồng dữ liệu (Websocket, SSE, RxJS Subject) bên trong một React Component mà quên không hủy đăng ký (Unsubscribe) khi component đó bị tắt (Unmounted) sẽ giữ cho đối tượng component đó tồn tại mãi trong bộ nhớ RAM, gây chậm đơ trình duyệt sau một thời gian sử dụng.

### Quy chuẩn Giải Phóng Vòng Đời Luồng Dữ Liệu:

#### 1. Sử dụng hàm dọn dẹp (Cleanup Function) trong `useEffect`:
Mọi kết nối mạng liên tục bắt buộc phải trả về một hàm hủy đăng ký trong khối cleanup của React:

```tsx
// packages/frontend/feature/vocabulary/src/lib/components/VocabularyImportTracker.tsx
import { useEffect, useState } from 'react';
import { vocabularyApi } from '../api/vocabulary.api';

export function VocabularyImportTracker({ setId }: { setId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Khởi tạo bộ kiểm soát hủy luồng API
    const abortController = new AbortController();

    // Kết nối đến luồng Server-Sent Events (SSE) theo dõi tiến độ import
    const eventSource = new EventSource(`/api/v1/vocabulary-sets/${setId}/import-stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.percentage);
      if (data.percentage === 100) eventSource.close();
    };

    // BẮT BUỘC: Trả về hàm dọn dẹp giải phóng kết nối khi component bị unmount
    return () => {
      eventSource.close();
      abortController.abort(); // Hủy request HTTP đang chạy dở
    };
  }, [setId]);

  return <div className="progress-bar" style={{ width: `${progress}%` }} />;
}
```

#### 2. Áp dụng `takeUntil` trong luồng xử lý RxJS:
Khi đăng ký (Subscribe) các luồng RxJS nghiệp vụ dài hạn, bắt buộc phải sử dụng toán tử `takeUntil` đi kèm với một Subject báo hiệu dọn dẹp để tự động giải phóng luồng cùng nhau.

---

## 🔌 2. Quy Chuẩn Quản Trị Hàng Đợi Bất Đồng Bộ (BullMQ Event Normalization)

Hàng đợi xử lý chạy nền (**BullMQ**) chạy trên nền Redis là chốt chặn xử lý các tác vụ rất nặng. Các tác vụ này có thể gặp lỗi bất kỳ lúc nào (ví dụ: DB sập tạm thời). Kỹ sư bắt buộc phải cấu hình bộ lọc lỗi tự động:

### 📋 Thiết lập chính sách Thử lại an toàn (Retry Policy) & Thuốc độc (Poison Pills)
*   **Exponential Backoff:** Nếu Worker xử lý job bị lỗi (ném Exception), cấm thử lại ngay lập tức. Bắt buộc cấu hình chính sách giãn cách lũy thừa để bảo vệ hạ tầng DB.
*   **Poison Pill Handling:** Giới hạn tối đa số lần thử lại (`attempts: 3`). Nếu vượt quá 3 lần mà job vẫn thất bại, hệ thống bắt buộc phải di chuyển job đó sang trạng thái **Failed** và phát cảnh báo Slack/Discord tự động thay vì tiếp tục chạy vô hạn làm cạn kiệt CPU.

```typescript
// packages/backend/infrastructure/messaging/queue-config.ts
export const VOCABULARY_IMPORT_QUEUE_OPTIONS = {
  defaultJobOptions: {
    attempts: 3, // Giới hạn tối đa 3 lần thử lại (Poison Pill defense)
    backoff: {
      type: 'exponential',
      delay: 5000 // Thử lại sau: 5s -> 10s -> 20s
    },
    removeOnComplete: true, // Tự động xóa job sạch sẽ khi hoàn thành
    removeOnFail: false     // Giữ lại job lỗi trong DB/Redis để SRE kiểm tra lỗi
  }
};
```

---

## ⚡ 3. Chuẩn Hóa Kết Nối WebSocket / SSE Bền Bỉ

Đối với các luồng đấu trí từ vựng thời gian thực (Real-time Challenges), WebSocket phải tuân thủ:

1.  **Xác thực tại cổng bắt tay (Handshake Authentication):** Token JWT bắt buộc phải được gửi và validate ngay tại thời điểm kết nối ban đầu (`connectionInit`). Cấm cho phép thiết lập socket rác không xác thực.
2.  **Chiến lược kết nối lại tự động (Auto-Reconnect):** Thiết lập cơ chế tự động kết nối lại trên Client sử dụng thuật toán **giãn cách lũy thừa có nhiễu ngẫu nhiên (Jitter)** khi mạng bị ngắt quãng đột ngột.
3.  **Làm sạch Payload (WebSocket Sanitization):** Toàn bộ dữ liệu truyền nhận qua kênh socket phải đi qua lớp DTO Validation để chống lại các sự cố nhiễm độc mã hoặc giả mạo luồng dữ liệu của người chơi khác.
