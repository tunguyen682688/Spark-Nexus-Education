# Kiến trúc hệ thống và hướng dẫn setup

Tài liệu này là nguồn tham chiếu thực thi cho cấu trúc repository, luồng chạy
ứng dụng và thiết lập môi trường local của Spark Nexus Ed. Nội dung được đối
chiếu với mã nguồn và cấu hình workspace tại ngày 07/06/2026.

## 1. Tổng quan hệ thống

Spark Nexus Ed là một modular monolith được quản lý bằng Nx monorepo. Hai ứng
dụng triển khai chính dùng chung các thư viện theo domain và theo năng lực kỹ
thuật.

```text
Browser
  |
  | Auth0 OIDC/JWT
  v
React + Vite (frontend-sne, :4200)
  |
  | REST JSON + Bearer token
  v
NestJS API (api-sne, :3000/api/v1)
  |             |
  | Prisma      | BullMQ / cache
  v             v
PostgreSQL    Redis (:6379)
```

Các domain đang được nối vào backend:

- `module-vocabulary`: từ vựng, bộ từ, quiz, tiến độ và import nền.
- `module-grammar`: bài học, luyện tập, kỳ thi, SRS và cộng đồng ngữ pháp.
- `module-user`: hồ sơ người dùng đồng bộ từ Auth0.
- `module-reading`: mới được scaffold, chưa có đầy đủ các lớp nghiệp vụ.

Frontend có các feature library tương ứng cho Vocabulary, Grammar và Reading.
Nhiều route ngoài các feature này hiện vẫn là placeholder, không nên xem là
chức năng đã hoàn thành.

## 2. Cấu trúc repository

```text
.
|-- apps/
|   |-- api-sne/                 # NestJS composition root
|   |-- api-sne-e2e/             # E2E backend bằng Jest
|   |-- frontend-sne/            # React/Vite application shell
|   `-- frontend-sne-e2e/        # E2E frontend bằng Playwright
|-- packages/
|   |-- backend/
|   |   |-- domains/             # Bounded-context libraries
|   |   `-- infrastructure/      # Auth, DB, cache, logging...
|   |-- frontend/
|   |   |-- core/                # API, auth, constants, store
|   |   |-- features/            # Grammar, Reading, Vocabulary
|   |   `-- shared/              # UI, pages, hooks, assets, utils
|   `-- shared/libs/             # Primitive dùng chung, domain bases, query
|-- docs/                         # Governance và tài liệu kỹ thuật
|-- tools/                        # Migration/tooling nội bộ
|-- nx.json                       # Nx plugins, cache và target defaults
|-- package.json                  # npm workspaces và dependency catalog
`-- docker-compose.yml            # Redis local
```

### 2.1. Backend layering

Các domain trưởng thành dùng bốn lớp:

```text
presentation -> application -> domain
                      |
                      v
               infrastructure
```

- `presentation`: controller, guard và chuyển đổi giao thức HTTP.
- `application`: DTO, command/query, handler, mapper và orchestration.
- `domain`: entity, aggregate, value object, event và repository contract.
- `infrastructure`: Prisma repository, cache, queue và adapter bên ngoài.

Quy tắc phụ thuộc:

1. Domain không phụ thuộc NestJS, Prisma hoặc giao thức vận chuyển.
2. Presentation gọi use case qua application layer.
3. Infrastructure hiện thực contract do domain/application sở hữu.
4. App chỉ làm composition root, không chứa business logic.

`module-reading` hiện chưa tuân theo đầy đủ cấu trúc này vì mới chỉ có module
NestJS cơ bản.

### 2.2. Frontend layering

```text
frontend-sne app shell
  -> feature libraries
      -> core libraries
      -> shared libraries
```

- `core/api`: Axios client, retry và React Query client.
- `core/auth`: Auth0 client, provider và route guards.
- `core/constants`, `core/store`: hằng số và state dùng toàn ứng dụng.
- `features/*`: page, container, hook, service và API theo nghiệp vụ.
- `shared/*`: component tái sử dụng, asset, hook, page và utility.

App shell chịu trách nhiệm bootstrap Auth0, HTTP client, router và providers.
Feature nên được lazy-load từ router và chỉ export public API qua `src/index.ts`.

## 3. Luồng runtime

### 3.1. Frontend bootstrap

`apps/frontend-sne/src/main.tsx` thực hiện theo thứ tự:

1. Khởi tạo Auth0 SPA client.
2. Gắn token provider vào Axios client dùng chung.
3. Tạo React Router với auth/role/permission loaders.
4. Gắn Auth provider, Query client, tooltip và toaster.
5. Render ứng dụng.

Axios đọc base URL từ `VITE_REACT_APP_API_URL`. Giá trị này phải được đặt rõ
thành `http://localhost:3000/api/v1`; fallback trong mã nguồn hiện trỏ tới cổng
`4000` và không khớp backend.

### 3.2. Backend bootstrap

`apps/api-sne/src/main.ts` cấu hình:

- Global prefix `api`.
- URI versioning, mặc định `v1`.
- CORS theo môi trường.
- Global `ValidationPipe` với whitelist và transform.
- Swagger ở `/api/docs` khi không chạy production.
- Host mặc định `localhost`, port mặc định `3000`.

`AppModule` lắp Vocabulary, User, Grammar, Reading, Auth, Database và BullMQ.
JWT được xác minh bằng Auth0 JWKS; hồ sơ người dùng được upsert vào PostgreSQL
và trạng thái đồng bộ được cache trong Redis.

## 4. Yêu cầu môi trường

| Thành phần | Phiên bản/chính sách                            |
| ---------- | ----------------------------------------------- |
| Node.js    | 20 LTS, trùng với GitHub Actions                |
| npm        | Dùng phiên bản đi kèm Node 20                   |
| Nx         | 22.7.2, chạy qua `npx nx`                       |
| PostgreSQL | Tương thích Prisma 6.19                         |
| Redis      | Redis 7, `maxmemory-policy noeviction`          |
| Docker     | Docker Compose v2 nếu chạy Redis bằng container |

Không cài Nx toàn cục. `npx nx` dùng đúng phiên bản workspace và tránh sai
lệch giữa máy phát triển với CI.

## 5. Setup local chuẩn

### 5.1. Cài dependency

```bash
git clone https://github.com/tumolaha/Spark-Nexus-Ed.git
cd Spark-Nexus-Ed
npm ci
```

Dùng `npm ci` cho lần cài sạch và CI vì repository có `package-lock.json`.
Chỉ dùng `npm install` khi chủ động thay đổi dependency.

### 5.2. Tạo cấu hình môi trường

PowerShell:

```powershell
Copy-Item .env.example .env
```

Bash:

```bash
cp .env.example .env
```

Các biến bắt buộc để backend khởi động đầy đủ:

- `DATABASE_URL`, `DIRECT_URL`.
- `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`.
- `REDIS_HOST`, `REDIS_PORT`.

Các biến bắt buộc cho frontend authentication và API:

- `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`.
- `VITE_REACT_APP_API_URL=http://localhost:3000/api/v1`.

Không commit `.env`. Secret production phải được quản lý bằng secret manager
của môi trường triển khai, không lưu trong Git hoặc tài liệu.

### 5.3. Khởi động Redis

```bash
docker compose up -d redis
docker compose ps
docker compose exec redis redis-cli ping
```

Kết quả ping phải là `PONG`.

`docker-compose.yml` hiện không cung cấp PostgreSQL. Chọn một trong hai cách:

1. Chạy PostgreSQL local bằng công cụ riêng và cập nhật hai connection URL.
2. Dùng PostgreSQL development từ xa đã được cấp quyền.

Nếu dùng PostgreSQL local và có CLI `createdb`, tạo cả database chính và
database shadow được khai báo trong `.env.example`:

```bash
createdb -U postgres spark_nexus_ed
createdb -U postgres spark_nexus_ed_shadow
```

Tên `DIRECT_URL` trong repository hiện được gắn vào `shadowDatabaseUrl`; vì vậy
URL này phải trỏ tới database shadow riêng, không trỏ cùng database chính.

Không chạy `docker compose down -v` nếu chưa chấp nhận xóa dữ liệu Redis local.

### 5.4. Khởi tạo Prisma

```bash
npx prisma generate --schema=packages/backend/infrastructure/database/prisma/schema.prisma
npx prisma validate --schema=packages/backend/infrastructure/database/prisma/schema.prisma
npx prisma migrate dev --schema=packages/backend/infrastructure/database/prisma/schema.prisma
```

Seed khi thực sự cần dữ liệu mẫu:

```bash
npx prisma db seed --schema=packages/backend/infrastructure/database/prisma/schema.prisma
```

Không dùng `migrate dev` trong production. Pipeline production phải dùng:

```bash
npx prisma migrate deploy --schema=packages/backend/infrastructure/database/prisma/schema.prisma
```

### 5.5. Chạy ứng dụng

Terminal 1:

```bash
npx nx serve api-sne
```

Terminal 2:

```bash
npx nx dev frontend-sne
```

Kiểm tra:

```text
Frontend: http://localhost:4200
API root: http://localhost:3000/api/v1
Swagger:  http://localhost:3000/api/docs
```

Log bootstrap hiện quảng bá `/api/health`, nhưng repository chưa đăng ký health
controller. Không dùng endpoint này cho readiness/liveness cho đến khi được
triển khai.

## 6. Auth0 local

Auth0 SPA Application cần:

- Allowed Callback URLs: `http://localhost:4200/callback`
- Allowed Logout URLs: `http://localhost:4200`
- Allowed Web Origins: `http://localhost:4200`

Auth0 API cần Identifier trùng `AUTH0_AUDIENCE` và dùng signing algorithm
`RS256`. Backend xác minh issuer từ `AUTH0_DOMAIN`, audience và JWKS.

Frontend hiện khởi tạo redirect URI bằng `window.location.origin`; biến
`VITE_AUTH0_CALLBACK_URL` là biến dự phòng và chưa được đọc trong bootstrap.

## 7. Lệnh phát triển

```bash
# Danh sách project và dependency graph
npx nx show projects
npx nx graph

# Một project
npx nx lint module-grammar
npx nx typecheck module-grammar
npx nx test module-grammar
npx nx build module-grammar

# Toàn workspace
npx nx run-many -t lint
npx nx run-many -t typecheck
npx nx run-many -t test
npx nx run-many -t build

# Chỉ phần bị ảnh hưởng so với base branch
npx nx affected -t lint typecheck test build

# Đồng bộ TypeScript project references
npx nx sync
npx nx sync:check
```

Backend libraries dùng Jest. Frontend libraries/app dùng Vitest. Frontend E2E
dùng Playwright; backend E2E dùng Jest.

## 8. Quality gate trước Pull Request

Chạy tối thiểu:

```bash
npx nx sync:check
npx nx affected -t lint typecheck test build
npx nx format:check
```

Khi thay đổi migration:

```bash
npx prisma format --schema=packages/backend/infrastructure/database/prisma/schema.prisma
npx prisma validate --schema=packages/backend/infrastructure/database/prisma/schema.prisma
```

Pull Request phải:

- Không chứa `.env`, token, password hoặc connection string thật.
- Có test tương ứng với business rule hoặc regression đã sửa.
- Cập nhật public API (`src/index.ts`) khi thêm export dùng liên package.
- Cập nhật tài liệu nếu đổi route, env, migration hoặc boundary.
- Dùng Conventional Commits, ví dụ `feat(grammar): add lesson progress`.

CI hiện chạy Node 20 và:

```bash
npx nx affected -t lint test build typecheck
```

## 9. Quy chuẩn thêm module mới

Backend domain mới:

1. Tạo library dưới `packages/backend/domains/module-<name>`.
2. Tách `domain`, `application`, `infrastructure`, `presentation`.
3. Khai báo `nx.name`, tags và public API.
4. Chỉ import module tại `apps/api-sne/src/app/app.module.ts`.
5. Thêm migration, test và tài liệu domain.

Frontend feature mới:

1. Tạo library dưới `packages/frontend/features/<name>`.
2. Tách API, hooks, containers, components và pages theo nhu cầu thực.
3. Lazy-load feature từ app router.
4. Không truy cập trực tiếp implementation nội bộ của library khác.
5. Thêm loading, error, empty state và test.

Tags hiện có nhưng rule `@nx/enforce-module-boundaries` vẫn cho phép mọi tag
phụ thuộc mọi tag. Đây là metadata định hướng, chưa phải hàng rào kiến trúc.

## 10. Khoảng trống đã xác minh

Các điểm dưới đây cần được xử lý riêng, không nên che giấu bằng tài liệu:

1. Docker Compose thiếu PostgreSQL dù tài liệu cũ nói có.
2. `.env` hiện tại có thể thiếu `DIRECT_URL`, trong khi Prisma schema yêu cầu.
3. Fallback API URL của frontend dùng cổng `4000`, backend dùng `3000`.
4. Bootstrap log có health URL nhưng chưa có health endpoint.
5. `module-reading` và `feature-reading` đang ở mức scaffold.
6. Nhiều infrastructure library mới chỉ chứa module khung.
7. Nx boundary tags chưa có dependency constraints thực.
8. Tên thương hiệu còn lẫn `SparkNestEd`, `Spark Nexus Ed` và
   `EnglishReelNet` trong log/Swagger.
9. `npx nx sync:check` hiện báo `apps/api-sne/tsconfig.app.json` thiếu project
   reference tới `packages/backend/domains/module-reading/tsconfig.lib.json`.

Khi các điểm này được sửa trong code/config, tài liệu này phải được cập nhật
trong cùng Pull Request.

## 11. Troubleshooting

### Backend dừng ngay khi khởi động

Kiểm tra `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, PostgreSQL và `DIRECT_URL`. JWT
strategy chủ động throw nếu thiếu cấu hình Auth0.

### Frontend gọi nhầm cổng 4000

Đặt:

```env
VITE_REACT_APP_API_URL=http://localhost:3000/api/v1
```

Khởi động lại Vite sau khi đổi biến `VITE_*`.

### BullMQ hoặc import job lỗi

```bash
docker compose ps
docker compose exec redis redis-cli ping
docker compose exec redis redis-cli CONFIG GET maxmemory-policy
```

Policy phải là `noeviction`.

### Nx graph hoặc cache có biểu hiện bất thường

```bash
npx nx reset
npx nx sync
```

Không xóa thủ công file người khác đang sửa hoặc dùng `git reset --hard` để xử
lý lỗi cache.
