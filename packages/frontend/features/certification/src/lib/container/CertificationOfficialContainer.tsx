import React, { useState } from 'react';
import { 
  ShieldCheck, Award, CheckCircle2,
  SlidersHorizontal, Grid, List, ChevronLeft, ChevronRight,
  FileText, LockKeyhole
} from 'lucide-react';
import { 
  Button
} from '@spark-nest-ed/frontend-shared-components';
import { useOfficialCollections } from '../hooks/use-certification';
import { OfficialCollectionCard } from '../components/OfficialCollectionCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';

export const CertificationOfficialContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Exams');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: officialCollections = [], isLoading, isError, error, refetch } = useOfficialCollections();

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* 1. TITLE & SUBTITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            Official Collections 
            <CheckCircle2 className="w-6 h-6 text-blue-500 fill-current" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Official and authorized exam collections from leading organizations.</p>
        </div>
      </div>

      {/* 2. FILTER PILLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All Exams', 'IELTS', 'TOEIC', 'TOEFL', 'Cambridge', 'VSTEP', 'SAT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                activeTab === tab 
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

          <select className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none">
            <option>Sort by: Newest</option>
            <option>Sort by: Popularity</option>
            <option>Sort by: Rating</option>
          </select>

          <Button variant="outline" className="border-border text-[11px] py-1.5 px-3 rounded-xl flex items-center gap-1.5 bg-card">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* 3. GUARANTEES BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-border">
        {[
          { title: '100% Official', desc: 'Authorized by exam boards and organizations', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
          { title: 'Authentic Questions', desc: 'Real exam questions with accurate patterns', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
          { title: 'Updated Regularly', desc: 'Latest exam formats and question updates', icon: Award, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
          { title: 'Quality Guaranteed', desc: 'Reviewed by experts for accuracy and reliability', icon: LockKeyhole, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-foreground leading-none">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. TITLE ROW & VIEW SWITCHER */}
      <div className="flex items-center justify-between pt-2 border-b border-border pb-3">
        <h3 className="text-sm font-black text-foreground">
          All Official Collections (24)
        </h3>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/40 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* 5. MAIN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))
        ) : isError ? (
          <div className="col-span-full">
            <ErrorState onRetry={refetch} message={error instanceof Error ? error.message : undefined} />
          </div>
        ) : officialCollections.length === 0 ? (
          <div className="col-span-full text-center py-10 text-xs text-muted-foreground font-semibold">
            No official collections found.
          </div>
        ) : (
          officialCollections.map((item, idx) => (
            <OfficialCollectionCard key={idx} item={item} />
          ))
        )}
      </div>

      {/* 6. PAGINATION ROW */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Showing 1–10 of 24 results</span>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5, '...', 10].map((page, idx) => (
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
