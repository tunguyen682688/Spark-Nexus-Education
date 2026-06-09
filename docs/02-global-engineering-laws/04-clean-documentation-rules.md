# ⚖️ Clean Documentation Rules

Quy tắc viết comment, tài liệu kỹ thuật và quản trị tri thức hệ thống chuẩn mực tại **SparkNestEd**. 

Tài liệu kỹ thuật không tốt là nguyên nhân trực tiếp dẫn đến sự hiểu lầm nghiệp vụ và làm chậm tốc độ nhập cuộc (Onboarding) của kỹ sư mới. Chúng ta viết tài liệu không phải để "đối phó" mà để xây dựng một **nguồn tri thức đáng tin cậy duy nhất (Single Source of Truth)**.

---

## 🧭 Nguyên Tắc Vàng Về Comment Trong Code

> [!IMPORTANT]
> **Nguyên tắc cốt lõi:** Chỉ giải thích "Why" (Tại sao viết đoạn code này, lý do nghiệp vụ/workaround là gì), tuyệt đối cấm giải thích "What" (Đoạn code kỹ thuật này đang làm gì).

*   Code tốt bản thân nó phải tự giải thích nó đang làm gì (Self-documenting code) thông qua cách đặt tên biến, hàm rõ nghĩa và cấu trúc logic sáng sủa.
*   Comment chỉ được sử dụng để giải thích các quyết định nghiệp vụ phức tạp, giải pháp đánh đổi khó hiểu, các dòng workaround đặc biệt do giới hạn thư viện hoặc các thuật toán đặc thù (ví dụ: SRS SM-2).

### Ví Dụ Thực Tế:

*   ❌ **SAI (PR REJECTED):** Comment vô giá trị giải thích lại cú pháp code.
    ```typescript
    // Lấy số lớn hơn giữa fields.length và totalServerItems
    const count = Math.max(fields.length, totalServerItems); 
    ```
*   ✔️ **ĐÚNG (PR APPROVED):** Comment giải thích lý do nghiệp vụ (Why).
    ```typescript
    // Chúng ta cần lấy giá trị lớn nhất vì trên giao diện phân trang hiện tại, 
    // Client UI mới chỉ tải trang đầu tiên (fields.length ngắn), 
    // trong khi Backend đã nắm giữ tổng số lượng mục thực tế từ máy chủ (totalServerItems).
    const count = Math.max(fields.length, totalServerItems);
    ```

---

## 📝 Quy Chuẩn JSDoc / TSDoc Cho Public APIs

Mọi Class nghiệp vụ, Hàm tiện ích dùng chung (Shared Utilities), và các Endpoint API công khai bắt buộc phải được viết tài liệu bằng định dạng **TSDoc** tiêu chuẩn để IDE tự động hiển thị gợi ý (IntelliSense) cho lập trình viên khác.

### 📋 Mẫu TSDoc Tiêu Chuẩn:

```typescript
/**
 * Tính toán khoảng thời gian ôn tập tiếp theo cho một từ vựng dựa trên thuật toán SM-2.
 * 
 * @param easeFactor - Hệ số dễ của thẻ từ vựng (giá trị từ 1.3 đến 2.5).
 * @param repetitions - Số lần ôn tập thành công liên tiếp.
 * @param quality - Đánh giá chất lượng ghi nhớ của người học (0: Quên sạch -> 5: Nhớ hoàn hảo).
 * @returns Đối tượng chứa khoảng thời gian ôn tập mới (ngày) và hệ số dễ cập nhật.
 * 
 * @throws {InvalidEaseFactorException} Nếu easeFactor nhỏ hơn 1.3.
 * 
 * @example
 * ```typescript
 * const result = calculateSpacedInterval(2.5, 3, 5);
 * console.log(result.nextIntervalDays); // Output: 6
 * ```
 */
export function calculateSpacedInterval(
  easeFactor: number, 
  repetitions: number, 
  quality: number
): SpacedIntervalResult {
  // Logic thực thi thuật toán...
}
```

---

## 🗂️ Biểu Mẫu Cấu Trúc README.md Cho Nx Libraries

Để giữ Monorepo ngăn nắp, mọi thư viện con (**Nx Library** hoặc **Domain Module**) trong thư mục `libs/` bắt buộc phải có tệp tin `README.md` riêng theo cấu trúc tiêu chuẩn dưới đây để lập trình viên khác hiểu cách tích hợp nhanh chóng.

```markdown
# 📦 [Tên Thư Viện Kebab-case]

## 🎯 1. Mục Tiêu Nghiệp Vụ (Overview)
[Mô tả ngắn gọn về chức năng của thư viện này trong hệ thống. Giải quyết bài toán nghiệp vụ nào?]

## 🏛️ 2. Kiến Trúc & Phụ Thuộc (Architecture)
- **Tầng:** [Domain / Application / Infrastructure / UI]
- **Phụ thuộc vào:** [Liệt kê các Nx libraries nội bộ khác hoặc thư viện npm lớn]

## 🔌 3. Giao Diện Công Khai (Public APIs)
[Liệt kê các class, interface, method được export ra qua file index.ts]
- `VocabularySetAggregate`: Aggregate root quản lý tập từ vựng.
- `CreateSetUseCase`: Handler tạo mới tập từ vựng.

## 🧪 4. Hướng Dẫn Kiểm Thử & Chạy Thử
- **Lệnh chạy Unit Test:** `npx nx test [library-name]`
- **Ngưỡng Coverage tối thiểu:** 80%
```

---

## 🏛️ Quy Trình Ghi Nhận Quyết Định Kiến Trúc (ADR - Architecture Decision Records)

Khi có những thay đổi lớn về mặt thiết kế hệ thống, hạ tầng hoặc giải pháp công nghệ (ví dụ: chuyển đổi ORM, áp dụng hàng đợi BullMQ, thay đổi cơ chế xác thực), kỹ sư bắt buộc phải tạo một bản ghi **ADR** trong thư mục `docs/adr/`.

### 📋 Mẫu Cấu Trúc ADR Chuẩn:
1.  **Tiêu đề:** `ADR-[Số thứ tự]-[Tên quyết định bằng tiếng Anh/Việt]` (Ví dụ: `ADR-005-use-bullmq-for-async-jobs.md`).
2.  **Trạng thái (Status):** `Proposed` (Đang đề xuất) | `Accepted` (Đã duyệt) | `Deprecated` (Đã lỗi thời).
3.  **Bối cảnh (Context):** Nêu rõ vấn đề kỹ thuật hiện tại là gì và tại sao cần giải pháp mới.
4.  **Quyết định (Decision):** Giải pháp chi tiết được lựa chọn và cách triển khai.
5.  **Hệ quả (Consequences):** Những lợi ích thu được và các đánh đổi (trade-offs) phải chấp nhận (ví dụ: tăng độ phức tạp hệ thống nhưng tăng tính sẵn sàng).

---

## ⏳ Quản Lý Code Lỗi Thời (Code Deprecation Governance)

Tuyệt đối **KHÔNG** xóa bỏ đột ngột các phương thức, API hoặc thư viện đang được sử dụng rộng rãi, điều này sẽ làm gãy đổ hệ thống xây dựng (Build Break) của các đội ngũ khác.

### 📋 Quy Trình Thay Thế Sạch Sẽ:
1.  **Đánh dấu lỗi thời (@deprecated):** Thêm chú thích `@deprecated` trong TSDoc kèm hướng dẫn sử dụng hàm thay thế và phiên bản dự kiến xóa bỏ.
2.  **Thông báo runtime (Tùy chọn):** Log cảnh báo warning trên console khi chạy môi trường Development.
3.  **Xóa bỏ an toàn:** Chỉ tiến hành xóa code cũ sau khi đã chắc chắn 100% không còn thư viện nào import phương thức đó (đã kiểm tra qua static analysis của Nx).

### Ví dụ Đánh dấu:
```typescript
/**
 * Lấy danh sách từ vựng cũ không phân trang.
 * 
 * @deprecated Từ phiên bản v2.4.0, hãy chuyển sang dùng `getVocabularySetsPaginated` 
 * để tối ưu hiệu năng I/O cơ sở dữ liệu. Hàm này sẽ bị xóa hoàn toàn ở v3.0.0.
 */
export async function getVocabularySetsLegacy(): Promise<VocabularySet[]> {
  // Logic cũ...
}
```
