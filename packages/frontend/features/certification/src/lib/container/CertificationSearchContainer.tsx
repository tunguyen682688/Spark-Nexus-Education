import React, { useState, useMemo } from 'react';
import { 
  Star, Clock, Users, ArrowRight, Bookmark, 
  ShieldCheck, HelpCircle, BookOpen, Layers, MessageSquare, 
  SlidersHorizontal, List, Grid, Bot
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge
} from '@spark-nest-ed/frontend-shared-components';

export const CertificationSearchContainer: React.FC = () => {
  const searchVal = 'ielts writing task 2';
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'exams' | 'questions' | 'collections' | 'lessons' | 'topics'>('all');
  const [isListView, setIsListView] = useState(true);

  // Filters state
  const [examFilter, setExamFilter] = useState('All Exams');
  const [skillFilter, setSkillFilter] = useState('Writing');
  const [diffFilter, setDiffFilter] = useState('All Levels');
  const [cefrFilter, setCefrFilter] = useState('All Levels');

  const searchResults = [
    {
      id: 'sr1',
      type: 'EXAM',
      typeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
      title: 'IELTS Writing Task 2 – Recent Topics 2024',
      badge: 'Top Rated',
      badgeColor: 'bg-emerald-500 text-white',
      desc: 'Full Mock Test • Academic & General Training',
      rating: '4.9',
      reviews: '2.4K',
      learners: '58.3K',
      duration: '60 mins',
      questions: '2 Questions',
      level: 'Advanced',
      tag: 'Band 7.0+',
      updated: 'Updated 3 days ago',
      icon: ShieldCheck
    },
    {
      id: 'sr2',
      type: 'QUESTION',
      typeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
      title: 'IELTS Writing Task 2: Discuss both views and give your opinion',
      badge: 'High Match',
      badgeColor: 'bg-indigo-600 text-white',
      desc: 'Some people believe that governments should spend more money on public services like health and education...',
      rating: '4.8',
      reviews: '1.3K',
      learners: null,
      duration: null,
      questions: 'Essay Question',
      level: 'Academic',
      tag: 'Band 7.0+',
      updated: 'Updated 5 days ago',
      icon: HelpCircle
    },
    {
      id: 'sr3',
      type: 'COLLECTION',
      typeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
      title: 'IELTS Writing Task 2 – Band 7+ Collection',
      badge: "Editor's Pick",
      badgeColor: 'bg-amber-500 text-white',
      desc: 'High quality essays, model answers and expert feedback for band 7+',
      rating: '4.9',
      reviews: '890',
      learners: '12.7K learners',
      duration: null,
      questions: '45 items',
      level: 'Advanced',
      tag: null,
      updated: 'Updated 1 week ago',
      icon: Layers
    },
    {
      id: 'sr4',
      type: 'LESSON',
      typeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      title: 'How to Write a High-Scoring Task 2 Essay',
      badge: null,
      badgeColor: null,
      desc: 'Structure, planning, ideas development and band descriptors explained.',
      rating: '4.7',
      reviews: '2.1K',
      learners: null,
      duration: '18 mins',
      questions: null,
      level: 'Intermediate',
      tag: null,
      updated: 'Updated 2 weeks ago',
      icon: BookOpen
    },
    {
      id: 'sr5',
      type: 'TOPIC',
      typeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
      title: 'Common IELTS Writing Task 2 Topics',
      badge: null,
      badgeColor: null,
      desc: 'Education, environment, technology, society and more.',
      rating: null,
      reviews: null,
      learners: '9.4K learners',
      duration: null,
      questions: '36 items',
      level: null,
      tag: null,
      updated: 'Updated 1 week ago',
      icon: MessageSquare
    }
  ];

  const relatedSearches = [
    'ielts writing task 2 topics',
    'ielts writing task 2 band 7',
    'ielts writing task 2 sample essays',
    'ielts writing task 2 templates'
  ];

  const recentlyViewed = [
    { title: 'IELTS Writing Task 2 – Agree or Disagree', type: 'Exam', duration: '60 mins', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=150&auto=format&fit=crop' },
    { title: 'Writing Task 2 – Environment Topics', type: 'Collection', duration: '32 items', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=150&auto=format&fit=crop' },
    { title: 'Discuss both views – Healthcare', type: 'Question', duration: 'Band 7.0+', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=150&auto=format&fit=crop' }
  ];

  const filteredResults = useMemo(() => {
    return searchResults.filter(item => {
      const matchType = activeSubTab === 'all' || item.type.toLowerCase() === activeSubTab.toLowerCase().replace('s', '');
      return matchType;
    });
  }, [activeSubTab]);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Search Header Row */}
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
          Search Results
        </h1>
        <p className="text-xs text-muted-foreground">
          Results for <span className="font-bold text-indigo-600 dark:text-indigo-400">"{searchVal}"</span>
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All', count: '1,245' },
            { id: 'exams', label: 'Exams', count: '362' },
            { id: 'questions', label: 'Questions', count: '450' },
            { id: 'collections', label: 'Collections', count: '168' },
            { id: 'lessons', label: 'Lessons', count: '143' },
            { id: 'topics', label: 'Topics', count: '60' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeSubTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className="text-[10px] text-muted-foreground/60 font-semibold">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none">
            <option>Sort by: Most Relevant</option>
            <option>Sort by: Popularity</option>
            <option>Sort by: Newest</option>
          </select>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-border">
            <button
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded-lg ${isListView ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-muted-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded-lg ${!isListView ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-muted-foreground'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Select Filters row */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-border">
        <select 
          value={examFilter} 
          onChange={(e) => setExamFilter(e.target.value)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
        >
          <option>All Exams</option>
          <option>IELTS</option>
          <option>TOEIC</option>
          <option>TOEFL</option>
        </select>

        <select 
          value={skillFilter} 
          onChange={(e) => setSkillFilter(e.target.value)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
        >
          <option>Listening</option>
          <option>Reading</option>
          <option>Writing</option>
          <option>Speaking</option>
        </select>

        <select 
          value={diffFilter} 
          onChange={(e) => setDiffFilter(e.target.value)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
        >
          <option>All Levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <select 
          value={cefrFilter} 
          onChange={(e) => setCefrFilter(e.target.value)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
        >
          <option>All Levels</option>
          <option>B2</option>
          <option>C1</option>
          <option>C2</option>
        </select>

        <Button variant="outline" className="border-border text-[11px] py-1.5 px-3 rounded-xl flex items-center gap-1 bg-card">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          More Filters
        </Button>
        <button 
          onClick={() => {
            setExamFilter('All Exams');
            setSkillFilter('Writing');
            setDiffFilter('All Levels');
            setCefrFilter('All Levels');
          }}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Main content grid split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Results column */}
        <div className="xl:col-span-3 space-y-4">
          {filteredResults.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="border-border hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4 flex gap-4">
                  {/* Category Indicator Block */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex flex-col items-center justify-center text-center p-2 flex-shrink-0">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[8px] text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">{item.type}</span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-[8px] font-black border-none uppercase ${item.typeColor}`}>
                        {item.type}
                      </Badge>
                      {item.badge && (
                        <Badge className={`text-[8px] font-black border-none ${item.badgeColor}`}>
                          {item.badge}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-foreground hover:text-indigo-600 transition-colors leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[10px] text-muted-foreground">
                      {item.rating && (
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {item.rating}
                          <span className="font-normal text-muted-foreground">({item.reviews})</span>
                        </span>
                      )}
                      {item.learners && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {item.learners}
                        </span>
                      )}
                      {item.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration}
                        </span>
                      )}
                      {item.questions && <span>{item.questions}</span>}
                      {item.level && <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 font-bold">{item.level}</span>}
                      {item.tag && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 font-bold">{item.tag}</span>}
                      <span>{item.updated}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground">
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <Button variant="outline" className="border-border text-xs py-1.5 px-3 rounded-xl bg-card">
                      View details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <span className="text-[11px] text-muted-foreground font-medium">Showing 1–10 of 1,245 results</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, '...', 21].map((page, idx) => (
                <button
                  key={idx}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    page === 1
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-accent/40 text-muted-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Smart Summary */}
          <Card className="border-border overflow-hidden bg-gradient-to-br from-indigo-50/30 to-indigo-100/10 dark:from-slate-900 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  AI Smart Summary
                  <span className="text-[8px] bg-indigo-600 text-white py-0.5 px-1 rounded uppercase font-black">Beta</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                We found 1,245 results for <span className="font-bold text-foreground">"ielts writing task 2"</span>. You often struggle with:
              </p>
              <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-4">
                <li>Essay structure</li>
                <li>Coherence & cohesion</li>
                <li>Example development</li>
              </ul>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1">
                View AI Recommendations
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Related Searches */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Related Searches</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {relatedSearches.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] font-bold py-1 px-2.5 rounded-full cursor-pointer hover:bg-accent/40 border-border">
                  {tag}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {/* Recently Viewed */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold">Recently Viewed</CardTitle>
              <span className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer">View all</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentlyViewed.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-foreground truncate">{item.title}</h5>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-muted-foreground">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
