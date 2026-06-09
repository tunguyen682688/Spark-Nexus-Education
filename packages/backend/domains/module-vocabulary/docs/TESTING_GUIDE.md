# Testing Guide - Create Vocabulary Set

## 📋 Test Cases

### ✅ Test Case 1: Empty Vocabulary Set

**Input:**

```json
{
  "title": "My Vocabulary Set",
  "description": "A test vocabulary set",
  "language": "en",
  "type": "custom",
  "userId": "user-123",
  "initialWords": []
}
```

**Expected Flow:**

1. Handler receives command
2. Creates VocabularySetAggregate
3. Calls `createEmptySet()`
4. Repository creates set in database
5. `VocabularySetCreatedEvent` is published
6. Saga receives event and logs
7. Event Handler processes event
8. Returns response with empty set

**Expected Response:**

```json
{
  "id": "set-uuid",
  "title": "My Vocabulary Set",
  "entryCount": 0,
  "importStatus": "idle",
  ...
}
```

---

### ✅ Test Case 2: Small Batch (10 words, all existing)

**Input:**

```json
{
  "title": "Common Words",
  "language": "en",
  "type": "custom",
  "userId": "user-123",
  "initialWords": [
    { "word": "hello" },
    { "word": "world" },
    { "word": "test" },
    ...
  ]
}
```

**Expected Flow:**

1. Handler receives command
2. Creates VocabularySetAggregate
3. Calls `createSetWithWordsSync()` (≤50 words)
4. Orchestrator executes:
   - Step 1: Create Vocabulary Set
   - Step 2: Process Words (find all existing)
   - Step 3: No new entries to create
   - Step 4: Add items to aggregate
   - Step 5: Persist items (batch)
   - Step 6: Update entry count
5. Collect domain events
6. Publish events:
   - `VocabularySetCreatedEvent`
   - `EntryAddedToSetEvent` (for each word)
7. Saga receives events
8. Event Handlers process events
9. Returns response

**Expected Response:**

```json
{
  "id": "set-uuid",
  "title": "Common Words",
  "entryCount": 10,
  "importStatus": "idle",
  ...
}
```

**Expected Events:**

- 1x `VocabularySetCreatedEvent`
- 10x `EntryAddedToSetEvent`

---

### ✅ Test Case 3: Small Batch (10 words, 5 new)

**Input:**

```json
{
  "title": "Mixed Words",
  "language": "en",
  "type": "custom",
  "userId": "user-123",
  "initialWords": [
    { "word": "hello" }, // existing
    { "word": "world" }, // existing
    { "word": "newword1", "definition": "A new word" }, // new
    { "word": "newword2", "example": "Example sentence" }, // new
    ...
  ]
}
```

**Expected Flow:**

1. Handler → Orchestrator
2. Orchestrator:
   - Step 2: Process Words → finds 5 existing, 5 new
   - Step 3: Create 5 new entries (draft status)
   - Step 4: Add all 10 items to aggregate
   - Step 5: Persist everything
3. Publish events:
   - `VocabularySetCreatedEvent`
   - `EntryAddedToSetEvent` (10x)
   - `EntryCreatedEvent` (5x - for new entries)
4. Saga receives events
5. EntryCreatedHandler processes approval workflow

**Expected Response:**

```json
{
  "id": "set-uuid",
  "entryCount": 10,
  ...
}
```

**Expected Events:**

- 1x `VocabularySetCreatedEvent`
- 10x `EntryAddedToSetEvent`
- 5x `EntryCreatedEvent` (needs approval)

---

### ✅ Test Case 4: Large Batch (500 words)

**Input:**

```json
{
  "title": "Large Vocabulary Set",
  "language": "en",
  "type": "custom",
  "userId": "user-123",
  "initialWords": [
    { "word": "word1" },
    { "word": "word2" },
    ... // 500 words
  ]
}
```

**Expected Flow:**

1. Handler receives command
2. Creates VocabularySetAggregate
3. Calls `createSetWithWordsAsync()` (>50 words)
4. Creates set with `importStatus: "pending"`
5. Queues background job (BullMQ)
6. Returns response immediately
7. Background Job Processor:
   - Loads set
   - Processes in chunks (50 words/chunk = 10 chunks)
   - For each chunk:
     - Execute Orchestrator
     - Update progress
   - Mark as completed
8. Events published after each chunk

**Expected Response (Immediate):**

```json
{
  "id": "set-uuid",
  "entryCount": 0,
  "importStatus": "pending",
  "importProgress": {
    "total": 500,
    "processed": 0,
    "failed": 0
  },
  ...
}
```

**Expected Background Processing:**

- 10 chunks processed
- Progress updated: 50, 100, 150, ..., 500
- Final status: `"completed"`
- Final `entryCount`: 500

---

## 🔍 Verification Points

### 1. **Database State**

- ✅ VocabularySet created with correct data
- ✅ VocabularySetItems created (if words provided)
- ✅ Entries created (if new words)
- ✅ Entry count matches item count
- ✅ Transaction atomicity (all or nothing)

### 2. **Domain Events**

- ✅ `VocabularySetCreatedEvent` published
- ✅ `EntryAddedToSetEvent` published (for each word)
- ✅ `EntryCreatedEvent` published (for new entries)
- ✅ Events published after transaction commit

### 3. **Saga Processing**

- ✅ Saga receives `VocabularySetCreatedEvent`
- ✅ Saga receives `EntryCreatedEvent` (if new entries)
- ✅ Saga receives `EntryAddedToSetEvent`
- ✅ Saga logs correctly

### 4. **Event Handlers**

- ✅ `VocabularySetCreatedHandler` processes event
- ✅ `EntryCreatedHandler` processes event (if new entries)
- ✅ `EntryAddedToSetHandler` processes event

### 5. **Background Jobs** (Large batches)

- ✅ Job queued in BullMQ
- ✅ Job processed in chunks
- ✅ Progress updated correctly
- ✅ Status updated: pending → processing → completed

---

## 🧪 Test Commands

### Test Empty Set

```bash
curl -X POST http://localhost:3000/api/vocabulary-sets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Empty Set",
    "language": "en",
    "type": "custom",
    "userId": "user-123"
  }'
```

### Test Small Batch

```bash
curl -X POST http://localhost:3000/api/vocabulary-sets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Small Set",
    "language": "en",
    "type": "custom",
    "userId": "user-123",
    "initialWords": [
      {"word": "hello"},
      {"word": "world"}
    ]
  }'
```

### Test Large Batch

```bash
# Generate 500 words
words=$(for i in {1..500}; do echo "{\"word\": \"word$i\"}"; done | jq -s '.')

curl -X POST http://localhost:3000/api/vocabulary-sets \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Large Set\",
    \"language\": \"en\",
    \"type\": \"custom\",
    \"userId\": \"user-123\",
    \"initialWords\": $words
  }"
```

---

## ✅ Success Criteria

1. ✅ All test cases pass
2. ✅ No database inconsistencies
3. ✅ All events published correctly
4. ✅ Saga processes all events
5. ✅ Event handlers execute
6. ✅ Background jobs complete successfully
7. ✅ Progress tracking works
8. ✅ Error handling works (rollback on failure)

---

## 🐛 Common Issues & Solutions

### Issue 1: Events not published

**Solution:** Check that events are collected from aggregate and published after transaction commit

### Issue 2: Saga not receiving events

**Solution:** Verify Saga is registered in module and `@Saga()` decorator is correct

### Issue 3: Background job not processing

**Solution:** Check BullMQ configuration and Redis connection

### Issue 4: Transaction timeout

**Solution:** Increase timeout in orchestrator or reduce batch size

---

## 📊 Performance Benchmarks

| Scenario          | Expected Time | Notes                                     |
| ----------------- | ------------- | ----------------------------------------- |
| Empty Set         | < 100ms       | Simple create                             |
| 10 words (sync)   | < 500ms       | Small batch                               |
| 50 words (sync)   | < 2s          | Max sync threshold                        |
| 500 words (async) | < 5s          | Immediate response, background processing |
