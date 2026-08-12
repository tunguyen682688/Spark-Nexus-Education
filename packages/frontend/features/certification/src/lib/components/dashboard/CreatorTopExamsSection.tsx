import {
  Heart,
  BarChart2,
  MoreVertical,
} from 'lucide-react';
import {
  Card,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';

interface CreatorTopExamsSectionProps {
  topExams: Array<{
    id: string;
    rank: number;
    title: string;
    category: string;
    categoryBadge: string;
    categoryBadgeClass: string;
    attempts: number;
    avgScore: string;
    likes: number;
  }>;
  handleViewAnalytics: () => void;
  text: {
    title: string;
    viewAllExams: string;
    tableHeaders: {
      examTitle: string;
      attempts: string;
      avgScore: string;
      likes: string;
      action: string;
    };
  };
}

export const CreatorTopExamsSection = ({
  topExams,
  handleViewAnalytics,
  text,
}: CreatorTopExamsSectionProps) => {
  return (
    <Card className="xl:col-span-2 border-border shadow-sm bg-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-extrabold text-base text-foreground">
          {text.title}
        </h3>
        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
          {text.viewAllExams}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">{text.tableHeaders.examTitle}</th>
              <th className="py-2.5 px-3">{text.tableHeaders.attempts}</th>
              <th className="py-2.5 px-3">{text.tableHeaders.avgScore}</th>
              <th className="py-2.5 px-3">{text.tableHeaders.likes}</th>
              <th className="py-2.5 px-3 text-right">{text.tableHeaders.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {topExams.map((exam) => (
              <tr key={exam.id} className="hover:bg-secondary/40 transition-colors">
                <td className="py-3 px-3 font-bold text-muted-foreground">{exam.rank}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <Badge
                      className={`font-black text-[10px] px-2 py-0.5 rounded-lg border-none ${exam.categoryBadgeClass}`}
                    >
                      {exam.categoryBadge}
                    </Badge>
                    <div>
                      <div className="font-extrabold text-foreground">{exam.title}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">
                        {exam.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-bold text-foreground">
                  {exam.attempts.toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{exam.avgScore}</span>
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${parseFloat(exam.avgScore)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>{exam.likes}</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={handleViewAnalytics}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-xs text-muted-foreground font-medium">
        Showing top {topExams.length} of {topExams.length} exams
      </div>
    </Card>
  );
};
