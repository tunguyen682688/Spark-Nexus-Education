-- Migration: Remove dead tables, merge media/hints into QuestionMetadata
-- Removes: QuestionHint, QuestionMedia, ExamRule, AutosaveSnapshot
-- Adds: media (JSON), hints (JSON) to QuestionMetadata

-- Step 1: Add columns FIRST
ALTER TABLE "question_metadata" ADD COLUMN "media" JSONB;
ALTER TABLE "question_metadata" ADD COLUMN "hints" JSONB;

-- Step 2: Migrate QuestionMedia data into QuestionMetadata.media
UPDATE "question_metadata" qm
SET "media" = (
  SELECT COALESCE(json_agg(json_build_object('url', qm2."media_url", 'type', qm2."media_type")), '[]'::json)
  FROM "question_media" qm2
  WHERE qm2."question_id" = qm."question_id"
)
WHERE EXISTS (
  SELECT 1 FROM "question_media" qm2 WHERE qm2."question_id" = qm."question_id"
);

-- Step 3: Migrate QuestionHint data into QuestionMetadata.hints
UPDATE "question_metadata" qm
SET "hints" = (
  SELECT COALESCE(json_agg(json_build_object('content', qh."content", 'order', qh."order") ORDER BY qh."order"), '[]'::json)
  FROM "question_hints" qh
  WHERE qh."question_id" = qm."question_id"
)
WHERE EXISTS (
  SELECT 1 FROM "question_hints" qh WHERE qh."question_id" = qm."question_id"
);

-- Step 4: Drop foreign key constraints (if any) and tables
DROP TABLE IF EXISTS "question_hints" CASCADE;
DROP TABLE IF EXISTS "question_media" CASCADE;
DROP TABLE IF EXISTS "exam_rules" CASCADE;
DROP TABLE IF EXISTS "autosave_snapshots" CASCADE;
