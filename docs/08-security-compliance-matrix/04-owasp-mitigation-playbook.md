# 🔐 OWASP Mitigation Playbook

Cẩm nang hướng dẫn phòng thủ chủ động chống lại 5 nguy cơ lỗ hổng bảo mật nguy hiểm hàng đầu theo đánh giá của tổ chức **OWASP** tại hệ thống **SparkNestEd**. 

Nguyên tắc vàng xuyên suốt: **Không bao giờ tin tưởng dữ liệu từ Client gửi lên (Never Trust the Client).**

---

## 🧭 Cẩm Nang Phòng Thủ Chi Tiết Cho Top 5 OWASP

### 🛡️ 1. A01: Broken Access Control (Lỗ hổng kiểm soát truy cập / BOLA)
*   **Mô tả nguy cơ:** Kẻ tấn công cố tình thay đổi tham số ID trên thanh URL hoặc Payload (ví dụ: gửi `DELETE /api/v1/vocabulary-sets/user-A-set-ID` từ tài khoản của `user-B`) để thao túng tài nguyên của người khác.
*   **Giải pháp phòng ngừa bắt buộc:**
    *   Cấm tin tưởng tuyệt đối vào ID do client truyền lên qua body để xác định quyền sở hữu.
    *   Bắt buộc đối chiếu ID người dùng trích xuất từ JWT Access Token an toàn đã được mã hóa (`user.id`) với trường sở hữu của tài nguyên trong cơ sở dữ liệu (đã cài đặt qua **AbilitiesGuard ABAC**).

---

### 🛡️ 2. A02: Cryptographic Failures (Lỗi mã hóa dữ liệu nhạy cảm)
*   **Mô tả nguy cơ:** Lưu trữ mật khẩu dạng bản rõ (Plaintext), sử dụng thuật toán băm yếu (`MD5`, `SHA1`), hoặc không mã hóa dữ liệu đường truyền làm rò rỉ dữ liệu người dùng.
*   **Giải pháp phòng ngừa bắt buộc:**
    *   **Mật khẩu:** Băm mật khẩu bằng thuật toán **Argon2id** hoặc **Bcrypt** kèm muối ngẫu nhiên (salt) độ phức tạp cao (`salt_rounds >= 10`).
    *   **Dữ liệu tĩnh nhạy cảm (PII):** Sử dụng thuật toán mã hóa đối xứng công nghiệp tiêu chuẩn **AES-256-GCM**.
    *   **Dữ liệu đường truyền:** Kích hoạt HTTPS bắt buộc, chứng chỉ TLS 1.3, và cấu hình cờ bảo mật cookies `Secure`, `HttpOnly`.

---

### 🛡️ 3. A03: Injection (Tấn công tiêm độc SQLi / XSS)
*   **Mô tả nguy cơ:** Kẻ tấn công chèn các chuỗi SQL độc hại vào ô tìm kiếm hoặc tiêm các đoạn mã JavaScript độc hại (`<script>alert('XSS')</script>`) vào nội dung định nghĩa từ vựng để chạy ngầm trên máy của người học khác.
*   **Giải pháp phòng ngừa bắt buộc:**
    *   **SQL Injection:** Sử dụng **Prisma ORM** với cơ chế Parameterized Queries tích hợp sẵn, giúp tự động gỡ bỏ các ký tự điều khiển SQL nguy hiểm.
    *   **Cross-Site Scripting (XSS):** Sử dụng **`DOMPurify`** ở Frontend để làm sạch hoàn toàn nội dung HTML đầu ra do người dùng nhập lên trước khi gán vào thuộc tính `dangerouslySetInnerHTML`.
    *   **Cấu hình Content Security Policy (CSP):** Trả về CSP Header nghiêm ngặt ở cổng API Gateway để chặn đứng việc tải mã script từ các domain lạ không khai báo sẵn.

---

### 🛡️ 4. A04: Insecure Design (Thiết kế hệ thống thiếu an toàn)
*   **Mô tả nguy cơ:** Hệ thống thiếu các cơ chế giới hạn tài nguyên, cho phép đăng ký tài khoản vô hạn hoặc không khống chế kích thước file upload.
*   **Giải pháp phòng ngừa bắt buộc:**
    *   **Fail-Safe Defaults (Mặc định An toàn):** Mọi tính năng, thư viện khi tạo mới phải có trạng thái an toàn nhất làm mặc định (ví dụ: Gói từ vựng tạo ra mặc định là cá nhân `isPublic: false`, phân quyền mặc định là thấp nhất `USER`).
    *   **Input Limitation:** Khống chế dung lượng tệp tin tải lên (ví dụ: giới hạn avatar tối đa 2MB), chặn đứng các cuộc tấn công cạn kiệt ổ cứng server (Disk Exhaustion).

---

### 🛡️ 5. A05: Security Misconfiguration (Cấu hình bảo mật sai sót)
*   **Mô tả nguy cơ:** Để lộ lỗi hệ thống chi tiết (Stack Trace) trên môi trường Production hoặc cấu hình CORS bừa bãi (`Access-Control-Allow-Origin: *`) cho phép mọi domain ngoài tấn công CSRF.
*   **Giải pháp phòng ngừa bắt buộc:**
    *   **Tắt chế độ debug trên Production:** Cấu hình Global Exception Filter để tự động ẩn Stack Trace khi ứng dụng chạy trên Production, chỉ trả về mã lỗi chung và log Stack Trace vào file log bảo mật cục bộ.
    *   **Cấu hình CORS nghiêm ngặt:** Chỉ cho phép danh sách trắng (Whitelisted Origins) là các domain chính thức của dự án (`*.sparknested.com`) kết nối API Backend.
