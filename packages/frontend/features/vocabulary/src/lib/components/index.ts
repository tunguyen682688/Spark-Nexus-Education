/**
 * Vocabulary Components
 * 
 * Pure UI components that receive props and render UI.
 * These components do NOT fetch data or contain business logic.
 */

// Card Components
export { default as PersonalPackageCard } from './PersonalPackageCard';
export { default as PackageVocabulariesCard } from './PackageVocabulariesCard';
export { default as PackageVocabulariesRecentCard } from './PackageVocabulariesRecentCard';
export { default as PersonalVocabularyCard } from './PersonalVocabularyCard';
export { default as PersonalStatsCard } from './PersonalStatsCard';
export type { PersonalPackageCardProps } from './PersonalPackageCard';
export type { PackageVocabulariesCardProps } from './PackageVocabulariesCard';
export type { PackageVocabulariesRecentCardProps } from './PackageVocabulariesRecentCard';

// Learning Components
export { default as OverviewLearningVocabularySet } from './learning/OverviewLearningVocabularySet';
export { default as LearningToolsList } from './learning/LearningToolsList';
export { default as ListVocabularySetDefinition } from './learning/ListVocabularySetDefinition';
export { default as FlashcardPractice } from './learning/FlashcardPractice';
export type { FlashcardPracticeProps } from './learning/FlashcardPractice';

// Detail Components
export { default as VocabularyDetailsSet } from './manager/VocabularyDetailsSet';
export { default as VocabularyFilterSet } from './manager/VocabularyFilterSet';
export type { VocabularyDetailsSetProps } from './manager/VocabularyDetailsSet';

// Create Vocabulary Set Components
export { default as ConfirmDeleteWordDialog } from './manager/ConfirmDeleteWordDialog';
export { default as ConfirmDeleteSetDialog } from './manager/ConfirmDeleteSetDialog';
export type { ConfirmDeleteWordDialogProps } from './manager/ConfirmDeleteWordDialog';
export type { ConfirmDeleteSetDialogProps } from './manager/ConfirmDeleteSetDialog';

// Vocabulary Set Detail Components
export { default as VocabularySetHeader } from './manager/VocabularySetHeader';
export { default as VocabularySetProgressCard } from './manager/VocabularySetProgressCard';
export { default as VocabularySetStudyOptions } from './manager/VocabularySetStudyOptions';
export { default as VocabularySetOverview } from './manager/VocabularySetOverview';
export { default as VocabularySetWordsList } from './manager/VocabularySetWordsList';
export type { VocabularySetHeaderProps } from './manager/VocabularySetHeader';
export type { VocabularySetProgressCardProps } from './manager/VocabularySetProgressCard';
export type { VocabularySetStudyOptionsProps } from './manager/VocabularySetStudyOptions';
export type { VocabularySetOverviewProps } from './manager/VocabularySetOverview';
export type { VocabularySetWordsListProps, WordItem } from './manager/VocabularySetWordsList';

// Community Components
export { default as CommunityVocabularySetHeader } from './manager/CommunityVocabularySetHeader';
export { default as CommunityVocabularySetFilters } from './manager/CommunityVocabularySetFilters';
export { default as CommunityVocabularySetList } from './manager/CommunityVocabularySetList';
export { default as CommunityVocabularySetPagination } from './manager/CommunityVocabularySetPagination';
export { default as TopContributorsCard } from './manager/TopContributorsCard';
export type { CommunityVocabularySetHeaderProps } from './manager/CommunityVocabularySetHeader';
export type { CommunityVocabularySetFiltersProps } from './manager/CommunityVocabularySetFilters';
export type { CommunityVocabularySetListProps } from './manager/CommunityVocabularySetList';
export type { CommunityVocabularySetPaginationProps } from './manager/CommunityVocabularySetPagination';
export type { TopContributorsCardProps, Contributor } from './manager/TopContributorsCard';

// My Library Components
export { default as MyLibraryVocabularySetHeader } from './manager/MyLibraryVocabularySetHeader';
export { default as MyLibraryLearningStatsCard } from './manager/MyLibraryLearningStatsCard';
export { default as MyLibraryVocabularySetFilters } from './manager/MyLibraryVocabularySetFilters';
export { default as MyLibraryVocabularySetList } from './manager/MyLibraryVocabularySetList';
export { default as MyLibraryVocabularySetPagination } from './manager/MyLibraryVocabularySetPagination';
export type { MyLibraryVocabularySetHeaderProps } from './manager/MyLibraryVocabularySetHeader';
export type { MyLibraryLearningStatsCardProps, LearningStat } from './manager/MyLibraryLearningStatsCard';
export type { MyLibraryVocabularySetFiltersProps } from './manager/MyLibraryVocabularySetFilters';
export type { MyLibraryVocabularySetListProps } from './manager/MyLibraryVocabularySetList';
export type { MyLibraryVocabularySetPaginationProps } from './manager/MyLibraryVocabularySetPagination';

// Detail Vocabulary Components
export * from './detail';

// Type Exports
export type { OverviewLearningVocabularySetProps, MasteryLevelData } from './learning/OverviewLearningVocabularySet';
export type { LearningToolsListProps, LearningTool } from './learning/LearningToolsList';
export type { VocabularyWord, LevelColorScheme } from './PersonalVocabularyCard';
