# 📈 Developer 30-60-90 Onboarding Plan

Kế hoạch nhập cuộc 30-60-90 ngày được thiết lập nhằm giúp các kỹ sư mới gia nhập **Spark-Nexus-Ed** nhanh chóng hòa nhập văn hóa làm việc, làm chủ hệ thống công nghệ phức tạp (Nx Monorepo, DDD, CQRS, Spaced Repetition) và đạt được hiệu suất đóng góp tốt nhất trong thời gian ngắn nhất.

---

## 1. Giai Đoạn 1: Học Tập & Thích Ứng (Days 1 - 30)

*   **Trọng tâm**: Làm quen cấu trúc mã nguồn, thấu hiểu ranh giới nghiệp vụ (Bounded Contexts), thiết lập mượt mà môi trường phát triển và thực hiện các đóng góp mã nguồn (Pull Requests) đầu tiên dưới sự giám sát.

### 📅 Lộ Trình Chi Tiết Từng Tuần (Month 1 Weekly Plan)

#### 🔹 Tuần 1: Thiết lập & Định hình (Setup & Alignment)
*   **Mục tiêu**: Hoàn tất cài đặt máy trạm cục bộ và liên kết thành công Doppler.
*   **Hành động**:
    *   Thực hiện toàn bộ quy trình tại [Workstation Setup Guide](03-workstation-setup-guide.md).
    *   Tham gia buổi họp Onboarding kỹ thuật với Buddy được phân công để giới thiệu tổng quan dự án.
    *   Tìm hiểu về sơ đồ luồng thông tin, quy trình làm việc Agile/Scrum của Squad.

#### 🔹 Tuần 2: Đọc hiểu Codebase & Bắt đầu với Bugs nhỏ (Codebase Discovery)
*   **Mục tiêu**: Làm quen với cấu trúc Nx Monorepo và quy trình làm việc với Git/Jira.
*   **Hành động**:
    *   Đọc và thấu hiểu cẩm nang [Clean Code Hard Limits](../02-global-engineering-laws/02-clean-code-hard-limits.md) và [Naming Laws](../02-global-engineering-laws/03-naming-and-formatting-law.md).
    *   Tìm hiểu cấu trúc thư mục của 2 modules lớn: `module-user` và `module-vocabulary`.
    *   Nhận và giải quyết 1-2 tickets sửa lỗi giao diện nhỏ (CSS/HTML alignment) hoặc API endpoints phụ dưới sự kèm cặp của Buddy.

#### 🔹 Tuần 3: Pull Request Đầu tiên & Đảm bảo Chất lượng (First Feature PR & Quality Gates)
*   **Mục tiêu**: Độc lập hoàn thành một nhiệm vụ nhỏ và vượt qua tất cả các chốt chặn chất lượng kiểm thử.
*   **Hành động**:
    *   Phát triển một tính năng nhỏ được giao trong Sprint.
    *   Viết Unit Tests cho phần code viết mới đạt độ bao phủ $\ge 80\%$.
    *   Tự chạy kiểm thử tĩnh, linter cục bộ và đẩy PR lên GitHub để kích hoạt CI/CD. Đảm bảo pass 100% linter và SonarQube Gates.

#### 🔹 Tuần 4: Đi sâu vào Nghiệp vụ & Sprint Lifecycle
*   **Mục tiêu**: Nắm vững thuật toán ôn tập ngắt quãng (SRS SM2) và chủ động tham gia vận hành nhóm.
*   **Hành động**:
    *   Đọc tài liệu phân tích nghiệp vụ và mã nguồn thuật toán SM2 trong `packages/backend/domain/src/logic/spaced-repetition.ts`.
    *   Tham gia đầy đủ buổi họp Sprint Planning, chủ động đặt câu hỏi và tham gia ước lượng (estimation) độ khó của Tickets.

### 📊 Tiêu Chí Đánh Giá Thành Công (Success Metrics - Month 1):
*   Hoàn thành thiết lập máy workstation cục bộ trong **2 ngày đầu**.
*   Gửi ít nhất **2 Pull Requests** sạch, không vi phạm bất kỳ luật Quality Gate nào của SonarQube (coverage $\ge 80\%$, zero code smell).

---

## 2. Giai Đoạn 2: Đồng Kiến Tạo & Độc Lập Phát Triển (Days 31 - 60)

*   **Trọng tâm**: Tham gia sâu vào thiết kế nghiệp vụ phức tạp, độc lập chịu trách nhiệm phân phối các tính năng có độ khó trung bình và nâng cao kỹ năng kiểm thử tự động.

### 🎯 Các Mục Tiêu Cụ Thể (Milestones):
1.  **Làm chủ luồng nghiệp vụ Spaced Repetition (SRS)**: Thấu hiểu chi tiết thuật toán tính toán chu kỳ ôn tập SuperMemo-2 và tích hợp trơn tru giữa UI biên tập từ vựng với backend database.
2.  **Phát triển tính năng độc lập**: Chịu trách nhiệm end-to-end cho ít nhất một user story trong Sprint (từ thiết kế API DTO, viết logic DB migration, viết handler cho đến render UI React).
3.  **Nâng cao chất lượng kiểm thử**: Viết Unit Tests đầy đủ kết hợp Mocking Factory qua tài liệu [Test Data Factory](../09-testing-quality-gates/02-test-data-factory-mocking.md).

### 📋 Checklist Nhiệm Vụ Chi Tiết:
*   [ ] Đọc hiểu sâu sắc về kiến trúc CQRS và Saga Pattern trong dự án.
*   [ ] Thiết kế và bổ sung ít nhất một bảng dữ liệu thông qua Prisma Migration an toàn, không gây downtime.
*   [ ] Thiết kế API và viết Controller/Handler cho tính năng mới tuân thủ chuẩn RESTful API.
*   [ ] Thực hiện review chéo mã nguồn (Code Review) của các đồng nghiệp khác trong Squad trên tinh thần xây dựng.

### 📊 Tiêu Chí Đánh Giá Thành Công (Success Metrics - Month 2):
*   Độc lập giải quyết các ticket nghiệp vụ trung bình không cần sự can thiệp trực tiếp hay chỉ tay năm ngón từ Tech Lead.
*   Không phát sinh hồi quy lỗi (regression bugs) nghiêm trọng trên môi trường Staging/Production từ phần code do bạn viết.

---

## 3. Giai Đoạn 3: Tự Chủ Hoàn Toàn & Đóng Góp Nền Tảng (Days 61 - 90)

*   **Trọng tâm**: Trở thành kỹ sư nòng cốt có khả năng tự chủ cao trong Squad, đóng góp cải tiến chất lượng hệ thống nền tảng, và sẵn sàng hỗ trợ kỹ thuật cho các thành viên mới.

### 🎯 Các Mục Tiêu Cụ Thể (Milestones):
1.  **Làm chủ thiết kế kiến trúc nâng cao**: Đóng góp ý kiến thiết kế hoặc tối ưu hóa hiệu năng cơ sở dữ liệu, tối ưu hóa bộ nhớ đệm Redis Cache-Aside.
2.  **Tối ưu hóa mã nguồn**: Tìm kiếm, phát hiện và refactor thành công ít nhất một phân vùng code cũ bị nợ kỹ thuật (Technical Debt) theo luật "Boy Scout Rule".
3.  **Chia sẻ tri thức**: Thực hiện ít nhất một buổi chia sẻ công nghệ (Tech Talk) nội bộ hoặc bổ sung cẩm nang hướng dẫn kỹ thuật vào thư mục `docs/`.

### 📋 Checklist Nhiệm Vụ Chi Tiết:
*   [ ] Nghiên cứu và áp dụng cơ chế bảo mật chống tấn công của dự án qua [OWASP Mitigation Playbook](../08-security-compliance-matrix/04-owasp-mitigation-playbook.md).
*   [ ] Tối ưu hóa câu lệnh truy vấn SQL chậm hoặc cơ chế ghi đè cache Redis.
*   [ ] Hướng dẫn nhập cuộc (Buddy-onboarding) cho một kỹ sư mới gia nhập đội ngũ.

### 📊 Tiêu Chí Đánh Giá Thành Công (Success Metrics - Month 3):
*   Được toàn bộ Squad đánh giá cao về tinh thần chủ động (Proactivity) và khả năng làm việc độc lập.
*   Năng suất viết code và phân phối tính năng ổn định qua các Sprint (Velocity).

---

## 4. Quy Trình 1-on-1 Feedback Loops

Để đảm bảo bạn nhận được sự hỗ trợ kịp thời và định hướng phát triển rõ ràng, chúng tôi thiết lập chu kỳ phản hồi ngắn 1-on-1 giữa bạn với Buddy và Tech Lead:

```
[Weekly Check-in] ➡️ [Bi-weekly Alignment] ➡️ [Monthly Review]
  (Với Buddy)           (Với Tech Lead)       (Với Manager)
```

1.  **Weekly Buddy Check-in (15 phút - Thứ Sáu hàng tuần)**:
    *   *Mục đích*: Tháo gỡ các khó khăn kỹ thuật local, giải thích nhanh các logic nghiệp vụ phức tạp.
    *   *Câu hỏi mẫu*: *"Bạn có gặp khó khăn gì trong việc setup hoặc hiểu luồng code tuần này không?"*
2.  **Bi-weekly Tech Lead Alignment (30 phút - Giữa Sprint)**:
    *   *Mục đích*: Review chất lượng code, định hướng thiết kế kiến trúc các PRs đang làm và tháo gỡ điểm nghẽn tích hợp.
    *   *Câu hỏi mẫu*: *"Bạn có đề xuất gì để cải tiến cách viết test hoặc tối ưu hóa API hiện tại không?"*
3.  **Monthly Manager Review (45 phút - Cuối mỗi tháng)**:
    *   *Mục đích*: Đánh giá tiến độ hoàn thành so với kế hoạch 30-60-90 ngày, lắng nghe tâm tư nguyện vọng và thống nhất mục tiêu cho tháng tiếp theo.
    *   *Câu hỏi mẫu*: *"Bạn cảm thấy văn hóa làm việc của nhóm thế nào? Chúng tôi có thể làm gì để hỗ trợ bạn hòa nhập tốt hơn?"*

---

## 5. Buddy Playbook (Cẩm Nang Dành Cho Người Đồng Hành)

Nếu bạn được phân công làm **Buddy (Người đồng hành)** cho kỹ sư mới, bạn là người chịu trách nhiệm trực tiếp cho sự thành bại trong tháng đầu tiên của newcomer. Hãy tuân thủ cẩm nang sau:

*   **Ngày 1 - 2**:
    *   Đón tiếp nồng hậu, dẫn dắt newcomer giới thiệu với toàn bộ các thành viên trong Tribe.
    *   Hỗ trợ newcomer cài đặt máy trạm, cấu hình tài khoản Doppler và chạy thành công dự án local.
*   **Tuần đầu tiên**:
    *   Duy trì buổi **Daily Check-in 10 phút** vào cuối ngày để giải đáp mọi thắc mắc vụn vặt của newcomer.
    *   Tránh giải quyết hộ hoàn toàn bài toán kỹ thuật, thay vào đó hãy chỉ ra tệp tài liệu hướng dẫn tương ứng để newcomer rèn luyện khả năng đọc tài liệu hệ thống.
*   **Tuần 2 - 4**:
    *   Giao cho newcomer các nhiệm vụ nhỏ vừa sức, hướng dẫn chi tiết luồng nghiệp vụ liên quan.
    *   Review Pull Requests của newcomer kỹ lưỡng, chỉ ra các điểm vi phạm Clean Code Law một cách nhẹ nhàng, tích cực.
