import React, { useState } from 'react';
import { 
  Star, Users, ArrowRight, HelpCircle, 
  Download, Heart, ChevronLeft, ChevronRight, SlidersHorizontal, Plus
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge
} from '@spark-nest-ed/frontend-shared-components';
import { useCommunityCollections, useTopContributors } from '../hooks/use-certification';
import { CommunityCollectionCard } from '../components/CommunityCollectionCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';

export const CertificationCommunityContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Collections');

  const communityStats = [
    { label: 'Community Collections', val: '125K+', desc: '+3,820 this week', icon: Users, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Average Rating', val: '4.8', desc: 'From 68K reviews', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Downloads', val: '2.6M+', desc: '+120K this week', icon: Download, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Positive Feedback', val: '98%', desc: 'From learners', icon: Heart, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' }
  ];

  const { data: communityCollections = [], isLoading, isError, error, refetch } = useCommunityCollections();
  const { data: topContributors = [], isLoading: loadingContributors } = useTopContributors();

  const popularTags = [
    { name: 'Writing Task 2', count: '1.2K' },
    { name: 'Listening Part 3', count: '856' },
    { name: 'Grammar', count: '1.1K' },
    { name: 'Reading Passage', count: '1.3K' },
    { name: 'Speaking Part 2', count: '642' },
    { name: 'Vocabulary', count: '987' },
    { name: 'TOEIC LC', count: '734' },
    { name: 'Essay Samples', count: '998' }
  ];

  const recentlyAdded = [
    { title: 'IELTS Speaking Part 3 Topics & Answers', author: 'Lucy Pham', rating: '4.7', reviews: '512', learners: '2.1K', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=150&auto=format&fit=crop' },
    { title: 'TOEIC Listening Part 4 Practice', author: 'David Park', rating: '4.8', reviews: '423', learners: '1.8K', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=150&auto=format&fit=crop' },
    { title: 'Cambridge C1 Vocabulary Builder', author: 'Emma Smith', rating: '4.6', reviews: '301', learners: '1.2K', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=150&auto=format&fit=crop' },
    { title: 'TOEFL Writing Integrated Tasks', author: 'Alex Chen', rating: '4.7', reviews: '266', learners: '980', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=150&auto=format&fit=crop' }
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. TITLE & CREATE BUTTON HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            Community Collections 👥
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Collections created and shared by learners around the world.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            How it works
          </button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Create Collection
          </Button>
        </div>
      </div>

      {/* 2. FILTER PILLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
          {['All Collections', 'Trending', 'Most Cloned', 'Top Rated', 'New', 'Following'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none">
            <option>All Exams</option>
            <option>IELTS</option>
            <option>TOEIC</option>
            <option>TOEFL</option>
          </select>

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
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* 3. STATS CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {communityStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border-border hover:shadow-sm transition-shadow duration-300">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold">{item.label}</div>
                  <div className="text-xl font-black text-foreground mt-0.5">{item.val}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{item.desc}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 4. MAIN LAYOUT GRID (Cards Grid + Right Sidebar) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left main grid of cards */}
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <CardSkeleton key={idx} />
              ))
            ) : isError ? (
              <div className="col-span-full">
                <ErrorState onRetry={refetch} message={error instanceof Error ? error.message : undefined} />
              </div>
            ) : communityCollections.length === 0 ? (
              <div className="col-span-full text-center py-10 text-xs text-muted-foreground font-semibold">
                No community collections found.
              </div>
            ) : (
              communityCollections.map((item, idx) => (
                <CommunityCollectionCard key={idx} item={item} />
              ))
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Top contributors */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black">Top Contributors</CardTitle>
              <button className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                View all
                <ArrowRight className="w-3 h-3" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {loadingContributors ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse flex items-center gap-3">
                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="w-10 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                topContributors.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{c.rank}</span>
                      <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-foreground leading-tight">{c.name}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{c.details}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {c.points} pts
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Guidelines card */}
          <Card className="border-border bg-slate-50 dark:bg-slate-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[10px]">
              {[
                { title: 'Be Respectful', desc: 'Treat others with kindness.' },
                { title: 'Quality First', desc: 'Share accurate and helpful content.' },
                { title: 'No Spam', desc: 'Avoid promotional or irrelevant posts.' },
                { title: 'Give Credit', desc: 'Cite original sources and creators.' }
              ].map((g, idx) => (
                <div key={idx}>
                  <span className="font-bold text-foreground">{g.title}</span> — <span className="text-muted-foreground">{g.desc}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <button className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1">
                  See full guidelines
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* 5. POPULAR TAGS ROW */}
      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold">Popular Tags</h3>
          <button className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
            View all tags
            <ArrowRight className="w-3.5 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px] py-1 px-3.5 rounded-full border-border bg-card cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 font-bold">
              {tag.name} <span className="text-muted-foreground/60 font-semibold ml-1">{tag.count}</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* 6. RECENTLY ADDED COLLECTIONS */}
      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold">Recently Added Collections</h3>
          <button className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
            View all
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentlyAdded.map((item, idx) => (
            <Card key={idx} className="border-border hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-3.5 flex items-center gap-3">
                <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                  <div className="text-[9px] text-muted-foreground truncate">by {item.author}</div>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      {item.rating}
                    </span>
                    <span>{item.learners} learners</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 7. PAGINATION SECTION */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Showing 1–10 of 1,245 results</span>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5, '...', 20].map((page, idx) => (
              <button
                key={idx}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  page === 1
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Show</span>
            <select className="font-bold px-2 py-1 rounded-lg border border-border bg-card text-foreground focus:outline-none">
              <option>12</option>
              <option>24</option>
              <option>48</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>

    </div>
  );
};
