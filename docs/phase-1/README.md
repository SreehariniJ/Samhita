# Phase 1 Architecture Design

This package defines the production architecture for a private-intranet, self-hosted, multimodal enterprise assistant. It intentionally stops at design artifacts for Phase 1 and does not generate frontend, backend, RAG, OCR, graph, or deployment implementation code.

## Scope

- System architecture for a ChatGPT-class private assistant.
- Service boundaries for frontend, backend, retrieval, ingestion, document intelligence, graph intelligence, observability, and model-serving integration.
- Folder structure for the complete repository that later phases will populate.
- MongoDB, Qdrant, and Neo4j schemas with indexes and retention behavior.
- API specifications for authentication, conversations, streaming chat, uploads, ingestion, search, citations, settings, admin, health, metrics, and model status.

## Runtime Assumptions

- Runtime platform: Linux VM inside a private intranet.
- External network dependency during operation: none.
- Model serving: LM Studio exposing OpenAI-compatible HTTP endpoints on the intranet host.
- GPU: single NVIDIA A40 48 GB.
- Primary text model: Qwen3 32B Instruct, quantized.
- Vision model: Qwen2.5-VL.
- Embedding model: BGE-M3.
- Frontend stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui.
- Backend stack: FastAPI, Python.
- Storage: MongoDB, Qdrant, Neo4j.
- Document intelligence: Docling, LlamaIndex, PaddleOCR.

## Files

- [system-architecture.md](./system-architecture.md): end-to-end architecture, trust boundaries, local inference flow, RAG flow, multimodal flow, observability, and production constraints.
- [folder-structure.md](./folder-structure.md): repository layout for all future phases.
- [database-schemas.md](./database-schemas.md): MongoDB collections, Qdrant collections, Neo4j graph model, indexes, and data lifecycle.
- [service-boundaries.md](./service-boundaries.md): service responsibilities, ownership, interfaces, and failure behavior.
- [api-specification.md](./api-specification.md): API contract, streaming contract, request and response schemas, auth behavior, and error model.
- [openapi.yaml](./openapi.yaml): concrete OpenAPI 3.1 specification for the FastAPI backend surface.

## Phase Gate

Phase 1 is ready for review when these documents are accepted. Phase 2 should begin only after approval and should implement the complete ChatGPT-like UI against the API contract defined here.
