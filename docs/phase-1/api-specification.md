# API Specification

The backend exposes a versioned HTTP API under `/api/v1`. All endpoints return JSON unless they are explicitly streaming endpoints. The frontend consumes this API exclusively.

The concrete OpenAPI 3.1 contract is defined in [openapi.yaml](./openapi.yaml).

## Authentication

Authentication uses secure HTTP-only cookies backed by server-side MongoDB sessions. Mutating browser requests require CSRF validation through the `X-CSRF-Token` header.

Session cookie:

- Name: `samhita_session`
- Flags: `HttpOnly`, `Secure`, `SameSite=Strict`
- Value: opaque random token; only a SHA-256 hash is stored server-side.

CSRF cookie:

- Name: `samhita_csrf`
- Flags: `Secure`, `SameSite=Strict`
- Value: opaque random token; a SHA-256 hash is stored server-side.

Authorization:

- `user`: normal chat and personal documents.
- `power_user`: shared workspace document management.
- `admin`: user, model, audit, and system settings management.

## Error Model

All non-2xx errors use a standard body:

```json
{
  "error": {
    "code": "resource_not_found",
    "message": "The requested resource was not found.",
    "details": {},
    "correlation_id": "req_01JZ0000000000000000000000"
  }
}
```

Common status codes:

- `400`: invalid request.
- `401`: missing, expired, or revoked session.
- `403`: authenticated but not authorized.
- `404`: resource not found or not visible to current user.
- `409`: state conflict.
- `413`: upload too large.
- `415`: unsupported file type.
- `422`: schema validation failure.
- `429`: rate limit exceeded.
- `503`: dependency unavailable.

## Streaming Contract

`POST /api/v1/chat/completions/stream` returns `text/event-stream`.

Events:

```text
event: message.created
data: {"conversation_id":"cnv_01JZ0000000000000000000000","message_id":"msg_01JZ0000000000000000000001"}

event: retrieval.started
data: {"query_id":"qry_01JZ0000000000000000000000"}

event: retrieval.completed
data: {"query_id":"qry_01JZ0000000000000000000000","candidate_count":24,"citation_count":6}

event: token
data: {"delta":"The policy states"}

event: citation
data: {"citation_id":"cit_01JZ0000000000000000000000","source_title":"policy.pdf","page_start":8,"section":"Governance > Access Reviews","confidence":0.87}

event: message.completed
data: {"message_id":"msg_01JZ0000000000000000000001","finish_reason":"stop","token_usage":{"prompt_tokens":1850,"completion_tokens":420,"total_tokens":2270}}

event: error
data: {"code":"model_unavailable","message":"LM Studio is not accepting completion requests.","correlation_id":"req_01JZ0000000000000000000000"}
```

The stream is append-only. If the client disconnects, the backend cancels the model request when supported and persists the assistant message as `interrupted`.

## Core Endpoints

### Auth

- `POST /api/v1/auth/login`: authenticate and create session.
- `POST /api/v1/auth/logout`: revoke current session.
- `GET /api/v1/auth/me`: return current user and roles.
- `POST /api/v1/auth/password`: change current user's password.

### Conversations

- `POST /api/v1/conversations`: create conversation.
- `GET /api/v1/conversations`: list conversations.
- `GET /api/v1/conversations/{conversation_id}`: get conversation metadata.
- `PATCH /api/v1/conversations/{conversation_id}`: rename, pin, archive, or share.
- `DELETE /api/v1/conversations/{conversation_id}`: soft-delete conversation.
- `GET /api/v1/conversations/{conversation_id}/messages`: list messages.
- `POST /api/v1/conversations/search`: search chats by title and message text.

### Chat

- `POST /api/v1/chat/completions/stream`: stream assistant response.
- `POST /api/v1/chat/completions`: non-streaming assistant response for automation and tests.
- `POST /api/v1/chat/title`: generate or refresh conversation title.

### Files and Ingestion

- `POST /api/v1/files`: upload a file.
- `GET /api/v1/files`: list files visible to current user.
- `GET /api/v1/files/{file_id}`: get file metadata.
- `GET /api/v1/files/{file_id}/download`: download file.
- `GET /api/v1/files/{file_id}/preview`: preview parsed or rendered file content.
- `DELETE /api/v1/files/{file_id}`: delete file and derived artifacts if authorized.
- `POST /api/v1/ingestion/jobs`: create ingestion job for uploaded file.
- `GET /api/v1/ingestion/jobs/{job_id}`: get ingestion job status.
- `POST /api/v1/ingestion/jobs/{job_id}/retry`: retry failed ingestion job.

### Search and Citations

- `POST /api/v1/search`: hybrid search over accessible documents.
- `GET /api/v1/citations/{citation_id}`: citation detail.
- `GET /api/v1/citations/{citation_id}/source`: source preview for citation.

### Settings

- `GET /api/v1/settings/me`: current user settings.
- `PATCH /api/v1/settings/me`: update current user settings.
- `GET /api/v1/settings/system`: admin-only system settings.
- `PATCH /api/v1/settings/system`: admin-only system settings update.

### Models and Observability

- `GET /api/v1/models`: configured model profiles and LM Studio availability.
- `GET /api/v1/health/live`: liveness.
- `GET /api/v1/health/ready`: dependency readiness.
- `GET /api/v1/metrics/summary`: local metrics summary for admins.
- `GET /api/v1/admin/audit-events`: audit event search for admins.
- `GET /api/v1/admin/users`: admin user list.
- `POST /api/v1/admin/users`: admin user creation.
- `PATCH /api/v1/admin/users/{user_id}`: admin user updates.

## Key Request Schemas

### Streaming Chat Request

```json
{
  "conversation_id": "cnv_01JZ0000000000000000000000",
  "message": {
    "content": [
      {
        "type": "text",
        "text": "Summarize the access review policy and cite sources."
      }
    ],
    "file_ids": ["fil_01JZ0000000000000000000000"]
  },
  "model_profile": "reasoning",
  "retrieval": {
    "enabled": true,
    "filters": {
      "document_ids": ["doc_01JZ0000000000000000000000"],
      "content_types": ["text", "table"],
      "page_range": {
        "start": 1,
        "end": 20
      }
    }
  }
}
```

### Search Request

```json
{
  "query": "quarterly access review",
  "filters": {
    "document_ids": [],
    "file_ids": [],
    "document_types": ["pdf"],
    "content_types": ["text", "table"],
    "date_range": {
      "from": "2026-01-01T00:00:00Z",
      "to": "2026-06-03T00:00:00Z"
    }
  },
  "limit": 12
}
```

### File Upload Response

```json
{
  "file": {
    "id": "fil_01JZ0000000000000000000000",
    "original_filename": "policy.pdf",
    "content_type": "application/pdf",
    "size_bytes": 1849204,
    "sha256": "83d6e4f2a1c09b8e7d6c5b4a3928171605f4e3d2c1b0a9988776655443322110",
    "ingestion_status": "queued",
    "created_at": "2026-06-03T00:00:00Z"
  },
  "ingestion_job": {
    "id": "job_01JZ0000000000000000000000",
    "status": "queued",
    "stage": "created"
  }
}
```

## API Design Decisions

- Chat streaming uses SSE because it is simple, reliable behind reverse proxies, and fits token streams.
- File upload uses multipart form data so browser upload controls can stream binary files naturally.
- Resource visibility returns `404` rather than `403` where revealing existence would leak private data.
- All model operations are abstracted through model profiles instead of raw model IDs.
- Search endpoints return structured evidence, while chat endpoints return citations attached to generated answers.
- Admin endpoints are separated under `/admin` to simplify audit policy and route guards.
