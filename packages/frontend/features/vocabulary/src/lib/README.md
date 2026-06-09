# Vocabulary Feature Module

## 📁 Cấu trúc thư mục

```
vocabulary/
├── api/                    # API client layer
│   └── vocabulary-api.ts  # Axios API calls
│
├── components/             # Pure UI Components (nhận props)
│   ├── PersonalPackageCard.tsx
│   ├── OverviewLearningVocabularySet.tsx
│   ├── LearningToolsList.tsx
│   └── ...
│
├── container/              # Business Logic & State Management
│   ├── CommunityVocabularySetContainer.tsx
│   ├── MyLibaryVocabularySetContainer.tsx
│   ├── OverviewLearningVocabularySetContainer.tsx
│   └── ...
│
├── constants/              # Feature constants
│   └── index.ts
│
├── hooks/                   # Custom React Hooks
│   ├── use-vocabulary-sets.ts
│   └── index.ts
│
├── pages/                   # Route-level components (chỉ render containers)
│   ├── CommunityVocabularySetPage.tsx
│   ├── MyLibaryVocabularySetPage.tsx
│   └── ...
│
├── services/               # Business logic services
│   ├── vocabulary-stats.service.ts
│   └── index.ts
│
├── types/                   # TypeScript type definitions
│   └── index.ts
│
└── index.ts                 # Public API exports
```

## 🏗️ Kiến trúc và Quy tắc

### 1. **Pages** (`pages/`)
- **Mục đích**: Route-level components, entry points cho routes
- **Quy tắc**:
  - Chỉ render containers, không có logic
  - Không import components trực tiếp
  - Không có state management

**Ví dụ:**
```tsx
// ✅ Đúng
export default function MyLibaryVocabularySetPage() {
  return <MyLibaryVocabularySetContainer />;
}

// ❌ Sai - không có logic trong page
export default function MyLibaryVocabularySetPage() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### 2. **Containers** (`container/`)
- **Mục đích**: Business logic, state management, data fetching
- **Quy tắc**:
  - Sử dụng hooks để fetch data
  - Quản lý state và side effects
  - Compose components và truyền props
  - Không chứa UI markup phức tạp

**Ví dụ:**
```tsx
// ✅ Đúng
export default function MyLibaryVocabularySetContainer() {
  const { data, isLoading } = useMyCreatedSets(params);
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      {isLoading ? <Skeleton /> : <VocabularySetList sets={data} />}
    </div>
  );
}
```

### 3. **Components** (`components/`)
- **Mục đích**: Pure UI components, reusable
- **Quy tắc**:
  - Nhận props, không fetch data trực tiếp
  - Không có business logic
  - Có thể có local UI state (như form inputs)
  - Export types cho props

**Ví dụ:**
```tsx
// ✅ Đúng
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

// ❌ Sai - không fetch data trong component
export const PersonalPackageCard = () => {
  const { data } = useMyCreatedSets(); // ❌
  return <Card>...</Card>;
};
```

### 4. **Hooks** (`hooks/`)
- **Mục đích**: Data fetching, business logic hooks
- **Quy tắc**:
  - Sử dụng React Query cho data fetching
  - Có thể có mutation hooks
  - Export query key factories
  - Handle caching và invalidation

**Ví dụ:**
```tsx
// ✅ Đúng
export function useMyCreatedSets(params?: ApiQueryParams) {
  return useQuery({
    queryKey: vocabularyKeys.myCreatedList(params),
    queryFn: () => vocabularyApi.getMyCreatedSets(params),
    staleTime: STALE_TIME.MY_SETS,
  });
}
```

### 5. **Services** (`services/`)
- **Mục đích**: Business logic utilities, calculations
- **Quy tắc**:
  - Pure functions
  - Không có side effects
  - Có thể test độc lập

**Ví dụ:**
```tsx
// ✅ Đúng
export function calculateVocabularyStats(
  createdSets: VocabularySet[],
  favoriteSets: VocabularySet[]
): VocabularyStatsData {
  // Pure calculation logic
}
```

### 6. **API** (`api/`)
- **Mục đích**: API client functions
- **Quy tắc**:
  - Chỉ chứa API calls
  - Handle response transformation
  - Không có business logic

### 7. **Types** (`types/`)
- **Mục đích**: TypeScript type definitions
- **Quy tắc**:
  - Export tất cả types cần thiết
  - Đồng bộ với backend types
  - Document enums và constants

### 8. **Constants** (`constants/`)
- **Mục đích**: Feature-specific constants
- **Quy tắc**:
  - Magic numbers và strings
  - Configuration values
  - Default values

## 📋 Quy tắc Import

### Import Order:
1. React và React-related
2. Third-party libraries
3. Shared components/utilities
4. Feature-specific (types, hooks, services, constants)
5. Components
6. Containers (chỉ trong pages)

### Import Paths:
```tsx
// ✅ Đúng - từ feature module
import { useMyCreatedSets } from '../hooks';
import type { VocabularySet } from '../types';
import { VOCABULARY_CONSTANTS } from '../constants';

// ✅ Đúng - từ shared
import { Button } from '@spark-nest-ed/frontend-shared-components';

// ❌ Sai - relative paths quá sâu
import { useMyCreatedSets } from '../../../hooks/use-vocabulary-sets';
```

## 🔄 Data Flow

```
Page → Container → Hooks → API → Backend
         ↓
      Components (nhận props từ Container)
```

## ✅ Checklist khi tạo component mới

- [ ] Component nhận props, không fetch data?
- [ ] Container sử dụng hooks để fetch data?
- [ ] Types được export đúng?
- [ ] Constants được định nghĩa trong constants/?
- [ ] Business logic trong services/?
- [ ] API calls trong api/?
- [ ] Exports được cập nhật trong index.ts?

## 🚀 Best Practices

1. **Separation of Concerns**: Mỗi layer có trách nhiệm rõ ràng
2. **Reusability**: Components có thể tái sử dụng
3. **Testability**: Logic có thể test độc lập
4. **Type Safety**: Sử dụng TypeScript đầy đủ
5. **Performance**: Sử dụng React Query caching
6. **Maintainability**: Code dễ đọc và maintain

