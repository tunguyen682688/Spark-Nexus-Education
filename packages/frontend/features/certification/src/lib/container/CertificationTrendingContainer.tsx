import React, { useState } from 'react';
import { 
  Flame, TrendingUp, ChevronRight, Bookmark, ArrowRight, CheckCircle2
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge
} from '@spark-nest-ed/frontend-shared-components';
import { useTrendingCollections } from '../hooks/use-certification';
import { TrendingCollectionCard } from '../components/TrendingCollectionCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';

export const CertificationTrendingContainer: React.FC = () => {
  const [activeExamTab, setActiveExamTab] = useState('All Exams');
  const { data: topTrending = [], isLoading, isError, error, refetch } = useTrendingCollections();

  const trendingTable = [
    { rank: 6, title: 'SAT Digital Practice Tests', exam: 'SAT', trend: '+ 14%', learners: '7.2K', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=100&auto=format&fit=crop' },
    { rank: 7, title: 'IELTS General Training Mock Tests', exam: 'IELTS', trend: '+ 12%', learners: '6.8K', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=100&auto=format&fit=crop' },
    { rank: 8, title: 'Cambridge B2 First for Schools', exam: 'Cambridge', trend: '+ 11%', learners: '5.6K', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=100&auto=format&fit=crop' },
    { rank: 9, title: 'TOEIC Listening & Reading Intensive', exam: 'TOEIC', trend: '+ 10%', learners: '5.2K', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=100&auto=format&fit=crop' },
    { rank: 10, title: 'VSTEP C1 Advanced Practice', exam: 'VSTEP', trend: '+ 9%', learners: '4.9K', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=100&auto=format&fit=crop' }
  ];

  const whyTrending = [
    { title: 'High Completion Rate', desc: 'These collections have high mock completion rates this week.', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Popular Among Learners', desc: 'Many active learners are starting and enjoying these collections.', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Top Rated by Community', desc: 'High ratings and positive reviews from our learners.', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { title: 'Aligned with Exam Trends', desc: 'Based on the latest exam patterns and updates.', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' }
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* 1. HEADER TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            Trending Collections 🔥
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Most popular collections this week based on learners' activity and engagement.</p>
        </div>
        <button className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
          View All
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. FILTER PILLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All Exams', 'IELTS', 'TOEIC', 'TOEFL', 'Cambridge', 'VSTEP', 'SAT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveExamTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                activeExamTab === tab 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                  : 'bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none">
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <select className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none">
            <option>All Durations</option>
            <option>Short (30-60m)</option>
            <option>Medium (60-120m)</option>
            <option>Long (120m+)</option>
          </select>

          <Button variant="outline" className="border-border text-[11px] py-1.5 px-3 rounded-xl flex items-center gap-1.5 bg-card">
            <TrendingUp className="w-3.5 h-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* 3. HORIZONTAL CAROUSEL GRID OF 5 CARDS */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-hidden">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))
          ) : isError ? (
            <div className="col-span-full">
              <ErrorState onRetry={refetch} message={error instanceof Error ? error.message : undefined} />
            </div>
          ) : topTrending.length === 0 ? (
            <div className="col-span-full text-center py-10 text-xs text-muted-foreground font-semibold">
              No trending collections found.
            </div>
          ) : (
            topTrending.map((item) => (
              <TrendingCollectionCard key={item.rank} item={item} />
            ))
          )}
        </div>

        {/* Carousel next arrow button */}
        <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-border flex items-center justify-center shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 z-10">
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* 4. BOTTOM SECTIONS: TRENDING UP TABLE & WHY TRENDING CARD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
        {/* Left side: Trending Up table */}
        <Card className="xl:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border mb-2">
            <div>
              <CardTitle className="text-sm font-black flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500 fill-current" />
                Trending Up This Week
              </CardTitle>
            </div>
            <button className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
              View All
              <ArrowRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground/60 font-bold text-[10px]">
                    <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-4">Collection</th>
                    <th className="py-2.5 px-4 w-20 text-center">Exam</th>
                    <th className="py-2.5 px-4 w-20 text-center">Trend</th>
                    <th className="py-2.5 px-4 w-24 text-center">Learners</th>
                    <th className="py-2.5 px-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {trendingTable.map((row) => (
                    <tr key={row.rank} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-4 text-center font-bold text-muted-foreground">{row.rank}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={row.image} alt={row.title} className="w-8 h-8 rounded-lg object-cover border border-border" />
                          <span className="font-extrabold text-foreground text-xs">{row.title}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Badge variant="outline" className="text-[8px] py-0.5 px-1.5 font-black uppercase border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-300">
                          {row.exam}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{row.trend}</td>
                      <td className="py-2.5 px-4 text-center text-muted-foreground">{row.learners}</td>
                      <td className="py-2.5 px-4 text-center">
                        <button className="text-muted-foreground hover:text-indigo-600">
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right side: Why these collections are trending */}
        <Card className="border-border bg-slate-50 dark:bg-slate-900/40">
          <CardHeader className="pb-2 border-b border-border mb-3">
            <CardTitle className="text-sm font-black">Why These Collections Are Trending?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {whyTrending.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground leading-tight">{item.title}</h4>
                  <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
