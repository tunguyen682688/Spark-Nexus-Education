import { clearDraftFromStorage } from '../utils/local-storage-draft.util';
import type { BuilderSection, ExamSettingsForm } from '../types/exam-builder.types';
import { createNewSection, mapSectionsToSavePayload, reconcileSavedSectionIds } from './exam-builder-helpers.service';

const DRAFT_PREFIX = 'sne-exam-builder-draft';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SectionHandlerDeps {
  examId: string;
  activeSectionId: string;
  sections: BuilderSection[];
  sectionsRef: React.MutableRefObject<BuilderSection[]>;
  settingsRef: React.MutableRefObject<ExamSettingsForm>;
  setSections: React.Dispatch<React.SetStateAction<BuilderSection[]>>;
  setActiveSectionId: (id: string) => void;
  setIsDirty: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  isSavingRef: React.MutableRefObject<boolean>;
  cancelAutoSave: () => void;
  saveSectionsMutation: { mutateAsync: (...args: any[]) => Promise<any> };
  updateExamMutation: { mutateAsync: (...args: any[]) => Promise<any> };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function createSectionHandlers(deps: SectionHandlerDeps) {
  const {
    examId, activeSectionId, sections, sectionsRef, settingsRef,
    setSections, setActiveSectionId, setIsDirty, setIsSaving, isSavingRef,
    cancelAutoSave, saveSectionsMutation, updateExamMutation,
  } = deps;

  const handleAddSection = () => {
    const newSection = createNewSection(sections.length + 1);
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
    setIsDirty(true);
  };

  const handleUpdateActiveSectionTitle = (newTitle: string) => {
    setSections((prev) =>
      prev.map((section) => (section.id === activeSectionId ? { ...section, title: newTitle } : section)),
    );
    setIsDirty(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    let nextActiveSectionId: string | null = null;
    setSections((prev) => {
      if (prev.length <= 1) return prev;
      const remaining = prev
        .filter((section) => section.id !== sectionId)
        .map((section, i) => ({ ...section, number: i + 1 }));
      if (activeSectionId === sectionId && remaining.length > 0) {
        nextActiveSectionId = remaining[0].id;
      }
      return remaining;
    });
    if (nextActiveSectionId !== null) {
      setActiveSectionId(nextActiveSectionId);
    }
    setIsDirty(true);
  };

  const handleSaveDraft = async (): Promise<boolean> => {
    if (!examId) return false;
    if (isSavingRef.current) return false;
    setIsSaving(true);
    cancelAutoSave();
    try {
      const currentSections = sectionsRef.current;
      const currentSettings = settingsRef.current;

      const sectionResult = await saveSectionsMutation.mutateAsync({
        examId,
        sections: mapSectionsToSavePayload(currentSections),
        silent: true,
      });
      if (Array.isArray(sectionResult) && sectionResult.length > 0) {
        setSections((prev) => reconcileSavedSectionIds(prev, sectionResult.map((r: { id: string }) => r.id)));
      }

      await updateExamMutation.mutateAsync({
        examId,
        collectionId: '',
        title: currentSettings.title,
        description: currentSettings.description,
        passScore: currentSettings.passingScore,
        maxScore: currentSettings.maxScore,
        examType: currentSettings.examType,
        publishStatus: 'draft',
        silent: true,
      });

      clearDraftFromStorage(examId, DRAFT_PREFIX);
      setIsDirty(false);
      return true;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishExam = async () => {
    if (!examId) return;
    const saved = await handleSaveDraft();
    if (!saved) return;
    await updateExamMutation.mutateAsync({ examId, collectionId: '', publishStatus: 'published' });
  };

  return { handleAddSection, handleUpdateActiveSectionTitle, handleDeleteSection, handleSaveDraft, handlePublishExam };
}
