# Architecture

**Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query + MapLibre GL + Recharts + @xyflow/react
- Core API: Node.js + Express + TypeScript + Zod + pg (plain SQL migrations, no ORM)
- AI/Analytics API: Python 3.11 + FastAPI + psycopg + pgvector + numpy/pandas/scikit-learn + pydantic
- Database: PostgreSQL with PostGIS, pgvector, pg_trgm

**Monorepo Layout:**
```
/
├── frontend/     # React application
├── core-api/     # Node.js Express backend
├── ai-service/   # Python FastAPI service
├── db/           # SQL migrations and seed data
└── docs/         # Reference documentation
```

**Service Ports:**
- Frontend: `5173`
- Core API: `4000`
- AI Service: `8000`
- PostgreSQL: `5432`

**Request Flow:**
`Client` -> `Core API (Auth/RBAC)` -> `AI Service (Internal API Key)`

**Environment Variables:**
- `PORT`: Service port (4000 or 8000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for signing auth tokens
- `AI_SERVICE_URL`: Internal URL for the Python service
- `AI_SERVICE_KEY`: Internal API key for Core API to AI Service auth
- `EMBEDDING_PROVIDER`: `local` or `api` (Default: `local`)
- `EMBEDDING_DIM`: Embedding vector dimension (Default: `384`)
- `LLM_PROVIDER`: `api` or `extractive` (Default: `api`)
- `LLM_MODEL`: Name of the model to use (e.g., gemini-1.5-flash)
- `LLM_API_KEY`: API key for the LLM provider

**Provider Abstraction:**
- `EMBEDDING_PROVIDER`: Local default uses `BAAI/bge-small-en-v1.5` (384 dim). API option must output 384 dim.
- `LLM_PROVIDER`: Swappable API provider (Gemini default, can switch to OpenAI/Anthropic via env vars). Fallback to `extractive` (no-LLM) if no key or internet.
