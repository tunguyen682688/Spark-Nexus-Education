-- CreateIndex: Chapters
CREATE INDEX "chapters_collectionId_order_idx" ON "chapters"("collection_id", "order");

-- AddForeignKey: CollectionItem → Exam
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_examId_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex: CollectionItems
CREATE INDEX "collection_items_collectionId_idx" ON "collection_items"("collection_id");
CREATE INDEX "collection_items_examId_idx" ON "collection_items"("exam_id");

-- CreateIndex: ExamSections
CREATE INDEX "exam_sections_examId_idx" ON "exam_sections"("exam_id");
CREATE INDEX "exam_sections_examId_order_idx" ON "exam_sections"("exam_id", "order");

-- CreateIndex: ExamQuestions
CREATE INDEX "exam_questions_examId_idx" ON "exam_questions"("exam_id");
CREATE INDEX "exam_questions_questionId_idx" ON "exam_questions"("question_id");
CREATE INDEX "exam_questions_sectionId_idx" ON "exam_questions"("section_id");
CREATE INDEX "exam_questions_examId_sectionId_idx" ON "exam_questions"("exam_id", "section_id");
CREATE INDEX "exam_questions_examId_order_idx" ON "exam_questions"("exam_id", "order");

-- CreateIndex: QuestionChoices
CREATE INDEX "question_choices_questionId_idx" ON "question_choices"("question_id");
CREATE INDEX "question_choices_questionId_order_idx" ON "question_choices"("question_id", "order");

-- CreateIndex: QuestionHints
CREATE INDEX "question_hints_questionId_idx" ON "question_hints"("question_id");
CREATE INDEX "question_hints_questionId_order_idx" ON "question_hints"("question_id", "order");

-- CreateIndex: QuestionMedia
CREATE INDEX "question_media_questionId_idx" ON "question_media"("question_id");

-- CreateIndex: QuestionVersions
CREATE INDEX "question_versions_questionId_idx" ON "question_versions"("question_id");
CREATE INDEX "question_versions_questionId_version_idx" ON "question_versions"("question_id", "version");

-- CreateIndex: ExamSessions
CREATE INDEX "exam_sessions_examId_idx" ON "exam_sessions"("exam_id");
CREATE INDEX "exam_sessions_examId_userId_idx" ON "exam_sessions"("exam_id", "user_id");

-- CreateIndex: SessionAnswers
CREATE INDEX "session_answers_sessionId_idx" ON "session_answers"("session_id");
CREATE INDEX "session_answers_sessionId_questionId_idx" ON "session_answers"("session_id", "question_id");
CREATE INDEX "session_answers_questionId_idx" ON "session_answers"("question_id");

-- CreateIndex: SessionViolations
CREATE INDEX "session_violations_sessionId_idx" ON "session_violations"("session_id");

-- CreateIndex: AutosaveSnapshots
CREATE INDEX "autosave_snapshots_sessionId_idx" ON "autosave_snapshots"("session_id");
CREATE INDEX "autosave_snapshots_sessionId_savedAt_idx" ON "autosave_snapshots"("session_id", "saved_at");

-- CreateIndex: ExamResults
CREATE INDEX "exam_results_userId_idx" ON "exam_results"("user_id");
CREATE INDEX "exam_results_examId_idx" ON "exam_results"("exam_id");
CREATE INDEX "exam_results_examId_userId_idx" ON "exam_results"("exam_id", "user_id");
CREATE INDEX "exam_results_sessionId_idx" ON "exam_results"("session_id");

-- CreateIndex: SkillResults
CREATE INDEX "skill_results_resultId_idx" ON "skill_results"("result_id");

-- CreateIndex: QuestionResults
CREATE INDEX "question_results_resultId_idx" ON "question_results"("result_id");
CREATE INDEX "question_results_questionId_idx" ON "question_results"("question_id");
CREATE INDEX "question_results_resultId_questionId_idx" ON "question_results"("result_id", "question_id");

-- CreateIndex: RecommendationItems
CREATE INDEX "recommendation_items_profileId_idx" ON "recommendation_items"("profile_id");
CREATE INDEX "recommendation_items_profileId_score_idx" ON "recommendation_items"("profile_id", "score");

-- CreateIndex: RecommendationHistory
CREATE INDEX "recommendation_history_profileId_idx" ON "recommendation_history"("profile_id");
CREATE INDEX "recommendation_history_profileId_createdAt_idx" ON "recommendation_history"("profile_id", "created_at");

-- CreateIndex: AuditLogs
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("user_id", "created_at");
CREATE INDEX "audit_logs_targetId_targetType_idx" ON "audit_logs"("target_id", "target_type");

-- CreateIndex: ReviewRequests
CREATE INDEX "review_requests_targetId_targetType_idx" ON "review_requests"("target_id", "target_type");
CREATE INDEX "review_requests_submitterId_idx" ON "review_requests"("submitter_id");
CREATE INDEX "review_requests_reviewerId_idx" ON "review_requests"("reviewer_id");

-- CreateIndex: AnalyticsSnapshots
CREATE UNIQUE INDEX "analytics_snapshots_snapshotDate_key" ON "analytics_snapshots"("snapshot_date");

-- CreateIndex: DailyMetrics
CREATE INDEX "daily_metrics_snapshotId_idx" ON "daily_metrics"("snapshot_id");
CREATE INDEX "daily_metrics_snapshotId_metricName_idx" ON "daily_metrics"("snapshot_id", "metric_name");

-- CreateIndex: UserMetrics
CREATE INDEX "user_metrics_snapshotId_idx" ON "user_metrics"("snapshot_id");
CREATE INDEX "user_metrics_userId_idx" ON "user_metrics"("user_id");
CREATE INDEX "user_metrics_snapshotId_userId_metricName_idx" ON "user_metrics"("snapshot_id", "user_id", "metric_name");

-- CreateIndex: ExamMetrics
CREATE INDEX "exam_metrics_snapshotId_idx" ON "exam_metrics"("snapshot_id");
CREATE INDEX "exam_metrics_examId_idx" ON "exam_metrics"("exam_id");
CREATE INDEX "exam_metrics_snapshotId_examId_metricName_idx" ON "exam_metrics"("snapshot_id", "exam_id", "metric_name");

-- CreateIndex: QuestionMetrics
CREATE INDEX "question_metrics_snapshotId_idx" ON "question_metrics"("snapshot_id");
CREATE INDEX "question_metrics_questionId_idx" ON "question_metrics"("question_id");
CREATE INDEX "question_metrics_snapshotId_questionId_metricName_idx" ON "question_metrics"("snapshot_id", "question_id", "metric_name");

-- CreateIndex: RolePermissions
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permission_id");

-- CreateIndex: UserDownloads
CREATE INDEX "user_downloads_userId_idx" ON "user_downloads"("user_id");
CREATE INDEX "user_downloads_userId_createdAt_idx" ON "user_downloads"("user_id", "created_at");
CREATE INDEX "user_downloads_itemType_itemId_idx" ON "user_downloads"("item_type", "item_id");

-- CreateIndex: CollectionPurchases
CREATE INDEX "collection_purchases_userId_idx" ON "collection_purchases"("user_id");
CREATE INDEX "collection_purchases_collectionId_idx" ON "collection_purchases"("collection_id");

-- CreateIndex: CollectionReports
CREATE INDEX "collection_reports_collectionId_idx" ON "collection_reports"("collection_id");
CREATE INDEX "collection_reports_userId_idx" ON "collection_reports"("user_id");
CREATE INDEX "collection_reports_status_idx" ON "collection_reports"("status");

-- CreateIndex: CollectionReviews
CREATE INDEX "collection_reviews_collectionId_createdAt_idx" ON "collection_reviews"("collection_id", "created_at");

-- CreateIndex: CollectionDiscussions
CREATE INDEX "collection_discussions_collectionId_createdAt_idx" ON "collection_discussions"("collection_id", "created_at");

-- CreateIndex: DiscussionReplies
CREATE INDEX "discussion_replies_discussionId_idx" ON "discussion_replies"("discussion_id");
CREATE INDEX "discussion_replies_discussionId_createdAt_idx" ON "discussion_replies"("discussion_id", "created_at");
CREATE INDEX "discussion_replies_userId_idx" ON "discussion_replies"("user_id");

-- CreateIndex: CreatorBadges
CREATE INDEX "creator_badges_creatorId_idx" ON "creator_badges"("creator_id");

-- CreateIndex: CreatorPortfolios
CREATE INDEX "creator_portfolios_creatorId_idx" ON "creator_portfolios"("creator_id");
