import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Brain,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { PracticeHistoryCard } from '../../components/learning/PracticeHistoryCard';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface PracticeHistoryListProps {
  sessions: Array<{
    id: string;
    title: string;
    type: string;
    examPart: string;
    score: string;
    time: string;
    date: string;
  }>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  handleViewScorecard: (id: string) => void;
  handleRetakeTest: (id: string) => void;
  handleBackToLearning: () => void;
  text: typeof CERTIFICATION_UI_TEXT.practiceHistory;
}

export const PracticeHistoryList = ({
  sessions,
  currentPage,
  setCurrentPage,
  handleViewScorecard,
  handleRetakeTest,
  handleBackToLearning,
  text,
}: PracticeHistoryListProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        {sessions.length === 0 ? (
          <Card className="border-border p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {text.emptyState.description}
              </p>
            </div>
            <Button
              onClick={handleBackToLearning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              {text.emptyState.startBtn}
            </Button>
          </Card>
        ) : (
          <Card className="border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">{text.tableHeaders.session}</th>
                    <th className="py-3 px-4">{text.tableHeaders.type}</th>
                    <th className="py-3 px-4">{text.tableHeaders.examPart}</th>
                    <th className="py-3 px-4">{text.tableHeaders.score}</th>
                    <th className="py-3 px-4">{text.tableHeaders.time}</th>
                    <th className="py-3 px-4">{text.tableHeaders.date}</th>
                    <th className="py-3 px-4 text-right">{text.tableHeaders.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-medium text-foreground">
                  {sessions.map((item) => (
                    <PracticeHistoryCard
                      key={item.id}
                      item={item}
                      onViewScorecard={handleViewScorecard}
                      onRetakeTest={handleRetakeTest}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-xl bg-card gap-3 text-xs text-muted-foreground shadow-sm">
          <span>Showing 1 to 8 of 128 practice sessions</span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-border hover:bg-secondary'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(5, prev + 1))}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Show</span>
            <select className="bg-background border border-border text-xs font-bold py-1 px-2 rounded-lg">
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>{text.widgets.skillMasteryTitle}</span>
              <Brain className="w-4 h-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Listening', score: 'Band 7.5', pct: 82, color: 'bg-purple-600' },
              { name: 'Reading', score: 'Band 8.5', pct: 92, color: 'bg-blue-600' },
              { name: 'Writing', score: 'Band 6.5', pct: 68, color: 'bg-amber-500' },
              { name: 'Speaking', score: 'Band 7.0', pct: 76, color: 'bg-emerald-600' },
            ].map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{s.name}</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {s.score}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">{text.widgets.recentScorecardsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { title: 'IELTS Academic Mock 4', score: '7.5', date: '2 hours ago', color: 'text-purple-600' },
              { title: 'TOEIC Listening Part 3', score: '450/495', date: 'Yesterday', color: 'text-blue-600' },
              { title: 'Reading Academic Passages', score: '38/40', date: '2 days ago', color: 'text-emerald-600' },
            ].map((sc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-foreground">{sc.title}</h5>
                  <span className="text-[10px] text-muted-foreground block">{sc.date}</span>
                </div>
                <Badge className="bg-background border border-border text-foreground font-black text-xs">
                  {sc.score}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-900/40 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h5 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                {text.widgets.aiInsightTitle}
              </h5>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              {text.widgets.aiInsightDesc}
            </p>
            <Button className="w-full text-xs font-bold py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer">
              {text.widgets.startBtn}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
