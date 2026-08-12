export interface BookmarkFolderViewModel {
  id: string;
  name: string;
  count: number;
}

export interface BookmarkItemViewModel {
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

export interface FavoriteItem {
  id: string;
  title: string;
  type: 'Collection' | 'Test' | 'Question Set' | 'Vocabulary Set';
  itemCountText: string;
  progressPercent: number;
  progressText: string;
  progressBarClass: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  addedDate: string;
  iconType: 'ielts' | 'toeic' | 'listening' | 'reading' | 'vocabulary' | 'speaking' | 'grammar';
  bannerBgClass: string;
  isFavorited: boolean;
}

export type LibraryTabType = 'saved' | 'in_progress' | 'history' | 'my_clones';

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
