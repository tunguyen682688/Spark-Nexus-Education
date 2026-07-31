import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import {
  POPULAR_EXAM_BADGES,
  CERTIFICATION_UI_TEXT,
} from '../../constants/certification.constants';

interface DashboardPopularExamsPillsProps {
  selectedExamType: string;
  onSelectExamType: (type: string) => void;
}

export const DashboardPopularExamsPills = ({ selectedExamType, onSelectExamType }: 
  DashboardPopularExamsPillsProps
) => {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold">
            {CERTIFICATION_UI_TEXT.dashboard.popularCategoriesTitle}
          </CardTitle>
          <CardDescription>
            {CERTIFICATION_UI_TEXT.dashboard.popularCategoriesDesc}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {POPULAR_EXAM_BADGES.map((exam) => (
            <button
              key={exam.type}
              onClick={() => onSelectExamType(exam.type)}
              className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition-all duration-300 ${
                selectedExamType === exam.type
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
                  : 'border-border hover:border-muted-foreground bg-transparent'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm">{exam.type}</span>
              </div>
              <div className="mt-2">
                <Badge
                  variant={exam.badgeType}
                  className="text-[9px] py-0.5 px-1.5 font-semibold"
                >
                  {exam.badge}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
