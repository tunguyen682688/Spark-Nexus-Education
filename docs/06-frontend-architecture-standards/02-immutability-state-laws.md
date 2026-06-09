# 🎨 Immutability & State Management Laws

Việc duy trì tính bất biến (**Immutability**) của trạng thái (State) là luật thép hàng đầu ở phía Frontend để đảm bảo tính đúng đắn của React Re-rendering, tối ưu hóa bộ nhớ đệm và triệt tiêu hoàn toàn các lỗi cập nhật UI không mong muốn.

---

## ⚖️ 1. Luật Bất Biến & Giải Pháp Immer.js Cho State Lồng Sâu

> [!CAUTION]
> **Đột biến trực tiếp (Direct Mutation) là thảm họa:** Việc thay đổi trực tiếp giá trị của một thuộc tính bên trong Object/Array mà không đổi tham chiếu gốc của Object đó (ví dụ: `state.user.name = "John"`) sẽ khiến React so sánh nông `prev === next` thấy giống nhau và **từ chối render lại giao diện**, tạo ra bug UI "đơ" cực kỳ khó chịu.

Khi cập nhật các State có cấu trúc lồng sâu, bắt buộc phải sử dụng **Immer.js** để viết code cập nhật dạng đột biến trực tiếp giả lập (draft) nhưng trả về kết quả bất biến an toàn tuyệt đối.

*   ❌ **SAI (PR REJECTED):** Đột biến trực tiếp hoặc copy nông thủ công thiếu an toàn.
    ```typescript
    // Thay đổi trực tiếp
    state.vocabularySet.items[index].isMastered = true; 
    setVocabularySet(state); // React từ chối re-render!
    
    // Copy thủ công lồng sâu cồng kềnh, cực kỳ dễ sai sót
    setVocabularySet(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, isMastered: true } : item)
    }));
    ```

*   ✔️ **ĐÚNG (PR APPROVED):** Sử dụng `produce` của Immer.js sạch sẽ, trực quan.
    ```typescript
    import { produce } from 'immer';

    setVocabularySet(
      produce(draft => {
        // Viết code tự nhiên như đột biến trực tiếp, Immer tự động xử lý trả về bản sao an toàn
        draft.items[index].isMastered = true;
      })
    );
    ```

---

## 🏛️ 2. Mẫu Thiết Kế Custom Controller Hooks (Phân Tách Logic & UI)

Component giao diện (`components/`) chỉ được đảm nhận nhiệm vụ vẽ màn hình đồ họa. Toàn bộ logic lấy dữ liệu, validate, và quản lý các hàm xử lý sự kiện bắt buộc phải được đóng gói vào **Custom Hooks** đóng vai trò là **Controllers**:

```text
  ┌──────────────────────────────┐
  │ VocabularyCardComponent (UI) │ ◀─── Dumb View (Chỉ hiển thị JSX qua Props)
  └──────────────┬───────────────┘
                 │ (Gọi hàm controller & nhận state)
                 ▼
  ┌──────────────────────────────┐
  │ useVocabularyCardController  │ ◀─── Smart Controller (Nắm giữ React Query hooks,
  └──────────────────────────────┘      local states, handlers)
```

### 📋 Ví dụ Thực Tế Chuẩn Hóa:

#### Bước 1: Khai báo Custom Controller Hook
```typescript
// packages/frontend/feature/vocabulary/src/lib/hooks/useVocabularyCardController.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabularyApi } from '../api/vocabulary.api';

export function useVocabularyCardController(itemId: string, currentStatus: string) {
  const queryClient = useQueryClient();
  const [isFlipped, setIsFlipped] = useState(false);

  // Gọi API mutation cập nhật tiến trình
  const mutation = useMutation({
    mutationFn: (quality: number) => vocabularyApi.reviewItem(itemId, quality),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'srs-queue'] });
      setIsFlipped(false); // Reset trạng thái thẻ
    }
  });

  const handleCardFlip = () => setIsFlipped(prev => !prev);
  const handleQualitySelect = (quality: number) => mutation.mutate(quality);

  return {
    isFlipped,
    isLoading: mutation.isPending,
    handleCardFlip,
    handleQualitySelect
  };
}
```

#### Bước 2: Khai báo UI Component câm (Dumb UI) nhận State từ Controller
```tsx
// packages/frontend/feature/vocabulary/src/lib/components/VocabularyCardComponent.tsx
import { useVocabularyCardController } from '../hooks/useVocabularyCardController';

interface Props {
  itemId: string;
  word: string;
  definition: string;
  status: string;
}

export function VocabularyCardComponent({ itemId, word, definition, status }: Props) {
  // Tiêm controller xử lý logic vào
  const { isFlipped, isLoading, handleCardFlip, handleQualitySelect } = 
    useVocabularyCardController(itemId, status);

  return (
    <div className={`card-glass cursor-pointer ${isFlipped ? 'flipped' : ''}`} onClick={handleCardFlip}>
      <div className="card-front">
        <h3 className="text-xl font-bold">{word}</h3>
      </div>
      
      {isFlipped && (
        <div className="card-back" onClick={(e) => e.stopPropagation()}>
          <p className="text-md">{definition}</p>
          <div className="flex gap-2 mt-4">
            <button disabled={isLoading} onClick={() => handleQualitySelect(5)} className="btn-primary">Nhớ tốt</button>
            <button disabled={isLoading} onClick={() => handleQualitySelect(1)} className="btn-destructive">Quên</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ⚙️ 3. Quy Tắc Phân Loại Trạng Thái (State Classification)

Lập trình viên bắt buộc phải tự phân tách trạng thái theo đúng sơ đồ quyết định dưới đây trước khi khởi tạo State:
1.  **Local Component State (`useState`):** Chỉ dùng cho trạng thái giao diện nội bộ, độc lập, không chia sẻ cho component khác (ví dụ: `isOpen`, `isFlipped`).
2.  **Global Client State (Zustand):** Chỉ dùng khi dữ liệu cần chia sẻ cho nhiều Component nằm ở các nhánh khác nhau trên cây DOM (ví dụ: User Authentication Session, Dark Mode theme, Shopping Cart).
3.  **Server State (React Query Cache):** Toàn bộ dữ liệu lấy từ API Backend bắt buộc phải được quản lý và cache qua React Query. **Cấm copy dữ liệu từ React Query lưu lại vào Zustand hoặc local state.**
