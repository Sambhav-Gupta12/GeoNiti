# BhuNiti

## Running Locally

1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Start the infrastructure (Database, Core API, AI Service):
   ```bash
   docker compose up --build
   ```
3. Run linting:
   - Core API: `cd core-api && npm run lint`
   - AI Service: `cd ai-service && flake8 app/` (or run your preferred linter)
4. Run typechecking:
   - Core API: `cd core-api && npm run typecheck`
   - AI Service: `cd ai-service && mypy app/`
