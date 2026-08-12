import type { EditorChapter, EditorExam, CollectionDetailsForm, SyncStatus } from './collection-editor.types';

export type { EditorChapter, EditorExam, CollectionDetailsForm, SyncStatus };

/** Subset of useCollectionEditorContainerLogic return passed to sub-components */
export interface EditorLogicState {
  isApiLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isEditMode: boolean;
  activeCollectionId: string | null;
  activeTab: 'Structure' | 'Settings' | 'Collaborators';
  setActiveTab: (tab: 'Structure' | 'Settings' | 'Collaborators') => void;
  activeChapterId: string;
  setActiveChapterId: (id: string) => void;
  activeChapter: EditorChapter | undefined;
  chapters: EditorChapter[];
  details: CollectionDetailsForm;
  setDetails: React.Dispatch<React.SetStateAction<CollectionDetailsForm>>;
  summary: {
    totalChapters: number;
    totalExams: number;
    totalQuestions: number;
    estimatedDurationText: string;
    difficultyMix: { easy: number; medium: number; hard: number };
  };
  newTagInput: string;
  setNewTagInput: (v: string) => void;
  isDetailsCollapsed: boolean;
  setIsDetailsCollapsed: (v: boolean) => void;
  handleAddChapter: () => void;
  handleUpdateActiveChapterTitle: (title: string) => void;
  handleUpdateActiveChapterDescription: (desc: string) => void;
  handleAddExamToChapter: () => void;
  handleRemoveExamFromChapter: (examId: string) => void;
  handleDeleteChapter: (chapterId: string) => void;
  handleReorderChapters: (oldIndex: number, newIndex: number) => void;
  handleRemoveTag: (tag: string) => void;
  handleAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSaveSettings: () => void;
  handleResetSettings: () => void;
  handleSaveDraft: () => void;
  handlePublishCollection: () => void;
  handlePreviewCollection: () => void;
  handleBackToDashboard: () => void;
  handleEditExam: (examId: string) => void;
  handleReorderExams: (oldIndex: number, newIndex: number) => void;
  isSaving: boolean;
  autosavedText: string;
  isAddExamModalOpen: boolean;
  setIsAddExamModalOpen: (v: boolean) => void;
  handleAddExamConfirm: (config: import('./collection-editor.types').AddExamConfig) => void;
  syncStatus: SyncStatus;
  isDirty: boolean;
  isOnline: boolean;
  handleRetrySync: () => void;
}
