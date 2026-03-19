---
apply: always
---

# Validation

- After making changes, run:
  - `pnpm test --watch=false`
  - `pnpm build --watch=false`
- Ensure both commands complete successfully before declaring the work done.
- Do not claim success if validation has not been run.
- If validation cannot be run, explicitly say so.
