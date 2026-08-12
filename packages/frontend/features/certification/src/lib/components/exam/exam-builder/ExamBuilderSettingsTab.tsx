import { Settings } from 'lucide-react';
import { Card, Input } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import { BlueprintSummaryGrid } from './BlueprintSummaryGrid';
import type { ExamSettingsForm } from '../../../hooks/container-logic/exam/use-exam-builder-container-logic';

interface ExamBuilderSettingsTabProps {
  settings: ExamSettingsForm;
  setSettings: React.Dispatch<React.SetStateAction<ExamSettingsForm>>;
  blueprint: {
    totalQuestions: number;
    durationText: string;
    totalPoints: number;
  };
}

export function ExamBuilderSettingsTab({ settings, setSettings, blueprint }: ExamBuilderSettingsTabProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-border shadow-sm bg-card p-6 space-y-6">
        <div className="pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-lg text-foreground">Exam Settings</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Configure your exam title, description, level, language, and scoring rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Title *
              </label>
              <span className="text-[10px] text-muted-foreground">
                {settings.title.length}/100
              </span>
            </div>
            <Input
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              maxLength={100}
              className="text-sm bg-background py-2 h-10 rounded-xl font-bold"
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
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              maxLength={500}
              rows={4}
              className="w-full text-sm font-medium text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Level
            </label>
            <select
              value={settings.level}
              onChange={(e) => setSettings({ ...settings, level: e.target.value })}
              className="w-full bg-background border border-border text-sm font-bold text-foreground py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {CERTIFICATION_UI_TEXT.examBuilderLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full bg-background border border-border text-sm font-bold text-foreground py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {CERTIFICATION_UI_TEXT.examBuilderLanguages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-extrabold text-sm text-foreground">Scoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Max Score
              </label>
              <Input
                type="number"
                value={settings.maxScore}
                min={0}
                onChange={(e) => setSettings({ ...settings, maxScore: Math.max(0, Number(e.target.value)) })}
                className="text-sm bg-background py-2 h-10 rounded-xl font-bold w-32"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Passing Score
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.passingScore}
                  min={0}
                  max={settings.maxScore}
                  onChange={(e) => setSettings({ ...settings, passingScore: Math.min(Number(e.target.value), settings.maxScore) })}
                  className="text-sm bg-background py-2 h-10 rounded-xl font-bold w-32"
                />
                <span className="text-sm font-bold text-muted-foreground">/ {settings.maxScore}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-extrabold text-sm text-foreground">Blueprint Summary</h3>
          <BlueprintSummaryGrid
            totalQuestions={blueprint.totalQuestions}
            durationText={blueprint.durationText}
            totalPoints={blueprint.totalPoints}
            variant="large"
          />
        </div>
      </Card>
    </div>
  );
}
