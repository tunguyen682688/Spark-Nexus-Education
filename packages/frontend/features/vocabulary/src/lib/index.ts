/**
 * Vocabulary Feature Module
 * 
 * This module provides vocabulary set management functionality including:
 * - Creating and managing vocabulary sets
 * - Community vocabulary sets discovery
 * - Personal vocabulary library
 * - Learning progress tracking
 * 
 * Architecture:
 * - Pages: Route-level components that render containers
 * - Containers: Business logic and state management, use hooks
 * - Components: Pure UI components, receive props
 * - Hooks: Data fetching and business logic hooks
 * - Services: Business logic utilities
 * - Types: TypeScript type definitions
 * - API: API client functions
 * - Constants: Feature-specific constants
 */

// ============================================================================
// TYPES
// ============================================================================
export * from './types';

// ============================================================================
// HOOKS
// ============================================================================
export * from './hooks';

// ============================================================================
// SERVICES
// ============================================================================
export * from './services';

// ============================================================================
// CONSTANTS
// ============================================================================
export * from './constants';

// ============================================================================
// PAGES
// ============================================================================
export { default as CommunityVocabularySetPage } from './pages/CommunityVocabularySetPage';
export { default as EditorVocabularySetPage } from './pages/EditorVocabularySetPage';
export { default as DetailVocabularySetPage } from './pages/DetailVocabularySetPage';
export { default as DetailVocabularyPage } from './pages/DetailVocabularyPage';
export { default as MyLibaryVocabularySetPage } from './pages/MyLibaryVocabularySetPage';
export { default as OverviewLearningVocabularySetPage } from './pages/OverviewLearningVocabularySetPage';
export { default as FlashcardPracticePage } from './pages/FlashcardPracticePage';
export { default as QuizPracticePage } from './pages/QuizPracticePage';
export { default as TestPracticePage } from './pages/TestPracticePage';

// ============================================================================
// COMPONENTS (Public API - only export reusable components)
// ============================================================================
export { default as PackageVocabulariesCard } from './components/PackageVocabulariesCard';
export { default as PackageVocabulariesRecentCard } from './components/PackageVocabulariesRecentCard';
export { default as PersonalPackageCard } from './components/PersonalPackageCard';
export { default as PersonalStatsCard } from './components/PersonalStatsCard';
export { default as OverviewLearningVocabularySet } from './components/learning/OverviewLearningVocabularySet';
export { default as LearningToolsList } from './components/learning/LearningToolsList';
export type { OverviewLearningVocabularySetProps, MasteryLevelData } from './components/learning/OverviewLearningVocabularySet';
export type { LearningToolsListProps, LearningTool } from './components/learning/LearningToolsList';

// ============================================================================
// CONTAINERS (Internal - not exported by default, only used by pages)
// ============================================================================
// Containers are internal implementation details
// Pages should import containers directly if needed
