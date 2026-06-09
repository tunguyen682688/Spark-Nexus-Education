# Hệ thống CQRS và Mappers - Module Vocabulary

## 📋 Tổng quan

Hệ thống này được xây dựng theo kiến trúc **CQRS (Command Query Responsibility Segregation)** và **DDD (Domain-Driven Design)**, áp dụng các best practices của NestJS.

## 🏗️ Kiến trúc Layers

```
┌─────────────────────────────────────────────────────┐
│           Presentation Layer (Controllers)          │
│  - Nhận HTTP requests                               │
│  - Validate DTOs (class-validator)                  │
│  - Dispatch Commands/Queries                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│            Application Layer (Handlers)             │
│  - Command Handlers (Write operations)              │
│  - Query Handlers (Read operations)                 │
│  - Use Mappers for DTO ↔ Entity conversion         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Domain Layer (Entities)                │
│  - Business Logic                                   │
│  - Domain Events                                    │
│  - Value Objects                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         Infrastructure Layer (Repositories)         │
│  - Database operations                              │
│  - External services                                │
└─────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Write Operations (Commands)

```
Controller
  ↓ [DTO]
CommandBus
  ↓ [Command]
CommandHandler
  ↓ [uses Mapper]
Mapper: DTO → Entity
  ↓ [Entity]
Repository
  ↓
Database
  ↓ [Entity]
Mapper: Entity → ResponseDTO
  ↓ [ResponseDTO]
Return to Client
```

### Read Operations (Queries)

```
Controller
  ↓ [Query params]
QueryBus
  ↓ [Query]
QueryHandler
  ↓
Repository
  ↓ [Entities]
Mapper: Entity → ResponseDTO
  ↓ [ResponseDTOs]
Return to Client
```

## 📦 Components

### 1. DTOs (Data Transfer Objects)

**Input DTOs** - Validate incoming data:

```typescript
// create-vocabulary-set.dto.ts
export class CreateVocabularySetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsEnum(Language)
  language!: Language;
  // ...
}
```

**Response DTOs** - Shape output data:

```typescript
// reponse-vocabulary-set.dto.ts
export class VocabularySetResponseDto {
  id!: string;
  title!: string;
  language!: Language;
  // ...
}
```

### 2. Commands

Commands represent **write operations** (Create, Update, Delete):

```typescript
export class CreateVocabularySetCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly title: string
  ) // ...
  {
    // Command-level validation
    if (!title) throw new Error('Title is required');
  }

  // Factory method from DTO
  static fromDto(dto: CreateVocabularySetDto): CreateVocabularySetCommand {
    return new CreateVocabularySetCommand(/*...*/);
  }
}
```

### 3. Queries

Queries represent **read operations** (Get, List, Search):

```typescript
export class GetUserVocabularySetsQuery extends BasePaginatedQuery {
  constructor(
    public readonly userId: string,
    public readonly filters?: {
      language?: Language;
      searchTerm?: string;
      // ...
    },
    page?: number,
    limit?: number
  ) {
    super(page, limit);
  }
}
```

### 4. Mappers

Mappers handle **DTO ↔ Entity** conversions:

```typescript
@Injectable()
export class VocabularySetMapper {
  // DTO → Entity (for Command handlers)
  toEntity(dto: CreateVocabularySetDto, userId: string): VocabularySetEntity {
    return VocabularySetEntity.create(/*...*/);
  }

  // Entity → ResponseDTO (for responses)
  toResponseDto(entity: VocabularySetEntity): VocabularySetResponseDto {
    return {
      id: entity.getId(),
      title: entity.getTitle(),
      // ...
    };
  }

  // Bulk conversion
  toResponseDtoList(
    entities: VocabularySetEntity[]
  ): VocabularySetResponseDto[] {
    return entities.map((e) => this.toResponseDto(e));
  }
}
```

### 5. Command Handlers

Handle write operations:

```typescript
@CommandHandler(CreateVocabularySetCommand)
export class CreateVocabularySetHandler {
  constructor(
    private readonly repository: IVocabularySetRepository,
    private readonly mapper: VocabularySetMapper,
    private readonly eventBus: EventBus
  ) {}

  async execute(
    command: CreateVocabularySetCommand
  ): Promise<VocabularySetResponseDto> {
    // 1. Convert DTO to Entity
    const entity = this.mapper.toEntity(dto, userId);

    // 2. Persist
    const saved = await this.repository.create(entity);

    // 3. Emit events
    this.eventBus.publish(new VocabularySetCreatedEvent(/*...*/));

    // 4. Return ResponseDTO
    return this.mapper.toResponseDto(saved);
  }
}
```

### 6. Query Handlers

Handle read operations:

```typescript
@QueryHandler(GetUserVocabularySetsQuery)
export class GetUserVocabularySetsHandler {
  constructor(
    private readonly repository: IVocabularySetRepository,
    private readonly mapper: VocabularySetMapper
  ) {}

  async execute(
    query: GetUserVocabularySetsQuery
  ): Promise<PaginatedResponse<VocabularySetResponseDto>> {
    // 1. Query repository
    const [entities, total] =
      await this.repository.findByUserIdWithFilters(/*...*/);

    // 2. Convert to DTOs
    const dtos = this.mapper.toResponseDtoList(entities);

    // 3. Return paginated response
    return {
      data: dtos,
      meta: {
        /*...*/
      },
    };
  }
}
```

### 7. Controllers

Route HTTP requests to Commands/Queries:

```typescript
@Controller('vocabulary-sets')
export class VocabularySetController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  async createSet(@Body() dto: CreateVocabularySetDto) {
    const command = CreateVocabularySetCommand.fromDto(dto);
    return await this.commandBus.execute(command);
  }

  @Get()
  async getUserSets(@Query() params: ListQueryParams) {
    const query = GetUserVocabularySetsQuery.fromDto(params);
    return await this.queryBus.execute(query);
  }
}
```

## ✅ Best Practices

### 1. Separation of Concerns

- **Controllers**: HTTP handling only
- **Handlers**: Orchestration logic
- **Entities**: Business logic
- **Repositories**: Data access
- **Mappers**: Data transformation

### 2. Command/Query Validation

```typescript
// Commands validate at construction
constructor(public readonly title: string) {
  if (!title) throw new Error('Title required');
}
```

### 3. Factory Methods

```typescript
// Tạo Commands/Queries từ DTOs
static fromDto(dto: CreateVocabularySetDto): CreateVocabularySetCommand {
  return new CreateVocabularySetCommand(/*...*/);
}
```

### 4. Mapper Injection

```typescript
// Inject mappers vào handlers
constructor(
  private readonly repository: IVocabularySetRepository,
  private readonly mapper: VocabularySetMapper // Injectable
) {}
```

### 5. Response Consistency

```typescript
// Luôn return DTOs, không return Entities
async execute(command: CreateVocabularySetCommand): Promise<VocabularySetResponseDto> {
  const entity = await this.repository.create(/*...*/);
  return this.mapper.toResponseDto(entity); // ✅
  // return entity; // ❌
}
```

## 🔄 Use Case Examples

### UC-VOC-001: Create Vocabulary Set

**Flow:**

1. Client → POST /vocabulary-sets + `CreateVocabularySetDto`
2. Controller validates DTO → creates `CreateVocabularySetCommand`
3. CommandBus dispatches to `CreateVocabularySetHandler`
4. Handler uses Mapper to convert DTO → Entity
5. Handler persists Entity via Repository
6. Handler emits `VocabularySetCreatedEvent`
7. Handler converts Entity → `VocabularySetResponseDto`
8. Return ResponseDTO to client

### UC-VOC-002: Update Vocabulary Set

**Flow:**

1. Client → PATCH /vocabulary-sets/:id + `UpdateVocabularySetDto`
2. Controller creates `UpdateVocabularySetCommand`
3. Handler fetches Entity from Repository
4. Handler validates ownership
5. Handler calls Entity method: `entity.updateInfo()`
6. Handler persists updated Entity
7. Handler emits `VocabularySetUpdatedEvent`
8. Return ResponseDTO

### Query with Filtering & Pagination

**Flow:**

1. Client → GET /vocabulary-sets?language=EN&page=2&limit=10
2. Controller creates `GetUserVocabularySetsQuery`
3. QueryHandler queries Repository with filters
4. Handler converts Entities → ResponseDTOs
5. Return `PaginatedResponse<VocabularySetResponseDto>`

## 📁 File Structure

```
lib/
├── application/
│   ├── commands/
│   │   ├── create-vocabulary-set.command.ts
│   │   ├── update-vocabulary-set-info.command.ts
│   │   └── delete-vocabulary-set-permanent.command.ts
│   ├── queries/
│   │   └── get-user-vocabulary-sets.query.ts
│   ├── dtos/
│   │   ├── create-vocabulary-set.dto.ts
│   │   ├── update-vocabulary-set-info.dto.ts
│   │   └── reponse-vocabulary-set.dto.ts
│   ├── mappers/
│   │   ├── base.mapper.ts
│   │   ├── vocabulary-set.mapper.ts
│   │   └── index.ts
│   └── handlers/
│       ├── commands/
│       │   ├── create-vocabulary-set.handler.ts
│       │   └── update-vocabulary-set-info.handler.ts
│       └── queries/
│           └── get-user-vocabulary-sets.handler.ts
├── domain/
│   ├── entities/
│   ├── events/
│   ├── value-objects/
│   └── repositories/ (interfaces)
├── infrastructure/
│   └── repositories/ (implementations)
└── presentation/
    └── controllers/
```

## 🧪 Testing Strategy

### Unit Tests

- Test Mappers: DTO → Entity, Entity → DTO
- Test Command/Query validation
- Test Handler logic (mock repositories)

### Integration Tests

- Test full flow: Controller → Handler → Repository
- Test with real database

### Example:

```typescript
describe('VocabularySetMapper', () => {
  it('should convert DTO to Entity', () => {
    const dto = { title: 'Test', language: Language.EN /*...*/ };
    const entity = mapper.toEntity(dto, 'user-123');
    expect(entity.getTitle()).toBe('Test');
  });
});
```

## 🚀 Benefits

1. **Testability**: Easy to mock and test each layer
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new features
4. **Type Safety**: Full TypeScript support
5. **Consistency**: Standardized patterns across module
6. **Performance**: Separate read/write optimizations (CQRS)

## 📚 References

- [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
