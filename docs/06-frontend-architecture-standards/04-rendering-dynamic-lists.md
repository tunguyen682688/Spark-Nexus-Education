# 🎨 Large List Rendering (Virtual Scroll Law)

Quy tắc thiết kế và kết xuất (rendering) các danh sách động có kích thước lớn hoặc danh sách vô hạn (Infinite Lists) trong hệ thống **SparkNestEd** nhằm ngăn chặn tình trạng đơ nghẽn trình duyệt, rò rỉ bộ nhớ (Memory Leaks) và rớt khung hình của thiết bị người dùng.

---

## 🏛️ 1. Cài Đặt Cuộn Ảo Tiêu Chuẩn (Virtual Scrolling Blueprint)

> [!IMPORTANT]
> **Luật cuộn ảo:** Bắt buộc áp dụng cơ chế cuộn ảo đối với bất kỳ danh sách hiển thị nào có khả năng chứa **từ 50 phần tử trở lên** hiển thị đồng thời trên cây DOM.

Thay vì render hàng ngàn thẻ HTML làm sập hiệu năng kết xuất của trình duyệt, cuộn ảo chỉ vẽ các thẻ thực sự nằm trong khung nhìn (**Viewport**) của người dùng và tái sử dụng chúng linh hoạt:

```text
  [DANH SÁCH 10,000 TỪ VỰNG]
             │
             ▼ (Cơ chế Cuộn ảo - Virtual Scroll)
  ┌──────────────────────────────┐
  │ 1. [Từ 1] - Ẩn (Không DOM)   │
  ├──────────────────────────────┤
  │ 2. [Từ 2] - HIỂN THỊ (DOM)   │ ───┐
  │ 3. [Từ 3] - HIỂN THỊ (DOM)   │    │ ➔ Chỉ render đúng các phần tử
  │ 4. [Từ 4] - HIỂN THỊ (DOM)   │ ───┘   nằm trong Viewport màn hình
  ├──────────────────────────────┤
  │ 5. [Từ 5] - Ẩn (Không DOM)   │
  └──────────────────────────────┘
```

### 📋 Mã Nguồn Cài Đặt Chuẩn Hóa Với `@tanstack/react-virtual`:

```tsx
// packages/frontend/feature/vocabulary/src/lib/components/VocabularyVirtualList.tsx
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Item { id: string; word: string; definition: string; }
interface Props { items: Item[]; }

export function VocabularyVirtualList({ items }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Khởi tạo bộ ảo hóa dòng
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // Chiều cao ước lượng của mỗi dòng (px)
    overscan: 5             // Render trước 5 dòng ngoài viewport để tránh nhấp nháy khi cuộn nhanh
  });

  return (
    <div
      ref={parentRef}
      className="bg-dots overflow-auto rounded-xl border border-white/20 glass-card"
      style={{ height: '500px', width: '100%' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const item = items[virtualRow.index];
          return (
            <div
              key={item.id} // Luật khóa duy nhất
              className="absolute top-0 left-0 w-full px-4 py-2 border-b border-white/10 flex justify-between items-center"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <span className="font-bold text-lg">{item.word}</span>
              <span className="text-muted text-sm max-w-xs truncate">{item.definition}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 🚨 2. Luật Khóa `key` Phổ Thông - Tránh Thảm Họa Index Mảng

> [!CAUTION]
> **Thảm họa sử dụng Index mảng làm Key:** Tuyệt đối cấm sử dụng chỉ số index của vòng lặp `map((item, index) => ...)` làm giá trị thuộc tính `key` trong React đối với các danh sách có tính động (lọc tìm kiếm, sắp xếp thứ tự hoặc xóa/thêm phần tử).

*   **Tại sao cấm?** Khi bạn đảo ngược danh sách hoặc xóa phần tử ở giữa, React so sánh key thấy index `0, 1, 2` vẫn giữ nguyên nên nó sẽ tái sử dụng trạng thái local state cũ của DOM tại vị trí đó, dẫn đến hiện tượng: **Dữ liệu chữ của thẻ đã thay đổi nhưng các trạng thái như input nhập dở, check-box đã chọn vẫn bị dính cứng ở dòng cũ**, gây sai lệch nghiêm trọng.
*   *ĐÚNG:* Luôn sử dụng mã định danh UUID hoặc ID nghiệp vụ bền vững: `key={item.id}`.

---

## 🔄 3. Tối Ưu Hóa Cuộn Vô Hạn (Infinite Scroll & useInfiniteQuery)

Khi nạp dữ liệu từ backend dạng cuộn vô hạn (cuộn đến đâu tải thêm trang đến đó), bắt buộc sử dụng **`useInfiniteQuery`** của React Query để quản lý bộ đệm dữ liệu trang nối tiếp nhau mượt mà:

```typescript
// packages/frontend/feature/vocabulary/src/lib/hooks/useInfiniteVocabularySets.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { vocabularyApi } from '../api/vocabulary.api';

export function useInfiniteVocabularySets() {
  return useInfiniteQuery({
    queryKey: ['vocabulary', 'sets', 'infinite'],
    queryFn: ({ pageParam = 1 }) => vocabularyApi.getSets({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Nếu trang hiện tại nhỏ hơn tổng số trang, trả về số trang tiếp theo
      const meta = lastPage.meta.page;
      return meta.currentPage < meta.totalPages ? meta.currentPage + 1 : undefined;
    }
  });
}
```
