-- Improve Exam-Question architecture indexes and constraints

-- ============================================
-- 1. Add missing indexes on Question table
-- ============================================
CREATE INDEX IF NOT EXISTS "questions_type_idx" ON "questions"("type");
CREATE INDEX IF NOT EXISTS "questions_difficulty_idx" ON "questions"("difficulty");
CREATE INDEX IF NOT EXISTS "questions_created_by_idx" ON "questions"("created_by");

-- ============================================
-- 2. Add category field to Question table
-- ============================================
ALTER TABLE "questions" ADD COLUMN "category" VARCHAR(100);
CREATE INDEX IF NOT EXISTS "questions_category_idx" ON "questions"("category");

-- ============================================
-- 3. Add unique constraint on ExamQuestion(examId, questionId)
-- ============================================
-- First check for and remove any duplicate records
DELETE FROM "exam_questions" eq1
USING "exam_questions" eq2
WHERE eq1."id" > eq2."id"
  AND eq1."exam_id" = eq2."exam_id"
  AND eq1."question_id" = eq2."question_id";

-- Now add the unique constraint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_question_id_key"
  UNIQUE ("exam_id", "question_id");

-- ============================================
-- 4. Add missing index on ExamResult(passed)
-- ============================================
CREATE INDEX IF NOT EXISTS "exam_results_passed_idx" ON "exam_results"("passed");
