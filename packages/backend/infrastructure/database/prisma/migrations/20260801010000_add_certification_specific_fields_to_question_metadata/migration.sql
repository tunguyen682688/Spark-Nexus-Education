-- AlterTable
ALTER TABLE "question_metadata" ADD COLUMN "audio_url" VARCHAR(500),
ADD COLUMN "image_url" VARCHAR(500),
ADD COLUMN "passage_id" VARCHAR(100),
ADD COLUMN "grid_in_answer" TEXT,
ADD COLUMN "matching_pairs" JSONB,
ADD COLUMN "word_formation_root" VARCHAR(255),
ADD COLUMN "key_word" VARCHAR(255),
ADD COLUMN "writing_task_type" VARCHAR(100),
ADD COLUMN "speaking_prompt" TEXT;
