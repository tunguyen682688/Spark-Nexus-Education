# 🧪 SparkNestEd Comprehensive Testing Guide & Manual

Đảm bảo tính chính xác và chất lượng của mã nguồn thông qua hệ thống kiểm thử tự động là một trong những nguyên tắc cốt lõi tại **SparkNestEd**. Tài liệu này hướng dẫn chi tiết chiến lược kiểm thử, cách thức tổ chức các bài test, và cung cấp các ví dụ thực tế giúp bạn viết Unit Tests, Integration Tests, và Frontend Component Tests chuẩn mực.

---

## 🎯 1. Chiến Lược Kiểm Thử (Testing Strategy)

Hệ thống phân tầng kiểm thử theo hình tháp kim tự tháp (Testing Pyramid) để cân bằng giữa tốc độ thực thi và độ tin cậy:

```
      ┌───────────────┐
      │  E2E Tests    │  ◀── Mức độ tích hợp cao nhất, chạy chậm (Playwright)
      ├───────────────┤
      │  Integration  │  ◀── Kiểm thử tích hợp CQRS Handlers + Live PostgreSQL
      ├───────────────┤
      │  Unit Tests   │  ◀── Chạy cực nhanh, kiểm tra logic thuật toán (SM-2, Mappers)
      └───────────────┘
```

1. **Unit Tests (Kiểm thử đơn vị - Chiếm 70%):**
   - Tập trung vào: Domain Aggregates (như `UserLearningProgressAggregate`), Entities, Value Objects, Mappers, và các Business Services thuần túy.
   - Nguyên tắc: Không kết nối mạng, không truy cập database thật. Sử dụng mock dữ liệu cô lập hoàn toàn. Chạy bằng thư viện **Jest** hoặc **Vitest**.
2. **Integration Tests (Kiểm thử tích hợp - Chiếm 20%):**
   - Tập trung vào: Command Handlers, Query Handlers, API Controllers.
   - Nguyên tắc: Kiểm tra sự phối hợp giữa nhiều lớp (Layers). Sử dụng cơ sở dữ liệu PostgreSQL chạy trong container Docker để chạy các câu lệnh thật nhằm bảo đảm tính đúng đắn của dữ liệu.
3. **End-to-End Tests (E2E Tests - Chiếm 10%):**
   - Tập trung vào: Kiểm thử toàn bộ kịch bản nghiệp vụ của học viên từ giao diện frontend React xuống backend API và database. Chạy tự động bằng **Playwright**.

---

## 🧠 2. Hướng Dẫn Viết Unit Tests (Domain & Mappers)

Unit Tests cần được viết một cách trực quan, ngắn gọn, và tập trung vào kiểm tra tính nhất quán của logic nghiệp vụ cốt lõi.

### A. Kiểm thử logic thuật toán SRS (SM-2) trong Aggregate Root

Dưới đây là ví dụ chuẩn mực để kiểm thử thực tế thuật toán lặp quãng (Spaced Repetition) nằm trong `UserLearningProgressAggregate`.

```typescript
import { UserLearningProgressAggregate } from '../aggregates/user-learning-progress.aggregate';
import { UserVocabularyProgressEntity } from '../entities/user-vocabulary-progress.entity';
import { VocabularySetItemEntity } from '../entities/vocabulary-set-item.entity';

describe('UserLearningProgressAggregate - SM-2 SRS Algorithm', () => {
  let itemEntity: VocabularySetItemEntity;
  let progressEntity: UserVocabularyProgressEntity;
  let aggregate: UserLearningProgressAggregate;

  beforeEach(() => {
    // Khởi tạo thực thể Vocabulary Set Item giả lập
    itemEntity = VocabularySetItemEntity.fromPersistence({
      id: 'item-123',
      entryId: 'entry-abc',
      vocabularySetId: 'set-789',
      word: 'persist',
      definition: 'to continue steadfastly or firmly in some state',
      example: 'She persisted in her studies despite the difficulties.',
      version: BigInt(1),
    });

    // Khởi tạo tiến trình học mới của học viên
    progressEntity = UserVocabularyProgressEntity.create(
      'progress-456',
      'user-999',
      'item-123'
    );

    // Dựng Aggregate Root
    aggregate = UserLearningProgressAggregate.fromPersistence(progressEntity, itemEntity);
  });

  it('should initialize with status NEW and ease factor 2.5', () => {
    expect(aggregate.getStatus()).toBe('NEW');
    expect(aggregate.getProgress().getEaseFactor()).toBe(2.5);
    expect(aggregate.getProgress().getRepetitions()).toBe(0);
    expect(aggregate.getProgress().getInterval()).toBe(0);
  });

  it('should shift status to LEARNING and set interval to 1 on first successful review (quality = 4)', () => {
    // Ghi nhận phiên ôn tập thành công đầu tiên
    aggregate.recordReview(4);

    expect(aggregate.getStatus()).toBe('LEARNING');
    expect(aggregate.getProgress().getRepetitions()).toBe(1);
    expect(aggregate.getProgress().getInterval()).toBe(1);
    // Tính toán ngày review kế tiếp là ngày mai (cách 1 ngày)
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 1);
    expect(aggregate.getNextReviewAt()?.getDate()).toBe(expectedDate.getDate());
  });

  it('should set interval to 6 on second successful review', () => {
    // Trả lời đúng lần 1 (Quality 4) -> Repetitions = 1, Interval = 1
    aggregate.recordReview(4);
    // Trả lời đúng lần 2 (Quality 5) -> Repetitions = 2, Interval = 6
    aggregate.recordReview(5);

    expect(aggregate.getProgress().getRepetitions()).toBe(2);
    expect(aggregate.getProgress().getInterval()).toBe(6);
  });

  it('should reset repetitions and set interval to 1 on failed review (quality < 3)', () => {
    // Học viên trả lời đúng 2 lần liên tiếp trước đó
    aggregate.recordReview(4);
    aggregate.recordReview(4);
    
    // Gặp từ khó đột ngột trả lời quên sạch (Quality = 1)
    aggregate.recordReview(1);

    expect(aggregate.getProgress().getRepetitions()).toBe(0);
    expect(aggregate.getProgress().getInterval()).toBe(1);
    // Hệ số dễ bị giảm xuống để hiển thị lại từ vựng này thường xuyên hơn
    expect(aggregate.getProgress().getEaseFactor()).toBeLessThan(2.5);
  });

  it('should maintain Ease Factor above the minimum threshold of 1.3', () => {
    // Trả lời quên từ liên tục 10 lần
    for (let i = 0; i < 10; i++) {
      aggregate.recordReview(0);
    }
    expect(aggregate.getProgress().getEaseFactor()).toBe(1.3);
  });
});
```

---

## 🔄 3. Hướng Dẫn Viết Integration Tests (CQRS & Database)

Integration Tests giúp bảo đảm ranh giới hạ tầng (Database Prisma, Transaction) hoạt động chính xác theo các Command/Query Handlers.

### A. Thiết lập môi trường Test Database với Live PostgreSQL

Dự án cung cấp một Utility Class đặc biệt `DatabaseTestHelper` để tự động dọn dẹp dữ liệu bảng trước mỗi phiên chạy thử nghiệm, tránh hiện tượng rác dữ liệu từ phiên kiểm thử trước ảnh hưởng đến kết quả.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule, CommandBus } from '@nestjs/cqrs';
import { CreateVocabularySetHandler } from './create-vocabulary-set.handler';
import { CreateVocabularySetCommand } from './create-vocabulary-set.command';
import { VOCABULARY_SET_REPOSITORY } from '../../../domain/repositories/vocabulary-set.repository.interface';
import { PrismaVocabularySetRepository } from '../../../infrastructure/repositories/prisma-vocabulary-set.repository';
import { PrismaService } from '@spark-nest-ed/backend-infrastructure-database';
import { VocabularySetCreationOrchestrator } from '../../../domain/sagas/vocabulary-set-creation-orchestrator';

describe('CreateVocabularySetHandler - Integration Test', () => {
  let moduleRef: TestingModule;
  let commandBus: CommandBus;
  let prisma: PrismaService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateVocabularySetHandler,
        VocabularySetCreationOrchestrator,
        PrismaService,
        {
          provide: VOCABULARY_SET_REPOSITORY,
          useClass: PrismaVocabularySetRepository,
        },
      ],
    }).compile();

    commandBus = moduleRef.get<CommandBus>(CommandBus);
    prisma = moduleRef.get<PrismaService>(PrismaService);
    
    // Đăng ký Handler vào CQRS Bus
    commandBus.register([CreateVocabularySetHandler]);
  });

  beforeEach(async () => {
    // Dọn dẹp sạch toàn bộ cơ sở dữ liệu chạy thử nghiệm
    await prisma.vocabularySetItem.deleteMany({});
    await prisma.vocabularySet.deleteMany({});
    await prisma.entry.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await moduleRef.close();
  });

  it('should successfully create an empty vocabulary set', async () => {
    const command = new CreateVocabularySetCommand(
      'user-test-id-111',
      'Từ vựng tiếng Anh giao tiếp chuyên sâu',
      'en',
      'flashcard',
      'Tổng hợp các mẫu câu hội thoại thường dùng nhất'
    );

    const result = await commandBus.execute(command);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Từ vựng tiếng Anh giao tiếp chuyên sâu');
    expect(result.entryCount).toBe(0);

    // Xác thực thực tế bản ghi tồn tại dưới Database thật
    const dbRecord = await prisma.vocabularySet.findUnique({
      where: { id: result.id },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.language).toBe('en');
  });
});
```

---

## 🎨 4. Hướng Dẫn Viết Frontend Component Tests (React)

Frontend Tests giúp bạn kiểm soát chặt chẽ trạng thái hiển thị của UI Components, đảm bảo các Props được xử lý chính xác và các trạng thái chuyển dịch giao diện (Loading, Empty, Data) diễn ra mượt mà.

### A. Kiểm thử Trạng Thái Hiển Thị (UI States Component Testing)

Ví dụ dưới đây hướng dẫn viết test cho component `VocabularySetCard` bằng thư viện `@testing-library/react`.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabularySetCard } from '../components/VocabularySetCard';

describe('<VocabularySetCard /> - UI Component Test', () => {
  const mockSet = {
    id: 'set-111',
    title: '50 Từ vựng IELTS chủ đề Environment',
    description: 'Chủ đề môi trường thường gặp trong kỳ thi Academic',
    language: 'en',
    type: 'flashcard',
    entryCount: 50,
    favoriteCount: 12,
    studyCount: 89,
    importStatus: 'completed',
    coverImage: 'https://example.com/cover.png',
  };

  it('should render vocabulary set information correctly', () => {
    render(<VocabularySetCard set={mockSet} />);

    // Kiểm tra tên tiêu đề
    expect(screen.getByText('50 Từ vựng IELTS chủ đề Environment')).toBeInTheDocument();
    // Kiểm tra mô tả thực tế
    expect(screen.getByText('Chủ đề môi trường thường gặp trong kỳ thi Academic')).toBeInTheDocument();
    // Kiểm tra số lượng từ học thuật hiển thị chuẩn xác
    expect(screen.getByText('50 từ')).toBeInTheDocument();
    // Kiểm tra lượt yêu thích
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should trigger onView callback when the card is clicked', () => {
    const mockOnView = jest.fn();
    render(<VocabularySetCard set={mockSet} onView={mockOnView} />);

    // Giả lập tương tác click của người dùng
    const cardElement = screen.getByTestId('vocabulary-set-card-set-111');
    fireEvent.click(cardElement);

    expect(mockOnView).toHaveBeenCalledTimes(1);
    expect(mockOnView).toHaveBeenCalledWith('set-111');
  });
});
```

---

## 🛠️ 5. Quy Trình Chạy Kiểm Thử & Kiểm Tra Độ Phủ (Coverage)

Mục tiêu bắt buộc của SparkNestEd là **độ phủ mã nguồn (Code Coverage) tối thiểu phải đạt 80%** đối với tất cả các domain nghiệp vụ trước khi phát hành.

### Các câu lệnh kiểm tra độ phủ mã nguồn:
```bash
# Chạy toàn bộ test của module-vocabulary kèm phân tích độ phủ
npx nx test module-vocabulary --codeCoverage

# Kiểm tra báo cáo độ phủ chi tiết
# Báo cáo dạng trang web tương tác sẽ được tạo tự động tại thư mục:
# dist/packages/backend/domains/module-vocabulary/coverage/index.html
```

---

> [!TIP]
> **Mẹo Lập Trình Thử Nghiệm (TDD):**
> Hãy cố gắng rèn luyện thói quen viết các bài kiểm thử biên dạng **Unit Tests** trước khi bắt đầu viết logic nghiệp vụ thực tế. Việc này giúp bạn định hình rõ nét ranh giới hoạt động của thực thể, giảm thiểu tối đa các lỗi tư duy nghiệp vụ và giúp quá trình tích hợp mã nguồn diễn ra vô cùng nhanh chóng.
