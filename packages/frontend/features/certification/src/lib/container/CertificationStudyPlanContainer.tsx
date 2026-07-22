import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, TrendingUp, Clock, ArrowRight, BookOpen, 
  Headphones, GraduationCap, Calendar, RotateCcw, Bookmark, 
  FileText, ChevronDown, CheckCircle, Brain, Bot, MessageSquare, 
  AlertCircle, PlayCircle, Eye
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Progress
} from '@spark-nest-ed/frontend-shared-components';
import { useStudyPlan } from '../hooks/use-certification';
import { ListSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';

export const CertificationStudyPlanContainer: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    mon: true,
    tue: true,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false
  });

  const { data: planDays = [], isLoading, isError, error, refetch } = useStudyPlan();

  const toggleTask = (dayId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  const topStats = [
    { label: 'Current Score', val: '6.0', sub: 'IELTS Overall', color: 'text-rose-600 dark:text-rose-400' },
    { label: 'Target Score', val: '7.0', sub: 'IELTS Overall', color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Confidence', val: '87%', sub: 'High Match Rate', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Estimated Time', val: '6 Weeks', sub: 'To reach target', color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Daily Study Time', val: '45 mins', sub: 'Recommended', color: 'text-amber-600 dark:text-amber-400' }
  ];

  const focusCards = [
    { label: 'Weakest Skill', title: 'Reading', desc: 'Needs most improvement', val: 58, color: 'h-2 bg-rose-500', icon: BookOpen, iconBg: 'bg-rose-50 text-rose-500 dark:bg-rose-950/20' },
    { label: 'Strongest Skill', title: 'Listening', desc: 'Your best performance', val: 82, color: 'h-2 bg-emerald-500', icon: Headphones, iconBg: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' },
    { label: 'Learning Priority', title: 'Vocabulary', desc: 'Highest impact area', val: 90, color: 'h-2 bg-purple-500', icon: Sparkles, iconBg: 'bg-purple-50 text-purple-500 dark:bg-purple-950/20' },
    { label: 'Urgent Review', title: 'Grammar', desc: 'Review recommended', val: 45, color: 'h-2 bg-amber-500', icon: GraduationCap, iconBg: 'bg-amber-50 text-amber-500 dark:bg-amber-950/20' }
  ];

  const recommendedPractices = [
    { title: 'IELTS Mock Test #18', type: 'IELTS', level: 'Full Test • Advanced', time: '2.5 hrs', questions: '120 Qs', match: '98%', matchColor: 'text-emerald-600 dark:text-emerald-400', icon: ShieldCheck, iconBg: 'bg-indigo-50 text-indigo-600' },
    { title: 'Reading Practice B2', type: 'Reading', level: 'Upper-Intermediate', time: '45 mins', questions: '20 Qs', match: '95%', matchColor: 'text-emerald-600 dark:text-emerald-400', icon: BookOpen, iconBg: 'bg-sky-50 text-sky-600' },
    { title: 'Vocabulary Test C1', type: 'Vocabulary', level: 'Advanced', time: '30 mins', questions: '50 Qs', match: '93%', matchColor: 'text-emerald-600 dark:text-emerald-400', icon: Sparkles, iconBg: 'bg-amber-50 text-amber-600' },
    { title: 'TOEIC Part 7 Practice', type: 'TOEIC', level: 'Advanced', time: '60 mins', questions: '54 Qs', match: '90%', matchColor: 'text-emerald-600 dark:text-emerald-400', icon: FileText, iconBg: 'bg-purple-50 text-purple-600' }
  ];

  const recommendedVocabulary = [
    { word: 'acquire', level: 'B2', progress: 75, review: 'Today' },
    { word: 'inevitable', level: 'C1', progress: 50, review: 'Today' },
    { word: 'sustain', level: 'B2', progress: 60, review: 'Tomorrow' },
    { word: 'comprehensive', level: 'C1', progress: 40, review: 'In 2 days' },
    { word: 'accordingly', level: 'B2', progress: 85, review: 'In 3 days' }
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            AI Recommendations 🤖
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Personalized recommendations powered by AI to help you learn smarter and achieve your target score.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="border-border text-xs flex items-center gap-1.5 py-2 px-3 rounded-xl bg-card">
            <RotateCcw className="w-3.5 h-3.5" />
            Generate Again
          </Button>
          <Button variant="outline" className="border-border text-xs flex items-center gap-1.5 py-2 px-3 rounded-xl bg-card">
            <Bookmark className="w-3.5 h-3.5" />
            Save Plan
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm flex items-center gap-1.5">
            Export Plan
          </Button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {topStats.map((stat, idx) => (
          <Card key={idx} className="border-border hover:shadow-sm transition-shadow duration-300">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
              <p className="text-[10px] text-slate-400 font-medium">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. FOCUS SKILL SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {focusCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-border hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-semibold">{card.label}</span>
                    <h3 className="text-base font-extrabold text-foreground">{card.title}</h3>
                  </div>
                  <div className={`p-2 rounded-xl ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{card.desc}</span>
                    <span className="font-bold text-foreground">{card.val}%</span>
                  </div>
                  <Progress value={card.val} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 4. WORKSPACE COLUMN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Study Plan & Recommended Practice */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Personalized Study Plan */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                  Personalized Study Plan
                </CardTitle>
                <CardDescription>Tailored weekly routine based on target goals</CardDescription>
              </div>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500">View Full Plan</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <ListSkeleton key={idx} />
                  ))
                ) : isError ? (
                  <ErrorState onRetry={refetch} message={error instanceof Error ? error.message : undefined} />
                ) : planDays.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground font-semibold">
                    No study plan tasks generated yet.
                  </div>
                ) : (
                  planDays.map((item) => {
                    const dayId = item.day.toLowerCase();
                    const completed = completedTasks[dayId] ?? item.completed;
                    return (
                      <div key={dayId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleTask(dayId)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 hover:border-slate-400 dark:border-slate-700'
                            }`}
                          >
                            {completed && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                          </button>
                          
                          <div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{item.day}</div>
                            <div className={`text-xs font-extrabold ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{item.topic}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none text-[9px] font-bold">
                            {item.duration}
                          </Badge>
                          {completed ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none font-bold text-[9px]">Completed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] font-bold">Pending</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Practice */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                Recommended Practice
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </h3>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500">View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedPractices.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card key={idx} className="border-border hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${item.iconBg}`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 border-none text-[9px] font-black">
                              {item.type}
                            </Badge>
                            <h4 className="font-extrabold text-xs text-foreground group-hover:text-indigo-600 mt-1 line-clamp-1 transition-colors">
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-black ${item.matchColor}`}>{item.match}</span>
                          <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Match</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-3">
                        <span>{item.level}</span>
                        <span className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                          <span>{item.questions}</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Button variant="outline" className="w-full border-dashed border-border hover:bg-accent/40 text-xs py-4 flex items-center justify-center gap-1.5 rounded-xl font-bold">
              See More Recommendations
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Coach, Vocabulary, Quick Actions */}
        <div className="space-y-6">
          
          {/* AI Coach */}
          <Card className="border-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -z-10" />
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Bot className="w-5 h-5 text-indigo-600 animate-bounce" />
              <div>
                <CardTitle className="text-sm font-bold">AI Coach</CardTitle>
                <CardDescription>Personalized recommendations tutor</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-2xl border border-indigo-100/50 dark:border-indigo-950/20 text-xs leading-relaxed text-indigo-950 dark:text-indigo-200">
                Great job! Your **Listening** score is strong, but **Reading** inference questions are holding you back. Focus on skimming, scanning, and inference strategies for the next 5 days. You'll see a big improvement!
              </div>

              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-950/10 text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="font-bold text-foreground">Potential Improvement</span>
                </div>
                <span className="font-black text-emerald-600 dark:text-emerald-400">+0.5 - 1.0 Band</span>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Vocabulary */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Brain className="w-4.5 h-4.5 text-purple-500" />
                Recommended Vocabulary
              </CardTitle>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500">View all</Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {recommendedVocabulary.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-foreground">{item.word}</span>
                        <Badge className="text-[8px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold border-none py-0 px-1">
                          {item.level}
                        </Badge>
                      </div>
                      <Progress value={item.progress} className="h-1" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{item.review}</div>
                      <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Review</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-black">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { title: 'Start Recommended Practice', icon: PlayCircle, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400' },
                { title: 'Ask AI Tutor', icon: MessageSquare, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400' },
                { title: 'Review Wrong Answers', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400' },
                { title: 'View Progress Analytics', icon: Eye, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button key={idx} className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/40 transition-colors text-left group">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-foreground">{item.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* 5. FOOTER BANNER WHY RECOMMENDATIONS */}
      <div className="bg-slate-100/50 dark:bg-slate-900/60 p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-4 text-xs">
        <Bot className="w-8 h-8 text-indigo-600 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="font-bold text-foreground">Why these recommendations?</h4>
          <p className="text-muted-foreground leading-relaxed">
            These tasks and exercises are recommended based on your recent 12 mock test results, accuracy trends, and common learning paths of successful students who achieved an IELTS Band 7.0 target score.
          </p>
        </div>
      </div>

    </div>
  );
};
