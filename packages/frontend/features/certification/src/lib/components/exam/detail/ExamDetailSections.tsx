import { Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';

interface ExamSection {
  id?: string;
  title?: string;
  instructions?: string;
  description?: string;
  durationMinutes?: number;
  questions?: unknown[];
}

interface ExamDetailSectionsProps {
  sections?: ExamSection[];
}

export function ExamDetailSections({ sections }: ExamDetailSectionsProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Exam Sections Breakdown
        </CardTitle>
        <CardDescription>
          Review the structure and question count before starting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections && sections.length > 0 ? (
          <div className="divide-y divide-border">
            {sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-extrabold text-sm text-foreground">
                      {section.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">
                    {section.instructions ||
                      section.description ||
                      'Answer all questions carefully within the allocated section time.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pl-8 sm:pl-0">
                  <Badge variant="outline" className="text-xs font-semibold">
                    <Clock className="w-3 h-3 mr-1" />
                    {section.durationMinutes || 30} mins
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold"
                  >
                    {section.questions?.length ?? 0} Questions
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            Standard exam structure with 4 full sections (Listening, Reading,
            Writing, Speaking).
          </div>
        )}
      </CardContent>
    </Card>
  );
}
