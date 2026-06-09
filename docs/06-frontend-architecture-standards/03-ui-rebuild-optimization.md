# 🎨 UI Rebuild & Component Optimization

Tài liệu quy định các tiêu chuẩn tối ưu hóa hiệu năng kết xuất (Rendering Performance) ở phía Frontend, kiểm soát số lần dựng lại giao diện (**Re-renders**) và bảo vệ tốc độ phản xạ mượt mà của thiết bị người dùng.

---

## 🚫 1. Lệnh Cấm Tuyệt Đối Viết Hàm Dựng Sẵn JSX (JSX Render Helper Ban)

> [!CAUTION]
> **Cấm tuyệt đối** việc định nghĩa các hàm trả về JSX dạng `renderHeader()`, `renderItem()` bên trong Component chính. Đây là nguyên nhân trực tiếp làm suy giảm hiệu năng render vì các hàm này sẽ bị buộc phải thực thi lại toàn bộ trên mỗi lượt re-render của component cha, phá vỡ khả năng tối ưu hóa component của React.

*   ❌ **SAI (PR REJECTED):** Viết hàm phụ trả về JSX.
    ```tsx
    export function VocabularyListComponent({ items }) {
      // Hàm renderItem luôn bị thực thi lại, không thể tối ưu hóa bộ nhớ đệm
      const renderItem = (item) => (
        <div key={item.id} className="item-card">{item.word}</div>
      );

      return (
        <div className="list-container">
          {items.map(item => renderItem(item))}
        </div>
      );
    }
    ```

*   ✔️ **ĐÚNG (PR APPROVED):** Tách thành Functional Component độc lập bên ngoài.
    ```tsx
    // Component độc lập sạch sẽ, có thể tối ưu bằng React.memo nếu cần
    interface ItemProps { item: { id: string; word: string } }
    
    const VocabularyItemComponent = React.memo(({ item }: ItemProps) => {
      return <div className="item-card">{item.word}</div>;
    });

    export function VocabularyListComponent({ items }) {
      return (
        <div className="list-container">
          {items.map(item => (
            <VocabularyItemComponent key={item.id} item={item} />
          ))}
        </div>
      );
    }
    ```

---

## 🧭 2. Quy Chuẩn Sử Dụng Memoization (useMemo & useCallback SOP)

Để tránh việc lạm dụng quá đà hoặc sử dụng sai làm tăng gánh nặng CPU của trình duyệt, toàn bộ kỹ sư phải tuân thủ nghiêm ngặt **Quy trình Memoization tiêu chuẩn**:

### 1. Khi nào BẮT BUỘC sử dụng `useCallback`?
Bắt buộc sử dụng `useCallback` để bọc các hàm callback truyền xuống component con **chỉ khi** component con đó đã được bọc trong `React.memo`.
*   *Lý do:* Nếu con không sử dụng `React.memo`, thì việc dùng `useCallback` ở cha hoàn toàn vô nghĩa vì con kiểu gì cũng bị render lại, gây lãng phí bộ nhớ khởi tạo callback.

```tsx
// CHA
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []); // Giữ nguyên tham chiếu hàm

// CON
const ChildComponent = React.memo(({ onSelect }) => {
  return <button onClick={() => onSelect('id')}>Select</button>;
});
```

### 2. Khi nào BẮT BUỘC sử dụng `useMemo`?
*   Khi có các phép toán biến đổi dữ liệu đắt đỏ (ví dụ: sắp xếp, lọc, nhóm mảng chứa trên 100 phần tử).
*   Khi cần giữ tham chiếu bất biến cho một Object hoặc Array được truyền vào danh sách dependencies của các Hook khác như `useEffect` hoặc `useQuery`.

```tsx
// Giữ tham chiếu bất biến để tránh useEffect chạy vô hạn (Infinite Loop)
const queryFilters = useMemo(() => ({
  status: 'ACTIVE',
  tags: activeTags
}), [activeTags]);

useEffect(() => {
  fetchData(queryFilters);
}, [queryFilters]); // Chỉ chạy khi activeTags thực sự thay đổi giá trị
```

---

## 👁️ 3. Quy Trình Phát Hiện & Xử Lý Re-render Thừa (Profiling)

Kỹ sư Frontend trước khi hoàn thành tính năng phải tự kiểm tra hiệu năng kết xuất thông qua quy trình sau:

1.  **Sử dụng React Developer Tools (Profiler):**
    *   Bật tab **Profiler** trên Chrome DevTools ➡️ Nhấn **Record** ➡️ Thực hiện tương tác UI ➡️ Nhấn **Stop**.
    *   Quan sát biểu đồ cột (Flamegraph): Nếu một Component không hề có thay đổi dữ liệu đầu vào (Props) nhưng vẫn bị hiển thị màu vàng (Re-rendered), bắt buộc phải tối ưu hóa bằng `React.memo` hoặc tái cấu trúc lại vị trí đặt State (State Colocation - đẩy state xuống component con sâu nhất có thể).
2.  **Sử dụng thư viện `why-did-you-render`:**
    *   Tích hợp ở môi trường Development để hệ thống tự động in log cảnh báo lên Console mỗi khi phát hiện một component bị re-render thừa do tham chiếu props bị làm mới không cần thiết.
