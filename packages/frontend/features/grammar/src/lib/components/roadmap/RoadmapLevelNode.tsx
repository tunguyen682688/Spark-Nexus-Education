import { Lock } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import type { GrammarLevel } from '../../types';
import { GRAMMAR_UI_TEXT } from '../../constants';

const T = GRAMMAR_UI_TEXT.roadmapNode;

interface RoadmapLevelNodeProps {
  levelBlock: GrammarLevel;
  onNavigateToLesson: (id: string, isDraft: boolean) => void;
}

export function RoadmapLevelNode({
  levelBlock,
  onNavigateToLesson,
}: RoadmapLevelNodeProps) {
  const navigate = useNavigate();
  const isA1 = levelBlock.level === 'A1';

  return (
    <div className="relative space-y-6">
      {/* Glowing Node Badge */}
      <span
        className={`absolute -left-[45px] top-0 flex h-10 w-10 items-center justify-center rounded-full font-bold text-xs shadow-lg transition-all ${
          isA1
            ? 'bg-primary/10 text-primary border border-primary/40 ring-4 ring-primary/10 shadow-primary/20 shadow-lg'
            : 'bg-card text-muted-foreground border border-border'
        }`}
      >
        {levelBlock.level}
      </span>

      {/* Level Details */}
      <div className="space-y-1 pl-2">
        <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          {levelBlock.name}
        </h2>
        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground tracking-wider uppercase">
          {levelBlock.subName}
        </p>
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-2">
        {levelBlock.lessons.map((lesson) => {
          const isMastered = lesson.status === 'MASTERED';
          const isInProgress = lesson.status === 'IN_PROGRESS';
          const isLocked = lesson.status === 'LOCKED';
          const isDraft = lesson.status === 'DRAFT';
          const hasLeak = lesson.hasLeak;
          const isNeedsReview =
            (isMastered && lesson.proficiency && lesson.proficiency < 80) ||
            (isInProgress &&
              lesson.proficiency &&
              lesson.proficiency > 0 &&
              lesson.proficiency < 80);

          return (
            <div
              key={lesson.id}
              onClick={() => {
                if (!isLocked) {
                  onNavigateToLesson(lesson.id, isDraft);
                }
              }}
              className={`relative group rounded-2xl p-5 border bg-card transition-all duration-300 ${
                isLocked
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:-translate-y-0.5'
              } ${
                hasLeak
                  ? 'border-destructive bg-destructive/5 hover:border-destructive ring-2 ring-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : isMastered
                  ? isNeedsReview
                    ? 'border-destructive/30 bg-destructive/5 hover:border-destructive/50 ring-1 ring-destructive/10'
                    : 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                  : isInProgress
                  ? 'border-primary/30 bg-primary/5 shadow-md shadow-primary/5 ring-1 ring-primary/20'
                  : isDraft
                  ? 'border-amber-500/30 bg-amber-500/5 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/15 hover:border-amber-500/40'
                  : 'border-border/40 bg-muted/20 opacity-45'
              }`}
            >
              {/* Inner Content */}
              <div className="space-y-3.5">
                {/* Card Header Status */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-xl bg-secondary/80 border text-base ${
                      hasLeak
                        ? 'border-destructive/50 text-destructive'
                        : isMastered
                        ? isNeedsReview
                          ? 'border-destructive/35 text-destructive'
                          : 'border-emerald-500/20 text-emerald-500'
                        : isInProgress
                        ? 'border-primary/30 text-primary'
                        : isDraft
                        ? 'border-amber-500/20 text-amber-500'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {lesson.icon}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasLeak && (
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[8px] font-black bg-destructive/20 text-destructive border border-destructive/40 tracking-wide uppercase shadow-[0_0_8px_rgba(239,68,68,0.15)]">
                        <span role="img" aria-label="warning">
                          ⚠️
                        </span>{' '}
                        {T.leakBadge.replace('{count}', String(lesson.trapCount))}
                      </span>
                    )}

                    {isNeedsReview && !hasLeak && (
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[8px] font-black bg-destructive/10 text-destructive border border-destructive/20 tracking-wide uppercase">
                        <span role="img" aria-label="warning">
                          ⚠️
                        </span>{' '}
                        {T.needsReviewBadge}
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                        hasLeak
                          ? 'bg-destructive/15 text-destructive border border-destructive/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                          : isMastered
                          ? isNeedsReview
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : isInProgress
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : isDraft
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {hasLeak ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                          {T.statusTrapped}
                        </>
                      ) : isMastered ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {T.statusMastered}
                        </>
                      ) : isInProgress ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {T.statusInProgress}
                        </>
                      ) : isDraft ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {T.statusDraft}
                        </>
                      ) : (
                        <Lock className="h-2.5 w-2.5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-1.5">
                  <h3
                    className={`text-base font-bold group-hover:text-primary transition-colors ${
                      hasLeak ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[32px]">
                    {lesson.description}
                  </p>
                </div>

                {/* Card Footer Progress / Stats */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-4">
                  {isMastered && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-sm"
                        title={
                          lesson.proficiency && lesson.proficiency >= 90
                            ? T.medalDiamond
                            : lesson.proficiency && lesson.proficiency >= 80
                            ? T.medalGold
                            : lesson.proficiency && lesson.proficiency >= 70
                            ? T.medalSilver
                            : T.medalBronze
                        }
                      >
                        {lesson.proficiency && lesson.proficiency >= 90
                          ? '💎'
                          : lesson.proficiency && lesson.proficiency >= 80
                          ? '🥇'
                          : lesson.proficiency && lesson.proficiency >= 70
                          ? '🥈'
                          : '🥉'}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold tracking-wider ${
                          hasLeak || isNeedsReview
                            ? 'text-destructive'
                            : 'text-emerald-500'
                        }`}
                      >
                        {lesson.proficiency || 100}% {T.masteredLabel}
                      </span>
                    </div>
                  )}

                  {isInProgress && (
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{T.currentProficiency}</span>
                        <span
                          className={`font-extrabold ${
                            hasLeak ? 'text-destructive' : 'text-primary'
                          }`}
                        >
                          {lesson.proficiency || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full shadow-lg ${
                            hasLeak
                              ? 'bg-destructive shadow-destructive/50'
                              : 'bg-primary shadow-primary/50'
                          }`}
                          style={{
                            width: `${lesson.proficiency || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {!isLocked && !isDraft && (
                    <div className="flex gap-2.5 items-center flex-shrink-0">
                      {hasLeak && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/grammar/trap-diary');
                          }}
                          className="text-[9px] font-black text-destructive hover:text-destructive/80 bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                        >
                          <span role="img" aria-label="crossed-swords">
                            ⚔️
                          </span>{' '}
                          {T.btnBreakTrap}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/grammar/lessons/${lesson.id}/assessment`);
                        }}
                        className="text-[9px] font-black text-primary hover:text-primary/80 uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer flex items-center gap-0.5"
                      >
                        <span role="img" aria-label="target">
                          🎯
                        </span>{' '}
                        {T.btnPracticeQuiz}
                      </button>
                    </div>
                  )}

                  {isDraft && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                      <span>
                        <span role="img" aria-label="writing-hand">
                          ✍
                        </span>{' '}
                        {T.draftLabel}
                      </span>
                    </div>
                  )}

                  {isLocked && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <Lock className="h-3 w-3" />
                      {T.statusLocked}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Graduation lock block */}
      <div className="pl-2 mt-5">
        {(() => {
          const nonDraftLessons = levelBlock.lessons.filter(
            (l) => l.status !== 'DRAFT'
          );
          const allRequiredLessonsMastered =
            nonDraftLessons.length > 0 &&
            nonDraftLessons.every((l) => l.status === 'MASTERED');

          return (
            <div
              className={`bg-card border rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
                allRequiredLessonsMastered
                  ? 'border-amber-500/20 hover:border-amber-500/35 hover:shadow-lg hover:shadow-amber-500/5'
                  : 'border-border/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 text-center sm:text-left flex-1">
                {allRequiredLessonsMastered ? (
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl shadow-inner animate-pulse">
                    <span role="img" aria-label="graduation-cap">
                      🎓
                    </span>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-muted border border-border text-muted-foreground flex items-center justify-center text-xl shadow-inner">
                    <span role="img" aria-label="locked">
                      🔒
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  <span
                    className={`text-[9px] font-black tracking-widest uppercase block ${
                      allRequiredLessonsMastered
                        ? 'text-amber-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {allRequiredLessonsMastered
                      ? T.graduationExam
                      : T.graduationExamLocked}
                  </span>
                  <h4 className="text-sm font-black text-foreground">
                    {T.graduationTitle.replace('{level}', levelBlock.level)}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
                    {allRequiredLessonsMastered
                      ? T.graduationDescUnlocked
                      : T.graduationDescLocked.replace('{level}', levelBlock.level)}
                  </p>
                </div>
              </div>

              {allRequiredLessonsMastered ? (
                <Button
                  onClick={() =>
                    navigate(`/grammar/graduation/${levelBlock.level}`)
                  }
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold px-6 py-2.5 rounded-xl border-none shadow-md shadow-amber-500/15 text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all w-full sm:w-auto flex-shrink-0"
                >
                  {T.btnGraduate}
                </Button>
              ) : (
                <Button
                  disabled
                  className="bg-secondary text-muted-foreground border border-border cursor-not-allowed opacity-50 px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider w-full sm:w-auto flex-shrink-0 border-none"
                >
                  {T.btnNotEligible}
                </Button>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
