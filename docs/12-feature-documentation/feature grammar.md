# Feature: Grammar (Ngữ pháp)

## 1. Tổng quan Module

### 1.1. Module Name

Grammar (Ngữ pháp)

### 1.2. Purpose

Cung cấp hệ thống học ngữ pháp tiếng Anh theo CEFR (A1-C2) với:
- Bài học có lý thuyết (theory blocks) và theo dõi tiến độ
- Quiz hàng ngày (daily quiz) với hệ thống lặp lại ngắt quãng (SM-2 SRS)
- Đề thi giả lập (mock exams) với chứng chỉ cộng đồng
- Dairy bẫy ngữ pháp (trap diary) để ghi nhớ lỗi sai
- Bảng xếp hạng (leaderboard) và gamification (XP, streak)

### 1.3. Scope

- Quản lý bài học ngữ pháp (lessons) với nội dung theory blocks
- Hệ thống quiz: daily quiz, practice questions, graduation exams
- SRS (Spaced Repetition System) với thuật toán SM-2
- Trap diary: ghi nhận câu sai, theo dõi đã sửa
- Community: thảo luận, crowdsourced quizzes
- Gamification: XP, streak, certificates

Không bao gồm: Quản lý đề thi chứng chỉ (Certification module), từ vựng (Vocabulary module)

### 1.4. Dependencies

- **User Module:** Thông tin người dùng, xác thực
- **Cache Module (Redis):** Chưa sử dụng cache riêng
- **Infrastructure Database:** Prisma ORM

### 1.5. Architecture

```
presentation/controllers/
  grammar.controller.ts              # 30 REST endpoints
  guards/
    grammar-abilities.guard.ts       # ABAC guard cho trap diary

application/
  commands/                           # 18 commands
  querys/                             # 12 queries
  events/                             # 3 event handlers
  dtos/                               # 5 DTO files, 11 DTO classes

domain/
  aggregates/                         # 1 aggregate (GrammarLessonAggregate)
  entities/                           # 12 entities
  events/                             # 7 domain events
  value-objects/                      # 3 value objects
  repositories/                       # 8 repository interfaces
  sagas/                              # (không có)

infrastructure/
  repositories/                       # 8 Prisma implementations
```

---

## 2. Core Functional Breakdown

### 2.1. Quản lý Bài học (Lesson Management)

- **CRUD Lessons:** Tạo, cập nhật, xóa bài học với theory blocks
- **Theory Blocks:** Nội dung bài học gồm text, code, quiz嵌入
- **Trạng thái:** DRAFT → PUBLISHED → ARCHIVED
- **Phân loại CEFR:** A1, A2, B1, B2, C1, C2
- **Tags:** Gắn tags cho bài học (grammar, vocabulary, etc.)

### 2.2. Hệ thống Quiz

#### Daily Quiz
- Quiz hàng ngày với câu hỏi ngẫu nhiên từ pool
- Tính điểm và XP earn
- History tracking

#### Practice Questions
- Lọc theo level, category, type
- Quiz câu hỏi practice không giới hạn

#### Graduation Exam
- Đề thi cuối cấp cho từng CEFR level
- Đạt ≥80% → nhận badge/certificate
- Unlock level tiếp theo

#### Crowdsourced Quizzes
- Người dùng đóng góp câu hỏi cho bài học
- Hệ thống upvote, approve/reject
- Crowdsourced quiz được cộng đồng đóng góp

### 2.3. Spaced Repetition System (SRS)

Triển khai thuật toán SM-2:

- **Interval:** Khoảng cách giữa các lần ôn
- **Ease Factor:** Hệ số điều chỉnh (≥1.3)
- **Repetitions:** Số lần ôn liên tiếp đúng
- **Next Review:** Thời gian ôn tiếp theo

Khi submit SRS feedback:
- Correct: Tăng interval, tăng ease factor
- Sai: Reset interval, giảm ease factor

### 2.4. Trap Diary (Bẫy Ngữ Pháp)

- **Lưu bẫy:** Khi trả lời sai, lưu vào trap diary
- **Theo dõi:** Trạng thái ACTIVE → BROKEN (đã sửa)
- **AI Analysis:** Yêu cầu AI giải thích lỗi sai
- **ABAC Guard:** Chỉ chủ sở hữu mới sửa được trap

### 2.5. Community Features

- **Posts:** Tạo bài thảo luận ngữ pháp
- **Comments:** Bình luận, reply
- **Like:** Upvote bài viết
- **Crowdsourced Quizzes:** Đóng góp câu hỏi
- **Exam Sets:** Đề thi giả lập cộng đồng

### 2.6. Gamification

- **XP System:** Kiếm XP từ lesson, quiz, trap broken
- **Daily Streak:** Theo dõi streak học tập hàng ngày
- **Leaderboard:** Bảng xếp hạng theo XP
- **Certificates:** Chứng chỉ khi đạt ngưỡng
- **Level Graduation:** Unlock level mới

---

## 3. API Endpoints (30 endpoints)

### Lessons

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/grammar/roadmap` | Lộ trình học CEFR |
| GET | `/grammar/lessons/:id` | Chi tiết bài học |
| POST | `/grammar/lessons` | Tạo bài học (admin) |
| PUT | `/grammar/lessons/:id` | Cập nhật bài học (admin) |
| POST | `/grammar/lessons/:id/complete` | Đánh dấu hoàn thành |
| PUT | `/grammar/lessons/:id/progress` | Cập nhật tiến độ |

### Quiz & Practice

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/grammar/daily-quiz` | Quiz hàng ngày |
| POST | `/grammar/daily-quiz/submit` | Nộp daily quiz |
| GET | `/grammar/practice/questions` | Câu hỏi practice |
| POST | `/grammar/graduation/:level/submit` | Nộp graduation exam |

### SRS

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/grammar/practice/srs` | Câu hỏi SRS đến hạn |
| POST | `/grammar/practice/srs/:id/submit` | Nộp SRS feedback |

### Trap Diary

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/grammar/trap-diary` | Lưu bẫy |
| GET | `/grammar/trap-diary` | Danh sách bẫy |
| POST | `/grammar/trap-diary/:id/break` | Đánh dấu đã sửa |
| POST | `/grammar/trap-diary/:id/ai-analysis` | Yêu cầu AI analysis |

### Community

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/grammar/community/posts` | Danh sách bài viết |
| POST | `/grammar/community/posts` | Tạo bài viết |
| POST | `/grammar/community/posts/:id/comments` | Thêm bình luận |
| POST | `/grammar/community/posts/:id/like` | Like bài viết |
| POST | `/grammar/lessons/:id/crowdsourced` | Đóng góp quiz |
| POST | `/grammar/quizzes/crowdsourced/:id/upvote` | Upvote quiz |
| GET | `/grammar/lessons/:id/crowdsourced` | Danh sách crowdsourced quiz |

### Exams & Certificates

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/grammar/exams` | Danh sách đề thi |
| POST | `/grammar/exams` | Tạo đề thi (admin) |
| POST | `/grammar/exams/:id/upvote` | Upvote đề thi |
| POST | `/grammar/exams/:id/submit` | Nộp bài thi |
| GET | `/grammar/exams/certificates` | Danh sách chứng chỉ |

### Stats

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/grammar/leaderboard` | Bảng xếp hạng |
| GET | `/grammar/analytics` | Thống kê phân tích |

---

## 4. Domain Entities

### Aggregate Root

- **GrammarLessonAggregate** — Tổng hợp `GrammarLessonEntity` + `UserGrammarProgressEntity`, phát.emit `TrapBrokenEvent`

### Entities (12)

| Entity | Description |
|--------|-------------|
| `GrammarLessonEntity` | Bài học ngữ pháp |
| `GrammarCommunityPostEntity` | Bài viết community |
| `GrammarCommunityCommentEntity` | Bình luận |
| `GrammarCrowdsourcedQuizEntity` | Crowdsourced quiz |
| `GrammarExamSetEntity` | Đề thi giả lập |
| `UserGrammarTrapEntity` | Bẫy ngữ pháp |
| `UserGrammarProgressEntity` | Tiến độ học |
| `UserDailyStreakEntity` | Streak hàng ngày |
| `UserLevelGraduationEntity` | Tốt nghiệp level |
| `UserExamSetProgressEntity` | Tiến độ đề thi |
| `UserSrsProgressEntity` | Tiến độ SRS |
| `CommunityGrammarCertificateEntity` | Chứng chỉ |

### Value Objects (3)

| VO | Validation |
|----|------------|
| `CefrLevelVO` | Validate A1-C2, so sánh level |
| `LessonStatusVO` | Validate DRAFT/PUBLISHED/ARCHIVED |
| `ProficiencyScoreVO` | Validate 0-100, tính next level |

---

## 5. Domain Events (7)

| Event | Trigger | Action |
|-------|---------|--------|
| `LessonCompletedEvent` | Hoàn thành bài học | XP reward |
| `TrapBrokenEvent` | Sửa bẫy thành công | XP reward |
| `DailyQuizSubmittedEvent` | Nộp daily quiz | XP reward |
| `ExamAttemptSubmittedEvent` | Nộp bài thi | XP reward |
| `CommunityPostCreatedEvent` | Tạo bài viết | (chưa xử lý) |
| `CrowdsourcedQuizApprovedEvent` | Approve crowdsourced quiz | (chưa xử lý) |
| `GraduationPassedEvent` | Đạt graduation | XP reward + unlock level |

---

## 6. Event Handlers (3)

| Handler | Events | Action |
|---------|--------|--------|
| `XpRewardHandler` | LessonCompleted, TrapBroken, DailyQuizSubmitted, ExamAttemptSubmitted, GraduationPassed | Tăng XP, cập nhật streak |
| `CrowdsourcedQuizApprovedHandler` | CrowdsourcedQuizApproved | (chưa triển khai) |
| `GraduationUnlockHandler` | GraduationPassed | Unlock level tiếp theo |

---

## 7. Repository Interfaces (8, 40 methods)

| Interface | Methods |
|-----------|---------|
| `IGrammarLessonRepository` | findById, findAll, create, update, count |
| `IGrammarCommunityRepository` | findPosts, createPost, addComment, likePost, findCrowdsourcedQuizzes, createCrowdsourcedQuiz, upvoteCrowdsourcedQuiz |
| `IGrammarExamRepository` | findExamSets, findExamSetById, createExamSet, upvoteExamSet, findUserExamProgress, upsertUserExamProgress, findCertificates, createCertificate |
| `IGrammarProgressRepository` | findByUserAndLesson, findByUser, upsert, countMasteredByUser |
| `IGrammarStreakRepository` | findByUser, upsertStreak, incrementXP, getLeaderboard |
| `IGrammarSrsRepository` | findDueProgress, findProgress, upsertProgress |
| `IGrammarGraduationRepository` | findGraduation, upsertGraduation |
| `IGrammarTrapRepository` | findById, findByUser, upsertTrap, updateTrap |

---

## 8. Constants

### XP Rewards

| Action | XP |
|--------|-----|
| Complete Lesson | 10 |
| Break Trap | 5 |
| Daily Quiz | 10 |
| Exam Attempt | 20 |
| Graduation Pass | 50 |

### Pagination Defaults

| Param | Default |
|-------|---------|
| PAGE_SIZE | 20 |
| LEADERBOARD_LIMIT | 10 |

### Streak Thresholds

| Streak Days | Bonus |
|-------------|-------|
| 3 | +5 XP |
| 7 | +10 XP |
| 14 | +20 XP |
| 30 | +50 XP |
