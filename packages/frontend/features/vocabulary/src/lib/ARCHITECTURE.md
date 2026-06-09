# Vocabulary Feature Architecture

## 📐 Cấu trúc Module

```
vocabulary/
├── 📄 api/                    # API Client Layer
│   └── vocabulary-api.ts     # Axios API calls, response transformation
│
├── 🎨 components/             # Pure UI Components
│   ├── PersonalPackageCard.tsx
│   ├── OverviewLearningVocabularySet.tsx
│   ├── LearningToolsList.tsx
│   └── ...
│
├── 🧠 container/            # Business Logic & State Management
│   ├── CommunityVocabularySetContainer.tsx
│   ├── MyLibaryVocabularySetContainer.tsx
│   ├── OverviewLearningVocabularySetContainer.tsx
│   └── ...
│
├── 📊 constants/              # Feature Constants
│   └── index.ts               # Pagination, cache times, defaults
│
├── 🎣 hooks/                   # Custom React Hooks
│   ├── use-vocabulary-sets.ts # Data fetching hooks
│   └── index.ts
│
├── 📄 pages/                   # Route Components
│   ├── CommunityVocabularySetPage.tsx
│   ├── MyLibaryVocabularySetPage.tsx
│   └── ...
│
├── ⚙️ services/               # Business Logic Services
│   ├── vocabulary-stats.service.ts
│   └── index.ts
│
├── 📝 types/                   # TypeScript Types
│   └── index.ts
│
└── 📦 index.ts                 # Public API Exports
```

## 🔄 Data Flow

```
┌─────────┐
│  Route  │
└────┬────┘
     │
     ▼
┌─────────────┐
│    Page     │  (Chỉ render container)
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────┐
│  Container  │─────▶│  Hooks   │
│  (Logic)    │      │ (Data)   │
└──────┬──────┘      └────┬─────┘
       │                  │
       │                  ▼
       │            ┌──────────┐
       │            │   API    │
       │            └────┬─────┘
       │                 │
       │                 ▼
       │            ┌──────────┐
       │            │ Backend  │
       │            └──────────┘
       │
       ▼
┌─────────────┐
│ Components  │  (Nhận props từ Container)
│   (UI)      │
└─────────────┘
```

## 📋 Layer Responsibilities

### 1. **Pages** (`pages/`)
**Trách nhiệm:**
- Entry point cho routes
- Render containers duy nhất
- Không có logic

**Ví dụ:**
```tsx
export default function MyLibaryVocabularySetPage() {
  return <MyLibaryVocabularySetContainer />;
}
```

### 2. **Containers** (`container/`)
**Trách nhiệm:**
- State management (useState, useReducer)
- Data fetching (sử dụng hooks)
- Business logic orchestration
- Compose components
- Handle user interactions

**Ví dụ:**
```tsx
export default function MyLibaryVocabularySetContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useMyCreatedSets(params);
  
  return (
    <div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      {isLoading ? <Skeleton /> : <VocabularySetList sets={data} />}
    </div>
  );
}
```

### 3. **Components** (`components/`)
**Trách nhiệm:**
- Pure UI rendering
- Nhận props
- Local UI state (form inputs, toggles)
- Không fetch data
- Không có business logic

**Ví dụ:**
```tsx
interface PersonalPackageCardProps {
  set: VocabularySet;
  onView?: (id: string) => void;
}

export const PersonalPackageCard: React.FC<PersonalPackageCardProps> = ({ 
  set, 
  onView 
}) => {
  return <Card>...</Card>;
};
```

### 4. **Hooks** (`hooks/`)
**Trách nhiệm:**
- Data fetching với React Query
- Mutation hooks
- Query key factories
- Cache management

**Ví dụ:**
```tsx
export function useMyCreatedSets(params?: ApiQueryParams) {
  return useQuery({
    queryKey: vocabularyKeys.myCreatedList(params),
    queryFn: () => vocabularyApi.getMyCreatedSets(params),
    staleTime: STALE_TIME.MY_SETS,
  });
}
```

### 5. **Services** (`services/`)
**Trách nhiệm:**
- Pure business logic functions
- Calculations
- Data transformations
- Utilities

**Ví dụ:**
```tsx
export function calculateVocabularyStats(
  createdSets: VocabularySet[],
  favoriteSets: VocabularySet[]
): VocabularyStatsData {
  // Pure calculation
}
```

### 6. **API** (`api/`)
**Trách nhiệm:**
- HTTP requests
- Response transformation
- Error handling
- Request/response types

**Ví dụ:**
```tsx
export const vocabularyApi = {
  async getMyCreatedSets(params?: ApiQueryParams) {
    const response = await axios.get(`${ENDPOINTS.myCreatedSets}${queryString}`);
    return extractPaginatedResponse(response.data);
  },
};
```

### 7. **Types** (`types/`)
**Trách nhiệm:**
- TypeScript type definitions
- Interfaces
- Enums
- Type exports

### 8. **Constants** (`constants/`)
**Trách nhiệm:**
- Magic numbers
- Configuration values
- Default values
- Feature-specific constants

## ✅ Quy tắc và Best Practices

### ✅ DO

1. **Pages chỉ render containers**
   ```tsx
   // ✅ Đúng
   export default function MyPage() {
     return <MyContainer />;
   }
   ```

2. **Containers sử dụng hooks để fetch data**
   ```tsx
   // ✅ Đúng
   const { data } = useMyCreatedSets();
   ```

3. **Components nhận props**
   ```tsx
   // ✅ Đúng
   <PersonalPackageCard set={set} />
   ```

4. **Business logic trong services**
   ```tsx
   // ✅ Đúng
   const stats = calculateVocabularyStats(sets);
   ```

### ❌ DON'T

1. **Không fetch data trong components**
   ```tsx
   // ❌ Sai
   const MyComponent = () => {
     const { data } = useMyCreatedSets(); // ❌
     return <div>...</div>;
   };
   ```

2. **Không có logic trong pages**
   ```tsx
   // ❌ Sai
   export default function MyPage() {
     const [state, setState] = useState(); // ❌
     return <div>...</div>;
   }
   ```

3. **Không hardcode data trong components**
   ```tsx
   // ❌ Sai
   const MyComponent = () => {
     const data = [1, 2, 3]; // ❌
     return <div>...</div>;
   };
   ```

## 🔍 Import Guidelines

### Import Order:
```tsx
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';

// 3. Shared
import { Button } from '@spark-nest-ed/frontend-shared-components';

// 4. Feature types
import type { VocabularySet } from '../types';

// 5. Feature hooks
import { useMyCreatedSets } from '../hooks';

// 6. Feature services
import { calculateVocabularyStats } from '../services';

// 7. Feature constants
import { VOCABULARY_CONSTANTS } from '../constants';

// 8. Feature components
import { PersonalPackageCard } from '../components';
```

### Import Paths:
- ✅ Use feature-relative paths: `../hooks`, `../types`
- ✅ Use shared package paths: `@spark-nest-ed/frontend-shared-components`
- ❌ Avoid deep relative paths: `../../../hooks`

## 📊 Component Hierarchy Example

```
MyLibaryVocabularySetPage
  └── MyLibaryVocabularySetContainer
      ├── useMyCreatedSets() [Hook]
      │   └── vocabularyApi.getMyCreatedSets() [API]
      │
      ├── SearchInput [Component]
      ├── FilterDropdown [Component]
      └── VocabularySetList [Component]
          └── PersonalPackageCard [Component] × N
```

## 🧪 Testing Strategy

- **Pages**: Test route rendering
- **Containers**: Test logic với mocked hooks
- **Components**: Test UI với props
- **Hooks**: Test với React Query test utils
- **Services**: Unit tests cho pure functions
- **API**: Mock axios responses

## 🚀 Development Workflow

1. **Tạo types** trong `types/`
2. **Tạo API calls** trong `api/`
3. **Tạo hooks** trong `hooks/`
4. **Tạo services** nếu cần business logic
5. **Tạo components** (pure UI)
6. **Tạo container** (logic + compose components)
7. **Tạo page** (render container)
8. **Export** trong `index.ts`

