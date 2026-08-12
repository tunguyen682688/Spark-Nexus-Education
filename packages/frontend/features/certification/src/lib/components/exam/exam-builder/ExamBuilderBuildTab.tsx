import type { BuilderSection } from '../../../hooks/container-logic/exam/use-exam-builder-container-logic';
import { SectionManager } from './SectionManager';
import { QuestionListSection } from './QuestionListSection';
import { BlueprintPanel } from './BlueprintPanel';

interface ExamBuilderBuildTabProps {
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;
  activeSubTab: 'Questions' | 'Instructions' | 'Timing';
  setActiveSubTab: (tab: 'Questions' | 'Instructions' | 'Timing') => void;
  activeSection: BuilderSection | undefined;
  sections: BuilderSection[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalFilteredPages: number;
  totalFilteredCount: number;
  filteredQuestions: BuilderSection['questions'];
  pageSize: number;
  blueprint: {
    totalQuestions: number;
    durationText: string;
    totalPoints: number;
    listening: { questions: number; timeMinutes: number };
    reading: { questions: number; timeMinutes: number };
    writing: { questions: number; timeMinutes: number };
    speaking: { questions: number; timeMinutes: number };
    math: { questions: number; timeMinutes: number };
  };
  settings: { title: string; description: string; level: string; language: string; passingScore: number; maxScore: number; createdDate: string; lastUpdatedDate: string };
  handleAddSection: () => void;
  handleUpdateActiveSectionTitle: (title: string) => void;
  handleDeleteSection: (id: string) => void;
  handleAddQuestionToSection: () => void;
  handleRemoveQuestionFromSection: (id: string) => void;
  handleEditQuestion: (id: string) => void;
  isSectionQuestionsLoading: boolean;
}

export function ExamBuilderBuildTab({
  activeSectionId,
  setActiveSectionId,
  activeSubTab,
  setActiveSubTab,
  activeSection,
  sections,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalFilteredPages,
  totalFilteredCount,
  filteredQuestions,
  pageSize,
  blueprint,
  settings,
  handleAddSection,
  handleUpdateActiveSectionTitle,
  handleDeleteSection,
  handleAddQuestionToSection,
  handleRemoveQuestionFromSection,
  handleEditQuestion,
  isSectionQuestionsLoading,
}: ExamBuilderBuildTabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-3 space-y-4">
        <SectionManager
          sections={sections}
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
          handleAddSection={handleAddSection}
          handleDeleteSection={handleDeleteSection}
        />
      </div>

      <div className="xl:col-span-6 space-y-6">
        <QuestionListSection
          activeSection={activeSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalFilteredPages={totalFilteredPages}
          totalFilteredCount={totalFilteredCount}
          filteredQuestions={filteredQuestions}
          pageSize={pageSize}
          handleAddQuestionToSection={handleAddQuestionToSection}
          handleRemoveQuestionFromSection={handleRemoveQuestionFromSection}
          handleEditQuestion={handleEditQuestion}
          isSectionQuestionsLoading={isSectionQuestionsLoading}
        />
      </div>

      <div className="xl:col-span-3 space-y-4">
        <BlueprintPanel
          blueprint={blueprint}
          settings={settings}
          sections={sections}
        />
      </div>
    </div>
  );
}
