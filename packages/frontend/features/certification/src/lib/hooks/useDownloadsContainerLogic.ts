import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDownloadsData, useDeleteDownload, useClearDownloads } from './use-certification';
import { paginateItems } from '../services/certification-filter.service';

export interface DownloadFileItem {
  id: string;
  name: string;
  subtitle: string;
  fileFormat: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP' | 'MP3';
  fileFormatBadgeClass: string;
  fileIconBgClass: string;
  downloadedOn: string;
  size: string;
  expiresOn: string;
  category: 'Tests' | 'Collections' | 'Vocabulary' | 'Reports';
}

export function useDownloadsContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useDownloadsData();
  const deleteDownloadMutation = useDeleteDownload();
  const clearDownloadsMutation = useClearDownloads();

  const [files, setFiles] = useState<DownloadFileItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    'All' | 'Tests' | 'Collections' | 'Vocabulary' | 'Reports'
  >('All');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    if (apiData && typeof apiData === 'object') {
      const record = apiData as Record<string, unknown>;
      const fetched = 'items' in record && Array.isArray(record['items'])
        ? (record['items'] as DownloadFileItem[])
        : Array.isArray(apiData) ? (apiData as DownloadFileItem[]) : [];
      setFiles(fetched);
    }
  }, [apiData]);

  // Filter & Sort files
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((file) => {
      const matchTab = activeTab === 'All' || file.category === activeTab;
      const matchSearch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'size') {
      result = [...result].sort((a, b) => {
        const sizeA = parseFloat(a.size.replace(/[^0-9.]/g, '')) || 0;
        const sizeB = parseFloat(b.size.replace(/[^0-9.]/g, '')) || 0;
        return sizeB - sizeA;
      });
    }

    return result;
  }, [files, activeTab, searchQuery, sortBy]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

  const totalCount = filteredAndSortedFiles.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedFiles = useMemo(() => {
    return paginateItems(filteredAndSortedFiles, currentPage, pageSize);
  }, [filteredAndSortedFiles, currentPage, pageSize]);

  // Storage metrics calculation
  const storageMetrics = useMemo(() => {
    let totalMB = 0;
    files.forEach((f) => {
      const val = parseFloat(f.size.replace(/[^0-9.]/g, '')) || 0;
      if (f.size.toUpperCase().includes('GB')) {
        totalMB += val * 1024;
      } else {
        totalMB += val;
      }
    });

    const maxGB = 5;
    const usedGB = (totalMB / 1024).toFixed(1);
    const percent = Math.min(100, Math.round((totalMB / (maxGB * 1024)) * 100));

    return {
      usedMB: totalMB.toFixed(1),
      usedGB,
      maxGB,
      percent: Math.max(percent, 1),
    };
  }, [files]);

  const handleOpenFile = (id: string) => {
    navigate(`/certification/collections/${id}`);
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.id !== id));
    deleteDownloadMutation.mutate(id);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn dọn dẹp toàn bộ tệp tải xuống offline không?')) {
      setFiles([]);
      clearDownloadsMutation.mutate();
    }
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
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    files: paginatedFiles,
    allFilesCount: files.length,
    storageMetrics,
    handleOpenFile,
    handleDeleteFile,
    handleClearAll,
    handleBackToLearning,
  };
}
