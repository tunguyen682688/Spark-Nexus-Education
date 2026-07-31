-- AlterTable: Add extended fields to collections table
ALTER TABLE "public"."collections" ADD COLUMN "subtitle" TEXT,
ADD COLUMN "level" TEXT DEFAULT 'Beginner',
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "visibility" TEXT DEFAULT 'Public',
ADD COLUMN "allow_downloads" BOOLEAN DEFAULT true,
ADD COLUMN "cover_image" TEXT;
