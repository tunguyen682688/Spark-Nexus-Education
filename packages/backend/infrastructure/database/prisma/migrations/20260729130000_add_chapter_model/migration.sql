-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add chapterId to exams
ALTER TABLE "exams" ADD COLUMN "chapter_id" TEXT;

-- CreateIndex
CREATE INDEX "chapters_collection_id_idx" ON "chapters"("collection_id");

-- CreateIndex
CREATE INDEX "exams_chapter_id_idx" ON "exams"("chapter_id");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
