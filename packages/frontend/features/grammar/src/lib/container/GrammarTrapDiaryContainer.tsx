import { FC } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Bot,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { Button, Card, Badge } from '@spark-nest-ed/frontend-shared-components';
import { useGrammarTrapDiary } from '../hooks';
import { SharedAssessmentEngineContainer } from './SharedAssessmentEngineContainer';
import { TRAP_CATEGORIES, TRAP_STATUSES, GRAMMAR_UI_TEXT } from '../constants';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface GrammarTrapDiaryContainerProps {
  onNavigateBack: () => void;
}

const GrammarTrapDiaryContainer: FC<GrammarTrapDiaryContainerProps> = ({
  onNavigateBack,
}) => {
  const {
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    expandedTrapId,
    setExpandedTrapId,
    isPracticing,
    setIsPracticing,
    drillQuestions,
    filteredTraps,
    totalTrapped,
    totalBroken,
    isLoading,
    serverTraps,
    handleAiAnalysis,
    startTrapBreakerCampaign,
    handleFinishDrill,
  } = useGrammarTrapDiary();

  // Helper render badge category
  const renderCategoryBadge = (category: string) => {
    const catConfig = TRAP_CATEGORIES.find((c) => c.key === category);
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border',
          catConfig?.badgeClass ||
            'bg-slate-500/10 text-slate-400 border-slate-500/20'
        )}
      >
        {catConfig?.fullLabel || category}
      </Badge>
    );
  };

  // Renders markdown content of AI Analysis nicely with customized colors
  const renderAiAnalysis = (markdown: string) => {
    if (!markdown) return null;

    // Simple custom regex-based parser to parse custom card design beautifully
    const sections = markdown.split('### ');

    return (
      <div className="space-y-4 pt-4 border-t border-slate-900 mt-4 animate-fadeIn">
        <div className="flex items-center gap-1.5 text-xs text-blue-400 font-extrabold uppercase tracking-widest mb-1">
          <Bot className="h-4 w-4 text-blue-400" />
          {GRAMMAR_UI_TEXT.trapDiary.aiTitle}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((section, idx) => {
            if (!section.trim()) return null;
            const lines = section.trim().split('\n');
            const titleLine = lines[0] || '';
            const contentLines = lines.slice(1);
            const content = contentLines.join('\n').trim();

            let borderStyle = 'border-border/80 bg-background/30';
            let titleColor = 'text-slate-300';
            let iconText = '💡';

            if (titleLine.includes('Bẫy') || titleLine.includes('Trap')) {
              borderStyle = 'border-rose-500/10 bg-rose-950/5';
              titleColor = 'text-rose-400';
              iconText = '🕸️';
            } else if (
              titleLine.includes('Quy Tắc') ||
              titleLine.includes('Rule')
            ) {
              borderStyle = 'border-blue-500/10 bg-blue-950/5';
              titleColor = 'text-blue-400';
              iconText = '🌟';
            } else if (
              titleLine.includes('Thần Chú') ||
              titleLine.includes('Mnemonic')
            ) {
              borderStyle = 'border-amber-500/10 bg-amber-950/5';
              titleColor = 'text-amber-400';
              iconText = '🔮';
            }

            return (
              <Card
                key={idx}
                className={cn(
                  'border rounded-xl p-4 flex flex-col justify-between shadow-sm',
                  borderStyle
                )}
              >
                <div>
                  <div
                    className={cn(
                      'text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5',
                      titleColor
                    )}
                  >
                    <span>{iconText}</span>
                    {titleLine.replace(/\*\*|:/g, '')}
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed whitespace-pre-line">
                    {content.replace(/>\s*/g, '')}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Render practice mode if active
  if (isPracticing && drillQuestions.length > 0) {
    return (
      <SharedAssessmentEngineContainer
        questions={drillQuestions}
        timeLimit={drillQuestions.length * 90} // 90 giây mỗi câu hỏi
        examType="CEFR"
        examTitle="Chiến Dịch Phá Bẫy Ngữ Pháp"
        onFinish={handleFinishDrill}
        onBack={() => setIsPracticing(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 h-96 w-96 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-full mx-auto space-y-8 relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <button
              onClick={onNavigateBack}
              className="group flex items-center gap-1 text-xs text-slate-500 hover:text-slate-355 font-bold bg-transparent border-none cursor-pointer mb-2 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              {GRAMMAR_UI_TEXT.trapDiary.btnBack}
            </button>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[9px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded uppercase tracking-wider"
              >
                {GRAMMAR_UI_TEXT.trapDiary.tagPersonalized}
              </Badge>
              <span className="text-xs text-slate-500 font-bold">•</span>
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <Bot className="h-3.5 w-3.5 text-blue-400" />
                {GRAMMAR_UI_TEXT.trapDiary.tagAiAnalysis}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              {GRAMMAR_UI_TEXT.trapDiary.title}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
              {GRAMMAR_UI_TEXT.trapDiary.subtitle}
            </p>
          </div>

          <Button
            onClick={startTrapBreakerCampaign}
            disabled={totalTrapped === 0}
            className={cn(
              'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold px-5 py-3 rounded-xl border-none shadow-md shadow-rose-500/20 text-xs active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider',
              totalTrapped === 0 ? 'opacity-50 cursor-not-allowed' : ''
            )}
          >
            <span role="img" aria-label="crossed-swords">
              ⚔️
            </span>{' '}
            {GRAMMAR_UI_TEXT.trapDiary.btnCampaign.replace('{count}', totalTrapped.toString())}
          </Button>
        </div>

        {/* Statistical Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                {GRAMMAR_UI_TEXT.trapDiary.statTrapped}
              </p>
              <h2 className="text-2xl font-black text-rose-400 mt-1">
                {totalTrapped}
              </h2>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                {GRAMMAR_UI_TEXT.trapDiary.statTrappedDesc}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
            </div>
          </Card>

          <Card className="bg-card border-border rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                {GRAMMAR_UI_TEXT.trapDiary.statBroken}
              </p>
              <h2 className="text-2xl font-black text-emerald-400 mt-1">
                {totalBroken}
              </h2>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                {GRAMMAR_UI_TEXT.trapDiary.statBrokenDesc}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
          </Card>

          <Card className="bg-card border-border rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                {GRAMMAR_UI_TEXT.trapDiary.statRatio}
              </p>
              <h2 className="text-2xl font-black text-blue-400 mt-1">
                {serverTraps.length > 0
                  ? `${Math.round((totalBroken / serverTraps.length) * 100)}%`
                  : '0%'}
              </h2>
              <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                {GRAMMAR_UI_TEXT.trapDiary.statRatioDesc}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-blue-400" />
            </div>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="bg-card border-border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-blue-500/10 border border-blue-500/35 text-blue-400'
                  : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-355'
              }`}
            >
              {GRAMMAR_UI_TEXT.trapDiary.skillAll}
            </button>
            {TRAP_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-blue-500/10 border border-blue-500/35 text-blue-400'
                    : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-355'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Statuses */}
          <div className="flex gap-2">
            {TRAP_STATUSES.map((stat) => (
              <button
                key={stat.key}
                onClick={() => setActiveStatus(stat.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeStatus === stat.key
                    ? stat.activeClass
                    : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-355'
                }`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Traps List */}
        <div className="space-y-4">
          {isLoading && filteredTraps.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-semibold">
              {GRAMMAR_UI_TEXT.trapDiary.loading}
            </div>
          ) : filteredTraps.length === 0 ? (
            <Card className="p-12 border border-dashed border-border rounded-3xl text-center text-slate-500 text-xs font-medium space-y-2 bg-card">
              <Bot className="h-6 w-6 text-slate-600 mx-auto" />
              <p>{GRAMMAR_UI_TEXT.trapDiary.noTrapsTitle}</p>
              <p className="text-[10px] text-slate-600">
                {GRAMMAR_UI_TEXT.trapDiary.noTrapsDesc}
              </p>
            </Card>
          ) : (
            filteredTraps.map((trap) => {
              const isExpanded = expandedTrapId === trap.id;
              const isBroken = trap.status === 'BROKEN';

              return (
                <Card
                  key={trap.id}
                  className={cn(
                    'bg-card border rounded-2xl p-5 shadow-xl transition-all',
                    isBroken
                      ? 'border-emerald-500/10 bg-card/60'
                      : 'border-border hover:border-border/80'
                  )}
                >
                  {/* Trap Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderCategoryBadge(trap.category)}
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border',
                          isBroken
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        )}
                      >
                        {isBroken ? GRAMMAR_UI_TEXT.trapDiary.badgeBroken : GRAMMAR_UI_TEXT.trapDiary.badgeTrapped}
                      </Badge>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {GRAMMAR_UI_TEXT.trapDiary.dateLabel}{' '}
                        {new Date(trap.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => handleAiAnalysis(e, trap)}
                        className="bg-slate-900/60 text-slate-350 hover:text-white font-extrabold px-3 py-1.5 rounded-lg border border-border hover:border-border/80 text-[10px] cursor-pointer transition-all flex items-center gap-1 uppercase tracking-wider"
                      >
                        <Bot className="h-3 w-3 text-blue-400" />
                        {trap.aiAnalysis
                          ? GRAMMAR_UI_TEXT.trapDiary.btnAiAnalysisView
                          : GRAMMAR_UI_TEXT.trapDiary.btnAiAnalysis}
                      </Button>

                      {isExpanded ? (
                        <button
                          onClick={() => setExpandedTrapId(null)}
                          className="bg-transparent border-none text-slate-500 hover:text-slate-355 cursor-pointer"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setExpandedTrapId(trap.id)}
                          className="bg-transparent border-none text-slate-500 hover:text-slate-355 cursor-pointer"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                      {GRAMMAR_UI_TEXT.trapDiary.questionLabel}
                    </p>
                    <p className="text-sm font-extrabold text-white leading-relaxed">
                      {trap.questionText}
                    </p>
                  </div>

                  {/* Answers Show */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-background/50 p-4 border border-border rounded-xl">
                    <div className="space-y-1">
                      <div className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        {GRAMMAR_UI_TEXT.trapDiary.answerUser}
                      </div>
                      <p className="text-xs text-slate-300 font-extrabold line-through decoration-rose-500 decoration-2">
                        {trap.userAnswer || GRAMMAR_UI_TEXT.trapDiary.answerEmpty}
                      </p>
                    </div>

                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
                      <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {GRAMMAR_UI_TEXT.trapDiary.answerCorrect}
                      </div>
                      <p className="text-xs text-emerald-400 font-extrabold">
                        {trap.correctAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Content (AI Analysis & Explanations) */}
                  {isExpanded && (
                    <div className="mt-5 space-y-4 pt-4 border-t border-border animate-slideDown">
                      {/* Original Explanation */}
                      <Card className="space-y-1 bg-background/20 border-border/50 p-4 rounded-xl shadow-inner">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {GRAMMAR_UI_TEXT.trapDiary.explanationLabel}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          {trap.explanation}
                        </p>
                      </Card>

                      {/* AI Detailed Analysis */}
                      {trap.aiAnalysis && renderAiAnalysis(trap.aiAnalysis)}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarTrapDiaryContainer;
