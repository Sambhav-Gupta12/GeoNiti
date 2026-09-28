# BhuNiti - Project Brief

**Purpose:** A National Digital Platform for Research, Policy Innovation and Evidence-Based Land Governance for the Ministry of Rural Development. It's a research, GIS, and decision-support platform (not a land-record portal).

**Core Modules:**
- Research Repository: Documents & datasets with metadata.
- AI Semantic Search: Embeddings, metadata filters, re-ranking.
- AI Research Assistant: RAG over approved documents with citations.
- GIS Intelligence: Interactive maps linked to evidence & datasets.
- Data Explorer: Datasets with provenance and versioning.
- Policy Analytics: Trends, anomaly flags, predefined natural-language analytics.
- Policy Scenario Sandbox: Scenario analysis (predictive, not causal) with baseline comparison.
- Collaboration Workspace: Save items to projects.
- Dashboards: Role-specific views.
- RBAC and APIs: Security and integration.
- Innovation Portal: Lightweight portal for hackathons and grants.

**User Roles:**
- Researcher & Policy Analyst (fully built journeys)
- Government Official, Data/System Admin, Public/Guest (RBAC views)

**AI Features:**
- Semantic search (embeddings + pgvector + filters).
- Evidence-grounded RAG (citations only, no hallucination from general knowledge).
- Metadata extraction from PDFs (human review required).
- Recommendations (embeddings + metadata).
- Natural-language analytics (mapped to whitelist of ops, no unrestricted text-to-SQL).
- Trend/anomaly detection.
- Scenario assistance (explains numeric model output).

**Scenario Rules:**
- Predictive analysis using RF/gradient boosting with lag features (no agent-based).
- Outputs labelled "scenario estimate".
- Always show assumptions, model card, and uncertainty.
- Never present results as guaranteed policy outcomes.

**Evidence Graph:**
- Lightweight knowledge graph: Policy -> Research Paper -> Dataset -> Region -> Indicator -> Observed Outcome.

**Demo Data Policy:**
- Demo region: Delhi-NCR districts.
- Seed data not from real public datasets MUST be flagged `is_illustrative=true` and labelled "Illustrative data".
- Never invent real authors, organisations, or official statistics. Real cited facts can be used.

**What We Never Claim:**
- No guaranteed policy outcomes.
- No unsupported AI facts.
- Policy outputs are "scenario estimates", research answers are "source-grounded summaries".
