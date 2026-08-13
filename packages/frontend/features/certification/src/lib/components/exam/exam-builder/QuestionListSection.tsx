import {
  Plus,
  Edit2,
  Folder,
  Sparkles,
  Upload,
  Filter,
  Search,
  Pencil,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { BuilderSection } from '../../../hooks/container-logic/exam/use-exam-builder-container-logic';
import { Pagination } from './Pagination';

const examBuilderText = CERTIFICATION_UI_TEXT.examBuilder;

interface QuestionListSectionProps {
  activeSection: BuilderSection | undefined;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalFilteredPages: number;
  totalFilteredCount: number;
  filteredQuestions: BuilderSection['questions'];
  pageSize: number;
  handleAddQuestionToSection: () => void;
  handleRemoveQuestionFromSection: (id: string) => void;
  handleEditQuestion: (id: string) => void;
  isSectionQuestionsLoading: boolean;
}

export const QuestionListSection = ({
  activeSection,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalFilteredPages,
  totalFilteredCount,
  filteredQuestions,
  pageSize,
  handleAddQuestionToSection,
  handleRemoveQuestionFromSection,
  handleEditQuestion,
  isSectionQuestionsLoading,
}: QuestionListSectionProps) => {
  const currentQuestionStart = totalFilteredCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const currentQuestionEnd = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <Card className="border-border shadow-sm bg-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <input
            value={activeSection ? `Section ${activeSection.number}: ${activeSection.title} (${activeSection.subtitle})` : ''}
            readOnly
            className="font-extrabold text-base text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 focus:outline-none py-0.5 px-1 rounded"
          />
          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground">
            {activeSection ? `${activeSection.questionCount} questions \u2022 ${activeSection.durationMinutes} minutes` : 'No section selected'}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleAddQuestionToSection}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 h-8 rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{examBuilderText.sectionDetail.addQuestion}</span>
          </Button>

          <Button
            variant="outline"
            disabled
            className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            <Folder className="w-3.5 h-3.5 text-blue-600" />
            <span>{examBuilderText.sectionDetail.bank}</span>
          </Button>

          <Button
            variant="outline"
            disabled
            className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{examBuilderText.sectionDetail.aiGenerate}</span>
          </Button>

          <Button
            variant="outline"
            disabled
            className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>{examBuilderText.sectionDetail.import}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            disabled
            className="text-xs font-bold py-1.5 px-2.5 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-not-allowed opacity-50"
            title="Coming soon"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </Button>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="pl-8 text-xs bg-background py-1 h-8 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-2">#</th>
              <th className="py-2.5 px-2">Question</th>
              <th className="py-2.5 px-2 text-center">Type</th>
              <th className="py-2.5 px-2 text-center">Difficulty</th>
              <th className="py-2.5 px-2 text-center">Points</th>
              <th className="py-2.5 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {isSectionQuestionsLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-muted-foreground font-medium">Loading questions...</span>
                  </div>
                </td>
              </tr>
            ) : filteredQuestions.map((question, questionIndex) => (
              <tr key={question.id} className="hover:bg-secondary/40 transition-colors">
                <td className="py-3 px-2 font-bold text-muted-foreground">{(currentPage - 1) * pageSize + questionIndex + 1}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2.5">
                    {question.imageUrl ? (
                      <img
                        src={question.imageUrl}
                        alt={question.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 font-black text-sm flex items-center justify-center flex-shrink-0">
                        {question.number}
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-foreground leading-snug">
                        {question.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-semibold text-foreground">
                  {question.type}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border-none ${
                    question.difficulty === 'Easy'
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : question.difficulty === 'Medium'
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                  }`}>
                    {question.difficulty}
                  </span>
                </td>
                <td className="py-3 px-2 text-center font-bold text-foreground">
                  {question.points}
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEditQuestion(question.id)}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-indigo-600 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveQuestionFromSection(question.id)}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-rose-600 cursor-pointer"
                    >
                      <span className="w-3.5 h-3.5">&#128465;</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isSectionQuestionsLoading && filteredQuestions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                  {searchQuery ? 'No questions match your search' : 'No questions in this section yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground font-semibold">
        <span>
          {totalFilteredCount > 0
            ? `Showing ${currentQuestionStart}-${currentQuestionEnd} of ${totalFilteredCount} questions`
            : 'No questions'}
        </span>

        <Pagination
          currentPage={currentPage}
          totalPages={totalFilteredPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </Card>
  );
};
