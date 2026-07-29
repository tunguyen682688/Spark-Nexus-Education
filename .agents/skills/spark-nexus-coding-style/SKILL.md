---
name: spark-nexus-coding-style
description: Use when writing, reviewing, or refactoring code in Spark Nexus Ed project. Enforces MANDATORY 3-step workflow (Plan → Batch Edit → Build), DDD + CQRS backend rules, Container-Component frontend rules, import conventions, naming conventions, and project-specific constraints.
---

# Spark Nexus Ed - Coding Style Guide

## MANDATORY WORKFLOW (QUY TRÌNH BẮT BUỘC)

You are a professional AI Coding Agent. Your job: read requirements, analyze, write code, and verify.

### 🚨 SUPREME RULE (MUST OBEY)

**NEVER run any build, compile, or test command until ALL related files have been fully edited.** Building after every single file change breaks the system and wastes resources.

### 3-Step Process (Strict Enforcement)

#### STEP 1: PLANNING (LẬP KẾ HOẠCH)
- Analyze the requirement completely.
- List ALL files that need to be created or modified.
- Understand how these files depend on each other.

#### STEP 2: BATCH EDITING (CẬP NHẬT MÃ NGUỒN)
- Use `edit` or `write` tools to apply ALL code changes to ALL files listed in Step 1.
- ⚠️ DURING THIS STEP: **DO NOT** call any terminal/build commands. Focus ONLY on writing/editing files.

#### STEP 3: BUILD & VERIFY (BUILD VÀ XÁC THỰC)
- **ONLY AFTER** you are 100% certain all files have been written, run the build command (e.g. `npx nx run-many -t lint typecheck test build`).
- Read the error logs. If errors exist, return to Step 1 and re-analyze everything. Do NOT guess-fix.

**Violation of the "edit one file then build immediately" rule = EXECUTION FAILED.**

---

## Architecture Overview

Nx monorepo: NestJS backend + React frontend + TypeScript.

```
apps/
  api-sne/               NestJS (port 3000)
  frontend-sne/          React + Vite (port 4200)
packages/
  backend/
    domains/             6 DDD modules (vocabulary, grammar, reading, listening, certification, user)
    infrastructure/      8 libs (auth, database, cache, messaging, logging, monitoring, storage, exception-global)
  frontend/
    core/                4 libs (api, auth, constants, store)
    features/            5 feature libs (vocabulary, grammar, reading, listening, certification)
    shared/              5 libs (components, hooks, utils, pages, assets)
  shared/
    libs/                Cross-cutting types (DDD bases, query parameter system)
```

## Backend Rules (NestJS + DDD + CQRS)

Every domain module at `packages/backend/domains/module-<name>/src/lib/` has 4 layers:

```
presentation/controllers/   HTTP layer, DTOs, dispatches to bus
application/
  commands/                 Write operations (Command + Handler)
  querys/                   Read operations (Query + Handler)
  events/                   Domain event handlers
  dtos/                     Data transfer objects
domain/
  aggregates/               Aggregate roots (extend AggregateRoot<T>)
  entities/                 Domain entities (extend Entity<T>)
  value-objects/            Immutable value objects
  events/                   Domain event definitions
  repositories/             Repository interfaces (ports)
  services/                 Domain services
  sagas/                    Multi-step orchestration
infrastructure/
  repositories/             Prisma repository implementations
  cache/                    Redis caching
  processors/               BullMQ job processors
  orchestrators/            Infrastructure orchestration
```

### Non-Negotiable Backend Rules

1. Domain layer must NOT depend on NestJS, Prisma, or transport protocols.
2. Never return entities directly. Always return Response DTOs via Mapper.
3. Validate DTOs with `class-validator` decorators.
4. Define `static fromDto()` factory on Command/Query classes.
5. Commands/queries must validate in constructor (throw early).

## Frontend Rules (React + Container-Component)

Feature packages at `packages/frontend/features/<name>/src/lib/`:

| Directory | Role | Rules |
|-----------|------|-------|
| `pages/` | Route shells | Render only Container + layout. No business logic. |
| `container/` | Smart components | Fetch data (React Query), compute, pass props to dumb components. |
| `components/` | Dumb/presentation | Props only. No hooks, no router, no store access. |
| `hooks/` | React Query wrappers | e.g. `use-vocabulary-sets.ts` |
| `api/` | Axios HTTP calls | Feature-specific API functions only. |
| `services/` | Pure helpers | Stateless computation (stats, formatting). |
| `types/` | TypeScript types | `index.ts` barrel export. |

All routes lazy-loaded via dynamic `import()` in `apps/frontend-sne/src/app/routes/router.tsx`.

## Import Rules

**Use package names, never relative paths across packages:**

```typescript
import { VocabularyModule } from '@spark-nest-ed/module-vocabulary';
import { useApiQueryBasic } from '@spark-nest-ed/frontend-core-api';
import { authGuardLoader } from '@spark-nest-ed/frontend-core-auth';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
```

Key package names:
- Backend domains: `@spark-nest-ed/module-vocabulary`, `@spark-nest-ed/module-grammar`, etc.
- Backend infra: `@spark-nest-ed/infrastructure-auth`, `@spark-nest-ed/infrastructure-database`
- Frontend core: `@spark-nest-ed/frontend-core-api`, `@spark-nest-ed/frontend-core-auth`, `@spark-nest-ed/frontend-core-constants`
- Frontend features: `@spark-nest-ed/feature-vocabulary`, `@spark-nest-ed/feature-grammar`, etc.
- Shared: `@spark-nest-ed/shared-libs`, `@spark-nest-ed/frontend-shared-components`

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `*Page.tsx` | `FlashcardPracticePage.tsx` |
| Container | `*Container.tsx` | `FlashcardPracticeContainer.tsx` |
| Component | `PascalCase.tsx` | `PersonalPackageCard.tsx` |
| Hook | `use-*.ts` (kebab) | `use-vocabulary-sets.ts` |
| Service | `*.service.ts` | `vocabulary-stats.service.ts` |
| Backend DTO | `*.dto.ts` | `create-vocabulary-set.dto.ts` |
| Backend Command | `*.command.ts` | `create-vocabulary-set.command.ts` |
| Backend Query | `*.query.ts` | `get-user-vocabulary-sets.query.ts` |
| Backend Handler | `*.handler.ts` | `create-vocabulary-set.handler.ts` |
| Backend Entity | `*.entity.ts` | `vocabulary-set.entity.ts` |

## Auth Flow

**Frontend (Auth0 SPA SDK):**
1. `initializeAuth0()` at app startup (`apps/frontend-sne/src/main.tsx`)
2. `authGuardLoader` on protected routes
3. `roleGuardLoader(['admin'])` and `permissionGuardLoader('users:manage')` for admin routes
4. Token via `auth0.getTokenSilently()` injected into Axios via interceptor

**Backend (Passport JWT + Auth0 JWKS):**
1. `JwtAuthGuard` validates JWT against Auth0 JWKS
2. `PermissionsGuard` checks RBAC permissions from Auth0 custom claims
3. `AbilitiesGuard` checks ABAC resource ownership
4. `@CurrentUser()` decorator extracts user from request

## API Format

All responses follow JSON:API specification:
```json
{ "data": { "id": "...", "type": "...", "attributes": {...} } }
```

URI versioning: `/api/v1/...`

## Git Conventions

- Conventional commits: `feat(vocabulary): ...`, `fix(database): ...`
- Branch naming: `feature/SNE-<task>-<desc>`, `bugfix/SNE-<task>-<desc>`
- PR target: `develop` branch
- Merge strategy: Squash and Merge

## Common Pitfalls

1. Prisma schema path: `packages/backend/infrastructure/database/prisma/schema.prisma` (NOT at root)
2. docker-compose.yml: Only provides Redis. PostgreSQL must run separately.
3. Frontend test command: `vitest:test` target (not `test`) in some packages.
4. Prettier config: `singleQuote: true` only.
5. ESLint module boundaries enforced via `@nx/enforce-module-boundaries`.
6. Lazy loading: Feature packages imported via barrel `index.ts`. Direct path imports for lazy-loaded bundles.

## Testing

| Layer | Runner | Command |
|-------|--------|---------|
| Backend unit/integration | Jest | `npx nx test <project>` |
| Frontend unit | Vitest | `npx nx vitest:test <project>` |
| E2E backend | Jest | `npx nx e2e api-sne-e2e` |
| E2E frontend | Playwright | `npx nx e2e frontend-sne-e2e` |

```bash
npx nx run-many -t lint typecheck test build
npx nx affected -t lint typecheck test build
npx nx format:write
```

## Creating New Packages

```powershell
# Frontend feature library
npx nx g @nx/react:library packages/frontend/features/<name> --directory=packages/frontend/features/<name> --style=css --linter=eslint --unitTestRunner=vitest --bundler=vite --importPath=@spark-nest-ed/feature-<name>

# Backend domain module
npx nx g @nx/js:library packages/backend/domains/module-<name> --directory=packages/backend/domains/module-<name> --linter=eslint --unitTestRunner=jest --importPath=@spark-nest-ed/module-<name>
```
