import { CheckCircle, Save, Send } from 'lucide-react';
import { Card, Button } from '@spark-nest-ed/frontend-shared-components';
import { BlueprintSummaryGrid } from './BlueprintSummaryGrid';
import { SectionListItem } from './SectionListItem';
import type { BuilderSection, ExamSettingsForm } from '../../../hooks/container-logic/exam/use-exam-builder-container-logic';

interface ExamBuilderReviewTabProps {
  settings: ExamSettingsForm;
  sections: BuilderSection[];
  blueprint: {
    totalQuestions: number;
    durationText: string;
    totalPoints: number;
  };
  handleSaveDraft: () => void;
  handlePublishExam: () => void;
}

export function ExamBuilderReviewTab({
  settings,
  sections,
  blueprint,
  handleSaveDraft,
  handlePublishExam,
}: ExamBuilderReviewTabProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-border shadow-sm bg-card p-6 space-y-6">
        <div className="pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-lg text-foreground">Review & Publish</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Review your exam before publishing. Make sure all sections and questions are ready.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-foreground">Exam Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Title</span>
              <div className="text-foreground font-bold">{settings.title || 'Untitled Exam'}</div>
            </div>
            <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Level</span>
              <div className="text-foreground font-bold">{settings.level}</div>
            </div>
            <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Language</span>
              <div className="text-foreground font-bold">{settings.language}</div>
            </div>
            <div className="p-3 bg-secondary/20 rounded-xl space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Passing Score</span>
              <div className="text-foreground font-bold">{settings.passingScore} / {settings.maxScore}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="font-extrabold text-sm text-foreground">Sections ({sections.length})</h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <SectionListItem
                key={section.id}
                section={section}
                isActive={false}
                canDelete={false}
                onSelect={undefined}
                onDelete={undefined}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="font-extrabold text-sm text-foreground">Blueprint</h3>
          <BlueprintSummaryGrid
            totalQuestions={blueprint.totalQuestions}
            durationText={blueprint.durationText}
            totalPoints={blueprint.totalPoints}
            variant="large"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            className="text-sm font-bold py-2.5 px-5 h-10 rounded-xl border-border hover:bg-secondary flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            onClick={handlePublishExam}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-6 h-10 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Publish Exam
          </Button>
        </div>
      </Card>
    </div>
  );
}
