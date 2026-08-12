export interface XPTrendItem {
  date: string;
  dayName: string;
  xp: number;
}

export interface TrapCategoryItem {
  category: string;
  displayName: string;
  trapped: number;
  broken: number;
}

export interface GrammarAnalyticsResponse {
  totalTraps: number;
  trappedCount: number;
  brokenCount: number;
  accuracyRate: number;
  masteryPercentage: number;
  xpTrend: XPTrendItem[];
  trapCategories: TrapCategoryItem[];
}
