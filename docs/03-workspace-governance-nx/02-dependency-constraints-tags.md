# ⚖️ Dependency Constraints & Tags

Để bảo vệ ranh giới của các module nghiệp vụ độc lập, ngăn chặn tuyệt đối lỗi phụ thuộc vòng tròn (Circular Dependency) và duy trì sự trong sạch của kiến trúc phân lớp, hệ thống áp dụng cơ chế **Ràng buộc phụ thuộc qua thẻ (Dependency Constraints & Tags)** của Nx Monorepo.

---

## 🏷️ 1. Chiến Lược Gán Thẻ Thư Viện (Nx Tagging Strategy)

Mỗi thư viện con (`library`) khi được tạo ra trong monorepo bắt buộc phải được định nghĩa các nhãn phân loại (`tags`) trong tệp cấu hình `project.json`. Chúng ta sử dụng hai trục thẻ chính:

1.  **Trục miền nghiệp vụ (`scope:[domain]`):** Xác định thư viện thuộc về Bounded Context nào.
    *   *Ví dụ:* `scope:user`, `scope:vocabulary`, `scope:dictionary`, `scope:quiz`, `scope:shared`.
2.  **Trục vai trò kỹ thuật (`type:[layer]`):** Xác định vị trí phân lớp kỹ thuật.
    *   *Ví dụ:* `type:domain`, `type:application`, `type:infrastructure`, `type:presentation`, `type:ui`, `type:feature`, `type:data-access`, `type:utility`.

---

## 📊 2. Bảng Ma Trận Hướng Phụ Thuộc (Dependency Matrix)

Bảng ma trận dưới đây quy định nghiêm ngặt quyền hạn Import chéo giữa các thư viện:

| Thư viện có nhãn (Source) | Được phép Import thư viện nhãn (Target) | ❌ CẤM Import thư viện nhãn (Auto-Reject) |
| :--- | :--- | :--- |
| **`type:domain`** | `type:domain`, `scope:shared` | `type:application`, `type:infrastructure`, `type:presentation` |
| **`type:application`** | `type:domain`, `type:application`, `scope:shared` | `type:infrastructure`, `type:presentation` |
| **`type:infrastructure`** | `type:domain`, `type:application`, `type:infrastructure`, `scope:shared` | `type:presentation` |
| **`type:presentation`** | `type:domain`, `type:application`, `type:infrastructure`, `scope:shared` | Không cấm |
| **`scope:[context-A]`** | `scope:[context-A]`, `scope:shared` | `scope:[context-B]` *(Ví dụ: vocabulary cấm import trực tiếp từ user)* |

---

## 🛠️ 3. Cấu Hình Ràng Buộc Trong Thực Tế (`eslint.config.mjs`)

Các quy tắc trên được thực thi tự động ở mức độ tĩnh (static analysis) thông qua plugin **ESLint `@nx/enforce-module-boundaries`** trong tệp cấu hình hệ thống:

```javascript
// eslint.config.mjs
export default [
  {
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            // 1. Ràng buộc ranh giới giữa các Bounded Contexts (scope)
            {
              sourceTag: 'scope:vocabulary',
              onlyDependOnLibsWithTags: ['scope:vocabulary', 'scope:shared'],
            },
            {
              sourceTag: 'scope:user',
              onlyDependOnLibsWithTags: ['scope:user', 'scope:shared'],
            },
            // 2. Ràng buộc hướng phụ thuộc kiến trúc phân lớp (type)
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain', 'scope:shared'],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: ['type:domain', 'type:application', 'scope:shared'],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: ['type:domain', 'type:application', 'type:infrastructure', 'scope:shared'],
            }
          ],
        },
      ],
    },
  },
];
```

---

## 📈 4. Trực Quan Hóa Bằng Nx Dependency Graph

Hệ thống cho phép hiển thị trực quan toàn bộ cấu trúc phụ thuộc và phát hiện các mối quan hệ sai lệch thông qua công cụ **Nx Graph**.

```text
               ┌───────────────────────┐
               │    api-sne (App)      │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   type:presentation   │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   type:application    │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │      type:domain      │
               └───────────────────────┘
                           ▲
                           │ (Đảo ngược phụ thuộc - DIP)
               ┌───────────┴───────────┐
               │  type:infrastructure  │
               └───────────────────────┘
```

*   **Lệnh chạy kiểm tra trực quan cục bộ:**
    ```bash
    npx nx graph
    ```
    *Lệnh này sẽ khởi chạy giao diện web tương tác hiển thị mọi nút (libraries) và cạnh (dependencies) trong Monorepo.*

*   **Chốt chặn kiểm tra tự động tại CI (CI Quality Gate):**
    Trước khi tạo Pull Request, hệ thống CI sẽ tự động chạy lệnh phân tích tĩnh:
    ```bash
    npx nx affected:lint
    ```
    *Nếu có bất kỳ dòng code import nào vi phạm ma trận ràng buộc, CI sẽ trả về trạng thái lỗi (Failed) và khóa nút Merge PR.*

---

## 🚨 5. Các Lỗi Vi phạm Thường Gặp & Cách Khắc Phục

### Case 1: Lỗi Phụ thuộc Vòng tròn (Circular Dependency)
*   **Hiện tượng:** Thư viện A import B, đồng thời B lại import một thành phần nào đó của A.
*   **Thông báo lỗi:** `Circular dependency between "library-A" and "library-B" detected.`
*   **Cách khắc phục:** 
    1.  Tách các thành phần dùng chung ở A và B ra một thư viện nhỏ độc lập (ví dụ: `shared-utility`).
    2.  Cấu hình A và B cùng phụ thuộc vào thư viện shared đó, xóa bỏ đường dẫn import chéo trực tiếp.

### Case 2: Vi phạm Ranh giới Tầng (Architecture Violation)
*   **Hiện tượng:** Kỹ sư viết code ở `type:domain` nhưng lại import một DTO nằm ở tầng `type:presentation` hoặc import Prisma Client trực tiếp từ `type:infrastructure`.
*   **Thông báo lỗi:** `A project tagged with "type:domain" can only depend on libs tagged with "type:domain"`
*   **Cách khắc phục:**
    1.  Xóa bỏ import trực tiếp.
    2.  Định nghĩa một Interface (Abstraction) trong `type:domain`.
    3.  Thực hiện cài đặt chi tiết Interface đó tại `type:infrastructure` để đảo ngược phụ thuộc (DIP).
