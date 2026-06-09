# 🤝 SparkNestEd Contribution & Local Development Guide

Chào mừng bạn đến với đội ngũ phát triển **SparkNestEd**! Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường phát triển cục bộ, các lệnh vận hành Monorepo qua công cụ Nx, quy chuẩn viết code, quy tắc Git Branching, và quy trình gửi Pull Request (PR).

---

## 💻 1. Thiết Lập Môi Trường Cục Bộ (Local Setup)

Để dự án vận hành mượt mà, máy tính phát triển của bạn cần đáp ứng các yêu cầu tối thiểu sau:
- **Node.js:** Phiên bản LTS mới nhất (v20.x hoặc v22.x).
- **Docker & Docker Compose:** Dùng để chạy nhanh các service phụ trợ (PostgreSQL, Redis).
- **IDE:** Visual Studio Code hoặc WebStorm (Khuyến nghị cài đặt thêm extension **Nx Console** để tăng tốc độ làm việc).

### Bước 1: Clone dự án và cài đặt Dependencies
```bash
# Clone repository
git clone https://github.com/your-org/Spark-Nexus-Ed.git
cd Spark-Nexus-Ed

# Cài đặt toàn bộ dependencies của Monorepo
npm install
```

### Bước 2: Thiết lập cấu hình biến môi trường (`.env`)
Tạo tệp tin `.env` tại thư mục gốc của dự án dựa trên các tham số cấu hình sau:
```env
# Port chạy ứng dụng Backend API SNE
PORT=3000

# Cơ sở dữ liệu PostgreSQL (Chạy local qua Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spark_nest_ed?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/spark_nest_ed?schema=public"

# Cấu hình Redis (Bắt buộc cho BullMQ Background Jobs)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
```

### Bước 3: Khởi động các dịch vụ hạ tầng bằng Docker Compose
Dự án cung cấp sẵn tệp `docker-compose.yml` định cấu hình PostgreSQL và Redis (với chính sách `noeviction` tối quan trọng cho BullMQ):
```bash
# Khởi chạy các container chạy ngầm
docker-compose up -d

# Kiểm tra trạng thái hoạt động của các container
docker-compose ps
```

### Bước 4: Chạy Migrations Cơ Sở Dữ Liệu (Prisma)
Đồng bộ cấu hình database schema thực tế vào cơ sở dữ liệu PostgreSQL local của bạn:
```bash
# Di chuyển đến thư mục database package
cd packages/backend/infrastructure/database

# Chạy Prisma migration cục bộ
npx prisma migrate dev --name init_local

# Sinh mã Prisma Client mới nhất
npx prisma generate
```

---

## ⚡ 2. Quy Trình Vận Hành Monorepo Bằng Lệnh Nx

Dự án sử dụng **Nx** làm công cụ điều phối Monorepo. Thay vì di chuyển sâu vào từng thư mục con để chạy các script riêng lẻ, bạn hãy đứng ở thư mục gốc và sử dụng hệ thống câu lệnh thông minh của Nx.

### A. Khởi Chạy Ứng Dụng (Running Applications)

```bash
# Khởi chạy Backend API (api-sne) ở chế độ hot-reload
npx nx serve api-sne

# Khởi chạy Frontend React (frontend-sne)
npx nx serve frontend-sne
```

### B. Kiểm Tra Chất Lượng Code & Format (Linting & Formatting)

Dự án áp dụng cấu hình nghiêm ngặt về ESLint và Prettier để đảm bảo tính đồng bộ mã nguồn:
```bash
# Kiểm tra lỗi cú pháp (Lint) trên toàn bộ dự án
npx nx run-many -t lint

# Sửa lỗi Lint tự động
npx nx run-many -t lint --fix

# Tự động định dạng toàn bộ code (Format) theo Prettier
npx nx format:write
```

### C. Chạy Kiểm Thử (Testing)

```bash
# Chạy Unit & Integration Test cho một package cụ thể (ví dụ: module-vocabulary)
npx nx test module-vocabulary

# Chạy Unit Test cho toàn bộ các package trong Monorepo
npx nx run-many -t test

# Chạy kiểm thử ở chế độ theo dõi thay đổi (Watch Mode)
npx nx test module-vocabulary --watch
```

### D. Biên Dịch Dự Án (Building)

Trước khi đóng gói triển khai (Deployment), bạn cần đảm bảo toàn bộ mã nguồn được biên dịch thành công mà không gặp bất kỳ lỗi TypeScript nào:
```bash
# Biên dịch ứng dụng Backend
npx nx build api-sne

# Biên dịch ứng dụng Frontend
npx nx build frontend-sne
```

---

## 📐 3. Quy Chuẩn Đóng Gói Mã Nguồn & Định Dạng Git Commit

Để giữ lịch sử Git sạch sẽ, dễ tra cứu và hỗ trợ tự động hóa việc sinh tài liệu thay đổi (Changelog), dự án bắt buộc áp dụng tiêu chuẩn **Conventional Commits**.

### A. Cú Pháp Định Dạng Commit
```
<type>(<scope>): <subject>

[optional body]
```

#### Các loại hình Thay đổi (`type`):
- `feat`: Thêm một chức năng mới cho sản phẩm.
- `fix`: Sửa một lỗi kỹ thuật (bug fix).
- `docs`: Thay đổi hoặc bổ sung tài liệu hướng dẫn (ví dụ: cập nhật HANDBOOK.md).
- `style`: Định dạng code (khoảng trắng, dấu phẩy, không thay đổi logic chạy).
- `refactor`: Tái cấu trúc code (không sửa lỗi, không thêm chức năng mới).
- `test`: Bổ sung hoặc sửa đổi các tệp tin kiểm thử (Unit/Integration Tests).
- `chore`: Các tác vụ nhỏ khác liên quan đến cấu hình hệ thống, dependencies, build tool.

#### Phạm vi thay đổi (`scope`):
Ghi rõ tên package hoặc domain bị tác động. Ví dụ: `vocabulary`, `reading`, `quiz`, `database`, `frontend`.

#### Ví dụ Commit chuẩn:
```bash
feat(vocabulary): tích hợp thuật toán SM-2 cập nhật chu kỳ ôn tập SRS
fix(database): sửa chỉ mục trùng lặp trong user_vocabulary_progress
docs(vocabulary): cập nhật handbook hướng dẫn cấu trúc CQRS
test(vocabulary): thêm unit test kiểm tra logic ghi nhận điểm số trong Quiz
```

### B. Quy Tắc Phân Nhánh Git (Git Branching Strategy)

- **Nhánh chính (`main`):** Chứa mã nguồn ổn định nhất đang chạy trên production. Tuyệt đối không được phép commit trực tiếp lên nhánh này.
- **Nhánh phát triển (`develop`):** Nhánh tích hợp các tính năng mới đã được kiểm thử để chuẩn bị release.
- **Nhánh tính năng (`feature/`):** Tách ra từ `develop` để làm các tính năng mới. 
  - *Định dạng:* `feature/SNE-<task-number>-short-description` (ví dụ: `feature/SNE-102-spaced-repetition-srs`).
- **Nhánh sửa lỗi (`bugfix/` hoặc `hotfix/`):** Tách ra để xử lý các lỗi phát sinh.
  - *Định dạng:* `bugfix/SNE-<task-number>-fix-detail`.

---

## 🔄 4. Quy Trình Gửi Pull Request (PR) & Code Review

Mọi đóng góp mã nguồn vào dự án đều phải trải qua quy trình đánh giá chéo (Pull Request & Code Review) để đảm bảo chất lượng.

### Checklist dành cho Lập trình viên trước khi tạo PR:
- [ ] **Mã nguồn biên dịch thành công:** Đã chạy `npx nx build <project>` không lỗi.
- [ ] **Không vi phạm ESLint/Formatting:** Đã chạy `npx nx run-many -t lint` và `npx nx format:write`.
- [ ] **Vượt qua toàn bộ bài kiểm thử:** Đã chạy `npx nx run-many -t test` và tất cả các bài test đều đạt màu xanh (Passed).
- [ ] **Không chứa mã nguồn chết/dữ liệu giả:** Đảm bảo không còn dòng code `console.log` thừa, không có dữ liệu hardcode vi phạm nguyên tắc "No Placeholders Rule" quy định tại [DESIGN.md](file:///d:/Workspace/SoftwareDevelopment/Spark-Nexus-Ed/DESIGN.md).
- [ ] **Đồng bộ tài liệu:** Nếu có sự thay đổi về ranh giới Domain, APIs hoặc thuật toán, đảm bảo đã cập nhật tài liệu tương ứng tại [HANDBOOK.md](file:///d:/Workspace/SoftwareDevelopment/Spark-Nexus-Ed/HANDBOOK.md).

### Quy trình duyệt Pull Request:
1. Bạn đẩy nhánh tính năng lên Github và tạo PR nhắm vào nhánh `develop`.
2. Hệ thống CI/CD tự động kích hoạt kiểm tra Lint, TypeScript compile và chạy toàn bộ Unit Tests.
3. PR của bạn phải được kiểm duyệt và phê duyệt (Approve) bởi ít nhất **1 Core Developer** trước khi được phép gộp (Merge).
4. Khi Merge, lập trình viên duyệt PR sẽ sử dụng hình thức **Squash and Merge** để gộp toàn bộ các commit nhỏ thành một commit duy nhất có định dạng Conventional Commit chuẩn chỉnh.

---

> [!NOTE]
> **Hỗ trợ kỹ thuật:**
> Nếu gặp khó khăn trong quá trình thiết lập môi trường hoặc chạy các câu lệnh của Nx, vui lòng tham khảo [HANDBOOK.md](file:///d:/Workspace/SoftwareDevelopment/Spark-Nexus-Ed/HANDBOOK.md) hoặc gửi câu hỏi trực tiếp cho đội ngũ kiến trúc sư hệ thống trên kênh Slack thảo luận của dự án. Chúc bạn có những trải nghiệm lập trình tuyệt vời cùng SparkNestEd!
