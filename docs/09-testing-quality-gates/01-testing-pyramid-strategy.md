# 🧪 Testing Pyramid Strategy

Chất lượng và độ tin cậy của mã nguồn là danh dự của đội ngũ kỹ sư tại **SparkNestEd**. Để bảo vệ hệ thống khỏi các lỗi hồi quy (Regression Bugs) khi bổ sung tính năng mới, dự án áp dụng mô hình **Hình Tháp Kiểm Thử (Testing Pyramid Strategy)** nghiêm ngặt.

---

## 🧭 1. Chi Tiết 3 Tầng Hình Tháp Kiểm Thử

Hệ thống phân bổ nguồn lực kiểm thử theo tỷ lệ hình tháp tiêu chuẩn để tối ưu hóa giữa **độ tin cậy** và **tốc độ thực thi CI**:

```text
       / █ \       <-- 1. END-TO-END TESTS (5% - Playwright / Cypress)
      / ███ \      <-- 2. INTEGRATION TESTS (25% - NestJS Supertest)
     / █████ \     <-- 3. UNIT TESTS (70% - Vitest / Jest)
    /_________ \
```

### 1. Unit Tests (Tầng đáy - 70%)
*   **Mục tiêu:** Kiểm thử các đơn vị code nhỏ nhất một cách cô lập hoàn toàn (Domain Aggregates, Value Objects, Helper Functions).
*   **Nguyên tắc:** **Tốc độ là tối thượng**. Một bài Unit Test bắt buộc phải chạy dưới **`10ms`**. Toàn bộ Monorepo chạy hàng ngàn bài Unit Tests dưới **1 phút**. Cấm tuyệt đối kết nối DB hoặc Network I/O tại đây.
*   **Ví dụ thư mục:** `libs/vocabulary-domain/src/lib/domain/**/*.spec.ts`

### 2. Integration Tests (Tầng giữa - 25%)
*   **Mục tiêu:** Kiểm thử sự kết hợp và tích hợp mượt mà giữa các tầng (Controller ➡️ Command Handler ➡️ Repository kết nối DB PostgreSQL thật).
*   **Nguyên tắc:** Sử dụng database độc lập chạy trong Docker container riêng dành cho kiểm thử. Tự động dọn dẹp sạch sẽ dữ liệu (Teardown) sau mỗi bài test.
*   **Ví dụ thư mục:** `libs/vocabulary-domain/src/lib/infrastructure/__tests__/**/*.spec.ts`

### 3. End-to-End (E2E) Tests (Tỉnh tháp - 5%)
*   **Mục tiêu:** Giả lập toàn bộ trải nghiệm người dùng cuối trên trình duyệt thực tế (đăng nhập Auth0, lật flashcard, tính toán lịch SRS).
*   **Nguyên tắc:** Tập trung vào các luồng nghiệp vụ cốt lõi có giá trị kinh doanh cao nhất (Happy Paths). Sử dụng công cụ **Playwright** để chạy đa trình duyệt.

---

## 💻 2. Ví Dụ Mã Nguồn Unit Test Chuẩn (Vitest / Jest)

Dưới đây là một bài Unit Test tiêu chuẩn kiểm thử nghiệp vụ thuật toán Spaced Repetition (SM-2) của Aggregate Root một cách độc lập:

```typescript
// packages/backend/domains/module-vocabulary/src/lib/domain/aggregates/progress.aggregate.spec.ts
import { describe, it, expect } from 'vitest';
import { UserVocabularyProgressAggregate } from './progress.aggregate';
import { uuid } from '@spark-nest-ed/shared-libs';

describe('UserVocabularyProgressAggregate (Unit Test)', () => {
  
  // Kiểm thử luật bất biến khởi tạo
  it('should initialize with default learning values successfully', () => {
    const aggregate = new UserVocabularyProgressAggregate(uuid(), 'user-123', 'item-456');

    expect(aggregate.getEaseFactor()).toBe(2.5); // EF mặc định ban đầu là 2.5
    expect(aggregate.getRepetitions()).toBe(0);  // Số lần lặp ban đầu là 0
    expect(aggregate.getInterval()).toBe(0);     // Chu kỳ ban đầu là 0 ngày
    expect(aggregate.getStatus()).toBe('NEW');    // Trạng thái mặc định là NEW
  });

  // Kiểm thử kịch bản Happy Path của thuật toán SM-2
  it('should calculate next review interval to 6 days on second successful review', () => {
    const aggregate = new UserVocabularyProgressAggregate(uuid(), 'user-123', 'item-456');

    // Lần review 1 thành công (Quality = 4: Good)
    aggregate.recordReview(4);
    expect(aggregate.getRepetitions()).toBe(1);
    expect(aggregate.getInterval()).toBe(1); // Lần đầu tiên đúng: 1 ngày ôn tập

    // Lần review 2 thành công liên tiếp (Quality = 5: Perfect)
    aggregate.recordReview(5);
    expect(aggregate.getRepetitions()).toBe(2);
    expect(aggregate.getInterval()).toBe(6); // Lần thứ hai đúng: 6 ngày ôn tập
    expect(aggregate.getStatus()).toBe('LEARNING');
  });

  // Kiểm thử kịch bản Edge Case bảo vệ luật bất biến
  it('should never let Ease Factor drop below the minimum limit of 1.3', () => {
    const aggregate = new UserVocabularyProgressAggregate(uuid(), 'user-123', 'item-456');

    // Người dùng liên tục đánh giá quên từ (Quality = 0: Blackout)
    aggregate.recordReview(0);
    aggregate.recordReview(0);
    aggregate.recordReview(0);
    aggregate.recordReview(0);
    aggregate.recordReview(0);

    // Luật bất biến: EF cấm rơi xuống dưới 1.3
    expect(aggregate.getEaseFactor()).toBe(1.3);
    expect(aggregate.getInterval()).toBe(1); // Yêu cầu ôn tập lại vào ngày mai
  });
});
```
