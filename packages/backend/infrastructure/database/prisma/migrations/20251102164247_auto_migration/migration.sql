-- CreateTable
CREATE TABLE "vocabulary_sets" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "language" VARCHAR(10) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "difficulty" VARCHAR(50),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cover_image" TEXT,
    "user_id" TEXT NOT NULL,
    "entry_count" INTEGER NOT NULL DEFAULT 0,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "study_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "vocabulary_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_set_items" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "vocabulary_set_id" TEXT NOT NULL,
    "notes" TEXT,
    "position" INTEGER,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "vocabulary_set_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "word" VARCHAR(255) NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "pronunciation" VARCHAR(100),
    "part_of_speech" VARCHAR(50),
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "source_url" VARCHAR(500),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audio_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_set_history" (
    "id" TEXT NOT NULL,
    "vocabulary_set_id" TEXT NOT NULL,
    "completed_items" INTEGER DEFAULT 0,
    "completion_percentage" DOUBLE PRECISION DEFAULT 0,
    "correct_answers" INTEGER DEFAULT 0,
    "last_studied" TIMESTAMP(3),
    "total_items" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vocabulary_set_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_vocabulary_set_favorites" (
    "user_id" TEXT NOT NULL,
    "vocabulary_set_id" TEXT NOT NULL,
    "favorited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_vocabulary_set_favorites_pkey" PRIMARY KEY ("user_id","vocabulary_set_id")
);

-- CreateTable
CREATE TABLE "user_vocabulary_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "mastery_level" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_review" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_vocabulary_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "senses" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "antonym" VARCHAR(255),
    "etymology_text" TEXT,
    "field_of_study" VARCHAR(100),
    "level" VARCHAR(50),
    "note" TEXT,
    "part_of_speech" VARCHAR(50),
    "see_also" VARCHAR(255),
    "synonym" VARCHAR(255),
    "topic" VARCHAR(100),
    "usage" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "senses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examples" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT,
    "sense_id" TEXT,
    "example_text" TEXT NOT NULL,
    "translation" TEXT,
    "language" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expressions" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "expressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expression_meanings" (
    "id" TEXT NOT NULL,
    "expression_id" TEXT NOT NULL,
    "entry_id" TEXT,
    "meaning_order" INTEGER NOT NULL DEFAULT 1,
    "meaning_text" TEXT NOT NULL,
    "usage_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "expression_meanings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lexical_variants" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "notes" TEXT,
    "part_of_speech" VARCHAR(50),
    "pronunciation" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "version" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "lexical_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_set_item_tags" (
    "item_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabulary_set_item_tags_pkey" PRIMARY KEY ("item_id","tag_id")
);

-- CreateTable
CREATE TABLE "community_mnemonics" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "community_mnemonics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mnemonic_votes" (
    "user_id" TEXT NOT NULL,
    "mnemonic_id" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mnemonic_votes_pkey" PRIMARY KEY ("user_id","mnemonic_id")
);

-- CreateTable
CREATE TABLE "community_examples" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "example_text" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "community_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "example_votes" (
    "user_id" TEXT NOT NULL,
    "example_id" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "example_votes_pkey" PRIMARY KEY ("user_id","example_id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vocabulary_set_id" TEXT,
    "status" VARCHAR(50) NOT NULL,
    "score" DOUBLE PRECISION,
    "total_questions" INTEGER,
    "correct_answers" INTEGER,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quiz_session_id" TEXT NOT NULL,
    "sense_id" TEXT,
    "question_data" JSONB NOT NULL,
    "user_answer" JSONB,
    "is_correct" BOOLEAN,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_questions" (
    "id" TEXT NOT NULL,
    "vocabulary_set_id" TEXT NOT NULL,
    "sense_id" TEXT,
    "question_text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_answer" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "manual_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_challenges" (
    "id" TEXT NOT NULL,
    "vocabulary_set_id" TEXT NOT NULL,
    "challenger_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "challenger_session_id" TEXT,
    "opponent_session_id" TEXT,
    "challenger_score" DOUBLE PRECISION,
    "opponent_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "package_reports" (
    "id" TEXT NOT NULL,
    "vocabulary_set_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vocabulary_sets_user_id_idx" ON "vocabulary_sets"("user_id");

-- CreateIndex
CREATE INDEX "vocabulary_sets_user_id_language_idx" ON "vocabulary_sets"("user_id", "language");

-- CreateIndex
CREATE INDEX "vocabulary_sets_language_idx" ON "vocabulary_sets"("language");

-- CreateIndex
CREATE INDEX "vocabulary_sets_is_public_is_active_deleted_idx" ON "vocabulary_sets"("is_public", "is_active", "deleted");

-- CreateIndex
CREATE INDEX "vocabulary_sets_created_at_idx" ON "vocabulary_sets"("created_at");

-- CreateIndex
CREATE INDEX "vocabulary_sets_deleted_idx" ON "vocabulary_sets"("deleted");

-- CreateIndex
CREATE INDEX "vocabulary_set_items_vocabulary_set_id_idx" ON "vocabulary_set_items"("vocabulary_set_id");

-- CreateIndex
CREATE INDEX "vocabulary_set_items_vocabulary_set_id_deleted_idx" ON "vocabulary_set_items"("vocabulary_set_id", "deleted");

-- CreateIndex
CREATE INDEX "vocabulary_set_items_entry_id_idx" ON "vocabulary_set_items"("entry_id");

-- CreateIndex
CREATE INDEX "vocabulary_set_items_entry_id_deleted_idx" ON "vocabulary_set_items"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "vocabulary_set_items_position_idx" ON "vocabulary_set_items"("position");

-- CreateIndex
CREATE INDEX "vocabulary_set_items_deleted_idx" ON "vocabulary_set_items"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "idx_items_set_entry" ON "vocabulary_set_items"("vocabulary_set_id", "entry_id");

-- CreateIndex
CREATE INDEX "entries_language_idx" ON "entries"("language");

-- CreateIndex
CREATE INDEX "entries_is_published_idx" ON "entries"("is_published");

-- CreateIndex
CREATE INDEX "entries_frequency_idx" ON "entries"("frequency" DESC);

-- CreateIndex
CREATE INDEX "entries_deleted_idx" ON "entries"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "entries_word_language_key" ON "entries"("word", "language");

-- CreateIndex
CREATE INDEX "vocabulary_set_history_vocabulary_set_id_idx" ON "vocabulary_set_history"("vocabulary_set_id");

-- CreateIndex
CREATE INDEX "vocabulary_set_history_vocabulary_set_id_last_studied_idx" ON "vocabulary_set_history"("vocabulary_set_id", "last_studied" DESC);

-- CreateIndex
CREATE INDEX "vocabulary_set_history_last_studied_idx" ON "vocabulary_set_history"("last_studied");

-- CreateIndex
CREATE INDEX "user_vocabulary_set_favorites_user_id_idx" ON "user_vocabulary_set_favorites"("user_id");

-- CreateIndex
CREATE INDEX "user_vocabulary_set_favorites_user_id_deleted_idx" ON "user_vocabulary_set_favorites"("user_id", "deleted");

-- CreateIndex
CREATE INDEX "user_vocabulary_set_favorites_vocabulary_set_id_idx" ON "user_vocabulary_set_favorites"("vocabulary_set_id");

-- CreateIndex
CREATE INDEX "user_vocabulary_set_favorites_deleted_idx" ON "user_vocabulary_set_favorites"("deleted");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_user_id_idx" ON "user_vocabulary_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_user_id_last_review_idx" ON "user_vocabulary_progress"("user_id", "last_review");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_item_id_idx" ON "user_vocabulary_progress"("item_id");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_last_review_idx" ON "user_vocabulary_progress"("last_review");

-- CreateIndex
CREATE INDEX "user_vocabulary_progress_mastery_level_idx" ON "user_vocabulary_progress"("mastery_level");

-- CreateIndex
CREATE UNIQUE INDEX "user_vocabulary_progress_user_id_item_id_key" ON "user_vocabulary_progress"("user_id", "item_id");

-- CreateIndex
CREATE INDEX "senses_entry_id_idx" ON "senses"("entry_id");

-- CreateIndex
CREATE INDEX "senses_entry_id_language_idx" ON "senses"("entry_id", "language");

-- CreateIndex
CREATE INDEX "senses_entry_id_deleted_idx" ON "senses"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "senses_language_idx" ON "senses"("language");

-- CreateIndex
CREATE INDEX "senses_deleted_idx" ON "senses"("deleted");

-- CreateIndex
CREATE INDEX "examples_sense_id_idx" ON "examples"("sense_id");

-- CreateIndex
CREATE INDEX "examples_sense_id_deleted_idx" ON "examples"("sense_id", "deleted");

-- CreateIndex
CREATE INDEX "examples_entry_id_idx" ON "examples"("entry_id");

-- CreateIndex
CREATE INDEX "examples_entry_id_deleted_idx" ON "examples"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "examples_deleted_idx" ON "examples"("deleted");

-- CreateIndex
CREATE INDEX "expressions_entry_id_idx" ON "expressions"("entry_id");

-- CreateIndex
CREATE INDEX "expressions_entry_id_deleted_idx" ON "expressions"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "expressions_deleted_idx" ON "expressions"("deleted");

-- CreateIndex
CREATE INDEX "expression_meanings_expression_id_idx" ON "expression_meanings"("expression_id");

-- CreateIndex
CREATE INDEX "expression_meanings_expression_id_deleted_idx" ON "expression_meanings"("expression_id", "deleted");

-- CreateIndex
CREATE INDEX "expression_meanings_entry_id_idx" ON "expression_meanings"("entry_id");

-- CreateIndex
CREATE INDEX "expression_meanings_entry_id_deleted_idx" ON "expression_meanings"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "expression_meanings_deleted_idx" ON "expression_meanings"("deleted");

-- CreateIndex
CREATE INDEX "lexical_variants_entry_id_idx" ON "lexical_variants"("entry_id");

-- CreateIndex
CREATE INDEX "lexical_variants_entry_id_deleted_idx" ON "lexical_variants"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "lexical_variants_deleted_idx" ON "lexical_variants"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "vocabulary_set_item_tags_user_id_idx" ON "vocabulary_set_item_tags"("user_id");

-- CreateIndex
CREATE INDEX "vocabulary_set_item_tags_item_id_idx" ON "vocabulary_set_item_tags"("item_id");

-- CreateIndex
CREATE INDEX "vocabulary_set_item_tags_tag_id_idx" ON "vocabulary_set_item_tags"("tag_id");

-- CreateIndex
CREATE INDEX "vocabulary_set_item_tags_item_id_tag_id_idx" ON "vocabulary_set_item_tags"("item_id", "tag_id");

-- CreateIndex
CREATE INDEX "community_mnemonics_entry_id_idx" ON "community_mnemonics"("entry_id");

-- CreateIndex
CREATE INDEX "community_mnemonics_entry_id_deleted_idx" ON "community_mnemonics"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "community_mnemonics_user_id_idx" ON "community_mnemonics"("user_id");

-- CreateIndex
CREATE INDEX "community_mnemonics_upvotes_downvotes_idx" ON "community_mnemonics"("upvotes", "downvotes");

-- CreateIndex
CREATE INDEX "community_mnemonics_deleted_idx" ON "community_mnemonics"("deleted");

-- CreateIndex
CREATE INDEX "mnemonic_votes_user_id_idx" ON "mnemonic_votes"("user_id");

-- CreateIndex
CREATE INDEX "mnemonic_votes_mnemonic_id_idx" ON "mnemonic_votes"("mnemonic_id");

-- CreateIndex
CREATE INDEX "mnemonic_votes_vote_idx" ON "mnemonic_votes"("vote");

-- CreateIndex
CREATE INDEX "community_examples_entry_id_idx" ON "community_examples"("entry_id");

-- CreateIndex
CREATE INDEX "community_examples_entry_id_deleted_idx" ON "community_examples"("entry_id", "deleted");

-- CreateIndex
CREATE INDEX "community_examples_user_id_idx" ON "community_examples"("user_id");

-- CreateIndex
CREATE INDEX "community_examples_upvotes_downvotes_idx" ON "community_examples"("upvotes", "downvotes");

-- CreateIndex
CREATE INDEX "community_examples_deleted_idx" ON "community_examples"("deleted");

-- CreateIndex
CREATE INDEX "example_votes_user_id_idx" ON "example_votes"("user_id");

-- CreateIndex
CREATE INDEX "example_votes_example_id_idx" ON "example_votes"("example_id");

-- CreateIndex
CREATE INDEX "example_votes_vote_idx" ON "example_votes"("vote");

-- CreateIndex
CREATE INDEX "quiz_sessions_user_id_idx" ON "quiz_sessions"("user_id");

-- CreateIndex
CREATE INDEX "quiz_sessions_user_id_status_idx" ON "quiz_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "quiz_sessions_vocabulary_set_id_idx" ON "quiz_sessions"("vocabulary_set_id");

-- CreateIndex
CREATE INDEX "quiz_sessions_status_idx" ON "quiz_sessions"("status");

-- CreateIndex
CREATE INDEX "quiz_sessions_completed_at_idx" ON "quiz_sessions"("completed_at");

-- CreateIndex
CREATE INDEX "quiz_sessions_created_at_idx" ON "quiz_sessions"("created_at");

-- CreateIndex
CREATE INDEX "quiz_questions_quiz_session_id_idx" ON "quiz_questions"("quiz_session_id");

-- CreateIndex
CREATE INDEX "quiz_questions_quiz_session_id_order_idx" ON "quiz_questions"("quiz_session_id", "order");

-- CreateIndex
CREATE INDEX "quiz_questions_sense_id_idx" ON "quiz_questions"("sense_id");

-- CreateIndex
CREATE INDEX "quiz_questions_is_correct_idx" ON "quiz_questions"("is_correct");

-- CreateIndex
CREATE INDEX "manual_questions_vocabulary_set_id_idx" ON "manual_questions"("vocabulary_set_id");

-- CreateIndex
CREATE INDEX "manual_questions_vocabulary_set_id_deleted_idx" ON "manual_questions"("vocabulary_set_id", "deleted");

-- CreateIndex
CREATE INDEX "manual_questions_sense_id_idx" ON "manual_questions"("sense_id");

-- CreateIndex
CREATE INDEX "manual_questions_deleted_idx" ON "manual_questions"("deleted");

-- CreateIndex
CREATE INDEX "quiz_challenges_challenger_id_idx" ON "quiz_challenges"("challenger_id");

-- CreateIndex
CREATE INDEX "quiz_challenges_opponent_id_idx" ON "quiz_challenges"("opponent_id");

-- CreateIndex
CREATE INDEX "quiz_challenges_status_idx" ON "quiz_challenges"("status");

-- CreateIndex
CREATE INDEX "quiz_challenges_vocabulary_set_id_idx" ON "quiz_challenges"("vocabulary_set_id");

-- CreateIndex
CREATE INDEX "quiz_challenges_challenger_id_status_idx" ON "quiz_challenges"("challenger_id", "status");

-- CreateIndex
CREATE INDEX "quiz_challenges_opponent_id_status_idx" ON "quiz_challenges"("opponent_id", "status");

-- CreateIndex
CREATE INDEX "user_follows_follower_id_idx" ON "user_follows"("follower_id");

-- CreateIndex
CREATE INDEX "user_follows_following_id_idx" ON "user_follows"("following_id");

-- CreateIndex
CREATE INDEX "package_reports_vocabulary_set_id_idx" ON "package_reports"("vocabulary_set_id");

-- CreateIndex
CREATE INDEX "package_reports_reporter_id_idx" ON "package_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "package_reports_status_idx" ON "package_reports"("status");

-- CreateIndex
CREATE INDEX "package_reports_created_at_idx" ON "package_reports"("created_at");

-- AddForeignKey
ALTER TABLE "vocabulary_set_items" ADD CONSTRAINT "vocabulary_set_items_vocabulary_set_id_fkey" FOREIGN KEY ("vocabulary_set_id") REFERENCES "vocabulary_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_set_items" ADD CONSTRAINT "vocabulary_set_items_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_set_history" ADD CONSTRAINT "vocabulary_set_history_vocabulary_set_id_fkey" FOREIGN KEY ("vocabulary_set_id") REFERENCES "vocabulary_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary_set_favorites" ADD CONSTRAINT "user_vocabulary_set_favorites_vocabulary_set_id_fkey" FOREIGN KEY ("vocabulary_set_id") REFERENCES "vocabulary_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "user_vocabulary_progress_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "vocabulary_set_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "senses" ADD CONSTRAINT "senses_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examples" ADD CONSTRAINT "examples_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examples" ADD CONSTRAINT "examples_sense_id_fkey" FOREIGN KEY ("sense_id") REFERENCES "senses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expressions" ADD CONSTRAINT "expressions_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expression_meanings" ADD CONSTRAINT "expression_meanings_expression_id_fkey" FOREIGN KEY ("expression_id") REFERENCES "expressions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expression_meanings" ADD CONSTRAINT "expression_meanings_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lexical_variants" ADD CONSTRAINT "lexical_variants_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_set_item_tags" ADD CONSTRAINT "vocabulary_set_item_tags_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "vocabulary_set_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_set_item_tags" ADD CONSTRAINT "vocabulary_set_item_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_mnemonics" ADD CONSTRAINT "community_mnemonics_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mnemonic_votes" ADD CONSTRAINT "mnemonic_votes_mnemonic_id_fkey" FOREIGN KEY ("mnemonic_id") REFERENCES "community_mnemonics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_examples" ADD CONSTRAINT "community_examples_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "example_votes" ADD CONSTRAINT "example_votes_example_id_fkey" FOREIGN KEY ("example_id") REFERENCES "community_examples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_vocabulary_set_id_fkey" FOREIGN KEY ("vocabulary_set_id") REFERENCES "vocabulary_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_session_id_fkey" FOREIGN KEY ("quiz_session_id") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_sense_id_fkey" FOREIGN KEY ("sense_id") REFERENCES "senses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_questions" ADD CONSTRAINT "manual_questions_vocabulary_set_id_fkey" FOREIGN KEY ("vocabulary_set_id") REFERENCES "vocabulary_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_questions" ADD CONSTRAINT "manual_questions_sense_id_fkey" FOREIGN KEY ("sense_id") REFERENCES "senses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_challenges" ADD CONSTRAINT "quiz_challenges_vocabulary_set_id_fkey" FOREIGN KEY ("vocabulary_set_id") REFERENCES "vocabulary_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_challenges" ADD CONSTRAINT "quiz_challenges_challenger_session_id_fkey" FOREIGN KEY ("challenger_session_id") REFERENCES "quiz_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_challenges" ADD CONSTRAINT "quiz_challenges_opponent_session_id_fkey" FOREIGN KEY ("opponent_session_id") REFERENCES "quiz_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_reports" ADD CONSTRAINT "package_reports_vocabulary_set_id_fkey" FOREIGN KEY ("vocabulary_set_id") REFERENCES "vocabulary_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
