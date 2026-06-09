# 🏆 ENGINEERING HANDBOOK
### **TÀI LIỆU TIÊU CHUẨN KỸ THUẬT VÀ NGUYÊN TẮC PHÁT TRIỂN PHẦN MỀM**

Sổ tay này là **"Kim chỉ nam"** và là bộ quy chuẩn kỹ thuật bắt buộc cho toàn bộ đội ngũ kỹ sư tại **SparkNestEd** (stylized: `Spark-Nexus-Ed` / `@spark-nest-ed`). 

Các nguyên tắc dưới đây không phải là những lý thuyết sáo rỗng mà là những quy chuẩn sống còn để xây dựng và vận hành một hệ thống **Scalable (Mở rộng được), Maintainable (Dễ bảo trì), Secure (An toàn) và High-Performance (Hiệu năng cao)** trường tồn cùng thời gian.

---

## **🎯 THỨ TỰ ƯU TIÊN THỰC TẾ TRONG PRODUCTION**

Khi đối mặt với các quyết định kỹ thuật, thiết kế hệ thống hoặc đánh giá đánh đổi (**trade-offs**), toàn bộ kỹ sư bắt buộc phải áp dụng ma trận thứ tự ưu tiên tối thượng dưới đây từ cao xuống thấp:

```text
┌────────────────────────────────────────────────────────┐
│  ƯU TIÊN 1: SECURITY (Bảo mật & An toàn thông tin)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  ƯU TIÊN 2: ARCHITECTURE (Kiến trúc & Ranh giới)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  ƯU TIÊN 3: OBSERVABILITY (Giám sát & Truy vết)        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  ƯU TIÊN 4: DATA CONSISTENCY (Nhất quán dữ liệu)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  ƯU TIÊN 5: SOLID PRINCIPLES (Nguyên lý thiết kế)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  ƯU TIÊN 6: DRY (Don't Repeat Yourself)                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  ƯU TIÊN 7: KISS (Keep It Simple, Stupid)              │
└────────────────────────────────────────────────────────┘
```

### **Ý nghĩa thực tế và Bảng Quyết định Trade-offs:**

| Tình huống xung đột | Hướng xử lý chuẩn | Lý do kỹ thuật |
| :--- | :--- | :--- |
| **Bảo mật vs Hiệu năng** | 👉 **Bảo mật thắng** | Hệ thống phản hồi 1ms nhưng làm lộ dữ liệu PII (Personally Identifiable Information) là một thất bại hoàn toàn. |
| **Tiến độ vs Kiến trúc** | 👉 **Kiến trúc thắng** | Hack code để kịp release sẽ tạo ra nợ kỹ thuật (Technical Debt) khổng lồ, làm tê liệt hệ thống về sau. |
| **Hiệu năng vs Giám sát** | 👉 **Giám sát thắng** | Chấp nhận đánh đổi một phần dung lượng I/O để ghi log JSON chi tiết, phục vụ truy vết lỗi trên Production. |

---

## **I. SECURITY STANDARDS (TIÊU CHUẨN BẢO MẬT)**

**Nguyên tắc tối thượng: Không bao giờ tin tưởng Client (Never trust the client).**

### 1. Quản Lý Secrets & Thông Tin Nhạy Cảm
*   **Cấm tuyệt đối:** Không bao giờ hardcode các thông tin nhạy cảm (Private Keys, API Keys, Database Credentials, JWT Secret...) vào mã nguồn hoặc commit lên Git.
*   **Bắt buộc:** Sử dụng biến môi trường `.env` hoặc hệ thống quản lý Secret tập trung (AWS Secrets Manager, HashiCorp Vault).
*   Mọi tệp tin chứa cấu hình cục bộ như `.env`, `.env.local` phải luôn nằm trong danh sách `.gitignore`.

### 2. Bảo Vệ Dữ Liệu Ở Trạng Thái Tĩnh & Truyền Tải (Data-at-Rest & In-Transit)
*   **Mã hóa mật khẩu:** Mật khẩu của người dùng bắt buộc phải được băm (hash) bằng các thuật toán mạnh chống Brute-force/Rainbow Table trước khi lưu vào cơ sở dữ liệu.
    *   *Tiêu chuẩn:* Sử dụng **Argon2id** (Memory cost `65536`, Time cost `2`, Parallelism `1`) hoặc **Bcrypt** với độ phức tạp `salt_rounds >= 10`.
*   **Mã hóa PII:** Các trường thông tin nhạy cảm của người học (Số điện thoại, email) cần được mã hóa bằng thuật toán đối xứng **AES-256-GCM** khi có yêu cầu bảo mật cao.
*   **Bảo mật đường truyền:** Toàn bộ kết nối API phải đi qua giao thức bảo mật **HTTPS** (TLS 1.3) và thiết lập cấu hình **HSTS** (HTTP Strict Transport Security) nghiêm ngặt.

### 3. Xác Thực (Authentication) & Phân Quyền (Authorization)
*   **Giao tiếp Client-Server:** Sử dụng cơ chế JSON Web Token (JWT) an toàn.
*   **Tuổi thọ Token:** JWT Access Token phải có thời gian hết hạn ngắn (`expiresIn <= 15m`). 
*   **Bảo mật Session:** Sử dụng cơ chế **Refresh Token Rotation**. Refresh Token phải được lưu trữ an toàn trong Secure Cookie với các thuộc tính: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`.
*   **Kiểm soát truy cập:** Mọi Endpoint API yêu cầu bảo mật bắt buộc phải được bảo vệ bởi lớp bảo vệ xác thực (**AuthGuard**) và phân quyền chi tiết dựa trên Role/Permission (RBAC/ABAC).

### 4. Kiểm Soát & Làm Sạch Dữ Liệu Đầu Vào (Input Validation & Sanitization)
*   **Validate tại cổng vào:** Validate toàn bộ tham số gửi lên API tại tầng Presentation (Controller) bằng **class-validator** kết hợp với **ValidationPipe** nghiêm ngặt:
    ```typescript
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,             // Tự động loại bỏ các thuộc tính không khai báo trong DTO
      forbidNonWhitelisted: true,  // Ném lỗi nếu client gửi các thuộc tính lạ
      transform: true,             // Tự động cast kiểu dữ liệu
    }));
    ```
*   **Chống tấn công XSS & SQL Injection:**
    *   Sử dụng **Prisma ORM** với cơ chế Parameterized Queries tích hợp sẵn để triệt tiêu hoàn toàn nguy cơ SQL Injection.
    *   Làm sạch (sanitize) toàn bộ nội dung HTML đầu vào từ người dùng gửi lên trước khi lưu trữ hoặc hiển thị lại bằng thư viện **dompurify** hoặc **sanitize-html**.

### 5. Rate Limiting & DDoS Protection
*   Mọi API công khai bắt buộc phải được giới hạn tần suất gọi (**Rate Limiting**).
    *   *Tiêu chuẩn:* API thường tối đa 100 requests/phút từ 1 IP. Các API nhạy cảm như Login, Register, Forget Password tối đa 5 requests/phút từ 1 IP để phòng ngừa brute-force.

---

## **II. ARCHITECTURAL & PLANNING STANDARDS (TIÊU CHUẨN KIẾN TRÚC)**

Kiến trúc phần mềm quan trọng hơn Clean Code. Một hệ thống có kiến trúc tốt có thể "chịu đựng" được những đoạn code tồi, nhưng ngược lại thì một kiến trúc sai lầm sẽ kéo sập toàn bộ dự án.

### 1. Phân Tách Mối Quan Tâm (Separation of Concerns - SoC)
Hệ thống bắt buộc phải tuân thủ nghiêm ngặt ranh giới 4 tầng kiến trúc (Clean Architecture):

```
       PRESENTATION LAYER (Controllers / API Gateway / Entrypoints)
                               │
                               ▼  (Dependency Direction)
       APPLICATION LAYER (Use Cases / Command & Query Handlers / DTOs)
                               │
                               ▼
       DOMAIN LAYER (Core Business Logic / Aggregates / Entities / Value Objects)
                               ▲
                               │  (Dependency Inversion - DIP)
       INFRASTRUCTURE LAYER (Prisma Repositories / BullMQ / Redis / External APIs)
```

*   **Presentation Layer:** Chỉ xử lý giao thức HTTP/gRPC, định tuyến (Routing), validate DTOs đầu vào, giải mã JWT, và chuyển giao quyền xử lý.
*   **Application Layer:** Đóng vai trò điều phối luồng công việc (Orchestration). Nạp Aggregate từ Repository, gọi các phương thức nghiệp vụ của domain, lưu trữ trạng thái mới, và kích hoạt Event. **Không chứa logic tính toán nghiệp vụ hay truy vấn database trực tiếp.**
*   **Domain Layer (Core):** Trái tim của hệ thống. Chứa toàn bộ các thực thể (Entities), thực thể gốc (Aggregates), Value Objects, Domain Events và Domain Services. **Tầng này không được phụ thuộc vào bất kỳ framework kỹ thuật nào (không import NestJS, Prisma, TypeORM...).**
*   **Infrastructure Layer:** Cài đặt các công nghệ hạ tầng cụ thể: Prisma Client, Redis Cache, BullMQ workers, kết nối các API bên ngoài.

### 2. Quy Tắc Hướng Phụ Thuộc & Đảo Ngược Phụ Thuộc (Dependency Rules)
*   **Chiều phụ thuộc:** `Infrastructure` ➡️ `Application` ➡️ `Domain`.
*   **Đảo ngược phụ thuộc (DIP):** Mọi giao tiếp từ Domain ra các tầng ngoài phải thông qua cơ chế Abstraction (Interface) được định nghĩa tại Domain Layer. Tầng Infrastructure chịu trách nhiệm cài đặt chi tiết (implementation).

### 3. Quy Hoạch Module Hóa Monorepo (Nx Workspace Modularity)
*   **Feature-based Organization:** Tổ chức thư mục theo tính năng nghiệp vụ, không gom theo dạng thư mục kỹ thuật monolithic (ví dụ: cấm tạo thư mục chứa toàn bộ controllers của dự án).
*   **Ranh giới Module:** Mỗi module phải được cấu hình thành một **Nx Library** độc lập, giao tiếp thông qua tệp tin đóng gói `index.ts` công khai (Public API).
*   **Shared Kernel & Anti-Corruption Layer (ACL):** Các tích hợp với bên thứ ba (Ví dụ: cổng thanh toán, API từ điển ngoài) bắt buộc phải đi qua một lớp ACL để bảo vệ Domain khỏi các thay đổi từ bên ngoài.

---

## **III. OBSERVABILITY & DATA CONSISTENCY (QUAN SÁT & NHẤT QUÁN DỮ LIỆU)**

### **1. Observability (Khả năng quan sát toàn diện)**
*   **Tuyệt đối cấm:** debug code hoặc in thông tin nhạy cảm trên Production bằng lệnh `console.log`.
*   **Logging tiêu chuẩn:** Sử dụng bộ Logger chuyên dụng (NestJS Logger, Winston). Định dạng ghi log bắt buộc là **Structured JSON Log** để các hệ thống thu thập log (ElasticSearch, Loki) phân tích được.
    *   *JSON Schema chuẩn:* `{ "timestamp": "...", "level": "...", "traceId": "...", "context": "...", "message": "...", "error": "..." }`
*   **Phân cấp Log Level nghiêm ngặt:**
    *   `FATAL`: Hệ thống sập, mất khả năng phục vụ toàn bộ hoặc cấu phần lõi. Cần kích hoạt báo động khẩn cấp (PagerDuty/Slack alert).
    *   `ERROR`: Lỗi nghiệp vụ nghiêm trọng xảy ra trên một request nhưng hệ thống tổng thể vẫn chạy (ví dụ: lỗi gọi API thanh toán thất bại, DB Connection Timeout).
    *   `WARN`: Cảnh báo các sự cố không nghiêm trọng nhưng cần lưu ý (ví dụ: truy cập sai mật khẩu, cache miss, gọi API chậm quá ngưỡng).
    *   `INFO`: Ghi nhận tiến trình thông thường của hệ thống (ví dụ: start/stop application, kết quả xử lý thành công luồng nghiệp vụ lớn).
    *   `DEBUG`/`TRACE`: Chỉ sử dụng khi phát triển cục bộ hoặc trên môi trường Staging/Dev.
*   **Mã định danh liên kết (Correlation ID / Trace ID):** Mọi request đi vào hệ thống phải được gán một mã định danh duy nhất trong HTTP Header (`X-Correlation-ID` hoặc `X-Trace-ID`). Mã này phải xuất hiện xuyên suốt trong tất cả các dòng Log của luồng request đó qua mọi microservice/queue để truy vết lỗi.
*   **Monitoring (4 Golden Signals):** Hệ thống giám sát phải theo dõi chặt chẽ:
    1.  **Latency (Độ trễ):** Thời gian phản hồi của request.
    2.  **Traffic (Lưu lượng):** Số lượng request/phút.
    3.  **Errors (Tỷ lệ lỗi):** Tỷ lệ các request bị trả về mã 5xx.
    4.  **Saturation (Độ bão hòa):** Tải phần cứng hệ thống (CPU, RAM, DB connection pool).

### **2. Data Consistency (Nhất quán dữ liệu)**
*   **Idempotency (Tính lặp lại nhất quán):** Các API ghi dữ liệu nhạy cảm (thanh toán, đổi trạng thái tiến trình học) bắt buộc phải tích hợp kiểm tra `idempotency-key` (sử dụng Redis làm cache khóa khóa học trong thời gian ngắn) để tránh hiện tượng trừ tiền hoặc nhân đôi bản ghi khi client gửi lại request do nghẽn mạng.
*   **DB Transactions & ACID:**
    *   Áp dụng Prisma Transactions (`$transaction`) khi ghi nhận nhiều thay đổi liên đới dữ liệu.
    *   **Cấm:** Tuyệt đối không lồng ghép các tác vụ I/O chậm (như gọi API bên ngoài, ghi file) vào trong một Database Transaction để tránh giữ khóa bảng lâu (DB Lock) gây nghẽn kết nối.
*   **Đồng bộ & Bất đồng bộ lai (Saga vs Queue):**
    *   Khi giao tiếp giữa các Bounded Contexts hoặc Microservices độc lập, phải sử dụng cơ chế **Nhất quán cuối (Eventual Consistency)** thông qua các sự kiện nghiệp vụ (Domain Events).
    *   Đối với các luồng công việc phức tạp liên đới nhiều Aggregate, phải sử dụng mô hình **Saga Pattern** (`Orchestrator`) để điều phối, tự động kích hoạt Compensating Transactions (giao dịch bù trừ) để hoàn tác dữ liệu nếu một mắt xích trong chuỗi bị sập.

---

## **IV. CORE DESIGN PRINCIPLES (NỀN TẢNG THIẾT KẾ)**

### **1. Áp Dụng Triệt Để Nguyên Tắc SOLID**
*   **S - Single Responsibility Principle (SRP):** Một lớp, module hoặc tệp tin chỉ nên có *một lý do duy nhất để thay đổi*. Một hàm chỉ thực hiện đúng một nhiệm vụ duy nhất.
*   **O - Open/Closed Principle (OCP):** Mở để mở rộng, đóng để chỉnh sửa. Khi thêm tính năng mới, ưu tiên sử dụng tính đa hình (Polymorphism) hoặc các mẫu thiết kế (Strategy, Factory) để tránh can thiệp trực tiếp vào mã nguồn cũ đang chạy ổn định.
*   **L - Liskov Substitution Principle (LSP):** Các lớp con phải có khả năng thay thế hoàn toàn lớp cha mà không làm thay đổi tính đúng đắn của chương trình.
*   **I - Interface Segregation Principle (ISP):** Chia nhỏ các interface lớn thành các giao diện nhỏ, đặc thù chức năng để tránh ép buộc lớp cài đặt phải triển khai các phương thức mà chúng không có nhu cầu sử dụng.
*   **D - Dependency Inversion Principle (DIP):** Các module cấp cao không được phụ thuộc vào các module cấp thấp. Cả hai phải phụ thuộc vào Abstraction (Interface).

### **2. DRY, KISS & YAGNI**
*   **DRY (Don't Repeat Yourself):** Không lặp lại cùng một logic nghiệp vụ ở nhiều nơi. 
    *   *Cảnh báo:* Tránh hiện tượng trừu tượng hóa quá sớm (Wrong Abstraction). Thà lặp code 2 lần còn hơn tạo ra một lớp trừu tượng hóa sai lầm gây khó khăn cho việc bảo trì về sau.
*   **KISS (Keep It Simple, Stupid):** Ưu tiên các giải pháp trực quan, cấu trúc code sáng sủa, dễ đọc. Code chạy đúng và dễ đọc luôn tốt hơn một giải pháp thông minh nhưng tối nghĩa.
*   **YAGNI (You Aren't Gonna Need It):** Không phát triển trước các chức năng, tham số hay cơ sở hạ tầng chưa có nhu cầu thực tế ở thời điểm hiện tại. Tránh lỗi thiết kế quá tay (Over-engineering).

---

## **V. CODE QUALITY STANDARDS (TIÊU CHUẨN CHẤT LƯỢNG CODE)**

### 1. Quy Tắc Đặt Tên (Naming Conventions)
*   **camelCase:** Áp dụng kiểu lạc đà cho tên biến, thuộc tính, và phương thức (`vocabularySetId`, `calculateInterval()`).
*   **PascalCase:** Áp dụng cho tên Class, Interface, Enum, Type và Component (`VocabularySetAggregate`, `LanguageVO`).
*   **UPPER_CASE:** Sử dụng cho các hằng số tĩnh toàn cục (`SYNC_THRESHOLD`, `BATCH_SIZE`).
*   **Biến Boolean:** Bắt buộc bắt đầu bằng tiền tố nghi vấn trạng thái: `isActive`, `hasPermission`, `isPublished`, `canEdit`, `shouldRedirect`.
*   **Không viết tắt tùy tiện:** Sử dụng `userRequest` (không dùng `usrReq`), `vocabularySetId` (không dùng `vocId`).

### 2. Quy Tắc Viết Hàm (Function Rules)
*   **Độ dài tối đa:** Hàm không được vượt quá **50 dòng code** (loại trừ comment và dòng trống). Vượt quá giới hạn này bắt buộc phải phân rã thành các hàm bổ trợ nhỏ hơn.
*   **Số lượng tham số:** Tối đa **3 tham số** truyền vào hàm. Nếu nhiều hơn, bắt buộc đóng gói thành một đối tượng DTO hoặc Parameter Object duy nhất.
*   **Side-effects:** Hàm phải hạn chế tối đa các tác dụng phụ ẩn gây thay đổi trạng thái tham số truyền vào từ bên ngoài mà không được báo trước.
*   **Defensive Programming (Lập trình phòng thủ):** Luôn kiểm tra tính hợp lệ của dữ liệu đầu vào (DTO, tham số truy vấn, API Response...) và thoát sớm bằng các khối điều kiện biên (**Guard Clauses / Return Early**) thay vì lồng khối `if-else` vô hạn.

### 3. Quy Tắc Tệp Tin (File Rules)
*   **Độ dài tối đa:** Một tệp tin code không nên dài quá **400 dòng**.
*   **God Class:** Tuyệt đối không tạo ra các Class ôm đồm mọi chức năng của hệ thống.
*   **Circular Dependency:** Cấm thiết lập các phụ thuộc vòng tròn giữa các tệp tin hoặc các modules (Ví dụ: A import B, B lại import A). Sử dụng các công cụ phân tích tĩnh của Nx để phát hiện sớm lỗi này.

### 4. Xử Lý Lỗi (Error Handling)
*   **Custom Exceptions:** Không throw các chuỗi ký tự trần trụi hoặc ném lỗi generic `Error`. Bắt buộc định nghĩa các lớp lỗi tùy chỉnh kế thừa từ HTTP Exceptions chuẩn của NestJS để Client nhận diện được chính xác mã lỗi (ví dụ: `VocabularySetNotFoundException`).
*   **Cấm nuốt lỗi:** Không viết khối lệnh catch rỗng `catch(e) {}` mà không ghi log hay xử lý tiếp. Điều này sẽ làm ẩn các sự cố nghiêm trọng trên Production.

---

## **VI. ĐẶC THÙ CÔNG NGHỆ (SPECIFIC GUIDELINES)**

### **1. Frontend Standards (React 19 / TypeScript)**
*   **Immutability (Tính bất biến):** Không bao giờ chỉnh sửa trực tiếp (mutate) trạng thái `state` của React. Luôn tạo bản sao (copy) để cập nhật trạng thái nhằm duy trì tính nhất quán của vòng đời React:
    ```typescript
    // SAI
    state.items.push(newItem);
    
    // ĐÚNG
    setItems(prevItems => [...prevItems, newItem]);
    ```
*   **Tách biệt logic nghiệp vụ khỏi UI (Page-Container-Component Pattern):**
    *   **Page (`pages/`):** Chỉ làm đầu vào của router, không chứa logic, không `useState`.
    *   **Container (`container/`):** Quản lý trạng thái, nạp dữ liệu bằng Custom Hooks, định nghĩa các hàm xử lý sự kiện tương tác và map dữ liệu xuống Component.
    *   **Component (`components/`):** Dumb UI, nhận dữ liệu qua `props`, render JSX/TSX và CSS. Tuyệt đối không được gọi API hay inject React Query hooks trực tiếp.
*   **Tối ưu hóa hiệu năng render:**
    *   Tránh định nghĩa các hàm JSX phụ bên trong hàm render chính của một Component.
    *   Sử dụng `useMemo` và `useCallback` một cách thông minh khi truyền props dạng object hoặc callback xuống các component con phức tạp để tránh render lại không cần thiết.
    *   Đối với các danh sách siêu lớn (ví dụ: danh sách từ vựng lên đến hàng ngàn từ), bắt buộc sử dụng cơ chế cuộn ảo (**Virtual Scroll / Infinite key**) thay vì render toàn bộ cây DOM.

### **2. Backend Standards (NestJS / Prisma)**
*   **Dependency Injection (DI):** Áp dụng DI triệt để cho toàn bộ các Service, Repository, Handler. Hạn chế sử dụng biến toàn cục hoặc khởi tạo instance trực tiếp bằng từ khóa `new` cho các lớp nghiệp vụ.
*   **Quy trình Phân lớp Chuẩn:** `Controller (Presentation)` ➡️ `Command/Query Bus (Application)` ➡️ `Aggregate Root (Domain)` ➡️ `Repository (Infrastructure)`.
*   **Tách biệt dữ liệu:** Tầng Service nghiệp vụ tuyệt đối không phụ thuộc vào các đối tượng cụ thể của framework HTTP (ví dụ: không truyền `Request` hoặc `Response` object của Express/NestJS vào Service).

### **3. Performance & Resource Awareness (Nhận thức Hiệu năng)**
*   **Ngăn chặn lỗi N+1 Query:** Cấm viết vòng lặp truy vấn cơ sở dữ liệu. Bắt buộc sử dụng cơ chế nạp trước (`include` / `select` của Prisma) hoặc giải pháp **DataLoader** để gộp các truy vấn con lại thành một câu lệnh SQL duy nhất.
*   **Xử lý bất đồng bộ nền (Asynchronous Background Processing):**
    *   Các tác vụ nặng (như import tệp tin từ vựng lớn, gửi email hàng loạt, tính toán thống kê) bắt buộc phải được đẩy vào hàng đợi chạy ngầm (**BullMQ** dựa trên nền Redis).
    *   Đảm bảo Redis được cấu hình chính sách chống trục xuất dữ liệu `noeviction` để bảo vệ an toàn cho hàng đợi.
*   **Caching Strategy (Redis):** Áp dụng mẫu thiết kế **Cache-Aside** cho các dữ liệu có tần suất đọc cực lớn nhưng ít thay đổi (ví dụ: dữ liệu từ điển hệ thống). Bắt buộc xác định thời gian sống (TTL) và xây dựng cơ chế tự động xóa bộ nhớ đệm (Cache Invalidation) khi dữ liệu gốc thay đổi.

### **4. Cơ Sở Dữ Liệu PostgreSQL & Prisma Schema Governance**
*   **Quản lý Di cư (Database Migrations):**
    *   Không bao giờ được tự ý sửa đổi trực tiếp các file SQL migration đã được sinh ra và commit trên Git.
    *   Mọi thay đổi Schema bắt buộc phải thông qua câu lệnh CLI của Prisma (`prisma migrate dev`).
*   **Chiến lược Chỉ mục (Indexing):** Toàn bộ các trường dữ liệu dùng để tìm kiếm, sắp xếp hoặc làm điều kiện lọc thường xuyên bắt buộc phải được thiết lập chỉ mục (**Index** / **Unique Composite Index**).
*   **Xóa mềm (Soft-deletes):** Không xóa vĩnh viễn các bản ghi nghiệp vụ quan trọng. Hãy áp dụng cột trạng thái `deleted: boolean` hoặc `deletedAt: timestamp` để bảo toàn lịch sử dữ liệu và hỗ trợ phục hồi.

---

## **VII. GIT & TEAMWORK WORKFLOW (TIÊU CHUẨN LÀM VIỆC NHÓM)**

Quy trình quản lý mã nguồn là chốt chặn cuối cùng bảo vệ sự ổn định của môi trường Production.

### 1. Quy Tắc Vận Hành Git & Nhánh
*   **TUYỆT ĐỐI CẤM** việc push code trực tiếp (direct push) vào các nhánh chính hệ thống: `main`, `master`, `develop`.
*   Mọi sự thay đổi mã nguồn bắt buộc phải được thực hiện thông qua **Pull Request (PR)** nhắm vào nhánh phát triển `develop`.
*   Quy tắc đặt tên nhánh: `feature/[tên-tính-năng]`, `bugfix/[tên-lỗi]`, `hotfix/[tên-sự-cố-khẩn]`.

### 2. Tiêu Chuẩn Viết Commit (Conventional Commits)
Lịch sử Git bắt buộc phải tuân thủ đúng định dạng: `<type>(<scope>): <subject>`

*   **Các loại hình commit (`type`):**
    *   `feat`: Bổ sung một chức năng mới.
    *   `fix`: Sửa lỗi kỹ thuật.
    *   `docs`: Bổ sung hoặc cập nhật tài liệu hướng dẫn.
    *   `style`: Định dạng code (Prettier, linter).
    *   `refactor`: Tái cấu trúc mã nguồn mà không đổi logic chạy.
    *   `perf`: Cải tiến hiệu năng.
    *   `test`: Viết thêm unit test hoặc bài kiểm thử.
    *   `chore`: Cập nhật cấu hình phụ trợ, thư viện package.json.
*   *Ví dụ:* `feat(vocabulary): tích hợp thuật toán SM-2 tính toán chu kỳ ôn tập SRS`

### 3. Quy Trình Phê Duyệt Pull Request (PR) & CI/CD Quality Gates
*   Một PR chỉ được phép tích hợp (merge) vào nhánh chính khi:
    1.  Hệ thống CI (Continuous Integration) kiểm tra tự động báo **"Xanh (Passed)"** toàn bộ các bài Unit Tests và không còn lỗi Lint.
    2.  Được kiểm duyệt (review) và phê duyệt (Approve) bởi **ít nhất 1 kỹ sư có thẩm quyền** trong đội ngũ phát triển.
    3.  Chỉ số kiểm thử trên SonarQube đáp ứng **Quality Gates**: Độ bao phủ mã nguồn (**Code Coverage**) đạt tối thiểu **80%**, không còn lỗi nghiêm trọng (Blocker/Critical smells).
*   Khi merge, bắt buộc sử dụng cơ chế **Squash and Merge** để gộp toàn bộ các commit thử nghiệm thành một commit sạch duy nhất trên nhánh chính.

---

## **VIII. CODE REVIEW CHECKLIST**
*(Dành cho cả Kỹ sư tạo PR tự kiểm tra và Người duyệt PR đánh giá)*

Trước khi nhấn nút **Merge**, cả hai bên bắt buộc phải tự trả lời nghiêm túc các câu hỏi sau:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MA TRẬN CÂU HỎI CODE REVIEW                           │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ 1. SECURITY Check │ - Đã validate DTO đầu vào kỹ lưỡng chưa?                │
│                   │ - Có thông tin nhạy cảm nào bị hardcode hoặc lộ log ko? │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 2. SOLID Check    │ - Có vi phạm SRP không? Class/Function làm 1 việc ko?   │
│                   │ - Chiều phụ thuộc import có đi đúng hướng ko?           │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 3. KISS Check     │ - Logic viết có đơn giản, trực quan và dễ hiểu không?   │
│                   │ - Có thể tách hàm nhỏ hơn để giảm cognitive load ko?    │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 4. PERFORMANCE    │ - Có chứa vòng lặp thực hiện truy vấn DB (N+1) ko?      │
│                   │ - Tác vụ nặng đã được đẩy vào hàng đợi BullMQ chạy ngầm?│
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 5. OBSERVABILITY  │ - Đã ghi log phân cấp (info/error) kèm Trace ID chưa?   │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 6. TEST Check     │ - Đã viết Unit Test bao phủ kịch bản lỗi & thành công?  │
│                   │ - Độ bao phủ (Coverage) có đạt trên 80% chưa?           │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

---

> [!IMPORTANT]
> **KỶ LUẬT LÀ SỨC MẠNH:**
> Cuốn sổ tay này là văn hóa phát triển cốt lõi của SparkNestEd. Việc tuân thủ khắt khe các quy chuẩn này giúp chúng ta xây dựng một hệ thống phần mềm trường tồn cùng thời gian và mang lại niềm tự hào nghề nghiệp cao nhất cho mỗi kỹ sư trong đội ngũ!
