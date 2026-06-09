# 🎨 Application Shell & Micro-Frontends

Kiến trúc phía Frontend của **SparkNestEd** xây dựng trên nền tảng **App Shell Architecture** kết hợp mô hình phân rã **Micro-Frontends** trong cấu trúc Monorepo để đảm bảo tính độc lập tối đa giữa các tính năng giao diện nghiệp vụ.

---

## 🏛️ 1. App Shell Architecture Blueprint

**App Shell** đóng vai trò là phần khung ứng dụng tĩnh, ổn định cao, được tải đầu tiên khi người dùng truy cập. Nó nắm giữ các nhiệm vụ nền tảng:

```text
       ┌─────────────────────────────────────────────────────┐
       │                 APP SHELL (Khung chính)             │
       ├─────────────────────────────────────────────────────┤
       │  - Navigation Sidebar (Điều hướng)                  │
       │  - Auth0/OIDC Session (Quản lý phiên đăng nhập)      │
       │  - Theme Context (Dark/Light Mode)                  │
       │  - Global Toast/Notify Notification Gateway         │
       └──────────────────────────┬──────────────────────────┘
                                  │ (Tải bất đồng bộ luồng con)
                                  ▼
       ┌─────────────────────────────────────────────────────┐
       │             DYNAMIC MODULE ROUTING VIEW             │
       │  - /vocabulary  ➡️  Vocabulary Module (Lazy)       │
       │  - /quiz        ➡️  Quiz Arena Module (Lazy)       │
       └─────────────────────────────────────────────────────┘
```

*   **Lợi ích:** Tải khung UI cực nhanh trong vòng 100ms, mang lại cảm giác phản hồi tức thì cho người học, sau đó mới tải ngầm các file JS/CSS của các tính năng bên trong.

---

## 🔌 2. Webpack Module Federation & Micro-Frontends

Để chia tách quyền phát triển cho các nhóm khác nhau mà không bắt buộc phải build lại toàn bộ ứng dụng Monolith lớn, hệ thống sử dụng công nghệ **Module Federation**:

### 1. Phân tách Máy chủ (Hosts vs Remotes):
*   **Host (App Shell):** Trực tiếp cấu hình định tuyến và tải các component từ xa (Remotes) động tại thời điểm chạy (runtime).
*   **Remotes (Features):** Các thư viện tính năng nghiệp vụ độc lập được deploy trên các máy chủ tĩnh khác nhau.

### 2. Cấu hình Chia sẻ Thư viện tại Runtime (Shared Packages):
Để tránh việc tải trùng lặp các thư viện lõi (React, React Query) nhiều lần làm nặng bộ nhớ trình duyệt, cấu hình Module Federation bắt buộc phải thiết lập chia sẻ tài nguyên:

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app_shell',
      remotes: {
        vocabulary: 'vocabulary@https://cdn.sparknested.com/vocabulary/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^19.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
      },
    }),
  ],
};
```

---

## ⚡ 3. Tối Ưu Hóa Tải Trang (Lazy Loading & Suspense SOP)

Mọi luồng định tuyến (Routing) của các phân khu nghiệp vụ con bắt buộc phải đi qua cơ chế **Trì hoãn tải (Lazy Loading)** để giảm dung lượng file Bundle tải ban đầu của trang chủ xuống dưới **`200KB`**.

### Quy chuẩn Viết Code Định Tuyến Sạch:
*   Bắt buộc bọc các Component Lazy bằng `<Suspense>` kết hợp với các hiệu ứng hiển thị tải tạm thời (**Skeletons**) để tránh hiện tượng màn hình trắng trơn giật cục.

```tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { PageLoadingSkeleton } from './components/PageLoadingSkeleton';

// 1. Chỉ định nghĩa lazy loading cho các module con
const VocabularyModule = lazy(() => import('@spark-nest-ed/vocabulary-feature'));
const QuizModule = lazy(() => import('@spark-nest-ed/quiz-feature'));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* 2. Bọc Suspense kèm Skeleton Loader chất lượng cao */}
          <Route
            path="vocabulary/*"
            element={
              <Suspense fallback={<PageLoadingSkeleton count={6} />}>
                <VocabularyModule />
              </Suspense>
            }
          />
          <Route
            path="quiz/*"
            element={
              <Suspense fallback={<PageLoadingSkeleton count={4} />}>
                <QuizModule />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```
