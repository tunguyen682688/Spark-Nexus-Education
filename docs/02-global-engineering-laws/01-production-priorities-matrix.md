# ⚖️ Production Priorities Matrix

Khi đối mặt với các quyết định kỹ thuật, thiết kế hệ thống hoặc đánh giá đánh đổi (**trade-offs**), toàn bộ đội ngũ kỹ sư tại **SparkNestEd** bắt buộc phải áp dụng ma trận thứ tự ưu tiên tối thượng dưới đây. 

Không một lý do cá nhân hay áp lực tiến độ (deadline) nào được phép đảo lộn thứ tự này. Quy chuẩn này là chốt chặn bảo vệ tính bền vững, an toàn và tin cậy của toàn bộ hệ thống trên môi trường Production.

---

## 🧭 Sơ Đồ Thứ Tự Ưu Tiên Tối Thượng

```text
┌───────────────────────────────────────────────────────────────────┐
│ 🔥 ƯU TIÊN 1: SECURITY & PRIVACY (Bảo mật & Quyền riêng tư)       │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ 🏛️ ƯU TIÊN 2: ARCHITECTURAL PURITY (Đúng kiến trúc DDD & Phân lớp)│
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ 👁️ ƯU TIÊN 3: OBSERVABILITY (Giám sát & Truy vết log chặt chẽ)    │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ 💾 ƯU TIÊN 4: DATA INTEGRITY (Nhất quán dữ liệu tuyệt đối)        │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Giải Thích Chi Tiết 4 Mức Độ Ưu Tiên

### 🛡️ ƯU TIÊN 1: SECURITY & PRIVACY (An toàn thông tin)

> [!CAUTION]
> **Quy tắc thép:** Một API phản hồi nhanh 1ms nhưng làm rò rỉ dữ liệu cá nhân (PII) hoặc cho phép truy cập trái phép là một **thảm họa kỹ thuật**. Bảo mật luôn đứng vị trí số 1.

*   **Bảo vệ dữ liệu PII (Personally Identifiable Information):** Mọi thông tin nhạy cảm của người học (Email, Số điện thoại, Lịch sử giao dịch...) bắt buộc phải được mã hóa ở trạng thái tĩnh (Data-at-Rest) và tự động làm mờ trong log (**Log Masking**).
*   **Xác thực & Phân quyền nghiêm ngặt:** 
    *   Sử dụng JWT Token thời hạn ngắn (`<= 15m`).
    *   Lưu trữ Refresh Token trong `httpOnly, secure, sameSite: 'strict'` Cookie.
    *   Mọi API bắt buộc phải đi qua các lớp Guard để phân quyền hạt mịn (RBAC/ABAC).
*   **Không tin tưởng Client (Zero-Trust):** Mọi dữ liệu đầu vào phải được validate thông qua DTO chặt chẽ (`class-validator`).

### 🏛️ ƯU TIÊN 2: ARCHITECTURAL PURITY (Đúng kiến trúc DDD)

> [!WARNING]
> **Quy tắc thép:** Một tính năng sửa nhanh (Hotfix) cũng không được phép "đi đường tắt" bằng cách phá vỡ ranh giới các tầng kiến trúc. Kiến trúc sai sẽ tích tụ nợ kỹ thuật (Technical Debt) khổng lồ khiến dự án đổ vỡ.

*   **Sự thuần khiết của Domain (Domain Purity):** Tầng Domain là trái tim của nghiệp vụ, tuyệt đối không được phụ thuộc vào bất kỳ framework kỹ thuật nào (NestJS, Prisma ORM, Redis, BullMQ). Mọi giao tiếp ra ngoài phải qua các Interface đảo ngược phụ thuộc (DIP).
*   **Ranh giới Module trong Nx Monorepo:** Ràng buộc chặt chẽ các phụ thuộc giữa các thư viện (`libs/`). Các thành phần thuộc tầng `Infrastructure` có thể import tầng `Application` và `Domain`, nhưng chiều ngược lại là hoàn toàn **CẤM**.
*   **Áp dụng SOLID:** Đảm bảo SRP (Single Responsibility Principle) ở cấp độ Module, Class và Function. Một lớp Service không được vừa truy vấn DB, vừa gửi email, vừa xử lý log nghiệp vụ.

### 👁️ ƯU TIÊN 3: OBSERVABILITY (Khả năng giám sát chặt chẽ)

> [!IMPORTANT]
> **Quy tắc thép:** Hệ thống gặp sự cố trên Production mà chúng ta không biết nguyên nhân tại sao, hoặc tệ hơn là biết qua phản ánh của khách hàng chứ không phải qua hệ thống cảnh báo tự động, đó là sự thất bại của kỹ sư.

*   **Cấm Debug bằng `console.log`:** Mọi thông tin theo dõi trên Production phải sử dụng hệ thống Logger tiêu chuẩn có cấu trúc (Structured JSON Log).
*   **Mã định danh liên kết (Correlation ID / Trace ID):** Toàn bộ các luồng xử lý từ Client đi vào API Gateway, qua các Microservices hoặc hàng đợi (Queue), bắt buộc phải đính kèm Trace ID trên HTTP Header / Metadata để phục vụ truy vết lỗi phân tán (Distributed Tracing).
*   **3 Trụ cột Giám sát:** 
    1.  **Logs:** JSON Structured logs phân cấp rõ ràng (`INFO`, `WARN`, `ERROR`).
    2.  **Metrics:** Prometheus thu thập chỉ số hiệu năng (Latency, Error Rate, CPU/RAM).
    3.  **Tracing:** Jaeger tracing ghi nhận đường đi của từng request nghiệp vụ.

### 💾 ƯU TIÊN 4: DATA INTEGRITY (Nhất quán dữ liệu tuyệt đối)

> [!NOTE]
> **Quy tắc thép:** Dữ liệu sai lệch (ví dụ: tiến trình học tập bị mất, lịch sử thanh toán không khớp, từ vựng bị nhân bản lỗi) trực tiếp làm mất niềm tin của người dùng và gây tổn thất kinh doanh.

*   **Giao dịch Cơ sở dữ liệu (ACID Transaction):** Sử dụng các khối lệnh Transaction (`$transaction` của Prisma) khi thực hiện ghi nhận nhiều thay đổi dữ liệu có tính chất liên đới.
*   **Thiết kế Chống Trùng Lặp (Idempotent):** Đảm bảo các API thay đổi trạng thái (như cập nhật trạng thái gói học, hoàn thành bài test) phải có cơ chế nhận diện `idempotency-key` để tránh xử lý lặp khi mạng chập chờn.
*   **Nhất quán cuối (Eventual Consistency):** Khi giao tiếp giữa các Bounded Contexts hoặc Microservices thông qua Event Message Broker, bắt buộc thiết lập quy trình Saga bù trừ (Compensating Transactions) để tự động hoàn tác khi có một bước bị lỗi.

---

## 📊 Ma Trận Quyết Định Đánh Đổi (Trade-off Decision Matrix)

Để hỗ trợ kỹ sư đưa ra quyết định nhanh chóng và chính xác khi gặp các tình huống mâu thuẫn kỹ thuật, hãy tra cứu bảng hướng dẫn xử lý chuẩn dưới đây:

| Kịch Bản Xung Đột | Hướng Giải Quyết Chuẩn | Lý Do & Giải Thích Chi Tiết |
| :--- | :--- | :--- |
| **Bảo mật vs Hiệu năng**<br>*(Ví dụ: Cần mã hóa dữ liệu trong DB nhưng sợ tăng latency truy vấn)* | 👉 **Chọn Bảo mật** | An toàn thông tin là tuyệt đối. Cần giải quyết bài toán hiệu năng bằng các giải pháp bổ trợ như phân chỉ mục (Index) thông minh, tối ưu hóa câu lệnh Prisma hoặc áp dụng Cache-Aside (Redis) có mã hóa. |
| **Tiến độ (Deadline) vs Kiến trúc**<br>*(Ví dụ: PO muốn release gấp tính năng nhưng viết đúng DDD sẽ tốn thêm 2 ngày)* | 👉 **Chọn Kiến trúc** | Việc viết "tắt" (Hack code) để kịp tiến độ sẽ tạo ra tiền lệ xấu và phá nát cấu trúc Monorepo. Phải báo cáo PO để đàm phán phạm vi tính năng (Scope) thay vì hạ thấp tiêu chuẩn kiến trúc. |
| **Hiệu năng vs Giám sát (Log)**<br>*(Ví dụ: Log JSON chi tiết làm tăng I/O và dung lượng ổ cứng)* | 👉 **Chọn Giám sát** | Chấp nhận đánh đổi một lượng nhỏ hiệu năng I/O để có log chi tiết. Hệ thống chạy cực nhanh nhưng khi lỗi không thể debug thì không có giá trị vận hành. Tối ưu bằng cách cấu hình log level phù hợp (`WARN/ERROR` trên Prod, `DEBUG` trên Staging). |
| **Kiến trúc vs Nhất quán dữ liệu**<br>*(Ví dụ: Cần cập nhật dữ liệu liên Context nhưng DDD cấm gọi DB trực tiếp giữa các Module)* | 👉 **Chọn Kiến trúc** | Không được dùng đường tắt viết câu lệnh SQL/Prisma join qua lại giữa 2 Database của 2 Bounded Contexts khác nhau. Bắt buộc phải đi qua API hoặc Event Broker (RabbitMQ/Kafka) để đạt nhất quán cuối (Eventual Consistency). |
| **Local State vs Data Consistency**<br>*(Ví dụ: Lưu state tạm thời ở Client để UI mượt mà)* | 👉 **Chọn Data Consistency** | UI có thể hiển thị mượt mà tức thời (Optimistic UI) nhưng mọi trạng thái nghiệp vụ cuối cùng bắt buộc phải được đối chiếu và xác nhận chính xác từ Server DB. |

---

## 📋 Quy Trình Áp Dụng Cho Kỹ Sư

1.  **Trong giai đoạn Thiết kế (RFC/ADR):** Phải phân tích rõ giải pháp đề xuất đáp ứng 4 thứ tự ưu tiên như thế nào.
2.  **Trong giai đoạn Viết Code:** Thường xuyên tự đặt câu hỏi: *"Đoạn code này có làm suy giảm tính an toàn (Security) hay kiến trúc (Architecture) của hệ thống chỉ để đổi lấy sự tiện lợi nhất thời hay không?"*
3.  **Trong giai đoạn Code Review:** Người duyệt PR có quyền phủ quyết (Veto) bất kỳ đoạn code nào vi phạm ma trận ưu tiên này, ngay cả khi code đã chạy đúng chức năng.
