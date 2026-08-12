import {
  Sparkles,
  FileCode,
  Grid,
} from 'lucide-react';
import {
  Card,
} from '@spark-nest-ed/frontend-shared-components';
import type { BuilderSection } from '../../../hooks/container-logic/exam/use-exam-builder-container-logic';
import { BlueprintSummaryGrid, BlueprintLanguageRow } from './BlueprintSummaryGrid';

interface BlueprintPanelProps {
  blueprint: {
    totalQuestions: number;
    durationText: string;
    totalPoints: number;
    listening: { questions: number; timeMinutes: number };
    reading: { questions: number; timeMinutes: number };
    writing: { questions: number; timeMinutes: number };
    speaking: { questions: number; timeMinutes: number };
    math: { questions: number; timeMinutes: number };
  };
  settings: {
    title: string;
    description: string;
    level: string;
    language: string;
    passingScore: number;
    maxScore: number;
    createdDate: string;
    lastUpdatedDate: string;
  };
  sections: BuilderSection[];
}

export const BlueprintPanel = ({
  blueprint,
  settings,
  sections,
}: BlueprintPanelProps) => {
  return (
    <div className="space-y-4">
      <Card className="border-border shadow-sm bg-card p-4 space-y-4">
        <div className="pb-2 border-b border-border">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
            Exam Settings
          </h3>
          <span className="text-[10px] font-bold text-muted-foreground block mt-0.5">
            General
          </span>
        </div>

        <div className="space-y-3.5 text-xs font-medium">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Title *
              </label>
              <span className="text-[10px] text-muted-foreground">
                {settings.title.length}/100
              </span>
            </div>
            <input
              value={settings.title}
              readOnly
              className="w-full text-xs bg-background border border-border rounded-xl p-2 font-bold"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Description
              </label>
              <span className="text-[10px] text-muted-foreground">
                {settings.description.length}/500
              </span>
            </div>
            <textarea
              value={settings.description}
              readOnly
              rows={3}
              className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-2.5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Level
            </label>
            <select
              value={settings.level}
              disabled
              className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl cursor-not-allowed opacity-60"
            >
              <option>{settings.level || 'N/A'}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Language
            </label>
            <select
              value={settings.language}
              disabled
              className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl cursor-not-allowed opacity-60"
            >
              <option>{settings.language}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Passing Score
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.passingScore}
                readOnly
                className="text-xs bg-background border border-border rounded-xl p-2 font-bold w-24"
              />
              <span className="text-xs font-bold text-muted-foreground">
                / {settings.maxScore}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
              Blueprint
            </h4>

            <BlueprintSummaryGrid
              totalQuestions={blueprint.totalQuestions}
              durationText={blueprint.durationText}
              totalPoints={blueprint.totalPoints}
            />

            <div className="space-y-2 text-xs font-semibold">
              {blueprint.listening.questions > 0 && (
                <BlueprintLanguageRow type="listening" questions={blueprint.listening.questions} timeMinutes={blueprint.listening.timeMinutes} />
              )}
              {blueprint.reading.questions > 0 && (
                <BlueprintLanguageRow type="reading" questions={blueprint.reading.questions} timeMinutes={blueprint.reading.timeMinutes} />
              )}
              {blueprint.writing.questions > 0 && (
                <BlueprintLanguageRow type="writing" questions={blueprint.writing.questions} timeMinutes={blueprint.writing.timeMinutes} />
              )}
              {blueprint.speaking.questions > 0 && (
                <BlueprintLanguageRow type="speaking" questions={blueprint.speaking.questions} timeMinutes={blueprint.speaking.timeMinutes} />
              )}
              {blueprint.math && blueprint.math.questions > 0 && (
                <BlueprintLanguageRow type="math" questions={blueprint.math.questions} timeMinutes={blueprint.math.timeMinutes} />
              )}

              {blueprint.listening.questions === 0 && blueprint.reading.questions === 0 && blueprint.writing.questions === 0 && blueprint.speaking.questions === 0 && (!blueprint.math || blueprint.math.questions === 0) && (
                <div className="text-center py-3 text-muted-foreground text-[11px]">
                  No sections defined yet
                </div>
              )}

              {(() => {
                const breakSection = sections.find((section) => section.isBreak);
                if (breakSection) {
                  return <BlueprintLanguageRow type="break" questions={0} timeMinutes={breakSection.durationMinutes} />;
                }
                return null;
              })()}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
            <div>
              <span className="block">Created</span>
              <span className="text-foreground">{settings.createdDate || '\u2014'}</span>
            </div>
            <div className="text-right">
              <span className="block">Last Updated</span>
              <span className="text-foreground">{settings.lastUpdatedDate || '\u2014'}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm bg-card p-4 hover:shadow-md transition-all cursor-not-allowed opacity-60 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-extrabold text-xs text-foreground">
              AI Generate Section
            </h5>
            <p className="text-[10px] text-muted-foreground font-medium leading-snug">
              Coming soon
            </p>
          </div>
        </Card>

        <Card className="border-border shadow-sm bg-card p-4 hover:shadow-md transition-all cursor-not-allowed opacity-60 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FileCode className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-extrabold text-xs text-foreground">
              Import Questions
            </h5>
            <p className="text-[10px] text-muted-foreground font-medium leading-snug">
              Coming soon
            </p>
          </div>
        </Card>

        <Card className="border-border shadow-sm bg-card p-4 hover:shadow-md transition-all cursor-not-allowed opacity-60 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-extrabold text-xs text-foreground">
              Question Templates
            </h5>
            <p className="text-[10px] text-muted-foreground font-medium leading-snug">
              Coming soon
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
