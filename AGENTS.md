# AGENTS.md

For cross-repo AI policy, MCP tooling, and commit restrictions, read the parent `../AGENTS.md` first. This file covers frontend-specific conventions.

## Project Snapshot
- Angular 21 standalone app with route-level lazy loaded components and no NgModules (see `src/app/app.routes.ts`).
- Main UI stack is PrimeNG + Tailwind; app-wide layout utility lives in `.page-container` in `src/styles.scss`.
- Auth is Keycloak-driven (`keycloak-angular`, `keycloak-js`) and most features assume logged-in context.
- Backend is expected at `/api/*` and proxied to `http://localhost:8080` in dev via `proxy.conf.json`.

## Architecture and Data Flow
- Bootstrap path: `src/main.ts` -> `src/app/app.config.ts` -> `src/app/app.routes.ts`.
- `app.config` wires HTTP, Keycloak, PrimeNG theme preset, router input binding, and global PrimeNG services.
- HTTP bearer token injection is automatic for `/api/*` through `includeBearerTokenInterceptor` config in `src/app/app.config.ts`.
- Feature pages call thin domain services in `src/app/shared/services/*` (for example `ParticipantService`, `TeamService`, `UserService`).
- Components mostly keep local state in Angular signals and derive async state with `toSignal(...)` from RxJS streams.
- Role-gated team routes use `data: { roles: ['Jungschiteam'] }` + `authGuard` (`src/app/shared/guards/auth.guard.ts`).

## Routing and Guard Conventions
- Route params are passed as component inputs (`withComponentInputBinding()`), so detail pages use `id = input.required<string>()`.
- Nested participant detail subpages live under `/participants/:id/*` and are rendered through child routes.
- Unsaved-change protection is standardized via `pendingChangesGuard`; implement `isDirty()` on editable subpages.
- `authGuard` triggers Keycloak login redirect if unauthenticated, then returns to the originally requested URL.

## Component and Service Patterns
- Prefer standalone components with inline template/styles (`angular.json` schematics: `inlineTemplate`, `inlineStyle`, `style: scss`).
- Common async patterns in components:
  - Declarative loading with `toSignal(toObservable(input).pipe(...switchMap(...)))`.
  - Imperative one-shot calls with `firstValueFrom(...)` for actions and initial fetches.
- Services are API-contract focused and use relative URLs (example: `ParticipantService` maps `/api/participants/...`).
- Cached dictionary data pattern exists in `GlobalDefinitionsService` using `retry` + `shareReplay`.

## Build, Test, and Run Workflows
- Package manager is pnpm (`packageManager: pnpm@10.28.0` in `package.json`, Angular CLI configured for pnpm).
- Local dev: `pnpm start` (Angular dev server uses `development` config + proxy).
- Build: `pnpm build` (defaults to production per `angular.json` `defaultConfiguration`).
- Watch build: `pnpm watch`.
- Unit tests (Vitest via Angular test builder): `pnpm test` (watch) or `pnpm test:ci` (non-watch).
- Formatting: `pnpm format` (Prettier, single quotes, width 100).

## Integrations and Delivery Notes
- Keycloak env config is in `src/environments/environment.ts` and `src/environments/environment.prod.ts`.
- Service worker is enabled only outside dev mode (`src/main.ts`) and uses `ngsw-config.json`.
- Docker image is multi-stage: build with Node+pnpm, serve static files via unprivileged nginx on port 8080 (`Dockerfile`).
- PrimeNG theme customization is centralized in `src/app/app.config.ts` (`definePreset(Aura, ...)`).
- Available MCP context from the parent workspace includes `context7` for current Angular/PrimeNG/Tailwind docs and `playwright` for UI checks. Do not write MCP credentials or machine-local tool config into this submodule.

