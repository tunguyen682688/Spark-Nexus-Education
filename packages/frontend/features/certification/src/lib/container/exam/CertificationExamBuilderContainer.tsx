import {
  CheckCircle2,
  Eye,
  Save,
  Send,
  MoreVertical,
  Plus,
  Edit2,
  Folder,
  Sparkles,
  Upload,
  Filter,
  Search,
  Pencil,
  FileCode,
  Grid,
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  Clock,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { useExamBuilderContainerLogic } from '../../hooks/container-logic/exam/use-exam-builder-container-logic';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
const bc = CERTIFICATION_UI_TEXT.breadcrumbs;
const shared = CERTIFICATION_UI_TEXT.shared;

export const CertificationExamBuilderContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
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
    filteredQuestions,
    blueprint,
    handleAddSection,
    handleUpdateActiveSectionTitle,
    handleAddQuestionToSection,
    handleRemoveQuestionFromSection,
    handleSaveDraft,
    handlePublishExam,
    handlePreviewExam,
    handleEditQuestion,
    handleBackToExams,
  } = useExamBuilderContainerLogic();

  const text = CERTIFICATION_UI_TEXT.examBuilder;

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
          <button onClick={handleBackToExams} className="hover:text-foreground transition-colors cursor-pointer">
            {bc.creatorDashboard}
          </button>
          <span>&gt;</span>
          <button onClick={handleBackToExams} className="hover:text-foreground transition-colors cursor-pointer">
            {bc.myExams}
          </button>
          <span>&gt;</span>
          <span className="text-foreground font-bold">{settings.title}</span>
          <span>&gt;</span>
          <span className="text-indigo-600 font-extrabold">{bc.build}</span>
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
              <span>{text.savedStatus}</span>
            </div>

            <Button
              onClick={handlePreviewExam}
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
              onClick={handlePublishExam}
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

      {/* 2. MAIN TABS (BUILD, SETTINGS, REVIEW & PUBLISH) */}
      <div className="border-b border-border">
        <div className="flex items-center gap-6">
          {([text.tabs.build, text.tabs.settings, text.tabs.reviewPublish] as const).map((tab) => (
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

      {/* 3. MAIN BUILDER CONTENT AREA (3 COLUMNS GRID) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EXAM SECTIONS SIDEBAR (3 COLS) */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-border shadow-sm bg-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                {text.sectionsSidebar.title}
              </h3>
              <button
                onClick={handleAddSection}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{shared.add}</span>
              </button>
            </div>

            {/* SECTIONS CARDS LIST */}
            <div className="space-y-2.5">
              {sections.map((sec) => {
                const isActive = sec.id === activeSectionId;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                        : 'border-border bg-card hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-bold text-xs text-foreground leading-snug">
                          {sec.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {sec.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-extrabold text-muted-foreground">
                      {sec.isBreak ? '—' : `${sec.questionCount} questions`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADD SECTION BOTTOM BUTTON */}
            <button
              onClick={handleAddSection}
              className="w-full py-4 border-2 border-dashed border-border rounded-xl text-center space-y-0.5 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-indigo-600 group-hover:underline block">
                {shared.addSection}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">
                {shared.dragToReorder}
              </span>
            </button>
          </Card>
        </div>

        {/* MIDDLE COLUMN: SECTION DETAIL & QUESTIONS TABLE (6 COLS) */}
        <div className="xl:col-span-6 space-y-6">
          <Card className="border-border shadow-sm bg-card p-5 space-y-4">
            {/* SECTION HEADER & SUB-TABS */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <input
                  value={`Section ${activeSection?.number}: ${activeSection?.title} (${activeSection?.subtitle})`}
                  onChange={(e) => handleUpdateActiveSectionTitle(e.target.value)}
                  className="font-extrabold text-base text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 focus:outline-none py-0.5 px-1 rounded"
                />
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground">
                  {activeSection?.questionCount} questions • {activeSection?.durationMinutes} minutes
                </span>
                <button className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SECTION SUB-TABS */}
            <div className="flex items-center gap-4 text-xs font-bold border-b border-border pb-2">
              {([CERTIFICATION_UI_TEXT.examBuilderTabs.questions, CERTIFICATION_UI_TEXT.examBuilderTabs.instructions, CERTIFICATION_UI_TEXT.examBuilderTabs.timing] as const).map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => setActiveSubTab(subTab)}
                  className={`pb-1 transition-colors cursor-pointer ${
                    activeSubTab === subTab
                      ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {subTab} ({activeSection?.questionCount})
                </button>
              ))}
            </div>

            {/* ACTION CONTROLS & SEARCH BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleAddQuestionToSection}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 h-8 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{text.sectionDetail.addQuestion}</span>
                </Button>

                <Button
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5 text-blue-600" />
                  <span>{text.sectionDetail.bank}</span>
                </Button>

                <Button
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{text.sectionDetail.aiGenerate}</span>
                </Button>

                <Button
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-3 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{text.sectionDetail.import}</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="text-xs font-bold py-1.5 px-2.5 h-8 rounded-xl border-border hover:bg-secondary flex items-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{shared.filters}</span>
                </Button>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={text.sectionDetail.searchPlaceholder}
                    className="pl-8 text-xs bg-background py-1 h-8 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* QUESTIONS TABLE */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">{text.tableHeaders.question}</th>
                    <th className="py-2.5 px-2 text-center">{text.tableHeaders.type}</th>
                    <th className="py-2.5 px-2 text-center">{text.tableHeaders.difficulty}</th>
                    <th className="py-2.5 px-2 text-center">{text.tableHeaders.points}</th>
                    <th className="py-2.5 px-2 text-right">{text.tableHeaders.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-medium">
                  {filteredQuestions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-2 font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          {q.imageUrl ? (
                            <img
                              src={q.imageUrl}
                              alt="thumb"
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-secondary/80 text-foreground font-black text-sm flex items-center justify-center flex-shrink-0">
                              T
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-foreground leading-snug">
                              {q.title}
                            </div>
                            <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[9px] font-black px-1.5 py-0 border-none mt-0.5">
                              {q.partTag}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-foreground">
                        {q.type}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border-none ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                              : q.difficulty === 'Medium'
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {q.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-foreground">
                        {q.points}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditQuestion(q.id)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-indigo-600 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveQuestionFromSection(q.id)}
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

            {/* TABLE FOOTER PAGINATION */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground font-semibold">
              <span>Showing 1-5 of 100 questions</span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded border border-border hover:bg-secondary disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${
                      currentPage === page ? 'bg-indigo-600 text-white' : 'hover:bg-secondary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span>...</span>
                <button onClick={() => setCurrentPage(20)} className="w-6 h-6 rounded text-xs font-bold hover:bg-secondary">
                  20
                </button>
                <button onClick={() => setCurrentPage((p) => Math.min(20, p + 1))} className="p-1 rounded border border-border hover:bg-secondary">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>

          {/* BOTTOM QUICK ACTION CARDS (3 CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border shadow-sm bg-card p-4 hover:shadow-md transition-all cursor-pointer flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-xs text-foreground">
                  {text.quickCards.aiSectionTitle}
                </h5>
                <p className="text-[10px] text-muted-foreground font-medium leading-snug">
                  {text.quickCards.aiSectionDesc}
                </p>
              </div>
            </Card>

            <Card className="border-border shadow-sm bg-card p-4 hover:shadow-md transition-all cursor-pointer flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-xs text-foreground">
                  {text.quickCards.importTitle}
                </h5>
                <p className="text-[10px] text-muted-foreground font-medium leading-snug">
                  {text.quickCards.importDesc}
                </p>
              </div>
            </Card>

            <Card className="border-border shadow-sm bg-card p-4 hover:shadow-md transition-all cursor-pointer flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Grid className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-xs text-foreground">
                  {text.quickCards.templatesTitle}
                </h5>
                <p className="text-[10px] text-muted-foreground font-medium leading-snug">
                  {text.quickCards.templatesDesc}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: EXAM SETTINGS & BLUEPRINT SIDEBAR (3 COLS) */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-border shadow-sm bg-card p-4 space-y-4">
            <div className="pb-2 border-b border-border">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                {text.settingsSidebar.title}
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground block mt-0.5">
                {text.settingsSidebar.general}
              </span>
            </div>

            <div className="space-y-3.5 text-xs font-medium">
              {/* TITLE INPUT */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {text.settingsSidebar.titleLabel}
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {settings.title.length}/100
                  </span>
                </div>
                <Input
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="text-xs bg-background py-1.5 h-9 rounded-xl font-bold"
                />
              </div>

              {/* DESCRIPTION TEXTAREA */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {text.settingsSidebar.descriptionLabel}
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {settings.description.length}/500
                  </span>
                </div>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* LEVEL DROPDOWN */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {text.settingsSidebar.levelLabel}
                </label>
                <select
                  value={settings.level}
                  onChange={(e) => setSettings({ ...settings, level: e.target.value })}
                  className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {CERTIFICATION_UI_TEXT.examBuilderLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* LANGUAGE DROPDOWN */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {text.settingsSidebar.languageLabel}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {CERTIFICATION_UI_TEXT.examBuilderLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* PASSING SCORE */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {text.settingsSidebar.passingScoreLabel}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.passingScore}
                    onChange={(e) =>
                      setSettings({ ...settings, passingScore: Number(e.target.value) })
                    }
                    className="text-xs bg-background py-1.5 h-9 rounded-xl font-bold w-24"
                  />
                  <span className="text-xs font-bold text-muted-foreground">
                    / {settings.maxScore}
                  </span>
                </div>
              </div>

              {/* BLUEPRINT BREAKDOWN */}
              <div className="pt-3 border-t border-border space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  {text.settingsSidebar.blueprintTitle}
                </h4>

                {/* STAT TOTALS */}
                <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-secondary/30 rounded-xl">
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase block">
                      {text.settingsSidebar.totalQuestions}
                    </span>
                    <span className="text-sm font-black text-foreground">
                      {blueprint.totalQuestions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase block">
                      {text.settingsSidebar.totalTime}
                    </span>
                    <span className="text-sm font-black text-foreground">
                      {blueprint.durationText}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase block">
                      {text.settingsSidebar.totalPoints}
                    </span>
                    <span className="text-sm font-black text-foreground">
                      {blueprint.totalPoints}
                    </span>
                  </div>
                </div>

                {/* BLUEPRINT CATEGORIES LIST */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-foreground">Listening (Part 1 - 4)</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">100 Qs • 45m</div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-foreground">Reading (Part 5 - 6)</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">100 Qs • 75m</div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mic className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-foreground">Speaking (Part 1 - 7)</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">11 Qs • 20m</div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PenTool className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-foreground">Writing (Part 1 - 2)</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">9 Qs • 35m</div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-foreground">Break</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">10m</div>
                  </div>
                </div>
              </div>

              {/* METADATA FOOTER */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                <div>
                  <span className="block">{text.settingsSidebar.created}</span>
                  <span className="text-foreground">{settings.createdDate}</span>
                </div>
                <div className="text-right">
                  <span className="block">{text.settingsSidebar.lastUpdated}</span>
                  <span className="text-foreground">{settings.lastUpdatedDate}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
