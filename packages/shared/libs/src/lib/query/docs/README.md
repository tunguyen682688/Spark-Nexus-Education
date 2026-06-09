# Advanced Query Parameter System

Hệ thống query parameters nâng cao, type-safe và đầy đủ tính năng cho các ứng dụng enterprise.

## Tính năng

- ✅ **Type-safe**: Hoàn toàn type-safe với TypeScript
- ✅ **Filtering nâng cao**: Hỗ trợ nhiều operators (eq, ne, gt, gte, lt, lte, contains, in, between, etc.)
- ✅ **Nested filters**: Hỗ trợ AND, OR, NOT logic
- ✅ **Multi-field sorting**: Sắp xếp theo nhiều trường với priority
- ✅ **Pagination đa dạng**: Offset-based, cursor-based, và page-based
- ✅ **Field selection**: Chọn fields cần trả về
- ✅ **Search**: Tìm kiếm full-text với nhiều fields
- ✅ **Transformers**: Chuyển đổi sang Prisma, TypeORM, SQL
- ✅ **Validation**: DTOs với class-validator
- ✅ **Builder pattern**: API dễ sử dụng với builder pattern

## Cài đặt

Hệ thống này đã được tích hợp vào `@sparknexused/libs`. Để sử dụng DTOs với validation, bạn cần cài đặt:

```bash
npm install class-validator class-transformer
```

## Sử dụng cơ bản

### 1. Filter Builder

```typescript
import { createFilterBuilder } from '@sparknexused/libs';

const filters = createFilterBuilder()
  .eq('status', 'active')
  .gt('createdAt', '2024-01-01')
  .in('category', ['tech', 'science'])
  .contains('title', 'typescript')
  .build();
```

### 2. Sort Builder

```typescript
import { createSortBuilder } from '@sparknexused/libs';

const sorts = createSortBuilder().desc('createdAt', 1).asc('title', 2).build();
```

### 3. Pagination Builder

```typescript
import { createPaginationBuilder, PaginationMode } from '@sparknexused/libs';

// Offset-based
const offsetPagination = createPaginationBuilder().offset(20, 0).build();

// Cursor-based
const cursorPagination = createPaginationBuilder()
  .cursor(20, 'cursor-id-123')
  .build();

// Page-based
const pagePagination = createPaginationBuilder().page(1, 20).build();
```

### 4. Query Builder (Tất cả trong một)

```typescript
import { createQueryBuilder } from '@sparknexused/libs';

const query = createQueryBuilder({
  maxLimit: 100,
  defaultLimit: 20,
})
  .addFilters([createFilterBuilder().eq('status', 'active').build()[0]])
  .addSorts([{ field: 'createdAt', direction: SortDirection.DESC }])
  .setOffset(20, 0)
  .setSearch('typescript', ['title', 'description'])
  .build();
```

## Sử dụng với NestJS

### 1. Controller với DTO

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { AdvancedQueryDto } from '@sparknexused/libs';

@Controller('vocabulary-sets')
export class VocabularySetController {
  @Get()
  async findAll(@Query() query: AdvancedQueryDto) {
    // query đã được validate tự động
    // Sử dụng query.filters, query.sort, query.pagination, etc.
  }
}
```

### 2. Transform sang Prisma

```typescript
import {
  toPrismaWhere,
  toPrismaOrderBy,
  toPrismaPagination,
} from '@sparknexused/libs';

const where = toPrismaWhere(query.filters || []);
const orderBy = toPrismaOrderBy(query.sort || []);
const pagination = toPrismaPagination(query.pagination);

const results = await prisma.vocabularySet.findMany({
  where,
  orderBy,
  ...pagination,
});
```

## Advanced Filtering

### Nested Filters (AND/OR/NOT)

```typescript
const filters = createFilterBuilder()
  .and([
    createFilterBuilder().eq('status', 'active').build()[0],
    createFilterBuilder().gt('createdAt', '2024-01-01').build()[0],
  ])
  .or([
    createFilterBuilder().eq('category', 'tech').build()[0],
    createFilterBuilder().eq('category', 'science').build()[0],
  ])
  .build();
```

### Date Range

```typescript
const filters = createFilterBuilder()
  .between('createdAt', '2024-01-01', '2024-12-31')
  .build();
```

### String Operations

```typescript
const filters = createFilterBuilder()
  .contains('title', 'typescript')
  .startsWith('code', 'TS')
  .endsWith('extension', '.ts')
  .regex('description', 'pattern')
  .build();
```

### Null Checks

```typescript
const filters = createFilterBuilder()
  .isNotNull('deletedAt')
  .isNull('archivedAt')
  .build();
```

## Operators Reference

### Comparison Operators

- `eq`: Equals
- `ne`: Not equals
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal

### String Operators

- `contains`: Contains substring
- `startsWith`: Starts with
- `endsWith`: Ends with
- `regex`: Regular expression match

### Array/Collection Operators

- `in`: In array
- `notIn`: Not in array
- `containsAll`: Contains all elements
- `containsAny`: Contains any element
- `isEmpty`: Is empty
- `isNotEmpty`: Is not empty

### Null/Undefined Operators

- `isNull`: Is null
- `isNotNull`: Is not null

### Date/Time Operators

- `between`: Between two values
- `before`: Before date
- `after`: After date

### Logical Operators

- `and`: Logical AND
- `or`: Logical OR
- `not`: Logical NOT

## Transformers

### Prisma

```typescript
import {
  toPrismaWhere,
  toPrismaOrderBy,
  toPrismaPagination,
} from '@sparknexused/libs';

const where = toPrismaWhere(filters);
const orderBy = toPrismaOrderBy(sorts);
const pagination = toPrismaPagination(paginationConfig);
```

### TypeORM

```typescript
import { toTypeORMFindOptions } from '@sparknexused/libs';

const options = toTypeORMFindOptions(filters, sorts, pagination);
```

### SQL

```typescript
import { toSQLWhere } from '@sparknexused/libs';

const { sql, params } = toSQLWhere(filters, 't');
// sql: "t.status = $1 AND t.createdAt > $2"
// params: ['active', '2024-01-01']
```

## Best Practices

1. **Sử dụng builders**: Luôn sử dụng builder pattern để tạo queries type-safe
2. **Validate input**: Sử dụng DTOs với class-validator để validate query parameters
3. **Limit pagination**: Luôn set maxLimit để tránh queries quá lớn
4. **Index fields**: Đảm bảo các fields được filter/sort có index trong database
5. **Transform properly**: Sử dụng transformers phù hợp với ORM của bạn

## Migration từ hệ thống cũ

Hệ thống mới tương thích ngược với hệ thống cũ:

```typescript
// Cũ
interface OldQuery {
  limit?: number;
  offset?: number;
  sortBy?: string;
  // ...
}

// Mới - vẫn hỗ trợ
interface QueryParams {
  limit?: number; // Vẫn hoạt động
  offset?: number; // Vẫn hoạt động
  sortBy?: string; // Vẫn hoạt động
  // + thêm nhiều tính năng mới
  filters?: FilterCondition[];
  sort?: SortSpec[];
  pagination?: PaginationConfig;
}
```

## Response Formatting (JSON:API Compliant)

### Format Paginated Response

```typescript
import {
  executePrismaQuery,
  convertPaginatedResultToJsonApi
} from '@sparknexused/libs';

@Get()
async getUserSets(@Query() query: any, @Req() req: Request) {
  const params = createQueryParamsFromObject(query);
  const result = await executePrismaQuery(
    this.prisma.vocabularySet,
    params,
    { includeCount: true }
  );

  // JSON:API format with pagination links
  const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
  return convertPaginatedResultToJsonApi(
    result,
    'vocabulary-set',
    baseUrl,
    { message: 'Sets retrieved successfully', version: '1.0.0' }
  );
}
```

### Format Success Response

```typescript
import { convertEntityToJsonApi } from '@sparknexused/libs';

@Get(':id')
async getSet(@Param('id') id: string, @Req() req: Request) {
  const set = await this.prisma.vocabularySet.findUnique({ where: { id } });

  const selfLink = `${req.protocol}://${req.get('host')}${req.path}`;
  return convertEntityToJsonApi(
    set,
    'vocabulary-set',
    { selfLink, message: 'Set retrieved successfully', version: '1.0.0' }
  );
}
```

### Format Error Response

```typescript
import { formatErrorResponse, createErrorSource } from '@sparknexused/libs';
import { NotFoundException } from '@nestjs/common';

@Get(':id')
async getSet(@Param('id') id: string) {
  const set = await this.prisma.vocabularySet.findUnique({ where: { id } });

  if (!set) {
    throw new NotFoundException(
      formatErrorResponse([
        {
          status: '404',
          code: 'NOT_FOUND',
          title: 'Resource Not Found',
          detail: 'Set not found',
          source: createErrorSource('/data/id')
        }
      ], { version: '1.0.0' })
    );
  }

  return convertEntityToJsonApi(set, 'vocabulary-set');
}
```

## Utility Types & Helpers

### Type Guards

```typescript
import {
  isSuccessResponse,
  isPaginatedResponse,
  isErrorResponse,
} from '@sparknexused/libs';

if (isSuccessResponse(response)) {
  // TypeScript knows response is SuccessResponse
  console.log(response.data.attributes);
}
```

### Pagination Helpers

```typescript
import {
  calculatePaginationMeta,
  createJsonApiPaginatedResponseFromOffset,
} from '@sparknexused/libs';

// Calculate pagination from offset/limit
const pagination = calculatePaginationMeta(20, 10, 100);
// { page: 3, limit: 10, total: 100, totalPages: 10 }

// Or use convenience function
const response = createJsonApiPaginatedResponseFromOffset(
  items,
  total,
  'vocabulary-set',
  baseUrl,
  offset,
  limit,
  { message: 'Items retrieved successfully', version: '1.0.0' }
);
```

### Request Helpers (NestJS)

```typescript
import { getBaseUrlFromRequest, getSelfLinkFromRequest } from '@sparknexused/libs';

@Get()
async getUsers(@Req() req: Request) {
  const baseUrl = getBaseUrlFromRequest(req);
  // Instead of: `${req.protocol}://${req.get('host')}${req.path}`
}

@Get(':id')
async getUser(@Param('id') id: string, @Req() req: Request) {
  const selfLink = getSelfLinkFromRequest(req, id);
  // Instead of: `${req.protocol}://${req.get('host')}${req.path}/${id}`
}
```

Xem thêm chi tiết trong [UTILITY_TYPES.md](./UTILITY_TYPES.md)

### Response Format

**Paginated Response:**

```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasMore": true,
      "hasPrevious": false
    }
  },
  "links": {
    "first": "/api/packages?limit=20&offset=0",
    "next": "/api/packages?limit=20&offset=20",
    "last": "/api/packages?limit=20&offset=80"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Simple Response:**

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Advanced Query Parameters

Xem chi tiết về cấu trúc query parameters nâng cao trong [ADVANCED_QUERY_PARAMS.md](./ADVANCED_QUERY_PARAMS.md):

- **Advanced Filters**: Operators, nested logic (AND/OR/NOT)
- **Multi-field Sorting**: Sort theo nhiều fields với priority
- **Advanced Search**: Search với multiple fields
- **Field Selection**: Include/exclude fields và relations

### Quick Example

```typescript
// Advanced filters với nested logic
const filters = [
  {
    operator: 'and',
    conditions: [
      { field: 'language', operator: 'eq', value: 'en' },
      {
        field: 'difficulty',
        operator: 'in',
        value: ['intermediate', 'advanced'],
      },
      {
        operator: 'or',
        conditions: [
          { field: 'status', operator: 'eq', value: 'published' },
          { field: 'public', operator: 'eq', value: true },
        ],
      },
    ],
  },
];

// Multi-field sorting
const sort = [
  { field: 'createdAt', direction: 'desc', priority: 1 },
  { field: 'title', direction: 'asc', priority: 2 },
];

// Search với multiple fields
const search = {
  search: 'IELTS vocabulary',
  searchFields: ['title', 'description', 'tags'],
};
```

## Examples

Xem thêm examples trong:

- `examples/examples.ts` - Basic usage examples
- `examples/nestjs-example.ts` - NestJS controller examples
- `examples/controller-examples.ts` - Response formatting examples
- `docs/ADVANCED_QUERY_PARAMS.md` - Advanced query parameters structure

## License

Internal use only.
