import { FC, useState, CSSProperties, MouseEvent } from 'react';
import {
  Sparkles,
  Search,
  Award,
  ThumbsUp,
  HelpCircle,
  Clock,
  X,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import {
  useGrammarExamSets,
  useUpvoteGrammarExamSet,
  useUserGrammarCertificates,
} from '../hooks';
import type { CommunityGrammarCertificate } from '../types';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../constants';

interface GrammarExamHubContainerProps {
  onNavigateToExam: (id: string) => void;
  onNavigateToCreator: () => void;
}

const EXAM_TYPE_CONFIGS: Record<string, { cardBorder: string; typeBadge: string }> = {
  TOEIC: {
    cardBorder: 'hover:border-cyan-500/40 border-border/80',
    typeBadge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
  },
  IELTS: {
    cardBorder: 'hover:border-rose-500/40 border-border/80',
    typeBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  },
  VSTEP: {
    cardBorder: 'hover:border-amber-500/40 border-border/80',
    typeBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  },
  DEFAULT: {
    cardBorder: 'hover:border-primary/40 border-border/80',
    typeBadge: 'bg-primary/10 text-primary border border-primary/20',
  },
};

export const GrammarExamHubContainer: FC<GrammarExamHubContainerProps> = ({
  onNavigateToExam,
  onNavigateToCreator,
}) => {
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'CEFR' | 'TOEIC' | 'IELTS' | 'VSTEP'
  >('ALL');
  const [searchVal, setSearchVal] = useState('');
  const [selectedCert, setSelectedCert] =
    useState<CommunityGrammarCertificate | null>(null);

  // Mouse tilt positioning state for interactive 3D Certificate showcase
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({});

  // Query & Mutations
  const { data: examSets = [], isLoading: loadingExams } = useGrammarExamSets(
    undefined,
    activeTab === 'ALL' ? undefined : activeTab,
    searchVal || undefined
  );
  const { data: certificates = [], isLoading: loadingCerts } =
    useUserGrammarCertificates();
  const upvoteMutation = useUpvoteGrammarExamSet();

  const handleUpvote = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await upvoteMutation.mutateAsync(id);
      toast.success(GRAMMAR_UI_TEXT.examHub.toastUpvoteSuccess);
    } catch {
      toast.error(GRAMMAR_UI_TEXT.examHub.toastUpvoteError);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const angleX = (yc - y) / 10; // Xoay dọc
    const angleY = (x - xc) / 15; // Xoay ngang

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`,
      transition: 'none',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.5s ease',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-10 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-full mx-auto space-y-8 relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-wider">
                {GRAMMAR_UI_TEXT.examHub.hubBadge}
              </span>
              <span className="text-xs text-muted-foreground font-bold">•</span>
              <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {GRAMMAR_UI_TEXT.examHub.hubTitle}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              {GRAMMAR_UI_TEXT.examHub.title}
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl font-medium leading-relaxed">
              {GRAMMAR_UI_TEXT.examHub.desc}
            </p>
          </div>

          <Button
            onClick={onNavigateToCreator}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold px-5 py-3 rounded-xl border-none shadow-md text-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span role="img" aria-label="write">
              ✍️
            </span>{' '}
            {GRAMMAR_UI_TEXT.examHub.btnContribution}
          </Button>
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
          {/* Tab selectors */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {(['ALL', 'CEFR', 'TOEIC', 'IELTS', 'VSTEP'] as const).map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border border-primary/35 text-primary'
                        : 'bg-transparent border border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'ALL' ? GRAMMAR_UI_TEXT.examHub.filterAll : tab}
                  </button>
                );
              }
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={GRAMMAR_UI_TEXT.examHub.placeholderSearch}
              className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Main Grid: Left lists & Right Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Exam Sets List */}
          <div className="flex-1 w-full space-y-4">
            {loadingExams ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-semibold">
                {GRAMMAR_UI_TEXT.examHub.loadingExams}
              </div>
            ) : examSets.length === 0 ? (
              <div className="p-12 border border-dashed border-border rounded-3xl text-center text-muted-foreground text-xs font-medium space-y-2">
                <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto" />
                <p>{GRAMMAR_UI_TEXT.examHub.noExamsTitle}</p>
                <p className="text-[10px] text-muted-foreground">
                  {GRAMMAR_UI_TEXT.examHub.noExamsDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examSets.map((set) => {
                  const passed = set.isPassed;

                  // Màu sắc theo loại đề thi
                  const config = EXAM_TYPE_CONFIGS[set.examType] || EXAM_TYPE_CONFIGS.DEFAULT;
                  const { cardBorder, typeBadge } = config;

                  return (
                    <div
                      key={set.id}
                      onClick={() => onNavigateToExam(set.id)}
                      className={`bg-card border rounded-2xl p-5 hover:bg-muted/20 transition-all shadow-md group relative overflow-hidden flex flex-col justify-between h-48 cursor-pointer ${cardBorder}`}
                    >
                      {/* Top content */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${typeBadge}`}
                          >
                            {set.examType}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            {set.level !== 'ALL'
                              ? GRAMMAR_UI_TEXT.examHub.levelLabel.replace('{level}', set.level)
                              : GRAMMAR_UI_TEXT.examHub.levelAll}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors leading-relaxed line-clamp-1 pt-1">
                          {set.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {set.description}
                        </p>
                      </div>

                      {/* Bottom row info */}
                      <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-3">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
                          <span className="flex items-center gap-1">
                            <HelpCircle className="h-3.5 w-3.5" />{' '}
                            {GRAMMAR_UI_TEXT.examHub.questionCount.replace('{count}', String(set.questions?.length || 0))}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />{' '}
                            {GRAMMAR_UI_TEXT.examHub.timeLimitCount.replace('{count}', String(Math.round(set.timeLimit / 60)))}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {passed && (
                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {GRAMMAR_UI_TEXT.examHub.passedBadge.replace('{score}', String(set.bestScore))}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleUpvote(e, set.id)}
                            className="h-7 px-2.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <ThumbsUp className="h-3 w-3" /> {set.upvotes}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Sidebar Progress & Certificates */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Stats Overview */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black text-muted-foreground tracking-wider uppercase">
                {GRAMMAR_UI_TEXT.examHub.sidebarProgressTitle}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted/40 border border-border rounded-xl p-3">
                  <span className="text-[9px] font-bold text-muted-foreground block uppercase">
                    {GRAMMAR_UI_TEXT.examHub.sidebarPassedLabel}
                  </span>
                  <span className="text-lg font-black text-primary">
                    {GRAMMAR_UI_TEXT.examHub.sidebarPassedValue.replace('{count}', String(examSets.filter((x) => x.isPassed).length))}
                  </span>
                </div>
                <div className="bg-muted/40 border border-border rounded-xl p-3">
                  <span className="text-[9px] font-bold text-muted-foreground block uppercase">
                    {GRAMMAR_UI_TEXT.examHub.sidebarContributionLabel}
                  </span>
                  <span className="text-lg font-black text-emerald-500">
                    {GRAMMAR_UI_TEXT.examHub.sidebarContributionValue.replace('{count}', String(examSets.filter((x) => x.creatorId === 'mock-user-123').length))}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificates collection showcase */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                {GRAMMAR_UI_TEXT.examHub.sidebarCertTitle.replace('{count}', String(certificates.length))}
              </h3>

              {loadingCerts ? (
                <div className="text-center text-muted-foreground text-xs font-semibold py-6">
                  {GRAMMAR_UI_TEXT.examHub.sidebarCertLoading}
                </div>
              ) : certificates.length === 0 ? (
                <div className="text-center text-muted-foreground text-[11px] font-medium py-6 space-y-1">
                  <p>{GRAMMAR_UI_TEXT.examHub.sidebarCertEmptyTitle}</p>
                  <p className="text-[9px] text-muted-foreground/60">
                    {GRAMMAR_UI_TEXT.examHub.sidebarCertEmptyDesc}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCert(cert)}
                      className="bg-muted/30 border border-border hover:border-amber-500/20 rounded-xl p-3 flex items-center gap-3 cursor-pointer group transition-all"
                    >
                      <Award className="h-6 w-6 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="text-left overflow-hidden">
                        <div className="text-xs font-black text-foreground group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                          {GRAMMAR_UI_TEXT.examHub.certTitle.replace('{examType}', cert.examType).replace('{level}', cert.level)}
                        </div>
                        <span className="text-[8px] font-mono text-muted-foreground block truncate">
                          {cert.serialNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic 3D Certificate Interactive Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-card/95 border border-border rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <button
              onClick={() => {
                setSelectedCert(null);
                setTiltStyle({});
              }}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors border-none cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <Award className="h-8 w-8 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                {GRAMMAR_UI_TEXT.examHub.dialogCertDetail}
              </span>
              <h3 className="text-xl font-extrabold text-foreground">
                {GRAMMAR_UI_TEXT.examHub.dialogCertTitle.replace('{examType}', selectedCert.examType).replace('{level}', selectedCert.level)}
              </h3>
            </div>

            {/* 3D Interactive Card Showcase */}
            <div className="perspective-1000 my-8 flex justify-center">
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-80 sm:w-96 h-48 bg-gradient-to-br from-card/85 to-card border border-amber-500/35 rounded-2xl p-5 shadow-2xl flex flex-col justify-between text-left cursor-grab select-none active:cursor-grabbing transition-transform duration-100 ease-out"
                style={tiltStyle}
              >
                {/* Watermark icon */}
                <Award className="absolute right-4 bottom-4 h-24 w-24 text-amber-500/5 pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[9px] font-black text-amber-500 tracking-wider">
                      {GRAMMAR_UI_TEXT.examHub.dialogCertBadge}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground">
                      {GRAMMAR_UI_TEXT.examHub.dialogCertDesc}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                    {selectedCert.examType} {selectedCert.level}
                  </span>
                </div>

                <div
                  className="space-y-1 py-3"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <span className="text-[8px] text-muted-foreground block uppercase tracking-wider">
                    {GRAMMAR_UI_TEXT.examHub.dialogCertUserLabel}
                  </span>
                  <div className="text-base font-black bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                    {GRAMMAR_UI_TEXT.examHub.dialogCertUserVal}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-border pt-2">
                  <div>
                    <span className="text-[7px] text-muted-foreground block uppercase">
                      {GRAMMAR_UI_TEXT.examHub.dialogCertSerial}
                    </span>
                    <span className="text-[9px] font-mono text-foreground/80">
                      {selectedCert.serialNumber}
                    </span>
                  </div>
                  <span className="text-[8px] text-muted-foreground font-mono">
                    {GRAMMAR_UI_TEXT.examHub.dialogCertIssued.replace('{date}', new Date(selectedCert.issuedAt).toLocaleDateString())}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => window.print()}
                className="bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border py-3 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" /> {GRAMMAR_UI_TEXT.examHub.dialogCertBtnPrint}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

