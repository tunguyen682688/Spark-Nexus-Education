# Certification Module Full Refactor Plan

## Overview
Refactor the certification module to align with shared query params patterns, eliminate code duplication, add missing DTOs, and fix CQRS violations.

## Work Items

---

### 1. Extract Shared Repository Helpers
**File:** `packages/backend/domains/module-certification/src/lib/infrastructure/repositories/certification.repository.ts`

**Problem:** `findCollections` (L86-169) and `findExams` (L473-557) contain ~200 lines of duplicated logic:
- `stripKeys()` recursive helper (19 lines each)
- `sanitizeOrderBy()` inline function (35 lines each)
- `search`/`q` field merging (4 lines each)
- `derivePaginationMetadata()` block (15 lines each)

**Plan:**
1. Create a private `queryHelpers.ts` file at `infrastructure/repositories/query-helpers.ts`
2. Extract:
   - `stripKeys(obj, keys)` — recursive key removal from Prisma where clauses
   - `sanitizeSortField(sort, allowedFields, fallback)` — whitelist-based sort validation
   - `derivePaginationMeta(pagination, defaultLimit)` — page/limit/totalPages calculation
   - `mergeSearchFilter(where, searchTerm, searchFields)` — safe search field merging
3. Refactor `findCollections` and `findExams` to use these helpers
4. Estimated reduction: ~150 lines

---

### 2. Create Missing DTOs
**Files:** New DTO files in `application/dtos/`

| DTO | For Endpoint | Properties |
|-----|-------------|------------|
| `section-questions-query.dto.ts` | `GET /exams/:examId/sections/:sectionId/questions` | `page`, `pageSize`, `search` with `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)` |
| `sync-chapters.dto.ts` | `PUT /collections/:id/chapters` | `chapters: SyncChapterDto[]` with `@IsArray()`, `@ValidateNested()` |
| `add-bookmark.dto.ts` | `POST /bookmarks` | `itemId: string`, `itemType?: string`, `note?: string` with proper validators |

**Note:** `FeaturedCollectionsQueryDto` already exists and works. For trending/official/community, they already use `createQueryParamsFromObject` — the `Record<string, unknown>` typing is acceptable since the shared system handles validation. No DTO needed there.

---

### 3. Fix `getSectionQuestions` Controller Endpoint
**File:** `certification.controller.ts` L327-370

**Current:** Uses raw `@Query('page')`, `@Query('pageSize')`, `@Query('search')`

**Plan:**
1. Replace with `@Query() queryParams: SectionQuestionsQueryDto`
2. Use `createQueryParamsFromObject(queryParams)` to convert to `QueryParams`
3. Pass `QueryParams` to query bus (requires updating `GetSectionQuestionsQuery` to accept `QueryParams`)
4. Update handler to use `buildPrismaQuery` or keep the custom approach with a clear justification comment

---

### 4. Fix CQRS Violations — Create Missing Query Handlers

#### 4a. `GetClonedCollectionsQuery`
**Controller:** L868-900 (currently calls `repository.findClonedCollectionsByUserId` directly)

**Plan:**
1. Create `get-cloned-collections.query.ts` with `userId: string`
2. Create `get-cloned-collections.handler.ts` — delegates to `repository.findClonedCollectionsByUserId`
3. Register in `index.ts` barrel exports
4. Update controller to use `this.queryBus.execute(new GetClonedCollectionsQuery(user.id))`

#### 4b. `GetCollectionActivitiesQuery`
**Controller:** L1259-1298 (currently calls `repository.findActivitiesByCollectionId` directly)

**Plan:**
1. Create `get-collection-activities.query.ts` with `collectionId: string`, `limit?: number`
2. Create `get-collection-activities.handler.ts`
3. Register in barrel exports
4. Update controller

#### 4c. `GetInProgressSessionsQuery`
**Controller:** L1713-1755 (currently calls `repository.findInProgressSessionsByUserId` directly)

**Plan:**
1. Create `get-in-progress-sessions.query.ts` with `userId: string`
2. Create `get-in-progress-sessions.handler.ts`
3. Register in barrel exports
4. Update controller

---

### 5. Fix CQRS Violations — Refactor Command Handlers

#### 5a. `RemoveBookmarkCommand`
**Controller:** L2244-2268 (currently calls `repository.findBookmarkById` then `repository.removeBookmark`)

**Plan:**
1. Update `RemoveBookmarkCommand` to accept `bookmarkId: string` + `userId: string` (already has userId)
2. Move the `findBookmarkById` lookup into `RemoveBookmarkHandler`
3. Handler verifies ownership before deletion
4. Controller just dispatches: `this.commandBus.execute(new RemoveBookmarkCommand(bookmarkId, user.id))`

#### 5b. `RemoveFavoriteCommand`
**Controller:** L2297-2320 (same pattern as bookmarks)

**Plan:**
1. Same approach as RemoveBookmark — move `findFavoriteById` into handler
2. Controller dispatches command with favorite ID + userId

---

### 6. Fix `updateExam` / `deleteExam` CQRS Leakage
**Controller:** L1421-1470 (calls `repository.findExamById` for cache invalidation context)

**Plan:**
1. Move `findExamById` lookup into `UpdateExamHandler` and `DeleteExamHandler`
2. Handlers fetch exam, perform mutation, invalidate cache
3. Controller just dispatches command with exam ID + DTO

---

### 7. Refactor `findSectionQuestionsPaginated` (Optional)
**File:** `certification.repository.ts` L1388-1447

**Current:** Custom pagination with manual Prisma query construction

**Plan:**
1. Adapt to accept `QueryParams` instead of raw `{ page, pageSize, search }`
2. Use `buildPrismaQuery` with a custom `searchableFields` config for relation-based search
3. OR: Keep as-is with a clear comment explaining why (relation filtering doesn't fit `buildPrismaQuery` cleanly)
4. Fix the `question: { deletedAt: null }` overwrite bug (L1401 vs L1404)

---

## Execution Order

| Step | Work Item | Dependencies | Estimated Lines Changed |
|------|-----------|-------------|------------------------|
| 1 | Extract shared repo helpers | None | +80 new, -150 old = -70 net |
| 2 | Create missing DTOs | None | +40 new |
| 3 | Fix sectionQuestions endpoint | Step 2 | ~20 |
| 4a | GetClonedCollectionsQuery | None | +30 new, ~5 old |
| 4b | GetCollectionActivitiesQuery | None | +30 new, ~5 old |
| 4c | GetInProgressSessionsQuery | None | +30 new, ~5 old |
| 5a | RemoveBookmark refactor | None | ~15 |
| 5b | RemoveFavorite refactor | None | ~15 |
| 6 | UpdateExam/DeleteExam refactor | None | ~20 |
| 7 | findSectionQuestionsPaginated | Step 1 | ~40 |

## Verification

After each step:
1. `npx nx typecheck module-certification` — must pass
2. `npx nx lint module-certification` — must pass
3. `npx nx build api-sne` — must compile

After all steps:
1. Start server: `npx nx serve api-sne`
2. Test endpoints manually with curl/Postman
3. Verify no regressions in existing functionality
