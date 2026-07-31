import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
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
  Users,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Input,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@spark-nest-ed/frontend-shared-components';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCollectionEditorContainerLogic } from '../../hooks/editor/use-collection-editor-container-logic';
import { AddExamModal } from '../../components/collection/AddExamModal';
import { SortableExamRow } from '../../components/collection/SortableExamRow';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
const bc = CERTIFICATION_UI_TEXT.breadcrumbs;
const shared = CERTIFICATION_UI_TEXT.shared;

export const CertificationCollectionEditorContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    isEditMode,
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
    handleDeleteChapter,
    handleRemoveTag,
    handleAddTag,
    handleSaveDraft,
    handlePublishCollection,
    handlePreviewCollection,
    handleBackToDashboard,
    handleEditExam,
    handleReorderExams,
    isSaving,
    autosavedText,
    isAddExamModalOpen,
    setIsAddExamModalOpen,
    handleAddExamConfirm,
    syncStatus,
    isDirty,
  } = useCollectionEditorContainerLogic();

  const { toast } = useToast();
  const text = CERTIFICATION_UI_TEXT.collectionEditor;
  const [confirmDeleteChapterId, setConfirmDeleteChapterId] = useState<string | null>(null);
  const [confirmDeleteExamId, setConfirmDeleteExamId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const exams = activeChapter?.exams ?? [];
    const oldIndex = exams.findIndex((ex) => ex.id === active.id);
    const newIndex = exams.findIndex((ex) => ex.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      handleReorderExams(oldIndex, newIndex);
    }
  };

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
          {isEditMode && (
            <>
              <span>&gt;</span>
              <span className="text-foreground font-bold">{details.title || 'Untitled'}</span>
              <span>&gt;</span>
              <span className="text-indigo-600 font-extrabold">{bc.edit}</span>
            </>
          )}
          {!isEditMode && (
            <>
              <span>&gt;</span>
              <span className="text-indigo-600 font-extrabold">{bc.createCollection}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {isEditMode ? text.title : 'Create New Collection'}
              </h1>
              <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border-none">
                {isEditMode ? text.badgeDraft : 'New'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isEditMode ? text.subtitle : 'Set up your collection structure and add exams'}
            </p>
          </div>

          {/* TOP RIGHT ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`flex items-center gap-1 text-xs font-bold mr-2 ${
              syncStatus === 'error' ? 'text-rose-600' : syncStatus === 'syncing' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {syncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : syncStatus === 'syncing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{autosavedText}</span>
              {isDirty && syncStatus === 'synced' && (
                <span className="text-amber-500 ml-1">(chưa lưu)</span>
              )}
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
              disabled={isSaving}
              className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : text.saveDraftBtn}</span>
            </Button>

            <Button
              onClick={handlePublishCollection}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : text.publishBtn}</span>
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

      {/* 3. MAIN EDITOR CONTENT AREA — TAB CONDITIONAL */}
      {activeTab === 'Structure' && (
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
                disabled={isSaving}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          {chap.exams.length} exams
                        </div>
                      </div>
                    </div>

                    {chapters.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteChapterId(chap.id); }}
                        disabled={isSaving}
                        className="text-muted-foreground hover:text-rose-600 cursor-pointer p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ADD CHAPTER BOTTOM BUTTON */}
            <button
              onClick={handleAddChapter}
              disabled={isSaving}
              className="w-full py-4 border-2 border-dashed border-border rounded-xl text-center space-y-0.5 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 h-8 rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{text.chapterDetail.addExam}</span>
                </Button>

                <Button
                  onClick={() => setIsReorderMode(!isReorderMode)}
                  variant={isReorderMode ? 'default' : 'outline'}
                  className={`text-xs font-bold py-1.5 px-3 h-8 rounded-xl flex items-center gap-1 cursor-pointer ${
                    isReorderMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'border-border hover:bg-secondary'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{isReorderMode ? 'Done' : text.chapterDetail.reorder}</span>
                </Button>

                <Button
                  onClick={() => toast({ title: 'Nhập đề thi', description: 'Tính năng nhập đề thi sẽ sớm ra mắt.', variant: 'default' as never })}
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{text.chapterDetail.importExams}</span>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground font-bold">
                {activeChapter?.exams.length ?? 0} exams • {activeChapter?.exams.reduce((sum, ex) => sum + ex.questionsCount, 0) ?? 0} questions
              </div>
            </div>

            {/* EXAMS TABLE */}
            <div className="overflow-x-auto pt-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      {isReorderMode && <th className="py-2.5 px-2 w-8"></th>}
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
                      : []
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={isReorderMode ? 9 : 8} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-10 h-10 text-muted-foreground/40" />
                            <p className="text-sm font-semibold text-muted-foreground">No exams yet</p>
                            <p className="text-xs text-muted-foreground">Click "Add Exam" to create the first exam in this chapter.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <SortableContext items={(activeChapter?.exams ?? []).map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
                        {(activeChapter?.exams ?? []).map((exam, idx) => (
                          <SortableExamRow
                            key={exam.id}
                            exam={exam}
                            index={idx}
                            isSaving={isSaving}
                            onEdit={handleEditExam}
                            onDelete={(examId) => setConfirmDeleteExamId(examId)}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </tbody>
                </table>
              </DndContext>
            </div>

            {/* DRAG & DROP EXAMS FOOTER */}
            <div className={`py-3 border-2 border-dashed rounded-xl text-center flex items-center justify-center gap-2 text-xs font-semibold ${
              isReorderMode
                ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600'
                : 'border-border text-muted-foreground'
            }`}>
              <GripVertical className="w-4 h-4" />
              <span>
                {isReorderMode
                  ? 'Drag exams to reorder them within this chapter'
                  : text.chapterDetail.dragDropFooter
                }
              </span>
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

                    <button
                      onClick={() => toast({ title: 'Đổi ảnh bìa', description: 'Tính năng tải ảnh sẽ sớm ra mắt.', variant: 'default' as never })}
                      className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold bg-white/20 hover:bg-white/30 backdrop-blur px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
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
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'Settings' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-6 xl:col-start-4 space-y-4">
            <Card className="border-border shadow-sm bg-card p-5 space-y-5">
              <h3 className="font-extrabold text-base text-foreground pb-2 border-b border-border">
                Cài đặt bộ sưu tập
              </h3>

              <div className="space-y-4 text-xs font-medium">
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
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {text.detailsSidebar.visibilityLabel}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="settingsVisibility" value="Public" checked={details.visibility === 'Public'} onChange={() => setDetails({ ...details, visibility: 'Public' })} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-bold text-foreground">{text.detailsSidebar.publicOption}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="settingsVisibility" value="Private" checked={details.visibility === 'Private'} onChange={() => setDetails({ ...details, visibility: 'Private' })} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-bold text-foreground">{text.detailsSidebar.privateOption}</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <div className="font-extrabold text-foreground">{text.detailsSidebar.allowDownloads}</div>
                    <div className="text-[10px] text-muted-foreground">{text.detailsSidebar.allowDownloadsDesc}</div>
                  </div>
                  <button
                    onClick={() => setDetails({ ...details, allowDownloads: !details.allowDownloads })}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${details.allowDownloads ? 'bg-indigo-600' : 'bg-secondary'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${details.allowDownloads ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {text.detailsSidebar.tagsLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {details.tags.map((tag) => (
                      <Badge key={tag} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1">
                        <span>{tag}</span>
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-900 cursor-pointer">
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
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* COLLABORATORS TAB */}
      {activeTab === 'Collaborators' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-6 xl:col-start-4 space-y-4">
            <Card className="border-border shadow-sm bg-card p-5 space-y-5">
              <h3 className="font-extrabold text-base text-foreground pb-2 border-b border-border">
                Cộng tác viên
              </h3>
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Users className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Chưa có cộng tác viên</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Mời người khác cùng chỉnh sửa bộ sưu tập này. Tính năng cộng tác sẽ sớm ra mắt.
                </p>
                <Button variant="outline" className="text-xs font-bold mt-2 opacity-50 cursor-not-allowed" disabled>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Mời cộng tác viên
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ADD EXAM MODAL */}
      <AddExamModal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        onConfirm={handleAddExamConfirm}
        chapterTitle={activeChapter?.title}
        existingExamCount={activeChapter?.exams.length ?? 0}
      />

      {/* CONFIRM DELETE CHAPTER */}
      <AlertDialog open={!!confirmDeleteChapterId} onOpenChange={(open) => { if (!open) setConfirmDeleteChapterId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa chương?</AlertDialogTitle>
            <AlertDialogDescription>
              Chương này sẽ bị xóa khỏi bộ sưu tập. Bạn có chắc chắn muốn thực hiện?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (confirmDeleteChapterId) {
                  handleDeleteChapter(confirmDeleteChapterId);
                  setConfirmDeleteChapterId(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM DELETE EXAM */}
      <AlertDialog open={!!confirmDeleteExamId} onOpenChange={(open) => { if (!open) setConfirmDeleteExamId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài kiểm tra?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài kiểm tra này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn thực hiện?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (confirmDeleteExamId) {
                  handleRemoveExamFromChapter(confirmDeleteExamId);
                  setConfirmDeleteExamId(null);
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
