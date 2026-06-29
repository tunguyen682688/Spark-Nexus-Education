import { Search, Tag, Award } from 'lucide-react';
import { GRAMMAR_UI_TEXT } from '../../constants';

const T = GRAMMAR_UI_TEXT.communitySidebar;

interface CommunitySidebarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  trendingTags: string[];
}

export function CommunitySidebar({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  trendingTags,
}: CommunitySidebarProps) {
  return (
    <section className="lg:col-span-3 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={T.placeholderSearch}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background border border-border focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" /> {T.trendingTitle}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTagSelect('')}
            className={`text-xs px-3 py-1.5 rounded-xl transition font-medium ${
              !selectedTag
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {T.filterAll}
          </button>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`text-xs px-3 py-1.5 rounded-xl transition font-medium ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Award className="h-4 w-4 text-primary" /> {T.statsTitle}
        </h3>
        <p className="text-xs text-muted-foreground">{T.statsDesc}</p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-muted/40 p-3 rounded-xl border border-border text-center">
            <span className="block text-lg font-bold text-primary">{T.rewardSubmit}</span>
            <span className="text-[10px] text-muted-foreground block">{T.rewardSubmitLabel}</span>
          </div>
          <div className="bg-muted/40 p-3 rounded-xl border border-border text-center">
            <span className="block text-lg font-bold text-emerald-500">{T.rewardPublish}</span>
            <span className="text-[10px] text-muted-foreground block">{T.rewardPublishLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
