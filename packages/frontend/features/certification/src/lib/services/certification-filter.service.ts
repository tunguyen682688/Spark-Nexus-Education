import { ExamCollection } from '../types';

export interface FilterSortOptions {
  category?: string;
  sortFilter?: string;
}

export function filterAndSortCommunityCollections(
  collections: ExamCollection[],
  options: FilterSortOptions
): ExamCollection[] {
  const { category = 'All Exams', sortFilter = 'All Collections' } = options;

  let result = collections.filter((collectionItem) => {
    const matchCategory =
      category === 'All Exams' || collectionItem.exam === category;
    return matchCategory;
  });

  if (sortFilter === 'Trending') {
    result = [...result].sort((a, b) => (b.trend ? 1 : 0) - (a.trend ? 1 : 0));
  } else if (sortFilter === 'Most Cloned') {
    result = [...result].sort(
      (a, b) => parseInt(b.clones || '0', 10) - parseInt(a.clones || '0', 10)
    );
  } else if (sortFilter === 'Top Rated') {
    result = [...result].sort(
      (a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0')
    );
  }

  return result;
}

export function paginateItems<T>(
  items: T[],
  currentPage: number,
  pageSize: number
): T[] {
  const startOffset = (currentPage - 1) * pageSize;
  return items.slice(startOffset, startOffset + pageSize);
}
