import React from 'react';
import {
  CheckCircle2,
  Eye,
  Bookmark,
  Save,
  MoreVertical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Quote,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  Monitor,
  Smartphone,
  Info,
  X,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FileCode,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { useQuestionBuilderContainerLogic } from '../hooks/useQuestionBuilderContainerLogic';
import { useQuestionHistory } from '../hooks/use-certification';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { ExplanationTab } from '../components/ExplanationTab';
import { TagsSkillsTab } from '../components/TagsSkillsTab';
import { HistoryTab } from '../components/HistoryTab';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';
const bc = CERTIFICATION_UI_TEXT.breadcrumbs;
const shared = CERTIFICATION_UI_TEXT.shared;

export const CertificationQuestionBuilderContainer: React.FC = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    textMediaMode,
    setTextMediaMode,
    previewViewport,
    setPreviewViewport,
    questionId,
    examId,
    questionText,
    setQuestionText,
    questionType,
    setQuestionType,
    difficulty,
    setDifficulty,
    shuffleOptions,
    setShuffleOptions,
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
    handleSelectCorrectOption,
    handleAddOption,
    handleAddOtherOption,
    handleRemoveOption,
    handleUpdateOptionText,
    handleRemoveTag,
    handleRemoveSkill,
    handleSaveQuestion,
    handleSaveToBank,
    handlePreviewQuestion,
    handleDeleteQuestion,
    handlePreviousQuestion,
    handleNextQuestion,
    handleBackToExamBuilder,
  } = useQuestionBuilderContainerLogic();

  const { data: historyData, isLoading: historyLoading } = useQuestionHistory(questionId);

  const text = CERTIFICATION_UI_TEXT.questionBuilder;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.defaultMessage} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-24">
      {/* 1. BREADCRUMB & TOP HEADER ROW */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground overflow-x-auto">
          <button onClick={handleBackToExamBuilder} className="hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">
            {bc.myExams}
          </button>
          <span>&gt;</span>
          <button onClick={handleBackToExamBuilder} className="hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">
            {examId ? `${bc.examPrefix} ${examId}` : bc.examPrefix}
          </button>
          <span>&gt;</span>
          <span className="whitespace-nowrap">{bc.question}</span>
          <span>&gt;</span>
          <span className="text-foreground font-bold whitespace-nowrap">{questionId}</span>
          <span>&gt;</span>
          <span className="text-indigo-600 font-extrabold whitespace-nowrap">{bc.build}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
              <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border-none">
                {text.badgeMultipleChoice}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {text.subtitle}
            </p>
          </div>

          {/* TOP RIGHT ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mr-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{text.savedStatus}</span>
            </div>

            <Button
              onClick={handlePreviewQuestion}
              variant="outline"
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>{text.previewBtn}</span>
            </Button>

            <Button
              onClick={handleSaveToBank}
              variant="outline"
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Bookmark className="w-4 h-4" />
              <span>{text.saveToBankBtn}</span>
            </Button>

            <Button
              onClick={handleSaveQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{text.saveQuestionBtn}</span>
            </Button>

            <button className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN TABS (QUESTION, EXPLANATION, TAGS & SKILLS, HISTORY) */}
      <div className="border-b border-border">
        <div className="flex items-center gap-6 overflow-x-auto">
          {([text.tabs.question, text.tabs.explanation, text.tabs.tagsSkills, text.tabs.history] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
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

      {/* 3. MAIN EDITOR & PREVIEW GRID (12 COLS) */}
      {activeTab === 'Question' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* LEFT / MIDDLE COLUMN: QUESTION FORM & PREVIEW (9 COLS) */}
          <div className="xl:col-span-9 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* QUESTION EDITOR FORM (7 COLS) */}
              <div className="lg:col-span-7 space-y-6">
                {/* QUESTION TEXT BOX & FORMATTING TOOLBAR */}
                <Card className="border-border shadow-sm bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {text.questionSection.textLabel}
                    </label>

                    {/* TEXT / MEDIA TOGGLE PILLS */}
                    <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg">
                      {([text.questionSection.textMode, text.questionSection.mediaMode] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setTextMediaMode(mode)}
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-colors cursor-pointer ${
                            textMediaMode === mode
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RICH TEXT FORMATTING TOOLBAR */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-secondary/30 rounded-xl border border-border">
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                  </div>

                  {/* QUESTION TEXTAREA */}
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />

                  <div className="text-[10px] text-muted-foreground font-medium text-right">
                    {questionText.length} / 1000
                  </div>
                </Card>

                {/* QUESTION TYPE, DIFFICULTY & SHUFFLE OPTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {text.questionSection.questionTypeLabel}
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {text.questionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {text.questionSection.difficultyLabel}
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                      className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {text.difficultyOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SHUFFLE OPTIONS CHECKBOX */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{text.questionSection.shuffleOptionsLabel}</span>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </label>

                {/* ANSWER OPTIONS LIST */}
                <Card className="border-border shadow-sm bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                      {text.questionSection.answerOptionsTitle}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{text.questionSection.correctAnswerLabel}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          opt.isCorrect
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 ${
                              opt.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            }`}
                          >
                            {opt.label}
                          </div>

                          <input
                            value={opt.text}
                            onChange={(e) => handleUpdateOptionText(opt.id, e.target.value)}
                            className="w-full text-xs font-semibold text-foreground bg-transparent focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* RADIO FOR SELECTING CORRECT ANSWER */}
                          <button
                            onClick={() => handleSelectCorrectOption(opt.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                              opt.isCorrect
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-muted-foreground/40 hover:border-emerald-500'
                            }`}
                          >
                            {opt.isCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <button className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                            <FileCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveOption(opt.id)}
                            className="p-1 text-muted-foreground hover:text-rose-600 cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADD OPTION BUTTONS */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleAddOption}
                      className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{text.questionSection.addOptionBtn}</span>
                    </button>

                    <button
                      onClick={handleAddOtherOption}
                      className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{text.questionSection.addOtherOptionBtn}</span>
                    </button>
                  </div>
                </Card>
              </div>

              {/* LIVE PREVIEW WIDGET (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="border-border shadow-sm bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                      {text.previewSection.title}
                    </h3>

                    {/* VIEWPORT TOGGLE */}
                    <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
                      <button
                        onClick={() => setPreviewViewport('desktop')}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          previewViewport === 'desktop'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewViewport('mobile')}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          previewViewport === 'mobile'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PREVIEW CANVAS CARD */}
                  <div
                    className={`bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/40 space-y-4 mx-auto ${
                      previewViewport === 'mobile' ? 'max-w-xs' : 'w-full'
                    }`}
                  >
                    {/* ADVERTISEMENT ILLUSTRATION CARD */}
                    <div className="bg-card border border-border rounded-xl p-4 text-center space-y-2 shadow-sm">
                      <span className="text-[10px] text-muted-foreground font-bold block text-left">
                        {text.previewAd.label}
                      </span>

                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center mx-auto shadow-md">
                        {text.previewAd.appName}
                      </div>

                      <h4 className="font-black text-sm text-foreground">
                        {text.previewAd.headline}
                      </h4>

                      <div className="text-[10px] text-muted-foreground font-semibold space-y-1 text-left max-w-xs mx-auto">
                        {text.previewAd.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-1 text-emerald-600">
                            <Check className="w-3 h-3" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button className="mt-2 text-[10px] font-extrabold text-indigo-600 hover:underline">
                        {text.previewAd.cta}
                      </button>
                    </div>

                    {/* QUESTION RENDER */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-extrabold text-foreground leading-snug">
                        12. {questionText}
                      </div>

                      <div className="space-y-2 text-xs font-semibold">
                        {options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                              opt.isCorrect
                                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-foreground'
                                : 'border-border bg-card text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                opt.isCorrect
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-muted-foreground/40'
                              }`}
                            >
                              {opt.isCorrect && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span>
                              {opt.label}. {opt.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* BOTTOM ROW: EXPLANATION & REFERENCE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* EXPLANATION TEXTAREA (7 COLS) */}
              <Card className="lg:col-span-7 border-border shadow-sm bg-card p-4 space-y-3">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {text.explanationSection.title}
                </label>

                <div className="flex items-center gap-1.5 p-2 bg-secondary/30 rounded-xl border border-border">
                  <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-secondary text-foreground cursor-pointer">
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />

                <div className="text-[10px] text-muted-foreground font-medium text-right">
                  {explanation.length} / 1000
                </div>
              </Card>

              {/* REFERENCE SECTION (5 COLS) */}
              <Card className="lg:col-span-5 border-border shadow-sm bg-card p-4 space-y-3">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {text.explanationSection.referenceTitle}
                </label>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  {text.referenceTypes.map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="refType"
                        value={type}
                        checked={referenceType === type}
                        onChange={() => setReferenceType(type)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      {text.explanationSection.passageSourceLabel}
                    </label>
                    <select
                      value={passageSource}
                      onChange={(e) => setPassageSource(e.target.value)}
                      className="w-full bg-background border border-border text-xs font-bold text-foreground py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {text.passageOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                      {text.explanationSection.highlightLabel}
                    </label>
                    <Input
                      value={highlight}
                      onChange={(e) => setHighlight(e.target.value)}
                      className="text-xs bg-background py-1.5 h-8 rounded-xl"
                    />
                    <span className="text-[10px] text-muted-foreground font-medium block">
                      {text.explanationSection.highlightHelp}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN: QUESTION PROPERTIES SIDEBAR (3 COLS) */}
          <div className="xl:col-span-3 space-y-4">
            {/* PROPERTIES CARD */}
            <Card className="border-border shadow-sm bg-card p-4 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground pb-2 border-b border-border">
                {text.propertiesSidebar.title}
              </h3>

              <div className="space-y-3.5 text-xs font-medium">
                {/* ID & POINTS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      {text.propertiesSidebar.idLabel}
                    </span>
                    <span className="font-black text-foreground">{properties.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      {text.propertiesSidebar.pointsLabel}
                    </span>
                    <select
                      value={properties.points}
                      onChange={(e) => setProperties({ ...properties, points: Number(e.target.value) })}
                      className="w-full bg-background border border-border text-xs font-bold py-1 px-2 rounded-lg"
                    >
                      {text.pointsOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ESTIMATED TIME */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    {text.propertiesSidebar.estimatedTimeLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={properties.estimatedTime}
                      onChange={(e) => setProperties({ ...properties, estimatedTime: e.target.value })}
                      className="text-xs bg-background py-1 h-8 rounded-xl font-bold w-24"
                    />
                    <span className="text-[10px] text-muted-foreground font-bold">{text.timeFormatHint}</span>
                  </div>
                </div>

                {/* TAGS */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    {text.propertiesSidebar.tagsLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {properties.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1"
                      >
                        <span>{tag}</span>
                        <button onClick={() => handleRemoveTag(tag)} className="cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* SKILLS */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    {text.propertiesSidebar.skillsLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {properties.skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1"
                      >
                        <span>{skill}</span>
                        <button onClick={() => handleRemoveSkill(skill)} className="cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* COGNITIVE LEVEL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                    {text.propertiesSidebar.cognitiveLevelLabel}
                  </label>
                  <select
                    value={properties.cognitiveLevel}
                    onChange={(e) => setProperties({ ...properties, cognitiveLevel: e.target.value })}
                    className="w-full bg-background border border-border text-xs font-bold text-foreground py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {text.cognitiveLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* METADATA DATES */}
                <div className="pt-2 border-t border-border space-y-1 text-[10px] text-muted-foreground font-semibold">
                  <div>
                    <span>{text.propertiesSidebar.timeAdded}: </span>
                    <span className="text-foreground">{properties.createdDate}</span>
                  </div>
                  <div>
                    <span>{text.propertiesSidebar.lastUpdated}: </span>
                    <span className="text-foreground">{properties.lastUpdatedDate}</span>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <span>{text.propertiesSidebar.createdBy}: </span>
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
                      MA
                    </div>
                    <span className="text-foreground font-bold">{properties.createdBy}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* QUESTION QUALITY CARD */}
            <Card className="border-border shadow-sm bg-card p-4 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground pb-2 border-b border-border">
                {text.propertiesSidebar.qualityTitle}
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-lg text-emerald-600 flex-shrink-0">
                  92
                </div>
                <div>
                  <div className="font-extrabold text-xs text-foreground">
                    {text.propertiesSidebar.excellent}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium leading-snug">
                    {text.propertiesSidebar.qualityDesc}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] font-semibold text-emerald-600 pt-1">
                {text.qualityChecklist.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>

              <button className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:underline cursor-pointer pt-1">
                <span>{text.propertiesSidebar.viewQualityGuide}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </Card>

            {/* USED IN CARD */}
            <Card className="border-border shadow-sm bg-card p-4 space-y-1 text-xs">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground pb-1 border-b border-border">
                {text.propertiesSidebar.usedInTitle}
              </h4>
              <div className="font-bold text-foreground pt-1">
                TOEIC Practice Test 1 (Reading)
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
                Section 2 - Q12
              </div>
            </Card>
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

      {/* 4. BOTTOM FIXED NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border bg-card p-4 rounded-2xl shadow-md">
        <Button
          onClick={handleDeleteQuestion}
          variant="outline"
          className="border-rose-200 text-rose-600 dark:border-rose-900/60 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>{text.bottomNav.deleteQuestion}</span>
        </Button>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePreviousQuestion}
            variant="outline"
            className="text-xs font-bold py-2 px-4 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{text.bottomNav.previousQuestion}</span>
          </Button>

          <Button
            onClick={handleNextQuestion}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>{text.bottomNav.nextQuestion}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
