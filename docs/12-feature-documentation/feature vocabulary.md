## 1. Module Overview

### 1. Tổng quan Module (Module Overview)

#### 1.1. Module Name 

Vocabulary (Từ vựng)

#### 1.2. Purpose

Cho phép người học xây dựng, duy trì và ôn tập từ vựng thông qua các gói từ cá nhân hóa, flashcards, quizzes và hệ thống lặp lại ngắt quãng (spaced repetition). Module này tích hợp với nội dung đọc và các dịch vụ AI để hỗ trợ học tập theo ngữ cảnh và duy trì bộ nhớ dài hạn.

#### 1.3. Scope

Xử lý việc lưu trữ từ vựng, quản lý gói từ, tạo quiz, theo dõi lặp lại ngắt quãng và chia sẻ cộng đồng.

Không bao gồm (Excludes): Chấm điểm phát âm và phân phối nội dung đọc (việc này thuộc về Module Đọc).

#### 1.4. Stakeholders

- Product Manager
- Backend Engineers
- Front End Engineers
- QA Team
- AI Team
- DevOps
- Security Officer

#### 1.5. Dependencies

- **Reading Module:** Là nguồn cung cấp từ vựng đầu vào (source of words).
- **AI Integration Module:** Hỗ trợ tạo quiz (quiz generation).
- **Analytics Module:** Theo dõi tiến độ học tập của người dùng (progress tracking).
- **Admin CMS:** Hỗ trợ kiểm duyệt (moderation) và nhập/xuất nội dung (content import/export).

### 2. Core Functional Breakdown

Phần này mô tả các khả năng cụ thể mà Module Vocabulary sẽ cung cấp cho người dùng và hệ thống.

#### 2.1. Quản lý Gói từ vựng (Package Management)

Chức năng cho phép người dùng tự tổ chức từ vựng của họ.

- **Tạo Gói từ (Create Package):** Người dùng có thể tạo một gói từ vựng mới (ví dụ: "Từ vựng IELTS Task 2", "Từ vựng công thức nấu ăn").
- **Quản lý Gói từ (Manage Package):** Người dùng có thể đổi tên, xóa, hoặc thêm mô tả cho gói từ.
- **Quản lý Từ trong Gói (Manage Words in Package):\*\***Thêm từ:\*\* Thêm từ mới vào gói (thủ công hoặc từ Module Đọc).
- **Xóa từ:** Xóa một từ ra khỏi gói.
- **Di chuyển từ:** Chuyển từ giữa các gói khác nhau.

#### 2.2. Thu thập Từ vựng (Vocabulary Acquisition)

Chức năng này liên kết chặt chẽ với **Dependency: Reading Module**.

- **Tra cứu nhanh (Quick Lookup):** Khi người dùng chọn một từ trong Module Đọc, hệ thống hiển thị một **_popup modal_ **với định nghĩa cơ bản.
- **Thêm từ vào "Ngân hàng từ" (Add to Word Bank):** Từ pop-up tra cứu, người dùng có nút "Lưu từ này".
- **Phân loại khi lưu (Categorize on Save):** (Nâng cao) Khi lưu từ, hệ thống hỏi người dùng muốn thêm vào gói nào (hoặc tạo gói mới).

#### 2.3. Học và Ôn tập (Learning & Review)

Đây là các phương thức học tập chính của module.

- **Flashcards:\*\***Chế độ học (Learn Mode):\*\* Hiển thị mặt trước (từ) và mặt sau (định nghĩa, ví dụ).
- **Tự đánh giá:** Người dùng tự đánh dấu là "Đã biết" (Known) hoặc "Cần học lại" (Review Again). Kết quả này sẽ được gửi đến hệ thống Spaced Repetition.
- **Tùy chỉnh:** Cho phép lật mặt trước/sau (ví dụ: học từ định nghĩa -> từ).

- **Tạo Quiz (Quiz Generation):** Tích hợp với **Dependency: AI Integration Module**.Người dùng chọn một gói từ và yêu cầu tạo quiz.
- AI Module sẽ tạo các câu hỏi (ví dụ: trắc nghiệm chọn đúng định nghĩa, điền vào chỗ trống trong câu ví dụ).

- **Làm Quiz (Quiz Taking):** Giao diện làm bài quiz và chấm điểm.
- **Xem lại kết quả (Quiz Review):** Hiển thị câu trả lời đúng/sai sau khi hoàn thành quiz.

#### 2.4. Hệ thống Lặp lại Ngắt quãng (Spaced Repetition System - SRS)

Đây là logic lõi để đảm bảo việc ghi nhớ lâu dài, chủ yếu hoạt động ở phía **Backend**.

- **Theo dõi Trạng thái Từ (Word State Tracking):** Mỗi từ của mỗi người dùng sẽ có một "trạng thái học tập" (ví dụ: Mới, Đang học, Đã thành thạo) và một **next review date** (ngày ôn tập tiếp theo).
- **Lên lịch Ôn tập (Review Scheduling):**Khi người dùng đánh dấu "Đã biết" (Known) hoặc trả lời đúng, **next review date** của từ đó sẽ được đẩy lùi xa hơn (ví dụ: +1 ngày, +3 ngày, +7 ngày).
- Khi người dùng đánh dấu "Cần học lại" (Review Again) hoặc trả lời sai, **next review date **sẽ được reset (ví dụ: +10 phút hoặc +1 ngày).

- **Tạo Hàng đợi Ôn tập (Review Queue Generation):** Mỗi ngày, hệ thống tự động tạo một danh sách "Từ cần ôn tập hôm nay" cho người dùng (bao gồm tất cả các từ có **next review date today**.

#### 2.5. Cộng đồng (Community Sharing)

Chức năng cho phép người dùng chia sẻ và sử dụng các gói từ của nhau.

- **Công khai Gói từ (Public Package):** Người dùng có thể chọn "Công khai" (Publish) một gói từ của mình.
- **Kiểm duyệt (Moderation):** (Dependency: Admin CMS) Các gói từ được công khai cần được admin duyệt trước khi hiển thị chung.
- **Khám phá (Discover):** Người dùng có thể tìm k
  iếm, duyệt các gói từ công khai theo chủ đề, lượt tải về, v.v.
- **Thêm/Sao chép Gói từ (Add/Copy Package):** Người dùng có thể thêm gói từ của cộng đồng vào tài khoản cá nhân của mìn

## 2. Functional Responsibilities

### 1. Trách nhiệm về Quản lý Gói từ vựng (Package Management)

Hệ thống có trách nhiệm:

- **Lưu trữ và Truy xuất Gói:** Cung cấp khả năng tạo, đọc, cập nhật và xóa (CRUD) các gói từ vựng (**Package**) thuộc về một người dùng (**User**).
- **Quản lý Mối quan hệ:** Quản lý mối quan hệ "nhiều-nhiều" (**_many-to-many_**) giữa các từ vựng (**Word**) và các gói từ (**Package**).
- **Đảm bảo Quyền sở hữu:** Đảm bảo rằng người dùng chỉ có thể sửa đổi hoặc xóa các gói từ mà họ sở hữu.

### 2. Trách nhiệm về Thu thập Từ vựng (Vocabulary Acquisition)

Hệ thống có trách nhiệm:

- **Tích hợp (Module Đọc):** Cung cấp một điểm cuối API (API endpoint) để Module Đọc có thể gửi dữ liệu (từ, ngữ cảnh) về cho Module Từ vựng khi người dùng thực hiện tra cứu hoặc lưu từ.
- **Lưu trữ Từ vựng Người dùng:** Lưu lại một bản sao **User Word **của từ vựng gốc, bao gồm các thông tin do người dùng tùy chỉnh (ví dụ: ghi chú cá nhân, hình ảnh riêng).
- **Nhập thủ công:** Cung cấp giao diện cho phép người dùng tự nhập một từ vựng mới (từ, định nghĩa, ví dụ) vào một gói từ.

### 3. Trách nhiệm về Học và Ôn tập (Learning & Review)

Hệ thống có trách nhiệm:

- **Hiển thị Flashcard:** Truy xuất và hiển thị các từ vựng trong một gói từ dưới dạng flashcard (mặt trước/mặt sau).
- **Ghi lại Phản hồi học:** Ghi lại phản hồi của người dùng trên flashcard (ví dụ: "Đã biết", "Cần học lại") và kích hoạt (trigger) logic của SRS.
- **Tích hợp (Module AI):** Gửi yêu cầu (ví dụ: danh sách từ, cấp độ) đến Module AI để tạo câu hỏi quiz.
- **Quản lý Phiên Quiz (Quiz Session):** Nhận dữ liệu quiz từ Module AI, hiển thị câu hỏi cho người dùng, ghi lại câu trả lời và tính toán điểm số cuối cùng.
- **Cập nhật Tiến độ:** Thông báo cho Module SRS và Module Analytics về kết quả của phiên học (flashcard hoặc quiz) để cập nhật trạng thái từ.

### 4. Trách nhiệm về Hệ thống Lặp lại Ngắt quãng (Spaced Repetition System - SRS)

Hệ thống có trách nhiệm:

- **Theo dõi Trạng thái:** Duy trì trạng thái học tập riêng lẻ cho mỗi từ của mỗi người dùng (ví dụ: cấp độ **level, proficiency, ease factor**).
- **Tính toán Lịch trình:** Tự động tính toán và cập nhật ngày ôn tập tiếp theo **next review date**) cho một từ dựa trên kết quả học tập của người dùng (đúng/sai, dễ/khó).
- **Tạo Hàng đợi Ôn tập:** Cung cấp một API (ví dụ: GET /vocabulary/review-queue) để trả về danh sách các từ vựng mà người dùng cần ôn tập _ngay bây giờ_ (dựa trên **next review date**).

### 5. Trách nhiệm về Cộng đồng (Community Sharing)

Hệ thống có trách nhiệm:

- **Kiểm soát Truy cập:** Quản lý trạng thái hiển thị của gói từ (ví dụ: **private, public, unlisted**).
- **Kiểm duyệt:** Tích hợp với Admin CMS, đảm bảo các gói từ được đánh dấu là "**Công khai**" (public) phải đi qua hàng đợi kiểm duyệt trước khi hiển thị rộng rãi.
- **Khám phá:** Cung cấp các API để tìm kiếm, lọc và duyệt (**browse**) các gói từ công khai.
- **Sao chép Gói từ:** Cung cấp chức năng cho phép người dùng "sao chép" (clone) một gói từ công khai về tài khoản cá nhân của họ.

## 3. Use Case Specifications

### Quản lý gói từ vựng

#### use case 1: Create Vocabulary Package

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-001 (Sửa đổi)

**Use Case Name**

Tạo Gói từ vựng mới (và thêm từ ban đầu)

**Actor(s)**

Người học (Learner - đã xác thực)

**Description**

Cho phép Người học tạo một gói từ vựng mới, nhập thông tin (tên, mô tả) và đồng thời thêm một danh sách từ vựng ban đầu vào gói đó.

**Trigger**

Người học nhấp vào nút "Tạo Gói mới".

**Preconditions**

Người học đã đăng nhập vào hệ thống.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Tạo Gói mới".

2. Hệ thống hiển thị một biểu mẫu (form) yêu cầu "Tên Gói" (bắt buộc), "Mô tả" (tùy chọn).

3. Biểu mẫu _đồng thời_ cung cấp một giao diện để thêm từ vựng. Giao diện này có thể là:

a) Nhập liệu thủ công (ví dụ: một vùng text để dán danh sách, hoặc các trường $word:definition$).

b) Một công cụ tìm kiếm/chọn từ "Ngân hàng từ" (**Word Bank**) đã lưu của Người học.

4. Người học nhập "Tên Gói".

5. Người học thêm một hoặc nhiều từ vựng thông qua giao diện ở bước 3.

6. Người học nhấn nút "Lưu" (Save) hoặc "Tạo" (Create).

7. Hệ thống xác thực "Tên Gói" (không được trống).

8. Hệ thống tạo một bản ghi **Package** mới, liên kết nó với $UserID$ của Người học.

9. Đối với mỗi từ vựng được thêm vào:

a) Hệ thống kiểm tra/tạo bản ghi **Word** (từ gốc).

b) Hệ thống tạo bản ghi **User Word** (liên kết Người học, từ, và các tùy chỉnh cá nhân).

c) Hệ thống liên kết **User Word** này với **Package** vừa tạo.

d) Hệ thống khởi tạo trạng thái SRS (Spaced Repetition System) cho các từ này.

10. Hệ thống hiển thị gói từ vựng vừa tạo, bên trong đã có các từ được thêm.

**Alternative Flows (Luồng thay thế)**

A1: Người học không thêm từ nào (Tạo gói rỗng)

5a. (Tại bước 5) Người học không thêm bất kỳ từ vựng nào mà nhấn "Lưu" ngay.

5b. Hệ thống (nếu được phép) vẫn tạo gói từ vựng nhưng ở trạng thái rỗng.

5c. Use case tiếp tục từ bước 7.

A2: Tên Gói bị bỏ trống

7a. (Tại bước 7) Hệ thống phát hiện "Tên Gói" bị trống.

7b. Hệ thống hiển thị thông báo lỗi (ví dụ: "Tên gói không được để trống").

7c. Use case quay lại bước 4.

**Postconditions**

Thành công: Một gói từ vựng mới được tạo và liên kết với tài khoản của Người học, có thể chứa (hoặc không) các từ vựng ban đầu.

#### use case 2: update vocabulary set

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-002

**Use Case Name**

Chỉnh sửa thông tin Gói từ vựng (Edit Package Information)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học thay đổi tên và/hoặc mô tả của một gói từ vựng mà họ sở hữu. _Lưu ý: Use case này không bao gồm việc thêm/bớt từ._

**Trigger**

Người học chọn một gói từ và nhấp vào "Chỉnh sửa" (Edit) hoặc "Tùy chọn" (Options).

**Preconditions**

1. Người học đã đăng nhập.

2. Gói từ vựng (Package) tồn tại và thuộc sở hữu của Người học.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Chỉnh sửa" cho một gói từ cụ thể.

2. Hệ thống hiển thị một biểu mẫu được điền sẵn "Tên Gói" và "Mô tả" hiện tại.

3. Người học thay đổi Tên Gói và/hoặc Mô tả.

4. Người học nhấn "Lưu".

5. Hệ thống xác thực Tên Gói mới (không được trống).

6. Hệ thống cập nhật bản ghi **Package** trong cơ sở dữ liệu.

7. Hệ thống hiển thị thông báo thành công và cập nhật tên/mô tả trên giao diện.

**Alternative Flows (Luồng thay thế)**

A1: Hủy bỏ chỉnh sửa

4a. (Tại bước 4) Người học nhấn "Hủy" (Cancel).

4b. Hệ thống đóng biểu mẫu. Không có thay đổi nào được lưu.

4c. Use case kết thúc.

**Postconditions**

Thành công: Tên và/hoặc mô tả của gói từ vựng đã được cập nhật.

#### use case 3: Delete vocabulary Set

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-003

**Use Case Name**

Xóa Gói từ vựng (Delete Vocabulary Package)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xóa vĩnh viễn một gói từ vựng mà họ sở hữu.

**Trigger**

Người học chọn một gói từ và nhấp vào "Xóa" (Delete).

**Preconditions**

1. Người học đã đăng nhập.

2. Gói từ vựng tồn tại và thuộc sở hữu của Người học.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Xóa" cho một gói từ cụ thể.

2. Hệ thống hiển thị một thông báo xác nhận (ví dụ: "Bạn có chắc muốn xóa gói 'XYZ'? Hành động này không thể hoàn tác.")."

3. Hệ thống (quan trọng) làm rõ: "Việc xóa gói sẽ _không_ xóa các từ vựng ra khỏi Ngân hàng từ của bạn. Chứng chỉ bị gỡ khỏi gói này."

4. Người học xác nhận hành động xóa.

5. Hệ thống xóa bản ghi $Package$ khỏi cơ sở dữ liệu.

6. Hệ thống xóa tất cả các bản ghi _liên kết_ (trong bảng** Package World Link**) giữa gói này và các **User Word**. 7. Hệ thống làm mới danh sách gói từ, gói đã xóa biến mất.

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ xóa**

4a. (Tại bước 4) Người học chọn "Hủy" (Cancel) trên thông báo xác nhận.

4b. Use case kết thúc. Không có gì bị xóa.

**Postconditions**

**Thành công:** Gói từ vựng và các liên kết của nó bị xóa. Các bản ghi **User Word **vẫn được giữ lại (ở trạng thái "chưa phân loại" nếu chúng không thuộc gói nào khác).

#### use case 4: Duplicate Vocabulary Package

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-004

**Use Case Name**

Nhân đôi Gói từ vựng (Duplicate Vocabulary Package)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học tạo một bản sao (copy) của một gói từ vựng. Bản sao này là một gói mới độc lập nhưng chứa tất cả các từ của gói gốc.

**Trigger**

Người học chọn một gói từ (gói gốc) và nhấp vào "Nhân đôi" (Duplicate).

**Preconditions**

1. Người học đã đăng nhập.

2. Gói từ vựng gốc tồn tại. (Người học có thể nhân đôi gói của chính mình _hoặc_ gói của cộng đồng).

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Nhân đôi" cho "Gói A".

2. Hệ thống hiển thị biểu mẫu tạo gói mới, với "Tên Gói" được điền sẵn là "Bản sao của Gói A" (hoặc "Gói A (Copy)").

3. Người học có thể chỉnh sửa tên này, sau đó nhấn "Xác nhận".

4. Hệ thống tạo một bản ghi **Package** mới (ví dụ: "Gói B") cho Người học.

5. Hệ thống truy xuất tất cả các bản ghi **UserWord** (nếu nhân đôi gói của mình) hoặc **Word** (nếu nhân đôi gói cộng đồng) từ "Gói A".

6. Hệ thống lặp lại danh sách từ này và tạo các liên kết mới (trong **PackageWordLink**) giữa "Gói B" và các từ đó.

7. Hệ thống hiển thị "Gói B" trong danh sách gói của Người học.

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ nhân đôi**

3a. (Tại bước 3) Người học nhấn "Hủy".

3b. Use case kết thúc. Không có gói nào được tạo.

**Postconditions**

**Thành công:** Một gói từ vựng mới được tạo, sở hữu bởi Người học và chứa tất cả các từ của gói gốc. _Lưu ý: Trạng thái SRS của các từ (nếu là nhân đôi gói của chính mình) sẽ được giữ nguyên, vì chúng cùng trỏ đến một bản ghi $User Word$._

#### Use Case 5: Mời Thành viên vào Gói

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-5

**Use Case Name**

Mời Thành viên vào Gói Hợp tác

**Actor(s)**

Người học (Learner - Chủ sở hữu Gói)

**Description**

Cho phép Chủ sở hữu Gói (OWNER) mời một người dùng khác (qua email/username) tham gia chỉnh sửa gói từ vựng.

**Trigger**

Chủ sở hữu nhấp vào "Cài đặt Gói" -> "Thành viên" -> "Mời thành viên".

**Preconditions**

1. Người học đã đăng nhập.

2. Người học phải có vai trò OWNER (Chủ sở hữu) trong bảng PackageMember của gói này.

**Main Flow (Luồng chính)**

1. Chủ sở hữu kích hoạt hành động "Mời".

2. Hệ thống hiển thị ô nhập email/username và một dropdown chọn vai trò (ví dụ: EDITOR).

3. Chủ sở hữu nhập email của Người được mời và chọn vai trò.

4. Chủ sở hữu nhấp "Gửi lời mời".

5. Hệ thống xác thực email/username, tìm User.id của Người được mời.

6. Hệ thống tạo một bản ghi mới trong bảng PackageMember với packageId, userId (của người được mời) và role (ví dụ: EDITOR).

7. **(Dependency)** Hệ thống (Component Notification) gửi một thông báo (UC-VOC-034) đến Người được mời: "Bạn đã được [Tên Chủ sở hữu] mời vào gói '[Tên Gói]'."

**Alternative Flows (Luồng thay thế)**

**A1: Người dùng không tồn tại** 5a. (Tại bước 5) Hệ thống không tìm thấy người dùng với email/username đã nhập. 5b. Hệ thống hiển thị lỗi: "Không tìm thấy người dùng này." **A2: Người dùng đã là thành viên** 6a. (Tại bước 6) Hệ thống phát hiện đã tồn tại bản ghi PackageMember cho packageId và userId này. 6b. Hệ thống hiển thị lỗi: "Người dùng này đã là thành viên của gói."

**Postconditions**

**Thành công:** Một bản ghi PackageMember mới được tạo và Người được mời nhận được thông báo.

#### Use Case 6: Quản lý Thành viên (Thay đổi Quyền & Xóa)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-6

**Use Case Name**

Quản lý Thành viên (Thay đổi Quyền & Xóa)

**Actor(s)**

Người học (Learner - Chủ sở hữu Gói)

**Description**

Cho phép Chủ sở hữu thay đổi vai trò (ví dụ: EDITOR sang OWNER) hoặc xóa một thành viên ra khỏi gói hợp tác.

**Trigger**

Chủ sở hữu vào trang "Quản lý Thành viên" của gói.

**Preconditions**

1. Người học đã đăng nhập.

2. Người học phải có vai trò OWNER của gói này.

**Main Flow (Luồng chính - Thay đổi Quyền)**

1. Chủ sở hữu xem danh sách thành viên (lấy từ bảng PackageMember).

2. Chủ sở hữu nhấp vào dropdown vai trò bên cạnh một thành viên (ví dụ: "User B" - EDITOR).

3. Chủ sở hữu chọn vai trò mới (ví dụ: OWNER).

4. Hệ thống hiển thị cảnh báo: "Bạn có chắc muốn chuyển quyền sở hữu? Bạn sẽ trở thành EDITOR."

5. Chủ sở hữu xác nhận.

6. Hệ thống cập nhật bản ghi PackageMember của "User B" thành OWNER, và cập nhật bản ghi của Chủ sở hữu (Actor) thành EDITOR.

7. Giao diện được làm mới, "User B" bây giờ là Chủ sở hữu.

**Alternative Flows (Luồng thay thế - Xóa Thành viên)**

**A1: Xóa Thành viên (Remove Member)**

1a. (Tại bước 1) Chủ sở hữu nhấp vào nút "Xóa" (Remove) bên cạnh thành viên "User C".

2a. Hệ thống hiển thị xác nhận: "Bạn có chắc muốn xóa [User C] khỏi gói?"

3a. Chủ sở hữu xác nhận. 4a. Hệ thống xóa (DELETE) bản ghi PackageMember của "User C" khỏi CSDL. 5a. Danh sách thành viên được làm mới.

**Postconditions**

**Thành công:** Vai trò thành viên được cập nhật, hoặc thành viên bị xóa khỏi gói.

### Học và Ôn tập (Lõi)

#### Use Case 7: Xem Hàng đợi Ôn tập (SRS Queue)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-7

**Use Case Name**

Xem Hàng đợi Ôn tập (SRS Queue)

**Actor(s)**

Người học (Learner)

**Description**

Hiển thị cho Người học danh sách các từ vựng (từ UserLearningData) mà hệ thống SRS xác định là "đến hạn" ôn tập hôm nay.

**Trigger**

Người học nhấp vào nút "Ôn tập" (Review) hoặc truy cập trang chủ học tập.

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động.

2. Hệ thống (Component Learning & SRS) thực hiện một truy vấn đến CSDL (đã được tối ưu hóa bằng Index): SELECT \* FROM UserLearningData WHERE userId = [ID của Người học] AND status = 'LEARNING' AND next_review_at <= NOW() AND deletedAt IS NULL ORDER BY next_review_at ASC LIMIT [Số lượng tối đa, ví dụ: 50]

3. Hệ thống truy xuất danh sách các Sense (nghĩa) từ kết quả trên.

4. Hệ thống hiển thị danh sách này cho Người học, sẵn sàng cho phiên học (UC-VOC-8).

**Alternative Flows (Luồng thay thế)**

**A1: Hàng đợi trống** 2a. (Tại bước 2) Truy vấn không trả về bản ghi nào. 3a. Hệ thống hiển thị thông báo: "Tuyệt vời! Bạn đã hoàn thành tất cả các từ cần ôn tập hôm nay."

**Postconditions**

**Thành công:** Người học thấy được danh sách các từ cần ôn tập ngay bây giờ.

#### Use Case 8: Học bằng Flashcard (Đánh giá SRS)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-8

**Use Case Name**

Học bằng Flashcard (Đánh giá SRS)

**Actor(s)**

Người học (Learner)

**Description**

Người học xem một flashcard và tự đánh giá mức độ ghi nhớ của mình, thông tin này sẽ cập nhật lại hệ thống SRS.

**Trigger**

Người học bắt đầu một phiên học (từ UC-VOC-7 hoặc từ một Gói từ vựng).

**Preconditions**

1. Có ít nhất 1 từ (Sense) trong hàng đợi/gói học.

**Main Flow (Luồng chính)**

1. Hệ thống hiển thị mặt trước của flashcard (ví dụ: Entry.word - "Serendipity").

2. Người học cố gắng nhớ lại.

3. Người học nhấp "Lật thẻ" (Flip).

4. Hệ thống hiển thị mặt sau (ví dụ: Sense.definition và Example.example_text).

5. Hệ thống hiển thị các nút đánh giá SRS: "Học lại" (Again), "Khó" (Hard), "Tốt" (Good), "Dễ" (Easy).

6. Người học nhấp vào một nút (ví dụ: "Tốt").

7. **(Logic Cốt lõi)** Hệ thống (Component Learning & SRS) tính toán lại trạng thái của từ này: _ status = 'LEARNING' _ srs_level tăng lên (ví dụ: từ 2 -> 3). _ next_review_at được lùi xa hơn (ví dụ: NOW() + 3 days). _ last_reviewed_at = NOW().

8. Hệ thống cập nhật (UPDATE) bản ghi UserLearningData tương ứng trong CSDL.

9. **(Dependency)** Hệ thống phát một sự kiện word.reviewed (để Component Engagement (Mục 6) có thể bắt và cập nhật StudyLog / currentStreak).

10. Hệ thống hiển thị flashcard tiếp theo trong hàng đợi.

11. Lặp lại cho đến khi hết hàng đợi.

**Postconditions**

**Thành công:** Các bản ghi UserLearningData cho các từ trong phiên đã được cập nhật lịch ôn tập mới.

**Use Case 9: Tùy chỉnh Chế độ học**

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-9

**Use Case Name**

Tùy chỉnh Chế độ học

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học lọc hoặc thay đổi cách thức của phiên học flashcard trước khi bắt đầu.

**Trigger**

Người học nhấp vào "Tùy chọn" (Options) trước khi bắt đầu một phiên học (UC-VOC-8).

**Preconditions**

1. Người học sắp bắt đầu một phiên học.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Tùy chọn".

2. Hệ thống hiển thị một pop-up/modal với các lựa chọn: _ **Loại từ:** [ ] Chỉ từ mới (status='NEW'), [ ] Chỉ từ đang học (status='LEARNING'), [ ] Tất cả. _ **Thứ tự:** [ ] Ngẫu nhiên, [ ] Theo thứ tự trong gói. \* **Lật thẻ:** [ ] Mặt trước (Từ), [ ] Mặt sau (Định nghĩa).

3. Người học chọn các tùy chọn (ví dụ: "Chỉ từ mới" và "Lật mặt sau").

4. Người học nhấp "Bắt đầu".

5. Hệ thống khởi tạo phiên học (UC-VOC-8) với các tham số đã được lọc và tùy chỉnh này.

**Postconditions**

**Thành công:** Phiên học được bắt đầu với các quy tắc do người dùng định nghĩa.

#### Use Case 10: Tự tạo Quiz (Thủ công)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-10

**Use Case Name**

Tự tạo Quiz (Thủ công)

**Actor(s)**

Người học (Learner - Chủ sở hữu Gói / Editor)

**Description**

Cho phép người dùng (có quyền) tự soạn câu hỏi trắc nghiệm cho gói từ vựng của mình.

**Trigger**

Người học (có quyền) vào "Cài đặt Gói" -> "Quản lý Quiz" -> "Tạo câu hỏi".

**Preconditions**

1. Người học có vai trò OWNER hoặc EDITOR trong PackageMember.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Tạo câu hỏi".

2. Hệ thống hiển thị một biểu mẫu (form) soạn thảo.

3. Người học chọn một Sense (nghĩa) từ gói để làm cơ sở cho câu hỏi.

4. Người học nhập questionText (ví dụ: "Đâu là từ đồng nghĩa với...?").

5. Người học nhập các lựa chọn (A, B, C, D) và đánh dấu đáp án đúng.

6. Người học nhấp "Lưu câu hỏi".

7. Hệ thống tạo một bản ghi mới trong bảng ManualQuestion (theo thiết kế CSDL của chúng ta), liên kết nó với packageId.

8. (Tùy chọn) Hệ thống tự động cập nhật Package.quizType = MANUAL.

**Postconditions**

**Thành công:** Một câu hỏi ManualQuestion mới được tạo và liên kết với gói.

#### Use Case 10.1: Tạo Quiz (Tích hợp AI)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-10.1

**Use Case Name**

Tạo Quiz (Tích hợp AI)

**Actor(s)**

Người học (Learner)

**Description**

Yêu cầu hệ thống tự động tạo một bài quiz (kiểm tra) dựa trên các từ vựng trong một gói.

**Trigger**

Người học chọn một gói từ (VocabularySet) và nhấp "Bắt đầu Quiz AI".

**Preconditions**

1. Gói từ vựng có quizType = AI_GENERATED.

2. Gói có ít nhất (ví dụ) 5 từ.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động.

2. Hệ thống (Component Learning & SRS) truy vấn CSDL để lấy tất cả Sense (nghĩa) và Example (ví dụ) liên quan đến packageId này.

3. Hệ thống gửi danh sách dữ liệu từ vựng này đến **Module AI (External Dependency)** với một prompt (ví dụ: "Tạo 10 câu hỏi trắc nghiệm...").

4. Module AI trả về một cấu trúc JSON chứa 10 câu hỏi, lựa chọn và đáp án.

5. Hệ thống tạo một bản ghi QuizSession mới cho userId này (với status = 'IN_PROGRESS').

6. Hệ thống lặp (loop) qua JSON từ AI, tạo 10 bản ghi QuizQuestion tương ứng, liên kết chúng với quiz_session_id vừa tạo và sense_id liên quan.

7. Hệ thống điều hướng Người học đến giao diện "Làm Quiz" (UC-VOC-10.2) với quiz_session_id này.

**Alternative Flows (Luồng thay thế)**

**A1: Lỗi AI**

4a. (Tại bước 4) Module AI trả về lỗi.

4b. Hệ thống hiển thị thông báo: "Không thể tạo quiz lúc này, vui lòng thử lại sau."

**Postconditions**

**Thành công:** Một phiên QuizSession và các QuizQuestion của nó đã được tạo.

#### Use Case 10.2: Làm Quiz (Trả lời câu hỏi)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-10.2

**Use Case Name**

Làm Quiz (Trả lời câu hỏi)

**Actor(s)**

Người học (Learner)

**Description**

Người học trả lời các câu hỏi trong một phiên quiz đã được tạo.

**Trigger**

Người học được điều hướng đến từ UC-VOC-045 (Quiz AI), UC-VOC-10 (Quiz Thủ công), hoặc UC-VOC-10.4 (Thách đấu).

**Preconditions**

1. Tồn tại một QuizSession với status = 'IN_PROGRESS'.

**Main Flow (Luồng chính)**

1. Hệ thống tải QuizSession và các QuizQuestion liên quan (chưa được trả lời).

2. Hệ thống hiển thị câu hỏi đầu tiên (QuizQuestion.question_data).

3. Người học chọn một đáp án (ví dụ: "A").

4. Người học nhấp "Nộp" (Submit) hoặc "Câu tiếp theo" (Next).

5. Hệ thống cập nhật bản ghi QuizQuestion đó: _ SET user_answer = '{"selected": "A"}' _ SET is_correct = [true/false] (bằng cách so sánh với đáp án đúng).

6. **(Dependency)** Nếu is_correct = false, hệ thống (Component Learning & SRS) có thể (tùy chọn) tìm bản ghi UserLearningData của sense_id này và reset srs_level = 0. 7. Lặp lại bước 2-6 cho đến khi hết câu hỏi.

7. Sau câu hỏi cuối cùng, hệ thống tính toán tổng điểm (score).

8. Hệ thống cập nhật bản ghi QuizSession: _ SET status = 'COMPLETED' _ SET completedAt = NOW() \* SET score = [tổng điểm]

9. Hệ thống điều hướng Người học đến "Xem Kết quả Quiz" (UC-VOC-047).

**Postconditions**

**Thành công:** QuizSession được hoàn thành, điểm được ghi lại, và QuizQuestion được cập nhật câu trả lời.

#### Use Case 10.3: Xem Kết quả Quiz

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-10.3

**Use Case Name**

Xem Kết quả Quiz

**Actor(s)**

Người học (Learner)

**Description**

Người học xem lại chi tiết bài làm, câu đúng, câu sai sau khi hoàn thành một quiz.

**Trigger**

Hoàn thành một quiz (UC-VOC-046) hoặc nhấp vào một quiz trong lịch sử.

**Preconditions**

1. QuizSession.status = 'COMPLETED'.

**Main Flow (Luồng chính)**

1. Hệ thống nhận quiz_session_id.

2. Hệ thống truy vấn QuizSession để lấy điểm tổng (score).

3. Hệ thống truy vấn tất cả QuizQuestion liên quan đến quiz_session_id này.

4. Hệ thống hiển thị điểm tổng (ví dụ: "Điểm của bạn: 8/10").

5. Hệ thống lặp (loop) qua danh sách QuizQuestion và hiển thị: _ Nội dung câu hỏi. _ Câu trả lời của người dùng (user_answer). \* Đáp án đúng (và đánh dấu Xanh/Đỏ dựa trên is_correct).

**Postconditions**

**Thành công:** Người học đã xem lại được kết quả bài làm của mình.

#### Use Case 10.4: Thách đấu Quiz

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-010.4

**Use Case Name**

Thách đấu Quiz

**Actor(s)**

Người học (Learner - Người Thách đấu)

**Description**

Gửi một lời mời làm quiz (dựa trên một gói từ vựng) cho một Người học khác và so sánh kết quả.

**Trigger**

Người học chọn một VocabularySet và nhấp "Thách đấu" (Challenge).

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng chính)**

1. Người thách đấu (Actor) kích hoạt hành động "Thách đấu".

2. Hệ thống yêu cầu nhập username/email của Người bị thách đấu (Opponent).

3. Người thách đấu nhập thông tin.

4. Hệ thống tìm User.id của Opponent.

5. Hệ thống tạo một bản ghi QuizChallenge (theo thiết kế CSDL của chúng ta): _ packageId = [ID gói hiện tại] _ challengerId = [ID của Actor] _ opponentId = [ID của Opponent] _ status = 'PENDING'

6. **(Dependency)** Hệ thống (Component Notification) gửi thông báo (UC-VOC-034) đến Opponent: "[Actor] đã thách đấu bạn một quiz!"

7. (Tùy chọn) Hệ thống hỏi Người thách đấu: "Bạn có muốn làm bài quiz của mình ngay bây giờ không?" Nếu có, chạy UC-VOC-10.2 và lưu quiz_session_id vào QuizChallenge.challengerSessionId.

**Alternative Flows (Luồng thay thế)**

**A1: Người bị thách đấu (Opponent) chấp nhận**

1a. Opponent nhấp vào thông báo (UC-VOC-034).

2a. Hệ thống chạy UC-VOC-046 cho Opponent.

3a. Sau khi Opponent hoàn thành, hệ thống lưu quiz_session_id vào QuizChallenge.opponentSessionId VÀ cập nhật status = 'COMPLETED'.

4a. Hệ thống so sánh 2 score từ 2 phiên quiz và gửi thông báo kết quả cho cả hai.

**Postconditions**

**Thành công:** Một bản ghi QuizChallenge được tạo và Opponent nhận được thông báo.

### Quản lý từ trong gói từ

#### Use Case 11: Thêm từ vựng thủ công vào Gói

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-011

**Use Case Name**

Thêm từ vựng thủ công (Add Word Manually)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học tự nhập một từ vựng mới (từ, định nghĩa, ví dụ, v.v.) trực tiếp vào một gói từ vựng cụ thể.

**Trigger**

Người học đang xem một gói từ và nhấp vào nút "Thêm từ mới".

**Preconditions**

1. Người học đã đăng nhập. 2. Gói từ vựng (**Package**) mà Người học đang xem tồn tại và thuộc sở hữu của họ.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Thêm từ mới".

2. Hệ thống hiển thị một biểu mẫu (form) nhập liệu với các trường: "Từ" (bắt buộc), "Định nghĩa" (bắt buộc), "Câu ví dụ" (tùy chọn), "Ghi chú cá nhân" (tùy chọn).

3. Người học điền thông tin cho từ vựng mới.

4. Người học nhấp "Lưu từ".

5. Hệ thống xác thực dữ liệu (ví dụ: "Từ" và "Định nghĩa" không được trống).

6. Hệ thống thực hiện các bước 9a-9d trong (UC-VOC-001) để tạo bản ghi Word, **UserWord**, liên kết với Gói này và khởi tạo trạng thái SRS.

7. Hệ thống làm mới danh sách từ trong gói, hiển thị từ vừa thêm.

8. Hệ thống (tùy chọn) giữ biểu mẫu mở để Người học tiếp tục thêm từ tiếp theo.

**Alternative Flows (Luồng thay thế)**

**A1: Dữ liệu không hợp lệ**

5a. (Tại bước 5) Hệ thống phát hiện trường bắt buộc bị trống.

5b. Hệ thống hiển thị thông báo lỗi (ví dụ: "Vui lòng nhập định nghĩa cho từ này").

5c. Use case quay lại bước 3.

**A2: Người học hủy bỏ**

4a. (Tại bước 4) Người học nhấp "Hủy" hoặc đóng biểu mẫu.

4b. Không có từ nào được lưu. Use case kết thúc.

**Postconditions**

**Thành công:** Một từ vựng mới được tạo, lưu vào "Ngân hàng từ" của Người học và được liên kết với gói từ vựng hiện tại.

#### Use Case 12: Chỉnh sửa chi tiết từ vựng đã lưu

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-012

**Use Case Name**

Chỉnh sửa từ vựng đã lưu (Edit Saved Word)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học chỉnh sửa các thông tin liên quan đến một từ vựng họ đã lưu (ví dụ: sửa định nghĩa, thêm/sửa ghi chú cá nhân, thay đổi câu ví dụ).

**Trigger**

Người học chọn một từ cụ thể trong danh sách (hoặc trên flashcard) và nhấp vào "Chỉnh sửa".

**Preconditions**

1. Người học đã đăng nhập.

2. Bản ghi **UserWord** (từ vựng của người dùng) tồn tại trong tài khoản của họ.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Chỉnh sửa" cho một từ.

2. Hệ thống hiển thị một biểu mẫu tương tự UC-VOC-011, được điền sẵn thông tin hiện tại của từ đó (định nghĩa, ví dụ, ghi chú).

3. Người học thực hiện các thay đổi mong muốn (ví dụ: thêm một "Ghi chú cá nhân").

4. Người học nhấp "Lưu thay đổi".

5. Hệ thống xác thực dữ liệu (nếu cần).

6. Hệ thống cập nhật bản ghi **UserWord** (hoặc các trường tùy chỉnh liên quan) trong cơ sở dữ liệu.

7. Hệ thống hiển thị thông báo thành công và đóng biểu mẫu.

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ chỉnh sửa**

4a. (Tại bước 4) Người học nhấp "Hủy".

4b. Không có thay đổi nào được lưu. Use case kết thúc.

**Postconditions**

**Thành công:** Các chi tiết của bản ghi **UserWord** đã được cập nhật.

#### Use Case 13: Gỡ từ vựng khỏi Gói

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-013

**Use Case Name**

Gỡ từ vựng khỏi Gói (Remove Word from Package)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học gỡ một từ ra khỏi một gói cụ thể. Hành động này _không_ xóa từ đó khỏi "Ngân hàng từ" (**Word Bank**) chung của Người học.

**Trigger**

Người học chọn một (hoặc nhiều) từ trong danh sách từ của gói và nhấp "Gỡ khỏi gói".

**Preconditions**

1. Người học đã đăng nhập.

2. Từ vựng đang nằm trong gói mà Người học đang xem.

**Main Flow (Luồng chính)**

1. Người học chọn một hoặc nhiều từ và kích hoạt hành động "Gỡ khỏi gói".

2. Hệ thống hiển thị thông báo xác nhận (ví dụ: "Bạn có chắc muốn gỡ 2 từ này khỏi gói 'XYZ'? Chúng sẽ vẫn còn trong Ngân hàng từ của bạn.")."

3. Người học xác nhận.

4. Hệ thống xóa bản ghi _liên kết_ (trong bảng **PackageWordLink**) giữa gói này và (các) từ đã chọn.

5. Hệ thống làm mới danh sách từ của gói, các từ đã chọn biến mất.

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ gỡ**

3a. (Tại bước 3) Người học nhấp "Hủy".

3b. Không có gì thay đổi. Use case kết thúc.

**Postconditions**

**Thành công:** Từ vựng không còn thuộc gói này. Bản ghi **UserWord** và trạng thái SRS của nó vẫn tồn tại.

#### Use Case 14: Di chuyển từ vựng giữa các Gói

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-014

**Use Case Name**

Di chuyển từ vựng sang Gói khác (Move Word to another Package)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học di chuyển một (hoặc nhiều) từ vựng từ gói A sang gói B.

**Trigger**

Người học chọn một (hoặc nhiều) từ và nhấp "Di chuyển".

**Preconditions**

1. Người học đã đăng nhập.

2. Người học sở hữu ít nhất hai gói từ (gói Nguồn và gói Đích).

**Main Flow (Luồng chính)**

1. Người học chọn một hoặc nhiều từ trong Gói A và kích hoạt hành động "Di chuyển".

2. Hệ thống hiển thị một danh sách/dropdown các gói từ khác của Người học (Gói B, Gói C...).

3. Người học chọn Gói Đích (ví dụ: Gói B).

4. Hệ thống thực hiện hai hành động (trong một transaction):

a) Xóa liên kết giữa (các) từ và Gói A (như UC-VOC-013).

b) Tạo liên kết mới giữa (các) từ và Gói B.

5. Hệ thống hiển thị thông báo thành công (ví dụ: "Đã di chuyển 2 từ sang Gói B").

6. Hệ thống làm mới danh sách từ của Gói A (các từ đã chọn biến mất).

**Alternative Flows (Luồng thay thế)**

**A1: Sao chép thay vì di chuyển (Copy instead of Move)** (Đây là một biến thể của use case)

2a. Hệ thống có thể cung cấp tùy chọn "Sao chép" (Copy) thay vì "Di chuyển" (Move).

4a. Nếu "Sao chép" được chọn, hệ thống chỉ thực hiện bước

4b (tạo liên kết mới) mà _không_ thực hiện bước 4a (xóa liên kết cũ). Từ đó sẽ tồn tại ở cả hai gói.

**Postconditions**

**Thành công:** Liên kết của từ đã được cập nhật từ Gói A sang Gói B.

#### Use Case 15: Thêm từ hàng loạt (Import) vào Gói

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-015

**Use Case Name**

Thêm từ hàng loạt (Import Words)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học tải lên một tệp tin (ví dụ: CSV, Excel) hoặc dán văn bản (dạng bảng) để thêm nhiều từ vựng cùng lúc vào một gói.

**Trigger**

Người học đang xem một gói từ và nhấp "Import".

**Preconditions**

1. Người học đã đăng nhập.

2. Gói từ vựng tồn tại và thuộc sở hữu của Người học.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Import".

2. Hệ thống hiển thị giao diện tải lên tệp hoặc dán văn bản, cùng hướng dẫn định dạng (ví dụ: "Cột 1: Từ, Cột 2: Định nghĩa, Cột 3: Ví dụ").

3. Người học tải tệp lên hoặc dán văn bản và nhấp "Tiếp theo".

4. Hệ thống phân tích (parse) tệp/văn bản.

5. Hệ thống hiển thị một màn hình xem trước (preview), cho phép Người học "Khớp cột" (map columns) (ví dụ: "Cột A" của tệp là "Từ", "Cột B" là "Định nghĩa").

6. Người học xác nhận việc khớp cột và nhấp "Bắt đầu Import".

7. Hệ thống lặp lại qua từng dòng của tệp/văn bản và thực hiện (UC-VOC-011) cho mỗi từ.

8. Sau khi hoàn tất, hệ thống hiển thị một báo cáo tóm tắt (ví dụ: "Import thành công 48/50 từ. 2 từ bị lỗi/trùng lặp.")."

9. Hệ thống làm mới danh sách từ trong gói.

**Alternative Flows (Luồng thay thế)**

**A1: Lỗi định dạng tệp**

4a. (Tại bước 4) Hệ thống không thể đọc tệp (ví dụ: sai định dạng, tệp bị hỏng).

4b. Hệ thống hiển thị thông báo lỗi (ví dụ: "Không thể đọc tệp. Vui lòng đảm bảo tệp là .csv hoặc .xlsx").

**Postconditions**

**Thành công:** Nhiều từ vựng mới được thêm vào tài khoản của Người học và liên kết với gói hiện tại.

#### Use Case 16: Gắn Thẻ (Tagging) cá nhân cho Từ vựng

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-016

**Use Case Name**

Gắn Thẻ cá nhân cho Từ vựng (Apply Personal Tags to a Word)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học thêm hoặc gỡ các thẻ (tag) tùy chỉnh (ví dụ: **#verb**, **#chapter3**, **#hard**) vào một từ vựng đã lưu để tổ chức và lọc từ vựng theo cách riêng của họ.

**Trigger**

Người học đang xem một từ (trong danh sách, trên flashcard) và nhấp vào "Chỉnh sửa Thẻ" (Edit Tags) hoặc biểu tượng thẻ.

**Preconditions**

1. Người học đã đăng nhập.

2. Bản ghi $UserWord$ (từ vựng của người dùng) tồn tại trong tài khoản của họ.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Chỉnh sửa Thẻ" cho một từ.

2. Hệ thống hiển thị một giao diện (ví dụ: pop-up hoặc ô nhập liệu) hiển thị các thẻ hiện có của từ đó.

3. Giao diện cho phép Người học gõ một thẻ mới hoặc chọn từ danh sách các thẻ họ đã dùng trước đó.

4. Người học thêm một thẻ mới (ví dụ: #hard) và/hoặc gỡ một thẻ cũ.

5. Người học nhấp "Lưu" (Save) hoặc "Hoàn tất" (Done).

6. Hệ thống lưu lại mối quan hệ giữa **UserWord** và (các) thẻ này trong một bảng liên kết (ví dụ: **UserWord_Tag_Link**).

7. Hệ thống cập nhật giao diện, hiển thị các thẻ mới bên cạnh từ vựng.

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ chỉnh sửa**

5a. (Tại bước 5) Người học nhấp "Hủy" hoặc đóng giao diện.

5b. Không có thay đổi nào về thẻ được lưu. Use case kết thúc.

**Postconditions**

**Thành công:** Danh sách các thẻ cá nhân được liên kết với **UserWord** đã được cập nhật.

#### Use Case 17: Đánh dấu Từ vựng "Đã biết"

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-017

**Use Case Name**

Đánh dấu Từ vựng "Đã biết" (Mark Word as Known)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học đánh dấu một từ là "đã biết" (mastered). Hành động này sẽ loại bỏ vĩnh viễn từ đó khỏi hàng đợi ôn tập Spaced Repetition (SRS).

**Trigger**

Người học thấy một từ (trên flashcard, trong danh sách) và nhấp vào nút "Đã biết" (I know this / Mastered).

**Preconditions**

1. Người học đã đăng nhập.

2. Bản ghi UserWord tồn tại và đang ở trạng thái học (learning).

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Đã biết" cho một từ.

2. Hệ thống hiển thị một thông báo xác nhận (ví dụ: "Bạn có chắc không? Từ này sẽ không xuất hiện trong các phiên ôn tập của bạn nữa.")."

3. Người học xác nhận.

4. Hệ thống cập nhật trạng thái của bản ghi **UserWord** (ví dụ: status = 'mastered' hoặc is known = true).

5. Do trạng thái này, hệ thống SRS sẽ tự động loại trừ từ này khỏi Hàng đợi Ôn tập (UC-VOC-003) trong tương lai.

6. Giao diện (ví dụ: danh sách từ trong gói) có thể hiển thị một dấu hiệu (indicator) cho thấy từ này đã được thành thạo.

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ**

3a. (Tại bước 3) Người học nhấp "Hủy" trên thông báo xác nhận.

3b. Trạng thái của từ không thay đổi. Use case kết thúc.

**A2: Hoàn tác (Đánh dấu "Học lại")**

1a. (Trigger thay thế) Người học tìm thấy một từ đã đánh dấu "Đã biết" và nhấp "Học lại" (Mark as 'Learning').

2a. Hệ thống cập nhật **status **= **learning** và reset lịch ôn tập (ví dụ: **next review date** = ngày mai).

**Postconditions**

**Thành công:** Trạng thái SRS của từ được cập nhật thành "mastered" và sẽ không được đưa vào hàng đợi ôn tập.

#### Use Case 18: Xóa Từ vựng vĩnh viễn

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-018

**Use Case Name**

Xóa Từ vựng vĩnh viễn (Delete Word Permanently)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xóa hoàn toàn một từ vựng ra khỏi "Ngân hàng từ" (**WordBank**) cá nhân của họ. Hành động này sẽ gỡ từ đó khỏi _tất cả_ các gói, xóa lịch sử SRS và các ghi chú/thẻ cá nhân.

**Trigger**

Người học chọn một từ và nhấp vào "Xóa vĩnh viễn" (thường nằm trong menu "..." hoặc "nâng cao").

**Preconditions**

1. Người học đã đăng nhập.

2. Bản ghi **UserWord** tồn tại trong tài khoản.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Xóa vĩnh viễn".

2. Hệ thống hiển thị một thông báo cảnh báo _rất mạnh_ (ví dụ: "Hành động này sẽ xóa từ '...' khỏi TẤT CẢ các gói của bạn và xóa toàn bộ lịch sử học tập. Không thể hoàn tác. Bạn có chắc chắn?" ).

3. Người học xác nhận (có thể yêu cầu gõ lại tên từ hoặc tick vào ô "Tôi hiểu").

4. Hệ thống thực hiện xóa (hoặc "soft delete") bản ghi **UserWord** và tất cả các dữ liệu liên quan đến _người dùng này_ (liên kết gói, liên kết thẻ, lịch sử SRS).

5. Từ vựng biến mất khỏi tất cả các giao diện của Người học.

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ**

3a. (Tại bước 3) Người học nhấp "Hủy" trên thông báo cảnh báo.

3b. Không có gì bị xóa. Use case kết thúc.

**Postconditions**

**Thành công:** Bản ghi **UserWord** và tất cả các dữ liệu cá nhân liên quan đến nó đã bị xóa vĩnh viễn khỏi tài khoản của Người học.

### Cộng đồng: Khám phá (Discovery)

#### Use Case 19: Explore, Search and Organize Vocabulary

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-009 (Sửa đổi)

**Use Case Name**

Khám phá, Tìm kiếm và **Sắp xếp** Gói từ vựng Công khai

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học duyệt, tìm kiếm (theo từ khóa) và **sắp xếp** (theo tiêu chí) các gói từ vựng công khai.

**Trigger**

Người học điều hướng đến trang "Cộng đồng" (Community).

**Preconditions**

1. Người học đã đăng nhập. 2. Có ít nhất một gói từ vựng **public** và **approved**.

**Main Flow (Luồng chính - Khám phá & Sắp xếp)**

1. Người học truy cập trang "**Cộng đồng**".

2. Hệ thống truy vấn và hiển thị danh sách các gói từ vựng, **mặc định sắp xếp theo "Phổ biến nhất" (Most Popular) hoặc "Mới nhất" (Newest).**

3. **Hệ thống hiển thị một tùy chọn "Sắp xếp theo" (Sort by) với các lựa chọn (ví dụ: Mới nhất, Phổ biến nhất, Lượt tải nhiều nhất, Đánh giá cao nhất), tìm kiếm từ khóa(search).**

4. **Người học chọn một tiêu chí sắp xếp khác (ví dụ: "Mới nhất").**

5. **Hệ thống thực hiện lại truy vấn và tải lại danh sách, sắp xếp theo tiêu chí mới.**

6. Người học duyệt qua danh sách và có thể nhấp vào một gói để xem chi tiết hoặc sao chép (kích hoạt UC-VOC-008).

**Main Flow (Luồng chính - Tìm kiếm)**

1. Người học nhập một từ khóa (ví dụ: "IELTS") vào thanh tìm kiếm và nhấn "Enter".

2. Hệ thống gửi yêu cầu truy vấn các gói **public** và **approved** khớp với từ khóa.

3. Hệ thống hiển thị kết quả, vẫn áp dụng tiêu chí sắp xếp hiện tại (ví dụ: "Mới nhất" VÀ khớp từ khóa "IELTS").

**Postconditions**

**Thành công:** Người học xem được danh sách các gói từ vựng đã được lọc và sắp xếp theo mong muốn.

#### Use Case 20: Advanced Package Filtering

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-010 (Sửa đổi)

**Use Case Name**

**Lọc Nâng cao (Chi tiết)** Gói từ vựng (Advanced Package Filtering)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học thu hẹp danh sách các gói từ vựng công khai bằng cách áp dụng một hoặc nhiều bộ lọc chi tiết.

**Trigger**

Người học đang ở trang "Cộng đồng" (UC-VOC-009) và nhấp vào nút "Bộ lọc" (Filters).

**Preconditions**

1. Người học đang xem danh sách các gói từ vựng (UC-VOC-009).

2. Hệ thống có định nghĩa các **Category** (Chủ đề) và các thuộc tính khác để lọc.

**Main Flow (Luồng chính)**

1. Người học đang xem danh sách các gói từ vựng.

2. Người học nhấp vào "Bộ lọc".

3. **Hệ thống hiển thị một bảng/menu lọc nâng cao, bao gồm:**

a) **Chủ đề (Category):** Hiển thị dưới dạng danh sách các checkbox (cho phép chọn nhiều chủ đề, ví dụ: "Du lịch" VÀ "Kinh doanh").

b) **Số lượng từ (Word Count):** Hiển thị dưới dạng một khoảng (range slider) hoặc các lựa chọn (ví dụ: "Dưới 20 từ", "20-50 từ", "Trên 50 từ").

c) **Cấp độ (Level):** (Nếu có) Các lựa chọn (ví dụ: "Cơ bản", "Trung bình", "Nâng cao").

4. Người học chọn các tiêu chí lọc mình muốn (ví dụ: Chủ đề = "Du lịch" VÀ Số lượng từ = "20-50 từ").

5. Người học nhấp vào nút "Áp dụng bộ lọc" (Apply Filters).

6. Hệ thống thực hiện lại truy vấn, áp dụng **tất cả** các bộ lọc đã chọn (từ bước 4) VÀ tiêu chí tìm kiếm/sắp xếp (từ UC-VOC-009).

7. Danh sách gói từ vựng trên màn hình được cập nhật ngay lập tức.

**Alternative Flows (Luồng thay thế)**

**A1: Xóa bộ lọc** (Bất kỳ lúc nào) Người học nhấp vào "Xóa tất cả bộ lọc" (Clear All Filters). Hệ thống quay lại trạng thái ban đầu (chỉ áp dụng tìm kiếm hoặc sắp xếp mặc định).

**Postconditions**

**Thành công:** Danh sách các gói từ vựng được hiển thị đã được thu hẹp chính xác theo các tiêu chí lọc chi tiết mà Người học mong muốn.

#### Use Case 21: Xem Chi tiết Gói Công khai

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-019

**Use Case Name**

Xem Chi tiết Gói Công khai (View Public Package Details)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xem thông tin chi tiết và danh sách từ vựng (bản xem trước) của một gói từ vựng công khai trước khi quyết định sao chép về tài khoản.

**Trigger**

Người học nhấp vào tên/thẻ (card) của một gói từ vựng trên trang Khám phá (từ UC-VOC-009).

**Preconditions**

1. Người học đang ở trang Khám phá/Cộng đồng. 2. Gói từ vựng được chọn là **public **và đã được **approved**.

**Main Flow (Luồng chính)**

1. Người học nhấp vào một gói từ (ví dụ: "100 từ vựng Nấu ăn").

2. Hệ thống điều hướng đến một trang chi tiết (hoặc mở một pop-up/modal lớn) cho gói từ đó.

3. Hệ thống hiển thị các thông tin tổng quan:

- Tên Gói, Mô tả chi tiết.

- Tên Người tạo (có thể nhấp để kích hoạt UC-VOC-020).

- Các chỉ số: Số lượng từ, Lượt sao chép, Đánh giá trung bình (nếu có).

- Các Chủ đề/Tags liên quan.

4. Hệ thống hiển thị các nút hành động chính: "Sao chép về tài khoản" (kích hoạt UC-VOC-008), "Yêu thích" (kích hoạt UC-VOC-021), "Lấy link chia sẻ" (kích hoạt UC-VOC-022).

5. **Phần quan trọng:** Hệ thống hiển thị một danh sách (có phân trang/cuộn) _xem trước_ tất cả các từ vựng bên trong gói (ví dụ: cột "Từ", cột "Định nghĩa").

6. Người học xem xét danh sách từ để đánh giá chất lượng gói.

**Alternative Flows (Luồng thay thế)**

**A1: Gói bị lỗi (không có từ)**

5a. (Tại bước 5) Hệ thống phát hiện gói này (vì lý do nào đó) không có từ vựng nào.

5b. Hệ thống hiển thị thông báo: "Gói từ vựng này hiện chưa có nội dung."

**Postconditions**

**Thành công:** Người học đã xem xét nội dung chi tiết của gói công khai và có thể đưa ra quyết định (sao chép, yêu thích, hoặc bỏ qua).

#### Use Case 22: Xem Trang cá nhân Người tạo

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-020

**Use Case Name**

Xem Trang cá nhân Người tạo (View Creator Profile)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xem trang hồ sơ công khai của một người tạo gói từ vựng, bao gồm thông tin cá nhân cơ bản và danh sách tất cả các gói từ vựng khác mà người đó đã chia sẻ.

**Trigger**

Người học nhấp vào tên của Người tạo (từ UC-VOC-019 hoặc từ danh sách Khám phá).

**Preconditions**

1. Người học đang duyệt nội dung cộng đồng. 2. Người tạo có một hồ sơ (profile) trên hệ thống.

**Main Flow (Luồng chính)**

1. Người học nhấp vào tên của Người tạo (ví dụ: "**UserA**").

2. Hệ thống điều hướng đến trang hồ sơ công khai của "**UserA**".

3. Hệ thống hiển thị các thông tin hồ sơ công khai:

\* Tên hiển thị, Ảnh đại diện (Avatar).

- Tiểu sử ngắn (Bio) (nếu có).

- Ngày tham gia.

- Các chỉ số: Tổng số gói đã chia sẻ, Tổng lượt tải/sao chép.

4. Hệ thống hiển thị một nút hành động: "Theo dõi" (Follow) (kích hoạt UC-VOC-023).

5. **Phần quan trọng:** Hệ thống hiển thị một danh sách/tab chứa _tất cả_ các gói từ vựng **public** và **approved** khác do "**UserA**" tạo ra.

6. Người học có thể duyệt danh sách này và nhấp vào bất kỳ gói nào (kích hoạt lại UC-VOC-019).

**Alternative Flows (Luồng thay thế)**

**A1: Người tạo không có gói công khai nào khác**

5a. (Tại bước 5) Hệ thống không tìm thấy gói **public** nào (ví dụ: gói duy nhất họ chia sẻ đã bị gỡ).

5b. Hệ thống hiển thị thông báo: **UserA** hiện chưa chia sẻ công khai gói từ vựng nào."

**Postconditions**

**Thành công:** Người học đã xem hồ sơ của Người tạo và có thể khám phá thêm các gói từ khác từ cùng một tác giả, hoặc quyết định "Theo dõi" họ.

### Cộng đồng: Tương tác (Interaction)

#### Use Case 23 : Gửi Gói từ vựng đi Kiểm duyệt (Publish)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-007 (Sửa đổi)

**Use Case Name**

Gửi Gói từ vựng đi Kiểm duyệt (Publish Package for Moderation)

**Actor(s)**

Người học (Learner - đã xác thực)

**Description**

Cho phép Người học gửi một gói từ vựng cá nhân của họ để được chia sẻ công khai với cộng đồng. Gói từ vựng phải đáp ứng các tiêu chuẩn chất lượng tối thiểu (ví dụ: có mô tả, chủ đề) và sẽ được gửi đến Admin để kiểm duyệt trước khi hiển thị.

**Trigger**

Người học chọn một gói từ cá nhân ($private$) của họ và nhấp vào nút "Chia sẻ" (Share) hoặc "Công khai" (Publish).

**Preconditions**

1. Người học đã đăng nhập.

2. Gói từ vựng thuộc sở hữu của Người học.

3. Gói từ vựng hiện đang ở trạng thái **private **(riêng tư).

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Công khai" cho một gói từ cụ thể.

2. **Hệ thống thực hiện "Kiểm tra Tiêu chuẩn" (Quality Check) tự động.** Hệ thống kiểm tra xem gói đã có các thông tin bắt buộc sau đây chưa: a) Tên Gói (Package Name) (Đã có). b) Mô tả (Description) (Phải có để người khác hiểu). c) Chủ đề (Category) (Bắt buộc để phục vụ UC-VOC-010 - Lọc). d) Số lượng từ tối thiểu (ví dụ: >= 10 từ).

3. **Trường hợp 1: Gói chưa đạt Tiêu chuẩn (Ví dụ: thiếu Mô tả, Chủ đề):**

a. Hệ thống hiển thị một biểu mẫu (form) "Hoàn thiện Gói của bạn".

b. Biểu mẫu yêu cầu Người học _bắt buộc_ phải điền các trường còn thiếu (ví dụ: dropdown chọn Chủ đề, ô nhập Mô tả).

c. Người học điền thông tin và nhấp "Lưu & Tiếp tục".

d. Hệ thống lưu các thông tin metadata (mô tả, chủ đề) này vào bản ghi **Package**.

4. **Trường hợp 2: Gói đã đạt Tiêu chuẩn (Hoặc sau khi hoàn thành bước 3):**

a. Hệ thống hiển thị một thông báo xác nhận cuối cùng (ví dụ: "Gói của bạn sẽ được gửi cho đội ngũ kiểm duyệt. Bạn đồng ý chia sẻ gói này với cộng đồng?").

5. Người học xác nhận "Gửi đi" (Submit for Review).

6. Hệ thống cập nhật trạng thái của gói trong cơ sở dữ liệu (ví dụ: visibility = '**pending_review**').

7. **(Dependency)** Hệ thống tạo một tác vụ mới trong hàng đợi kiểm duyệt của Admin CMS.

8. Hệ thống hiển thị thông báo thành công cho Người học: "Đã gửi gói đi kiểm duyệt! Bạn sẽ nhận được thông báo khi gói được duyệt."

**Alternative Flows (Luồng thay thế)**

**A1: Gói không đủ từ (Lỗi không thể sửa ngay)**

2a. (Tại bước 2) Hệ thống phát hiện gói chỉ có 5 từ (dưới mức tối thiểu 10 từ).

2b. Hệ thống hiển thị thông báo lỗi: "Gói của bạn cần ít nhất 10 từ vựng để có thể chia sẻ. Vui lòng thêm từ trước khi gửi."

2c. Use case kết thúc.

**A2: Người học hủy bỏ (tại biểu mẫu Hoàn thiện)**

3c-1. (Tại bước 3c) Người học nhấp "Hủy" (Cancel).

3c-2. Biểu mẫu đóng lại. Trạng thái gói vẫn là private. Use case kết thúc.

**A3: Hủy bỏ gói (Unpublish)**

1a. (Trigger thay thế) Người học thực hiện hành động này trên một gói đã ở trạng ái pending_review hoặc public.

2a. Hệ thống hỏi: "Bạn có muốn gỡ gói này khỏi cộng đồng/hàng đợi?"

3a. Người học xác nhận.

4a. Hệ thống cập nhật visibility = '**private**'. Gói biến mất khỏi trang cộng đồng/hàng đợi Admin.

**Postconditions**

**Thành công:** Trạng thái của gói được cập nhật thành** pending_review** và nó xuất hiện trong hàng đợi của Admin. **Thất bại/Hủy:** Gói vẫn ở trạng thái private (và có thể đã được cập nhật thêm Mô tả/Chủ đề nếu Người học làm bước 3).

#### Use Case 24: Yêu thích Gói từ vựng Công khai

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-021

**Use Case Name**

Yêu thích Gói từ vựng Công khai (Favorite a Public Package)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học đánh dấu "Yêu thích" một gói từ vựng công khai để lưu lại và dễ dàng tìm thấy nó sau này trong danh sách yêu thích của họ.

**Trigger**

Người học nhấp vào biểu tượng "Yêu thích" (ví dụ: hình trái tim, ngôi sao) trên một gói từ (từ trang Khám phá UC-VOC-009 hoặc trang Chi tiết UC-VOC-019).

**Preconditions**

1. Người học đã đăng nhập.

2. Gói từ vựng là **public** và **approved**.

**Main Flow (Luồng chính - Yêu thích)**

1. Người học nhấp vào biểu tượng "Yêu thích" (đang ở trạng thái **un-favorited**).

2. Hệ thống tạo một bản ghi liên kết trong cơ sở dữ liệu (ví dụ: **User_Favorite_Packages**) giữa **UserID** của Người học và **PackageID** của gói.

3. Biểu tượng "**Yêu thích**" trên giao diện thay đổi trạng thái (ví dụ: trái tim được tô đầy).

4. Hệ thống (tùy chọn) hiển thị thông báo "Đã thêm vào danh sách Yêu thích."

**Alternative Flows (Luồng thay thế - Bỏ Yêu thích)**

**A1: Bỏ Yêu thích (Un-favorite)**

1a. (Trigger thay thế) Người học nhấp vào biểu tượng "Yêu thích" (đang ở trạng thái **favorited**).

2a. Hệ thống xóa bản ghi liên kết trong cơ sở dữ liệu.

3a. Biểu tượng "Yêu thích" thay đổi về trạng thái ban đầu (ví dụ: trái tim rỗng).

4a. Hệ thống (tùy chọn) hiển thị thông báo "Đã gỡ khỏi danh sách Yêu thích."

**Postconditions**

**Thành công:** Gói từ vựng được thêm vào (hoặc gỡ khỏi) danh sách yêu thích của Người học.

#### Use Case 25: Quản lý Danh sách Yêu thích

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-022

**Use Case Name**

Quản lý Danh sách Yêu thích (Manage Favorite List)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xem một trang tập trung, hiển thị tất cả các gói từ vựng mà họ đã đánh dấu "Yêu thích" trước đó.

**Trigger**

Người học điều hướng đến mục "Gói từ Yêu thích" (My Favorites) từ menu cá nhân hoặc trang hồ sơ (profile).

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Gói từ Yêu thích".

2. Hệ thống truy vấn cơ sở dữ liệu (bảng **User_Favorite_Packages**) để lấy tất cả $PackageID$ liên kết với $UserID$ của Người học.

3. Hệ thống hiển thị một danh sách các gói từ vựng này (tương tự trang Khám phá, nhưng chỉ chứa các gói đã yêu thích).

4. Người học có thể nhấp vào một gói (kích hoạt UC-VOC-019) hoặc "Bỏ Yêu thích" trực tiếp từ danh sách này (kích hoạt Luồng A1 của UC-VOC-021).

**Alternative Flows (Luồng thay thế)**

**A1: Danh sách rỗng**

2a. (Tại bước 2) Hệ thống không tìm thấy gói nào được yêu thích.

2b. Hệ thống hiển thị thông báo: "Bạn chưa yêu thích gói từ vựng nào. Hãy bắt đầu khám phá!"

**Postconditions**

**Thành công:** Người học xem được một danh sách các gói từ vựng họ quan tâm nhất.

#### Use Case 23: Lấy Link chia sẻ Gói từ vựng

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-023

**Use Case Name**

Lấy Link chia sẻ Gói từ vựng (Get Shareable Link for Package)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học lấy một đường dẫn URL công khai, duy nhất cho một gói từ vựng (của mình hoặc của cộng đồng) để chia sẻ ra bên ngoài nền tảng (ví dụ: Facebook, Zalo).

**Trigger**

Người học nhấp vào nút/biểu tượng "Chia sẻ" (Share) trên một gói từ (từ trang Chi tiết UC-VOC-019).

**Preconditions**

1. Gói từ vựng phải là $**public**$ và $**approved**$.

**Main Flow (Luồng chính)**

1. Người học nhấp vào "Chia sẻ".

2. Hệ thống hiển thị một pop-up/modal.

3. Pop-up này chứa đường dẫn URL công khai của gói (ví dụ: **https://ten-mien-cua-ban.com/packages/12345**).

4. Pop-up có một nút "Sao chép Link" (Copy Link).

5. Người học nhấp "**Sao chép Link**".

6. Hệ thống sao chép URL vào bộ nhớ đệm (clipboard) của Người học.

7. Hệ thống hiển thị thông báo "**Đã sao chép link!**"

**Alternative Flows (Luồng thay thế)**

**A1: Gói riêng tư** (Hệ thống nên vô hiệu hóa (disable) nút "Chia sẻ" nếu gói là riêng tư. Nếu không)

1a. Người học nhấp "Chia sẻ" trên gói riêng tư.

1a. Hệ thống hiển thị thông báo: "Bạn không thể chia sẻ link cho gói riêng tư."

**Postconditions**

**Thành công:** Người học có đường link công khai của gói trong clipboard của họ.

#### Use Case 24: Báo cáo Gói từ vựng

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-024

**Use Case Name**

Báo cáo Gói từ vựng (Report a Package)

**Actor(s)**

Người học (Learner)

**Description**

(Chức năng An toàn) Cho phép Người học báo cáo một gói từ vựng công khai nếu họ phát hiện nội dung không phù hợp, spam, hoặc sai sót nghiêm trọng.

**Trigger**

Người học nhấp vào nút "Báo cáo" (Report) (thường trong menu "..." hoặc ở cuối trang Chi tiết UC-VOC-019).

**Preconditions**

1. Người học đã đăng nhập.

2. Gói từ vựng là **public**.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Báo cáo".

2. Hệ thống hiển thị một biểu mẫu (form) yêu cầu Người học chọn lý do báo cáo.

3. Các lý do (categories) có thể bao gồm: "Nội dung không phù hợp/Spam", "Thông tin sai sự thật/Chất lượng kém", "Vi phạm bản quyền", "Lý do khác".

4. Hệ thống cung cấp một ô văn bản (textarea) để Người học mô tả chi tiết (tùy chọn hoặc bắt buộc tùy lý do).

5. Người học chọn lý do và nhấp "Gửi Báo cáo" (Submit Report).

6. Hệ thống tạo một bản ghi **Report** trong cơ sở dữ liệu, liên kết **UserID** (người báo cáo), $**PackageID**$ (gói bị báo cáo), và nội dung báo cáo.

7. **(Dependency)** Hệ thống gửi thông báo/email đến Admin CMS (hàng đợi kiểm duyệt).

8. Hệ thống hiển thị thông báo cảm ơn: "Cảm ơn bạn đã báo cáo. Đội ngũ của chúng tôi sẽ xem xét."

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ báo cáo**

5a. (Tại bước 5) Người học nhấp "Hủy" trên biểu mẫu.

5b. Biểu mẫu đóng lại. Không có báo cáo nào được gửi. Use case kết thúc.

**Postconditions**

**Thành công:** Một báo cáo đã được gửi đến quản trị viên (Admin) để xem xét.

#### Use Case 25: Theo dõi (Follow) Người tạo

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-025

**Use Case Name**

Theo dõi Người tạo (Follow a Creator)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học "**theo dõi**" một Người tạo (creator) khác mà họ yêu thích, để nhận thông báo (trong tương lai) khi người đó chia sẻ một gói từ vựng mới.

**Trigger**

Người học nhấp vào nút "Theo dõi" (Follow) trên Trang cá nhân của Người tạo (từ UC-VOC-020).

**Preconditions**

1. Người học đã đăng nhập.

2. Người học _chưa_ theo dõi Người tạo này.

**Main Flow (Luồng chính - Theo dõi)**

1. Người học nhấp vào nút "Theo dõi".

2. Hệ thống tạo một bản ghi liên kết trong cơ sở dữ liệu (ví dụ: **User_Follows**) giữa **FollowerID **(Người học) và **FollowingID** (Người tạo).

3. Nút trên giao diện thay đổi thành "Đang theo dõi" (Following) hoặc "Bỏ theo dõi" (Unfollow).

4. **(Dependency)** Hệ thống Thông báo (Mục 7) sẽ sử dụng liên kết này để gửi thông báo khi **FollowingID** có hành động **Publish** (UC-VOC-007) thành công.

**Alternative Flows (Luồng thay thế - Bỏ theo dõi)**

**A1: Bỏ theo dõi (Unfollow)**

1a. (Trigger thay thế) Người học nhấp vào nút "Đang theo dõi" (Following).

2a. Hệ thống hiển thị xác nhận (ví dụ: "Bạn có chắc muốn bỏ theo dõi [Tên Người tạo]?").

3a. Người học xác nhận.

4a. Hệ thống xóa bản ghi liên kết trong **User_Follows**.

5a. Nút trên giao diện thay đổi về "Theo dõi" (Follow).

**Postconditions**

**Thành công:** Người học đã theo dõi (hoặc bỏ theo dõi) Người tạo.

#### Use Case 26: Thêm Mẹo ghi nhớ (Mnemonic) cho Từ vựng

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-026

**Use Case Name**

Thêm Mẹo ghi nhớ (Add a Mnemonic)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học đóng góp một "mẹo ghi nhớ" (ví dụ: câu chuyện, cách liên tưởng) cho một từ vựng cụ thể, giúp những người học khác dễ nhớ từ đó hơn.

**Trigger**

Người học đang xem một từ vựng (trên flashcard, trang chi tiết gói, hoặc từ điển) và nhấp vào "Thêm Mẹo ghi nhớ".

**Preconditions**

1. Người học đã đăng nhập.

2. Đang xem chi tiết một $Word$ (từ vựng gốc).

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Thêm Mẹo ghi nhớ".

2. Hệ thống hiển thị một ô nhập văn bản (text area).

3. Người học gõ mẹo ghi nhớ của mình (ví dụ: "Serendipity nghe giống như 'xe-ren-đi-bộ' -> tình cờ gặp được điều may mắn khi đang đi bộ").

4. Người học nhấp "Đăng" (Submit).

5. Hệ thống kiểm tra nội dung (ví dụ: không trống, không vi phạm).

6. Hệ thống lưu nội dung vào cơ sở dữ liệu (ví dụ: **Community_Mnemonics**), liên kết với **WordID** và **UserID** (người tạo).

7. Mẹo ghi nhớ mới của Người học xuất hiện trong danh sách các mẹo ghi nhớ của từ đó (có thể ở trên cùng hoặc được sắp xếp theo phiếu bầu).

**Alternative Flows (Luồng thay thế)**

**A1: Hủy bỏ**

4a. (Tại bước 4) Người học nhấp "Hủy".

4b. Biểu mẫu đóng lại. Không có gì được lưu. Use case kết thúc.

**Postconditions**

**Thành công:** Một mẹo ghi nhớ mới được liên kết với từ vựng và hiển thị cho cộng đồng.

#### Use Case 27: Bình chọn (Vote) cho Mẹo ghi nhớ

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-027

**Use Case Name**

Bình chọn cho Mẹo ghi nhớ (Vote on a Mnemonic)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học bình chọn (Upvote/Downvote) cho các mẹo ghi nhớ do cộng đồng đóng góp. Các mẹo ghi nhớ tốt nhất (nhiều upvote) sẽ được hiển thị ưu tiên.

**Trigger**

Người học đang xem danh sách các mẹo ghi nhớ (từ UC-VOC-026) và nhấp vào biểu tượng mũi tên Lên (Upvote) hoặc Xuống (Downvote).

**Preconditions**

1. Người học đã đăng nhập.

2. Đang xem các mẹo ghi nhớ của một từ.

**Main Flow (Luồng chính - Upvote)**

1. Người học nhấp vào mũi tên "Upvote" bên cạnh một mẹo ghi nhớ.

2. Hệ thống kiểm tra trạng thái bình chọn hiện tại của Người học cho mẹo này.

3. **Luồng A (Chưa bình chọn):** Hệ thống ghi lại +1 phiếu (tạo bản ghi Mnemonic_Vote), cập nhật tổng điểm của mẹo. Giao diện tô sáng mũi tên Lên.

4. **Luồng B (Đã Upvote):** Nhấp lần nữa để "Bỏ Upvote". Hệ thống ghi lại -1 phiếu (xóa bản ghi Mnemonic_Vote), cập nhật tổng điểm. Giao diện bỏ tô sáng.

5. **Luồng C (Đã Downvote):** Nhấp Upvote sẽ "Chuyển bình chọn". Hệ thống ghi lại +2 phiếu (đổi $vote = -1$ thành $vote = +1$), cập nhật tổng điểm. Giao diện tô sáng mũi tên Lên, bỏ tô sáng mũi tên Xuống.

6. Danh sách các mẹo ghi nhớ được sắp xếp lại dựa trên điểm số mới (ví dụ: "Hot" hoặc "Top").

**Alternative Flows (Luồng thay thế - Downvote)**

**A1: Nhấp Downvote** Hệ thống thực hiện logic tương tự (Luồng A, B, C) nhưng ngược lại cho nút Downvote.

**Postconditions**

**Thành công:** Điểm số của mẹo ghi nhớ được cập nhật, và trạng thái bình chọn của Người học được ghi lại.

#### Use Case 28: Thêm Câu ví dụ Cộng đồng

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-028

**Use Case Name**

Thêm Câu ví dụ Cộng đồng (Add a Community Example)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học đóng góp một câu ví dụ thực tế sử dụng từ vựng, giúp người khác hiểu rõ hơn về ngữ cảnh.

**Trigger**

Người học đang xem một từ vựng và nhấp vào "Thêm Ví dụ".

**Preconditions**

1. Người học đã đăng nhập.

2. Đang xem chi tiết một $Word$.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Thêm Ví dụ".

2. Hệ thống hiển thị một ô nhập văn bản.

3. Người học gõ câu ví dụ của mình (ví dụ: "Finding a $20 bill in an old coat was a moment of **serendipity**.")."

4. Người học nhấp "Đăng" (Submit).

5. Hệ thống kiểm tra nội dung (ví dụ: phải chứa từ vựng, không vi phạm).

6. Hệ thống lưu nội dung vào cơ sở dữ liệu (ví dụ: Community_Examples), liên kết với $WordID$ và $UserID$.

7. Câu ví dụ mới xuất hiện trong danh sách các ví dụ cộng đồng của từ đó.

**Postconditions**

**Thành công:** Một câu ví dụ mới được liên kết với từ vựng và hiển thị cho cộng đồng.

#### Use Case 29: Bình chọn (Vote) cho Câu ví dụ

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-029

**Use Case Name**

Bình chọn cho Câu ví dụ (Vote on a Community Example)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học bình chọn (Upvote/Downvote) cho các câu ví dụ do cộng đồng đóng góp. Các ví dụ hay nhất sẽ được hiển thị ưu tiên.

**Trigger**

Người học đang xem danh sách các câu ví dụ (từ UC-VOC-028) và nhấp vào biểu tượng mũi tên Lên (Upvote) hoặc Xuống (Downvote).

**Preconditions**

1. Người học đã đăng nhập.

2. Đang xem các câu ví dụ của một từ.

**Main Flow (Luồng chính)**

1. Người học nhấp vào mũi tên "Upvote" bên cạnh một câu ví dụ.

2. Hệ thống thực hiện logic bình chọn tương tự như **UC-VOC-027** (Luồng A, B, C) nhưng áp dụng cho Community_Examples và Example_Votes.

3. Danh sách các câu ví dụ được sắp xếp lại dựa trên điểm số mới.

**Postconditions**

**Thành công:** Điểm số của câu ví dụ được cập nhật, và trạng thái bình chọn của Người học được ghi lại.

### Gắn kết & Thống kê (Engagement & Stats)

#### Use Case 30: Xem Tiến độ cá nhân

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-030

**Use Case Name**

Xem Tiến độ cá nhân (View Personal Progress) 📈

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xem một trang tổng quan (dashboard) về các số liệu thống kê học tập của cá nhân họ.

**Trigger**

Người học điều hướng đến trang "Hồ sơ" (Profile) hoặc "Tiến độ" (Progress) của mình.

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Xem Tiến độ".

2. Hệ thống truy vấn và tính toán các số liệu thống kê liên quan đến $UserID$ của Người học.

3. Hệ thống hiển thị các thông tin sau: _ **Tổng số từ đã lưu:** (Ví dụ: COUNT tất cả **UserWord** của người dùng). _ **Số từ đã thành thạo:** (Ví dụ: **COUNT **các **UserWord** có trạng thái $srs\_status = 'mastered'$ - từ UC-VOC-017). _ **Số từ đang học:** (Tổng số từ - Số từ đã thành thạo). _ (Tùy chọn) Một biểu đồ (graph) hiển thị số lượng từ học được theo thời gian (ví dụ: 30 ngày qua).

4. Người học xem xét các số liệu thống kê của mình.

**Alternative Flows (Luồng thay thế)**

**A1: Người dùng mới**

3a. (Tại bước 3) Hệ thống phát hiện người dùng chưa lưu từ nào.

3b. Hệ thống hiển thị: "Tổng số từ: 0". Và một lời kêu gọi hành động (Call to Action): "Hãy bắt đầu học từ đầu tiên của bạn!"

**Postconditions**

**Thành công:** Người học nắm được bức tranh tổng quan về tiến độ học tập của mình.

#### Use Case 31: Xem Chuỗi ngày học

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-031

**Use Case Name**

Xem Chuỗi ngày học (View Study Streak) 🔥

**Actor(s)**

Người học (Learner)

**Description**

Hiển thị cho Người học số ngày liên tiếp mà họ đã hoàn thành ít nhất một phiên học (ví dụ: hoàn thành Hàng đợi Ôn tập, làm một Quiz).

**Trigger**

Người học truy cập trang "Tiến độ" (UC-VOC-030) hoặc xem ở một vị trí nổi bật (như thanh header/navigation).

**Preconditions**

1. Người học đã đăng nhập.

2. Hệ thống phải có một bản ghi (log) về các ngày học tập (Study_Logs) của người dùng. (Bản ghi này được tạo mỗi khi người dùng hoàn thành một phiên học).

**Main Flow (Luồng chính)**

1. Người học xem khu vực hiển thị Chuỗi ngày học.

2. Hệ thống truy vấn bảng Study_Logs của Người học.

3. Hệ thống tính toán số ngày liên tiếp (kết thúc vào hôm nay _hoặc_ hôm qua) mà Người học có bản ghi học tập.

4. Hệ thống hiển thị con số (ví dụ: "🔥 5 ngày!").

**Alternative Flows (Luồng thay thế)**

**A1: Chuỗi bị ngắt (Streak = 0)** 3a. (Tại bước 3) Hệ thống phát hiện Người học không học hôm qua và hôm kia (hoặc chưa bao giờ học).

4a. Hệ thống hiển thị: "🔥 0 ngày. Hãy học hôm nay để bắt đầu chuỗi mới!"

**A2: Nguy cơ mất chuỗi (Streak > 0, chưa học hôm nay)**

3b. (Tại bước 3) Hệ thống phát hiện Người học đã học hôm qua, nhưng chưa học hôm nay.

4b. Hệ thống hiển thị: "🔥 [N] ngày! Hãy học hôm nay để giữ lửa!" (Đây là một lời nhắc nhở quan trọng).

**A3: Đã học hôm nay (Streak > 0)**

3c. (Tại bước 3) Hệ thống phát hiện Người học đã học hôm nay.

4c. Hệ thống hiển thị: "🔥 [N] ngày! Bạn đã hoàn thành hôm nay. Tuyệt vời!"

**Postconditions**

**Thành công:** Người học được thông báo về chuỗi ngày học của mình, tạo động lực để duy trì thói quen.

#### Use Case 32: Xem Bảng xếp hạng

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-032

**Use Case Name**

Xem Bảng xếp hạng (View Leaderboard) 🏆

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xem thứ hạng của mình so với những người học khác trong cộng đồng, dựa trên điểm kinh nghiệm (XP) hoặc số từ học được trong một khoảng thời gian.

**Trigger**

Người học điều hướng đến trang/tab "Bảng xếp hạng" (Leaderboard).

**Preconditions**

1. Người học đã đăng nhập.

2. Hệ thống có cơ chế tính điểm (XP) (ví dụ: +1 XP khi ôn tập, +10 XP khi học từ mới, +5 XP khi trả lời đúng quiz).

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Xem Bảng xếp hạng".

2. Hệ thống cung cấp các bộ lọc thời gian, ví dụ: "Tuần này", "Tháng này", "Mọi lúc". Mặc định là "Tuần này".

3. Người học chọn một bộ lọc.

4. Hệ thống truy vấn và xếp hạng tất cả người dùng dựa trên tổng điểm XP (hoặc số từ học được) trong khoảng thời gian đã chọn.

5. Hệ thống hiển thị danh sách (ví dụ: Top 100) bao gồm: Hạng, Tên người dùng, Điểm XP.

6. **Quan trọng:** Hệ thống hiển thị vị trí của Người học (ngay cả khi họ không ở trong Top 100) ở một vị trí nổi bật (ví dụ: "Thứ hạng của bạn: #234").

**Alternative Flows (Luồng thay thế)**

**A1: Bảng xếp hạng rỗng** 4a. (Tại bước 4) Hệ thống không có đủ dữ liệu (ví dụ: nền tảng mới). 4b. Hệ thống hiển thị: "Bảng xếp hạng đang được cập nhật. Hãy bắt đầu học!"

**Postconditions**

**Thành công:** Người học biết được thứ hạng của mình và được thúc đẩy cạnh tranh lành mạnh.

#### Use Case 33: Xem Thành tựu (Badges)

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-033

**Use Case Name**

Xem Thành tựu (View Achievements/Badges) 🎖️

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xem một bộ sưu tập các "thành tựu" (huy hiệu) mà họ có thể mở khóa bằng cách hoàn thành các cột mốc cụ thể.

**Trigger**

Người học điều hướng đến trang "Thành tựu" trong Hồ sơ của mình.

**Preconditions**

1. Người học đã đăng nhập.

2. Hệ thống đã định nghĩa một danh sách các Achievements (ví dụ: "Người mới học: Học 10 từ", "Siêng năng: Đạt 7 ngày streak", "Người đóng góp: Thêm 1 mẹo ghi nhớ").

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Xem Thành tựu".

2. Hệ thống truy vấn các số liệu thống kê (từ UC-VOC-030) và lịch sử hành động (từ UC-VOC-026, v.v.) của Người học.

3. Hệ thống so sánh các số liệu này với danh sách Achievements để xác định các huy hiệu đã "mở khóa" (unlocked).

4. Hệ thống hiển thị một thư viện (gallery) tất cả các huy hiệu: _ **Đã mở khóa:** Hiển thị màu, kèm ngày nhận. _ **Chưa mở khóa:** Hiển thị mờ (grayscale), kèm mô tả cách mở khóa (ví dụ: "Học 100 từ vựng").

**Alternative Flows (Luồng thay thế)**

**A1: Thông báo Mở khóa Thành tựu** (Trigger thay thế: Xảy ra ngay khi Người học hoàn thành một hành động, ví dụ: học từ thứ 10).

1a. Hệ thống (backend) phát hiện hành động của Người học vừa đạt một cột mốc.

2a. Hệ thống hiển thị một thông báo pop-up ngay lập tức: "🎉 Thành tựu Mở khóa: Người mới học!"

**Postconditions**

**Thành công:** Người học thấy được các thành tựu mình đã đạt được và có mục tiêu rõ ràng cho các thành tựu tiếp theo.

### Thông báo

#### Use Case 34: Xem và Tương tác với Thông báo

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-034

**Use Case Name**

Xem và Tương tác với Thông báo (View and Interact with Notifications) 🔔

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học xem một danh sách tập trung các thông báo (cả về học tập và xã hội) và tương tác với chúng.

**Trigger**

1. Người học nhấp vào biểu tượng "Chuông thông báo".

2. (Hệ thống kích hoạt) Một thông báo đẩy (push notification) xuất hiện trên thiết bị.

**Preconditions**

1. Người học đã đăng nhập.

2. Có các thông báo chưa đọc được tạo ra bởi hệ thống.

**Main Flow (Luồng chính - Xem trong ứng dụng)**

1. Người học nhấp vào biểu tượng "Chuông thông báo".

2. Hệ thống hiển thị một danh sách/dropdown các thông báo, sắp xếp theo thời gian (mới nhất ở trên).

3. Các thông báo hiển thị nội dung: (Ví dụ: "🔥 Bạn có 15 từ cần ôn tập hôm nay!", "UserA vừa bình luận về gói 'IELTS Task 2' của bạn.")."

4. Người học nhấp vào một thông báo cụ thể (ví dụ: thông báo bình luận).

5. Hệ thống đánh dấu thông báo đó là "đã đọc" và điều hướng Người học đến nội dung liên quan (ví dụ: trang chi tiết gói, ngay tại bình luận đó).

6. Người học có thể nhấp vào "Đánh dấu tất cả là đã đọc".

**Alternative Flows (Luồng thay thế - Tương tác với Push Notification)**

**A1: Thông báo Ôn tập (SRS Reminder)**

1a. (Hệ thống kích hoạt) Đã đến giờ ôn tập (ví dụ: 8 giờ tối) VÀ Người học có từ cần ôn tập VÀ Người học _chưa_ học hôm nay.

2a. Hệ thống gửi thông báo đẩy: "Bạn có [N] từ cần ôn tập!" (Người học phải bật quyền này trong UC-VOC-037).

3a. Người học nhấp vào thông báo đẩy.

4a. Ứng dụng mở ra, điều hướng thẳng đến Hàng đợi Ôn tập (Mục 3).

**A2: Thông báo Xã hội (Social)**

1b. (Hệ thống kích hoạt) "UserB" (mà Người học theo dõi) vừa đăng gói mới (UC-VOC-007).

2b. Hệ thống gửi thông báo đẩy: "[UserB] vừa đăng gói '[Tên gói]'" (Người học phải bật quyền này trong UC-VOC-037).

3b. Người học nhấp vào thông báo đẩy.

4b. Ứng dụng mở ra, điều hướng thẳng đến trang Chi tiết Gói Công khai (UC-VOC-019).

**Postconditions**

**Thành công:** Người học được thông báo về các cập nhật và được điều hướng đến nội dung liên quan.

### Cài đặt & Tài khoản

#### Use Case 35: Quản lý Hồ sơ cá nhân

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-035

**Use Case Name**

Quản lý Hồ sơ cá nhân (Manage Personal Profile)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học thay đổi các thông tin hiển thị công khai của họ (Tên, Ảnh đại diện, Tiểu sử) để cá nhân hóa và phục vụ cho các tính năng cộng đồng.

**Trigger**

Người học điều hướng đến trang "Cài đặt" -> "Hồ sơ" (hoặc nhấp "Chỉnh sửa" trên trang cá nhân).

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng chính)**

1. Người học kích hoạt hành động "Chỉnh sửa Hồ sơ".

2. Hệ thống hiển thị một biểu mẫu (form) với các trường: _ "Tên hiển thị" _ "Tiểu sử" (Bio - mô tả ngắn) \* Nút "Thay đổi Ảnh đại diện" (Upload Avatar).

3. Người học thay đổi Tên hiển thị (ví dụ: từ "user123" thành "Viet Hoang").

4. Người học tải lên một ảnh đại diện mới.

5. Người học nhập Tiểu sử (ví dụ: "Đang học IELTS 8.0").

6. Người học nhấp "Lưu thay đổi".

7. Hệ thống xác thực dữ liệu (ví dụ: Tên hiển thị không trống).

8. Hệ thống lưu thông tin mới và cập nhật ảnh đại diện.

9. Hồ sơ công khai của Người học (UC-VOC-020) được cập nhật với thông tin mới.

**Postconditions**

**Thành công:** Thông tin hồ sơ cá nhân của Người học được cập nhật.

#### Use Case 36: Cài đặt Học tập

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-036

**Use Case Name**

Cài đặt Học tập (Configure Learning Settings)

**Actor(s)**

Người học (Learner)

**Description**

Cho phép Người học tùy chỉnh các tham số cho các phiên học (Flashcard, Quiz) để phù hợp với mục tiêu cá nhân.

**Trigger**

Người học điều hướng đến "Cài đặt" -> "Cài đặt Học tập".

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng chính)**

1. Người học truy cập trang Cài đặt Học tập.

2. Hệ thống hiển thị các tùy chọn: _ **Số từ mới mỗi ngày (mặc định):** (Ví dụ: ô nhập số, 10, 20, 50). _ **Số từ ôn tập tối đa mỗi phiên:** (Ví dụ: ô nhập số, 50, 100, 200). _ **Tự động phát âm thanh (Autoplay Audio):** [Toggle Bật/Tắt]. _ **Chế độ Flashcard mặc định:** (Dropdown: Lật từ Mặt trước / Lật từ Mặt sau).

3. Người học thay đổi các giá trị (ví dụ: đặt "Số từ mới" là 15).

4. Người học nhấp "Lưu cài đặt".

5. Hệ thống lưu các tùy chọn này.

6. Lần tiếp theo Người học bắt đầu một phiên học, hệ thống sẽ sử dụng các cài đặt này.

**Postconditions**

**Thành công:** Các tham số cho phiên học của Người học đã được cập nhật.

#### Use Case 37: Cài đặt Thông báo

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-037

**Use Case Name**

Cài đặt Thông báo (Configure Notification Settings)

**Actor(s)**

Người học (Learner)

**Description**

(Rất quan trọng) Cho phép Người học chọn lựa chi tiết loại thông báo nào họ muốn nhận (qua Push, Email, hoặc trong ứng dụng).

**Trigger**

Người học điều hướng đến "Cài đặt" -> "Cài đặt Thông báo".

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng chính)**

1. Người học truy cập trang Cài đặt Thông báo.

2. Hệ thống hiển thị một danh sách chi tiết các [Toggles (Nút Bật/Tắt)], được nhóm lại:

- **Nhóm 1: Học tập (Learning Reminders)**

- [ ] Thông báo Ôn tập (SRS Reminders)

- [ ] Thông báo giữ Chuỗi ngày học

- **Nhóm 2: Xã hội (Social)**

- [ ] Khi gói của tôi được duyệt/từ chối

- [ ] Khi ai đó bình luận/đánh giá gói của tôi

- [ ] Khi người tôi theo dõi đăng gói mới

- [ ] Khi nhận được lời thách đấu quiz

- (Tùy chọn) Mỗi mục có thể có lựa chọn kênh: [ ] Trong ứng dụng, [ ] Thông báo đẩy, [ ] Email.

3. Người học tắt (disable) thông báo "Khi người tôi theo dõi đăng gói mới" nhưng bật (enable) "Thông báo giữ Chuỗi ngày học".

4. Các thay đổi được lưu lại (tự động hoặc qua nút "Lưu").

5. **(Dependency)** Hệ thống (backend) khi gửi thông báo (UC-VOC-034) sẽ phải kiểm tra các cờ (flag) này trước khi gửi.

**Postconditions**

**Thành công:** Tùy chọn nhận thông báo của Người học được cập nhật.

#### Use Case 38: Quản lý Dữ liệu

**Thuộc tính**

**Mô tả**

**Use Case ID**

UC-VOC-038

**Use Case Name**

Quản lý Dữ liệu (Export Dữ liệu và Xóa Tài khoản)

**Actor(s)**

Người học (Learner)

**Description**

Cung cấp cho Người học quyền kiểm soát dữ liệu của họ, bao gồm xuất (export) toàn bộ từ vựng hoặc xóa (delete) vĩnh viễn tài khoản.

**Trigger**

Người học điều hướng đến "Cài đặt" -> "Tài khoản & Dữ liệu".

**Preconditions**

1. Người học đã đăng nhập.

**Main Flow (Luồng phụ - Export Dữ liệu)**

1. Người học nhấp vào nút "Export Dữ liệu".

2. Hệ thống hỏi xác nhận (ví dụ: "Bạn muốn export tất cả từ vựng dưới dạng CSV?").

3. Người học xác nhận.

4. Hệ thống tạo một tệp (CSV/JSON) chứa tất cả $UserWord$ của Người học và cung cấp cho họ (tải về trực tiếp hoặc gửi email).

**Main Flow (Luồng phụ - Xóa Tài khoản)**

1. Người học nhấp vào nút "Xóa Tài khoản" (thường có màu đỏ/cảnh báo).

2. Hệ thống hiển thị một cảnh báo _rất mạnh_ (ví dụ: "Hành động này không thể hoàn tác. Bạn sẽ mất tất cả các gói từ, lịch sử học tập và đóng góp cộng đồng.")."

3. Hệ thống yêu cầu Người học xác nhận bằng cách gõ lại mật khẩu hoặc một chuỗi xác nhận (ví dụ: "DELETE").

4. Người học xác nhận.

5. Hệ thống thực hiện "soft-delete" tài khoản (hoặc xếp vào hàng đợi xóa vĩnh viễn) và đăng xuất Người học ngay lập tức.

**Postconditions**

**(Export):** Người học nhận được một bản sao dữ liệu của họ. **(Delete):** Tài khoản của Người học bị vô hiệu hóa và/hoặc bị xóa.

## 4. Architecture & Component Design

### 4.1 Component Diagram

[https://www.mermaidchart.com/d/e68d67a3-9058-4ca7-a379-280d5418b946](https://www.mermaidchart.com/d/e68d67a3-9058-4ca7-a379-280d5418b946)

![placeholder](https://markdowntoword.io/placeholder.png)

### 4.2 Mô tả Component (Component Breakdown)

Mỗi component dưới đây sẽ là một thư viện (library) trong packages/backend/domains/ (ví dụ: vocabulary-package, vocabulary-srs, vocabulary-community):

#### _1. Component: Package & Word Mgmt (Quản lý Gói & Từ)_

- **Trách nhiệm:** Xử lý tất cả logic CRUD (Tạo, Đọc, Cập nhật, Xóa) cho các Gói từ và Từ vựng _cá nhân_.
- **Bao gồm Use Cases:** Mục 1 (Quản lý Gói) và Mục 2 (Quản lý Từ vựng bên trong Gói).
- **Ví dụ:** UC-VOC-001 (Tạo Gói), UC-VOC-011 (Thêm từ), UC-VOC-018 (Xóa từ vĩnh viễn).

#### 2. Component: Learning & SRS (Học & SRS)

- **Trách nhiệm:** 🧠 **Đây là "bộ não" học tập.** Xử lý logic Spaced Repetition (lên lịch ôn tập), cung cấp Hàng đợi Ôn tập, quản lý phiên học Flashcard và Quiz.
- **Bao gồm Use Cases:** Mục 3 (Học và Ôn tập).
- **Phụ thuộc (External):** AI Module (để tạo câu hỏi quiz - UC-VOC-004).

#### 3. Component: Community & Sharing (Cộng đồng & Chia sẻ)

- **Trách nhiệm:** 🤝 Xử lý tất cả các tương tác xã hội và công khai. Khám phá, Tìm kiếm, Lọc, Gửi kiểm duyệt (Publish), Sao chép (Duplicate), Yêu thích, Bình chọn (Vote), Báo cáo.
- **Bao gồm Use Cases:** Mục 4 (Khám phá) và Mục 5 (Tương tác).
- **Ví dụ:** UC-VOC-007 (Publish), UC-VOC-010 (Lọc), UC-VOC-021 (Yêu thích), UC-VOC-025 (Follow), UC-VOC-027 (Bình chọn Mẹo).
- **Phụ thuộc (External):** Admin CMS (khi gửi báo cáo - UC-VOC-024, hoặc gửi gói kiểm duyệt - UC-VOC-007).

#### 4. Component: Engagement & Stats (Gắn kết & Thống kê)

- **Trách nhiệm:** 🏆 Tạo động lực cho người dùng. Tính toán Tiến độ, Chuỗi ngày học (Streak), Điểm XP, Bảng xếp hạng, và Thành tựu (Badges).
- **Bao gồm Use Cases:** Mục 6.
- **Ví dụ:** UC-VOC-030 (Tiến độ), UC-VOC-031 (Streak), UC-VOC-032 (Leaderboard).

#### 5. Component: Settings & Account (Cài đặt & Tài khoản)

- **Trách nhiệm:** Quản lý các cài đặt của người dùng.
- **Bao gồm Use Cases:** Mục 8.
- **Ví dụ:** UC-VOC-035 (Quản lý Hồ sơ), UC-VOC-036 (Cài đặt Học tập).

#### 6. Component: Notification (Thông báo)

- **Trách nhiệm:** 🔔 Gửi thông báo đến người dùng.
- **Bao gồm Use Cases:** Mục 7.
- **Quan trọng:** Component này _không_ chứa logic (ví dụ: "khi nào gửi thông báo"). Nó chỉ nhận một sự kiện (event) và thực hiện hành động "gửi".
- **Phụ thuộc (External):** Notification Service (Dịch vụ bên thứ ba như Firebase, OneSignal, hoặc SendGrid).

### 4.3. Luồng Tương tác (Interaction Flow) - Chìa khóa Nâng cấp

Để tiết kiệm chi phí, các component sẽ giao tiếp với nhau bằng 2 cách:

#### 1. Giao tiếp Đồng bộ (Synchronous) - (Internal Call)

- **Mô tả:** Một service từ component A import và call một service từ component B.
- **Ví dụ:** API Layer (Controller) gọi PackageMgmt.Service để tạo gói từ.
- **Ưu điểm:** Nhanh, đơn giản, dễ debug.
- **Nhược điểm:** Liên kết chặt chẽ (tight coupling). Chúng ta chỉ dùng cách này cho các nghiệp vụ bắt buộc phải xảy ra ngay lập tức.

### 4.4. Giao tiếp Bất đồng bộ (Asynchronous) - (In-process Event Emitter) 

- **Mô tả:** Đây là **chìa khóa** để nâng cấp lên Microservices trong tương lai. Chúng ta sẽ dùng một thư viện như NestJS EventEmitterModule.
- **Luồng hoạt động:\*\***Component Community\*\* (UC-VOC-007) duyệt xong một gói. Thay vì gọi trực tiếp NotificationService và EngagementService, nó chỉ phát (emit) một sự kiện: this.eventEmitter.emit('package.published', { packageId: '123', userId: 'abc' });
- **Component Notification** và **Component Engagement** (cả 2 đều chạy trong cùng ứng dụng monolith) đã "đăng ký" (subscribe) lắng nghe sự kiện package.published.
- Khi nghe thấy sự kiện, Notification thực hiện gửi thông báo, Engagement thực hiện cộng điểm XP.

- **Ưu điểm:**Các component hoàn toàn **không biết gì về nhau**. Community không cần biết là có ai đang lắng nghe hay không.
- **Dễ nâng cấp:** Khi chúng ta muốn tách Notification thành Microservice riêng, chúng ta chỉ cần:Thay NestJS EventEmitter (in-process) bằng RabbitMQ hoặc Kafka (external).
- Community vẫn emit sự kiện (nhưng giờ là ra RabbitMQ).
- Notification Service (giờ là app riêng) subscribe sự kiện từ RabbitMQ.
- **Toàn bộ logic nghiệp vụ bên trong các component không cần thay đổi!**

### 4.5. Lộ trình Nâng cấp (Upgrade Path)

- **Giai đoạn 1 (Hiện tại - Startup):** Triển khai apps/nest-ern (Modular Monolith) + 1 Database + 1 Redis. (Chi phí thấp, phát triển nhanh).
- **Giai đoạn 2 (Tăng trưởng - Scaling):** Tách "hotspot"._Giả sử:_ Tính năng Learning & SRS (Mục 3) quá "nóng", chiếm 90% tài nguyên.
- _Hành động:_ Tạo app mới (apps/srs-service), "gắp" packages/backend/domains/learning-srs vào đó. Triển khai srs-service này trên một cụm máy chủ (cluster) riêng.
- _Thay đổi:_ API Gateway (hoặc apps/nest-ern) giờ sẽ gọi srs-service qua API (HTTP/gRPC) thay vì gọi nội bộ (internal call).

- **Giai đoạn 3 (Doanh nghiệp - Enterprise):** Tách toàn bộ các Component còn lại thành Microservices, sử dụng Event Bus (Kafka/RabbitMQ) như sơ đồ doanh nghiệp lớn.

### 4.6 Sequence Diagram – Save Word Flow

User → VocabularyController → VocabularyService

→ VocabularyRepository → CacheManager → EventPublisher

### 4.7 State Diagram – Word Learning Status

New → Learning → Mastered → Forgotten → Relearn

## 5. Data Design

### 5.1 Data Models

#### 1. Bảng: users

Tên trường

Kiểu dữ liệu

Mô tả

id

varchar PRIMARY KEY

ID người dùng (từ Auth0 sub), unique identifier.

email

varchar UNIQUE CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$')

Email người dùng, unique và validate regex để tránh invalid data.

email_verified

boolean DEFAULT true

Trạng thái xác thực email.

name

varchar

Tên hiển thị cơ bản.

picture

varchar

URL ảnh đại diện mặc định.

is_active

boolean DEFAULT true

Trạng thái hoạt động (active/inactive).

created_at

timestamptz DEFAULT now()

Thời gian tạo user (auto).

updated_at

timestamptz

Thời gian cập nhật cuối (trigger auto-update).

full_name

varchar

Họ tên đầy đủ (có thể null).

avatar

varchar

URL avatar tùy chỉnh.

is_deleted

boolean DEFAULT false

Soft delete flag.

permissions

text[] DEFAULT '{}'

Quyền truy cập (array, e.g., ['admin', 'user']).

recommended_sets

jsonb DEFAULT '[]'::jsonb

Gợi ý sets (array UUIDs, computed via cron/job).

#### 2. Bảng: entries

Tên trường

Kiểu dữ liệu

Mô tả

id

uuid PRIMARY KEY DEFAULT gen_random_uuid()

ID entry từ điển, auto-generate UUID.

word

varchar NOT NULL

Từ chính (e.g., "apple").

language

lang_enum NOT NULL

Ngôn ngữ (enum: 'en', 'vi', etc.).

pronunciation

varchar

Phát âm (IPA hoặc text, optional).

part_of_speech

pos_enum

Loại từ (enum: 'noun', 'verb', etc.).

frequency

integer DEFAULT 0

Tần suất sử dụng (dựa trên corpus).

is_draft

boolean DEFAULT true

Draft status (chưa publish).

is_published

boolean DEFAULT false

Published status (public view).

notes

text

Ghi chú nội bộ.

source_url

varchar

Nguồn gốc (URL).

tags

text[] DEFAULT '{}'

Tags (e.g., ['fruit', 'tech']).

audio_url

varchar

URL audio phát âm (bổ sung cho multimedia).

search_vector

tsvector GENERATED ALWAYS AS (to_tsvector('simple', word

created_at

timestamp DEFAULT now()

Thời gian tạo (auto).

updated_at

timestamp

Thời gian cập nhật (trigger).

deleted

boolean DEFAULT false

Soft delete flag.

version

bigint DEFAULT 1

Optimistic locking version.

#### 3. Bảng: senses

Tên trường

Kiểu dữ liệu

Mô tả

id

uuid PRIMARY KEY DEFAULT gen_random_uuid()

ID nghĩa của entry.

definition

text NOT NULL

Định nghĩa chính.

language

lang_enum NOT NULL

Ngôn ngữ nghĩa (enum).

antonym

varchar

Từ trái nghĩa (optional).

etymology_text

text

Nguồn gốc từ (merge từ etymologies table, giảm redundancy).

field_of_study

varchar

Lĩnh vực (e.g., 'biology').

level

varchar

Độ khó (e.g., 'beginner').

note

text

Ghi chú nghĩa.

part_of_speech

pos_enum

Loại từ cho nghĩa này.

see_also

varchar

Tham khảo entry khác.

synonym

varchar

Từ đồng nghĩa.

topic

varchar

Chủ đề (e.g., 'food').

usage

text

Cách dùng.

images

text[] DEFAULT '{}'

Mảng URL hình ảnh minh họa (bổ sung multimedia).

entry_id

uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE

FK đến entry (cascade soft delete).

created_at

timestamp DEFAULT now()

Thời gian tạo.

updated_at

timestamp

Thời gian cập nhật.

deleted

boolean DEFAULT false

Soft delete.

version

bigint DEFAULT 1

Version lock.

#### 4. Bảng: examples

Tên trường

Kiểu dữ liệu

Mô tả

id

uuid PRIMARY KEY DEFAULT gen_random_uuid()

ID ví dụ.

example_text

text NOT NULL

Câu ví dụ.

translation

text

Bản dịch (optional).

language

lang_enum NOT NULL

Ngôn ngữ ví dụ (enum).

entry_id

uuid REFERENCES entries(id) ON DELETE SET NULL

FK đến entry (optional, set null nếu delete).

sense_id

uuid REFERENCES senses(id) ON DELETE SET NULL

FK đến sense (optional).

created_at

timestamp DEFAULT now()

Thời gian tạo.

updated_at

timestamp

Thời gian cập nhật.

deleted

boolean DEFAULT false

Soft delete.

version

bigint DEFAULT 1

Version.

#### 5. Bảng: expressions

Tên trường

Kiểu dữ liệu

Mô tả

id

uuid PRIMARY KEY DEFAULT gen_random_uuid()

ID cụm từ.

expression

text NOT NULL

Cụm từ (e.g., "kick the bucket").

language

lang_enum NOT NULL

Ngôn ngữ (enum).

entry_id

uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE

FK đến entry gốc.

created_at

timestamp DEFAULT now()

Thời gian tạo.

updated_at

timestamp

Thời gian cập nhật.

deleted

boolean DEFAULT false

Soft delete.

version

bigint DEFAULT 1

Version.

#### 6. Bảng: expression_meanings

Tên trường

Kiểu dữ liệu

Mô tả

id

uuid PRIMARY KEY DEFAULT gen_random_uuid()

ID nghĩa cụm từ.

meaning_order

integer DEFAULT 1

Thứ tự nghĩa (1=chính).

meaning_text

text NOT NULL

Định nghĩa.

usage_notes

text

Ghi chú sử dụng.

expression_id

uuid NOT NULL REFERENCES expressions(id) ON DELETE CASCADE

FK đến expression.

entry_id

uuid REFERENCES entries(id) ON DELETE SET NULL

FK cross-ref entry (optional).

created_at

timestamp DEFAULT now()

Thời gian tạo.

updated_at

timestamp

Thời gian cập nhật.

deleted

boolean DEFAULT false

Soft delete.

version

bigint DEFAULT 1

Version.

#### 7. Bảng: lexical_variants

Tên trường

Kiểu dữ liệu

Mô tả

id

**uuid PRIMARY KEY DEFAULT gen_random_uuid()**

**ID biến thể.**

notes

**text**

**Ghi chú biến thể.**

part_of_speech

**pos_enum**

**Loại từ biến thể (enum).**

pronunciation

**varchar**

**Phát âm biến thể.**

entry_id

**uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE**

**FK đến entry.**

created_at

**timestamp DEFAULT now()**

**Thời gian tạo.**

updated_at

**timestamp**

**Thời gian cập nhật.**

deleted

**boolean DEFAULT false**

**Soft delete.**

version

**bigint DEFAULT 1**

**Version.**

#### 8. Bảng: vocabulary_sets

Tên trường

Kiểu dữ liệu

Mô tả

id

**uuid PRIMARY KEY DEFAULT gen_random_uuid()**

**ID set từ vựng.**

title

**varchar NOT NULL**

**Tiêu đề set.**

description

**text**

**Mô tả.**

language

**lang_enum NOT NULL**

**Ngôn ngữ set (enum).**

type

**set_type_enum NOT NULL**

**Loại set (enum: 'flashcard', etc.).**

difficulty

**diff_enum**

**Độ khó (enum: 'easy', etc.).**

is_public

**boolean DEFAULT false**

**Public/private.**

is_active

**boolean DEFAULT true**

**Active status.**

tags

**text[] DEFAULT '{}'**

**Tags set.**

cover_image

**varchar**

**URL ảnh bìa.**

user_id

**varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE**

**FK đến user owner.**

entry_count

**integer DEFAULT 0**

**Số entry (trigger auto-update).**

favorite_count

**integer DEFAULT 0**

**Số favorites (trigger).**

study_count

**integer DEFAULT 0**

**Số lần học (trigger).**

created_at

**timestamp DEFAULT now()**

**Thời gian tạo.**

updated_at

**timestamp**

**Thời gian cập nhật.**

deleteAt

**boolean DEFAULT false**

**Soft delete.**

version

**bigint DEFAULT 1**

**Version.**

#### 9. Bảng: vocabulary_set_items

Tên trường

Kiểu dữ liệu

Mô tả

id

**uuid PRIMARY KEY DEFAULT gen_random_uuid()**

**ID item trong set.**

entry_id

**uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE**

**FK đến entry.**

vocabulary_set_id

**uuid NOT NULL REFERENCES vocabulary_sets(id) ON DELETE CASCADE**

**FK đến set.**

notes

**text**

**Ghi chú cá nhân.**

position

**integer**

**Thứ tự trong set.**

added_at

**timestamp DEFAULT now()**

**Thời gian thêm.**

created_at

**timestamp DEFAULT now()**

**Thời gian tạo.**

updated_at

**timestamp**

**Thời gian cập nhật.**

deleteAt

**boolean DEFAULT false**

**Soft delete.**

version

**bigint DEFAULT 1**

**Version.**

#### 10. Bảng: vocabulary_set_history

Tên trường

Kiểu dữ liệu

Mô tả

id

**uuid PRIMARY KEY DEFAULT gen_random_uuid()**

**ID lịch sử học.**

completed_items

**integer**

**Số item hoàn thành.**

completion_percentage

**double precision**

**% hoàn thành.**

correct_answers

**integer**

**Số câu đúng.**

last_studied

**timestamp**

**Lần học cuối.**

total_items

**integer**

**Tổng item.**

vocabulary_set_id

**uuid NOT NULL REFERENCES vocabulary_sets(id) ON DELETE CASCADE**

**FK đến set.**

created_at

**timestamp DEFAULT now()**

**Thời gian tạo.**

updated_at

**timestamp**

**Thời gian cập nhật.**

deleteAt

**boolean DEFAULT false**

**Soft delete (append-only, ít dùng).**

version

**Bigint default 1**

**Version**

#### 11. Bảng: user_vocabulary_set_favorites

Tên trường

Kiểu dữ liệu

Mô tả

user_id

**varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE**

**FK đến user (composite PK).**

vocabulary_set_id

**uuid NOT NULL REFERENCES vocabulary_sets(id) ON DELETE CASCADE**

**FK đến set (composite PK).**

favorited_at

**timestamp DEFAULT now()**

**Thời gian favorite.**

created_at

**timestamp DEFAULT now()**

**Thời gian tạo.**

updated_at

**timestamp DEFAULT now()**

**Thời gian cập nhật.**

deleteAt

**boolean DEFAULT false**

**Soft delete.**

#### 12. Bảng: user_vocabulary_progress

Tên trường

Kiểu dữ liệu

Mô tả

id

**uuid PRIMARY KEY DEFAULT gen_random_uuid()**

**ID tiến độ.**

user_id

**varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE**

**FK đến user.**

item_id

**uuid NOT NULL REFERENCES vocabulary_set_items(id) ON DELETE CASCADE**

**FK đến item.**

streak

**integer DEFAULT 0**

**Chuỗi ngày học liên tiếp (SRS).**

mastery_level

**float DEFAULT 0**

**Mức độ mastery (0-1).**

last_review

**timestamp**

**Lần review cuối.**

created_at

**timestamp DEFAULT now()**

**Thời gian tạo.**

update_at

**Timestamp DEFAULT now()**

**Thời gian cập nhật**

delete_at

**Timestamp Default null**

**Thời gian xóa, nếu không xóa để null**

### 5.2 ERD Relationships

**Parent Table**

**Child Table**

**FK Field**

**Cardinality**

**ON DELETE**

**Mô Tả**

entries

senses

entry_id

1:M

CASCADE

Senses thuộc entry.

entries

examples

entry_id

1:M

SET NULL

Examples attach to entry (optional).

entries

expressions

entry_id

1:M

CASCADE

Expressions từ entry.

entries

lexical_variants

entry_id

1:M

CASCADE

Variants của entry.

entries

expression_meanings

entry_id

1:M

SET NULL

Meanings cross-ref entry (optional).

entries

vocabulary_set_items

entry_id

M:M (via items)

CASCADE

Entries in sets.

senses

examples

sense_id

1:M

SET NULL

Examples cho sense (optional).

expressions

expression_meanings

expression_id

1:M

CASCADE

Meanings của expression.

users

vocabulary_sets

user_id

1:M

CASCADE

Sets của user.

users

user_vocabulary_set_favorites

user_id

1:M

CASCADE

Favorites của user.

users

user_vocabulary_progress

user_id

1:M

CASCADE

Progress của user.

vocabulary_sets

vocabulary_set_items

vocabulary_set_id

1:M

CASCADE

Items trong set.

vocabulary_sets

vocabulary_set_history

vocabulary_set_id

1:M

CASCADE

History của set.

vocabulary_sets

user_vocabulary_set_favorites

vocabulary_set_id

M:M (junction)

CASCADE

Favorites cho set.

vocabulary_set_items

user_vocabulary_progress

item_id

1:M

CASCADE

Progress per item.

### 5.3. Indexes Cụ Thể

Bảng

Index Name

Columns

Type

Lý Do

SQL

users

idx_users_email

email

B-tree UNIQUE

Login/search.

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE NOT is_deleted;

entries

idx_entries_word_lang

(word, language)

B-tree UNIQUE

Core search.

CREATE UNIQUE INDEX idx_entries_word_lang ON entries((word, language)) WHERE NOT deleted;

entries

idx_entries_search

search_vector

GIN

Full-text query.

CREATE INDEX idx_entries_search ON entries USING GIN(search_vector);

entries

idx_entries_tags

tags

GIN

Tag filtering.

CREATE INDEX idx_entries_tags ON entries USING GIN(tags);

entries

idx_entries_frequency

frequency DESC

B-tree

Popularity sort.

CREATE INDEX idx_entries_frequency ON entries(frequency DESC) WHERE NOT deleted;

senses

idx_senses_entry_lang

(entry_id, language)

B-tree

Fetch per entry.

CREATE INDEX idx_senses_entry_lang ON senses((entry_id, language)) WHERE NOT deleted;

examples

idx_examples_sense

sense_id

B-tree

Join efficiency.

CREATE INDEX idx_examples_sense ON examples(sense_id) WHERE NOT deleted;

vocabulary_sets

idx_sets_user_lang

(user_id, language)

B-tree

User-specific lists.

CREATE INDEX idx_sets_user_lang ON vocabulary_sets((user_id, language)) WHERE NOT deleted;

vocabulary_set_items

idx_items_set_entry

(vocabulary_set_id, entry_id)

B-tree UNIQUE

Prevent duplicates.

CREATE UNIQUE INDEX idx_items_set_entry ON vocabulary_set_items((vocabulary_set_id, entry_id)) WHERE NOT deleted;

vocabulary_set_history

idx_history_set_studied

(vocabulary_set_id, last_studied DESC)

B-tree

Recent history.

CREATE INDEX idx_history_set_studied ON vocabulary_set_history((vocabulary_set_id, last_studied DESC));

user_vocabulary_set_favorites

idx_fav_user

user_id

B-tree

User favorites.

CREATE INDEX idx_fav_user ON user_vocabulary_set_favorites(user_id) WHERE NOT deleted;

user_vocabulary_progress

idx_progress_user_item

(user_id, item_id)

B-tree UNIQUE

Progress lookup.

CREATE UNIQUE INDEX idx_progress_user_item ON user_vocabulary_progress((user_id, item_id));

### 5.4. Triggers Và Functions (Cho Maintainability)

-- Auto-update timestamps

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$

BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_timestamps BEFORE UPDATE ON entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Lặp cho các tables khác.

-- Update counts (e.g., entry_count)

CREATE OR REPLACE FUNCTION update_entry_count() RETURNS TRIGGER AS $$

BEGIN

UPDATE vocabulary_sets SET entry_count = (SELECT COUNT(\*) FROM vocabulary_set_items WHERE vocabulary_set_id = COALESCE(NEW.vocabulary_set_id, OLD.vocabulary_set_id) AND NOT deleted)

WHERE id = COALESCE(NEW.vocabulary_set_id, OLD.vocabulary_set_id);

RETURN COALESCE(NEW, OLD);

END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_entry_count AFTER INSERT OR UPDATE OR DELETE ON vocabulary_set_items FOR EACH ROW EXECUTE FUNCTION update_entry_count();

-- Soft delete cascade (e.g., for entries)

CREATE OR REPLACE FUNCTION soft_delete_entries() RETURNS TRIGGER AS $$

BEGIN

UPDATE senses SET deleted = true WHERE entry_id = OLD.id;

UPDATE examples SET deleted = true WHERE entry_id = OLD.id;

-- Lặp cho expressions, etc.

RETURN OLD;

END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trig_soft_delete_entries BEFORE UPDATE OF deleted ON entries FOR EACH ROW WHEN (NEW.deleted = true AND OLD.deleted = false) EXECUTE FUNCTION soft_delete_entries();

-- RLS Example (cho vocabulary_sets)

ALTER TABLE vocabulary_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY p_user_sets ON vocabulary_sets FOR ALL USING (user_id = current_setting('app.current_user_id')::varchar OR is_public = true);

### 5.5. Partitioning Và Tuning

**Partitioning:** entries theo language: CREATE TABLE entries_en PARTITION OF entries FOR VALUES IN ('en'); (cho scale horizontal).

**Tuning:** ALTER TABLE entries SET (autovacuum_vacuum_scale_factor = 0.05); Giảm bloat từ deletes.

### 5.6. Migration & Deployment Notes

**Tools:** Sử dụng Flyway/Alembic cho migrations; pg_dump cho backup.

**Testing:** Chạy EXPLAIN ANALYZE trên queries mẫu (e.g., search: SELECT \* FROM entries WHERE search_vector @@ plainto_tsquery('simple', 'apple');).

**Monitoring:** Sử dụng pg_stat_statements để track slow queries.

## 6. API Design

### 6.1 Endpoint Table

#### Component 1: Package & Word Management API

Method

Endpoint

Auth

Mô tả (Description)

Use Case (Tham chiếu)

GET

/packages

✅

Lấy danh sách tất cả các gói từ của người dùng.

(Trách nhiệm 1.1) [cite: 67]

POST

/packages

✅

Tạo một gói từ vựng mới (có thể kèm từ ban đầu).

UC-VOC-001 8

GET

/packages/{packageId}

✅

Lấy thông tin chi tiết của một gói từ (tên, mô tả, danh sách từ).

(Ngụ ý từ UC-VOC-002) [cite: 98]

PUT

/packages/{packageId}

✅

Cập nhật thông tin (tên, mô tả) của một gói từ.

UC-VOC-002 [cite: 98]

DELETE

/packages/{packageId}

✅

Xóa một gói từ vựng (không xóa từ trong Word Bank).

UC-VOC-003 [cite: 100]

POST

/packages/{packageId}/clone

✅

Nhân đôi (sao chép) một gói từ (của mình hoặc của cộng đồng).

UC-VOC-004 [cite: 102]

POST

/packages/{packageId}/import

✅

Thêm từ hàng loạt vào gói từ file CSV/text.

UC-VOC-015 [cite: 134]

POST

/packages/{packageId}/words

✅

Thêm một từ vựng (nhập thủ công) vào gói.

UC-VOC-011 [cite: 126]

DELETE

/packages/{packageId}/words/{userWordId}

✅

Gỡ một từ vựng ra khỏi gói (không xóa khỏi Word Bank).

UC-VOC-013 [cite: 130]

POST

/packages/{packageId}/members

✅

Mời một thành viên khác vào gói hợp tác.

UC-VOC-5 [cite: 104]

PUT

/packages/{packageId}/members/{userId}

✅

Thay đổi quyền của thành viên (ví dụ: EDITOR sang OWNER).

UC-VOC-6 [cite: 106]

DELETE

/packages/{packageId}/members/{userId}

✅

Xóa một thành viên ra khỏi gói.

UC-VOC-6 (A1) [cite: 106]

POST

/words/acquire

✅

Lưu một từ mới từ Module Đọc (Quick Lookup).

(Trách nhiệm 2.1) [cite: 72]

PUT

/words/{userWordId}

✅

Chỉnh sửa chi tiết từ vựng đã lưu (ghi chú, ví dụ).

UC-VOC-012 [cite: 128]

DELETE

/words/{userWordId}

✅

Xóa vĩnh viễn một từ khỏi Word Bank (khỏi tất cả các gói).

UC-VOC-018 [cite: 140]

POST

/words/{userWordId}/move

✅

Di chuyển một từ từ Gói A sang Gói B.

UC-VOC-014 [cite: 132]

POST

/words/{userWordId}/tags

✅

Gắn thẻ (tag) cá nhân cho một từ.

UC-VOC-016 [cite: 136]

POST

/words/{userWordId}/master

✅

Đánh dấu một từ là "Đã thành thạo" (loại khỏi SRS).

UC-VOC-017 [cite: 138]

POST

/words/{userWordId}/relearn

✅

Đưa từ "Đã thành thạo" trở lại hàng đợi học.

UC-VOC-017 (A2) [cite: 138]

##### Detailed Spec – POST /packages (Create Vocabulary Set)

- **Controller / Method:** `VocabularySetController.createSet`
- **Pipeline:** `CreateVocabularySetDto` → `CreateVocabularySetCommand` → handler → `VocabularySetResponseDto`
- **Auth:** JWT Bearer (required)
- **Use Case:** UC-VOC-001 – Create vocabulary package (with optional initial words)

**Request Body (CreateVocabularySetDto)**

| Field             | Type                   | Required | Description                                  | Validation / Constraints                                                                                           |
| ----------------- | ---------------------- | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `title`           | string                 | ✅       | Tên gói từ                                   | 1-200 chars, trimmed, non-empty                                                                                    |
| `description`     | string                 | ❌       | Mô tả thêm                                   | ≤ 1000 chars                                                                                                       |
| `language`        | enum `Language`        | ✅       | Ngôn ngữ chính                               | Must match allowed values (`en`, `vi`, `ja`, `ko`, …)                                                              |
| `type`            | enum `SetType`         | ✅       | Kiểu gói (`FLASHCARD`, `QUIZ`, …)            | Validated via VO                                                                                                   |
| `difficulty`      | enum `DifficultyLevel` | ❌       | Độ khó gợi ý                                 | Optional nhưng phải là enum hợp lệ                                                                                 |
| `tags`            | string[]               | ❌       | Tag phục vụ tìm kiếm                         | Up to 20 items, mỗi item ≤ 30 chars                                                                                |
| `coverImageUrl`   | string                 | ❌       | Ảnh bìa (URL)                                | Optional                                                                                                           |
| `initialEntryIds` | string[]               | ❌       | Danh sách Entry ID import ngay khi tạo       | Deduplicate + validate; tất cả phải tồn tại                                                                        |
| `initialWords`    | array of objects       | ❌       | Người dùng nhập từ mới trực tiếp khi tạo set | Mỗi phần tử: `{ word, definition?, example?, notes? }`. Hệ thống auto tạo Entry nếu chưa có. Giới hạn đề xuất ≤ 50 |

**Behavior**

1. Command constructor thực hiện validation business-level.
2. Mapper tạo `VocabularySetEntity` với đầy đủ Value Objects.
3. Repository persist gói mới (`isPublic=false`, `isActive=true`, counters = 0).
4. Nếu `initialEntryIds` được truyền:
   - `EntryRepository.findByIds` fetch batch; nếu thiếu => `NotFoundException`.
   - Tạo `VocabularySetItemEntity` theo đúng thứ tự, sau đó gọi `VocabularySetItemRepository.createManyWithProgress` (transaction).
   - Transaction này đồng thời tạo `userVocabularyProgress` + cập nhật `entryCount`.
5. Domain events:
   - `VocabularySetCreatedEvent` sau khi persist thành công.
   - `EntryAddedToSetEvent` cho từng item sau khi transaction commit.

**Success Response (201)**

`formatSuccessResponse<VocabularySetResponseDto>`:

| Field                            | Type         | Notes                           |
| -------------------------------- | ------------ | ------------------------------- |
| `id`                             | string       | ID gói vừa tạo                  |
| `title`, `description`           | string       | Theo input                      |
| `language`, `type`, `difficulty` | enum         | Giá trị VO                      |
| `isPublic`, `isActive`           | boolean      | Default: false / true           |
| `tags`                           | string[]     | Copy từ DTO                     |
| `coverImage`                     | string\|null |                                 |
| `userId`                         | string       | = current user                  |
| `entryCount`                     | number       | Bằng số entry import thành công |
| `favoriteCount`, `studyCount`    | number       | Default 0                       |
| `createdAt`, `updatedAt`         | ISO string   | DB timestamps                   |

**Error Mapping**

| Status | Scenario                                                   | Message format                     |
| ------ | ---------------------------------------------------------- | ---------------------------------- |
| 400    | DTO validation fail (title trống, enum sai, vượt giới hạn) | `errorCode: VALIDATION_ERROR`      |
| 401    | Missing/invalid JWT                                        | `errorCode: UNAUTHORIZED`          |
| 404    | Một hoặc nhiều `initialEntryIds` không tồn tại             | `errorCode: ENTRY_NOT_FOUND`       |
| 409    | (Optional) Conflict như duplicate title nếu enforce        | `errorCode: CONFLICT`              |
| 500    | Lỗi khác                                                   | `errorCode: INTERNAL_SERVER_ERROR` |

**Example**

_Request_

```http
POST /api/v1/packages
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "IELTS Writing Task 2",
  "description": "High frequency academic vocabulary",
  "language": "en",
  "type": "FLASHCARD",
  "difficulty": "INTERMEDIATE",
  "tags": ["ielts", "writing"],
  "initialEntryIds": ["entry-123", "entry-456"],
  "initialWords": [
    {
      "word": "cohesion",
      "definition": "The action of forming a united whole.",
      "example": "Paragraph cohesion improves readability.",
      "notes": "Nhấn mạnh khi viết Task 2."
    }
  ]
}
```

_Response (201)_

```json
{
  "success": true,
  "message": "Vocabulary set created successfully",
  "data": {
    "id": "set-abc",
    "title": "IELTS Writing Task 2",
    "language": "en",
    "type": "FLASHCARD",
    "difficulty": "INTERMEDIATE",
    "tags": ["ielts", "writing"],
    "entryCount": 2,
    "userId": "user-xyz",
    "createdAt": "2025-11-14T09:32:01.000Z",
    "updatedAt": "2025-11-14T09:32:01.000Z"
  }
}
```

> **Note:** `VocabularySetItemRepository.createManyWithProgress` đảm bảo atomicity giữa việc thêm item và khởi tạo SRS progress; domain events chỉ publish sau khi transaction commit.

#### Component 2: Learning & SRS API

Method

Endpoint

Auth

Mô tả (Description)

Use Case (Tham chiếu)

GET

/learn/queue

✅

Lấy hàng đợi ôn tập (SRS) cho hôm nay.

UC-VOC-7 [cite: 109]

POST

/learn/review

✅

Gửi kết quả của một lần lật flashcard (cập nhật SRS).

UC-VOC-8 10

GET

/packages/{packageId}/flashcards

✅

Bắt đầu phiên học flashcard cho một gói từ. Hỗ trợ query params: status=new, order=random, flip=definition.

UC-VOC-9 [cite: 113]

POST

/packages/{packageId}/quiz/questions

✅

Tự tạo (thủ công) một câu hỏi quiz cho gói.

UC-VOC-10 [cite: 115]

POST

/packages/{packageId}/quiz/generate

✅

Yêu cầu AI tạo một phiên quiz (quiz session) mới.

UC-VOC-10.1 [cite: 117]

GET

/quiz/session/{sessionId}

✅

Lấy thông tin phiên quiz và câu hỏi đầu tiên.

(Ngụ ý từ 10.2) [cite: 119]

POST

/quiz/session/{sessionId}/answer

✅

Nộp câu trả lời cho một câu hỏi và nhận câu tiếp theo.

UC-VOC-10.2 [cite: 119]

POST

/quiz/session/{sessionId}/complete

✅

Hoàn thành phiên quiz (tính toán điểm cuối cùng).

UC-VOC-10.2 (Bước 9) [cite: 119]

GET

/quiz/session/{sessionId}/results

✅

Xem lại kết quả, câu đúng/sai của một phiên quiz đã hoàn thành.

UC-VOC-10.3 [cite: 121]

POST

/quiz/challenge

✅

Gửi lời thách đấu quiz cho người dùng khác.

UC-VOC-10.4 [cite: 123]

POST

/quiz/challenge/{challengeId}/accept

✅

Chấp nhận lời thách đấu và bắt đầu phiên quiz.

UC-VOC-10.4 (A1) [cite: 123]

#### Component 3: Community & Sharing API

Method

Endpoint

Auth

Mô tả (Description)

Use Case (Tham chiếu)

GET

/community/packages

(Công khai)

Tìm kiếm, lọc và sắp xếp các gói từ công khai. Hỗ trợ query params: q=IELTS, sortBy=newest, category=travel, minWords=20.

UC-VOC-19, 20 [cite: 143, 145]

GET

/community/packages/{packageId}

(Công khai)

Xem chi tiết một gói từ công khai (gồm danh sách từ).

UC-VOC-21 [cite: 147]

GET

/community/creators/{userId}

(Công khai)

Xem hồ sơ công khai của người tạo và các gói họ đã chia sẻ.

UC-VOC-22 [cite: 149]

POST

/packages/{packageId}/publish

✅

Gửi gói từ cá nhân đi kiểm duyệt để công khai.

UC-VOC-007 12

POST

/packages/{packageId}/unpublish

✅

Gỡ gói từ khỏi cộng đồng (trở về riêng tư).

UC-VOC-007 (A3) 13

POST

/community/packages/{packageId}/favorite

✅

Yêu thích một gói từ công khai.

UC-VOC-021 [cite: 154]

DELETE

/community/packages/{packageId}/favorite

✅

Bỏ yêu thích một gói từ.

UC-VOC-021 (A1) [cite: 154]

GET

/community/favorites

✅

Lấy danh sách các gói từ mà người dùng đã yêu thích.

UC-VOC-022 [cite: 156]

GET

/community/packages/{packageId}/share-link

(Công khai)

Lấy đường link URL để chia sẻ gói từ.

UC-VOC-023 [cite: 158]

POST

/community/packages/{packageId}/report

✅

Báo cáo một gói từ vựng (spam, không phù hợp).

UC-VOC-024 [cite: 160]

POST

/community/creators/{userId}/follow

✅

Theo dõi một người tạo nội dung.

UC-VOC-025 [cite: 162]

DELETE

/community/creators/{userId}/follow

✅

Bỏ theo dõi một người tạo.

UC-VOC-025 (A1) [cite: 162]

POST

/community/words/{entryId}/mnemonics

✅

Thêm một mẹo ghi nhớ (mnemonic) cho từ.

UC-VOC-026 [cite: 164]

POST

/community/mnemonics/{mnemonicId}/vote

✅

Bình chọn (upvote/downvote) cho một mẹo ghi nhớ.

UC-VOC-027 [cite: 166]

POST

/community/words/{entryId}/examples

✅

Thêm một câu ví dụ cộng đồng cho từ.

UC-VOC-028 [cite: 168]

POST

/community/examples/{exampleId}/vote

✅

Bình chọn cho một câu ví dụ cộng đồng.

UC-VOC-029 [cite: 170]

#### Component 4: Engagement & Stats API

Method

Endpoint

Auth

Mô tả (Description)

Use Case (Tham chiếu)

GET

/stats/progress

✅

Xem thống kê tiến độ cá nhân (tổng từ, từ đã học...).

UC-VOC-030 [cite: 173]

GET

/stats/streak

✅

Xem chuỗi ngày học liên tiếp (study streak) hiện tại.

UC-VOC-031 [cite: 175]

GET

/stats/leaderboard

✅

Xem bảng xếp hạng. Hỗ trợ query params: period=weekly (weekly, monthly, alltime).

UC-VOC-032 [cite: 177]

GET

/stats/achievements

✅

Lấy danh sách các thành tựu (badges) đã đạt được.

UC-VOC-033 [cite: 179]

#### Component 5 & 6: Account, Settings & Notifications API

Method

Endpoint

Auth

Mô tả (Description)

Use Case (Tham chiếu)

GET

/profile

✅

Lấy thông tin hồ sơ cá nhân (tên, ảnh, bio).

UC-VOC-035 [cite: 185]

PUT

/profile

✅

Cập nhật thông tin hồ sơ cá nhân.

UC-VOC-035 [cite: 185]

GET

/settings/learning

✅

Lấy các cài đặt học tập (số từ mới/ngày, v.v.).

UC-VOC-036 [cite: 187]

PUT

/settings/learning

✅

Cập nhật các cài đặt học tập.

UC-VOC-036 [cite: 187]

GET

/settings/notifications

✅

Lấy các cài đặt thông báo (nhận email, push...).

UC-VOC-037 [cite: 189]

PUT

/settings/notifications

✅

Cập nhật các cài đặt thông báo.

UC-VOC-037 [cite: 189]

GET

/notifications

✅

Lấy danh sách thông báo (chuông thông báo).

UC-VOC-034 [cite: 182]

POST

/notifications/read-all

✅

Đánh dấu tất cả thông báo là đã đọc.

UC-VOC-034 (Bước 6) [cite: 182]

POST

/notifications/{notificationId}/read

✅

Đánh dấu một thông báo là đã đọc.

UC-VOC-034 (Bước 5) [cite: 182]

POST

/account/export

✅

Yêu cầu xuất (export) dữ liệu cá nhân (từ vựng).

UC-VOC-038 [cite: 191]

DELETE

/account

✅

Yêu cầu xóa vĩnh viễn tài khoản.

UC-VOC-038 [cite: 191]

### 6.2 Request/Response Schemas

- Defined in OpenAPI 3.0 format
- Includes validation rules, error codes, and examples

## 7. Security Design

- JWT/Auth0 authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting and abuse detection
- Audit logging for word saves and quiz submissions
- GDPR-compliant data deletion

## 8. Performance & Scalability

- Redis caching for frequent queries
- Horizontal scaling via Kubernetes
- PostgreSQL read replicas
- Quiz generation offloaded to async workers
- Indexed search on word text, CEFR level, and topic
- CDN for static assets (e.g., pronunciation audio)

## 9. Monitoring & Logging

- Metrics:Quiz completion rate
- Word retention score
- Package usage frequency

- Logs:Save word events
- Quiz attempts
- API errors

- Tools:Grafana
- Prometheus
- Sentry

## 10. Testing Strategy

- **Unit Tests**: QuizGenerator, SpacedRepetitionEngine, VocabularyService
- **Integration Tests**: API + DB + Cache
- **Contract Tests**: OpenAPI validation
- **Test Coverage Target**: ≥ 85%
- **Test Data**: Sample words, packages, quiz results

## 11. Configuration & Environment

Variable

Description

MAX_PACKAGE_SIZE

Maximum number of words per package

QUIZ_TIMEOUT_MS

Timeout for quiz generation

REDIS_TTL

Cache expiration time

SUPPORTED_LANGUAGES

EN–VI, EN–JP, EN–KR

OPENAI_API_KEY

Key for GPT-based quiz generation

TTS_API_KEY

Key for pronunciation playback

## 12. Extensibility & Maintainability

- Plugin support for new quiz types
- API versioning strategy
- Deprecation policy for old endpoints
- Modular service structure for future features (e.g., gamification)

## 13. Compliance & Localization

- GDPR/CCPA compliance
- Language support: English–Vietnamese, Japanese, Korean
- Accessibility: WCAG 2.1 compliance for UI components
