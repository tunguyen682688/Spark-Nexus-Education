# Vocabulary Feature - File Structure Guide

## 📁 Complete File Structure

```
vocabulary/src/lib/
│
├── 📄 api/
│   └── vocabulary-api.ts              # API client functions
│
├── 🎨 components/
│   ├── index.ts                        # Component exports
│   ├── LearningToolsList.tsx           # ✅ Pure component (props)
│   ├── ListVocabularySetDefinition.tsx # ✅ Pure component (props)
│   ├── OverviewLearningVocabularySet.tsx # ✅ Pure component (props)
│   ├── PackageVocabulariesCard.tsx
│   ├── PackageVocabulariesRecentCard.tsx
│   ├── PersonalPackageCard.tsx         # ✅ Pure component (props)
│   ├── PersonalStatsCard.tsx           # ✅ Pure component (props)
│   ├── PersonalVocabularyCard.tsx
│   ├── VocabularyDetailsSet.tsx
│   └── VocabularyFilterSet.tsx         # ✅ Pure component (props)
│
├── 🧠 container/
│   ├── index.ts                        # Container exports
│   ├── CommunityVocabularySetContainer.tsx      # ✅ Uses hooks
│   ├── CreateVocabularySetContainer.tsx
│   ├── DetailVocabularySetContainer.tsx
│   ├── MyLibaryVocabularySetContainer.tsx        # ✅ Uses hooks
│   ├── OverviewLearningVocabularySetContainer.tsx # ✅ Uses hooks
│   └── StatusVocabularySetContainer.tsx
│
├── 📊 constants/
│   └── index.ts                        # Feature constants
│
├── 🎣 hooks/
│   ├── index.ts                        # Hook exports
│   └── use-vocabulary-sets.ts          # All vocabulary hooks
│
├── 📄 pages/
│   ├── CommunityVocabularySetPage.tsx  # ✅ Only renders container
│   ├── CreateVocabularySetPage.tsx     # ✅ Only renders container
│   ├── DetailVocabularySetPage.tsx     # ✅ Only renders container
│   ├── MyLibaryVocabularySetPage.tsx   # ✅ Only renders container
│   └── OverviewLearningVocabularySetPage.tsx # ✅ Only renders container
│
├── ⚙️ services/
│   ├── index.ts                        # Service exports
│   └── vocabulary-stats.service.ts     # Stats calculations
│
├── 📝 types/
│   └── index.ts                        # TypeScript types
│
├── 📦 index.ts                         # Public API exports
├── 📖 README.md                        # Feature documentation
└── 🏗️ ARCHITECTURE.md                  # Architecture guide
```

## ✅ Verification Checklist

### Pages
- [x] `CommunityVocabularySetPage` - Only renders container
- [x] `CreateVocabularySetPage` - Only renders container
- [x] `DetailVocabularySetPage` - Only renders container
- [x] `MyLibaryVocabularySetPage` - Only renders container
- [x] `OverviewLearningVocabularySetPage` - Only renders container

### Containers
- [x] `CommunityVocabularySetContainer` - Uses `useCommunityVocabularySets` hook
- [x] `MyLibaryVocabularySetContainer` - Uses `useMyCreatedSets`, `useMyFavoriteSets` hooks
- [x] `OverviewLearningVocabularySetContainer` - Uses `useVocabularySet`, `useSetWords` hooks
- [ ] `CreateVocabularySetContainer` - Needs verification
- [ ] `DetailVocabularySetContainer` - Needs verification
- [ ] `StatusVocabularySetContainer` - Has mock data, needs optimization

### Components
- [x] `PersonalPackageCard` - Pure component, receives props
- [x] `PersonalStatsCard` - Pure component, receives props
- [x] `OverviewLearningVocabularySet` - Pure component, receives props
- [x] `LearningToolsList` - Pure component, receives props
- [x] `ListVocabularySetDefinition` - Pure component, receives props
- [x] `VocabularyFilterSet` - Pure component, receives props

### Hooks
- [x] `useMyCreatedSets` - Fetches user's created sets
- [x] `useMyFavoriteSets` - Fetches user's favorites
- [x] `useCommunityVocabularySets` - Fetches community sets
- [x] `useVocabularySet` - Fetches single set
- [x] `useSetWords` - Fetches words in set
- [x] `useCreateVocabularySet` - Creates new set
- [x] `useToggleFavorite` - Toggles favorite status

### Services
- [x] `calculateVocabularyStats` - Calculates stats from sets
- [x] `calculateProgressPercentage` - Calculates progress

### API
- [x] `getMyCreatedSets` - GET /vocabulary/packages/my/created
- [x] `getMyFavorites` - GET /vocabulary/packages/my/favorites
- [x] `getCommunitySets` - GET /vocabulary/packages/community
- [x] `toggleCommunityFavorite` - POST/DELETE /vocabulary/packages/community/:id/favorite

## 🔄 Data Flow Examples

### Example 1: My Library Page
```
MyLibaryVocabularySetPage
  └── MyLibaryVocabularySetContainer
      ├── useMyCreatedSets(params) [Hook]
      │   └── vocabularyApi.getMyCreatedSets(params) [API]
      │       └── GET /vocabulary/packages/my/created [Backend]
      │
      ├── calculateVocabularyStats() [Service]
      │
      ├── SearchInput [Component]
      ├── FilterDropdown [Component]
      └── VocabularySetList
          └── PersonalPackageCard [Component] × N
```

### Example 2: Overview Learning
```
OverviewLearningVocabularySetPage
  └── OverviewLearningVocabularySetContainer
      ├── useVocabularySet(id) [Hook]
      ├── useSetWords(id) [Hook]
      │
      ├── OverviewLearningVocabularySet [Component]
      │   └── Props: learnedCount, totalCount, masteryLevelData
      │
      └── ListVocabularySetDefinition [Component]
          └── LearningToolsList [Component]
```

## 📝 File Naming Conventions

- **Pages**: `*Page.tsx` (e.g., `MyLibaryVocabularySetPage.tsx`)
- **Containers**: `*Container.tsx` (e.g., `MyLibaryVocabularySetContainer.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `PersonalPackageCard.tsx`)
- **Hooks**: `use-*.ts` (e.g., `use-vocabulary-sets.ts`)
- **Services**: `*.service.ts` (e.g., `vocabulary-stats.service.ts`)
- **Types**: `index.ts` (all types in one file)
- **Constants**: `index.ts` (all constants in one file)
- **API**: `*-api.ts` (e.g., `vocabulary-api.ts`)

## 🎯 Next Steps for Optimization

1. **StatusVocabularySetContainer**: Replace mock data with real hooks
2. **CreateVocabularySetContainer**: Verify structure
3. **DetailVocabularySetContainer**: Verify structure
4. **Add loading states**: Ensure all containers handle loading
5. **Add error states**: Ensure all containers handle errors
6. **Add empty states**: Ensure all containers handle empty data

