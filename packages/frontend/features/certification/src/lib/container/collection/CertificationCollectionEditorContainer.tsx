import {
  useCollectionEditorContainerLogic,
} from '../../hooks/editor/use-collection-editor-container-logic';
import { AddExamModal } from '../../components/collection/AddExamModal';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { EditorHeader } from '../../components/collection/EditorHeader';
import { EditorTabs } from '../../components/collection/EditorTabs';
import { StructureSidebar } from '../../components/collection/StructureSidebar';
import { ChapterDetailPanel } from '../../components/collection/ChapterDetailPanel';
import { DetailsSidebar } from '../../components/collection/DetailsSidebar';
import { SettingsTab } from '../../components/collection/SettingsTab';
import { CollaboratorsTab } from '../../components/collection/CollaboratorsTab';
import { DeleteDialogs } from '../../components/collection/DeleteDialogs';

export const CertificationCollectionEditorContainer = () => {
  const logic = useCollectionEditorContainerLogic();
  const {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    isAddExamModalOpen,
    setIsAddExamModalOpen,
    handleAddExamConfirm,
    activeChapter,
    confirmDeleteChapterId,
    setConfirmDeleteChapterId,
    confirmDeleteExamId,
    setConfirmDeleteExamId,
    isReorderMode,
    setIsReorderMode,
  } = logic;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.defaultMessage} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-20">
      <EditorHeader
        isEditMode={logic.isEditMode}
        details={logic.details}
        isOnline={logic.isOnline}
        syncStatus={logic.syncStatus}
        autosavedText={logic.autosavedText}
        isDirty={logic.isDirty}
        isSaving={logic.isSaving}
        handlePreviewCollection={logic.handlePreviewCollection}
        handleSaveDraft={logic.handleSaveDraft}
        handlePublishCollection={logic.handlePublishCollection}
        handleBackToDashboard={logic.handleBackToDashboard}
        handleRetrySync={logic.handleRetrySync}
      />

      <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Structure' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <StructureSidebar
            chapters={logic.chapters}
            activeChapterId={logic.activeChapterId}
            setActiveChapterId={logic.setActiveChapterId}
            handleAddChapter={logic.handleAddChapter}
            handleDeleteChapter={logic.handleDeleteChapter}
            handleReorderChapters={logic.handleReorderChapters}
            isSaving={logic.isSaving}
          />
          <ChapterDetailPanel
            activeChapter={activeChapter}
            handleUpdateActiveChapterTitle={logic.handleUpdateActiveChapterTitle}
            handleUpdateActiveChapterDescription={logic.handleUpdateActiveChapterDescription}
            handleAddExamToChapter={logic.handleAddExamToChapter}
            handleRemoveExamFromChapter={logic.handleRemoveExamFromChapter}
            handleReorderExams={logic.handleReorderExams}
            handleEditExam={logic.handleEditExam}
            summary={logic.summary}
            isSaving={logic.isSaving}
            setIsAddExamModalOpen={setIsAddExamModalOpen}
            isReorderMode={isReorderMode}
            onToggleReorder={() => setIsReorderMode((prev) => !prev)}
          />
          <DetailsSidebar
            details={logic.details}
            setDetails={logic.setDetails}
            newTagInput={logic.newTagInput}
            setNewTagInput={logic.setNewTagInput}
            isDetailsCollapsed={logic.isDetailsCollapsed}
            setIsDetailsCollapsed={logic.setIsDetailsCollapsed}
            handleRemoveTag={logic.handleRemoveTag}
            handleAddTag={logic.handleAddTag}
          />
        </div>
      )}

      {activeTab === 'Settings' && (
        <SettingsTab
          details={logic.details}
          setDetails={logic.setDetails}
          newTagInput={logic.newTagInput}
          setNewTagInput={logic.setNewTagInput}
          isDirty={logic.isDirty}
          isSaving={logic.isSaving}
          handleSaveSettings={logic.handleSaveSettings}
          handleResetSettings={logic.handleResetSettings}
          handleRemoveTag={logic.handleRemoveTag}
          handleAddTag={logic.handleAddTag}
        />
      )}

      {activeTab === 'Collaborators' && <CollaboratorsTab />}

      <AddExamModal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        onConfirm={handleAddExamConfirm}
        chapterTitle={activeChapter?.title}
        existingExamCount={activeChapter?.exams?.length ?? 0}
      />

      <DeleteDialogs
        confirmDeleteChapterId={confirmDeleteChapterId}
        setConfirmDeleteChapterId={setConfirmDeleteChapterId}
        confirmDeleteExamId={confirmDeleteExamId}
        setConfirmDeleteExamId={setConfirmDeleteExamId}
        handleDeleteChapter={logic.handleDeleteChapter}
        handleRemoveExamFromChapter={logic.handleRemoveExamFromChapter}
      />
    </div>
  );
};
