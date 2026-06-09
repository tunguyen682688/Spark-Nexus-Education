-- AlterTable
ALTER TABLE "vocabulary_sets" ADD COLUMN     "import_status" VARCHAR(50) DEFAULT 'idle',
ADD COLUMN     "import_progress" JSONB;

-- Update existing rows to have default 'idle' status
UPDATE "vocabulary_sets" SET "import_status" = 'idle' WHERE "import_status" IS NULL;

