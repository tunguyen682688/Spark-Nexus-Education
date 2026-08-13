import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCompletedCollectionsData,
  useUserCertificates,
  useDownloadCertificate,
} from '../../use-certification';
import { paginateItems } from '../../../services/certification-filter.service';
import type { CertificateData } from '../../../components/shared/CertificateModal';
import type { CompletedCollectionsResponse } from '../../../types';
import type { CompletedCollectionCardItem } from '../../../types/container-logic-learning.types';

export type { CompletedCollectionCardItem } from '../../../types/container-logic-learning.types';

export function useCompletedCollectionsContainerLogic() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [activeTab, setActiveTab] = useState<
    'All' | 'Vocabulary' | 'IELTS' | 'TOEIC' | 'Listening' | 'Reading' | 'Writing' | 'Speaking'
  >('All');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'time'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Certificate Modal State
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useCompletedCollectionsData();
  const { data: userCertificates = [] } = useUserCertificates();
  const downloadCertificateMutation = useDownloadCertificate();

  const [collections, setCollections] = useState<CompletedCollectionCardItem[]>([]);

  useEffect(() => {
    if (apiData) {
      const response = apiData as unknown as CompletedCollectionsResponse;
      const fetched: CompletedCollectionCardItem[] = (response.items ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        category: (item.category as CompletedCollectionCardItem['category']) || 'Vocabulary',
        coverTitle: item.title,
        coverSubtitle: item.examType,
        gradientClass: '',
        medalColor: item.certificateEligible ? 'gold' : '',
        score: item.scoreText,
        timeSpent: '',
        completedDate: item.completedDate,
      }));
      setCollections(fetched);
    }
  }, [apiData]);

  const filteredCollections = useMemo(() => {
    return collections.filter((col) => {
      if (activeTab === 'All') return true;
      if (activeTab === 'IELTS') return col.coverTitle.includes('IELTS');
      if (activeTab === 'TOEIC') return col.coverTitle.includes('TOEIC');
      return col.category === activeTab;
    });
  }, [collections, activeTab]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCollections.length / pageSize) || 1;
  }, [filteredCollections.length, pageSize]);

  const paginatedCollections = useMemo(() => {
    return paginateItems(filteredCollections, currentPage, pageSize);
  }, [filteredCollections, currentPage, pageSize]);

  // Map earned certificates from userCertificates or derived completed collections
  const certificatesList: CertificateData[] = useMemo(() => {
    if (userCertificates.length > 0) {
      return userCertificates.map((cert) => ({
        id: cert.id,
        title: cert.title,
        category: cert.examCategory,
        issuedDate: cert.issuedDate,
        score: cert.score,
        credentialCode: cert.credentialCode || `SPARK-CERT-${cert.id.toUpperCase()}`,
      }));
    }
    return collections
      .filter((c) => c.medalColor)
      .map((c) => ({
        id: `cert-${c.id}`,
        title: c.title,
        category: c.category,
        issuedDate: c.completedDate || '2026-05-15',
        score: c.score || '85%',
        credentialCode: `SPARK-CERT-${c.id.replace(/\D/g, '') || Date.now()}`,
      }));
  }, [userCertificates, collections]);

  const computedMetrics = useMemo(() => {
    const completedSetsCount = collections.length;

    const avgAccuracyVal = collections.length > 0
      ? Math.round(collections.reduce((acc, c) => acc + (parseFloat(c.score) || 0), 0) / collections.length)
      : 0;

    const certificatesCount = certificatesList.length;

    const totalMinutes = collections.reduce((acc, item) => {
      if (!item.timeSpent) return acc;
      const hoursMatch = item.timeSpent.match(/(\d+)\s*h/i);
      const minsMatch = item.timeSpent.match(/(\d+)\s*m/i);
      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
      return acc + hours * 60 + mins;
    }, 0);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;
    const totalPracticeTimeStr = totalHours > 0
      ? `${totalHours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}`.trim()
      : `${totalMinutes || 0}m`;

    return {
      completedSetsCount,
      avgAccuracyStr: `${avgAccuracyVal}%`,
      certificatesCount,
      totalPracticeTimeStr,
      mocksMasteredCount: completedSetsCount,
    };
  }, [collections, certificatesList]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: 'recent' | 'score' | 'time') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleOpenCollection = (id: string) => {
    navigate(`/certification/collections/${id}`);
  };

  const handleViewCertificate = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existingCert = certificatesList.find(
      (c) => c.id === id || c.id === `cert-${id}` || c.title.toLowerCase().includes(id.toLowerCase())
    );

    const targetCert: CertificateData = existingCert || {
      id: `cert-${id}`,
      title: collections.find((c) => c.id === id)?.title || `Certification Package ${id.toUpperCase()}`,
      category: collections.find((c) => c.id === id)?.category || 'IELTS Master',
      issuedDate: collections.find((c) => c.id === id)?.completedDate || 'Official Issued',
      score: collections.find((c) => c.id === id)?.score || '88%',
      credentialCode: `SPARK-CERT-${id.toUpperCase()}`,
    };

    setSelectedCertificate(targetCert);
    setIsCertificateModalOpen(true);
  };

  const handleDownloadCertificate = (certId: string) => {
    downloadCertificateMutation.mutate(certId);
  };

  const handleCloseCertificateModal = () => {
    setIsCertificateModalOpen(false);
    setSelectedCertificate(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleViewAnalytics = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/certification/result/${id}`);
  };

  const handleBackToLearning = () => {
    navigate('/certification/library');
  };

  const handleExploreMoreExams = () => {
    navigate('/certification/official');
  };

  return {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab: handleTabChange,
    sortBy,
    setSortBy: handleSortChange,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount: filteredCollections.length,
    collections: paginatedCollections,
    allCollections: collections,
    certificatesList,
    computedMetrics,
    selectedCertificate,
    isCertificateModalOpen,
    handleOpenCollection,
    handleViewCertificate,
    handleDownloadCertificate,
    handleCloseCertificateModal,
    handleCopyCode,
    handleViewAnalytics,
    handleBackToLearning,
    handleExploreMoreExams,
  };
}
