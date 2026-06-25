import React from 'react';
import { LISTENING_CATEGORIES } from '../constants';

interface ExploreCategoryTabsProps {
  category: string;
  handleCategoryChange: (category: string) => void;
}

export const ExploreCategoryTabs: React.FC<ExploreCategoryTabsProps> = ({
  category,
  handleCategoryChange,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
      {LISTENING_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = category === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold border shrink-0 transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500 text-white shadow-lg'
                : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default ExploreCategoryTabs;
