import { FC, useState } from 'react';
import { BookOpen, ChevronRight, Play } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import { GRAMMAR_UI_TEXT } from '../constants';
import type { GrammarRoadmapResponse, GrammarLesson } from '../types';

import { RoadmapLevelNode } from '../components/roadmap/RoadmapLevelNode';
import { SrsQuizModal } from '../components/roadmap/SrsQuizModal';

interface GrammarLearningPathContainerProps {
  roadmap: GrammarRoadmapResponse;
  onNavigateToCreate: () => void;
  onNavigateToLesson: (id: string, isDraft: boolean) => void;
}

export const GrammarLearningPathContainer: FC<
  GrammarLearningPathContainerProps
> = ({ roadmap, onNavigateToCreate, onNavigateToLesson }) => {
  const navigate = useNavigate();
  const [isSrsOpen, setIsSrsOpen] = useState(false);

  // Khảo sát tiêu điểm bài học hiện tại (Focus mission)
  let focusLesson: GrammarLesson | null = null;
  for (const levelBlock of roadmap.levels) {
    const inProgress = levelBlock.lessons.find((l) => l.status === 'IN_PROGRESS');
    if (inProgress) {
      focusLesson = inProgress;
      break;
    }
  }
  if (!focusLesson) {
    for (const levelBlock of roadmap.levels) {
      const locked = levelBlock.lessons.find((l) => l.status === 'LOCKED');
      if (locked) {
        focusLesson = locked;
        break;
      }
    }
  }
  if (!focusLesson && roadmap.levels.length > 0 && roadmap.levels[0].lessons.length > 0) {
    focusLesson = roadmap.levels[0].lessons[0];
  }

  // Đếm số lượng bài viết nháp (DRAFT) để phục vụ Teacher Console
  const allLessons = roadmap.levels.flatMap((level) => level.lessons);
  const draftLessonsCount = allLessons.filter((l) => l.status === 'DRAFT').length;
  const publishedLessonsCount = allLessons.filter((l) => l.status !== 'DRAFT').length;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto flex flex-col lg:flex-row gap-10">
        {/* Left Side: Learning Timeline */}
        <div className="flex-1 space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground/60 bg-clip-text text-transparent">
              {GRAMMAR_UI_TEXT.learningPath.title}
            </h1>
            <p className="text-xs font-semibold text-muted-foreground tracking-wider">
              {GRAMMAR_UI_TEXT.learningPath.subtitle}
            </p>
          </div>

          {/* Timeline Wrapper */}
          <div className="relative pl-8 space-y-14 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-border">
            {roadmap.levels.map((levelBlock) => (
              <RoadmapLevelNode
                key={levelBlock.level}
                levelBlock={levelBlock}
                onNavigateToLesson={onNavigateToLesson}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Command Center & Teacher Console Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Practice Hub Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span role="img" aria-label="fire" className="text-amber-500 text-sm">🔥</span>
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.learningPath.hubTitle}
                </h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 tracking-wider">
                {GRAMMAR_UI_TEXT.learningPath.missionLabel}
              </span>
            </div>

            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-2xl p-4 gap-2">
              <div>
                <span className="text-[9px] font-bold text-muted-foreground block uppercase">{GRAMMAR_UI_TEXT.learningPath.streakLabel}</span>
                <span className="text-sm font-extrabold text-amber-500 mt-0.5 block">
                  <span role="img" aria-label="fire">🔥</span> {GRAMMAR_UI_TEXT.learningPath.streakDesc.replace('{days}', String(roadmap.streakDays))}
                </span>
              </div>
              <div className="text-2xl animate-bounce"><span role="img" aria-label="target">🎯</span></div>
            </div>

            <div className="space-y-2.5">
              <Button onClick={() => navigate('/grammar/daily-quiz')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 border-none shadow-lg shadow-amber-500/15 text-xs transition-all active:scale-[0.98] cursor-pointer">
                {GRAMMAR_UI_TEXT.learningPath.btnDailyQuiz}
              </Button>
              <Button onClick={() => navigate('/grammar/practice')} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 border-none shadow-lg text-xs transition-all active:scale-[0.98] cursor-pointer">
                <span role="img" aria-label="target">🎯</span> {GRAMMAR_UI_TEXT.learningPath.btnPracticeArena}
              </Button>
              <Button onClick={() => setIsSrsOpen(true)} className="w-full bg-secondary hover:bg-secondary/80 border border-border text-primary font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-[0.98] cursor-pointer">
                <span role="img" aria-label="brain">🧠</span> {GRAMMAR_UI_TEXT.learningPath.btnSrsReview}
              </Button>
              <Button onClick={() => navigate('/grammar/community')} className="w-full bg-secondary hover:bg-secondary/80 border border-border text-emerald-500 font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-[0.98] cursor-pointer">
                <span role="img" aria-label="comment-bubble">💬</span> {GRAMMAR_UI_TEXT.learningPath.btnCommunity}
              </Button>
              <Button onClick={() => navigate('/grammar/profile')} className="w-full bg-secondary hover:bg-secondary/80 border border-border text-purple-500 font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-[0.98] cursor-pointer">
                <span role="img" aria-label="profile">👤</span> {GRAMMAR_UI_TEXT.learningPath.btnProfile}
              </Button>
              <Button onClick={() => navigate('/grammar/leaderboard')} className="w-full bg-secondary hover:bg-secondary/80 border border-border text-yellow-600 dark:text-yellow-400 font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-[0.98] cursor-pointer">
                <span role="img" aria-label="trophy">🏆</span> {GRAMMAR_UI_TEXT.learningPath.btnLeaderboard}
              </Button>
            </div>
          </div>

          {/* Teacher Console Sidebar Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">{GRAMMAR_UI_TEXT.learningPath.teacherConsoleTitle}</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold bg-primary/10 text-primary border border-primary/20 tracking-wider">ADMIN</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {GRAMMAR_UI_TEXT.learningPath.teacherConsoleDesc}
            </p>
            <div className="grid grid-cols-2 gap-3 bg-muted/40 border border-border rounded-xl p-3 text-center">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground block uppercase">{GRAMMAR_UI_TEXT.learningPath.publishedLabel}</span>
                <span className="text-base font-black text-foreground">{GRAMMAR_UI_TEXT.learningPath.publishedCount.replace('{count}', String(publishedLessonsCount))}</span>
              </div>
              <div className="border-l border-border">
                <span className="text-[10px] font-bold text-muted-foreground block uppercase">{GRAMMAR_UI_TEXT.learningPath.draftLabel}</span>
                <span className="text-base font-black text-amber-500">{GRAMMAR_UI_TEXT.learningPath.draftCount.replace('{count}', String(draftLessonsCount))}</span>
              </div>
            </div>
            <Button onClick={onNavigateToCreate} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-1.5 border-none shadow-lg text-xs transition-all active:scale-[0.98]">
              {GRAMMAR_UI_TEXT.learningPath.btnNewLesson}
            </Button>
          </div>

          {/* Command Center Stats */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-7">
            <div className="flex items-center justify-between">
              <div><h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">{GRAMMAR_UI_TEXT.learningPath.commandCenterTitle}</h3></div>
              <button type="button" onClick={() => navigate('/grammar/analytics')} className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 hover:text-primary/90 tracking-wider transition-colors cursor-pointer border-none">
                {GRAMMAR_UI_TEXT.learningPath.liveAnalytics} <span role="img" aria-label="analytics-chart">📊</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{GRAMMAR_UI_TEXT.learningPath.academicMastery}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">{roadmap.percentComplete}%</span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><span role="img" aria-label="growth-chart">📈</span> {GRAMMAR_UI_TEXT.learningPath.academicStreak.replace('{days}', String(roadmap.streakDays))}</span>
              </div>
              <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${roadmap.percentComplete}%` }} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{GRAMMAR_UI_TEXT.learningPath.skillDecomposition}</div>
              <div className="space-y-3">
                {(
                  roadmap.skills || [
                    { name: 'Syntax (Cú pháp)', value: 18 },
                    { name: 'Morphology (Hình thái)', value: 24 },
                    { name: 'Modality (Sắc thái)', value: 8 },
                    { name: 'Tense & Aspect (Thì)', value: 15 },
                  ]
                ).map((skill, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground"><span>{skill.name}</span><span className="font-bold text-foreground">{skill.value}%</span></div>
                    <div className="h-1 w-full bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${skill.value}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-2xl p-4 flex items-center justify-between group hover:border-border/80 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl"><span role="img" aria-label="trophy">🏆</span></div>
                <div><div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{GRAMMAR_UI_TEXT.learningPath.xpAccumulated}</div><div className="text-xs font-extrabold text-foreground">{GRAMMAR_UI_TEXT.learningPath.xpValue.replace('{xp}', String(roadmap.currentXP))}</div></div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
            </div>

            {focusLesson && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{GRAMMAR_UI_TEXT.learningPath.currentMission}</div>
                <div className="bg-muted/50 border border-primary/20 rounded-2xl p-5 space-y-4">
                  <div className="space-y-1.5"><h4 className="text-sm font-bold text-foreground">{focusLesson.title}</h4><p className="text-[11px] text-muted-foreground leading-relaxed">{focusLesson.description}</p></div>
                  <Button onClick={() => { if (focusLesson) { onNavigateToLesson(focusLesson.id, focusLesson.status === 'DRAFT'); } }} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 border-none transition-all active:scale-[0.98]">
                    <Play className="h-3 w-3 fill-current" /> {GRAMMAR_UI_TEXT.learningPath.btnContinuePath}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SrsQuizModal isOpen={isSrsOpen} onClose={() => setIsSrsOpen(false)} />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
        .animate-scaleUp { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default GrammarLearningPathContainer;
