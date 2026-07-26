import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchasedCollectionsData } from './use-certification';

export interface PurchasedCollectionItem {
  id: string;
  orderId: string;
  title: string;
  category: 'Official Bundles' | 'IELTS Pro' | 'TOEIC Master' | 'Lifetime Access';
  examType: string;
  coverGradient: string;
  pricePaid: string;
  purchaseDate: string;
  accessType: 'Lifetime Access' | '1-Year License' | 'PRO Member Access';
  completedTests: number;
  totalTests: number;
  progressPercent: number;
}

export function usePurchasedCollectionsContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = usePurchasedCollectionsData();
  const [items, setItems] = useState<PurchasedCollectionItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    'All' | 'Official Bundles' | 'IELTS Pro' | 'TOEIC Master' | 'Lifetime Access'
  >('All');
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'progress'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (apiData && typeof apiData === 'object') {
      const record = apiData as Record<string, unknown>;
      const fetched = 'items' in record && Array.isArray(record['items'])
        ? (record['items'] as PurchasedCollectionItem[])
        : Array.isArray(apiData) ? (apiData as PurchasedCollectionItem[]) : [];
      setItems(fetched);
    }
  }, [apiData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTab = activeTab === 'All' || item.category === activeTab;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.examType.toLowerCase().includes(searchQuery.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [items, activeTab, searchQuery]);

  const handleOpenCollection = (id: string) => {
    navigate(`/certification/collections/${id}`);
  };

  const handleViewReceipt = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Opening official invoice & receipt for Order #${orderId}...`);
  };

  const handleBackToLearning = () => {
    navigate('/certification/library');
  };

  return {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    items: filteredItems,
    totalCount: filteredItems.length,
    handleOpenCollection,
    handleViewReceipt,
    handleBackToLearning,
  };
}
