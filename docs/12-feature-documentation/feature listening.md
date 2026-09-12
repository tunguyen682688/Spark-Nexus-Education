# Feature: Listening (Nghe)

## 1. Tổng quan Module

### 1.1. Module Name

Listening (Nghe)

### 1.2. Purpose

Cung cấp nền tảng luyện nghe tiếng Anh với:
- Thư viện bài nghe theo cấp độ CEFR (A1-C2)
- Subtitles (phụ đề) kèm timestamp
- Quiz comprehension kiểm tra hiểu bài nghe
- Theo dõi tiến độ nghe, thống kê thời gian
- Bảng xếp hạng, bookmark, vote

### 1.3. Scope

- Quản lý bài nghe (materials) với subtitles và questions
- Theo dõi tiến độ nghe (progress tracking)
- Quiz comprehension cho từng bài nghe
- Tính năng xã hội: vote, bookmark
- Thống kê người dùng, weekly activity, leaderboard
- Đóng góp bài nghe mới (community contribution)

Không bao gồm: Quản lý đề thi (Certification), ngữ pháp (Grammar), đọc (Reading)

### 1.4. Dependencies

- **User Module:** Thông tin người dùng
- **Cache Module (Redis):** Cache materials, user stats, leaderboard
- **BullMQ:** Background jobs (cache warming, stats aggregation)

### 1.5. Architecture

```
presentation/controllers/
  listening.controller.ts            # 9 REST endpoints

application/
  commands/                           # 4 commands
  querys/                             # 5 queries
  dtos/                               # 4 DTO files, 6 DTO classes

domain/
  events/                             # 2 domain events
  repositories/                       # IListeningRepository (22 methods)
  services/                           # ListeningService (8 methods)
  sagas/                              # ListeningSaga (2 streams)

infrastructure/
  cache/                              # ListeningCacheService
  repositories/                       # ListeningRepository (574 lines)
  processors/                         # ListeningProcessor (2 job types)
```

**Lưu ý:** Module này không có custom domain entities — sử dụng trực tiếp Prisma types.

---

## 2. Core Functional Breakdown

### 2.1. Quản lý Bài nghe (Material Management)

- **Tạo Material:** Tạo bài nghe mới với subtitles và questions
- **Subtitles:** Phụ đề với startTime, endTime, text, translation
- **Questions:** Câu hỏi comprehension với options và correctAnswer
- **Categories:** General, Business, Academic, etc.
- **Difficulty:** A1, A2, B1, B2, C1, C2
- **Media:** YouTube embed, audio URL, thumbnail

### 2.2. Theo dõi Tiến độ (Progress Tracking)

- **Reading Progress:** % hoàn thành, last position, time spent
- **Auto-complete:** Tự đánh dấu hoàn thành khi progress ≥ 100
- **Listening Session:** Ghi nhận phiên nghe (duration)
- **User Stats:** Tổng materials, totalTime, masteryLevel
- **Weekly Activity:** 7 ngày hoạt động (phút/ngày)

### 2.3. Quiz Comprehension

- **Questions per Material:** Câu hỏi kiểm tra hiểu bài nghe
- **MCQ Format:** Multiple choice options
- **Audio Timestamp:** Liên kết câu hỏi với timestamp cụ thể

### 2.4. Social Features

- **Vote:** Upvote/downvote bài nghe
- **Bookmark:** Lưu bài nghe yêu thích
- **Community Contribution:** Đóng góp bài nghe mới

### 2.5. Gamification

- **Leaderboard:** Bảng xếp hạng theo totalTime
- **Mastery Level:** Beginner → Intermediate → Advanced → Expert
- **Streak:** Ngày luyện nghe liên tiếp

---

## 3. API Endpoints (9 endpoints)

### Materials

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/listening/materials` | Danh sách bài nghe (filter, paginate) |
| GET | `/listening/materials/:id` | Chi tiết bài nghe (subtitles + questions) |
| POST | `/listening/materials` | Tạo bài nghe mới |

### Progress & Stats

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/listening/materials/:id/progress` | Cập nhật tiến độ |
| GET | `/listening/user-stats` | Thống kê người dùng |
| GET | `/listening/weekly-activity` | Hoạt động 7 ngày |
| GET | `/listening/leaderboard` | Bảng xếp hạng |

### Social

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/listening/materials/:id/vote` | Vote bài nghe |
| POST | `/listening/materials/:id/bookmark` | Toggle bookmark |

---

## 4. Domain Events (2)

| Event | Trigger | Action |
|-------|---------|--------|
| `ListeningMaterialCreatedEvent` | Tạo material mới | Warm cache |
| `ListeningProgressUpdatedEvent` | Cập nhật tiến độ | Aggregate user stats |

---

## 5. Background Jobs (BullMQ)

| Job | Queue | Description |
|-----|-------|-------------|
| `warm-material-cache` | `listening-tasks` | Xóa và làm mới cache material |
| `aggregate-user-listening-stats` | `listening-tasks` | Tính lại user stats từ progress records |

Cả 2 job đều có retry policy: 3 attempts, exponential backoff 2s.

---

## 6. Domain Service

### ListeningService

| Method | Description |
|--------|-------------|
| `createMaterial(dto, creatorId)` | Tạo material mới |
| `toggleBookmark(userId, materialId)` | Toggle bookmark |
| `voteMaterial(userId, materialId, vote)` | Vote (up/down), cập nhật counts |
| `updateProgress(userId, materialId, dto)` | Cập nhật tiến độ, auto-complete |
| `getUserStats(userId)` | Lấy stats hoặc default |
| `getWeeklyActivity(userId)` | 7 ngày hoạt động |
| `getLeaderboard(limit?)` | Bảng xếp hạng |
| `getMaterialDetail(id, userId)` | Chi tiết + increment view |

---

## 7. Repository Interface (22 methods)

| Method | Description |
|--------|-------------|
| `findMaterials(queryParams, userId?)` | Danh sách material (filter, paginate) |
| `findMaterialById(id, userId?)` | Chi tiết material |
| `incrementViewCount(id)` | Tăng lượt xem |
| `findMaterialRawById(id)` | Material không có user context |
| `findProgress(userId, materialId)` | Tiến độ |
| `upsertProgress(userId, materialId, data)` | Lưu tiến độ |
| `findAllProgressByUserId(userId)` | Tất cả tiến độ |
| `upsertUserStats(userId, totalMaterials, totalTime)` | Lưu stats |
| `createSession(userId, materialId, duration)` | Tạo phiên nghe |
| `findBookmark(userId, materialId)` | Tìm bookmark |
| `createBookmark(userId, materialId)` | Tạo bookmark |
| `deleteBookmark(userId, materialId)` | Xóa bookmark |
| `findVote(userId, materialId)` | Tìm vote |
| `createVote(userId, materialId, vote)` | Tạo vote |
| `updateVote(userId, materialId, vote)` | Cập nhật vote |
| `deleteVote(userId, materialId)` | Xóa vote |
| `countVotes(materialId, voteValue)` | Đếm votes |
| `updateMaterialVotes(materialId, upvotes, downvotes)` | Cập nhật vote totals |
| `createMaterial(dto, creatorId)` | Tạo material |
| `findUserStats(userId)` | Stats + streak |
| `findWeeklyActivity(userId)` | 7 ngày hoạt động |
| `findLeaderboard(limit?)` | Bảng xếp hạng |

---

## 8. Caching Strategy

### ListeningCacheService

Wrapper `SharedCacheService` từ `@spark-nest-ed/infrastructure-cache`:

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Đọc cache |
| `set(key, value, ttlSeconds=300)` | Ghi cache (default 5 min) |
| `delete(key)` | Xóa key |
| `clearPattern(pattern)` | Xóa theo pattern |
| `hashParams(params)` | Hash params thành key |
| `key(...parts)` | Tạo key (e.g., `listening:materials:abc123`) |
| `singleflight(key, ttl, fetchFn)` | Cache-through + dedup (chống stampede) |

### Cached Keys

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `listening:materials:list:*` | 300s | Danh sách materials |
| `listening:materials:raw:*` | 300s | Material detail |
| `listening:user-stats:*` | 120s | User stats |
| `listening:leaderboard` | 300s | Bảng xếp hạng |

Cache invalidation xảy ra bất đồng bộ trên write operations.

---

## 9. DTOs

| DTO | Fields |
|-----|--------|
| `CreateListeningMaterialDto` | title, description?, category, difficulty, mediaUrl, youtubeId?, thumbnailUrl?, duration, author?, isCommunity?, tags?, vocabularySetId?, subtitles?, questions? |
| `CreateSubtitleDto` | startTime, endTime, text, translation?, order |
| `CreateQuestionDto` | questionText, options, correctAnswer, explanation?, audioTimestamp?, order |
| `GetListeningMaterialsQueryDto` | category?, difficulty?, isCommunity?, q?, page?, limit? |
| `UpdateListeningProgressDto` | progress, lastPosition, timeSpent, completed? |
| `VoteListeningMaterialDto` | vote: 1 \| -1 |

---

## 10. DB Schema (Prisma)

### Models

- `ListeningMaterial` — Bài nghe (title, mediaUrl, youtubeId, duration, category, difficulty, upvotes, downvotes, viewCount)
- `ListeningSubtitle` — Phụ đề (startTime, endTime, text, translation, order)
- `ListeningQuestion` — Câu hỏi (questionText, options, correctAnswer, explanation, audioTimestamp, order)
- `ListeningProgress` — Tiến độ (progress, lastPosition, timeSpent, completedAt)
- `ListeningSession` — Phiên nghe (duration)
- `ListeningVote` — Vote (1 hoặc -1)
- `UserListeningBookmark` — Bookmark
- `UserListeningStats` — Thống kê (totalMaterials, totalTime, masteryLevel, streak)

---

## 11. Notable Observations

1. **Không có custom domain entities:** Module sử dụng trực tiếp Prisma types (`@prisma/client`) thay vì DDD entities. Điều này không tuân theo quy tắc DDD layering trong AGENTS.md.

2. **Repository injected trực tiếp vào query handler:** `GetListeningMaterialsQueryHandler` inject `IListeningRepository` trực tiếp thay vì qua `ListeningService`. Các handler khác đều qua domain service.

3. **Fire-and-forget side effects:** `incrementViewCount` và domain event publishing sử dụng `setImmediate()` / `.catch()` — failures chỉ log, không surfacing cho caller.
