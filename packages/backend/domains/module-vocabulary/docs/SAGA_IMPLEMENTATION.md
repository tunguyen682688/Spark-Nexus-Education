# Saga Implementation - NestJS CQRS Pattern

## 📋 Tổng quan

Đã triển khai Saga theo đúng pattern NestJS CQRS với BullMQ và Redis.

## 🏗️ Kiến trúc

### 1. **VocabularySetCreationOrchestrator** (Transaction Orchestrator)

- **File**: `vocabulary-set-creation-orchestrator.ts`
- **Responsibility**: Quản lý database transaction và workflow orchestration
- **Không phải** NestJS CQRS Saga, mà là transaction orchestrator

### 2. **VocabularySetCreationSaga** (NestJS CQRS Saga)

- **File**: `vocabulary-set-creation.saga.ts`
- **Responsibility**: Lắng nghe domain events và orchestrate complex workflows
- **Pattern**: NestJS CQRS Saga với `@Saga()` decorator
- **Uses**: RxJS Observables, BullMQ queues

### 3. **Event Handlers** (Application Layer)

- **VocabularySetCreatedHandler**: Xử lý side effects khi vocabulary set được tạo
- **EntryCreatedHandler**: Xử lý side effects khi entry mới được tạo
- **EntryAddedToSetHandler**: Xử lý side effects khi entry được thêm vào set

## 🔄 Flow

```
┌─────────────────────────────────────────────────────────┐
│ Command: CreateVocabularySetCommand                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Handler: CreateVocabularySetHandler                     │
│ - Quyết định sync/async                                  │
│ - Gọi Orchestrator                                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Orchestrator: VocabularySetCreationOrchestrator         │
│ - Transaction management                                 │
│ - Workflow orchestration                                 │
│ - Publish Domain Events                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Domain Events Published                                  │
│ - VocabularySetCreatedEvent                             │
│ - EntryCreatedEvent                                     │
│ - EntryAddedToSetEvent                                  │
└─────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Saga         │   │ Event        │   │ Event        │
│ (CQRS)       │   │ Handler      │   │ Handler      │
│              │   │              │   │              │
│ - Analytics  │   │ - Side       │   │ - Side       │
│ - Notify     │   │   effects    │   │   effects    │
│ - Queue jobs │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

## 📦 Components

### 1. **Saga (NestJS CQRS)**

```typescript
@Injectable()
export class VocabularySetCreationSaga {
  @Saga()
  vocabularySetCreated = (events$: Observable<any>): Observable<void> => {
    return events$.pipe(
      ofType(VocabularySetCreatedEvent),
      map((event) => {
        // Handle event
        return undefined;
      }),
      catchError((error) => {
        return EMPTY;
      })
    );
  };
}
```

**Features:**

- ✅ Sử dụng `@Saga()` decorator
- ✅ Observable stream với RxJS operators
- ✅ `ofType()` để filter events
- ✅ Error handling với `catchError()`

### 2. **Event Handlers**

```typescript
@EventsHandler(VocabularySetCreatedEvent)
export class VocabularySetCreatedHandler
  implements IEventHandler<VocabularySetCreatedEvent>
{
  async handle(event: VocabularySetCreatedEvent): Promise<void> {
    // Handle side effects
  }
}
```

**Features:**

- ✅ `@EventsHandler()` decorator
- ✅ Implement `IEventHandler<T>`
- ✅ Xử lý side effects

### 3. **BullMQ Integration**

```typescript
@Processor('vocabulary-set-import')
export class VocabularySetImportProcessor extends WorkerHost {
  async process(job: Job<VocabularySetImportJobData>): Promise<void> {
    // Process background job
  }
}
```

**Features:**

- ✅ `@Processor()` decorator
- ✅ Extends `WorkerHost`
- ✅ Redis queue management
- ✅ Retry mechanism
- ✅ Progress tracking

## 🎯 Saga Workflows

### 1. VocabularySetCreatedEvent Saga

**Triggered when**: Vocabulary set được tạo

**Actions**:

- Analytics tracking
- Notification sending
- Cache invalidation
- Queue background jobs (if needed)

### 2. EntryCreatedEvent Saga

**Triggered when**: Entry mới được tạo (draft, needs approval)

**Actions**:

- Notify admin for approval
- Update analytics
- Send notification to user

### 3. EntryAddedToSetEvent Saga

**Triggered when**: Entry được thêm vào vocabulary set

**Actions**:

- Update analytics
- Update user statistics
- Send notifications

## 🔧 Configuration

### Module Setup

```typescript
@Module({
  imports: [
    CqrsModule.forRoot(),
    BullModule.registerQueue({
      name: 'vocabulary-set-import',
    }),
  ],
  providers: [
    // Command Handlers
    CreateVocabularySetHandler,

    // Event Handlers
    VocabularySetCreatedHandler,
    EntryCreatedHandler,
    EntryAddedToSetHandler,

    // Services
    VocabularySetCreationService,
    VocabularySetCreationOrchestrator,

    // Sagas (NestJS CQRS)
    VocabularySetCreationSaga,

    // Processors
    VocabularySetImportProcessor,
  ],
})
```

## ✅ Best Practices

1. **Separation of Concerns**:

   - Orchestrator: Transaction management
   - Saga: Event-driven workflows
   - Event Handlers: Side effects

2. **Error Handling**:

   - Saga: `catchError()` với `EMPTY`
   - Event Handlers: Try-catch trong `handle()`
   - Processors: Retry mechanism

3. **Observable Patterns**:

   - Use `ofType()` để filter events
   - Use `mergeMap()` cho async operations
   - Use `map()` cho synchronous transformations

4. **BullMQ**:
   - Queue configuration trong module
   - Processor extends `WorkerHost`
   - Job data typing

## 📝 Summary

| Component      | Type           | Responsibility            |
| -------------- | -------------- | ------------------------- |
| Orchestrator   | Service        | Transaction orchestration |
| Saga           | NestJS CQRS    | Event-driven workflows    |
| Event Handlers | Application    | Side effects              |
| Processors     | Infrastructure | Background jobs (BullMQ)  |

**Key Points:**

- ✅ Saga theo đúng NestJS CQRS pattern
- ✅ Sử dụng `@Saga()` decorator
- ✅ Observable streams với RxJS
- ✅ BullMQ cho background jobs
- ✅ Redis cho queue management
- ✅ Event handlers cho side effects
- ✅ Tuân thủ DDD và CQRS principles
