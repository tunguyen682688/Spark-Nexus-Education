-- Step 1: Add question-level columns to question_metadata
ALTER TABLE "question_metadata"
ADD COLUMN "passage_id" VARCHAR(100),
ADD COLUMN "passage_text" TEXT,
ADD COLUMN "model_answer" TEXT,
ADD COLUMN "rubric" JSONB,
ADD COLUMN "matching_pairs" JSONB,
ADD COLUMN "word_root" VARCHAR(255),
ADD COLUMN "key_word" VARCHAR(255);

-- Step 2: Copy data from exam_questions → question_metadata
-- Only copy the FIRST exam link per question (to avoid overwriting)
UPDATE "question_metadata" qm
SET
  "passage_id" = eq."passage_id",
  "passage_text" = eq."passage_text",
  "model_answer" = eq."model_answer",
  "rubric" = eq."rubric",
  "matching_pairs" = eq."matching_pairs",
  "word_root" = eq."word_root",
  "key_word" = eq."key_word"
FROM (
  SELECT DISTINCT ON ("question_id")
    "question_id", "passage_id", "passage_text", "model_answer", "rubric", "matching_pairs", "word_root", "key_word"
  FROM "exam_questions"
  WHERE "passage_id" IS NOT NULL
     OR "passage_text" IS NOT NULL
     OR "model_answer" IS NOT NULL
     OR "rubric" IS NOT NULL
     OR "matching_pairs" IS NOT NULL
     OR "word_root" IS NOT NULL
     OR "key_word" IS NOT NULL
  ORDER BY "question_id", "created_at" ASC
) eq
WHERE qm."question_id" = eq."question_id";

-- Step 3: Drop columns from exam_questions
ALTER TABLE "exam_questions"
DROP COLUMN "passage_id",
DROP COLUMN "passage_text",
DROP COLUMN "model_answer",
DROP COLUMN "rubric",
DROP COLUMN "matching_pairs",
DROP COLUMN "word_root",
DROP COLUMN "key_word";
