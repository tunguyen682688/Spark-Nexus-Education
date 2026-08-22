import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useExamContentEditorLogic } from '../../hooks/container-logic/exam/use-exam-content-editor-logic';
import { QuestionNavPanel } from '../../components/exam/content-editor/QuestionNavPanel';
import { QuestionTypeAdapter } from '../../components/exam/content-editor/QuestionTypeAdapter';
import { AnalysisPanel } from '../../components/exam/content-editor/AnalysisPanel';
import { TopBreadcrumb } from '../../components/exam/content-editor/TopBreadcrumb';
import type { ExamContentEditorContainerProps } from '../../types/exam-content-editor.types';

export function ExamContentEditorContainer({
  examId,
}: ExamContentEditorContainerProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state, navigation, handlers, isLoading, isError } =
    useExamContentEditorLogic({ examId, toast });

  const handleBack = useCallback(() => {
    if (state.isDirty) {
      const confirmed = window.confirm(
        'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi không?'
      );
      if (!confirmed) return;
    }
    navigate('/certification');
  }, [navigate, state.isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handlers.handleSave();
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlers.handleNavigatePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlers.handleNavigateNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-muted-foreground font-medium">
            Đang tải nội dung bài kiểm tra...
          </p>
        </div>
      </div>
    );
  }
  // Error state — exam not found or API error
  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              Không thể tải bài kiểm tra
            </h2>
            <p className="text-sm text-muted-foreground">
              Bài kiểm tra không tồn tại hoặc bạn không có quyền truy cập.
            </p>
          </div>
          <button
            onClick={() => navigate('/certification')}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Main editor layout — always show 3-column layout
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Breadcrumb Bar */}
      <TopBreadcrumb
        examTitle={state.exam.title || 'Bài kiểm tra'}
        partTitle={
          navigation.selectedSection ? navigation.selectedSection.title : ''
        }
        questionNumber={
          navigation.selectedQuestion
            ? navigation.selectedQuestion.order ||
              navigation.selectedQuestionIndex + 1
            : 0
        }
        totalQuestions={navigation.totalQuestions}
        isPublished={state.publishStatus === 'published'}
        isDirty={state.isDirty}
        lastSavedAt={state.lastSavedAt}
        onBack={handleBack}
        onSave={handlers.handleSave}
        onPublish={handlers.handlePublish}
        isSaving={state.isSaving}
      />

      {/* 3-Column Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Question Navigation Panel */}
        <QuestionNavPanel
          sections={state.sections}
          examTitle={state.exam.title || 'Bài kiểm tra'}
          selectedSectionId={navigation.selectedSectionId}
          selectedQuestionId={navigation.selectedQuestionId}
          isFixedStructure={state.isFixedStructure}
          onSelectQuestion={handlers.handleSelectQuestion}
          onSelectSection={handlers.handleSelectSection}
        />

        {/* Center: Question Editor */}
        <div className="flex-1 min-w-0">
          {navigation.selectedSection && navigation.selectedQuestion ? (
            <QuestionTypeAdapter
              section={navigation.selectedSection}
              question={navigation.selectedQuestion}
              questionIndex={navigation.selectedQuestionIndex}
              totalQuestions={navigation.totalQuestions}
              onUpdate={(updates) =>
                handlers.handleUpdateQuestion(
                  navigation.selectedSectionId,
                  navigation.selectedQuestionId,
                  updates
                )
              }
              onUpdateGroupPassage={(passageText) => {
                if (navigation.selectedQuestion?.passageGroupId) {
                  handlers.handleUpdateGroupPassage(
                    navigation.selectedSectionId,
                    navigation.selectedQuestion.passageGroupId,
                    passageText
                  );
                }
              }}
              onNavigatePrev={handlers.handleNavigatePrev}
              onNavigateNext={handlers.handleNavigateNext}
            />
          ) : null}
        </div>

        {/* Right: Analysis Panel */}
        {navigation.selectedSection && navigation.selectedQuestion && (
          <AnalysisPanel
            section={navigation.selectedSection}
            question={navigation.selectedQuestion}
            questionIndex={navigation.selectedQuestionIndex}
            totalQuestions={navigation.totalQuestions}
            onUpdateSection={handlers.handleUpdateSection}
          />
        )}
      </div>
    </div>
  );
}
