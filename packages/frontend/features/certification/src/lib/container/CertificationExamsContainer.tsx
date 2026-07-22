import React, { useState } from 'react';
import { 
  Trophy, Star, Clock, HelpCircle
} from 'lucide-react';
import { 
  Card, CardContent, Button, Badge, Progress
} from '@spark-nest-ed/frontend-shared-components';
import { useFeaturedCollections } from '../hooks/use-certification';
import { FeaturedCollectionCard } from '../components/FeaturedCollectionCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';

export const CertificationExamsContainer: React.FC = () => {
  const [examFilter, setExamFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featuredCollections = [], isLoading, isError, error, refetch } = useFeaturedCollections(examFilter, searchQuery);

  const continueLearningData = {
    title: 'IELTS Academic Mock Test 03',
    exam: 'IELTS',
    lastStudied: 'Today, 09:20 AM',
    progress: 67,
    timeSpent: '1h 12m',
    questions: '65/100',
    score: '7.0'
  };

  const recommendForYouSub = [
    { type: 'IELTS', title: 'IELTS Writing Task 1 & 2 Bundle', progress: 85, score: '4.8', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=150&auto=format&fit=crop' },
    { type: 'TOEIC', title: 'TOEIC Listening Intensive Practice', progress: 62, score: '4.7', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=150&auto=format&fit=crop' },
    { type: 'Grammar', title: 'High Frequency Grammar Pack', progress: 40, score: '4.6', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=150&auto=format&fit=crop' }
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            Exam Library
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Curated collections to help you achieve your target score faster.</p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-wrap items-center gap-3">
        {['All', 'IELTS', 'TOEIC', 'TOEFL', 'Cambridge', 'VSTEP', 'SAT'].map((filter) => (
          <button
            key={filter}
            onClick={() => setExamFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
              examFilter === filter 
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                : 'bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent/60'
            }`}
          >
            {filter}
          </button>
        ))}
        
        <div className="flex-1 min-w-[200px] relative md:max-w-xs md:ml-auto">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-3 pr-8 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-black tracking-tight">Featured Collections ✨</h2>
            <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View All Collections</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Curated collections to help you achieve your target score faster.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <CardSkeleton key={idx} />
              ))
            ) : isError ? (
              <div className="col-span-full">
                <ErrorState onRetry={refetch} message={error instanceof Error ? error.message : undefined} />
              </div>
            ) : featuredCollections.length === 0 ? (
              <div className="col-span-full text-center py-10 text-xs text-muted-foreground font-semibold">
                No exam collections found matching filters.
              </div>
            ) : (
              featuredCollections.map((item) => (
                <FeaturedCollectionCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recommended for you */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                Recommended for you
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </h3>
              <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View All</span>
            </div>
            <div className="space-y-3">
              {recommendForYouSub.map((item, idx) => (
                <Card key={idx} className="border-border hover:shadow-sm transition-all duration-300">
                  <CardContent className="p-3 flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <Badge className="text-[8px] px-1 py-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-none font-bold">
                        {item.type}
                      </Badge>
                      <h4 className="font-bold text-xs text-foreground truncate mt-1">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={item.progress} className="h-1 flex-1 bg-accent" />
                        <span className="text-[9px] text-muted-foreground font-semibold">{item.progress}% completed</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {item.score}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Continue Learning */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                Continue Learning
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </h3>
              <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View All</span>
            </div>
            <Card className="border-border overflow-hidden bg-gradient-to-r from-slate-50 to-indigo-50/20 dark:from-slate-900/60 dark:to-indigo-950/10">
              <CardContent className="p-5 flex flex-col md:flex-row items-center gap-5 justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-indigo-900 text-white flex items-center justify-center flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=100&auto=format&fit=crop" alt="Mock Test" className="absolute object-cover w-full h-full opacity-40" />
                    <Badge className="bg-white/20 backdrop-blur-sm border-none text-[8px] font-black">{continueLearningData.exam}</Badge>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">{continueLearningData.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Last studied: {continueLearningData.lastStudied}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Time spent: <span className="font-bold text-foreground">{continueLearningData.timeSpent}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        Questions: <span className="font-bold text-foreground">{continueLearningData.questions}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-slate-400" />
                        Target: <span className="font-bold text-indigo-600 dark:text-indigo-400">{continueLearningData.score}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto md:border-l border-border md:pl-5">
                  {/* Ring progress */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="23" className="stroke-accent" strokeWidth="3" fill="transparent" />
                      <circle cx="28" cy="28" r="23" className="stroke-indigo-600" strokeWidth="3" fill="transparent"
                        strokeDasharray="144" strokeDashoffset={144 - (144 * continueLearningData.progress) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[10px] font-black text-indigo-600 dark:text-indigo-400">{continueLearningData.progress}%</span>
                  </div>
                  <Button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
