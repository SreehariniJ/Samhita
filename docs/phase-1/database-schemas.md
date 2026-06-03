# Database Schemas

The platform uses MongoDB for application state, Qdrant for dense vector search, and Neo4j for graph-structured knowledge. All three stores enforce access control through metadata written at ingestion time and checked at query time.

## Identity Model

Stable IDs use UUIDv7 strings. File and content hashes use lowercase SHA-256 hex strings. Timestamps use UTC ISO 8601 strings.

Tenant support is included through `workspace_id` even if the first deployment has a single workspace. This avoids schema churn when enterprise teams, departments, or isolated collections are added.

## MongoDB Collections

### `users`

Stores local user accounts.

```json
{
  "_id": "usr_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "email": "sree@example.local",
  "display_name": "Sree Harini",
  "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$c2FtaGl0YWxvY2Fsc2FsdDEyMw$7WvB5V4RkCzWq1drn0pN8E2lYwJgXvQy8xAq2sH4m9M",
  "roles": ["user"],
  "status": "active",
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z",
  "last_login_at": "2026-06-03T00:00:00Z",
  "settings_id": "ust_01JZ0000000000000000000000"
}
```

Indexes:

- Unique compound index: `{ workspace_id: 1, email: 1 }`.
- Index: `{ workspace_id: 1, status: 1 }`.
- Index: `{ roles: 1 }`.

### `sessions`

Stores server-side sessions for secure cookie authentication.

```json
{
  "_id": "ses_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "user_id": "usr_01JZ0000000000000000000000",
  "session_hash": "2d711642b726b04401627ca9fb5a3f0b8e9f2e7d6f4c3b2a1908172635445566",
  "csrf_hash": "c6d9e2f1a8b7c4d3e0f9a6b5c2d1e8f7a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9",
  "ip_hash": "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7",
  "user_agent_hash": "1a2b3c4d5e6f7081928374655647382910abcdef1234567890fedcba09876543",
  "created_at": "2026-06-03T00:00:00Z",
  "expires_at": "2026-06-10T00:00:00Z",
  "revoked_at": null,
  "revocation_reason": null
}
```

Indexes:

- Unique index: `{ session_hash: 1 }`.
- TTL index: `{ expires_at: 1 }`.
- Index: `{ workspace_id: 1, user_id: 1, revoked_at: 1 }`.

### `user_settings`

Stores per-user preferences.

```json
{
  "_id": "ust_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "user_id": "usr_01JZ0000000000000000000000",
  "theme": "system",
  "default_model_profile": "reasoning",
  "streaming_enabled": true,
  "markdown_code_theme": "github-dark",
  "citation_display": "inline_and_drawer",
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z"
}
```

Indexes:

- Unique index: `{ workspace_id: 1, user_id: 1 }`.

### `conversations`

Stores chat metadata.

```json
{
  "_id": "cnv_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "owner_user_id": "usr_01JZ0000000000000000000000",
  "title": "Quarterly risk review",
  "visibility": "private",
  "shared_user_ids": [],
  "pinned": false,
  "archived": false,
  "deleted_at": null,
  "model_profile": "reasoning",
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z",
  "last_message_at": "2026-06-03T00:00:00Z",
  "message_count": 12
}
```

Indexes:

- Index: `{ workspace_id: 1, owner_user_id: 1, archived: 1, last_message_at: -1 }`.
- Text index: `{ title: "text" }`.
- Index: `{ workspace_id: 1, shared_user_ids: 1, last_message_at: -1 }`.
- Index: `{ deleted_at: 1 }`.

### `messages`

Stores chat messages and assistant generation metadata.

```json
{
  "_id": "msg_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "conversation_id": "cnv_01JZ0000000000000000000000",
  "user_id": "usr_01JZ0000000000000000000000",
  "role": "assistant",
  "content": [
    {
      "type": "markdown",
      "text": "The answer is grounded in the uploaded policy."
    }
  ],
  "status": "complete",
  "parent_message_id": "msg_01JYFFFFFFFFFFFFFFFFFFFFFF",
  "model_profile": "reasoning",
  "model_id": "qwen3-32b-instruct-quantized",
  "token_usage": {
    "prompt_tokens": 1850,
    "completion_tokens": 420,
    "total_tokens": 2270
  },
  "latency_ms": {
    "time_to_first_token": 720,
    "total": 6200
  },
  "citation_ids": ["cit_01JZ0000000000000000000000"],
  "file_ids": [],
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z"
}
```

Indexes:

- Index: `{ workspace_id: 1, conversation_id: 1, created_at: 1 }`.
- Index: `{ workspace_id: 1, user_id: 1, created_at: -1 }`.
- Text index: `{ "content.text": "text" }`.
- Index: `{ status: 1, updated_at: -1 }`.

### `files`

Stores uploaded file metadata and processing status.

```json
{
  "_id": "fil_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "owner_user_id": "usr_01JZ0000000000000000000000",
  "original_filename": "policy.pdf",
  "content_type": "application/pdf",
  "extension": "pdf",
  "size_bytes": 1849204,
  "sha256": "83d6e4f2a1c09b8e7d6c5b4a3928171605f4e3d2c1b0a9988776655443322110",
  "storage_path": "/var/lib/samhita/uploads/83/d6/fil_01JZ0000000000000000000000.pdf",
  "access_scope": {
    "visibility": "private",
    "shared_user_ids": [],
    "role_allowlist": []
  },
  "ingestion_status": "ready",
  "document_id": "doc_01JZ0000000000000000000000",
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z"
}
```

Indexes:

- Unique index: `{ workspace_id: 1, sha256: 1, owner_user_id: 1 }`.
- Index: `{ workspace_id: 1, owner_user_id: 1, created_at: -1 }`.
- Index: `{ workspace_id: 1, ingestion_status: 1, updated_at: -1 }`.

### `documents`

Stores parsed document-level metadata.

```json
{
  "_id": "doc_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "file_id": "fil_01JZ0000000000000000000000",
  "title": "Enterprise Security Policy",
  "document_type": "pdf",
  "page_count": 42,
  "has_text_layer": true,
  "ocr_required": false,
  "language": "en",
  "parser": {
    "name": "docling",
    "version": "2.0.0",
    "profile": "layout_markdown"
  },
  "access_scope": {
    "visibility": "private",
    "owner_user_id": "usr_01JZ0000000000000000000000",
    "shared_user_ids": [],
    "role_allowlist": []
  },
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z"
}
```

Indexes:

- Unique index: `{ workspace_id: 1, file_id: 1 }`.
- Text index: `{ title: "text" }`.
- Index: `{ workspace_id: 1, document_type: 1, created_at: -1 }`.
- Index: `{ "access_scope.owner_user_id": 1, workspace_id: 1 }`.

### `chunks`

Stores chunk text, layout metadata, sparse retrieval text, and Qdrant linkage.

```json
{
  "_id": "chk_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "document_id": "doc_01JZ0000000000000000000000",
  "file_id": "fil_01JZ0000000000000000000000",
  "chunk_index": 14,
  "content_type": "text",
  "text": "Access reviews are performed quarterly by system owners.",
  "normalized_text": "access reviews are performed quarterly by system owners",
  "section_path": ["Governance", "Access Reviews"],
  "page_start": 8,
  "page_end": 8,
  "bbox": {
    "page": 8,
    "x0": 72.0,
    "y0": 140.0,
    "x1": 520.0,
    "y1": 260.0
  },
  "table_id": null,
  "figure_id": null,
  "embedding": {
    "collection": "chunks_bge_m3_v1",
    "point_id": "chk_01JZ0000000000000000000000",
    "model": "bge-m3",
    "dimension": 1024,
    "created_at": "2026-06-03T00:00:00Z"
  },
  "access_scope": {
    "visibility": "private",
    "owner_user_id": "usr_01JZ0000000000000000000000",
    "shared_user_ids": [],
    "role_allowlist": []
  },
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z"
}
```

Indexes:

- Unique index: `{ workspace_id: 1, document_id: 1, chunk_index: 1 }`.
- Text index: `{ text: "text", normalized_text: "text" }`.
- Index: `{ workspace_id: 1, document_id: 1, page_start: 1 }`.
- Index: `{ workspace_id: 1, "access_scope.owner_user_id": 1 }`.
- Index: `{ workspace_id: 1, content_type: 1 }`.

### `citations`

Stores structured references attached to assistant messages.

```json
{
  "_id": "cit_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "message_id": "msg_01JZ0000000000000000000000",
  "conversation_id": "cnv_01JZ0000000000000000000000",
  "document_id": "doc_01JZ0000000000000000000000",
  "file_id": "fil_01JZ0000000000000000000000",
  "chunk_id": "chk_01JZ0000000000000000000000",
  "source_title": "Enterprise Security Policy",
  "page_start": 8,
  "page_end": 8,
  "section": "Governance > Access Reviews",
  "confidence": 0.87,
  "retrieval_methods": ["dense", "bm25", "graph"],
  "snippet": "Access reviews are performed quarterly by system owners.",
  "bbox": {
    "page": 8,
    "x0": 72.0,
    "y0": 140.0,
    "x1": 520.0,
    "y1": 260.0
  },
  "created_at": "2026-06-03T00:00:00Z"
}
```

Indexes:

- Index: `{ workspace_id: 1, message_id: 1 }`.
- Index: `{ workspace_id: 1, document_id: 1, page_start: 1 }`.
- Index: `{ workspace_id: 1, conversation_id: 1, created_at: 1 }`.

### `ingestion_jobs`

Tracks resumable ingestion.

```json
{
  "_id": "job_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "file_id": "fil_01JZ0000000000000000000000",
  "document_id": "doc_01JZ0000000000000000000000",
  "requested_by_user_id": "usr_01JZ0000000000000000000000",
  "status": "running",
  "stage": "embedding",
  "progress": {
    "current": 180,
    "total": 420,
    "unit": "chunks"
  },
  "attempts": 1,
  "error": null,
  "stage_checkpoints": {
    "validated": true,
    "parsed": true,
    "ocr_completed": true,
    "chunked": true,
    "embedded": false,
    "graph_extracted": false
  },
  "created_at": "2026-06-03T00:00:00Z",
  "updated_at": "2026-06-03T00:00:00Z",
  "completed_at": null
}
```

Indexes:

- Index: `{ workspace_id: 1, status: 1, updated_at: -1 }`.
- Index: `{ workspace_id: 1, file_id: 1 }`.
- Index: `{ status: 1, stage: 1 }`.

### `audit_events`

Stores immutable audit records.

```json
{
  "_id": "aud_01JZ0000000000000000000000",
  "workspace_id": "wsp_default",
  "actor_user_id": "usr_01JZ0000000000000000000000",
  "event_type": "chat.completion.created",
  "resource_type": "conversation",
  "resource_id": "cnv_01JZ0000000000000000000000",
  "ip_hash": "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7",
  "user_agent_hash": "1a2b3c4d5e6f7081928374655647382910abcdef1234567890fedcba09876543",
  "result": "success",
  "metadata": {
    "model_profile": "reasoning",
    "retrieval_used": true,
    "citation_count": 4
  },
  "created_at": "2026-06-03T00:00:00Z"
}
```

Indexes:

- Index: `{ workspace_id: 1, created_at: -1 }`.
- Index: `{ workspace_id: 1, actor_user_id: 1, created_at: -1 }`.
- Index: `{ workspace_id: 1, event_type: 1, created_at: -1 }`.
- Index: `{ resource_type: 1, resource_id: 1 }`.

### `system_settings`

Stores local runtime settings visible to admins.

```json
{
  "_id": "sys_default",
  "workspace_id": "wsp_default",
  "model_profiles": {
    "reasoning": {
      "chat_model": "qwen3-32b-instruct-quantized",
      "vision_model": "qwen2.5-vl",
      "embedding_model": "bge-m3",
      "temperature": 0.2,
      "max_output_tokens": 4096,
      "context_window_tokens": 32768
    }
  },
  "retrieval": {
    "dense_top_k": 40,
    "bm25_top_k": 40,
    "graph_top_k": 20,
    "rerank_top_k": 12,
    "citation_min_confidence": 0.45
  },
  "uploads": {
    "max_file_size_mb": 512,
    "allowed_extensions": ["pdf", "png", "jpg", "jpeg", "docx", "pptx", "xlsx"]
  },
  "updated_at": "2026-06-03T00:00:00Z",
  "updated_by_user_id": "usr_admin"
}
```

Indexes:

- Unique index: `{ workspace_id: 1 }`.

## Qdrant Collections

### `chunks_bge_m3_v1`

Stores dense embeddings for text chunks, OCR chunks, tables serialized to Markdown, image captions, and diagram descriptions.

Vector configuration:

- Distance: cosine.
- Vector size: determined by the deployed BGE-M3 embedding endpoint.
- Named vector: `text`.
- Payload indexes for filtering.

Point ID:

- Same as MongoDB chunk ID.

Payload:

```json
{
  "workspace_id": "wsp_default",
  "document_id": "doc_01JZ0000000000000000000000",
  "file_id": "fil_01JZ0000000000000000000000",
  "chunk_id": "chk_01JZ0000000000000000000000",
  "owner_user_id": "usr_01JZ0000000000000000000000",
  "visibility": "private",
  "shared_user_ids": [],
  "role_allowlist": [],
  "document_type": "pdf",
  "content_type": "text",
  "section_path": ["Governance", "Access Reviews"],
  "page_start": 8,
  "page_end": 8,
  "created_at": "2026-06-03T00:00:00Z",
  "embedding_model": "bge-m3",
  "embedding_version": "v1"
}
```

Payload indexes:

- `workspace_id`
- `document_id`
- `file_id`
- `owner_user_id`
- `visibility`
- `shared_user_ids`
- `role_allowlist`
- `document_type`
- `content_type`
- `page_start`
- `embedding_model`

ACL filter:

```json
{
  "must": [
    { "key": "workspace_id", "match": { "value": "wsp_default" } }
  ],
  "should": [
    { "key": "owner_user_id", "match": { "value": "usr_current" } },
    { "key": "visibility", "match": { "value": "workspace" } },
    { "key": "shared_user_ids", "match": { "value": "usr_current" } },
    { "key": "role_allowlist", "match": { "any": ["admin", "power_user"] } }
  ]
}
```

## Neo4j Graph Model

### Node Labels

`Workspace`

- `workspace_id`
- `name`

`Document`

- `document_id`
- `workspace_id`
- `file_id`
- `title`
- `document_type`
- `created_at`

`Section`

- `section_id`
- `workspace_id`
- `document_id`
- `title`
- `section_path`
- `page_start`
- `page_end`

`Chunk`

- `chunk_id`
- `workspace_id`
- `document_id`
- `page_start`
- `page_end`
- `content_type`

`Entity`

- `entity_id`
- `workspace_id`
- `canonical_name`
- `entity_type`
- `aliases`
- `confidence`

`Concept`

- `concept_id`
- `workspace_id`
- `name`
- `description`
- `confidence`

`Topic`

- `topic_id`
- `workspace_id`
- `name`

### Relationships

- `(Workspace)-[:CONTAINS_DOCUMENT]->(Document)`
- `(Document)-[:HAS_SECTION]->(Section)`
- `(Section)-[:HAS_CHUNK]->(Chunk)`
- `(Document)-[:HAS_CHUNK]->(Chunk)`
- `(Chunk)-[:MENTIONS {confidence, evidence_text}]->(Entity)`
- `(Chunk)-[:EXPRESSES {confidence}]->(Concept)`
- `(Document)-[:COVERS_TOPIC {confidence}]->(Topic)`
- `(Entity)-[:RELATED_TO {relationship_type, confidence, evidence_chunk_id}]->(Entity)`
- `(Entity)-[:INSTANCE_OF {confidence}]->(Concept)`
- `(Concept)-[:RELATED_TO {relationship_type, confidence}]->(Concept)`

### Neo4j Constraints

```cypher
CREATE CONSTRAINT workspace_id_unique IF NOT EXISTS
FOR (n:Workspace) REQUIRE n.workspace_id IS UNIQUE;

CREATE CONSTRAINT document_id_unique IF NOT EXISTS
FOR (n:Document) REQUIRE n.document_id IS UNIQUE;

CREATE CONSTRAINT section_id_unique IF NOT EXISTS
FOR (n:Section) REQUIRE n.section_id IS UNIQUE;

CREATE CONSTRAINT chunk_id_unique IF NOT EXISTS
FOR (n:Chunk) REQUIRE n.chunk_id IS UNIQUE;

CREATE CONSTRAINT entity_id_unique IF NOT EXISTS
FOR (n:Entity) REQUIRE n.entity_id IS UNIQUE;

CREATE CONSTRAINT concept_id_unique IF NOT EXISTS
FOR (n:Concept) REQUIRE n.concept_id IS UNIQUE;

CREATE CONSTRAINT topic_id_unique IF NOT EXISTS
FOR (n:Topic) REQUIRE n.topic_id IS UNIQUE;
```

### Neo4j Indexes

```cypher
CREATE INDEX entity_lookup IF NOT EXISTS
FOR (n:Entity) ON (n.workspace_id, n.canonical_name, n.entity_type);

CREATE INDEX concept_lookup IF NOT EXISTS
FOR (n:Concept) ON (n.workspace_id, n.name);

CREATE INDEX topic_lookup IF NOT EXISTS
FOR (n:Topic) ON (n.workspace_id, n.name);

CREATE INDEX chunk_lookup IF NOT EXISTS
FOR (n:Chunk) ON (n.workspace_id, n.document_id, n.page_start);
```

## Data Lifecycle

- Conversations are soft-deleted before retention deletion.
- Uploaded file bytes are retained while any active document references them.
- Chunks, Qdrant points, and graph nodes are deleted together through an idempotent document deletion workflow.
- Audit events are immutable and retained according to admin retention policy.
- Ingestion jobs older than the configured retention period are archived after completion.
- Failed ingestion jobs retain enough metadata for troubleshooting without duplicating raw file bytes.
