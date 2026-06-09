# Spark Nexus Ed

Spark Nexus Ed là nền tảng học tiếng Anh được tổ chức dưới dạng Nx monorepo:

- Backend: NestJS, CQRS, Prisma, PostgreSQL, BullMQ và Redis.
- Frontend: React 19, Vite, React Router, TanStack Query và Auth0.
- Kiểm thử: Jest, Vitest và Playwright.
- Quản trị workspace: Nx 22 và npm workspaces.

## Bắt đầu nhanh

Yêu cầu tối thiểu:

- Node.js 20 LTS.
- npm đi kèm Node.js.
- PostgreSQL có thể truy cập từ máy local.
- Docker Desktop hoặc Redis được cài trực tiếp.
- Một Auth0 Application/API phù hợp với môi trường phát triển.

```bash
npm ci
docker compose up -d redis
```

Tạo `.env` từ `.env.example`, điền cấu hình PostgreSQL và Auth0, sau đó:

```bash
npx prisma generate --schema=packages/backend/infrastructure/database/prisma/schema.prisma
npx prisma migrate dev --schema=packages/backend/infrastructure/database/prisma/schema.prisma
npx nx serve api-sne
```

Mở terminal thứ hai:

```bash
npx nx dev frontend-sne
```

Các địa chỉ mặc định:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs` trong môi trường development
- Redis: `localhost:6379`

> `docker-compose.yml` hiện chỉ cung cấp Redis. PostgreSQL phải được chạy riêng
> hoặc dùng một database từ xa.

## Tài liệu chính

- [Ngữ cảnh dự án dành cho AI Agent và BA](docs/AI_AGENT_AND_BA_PROJECT_CONTEXT.md)
- [Kiến trúc hệ thống và hướng dẫn setup](docs/SYSTEM_ARCHITECTURE_AND_SETUP.md)
- [Bản đồ tài liệu kỹ thuật](docs/README.md)
- [Quy chuẩn đóng góp](docs/CONTRIBUTING.md)
- [Hướng dẫn kiểm thử](docs/TESTING_GUIDE.md)

## Lệnh thường dùng

```bash
# Khảo sát workspace
npx nx show projects
npx nx graph

# Chạy ứng dụng
npx nx serve api-sne
npx nx dev frontend-sne

# Quality gates
npx nx run-many -t lint typecheck test build
npx nx affected -t lint typecheck test build
npx nx sync:check
```

Mọi lệnh Nx nên chạy từ thư mục gốc của repository. Không cần cài Nx CLI
toàn cục; dùng `npx nx` để đảm bảo đúng phiên bản đã khóa trong workspace.
