# 🎨 SparkNestEd Design System & Visual Identity Guidelines

Hệ thống thiết kế của **SparkNestEd** (stylized as `Spark-Nexus-Ed` / `@spark-nest-ed`) được thiết kế để mang lại trải nghiệm học tập hiện đại, cao cấp, mượt mà và trực quan cho người học ngôn ngữ. 

Tài liệu này đóng vai trò là **Source of Truth** về mặt thiết kế giao diện (UI) và trải nghiệm người dùng (UX) cho toàn bộ các nhà phát triển trên toàn hệ thống.

---

## 🌓 1. Hệ màu (Color Palette)

SparkNestEd sử dụng hệ màu **HSL variables** linh hoạt hỗ trợ chế độ Sáng/Tối (Light/Dark Mode) mượt mà thông qua Tailwind CSS. Các màu sắc được tinh chỉnh để giảm mỏi mắt cho người học trong các phiên học từ vựng kéo dài.

### ☀️ Chế độ Sáng (Light Mode)
```css
:root {
  --background: 210 40% 98%;           /* Hơi xanh băng nhạt, tạo cảm giác tinh tế, dễ chịu */
  --foreground: 222.2 84% 4.9%;        /* Xanh Navy sẫm cận đen, độ tương phản hoàn hảo cho văn bản */
  --card: 0 0% 100%;                   /* Trắng tinh khiết làm nổi bật thẻ */
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 216 98% 52%;              /* Xanh Royal Blue rực rỡ, thu hút sự chú ý vào CTA chính */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;          /* Xanh đá phiến nhạt cho các nút phụ */
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%; /* Xám xanh dịu cho phụ đề và siêu dữ liệu */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;        /* Đỏ san hô rực cho cảnh báo */
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;         /* Đường viền mờ tối giản */
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.75rem;                   /* 12px bo góc đồng bộ */
}
```

### 🌙 Chế độ Tối (Dark Mode)
```css
.dark {
  --background: 222.2 84% 4.9%;        /* Xanh vũ trụ sâu thẫm */
  --foreground: 210 40% 98%;           /* Trắng băng nhẹ hạn chế chói */
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;        /* Xanh Electric Sky sáng hơn để nổi bật trong nền tối */
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;        /* Đỏ Burgundy thẫm */
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

---

## 🔤 2. Hệ Thống Chữ (Typography)

Sự phân cấp chữ rõ ràng hỗ trợ việc đọc hiểu và ghi nhớ nhanh chóng.

- **Không chân (Sans-serif):** `Inter`, `system-ui`, `sans-serif` — Sử dụng làm font chính cho giao diện, nút bấm, bảng số liệu và biểu mẫu điều hướng.
- **Có chân (Serif):** `Georgia`, `serif` — Sử dụng làm font nội dung chính cho **Module Đọc (Reading Domain)** giúp người học duy trì khả năng đọc bài viết dài mà không mỏi mắt.
- **Đơn cách (Monospace):** `Roboto Mono`, `monospace` — Sử dụng cho ký tự phiên âm IPA (Pronunciation keys), từ điển gốc, từ khóa kỹ thuật và các đoạn mã dữ liệu.

### Phân cấp kiểu dáng (Text Presets):
* **Heading 1 (.heading-1):** `text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl`
* **Heading 2 (.heading-2):** `text-3xl font-bold tracking-tight sm:text-4xl`
* **Heading 3 (.heading-3):** `text-2xl font-bold tracking-tight sm:text-3xl`
* **Subtitle (.subtitle):** `text-lg font-medium text-muted-foreground`

---

## 🧱 3. Thành Phần Giao Diện Cơ Bản (Core UI Components)

Tất cả các phần tử tương tác đều kế thừa các utility class dựng sẵn trong `styles.css`:

### Nút Bấm (Buttons)
* **Primary Button (`.btn-primary`):** Nút chính của hành động (như "Bắt đầu học", "Tạo gói mới"). 
  - *Hiệu ứng:* Bo góc `12px` (`rounded-lg`), chuyển tiếp màu mượt mà, bóng đổ nhẹ, và **co nhỏ tinh tế khi nhấn (`active:scale-[0.98]`)**.
* **Secondary Button (`.btn-secondary`):** Dành cho các hành động phụ ("Xem chi tiết", "Hủy bỏ").
* **Outline Button (`.btn-outline`):** Đường viền tinh giản tương tác cao.

### Thẻ Trực Quan (Cards)
* **Glassmorphism (`.glass` / `.glass-card`):** Nền trắng mờ kết hợp làm mờ hậu cảnh (`backdrop-blur-sm` / `backdrop-filter: blur(10px)`) và viền trắng mỏng trong suốt (`border border-white/30`). Mang lại vẻ ngoài bóng bẩy, cao cấp kiểu kính.
* **Card Hover (`.card-hover`):** Hiệu ứng bóng đổ động chuyển đổi mượt mà (`transition-all duration-300 hover:shadow-medium`) tăng độ tương tác trực quan.

### Họa Tiết Nền (Background Patterns)
* **Pattern Dots (`.bg-dots`):** Lưới họa tiết chấm tròn nhỏ thanh lịch được tạo tự động bằng `radial-gradient` trên nền xám siêu nhạt giúp giao diện không bị trống trải mà vẫn cực kỳ tinh tế.

---

## 🔄 4. Nhịp Điệu Chuyển Động (Animations & Transitions)

Các vi chuyển động giúp giao diện phản hồi sinh động và mượt mà:

- **`.animate-fade-in`:** Đưa phần tử hiện ra từ từ từ dưới lên (`translateY(10px)` về `0`).
- **`.animate-slide-up` / `.animate-slide-down`:** Dành cho việc mở rộng các khu vực học tập hoặc hiển thị menu điều hướng.
- **`.animate-scale-in`:** Phóng to nhẹ nhàng từ `95%` lên `100%`, dùng cho các hộp thoại pop-up hoặc thẻ từ vựng lật mặt.
- **`.animate-pulse-soft`:** Nhấp nháy mượt mà chu kỳ 2 giây để thu hút sự chú ý vào các từ vựng "Đến hạn ôn tập".
- **Theme Transition (`.transitioning-theme`):** Hiệu ứng chuyển đổi mượt mà 0.3s giữa chế độ Sáng và Tối cho toàn bộ màu nền, văn bản và đường viền.

---

## 📐 5. Bố Cục Đặc Trưng: Trọng Tâm Hàng Đợi Ôn Tập (SRS Queue)

Thay vì đi theo cấu trúc khối phần (section template) truyền thống, bố cục trang chủ SparkNestEd được xây dựng theo **Vòng Đời Tiến Trình Học Tập (The Learning Pipeline)**:

1. **Khu vực Trọng lượng (Dominant Area - The Daily Queue):** 
   Nằm ở phần đầu tiên hoặc chiếm diện tích lớn nhất trên màn hình. Sử dụng họa tiết `.bg-dots` và `.glass` cao cấp. Hiển thị số lượng từ cần ôn tập hôm nay dạng số lớn với biểu tượng `Clock` hoặc thẻ nhấp nháy `.animate-pulse-soft`.
2. **Khu vực Chỉ số (Statistical Measures):** 
   Thẻ đo lường tiến trình (Mastered Words, Currently Learning, Vocabulary Sets, Saved Words) xếp dạng lưới nằm ngay phía dưới, hiển thị kết quả học tập thực tế.
3. **Thanh Lọc Bộ lọc & Phân mục:** 
   Các tab phân mục mượt mà (Sets vs Favorites), thanh tìm kiếm nhập liệu phản hồi tức thì và bộ lọc ngôn ngữ rõ ràng.
4. **Lưới Hiển Thị (Vocabulary Set Grid):** 
   Hiển thị danh sách các gói từ vựng bằng `.glass-card` kết hợp `.card-hover`. Mỗi thẻ hiển thị đầy đủ: tiêu đề, mô tả thực tế, cờ ngôn ngữ (en, vi, ja, ko), số lượng từ (`entryCount`), và lượt yêu thích (`favoriteCount`).

---

## 🚫 6. Nguyên Tắc "Không Dữ Liệu Giả" (No Placeholders Rule)

Khi thiết kế hoặc triển khai mã giao diện, tuyệt đối **không sáng tạo dữ liệu giả hoặc nhãn mơ hồ**. Mọi nội dung trên giao diện phải được ánh xạ trực tiếp từ cơ sở dữ liệu thực tế (`schema.prisma`):

* **Ngôn ngữ (Language):** Chỉ dùng các mã ngôn ngữ thực tế như `en` (Tiếng Anh), `vi` (Tiếng Việt), `ja` (Tiếng Nhật), `ko` (Tiếng Hàn).
* **Trạng thái học tập (SRS Status):** Chỉ dùng đúng các thuật ngữ `NEW` (Từ mới), `LEARNING` (Đang học), `MASTERED` (Đã thành thạo).
* **Độ khó (Difficulty):** Chỉ dùng đúng phân cấp học thuật `A1, A2, B1, B2, C1, C2` hoặc `beginner`, `intermediate`, `advanced`.
* **Phản hồi ôn tập (SRS Review Grades):** Giao diện flashcard lật mặt bắt buộc phải hiển thị chính xác 4 nút lựa chọn:
  - **Học lại (Again)**
  - **Khó (Hard)**
  - **Tốt (Good)**
  - **Dễ (Easy)**
* **Hợp tác thành viên (Package Members):** Hiển thị đúng 2 phân quyền thực tế: `OWNER` (Chủ sở hữu) và `EDITOR` (Cộng tác viên biên tập).
* **Tiến trình nhập tệp (Import Status):** Trạng thái đồng bộ hiển thị đúng: `idle`, `pending`, `processing`, `completed`, `failed`.
