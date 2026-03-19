---
apply: always
---

# Package manager

- Always use `pnpm`, never `npm`.
- For installing dependencies, use `pnpm add` / `pnpm add -D`.
- For running scripts, use `pnpm <script>` or `pnpm run <script>` when needed.
- For workspace commands, prefer `pnpm -r` and other pnpm workspace features.
- Do not suggest `npm install`, `npm run`, or `npx` unless explicitly requested.
- When generating documentation, commands, CI snippets, or setup instructions, always use pnpm equivalents.
- never run `pnpm test` or `pnpm build` without `--watch=false`
