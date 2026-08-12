import { FC, useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Flame, Award } from 'lucide-react';
import type { GrammarLessonDetailResponse } from '../types';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../constants';
import { useGrammarLeaderboard } from '../hooks';
import OutlineTimeline from '../components/OutlineTimeline';
import QuickNotesSidebar from '../components/QuickNotesSidebar';
import { LessonLectureTab } from '../components/LessonLectureTab';
import { LessonMindmapTab } from '../components/LessonMindmapTab';
import { LessonCheatsheetTab } from '../components/LessonCheatsheetTab';
import { Map, Compass } from 'lucide-react';

interface GrammarLessonDetailContainerProps {
  lesson: GrammarLessonDetailResponse;
  onComplete: () => Promise<void>;
  isCompleting: boolean;
  onBackToRoadmap: () => void;
  onEditLesson: () => void;
  onNavigateToLesson: (id: string, isDraft: boolean) => void;
}

export const GrammarLessonDetailContainer: FC<GrammarLessonDetailContainerProps> = ({
  lesson, onComplete, isCompleting, onBackToRoadmap, onEditLesson, onNavigateToLesson,
}) => {
  const { data: dbLeaderboard = [] } = useGrammarLeaderboard('all-time');
  const nextLesson = lesson.nextLesson;
  const [activeBlockId, setActiveBlockId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'LECTURE' | 'MINDMAP' | 'CHEATSHEET'>('LECTURE');

  const getBlockDomId = (outlineId: string) => {
    const directBlock = lesson.blocks?.find((b) => b.id === outlineId);
    if (directBlock) return outlineId;
    const lowerId = outlineId.toLowerCase();
    if (lowerId === 'usage' || lowerId === 'intro') {
      const match = lesson.blocks?.find((b) => b.type === 'text' || b.type === 'media');
      if (match) return match.id;
    }
    if (lowerId === 'structure' || lowerId === 'formula') {
      const match = lesson.blocks?.find((b) => b.type === 'formula');
      if (match) return match.id;
    }
    if (lowerId === 'quiz' || lowerId === 'check') {
      const match = lesson.blocks?.find((b) => b.type === 'quiz');
      if (match) return match.id;
    }
    const idx = lesson.outline?.findIndex((item) => item.id === outlineId);
    if (idx !== -1 && lesson.blocks && lesson.blocks[idx]) return lesson.blocks[idx].id;
    return outlineId;
  };

  useEffect(() => {
    if (activeTab !== 'LECTURE') return;
    const handleScroll = () => {
      let currentActiveId = '';
      for (const block of lesson.blocks || []) {
        const el = document.getElementById(block.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2.5) currentActiveId = block.id;
        }
      }
      if (currentActiveId) setActiveBlockId(currentActiveId);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson.blocks, activeTab]);

  const activeOutline = (lesson.outline || []).map((item, idx, arr) => {
    const mappedBlockId = getBlockDomId(item.id);
    const activeIdx = arr.findIndex((x) => getBlockDomId(x.id) === activeBlockId);
    let status: 'COMPLETED' | 'ACTIVE' | 'PENDING' = 'PENDING';
    if (mappedBlockId === activeBlockId) status = 'ACTIVE';
    else if (activeIdx !== -1 && idx < activeIdx) status = 'COMPLETED';
    else if (activeIdx === -1 && idx === 0) status = 'ACTIVE';
    return { ...item, status };
  });

  const handleScrollToBlock = (blockId: string) => {
    if (activeTab !== 'LECTURE') {
      setActiveTab('LECTURE');
      setTimeout(() => {
        const el = document.getElementById(getBlockDomId(blockId));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      const el = document.getElementById(getBlockDomId(blockId));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDownloadCheatSheet = () => { toast.success(GRAMMAR_UI_TEXT.lessonDetail.toastPdfInit); window.print(); };
  const handleShareLink = () => { navigator.clipboard.writeText(window.location.href); toast.success(GRAMMAR_UI_TEXT.lessonDetail.toastShareSuccess); };

  const dynamicLeaderboard = dbLeaderboard.map((item) => ({
    rank: item.rank,
    name: item.isCurrentUser ? GRAMMAR_UI_TEXT.lessonDetail.userStudentName : item.name,
    score: `${item.xp} XP`,
    time: '',
    avatar: item.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.id}`,
    medal: item.rank === 1 ? '💎' : item.rank === 2 ? '🥇' : item.rank === 3 ? '🥈' : '🥉',
  }));

  const tabs = [
    { key: 'LECTURE' as const, icon: BookOpen, label: GRAMMAR_UI_TEXT.lessonDetail.tabLecture },
    { key: 'MINDMAP' as const, icon: Map, label: GRAMMAR_UI_TEXT.lessonDetail.tabMindmap },
    { key: 'CHEATSHEET' as const, icon: Compass, label: GRAMMAR_UI_TEXT.lessonDetail.tabCheatsheet },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-full mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBackToRoadmap}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-border transition-all border-none">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.lessonDetail.levelLabel.replace('{level}', lesson.level)}
                </span>
                <span className="text-[10px] font-extrabold text-muted-foreground/75 tracking-wider uppercase">{GRAMMAR_UI_TEXT.lessonDetail.timeReadLabel}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2 mt-1">
                {lesson.title}
                {lesson.vietnameseTitle && <span className="text-sm text-muted-foreground font-normal hidden sm:inline">({lesson.vietnameseTitle})</span>}
              </h1>
            </div>
          </div>
          <button onClick={onEditLesson}
            className="px-4 py-2.5 text-xs font-bold bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all shadow-sm">
            {GRAMMAR_UI_TEXT.lessonDetail.btnEditLesson}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border gap-6">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition ${activeTab === key ? 'border-blue-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8 min-w-0">
            {activeTab === 'LECTURE' && <LessonLectureTab blocks={lesson.blocks || []} isCompleting={isCompleting} onComplete={onComplete} />}
            {activeTab === 'MINDMAP' && <LessonMindmapTab title={lesson.title} level={lesson.level} />}
            {activeTab === 'CHEATSHEET' && <LessonCheatsheetTab onDownload={handleDownloadCheatSheet} onShare={handleShareLink} />}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-10 self-start flex-shrink-0">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <BookOpen className="h-4 w-4 text-blue-500" />{GRAMMAR_UI_TEXT.lessonDetail.sidebarOutlineTitle}
                </div>
                <span className="text-[9px] font-extrabold bg-muted text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{GRAMMAR_UI_TEXT.lessonDetail.sidebarOutlineBadge}</span>
              </div>
              <OutlineTimeline items={activeOutline} onClickItem={handleScrollToBlock} />
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <Award className="h-4 w-4 text-amber-500" />{GRAMMAR_UI_TEXT.lessonDetail.sidebarLeaderboardTitle}
                </div>
                <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{GRAMMAR_UI_TEXT.lessonDetail.sidebarLeaderboardBadge}</span>
              </div>
              <div className="space-y-3">
                {dynamicLeaderboard.map((item) => (
                  <div key={`${item.name}-${item.rank}`}
                    className={`flex items-center justify-between p-2.5 border rounded-xl bg-secondary/20 hover:border-border transition-all ${item.name.includes(GRAMMAR_UI_TEXT.leaderboard.userBadge) ? 'border-blue-500/40 ring-1 ring-blue-500/25 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-border/60'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-muted-foreground/60 w-4">{item.rank}</span>
                      <img src={item.avatar} alt={item.name} className="h-7 w-7 rounded-full bg-secondary" />
                      <span className="text-xs font-bold text-muted-foreground truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-foreground block">{item.medal} {item.score}</span>
                      <span className="text-[8px] text-muted-foreground/75 block">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <QuickNotesSidebar lessonId={lesson.id} initialNotes={lesson.quickNotes} />

            {nextLesson ? (
              <div className="bg-card border border-border rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10 animate-pulse" />{GRAMMAR_UI_TEXT.lessonDetail.sidebarNextLessonTitle}
                </div>
                <div onClick={() => onNavigateToLesson(nextLesson.id, false)}
                  className="border border-border hover:border-muted-foreground/30 rounded-2xl p-4 bg-muted/20 flex justify-between items-center cursor-pointer transition-all hover:bg-muted/40 group">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-extrabold text-foreground group-hover:text-blue-450 transition-colors truncate">{nextLesson.title}</h4>
                    <span className="text-[9px] font-bold text-muted-foreground/75 uppercase mt-0.5 block">{GRAMMAR_UI_TEXT.lessonDetail.sidebarNextLessonBadge.replace('{level}', nextLesson.level)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/70 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />{GRAMMAR_UI_TEXT.lessonDetail.sidebarCompletedTitle}
                </div>
                <div className="border border-dashed border-border rounded-2xl p-4 bg-muted/10 text-center space-y-1">
                  <h4 className="text-xs font-extrabold text-emerald-500">{GRAMMAR_UI_TEXT.lessonDetail.sidebarCompletedCongrats}</h4>
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{GRAMMAR_UI_TEXT.lessonDetail.sidebarCompletedDesc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarLessonDetailContainer;
