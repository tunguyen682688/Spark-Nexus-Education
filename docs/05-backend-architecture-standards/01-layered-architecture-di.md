# 🔌 Layered Architecture & Dependency Injection

Hệ thống Backend của **SparkNestEd** xây dựng trên nền tảng framework **NestJS**, tuân thủ nghiêm ngặt mô hình **Clean Architecture** phân lớp hướng miền nghiệp vụ kết hợp với mô hình **CQRS (Command Query Responsibility Segregation)**. 

---

## 🏗️ 1. Bản Đồ Cấu Trúc 3 Lớp Thực Tế

Dưới đây là sơ đồ luồng đi của request và sự phân rã ranh giới giữa các lớp:

```text
  [HTTP Request]
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ 1. CONTROLLER / PRESENTATION                           │
│ - Tiếp nhận HTTP Request, giải mã JWT.                 │
│ - Validate DTOs bằng class-validator & Pipes.          │
│ - Chuyển đổi DTO -> Command / Query và gửi vào Bus.    │
└───────────────────────────┬────────────────────────────┘
                            │ (Thông qua Command/Query Bus)
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. APPLICATION / HANDLERS                              │
│ - Use Cases / Command & Query Handlers.                │
│ - Điều phối tải Aggregate từ Domain Repository.        │
│ - Gọi logic nghiệp vụ lõi trong Aggregate Root.        │
│ - Thực thi lưu trạng thái & sinh Domain Events.        │
└───────────────────────────┬────────────────────────────┘
                            │ (Đảo ngược phụ thuộc - DIP)
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. INFRASTRUCTURE / PRISMA                             │
│ - Triển khai thực tế Domain Repository Interface.      │
│ - Thao tác trực tiếp với cơ sở dữ liệu qua Prisma.     │
└────────────────────────────────────────────────────────┘
```

---

## 💻 2. Ví Dụ Mã Nguồn Chuẩn Cho 3 Tầng

### Tầng 1: Controller (Presentation) - Bóc tách tham số & Validation
Nhiệm vụ duy nhất là xử lý giao thức HTTP, cấm tuyệt đối chứa logic nghiệp vụ hay gọi database trực tiếp.

```typescript
// packages/backend/domains/module-vocabulary/src/lib/presentation/vocabulary-set.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateVocabularySetDto } from '../dtos/create-vocabulary-set.dto';
import { CreateVocabularySetCommand } from '../application/commands/create-set.command';
import { CurrentUser } from '@spark-nest-ed/shared-infrastructure';

@Controller('vocabulary-sets')
@UseGuards(JwtAuthGuard)
export class VocabularySetController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(
    @Body() dto: CreateVocabularySetDto,
    @CurrentUser('id') userId: string
  ) {
    // Bóc tách HTTP Context, đóng gói Command sạch sẽ
    const command = CreateVocabularySetCommand.fromDto(dto, userId);
    
    // Gửi vào CommandBus điều phối sang tầng Application
    return this.commandBus.execute(command);
  }
}
```

### Tầng 2: Command Handler (Application) - Điều phối nghiệp vụ
Nắm giữ luồng công việc (Orchestration), gọi Aggregate và Repository.

```typescript
// packages/backend/domains/module-vocabulary/src/lib/application/commands/create-set.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateVocabularySetCommand } from './create-set.command';
import { VocabularySetAggregate } from '../../domain/aggregates/vocabulary-set.aggregate';
import { IVocabularySetRepository } from '../../domain/repositories/vocabulary-set.repository.interface';

@CommandHandler(CreateVocabularySetCommand)
export class CreateVocabularySetHandler implements ICommandHandler<CreateVocabularySetCommand> {
  constructor(
    // Inject qua token Interface để đạt đảo ngược phụ thuộc (DIP)
    @Inject('IVocabularySetRepository')
    private readonly repository: IVocabularySetRepository
  ) {}

  async execute(command: CreateVocabularySetCommand): Promise<string> {
    // 1. Khởi tạo thực thể gốc Aggregate Root
    const aggregate = new VocabularySetAggregate(uuid(), command.title, command.userId);

    // 2. Thêm các từ vựng ban đầu và kiểm soát các luật bất biến domain
    if (command.initialWords) {
      for (const word of command.initialWords) {
        aggregate.addVocabularyItem(word.word, word.definition);
      }
    }

    // 3. Lưu trạng thái xuống cơ sở dữ liệu qua Repository
    await this.repository.save(aggregate);

    // 4. Phát Domain Events ra ngoài
    aggregate.publish();

    return aggregate.getId();
  }
}
```

### Tầng 3: Repository (Infrastructure) - Triển khai thực tế Prisma SQL
Thực hiện truy vấn hạ tầng cụ thể PostgreSQL qua Prisma.

```typescript
// packages/backend/domains/module-vocabulary/src/lib/infrastructure/repositories/vocabulary-set.repository.ts
import { Injectable } from '@nestjs/common';
import { IVocabularySetRepository } from '../../domain/repositories/vocabulary-set.repository.interface';
import { VocabularySetAggregate } from '../../domain/aggregates/vocabulary-set.aggregate';
import { PrismaService } from '@spark-nest-ed/shared-infrastructure';

@Injectable()
export class VocabularySetRepository implements IVocabularySetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(aggregate: VocabularySetAggregate): Promise<void> {
    const data = VocabularySetMapper.toPersistence(aggregate);

    await this.prisma.vocabularySet.create({
      data: {
        id: data.id,
        title: data.title,
        userId: data.userId,
        items: {
          create: data.items.map(item => ({
            id: item.id,
            word: item.word,
            definition: item.definition
          }))
        }
      }
    });
  }
}
```

---

## ⚙️ 3. Phân Tích Chuyên Sâu Về NestJS Dependency Injection Scopes

Việc lựa chọn đúng phạm vi vòng đời (**Scope**) của Injectable Provider quyết định lớn đến khả năng chịu tải và hiệu năng của Backend:

| DI Scope | Vòng Đời Instance | ⚡ Hiệu Năng & Khả Năng Scale | Khuyên Dùng Cho |
| :--- | :--- | :--- | :--- |
| **`DEFAULT (Singleton)`** | Khởi tạo **duy nhất 1 lần** lúc khởi chạy app và dùng chung cho toàn bộ các request. | 🚀 **Cực kỳ nhanh (Tối ưu nhất)**. Tiết kiệm tài nguyên CPU/RAM vì không phải GC liên tục. | Hầu hết các Class: Services, Repositories, Handlers. |
| **`REQUEST`** | Khởi tạo một instance **mới hoàn toàn cho mỗi HTTP Request** đầu vào và tự hủy sau khi trả về response. | ⚠️ **Chậm hơn**. Gây áp lực dọn rác (Garbage Collector) khi có hàng ngàn CCU đồng thời. | Khi cần lưu trạng thái request cụ thể (Ví dụ: Dynamic Tenant ID, JWT context cô lập). |
| **`TRANSIENT`** | Khởi tạo một instance **mới cho mỗi nơi Inject** (Ngay cả trong cùng 1 request). | 🛑 **Cực kỳ tốn tài nguyên**. | Các Provider nhẹ, không giữ trạng thái (Ví dụ: Logger Helper độc lập). |

> [!WARNING]
> **Hiệu ứng lan truyền Scope (Scope Bubble Effect):** Nếu một Singleton Service của bạn vô tình inject một Request-scoped Provider (Ví dụ: inject `REQUEST` context để lấy trực tiếp HTTP Header), thì toàn bộ Singleton Service đó và các component inject nó sẽ bị **tự động chuyển thành Request Scope**. Hãy sử dụng `ModuleRef` hoặc thiết kế DTO sạch để lấy dữ liệu từ Request thay vì lạm dụng Request Scope.
