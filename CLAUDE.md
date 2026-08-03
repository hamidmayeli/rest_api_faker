# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

`rest_api_faker` is a zero-configuration fake REST API server. Users point the CLI at a JSON (or JS/CJS/MJS) data file and get a full CRUD API with filtering, sorting, pagination, relationships, URL rewriting, and optional static file serving. It is a TypeScript reimplementation inspired by `json-server`, published to npm as `rest_api_faker`.

## Commands

```bash
pnpm install            # install dependencies (uses frozen lockfile in CI)
pnpm build              # compile TypeScript via tsconfig.build.json → dist/
pnpm dev                # compile + nodemon watch (uses local-test/db.json)
pnpm typecheck          # tsc --noEmit (no emit, just type checking)
pnpm lint               # eslint .
pnpm lint:fix           # eslint . --fix
pnpm format             # prettier --write
pnpm format:check       # prettier --check
pnpm test               # vitest (watch mode)
pnpm test:run           # vitest run (single pass, used in CI)
pnpm test:coverage      # vitest --coverage
```

Run a single test file:
```bash
pnpm vitest run src/query.test.ts
```

Run tests matching a name pattern:
```bash
pnpm vitest run -t "applyQuery"
```

## Architecture

All source lives in `src/` with co-located `*.test.ts` files. The compiled output goes to `dist/`. The CLI shim is `bin/rest_api_faker.js`.

### Module responsibilities

- **`cli.ts`** — Entry point. Parses CLI args (yargs), loads `rest_api_faker.json` config file, merges both (CLI wins), initialises `Database`, calls `createServer` + `startServer`, and optionally sets up chokidar file-watching with hot-reload.

- **`server.ts`** — `createServer(db, options)` composes the Express app in a fixed middleware order: CORS → gzip → JSON body parser → optional delay → request logger → custom middlewares → homepage → static files → URL rewriter → `/db` endpoint → API router → 404 handler.

- **`router.ts`** — `createRouter(db, options)` builds the Express Router with full CRUD. Handles both **collection** resources (arrays) and **singular** resources (objects). Nested routes (`GET /parent/:id/children`) are also supported. Query and relationship parameters are applied here.

- **`database.ts`** — `Database` class wrapping `lowdb`. Accepts `.json`, `.js`, `.mjs`, `.cjs` sources (JS sources may export objects or factory functions). Mutations are **in-memory only** during a run (`autoSave: false` in CLI mode). Key methods: `getCollection`, `getById`, `generateId`, `create`, `update`, `patch`, `delete`, `updateSingular`, `isCollection`.

- **`query.ts`** — Parses and applies query parameters: `_sort`, `_order`, `_page`, `_limit`, `_start`, `_end`, `q` (full-text search), operator suffixes (`_gte`, `_lte`, `_ne`, `_like`), and plain field filters. `generateLinkHeader` produces pagination Link headers.

- **`relationships.ts`** — Handles `_embed` (attach child array to parent) and `_expand` (attach parent object to child) using foreign key conventions.

- **`rewriter.ts`** — Loads a JSON rules file and produces Express middleware that rewrites `req.url` before routing. Rules are sorted by specificity (static > named params > wildcards). Supports `:param` and `*` patterns with substitution in targets.

- **`config.ts`** — Loads and validates `rest_api_faker.json`. Unknown keys trigger Levenshtein-distance suggestions. `mergeConfig(cli, file)` merges with CLI taking precedence.

- **`loader.ts`** — `loadModule` does dynamic import with CJS cache-busting for watch mode. `loadMiddlewares` normalises exports to `RequestHandler[]`.

- **`logger.ts`** — Coloured console output via `picocolors`. Log levels: `trace < debug < info` (default `info`).

- **`index.ts`** — Public programmatic API (`create`, `router`, `defaults`, `rewriter`). All methods currently throw `"Not implemented yet - coming in Phase 7"`.

### Data flow for a request

```
CLI args + config file
       ↓
  Database (lowdb)
       ↓
  createServer → Express app
       ↓
  URL rewriter middleware
       ↓
  createRouter
    ├── parseQuery / applyQuery
    └── parseRelationships / applyRelationships
```

## Code conventions

From the project's own coding standards:

- **Naming**: `camelCase` for variables/functions/files, `PascalCase` for classes/types, `UPPER_SNAKE_CASE` for constants.
- **TypeScript**: explicit return types on all functions; no `any` (use `unknown`); `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are enabled — be precise with optional/indexed access.
- **JSDoc**: required on all exported functions with `@param`, `@returns`, `@example`, and `@throws` where applicable.
- **Commits**: Conventional Commits — `type(scope): description` (types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`).
- **Tests**: Arrange-Act-Assert pattern; mock external dependencies.

## TypeScript strictness notes

The compiler is configured with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Array index access returns `T | undefined` — always handle the undefined case. Optional properties (`{ a?: string }`) are distinct from nullable ones (`{ a: string | undefined }`); don't conflate them.

## CI

CI runs on push/PR to `main` or `develop`, across ubuntu/windows/macos × Node 20/22. The gate is: `typecheck` → `lint` → `test:run` → `build`. All four must pass on all matrix combinations.

Release is triggered by `v*` tags. The publish channel is `latest` if the tag is on `main`'s ancestry, `alpha` otherwise.
