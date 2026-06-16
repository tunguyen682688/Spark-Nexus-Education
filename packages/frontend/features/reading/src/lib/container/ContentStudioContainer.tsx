import React, { useState } from 'react';
import { useStudioEditor } from '../hooks/use-studio-editor';
import { StudioHeader } from '../components/studio/StudioHeader';
import { ContentTypeTabs } from '../components/studio/ContentTypeTabs';
import { StudioEmptyState } from '../components/studio/StudioEmptyState';
import { StudioEditor } from '../components/studio/StudioEditor';
import { StudioFooter } from '../components/studio/StudioFooter';
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

  // Book State (Local functional state for Chapters)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isOverviewActive, setIsOverviewActive] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chapters, setChapters] = useState<{ id: string, title: string, content: any, isDraft: boolean }[]>([
    { id: '1', title: 'Chương 1: Khởi đầu', content: null, isDraft: true }
  ]);

  const handleAddChapter = () => {
    const newId = Date.now().toString();
    
    // Auto-save the current chapter before switching
    if (activeChapterId && !isOverviewActive) {
      setChapters(prev => prev.map(ch => 
        ch.id === activeChapterId 
          ? { ...ch, title: form.getValues('title'), content: form.getValues('content') } 
          : ch
      ));
    }

    setChapters(prev => [...prev, { id: newId, title: 'Chương mới', content: null, isDraft: true }]);
    setActiveChapterId(newId);
    setIsOverviewActive(false);
    
    // Reset form for the new chapter
    form.setValue('title', 'Chương mới', { shouldDirty: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue('content', null as any, { shouldDirty: true });
    form.setValue('summary', '', { shouldDirty: true });
  };

  const handleSelectChapter = (id: string) => {
    // Auto-save current chapter
    if (activeChapterId && !isOverviewActive) {
      setChapters(prev => prev.map(ch => 
        ch.id === activeChapterId 
          ? { ...ch, title: form.getValues('title'), content: form.getValues('content') } 
          : ch
      ));
    }
    
    const target = chapters.find(c => c.id === id);
    if (target) {
      form.setValue('title', target.title || '', { shouldDirty: true });
      form.setValue('content', target.content || null, { shouldDirty: true });
    }
    
    setActiveChapterId(id);
    setIsOverviewActive(false);
  };

  const handleSelectOverview = () => {
    if (activeChapterId && !isOverviewActive) {
      setChapters(prev => prev.map(ch => 
        ch.id === activeChapterId 
          ? { ...ch, title: form.getValues('title'), content: form.getValues('content') } 
          : ch
      ));
    }
    setIsOverviewActive(true);
  };

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
  } = useStudioEditor(articleId);

  const onPublishClick = async () => {
    try {
      await handlePublish();
      toast({
        title: "Thành công",
        description: STUDIO_UI_TEXT.TOAST_PUBLISHED,
        variant: "default",
      });
      // Redirect back to hub or detail page
      navigate(ROUTES.READING.HUB);
    } catch {
      toast({
        title: "Lỗi",
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
        title: "Đã xoá",
        description: STUDIO_UI_TEXT.TOAST_DELETED,
      });
    } catch {
      toast({
        title: "Lỗi",
        description: STUDIO_UI_TEXT.TOAST_ERROR,
        variant: "destructive",
      });
    }
  };

  const contentType = form.watch('contentType');
  const status = form.watch('status');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      <VocabularyPanel />

      {/* Fixed Header */}
      <StudioHeader 
        status={status} 
        onPreview={() => setShowPreviewModal(true)}
        canPreview={isEditing && form.watch('title').length > 0}
      />

      {/* Main Workspace */}
      <div className="flex-1 w-full mx-auto p-0 flex flex-col">
        
        {/* Content Type Tabs - always visible */}
        <div className="mb-6 px-6 mt-6">
          <ContentTypeTabs 
            value={contentType} 
            onChange={handleStartEditing} 
            disabled={isEditing && wordCount > 0} 
          />
        </div>

        {/* Dynamic Area: Empty State OR Editor */}
        {!isEditing ? (
          <div className="px-6 pb-6">
          <StudioEmptyState 
            onCreateNew={() => handleStartEditing('article')}
            onImportUrl={() => {
              toast({ title: "Thông báo", description: "Tính năng nhập từ URL sẽ sớm ra mắt." });
            }}
            onChooseTemplate={() => setShowTemplateModal(true)}
          />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden bg-slate-50/30 dark:bg-transparent">
            {/* Left Sidebar */}
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
            
            {/* Main Center Editor */}
            <div className="flex-1 overflow-y-auto relative">
              {contentType === 'book' && isOverviewActive ? (
                <BookOverview 
                  form={form} 
                  chapters={chapters}
                  onEditChapter={handleSelectChapter}
                />
              ) : (
                <StudioEditor form={form} wordCount={wordCount} estimatedReadTime={estimatedReadTime} />
              )}
            </div>

            {/* Right Sidebar */}
            {contentType === 'book' ? (
              <BookRightSidebar form={form} />
            ) : (
              <ArticleRightSidebar form={form} />
            )}

          </div>
        )}
      </div>

      {/* Fixed Footer - Only show when editing */}
      {isEditing && (
        <StudioFooter 
          onDiscard={onDiscardClick}
          onSaveDraft={handleSaveDraft}
          onPublish={onPublishClick}
          canPublish={canPublish}
          saveStatus={saveStatus}
          lastSavedAt={lastSavedAt}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      )}

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
