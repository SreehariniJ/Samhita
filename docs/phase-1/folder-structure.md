# Folder Structure

This repository layout is designed for a phased implementation. Phase 1 creates only architecture artifacts. Later phases should populate the directories exactly enough for the selected phase without introducing unrelated scaffolding.

```text
samhita-ai/
  README.md
  docs/
    phase-1/
      README.md
      system-architecture.md
      folder-structure.md
      database-schemas.md
      service-boundaries.md
      api-specification.md
      openapi.yaml
    phase-2-frontend/
    phase-3-backend/
    phase-4-rag/
    phase-5-ocr-vision/
    phase-6-knowledge-graph/
    phase-7-deployment/
  apps/
    web/
      app/
        (auth)/
        (chat)/
        api/
        globals.css
        layout.tsx
        page.tsx
      components/
        chat/
        sidebar/
        composer/
        markdown/
        citations/
        files/
        settings/
        admin/
        ui/
      hooks/
      lib/
        api/
        auth/
        markdown/
        streaming/
        files/
        telemetry/
      public/
      tests/
        e2e/
        unit/
      package.json
      tailwind.config.ts
      tsconfig.json
      next.config.ts
  services/
    backend/
      app/
        main.py
        core/
          config.py
          security.py
          logging.py
          rate_limits.py
          errors.py
        api/
          router.py
          deps.py
          v1/
            auth.py
            conversations.py
            chat.py
            files.py
            ingestion.py
            search.py
            citations.py
            settings.py
            admin.py
            health.py
            metrics.py
            models.py
        domain/
          auth/
          conversations/
          files/
          retrieval/
          ingestion/
          citations/
          settings/
          audit/
          observability/
        infrastructure/
          mongodb/
          qdrant/
          neo4j/
          lm_studio/
          filesystem/
          jobs/
          gpu/
        workers/
          ingestion_worker.py
          embedding_worker.py
          graph_worker.py
        schemas/
        tests/
          unit/
          integration/
          contract/
      pyproject.toml
      alembic-disabled.md
  packages/
    shared-contracts/
      openapi.yaml
      schemas/
      generated/
  infrastructure/
    docker/
      backend.Dockerfile
      frontend.Dockerfile
      gpu-exporter.Dockerfile
    compose/
      docker-compose.yml
      docker-compose.override.yml
    nginx/
      nginx.conf
    scripts/
      bootstrap-linux.sh
      check-local-network.sh
      backup.sh
      restore.sh
      rotate-logs.sh
  configs/
    models/
      lm-studio.models.yaml
    retrieval/
      hybrid-retrieval.yaml
    security/
      rbac.yaml
      retention.yaml
    observability/
      logging.yaml
      metrics.yaml
  storage/
    uploads/
      .gitkeep
    processed/
      .gitkeep
    exports/
      .gitkeep
  tests/
    smoke/
    load/
    security/
  tools/
    dev/
    admin/
    migration/
```

## Directory Responsibilities

### `apps/web`

Owns the full ChatGPT-like user interface:

- Left sidebar, new chat, chat history, and search chats.
- Streaming chat transcript.
- Markdown rendering and code highlighting.
- File, image, and PDF uploads.
- Citation drawer and source preview.
- User settings and admin surfaces.
- Responsive behavior for desktop and mobile.

The frontend talks only to the FastAPI backend. It never calls LM Studio, MongoDB, Qdrant, or Neo4j directly.

### `services/backend`

Owns all server-side application behavior:

- Authentication and authorization.
- Conversation and message persistence.
- Streaming chat orchestration.
- File upload registration and validation.
- Ingestion job management.
- RAG orchestration.
- Local model gateway for LM Studio.
- Citation construction.
- Audit logging.
- Health, model, metrics, and admin endpoints.

### `packages/shared-contracts`

Stores generated or copied API contracts consumed by both frontend and backend:

- OpenAPI specification.
- JSON schema definitions.
- Generated TypeScript API types in Phase 2.
- Backend request and response validation source in Phase 3.

### `infrastructure`

Owns production deployment assets:

- Dockerfiles.
- Docker Compose.
- Nginx or reverse-proxy configuration.
- Linux bootstrap scripts.
- Backup and restore scripts.
- Log rotation scripts.

### `configs`

Contains versioned local configuration:

- LM Studio model mapping.
- Retrieval weights and limits.
- RBAC policy.
- Retention policy.
- Logging and metrics configuration.

Secrets are not stored here. Phase 7 should use mounted secret files or Docker secrets.

### `storage`

Contains mounted local storage paths for uploaded files, processed artifacts, OCR output, exports, and backups. Production deployment should mount these directories to durable disks.

## Import and Dependency Rules

- `apps/web` may import generated contracts from `packages/shared-contracts`.
- `services/backend` may import backend-local domain and infrastructure modules.
- Domain modules must not import FastAPI route modules.
- Domain modules define business behavior and interfaces.
- Infrastructure modules implement MongoDB, Qdrant, Neo4j, LM Studio, filesystem, GPU, and job adapters.
- API routes depend on domain services through dependency providers.
- Workers reuse domain services and infrastructure adapters.

## Phase Population Rules

- Phase 2 populates `apps/web` and frontend test directories.
- Phase 3 populates `services/backend/app/core`, API routes, auth, conversations, files, settings, health, and tests.
- Phase 4 populates retrieval, embeddings, Qdrant integration, BM25, reranking, and citations.
- Phase 5 populates document processing, OCR, layout analysis, vision support, and multimodal tests.
- Phase 6 populates Neo4j graph extraction, graph retrieval, and graph tests.
- Phase 7 populates Docker, compose, scripts, operational docs, backups, metrics, and production hardening.
