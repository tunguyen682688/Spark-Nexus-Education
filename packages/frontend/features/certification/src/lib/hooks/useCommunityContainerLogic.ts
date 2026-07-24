import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Download, Heart, LucideIcon } from 'lucide-react';
import {
  useCommunityCollections,
  useTopContributors,
} from './use-certification';
import {
  filterAndSortCommunityCollections,
  paginateItems,
} from '../services/certification-filter.service';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

export interface CommunityHighlightStat {
  label: string;
  displayValue: string;
  description: string;
  Icon: LucideIcon;
  color: string;
}

export function useCommunityContainerLogic(onStartExam?: (examId: string) => void) {
  const navigate = useNavigate();
  const [selectedCommunitySortFilter, setSelectedCommunitySortFilter] =
    useState<string>('All Collections');
  const [selectedExamCategory, setSelectedExamCategory] =
    useState<string>('All Exams');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const {
    data: communityExamCollections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCommunityCollections();

  const { data: topContributors = [] } = useTopContributors();

  const filteredCommunityCollections = useMemo(
    () =>
      filterAndSortCommunityCollections(communityExamCollections, {
        category: selectedExamCategory,
        sortFilter: selectedCommunitySortFilter,
      }),
    [communityExamCollections, selectedExamCategory, selectedCommunitySortFilter]
  );

  const totalPages =
    Math.ceil(filteredCommunityCollections.length / pageSize) || 1;

  const paginatedCommunityCollections = useMemo(
    () => paginateItems(filteredCommunityCollections, currentPage, pageSize),
    [filteredCommunityCollections, currentPage, pageSize]
  );

  const handleCommunitySortFilterChange = (filter: string) => {
    setSelectedCommunitySortFilter(filter);
    setCurrentPage(1);
  };

  const handleExamCategoryChange = (examCategory: string) => {
    setSelectedExamCategory(examCategory);
    setCurrentPage(1);
  };

  const handleViewCollectionDetail = (collectionId: string) => {
    if (onStartExam) {
      onStartExam(collectionId);
    } else {
      navigate(`/certification/collections/${collectionId}`);
    }
  };

  const communityHighlightStats: CommunityHighlightStat[] = [
    {
      label: CERTIFICATION_UI_TEXT.community.stats.collections,
      displayValue: '125K+',
      description: CERTIFICATION_UI_TEXT.community.stats.collectionsDesc,
      Icon: Users,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      label: CERTIFICATION_UI_TEXT.community.stats.rating,
      displayValue: '4.8',
      description: CERTIFICATION_UI_TEXT.community.stats.ratingDesc,
      Icon: Star,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    },
    {
      label: CERTIFICATION_UI_TEXT.community.stats.downloads,
      displayValue: '2.6M+',
      description: CERTIFICATION_UI_TEXT.community.stats.downloadsDesc,
      Icon: Download,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
    },
    {
      label: CERTIFICATION_UI_TEXT.community.stats.feedback,
      displayValue: '98%',
      description: CERTIFICATION_UI_TEXT.community.stats.feedbackDesc,
      Icon: Heart,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
    },
  ];

  return {
    selectedCommunitySortFilter,
    selectedExamCategory,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    topContributors,
    filteredCommunityCollections,
    paginatedCommunityCollections,
    communityHighlightStats,
    handleCommunitySortFilterChange,
    handleExamCategoryChange,
    handleViewCollectionDetail,
  };
}
