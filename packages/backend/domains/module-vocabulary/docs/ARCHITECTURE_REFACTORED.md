# Architecture Refactored - Vocabulary Set Creation

## 📋 Tổng quan

Tài liệu này mô tả kiến trúc đã được refactor cho việc tạo vocabulary set, tuân thủ DDD principles với:

- **Repository Layer**: Tách tất cả Prisma queries
- **Domain Service Layer**: Business logic phức tạp
- **Saga Pattern**: Quản lý distributed transactions
- **BullMQ + Redis**: Background job processing
- **Event-Driven**: Domain events cho saga workflow

## 🏗️ Kiến trúc Layers

```
┌─────────────────────────────────────────────────────┐
│     Presentation Layer (Controllers)               │
│  - REST API endpoints                               │
│  - DTO validation                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     Application Layer (Command Handlers)            │
│  - CreateVocabularySetHandler                       │
│  - Orchestrates Domain Services                     │
│  - Decides sync vs async processing                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     Domain Layer (Services & Saga)                  │
│  - VocabularySetCreationService (Business Logic)    │
│  - VocabularySetCreationSaga (Transaction Orchestr.)│
│  - Aggregates (VocabularySetAggregate)             │
│  - Domain Events                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     Infrastructure Layer (Repositories & Jobs)      │
│  - VocabularySetRepository (Prisma queries)        │
│  - EntryRepository (Prisma queries)                │
│  - VocabularySetImportProcessor (BullMQ)            │
│  - Redis (Queue management)                        │
└─────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Small Batch (≤50 words) - Synchronous:

```
Command
  ↓
Handler
  ↓
Domain Service (processWords)
  ↓
Saga (execute)
  ├─> Create Vocabulary Set (Transaction)
  ├─> Process Words (find existing)
  ├─> Create New Entries (Transaction)
  ├─> Add Items to Set (Transaction)
  └─> Publish Events
  ↓
Response
```

### Large Batch (>50 words) - Asynchronous:

```
Command
  ↓
Handler
  ├─> Create Vocabulary Set (with pending status)
  ├─> Queue Background Job (BullMQ)
  └─> Return Response Immediately
       ↓
Background Job Processor
  ├─> Load Vocabulary Set
  ├─> Process in Chunks (50 words/chunk)
  ├─> Execute Saga for each chunk
  ├─> Update Progress
  └─> Mark as Completed/Failed
```

## 📦 Components

### 1. **Repository Layer** (Infrastructure)

**Tất cả Prisma queries được tách xuống repositories:**

#### VocabularySetRepository

```typescript
- create(vocabularySet): Promise<VocabularySetEntity>
- update(vocabularySet): Promise<VocabularySetEntity>
- findById(id): Promise<VocabularySetEntity | null>
- createInTransaction(tx, vocabularySet): Promise<VocabularySetEntity>
- updateEntryCountInTransaction(tx, setId, count): Promise<void>
```

#### VocabularySetItemRepository

```typescript
- create(item): Promise<VocabularySetItemEntity>
- createMany(items): Promise<VocabularySetItemEntity[]>
- createManyInTransaction(tx, items): Promise<void>
```

#### EntryRepository

```typescript
- findById(id): Promise<Entry | null>
- findByWord(word, language): Promise<Entry | null>
- findByWords(words[], language): Promise<Entry[]>
- createBasicEntry(input): Promise<Entry>
```

**Lợi ích:**

- ✅ Tách biệt infrastructure concerns
- ✅ Dễ dàng test (mock repositories)
- ✅ Dễ dàng thay đổi database (chỉ cần implement interface)

---

### 2. **Domain Service Layer**

#### VocabularySetCreationService

**Responsibilities:**

- Process words (find existing vs new)
- Create new entries
- Business logic: existing words → attach, new words → create draft

**Methods:**

```typescript
- processWords(words, language): Promise<Map<string, WordProcessingResult>>
- createNewEntries(wordsToCreate, language): Promise<Map<string, string>>
```

**Business Rules:**

1. **Existing words (published)**: Attach directly to vocabulary set
2. **New words**: Create as draft (`isDraft: true, isPublished: false`)
   - Needs approval before publishing to community
   - Can still be used in private vocabulary sets

---

### 3. **Saga Pattern**

#### VocabularySetCreationSaga

**Orchestrates distributed transaction:**

```typescript
Saga Steps:
1. Create Vocabulary Set (Transaction)
2. Process Words (find existing / identify new)
3. Create New Entries (Transaction)
4. Add Items to Set (Transaction)
5. Update Entry Count (Transaction)
6. Publish Domain Events

Compensation:
- Automatic rollback via database transaction
- All or nothing
```

**Lợi ích:**

- ✅ Atomic operations
- ✅ Consistency guaranteed
- ✅ Clear workflow
- ✅ Easy to extend

---

### 4. **Background Job Processing** (BullMQ + Redis)

#### VocabularySetImportProcessor

**Handles large batch imports:**

```typescript
@Processor('vocabulary-set-import')
- Process job from queue
- Update import status (pending → processing → completed/failed)
- Process words in chunks (50 words/chunk)
- Track progress
- Retry on failure
```

**Queue Configuration:**

- **Queue Name**: `vocabulary-set-import`
- **Retry**: 3 attempts with exponential backoff
- **Progress Tracking**: Via `importProgress` field
- **Redis**: Stores job queue and state

---

### 5. **Domain Events**

**Events for Saga Workflow:**

```typescript
- VocabularySetCreatedEvent
- EntryAddedToSetEvent
- EntryCreatedEvent (new entries need approval)
```

**Event Flow:**

```
Saga completes
  ↓
Publish Events
  ↓
Event Handlers (future)
  - Notification Service
  - Analytics Service
  - Approval Workflow (for new entries)
```

---

## 🎯 Business Logic Flow

### Scenario 1: Existing Word (Published)

```
User adds word "hello" (already exists in DB, published)
  ↓
Service.processWords() → finds existing entry
  ↓
Saga.execute()
  ├─> Entry exists → use existing entryId
  ├─> Create VocabularySetItem (link to existing entry)
  └─> Publish EntryAddedToSetEvent
  ↓
Result: Word attached to vocabulary set immediately
```

### Scenario 2: New Word (Needs Approval)

```
User adds word "newword" (doesn't exist in DB)
  ↓
Service.processWords() → identifies as new
  ↓
Saga.execute()
  ├─> Create Entry (isDraft: true, isPublished: false)
  ├─> Create Sense (if definition provided)
  ├─> Create Example (if example provided)
  ├─> Create VocabularySetItem (link to new entry)
  └─> Publish EntryCreatedEvent (needs approval)
  ↓
Result:
- Word added to vocabulary set (private use)
- Entry created as draft
- Needs admin approval before publishing to community
```

---

## 📊 Performance Optimizations

### 1. **Batch Operations**

- Batch find entries: `findByWords()` - 1 query instead of N
- Batch create items: `createMany()` - 1 query instead of N
- Batch create entries: Transaction with multiple creates

### 2. **Background Jobs**

- Large batches (>50 words) → Background job
- User receives immediate response
- Processing happens asynchronously
- Progress tracking via `importProgress`

### 3. **Database Transactions**

- Atomic operations
- Rollback on failure
- Optimized isolation level (`ReadCommitted`)

### 4. **Connection Pooling**

- Prisma handles connection pooling
- Configured via `DATABASE_URL`

---

## 🔐 Consistency Rules

### Within Transaction (Strong Consistency):

- Vocabulary Set + Items created atomically
- Entry Count updated correctly
- All or nothing

### Between Aggregates (Eventual Consistency):

- Entry creation → VocabularySetItem creation
- Events published after transaction commit
- Approval workflow (future) handles new entries

---

## 📝 Summary

| Component      | Responsibility                 | Layer          |
| -------------- | ------------------------------ | -------------- |
| Handler        | Orchestrate, decide sync/async | Application    |
| Domain Service | Business logic (process words) | Domain         |
| Saga           | Transaction orchestration      | Domain         |
| Repository     | Database queries (Prisma)      | Infrastructure |
| Processor      | Background job execution       | Infrastructure |
| Events         | Domain events for workflow     | Domain         |

**Key Improvements:**

- ✅ Tách Prisma queries xuống repositories
- ✅ Domain service layer cho business logic
- ✅ Saga pattern cho complex workflows
- ✅ BullMQ + Redis cho background jobs
- ✅ Event-driven architecture
- ✅ Clear separation of concerns

**Business Logic:**

- ✅ Existing words → Attach directly
- ✅ New words → Create draft, needs approval
- ✅ All operations atomic via transactions
