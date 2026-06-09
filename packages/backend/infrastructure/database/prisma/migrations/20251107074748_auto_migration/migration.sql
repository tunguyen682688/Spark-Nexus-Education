/*
  Warnings:

  - Added the required column `updated_at` to the `user_vocabulary_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `word` to the `vocabulary_set_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_vocabulary_progress" ADD COLUMN     "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "next_review_at" TIMESTAMP(3),
ADD COLUMN     "repetitions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'NEW',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "vocabulary_set_items" ADD COLUMN     "definition" TEXT,
ADD COLUMN     "example" TEXT,
ADD COLUMN     "word" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_user_id_status_idx" ON "user_vocabulary_progress"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_user_id_status_next_review_at_idx" ON "user_vocabulary_progress"("user_id", "status", "next_review_at");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_next_review_at_idx" ON "user_vocabulary_progress"("next_review_at");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_status_idx" ON "user_vocabulary_progress"("status");

-- CreateIndex
CREATE INDEX "vocabulary_set_items_word_idx" ON "vocabulary_set_items"("word");
