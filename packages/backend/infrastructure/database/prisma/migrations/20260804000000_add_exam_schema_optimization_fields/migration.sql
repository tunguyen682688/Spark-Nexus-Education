-- AlterTable: Exam — add level
ALTER TABLE "exams" ADD COLUMN "level" VARCHAR(50) DEFAULT 'intermediate';

-- AlterTable: ExamSection — add subtitle, questionCount, isBreak
ALTER TABLE "exam_sections" ADD COLUMN "subtitle" VARCHAR(255);
ALTER TABLE "exam_sections" ADD COLUMN "question_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "exam_sections" ADD COLUMN "is_break" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: SessionAnswer — add savedAt
ALTER TABLE "session_answers" ADD COLUMN "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: ExamResult — add maxScore, accuracyRate, timeSpentMinutes, completedAt
ALTER TABLE "exam_results" ADD COLUMN "max_score" DOUBLE PRECISION NOT NULL DEFAULT 100.0;
ALTER TABLE "exam_results" ADD COLUMN "accuracy_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "exam_results" ADD COLUMN "time_spent_minutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "exam_results" ADD COLUMN "completed_at" TIMESTAMP(3);

-- AlterTable: SkillResult — add feedback
ALTER TABLE "skill_results" ADD COLUMN "feedback" TEXT;

-- AlterTable: QuestionResult — add questionText, userAnswer, correctAnswer, explanation
ALTER TABLE "question_results" ADD COLUMN "question_text" TEXT;
ALTER TABLE "question_results" ADD COLUMN "user_answer" TEXT;
ALTER TABLE "question_results" ADD COLUMN "correct_answer" TEXT;
ALTER TABLE "question_results" ADD COLUMN "explanation" TEXT;
