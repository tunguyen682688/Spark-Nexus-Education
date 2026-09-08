import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, FileText, Users } from 'lucide-react';
import type { ExamSectionContent } from '../../../types/exam-content-editor.types';
import { PART_TITLES } from '../../../constants/part-titles.constants';

interface QuestionNavPanelProps {
  sections: ExamSectionContent[];
  examTitle: string;
  selectedSectionId: string;
  selectedQuestionId: string;
  isFixedStructure?: boolean;
  onSelectQuestion: (sectionId: string, questionId: string) => void;
  onSelectSection: (sectionId: string) => void;
}

interface QuestionGroup {
  id: string;
  label: string;
  subtitle?: string;
  questions: ExamSectionContent['questions'];
}

function groupQuestions(questions: ExamSectionContent['questions']): QuestionGroup[] {
  const groupMap = new Map<string, ExamSectionContent['questions']>();

  for (const q of questions) {
    const gid = q.passageGroupId || q.id;
    if (!groupMap.has(gid)) {
      groupMap.set(gid, []);
    }
    groupMap.get(gid)!.push(q);
  }

  return Array.from(groupMap.entries()).map(([id, qs]) => {
    const firstQ = qs[0];
    const isPart7 = firstQ?.questionType?.startsWith('reading_comprehension_');
    const isTriple = firstQ?.questionType === 'reading_comprehension_triple';
    const isDouble = firstQ?.questionType === 'reading_comprehension_double';

    let label: string;
    let subtitle: string | undefined;

    if (qs.length > 1) {
      label = `Nhóm câu ${qs[0]?.order || 1}-${qs[qs.length - 1]?.order || qs.length}`;
      if (isPart7) {
        subtitle = isTriple ? '3 đoạn văn' : isDouble ? '2 đoạn văn' : '1 đoạn văn';
      }
    } else {
      label = `Câu ${qs[0]?.order || 1}`;
    }

    return { id, label, subtitle, questions: qs };
  });
}

export function QuestionNavPanel({
  sections,
  examTitle,
  selectedSectionId,
  selectedQuestionId,
  isFixedStructure = false,
  onSelectQuestion,
  onSelectSection,
}: QuestionNavPanelProps) {
  const [expandedParts, setExpandedParts] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const togglePart = useCallback((id: string) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const totalMinutes = sections.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPoints = sections.reduce(
    (sum, s) => sum + s.questions.reduce((qs, q) => qs + q.points, 0), 0,
  );

  // Calculate completion stats (only from loaded questions)
  const loadedQuestions = sections.flatMap((s) => s.questions);
  const completedQuestions = loadedQuestions.filter(
    (q) => q.questionText.trim().length > 0 && q.options.some((o) => o.isCorrect),
  ).length;
  const completionPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  // Check if a section has grouped questions (groupSize > 1)
  const hasGroups = useCallback((section: ExamSectionContent): boolean => {
    const firstQ = section.questions[0];
    if (!firstQ) return false;
    const gid = firstQ.passageGroupId || '';
    return section.questions.some((q) => q.passageGroupId === gid && q.id !== firstQ.id);
  }, []);

  return (
    <div className="w-72 h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border shrink-0">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Cấu trúc bài test
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold text-foreground truncate">{examTitle}</div>
          </div>
        </div>
      </div>

      {/* Parts list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {sections.map((section) => {
          const isExpanded = expandedParts.has(section.id);
          const isSelected = selectedSectionId === section.id;
          const partTitle = PART_TITLES[section.order] || section.title;
          const total = section.questions.length;
          const sectionHasGroups = hasGroups(section);
          const groups = sectionHasGroups ? groupQuestions(section.questions) : [];

          return (
            <div key={section.id}>
              {/* Part header */}
              <button
                onClick={() => { togglePart(section.id); onSelectSection(section.id); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 border-r-2 border-r-indigo-600'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-indigo-100 dark:bg-indigo-900/50'
                    : 'bg-muted/50'
                }`}>
                  {isExpanded ? (
                    <ChevronDown className={`w-3 h-3 ${isSelected ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                  ) : (
                    <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[11px] font-bold block truncate ${
                    isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground'
                  }`}>
                    Part {section.order} — {partTitle}
                  </span>
                </div>
                <span className={`text-[10px] font-bold shrink-0 ${
                  isSelected ? 'text-indigo-600' : 'text-muted-foreground'
                }`}>
                  {total} câu
                </span>
              </button>

              {/* Questions under part */}
              {isExpanded && (
                <div className="py-0.5">
                  {sectionHasGroups ? (
                    // Grouped questions (Parts 3, 4, 6, 7)
                    groups.map((group) => {
                      const isGroupExpanded = expandedGroups.has(group.id);
                      const hasSelected = group.questions.some((q) => q.id === selectedQuestionId);
                      const allFilled = group.questions.every((q) => q.questionText.trim().length > 0);
                      const someFilled = group.questions.some((q) => q.questionText.trim().length > 0);

                      return (
                        <div key={group.id}>
                          {/* Group header */}
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className={`w-full flex items-center gap-2 pl-8 pr-4 py-2 text-left transition-all cursor-pointer ${
                              hasSelected ? 'bg-indigo-100/50 dark:bg-indigo-900/20' : 'hover:bg-muted/30'
                            }`}
                          >
                            {isGroupExpanded ? (
                              <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
                            )}
                            <Users className="w-3 h-3 shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-foreground truncate block">
                                {group.label}
                              </span>
                              {group.subtitle && (
                                <span className="text-[8px] text-muted-foreground truncate block">
                                  {group.subtitle}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground">
                              {group.questions.length}
                            </span>
                            {allFilled ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            ) : someFilled ? (
                              <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                            ) : null}
                          </button>

                          {/* Questions in group */}
                          {isGroupExpanded && (
                            <div className="py-0.5">
                              {group.questions.map((question) => {
                                const isQSelected = selectedQuestionId === question.id;
                                const isFilled = question.questionText.trim().length > 0;
                                const hasAnswer = question.options.some((o) => o.isCorrect);

                                return (
                                  <button
                                    key={question.id}
                                    onClick={() => onSelectQuestion(section.id, question.id)}
                                    className={`w-full flex items-center gap-3 pl-16 pr-4 py-2 text-left transition-all cursor-pointer ${
                                      isQSelected
                                        ? 'bg-indigo-100/80 dark:bg-indigo-900/30'
                                        : 'hover:bg-muted/30'
                                    }`}
                                  >
                                    <span className={`w-5 text-right shrink-0 text-[11px] font-bold ${
                                      isQSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground'
                                    }`}>
                                      {question.order}
                                    </span>
                                    <span className={`flex-1 truncate text-[11px] ${
                                      isQSelected
                                        ? 'font-bold text-indigo-700 dark:text-indigo-300'
                                        : isFilled
                                          ? 'font-medium text-foreground'
                                          : 'text-muted-foreground'
                                    }`}>
                                      {isFilled ? (question.questionText?.trim() || `Câu ${question.order}`) : `Câu ${question.order}`}
                                    </span>
                                    {isFilled && hasAnswer ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : isFilled ? (
                                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0 shadow-sm" />
                                    ) : (
                                      <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/20 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Independent questions (Parts 1, 2, 5)
                    section.questions.map((question, idx) => {
                      const isQSelected = selectedQuestionId === question.id;
                      const isFilled = question.questionText.trim().length > 0;
                      const hasAnswer = question.options.some((o) => o.isCorrect);

                      return (
                        <button
                          key={question.id}
                          onClick={() => onSelectQuestion(section.id, question.id)}
                          className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 text-left transition-all cursor-pointer ${
                            isQSelected
                              ? 'bg-indigo-100/80 dark:bg-indigo-900/30'
                              : 'hover:bg-muted/30'
                          }`}
                        >
                          <span className={`w-5 text-right shrink-0 text-[11px] font-bold ${
                            isQSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground'
                          }`}>
                            {question.order || idx + 1}
                          </span>
                          <span className={`flex-1 truncate text-[11px] ${
                            isQSelected
                              ? 'font-bold text-indigo-700 dark:text-indigo-300'
                              : isFilled
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
                          }`}>
                            {isFilled ? (question.questionText?.trim() || `Câu ${idx + 1}`) : `Câu ${idx + 1}`}
                          </span>
                          {isFilled && hasAnswer ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : isFilled ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0 shadow-sm" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/20 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-border bg-gradient-to-b from-muted/20 to-muted/40 shrink-0">
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
          Thống kê bài test
        </div>
        {/* Completion Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-foreground">Tiến độ</span>
            <span className="text-[10px] font-bold text-indigo-600">{completionPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground mt-1">
            {completedQuestions}/{totalQuestions} câu hoàn thành
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-[16px] font-black text-foreground">{totalQuestions}</div>
            <div className="text-[9px] font-medium text-muted-foreground">câu hỏi</div>
          </div>
          <div className="text-center">
            <div className="text-[16px] font-black text-foreground">{totalMinutes}</div>
            <div className="text-[9px] font-medium text-muted-foreground">phút</div>
          </div>
          <div className="text-center">
            <div className="text-[16px] font-black text-foreground">{totalPoints}</div>
            <div className="text-[9px] font-medium text-muted-foreground">điểm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
