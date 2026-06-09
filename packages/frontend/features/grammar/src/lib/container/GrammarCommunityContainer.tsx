import { useState } from 'react';
import { Sparkles, Award, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useGrammarCommunityPosts } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';

import { CommunitySidebar } from '../components/community/CommunitySidebar';
import { CommunityFeed } from '../components/community/CommunityFeed';
import { CrowdsourcedQuizForm } from '../components/community/CrowdsourcedQuizForm';

interface GrammarCommunityContainerProps {
  onBackToRoadmap: () => void;
  onNavigateToCreatePost: () => void;
}

export function GrammarCommunityContainer({
  onBackToRoadmap,
  onNavigateToCreatePost,
}: GrammarCommunityContainerProps) {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'HOT' | 'RECENT'>('RECENT');
  const [isCrowdsourceOpen, setIsCrowdsourceOpen] = useState(false);

  // Fetch data
  const { data: posts = [], isLoading } = useGrammarCommunityPosts(
    selectedTag || undefined,
    searchQuery || undefined
  );

  const trendingTags = [
    'Tenses',
    'Inversion',
    'Conditionals',
    'RelativeClauses',
    'PassiveVoice',
    'Modals',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-16">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-[300px] right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[600px] left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBackToRoadmap}
            className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary fill-primary/20" />{' '}
              Grammar Community Hub
            </h1>
            <p className="text-xs text-muted-foreground">
              {GRAMMAR_UI_TEXT.community.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCrowdsourceOpen(true)}
            className="bg-secondary hover:bg-secondary/80 border border-border text-primary text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Award className="h-4 w-4 text-primary" /> {GRAMMAR_UI_TEXT.community.btnContribution}
          </Button>

          <Button
            onClick={onNavigateToCreatePost}
            className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg"
          >
            <Plus className="h-4 w-4" /> {GRAMMAR_UI_TEXT.community.btnCreatePost}
          </Button>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <CommunitySidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          trendingTags={trendingTags}
        />
        <CommunityFeed
          posts={posts}
          isLoading={isLoading}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onNavigateToCreatePost={onNavigateToCreatePost}
        />
      </main>

      <CrowdsourcedQuizForm
        isOpen={isCrowdsourceOpen}
        onClose={() => setIsCrowdsourceOpen(false)}
      />
    </div>
  );
}
