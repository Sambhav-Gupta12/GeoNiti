# Judge Q&A Guide

This document provides concise answers to anticipated questions from judges or technical reviewers, strictly based on the implemented features of GeoNiti.

### 1. Dataset Provenance
**Q: How do you ensure the datasets are reliable and their source is known?**
**A:** Every dataset and document in the platform is tagged with its provenance. We enforce a strict separation between "Sourced" (verified government/institutional data) and "Illustrative" (mock or seeded data for demonstration). The UI surfaces this via badges, so decision-makers always know the lineage of the data they are viewing.

### 2. RAG Hallucination Prevention
**Q: Large Language Models hallucinate. How can a government trust the Assistant's answers?**
**A:** We use a strict Retrieval-Augmented Generation (RAG) architecture. The LLM is forced to cite its sources from the secure repository using chunked vector search. If the context does not contain the answer, the system is prompted to state "I don't know" rather than guess. The UI reinforces this with "Grounded" badges and inline citation links that trace directly back to the original documents.

### 3. Trust in Simulation (Causal vs. Predictive)
**Q: How does the Scenario Sandbox predict the future? Is it causal or just drawing a line?**
**A:** The sandbox is a predictive simulation based on historical correlations, not a definitive causal model. It uses historical trend data to project a baseline, and applies the user's parameter adjustments to shift that projection. Crucially, we enforce trust through transparency:
1. Every projection includes an 80% uncertainty band.
2. A permanent caveat banner states: "Scenario estimate based on historical patterns... Not a guaranteed policy outcome."
3. Every modelled number is badged as "Modelled".

### 4. GIS Beyond Visualization
**Q: Maps are common. What makes your GIS Explorer different from a standard dashboard?**
**A:** Our GIS Explorer is a spatial entry point to the entire knowledge graph. Clicking a polygon doesn't just show a number; it queries the semantic backend to pull the exact research papers, policy documents, and datasets relevant to that specific geographic boundary. It acts as a spatial filter for unstructured data.

### 5. Conflicting Findings
**Q: What if two research papers in the database disagree?**
**A:** The Assistant and the Evidence Graph are designed to synthesize and present, not arbitrate. The RAG pipeline retrieves both viewpoints, and the LLM is prompted to summarize the debate, citing both sources. The Evidence Graph allows users to visually see nodes that might present opposing outcomes.

### 6. Protecting Restricted Data
**Q: Government data is highly sensitive. How do you prevent leaks?**
**A:** We implement strict Role-Based Access Control (RBAC). Documents and datasets are classified as Public, Internal, or Restricted. The semantic search and RAG pipelines inherently filter vector results based on the user's JWT role claims at the database level. Restricted items simply do not exist in the vector space queried by unauthorized users.

### 7. Difference from a Document Search Portal
**Q: Why not just use Elasticsearch or a standard portal?**
**A:** Standard portals rely on exact keyword matches and siloed data. GeoNiti uses semantic embeddings (understanding meaning, not just words) and connects unstructured text (policies) to structured data (datasets and GIS) through a unified graph structure and spatial keys.

### 8. Model Validation
**Q: How would you validate the models for a real-world deployment?**
**A:** For production, the semantic embeddings would be fine-tuned on domain-specific Indian legal and administrative corpora. The Scenario Sandbox would transition from statistical extrapolation to integrating with established econometric or system-dynamics models used by specific ministries (e.g., land-use transition matrices), validated against historical holdout data.
