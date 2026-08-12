---
name: spark-nexus-engineering-standards
description: Use when writing, reviewing, or refactoring code in Spark Nexus Ed project. Enforces engineering standards from the Engineering Handbook: Security, Architecture (Clean Architecture/DIP), Observability, Data Consistency, SOLID, DRY/KISS/YAGNI, Code Quality rules, Frontend/Backend tech standards, Git workflow, and Code Review checklist.
---

# Spark Nexus Ed - Engineering Standards (Engineering Handbook)

This skill encodes the **mandatory engineering standards** from `docs/ENGINEERING_HANDBOOK.md`. Apply these rules when writing, reviewing, or refactoring code.

---

## PRIORITY MATRIX (THỨ TỰ ƯU TIÊN)

When facing technical decisions or trade-offs, apply this priority order (highest to lowest):

```
1. SECURITY        — Security & Information Safety
2. ARCHITECTURE    — Architecture & Boundaries
3. OBSERVABILITY   — Monitoring & Tracing
4. DATA CONSISTENCY — Data Consistency
5. SOLID           — Design Principles
6. DRY             — Don't Repeat Yourself
7. KISS            — Keep It Simple, Stupid
```

### Trade-off Decision Table

| Conflict | Resolution | Reason |
|:---------|:-----------|:-------|
| Security vs Performance | **Security wins** | A 1ms response that leaks PII is a complete failure. |
| Progress vs Architecture | **Architecture wins** | Hacking code to meet deadline creates crippling Technical Debt. |
| Performance vs Observability | **Observability wins** | Accept I/O overhead for detailed JSON logs to enable production tracing. |

---

## 1. SECURITY STANDARDS

**Supreme principle: Never trust the client.**

### 1.1 Secrets Management
- **NEVER** hardcode secrets (Private Keys, API Keys, DB Credentials, JWT Secret) in source code or commit to Git.
- **MUST** use `.env` files or centralized secret management (AWS Secrets Manager, HashiCorp Vault).
- `.env`, `.env.local` MUST be in `.gitignore`.

### 1.2 Data Protection (At-Rest & In-Transit)
- **Password hashing:** Use **Argon2id** (Memory cost 65536, Time cost 2, Parallelism 1) or **Bcrypt** (salt_rounds >= 10).
- **PII encryption:** Sensitive learner data (phone, email) → **AES-256-GCM** when high security is required.
- **Transport security:** All API connections → **HTTPS** (TLS 1.3) + **HSTS** headers.

### 1.3 Authentication & Authorization
- JWT Access Token: `expiresIn <= 15m`.
- **Refresh Token Rotation:** Store in Secure Cookie: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`.
- All secured endpoints MUST be protected by `AuthGuard` + RBAC/ABAC.

### 1.4 Input Validation & Sanitization
- Validate ALL API parameters at Presentation layer using **class-validator** + strict `ValidationPipe`:
  ```typescript
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  ```
- **SQL Injection:** Use Prisma ORM (parameterized queries built-in).
- **XSS:** Sanitize user HTML input with `dompurify` or `sanitize-html` before storage/display.

### 1.5 Rate Limiting
- Public APIs: max 100 requests/minute per IP.
- Sensitive APIs (Login, Register, Forgot Password): max 5 requests/minute per IP.

---

## 2. ARCHITECTURE STANDARDS

**Software architecture is more important than Clean Code.**

### 2.1 Separation of Concerns (Clean Architecture)

```
PRESENTATION LAYER (Controllers / API Gateway / Entrypoints)
                           │
                           ▼  (Dependency Direction)
APPLICATION LAYER (Use Cases / Command & Query Handlers / DTOs)
                           │
                           ▼
DOMAIN LAYER (Core Business Logic / Aggregates / Entities / Value Objects)
                           ▲
                           │  (Dependency Inversion - DIP)
INFRASTRUCTURE LAYER (Prisma Repositories / BullMQ / Redis / External APIs)
```

- **Presentation:** Only handles HTTP/gRPC protocol, routing, DTO validation, JWT decoding.
- **Application:** Orchestrates workflow. Loads Aggregates from Repository, calls domain methods, saves state, triggers Events. **NO business logic or direct DB queries.**
- **Domain (Core):** Heart of the system. Contains Entities, Aggregates, Value Objects, Domain Events, Domain Services. **MUST NOT depend on any framework (no NestJS, Prisma, TypeORM imports).**
- **Infrastructure:** Implements concrete technology: Prisma Client, Redis Cache, BullMQ workers, external API connections.

### 2.2 Dependency Rules
- **Direction:** `Infrastructure` → `Application` → `Domain`.
- **Dependency Inversion (DIP):** All Domain-to-outer communication MUST go through Abstractions (Interfaces) defined in Domain Layer. Infrastructure provides implementations.

### 2.3 Monorepo Module Organization
- **Feature-based Organization:** Organize by business capability, NOT by technical type.
- **Module Boundaries:** Each module =独立 Nx Library, communicates via public `index.ts` barrel exports.
- **Anti-Corruption Layer (ACL):** All third-party integrations (payment gateways, external APIs) MUST go through an ACL to protect the Domain.

---

## 3. OBSERVABILITY & DATA CONSISTENCY

### 3.1 Observability
- **NEVER** use `console.log` on Production for debugging or logging sensitive data.
- **Structured JSON Logging** (for ElasticSearch/Loki):
  ```json
  { "timestamp": "...", "level": "...", "traceId": "...", "context": "...", "message": "...", "error": "..." }
  ```
- **Log Levels:**
  - `FATAL`: System down, core component unreachable. Trigger PagerDuty/Slack alert.
  - `ERROR`: Serious business error on a request but system continues (payment API failure, DB timeout).
  - `WARN`: Non-critical issues needing attention (wrong password, cache miss, slow API).
  - `INFO`: Normal system progression (start/stop app, successful business flow completion).
  - `DEBUG`/`TRACE`: Development/Staging only.
- **Correlation ID:** Every request MUST have `X-Correlation-ID` or `X-Trace-ID` in HTTP header, propagated through all logs across microservices/queues.
- **4 Golden Signals:** Latency, Traffic, Errors (5xx rate), Saturation (CPU/RAM/DB pool).

### 3.2 Data Consistency
- **Idempotency:** Write APIs for sensitive data (payment, progress changes) MUST use `idempotency-key` (Redis cache with short TTL).
- **DB Transactions (ACID):** Use Prisma `$transaction` for multi-table changes. **NEVER** nest slow I/O (external API calls, file writes) inside a DB transaction.
- **Eventual Consistency:** Cross-Bounded-Context communication → Domain Events.
- **Saga Pattern:** Complex multi-Aggregate workflows → Orchestrator with Compensating Transactions.

---

## 4. CORE DESIGN PRINCIPLES

### 4.1 SOLID
- **S (SRP):** One class/module/file = one reason to change. One function = one task.
- **O (OCP):** Open for extension, closed for modification. Use polymorphism (Strategy, Factory) for new features.
- **L (LSP):** Subtypes must be substitutable for their base types without breaking correctness.
- **I (ISP):** Split large interfaces into small, role-specific interfaces.
- **D (DIP):** High-level modules must NOT depend on low-level modules. Both depend on Abstractions.

### 4.2 DRY, KISS, YAGNI
- **DRY:** No duplicated business logic. **Warning:** Avoid wrong abstraction — duplicating code 2x is better than creating a wrong abstraction.
- **KISS:** Prefer simple, readable solutions. Correct + readable > clever + obscure.
- **YAGNI:** Don't build features, parameters, or infrastructure not needed NOW. Avoid over-engineering.

---

## 5. CODE QUALITY STANDARDS

### 5.1 Naming Conventions
- `camelCase`: Variables, properties, methods (`vocabularySetId`, `calculateInterval()`).
- `PascalCase`: Classes, Interfaces, Enums, Types, Components (`VocabularySetAggregate`, `LanguageVO`).
- `UPPER_CASE`: Static global constants (`SYNC_THRESHOLD`, `BATCH_SIZE`).
- **Boolean variables:** MUST start with question prefix: `isActive`, `hasPermission`, `isPublished`, `canEdit`, `shouldRedirect`.
- **No abbreviations:** Use `userRequest` (not `usrReq`), `vocabularySetId` (not `vocId`).

### 5.2 Function Rules
- **Max length:** 50 lines (excluding comments/blanks). If exceeded, split into helper functions.
- **Max parameters:** 3. If more, wrap into a single DTO or Parameter Object.
- **Side-effects:** Minimize hidden side-effects that mutate input parameters.
- **Defensive Programming:** Always validate input data. Use Guard Clauses / Return Early instead of nested `if-else`.

### 5.3 File Rules
- **Max length:** 400 lines per file.
- **No God Classes:** Don't create classes that handle everything.
- **No Circular Dependencies:** A imports B, B imports A is forbidden. Use Nx static analysis to detect.

### 5.4 Error Handling
- **Custom Exceptions:** Don't throw raw strings or generic `Error`. Define custom exceptions extending NestJS HTTP Exceptions (e.g., `VocabularySetNotFoundException`).
- **Never swallow errors:** Empty `catch(e) {}` blocks are forbidden. Always log or re-throw.

---

## 6. TECHNOLOGY-SPECIFIC STANDARDS

### 6.1 Frontend (React 19 / TypeScript)
- **Immutability:** Never mutate React state directly. Always create copies:
  ```typescript
  // WRONG
  state.items.push(newItem);
  // CORRECT
  setItems(prevItems => [...prevItems, newItem]);
  ```
- **Page-Container-Component Pattern:**
  - `pages/`: Router entry only. No logic, no `useState`.
  - `container/`: Manages state, fetches data via Custom Hooks, defines event handlers, maps data to Components.
  - `components/`: Dumb UI. Props only. No API calls, no React Query hooks.
- **Performance Optimization:**
  - Avoid defining auxiliary JSX functions inside render.
  - Use `useMemo`/`useCallback` for complex object/callback props to child components.
  - Large lists (1000+ items): Use Virtual Scroll / Infinite key, NOT full DOM render.

### 6.2 Backend (NestJS / Prisma)
- **Dependency Injection (DI):** Apply DI for all Services, Repositories, Handlers. Avoid global variables or `new` for business classes.
- **Layering:** `Controller (Presentation)` → `Command/Query Bus (Application)` → `Aggregate Root (Domain)` → `Repository (Infrastructure)`.
- **Data Separation:** Business Services MUST NOT depend on HTTP framework objects (no Express `Request`/`Response` in Services).

### 6.3 Performance & Resources
- **N+1 Query Prevention:** NEVER loop DB queries. Use Prisma `include`/`select` or DataLoader to batch queries.
- **Background Processing:** Heavy tasks (bulk imports, batch emails, statistics) → **BullMQ** (Redis-backed). Redis must use `noeviction` policy.
- **Caching (Redis):** Cache-Aside pattern for high-read, low-change data. MUST define TTL + Cache Invalidation strategy.

### 6.4 PostgreSQL & Prisma Schema Governance
- **Migrations:** NEVER manually edit committed SQL migration files. All schema changes → `prisma migrate dev`.
- **Indexing:** All frequently searched/sorted/filtered fields MUST have Index or Unique Composite Index.
- **Soft-deletes:** Don't permanently delete important records. Use `deletedAt: timestamp` column.

---

## 7. GIT & TEAMWORK WORKFLOW

### 7.1 Git Operations
- **NEVER** direct push to `main`, `master`, `develop`.
- All changes → **Pull Request** targeting `develop`.
- Branch naming: `feature/[name]`, `bugfix/[name]`, `hotfix/[name]`.

### 7.2 Conventional Commits
Format: `<type>(<scope>): <subject>`

| Type | Description |
|:-----|:------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation update |
| `style` | Code formatting (Prettier, linter) |
| `refactor` | Code restructuring without behavior change |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Config updates, package.json changes |

Example: `feat(vocabulary): integrate SM-2 algorithm for SRS spaced repetition`

### 7.3 PR Quality Gates
A PR may ONLY merge when:
1. CI reports **"Green (Passed)"** for all Unit Tests and Lint.
2. Reviewed and **Approved** by at least 1 authorized engineer.
3. SonarQube Quality Gates met: **Code Coverage >= 80%**, no Blocker/Critical smells.
4. Merge strategy: **Squash and Merge** (single clean commit on main).

---

## 8. CODE REVIEW CHECKLIST

Before merging, BOTH author and reviewer MUST answer:

| Category | Questions |
|:---------|:----------|
| **SECURITY** | - DTO validated thoroughly? / Sensitive data hardcoded or leaked in logs? |
| **SOLID** | - SRP violated? Class/Function does ONE thing? / Import direction correct? |
| **KISS** | - Logic simple, readable, understandable? / Can split into smaller functions? |
| **PERFORMANCE** | - N+1 DB query loops? / Heavy tasks pushed to BullMQ background queue? |
| **OBSERVABILITY** | - Structured logging with Trace ID at info/error levels? |
| **TEST** | - Unit tests cover error & success scenarios? / Coverage >= 80%? |

---

## QUICK REFERENCE: File Paths

| What | Path |
|:-----|:-----|
| Prisma Schema | `packages/backend/infrastructure/database/prisma/schema.prisma` |
| Engineering Handbook | `docs/ENGINEERING_HANDBOOK.md` |
| Backend Domain Modules | `packages/backend/domains/module-<name>/src/lib/` |
| Frontend Feature Packages | `packages/frontend/features/<name>/src/lib/` |
| Shared Types | `packages/shared/libs/src/` |
