-- AlterTable: Add format-specific fields to exam_questions
ALTER TABLE "exam_questions"
ADD COLUMN "audio_url" VARCHAR(500),
ADD COLUMN "image_url" VARCHAR(500),
ADD COLUMN "passage_id" VARCHAR(100),
ADD COLUMN "passage_text" TEXT,
ADD COLUMN "part_number" INTEGER,
ADD COLUMN "gap_number" INTEGER,
ADD COLUMN "word_root" VARCHAR(255),
ADD COLUMN "key_word" VARCHAR(255),
ADD COLUMN "writing_task_type" VARCHAR(100),
ADD COLUMN "speaking_prompt" TEXT,
ADD COLUMN "model_answer" TEXT,
ADD COLUMN "rubric" JSONB,
ADD COLUMN "matching_pairs" JSONB,
ADD COLUMN "is_grid_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "format_metadata" JSONB;

-- CreateIndex for exam_questions.is_grid_in
CREATE INDEX "exam_questions_is_grid_in_idx" ON "exam_questions"("is_grid_in");

-- CreateIndex for exam_questions.part_number
CREATE INDEX "exam_questions_part_number_idx" ON "exam_questions"("part_number");

-- AlterTable: Remove certification-specific columns from question_metadata
ALTER TABLE "question_metadata"
DROP COLUMN "audio_url",
DROP COLUMN "image_url",
DROP COLUMN "passage_id",
DROP COLUMN "grid_in_answer",
DROP COLUMN "matching_pairs",
DROP COLUMN "word_formation_root",
DROP COLUMN "key_word",
DROP COLUMN "writing_task_type",
DROP COLUMN "speaking_prompt";
