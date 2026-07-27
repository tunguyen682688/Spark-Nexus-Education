-- CreateTable
CREATE TABLE "question_metadata" (
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

-- CreateIndex
CREATE UNIQUE INDEX "question_metadata_question_id_key" ON "question_metadata"("question_id");

-- AddForeignKey
ALTER TABLE "question_metadata" ADD CONSTRAINT "question_metadata_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
