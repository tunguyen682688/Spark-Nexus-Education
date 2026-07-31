import {
  COMMUNITY_SORT_FILTERS,
  EXAM_CATEGORY_OPTIONS,
} from '../../constants/certification.constants';

interface CommunityFilterBarProps {
  selectedSortFilter: string;
  selectedCategory: string;
  onSortFilterChange: (filter: string) => void;
  onCategoryChange: (category: string) => void;
}

export const CommunityFilterBar = ({
  selectedSortFilter,
  selectedCategory,
  onSortFilterChange,
  onCategoryChange,
}: CommunityFilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {COMMUNITY_SORT_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => onSortFilterChange(filter)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
              selectedSortFilter === filter
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                : 'bg-accent/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
        >
          {EXAM_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
