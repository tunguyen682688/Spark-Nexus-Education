# Aggregate Design - Vocabulary Domain

## 📋 Tổng quan

Tài liệu này mô tả thiết kế các Aggregate và AggregateRoot trong Vocabulary Domain, tuân thủ nguyên tắc DDD (Domain-Driven Design).

## 🎯 Nguyên tắc Aggregate Design

### Quy tắc cơ bản:

1. **Aggregate Root** là entry point duy nhất để truy cập aggregate từ bên ngoài
2. **Consistency Boundary**: Tất cả entities trong một aggregate phải consistent với nhau
3. **Transaction Boundary**: Một transaction chỉ nên cập nhật một aggregate
4. **Reference by ID**: Aggregates chỉ reference nhau qua ID, không phải object reference

## 📦 Các Aggregate trong Vocabulary Domain

### 1. VocabularySet Aggregate

**Aggregate Root:** `VocabularySetEntity`

**Child Entities:**

- `VocabularySetItemEntity` - Items trong set
- `VocabularySetHistoryEntity` - Lịch sử học tập

**Junction Tables (Reference by ID):**

- `UserVocabularySetFavorite` - Favorites (có thể là aggregate riêng nếu cần)

**Lý do là Aggregate Root:**

- ✅ Quản lý một tập hợp từ vựng hoàn chỉnh
- ✅ Có business logic phức tạp (publish, import, validation)
- ✅ Cần đảm bảo consistency giữa set và items
- ✅ Có domain events (created, updated, published, deleted)

**Business Rules:**

- Set phải có title không rỗng
- Public sets cần description và tags
- Set phải có ít nhất 10 từ để publish
- Chỉ owner mới có thể modify private sets

**Helper Aggregate:** `VocabularySetAggregate`

- Quản lý việc tạo set cùng với initial items
- Đảm bảo atomicity khi tạo set + items

---

### 2. Entry Aggregate

**Aggregate Root:** `EntryEntity` (đã chuyển từ Entity sang AggregateRoot)

**Child Entities:**

- `SenseEntity` - Các nghĩa/định nghĩa của từ
- `ExampleEntity` - Các ví dụ sử dụng
- `ExpressionEntity` - Các cụm từ/idiom
- `ExpressionMeaningEntity` - Nghĩa của expression
- `LexicalVariantEntity` - Các biến thể từ (plural, different spelling)

**Lý do là Aggregate Root:**

- ✅ Quản lý một từ điển entry hoàn chỉnh với tất cả metadata
- ✅ Có business logic (publish, uniqueness validation)
- ✅ Cần đảm bảo consistency giữa entry và các child entities
- ✅ Entry word phải unique per language
- ✅ Published entry phải có ít nhất một sense

**Business Rules:**

- Word phải unique per language
- Published entry phải có ít nhất một sense
- Entry có thể có nhiều senses, examples, expressions

**Helper Aggregate:** `EntryAggregate`

- Quản lý việc tạo entry cùng với senses, examples
- Đảm bảo consistency khi thêm/xóa child entities
- Validate business rules (canBePublished)

---

### 3. UserLearningProgress Aggregate

**Aggregate Root:** `UserVocabularyProgressEntity`

**Related Entity (Reference by ID):**

- `VocabularySetItemEntity` - Item đang được học (reference, không phải child)

**Lý do là Aggregate Root:**

- ✅ Quản lý learning state độc lập cho mỗi user-item pair
- ✅ Có business logic phức tạp (SRS algorithm - SM-2)
- ✅ Cần đảm bảo consistency của SRS parameters
- ✅ Có lifecycle riêng (NEW -> LEARNING -> MASTERED)
- ✅ Có thể được truy cập và cập nhật độc lập

**Business Rules:**

- Progress unique per user per item
- SRS algorithm (SM-2) phải maintain consistency
- Status transitions: NEW -> LEARNING -> MASTERED
- Mastered items có thể reset về NEW

**Helper Aggregate:** `UserLearningProgressAggregate`

- Encapsulates SRS algorithm logic
- Manages review recording và next review calculation
- Provides helper methods (isDueForReview, getDaysUntilReview)

---

### 4. Tag Aggregate (Optional - Simple Value Object)

**Aggregate Root:** `TagEntity`

**Lý do có thể là Aggregate Root:**

- ✅ Tag có thể được quản lý độc lập
- ✅ Có business rule (unique name)
- ✅ Có thể được tạo và sử dụng bởi nhiều users

**Tuy nhiên:**

- Tag là một simple entity, không có child entities
- Có thể được quản lý như một Value Object hoặc simple entity
- Junction table `VocabularySetItemTag` chỉ là reference

**Quyết định:** Tag có thể là Aggregate Root nếu cần quản lý phức tạp (statistics, moderation), nhưng hiện tại có thể là simple entity.

---

## 🔄 Aggregate Relationships

### Reference Pattern (Between Aggregates):

```
VocabularySet (Aggregate Root)
  └─> VocabularySetItem (Child Entity)
       └─> Entry (Aggregate Root) [Reference by ID]
            └─> Sense, Example, Expression (Child Entities)

UserVocabularyProgress (Aggregate Root)
  └─> VocabularySetItem [Reference by ID]
       └─> VocabularySet (Aggregate Root) [Reference by ID]
```

### Key Points:

1. **VocabularySetItem** reference **Entry** by ID (không phải object)
2. **UserVocabularyProgress** reference **VocabularySetItem** by ID
3. **Entry** là independent aggregate, có thể tồn tại độc lập
4. Aggregates không trực tiếp reference nhau, chỉ qua ID

---

## 📊 Aggregate Boundaries Diagram

```
┌─────────────────────────────────────────────────┐
│         VocabularySet Aggregate                  │
│  ┌──────────────────────────────────────────┐   │
│  │ VocabularySetEntity (Aggregate Root)      │   │
│  └──────────────────────────────────────────┘   │
│           │                                       │
│           ├─> VocabularySetItemEntity (Child)      │
│           │   └─> Entry ID (Reference)            │
│           │                                       │
│           └─> VocabularySetHistoryEntity (Child)  │
└─────────────────────────────────────────────────┘
                    │
                    │ (Reference by ID)
                    ▼
┌─────────────────────────────────────────────────┐
│            Entry Aggregate                      │
│  ┌──────────────────────────────────────────┐   │
│  │ EntryEntity (Aggregate Root)              │   │
│  └──────────────────────────────────────────┘   │
│           │                                       │
│           ├─> SenseEntity (Child)                 │
│           ├─> ExampleEntity (Child)               │
│           ├─> ExpressionEntity (Child)            │
│           │   └─> ExpressionMeaningEntity (Child) │
│           └─> LexicalVariantEntity (Child)        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│      UserLearningProgress Aggregate             │
│  ┌──────────────────────────────────────────┐   │
│  │ UserVocabularyProgressEntity (Root)      │   │
│  └──────────────────────────────────────────┘   │
│           │                                       │
│           └─> VocabularySetItem ID (Reference)   │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Use Cases và Aggregate Usage

### UC-VOC-001: Create Vocabulary Set

- **Aggregate:** `VocabularySetAggregate`
- **Root:** `VocabularySetEntity`
- **Action:** Tạo set + initial items (atomic)

### UC-VOC-011: Add Word to Set

- **Aggregates:**
  - `VocabularySetAggregate` (để thêm item)
  - `EntryAggregate` (để tạo entry nếu chưa có)
- **Transaction:** Có thể cần 2 transactions riêng biệt

### UC-VOC-8: Learn with Flashcard (SRS Review)

- **Aggregate:** `UserLearningProgressAggregate`
- **Root:** `UserVocabularyProgressEntity`
- **Action:** Record review, update SRS parameters

### UC-VOC-7: Get Review Queue

- **Aggregate:** `UserVocabularyProgressAggregate` (multiple instances)
- **Query:** Lấy tất cả progress có `nextReviewAt <= NOW()`

---

## 🔐 Consistency Rules

### Within Aggregate (Strong Consistency):

1. **VocabularySet:** Set và items phải consistent (entryCount phải match số items)
2. **Entry:** Entry và senses phải consistent (published entry phải có sense)
3. **UserLearningProgress:** Progress và SRS parameters phải consistent

### Between Aggregates (Eventual Consistency):

1. **VocabularySetItem** reference **Entry** - Nếu Entry bị xóa, Item sẽ bị cascade delete (database level)
2. **UserVocabularyProgress** reference **VocabularySetItem** - Nếu Item bị xóa, Progress sẽ bị cascade delete
3. Các thay đổi giữa aggregates được đồng bộ qua Domain Events

---

## 🚀 Best Practices

1. **Always load Aggregate Root** - Không load child entities trực tiếp
2. **One transaction per aggregate** - Tránh cross-aggregate transactions
3. **Use Domain Events** - Để đồng bộ giữa aggregates
4. **Reference by ID** - Aggregates không nên có object references
5. **Aggregate Helpers** - Sử dụng helper classes cho complex operations

---

## 📝 Summary

| Aggregate            | Root Entity                  | Child Entities                             | Key Business Logic                    |
| -------------------- | ---------------------------- | ------------------------------------------ | ------------------------------------- |
| VocabularySet        | VocabularySetEntity          | VocabularySetItem, VocabularySetHistory    | Publish validation, Import management |
| Entry                | EntryEntity                  | Sense, Example, Expression, LexicalVariant | Publish validation, Uniqueness        |
| UserLearningProgress | UserVocabularyProgressEntity | (none)                                     | SRS algorithm, Learning lifecycle     |

**Total Aggregates: 3**

- VocabularySet Aggregate (với helper)
- Entry Aggregate (với helper)
- UserLearningProgress Aggregate (với helper)
