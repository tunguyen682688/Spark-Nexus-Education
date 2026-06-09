import { FC, useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Flame,
  UserCheck,
  Award,
  Sparkles,
  Volume2,
  Download,
  Share2,
  Map,
  Compass,
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import type { GrammarLessonDetailResponse, GrammarBlock } from '../types';
import { toast } from 'sonner';
import { GRAMMAR_UI_TEXT } from '../constants';

// Import các modular UI components
import FormulaBuilder from '../components/FormulaBuilder';
import MediaBlock from '../components/MediaBlock';
import QuizBlock from '../components/QuizBlock';
import OutlineTimeline from '../components/OutlineTimeline';
import QuickNotesSidebar from '../components/QuickNotesSidebar';

interface GrammarLessonDetailContainerProps {
  lesson: GrammarLessonDetailResponse;
  onComplete: () => Promise<void>;
  isCompleting: boolean;
  onBackToRoadmap: () => void;
  onEditLesson: () => void;
  onNavigateToLesson: (id: string, isDraft: boolean) => void;
}

export const GrammarLessonDetailContainer: FC<
  GrammarLessonDetailContainerProps
> = ({
  lesson,
  onComplete,
  isCompleting,
  onBackToRoadmap,
  onEditLesson,
  onNavigateToLesson,
}) => {
  const nextLesson = lesson.nextLesson;

  const [activeBlockId, setActiveBlockId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'LECTURE' | 'MINDMAP' | 'CHEATSHEET'
  >('LECTURE');

  // Trạng thái cho Mindmap popup
  const [selectedMindmapNode, setSelectedMindmapNode] = useState<string | null>(
    null
  );

  const getBlockDomId = (outlineId: string) => {
    // 1. Khớp trực tiếp nếu trùng ID
    const directBlock = lesson.blocks?.find((b) => b.id === outlineId);
    if (directBlock) return outlineId;

    // 2. Khớp gần đúng (fuzzy match) cho dữ liệu mẫu seed
    const lowerId = outlineId.toLowerCase();
    if (lowerId === 'usage' || lowerId === 'intro') {
      const match = lesson.blocks?.find(
        (b) => b.type === 'text' || b.type === 'media'
      );
      if (match) return match.id;
    }
    if (lowerId === 'structure' || lowerId === 'formula') {
      const match = lesson.blocks?.find((b) => b.type === 'formula');
      if (match) return match.id;
    }
    if (lowerId === 'examples') {
      const match = lesson.blocks?.find((b) => b.type === 'example');
      if (match) return match.id;
    }
    if (lowerId === 'quiz' || lowerId === 'check') {
      const match = lesson.blocks?.find((b) => b.type === 'quiz');
      if (match) return match.id;
    }

    // 3. Khớp theo index nếu số lượng mục bằng nhau
    const idx = lesson.outline?.findIndex((item) => item.id === outlineId);
    if (idx !== -1 && lesson.blocks && lesson.blocks[idx]) {
      return lesson.blocks[idx].id;
    }

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
          if (rect.top <= window.innerHeight / 2.5) {
            currentActiveId = block.id;
          }
        }
      }
      if (currentActiveId) {
        setActiveBlockId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run immediately on render
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson.blocks, activeTab]);

  // Dynamically compute the progress state of each outline element based on scroll position
  const activeOutline = (lesson.outline || []).map((item, idx, arr) => {
    const mappedBlockId = getBlockDomId(item.id);
    const activeIdx = arr.findIndex(
      (x) => getBlockDomId(x.id) === activeBlockId
    );
    let status: 'COMPLETED' | 'ACTIVE' | 'PENDING' = 'PENDING';
    if (mappedBlockId === activeBlockId) {
      status = 'ACTIVE';
    } else if (activeIdx !== -1 && idx < activeIdx) {
      status = 'COMPLETED';
    } else if (activeIdx === -1 && idx === 0) {
      status = 'ACTIVE';
    }
    return { ...item, status };
  });

  const handleScrollToBlock = (blockId: string) => {
    if (activeTab !== 'LECTURE') {
      setActiveTab('LECTURE');
      setTimeout(() => {
        const mappedBlockId = getBlockDomId(blockId);
        const element = document.getElementById(mappedBlockId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      const mappedBlockId = getBlockDomId(blockId);
      const element = document.getElementById(mappedBlockId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Phát âm ví dụ bằng Web Speech API
  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Hủy mọi âm thanh đang phát để phát âm mới
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Phát chậm hơn một chút để nghe rõ ngữ pháp
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error(GRAMMAR_UI_TEXT.lessonDetail.toastSpeechUnsupported);
    }
  };

  const handleDownloadCheatSheet = () => {
    toast.success(
      GRAMMAR_UI_TEXT.lessonDetail.toastPdfInit
    );
    window.print();
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(
      GRAMMAR_UI_TEXT.lessonDetail.toastShareSuccess
    );
  };

  // Mock dữ liệu bảng xếp hạng thi đấu bài học
  const mockLeaderboard = [
    {
      rank: 1,
      name: 'Alex Johnson',
      score: '100%',
      time: '2m 14s',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      medal: '💎',
    },
    {
      rank: 2,
      name: 'Emily Stone',
      score: '100%',
      time: '2m 45s',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
      medal: '🥇',
    },
    {
      rank: 3,
      name: 'David Miller',
      score: '90%',
      time: '1m 58s',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
      medal: '🥈',
    },
  ];

  const getDynamicLeaderboard = () => {
    const list = [...mockLeaderboard];
    if (lesson.proficiency && lesson.proficiency > 0) {
      const userProf = lesson.proficiency;
      let medal = '🥉';
      if (userProf >= 90) {
        medal = '💎';
      } else if (userProf >= 80) {
        medal = '🥇';
      } else if (userProf >= 70) {
        medal = '🥈';
      }

      // Kiểm tra xem đã tồn tại Bạn chưa
      const exists = list.some((x) => x.name === GRAMMAR_UI_TEXT.lessonDetail.userStudentName);
      if (!exists) {
        list.push({
          rank: 4,
          name: GRAMMAR_UI_TEXT.lessonDetail.userStudentName,
          score: `${userProf}%`,
          time: '2m 05s',
          avatar:
            'https://api.dicebear.com/7.x/adventurer/svg?seed=mock-user-123',
          medal,
        });
      }

      list.sort((a, b) => {
        const valA = parseInt(a.score.replace('%', ''));
        const valB = parseInt(b.score.replace('%', ''));
        return valB - valA;
      });
    }

    return list;
  };

  const dynamicLeaderboard = getDynamicLeaderboard();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-8 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-full mx-auto space-y-6 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToRoadmap}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-border transition-all border-none"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.lessonDetail.levelLabel.replace('{level}', lesson.level)}
                </span>
                <span className="text-[10px] font-extrabold text-muted-foreground/75 tracking-wider uppercase">
                  {GRAMMAR_UI_TEXT.lessonDetail.timeReadLabel}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2 mt-1">
                {lesson.title}
                {lesson.vietnameseTitle && (
                  <span className="text-sm text-muted-foreground font-normal hidden sm:inline">
                    ({lesson.vietnameseTitle})
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onEditLesson}
              className="px-4 py-2.5 text-xs font-bold bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all shadow-sm"
            >
              {GRAMMAR_UI_TEXT.lessonDetail.btnEditLesson}
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab('LECTURE')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'LECTURE'
                ? 'border-blue-500 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-4 w-4" /> {GRAMMAR_UI_TEXT.lessonDetail.tabLecture}
          </button>

          <button
            onClick={() => setActiveTab('MINDMAP')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'MINDMAP'
                ? 'border-blue-500 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4" /> {GRAMMAR_UI_TEXT.lessonDetail.tabMindmap}
          </button>

          <button
            onClick={() => setActiveTab('CHEATSHEET')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'CHEATSHEET'
                ? 'border-blue-500 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Compass className="h-4 w-4" /> {GRAMMAR_UI_TEXT.lessonDetail.tabCheatsheet}
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Study Work Area (Left) */}
          <div className="flex-1 space-y-8 min-w-0">
            {/* TAB 1: RENDER LÝ THUYẾT BÀI HỌC */}
            {activeTab === 'LECTURE' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {lesson.blocks &&
                  lesson.blocks.map((block: GrammarBlock, idx: number) => {
                    switch (block.type) {
                      case 'media':
                        return (
                          <div
                            id={block.id}
                            key={block.id || idx}
                            className="space-y-3"
                          >
                            <MediaBlock
                              url={block.url || ''}
                              provider={block.provider || 'youtube'}
                            />
                          </div>
                        );

                      case 'text': {
                        const isTitle = (block.content || '').startsWith(
                          '### '
                        );
                        if (isTitle) {
                          const cleanTitle = (block.content || '').replace(
                            '### ',
                            ''
                          );
                          return (
                            <h2
                              id={block.id}
                              key={block.id || idx}
                              className="text-lg font-extrabold text-foreground border-l-4 border-blue-500 pl-3 mt-6 mb-2 tracking-wide"
                            >
                              {cleanTitle}
                            </h2>
                          );
                        }
                        return (
                          <div
                            id={block.id}
                            key={block.id || idx}
                            className="bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-xl space-y-4"
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {block.content || ''}
                            </p>
                          </div>
                        );
                      }

                      case 'formula':
                        return (
                          <div
                            id={block.id}
                            key={block.id || idx}
                            className="bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-xl border-l-4 border-l-blue-500 space-y-4"
                          >
                            <div className="text-[10px] font-extrabold text-muted-foreground/75 tracking-widest uppercase">
                              Structure Formula
                            </div>
                            <FormulaBuilder
                              elements={block.elements || []}
                              note={block.note || ''}
                              isEditable={false}
                            />
                          </div>
                        );

                      case 'example':
                        return (
                          <div
                            id={block.id}
                            key={block.id || idx}
                            className="bg-card border border-border text-card-foreground rounded-3xl p-6 shadow-xl space-y-4"
                          >
                            <div className="text-[10px] font-extrabold text-muted-foreground/75 tracking-widest uppercase border-b border-border pb-3 flex justify-between items-center">
                              <span>Examples in Context</span>
                              <span className="text-[9px] text-muted-foreground/60">
                                {GRAMMAR_UI_TEXT.lessonDetail.exampleFeedbackNote}
                              </span>
                            </div>

                            {/* Nâng cấp ví dụ mẫu có thêm nút Loa phát âm */}
                            <div className="space-y-4">
                              {(block.items || []).map((item, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="bg-muted/40 border border-border/60 rounded-2xl p-4.5 flex items-start justify-between gap-4 group hover:border-border transition-all"
                                >
                                  <div className="space-y-1.5 flex-1">
                                    <p className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">
                                      {item.text}
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 italic leading-relaxed">
                                      {item.explanation}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleSpeakText(item.text)}
                                    className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border transition flex-shrink-0 cursor-pointer active:scale-95"
                                    title={GRAMMAR_UI_TEXT.lessonDetail.exampleSpeechTitle}
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );

                      case 'callout':
                        return (
                          <div
                            id={block.id}
                            key={block.id || idx}
                            className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 shadow-xl space-y-2 border-l-4 border-l-blue-500/70"
                          >
                            <span className="text-xs font-black text-blue-400 tracking-wider uppercase block">
                              {block.title || GRAMMAR_UI_TEXT.lessonDetail.calloutDefaultTitle}
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {block.content || ''}
                            </p>
                          </div>
                        );

                      case 'quiz':
                        return (
                          <div id={block.id} key={block.id || idx}>
                            <QuizBlock
                              question={block.question || ''}
                              options={block.options || []}
                              answer={block.answer || ''}
                              isEditable={false}
                            />
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}

                {/* Action panel inside view */}
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    onClick={onComplete}
                    disabled={isCompleting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-xl border-none shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-wider"
                  >
                    {isCompleting ? (
                      <span className="h-4 w-4 rounded-full border-2 border-border border-t-transparent animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                    Hoàn thành lý thuyết & Nhận +50 XP
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE MINDMAP (SƠ ĐỒ TƯ DUY TRỰC QUAN) */}
            {activeTab === 'MINDMAP' && (
              <div className="bg-card border border-border text-card-foreground rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-indigo-400" /> {GRAMMAR_UI_TEXT.lessonDetail.mindmapTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground/70">
                    {GRAMMAR_UI_TEXT.lessonDetail.mindmapDesc}
                  </p>
                </div>

                {/* SVG mindmap structure */}
                <div className="relative border border-border bg-background/60 p-4 flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
                  <svg
                    className="w-full max-w-[580px] h-[340px]"
                    viewBox="0 0 600 350"
                  >
                    {/* Connection lines */}
                    <line
                      x1="300"
                      y1="175"
                      x2="130"
                      y2="90"
                      className="stroke-indigo-500/40"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="300"
                      y1="175"
                      x2="470"
                      y2="90"
                      className="stroke-indigo-500/40"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1="300"
                      y1="175"
                      x2="300"
                      y2="280"
                      className="stroke-indigo-500/40"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />

                    {/* Central Node */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => setSelectedMindmapNode('CENTRAL')}
                    >
                      <rect
                        x="200"
                        y="145"
                        width="200"
                        height="60"
                        rx="30"
                        className="fill-indigo-600/10 stroke-indigo-500 group-hover:fill-indigo-600/20 group-hover:scale-102 transition-all"
                        strokeWidth="2"
                      />
                      <text
                        x="300"
                        y="180"
                        className="fill-indigo-100 font-extrabold text-xs text-center"
                        textAnchor="middle"
                      >
                        {lesson.title}
                      </text>
                    </g>

                    {/* Node 1: Formula */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => setSelectedMindmapNode('FORMULA')}
                    >
                      <rect
                        x="50"
                        y="60"
                        width="160"
                        height="50"
                        rx="12"
                        className="fill-blue-500/10 stroke-blue-500 group-hover:fill-blue-500/20 transition"
                        strokeWidth="1.5"
                      />
                      <text
                        x="130"
                        y="90"
                        className="fill-blue-300 font-bold text-xs"
                        textAnchor="middle"
                      >
                        {GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeFormula}
                      </text>
                    </g>

                    {/* Node 2: Usage */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => setSelectedMindmapNode('USAGE')}
                    >
                      <rect
                        x="390"
                        y="60"
                        width="160"
                        height="50"
                        rx="12"
                        className="fill-purple-500/10 stroke-purple-500 group-hover:fill-purple-500/20 transition"
                        strokeWidth="1.5"
                      />
                      <text
                        x="470"
                        y="90"
                        className="fill-purple-300 font-bold text-xs"
                        textAnchor="middle"
                      >
                        {GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeUsage}
                      </text>
                    </g>

                    {/* Node 3: Examples */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => setSelectedMindmapNode('EXAMPLES')}
                    >
                      <rect
                        x="220"
                        y="255"
                        width="160"
                        height="50"
                        rx="12"
                        className="fill-emerald-500/10 stroke-emerald-500 group-hover:fill-emerald-500/20 transition"
                        strokeWidth="1.5"
                      />
                      <text
                        x="300"
                        y="285"
                        className="fill-emerald-300 font-bold text-xs"
                        textAnchor="middle"
                      >
                        {GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeExamples}
                      </text>
                    </g>
                  </svg>

                  {/* Mindmap details panel */}
                  {selectedMindmapNode && (
                    <div className="absolute inset-x-6 bottom-6 bg-card/95 border border-border rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                          {selectedMindmapNode === 'CENTRAL' && 'CHỦ ĐỀ CHÍNH'}
                          {selectedMindmapNode === 'FORMULA' &&
                            GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeFormula}
                          {selectedMindmapNode === 'USAGE' && GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeUsage}
                          {selectedMindmapNode === 'EXAMPLES' &&
                            GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeExamples}
                        </span>
                        <button
                          onClick={() => setSelectedMindmapNode(null)}
                          className="text-muted-foreground hover:text-foreground p-1 border-none bg-transparent cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {selectedMindmapNode === 'CENTRAL' &&
                          GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeCentralDetail.replace('{title}', lesson.title).replace('{level}', lesson.level)}
                        {selectedMindmapNode === 'FORMULA' &&
                          GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeFormulaDetail}
                        {selectedMindmapNode === 'USAGE' &&
                          GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeUsageDetail}
                        {selectedMindmapNode === 'EXAMPLES' &&
                          GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeExamplesDetail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CHEATSHEET & AUDIO RESOURCE */}
            {activeTab === 'CHEATSHEET' && (
              <div className="bg-card border border-border text-card-foreground rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      <Compass className="h-5 w-5 text-indigo-400" /> {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground/70">
                      {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetDesc}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadCheatSheet}
                      className="bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <Download className="h-4 w-4" /> {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetBtnDownload}
                    </Button>
                    <Button
                      onClick={handleShareLink}
                      className="bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <Share2 className="h-4 w-4" /> {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetBtnShare}
                    </Button>
                  </div>
                </div>

                {/* Cheat-sheet card body */}
                <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-5">
                  <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                    <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                      {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetRuleTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetRuleDesc}
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 space-y-2">
                    <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                      {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetTrapTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetTrapDesc}
                    </p>
                  </div>

                  {/* Interactive audio examples deck */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-black text-muted-foreground/75 tracking-wider uppercase block">
                      {GRAMMAR_UI_TEXT.lessonDetail.cheatsheetAudioLabel}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-background p-4 border border-border rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            "If I were you, I would learn grammar."
                          </p>
                          <span className="text-[9px] text-muted-foreground/60 block mt-0.5">
                            Conditional Clause
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleSpeakText(
                              'If I were you, I would learn grammar.'
                            )
                          }
                          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border cursor-pointer active:scale-95"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="bg-background p-4 border border-border rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            "Hardly had we entered when it rained."
                          </p>
                          <span className="text-[9px] text-muted-foreground/60 block mt-0.5">
                            Inversion Structure
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleSpeakText(
                              'Hardly had we entered when it rained.'
                            )
                          }
                          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border cursor-pointer active:scale-95"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Outline timeline card & Leaderboard (Right Sidebar) */}
          <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-10 self-start flex-shrink-0">
            {/* Outline Timeline component */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  {GRAMMAR_UI_TEXT.lessonDetail.sidebarOutlineTitle}
                </div>
                <span className="text-[9px] font-extrabold bg-muted text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.lessonDetail.sidebarOutlineBadge}
                </span>
              </div>

              <OutlineTimeline
                items={activeOutline}
                onClickItem={handleScrollToBlock}
              />
            </div>

            {/* Grammar Battle Leaderboard Card (Thi Đua) */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <Award className="h-4 w-4 text-amber-500" />
                  {GRAMMAR_UI_TEXT.lessonDetail.sidebarLeaderboardTitle}
                </div>
                <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.lessonDetail.sidebarLeaderboardBadge}
                </span>
              </div>

              {/* Leaderboard entries */}
              <div className="space-y-3">
                {dynamicLeaderboard.map((item) => (
                  <div
                    key={`${item.name}-${item.rank}`}
                    className={`flex items-center justify-between p-2.5 border rounded-xl bg-secondary/20 hover:border-border transition-all ${
                      item.name.includes('Bạn')
                        ? 'border-blue-500/40 ring-1 ring-blue-500/25 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'border-border/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-muted-foreground/60 w-4">
                        {item.rank}
                      </span>
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-7 w-7 rounded-full bg-secondary"
                      />
                      <span className="text-xs font-bold text-muted-foreground truncate max-w-[100px]">
                        {item.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-foreground block">
                        {item.medal} {item.score}
                      </span>
                      <span className="text-[8px] text-muted-foreground/75 block">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-save Quick Notes Sidebar */}
            <QuickNotesSidebar
              lessonId={lesson.id}
              initialNotes={lesson.quickNotes}
            />

            {/* Up Next Suggestions */}
            {nextLesson ? (
              <div className="bg-card border border-border rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10 animate-pulse" />
                  {GRAMMAR_UI_TEXT.lessonDetail.sidebarNextLessonTitle}
                </div>

                <div
                  onClick={() => onNavigateToLesson(nextLesson.id, false)}
                  className="border border-border hover:border-muted-foreground/30 rounded-2xl p-4 bg-muted/20 flex justify-between items-center cursor-pointer transition-all hover:bg-muted/40 group"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-extrabold text-foreground group-hover:text-blue-450 transition-colors truncate">
                      {nextLesson.title}
                    </h4>
                    <span className="text-[9px] font-bold text-muted-foreground/75 uppercase mt-0.5 block">
                      {GRAMMAR_UI_TEXT.lessonDetail.sidebarNextLessonBadge.replace('{level}', nextLesson.level)}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/70 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                  <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />
                  {GRAMMAR_UI_TEXT.lessonDetail.sidebarCompletedTitle}
                </div>
                <div className="border border-dashed border-border rounded-2xl p-4 bg-muted/10 text-center space-y-1">
                  <h4 className="text-xs font-extrabold text-emerald-500">
                    {GRAMMAR_UI_TEXT.lessonDetail.sidebarCompletedCongrats}
                  </h4>
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    {GRAMMAR_UI_TEXT.lessonDetail.sidebarCompletedDesc}
                  </p>
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
