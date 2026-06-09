# 🛡️ Timezone & Time Governance Law

Xử lý sai lệch múi giờ (Timezone) là nguồn gốc sản sinh ra hàng loạt lỗi nghiêm trọng liên quan đến hiển thị biểu đồ báo cáo tiến trình học tập, lịch sử thi đấu và tính toán thời gian đến hạn ôn tập thẻ từ vựng. 

Hệ thống **SparkNestEd** áp dụng các nguyên tắc bất biến dưới đây để đảm bảo sự thống nhất thời gian trên quy mô toàn cầu.

---

## ⚖️ 1. Quy Tắc Bất Biến Thời Gian (Core Invariants)

```text
  [CLIENT FRONTEND (React 19)]
  - Lấy Múi giờ Local của trình duyệt (ví dụ: Asia/Ho_Chi_Minh).
  - Định dạng hiển thị ngày/tháng/giờ theo văn hóa địa phương.
        ▲
        │ (Chỉ truyền nhận định dạng chuỗi ISO-8601 UTC)
        ▼
  [BACKEND SERVER (NestJS API)]
  - Môi trường chạy NodeJS: TZ=UTC.
  - Cấm tự ý cộng/trừ giờ cứng (ví dụ: +7h).
        ▲
        │ (Lưu trữ thô dạng UTC offset 0)
        ▼
  [DATABASE STORAGE (PostgreSQL)]
  - Kiểu dữ liệu bắt buộc: TIMESTAMPTZ (Timestamp with Time Zone).
```

1.  **Lưu trữ nhất quán dạng UTC:** Toàn bộ dữ liệu thời gian ghi nhận vào PostgreSQL, Redis, BullMQ bắt buộc phải ở múi giờ **UTC (Zero Offset)** theo tiêu chuẩn **ISO-8601** (`YYYY-MM-DDTHH:mm:ss.sssZ`).
2.  **Cấu hình Môi trường Server:** Môi trường Docker/Máy chủ chạy NodeJS bắt buộc phải thiết lập biến môi trường **`TZ=UTC`** để toàn bộ hàm `new Date()` hệ thống luôn sinh ra mốc giờ UTC mặc định.
3.  **Local Presentation Only (Chỉ định dạng ở Client):** Tầng Backend tuyệt đối không chứa logic format ngày tháng thân thiện cho con người. Nhiệm vụ định dạng theo múi giờ địa phương và quốc gia của người học thuộc về tầng Frontend cuối cùng.

---

## 🔌 2. Quy Chuẩn Cơ Sở Dữ Liệu PostgreSQL & Prisma

*   **Bắt buộc sử dụng `DateTime` ánh xạ `timestamptz`:** Trong tệp `schema.prisma`, toàn bộ các trường thời gian bắt buộc phải định nghĩa kiểu `DateTime` và được PostgreSQL biên dịch thành `TIMESTAMPTZ` (không dùng `TIMESTAMP` không múi giờ vì nó sẽ tự động drop múi giờ và làm lệch giờ khi restore database).
    ```prisma
    model UserVocabularyProgress {
      id            String   @id @default(uuid())
      nextReviewAt  DateTime @map("next_review_at") @db.Timestamptz
      createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz
    }
    ```

---

## 🎨 3. Quy Chuẩn Định Dạng Thời Gian Ở Client (date-fns)

Tại Frontend, để hiển thị thời gian thân thiện với múi giờ của người học, bắt buộc sử dụng thư viện **`date-fns`** kết hợp với locales được cấu hình động:

```tsx
// packages/frontend/shared/libs/date-utils.ts
import { format, formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

const locales: Record<string, any> = {
  vi: vi,
  en: enUS
};

export class DateFormatter {
  /**
   * Định dạng mốc UTC ISO-8601 thành chuỗi thân thiện địa phương.
   */
  public static toLocalString(utcString: string, formatPattern = 'dd/MM/yyyy HH:mm', localeCode = 'vi'): string {
    const date = new Date(utcString);
    return format(date, formatPattern, {
      locale: locales[localeCode] || vi
    });
  }

  /**
   * Trả về khoảng cách thời gian tương đối (ví dụ: "3 phút trước", "2 ngày trước").
   */
  public static toRelativeTime(utcString: string, localeCode = 'vi'): string {
    const date = new Date(utcString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locales[localeCode] || vi
    });
  }
}
```

---

## 🧠 4. Luật Ôn Tập SRS Theo Lịch Địa Phương (Due Date Alignment)

Đối với nghiệp vụ Spaced Repetition (SRS), chu kỳ ôn tập $I$ được tính bằng ngày. Để tránh việc thẻ từ bị đến hạn vào giữa đêm gây phiền hà cho việc thống kê hàng ngày:
*   Mốc thời gian ôn tập tiếp theo `nextReviewAt` được tính bằng cách: Cộng số ngày $I$ vào thời điểm hiện tại dưới dạng UTC.
*   Khi hiển thị danh sách thẻ ôn tập trong ngày trên Client, Frontend sẽ lấy mốc thời gian **nửa đêm ngày hôm nay theo giờ địa phương của user** (ví dụ `Asia/Ho_Chi_Minh` là `23:59:59`), chuyển mốc đó sang dạng UTC tương ứng, và gửi lên Backend để lọc toàn bộ các thẻ có `nextReviewAt <= mốc_đó_UTC`.
*   Điều này bảo đảm tiến trình học của user luôn đồng bộ chính xác với nhịp sinh học ngày/đêm của họ ở bất kỳ đâu trên thế giới.
