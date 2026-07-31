import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarksData, useAddBookmark, useRemoveBookmark } from '../../use-certification';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { paginateItems } from '../../../services/certification-filter.service';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { BookmarksResponse, BookmarkItem as ApiBookmarkItem } from '../../../types';

export interface BookmarkFolder {
  id: string;
  name: string;
  count: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  type: 'Collection' | 'Test' | 'Question' | 'Vocabulary';
  typeBadgeClass: string;
  subtitle: string;
  creatorName?: string;
  progressPercent: number;
  progressText: string;
  progressBarClass: string;
  bookmarkedOn: string;
  folderName: string;
  iconType: 'ielts_writing' | 'toeic_listening' | 'essay' | 'vocabulary' | 'speaking' | 'grammar';
  bannerBgClass: string;
}

export function useBookmarksContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useBookmarksData();
  const removeBookmarkMutation = useRemoveBookmark();

  const [folders, setFolders] = useState<BookmarkFolder[]>([
    { id: 'all', name: 'All Folders', count: 0 },
  ]);
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    'All' | 'Collections' | 'Tests' | 'Questions' | 'Vocabulary'
  >('All');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'folder'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Folder Modal state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Sync API data if returned from server
  useEffect(() => {
    if (apiData) {
      const response = apiData as unknown as BookmarksResponse;
      const fetchedItems: BookmarkItem[] = (response.items ?? []).map((item: ApiBookmarkItem) => ({
        id: item.itemId || item.id,
        title: item.title,
        type: (item.itemType as BookmarkItem['type']) || 'Collection',
        typeBadgeClass: '',
        subtitle: '',
        progressPercent: 0,
        progressText: '',
        progressBarClass: '',
        bookmarkedOn: item.createdAt,
        folderName: item.folderName,
        iconType: 'toeic_listening' as const,
        bannerBgClass: '',
      }));
      setItems(fetchedItems);

      if (Array.isArray(response.folders) && response.folders.length > 0) {
        setFolders(response.folders.map((f) => ({ id: f.id, name: f.name, count: f.itemCount })));
      } else {
        // Derive folder counts from items
        const folderCounts: Record<string, number> = {};
        fetchedItems.forEach((it) => {
          if (it.folderName) {
            folderCounts[it.folderName] = (folderCounts[it.folderName] || 0) + 1;
          }
        });
        const derivedFolders: BookmarkFolder[] = [
          { id: 'all', name: 'All Folders', count: fetchedItems.length },
          ...Object.entries(folderCounts).map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            count,
          })),
        ];
        setFolders(derivedFolders);
      }
    }
  }, [apiData]);

  // ===== Derived: filtered items =====

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Folder filter: match by folder name (case-insensitive contains)
      const matchFolder = activeFolderId === 'all' || item.folderName.toLowerCase().includes(activeFolderId.toLowerCase());
      // Type tab filter
      const matchTab =
        activeTab === 'All' ||
        (activeTab === 'Collections' && item.type === 'Collection') ||
        (activeTab === 'Tests' && item.type === 'Test') ||
        (activeTab === 'Questions' && item.type === 'Question') ||
        (activeTab === 'Vocabulary' && item.type === 'Vocabulary');
      // Search filter: match title or folder name
      const matchSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.folderName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFolder && matchTab && matchSearch;
    });
  }, [items, activeFolderId, activeTab, searchQuery]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / pageSize) || 1;
  }, [filteredItems.length, pageSize]);

  const paginatedItems = useMemo(() => {
    return paginateItems(filteredItems, currentPage, pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      count: 0,
    };

    setFolders((prev) => [...prev, newFolder]);
    setActiveFolderId(newFolder.id);
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  const addBookmarkMutation = useAddBookmark();

  const handleAddBookmark = (item: { itemId: string; itemType?: string; title?: string; folderName?: string }) => {
    addBookmarkMutation.mutate(item);
  };

  const handleOpenItem = (id: string) => {
    navigate(`/certification/collections/${id}`);
  };

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== id));
    removeBookmarkMutation.mutate(id);
  };

  const { toast } = useToast();
  const handleStartRevisionQuiz = () => {
    // Guard: only allow if there are bookmarked items to revise
    if (filteredItems.length === 0) {
      toast(CERTIFICATION_UI_TEXT.toast.startPracticeError);
      return;
    }
    navigate('/certification/study-plan');
  };

  const handleBackToLearning = () => {
    navigate('/certification/library');
  };

  return {
    isApiLoading,
    isError,
    refetch,
    folders,
    activeFolderId,
    setActiveFolderId,
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
    pageSize,
    setPageSize,
    totalPages,
    items: paginatedItems,
    totalCount: filteredItems.length,
    isCreateFolderOpen,
    setIsCreateFolderOpen,
    newFolderName,
    setNewFolderName,
    handleCreateFolder,
    handleAddBookmark,
    handleOpenItem,
    handleRemoveBookmark,
    handleStartRevisionQuiz,
    handleBackToLearning,
  };
}
