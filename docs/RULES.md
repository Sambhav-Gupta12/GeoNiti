# Standing Rules

1. Before any task, read `docs/PROGRESS.md`, then only the docs relevant to the task. Do not re-read the whole codebase.
2. After any task, update `docs/PROGRESS.md` and any doc whose facts changed (`API_CONTRACT.md`, `DB_SCHEMA.md`, `COMPONENTS.md`, `ARCHITECTURE.md`).
3. Keep replies short: files changed, how to run/verify, open issues. No long explanations.
4. TypeScript strict, no "any", no dead code, no `console.log` left behind, no hardcoded colours or secrets.
5. Do not refactor unrelated files. Do not add dependencies outside the approved stack without asking.
6. If something is ambiguous, choose the simplest sensible option and note it in `PROGRESS.md`.

## Workflow Rules
- **Commit Message Style:** Conventional commits (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
- **Branch Strategy:** Create a new branch per prompt (e.g., `b5-ai-core`).
- **Definition of Done:** 
  - Code runs and is verified.
  - Relevant docs are updated.
  - `PROGRESS.md` is ticked off.
