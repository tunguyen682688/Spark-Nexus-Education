# 🏗️ Nx Monorepo Layout Blueprint

Hệ sinh thái **SparkNestEd** được cấu trúc dưới dạng một **Nx Monorepo** thống nhất để quản lý toàn bộ mã nguồn Frontend, Backend và các thư viện dùng chung. Mô hình này giúp tăng tốc độ phát triển, tối ưu hóa quá trình Build Caching và chia sẻ mã nguồn (code sharing) một cách hiệu quả giữa các cấu phần ứng dụng.

---

## 🗂️ 1. Sơ Đồ Cây Thư Mục Monorepo Chi Tiết

Dưới đây là sơ đồ quy hoạch thư mục thực tế của Monorepo:

```text
Spark-Nexus-Ed/
├── 📂 apps/                                 # ỨNG DỤNG ĐẦU VÀO (Entrypoints)
│   ├── 📂 api-sne/                          # Backend API chính (NestJS Framework)
│   └── 📂 frontend-sne/                     # Frontend Application chính (React 19 + Vite)
│
├── 📂 packages/                             # THƯ VIỆN & CÁC TÍNH NĂNG TÁCH BIỆT (Libraries)
│   ├── 📂 shared/                           # Gói tiện ích, helper dùng chung cho cả FE và BE
│   │   └── 📂 libs/                         # Base classes, types, formatters
│   │
│   ├── 📂 backend/                          # Mã nguồn bổ trợ Backend
│   │   ├── 📂 infrastructure/               # Các Adapter hạ tầng dùng chung (DB, Redis, Mail)
│   │   └── 📂 domains/                      # Các Bounded Context nghiệp vụ độc lập
│   │       ├── 📂 module-user/              # Module Người dùng
│   │       └── 📂 module-vocabulary/        # Module Từ vựng & Tiến trình học tập
│   │
│   └── 📂 frontend/                         # Mã nguồn bổ trợ Frontend
│       ├── 📂 shared/                       # UI Components dùng chung (Buttons, Input, Dialog)
│       └── 📂 feature/                      # Các phân khu tính năng nghiệp vụ của frontend
│           └── 📂 vocabulary/               # Tính năng Từ vựng (Page-Container-Component)
│
├── 📄 nx.json                               # Cấu hình Task Pipeline & Caching của Nx
├── 📄 tsconfig.base.json                    # Định nghĩa Paths alias (@spark-nest-ed/*)
└── 📄 package.json                          # Khai báo thư viện phụ thuộc toàn hệ thống
```

---

## 🎨 2. Mô Hình 4 Tầng Thư Viện Frontend (React 19 Pattern)

Đối với mã nguồn Frontend nằm trong `packages/frontend/feature/[domain]/`, chúng ta áp dụng mô hình phân lớp chặt chẽ để tách biệt hoàn toàn giữa việc **vẽ giao diện**, **xử lý logic** và **gọi dữ liệu**:

```text
               ┌─────────────────────────────────────────┐
               │          FEATURE (Smart Page)           │
               └────┬────────────────────────────────┬───┘
                    │                                │
                    ▼                                ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│     DATA-ACCESS (API/State)   │        │     UI (Pure Component/Dumb)  │
└───────────────────────────────┘        └───────────────────────────────┘
                    │                                │
                    ▼                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      UTILITY / CONSTANTS (Helpers)                     │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Tầng `feature` (Smart Components)
*   **Trách nhiệm:** Đóng vai trò là điểm định tuyến (Page) hoặc Container điều phối.
*   **Nhiệm vụ:**
    *   Quản lý các trạng thái cục bộ phức tạp của trang (`useState`, `useReducer`).
    *   Gọi các hooks lấy dữ liệu (`useQuery`, `useMutation`) từ tầng **data-access**.
    *   Lắp ghép dữ liệu và truyền trực tiếp xuống các component con ở tầng **ui**.
*   **Ví dụ thư mục:** `libs/frontend/feature/vocabulary/src/lib/container/`

### 2. Tầng `ui` (Dumb Components)
*   **Trách nhiệm:** Chỉ đảm nhận việc hiển thị giao diện đồ họa.
*   **Nhiệm vụ:**
    *   Nhận dữ liệu hoàn chỉnh và các hàm callback (sự kiện) thông qua `props`.
    *   Không được chứa bất kỳ hook gọi API hay import từ thư viện API Client nào.
    *   Không chứa business logic phức tạp, giữ tính tái sử dụng cao.
*   **Ví dụ thư mục:** `libs/frontend/feature/vocabulary/src/lib/components/`

### 3. Tầng `data-access` (API & State Management)
*   **Trách nhiệm:** Đảm nhận việc giao tiếp dữ liệu với máy chủ Backend.
*   **Nhiệm vụ:**
    *   Đóng gói các HTTP Requests bằng Axios hoặc Fetch.
    *   Định nghĩa các Custom Hooks của `@tanstack/react-query` để lấy và cập nhật dữ liệu.
    *   Quản lý Cache và xử lý đồng bộ dữ liệu Client-Server.
*   **Ví dụ thư mục:** `libs/frontend/feature/vocabulary/src/lib/hooks/`

### 4. Tầng `utility` (Helpers & Formatters)
*   **Trách nhiệm:** Cung cấp các hàm bổ trợ thuần túy.
*   **Nhiệm vụ:**
    *   Định nghĩa các hàm xử lý chuỗi, định dạng ngày tháng, tính toán toán học.
    *   *Đặc trưng:* Phải là các **Pure Functions** (không gây tác dụng phụ, đầu vào giống nhau luôn trả về kết quả giống nhau).

---

## 🔌 3. Mô Hình 4 Tầng Thư Viện Backend (Clean Architecture Pattern)

Tại Backend nằm trong `packages/backend/domains/[domain]/`, cấu trúc thư viện được tổ chức theo đúng nguyên lý **Clean Architecture** để bảo vệ sự thuần khiết của nghiệp vụ:

### 1. Tầng `presentation` (Cổng Vào HTTP/gRPC)
*   **Nhiệm vụ:** Chứa các NestJS Controllers để tiếp nhận HTTP Requests hoặc gRPC calls. Thực hiện kiểm tra dữ liệu đầu vào qua DTO và chuyển giao xử lý cho Application Layer.

### 2. Tầng `application` (Điều Phối Nghiệp Vụ)
*   **Nhiệm vụ:** Chứa các Command, Query, CommandHandlers và QueryHandlers (áp dụng mô hình CQRS). Chịu trách nhiệm nạp Aggregate từ Repository, gọi logic nghiệp vụ và ghi nhận trạng thái mới.

### 3. Tầng `domain` (Trái Tim Nghiệp Vụ)
*   **Nhiệm vụ:** Chứa Aggregates, Entities, Value Objects, Domain Events và các Domain Services. Tầng này chứa đựng các luật nghiệp vụ cốt lõi và tuyệt đối **không phụ thuộc** vào cơ sở dữ liệu hay framework kỹ thuật.

### 4. Tầng `infrastructure` (Cài Đặt Công Nghệ)
*   **Nhiệm vụ:** Triển khai các interface được định nghĩa ở tầng Domain bằng các công nghệ thực tế (ví dụ: Prisma Repositories kết nối PostgreSQL, Redis adapter, BullMQ workers).

---

## 🔒 4. Ranh Giới Đóng Gói API Công Khai (Public API Boundaries)

Mỗi thư viện con trong Nx Monorepo bắt buộc phải có một tệp tin **`index.ts`** ở thư mục gốc `src/` đóng vai trò là **Public API / Barrel File**.

```text
               ┌──────────────────────────────┐
               │    THƯ VIỆN CON (Library)    │
               │  - internals (Private)       │
               │  - helpers                   │
               └──────────────┬───────────────┘
                              │ (Chỉ export những gì cần thiết)
                              ▼
               ┌──────────────────────────────┐
               │    barrel file: index.ts     │
               └──────────────┬───────────────┘
                              │
                              ▼
        [Ứng dụng ngoài import qua @spark-nest-ed/...]
```

> [!IMPORTANT]
> **Quy tắc vàng:** Chỉ xuất bản (`export`) những DTOs, Interfaces, Service classes, hoặc Component thực sự cần thiết cho các thư viện bên ngoài sử dụng thông qua `index.ts`. Toàn bộ cấu trúc cài đặt chi tiết bên trong (internals) phải được giấu kín để tránh làm lộ chi tiết thiết kế và tăng khớp nối (coupling) không đáng có giữa các module.

*   *Ví dụ tệp `index.ts` chuẩn:*
    ```typescript
    // export các DTOs công khai cho client sử dụng
    export * from './lib/dtos/create-vocabulary-set.dto';
    export * from './lib/dtos/vocabulary-set-response.dto';
    
    // export Use Cases chính của hệ thống
    export * from './lib/application/create-vocabulary-set.usecase';
    ```

---

## 🛠️ 5. Quy Chuẩn Sử Dụng Nx Generators

Để duy trì tính thống nhất tuyệt đối về mặt cấu trúc và chất lượng mã nguồn trên toàn monorepo, toàn bộ lập trình viên **cấm tạo tệp tin bằng tay** cho các cấu phần lớn. Bắt buộc phải sử dụng các lệnh sinh code tự động (**Nx Generators**):

*   **Tạo một thư viện con mới (NestJS Backend Library):**
    ```bash
    npx nx generate @nx/nest:library [library-name] --directory=packages/backend/domains/[domain-name]
    ```
*   **Tạo một React Component mới ở Frontend (kèm theo các tệp test tự động):**
    ```bash
    npx nx generate @nx/react:component [component-name] --project=frontend-shared --export
    ```

Việc sử dụng Generator đảm bảo các tệp cấu hình kiểm thử (`tsconfig`, `jest.config.ts`, `eslint`) luôn được thiết lập chính xác theo chuẩn dự án ngay từ đầu.
