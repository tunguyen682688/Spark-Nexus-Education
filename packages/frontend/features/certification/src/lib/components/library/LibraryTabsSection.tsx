import {
  Bookmark,
  Clock,
  History,
  Sparkles,
} from 'lucide-react';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface LibraryTabsSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalSavedCount: number;
  libText: typeof CERTIFICATION_UI_TEXT.library;
}

export const LibraryTabsSection = ({
  activeTab,
  setActiveTab,
  totalSavedCount,
  libText,
}: LibraryTabsSectionProps) => {
  return (
    <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
      <button
        onClick={() => setActiveTab('saved')}
        className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
          activeTab === 'saved'
            ? 'border-indigo-600 text-indigo-600 font-extrabold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        <Bookmark className="w-4 h-4" />
        <span>
          {libText.tabs.saved} ({totalSavedCount})
        </span>
      </button>

      <button
        onClick={() => setActiveTab('in_progress')}
        className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
          activeTab === 'in_progress'
            ? 'border-indigo-600 text-indigo-600 font-extrabold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>{libText.tabs.inProgress}</span>
      </button>

      <button
        onClick={() => setActiveTab('history')}
        className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
          activeTab === 'history'
            ? 'border-indigo-600 text-indigo-600 font-extrabold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        <History className="w-4 h-4" />
        <span>{libText.tabs.history}</span>
      </button>

      <button
        onClick={() => setActiveTab('my_clones')}
        className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
          activeTab === 'my_clones'
            ? 'border-indigo-600 text-indigo-600 font-extrabold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>{libText.tabs.myClones}</span>
      </button>
    </div>
  );
};
