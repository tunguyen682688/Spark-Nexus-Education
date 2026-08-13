import type { BuilderSection } from '../types/exam-builder.types';
import type { SaveQuestionDto } from '../types';
import { createNewQuestion, mapSectionsToSavePayload, reconcileSavedSectionIds } from './exam-builder-helpers.service';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuestionHandlerDeps {
  examId: string;
  activeSectionId: string;
  sectionsRef: React.MutableRefObject<BuilderSection[]>;
  setSections: React.Dispatch<React.SetStateAction<BuilderSection[]>>;
  setActiveSectionId: (id: string) => void;
  setIsDirty: (value: boolean) => void;
  isAddingQuestionRef: React.MutableRefObject<boolean>;
  saveSectionsMutation: { mutateAsync: (...args: any[]) => Promise<any> };
  saveQuestionMutation: { mutateAsync: (...args: any[]) => Promise<any> };
  linkQuestionMutation: { mutateAsync: (...args: any[]) => Promise<any> };
  unlinkQuestionMutation: { mutate: (...args: any[]) => void };
  refetch: () => Promise<unknown>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function createQuestionHandlers(deps: QuestionHandlerDeps) {
  const {
    examId, activeSectionId, sectionsRef, setSections, setActiveSectionId,
    setIsDirty, isAddingQuestionRef, saveSectionsMutation, saveQuestionMutation,
    linkQuestionMutation, unlinkQuestionMutation, refetch,
  } = deps;

  const isTemporarySectionId = (id: string) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const handleAddQuestionToSection = async () => {
    if (!examId || !activeSectionId) return;
    if (isAddingQuestionRef.current) return;

    const currentSection = sectionsRef.current.find((s) => s.id === activeSectionId);
    if (!currentSection) return;

    isAddingQuestionRef.current = true;

    let resolvedSectionId = activeSectionId;
    try {
      if (isTemporarySectionId(activeSectionId)) {
        const sectionResult = await saveSectionsMutation.mutateAsync({
          examId,
          sections: mapSectionsToSavePayload(sectionsRef.current),
          silent: true,
        });
        if (Array.isArray(sectionResult) && sectionResult.length > 0) {
          const updated = reconcileSavedSectionIds(sectionsRef.current, sectionResult.map((r: { id: string }) => r.id));
          const idx = sectionsRef.current.findIndex((s) => s.id === activeSectionId);
          if (idx >= 0 && sectionResult[idx]) {
            resolvedSectionId = sectionResult[idx].id;
          }
          setSections(updated);
          setActiveSectionId(resolvedSectionId);
        }
      }
    } catch {
      isAddingQuestionRef.current = false;
      return;
    }

    const optimisticQuestion = createNewQuestion(currentSection.questions.length + 1);
    const tempId = optimisticQuestion.id;

    setSections((prev) =>
      prev.map((section) =>
        section.id === resolvedSectionId
          ? { ...section, questions: [...section.questions, optimisticQuestion], questionCount: section.questions.length + 1 }
          : section,
      ),
    );
    setIsDirty(true);

    try {
      const payload: SaveQuestionDto = {
        questionText: optimisticQuestion.title,
        questionType: 'SINGLE_CHOICE',
        difficulty: optimisticQuestion.difficulty,
        shuffleOptions: false,
        options: [
          { id: `${tempId}-opt-a`, label: 'A', text: 'Option A', isCorrect: true },
          { id: `${tempId}-opt-b`, label: 'B', text: 'Option B', isCorrect: false },
        ],
        points: optimisticQuestion.points,
        target: 'exam',
      };

      const saveResult = await saveQuestionMutation.mutateAsync(payload);
      if (saveResult?.id) {
        await linkQuestionMutation.mutateAsync({
          examId,
          questionId: saveResult.id,
          order: optimisticQuestion.number - 1,
          points: optimisticQuestion.points,
          sectionId: resolvedSectionId,
        });
        setSections((prev) =>
          prev.map((section) =>
            section.id === resolvedSectionId
              ? { ...section, questions: section.questions.map((q) => (q.id === tempId ? { ...q, id: saveResult.id, status: 'Linked' } : q)) }
              : section,
          ),
        );
      }
    } catch {
      setSections((prev) =>
        prev.map((section) =>
          section.id === resolvedSectionId
            ? { ...section, questions: section.questions.filter((q) => q.id !== tempId), questionCount: Math.max(0, section.questions.length - 1) }
            : section,
        ),
      );
    } finally {
      isAddingQuestionRef.current = false;
    }
  };

  const handleRemoveQuestionFromSection = (questionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSectionId
          ? { ...section, questions: section.questions.filter((q) => q.id !== questionId), questionCount: Math.max(0, section.questions.length - 1) }
          : section,
      ),
    );
    setIsDirty(true);

    if (examId && activeSectionId) {
      unlinkQuestionMutation.mutate(
        { examId, questionId, sectionId: activeSectionId, silent: true },
        { onError: () => { refetch(); } }
      );
    }
  };

  return { handleAddQuestionToSection, handleRemoveQuestionFromSection };
}
