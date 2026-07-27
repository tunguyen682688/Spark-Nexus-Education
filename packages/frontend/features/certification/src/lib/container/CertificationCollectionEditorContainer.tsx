import React from 'react';
import {
  CheckCircle2,
  Eye,
  Save,
  Send,
  MoreVertical,
  Plus,
  Edit2,
  ArrowUpDown,
  Upload,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  ChevronUp,
  Image as ImageIcon,
  X,
  GripVertical,
  Pencil,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { useCollectionEditorContainerLogic } from '../hooks/useCollectionEditorContainerLogic';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';
const bc = CERTIFICATION_UI_TEXT.breadcrumbs;
const shared = CERTIFICATION_UI_TEXT.shared;

export const CertificationCollectionEditorContainer: React.FC = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    activeChapterId,
    setActiveChapterId,
    activeChapter,
    chapters,
    details,
    setDetails,
    summary,
    newTagInput,
    setNewTagInput,
    isDetailsCollapsed,
    setIsDetailsCollapsed,
    handleAddChapter,
    handleUpdateActiveChapterTitle,
    handleUpdateActiveChapterDescription,
    handleAddExamToChapter,
    handleRemoveExamFromChapter,
    handleRemoveTag,
    handleAddTag,
    handleSaveDraft,
    handlePublishCollection,
    handlePreviewCollection,
    handleBackToDashboard,
  } = useCollectionEditorContainerLogic();

  const text = CERTIFICATION_UI_TEXT.collectionEditor;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.defaultMessage} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. BREADCRUMB & TOP HEADER ROW */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <button onClick={handleBackToDashboard} className="hover:text-foreground transition-colors cursor-pointer">
            {bc.creatorDashboard}
          </button>
          <span>&gt;</span>
          <button onClick={handleBackToDashboard} className="hover:text-foreground transition-colors cursor-pointer">
            {bc.collections}
          </button>
          <span>&gt;</span>
          <span className="text-foreground font-bold">{details.title}</span>
          <span>&gt;</span>
          <span className="text-indigo-600 font-extrabold">{bc.edit}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
              <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border-none">
                {text.badgeDraft}
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
              <span>{text.autosaved}</span>
            </div>

            <Button
              onClick={handlePreviewCollection}
              variant="outline"
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>{text.previewBtn}</span>
            </Button>

            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{text.saveDraftBtn}</span>
            </Button>

            <Button
              onClick={handlePublishCollection}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{text.publishBtn}</span>
            </Button>

            <button className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN TABS (STRUCTURE, SETTINGS, COLLABORATORS) */}
      <div className="border-b border-border">
        <div className="flex items-center gap-6">
          {([CERTIFICATION_UI_TEXT.collectionEditorTabs.structure, CERTIFICATION_UI_TEXT.collectionEditorTabs.settings, CERTIFICATION_UI_TEXT.collectionEditorTabs.collaborators] as const).map((tab) => (
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

      {/* 3. MAIN EDITOR CONTENT AREA (3 COLUMNS GRID) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: COLLECTION STRUCTURE SIDEBAR (3 COLS) */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-border shadow-sm bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                {text.structureSidebar.title}
              </h3>
              <button
                onClick={handleAddChapter}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{shared.add}</span>
              </button>
            </div>

            {/* CHAPTER CARDS LIST */}
            <div className="space-y-2.5">
              {chapters.map((chap) => {
                const isActive = chap.id === activeChapterId;
                return (
                  <div
                    key={chap.id}
                    onClick={() => setActiveChapterId(chap.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                        : 'border-border bg-card hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-xs text-muted-foreground">{chap.number}</span>
                      <div>
                        <div className="font-bold text-xs text-foreground leading-snug">
                          {chap.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {chap.exams.length > 0 ? chap.exams.length : chap.examCount} exams
                        </div>
                      </div>
                    </div>

                    <button className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ADD CHAPTER BOTTOM BUTTON */}
            <button
              onClick={handleAddChapter}
              className="w-full py-4 border-2 border-dashed border-border rounded-xl text-center space-y-0.5 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-indigo-600 group-hover:underline block">
                {shared.addChapter}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">
                {shared.dragToReorder}
              </span>
            </button>
          </Card>
        </div>

        {/* MIDDLE COLUMN: CHAPTER DETAIL & EXAMS TABLE (6 COLS) */}
        <div className="xl:col-span-6 space-y-6">
          <Card className="border-border shadow-sm bg-card p-5 space-y-4">
            {/* CHAPTER TITLE HEADER */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <input
                  value={activeChapter?.title || ''}
                  onChange={(e) => handleUpdateActiveChapterTitle(e.target.value)}
                  className="font-extrabold text-base text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 focus:outline-none py-0.5 px-1 rounded"
                />
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <button className="text-muted-foreground hover:text-foreground cursor-pointer">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* CHAPTER DESCRIPTION TEXTAREA */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {text.chapterDetail.descriptionPlaceholder}
              </label>
              <textarea
                value={activeChapter?.description || ''}
                onChange={(e) => handleUpdateActiveChapterDescription(e.target.value)}
                placeholder="Build a strong foundation with essential topics..."
                rows={2}
                className="w-full text-xs font-medium text-foreground bg-secondary/30 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* ACTION CONTROLS BAR & STATS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddExamToChapter}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 h-8 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{text.chapterDetail.addExam}</span>
                </Button>

                <Button
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{text.chapterDetail.reorder}</span>
                </Button>

                <Button
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{text.chapterDetail.importExams}</span>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground font-bold">
                {activeChapter?.exams.length || 3} exams • 180 questions
              </div>
            </div>

            {/* EXAMS TABLE */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">{text.tableHeaders.title}</th>
                    <th className="py-2.5 px-2 text-center">{text.tableHeaders.questions}</th>
                    <th className="py-2.5 px-2 text-center">{text.tableHeaders.duration}</th>
                    <th className="py-2.5 px-2 text-center">{text.tableHeaders.difficulty}</th>
                    <th className="py-2.5 px-2 text-center">{text.tableHeaders.status}</th>
                    <th className="py-2.5 px-2 text-right">{text.tableHeaders.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-medium">
                  {(activeChapter?.exams && activeChapter.exams.length > 0
                    ? activeChapter.exams
                    : [
                        {
                          id: 'ex-1',
                          number: 1,
                          title: 'TOEIC Practice Test 1',
                          subTitle: 'Basic Concepts',
                          questionsCount: 60,
                          durationMinutes: 60,
                          difficulty: 'Easy' as const,
                          status: 'Published' as const,
                        },
                        {
                          id: 'ex-2',
                          number: 2,
                          title: 'TOEIC Practice Test 2',
                          subTitle: 'Daily Training',
                          questionsCount: 60,
                          durationMinutes: 60,
                          difficulty: 'Easy' as const,
                          status: 'Published' as const,
                        },
                        {
                          id: 'ex-3',
                          number: 3,
                          title: 'TOEIC Practice Test 3',
                          subTitle: 'Vocabulary Focus',
                          questionsCount: 60,
                          durationMinutes: 60,
                          difficulty: 'Medium' as const,
                          status: 'Draft' as const,
                        },
                      ]
                  ).map((exam, idx) => (
                    <tr key={exam.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-2 font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-[9px] flex items-center justify-center flex-shrink-0">
                            TOEIC
                          </div>
                          <div>
                            <div className="font-extrabold text-foreground">{exam.title}</div>
                            <div className="text-[10px] text-muted-foreground font-medium">
                              {exam.subTitle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-foreground">
                        {exam.questionsCount}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-foreground">
                        {exam.durationMinutes} min
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border-none ${
                            exam.difficulty === 'Easy'
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                              : exam.difficulty === 'Medium'
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {exam.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border-none ${
                            exam.status === 'Published'
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {exam.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveExamFromChapter(exam.id)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-rose-600 cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DRAG & DROP EXAMS FOOTER */}
            <div className="py-3 border-2 border-dashed border-border rounded-xl text-center flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
              <GripVertical className="w-4 h-4" />
              <span>{text.chapterDetail.dragDropFooter}</span>
            </div>
          </Card>

          {/* BOTTOM SUMMARY ROW */}
          <Card className="border-border shadow-sm bg-card p-5 space-y-4">
            <h3 className="font-extrabold text-base text-foreground pb-2 border-b border-border">
              {text.summary.title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {/* METRIC 1: TOTAL CHAPTERS */}
              <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  {text.summary.totalChapters}
                </span>
                <div className="text-xl font-black text-foreground">{summary.totalChapters}</div>
              </div>

              {/* METRIC 2: TOTAL EXAMS */}
              <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  {text.summary.totalExams}
                </span>
                <div className="text-xl font-black text-foreground">{summary.totalExams}</div>
              </div>

              {/* METRIC 3: TOTAL QUESTIONS */}
              <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  {text.summary.totalQuestions}
                </span>
                <div className="text-xl font-black text-foreground">
                  {summary.totalQuestions.toLocaleString()}
                </div>
              </div>

              {/* METRIC 4: ESTIMATED DURATION */}
              <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  {text.summary.estimatedDuration}
                </span>
                <div className="text-xl font-black text-foreground">
                  {summary.estimatedDurationText}
                </div>
              </div>

              {/* METRIC 5: DIFFICULTY MIX (DONUT CHART METRIC) */}
              <div className="p-3 bg-secondary/30 rounded-xl space-y-1 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  {text.summary.difficultyMix}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-foreground">
                  <span className="text-emerald-600">• Easy {summary.difficultyMix.easy}%</span>
                  <span className="text-amber-600">• Med {summary.difficultyMix.medium}%</span>
                  <span className="text-rose-600">• Hard {summary.difficultyMix.hard}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: COLLECTION DETAILS SIDEBAR (3 COLS) */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-border shadow-sm bg-card p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                {text.detailsSidebar.title}
              </h3>
              <button
                onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ChevronUp
                  className={`w-4 h-4 transition-transform ${isDetailsCollapsed ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {!isDetailsCollapsed && (
              <div className="space-y-4 text-xs font-medium">
                {/* COVER IMAGE */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {text.detailsSidebar.coverImage}
                  </label>
                  <div className="relative rounded-xl overflow-hidden border border-border group bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-6 text-center text-white shadow-md">
                    <div className="font-black text-sm uppercase tracking-wider">
                      TOEIC MASTERY
                    </div>
                    <div className="text-[10px] font-bold tracking-widest opacity-80 mt-0.5">
                      COLLECTION
                    </div>

                    <button className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold bg-white/20 hover:bg-white/30 backdrop-blur px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
                      <ImageIcon className="w-3 h-3" />
                      <span>{text.detailsSidebar.changeImage}</span>
                    </button>
                  </div>
                </div>

                {/* TITLE INPUT */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {text.detailsSidebar.titleLabel}
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {details.title.length}/100
                    </span>
                  </div>
                  <Input
                    value={details.title}
                    onChange={(e) => setDetails({ ...details, title: e.target.value })}
                    className="text-xs bg-background py-1.5 h-9 rounded-xl font-bold"
                  />
                </div>

                {/* SUBTITLE INPUT */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {text.detailsSidebar.subtitleLabel}
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {details.subtitle.length}/160
                    </span>
                  </div>
                  <Input
                    value={details.subtitle}
                    onChange={(e) => setDetails({ ...details, subtitle: e.target.value })}
                    className="text-xs bg-background py-1.5 h-9 rounded-xl"
                  />
                </div>

                {/* DESCRIPTION TEXTAREA */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {text.detailsSidebar.descriptionLabel}
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {details.description.length}/500
                    </span>
                  </div>
                  <textarea
                    value={details.description}
                    onChange={(e) => setDetails({ ...details, description: e.target.value })}
                    rows={3}
                    className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* LEVEL DROPDOWN */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {text.detailsSidebar.levelLabel}
                  </label>
                  <select
                    value={details.level}
                    onChange={(e) => setDetails({ ...details, level: e.target.value })}
                    className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CERTIFICATION_UI_TEXT.collectionEditorLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TAGS SECTION */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {text.detailsSidebar.tagsLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {details.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-indigo-900 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag and press Enter..."
                    className="text-[11px] bg-background py-1 h-8 rounded-xl mt-1"
                  />
                </div>

                {/* VISIBILITY RADIO OPTIONS */}
                <div className="space-y-2 pt-1 border-t border-border">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {text.detailsSidebar.visibilityLabel}
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="Public"
                      checked={details.visibility === 'Public'}
                      onChange={() => setDetails({ ...details, visibility: 'Public' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-extrabold text-foreground">
                        {text.detailsSidebar.publicOption}
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-snug">
                        {text.detailsSidebar.publicDesc}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="Private"
                      checked={details.visibility === 'Private'}
                      onChange={() => setDetails({ ...details, visibility: 'Private' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-extrabold text-foreground">
                        {text.detailsSidebar.privateOption}
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-snug">
                        {text.detailsSidebar.privateDesc}
                      </div>
                    </div>
                  </label>
                </div>

                {/* ALLOW DOWNLOADS SWITCH TOGGLE */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <div className="font-extrabold text-foreground">
                      {text.detailsSidebar.allowDownloads}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-snug">
                      {text.detailsSidebar.allowDownloadsDesc}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setDetails({ ...details, allowDownloads: !details.allowDownloads })
                    }
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      details.allowDownloads ? 'bg-indigo-600' : 'bg-secondary'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                        details.allowDownloads ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* METADATA FOOTER */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                  <div>
                    <span className="block">{text.detailsSidebar.created}</span>
                    <span className="text-foreground">{details.createdDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="block">{text.detailsSidebar.lastUpdated}</span>
                    <span className="text-foreground">{details.lastUpdatedDate}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
