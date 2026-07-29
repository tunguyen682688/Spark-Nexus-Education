-- AlterTable: Add exam type fields to exams table
ALTER TABLE "exams" ADD COLUMN "exam_type" VARCHAR(50) NOT NULL DEFAULT 'FULL_MOCK';
ALTER TABLE "exams" ADD COLUMN "certification_type" VARCHAR(50);

-- AlterTable: Add section type fields to exam_sections table
ALTER TABLE "exam_sections" ADD COLUMN "section_type" VARCHAR(50) NOT NULL DEFAULT 'general';
ALTER TABLE "exam_sections" ADD COLUMN "duration_minutes" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "exams_certification_type_idx" ON "exams"("certification_type");
