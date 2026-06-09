# 📘 Bản Đồ Tài Liệu Kỹ Thuật Spark-Nexus-Ed (Master Documentation Map)

> Tài liệu bắt đầu được khuyến nghị:
> [Kiến trúc hệ thống và hướng dẫn setup](SYSTEM_ARCHITECTURE_AND_SETUP.md).
> Tài liệu này được đối chiếu trực tiếp với cấu hình repository và ghi rõ các
> khoảng trống giữa hiện trạng triển khai với quy chuẩn định hướng.
>
> AI agent, BA, Product và QA nên đọc:
> [Ngữ cảnh dự án dành cho AI Agent và BA](AI_AGENT_AND_BA_PROJECT_CONTEXT.md)
> trước khi viết feature spec, tài liệu hoặc đề xuất thay đổi hệ thống.

Chào mừng bạn đến với Cổng thông tin tài liệu trung tâm (Master Index) của hệ sinh thái **Spark-Nexus-Ed** (stylized: `SparkNestEd` / `@spark-nest-ed`). 

Tài liệu này được cấu trúc theo tiêu chuẩn **Enterprise-Grade** nhằm quản lý và điều hướng toàn bộ 11 phân khu tri thức kỹ thuật với 42 cẩm nang chi tiết. Mọi kỹ sư khi tham gia phát triển dự án bắt buộc phải đọc kỹ các tài liệu tương ứng với vai trò của mình.

---

## 🗂️ Cấu Trúc Cây Thư Mục Tài Liệu Tiêu Chuẩn (Documentation Tree)

```text
docs/
├── README.md                                  # Bản đồ và mục lục tài liệu trung tâm (Tài liệu này)
│
├── 🚀 01-onboarding-culture/                  # Nhập cuộc & Văn hóa kỹ thuật
│   ├── 01-welcome-and-team-topologies.md      # Sơ đồ tổ chức Squads/Tribes & cách tương tác
│   ├── 02-access-provisioning-matrix.md      # Ma trận phân quyền tài khoản hệ thống (least privilege)
│   ├── 03-workstation-setup-guide.md          # Hướng dẫn thiết lập máy local (Docker, Nx, Prisma)
│   ├── 04-developer-30-60-90-plan.md          # Lộ trình 30-60-90 ngày hòa nhập cho kỹ sư mới
│   └── 05-engineering-values-ethics.md        # Văn hóa Code Review, ứng xử và đạo đức công nghệ
│
├── ⚖️ 02-global-engineering-laws/             # Bộ luật thép Clean Code & Nguyên tắc cốt lõi
│   ├── 01-production-priorities-matrix.md     # Ma trận ưu tiên tối thượng (Security > Architecture...)
│   ├── 02-clean-code-hard-limits.md           # Giới hạn cứng độ dài hàm (50 dòng), file (400 dòng), params (3)
│   ├── 03-naming-and-formatting-law.md        # Quy tắc đặt tên biến (Boolean, camelCase, PascalCase)
│   └── 04-clean-documentation-rules.md        # Cách viết comment chuẩn xác (Giải thích "Why" thay vì "What")
│
├── 🏗️ 03-workspace-governance-nx/             # Quản trị không gian làm việc Nx Monorepo
│   ├── 01-monorepo-layout-blueprint.md        # Cấu trúc apps, domains, feature, ui, data-access
│   └── 02-dependency-constraints-tags.md      # Ràng buộc ranh giới import (Infrastructure -> App -> Domain)
│
├── 🎯 04-domain-business-architecture/        # Thiết kế nghiệp vụ hướng miền (DDD Architecture)
│   ├── 01-ubiquitous-language-glossary.md     # Từ điển thuật ngữ nghiệp vụ đồng nhất (Vocabulary Set, Entry...)
│   ├── 02-bounded-contexts-mapping.md         # Bản đồ phân rã Bounded Contexts giữa các miền nghiệp vụ
│   ├── 03-feature-flag-governance.md          # Cơ chế quản lý Feature Flag (LaunchDarkly/GrowthBook)
│   └── 04-architecture-invariants.md          # Luật bất biến bảo vệ sự thuần khiết của Domain
│
├── 🔌 05-backend-architecture-standards/      # Tiêu chuẩn kỹ thuật Backend (NestJS, Prisma)
│   ├── 01-layered-architecture-di.md          # Clean Architecture 3 tầng, Dependency Injection
│   ├── 02-api-design-rest-graphql-grpc.md     # Thiết kế REST JSON:API & Microservices gRPC
│   ├── 03-database-replication-sharding.md    # Phân tách Read/Write Splitting & Prisma migrations
│   ├── 04-distributed-caching-redis.md        # Chiến lược Cache-Aside, TTL & Cache Invalidation
│   └── 06-resilience-circuit-breaker.md       # Cầu chì Circuit Breaker, Rate Limiting & Timeout
│
├── 🎨 06-frontend-architecture-standards/     # Tiêu chuẩn kỹ thuật Frontend (React, State)
│   ├── 01-application-shell-routing.md        # App Shell, Lazy loading module & Module Federation
│   ├── 02-immutability-state-laws.md          # Luật bất biến State & Tách biệt core logic (useController)
│   ├── 03-ui-rebuild-optimization.md          # Tối ưu hóa render, cấm hàm JSX trong Component render
│   ├── 04-rendering-dynamic-lists.md          # Cuộn danh sách siêu lớn (Virtual Scroll & Infinite key)
│   └── 05-magic-values-elimination.md         # Loại bỏ Magic Values, sử dụng Design Tokens
│
├── 🛡️ 07-data-integrity-error-handling/        # Nhất quán dữ liệu & Kiểm soát lỗi
│   ├── 01-functional-error-handling.md        # Cấm nuốt lỗi catch, áp dụng Result Object Pattern
│   ├── 02-stream-normalization-rules.md       # Quản trị luồng Event, WebSocket & Global filters
│   ├── 03-concurrency-and-data-race.md        # Kiểm soát ghi đè (Pessimistic vs Optimistic Locking)
│   └── 04-timezone-and-time-governance.md     # Luật lưu trữ UTC và hiển thị Local múi giờ tại Client
│
├── 🔐 08-security-compliance-matrix/          # Bảo mật, phân quyền & Tuân thủ pháp lý
│   ├── 01-identity-access-management.md       # Xác thực JWT OIDC Auth0 & Token Rotation Secure Cookie
│   ├── 02-data-privacy-log-masking.md         # Bảo vệ thông tin PII, tự động Log Masking
│   ├── 03-rbac-abac-authorization.md          # Phân quyền vai trò RBAC & Phân quyền sở hữu hạt mịn ABAC
│   └── 04-owasp-mitigation-playbook.md        # Cẩm nang chống XSS, SQLi, CSRF, BOLA theo OWASP
│
├── 🧪 09-testing-quality-gates/               # Chiến lược kiểm thử & Tiêu chuẩn chất lượng
│   ├── 01-testing-pyramid-strategy.md         # Kim tự tháp kiểm thử (Unit, Integration, E2E)
│   ├── 02-test-data-factory-mocking.md        # Tạo dữ liệu giả Test Factories, quy chuẩn Mocking
│   └── 03-sonarqube-quality-gates.md          # Trọng tài SonarQube, chặn merge PR dưới 80% coverage
│
├── ☁️ 10-devops-infrastructure-iac/           # Vận hành, hạ tầng & Triển khai GitOps
│   ├── 01-multi-environment-matrix.md         # Ma trận cấu hình Dev, Staging, UAT, Production
│   └── 02-gitops-argocd-deployment.md         # Hạ tầng Kubernetes, GitOps qua ArgoCD
│
└── 📈 11-sre-observability-runbooks/           # Runbooks giám sát & Phản ứng sự cố SRE
    ├── 01-logging-taxonomy-json.md            # Định dạng Structured JSON Log & Correlation ID
    ├── 02-metrics-prometheus-grafana.md       # Thu thập 4 tín hiệu vàng (Latency, Traffic, Errors, Saturation)
    ├── 03-distributed-tracing-jaeger.md       # Truy vết microservices phân tán bằng Jaeger Tracing
    └── 04-incident-response-playbook.md       # Quy trình phản ứng 4 bước và báo cáo sự cố (Post-mortem)
```

---

## 🗺️ Bản Đồ Tra Cứu Nhanh Theo Vai Trò (Quick Reference Guides)

### 🚀 1. Lập trình viên mới nhận việc (New Onboarders)
* Cài đặt máy local nhanh: Đọc ngay [Workstation Setup Guide](01-onboarding-culture/03-workstation-setup-guide.md).
* Hòa nhập văn hóa: Đọc [Engineering Values & Ethics](01-onboarding-culture/05-engineering-values-ethics.md) và [Developer 30-60-90 Plan](01-onboarding-culture/04-developer-30-60-90-plan.md).

### ⚙️ 2. Lập trình viên Backend & System Architect
* Nắm chắc quy chuẩn viết code: [Clean Code Hard Limits](02-global-engineering-laws/02-clean-code-hard-limits.md).
* Áp dụng Clean Architecture: Đọc [Layered Architecture & Dependency Injection](05-backend-architecture-standards/01-layered-architecture-di.md).
* Vận hành DB an toàn: Đọc [Database Replication & Sharding](05-backend-architecture-standards/03-database-replication-sharding.md).

### 💻 3. Lập trình viên Frontend (React Specialist)
* Tách biệt logic nghiệp vụ: Đọc [Immutability & State Management Laws](06-frontend-architecture-standards/02-immutability-state-laws.md).
* Tối ưu hóa UI mượt mà: Đọc [UI Rebuild & Component Optimization](06-frontend-architecture-standards/03-ui-rebuild-optimization.md) và [Virtual Scroll Law](06-frontend-architecture-standards/04-rendering-dynamic-lists.md).

### 🔒 4. Kỹ sư Bảo mật & DevOps
* Kiểm soát phân quyền: Đọc [Identity & Access Management (IAM)](08-security-compliance-matrix/01-identity-access-management.md) và [RBAC/ABAC Control](08-security-compliance-matrix/03-rbac-abac-authorization.md).
* Triển khai hạ tầng: Đọc [GitOps & ArgoCD Deployment](10-devops-infrastructure-iac/02-gitops-argocd-deployment.md).

---

## ✍️ Quy Tắc Cập Nhật Tài Liệu (Documentation Policy)

1. **API First / Design First**: Khi có tính năng mới hoặc thay đổi kiến trúc DB, bắt buộc phải cập nhật tài liệu tương ứng tại [Domain Architecture](04-domain-business-architecture/) hoặc [Backend Standards](05-backend-architecture-standards/) trước khi tiến hành viết code.
2. **Định dạng Markdown Chuẩn**: Toàn bộ tài liệu phải viết bằng markdown thuần, không sử dụng escaping backslash `\` trước dấu backtick ``` để đảm bảo hiển thị đúng cấu trúc code blocks trên GitHub/GitLab.
3. **Ngôn ngữ Thống Nhất**: Dùng tiếng Việt chuẩn hóa kết hợp thuật ngữ tiếng Anh gốc của các khái niệm thiết kế chuyên môn (ví dụ: *Aggregate Root*, *Memory Leak*, *Circuit Breaker*) để giữ tính chính xác kỹ thuật cao nhất.
