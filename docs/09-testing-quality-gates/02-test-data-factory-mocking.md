# 🧪 Test Data Factory & Mocking Law

Tài liệu quy định các quy chuẩn viết code kiểm thử độc lập, tin cậy, dễ bảo trì và có tốc độ thực thi cực nhanh bằng cách áp dụng mẫu thiết kế **Test Data Factory** và các quy tắc **Giả lập dữ liệu (Mocking)** chuyên nghiệp tại dự án **SparkNestEd**.

---

## 🎨 1. Mẫu Thiết Kế Nhà Máy Tạo Dữ Liệu Kiểm Thử (Test Data Factory)

> [!IMPORTANT]
> **Cấm sao chép dữ liệu cứng (No copy-paste hardcode data):** Nghiêm cấm việc lặp đi lặp lại việc khai báo các object dữ liệu kiểm thử giả định giống nhau ở nhiều file test khác nhau. Điều này gây khó khăn cực lớn cho việc bảo trì khi cấu trúc Schema database thay đổi.

Chúng tôi áp dụng **Test Data Factory Pattern** để tạo nhanh dữ liệu kiểm thử có khả năng tùy biến linh hoạt và tự động sinh dữ liệu ngẫu nhiên (sử dụng thư viện `@faker-js/faker`):

```typescript
// packages/backend/infrastructure/database/factories/vocabulary-set.factory.ts
import { faker } from '@faker-js/faker';
import { VocabularySetAggregate } from '../../../../domains/module-vocabulary/src/lib/domain/aggregates/vocabulary-set.aggregate';
import { uuid } from '@spark-nest-ed/shared-libs';

export class VocabularySetFactory {
  /**
   * Tạo nhanh một instance Aggregate Root của gói từ vựng phục vụ kiểm thử.
   * Cho phép ghi đè (override) các thuộc tính mong muốn.
   */
  public static create(overrides: Partial<{
    id: string;
    title: string;
    ownerId: string;
    isPublic: boolean;
  }> = {}): VocabularySetAggregate {
    const id = overrides.id ?? uuid();
    const title = overrides.title ?? faker.word.noun() + ' Set';
    const ownerId = overrides.ownerId ?? uuid();

    const aggregate = new VocabularySetAggregate(id, title, ownerId);

    if (overrides.isPublic === true) {
      // Phải có ít nhất 1 từ mới được public (Bảo vệ luật bất biến)
      aggregate.addVocabularyItem(faker.word.sample(), faker.lorem.sentence());
      aggregate.publish();
    }

    return aggregate;
  }

  /**
   * Sinh mảng danh sách nhiều gói từ vựng giả lập cùng lúc.
   */
  public static createList(count: number, ownerId?: string): VocabularySetAggregate[] {
    return Array.from({ length: count }, () => this.create({ ownerId }));
  }
}
```

---

## 🛡️ 2. Quy Tắc Giả Lập Mocks / Stubs Tiêu Chuẩn

Việc lạm dụng Mocking quá đà sẽ làm mất đi giá trị của bài kiểm thử (kiểm thử thành công nhưng code thật chạy lỗi). Toàn bộ kỹ sư phải tuân thủ nghiêm ngặt **Quy tắc Mocking**:

### 1. Những gì BẮT BUỘC phải Mock:
*   **Các cuộc gọi API bên ngoài (Network I/O):** Bắt buộc giả lập kết nối API HTTP qua thư viện như `msw` (Mock Service Worker) hoặc mock trực tiếp http client class.
*   **Thời gian hệ thống (System Time):** Khi kiểm thử thuật toán SRS đến hạn, bắt buộc mock mốc thời gian hệ thống (`vi.useFakeTimers()` của Vitest) để cố định thời điểm kiểm thử.
*   **Các thao tác I/O nặng:** Gửi email, đẩy file lên S3, log telemetry.

### 2. Những gì CẤM TUYỆT ĐỐI không được Mock:
*   **Domain Entities & Aggregates:** Tuyệt đối không mock các lớp nghiệp vụ lõi. Phải sử dụng đối tượng thật để chạy thật các phương thức.
*   **Pure Utility Helpers:** Các hàm format, tính toán thuần túy bắt buộc chạy thật.

---

## 🚨 3. Cẩm Nang Chống Flaky Tests (Kiểm thử chạy chập chờn)

**Flaky Tests** là hiện tượng cùng một bài test nhưng lúc chạy PASS lúc chạy FAIL mà không sửa code. Đây là kẻ thù số một làm mất lòng tin của nhà phát triển vào CI.

*   **Không chia sẻ State tĩnh toàn cục (No Shared Static State):** Các bài test chạy song song tuyệt đối cấm ghi đè lên các biến tĩnh dùng chung.
*   **Dọn dẹp tuyệt đối (Teardown Sandboxing):** Mỗi bài kiểm thử trước khi chạy (`beforeEach`) và sau khi chạy xong (`afterEach`) bắt buộc phải tự động dọn sạch các mock, reset timers và xóa sạch bảng database test để tránh rác dữ liệu ảnh hưởng đến bài test sau.
    ```typescript
    afterEach(() => {
      vi.restoreAllMocks(); // Khôi phục lại toàn bộ mock
      vi.useRealTimers();    // Khôi phục lại mốc giờ thật
    });
    ```
