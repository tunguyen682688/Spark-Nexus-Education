import React from 'react';
import {
  BookOpen,
  Keyboard,
  Sparkles,
  Mic,
  Award,
  Layers,
} from 'lucide-react';
import { LISTENING_DASHBOARD_TEXT, LISTENING_ROUTES } from '../constants/listening-constants';

export interface StudyDashboardWorkspacesProps {
  materialId: string;
  hasQuestions: boolean;
  questionCount: number;
  onNavigate: (path: string) => void;
  vocabularySetId?: string | null;
}

export const StudyDashboardWorkspaces: React.FC<StudyDashboardWorkspacesProps> = ({
  materialId,
  hasQuestions,
  questionCount,
  onNavigate,
  vocabularySetId,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground pl-2">
        {LISTENING_DASHBOARD_TEXT.WORKSPACES_TITLE}
      </h3>

      {/* Mode 1: Transcript & Shadowing */}
      <div
        onClick={() => onNavigate(LISTENING_ROUTES.WORKSPACE.TRANSCRIPT(materialId))}
        className="group relative flex items-start gap-4 overflow-hidden rounded-[22px] border border-border/70 bg-card/90 p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-md"
      >
        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
            {LISTENING_DASHBOARD_TEXT.MODES.TRANSCRIPT.TITLE}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            {LISTENING_DASHBOARD_TEXT.MODES.TRANSCRIPT.DESC}
          </p>
        </div>
      </div>

      {/* Mode 2: Dictation Practice */}
      <div
        onClick={() => onNavigate(LISTENING_ROUTES.WORKSPACE.DICTATION(materialId))}
        className="group relative flex items-start gap-4 overflow-hidden rounded-[22px] border border-border/70 bg-card/90 p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-md"
      >
        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Keyboard className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
            {LISTENING_DASHBOARD_TEXT.MODES.DICTATION.TITLE}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            {LISTENING_DASHBOARD_TEXT.MODES.DICTATION.DESC}
          </p>
        </div>
      </div>

      {/* Mode 3: Gap Fill Practice */}
      <div
        onClick={() => onNavigate(LISTENING_ROUTES.WORKSPACE.GAPFILL(materialId))}
        className="group relative flex items-start gap-4 overflow-hidden rounded-[22px] border border-border/70 bg-card/90 p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-md"
      >
        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
            {LISTENING_DASHBOARD_TEXT.MODES.GAPFILL.TITLE}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            {LISTENING_DASHBOARD_TEXT.MODES.GAPFILL.DESC}
          </p>
        </div>
      </div>

      {/* Mode 4: Shadowing Voice Practice */}
      <div
        onClick={() => onNavigate(LISTENING_ROUTES.WORKSPACE.SHADOWING(materialId))}
        className="group relative flex items-start gap-4 overflow-hidden rounded-[22px] border border-border/70 bg-card/90 p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-md"
      >
        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Mic className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
            {LISTENING_DASHBOARD_TEXT.MODES.SHADOWING.TITLE}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            {LISTENING_DASHBOARD_TEXT.MODES.SHADOWING.DESC}
          </p>
        </div>
      </div>

      {/* Mode 5: Exam Quiz */}
      {hasQuestions ? (
        <div
          onClick={() => onNavigate(LISTENING_ROUTES.WORKSPACE.QUIZ(materialId))}
          className="group relative flex items-start gap-4 overflow-hidden rounded-[22px] border border-border/70 bg-card/90 p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-md"
        >
          <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
              {LISTENING_DASHBOARD_TEXT.MODES.QUIZ.TITLE} ({questionCount} CH)
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              {LISTENING_DASHBOARD_TEXT.MODES.QUIZ.DESC}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-start gap-4 overflow-hidden rounded-[22px] border border-border/70 bg-muted/40 p-5 opacity-50">
          <div className="p-3 bg-muted text-muted-foreground rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-muted-foreground">
              {LISTENING_DASHBOARD_TEXT.MODES.QUIZ.TITLE}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-bold">
              {LISTENING_DASHBOARD_TEXT.MODES.QUIZ_EMPTY}
            </p>
          </div>
        </div>
      )}

      {/* Mode 6: Companion Vocabulary Set */}
      {vocabularySetId && (
        <div
          onClick={() => onNavigate(`/vocabularies/set/${vocabularySetId}/detail`)}
          className="group relative flex items-start gap-4 overflow-hidden rounded-[22px] border border-border/70 bg-card/90 p-5 shadow-sm transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/[0.03] hover:shadow-md"
        >
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <Layers className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-foreground group-hover:text-emerald-400 transition-colors">
              {LISTENING_DASHBOARD_TEXT.MODES.VOCABULARY.TITLE}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              {LISTENING_DASHBOARD_TEXT.MODES.VOCABULARY.DESC}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
