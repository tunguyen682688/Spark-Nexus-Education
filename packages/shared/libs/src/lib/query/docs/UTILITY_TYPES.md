# JSON:API Utility Types & Helpers

Tài liệu về các utility types và helper functions để làm việc với JSON:API dễ dàng và type-safe hơn.

## Utility Types

### JsonApiResponse

Union type cho tất cả các response types:

```typescript
import type { JsonApiResponse } from '@spark-nest-ed/shared-libs';

function handleResponse(response: JsonApiResponse) {
  if (isSuccessResponse(response)) {
    // TypeScript knows this is SuccessResponse
    console.log(response.data.attributes);
  } else if (isPaginatedResponse(response)) {
    // TypeScript knows this is PaginatedResponse
    console.log(response.data.length);
  } else {
    // TypeScript knows this is ErrorResponse
    console.log(response.errors);
  }
}
```

### ExtractAttributes

Extract attributes type từ ResourceObject:

```typescript
import type {
  ExtractAttributes,
  ResourceObject,
} from '@spark-nest-ed/shared-libs';

type UserAttributes = ExtractAttributes<
  ResourceObject<{ name: string; email: string }>
>;
// UserAttributes = { name: string; email: string }
```

### ExtractResponseAttributes

Extract attributes type từ SuccessResponse:

```typescript
import type {
  ExtractResponseAttributes,
  SuccessResponse,
} from '@spark-nest-ed/shared-libs';

type UserResponse = SuccessResponse<{ name: string; email: string }>;
type UserAttributes = ExtractResponseAttributes<UserResponse>;
// UserAttributes = { name: string; email: string }
```

## Type Guards

### isSuccessResponse

Kiểm tra nếu response là SuccessResponse:

```typescript
import { isSuccessResponse } from '@spark-nest-ed/shared-libs';

if (isSuccessResponse(response)) {
  // TypeScript knows response is SuccessResponse
  const user = response.data.attributes;
}
```

### isPaginatedResponse

Kiểm tra nếu response là PaginatedResponse:

```typescript
import { isPaginatedResponse } from '@spark-nest-ed/shared-libs';

if (isPaginatedResponse(response)) {
  // TypeScript knows response is PaginatedResponse
  const users = response.data;
}
```

### isErrorResponse

Kiểm tra nếu response là ErrorResponse:

```typescript
import { isErrorResponse } from '@spark-nest-ed/shared-libs';

if (isErrorResponse(response)) {
  // TypeScript knows response is ErrorResponse
  const errors = response.errors;
}
```

## Helper Functions

### calculatePaginationMeta

Tính toán pagination metadata từ offset/limit:

```typescript
import { calculatePaginationMeta } from '@spark-nest-ed/shared-libs';

const pagination = calculatePaginationMeta(20, 10, 100);
// { page: 3, limit: 10, total: 100, totalPages: 10 }
```

### calculatePaginationMetaFromPage

Tính toán pagination metadata từ page/pageSize:

```typescript
import { calculatePaginationMetaFromPage } from '@spark-nest-ed/shared-libs';

const pagination = calculatePaginationMetaFromPage(2, 20, 100);
// { page: 2, limit: 20, total: 100, totalPages: 5 }
```

### createBaseUrl

Tạo base URL từ Request object:

```typescript
import { createBaseUrl } from '@spark-nest-ed/shared-libs';

const baseUrl = createBaseUrl(req);
// "https://api.example.com/api/v1/users"
```

### createSelfLink

Tạo self link cho resource:

```typescript
import { createSelfLink } from '@spark-nest-ed/shared-libs';

const selfLink = createSelfLink(baseUrl, userId);
// "https://api.example.com/api/v1/users/123"
```

### getBaseUrlFromRequest (NestJS)

Convenience wrapper cho NestJS:

```typescript
import { getBaseUrlFromRequest } from '@spark-nest-ed/shared-libs';

@Get()
async getUsers(@Req() req: Request) {
  const baseUrl = getBaseUrlFromRequest(req);
  // ...
}
```

### getSelfLinkFromRequest (NestJS)

Tạo self link từ Request:

```typescript
import { getSelfLinkFromRequest } from '@spark-nest-ed/shared-libs';

@Get(':id')
async getUser(@Param('id') id: string, @Req() req: Request) {
  const selfLink = getSelfLinkFromRequest(req, id);
  // ...
}
```

## Validation Helpers

### isValidResourceObject

Validate ResourceObject structure:

```typescript
import { isValidResourceObject } from '@spark-nest-ed/shared-libs';

if (isValidResourceObject(data)) {
  // data is ResourceObject
  console.log(data.id, data.type, data.attributes);
}
```

### isValidSuccessResponse

Validate SuccessResponse structure:

```typescript
import { isValidSuccessResponse } from '@spark-nest-ed/shared-libs';

if (isValidSuccessResponse(response)) {
  // response is SuccessResponse
  console.log(response.data);
}
```

### isValidPaginatedResponse

Validate PaginatedResponse structure:

```typescript
import { isValidPaginatedResponse } from '@spark-nest-ed/shared-libs';

if (isValidPaginatedResponse(response)) {
  // response is PaginatedResponse
  console.log(response.data.length);
}
```

### isValidErrorResponse

Validate ErrorResponse structure:

```typescript
import { isValidErrorResponse } from '@spark-nest-ed/shared-libs';

if (isValidErrorResponse(response)) {
  // response is ErrorResponse
  console.log(response.errors);
}
```

## Resource Types

### ResourceTypes

Predefined resource type constants:

```typescript
import { ResourceTypes } from '@spark-nest-ed/shared-libs';

const type = ResourceTypes.VOCABULARY_SET; // 'vocabulary-set'
const entryType = ResourceTypes.VOCABULARY_ENTRY; // 'vocabulary-entry'
```

### createResourceType

Type-safe resource type creation:

```typescript
import { createResourceType } from '@spark-nest-ed/shared-libs';

const myType = createResourceType('my-custom-type');
// TypeScript ensures type safety
```

## Convenience Functions

### createJsonApiPaginatedResponseFromOffset

Tạo paginated response từ offset/limit (tự động tính page):

```typescript
import { createJsonApiPaginatedResponseFromOffset } from '@spark-nest-ed/shared-libs';

const response = createJsonApiPaginatedResponseFromOffset(
  items,
  total,
  'vocabulary-set',
  baseUrl,
  offset, // 20
  limit, // 10
  { message: 'Items retrieved successfully', version: '1.0.0' }
);
// Automatically calculates: page = 3, totalPages = 10
```

## Best Practices

1. **Sử dụng type guards** để type narrowing:

```typescript
if (isSuccessResponse(response)) {
  // TypeScript knows response is SuccessResponse
}
```

2. **Sử dụng helper functions** thay vì tính toán thủ công:

```typescript
// ❌ Bad
const page = Math.floor(offset / limit) + 1;
const totalPages = Math.ceil(total / limit);

// ✅ Good
const pagination = calculatePaginationMeta(offset, limit, total);
```

3. **Sử dụng getBaseUrlFromRequest** thay vì template string:

```typescript
// ❌ Bad
const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;

// ✅ Good
const baseUrl = getBaseUrlFromRequest(req);
```

4. **Sử dụng createJsonApiPaginatedResponseFromOffset** cho offset-based pagination:

```typescript
// ❌ Bad
const page = Math.floor(offset / limit) + 1;
const totalPages = Math.ceil(total / limit);
return createJsonApiPaginatedResponse(
  items,
  total,
  type,
  baseUrl,
  { page, limit, total, totalPages },
  options
);

// ✅ Good
return createJsonApiPaginatedResponseFromOffset(
  items,
  total,
  type,
  baseUrl,
  offset,
  limit,
  options
);
```
