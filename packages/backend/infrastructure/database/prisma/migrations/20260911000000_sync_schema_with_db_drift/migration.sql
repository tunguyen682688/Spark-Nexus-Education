-- Sync schema with database drift
-- Many tables/columns were created outside of Prisma migrations.
-- This migration adds missing columns only (tables already exist in DB).
-- Use ADD COLUMN IF NOT EXISTS to be idempotent.

-- ============================================================
-- exam_sections — add missing media/passage columns
-- ============================================================
ALTER TABLE "exam_sections" ADD COLUMN IF NOT EXISTS "audio_media_id" TEXT;
ALTER TABLE "exam_sections" ADD COLUMN IF NOT EXISTS "script_text" TEXT;
ALTER TABLE "exam_sections" ADD COLUMN IF NOT EXISTS "passage_text" TEXT;
ALTER TABLE "exam_sections" ADD COLUMN IF NOT EXISTS "passage_title" VARCHAR(255);
ALTER TABLE "exam_sections" ADD COLUMN IF NOT EXISTS "passage_type" VARCHAR(50);
ALTER TABLE "exam_sections" ADD COLUMN IF NOT EXISTS "created_by" TEXT;
ALTER TABLE "exam_sections" ADD COLUMN IF NOT EXISTS "updated_by" TEXT;

-- ============================================================
-- exam_questions — add missing media/passage columns
-- ============================================================
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "audio_media_id" TEXT;
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "image_media_id" TEXT;
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "content_hash" VARCHAR(64);
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "passage_group_id" VARCHAR(100);
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "blank_number" INTEGER;
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "sub_question_number" INTEGER;
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "passage_title" VARCHAR(255);
ALTER TABLE "exam_questions" ADD COLUMN IF NOT EXISTS "passage_type" VARCHAR(50);

-- ============================================================
-- exams — add missing columns
-- ============================================================
ALTER TABLE "exams" ADD COLUMN IF NOT EXISTS "publish_status" VARCHAR(50) DEFAULT 'draft';
ALTER TABLE "exams" ADD COLUMN IF NOT EXISTS "initialization_status" VARCHAR(50) DEFAULT 'none';

-- ============================================================
-- questions — ensure table exists (created outside migrations)
-- ============================================================
CREATE TABLE IF NOT EXISTS "questions" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "difficulty" VARCHAR(50) NOT NULL,
    "category" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "version" BIGINT NOT NULL DEFAULT 1,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- question_choices — ensure table exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "question_choices" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    CONSTRAINT "question_choices_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- media_files — ensure table exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "media_files" (
    "id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mime_type" VARCHAR(127) NOT NULL,
    "size" INTEGER NOT NULL,
    "original_name" VARCHAR(500) NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "checksum" VARCHAR(64),
    "owner_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- question_versions — ensure table exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "question_versions" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    CONSTRAINT "question_versions_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- question_metadata — ensure table exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "question_metadata" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "estimated_time" VARCHAR(10),
    "shuffle_options" BOOLEAN NOT NULL DEFAULT false,
    "reference_type" VARCHAR(50),
    "passage_source" VARCHAR(255),
    "highlight" VARCHAR(500),
    "cognitive_level" VARCHAR(50),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quality_score" INTEGER,
    "quality_rating" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "question_metadata_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- Add missing foreign keys (IF NOT EXISTS not supported for FKs,
-- so use DO blocks)
-- ============================================================
DO $$ BEGIN
    ALTER TABLE "question_metadata" ADD CONSTRAINT "question_metadata_question_id_fkey"
        FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "question_choices" ADD CONSTRAINT "question_choices_question_id_fkey"
        FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_fkey"
        FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_audio_media_id_fkey"
        FOREIGN KEY ("audio_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_audio_media_id_fkey"
        FOREIGN KEY ("audio_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_image_media_id_fkey"
        FOREIGN KEY ("image_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
