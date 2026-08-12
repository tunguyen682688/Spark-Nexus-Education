import { CheckCircle2, Eye, RefreshCw, Save, Send } from 'lucide-react';
import { Button, Badge, Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@spark-nest-ed/frontend-shared-components';
import { useExamBuilderContainerLogic } from '../../hooks/container-logic/exam/use-exam-builder-container-logic';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { ExamBuilderBuildTab } from '../../components/exam/exam-builder/ExamBuilderBuildTab';
import { ExamBuilderSettingsTab } from '../../components/exam/exam-builder/ExamBuilderSettingsTab';
import { ExamBuilderReviewTab } from '../../components/exam/exam-builder/ExamBuilderReviewTab';

const breadcrumbText = CERTIFICATION_UI_TEXT.breadcrumbs;

export const CertificationExamBuilderContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    collectionId,
    collectionTitle,
    activeTab,
    setActiveTab,
    activeSubTab,
    setActiveSubTab,
    activeSectionId,
    setActiveSectionId,
    activeSection,
    sections,
    settings,
    setSettings,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalFilteredPages,
    totalFilteredCount,
    filteredQuestions,
    pageSize,
    blueprint,
    handleAddSection,
    handleUpdateActiveSectionTitle,
    handleDeleteSection,
    handleAddQuestionToSection,
    handleRemoveQuestionFromSection,
    handleSaveDraft,
    handlePublishExam,
    handlePreviewExam,
    handleEditQuestion,
    isSaving,
    isDirty,
    isSectionQuestionsLoading,
    navigateToCreatorDashboard,
    navigateToCollectionEditor,
  } = useExamBuilderContainerLogic();

  const examBuilderText = CERTIFICATION_UI_TEXT.examBuilder;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.defaultMessage} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList className="text-xs font-semibold text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink onClick={navigateToCreatorDashboard} className="hover:text-foreground transition-colors cursor-pointer">
                {breadcrumbText.creatorDashboard}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {collectionId ? (
                <BreadcrumbLink onClick={() => navigateToCollectionEditor(collectionId)} className="hover:text-foreground transition-colors cursor-pointer">
                  {collectionTitle || 'Untitled Collection'}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{collectionTitle || 'Untitled Collection'}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{settings.title || 'Untitled'}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-indigo-600 font-extrabold">{breadcrumbText.build}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {examBuilderText.title}
              </h1>
              <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border-none">
                {isDirty ? 'Unsaved' : examBuilderText.badgeDraft}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {examBuilderText.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mr-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : examBuilderText.savedStatus}</span>
            </div>

            <Button
              onClick={() => refetch()}
              variant="outline"
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={handlePreviewExam}
              variant="outline"
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>{examBuilderText.previewBtn}</span>
            </Button>

            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{examBuilderText.saveDraftBtn}</span>
            </Button>

            <Button
              onClick={handlePublishExam}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{examBuilderText.publishBtn}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex items-center gap-6">
          {([examBuilderText.tabs.build, examBuilderText.tabs.settings, examBuilderText.tabs.reviewPublish] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === tab
                  ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Build' && (
        <ExamBuilderBuildTab
          activeSectionId={activeSectionId}
          setActiveSectionId={setActiveSectionId}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          activeSection={activeSection}
          sections={sections}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalFilteredPages={totalFilteredPages}
          totalFilteredCount={totalFilteredCount}
          filteredQuestions={filteredQuestions}
          pageSize={pageSize}
          blueprint={blueprint}
          settings={settings}
          handleAddSection={handleAddSection}
          handleUpdateActiveSectionTitle={handleUpdateActiveSectionTitle}
          handleDeleteSection={handleDeleteSection}
          handleAddQuestionToSection={handleAddQuestionToSection}
          handleRemoveQuestionFromSection={handleRemoveQuestionFromSection}
          handleEditQuestion={handleEditQuestion}
          isSectionQuestionsLoading={isSectionQuestionsLoading}
        />
      )}

      {activeTab === 'Settings' && (
        <ExamBuilderSettingsTab
          settings={settings}
          setSettings={setSettings}
          blueprint={blueprint}
        />
      )}

      {activeTab === 'Review & Publish' && (
        <ExamBuilderReviewTab
          settings={settings}
          sections={sections}
          blueprint={blueprint}
          handleSaveDraft={handleSaveDraft}
          handlePublishExam={handlePublishExam}
        />
      )}
    </div>
  );
};
