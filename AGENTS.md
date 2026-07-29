# AGENTS.md - Spark Nexus Ed

English learning platform. Nx monorepo with NestJS backend and React frontend.

## Quick Start

```bash
npm ci
docker compose up -d redis          # Redis only; PostgreSQL must run separately
cp .env.example .env                 # Fill DATABASE_URL, AUTH0_*, REDIS_*

# Prisma (schema is NOT at root)
npx prisma generate --schema=packages/backend/infrastructure/database/prisma/schema.prisma
npx prisma migrate dev --schema=packages/backend/infrastructure/database/prisma/schema.prisma

# Dev servers (run in separate terminals)
npx nx serve api-sne                 # Backend at :3000, Swagger at /api/docs
npx nx dev frontend-sne              # Frontend at :4200
```

No global Nx CLI needed. Always use `npx nx` from repo root.

## Architecture

```
apps/
  api-sne/               NestJS composition root (port 3000)
  frontend-sne/          React + Vite SPA (port 4200)
  api-sne-e2e/           Backend E2E (Jest)
  frontend-sne-e2e/      Frontend E2E (Playwright)

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

Every domain module in `packages/backend/domains/module-<name>/src/lib/` has 4 layers:

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

Non-negotiable rules:
- Domain layer must NOT depend on NestJS, Prisma, or transport protocols.
- Never return entities directly. Always return Response DTOs via Mapper.
- Validate DTOs with `class-validator` decorators.
- Define `static fromDto()` factory on Command/Query classes.
- Commands/queries must validate in constructor (throw early).

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

All routes are lazy-loaded via dynamic `import()` in `apps/frontend-sne/src/app/routes/router.tsx`.

## Import Rules

Use package names, never relative paths across packages:

```typescript
import { VocabularyModule } from '@spark-nest-ed/module-vocabulary';
import { useApiQueryBasic } from '@spark-nest-ed/frontend-core-api';
import { authGuardLoader } from '@spark-nest-ed/frontend-core-auth';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
```

Resolution works via `customConditions: ["@spark-nest-ed/source"]` in tsconfig.base.json, which maps package names to `./src/index.ts` during development.

Key package names:
- Backend domains: `@spark-nest-ed/module-vocabulary`, `@spark-nest-ed/module-grammar`, etc.
- Backend infra: `@spark-nest-ed/infrastructure-auth`, `@spark-nest-ed/infrastructure-database`
- Frontend core: `@spark-nest-ed/frontend-core-api`, `@spark-nest-ed/frontend-core-auth`, `@spark-nest-ed/frontend-core-constants`
- Frontend features: `@spark-nest-ed/feature-vocabulary`, `@spark-nest-ed/feature-grammar`, etc.
- Shared: `@spark-nest-ed/shared-libs`, `@spark-nest-ed/frontend-shared-components`

## Testing

Three test runners, split by layer:

| Layer | Runner | Command |
|-------|--------|---------|
| Backend unit/integration | Jest | `npx nx test <project>` |
| Frontend unit | Vitest | `npx nx vitest:test <project>` |
| E2E backend | Jest | `npx nx e2e api-sne-e2e` |
| E2E frontend | Playwright | `npx nx e2e frontend-sne-e2e` |

```bash
# All quality gates
npx nx run-many -t lint typecheck test build

# Only affected projects
npx nx affected -t lint typecheck test build

# Single project
npx nx test module-vocabulary
npx nx lint frontend-sne

# Format
npx nx format:write
```

Test target depends on `^build` (upstream packages must build first).

Prisma-specific test targets (from infrastructure-database):
```bash
npx nx prisma-generate infrastructure-database
npx nx prisma-migrate infrastructure-database
npx nx prisma-studio infrastructure-database
```

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
2. `authGuardLoader` on protected routes checks `auth0.isAuthenticated()`
3. `roleGuardLoader(['admin'])` and `permissionGuardLoader('users:manage')` for admin routes
4. Token acquired via `auth0.getTokenSilently()` and injected into Axios via interceptor

**Backend (Passport JWT + Auth0 JWKS):**
1. `JwtAuthGuard` validates JWT against Auth0 JWKS endpoint
2. `PermissionsGuard` checks RBAC permissions from Auth0 custom claims
3. `AbilitiesGuard` checks ABAC resource ownership
4. `@CurrentUser()` decorator extracts user from request

## API Format

All responses follow JSON:API specification:
```json
{ "data": { "id": "...", "type": "...", "attributes": {...} } }
```

URI versioning: `/api/v1/...`
Swagger docs: `http://localhost:3000/api/docs` (dev only)

## Common Pitfalls

1. **Prisma schema path**: `packages/backend/infrastructure/database/prisma/schema.prisma` (NOT at root)
2. **docker-compose.yml**: Only provides Redis. PostgreSQL must run separately.
3. **`frontend/core/store`**: Package exists but is currently empty. Redux Toolkit is in dependencies but not wired up.
4. **`module-reading`**: Not fully implemented yet. Does not follow complete DDD layering.
5. **Placeholder routes**: Many frontend routes (`/speaking`, `/writing`, `/games`, etc.) are placeholder pages, not real features.
6. **Test command**: Frontend uses `vitest:test` target (not `test`) in some packages. Check `nx.json` plugin config.
7. **CI runs `nx affected`**: Only tests/lints/builds projects changed since `main` branch.
8. **Prettier config**: `singleQuote: true` only. No other overrides.
9. **ESLint module boundaries**: Enforced via `@nx/enforce-module-boundaries`. Must respect package tags (`backend`, `frontend`, `shared`).
10. **Lazy loading imports**: Feature packages imported via barrel `index.ts`. Direct path imports needed for lazy-loaded bundles to avoid pulling in entire dependency tree.

## Creating New Packages

```powershell
# Frontend feature library
npx nx g @nx/react:library packages/frontend/features/<name> --directory=packages/frontend/features/<name> --style=css --linter=eslint --unitTestRunner=vitest --bundler=vite --importPath=@spark-nest-ed/feature-<name>

# Backend domain module
npx nx g @nx/js:library packages/backend/domains/module-<name> --directory=packages/backend/domains/module-<name> --linter=eslint --unitTestRunner=jest --importPath=@spark-nest-ed/module-<name>
```

## Key References

- `docs/SYSTEM_ARCHITECTURE_AND_SETUP.md` - Architecture and setup (start here)
- `docs/CONTRIBUTING.md` - Contribution guidelines, git conventions
- `docs/TESTING_GUIDE.md` - Testing strategy and examples
- `docs/AI_AGENT_AND_BA_PROJECT_CONTEXT.md` - Project context for AI agents
- `docs/README.md` - Full documentation map (11 sections, 42 guides)
- `.cursorrules` - Existing AI agent instructions (detailed, verify against codebase)
- `.env.example` - All environment variables with descriptions

## Git Conventions

- Conventional commits: `feat(vocabulary): ...`, `fix(database): ...`
- Branch naming: `feature/SNE-<task>-<desc>`, `bugfix/SNE-<task>-<desc>`
- PR target: `develop` branch
- Merge strategy: Squash and Merge
- Default base branch: `main` (configured in nx.json)
