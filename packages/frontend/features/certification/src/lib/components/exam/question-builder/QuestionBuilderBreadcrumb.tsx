import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';

interface QuestionBuilderBreadcrumbProps {
  collectionId: string | null;
  collectionTitle: string | null;
  examId?: string;
  examTitle?: string;
  questionNumber: number;
  breadcrumbText: typeof CERTIFICATION_UI_TEXT.breadcrumbs;
  navigateToCreatorDashboard: () => void;
  navigateToCollectionEditor: (id: string) => void;
  navigateToExamBuilder: (id: string) => void;
}

export const QuestionBuilderBreadcrumb = ({
  collectionId,
  collectionTitle,
  examId,
  examTitle,
  questionNumber,
  breadcrumbText,
  navigateToCreatorDashboard,
  navigateToCollectionEditor,
  navigateToExamBuilder,
}: QuestionBuilderBreadcrumbProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground overflow-x-auto">
        <button onClick={navigateToCreatorDashboard} className="hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">
          {breadcrumbText.creatorDashboard}
        </button>
        <span>{'>'}</span>
        {collectionId ? (
          <>
            <button onClick={() => navigateToCollectionEditor(collectionId)} className="hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">
              {collectionTitle || 'Untitled Collection'}
            </button>
            <span>{'>'}</span>
          </>
        ) : (
          <span className="whitespace-nowrap">{collectionTitle || 'Untitled Collection'}</span>
        )}
        {examId ? (
          <>
            <button onClick={() => navigateToExamBuilder(examId)} className="hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">
              {examTitle || 'Untitled Exam'}
            </button>
            <span>{'>'}</span>
          </>
        ) : (
          <span className="whitespace-nowrap">{examTitle || 'Untitled Exam'}</span>
        )}
        <span className="whitespace-nowrap">{breadcrumbText.question}</span>
        <span>{'>'}</span>
        <span className="whitespace-nowrap">{questionNumber ? `#${questionNumber}` : ''}</span>
        <span>{'>'}</span>
        <span className="text-indigo-600 font-extrabold whitespace-nowrap">{breadcrumbText.build}</span>
      </div>
    </div>
  );
};