import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeaturedCollections } from './use-certification';
import { useDebounce } from './useDebounce';
import { paginateItems } from '../services/certification-filter.service';
import {
  CERTIFICATION_UI_TEXT,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_KEYWORD,
} from '../constants/certification.constants';

export function useSearchContainerLogic() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState<string>(DEFAULT_SEARCH_KEYWORD);
  const [activeResultTab, setActiveResultTab] = useState<'all' | 'collections'>('all');
  const [isListViewMode, setIsListViewMode] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Debounce search query to optimize API request frequency
  const debouncedSearchKeyword = useDebounce(searchKeyword, 350);

  const {
    data: searchResults = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useFeaturedCollections(undefined, debouncedSearchKeyword);

  const resultTabOptions: Array<{
    key: 'all' | 'collections';
    label: string;
    count: number;
  }> = [
    {
      key: 'all',
      label: CERTIFICATION_UI_TEXT.search.tabAll,
      count: searchResults.length,
    },
    {
      key: 'collections',
      label: CERTIFICATION_UI_TEXT.search.tabCollections,
      count: searchResults.length,
    },
  ];

  const totalPages = Math.ceil(searchResults.length / DEFAULT_PAGE_SIZE) || 1;

  const paginatedSearchResults = useMemo(() => {
    return paginateItems(searchResults, currentPage, DEFAULT_PAGE_SIZE);
  }, [searchResults, currentPage]);

  const handleSearchKeywordChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleResultTabChange = (tab: 'all' | 'collections') => {
    setActiveResultTab(tab);
    setCurrentPage(1);
  };

  const handleViewCollectionDetail = (collectionId: string) => {
    navigate(`/certification/collections/${collectionId}`);
  };

  return {
    searchKeyword,
    debouncedSearchKeyword,
    activeResultTab,
    isListViewMode,
    setIsListViewMode,
    currentPage,
    setCurrentPage,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages,
    searchResults,
    paginatedSearchResults,
    resultTabOptions,
    isLoading,
    isError,
    error,
    refetch,
    handleSearchKeywordChange,
    handleResultTabChange,
    handleViewCollectionDetail,
  };
}
