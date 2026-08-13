import { useMemo } from 'react';
import { Card } from '@spark-nest-ed/frontend-shared-components';
import { useQuestionBuilderContainerLogic } from '../../hooks/container-logic/exam/use-question-builder-container-logic';
import { useQuestionHistory } from '../../hooks/use-certification';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { ExplanationTab } from '../../components/collection/ExplanationTab';
import { TagsSkillsTab } from '../../components/collection/TagsSkillsTab';
import { HistoryTab } from '../../components/exam/HistoryTab';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { getQuestionTypeConfig, getQuestionTypesByCategory } from '../../constants/question-type-config.constants';
import type { QuestionTypeCategory } from '../../constants/question-type-config.constants';
import { QuestionTabBody } from '../../components/exam/question-builder/QuestionTabBody';
import { QuestionPreviewPanel } from '../../components/exam/exam-builder/QuestionPreviewPanel';
import { QuestionPropertiesPanel } from '../../components/exam/exam-builder/QuestionPropertiesPanel';
import { QuestionBuilderBreadcrumb } from '../../components/exam/question-builder/QuestionBuilderBreadcrumb';
import { QuestionBuilderHeader } from '../../components/exam/question-builder/QuestionBuilderHeader';
import { QuestionBuilderTabNav } from '../../components/exam/question-builder/QuestionBuilderTabNav';
import { QuestionBuilderBottomNav } from '../../components/exam/question-builder/QuestionBuilderBottomNav';

export const CertificationQuestionBuilderContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    collectionId,
    collectionTitle,
    examTitle,
    certificationType,
    qualityScore,
    sectionLabel,
    activeTab,
    setActiveTab,
    previewViewport,
    setPreviewViewport,
    questionId,
    examId,
    questionText,
    setQuestionText,
    questionType,
    setQuestionType,
    options,
    explanation,
    setExplanation,
    referenceType,
    setReferenceType,
    passageSource,
    setPassageSource,
    highlight,
    setHighlight,
    properties,
    setProperties,
    audioUrl,
    setAudioUrl,
    imageUrl,
    setImageUrl,
    passageId,
    setPassageId,
    gridInAnswer,
    setGridInAnswer,
    matchingPairs,
    setMatchingPairs,
    wordRoot,
    setWordRoot,
    keyWord,
    setKeyWord,
    writingTaskType,
    setWritingTaskType,
    speakingPrompt,
    setSpeakingPrompt,
    handleSelectCorrectOption,
    handleAddOption,
    handleAddOtherOption,
    handleRemoveOption,
    handleUpdateOptionText,
    handleRemoveTag,
    handleRemoveSkill,
    handleSaveQuestion,
    handleSaveToBank,
    handleDeleteQuestion,
    handlePreviousQuestion,
    handleNextQuestion,
    hasPreviousQuestion,
    hasNextQuestion,
    questionNumber,
    showPreview,
    setShowPreview,
    navigateToCreatorDashboard,
    navigateToCollectionEditor,
    navigateToExamBuilder,
  } = useQuestionBuilderContainerLogic();

  const { data: historyData, isLoading: historyLoading } = useQuestionHistory(questionId);

  const activeConfig = useMemo(() => getQuestionTypeConfig(certificationType, questionType), [certificationType, questionType]);
  const grouped = useMemo(() => getQuestionTypesByCategory(certificationType), [certificationType]);
  const categories = useMemo(() => (Object.keys(grouped) as QuestionTypeCategory[]).filter(k => grouped[k].length > 0), [grouped]);

  const questionBuilderText = CERTIFICATION_UI_TEXT.questionBuilder;
  const breadcrumbText = CERTIFICATION_UI_TEXT.breadcrumbs;

  if (!questionId) {
    return <ErrorState title="No Question Selected" message="Please select a question to edit." onRetry={navigateToCreatorDashboard} />;
  }

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.defaultMessage} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <QuestionBuilderBreadcrumb
        collectionId={collectionId}
        collectionTitle={collectionTitle}
        examId={examId}
        examTitle={examTitle}
        questionNumber={questionNumber}
        breadcrumbText={breadcrumbText}
        navigateToCreatorDashboard={navigateToCreatorDashboard}
        navigateToCollectionEditor={navigateToCollectionEditor}
        navigateToExamBuilder={navigateToExamBuilder}
      />

      <QuestionBuilderHeader
        questionBuilderText={questionBuilderText}
        hasPreviousQuestion={hasPreviousQuestion}
        hasNextQuestion={hasNextQuestion}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        handlePreviousQuestion={handlePreviousQuestion}
        handleNextQuestion={handleNextQuestion}
        handleSaveToBank={handleSaveToBank}
        handleSaveQuestion={handleSaveQuestion}
        onRefresh={refetch}
      />

      <QuestionBuilderTabNav
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab as any)}
        questionBuilderText={questionBuilderText}
      />

      {activeTab === 'Question' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-9 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <QuestionTabBody
                  questionType={questionType}
                  questionText={questionText}
                  options={options}
                  audioUrl={audioUrl}
                  imageUrl={imageUrl}
                  passageId={passageId}
                  gridInAnswer={gridInAnswer}
                  matchingPairs={matchingPairs}
                  wordRoot={wordRoot}
                  keyWord={keyWord}
                  writingTaskType={writingTaskType}
                  speakingPrompt={speakingPrompt}
                  referenceType={referenceType}
                  passageSource={passageSource}
                  highlight={highlight}
                  activeConfig={activeConfig}
                  grouped={grouped}
                  categories={categories}
                  onQuestionTypeChange={setQuestionType}
                  onQuestionTextChange={setQuestionText}
                  onSelectCorrectOption={handleSelectCorrectOption}
                  onAddOption={handleAddOption}
                  onAddOtherOption={handleAddOtherOption}
                  onRemoveOption={handleRemoveOption}
                  onUpdateOptionText={handleUpdateOptionText}
                  onAudioUrlChange={setAudioUrl}
                  onImageUrlChange={setImageUrl}
                  onPassageIdChange={setPassageId}
                  onGridInAnswerChange={setGridInAnswer}
                  onMatchingPairsChange={setMatchingPairs}
                  onWordFormationRootChange={setWordRoot}
                  onKeyWordChange={setKeyWord}
                  onWritingTaskTypeChange={setWritingTaskType}
                  onSpeakingPromptChange={setSpeakingPrompt}
                  onReferenceTypeChange={setReferenceType}
                  onPassageSourceChange={setPassageSource}
                  onHighlightChange={setHighlight}
                />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <QuestionPreviewPanel
                  questionText={questionText}
                  questionNumber={questionNumber}
                  options={options}
                  previewViewport={previewViewport}
                  setPreviewViewport={setPreviewViewport}
                />
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            <QuestionPropertiesPanel
              properties={properties}
              setProperties={setProperties}
              handleRemoveTag={handleRemoveTag}
              handleRemoveSkill={handleRemoveSkill}
              qualityScore={qualityScore}
              examTitle={examTitle}
              sectionLabel={sectionLabel}
            />
          </div>
        </div>
      )}

      {activeTab === 'Explanation' && (
        <Card className="border-border shadow-sm bg-card p-6">
          <ExplanationTab
            explanation={explanation}
            referenceType={referenceType}
            passageSource={passageSource}
            highlight={highlight}
            onExplanationChange={setExplanation}
          />
        </Card>
      )}

      {activeTab === 'Tags & Skills' && (
        <Card className="border-border shadow-sm bg-card p-6">
          <TagsSkillsTab
            tags={properties.tags}
            skills={properties.skills}
            cognitiveLevel={properties.cognitiveLevel}
            onTagsChange={(tags) => setProperties({ ...properties, tags })}
            onSkillsChange={(skills) => setProperties({ ...properties, skills })}
            onCognitiveLevelChange={(level) => setProperties({ ...properties, cognitiveLevel: level })}
          />
        </Card>
      )}

      {activeTab === 'History' && (
        <Card className="border-border shadow-sm bg-card p-6">
          <HistoryTab
            versions={historyData || []}
            isLoading={historyLoading}
          />
        </Card>
      )}

      <QuestionBuilderBottomNav
        questionBuilderText={questionBuilderText}
        handleDeleteQuestion={handleDeleteQuestion}
        handlePreviousQuestion={handlePreviousQuestion}
        hasPreviousQuestion={hasPreviousQuestion}
        handleNextQuestion={handleNextQuestion}
      />
    </div>
  );
};