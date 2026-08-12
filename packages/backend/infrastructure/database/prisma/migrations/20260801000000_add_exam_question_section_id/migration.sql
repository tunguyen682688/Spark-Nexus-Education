-- AlterTable
ALTER TABLE "exam_questions" ADD COLUMN "section_id" TEXT;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "exam_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
