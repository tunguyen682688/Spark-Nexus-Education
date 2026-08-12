# Plan: Fix Question vs ExamQuestion Table Usage in Certification Repository

## Context

The certification module has two related but distinct data models:
- **Question Bank** (`Question` + `QuestionChoice` + `QuestionMetadata`) — reusable questions shared across exams
- **Exam-Specific** (`ExamQuestion` + `ExamSection`) — links questions to exams with format-specific fields

Multiple issues exist where:
1. Format fields are declared but never saved/read
2. Method names are ambiguous (suggest Question table but use ExamQuestion)
3. Section counters are never updated
4. Default sections are synthetic IDs, not persisted to DB

## Issues to Fix

### Fix #1: `saveQuestionWithChoices` — implement examFormatFields parameter
**File:** `certification.repository.ts:925-1033`
**Problem:** Interface declares `examFormatFields` param but implementation ignores it entirely.
**Fix:** Accept the parameter. When provided AND the question is linked to an exam (find ExamQuestion by questionId), update the ExamQuestion record with format fields.

### Fix #2: `findQuestionWithBuilderData` — include ExamQuestion format fields
**File:** `certification.repository.ts:903-923`
**Problem:** Only returns Question + Choices + Metadata. No ExamQuestion data.
**Fix:** After fetching question data, also query `ExamQuestion` by questionId. Return format fields alongside the existing data.

### Fix #3: `GetQuestionBuilderQueryHandler` — return ExamQuestion format fields
**File:** `get-question-builder.handler.ts:9-52, 63-158`
**Problem:** Response DTO has no fields for audioUrl, passageId, partNumber, rubric, etc.
**Fix:** Add `examFormatFields` to `QuestionBuilderResponseDto`. Populate from ExamQuestion data returned by `findQuestionWithBuilderData`.

### Fix #4: `GetQuestionBuilderQueryHandler.usedIn.sectionInfo` — resolve from DB
**File:** `get-question-builder.handler.ts:99`
**Problem:** Hardcoded `'Main Section'`.
**Fix:** Use `examQuestions[0].getSectionId()` to fetch section from `findSectionById()`, then use `section.getTitle()`.

### Fix #5: Rename `findQuestionsByExamId` → `findExamQuestionsByExamId`
**Files:** 
- `certification.repository.interface.ts:183`
- `certification.repository.ts:1220`
- All callers (link handler line 50)
**Problem:** Name suggests it queries Question table, but it queries ExamQuestion.
**Fix:** Rename to `findExamQuestionsByExamId` for consistency with `findExamQuestionsByQuestionId`.

### Fix #6: `GetExamBuilderQueryHandler` — persist default sections to DB
**File:** `get-exam-builder.handler.ts:36-126`
**Problem:** Synthetic IDs like `${exam.id}-sec-p1` never saved to ExamSection. Questions linked to these IDs fail.
**Fix:** When `sections.length === 0`, create actual ExamSection records in DB via `saveExamSection()`, then return the persisted sections.

### Fix #7: Link/Unlink handlers — update section.questionCount
**Files:**
- `link-question-to-exam.handler.ts:67-70`
- `unlink-question-from-exam.handler.ts:33-36`
**Problem:** Updates `exam.totalQuestions` but NOT `section.questionCount`.
**Fix:** After updating exam counter, also recalculate and update the affected section's `questionCount` via `countExamQuestionsBySectionId()`.

## Files to Modify

| File | Changes |
|------|---------|
| `certification.repository.interface.ts` | Rename `findQuestionsByExamId` → `findExamQuestionsByExamId`; update `findQuestionWithBuilderData` return type to include examQuestion field |
| `certification.repository.ts` | Implement `examFormatFields` in `saveQuestionWithChoices`; update `findQuestionWithBuilderData` to include ExamQuestion; rename method |
| `get-question-builder.handler.ts` | Add `examFormatFields` to DTO; resolve sectionInfo from DB |
| `get-exam-builder.handler.ts` | Persist default sections to DB when none exist |
| `link-question-to-exam.handler.ts` | Add section.questionCount update |
| `unlink-question-from-exam.handler.ts` | Add section.questionCount update |

## Execution Order

1. Rename `findQuestionsByExamId` → `findExamQuestionsByExamId` (interface + impl + callers)
2. Update `findQuestionWithBuilderData` return type and implementation
3. Implement `examFormatFields` in `saveQuestionWithChoices`
4. Update `GetQuestionBuilderQueryHandler` (DTO + sectionInfo resolution)
5. Update `GetExamBuilderQueryHandler` (persist default sections)
6. Update Link/Unlink handlers (section counter)
7. Typecheck + lint + build

## Verification

```bash
npx nx run-many -t lint typecheck build --projects=module-certification
npx nx build api-sne
```
