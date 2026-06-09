# 🎨 Magic Values Elimination Law

Mã nguồn Frontend của **SparkNestEd** phải đảm bảo tính sạch sẽ, dễ đọc và nhất quán tối đa ở mặt giao diện thị giác. Chúng tôi áp dụng luật thép triệt tiêu hoàn toàn các giá trị bí ẩn (Magic Values) bao gồm hardcode mã màu CSS, kích thước, và các chuỗi văn bản trần trụi.

---

## 📐 1. Tích Hợp Hệ Thống Design Tokens (Tailwind CSS Integration)

Mọi chỉ số màu sắc, kích thước viền, khoảng cách (margin/padding) và độ bo góc bắt buộc phải được kế thừa từ hệ thống **Design Tokens** cốt lõi được cấu hình trong Tailwind CSS của dự án.

> [!IMPORTANT]
> **Cấm tuyệt đối:** Không viết trực tiếp các mã màu hệ lục phân (ví dụ `#1A202C`) hoặc kích thước pixel tùy tiện (ví dụ `13px`, `padding: "17px"`) trong inline styles hoặc CSS file.

*   ❌ **SAI (PR REJECTED):** Hardcode CSS inline đè lên chuẩn thiết kế.
    ```tsx
    <div style={{ backgroundColor: "#1A202C", borderRadius: "11px", padding: "19px" }}>
      <span>Thẻ từ vựng</span>
    </div>
    ```

*   ✔️ **ĐÚNG (PR APPROVED):** Sử dụng các biến Design Tokens hoặc các Class tiện ích Tailwind tiêu chuẩn.
    ```tsx
    // Sử dụng Tailwind Utility Classes kế thừa trực tiếp từ tailwind.config.js
    <div className="bg-slate-900 rounded-xl p-6 border border-white/10 glass-card">
      <span className="text-primary font-medium">Thẻ từ vựng</span>
    </div>
    ```

---

## 🚫 2. Lệnh Cấm Hardcode CSS Inline & Ngoại Lệ Được Chấp Nhận

Inline styles (`style={{ ... }}`) làm mã nguồn React cực kỳ rối mắt, cản trở việc cập nhật giao diện hàng loạt theo chủ đề (Theme Engine) và làm mất đi khả năng tối ưu hóa của CSS compiler.

*   **Quy tắc:** Mọi kiểu dáng trang trí bắt buộc phải sử dụng Tailwind Utility classes hoặc CSS Variables toàn cục.
*   **Ngoại lệ duy nhất được chấp nhận:** Khi cần tính toán giá trị CSS động theo thời gian thực dựa trên tương tác vật lý của người dùng (Drag and Drop vị trí chuột, tính toán vị trí Top/Left của dòng cuộn ảo hoặc độ rộng của thanh tiến trình %).
    *   *Ví dụ:* `<div style={{ transform: `translateY(${virtualRow.start}px)` }} />` ➡️ **Chấp nhận**.

---

## 🌐 3. Quy Chuẩn Quốc Tế Hóa (i18n & Localization)

Toàn bộ các chuỗi ký tự hiển thị trên giao diện người dùng (từ nhãn nút, cảnh báo lỗi, cho đến các đoạn văn giới thiệu) tuyệt đối **cấm viết bằng chuỗi tiếng Việt/tiếng Anh trần trụi**. Bắt buộc phải đi qua hệ thống quốc tế hóa **`react-i18next`**.

### 1. Phân chia cấu trúc tệp Locales:
Các chuỗi dịch thuật được quản lý tập trung theo cấu trúc thư mục dạng JSON:
```text
packages/frontend/shared/assets/locales/
├── 📄 vi.json                               # Bản dịch Tiếng Việt chuẩn hóa
└── 📄 en.json                               # Bản dịch Tiếng Anh
```

### 2. Định dạng JSON Key phân cấp rõ rệt:
```json
{
  "vocabulary": {
    "set": {
      "create_success": "Gói từ vựng \"{{title}}\" đã được tạo thành công!",
      "empty_error": "Vui lòng thêm ít nhất 1 từ vựng để xuất bản."
    }
  }
}
```

### 3. Thực thi dịch thuật trong Component:
```tsx
import { useTranslation } from 'react-i18next';

export function CreateSetNotification({ title }: { title: string }) {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-success/20 border border-success/30 rounded-lg">
      <p className="text-success-foreground">
        {/* Truy xuất khóa phân cấp và truyền biến động động */}
        {t('vocabulary.set.create_success', { title })}
      </p>
    </div>
  );
}
```

### 4. Định dạng Ngày tháng & Số liệu:
Cấm tự viết các hàm ghép chuỗi ngày tháng. Bắt buộc sử dụng các hàm Helper chuẩn hóa của thư viện `date-fns` kết hợp locale của i18n để định dạng tự động theo múi giờ và định dạng ngôn ngữ quốc gia của người học.
