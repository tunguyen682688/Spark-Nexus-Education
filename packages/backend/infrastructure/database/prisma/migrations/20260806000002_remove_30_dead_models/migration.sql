-- Remove 30 dead models (never referenced in application code)
-- Focus: Exam platform cleanup, remove unimplemented subsystems

-- ============================================
-- 1. Remove QUIZ dead tables
-- ============================================
DROP TABLE IF EXISTS "manual_questions" CASCADE;
DROP TABLE IF EXISTS "quiz_challenges" CASCADE;

-- ============================================
-- 2. Remove SOCIAL dead tables
-- ============================================
DROP TABLE IF EXISTS "user_follows" CASCADE;
DROP TABLE IF EXISTS "package_reports" CASCADE;

-- ============================================
-- 3. Remove COLLECTION dead tables
-- ============================================
DROP TABLE IF EXISTS "collection_collaborators" CASCADE;

-- ============================================
-- 4. Remove VOCABULARY dead tables
-- ============================================
DROP TABLE IF EXISTS "vocabulary_set_history" CASCADE;

-- ============================================
-- 5. Remove CREATOR child tables
-- ============================================
DROP TABLE IF EXISTS "creator_badges" CASCADE;
DROP TABLE IF EXISTS "creator_statistics" CASCADE;
DROP TABLE IF EXISTS "creator_revenue" CASCADE;
DROP TABLE IF EXISTS "creator_portfolios" CASCADE;

-- ============================================
-- 6. Remove RECOMMENDATION subsystem
-- ============================================
DROP TABLE IF EXISTS "recommendation_history" CASCADE;
DROP TABLE IF EXISTS "recommendation_rules" CASCADE;
DROP TABLE IF EXISTS "recommendation_items" CASCADE;
DROP TABLE IF EXISTS "recommendation_profiles" CASCADE;

-- ============================================
-- 7. Remove EDITORIAL/REVIEW subsystem
-- ============================================
DROP TABLE IF EXISTS "review_checklists" CASCADE;
DROP TABLE IF EXISTS "approval_decisions" CASCADE;
DROP TABLE IF EXISTS "review_comments" CASCADE;
DROP TABLE IF EXISTS "review_requests" CASCADE;

-- ============================================
-- 8. Remove ANALYTICS subsystem
-- ============================================
DROP TABLE IF EXISTS "question_metrics" CASCADE;
DROP TABLE IF EXISTS "exam_metrics" CASCADE;
DROP TABLE IF EXISTS "user_metrics" CASCADE;
DROP TABLE IF EXISTS "daily_metrics" CASCADE;
DROP TABLE IF EXISTS "analytics_snapshots" CASCADE;

-- ============================================
-- 9. Remove ADMINISTRATION subsystem
-- ============================================
DROP TABLE IF EXISTS "backup_policies" CASCADE;
DROP TABLE IF EXISTS "integration_configurations" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "feature_flags" CASCADE;
DROP TABLE IF EXISTS "system_configurations" CASCADE;
