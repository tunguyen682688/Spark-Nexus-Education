# Swagger Decorators Usage Guide

Hướng dẫn sử dụng các Swagger decorators cho JSON:API responses và query parameters.

## JSON:API Response Decorators

### ApiJsonApiSuccessResponse

Decorator cho JSON:API success response (200 OK):

```typescript
import { ApiJsonApiSuccessResponse } from '@spark-nest-ed/shared-libs';

@Get(':id')
@ApiJsonApiSuccessResponse({
  description: 'Vocabulary set retrieved successfully',
  resourceType: 'vocabulary-set',
  exampleId: '123'
})
async getSet(@Param('id') id: string) {
  // ...
}
```

### ApiJsonApiCreatedResponse

Decorator cho JSON:API created response (201 Created):

```typescript
import { ApiJsonApiCreatedResponse } from '@spark-nest-ed/shared-libs';

@Post()
@ApiJsonApiCreatedResponse({
  description: 'Vocabulary set created successfully',
  resourceType: 'vocabulary-set',
  exampleId: '123'
})
async createSet(@Body() dto: CreateSetDto) {
  // ...
}
```

### ApiJsonApiPaginatedResponse

Decorator cho JSON:API paginated response (200 OK):

```typescript
import { ApiJsonApiPaginatedResponse } from '@spark-nest-ed/shared-libs';

@Get()
@ApiJsonApiPaginatedResponse({
  description: 'List of vocabulary sets retrieved successfully',
  resourceType: 'vocabulary-set',
  exampleId: '123'
})
async getUserSets(@Query() query: any) {
  // ...
}
```

### ApiJsonApiErrorResponse

Decorator cho JSON:API error response với các status codes khác nhau:

```typescript
import { ApiJsonApiErrorResponse } from '@spark-nest-ed/shared-libs';

@Get(':id')
@ApiJsonApiErrorResponse({
  status: 404,
  description: 'Vocabulary set not found'
})
@ApiJsonApiErrorResponse({
  status: 401,
  description: 'Unauthorized'
})
async getSet(@Param('id') id: string) {
  // ...
}
```

### ApiJsonApiResponses (Preset)

Preset decorator bao gồm success và common error responses:

```typescript
import { ApiJsonApiResponses } from '@spark-nest-ed/shared-libs';

@Get()
@ApiJsonApiResponses({
  resourceType: 'vocabulary-set',
  exampleId: '123',
  successDescription: 'List retrieved successfully',
  includeCommonErrors: true
})
async getUserSets() {
  // ...
}
```

## Schema Helper Functions

### createJsonApiSuccessResponseSchema

Tạo schema cho success response (có thể tái sử dụng):

```typescript
import { createJsonApiSuccessResponseSchema } from '@spark-nest-ed/shared-libs';

const SUCCESS_SCHEMA = createJsonApiSuccessResponseSchema('vocabulary-set', '123');

@Get(':id')
@ApiOkResponse({
  description: 'Vocabulary set retrieved',
  schema: SUCCESS_SCHEMA
})
async getSet() {
  // ...
}
```

### createJsonApiPaginatedResponseSchema

Tạo schema cho paginated response:

```typescript
import { createJsonApiPaginatedResponseSchema } from '@spark-nest-ed/shared-libs';

const PAGINATED_SCHEMA = createJsonApiPaginatedResponseSchema('vocabulary-set', '123');

@Get()
@ApiOkResponse({
  description: 'List retrieved',
  schema: PAGINATED_SCHEMA
})
async getUserSets() {
  // ...
}
```

### createJsonApiErrorResponseSchema

Tạo schema cho error response:

```typescript
import { createJsonApiErrorResponseSchema } from '@spark-nest-ed/shared-libs';

const ERROR_SCHEMA = createJsonApiErrorResponseSchema();

@Get(':id')
@ApiNotFoundResponse({
  description: 'Not found',
  schema: ERROR_SCHEMA
})
async getSet() {
  // ...
}
```

## Query Parameter Decorators

### ApiOffsetPaginationQueries

Thêm pagination query parameters (limit, offset):

```typescript
import { ApiOffsetPaginationQueries } from '@spark-nest-ed/shared-libs';

@Get()
@ApiOffsetPaginationQueries({
  defaultLimit: 20,
  maxLimit: 200,
  defaultOffset: 0
})
async getUserSets(@Query('limit') limit?: number, @Query('offset') offset?: number) {
  // ...
}
```

### ApiOrderByQuery

Thêm orderBy query parameter:

```typescript
import { ApiOrderByQuery } from '@spark-nest-ed/shared-libs';

@Get()
@ApiOrderByQuery(['createdAt', 'title', 'updatedAt'], {
  description: 'Sort by field',
  example: 'createdAt'
})
async getUserSets(@Query('orderBy') orderBy?: string) {
  // ...
}
```

### ApiSearchQuery

Thêm search query parameter:

```typescript
import { ApiSearchQuery } from '@spark-nest-ed/shared-libs';

@Get()
@ApiSearchQuery({
  paramName: 'q',
  description: 'Search vocabulary sets',
  example: 'english idioms'
})
async getUserSets(@Query('q') search?: string) {
  // ...
}
```

### ApiSortQueries

Thêm multi-sort query parameter:

```typescript
import { ApiSortQueries } from '@spark-nest-ed/shared-libs';

@Get()
@ApiSortQueries({
  description: 'Multi-field sorting',
  example: ['createdAt:desc:1', 'title:asc:2']
})
async getUserSets(@Query('sort') sort?: string[]) {
  // ...
}
```

### ApiFiltersQuery

Thêm filter query parameters:

```typescript
import { ApiFiltersQuery } from '@spark-nest-ed/shared-libs';

@Get()
@ApiFiltersQuery({
  allowedFields: ['language', 'difficulty', 'status'],
  description: 'Advanced filters',
  example: { language: 'en', difficulty: 'B1' }
})
async getUserSets(@Query('filters') filters?: any) {
  // ...
}
```

### ApiEnumQuery

Thêm enum query parameter (cho Language, Difficulty, Status, etc.):

```typescript
import { ApiEnumQuery } from '@spark-nest-ed/shared-libs';

@Get()
@ApiEnumQuery({
  name: 'language',
  enum: Object.values(Language), // hoặc ['en', 'vi', 'ja']
  description: 'Filter by language',
  example: Language.ENGLISH,
})
async getUserSets(@Query('language') language?: Language) {
  // ...
}
```

### ApiBooleanQuery

Thêm boolean query parameter:

```typescript
import { ApiBooleanQuery } from '@spark-nest-ed/shared-libs';

@Get()
@ApiBooleanQuery({
  name: 'publicOnly',
  description: 'Show only public vocabulary sets',
  example: false,
})
async getUserSets(@Query('publicOnly') publicOnly?: boolean) {
  // ...
}
```

### ApiArrayQuery

Thêm array query parameter:

```typescript
import { ApiArrayQuery } from '@spark-nest-ed/shared-libs';

@Get()
@ApiArrayQuery({
  name: 'tags',
  description: 'Filter by tags (array of tag strings)',
  example: ['ielts', 'writing'],
  itemType: 'string', // hoặc 'number'
})
async getUserSets(@Query('tags') tags?: string[]) {
  // ...
}
```

## Preset Decorators

### ApiListPreset

Preset cho list endpoints với đầy đủ query parameters:

```typescript
import { ApiListPreset } from '@spark-nest-ed/shared-libs';

@Get()
@ApiListPreset({
  defaultLimit: 20,
  maxLimit: 200,
  orderByAllowed: ['createdAt', 'title'],
  withSearch: true,
  withSort: true,
  withFilters: true,
  withMetadata: true
})
async getUserSets(@Query() query: any) {
  // ...
}
```

### ApiBrowsePreset

Preset đơn giản cho browse endpoints:

```typescript
import { ApiBrowsePreset } from '@spark-nest-ed/shared-libs';

@Get()
@ApiBrowsePreset({
  orderByAllowed: ['createdAt', 'title']
})
async browseSets(@Query() query: any) {
  // ...
}
```

## Complete Example with All Query Parameters

Ví dụ hoàn chỉnh sử dụng tất cả decorators cho query parameters:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOffsetPaginationQueries,
  ApiSearchQuery,
  ApiSortByQuery,
  ApiEnumQuery,
  ApiBooleanQuery,
  ApiArrayQuery,
  ApiJsonApiPaginatedResponse,
  ApiJsonApiErrorResponse,
} from '@spark-nest-ed/shared-libs';
import { Language } from '../domain/value-objects/language.vo';
import { DifficultyLevel } from '../domain/value-objects/difficulty.vo';

@Controller('packages')
export class VocabularySetController {
  @Get()
  @ApiOffsetPaginationQueries({
    defaultLimit: 20,
    maxLimit: 200,
    defaultOffset: 0,
  })
  @ApiSearchQuery({
    paramName: 'searchQuery',
    description: 'Search vocabulary sets by title or description',
    example: 'IELTS writing',
  })
  @ApiSortByQuery({
    description: 'Sort vocabulary sets',
    enum: ['newest', 'popular', 'mostStudied', 'mostFavorited'],
    example: 'newest',
  })
  @ApiEnumQuery({
    name: 'language',
    enum: Object.values(Language),
    description: 'Filter by language',
    example: Language.ENGLISH,
  })
  @ApiEnumQuery({
    name: 'difficulty',
    enum: Object.values(DifficultyLevel),
    description: 'Filter by difficulty level',
    example: DifficultyLevel.INTERMEDIATE,
  })
  @ApiArrayQuery({
    name: 'tags',
    description: 'Filter by tags (array of tag strings)',
    example: ['ielts', 'writing'],
  })
  @ApiBooleanQuery({
    name: 'publicOnly',
    description: 'Show only public vocabulary sets',
    example: false,
  })
  @ApiJsonApiPaginatedResponse({
    description: 'List of vocabulary sets',
    resourceType: 'vocabulary-set',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getUserSets(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('searchQuery') searchQuery?: string,
    @Query('sortBy') sortBy?: string,
    @Query('language') language?: Language,
    @Query('difficulty') difficulty?: DifficultyLevel,
    @Query('tags') tags?: string[],
    @Query('publicOnly') publicOnly?: boolean
  ) {
    // Implementation...
  }
}
```

## Complete Example

Ví dụ hoàn chỉnh sử dụng tất cả decorators:

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiJsonApiSuccessResponse,
  ApiJsonApiCreatedResponse,
  ApiJsonApiPaginatedResponse,
  ApiJsonApiErrorResponse,
  ApiOffsetPaginationQueries,
  ApiOrderByQuery,
  ApiSearchQuery,
  createJsonApiPaginatedResponseFromOffset,
  convertEntityToJsonApi,
  getBaseUrlFromRequest,
  getSelfLinkFromRequest,
} from '@spark-nest-ed/shared-libs';

@Controller('packages')
export class VocabularySetController {
  @Get()
  @ApiOffsetPaginationQueries({ defaultLimit: 20, maxLimit: 200 })
  @ApiOrderByQuery(['createdAt', 'title'])
  @ApiSearchQuery({ paramName: 'q' })
  @ApiJsonApiPaginatedResponse({
    description: 'List of vocabulary sets',
    resourceType: 'vocabulary-set',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getUserSets(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('orderBy') orderBy?: string,
    @Query('q') search?: string,
    @Req() req: Request
  ) {
    // Implementation...
    const baseUrl = getBaseUrlFromRequest(req);
    return createJsonApiPaginatedResponseFromOffset(
      items,
      total,
      'vocabulary-set',
      baseUrl,
      offset || 0,
      limit || 20,
      { message: 'Sets retrieved successfully', version: '1.0.0' }
    );
  }

  @Get(':id')
  @ApiJsonApiSuccessResponse({
    description: 'Vocabulary set retrieved',
    resourceType: 'vocabulary-set',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Not found' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getSet(@Param('id') id: string, @Req() req: Request) {
    // Implementation...
    const selfLink = getSelfLinkFromRequest(req, id);
    return convertEntityToJsonApi(set, 'vocabulary-set', {
      selfLink,
      message: 'Set retrieved successfully',
      version: '1.0.0',
    });
  }

  @Post()
  @ApiJsonApiCreatedResponse({
    description: 'Vocabulary set created',
    resourceType: 'vocabulary-set',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad request' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  @ApiJsonApiErrorResponse({ status: 409, description: 'Conflict' })
  async createSet(@Body() dto: CreateSetDto, @Req() req: Request) {
    // Implementation...
    const selfLink = getSelfLinkFromRequest(req, set.id);
    return convertEntityToJsonApi(set, 'vocabulary-set', {
      selfLink,
      message: 'Set created successfully',
      version: '1.0.0',
    });
  }
}
```

## Migration từ Old Schema

Thay vì định nghĩa schema trực tiếp trong controller:

```typescript
// ❌ Old way
const SUCCESS_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    data: { /* ... */ }
  }
};

@ApiOkResponse({ schema: SUCCESS_RESPONSE_SCHEMA })
```

Sử dụng decorator hoặc helper function:

```typescript
// ✅ New way - Option 1: Decorator
@ApiJsonApiSuccessResponse({ resourceType: 'vocabulary-set' })

// ✅ New way - Option 2: Helper function
const schema = createJsonApiSuccessResponseSchema('vocabulary-set');
@ApiOkResponse({ schema })
```

## Best Practices

1. **Sử dụng decorators thay vì định nghĩa schema trực tiếp** - Dễ maintain và nhất quán
2. **Sử dụng preset decorators** cho các pattern phổ biến
3. **Tái sử dụng schema helpers** nếu cần custom
4. **Luôn include error responses** cho các status codes có thể xảy ra
5. **Sử dụng resourceType và exampleId** để schema rõ ràng hơn
