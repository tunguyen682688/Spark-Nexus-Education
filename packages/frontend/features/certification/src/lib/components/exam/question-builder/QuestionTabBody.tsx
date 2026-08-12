import { Card } from '@spark-nest-ed/frontend-shared-components';
import type { QuestionTypeConfig } from '../../../constants/question-type-config.constants';
import type { AnswerOptionItem } from '../../../hooks/container-logic/exam/use-question-builder-container-logic';
import { FormattingToolbar } from '../exam-builder/FormattingToolbar';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { ChoiceAnswerEditor } from './ChoiceAnswerEditor';
import { MatchingPairsEditor } from './MatchingPairsEditor';
import { GridInAnswerEditor } from './GridInAnswerEditor';
import { MediaReferenceEditor } from './MediaReferenceEditor';
import { WritingTaskEditor } from './WritingTaskEditor';
import { SpeakingTaskEditor } from './SpeakingTaskEditor';
import { WordFormationEditor } from './WordFormationEditor';
import { KeyWordTransformEditor } from './KeyWordTransformEditor';
import type { QuestionTypeCategory } from '../../../constants/question-type-config.constants';

interface MatchingPair {
  left: string;
  right: string;
}

interface QuestionTabBodyProps {
  questionType: string;
  questionText: string;
  options: AnswerOptionItem[];
  audioUrl?: string;
  imageUrl?: string;
  passageId?: string;
  gridInAnswer?: string;
  matchingPairs?: MatchingPair[];
  wordRoot?: string;
  keyWord?: string;
  writingTaskType?: string;
  speakingPrompt?: string;
  referenceType: 'Passage' | 'Image' | 'External Link';
  passageSource: string;
  highlight: string;
  activeConfig: QuestionTypeConfig | undefined;
  grouped: Record<QuestionTypeCategory, QuestionTypeConfig[]>;
  categories: QuestionTypeCategory[];
  onQuestionTypeChange: (value: string) => void;
  onQuestionTextChange: (value: string) => void;
  onSelectCorrectOption: (id: string) => void;
  onAddOption: () => void;
  onAddOtherOption: () => void;
  onRemoveOption: (id: string) => void;
  onUpdateOptionText: (id: string, text: string) => void;
  onAudioUrlChange?: (value: string) => void;
  onImageUrlChange?: (value: string) => void;
  onPassageIdChange?: (value: string) => void;
  onGridInAnswerChange?: (value: string) => void;
  onMatchingPairsChange?: (pairs: MatchingPair[]) => void;
  onWordFormationRootChange?: (value: string) => void;
  onKeyWordChange?: (value: string) => void;
  onWritingTaskTypeChange?: (value: string) => void;
  onSpeakingPromptChange?: (value: string) => void;
  onReferenceTypeChange: (value: 'Passage' | 'Image' | 'External Link') => void;
  onPassageSourceChange: (value: string) => void;
  onHighlightChange: (value: string) => void;
}

export function QuestionTabBody({
  questionType,
  questionText,
  options,
  audioUrl,
  imageUrl,
  passageId,
  gridInAnswer,
  matchingPairs = [],
  wordRoot,
  keyWord,
  writingTaskType,
  speakingPrompt,
  referenceType,
  passageSource,
  highlight,
  activeConfig,
  grouped,
  categories,
  onQuestionTypeChange,
  onQuestionTextChange,
  onSelectCorrectOption,
  onAddOption,
  onAddOtherOption,
  onRemoveOption,
  onUpdateOptionText,
  onAudioUrlChange,
  onImageUrlChange,
  onPassageIdChange,
  onGridInAnswerChange,
  onMatchingPairsChange,
  onWordFormationRootChange,
  onKeyWordChange,
  onWritingTaskTypeChange,
  onSpeakingPromptChange,
  onReferenceTypeChange,
  onPassageSourceChange,
  onHighlightChange,
}: QuestionTabBodyProps) {
  const category = activeConfig?.category;

  const showChoiceEditor = category === 'choice' || category === 'gap-fill' || category === 'media';
  const showMatchingEditor = category === 'matching' || questionType === 'matching' || questionType === 'map_labeling';
  const showGridInEditor = questionType === 'sat_math_grid_in';
  const showInputEditor = category === 'input' && !showGridInEditor;
  const showWritingEditor = category === 'writing';
  const showSpeakingEditor = category === 'speaking';
  const showWordFormation = questionType === 'word_formation';
  const showKeyWordTransform = questionType === 'key_word_transformation';
  const showMediaReference = activeConfig?.supportsAudio || activeConfig?.supportsImage || activeConfig?.supportsPassage;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-9 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Question Text Card */}
            <Card className="border-border shadow-sm bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Question Text *
                </label>
              </div>

              <FormattingToolbar />

              <textarea
                value={questionText}
                onChange={(e) => onQuestionTextChange(e.target.value)}
                rows={4}
                className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />

              <div className="text-[10px] text-muted-foreground font-medium text-right">
                {questionText.length} / 1000
              </div>
            </Card>

            {/* Question Type + Certification Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuestionTypeSelector
                selectedType={questionType}
                onSelect={onQuestionTypeChange}
                grouped={grouped}
                activeConfig={activeConfig}
                categories={categories}
              />
            </div>

            {/* Category-specific field editors */}
            {showWordFormation && (
              <Card className="border-border shadow-sm bg-card p-4">
                <WordFormationEditor
                  rootWord={wordRoot}
                  onRootWordChange={onWordFormationRootChange}
                />
              </Card>
            )}

            {showKeyWordTransform && (
              <Card className="border-border shadow-sm bg-card p-4">
                <KeyWordTransformEditor
                  keyWord={keyWord}
                  onKeyWordChange={onKeyWordChange}
                />
              </Card>
            )}

            {showChoiceEditor && (
              <Card className="border-border shadow-sm bg-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                    Answer Options *
                  </h3>
                </div>

                <ChoiceAnswerEditor
                  options={options}
                  requiresCorrectAnswer={activeConfig?.requiresCorrectAnswer}
                  minOptions={activeConfig?.minOptions}
                  maxOptions={activeConfig?.maxOptions}
                  onSelectCorrect={onSelectCorrectOption}
                  onUpdateText={onUpdateOptionText}
                  onRemove={onRemoveOption}
                  onAddOption={onAddOption}
                  onAddOtherOption={onAddOtherOption}
                />
              </Card>
            )}

            {showMatchingEditor && onMatchingPairsChange && (
              <Card className="border-border shadow-sm bg-card p-4">
                <MatchingPairsEditor
                  pairs={matchingPairs}
                  onChange={onMatchingPairsChange}
                />
              </Card>
            )}

            {showGridInEditor && onGridInAnswerChange && (
              <Card className="border-border shadow-sm bg-card p-4">
                <GridInAnswerEditor
                  value={gridInAnswer || ''}
                  onChange={onGridInAnswerChange}
                />
              </Card>
            )}

            {showInputEditor && (
              <Card className="border-border shadow-sm bg-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                    Expected Answer
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Enter the expected answer for this input question.
                </p>
              </Card>
            )}

            {showWritingEditor && (
              <Card className="border-border shadow-sm bg-card p-4">
                <WritingTaskEditor
                  writingTaskType={writingTaskType}
                  prompt={speakingPrompt}
                  onWritingTaskTypeChange={onWritingTaskTypeChange}
                  onPromptChange={onSpeakingPromptChange}
                />
              </Card>
            )}

            {showSpeakingEditor && (
              <Card className="border-border shadow-sm bg-card p-4">
                <SpeakingTaskEditor
                  speakingPrompt={speakingPrompt}
                  prompt={writingTaskType}
                  onSpeakingPromptChange={onSpeakingPromptChange}
                  onPromptChange={onWritingTaskTypeChange}
                />
              </Card>
            )}

            {/* Media Reference Section */}
            {showMediaReference && (
              <Card className="border-border shadow-sm bg-card p-4">
                <MediaReferenceEditor
                  audioUrl={audioUrl}
                  imageUrl={imageUrl}
                  passageId={passageId}
                  supportsAudio={activeConfig?.supportsAudio}
                  supportsImage={activeConfig?.supportsImage}
                  supportsPassage={activeConfig?.supportsPassage}
                  referenceType={referenceType}
                  passageSource={passageSource}
                  highlight={highlight}
                  onAudioUrlChange={onAudioUrlChange}
                  onImageUrlChange={onImageUrlChange}
                  onPassageIdChange={onPassageIdChange}
                  onReferenceTypeChange={onReferenceTypeChange}
                  onPassageSourceChange={onPassageSourceChange}
                  onHighlightChange={onHighlightChange}
                />
              </Card>
            )}

            {/* Explanation Card (always shown below answer area) */}
            <Card className="border-border shadow-sm bg-card p-4 space-y-3">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Explanation (for learners)
              </label>
              <FormattingToolbar variant="compact" />
              <textarea
                value={questionText}
                onChange={(e) => onQuestionTextChange(e.target.value)}
                rows={3}
                className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
              <div className="text-[10px] text-muted-foreground font-medium text-right">
                {questionText.length} / 1000
              </div>
            </Card>

            {/* Generic Reference Card (for non-media types) */}
            {!showMediaReference && (
              <Card className="border-border shadow-sm bg-card p-4 space-y-3">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Reference (optional)
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  {(['Passage', 'Image', 'External Link'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="refType"
                        value={type}
                        checked={referenceType === type}
                        onChange={() => onReferenceTypeChange(type)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Passage / Source
                    </label>
                    <select
                      value={passageSource}
                      onChange={(e) => onPassageSourceChange(e.target.value)}
                      className="w-full bg-background border border-border text-xs font-bold text-foreground py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Passage 2">Passage 2</option>
                      <option value="Passage 1">Passage 1</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Highlight (optional)
                    </label>
                    <input
                      value={highlight}
                      onChange={(e) => onHighlightChange(e.target.value)}
                      className="w-full text-xs bg-background border border-border rounded-xl p-1.5 h-8"
                    />
                    <span className="text-[10px] text-muted-foreground font-medium block">
                      Helps learners locate the answer in the passage.
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
