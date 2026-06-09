# Advanced Query Parameters Structure

Tài liệu chi tiết về cấu trúc query parameters nâng cao cho search, filter, và sort.

## Tổng quan

Hệ thống query parameters hỗ trợ 3 cấp độ:

1. **Simple** - Key-value đơn giản (backward compatibility)
2. **Advanced** - Cấu trúc JSON với operators và nested logic
3. **Builder Pattern** - Type-safe builders trong code

## 1. Advanced Filters

### Cấu trúc Filter Condition

```typescript
interface BaseFilterCondition {
  field: string; // Tên field cần filter
  operator: FilterOperator; // Operator (eq, ne, gt, contains, etc.)
  value?: unknown; // Giá trị để so sánh
  value2?: unknown; // Giá trị thứ 2 (cho BETWEEN)
}

interface NestedFilterCondition {
  operator: 'and' | 'or' | 'not';
  conditions: FilterCondition[]; // Mảng các conditions con
}

type FilterCondition = BaseFilterCondition | NestedFilterCondition;
```

### Filter Operators

#### Comparison Operators

- `eq` - Equals (==)
- `ne` - Not equals (!=)
- `gt` - Greater than (>)
- `gte` - Greater than or equal (>=)
- `lt` - Less than (<)
- `lte` - Less than or equal (<=)

#### String Operators

- `contains` - Contains substring
- `startsWith` - Starts with
- `endsWith` - Ends with
- `regex` - Regular expression match

#### Array/Collection Operators

- `in` - In array
- `notIn` - Not in array
- `containsAll` - Array contains all elements
- `containsAny` - Array contains any element
- `isEmpty` - Is empty array/string
- `isNotEmpty` - Is not empty

#### Null Operators

- `isNull` - Is null
- `isNotNull` - Is not null

#### Date/Time Operators

- `between` - Between two values (cần value và value2)
- `before` - Before date
- `after` - After date

#### Logical Operators (Nested)

- `and` - Logical AND
- `or` - Logical OR
- `not` - Logical NOT

### Ví dụ Filters trong URL

#### Simple Filter (Key-Value)

```
GET /api/packages?language=en&difficulty=intermediate
```

#### Advanced Filter (JSON trong query string)

```
GET /api/packages?filters[0][field]=language&filters[0][operator]=eq&filters[0][value]=en
```

Hoặc dùng deepObject style:

```
GET /api/packages?filters[conditions][0][field]=language&filters[conditions][0][operator]=eq&filters[conditions][0][value]=en
```

#### Advanced Filter (JSON Body - POST/PUT)

```json
{
  "filters": [
    {
      "field": "language",
      "operator": "eq",
      "value": "en"
    },
    {
      "field": "difficulty",
      "operator": "in",
      "value": ["intermediate", "advanced"]
    },
    {
      "field": "createdAt",
      "operator": "gte",
      "value": "2024-01-01"
    }
  ]
}
```

### Nested Filters (AND/OR/NOT)

#### AND Logic

```json
{
  "filters": [
    {
      "operator": "and",
      "conditions": [
        { "field": "language", "operator": "eq", "value": "en" },
        { "field": "difficulty", "operator": "gte", "value": "intermediate" }
      ]
    }
  ]
}
```

#### OR Logic

```json
{
  "filters": [
    {
      "operator": "or",
      "conditions": [
        { "field": "status", "operator": "eq", "value": "published" },
        { "field": "status", "operator": "eq", "value": "draft" }
      ]
    }
  ]
}
```

#### Complex Nested Logic

```json
{
  "filters": [
    {
      "operator": "and",
      "conditions": [
        { "field": "language", "operator": "eq", "value": "en" },
        {
          "operator": "or",
          "conditions": [
            { "field": "difficulty", "operator": "eq", "value": "beginner" },
            { "field": "difficulty", "operator": "eq", "value": "intermediate" }
          ]
        },
        {
          "operator": "not",
          "conditions": [
            { "field": "deleted", "operator": "eq", "value": true }
          ]
        }
      ]
    }
  ]
}
```

**Logic tương đương SQL:**

```sql
WHERE language = 'en'
  AND (difficulty = 'beginner' OR difficulty = 'intermediate')
  AND NOT deleted = true
```

### Ví dụ với các Operators

#### String Search

```json
{
  "filters": [
    { "field": "title", "operator": "contains", "value": "IELTS" },
    { "field": "title", "operator": "startsWith", "value": "Academic" },
    { "field": "description", "operator": "regex", "value": "vocabulary|words" }
  ]
}
```

#### Array Operations

```json
{
  "filters": [
    { "field": "tags", "operator": "containsAny", "value": ["ielts", "toefl"] },
    {
      "field": "tags",
      "operator": "containsAll",
      "value": ["academic", "writing"]
    },
    { "field": "tags", "operator": "in", "value": ["ielts", "toefl", "gre"] }
  ]
}
```

#### Date Range

```json
{
  "filters": [
    {
      "field": "createdAt",
      "operator": "between",
      "value": "2024-01-01",
      "value2": "2024-12-31"
    },
    { "field": "updatedAt", "operator": "after", "value": "2024-06-01" }
  ]
}
```

#### Null Checks

```json
{
  "filters": [
    { "field": "deletedAt", "operator": "isNull" },
    { "field": "description", "operator": "isNotNull" }
  ]
}
```

## 2. Advanced Sorting

### Cấu trúc Sort Specification

```typescript
interface SortSpec {
  field: string; // Tên field để sort
  direction: 'asc' | 'desc'; // Hướng sort
  priority?: number; // Độ ưu tiên (cho multi-field sorting)
}
```

### Single Field Sort (Simple)

```
GET /api/packages?sortBy=createdAt&sortDirection=desc
```

### Multi-Field Sort (Advanced)

#### URL Format

```
GET /api/packages?sort[0][field]=createdAt&sort[0][direction]=desc&sort[0][priority]=1&sort[1][field]=title&sort[1][direction]=asc&sort[1][priority]=2
```

#### JSON Format

```json
{
  "sort": [
    { "field": "createdAt", "direction": "desc", "priority": 1 },
    { "field": "title", "direction": "asc", "priority": 2 },
    { "field": "updatedAt", "direction": "desc", "priority": 3 }
  ]
}
```

**Kết quả:** Sort theo `createdAt` DESC, sau đó `title` ASC, cuối cùng `updatedAt` DESC.

#### CSV Format (Alternative)

```
GET /api/packages?sort=createdAt:desc:1,title:asc:2,updatedAt:desc:3
```

Format: `field:direction:priority` (priority có thể bỏ qua, mặc định theo thứ tự)

## 3. Advanced Search

### Cấu trúc Search

```typescript
{
  search: string;           // Search query string
  searchFields?: string[];  // Fields để search (optional, nếu không có thì search tất cả)
}
```

### Single Field Search

```
GET /api/packages?search=IELTS&searchFields[0]=title
```

### Multi-Field Search

```
GET /api/packages?search=vocabulary&searchFields[0]=title&searchFields[1]=description&searchFields[2]=tags
```

#### JSON Format

```json
{
  "search": "IELTS vocabulary",
  "searchFields": ["title", "description", "tags"]
}
```

**Logic:** Tìm kiếm "IELTS vocabulary" trong các fields: title, description, tags (OR logic)

### Full-Text Search (All Fields)

```
GET /api/packages?search=academic%20words
```

Nếu không chỉ định `searchFields`, hệ thống sẽ search trong tất cả searchable fields.

## 4. Field Selection

### Cấu trúc Field Selection

```typescript
interface FieldSelection {
  include?: string[]; // Fields cần include (whitelist)
  exclude?: string[]; // Fields cần exclude (blacklist)
  relations?: string[]; // Relations cần include (joins)
}
```

### Include Fields (Whitelist)

```
GET /api/packages?fields[include][0]=id&fields[include][1]=title&fields[include][2]=language
```

Chỉ trả về các fields: id, title, language

### Exclude Fields (Blacklist)

```
GET /api/packages?fields[exclude][0]=internalNotes&fields[exclude][1]=deletedAt
```

Trả về tất cả fields trừ: internalNotes, deletedAt

### Include Relations

```
GET /api/packages?fields[relations][0]=creator&fields[relations][1]=items
```

Include relations: creator và items trong response

### JSON Format

```json
{
  "fields": {
    "include": ["id", "title", "language", "difficulty"],
    "exclude": ["internalNotes", "deletedAt"],
    "relations": ["creator", "items", "tags"]
  }
}
```

## 5. Complete Query Example

### URL với tất cả parameters

```
GET /api/packages?
  limit=20&
  offset=0&
  filters[0][field]=language&
  filters[0][operator]=eq&
  filters[0][value]=en&
  filters[1][field]=difficulty&
  filters[1][operator]=in&
  filters[1][value][0]=intermediate&
  filters[1][value][1]=advanced&
  sort[0][field]=createdAt&
  sort[0][direction]=desc&
  sort[0][priority]=1&
  sort[1][field]=title&
  sort[1][direction]=asc&
  sort[1][priority]=2&
  search=IELTS&
  searchFields[0]=title&
  searchFields[1]=description&
  fields[include][0]=id&
  fields[include][1]=title&
  fields[include][2]=language&
  fields[relations][0]=creator
```

### JSON Body (POST/PUT)

```json
{
  "limit": 20,
  "offset": 0,
  "filters": [
    {
      "field": "language",
      "operator": "eq",
      "value": "en"
    },
    {
      "field": "difficulty",
      "operator": "in",
      "value": ["intermediate", "advanced"]
    },
    {
      "operator": "and",
      "conditions": [
        { "field": "createdAt", "operator": "gte", "value": "2024-01-01" },
        { "field": "status", "operator": "eq", "value": "published" }
      ]
    }
  ],
  "sort": [
    { "field": "createdAt", "direction": "desc", "priority": 1 },
    { "field": "title", "direction": "asc", "priority": 2 }
  ],
  "search": "IELTS vocabulary",
  "searchFields": ["title", "description"],
  "fields": {
    "include": ["id", "title", "language", "difficulty"],
    "relations": ["creator"]
  },
  "metadata": {
    "includeCount": true,
    "includeMetadata": true
  }
}
```

## 6. Sử dụng trong Code

### Filter Builder

```typescript
import { createFilterBuilder } from '@spark-nest-ed/shared-libs';

const filters = createFilterBuilder()
  .eq('language', 'en')
  .in('difficulty', ['intermediate', 'advanced'])
  .gte('createdAt', '2024-01-01')
  .contains('title', 'IELTS')
  .and([
    { field: 'status', operator: 'eq', value: 'published' },
    { field: 'public', operator: 'eq', value: true },
  ])
  .build();
```

### Sort Builder

```typescript
import { createSortBuilder } from '@spark-nest-ed/shared-libs';

const sorts = createSortBuilder()
  .desc('createdAt', 1)
  .asc('title', 2)
  .desc('updatedAt', 3)
  .build();
```

### Query Builder (All-in-one)

```typescript
import { createQueryBuilder } from '@spark-nest-ed/shared-libs';

const queryParams = createQueryBuilder()
  .addFilters([
    { field: 'language', operator: 'eq', value: 'en' },
    { field: 'difficulty', operator: 'in', value: ['intermediate'] },
  ])
  .addSorts([{ field: 'createdAt', direction: 'desc', priority: 1 }])
  .setSearch('IELTS', ['title', 'description'])
  .setOffset(20, 0)
  .setFields({
    include: ['id', 'title', 'language'],
    relations: ['creator'],
  })
  .build();
```

## 7. Parsing từ Query String

### Tự động parse từ URL

```typescript
import { createQueryParamsFromObject } from '@spark-nest-ed/shared-libs';

// Từ Express Request
const queryParams = createQueryParamsFromObject(req.query);

// Từ query string
const queryParams = createQueryParamsFromObject({
  'filters[0][field]': 'language',
  'filters[0][operator]': 'eq',
  'filters[0][value]': 'en',
  'sort[0][field]': 'createdAt',
  'sort[0][direction]': 'desc',
  limit: '20',
  offset: '0',
});
```

## 8. Validation

### Validate Query Params

```typescript
import { validateQueryParams } from '@spark-nest-ed/shared-libs';

const validated = validateQueryParams(queryParams, {
  maxLimit: 100,
  defaultLimit: 20,
  allowedSortFields: ['createdAt', 'title', 'updatedAt'],
  allowedFilterFields: ['language', 'difficulty', 'status'],
});
```

## 9. Best Practices

### 1. Sử dụng Simple Filters cho cases đơn giản

```
?language=en&difficulty=intermediate
```

### 2. Sử dụng Advanced Filters cho logic phức tạp

```json
{
  "filters": [
    {
      "operator": "and",
      "conditions": [
        { "field": "language", "operator": "eq", "value": "en" },
        {
          "field": "difficulty",
          "operator": "in",
          "value": ["intermediate", "advanced"]
        }
      ]
    }
  ]
}
```

### 3. Multi-field sort với priority

```json
{
  "sort": [
    { "field": "createdAt", "direction": "desc", "priority": 1 },
    { "field": "title", "direction": "asc", "priority": 2 }
  ]
}
```

### 4. Search với specific fields

```json
{
  "search": "IELTS",
  "searchFields": ["title", "description"]
}
```

### 5. Field selection để optimize response size

```json
{
  "fields": {
    "include": ["id", "title", "language"],
    "relations": ["creator"]
  }
}
```

## 10. Swagger Documentation

### Sử dụng decorators để document

```typescript
import {
  ApiFiltersQuery,
  ApiSortQueries,
  ApiSearchQuery,
  ApiFieldsQuery,
} from '@spark-nest-ed/shared-libs';

@Get()
@ApiFiltersQuery({
  allowedFields: ['language', 'difficulty', 'status'],
  description: 'Advanced filters with operators',
  example: {
    conditions: [
      { field: 'language', operator: 'eq', value: 'en' },
      { field: 'difficulty', operator: 'in', value: ['intermediate'] }
    ]
  }
})
@ApiSortQueries({
  description: 'Multi-field sorting',
  example: ['createdAt:desc:1', 'title:asc:2']
})
@ApiSearchQuery({
  paramName: 'search',
  description: 'Full-text search',
  example: 'IELTS vocabulary'
})
@ApiFieldsQuery({
  description: 'Field selection',
  includeExample: ['id', 'title', 'language'],
  relationsExample: ['creator', 'items']
})
async getUserSets(@Query() query: any) {
  // ...
}
```

## 11. Performance Considerations

1. **Index các fields thường được filter/sort**
2. **Limit số lượng filters phức tạp** (nested filters có thể chậm)
3. **Sử dụng field selection** để giảm response size
4. **Cache kết quả** cho các queries phổ biến
5. **Validate và sanitize** input để tránh injection

## 12. Error Handling

### Invalid Operator

```json
{
  "errors": [
    {
      "status": "400",
      "code": "INVALID_FILTER_OPERATOR",
      "detail": "Operator 'invalidOp' is not supported",
      "source": { "pointer": "/filters/0/operator" }
    }
  ]
}
```

### Invalid Field

```json
{
  "errors": [
    {
      "status": "400",
      "code": "INVALID_FILTER_FIELD",
      "detail": "Field 'invalidField' is not allowed",
      "source": { "pointer": "/filters/0/field" }
    }
  ]
}
```

### Invalid Sort Field

```json
{
  "errors": [
    {
      "status": "400",
      "code": "INVALID_SORT_FIELD",
      "detail": "Field 'invalidField' cannot be used for sorting",
      "source": { "pointer": "/sort/0/field" }
    }
  ]
}
```
