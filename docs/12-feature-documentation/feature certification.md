# Feature: Certification (Đề thi & Chứng chỉ)

## 1. Tổng quan Module

### 1.1. Module Name

Certification (Đề thi & Chứng chỉ)

### 1.2. Purpose

Quản lý toàn bộ vòng đời của đề thi chứng chỉ: tạo bộ sưu tập (collection), câu hỏi (question), đề thi (exam), tổ chức làm bài thi (session), chấm điểm và đánh giá kết quả. Hỗ trợ nhiều chiến lược đề thi (TOEIC, IELTS, VSTEP, Cambridge) với cơ chế sections linh hoạt.

### 1.3. Scope

- Quản lý bộ sưu tập (collections), chương (chapters), đề thi (exams), câu hỏi (questions)
- Tổ chức phiên thi (sessions), lưu đáp án (answers), ghi vi phạm (violations)
- Chấm điểm tự động, tính band score, đánh giá AI
- Tính năng xã hội: yêu thích, bookmark, đánh giá, thảo luận, báo cáo
- Tải xuống tài nguyên, theo dõi lịch sử practice

Không bao gồm: Quản lý người dùng (User module), xác thực (Auth module)

### 1.4. Dependencies

- **User Module:** Lấy thông tin người dùng, xác thực quyền sở hữu
- **Vocabulary Module:** Liên kết từ vựng với câu hỏi
- **Cache Module (Redis):** Cache dashboard, collection, exam queries
- **Storage Module:** Upload media cho câu hỏi (audio, image)
- **BullMQ:** Xử lý background jobs (chấm điểm, analytics)

### 1.5. Architecture

```
presentation/controllers/
  certification.controller.ts        # 65 REST endpoints

application/
  commands/                           # 30 commands (write operations)
  querys/                             # 32 queries (read operations)
  dtos/                               # 19 DTO files

domain/
  aggregates/                         # 6 AggregateRoots
  entities/                           # 16 domain entities
  events/                             # 4 domain events
  repositories/                       # ICertificationRepository (~120 methods)
  services/                           # ExamSessionDomainService
  sagas/                              # CertificationSaga (2 streams)
  exam-strategies/                    # 4 strategies (TOEIC, IELTS, VSTEP, Cambridge)

infrastructure/
  repositories/                       # 9 split repositories (Facade pattern)
  cache/                              # CertificationCacheService
  processors/                         # CertificationProcessor (4 job types)
```

---

## 2. Core Functional Breakdown

### 2.1. Quản lý Bộ sưu tập (Collection Management)

Cho phép người dùng tạo, chỉnh sửa, xóa bộ sưu tập đề thi.

- **Tạo Collection:** Tạo bộ sưu tập mới với tiêu đề, mô tả, loại chứng chỉ
- **Chỉnh sửa Collection:** Cập nhật thông tin, trạng thái publish
- **Xóa Collection:** Soft delete (đặt deletedAt)
- **Clone Collection:** Sao chép toàn bộ cấu trúc (chapters, exams, questions) sang owner mới
- **Theo dõi hoạt động:** Liệt kê hoạt động gần đây của collection

### 2.2. Quản lý Chương (Chapter Management)

Tổ chức câu hỏi theo chương trong bộ sưu tập.

- **Tạo/Sửa/Xóa Chapter:** CRUD cơ bản
- **Sắp xếp Chapter:** Cập nhật order
- **Sync Chapters:** Đồng bộ hóa danh sách chapter theo thứ tự

### 2.3. Quản lý Đề thi (Exam Management)

Quản lý đề thi trong bộ sưu tập, hỗ trợ nhiều chiến lược câu hỏi.

- **Tạo/Sửa/Xóa Exam:** CRUD cơ bản
- **Sections:** Chia đề thi thành các phần (Part 1, Part 2... cho TOEIC)
- **Chiến lược đề thi:**
  - **TOEIC:** 7 parts, 200 câu hỏi (Listening + Reading)
  - **IELTS:** 10 sections (Listening 4, Reading 3, Writing 2, Speaking 1)
  - **VSTEP:** Tương tự IELTS
  - **Cambridge:** 14 sections (Use of English, Reading, Listening, Writing, Speaking)
- **Khởi tạo câu hỏi:** Tạo câu hỏi mẫu theo chiến lược
- **Publish Exam:** Đặt trạng thái công khai (yêu cầu tất cả exams có câu hỏi)

### 2.4. Quản lý Câu hỏi (Question Management)

Hệ thống câu hỏi phong phú với nhiều định dạng.

- **Lưu câu hỏi:** Single/Multiple Choice, Fill-in-blank, Essay
- **Choices:** Các phương án lựa chọn với label (A, B, C, D)
- **Metadata:** Explanation, estimated time, rubric, passage text
- **Batch Operations:** Upsert hàng hàng với hash-based change detection
- **Differential Update:** Chỉ cập nhật choices thay đổi
- **Version History:** Lưu lịch sử thay đổi câu hỏi

### 2.5. Tổ chức Phiên thi (Session Management)

Quản lý phiên thi của người dùng.

- **Bắt đầu phiên thi:** Tạo session với exam reference
- **Lưu đáp án:** Lưu từng câu trả lời theo thời gian thực
- **Ghi vi phạm:** Ghi nhận hành vi gian lận (tab switch, copy...)
- **Nộp bài:** Kết thúc session, trigger chấm điểm

### 2.6. Chấm điểm & Đánh giá (Scoring & Evaluation)

Hệ thống chấm điểm tự động và đánh giá AI.

- **Tính điểm:** So đáp án với đáp án đúng, tính band score
- **Skill Results:** Phân tích điểm theo kỹ năng (Listening, Reading, Writing...)
- **Question Results:** Chi tiết từng câu hỏi
- **AI Evaluation:** Đánh giá bởi AI (cho Writing/Speaking)
- **Background Processing:** BullMQ job `calculate-exam-score`

### 2.7. Tính năng xã hội (Social Features)

- **Yêu thích (Favorites):** Đánh dấu collection yêu thích
- **Bookmark:** Lưu collection để xem sau
- **Đánh giá (Reviews):** Viết đánh giá 1-5 sao
- **Thảo luận (Discussions):** Tạo chủ đề thảo luận, bình luận
- **Báo cáo (Reports):** Báo cáo nội dung vi phạm

### 2.8. Dashboard & Thống kê

- **Certification Dashboard:** Tổng quan tiến độ học tập
- **Creator Dashboard:** Thống kê cho người tạo nội dung
- **Study Plan:** Kế hoạch học tập cá nhân hóa
- **Leaderboard:** Bảng xếp hạng contributors
- **Practice History:** Lịch sử làm bài

---

## 3. API Endpoints (65 endpoints)

### Collection

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/certification/dashboard` | Dashboard tổng quan |
| GET | `/certification/creator-dashboard` | Dashboard người tạo |
| GET | `/certification/collections/featured` | Bộ sưu tập nổi bật |
| GET | `/certification/collections/trending` | Bộ sưu tập trending |
| GET | `/certification/collections/official` | Bộ sưu tập chính thức |
| GET | `/certification/collections/community` | Bộ sưu tập cộng đồng |
| GET | `/certification/collections/saved` | Bộ sưu tập đã lưu |
| GET | `/certification/collections/cloned` | Bộ sưu tập đã clone |
| GET | `/certification/collections/my` | Bộ sưu tập của tôi |
| GET | `/certification/collections/completed` | Bộ sưu tập đã hoàn thành |
| GET | `/certification/collections/purchased` | Bộ sưu tập đã mua |
| GET | `/certification/collections/:id` | Chi tiết collection |
| GET | `/certification/collections/:id/items` | Items trong collection |
| GET | `/certification/collections/:id/editor` | Editor data |
| GET | `/certification/collections/:id/reviews` | Đánh giá |
| POST | `/certification/collections/:id/reviews` | Thêm đánh giá |
| GET | `/certification/collections/:id/discussions` | Thảo luận |
| POST | `/certification/collections/:id/discussions` | Tạo thảo luận |
| GET | `/certification/collections/:id/activities` | Hoạt động |
| POST | `/certification/collections` | Tạo collection |
| PUT | `/certification/collections/:id` | Cập nhật collection |
| PUT | `/certification/collections/:id/chapters` | Đồng bộ chapters |
| DELETE | `/certification/collections/:id` | Xóa collection |
| POST | `/certification/collections/:id/save` | Lưu collection |
| POST | `/certification/collections/:id/favorite` | Yêu thích |
| POST | `/certification/collections/:id/clone` | Clone collection |
| POST | `/certification/collections/:id/report` | Báo cáo |

### Exam

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/certification/exams/:id` | Chi tiết exam |
| GET | `/certification/exams/:id/builder` | Builder data |
| GET | `/certification/exams/:id/initialization-status` | Trạng thái khởi tạo |
| POST | `/certification/exams/:id/retry-initialization` | Retry khởi tạo |
| GET | `/certification/exams/:examId/sections/:sectionId/questions` | Câu hỏi theo section |
| POST | `/certification/collections/:id/exams` | Tạo exam |
| PUT | `/certification/exams/:id` | Cập nhật exam |
| DELETE | `/certification/exams/:id` | Xóa exam |
| PUT | `/certification/exams/:id/sections` | Lưu sections |
| PUT | `/certification/exams/:id/content` | Lưu nội dung exam |
| PATCH | `/certification/exams/:id/content` | Patch nội dung exam |
| POST | `/certification/exams/:id/initialize-questions` | Khởi tạo câu hỏi |
| POST | `/certification/exams/link-question` | Link câu hỏi |
| DELETE | `/certification/exams/:examId/questions/:questionId` | Unlink câu hỏi |

### Question

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/certification/questions/:id/builder` | Builder data |
| POST | `/certification/questions/save` | Lưu câu hỏi |
| DELETE | `/certification/questions/:id` | Xóa câu hỏi |
| GET | `/certification/questions/:id/history` | Lịch sử câu hỏi |

### Session & Result

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/certification/sessions/start` | Bắt đầu phiên thi |
| GET | `/certification/sessions/in-progress` | Session đang chạy |
| GET | `/certification/sessions/:sessionId` | Chi tiết session |
| PUT | `/certification/sessions/:sessionId/answers` | Lưu đáp án |
| POST | `/certification/sessions/:sessionId/violations` | Ghi vi phạm |
| POST | `/certification/sessions/:sessionId/submit` | Nộp bài |
| GET | `/certification/results/:resultId` | Kết quả thi |
| GET | `/certification/history` | Lịch sử practice |

### Social

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/certification/favorites` | Danh sách yêu thích |
| DELETE | `/certification/favorites/:id` | Xóa yêu thích |
| GET | `/certification/bookmarks` | Danh sách bookmark |
| POST | `/certification/bookmarks` | Thêm bookmark |
| DELETE | `/certification/bookmarks/:id` | Xóa bookmark |
| GET | `/certification/downloads` | Danh sách tải xuống |
| DELETE | `/certification/downloads/:id` | Xóa download |
| DELETE | `/certification/downloads` | Xóa tất cả downloads |

### Study Plan & Contributors

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/certification/study-plan` | Kế hoạch học tập |
| GET | `/certification/contributors/top` | Top contributors |
| GET | `/certification/certificates` | Chứng chỉ |
| GET | `/certification/certificates/:id/download` | Tải chứng chỉ |

---

## 4. Domain Events

| Event | Name | Trigger | Action |
|-------|------|---------|--------|
| `ExamSessionStartedEvent` | `certification.session-started` | Bắt đầu session | Invalidate dashboard cache |
| `ExamSessionSubmittedEvent` | `certification.session-submitted` | Nộp bài | Queue `calculate-exam-score` + `process-exam-analytics` |
| `SessionAnswerSavedEvent` | `certification.answer-saved` | Lưu đáp án | Chưa xử lý |
| `SessionViolationRecordedEvent` | `certification.violation-recorded` | Ghi vi phạm | Chưa xử lý |

---

## 5. Background Jobs (BullMQ)

| Job Name | Queue | Description |
|----------|-------|-------------|
| `calculate-exam-score` | `certification-tasks` | Chấm điểm, tính band score, lưu kết quả |
| `process-exam-analytics` | `certification-tasks` | Xóa cache dashboard/stats |
| `aggregate-user-certification-stats` | `certification-tasks` | Tổng hợp thống kê người dùng |
| `publish-collection` | `certification-tasks` | Validate và publish collection |

---

## 6. Caching Strategy

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `certification:dashboard:{userId}` | 300s | Dashboard data |
| `certification:featured-collections` | 300s | Featured collections |
| `certification:trending-collections` | 300s | Trending collections |
| `certification:collection-editor:{id}` | 300s | Collection editor data |
| `certification:exam:{id}` | 300s | Exam detail |

Sử dụng `SharedCacheService.singleflight()` để chống cache stampede.

---

## 7. Exam Strategies

| Strategy | Type | Sections | Questions |
|----------|------|----------|-----------|
| TOEIC | `TOEIC` | 7 Parts | 200 |
| IELTS | `IELTS` | 10 Sections | ~130 |
| VSTEP | `VSTEP` | 10 Sections | ~130 |
| Cambridge | `CAMBRIDGE` | 14 Sections | ~100 |

Mỗi strategy định nghĩa:
- Cấu trúc sections mặc định
- Số câu hỏi mặc định per section
- Metadata cho audio/image questions
- Validation rules

---

## 8. Repository Architecture

Sử dụng **Facade Pattern** — `CertificationRepository` (580 dòng) là facade delegate sang 8 sub-repositories:

| Repository | Responsibility | Lines |
|------------|---------------|-------|
| `CollectionRepository` | Collection CRUD | 338 |
| `ExamRepository` | Exam + Chapter + Section CRUD | 281 |
| `QuestionRepository` | Question + Choice + Metadata CRUD | 268 |
| `ExamQuestionRepository` | ExamQuestion linking + paginated queries | 200 |
| `QuestionBatchRepository` | Batch upsert, initialize, hash, diff | 344 |
| `SessionRepository` | ExamSession + Answers + Violations | 114 |
| `ResultRepository` | ExamResult + SkillResult + AiEvaluation | 138 |
| `SocialRepository` | Favorites, Bookmarks, Reviews, Discussions | 286 |

`ICertificationRepository` interface giữ nguyên ~120 methods — tất cả handlers không cần thay đổi.

---

## 9. DTOs

| DTO | Purpose |
|-----|---------|
| `CreateCollectionDto` | Tạo collection mới |
| `UpdateCollectionDto` | Cập nhật collection |
| `CreateExamDto` | Tạo exam mới |
| `UpdateExamDto` | Cập nhật exam |
| `SaveExamSectionsDto` | Lưu sections |
| `SaveExamContentDto` | Lưu nội dung exam |
| `SaveQuestionDto` | Lưu câu hỏi |
| `StartExamSessionDto` | Bắt đầu phiên thi |
| `SaveSessionAnswerDto` | Lưu đáp án |
| `RecordSessionViolationDto` | Ghi vi phạm |
| `AddBookmarkDto` | Thêm bookmark |
| `CreateCollectionReviewDto` | Thêm đánh giá |
| `CreateCollectionDiscussionDto` | Tạo thảo luận |
| `InitializeExamQuestionsDto` | Khởi tạo câu hỏi |
| `LinkQuestionToExamDto` | Link câu hỏi |
| `SyncChaptersDto` | Đồng bộ chapters |

---

## 10. DB Schema (Prisma)

### Models chính

- `Collection` — Bộ sưu tập đề thi
- `Chapter` — Chương trong collection
- `Exam` — Đề thi
- `ExamSection` — Phần của đề thi
- `Question` — Câu hỏi
- `QuestionChoice` — Phương án lựa chọn
- `QuestionMetadata` — Metadata câu hỏi
- `QuestionVersion` — Lịch sử phiên bản câu hỏi
- `ExamQuestion` — Liên kết Exam-Question (n-n)
- `ExamSession` — Phiên thi
- `SessionAnswer` — Đáp án
- `SessionViolation` — Vi phạm
- `ExamResult` — Kết quả thi
- `SkillResult` — Kết quả theo kỹ năng
- `QuestionResult` — Kết quả theo câu hỏi
- `AiEvaluation` — Đánh giá AI
- `CreatorProfile` — Hồ sơ người tạo
- `CollectionFavorite` — Yêu thích
- `CollectionBookmark` — Bookmark
- `CollectionReview` — Đánh giá
- `CollectionDiscussion` — Thảo luận
- `DiscussionReply` — Bình luận
- `UserDownload` — Tải xuống
- `CollectionPurchase` — Mua hàng
- `CollectionReport` — Báo cáo
