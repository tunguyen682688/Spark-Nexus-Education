-- CreateTable
CREATE TABLE "collection_reviews" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_discussions" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_replies" (
    "id" TEXT NOT NULL,
    "discussion_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_reviews_collection_id_idx" ON "collection_reviews"("collection_id");

-- CreateIndex
CREATE INDEX "collection_reviews_user_id_idx" ON "collection_reviews"("user_id");

-- CreateIndex
CREATE INDEX "collection_discussions_collection_id_idx" ON "collection_discussions"("collection_id");

-- CreateIndex
CREATE INDEX "collection_discussions_user_id_idx" ON "collection_discussions"("user_id");

-- CreateIndex
CREATE INDEX "discussion_replies_discussion_id_idx" ON "discussion_replies"("discussion_id");

-- AddForeignKey
ALTER TABLE "collection_reviews" ADD CONSTRAINT "collection_reviews_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_discussions" ADD CONSTRAINT "collection_discussions_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "collection_discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
