# Project Guidelines

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking (configured in `tsconfig.json`).
- Prefer type inference when the type is obvious.
- Avoid the `any` type; use `unknown` when type is uncertain.

## Angular Best Practices (v21+)

- Always go for a Reactive pattern:
  - Prefer declarative code over imperative logic.
  - Use RxJS for asynchronous data streams and event handling.
  - Use Signals for synchronous state and derived data.
  - Avoid manual `subscribe()` calls; use the `async` pipe or `effect`/`computed` as appropriate.
  - Keep state transformations pure and predictable.
- Use PrimeNG components and classes.
- Always use standalone components over NgModules.
- **Important:** Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management.
- Implement lazy loading for feature routes.
- Use `withComponentInputBinding()` for route parameters.
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead.
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images).

## Components & Templates

- Keep components small and focused on a single responsibility.
- Use `input()` and `output()` functions instead of decorators.
- Use `computed()` for derived state.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator.
- Prefer inline templates and styles for components as configured in `angular.json`.
- Prefer Reactive forms instead of Template-driven ones.
- Keep templates simple and avoid complex logic.
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Do NOT use `ngClass`; use `[class]` bindings instead.
- Do NOT use `ngStyle`; use `[style]` bindings instead.
- Use the `async` pipe to handle observables in templates.
- Do not assume globals like (`new Date()`) are available in templates.
- Do not write arrow functions in templates (they are not supported).
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state.
- Use `computed()` for derived state.
- Keep state transformations pure and predictable.
- Do NOT use `mutate` on signals; use `update` or `set` instead.
- Use `untracked()` when accessing signals in effects if you don't want to create a dependency.

## Services

- Design services around a single responsibility.
- Use the `providedIn: 'root'` option for singleton services.
- Use the `inject()` function instead of constructor injection.

## Package Management (pnpm)

- Always use `pnpm`, never `npm`.
- For installing dependencies, use `pnpm add` / `pnpm add -D`.
- For running scripts, use `pnpm <script>` or `pnpm run <script>` when needed.
- For workspace commands, prefer `pnpm -r` and other pnpm workspace features.
- Do not suggest `npm install`, `npm run`, or `npx` unless explicitly requested.
- When generating documentation, commands, CI snippets, or setup instructions, always use pnpm equivalents.
- Never run `pnpm test` or `pnpm build` without `--watch=false` in CI/one-off environments.

## Testing & Formatting

- Use **Vitest** for unit tests (configured in `package.json`).
- Use **Prettier** for code formatting (printWidth: 100).

## PrimeNG CSS Color Variables

- **Color Palettes (50-950)**: Use `--p-[color]-[shade]` (e.g., `var(--p-primary-500)`, `var(--p-surface-200)`).
  - Colors: `primary`, `surface`, `blue`, `green`, `yellow`, `cyan`, `pink`, `indigo`, `teal`, `orange`, `bluegray`, `purple`, `red`, `gray`.
  - Shades: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`.
  - `surface` additionally has shade `0` (`var(--p-surface-0)`).
- **Semantic Variables**:
  - Main: `--p-primary-color`, `--p-primary-contrast-color`, `--p-text-color`, `--p-text-muted-color`.
  - Content: `--p-content-background`, `--p-content-color`, `--p-content-border-color`.
  - Overlay: `--p-mask-background`, `--p-overlay-select-background`, `--p-overlay-select-color`.
  - Forms: `--p-form-field-background`, `--p-form-field-color`, `--p-form-field-border-color`, `--p-form-field-focus-border-color`, `--p-form-field-invalid-border-color`.
  - Surfaces: `--p-surface-0` through `--p-surface-950`.
- **Feedback Colors**:
  - Info: `var(--p-blue-500)`
  - Success: `var(--p-green-500)`
  - Warning: `var(--p-orange-500)`
  - Error: `var(--p-red-500)`

## Accessibility (A11y) Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
