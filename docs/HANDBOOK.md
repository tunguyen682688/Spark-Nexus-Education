# 📘 SparkNestEd Technical Architecture & Clean Coding Handbook

Tài liệu này là **Sách hướng dẫn kỹ thuật chính thức** và **Cẩm nang lập trình sạch (Clean Coding Handbook)** dành cho toàn bộ các nhà phát triển tham gia dự án **SparkNestEd** (stylized là `Spark-Nexus-Ed` / `@spark-nest-ed`). 

Mục tiêu của tài liệu là định nghĩa rõ ràng ranh giới kiến trúc, cấu trúc Monorepo, các luồng dữ liệu CQRS/DDD, các thuật toán lõi (SM-2 SRS), cơ chế xử lý hiệu năng lai (Saga vs BullMQ/Redis), và quy tắc phát triển đồng bộ từ Backend đến Frontend để đảm bảo tính nhất quán, khả năng kiểm thử và mở rộng vô hạn của hệ thống.

---

## 🗺️ 1. Tổng Quan Kiến Trúc & Phân Vùng Domain (DDD)

SparkNestEd là hệ sinh thái học tập và thi đấu ngôn ngữ được xây dựng dựa trên các nguyên tắc **Domain-Driven Design (DDD)** và **Clean Architecture**. Hệ thống chia tách thành các Domain nghiệp vụ tách biệt (decoupled boundaries):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SPARKNESTED ECOSYSTEM                         │
├─────────────────┬───────────────────┬──────────────────┬────────────────┤
│ READING DOMAIN  │ VOCABULARY DOMAIN │ DICTIONARY DOMIN │  QUIZ DOMAIN   │
│ - Articles      │ - Vocab Sets      │ - Word Senses    │ - Quiz Sessions│
│ - Read Progress │ - Set Items       │ - Word Examples  │ - Question Pool│
│ - Target Stats  │ - SRS Progress    │ - Mnemonics      │ - Challenges   │
└─────────────────┴───────────────────┴──────────────────┴────────────────┘
```

### Các Khái Niệm Domain Chính (Core Business Aggregates)
1. **VocabularySet (Gói từ vựng):** Quản lý thông tin gói từ vựng, số lượng từ, trạng thái xuất bản, lượt yêu thích, và thông tin tiến trình nhập tệp từ vựng (`importStatus` & `importProgress`).
2. **VocabularySetItem (Phần tử từ vựng trong gói):** Thực thể liên kết giữa gói từ vựng và từ điển gốc. Chứa các trường dữ liệu chuẩn hóa (`word`, `definition`, `example`) để tối ưu hóa hiệu năng truy vấn.
3. **Entry & Sense (Từ điển & Nghĩa của từ):** Trái tim của hệ thống ngôn ngữ, cung cấp thông tin phát âm, từ loại, nghĩa chi tiết, ví dụ minh họa và từ đồng nghĩa/trái nghĩa.
4. **UserLearningProgress (Tiến trình ôn tập SRS):** Aggregate Root quản lý trạng thái học tập của một người dùng đối với một từ vựng cụ thể. Chứa logic cốt lõi của thuật toán lặp quãng (Spaced Repetition System - SRS).

---

## 🏗️ 2. Kiến Trúc Monorepo (Nx Monorepo Layout)

Hệ thống sử dụng **Nx Workspace** để quản lý toàn bộ mã nguồn. Cấu trúc thư mục được tổ chức khoa học để tối ưu hóa việc chia sẻ mã nguồn và cơ chế lưu trữ đệm (build caching):

```
Spark-Nexus-Ed/
├── 📂 apps/                                 # ỨNG DỤNG ĐẦU VÀO (Entrypoints)
│   ├── 📂 api-sne/                          # Backend API (NestJS Framework)
│   │   ├── 📂 src/
│   │   │   ├── 📄 main.ts                   # Điểm khởi chạy API
│   │   │   └── 📄 app.module.ts             # Module gốc liên kết hạ tầng
│   ├── 📂 api-sne-e2e/                      # Kiểm thử tự động End-to-End cho Backend
│   ├── 📂 frontend-sne/                     # Frontend Application (React 19 + Vite)
│   │   ├── 📂 src/
│   │   │   ├── 📄 main.tsx                  # Điểm khởi chạy React
│   │   │   └── 📄 App.tsx                   # Cấu hình routing & providers
│   └── 📂 frontend-sne-e2e/                 # Kiểm thử tự động End-to-End cho Frontend
│
├── 📂 packages/                             # CÁC THƯ VIỆN & DOMAINS TÁCH BIỆT (Libraries)
│   ├── 📂 shared/                           # Dùng chung cho toàn hệ thống
│   │   └── 📂 libs/                         # Base classes, helpers, utilities
│   │
│   ├── 📂 backend/                          # Mã nguồn bổ trợ Backend
│   │   ├── 📂 infrastructure/               # Các Adapter hạ tầng dùng chung
│   │   │   ├── 📂 database/                 # Prisma Client & Migrations
│   │   │   │   └── 📂 prisma/
│   │   │   │       └── 📄 schema.prisma     # Định nghĩa cấu trúc PostgreSQL
│   │   │   ├── 📂 cache/                    # Redis Cache Adapter
│   │   │   ├── 📂 auth/                     # Cơ chế xác thực & phân quyền
│   │   │   └── 📂 messaging/                # Hệ thống Event Bus & Message Queue
│   │   └── 📂 domains/                      # Các Module nghiệp vụ độc lập
│   │       └── 📂 module-vocabulary/        # Module Từ vựng (Clean Architecture)
│   │           ├── 📂 src/lib/
│   │           │   ├── 📂 domain/           # Thực thể, Aggregates, Event, Service gốc
│   │           │   ├── 📂 application/      # Commands, Queries, Handlers, Mappers, DTOs
│   │           │   ├── 📂 infrastructure/   # Repositories cụ thể, Background Workers
│   │           │   ├── 📂 presentation/     # Controllers (HTTP REST endpoints)
│   │           │   └── 📄 vocabulary.module.ts
│   │           └── 📄 ARCHITECTURE.md       # Tài liệu kiến trúc cụ thể của module
│   │
│   └── 📂 frontend/                         # Mã nguồn bổ trợ Frontend
│       ├── 📂 feature/                      # Các tính năng giao diện lớn
│       │   └── 📂 vocabulary/               # Tính năng từ vựng (Page-Container-Component)
│       │       ├── 📂 src/lib/
│       │       │   ├── 📂 pages/            # Đầu vào định tuyến (Router endpoints)
│       │       │   ├── 📂 container/        # Điều phối logic, quản lý State và Fetching
│       │       │   ├── 📂 components/       # Giao diện thuần túy (Pure UI), nhận Props
│       │       │   ├── 📂 hooks/            # Custom Hooks (React Query integration)
│       │       │   ├── 📂 services/         # Tính toán logic nghiệp vụ thuần túy
│       │       │   ├── 📂 api/              # Lớp giao tiếp API HTTP Client
│       │       │   ├── 📂 types/            # TypeScript Interfaces & Enums
│       │       │   └── 📂 constants/        # Hằng số cấu hình hệ thống
│       │       └── 📄 ARCHITECTURE.md       # Tài liệu kiến trúc cụ thể của frontend
│       └── 📂 shared/                       # Components dùng chung (Button, Input, Dialog...)
│
├── 📄 nx.json                               # Cấu hình đường ống Task Pipeline của Nx
├── 📄 tsconfig.base.json                    # Cấu hình đường dẫn Paths alias của TypeScript
├── 📄 package.json                          # Khai báo các thư viện phụ thuộc toàn hệ thống
└── 📄 docker-compose.yml                    # Cấu hình môi trường Redis & PostgreSQL local
```

---

## 🏗️ 3. Clean Architecture & CQRS/DDD Handbook

Lập trình viên khi triển khai mã nguồn tại backend của SparkNestEd **bắt buộc** phải tuân thủ mô hình **Clean Architecture** và tách biệt luồng ghi/đọc bằng **CQRS (Command Query Responsibility Segregation)**.

### Luồng Dữ Liệu Ghi (Write Pipeline - Commands)
```
[HTTP POST/PATCH Request]
       ↓
[Controller] ────▶ Khởi tạo Command từ DTO (Validate dữ liệu đầu vào qua class-validator)
       ↓
[CommandBus] ────▶ Điều phối Command đến đúng Handler tương ứng
       ↓
[CommandHandler] ─▶ Nạp Aggregate Root thông qua Repository (Interface)
       │          ─▶ Gọi phương thức nghiệp vụ của Aggregate (Ví dụ: `aggregate.recordReview()`)
       │          ─▶ Lưu trữ trạng thái thay đổi vào Repository
       │          ─▶ Thu thập và đẩy các Sự kiện Nghiệp vụ (Domain Events) ra ngoài EventBus
       ▼
[Mapper] ────────▶ Chuyển đổi trạng thái thực thể (Entity/Aggregate) thành Response DTO
       ↓
[Client Response]
```

### Luồng Dữ Liệu Đọc (Read Pipeline - Queries)
```
[HTTP GET Request]
       ↓
[Controller] ────▶ Khởi tạo Query từ Query Params (Pagination, Filters)
       ↓
[QueryBus] ──────▶ Điều phối Query đến đúng Handler tương ứng
       ↓
[QueryHandler] ──▶ Truy vấn trực tiếp từ database hoặc Database View (Không cần qua Aggregate)
       ↓
[Mapper] ────────▶ Chuyển đổi kết quả thô sang Response DTO (Loại bỏ các thông tin bảo mật)
       ↓
[Client Response]
```

### Quy Tắc Viết Code Sạch Trên Từng Layer

#### 1. Commands & Queries (Khai báo ý đồ)
- Phải bất biến (Sử dụng `readonly` cho tất cả thuộc tính).
- Thực hiện xác thực dữ liệu cơ bản ngay tại `constructor` (Fail-Fast Principle).
- Cung cấp phương thức tĩnh `fromDto()` để chuyển đổi mượt mà từ DTO giao diện.

*Ví dụ chuẩn về Command:*
```typescript
import { ICommand } from '@nestjs/cqrs';
import { CreateVocabularySetDto } from '../../dtos/create-vocabulary-set.dto';

export class CreateVocabularySetCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly language: string,
    public readonly type: string,
    public readonly description?: string,
    public readonly difficulty?: string,
    public readonly tags: string[] = [],
    public readonly coverImageUrl?: string,
    public readonly initialWords?: Array<{
      word: string;
      definition?: string;
      example?: string;
      notes?: string;
    }>
  ) {
    // Constructor-level validation
    if (!userId) throw new Error('User ID is required');
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
  }

  static fromDto(dto: CreateVocabularySetDto, userId: string): CreateVocabularySetCommand {
    return new CreateVocabularySetCommand(
      userId,
      dto.title,
      dto.language,
      dto.type,
      dto.description,
      dto.difficulty,
      dto.tags,
      dto.coverImage,
      dto.initialWords
    );
  }
}
```

#### 2. Domain Layer (Tập trung toàn bộ nghiệp vụ)
- **Tuyệt đối không chứa mã nguồn liên quan đến Database (SQL, Prisma, v.v.).**
- Mọi logic tính toán, thay đổi trạng thái, cập nhật chỉ số phải nằm trong **Entities** và **Aggregates**.
- Trạng thái bên trong Aggregate chỉ có thể được thay đổi thông qua các phương thức nghiệp vụ rõ ràng (ví dụ: `markAsMastered()`, `recordReview(quality)`), tuyệt đối không để lộ các hàm setter trực tiếp cho các trường nhạy cảm.
- Khi một quy tắc nghiệp vụ quan trọng được thỏa mãn, hãy sinh ra **Domain Event** để kích hoạt các phản ứng hệ thống (side effects) không đồng bộ.

#### 3. Mappers (Cách ly cấu trúc dữ liệu)
- Đóng vai trò làm ranh giới cách ly dữ liệu giữa thế giới bên trong (Domain Entities) và thế giới bên ngoài (DTOs / Database Persistence models).
- Tránh việc trả về trực tiếp thực thể Domain hoặc Prisma Model cho Client để chống rò rỉ dữ liệu (data leakage) và đảm bảo tính đóng gói.

*Ví dụ chuẩn về Mapper:*
```typescript
@Injectable()
export class VocabularySetMapper {
  toResponseDto(entity: VocabularySetEntity): VocabularySetResponseDto {
    return {
      id: entity.getId(),
      title: entity.getTitle(),
      description: entity.getDescription(),
      language: entity.getLanguage().getValue(),
      type: entity.getType().getValue(),
      difficulty: entity.getDifficulty()?.getValue() || null,
      isPublic: entity.getIsPublic(),
      isActive: entity.getIsActive(),
      tags: entity.getTags(),
      coverImage: entity.getCoverImage(),
      userId: entity.getUserId(),
      entryCount: entity.getEntryCount(),
      favoriteCount: entity.getFavoriteCount(),
      studyCount: entity.getStudyCount(),
      importStatus: entity.getImportStatus(),
      importProgress: entity.getImportProgress(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }

  toResponseDtoList(entities: VocabularySetEntity[]): VocabularySetResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }
}
```

#### 4. Repositories (Quy tắc đảo ngược phụ thuộc - Dependency Inversion)
- Phải định nghĩa **Interface** tại thư mục `domain/repositories/` để Domain Layer sử dụng.
- Lập trình phần triển khai thực tế (Implementation) tại `infrastructure/repositories/` bằng công nghệ cơ sở dữ liệu cụ thể (Prisma/PostgreSQL).
- Đăng ký dependency injection thông qua một token string để dễ dàng thay đổi công nghệ cơ sở dữ liệu hoặc làm mock để viết Unit Test.

---

## ⚡ 4. Hệ Thống Ôn Tập SRS & Xử Lý Hiệu Năng Lai (Advanced)

SparkNestEd sở hữu hai hệ thống kỹ thuật nâng cao cực kỳ quan trọng: Thuật toán Spaced Repetition System (SRS) tính toán chu kỳ ôn tập tối ưu và Động cơ xử lý hàng loạt lai (Saga vs BullMQ/Redis) giúp đảm bảo sự cân bằng giữa trải nghiệm phản hồi tức thì và hiệu năng xử lý tác vụ nặng.

### 🧠 A. Thuật Toán SRS Ôn Tập Từ Vựng (SM-2)

Hệ thống triển khai thuật toán **SuperMemo-2 (SM-2)** huyền thoại trong thực thể `UserLearningProgressAggregate` để xác định chính xác thời điểm người dùng cần ôn tập lại từ vựng dựa trên đánh giá độ nhớ.

#### 1. Hệ thống Tham số (Parameters)
- $q$ (Quality): Đánh giá phản hồi từ người dùng (từ 0 đến 5):
  - `0` (Blackout): Quên hoàn toàn.
  - `1` (Incorrect): Đoán sai, nhưng nhận ra từ khi nhìn đáp án.
  - `2` (Incorrect, but remembered): Đoán sai, nhưng cảm thấy từ rất quen thuộc.
  - `3` (Correct with difficulty): Đoán đúng nhưng mất nhiều thời gian/gặp khó khăn.
  - `4` (Correct): Đoán đúng sau một thoáng suy nghĩ.
  - `5` (Perfect): Nhớ và phản xạ đáp án đúng ngay lập tức.
- $EF$ (Ease Factor): Hệ số dễ của từ (Mặc định bắt đầu từ `2.5`, tối thiểu là `1.3`). Từ càng khó, $EF$ giảm càng nhanh; từ càng dễ, $EF$ tăng.
- $I$ (Interval): Khoảng cách số ngày chờ cho đến phiên ôn tập kế tiếp.
- $R$ (Repetitions): Số lần liên tiếp người dùng trả lời chính xác từ này ($q \ge 3$).

#### 2. Logic Tính Toán & Cập Nhật Hệ Số

```typescript
// Trích xuất logic SM-2 từ UserLearningProgressAggregate
let newEaseFactor: number;
let newInterval: number;
let newRepetitions: number;

if (quality < 3) {
  // TRƯỜNG HỢP ÔN TẬP THẤT BẠI (quality: 0, 1, 2)
  newRepetitions = 0;
  newInterval = 1; // Yêu cầu ôn tập lại ngay vào ngày mai
  newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15); // Giảm hệ số dễ của từ
} else {
  // TRƯỜNG HỢP ÔN TẬP THÀNH CÔNG (quality: 3, 4, 5)
  newRepetitions = currentRepetitions + 1;

  if (newRepetitions === 1) {
    newInterval = 1; // Lần đầu tiên đúng: Ôn tập sau 1 ngày
  } else if (newRepetitions === 2) {
    newInterval = 6; // Lần thứ hai đúng liên tiếp: Ôn tập sau 6 ngày
  } else {
    // Lần thứ ba trở đi: Nhân khoảng cách hiện tại với hệ số dễ
    newInterval = Math.round(currentInterval * currentEaseFactor);
  }

  // Cập nhật Ease Factor dựa trên chất lượng phản hồi q (Quality)
  newEaseFactor =
    currentEaseFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Đảm bảo Ease Factor không bao giờ rơi xuống dưới ngưỡng tối thiểu 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor);
}
```

#### 3. Trạng Thái Học Tập & Mức Độ Thành Thạo (Mastery Level)
- **Trạng thái (Status):** 
  - Đăng ký trạng thái ban đầu là `NEW`.
  - Chuyển lên `LEARNING` ngay sau lần đầu tiên học viên trả lời chính xác ($q \ge 3$).
  - Chuyển sang `MASTERED` khi người dùng chủ động đánh dấu hoặc đạt được độ lặp cao ổn định.
- **Mastery Level ($ML$ - 0.0 đến 1.0):** Đo lường mức độ nhuần nhuyễn của từ vựng trong não bộ người học, được cập nhật theo công thức:
  $$ML = \min\left(1.0, \, R \times 0.2 + (EF - 2.0) \times 0.1\right)$$

---

### ⚡ B. Động Cơ Xử Lý Lai (Hybrid Performance Engine)

Khi người dùng thực hiện tạo một gói từ vựng kèm theo danh sách từ (Import Vocabulary Set), hệ thống phải giải quyết bài toán: **Prisma Accelerate giới hạn thời gian thực thi của một Transaction trong tối đa 15 giây.** 

Để đảm bảo an toàn giao dịch hệ thống và mang lại trải nghiệm mượt mà nhất, dự án áp dụng **Cơ chế xử lý lai (Hybrid Processing Strategy)**:

```
                  [Import Vocabulary Set Request]
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
          [Từ vựng <= 30 từ]        [Từ vựng > 30 từ]
                     │                       │
           (Xử lý ĐỒNG BỘ - Sync)  (Xử lý BẤT ĐỒNG BỘ - Async)
                     │                       │
         ┌───────────┴───────────┐           ├────────────────────────────────┐
         ▼                       ▼           ▼                                ▼
  [Saga Orchestrator]      [DB Commit]  [Tạo Set: 'pending']        [Đẩy Job vào BullMQ]
  - Kiểm tra từ trùng      - 1 Transaction           │                                │
  - Tạo mới thực thể      - Trả về DDTO             ▼                                ▼
  - Liên kết gói từ                           [Client nhận DTO tức thì]   [BullMQ Worker ngầm]
                                                                          - Chia nhỏ thành chunk 50
                                                                          - Chạy Saga từng chunk
                                                                          - Cập nhật % tiến trình
                                                                          - Hoàn tất: 'completed'
```

#### 1. Cơ chế Đồng Bộ (Synchronous Processing via Saga)
- **Ngưỡng áp dụng:** Số lượng từ đầu vào $\le 30$ từ (`PERFORMANCE_CONFIG.SYNC_THRESHOLD`).
- **Hành vi:**
  - Hệ thống sử dụng `VocabularySetCreationOrchestrator` (áp dụng mô hình Saga để giữ tính nhất quán giao dịch).
  - Kiểm tra hàng loạt từ vựng đã tồn tại trong từ điển hệ thống để tránh trùng lặp.
  - Tạo các bản dịch (Senses), ví dụ (Examples) mới ở dạng bản nháp (Draft) nếu từ chưa tồn tại.
  - Cam kết (Commit) toàn bộ dữ liệu vào cơ sở dữ liệu trong **một Transaction duy nhất**.
  - Trả về ngay lập tức dữ liệu hoàn chỉnh của gói từ vựng cho Client.

#### 2. Cơ chế Bất Đồng Bộ (Asynchronous Processing via BullMQ + Redis)
- **Ngưỡng áp dụng:** Số lượng từ đầu vào $> 30$ từ.
- **Hành vi:**
  1. Backend tạo ngay lập tức một gói từ vựng rỗng với trạng thái nhập tệp là `pending` và thiết lập cấu trúc giám sát tiến độ: `importProgress: { total: N, processed: 0, failed: 0 }`.
  2. Tạo bản ghi và trả ngay Response DTO về cho Client (thời gian phản hồi dưới 50ms, triệt tiêu nguy cơ Time-out).
  3. Đẩy một tác vụ nền mang tên `'import-vocabulary-words'` vào hàng đợi BullMQ mang tên `'vocabulary-set-import'`.
  4. Hàng đợi BullMQ được cắm trực tiếp trên Redis backplane được cấu hình khắt khe chính sách chống trục xuất dữ liệu: `maxmemory-policy noeviction` để đảm bảo tuyệt đối không bị mất tác vụ (no job loss).
  5. BullMQ Worker (`VocabularySetImportProcessor`) tiếp nhận tác vụ chạy ngầm và thực hiện chia nhỏ danh sách từ thành các khối nhỏ hơn (**Chunk size = 50**) để bảo vệ băng thông kết nối cơ sở dữ liệu:
```typescript
// Trích xuất mã nguồn xử lý phân khối trong worker ngầm
const chunkSize = 50;
const chunks = this.chunkArray(words, chunkSize);
let totalProcessed = 0;
const failedItems: Array<{ word: string; reason: string }> = [];

for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];
  try {
    // Tải trạng thái gói từ vựng mới nhất từ database
    const currentSet = await this.vocabularySetRepository.findById(vocabularySetId);
    const aggregate = VocabularySetAggregate.fromPersistence(currentSet, []);

    // Thực thi Saga xử lý nghiệp vụ cho riêng khối 50 từ này
    await this.orchestrator.execute(aggregate, chunk, language);

    totalProcessed += chunk.length;

    // Cập nhật tiến độ tức thời vào cơ sở dữ liệu để Client tracking theo thời gian thực
    vocabularySet.updateImportProgress(totalProcessed, failedItems.length, failedItems.length > 0 ? failedItems : undefined);
    await this.vocabularySetRepository.update(vocabularySet);

    // Báo cáo tiến trình công việc cho BullMQ dashboard
    await job.updateProgress({
      processed: totalProcessed,
      total: words.length,
      percentage: Math.round((totalProcessed / words.length) * 100),
    });
  } catch (error) {
    // Ghi nhận lỗi chi tiết của từng từ học thuật bị hỏng trong chunk
    for (const word of chunk) {
      failedItems.push({
        word: word.word,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Đánh giá tổng quan và chuyển trạng thái nhập tệp sang 'completed' hoặc 'failed'
```

---

## 🎨 5. Hướng Dẫn Phát Triển Frontend (React 19)

Frontend của SparkNestEd được thiết kế tinh xảo, mượt mà và bóng bẩy với các hiệu ứng kính (glassmorphism), lưới họa tiết nền tinh tế và các chuyển động vi mô cao cấp. Để giữ cho mã nguồn giao diện luôn sạch, dự án áp dụng mô hình **Page - Container - Component Pattern** nghiêm ngặt.

### A. Mô Hình Phân Tách Trách Nhiệm Giao Diện (Architecture Layering)

Lập trình viên giao diện **không được phép** gộp chung logic lấy dữ liệu, quản lý trạng thái hiển thị và vẽ giao diện vào cùng một tệp tin. Phải phân ranh giới rõ ràng như sau:

#### 1. Lớp Định Tuyến (Pages - `pages/`)
- Chỉ đóng vai trò làm đầu vào của bộ định tuyến (Route entrypoints).
- **Tuyệt đối không chứa logic nghiệp vụ, không quản lý React State (`useState`), và không fetch dữ liệu.**
- Nhiệm vụ duy nhất: Import và render **Container** tương ứng.

*Ví dụ chuẩn về Page:*
```tsx
import { MyLibraryVocabularySetContainer } from '../container/MyLibraryVocabularySetContainer';

export default function MyLibraryVocabularySetPage() {
  return <MyLibraryVocabularySetContainer />;
}
```

#### 2. Lớp Điều Phối Logic (Containers - `container/`)
- Là bộ não của giao diện.
- Trách nhiệm:
  - Quản lý các trạng thái cục bộ của trang (`useState`, `useReducer`).
  - Thực hiện gọi dữ liệu bằng các Custom Hooks tích hợp React Query.
  - Định nghĩa các hàm xử lý sự kiện tương tác của người dùng (ví dụ: `handleSearch`, `handleDeleteSet`).
  - Lắp ghép, truyền dữ liệu (data mapping) xuống các **UI Components**.

*Ví dụ chuẩn về Container:*
```tsx
import { useState } from 'react';
import { useMyCreatedSets } from '../hooks/use-vocabulary-sets';
import { SearchInput } from '../components/SearchInput';
import { VocabularySetList } from '../components/VocabularySetList';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function MyLibraryVocabularySetContainer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  
  // Tải dữ liệu thông qua custom hook được đóng gói sẵn
  const { data, isLoading, error } = useMyCreatedSets({
    search: searchTerm,
    page,
    limit: 12
  });

  if (error) return <div className="text-destructive font-semibold">Đã xảy ra lỗi khi tải dữ liệu!</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="heading-2 bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
          Thư viện của tôi
        </h1>
        <SearchInput value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} />
      </div>

      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : (
        <VocabularySetList 
          sets={data?.items || []} 
          currentPage={page} 
          totalPages={data?.meta?.totalPages || 1} 
          onPageChange={setPage} 
        />
      )}
    </div>
  );
}
```

#### 3. Lớp Giao Diện Thuần Túy (Components - `components/`)
- Là giao diện hiển thị câm (Dumb UI / Pure Components).
- Trách nhiệm:
  - Nhận dữ liệu hoàn chỉnh thông qua `props`.
  - Chỉ render mã JSX/TSX kèm CSS.
  - Có thể chứa local UI state cực kỳ nhỏ (ví dụ: trạng thái đóng/mở của một menu nhỏ, trạng thái lật thẻ flashcard).
  - **Tuyệt đối không được tiêm (inject) các query hook lấy dữ liệu từ server, không liên kết trực tiếp với Axios/API Client.**

---

### B. Hệ Thống Quản Lý State & Caching (React Query)

Hệ thống sử dụng `@tanstack/react-query` để đồng bộ trạng thái Client-Server. Mọi nhà phát triển phải tuân thủ:

1. **Quản lý Query Keys tập trung qua Factory:** Tránh viết các query key dạng chuỗi ký tự rời rạc để tránh lỗi xóa cache nhầm.
```typescript
// Định nghĩa cấu trúc Query Key chuẩn cho Vocabulary
export const vocabularyKeys = {
  all: ['vocabulary'] as const,
  lists: () => [...vocabularyKeys.all, 'list'] as const,
  list: (filters: any) => [...vocabularyKeys.lists(), { filters }] as const,
  details: () => [...vocabularyKeys.all, 'detail'] as const,
  detail: (id: string) => [...vocabularyKeys.details(), id] as const,
  myCreatedLists: () => [...vocabularyKeys.lists(), 'my-created'] as const,
  myCreatedList: (filters: any) => [...vocabularyKeys.myCreatedLists(), { filters }] as const,
};
```
2. **Khai báo Stale Time rõ ràng:** Các cấu hình thời gian sống của cache (`staleTime`, `gcTime`) phải được nạp từ tệp tin cấu hình chung `constants/` để dễ dàng tinh chỉnh hiệu năng ứng dụng.

---

### C. Đồng Bộ Thiết Kế & Nguyên Tắc Giao Diện Cao Cấp

Để giao diện mang lại trải nghiệm WOW cho người học, lập trình viên frontend phải phối hợp nhuần nhuyễn các công cụ thiết kế quy định trong `DESIGN.md`:

- **Hiệu ứng Kính cao cấp (Glassmorphism):** Áp dụng lớp phủ mờ tinh tế kết hợp bo góc tròn chuẩn xác:
  ```css
  .glass-card {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08);
  }
  .dark .glass-card {
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  ```
- **Họa tiết nền Dots:** Sử dụng lưới họa tiết chấm nhẹ để trang trí nền các màn hình học tập, tránh cảm giác trống trải đơn điệu:
  ```css
  .bg-dots {
    background-image: radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .dark .bg-dots {
    background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  }
  ```
- **Nguyên tắc "KHÔNG DỮ LIỆU GIẢ" (No Placeholders Rule):**
  - Cấm sử dụng chữ vô nghĩa (lorem ipsum, "word 1", "test 1").
  - Mọi trường dữ liệu hiển thị phải khớp chính xác với hệ cơ sở dữ liệu `schema.prisma`. 
  - Trạng thái ôn tập SRS hiển thị đúng 3 nhãn chuẩn: `NEW`, `LEARNING`, `MASTERED`.
  - Phản hồi ôn tập flashcard bắt buộc phải cung cấp đủ 4 cấp độ lựa chọn chính xác: **Học lại (Again)**, **Khó (Hard)**, **Tốt (Good)**, **Dễ (Easy)**.

---

## 💾 6. Bản Đồ Cơ Sở Dữ Liệu Thực Tế (Prisma Schema Mapping)

Để hỗ trợ việc tra cứu nhanh các bảng cơ sở dữ liệu và quan hệ giữa chúng, dưới đây là bản đồ ánh xạ trực tiếp từ `schema.prisma`:

### A. Bảng Dữ Liệu Nghiệp Vụ Cốt Lõi (Core Entity Tables)

| Tên Bảng (Prisma Model) | Khóa Chính | Khóa Ngoại / Quan Hệ Quan Trọng | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| **`vocabulary_sets`** | `id` (UUID) | `userId` | Lưu trữ thông tin gói từ vựng, cấp độ khó, ngôn ngữ, lượt thích và tiến độ import. |
| **`vocabulary_set_items`**| `id` (UUID) | `vocabularySetId` (đến set), `entryId` (đến dictionary) | Junction Table biểu diễn danh sách từ vựng của gói. Chứa dữ liệu chuẩn hóa (`word`, `definition`) để tối ưu hóa tốc độ đọc. |
| **`entries`** | `id` (UUID) | Bản ghi gốc không khóa ngoại | Từ điển tổng thể của hệ thống. Lưu trữ từ khóa, phát âm, từ loại. |
| **`user_vocabulary_progress`**| `id` (UUID) | `itemId` (đến set item), `userId` | Lưu trữ tiến trình ôn tập lặp quãng (SRS) cho từng từ của từng học viên. Chứa các tham số `easeFactor`, `interval`, `repetitions` của SM-2. |
| **`senses`** | `id` (UUID) | `entryId` (đến entry) | Lưu trữ các nghĩa chi tiết của một từ vựng gốc. |
| **`examples`** | `id` (UUID) | `entryId` (đến entry), `senseId` (đến sense) | Lưu trữ các câu ví dụ minh họa kèm bản dịch nghĩa thực tế. |

### B. Các Chỉ Mục Quan Trọng Tối Ưu Hóa Hiệu Năng (Database Indexes)

Cơ sở dữ liệu PostgreSQL được cấu hình các chỉ mục thông minh để đảm bảo tốc độ truy vấn tức thì ngay cả khi dữ liệu tăng trưởng lên hàng triệu bản ghi:

1. **`user_vocabulary_progress`**:
   - Chỉ mục phức hợp: `@@unique([userId, itemId])` để chặn tuyệt đối hiện tượng trùng lặp bản ghi tiến trình.
   - Chỉ mục tìm kiếm hàng đợi ôn tập SRS: `@@index([userId, status, nextReviewAt])` giúp lấy nhanh danh sách các thẻ từ vựng đến hạn ôn tập trong ngày của một học viên cụ thể.
2. **`vocabulary_set_items`**:
   - Chỉ mục phức hợp: `@@unique([vocabularySetId, entryId])` ngăn chặn việc add trùng một từ vào cùng một gói từ vựng.
   - Chỉ mục tìm kiếm nhanh: `@@index([word])` phục vụ tính năng tìm kiếm từ vựng phản hồi nhanh.
3. **`vocabulary_sets`**:
   - Chỉ mục lọc công khai: `@@index([isPublic, isActive, deleted])` giúp lọc nhanh các gói từ vựng được chia sẻ ra cộng đồng mà không bị quét toàn bộ bảng (table scan).

---

## 🛠️ 7. Quy Trình Kiểm Thử & Đảm Bảo Chất Lượng (QA Workflow)

Tất cả các tính năng mới trước khi được hợp nhất (merge) vào nhánh chính hệ thống bắt buộc phải trải qua quy trình kiểm thử nghiêm ngặt:

1. **Unit Test (Kiểm thử đơn vị):**
   - Phải viết Unit Test cho toàn bộ các **Domain Aggregates** (Ví dụ: Đảm bảo các kịch bản của SM-2 hoạt động chính xác 100% khi nhập quality đầu vào khác nhau).
   - Kiểm thử toàn bộ các bộ chuyển đổi **Mappers** để tránh lỗi thiếu trường dữ liệu hoặc lỗi kiểu dữ liệu (type mismatch).
   - Chạy lệnh test nhanh cục bộ:
     ```sh
     npx nx test module-vocabulary
     ```
2. **Integration Test (Kiểm thử tích hợp):**
   - Viết bài test tích hợp luồng CQRS từ Presentation Layer (Controller) -> Application Layer (Handler) -> Infrastructure Layer (Repository với cơ sở dữ liệu thật chạy trên môi trường Docker).
3. **Frontend Component Test:**
   - Kiểm thử độc lập các **UI Components** bằng cách giả lập (mock) toàn bộ `props` đầu vào để đảm bảo giao diện hiển thị đúng chuẩn thiết kế trong mọi trạng thái (Loading, Error, Empty, Success).

---

> [!IMPORTANT]
> **Cam Kết Của Nhà Phát Triển:**
> Lập trình viên cam kết luôn đọc kỹ tài liệu này và tệp tin [DESIGN.md](file:///d:/Workspace/SoftwareDevelopment/Spark-Nexus-Ed/DESIGN.md) trước khi đặt bút viết dòng code đầu tiên. Tính đóng gói của Domain nghiệp vụ, sự trong sạch của mã nguồn và sự cao cấp của giao diện người dùng chính là danh dự của đội ngũ phát triển SparkNestEd!
