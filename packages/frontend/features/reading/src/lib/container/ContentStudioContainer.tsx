import React, { useState } from 'react';
import { useStudioEditor } from '../hooks/use-studio-editor';
import { StudioHeader } from '../components/studio/StudioHeader';
import { ContentTypeTabs } from '../components/studio/ContentTypeTabs';
import { StudioEmptyState } from '../components/studio/StudioEmptyState';
import { StudioEditor } from '../components/studio/StudioEditor';
import { BookStudioSidebar } from '../components/studio/BookStudioSidebar';
import { BookOverview } from '../components/studio/BookOverview';
import { TemplatePickerModal } from '../components/studio/TemplatePickerModal';
import { StudioPreviewModal } from '../components/studio/StudioPreviewModal';
import { VocabularyPanel } from '../components/studio/VocabularyPanel';
import { ArticleLeftSidebar } from '../components/studio/ArticleLeftSidebar';
import { ArticleRightSidebar } from '../components/studio/ArticleRightSidebar';
import { BookRightSidebar } from '../components/studio/BookRightSidebar';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { STUDIO_UI_TEXT } from '../constants/studio-ui-text';

interface ContentStudioContainerProps {
  articleId?: string;
}

export const ContentStudioContainer: React.FC<ContentStudioContainerProps> = ({ articleId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const {
    form,
    isEditing,
    saveStatus,
    lastSavedAt,
    wordCount,
    estimatedReadTime,
    canPublish,
    isCreating,
    isUpdating,
    isDeleting,
    handleStartEditing,
    handleApplyTemplate,
    handleSaveDraft,
    handlePublish,
    handleDiscard,
    activeChapterId,
    isOverviewActive,
    chapters,
    handleAddChapter,
    handleSelectChapter,
    handleSelectOverview,
  } = useStudioEditor(articleId);

  const onPublishClick = async () => {
    try {
      await handlePublish();
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_SUCCESS,
        description: STUDIO_UI_TEXT.TOAST_PUBLISHED,
        variant: "default",
      });
      // Redirect back to hub or detail page
      navigate(ROUTES.READING.HUB);
    } catch {
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_ERROR,
        description: STUDIO_UI_TEXT.TOAST_ERROR,
        variant: "destructive",
      });
    }
  };

  const onDiscardClick = async () => {
    try {
      await handleDiscard();
      if (articleId) {
        // If editing an existing one, navigate back
        navigate(-1);
      }
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_DELETED,
        description: STUDIO_UI_TEXT.TOAST_DELETED,
      });
    } catch {
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_ERROR,
        description: STUDIO_UI_TEXT.TOAST_ERROR,
        variant: "destructive",
      });
    }
  };

  const contentType = form.watch('contentType');
  const status = form.watch('status');

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col font-sans">
      
      <VocabularyPanel />

      {/* Fixed Header */}
      <StudioHeader 
        status={status} 
        onPreview={() => setShowPreviewModal(true)}
        canPreview={isEditing && form.watch('title').length > 0}
        onDiscard={onDiscardClick}
        onSaveDraft={() => handleSaveDraft(true)}
        onPublish={onPublishClick}
        canPublish={canPublish}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        isCreating={isCreating}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        isEditing={isEditing}
      />

      {/* Main Workspace */}
      <div className="flex-1 w-full mx-auto p-0 flex flex-col min-h-0">
        
        {/* Dynamic Area: Empty State OR Editor */}
        {!isEditing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background/50 dark:bg-[#0A0D14]/50 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <ContentTypeTabs 
                  value={contentType} 
                  onChange={handleStartEditing} 
                />
              </div>
              <div className="w-full">
                <StudioEmptyState 
                  onCreateNew={() => handleStartEditing(contentType)}
                  isCreating={isCreating}
                  onImportUrl={() => {
                    toast({ title: STUDIO_UI_TEXT.TOAST_TITLE_INFO, description: STUDIO_UI_TEXT.TOAST_URL_IMPORT_COMMING_SOON });
                  }}
                  onChooseTemplate={() => setShowTemplateModal(true)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden bg-slate-50/30 dark:bg-transparent min-h-0 p-4 lg:p-6 gap-4 lg:gap-6">
            {/* Left Sidebar */}
            <div className="w-64 flex flex-col shrink-0 h-full rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5 bg-white/40 dark:bg-[#121826]/80 backdrop-blur-xl">
              {contentType === 'book' ? (
                <BookStudioSidebar 
                  chapters={chapters}
                  activeChapterId={activeChapterId}
                  onChapterSelect={handleSelectChapter}
                  onSelectOverview={handleSelectOverview}
                  onAddChapter={handleAddChapter}
                  isOverviewActive={isOverviewActive}
                />
              ) : (
                <ArticleLeftSidebar form={form} />
              )}
            </div>
            
            {/* Main Center Editor */}
            <div className="flex-1 h-full overflow-y-auto relative rounded-xl bg-white dark:bg-[#0A0D14] shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5 z-10">
              {contentType === 'book' && isOverviewActive ? (
                <BookOverview 
                  form={form} 
                  chapters={chapters}
                  onEditChapter={handleSelectChapter}
                />
              ) : (
                <StudioEditor 
                  form={form} 
                  wordCount={wordCount} 
                  estimatedReadTime={estimatedReadTime} 
                  isChapter={contentType === 'book' && !isOverviewActive} 
                />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-80 flex flex-col shrink-0 h-full rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5 bg-white/40 dark:bg-[#121826]/80 backdrop-blur-xl">
              {contentType === 'book' ? (
                <BookRightSidebar form={form} />
              ) : (
                <ArticleRightSidebar form={form} />
              )}
            </div>

          </div>
        )}
      </div>



      {/* Modals */}
      <TemplatePickerModal 
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleApplyTemplate}
      />

      <StudioPreviewModal 
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        values={form.getValues()}
      />

    </div>
  );
};

export default ContentStudioContainer;
