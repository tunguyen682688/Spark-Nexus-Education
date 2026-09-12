# Feature: Reading (Đọc hiểu)

## 1. Tổng quan Module

### 1.1. Module Name

Reading (Đọc hiểu)

### 1.2. Purpose

Cung cấp nền tảng đọc hiểu tiếng Anh với:
- Thư viện bài đọc theo cấp độ CEFR (A1-C2)
- Studio tạo bài đọc (EditorJS content)
- Quiz kiểm tra comprehension
- Dịch từ trong ngữ cảnh và dịch đoạn văn
- Theo dõi tiến độ đọc, thống kê WPM (words per minute)
- Community articles: đóng góp và bình chọn

### 1.3. Scope

- Quản lý bài đọc (articles) với nội dung EditorJS
- Quiz comprehension cho từng bài
- Dịch từ ngữ cảnh (polysemy detection) và dịch đoạn
- Theo dõi tiến độ đọc, stats (WPM, mastery level)
- Community: tạo, vote, bookmark, bình luận
- Studio: tạo/sửa/xóa bài đọc với vocabulary highlights

Không bao gồm: Quản lý đề thi (Certification), từ vựng riêng (Vocabulary), nghe (Listening)

### 1.4. Dependencies

- **User Module:** Thông tin người dùng
- **Vocabulary Module:** Liên kết vocabulary set với bài đọc
- **Cache Module:** Chưa cache riêng, dùng DB-level translation cache
- **BullMQ:** Background jobs (completion, quiz analytics)

### 1.5. Architecture

```
presentation/controllers/
  reading.controller.ts              # 18 REST endpoints

application/
  commands/                           # 8 commands
  querys/                             # 8 queries
  events/                             # 2 event handlers
  dtos/                               # 11 DTOs

domain/
  entities/                           # 5 entities + 1 value object
  events/                             # 2 domain events
  repositories/                       # IReadingRepository (26 methods)
  services/                           # 2 service interfaces
  sagas/                              # ReadingSaga (2 streams)

infrastructure/
  repositories/                       # ReadingRepository (821 lines)
  services/                           # TranslationService, ReadingQuizService
  processors/                         # ReadingProcessor (2 job types)
```

---

## 2. Core Functional Breakdown

### 2.1. Quản lý Bài đọc (Article Management)

- **CRUD Articles:** Tạo, cập nhật, xóa bài đọc
- **Content Types:** EditorJS blocks (paragraph, header, image, list, etc.)
- **Difficulty Levels:** A1, A2, B1, B2, C1, C2
- **Categories:** General, Business, Academic, Technology, etc.
- **Tags:** Gắn tags cho bài đọc
- **Thumbnail:** URL ảnh đại diện
- **Source Attribution:** Source URL, author name

### 2.2. Studio (Content Creator)

Chế độ tạo bài đọc nâng cao cho content creators:

- **Create Studio Article:** Tạo bài mới với full metadata
- **Save Draft:** Lưu bản nháp (status=DRAFT)
- **Publish:** Đăng bài (status=PUBLISHED)
- **Vocabulary Highlights:** Đánh dấu từ vựng quan trọng trong bài
- **Vocabulary Set Integration:** Liên kết với vocabulary set có sẵn

### 2.3. Quiz Comprehension

Hệ thống quiz kiểm tra hiểu bài:

- **Auto-generated Quiz:** Quiz tự tạo theo title, category, difficulty
- **3 questions per article:** MCQ format
- **Scoring:** Tính điểm, đánh giá mastery (≥80%)
- **Submit & Track:** Lưu kết quả quiz

### 2.4. Dịch thuật (Translation)

#### Dịch từ ngữ cảnh (Word-in-Context)
- **Polysemy Detection:** Nhận diện đa nghĩa (run, charge, bank...)
- **Context-aware:** Dịch theo câu cụ thể
- **Fallback:** Google Translate → Offline dictionary

#### Dịch đoạn văn (Paragraph Translation)
- **Google Translate API:** Dịch nguyên đoạn
- **Cache:** Lưu kết quả trong DB (SHA-256 hash key)

### 2.5. Theo dõi Tiến độ (Progress Tracking)

- **Reading Progress:** % hoàn thành, last position, time spent
- **Reading Session:** Thời gian bắt đầu/kết thúc, words read
- **User Reading Stats:** Tổng articles, words, time, avg WPM, mastery level
- **Streak:** Ngày đọc liên tiếp

### 2.6. Community Features

- **Community Articles:** Bài đọc đóng góp từ cộng đồng
- **Voting:** Upvote/downvote bài đọc
- **Comments:** Bình luận bài đọc
- **Bookmark:** Lưu bài đọc yêu thích

---

## 3. API Endpoints (18 endpoints)

### Reading Core

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/reading/dashboard` | Dashboard tổng quan |
| GET | `/reading/articles` | Danh sách bài đọc (filter, paginate) |
| GET | `/reading/articles/:id` | Chi tiết bài đọc |
| PUT | `/reading/articles/:id/progress` | Cập nhật tiến độ |
| GET | `/reading/articles/:id/quiz` | Lấy quiz comprehension |
| POST | `/reading/articles/:id/quiz/submit` | Nộp quiz |

### Translation

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/reading/translate-context` | Dịch từ ngữ cảnh |
| POST | `/reading/translate-paragraph` | Dịch đoạn văn |
| POST | `/reading/parse-syntax` | Phân tích cú pháp POS |

### Community

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/reading/articles/community/list` | Bài đọc community |
| POST | `/reading/articles/community` | Tạo bài community |
| POST | `/reading/articles/:id/vote` | Vote bài đọc |
| POST | `/reading/articles/:id/comment` | Bình luận |

### Studio

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/reading/articles/studio` | Tạo bài studio |
| PUT | `/reading/articles/:id` | Cập nhật bài studio |
| PUT | `/reading/articles/:id/draft` | Lưu bản nháp |
| POST | `/reading/articles/:id/delete` | Xóa bài studio |
| GET | `/reading/articles/my/list` | Bài đọc của tôi |

---

## 4. Domain Entities

| Entity | Extends | Description |
|--------|---------|-------------|
| `ArticleEntity` | `AggregateRoot<string>` | Bài đọc chính. Fields: title, content, summary, difficulty, wordCount, category, tags, upvotes, downvotes, viewCount, contentType, vocabularySetId |
| `ArticleCommentEntity` | `AggregateRoot<string>` | Bình luận bài đọc |
| `ReadingProgressEntity` | `AggregateRoot<string>` | Tiến độ đọc. Phát事件 `ReadingProgressUpdatedEvent` |
| `ReadingSessionEntity` | `AggregateRoot<string}` | Phiên đọc |
| `UserReadingStatsEntity` | `AggregateRoot<string>` | Thống kê đọc |

### Value Object

- **DifficultyVO** — Wrapper CEFR level (A1-C2) với validation

---

## 5. Domain Events (2)

| Event | Trigger | Action |
|-------|---------|--------|
| `ReadingProgressUpdatedEvent` | Cập nhật tiến độ đọc | Log analytics, cache invalidation (TODO) |
| `ReadingQuizSubmittedEvent` | Nộp quiz comprehension | Log mastery evaluation (TODO) |

---

## 6. Background Jobs (BullMQ)

| Job | Queue | Description |
|-----|-------|-------------|
| `process-reading-completion` | `reading-tasks` | Xử lý khi đọc xong (log analytics) |
| `process-quiz-result` | `reading-tasks` | Xử lý kết quả quiz (log mastery) |

**Lưu ý:** Cả 2 job hiện tại chỉ log, chưa persist analytics.

---

## 7. Domain Services

| Interface | Implementation | Methods |
|-----------|---------------|---------|
| `ITranslationService` | `TranslationService` | `translateWordInContext(word, sentence)`, `translateParagraph(text)` |
| `IReadingQuizService` | `ReadingQuizService` | `getQuizForArticle(title, category, difficulty)` |

### TranslationService

- Polysemy detection cho từ đa nghĩa
- Fallback: Google Translate Web API → Offline dictionary
- DB-level caching với SHA-256 hash key

### ReadingQuizService

- Quiz mặc định cho 3 seeded articles
- Auto-generate quiz cho bài mới (template questions)

---

## 8. Repository Interface (26 methods)

| Method | Description |
|--------|-------------|
| `findArticles(queryParams?)` | Danh sách bài đọc (filter, paginate) |
| `findArticleById(id)` | Chi tiết bài đọc |
| `findArticleHighlights(articleId)` | Vocabulary highlights |
| `saveArticle(article)` | Lưu bài đọc |
| `deleteArticle(id)` | Xóa bài đọc |
| `findArticlesByCreatorId(creatorId)` | Bài theo creator |
| `findCommunityArticles(sortBy)` | Bài community |
| `voteArticle(userId, articleId, voteType)` | Vote bài đọc |
| `addComment(comment)` | Thêm bình luận |
| `bookmarkArticle(userId, articleId)` | Bookmark |
| `findReadingProgress(userId, articleId)` | Tiến độ đọc |
| `saveReadingProgress(progress)` | Lưu tiến độ |
| `getUserReadingStats(userId)` | Thống kê người dùng |
| `saveUserStats(stats)` | Lưu thống kê |
| `saveReadingSession(session)` | Lưu phiên đọc |
| `findReadingSessions(userId)` | Phiên đọc |
| `findUserStats(userId)` | Stats đơn giản |
| `findRecentLookups(userId)` | Từ vừa tra |
| `findArticlesByCategory(category)` | Bài theo danh mục |
| `findReadingProgressWithArticles(userId)` | Progress + article info |
| `findReadingProgressUpdates(userId)` | Lịch sử cập nhật |
| `findReadingProgressByProgressRange(userId)` | Progress theo % |
| `findReadingProgressForArticles(userId, articleIds)` | Progress cho nhiều bài |
| `syncArticleVocabulary(articleId, creatorId, content)` | Sync vocabulary |
| `syncArticleHighlights(articleId, creatorId, highlights)` | Sync highlights |

---

## 9. DTOs

| DTO | Purpose |
|-----|---------|
| `GetArticlesQueryDto` | Query params: page, difficulty, category, tag, search, sortBy |
| `UpdateReadingProgressDto` | Progress (0-100), lastPosition, timeSpent |
| `SubmitArticleQuizDto` | answers: Record<string, string> |
| `TranslateContextDto` | word, sentence |
| `TranslateParagraphDto` | text |
| `CreateCommunityArticleDto` | title, content, sourceUrl, author |
| `InteractArticleDto` | action: UPVOTE/DOWNVOTE/BOOKMARK |
| `AddArticleCommentDto` | content |
| `CreateStudioArticleDto` | 15 fields (title, content, category, difficulty, tags, etc.) |
| `UpdateStudioArticleDto` | PartialType of CreateStudioArticleDto |
| `ArticleHighlightDto` | blockId, wordIndex, occurrenceText, entryId |

---

## 10. DB Schema (Prisma)

### Models

- `Article` — Bài đọc (title, content JSONB, difficulty, category, tags, upvotes, downvotes, viewCount)
- `ArticleComment` — Bình luận
- `ReadingProgress` — Tiến độ đọc (progress, lastPosition, timeSpent, completedAt)
- `ReadingSession` — Phiên đọc
- `UserReadingStats` — Thống kê (totalArticles, totalWords, totalTime, avgWpm, masteryLevel)
- `ArticleVocabularyHighlight` — Từ vựng nổi bật trong bài
- `TranslationCache` — Cache dịch thuật (key=SHA-256, value=translation)
