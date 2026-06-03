# Service Boundaries

This document defines ownership and interfaces for the platform. The implementation should preserve these boundaries even when services initially run inside one FastAPI process.

## Boundary Principles

- The frontend owns presentation and browser interaction only.
- The backend owns security, orchestration, persistence, retrieval, model access, and auditability.
- Domain services expose stable interfaces independent of FastAPI route details.
- Infrastructure adapters isolate MongoDB, Qdrant, Neo4j, LM Studio, filesystem, GPU telemetry, and job execution.
- All model traffic flows through the backend `ModelGateway`.
- All data access applies workspace, role, owner, and sharing filters.

## Frontend Application

Responsibilities:

- Render ChatGPT-like shell with left sidebar, new chat, chat history, search chats, and responsive layout.
- Manage authenticated browser session state.
- Stream assistant responses from backend SSE endpoints.
- Render Markdown, code blocks, file chips, images, and citations.
- Upload files through backend endpoints.
- Show ingestion status, source previews, settings, and admin surfaces.

Interfaces:

- REST calls to `/api/v1/*`.
- SSE stream from `/api/v1/chat/completions/stream`.
- Cookie-based authentication.

Non-responsibilities:

- Direct model calls.
- Direct database calls.
- Retrieval ranking.
- Citation generation.
- Authorization decisions.

## FastAPI API Layer

Responsibilities:

- Authenticate and authorize requests.
- Validate request and response payloads.
- Attach correlation IDs.
- Enforce rate limits and CSRF checks.
- Translate HTTP requests into domain service calls.
- Stream model output events to the frontend.
- Convert domain exceptions into standardized API errors.

Interfaces:

- Public HTTP API defined in `api-specification.md` and `openapi.yaml`.
- Dependency providers for domain services and infrastructure adapters.

## Authentication Service

Responsibilities:

- Local account authentication.
- Argon2id password hashing and verification.
- Server-side session creation, rotation, revocation, and expiration.
- Secure cookie and CSRF token management.
- Role-based access evaluation.
- Audit events for login, logout, failed authentication, password changes, and admin account actions.

Dependencies:

- MongoDB `users`, `sessions`, `audit_events`.

Failure behavior:

- Failed authentication never reveals whether an email exists.
- Revoked or expired sessions produce `401`.
- Insufficient roles produce `403`.

## Conversation Service

Responsibilities:

- Create, rename, archive, pin, delete, restore, and search conversations.
- Store user and assistant messages.
- Track partial assistant responses during streaming.
- Attach files and citations to messages.
- Generate or update conversation titles through local model calls when enabled.

Dependencies:

- MongoDB `conversations`, `messages`, `citations`, `audit_events`.
- ModelGateway for optional title generation.

Failure behavior:

- Partial streaming failures persist assistant messages with `status: interrupted`.
- Unauthorized conversation access returns `404` to avoid leaking existence.

## Chat Orchestrator

Responsibilities:

- Decide chat mode: plain chat, retrieval-grounded chat, vision chat, or mixed multimodal chat.
- Build prompts from system policy, conversation context, user message, file references, and retrieved evidence.
- Coordinate retrieval, model streaming, persistence, citations, and audit events.
- Enforce per-user and global concurrency limits.

Dependencies:

- Conversation Service.
- Retrieval Service.
- Citation Service.
- ModelGateway.
- Audit Service.

Failure behavior:

- LM Studio unavailable: return explicit model availability error.
- Retrieval degraded: stream only if policy permits non-grounded response; otherwise return retrieval error.
- Client disconnect: cancel model request when supported and persist interrupted status.

## ModelGateway

Responsibilities:

- Encapsulate LM Studio OpenAI-compatible API calls.
- Resolve model profiles to concrete local model IDs.
- Support text chat completions, vision chat completions, streaming, embeddings, and constrained local scoring.
- Track model latency, token counts, first-token latency, and availability.
- Normalize LM Studio errors into backend domain errors.

Interfaces:

- `list_models()`
- `stream_chat_completion(request)`
- `create_chat_completion(request)`
- `create_embeddings(texts, model_profile)`
- `score_relevance(query, candidates, model_profile)`

Dependencies:

- LM Studio HTTP endpoint.
- System settings.
- Observability service.

Failure behavior:

- No fallback to external APIs.
- Unknown model IDs fail at startup or settings update time.
- Timeouts are surfaced with correlation IDs.

## File Service

Responsibilities:

- Validate file type, size, extension, and hash.
- Store files on local disk using deterministic paths.
- Create file metadata and access scope records.
- Start ingestion jobs.
- Serve authorized previews and downloads.

Dependencies:

- MongoDB `files`, `documents`, `ingestion_jobs`.
- Local filesystem storage.
- Ingestion Service.

Failure behavior:

- Unsupported file types return `415`.
- Oversized files return `413`.
- Duplicate file hashes reuse metadata only when owner and access policy allow it.

## Ingestion Service

Responsibilities:

- Detect document type and whether OCR is required.
- Parse PDFs, Office documents, and images.
- Convert scanned PDF pages to images.
- Produce layout-aware Markdown.
- Extract headings, tables, figures, captions, sections, and references.
- Chunk content for retrieval.
- Queue embedding and graph extraction work.
- Track resumable progress.

Dependencies:

- Docling.
- PaddleOCR.
- LlamaIndex utilities.
- ModelGateway for captions and extraction when appropriate.
- MongoDB `documents`, `chunks`, `ingestion_jobs`.
- Qdrant for vector upsert.
- Neo4j for graph upsert.
- Local processed-artifact storage.

Failure behavior:

- Stage failures record structured errors.
- Jobs can resume from completed checkpoints.
- Failed documents remain searchable only after chunks and ACL metadata are complete.

## Retrieval Service

Responsibilities:

- Embed user queries.
- Run dense search in Qdrant.
- Run BM25 and metadata search.
- Run graph expansion through Neo4j.
- Merge, deduplicate, normalize, rerank, and limit evidence.
- Apply access control filters before and after retrieval.
- Return citation-ready evidence packs.

Dependencies:

- ModelGateway embeddings.
- Qdrant.
- MongoDB `chunks`, `documents`, `files`.
- Neo4j.
- Citation Service.

Failure behavior:

- Missing vector collection produces system degradation status.
- Empty retrieval returns an empty evidence pack with an explicit reason.
- ACL filters are mandatory and cannot be disabled by request payloads.

## Citation Service

Responsibilities:

- Convert retrieved chunks into structured citations.
- Compute citation confidence from retrieval scores, reranking scores, graph support, and source quality.
- Ensure citation visibility matches user authorization.
- Persist citations for assistant messages.
- Provide source preview metadata for the UI.

Dependencies:

- MongoDB `citations`, `chunks`, `documents`, `files`.

Failure behavior:

- Unauthorized source previews return `404`.
- Citations with missing chunks are excluded and reported in retrieval diagnostics.

## Knowledge Graph Service

Responsibilities:

- Extract entities, concepts, topics, and relationships from chunks.
- Canonicalize entities across documents.
- Store graph nodes and relationships in Neo4j.
- Support graph-enhanced retrieval.
- Preserve evidence links from graph relationships to source chunks.

Dependencies:

- ModelGateway for local extraction.
- Neo4j.
- MongoDB chunks and documents.

Failure behavior:

- Graph extraction failure does not block dense and BM25 retrieval.
- Graph retrieval degradation is reported in model and storage status.

## Observability Service

Responsibilities:

- Expose health, readiness, and status data.
- Emit structured JSON logs.
- Collect request metrics, retrieval metrics, ingestion metrics, model metrics, storage metrics, and GPU metrics.
- Provide local admin status summaries.

Dependencies:

- MongoDB, Qdrant, Neo4j.
- LM Studio.
- NVIDIA tooling on Linux.

Failure behavior:

- Health checks distinguish liveness from readiness.
- Degraded dependencies are reported separately so admins can diagnose without exposing private content.

## Audit Service

Responsibilities:

- Record immutable security and data-access events.
- Redact user content from audit logs.
- Support admin filtering and export.
- Track diagnostic-mode activation when enabled.

Dependencies:

- MongoDB `audit_events`.

Failure behavior:

- Critical audit write failures block security-sensitive actions such as login, admin updates, file download, and role changes.
- Non-critical audit write failures for chat generation are retried asynchronously and surfaced in health status.
