# Migration Guide: Từ DTOs cũ sang Query System mới

Hướng dẫn chuyển đổi từ hệ thống DTOs hiện tại sang hệ thống Query Parameters mới.

## Tổng quan

Hệ thống mới cung cấp:

- ✅ Type-safe query building
- ✅ Advanced filtering với nhiều operators
- ✅ Multi-field sorting
- ✅ Nhiều loại pagination (offset, cursor, page)
- ✅ Tự động transform sang Prisma/TypeORM
- ✅ Validation và sanitization
- ✅ Backward compatible

## Migration Steps

### 1. Controller Layer

#### Trước (Old)

```typescript
@Get()
async getUserSets(
  @Query() queryDto: ListVocabularySetsDto
) {
  const query = new ListVocabularySetsQuery(
    userId,
    queryDto.language,
    queryDto.difficulty,
    queryDto.tags,
    queryDto.searchQuery,
    queryDto.sortBy,
    queryDto.publicOnly,
    queryDto.limit,
    queryDto.offset
  );
  // ...
}
```

#### Sau (New)

```typescript
import {
  createQueryParamsFromObject,
  buildPrismaQuery,
  executePrismaQuery
} from '@sparknexused/libs';

@Get()
async getUserSets(
  @Query() queryDto: ListVocabularySetsDto
) {
  // Convert DTO to QueryParams
  const queryParams = createQueryParamsFromObject({
    ...queryDto,
    // Map old fields to new structure if needed
    language: queryDto.language,
    difficulty: queryDto.difficulty,
    tags: queryDto.tags,
    search: queryDto.searchQuery,
    sortBy: queryDto.sortBy,
    limit: queryDto.limit,
    offset: queryDto.offset,
  });

  // Add default filters
  const filters = createFilterBuilder()
    .eq('userId', userId)
    .eq('deleted', false);

  if (queryDto.publicOnly) {
    filters.eq('isPublic', true);
  }

  const finalParams = mergeQueryFilters(queryParams, filters.build());

  // Build Prisma query
  const prismaQuery = buildPrismaQuery(finalParams, {
    maxLimit: 100,
    defaultLimit: 20,
  });

  // Execute
  const [sets, total] = await Promise.all([
    this.prisma.vocabularySet.findMany({
      ...prismaQuery,
      where: {
        ...prismaQuery.where,
        userId,
        deleted: false,
      },
    }),
    this.prisma.vocabularySet.count({
      where: {
        ...prismaQuery.where,
        userId,
        deleted: false,
      },
    }),
  ]);

  return createPaginatedResult(sets, total, extractPagination(finalParams));
}
```

### 2. Handler Layer

Trước (Old)

```typescript
@QueryHandler(BrowsePublicSetsQuery)
export class BrowsePublicSetsHandler {
  async execute(query: BrowsePublicSetsQuery) {
    const base: Prisma.VocabularySetWhereInput = {
      isPublic: true,
      isActive: true,
      deleted: false,
    };
    const filters: Prisma.VocabularySetWhereInput = {};
    if (query.q) filters.title = { contains: query.q, mode: 'insensitive' };
    if (query.category) filters.tags = { has: query.category };
    if (typeof query.minWords === 'number')
      filters.entryCount = { gte: query.minWords };
    // ...
  }
}
```

Sau (New)

```typescript
import {
  QueryParams,
  buildPrismaQuery,
  executePrismaQuery,
} from '@sparknexused/libs';

@QueryHandler(BrowsePublicSetsQuery)
export class BrowsePublicSetsHandler {
  async execute(query: BrowsePublicSetsQuery) {
    // Convert query to QueryParams
    const queryParams: QueryParams = {
      simpleFilters: {
        isPublic: true,
        isActive: true,
        deleted: false,
      },
      search: query.q,
      searchFields: ['title'],
      limit: query.limit,
      offset: query.offset,
    };

    // Add custom filters
    const customFilters = createFilterBuilder();
    if (query.category) {
      customFilters.contains('tags', query.category);
    }
    if (typeof query.minWords === 'number') {
      customFilters.gte('entryCount', query.minWords);
    }

    const finalParams = mergeQueryFilters(queryParams, customFilters.build());

    // Build and execute
    return executePrismaQuery(this.prisma.vocabularySet, finalParams, {
      includeCount: true,
    });
  }
}
```

### 3. DTO Migration

#### Option 1: Giữ DTOs cũ, convert sang QueryParams

```typescript
// Keep existing DTO
export class ListVocabularySetsDto {
  @IsOptional()
  language?: Language;
  // ... other fields
}

// In controller
const queryParams = createQueryParamsFromObject(queryDto);
```

#### Option 2: Migrate sang AdvancedQueryDto

```typescript
import { IAdvancedQueryDto } from '@sparknexused/libs';
import { IsOptional, IsEnum } from 'class-validator';

export class ListVocabularySetsDto implements IAdvancedQueryDto {
  // Base query fields
  limit?: number = 20;
  offset?: number = 0;
  sortBy?: string;
  // ...

  // Domain-specific fields
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  // Use simpleFilters for domain fields
  get simpleFilters() {
    return {
      language: this.language,
      difficulty: this.difficulty,
      // ...
    };
  }
}
```

### 4. Advanced Usage

#### Complex Filtering

```typescript
const filters = createFilterBuilder()
  .and([
    createFilterBuilder().eq('status', 'active').build()[0],
    createFilterBuilder()
      .or([
        createFilterBuilder().eq('category', 'tech').build()[0],
        createFilterBuilder().eq('category', 'science').build()[0],
      ])
      .build()[0],
  ])
  .gt('createdAt', '2024-01-01')
  .build();
```

#### Multi-field Sorting

```typescript
const sorts = createSortBuilder().desc('createdAt', 1).asc('title', 2).build();
```

#### Cursor Pagination

```typescript
const pagination = createPaginationBuilder().cursor(20, lastCursorId).build();
```

## Best Practices

1. **Validation**: Luôn validate query params trước khi sử dụng

   ```typescript
   const validated = validateQueryParams(params, {
     maxLimit: 100,
     allowedSortFields: ['createdAt', 'title', 'popularity'],
     allowedFilterFields: ['status', 'category', 'language'],
   });
   ```

2. **Default Filters**: Sử dụng `addDefaultFilters` cho filters bắt buộc

   ```typescript
   const paramsWithDefaults = addDefaultFilters(params, [
     { field: 'deleted', operator: FilterOperator.EQ, value: false },
     { field: 'isActive', operator: FilterOperator.EQ, value: true },
   ]);
   ```

3. **Security**: Validate allowed fields để tránh field injection

   ```typescript
   const safeParams = validateQueryParams(params, {
     allowedFilterFields: ['title', 'status'], // Only allow these
     allowedSortFields: ['createdAt', 'title'],
   });
   ```

4. **Performance**: Sử dụng `includeCount: false` khi không cần total

   ```typescript
   const result = await executePrismaQuery(prisma, params, {
     includeCount: false, // Faster query
   });
   ```

## Backward Compatibility

Hệ thống mới tương thích ngược với DTOs cũ:

```typescript
// Old DTO still works
const oldDto = { limit: 20, offset: 0, status: 'active' };

// Convert to new system
const newParams = createQueryParamsFromObject(oldDto);

// Use new features
const advancedParams = {
  ...newParams,
  filters: createFilterBuilder()
    .eq('status', 'active')
    .gt('createdAt', '2024-01-01')
    .build(),
};
```

## Testing

```typescript
describe('Query System Migration', () => {
  it('should convert old DTO to new QueryParams', () => {
    const oldDto = {
      limit: 20,
      offset: 0,
      status: 'active',
    };

    const newParams = createQueryParamsFromObject(oldDto);
    expect(newParams.limit).toBe(20);
    expect(newParams.simpleFilters?.status).toBe('active');
  });

  it('should build Prisma query correctly', () => {
    const params = createQueryParamsFromObject({
      status: 'active',
      limit: 20,
      offset: 0,
    });

    const prismaQuery = buildPrismaQuery(params);
    expect(prismaQuery.take).toBe(20);
    expect(prismaQuery.skip).toBe(0);
  });
});
```

## Checklist

- [ ] Update controllers to use new query system
- [ ] Migrate handlers to use buildPrismaQuery or executePrismaQuery
- [ ] Update DTOs (optional - can keep old DTOs and convert)
- [ ] Add validation for allowed fields
- [ ] Update tests
- [ ] Update API documentation
- [ ] Monitor performance after migration
