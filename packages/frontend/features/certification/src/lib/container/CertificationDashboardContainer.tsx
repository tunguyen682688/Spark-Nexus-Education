import React, { useState } from 'react';
import { 
  BookOpen, Clock, Award, ArrowRight, Trophy, Target, 
  Calendar, Headphones, GraduationCap, Sparkles, ShieldCheck, 
  Play, ArrowUpRight
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge
} from '@spark-nest-ed/frontend-shared-components';
import { useCertificationDashboard } from '../hooks/use-certification';
import { ErrorState } from '../components/ErrorState';

export const CertificationDashboardContainer: React.FC = () => {
  const [selectedExamType, setSelectedExamType] = useState<string>('TOEIC');
  const { data: dashboardData, isError, error, refetch } = useCertificationDashboard();

  const stats = [
    {
      title: 'Estimated Score',
      value: dashboardData?.scorePrediction || '850',
      subtitle: dashboardData?.targetExam || 'TOEIC',
      change: '+35',
      trend: 'up',
      icon: Trophy,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
    },
    {
      title: 'Accuracy',
      value: dashboardData?.accuracy || '78%',
      subtitle: 'Last 7 days',
      change: '12%',
      trend: 'up',
      icon: Target,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      title: 'Study Time',
      value: dashboardData?.timeSpent || '24h 36m',
      subtitle: 'This week',
      change: '+3h',
      trend: 'up',
      icon: Clock,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
    },
    {
      title: 'Tests Completed',
      value: '46',
      subtitle: 'All time',
      change: '+6',
      trend: 'up',
      icon: ShieldCheck,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20'
    },
    {
      title: 'CEFR Level',
      value: 'C1',
      subtitle: 'Advanced',
      change: 'Active',
      trend: 'neutral',
      icon: Award,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20'
    }
  ];

  const popularExams = [
    { type: 'TOEIC', tests: '1,248 tests', badge: 'Most Popular', badgeType: 'default' },
    { type: 'IELTS', tests: '968 tests', badge: 'High Demand', badgeType: 'destructive' },
    { type: 'TOEFL', tests: '742 tests', badge: 'Academic', badgeType: 'secondary' },
    { type: 'Cambridge', tests: '632 tests', badge: 'B2 First', badgeType: 'outline' },
    { type: 'VSTEP', tests: '419 tests', badge: 'Vietnam', badgeType: 'outline' }
  ];

  const recommendedList = [
    {
      skill: 'Listening',
      title: 'Part 3: Short Conversations',
      reason: 'Based on your weak areas',
      questions: '15 questions',
      difficulty: 'Medium',
      difficultyColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      icon: Headphones,
      iconColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'
    },
    {
      skill: 'Reading',
      title: 'Part 7: Single Passage',
      reason: 'Based on your performance',
      questions: '12 questions',
      difficulty: 'Hard',
      difficultyColor: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
      icon: BookOpen,
      iconColor: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300'
    },
    {
      skill: 'Grammar',
      title: 'Error Recognition',
      reason: 'Improve your accuracy',
      questions: '20 questions',
      difficulty: 'Easy',
      difficultyColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      icon: GraduationCap,
      iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
    }
  ];

  const recentAttempts = [
    { exam: 'TOEIC', title: 'Full Mock Test 04', date: 'May 20, 2026', score: '820', label: 'Your Score', scoreColor: 'text-emerald-600 dark:text-emerald-400' },
    { exam: 'IELTS', title: 'Reading Practice Set 12', date: 'May 18, 2026', score: '7.0', label: 'Band', scoreColor: 'text-indigo-600 dark:text-indigo-400' },
    { exam: 'TOEFL', title: 'Listening Practice Set 08', date: 'May 16, 2026', score: '23/30', label: 'Score', scoreColor: 'text-amber-600 dark:text-amber-400' }
  ];

  if (isError) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <ErrorState onRetry={refetch} message={error instanceof Error ? error.message : undefined} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl dark:shadow-none p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-xl space-y-4 text-center md:text-left z-10">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1 px-3 text-xs backdrop-blur-sm">
            ✨ AI-POWERED PLATFORM
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Practice Smarter,<br />
            Score Higher
          </h1>
          <p className="text-sm sm:text-base text-blue-100 font-light max-w-md">
            Real exam experience. AI-powered feedback. Personalized learning path for your success.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
            <Button className="bg-white text-indigo-700 hover:bg-blue-50 font-bold px-6 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center gap-2">
              Start a Mock Test 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium px-6 py-5 rounded-xl backdrop-blur-sm">
              Explore Library
            </Button>
          </div>
        </div>

        {/* Dynamic Graphic Layout matching mockup elements */}
        <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[4/3] flex items-center justify-center z-10 md:mr-4">
          <div className="absolute w-full h-full bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Live Analytics</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            
            <div className="my-auto space-y-3">
              {/* TOEIC Progress Mock */}
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-4.5 h-4.5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-200">TOEIC Practice</div>
                    <div className="text-sm font-bold">Estimated Score</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-300">850</div>
                  <div className="text-[9px] text-emerald-400 font-semibold">+35 pts</div>
                </div>
              </div>

              {/* IELTS Target Mock */}
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <Target className="w-4.5 h-4.5 text-sky-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-200">IELTS Target</div>
                    <div className="text-sm font-bold">Overall Band</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-sky-300">7.5</div>
                  <div className="text-[9px] text-blue-200">C1 level</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-blue-200 border-t border-white/5 pt-2">
              <span>Minh Anh</span>
              <span>12 Days Streak 🔥</span>
            </div>
          </div>
          {/* Decorative layered circular glowing backdrops */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/20 blur-xl -z-10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-400/20 blur-2xl -z-10" />
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="hover:shadow-md transition-shadow duration-300 border-border bg-card">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-muted-foreground font-medium">{stat.title}</span>
                  <div className={`p-1.5 rounded-lg ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <span className="font-semibold text-foreground">{stat.subtitle}</span>
                    <span className={stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Popular, Recommended, Quick Practice */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* POPULAR EXAMS */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Popular Exams</CardTitle>
                <CardDescription>Select an exam type to tailor your practices</CardDescription>
              </div>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {popularExams.map((exam) => (
                  <button
                    key={exam.type}
                    onClick={() => setSelectedExamType(exam.type)}
                    className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition-all duration-300 ${
                      selectedExamType === exam.type
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
                        : 'border-border hover:border-muted-foreground bg-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm">{exam.type}</span>
                      <span className="text-[10px] text-muted-foreground font-light">{exam.tests}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant={exam.badgeType as any} className="text-[9px] py-0.5 px-1.5 font-semibold">
                        {exam.badge}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RECOMMENDED FOR YOU */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                Recommended for you
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </h3>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500">
                View all
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card key={idx} className="hover:shadow-md transition-all duration-300 border-border group relative overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          item.skill === 'Listening' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' :
                          item.skill === 'Reading' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          {item.skill}
                        </span>
                        <div className={`p-2 rounded-lg ${item.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.reason}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
                        <span className="text-muted-foreground">{item.questions}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.difficultyColor}`}>
                          {item.difficulty}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* QUICK PRACTICE */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Quick Practice</CardTitle>
              <CardDescription>Rapid exercises to boost your vocabulary, logic, and listening speed</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[
                  { title: 'Listening Practice', detail: '10 questions', icon: Headphones, color: 'text-purple-500' },
                  { title: 'Reading Practice', detail: '10 questions', icon: BookOpen, color: 'text-sky-500' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button key={idx} className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-accent/40 transition-colors text-left group">
                       <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-accent ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.detail}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Grammar Practice', detail: '10 questions', icon: GraduationCap, color: 'text-emerald-500' },
                  { title: 'Vocabulary Test', detail: '10 questions', icon: Sparkles, color: 'text-amber-500' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button key={idx} className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-accent/40 transition-colors text-left group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-accent ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.detail}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Upcoming Test & Recent Attempts */}
        <div className="space-y-6">
          
          {/* UPCOMING TEST */}
          <Card className="border-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -z-10" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold">Upcoming Test</CardTitle>
                <CardDescription>Scheduled mock examinations</CardDescription>
              </div>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500">
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-none font-bold">
                    IELTS
                  </Badge>
                  <h4 className="font-bold text-sm text-foreground leading-tight">
                    Full Mock Test 05
                  </h4>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      May 28, 2026 • 09:00 AM
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      2h 45m limit
                    </span>
                  </div>
                </div>

                {/* Countdown Dial Visual */}
                <div className="relative flex items-center justify-center w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-accent" strokeWidth="4" fill="transparent" />
                    <circle cx="40" cy="40" r="34" className="stroke-indigo-600" strokeWidth="4" fill="transparent"
                      strokeDasharray="213" strokeDashoffset="71" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">2</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Days</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300">
                Continue Preparation
                <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
              </Button>
            </CardContent>
          </Card>

          {/* RECENT ATTEMPTS */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold">Recent Attempts</CardTitle>
                <CardDescription>Your test results and logs</CardDescription>
              </div>
              <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500">
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-y divide-border">
                {recentAttempts.map((attempt, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`text-[10px] font-black px-2 py-1 rounded ${
                        attempt.exam === 'TOEIC' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                        attempt.exam === 'IELTS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {attempt.exam}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground line-clamp-1">{attempt.title}</div>
                        <div className="text-[10px] text-muted-foreground">{attempt.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-black tracking-tight ${attempt.scoreColor}`}>
                        {attempt.score}
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase font-semibold">{attempt.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full text-xs text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1.5 pt-2 border-t border-border">
                View All Reports
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
