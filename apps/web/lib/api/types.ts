export type Role = "user" | "power_user" | "admin";
export type Visibility = "private" | "workspace";
export type MessageRole = "system" | "user" | "assistant" | "tool";
export type MessageStatus = "queued" | "streaming" | "complete" | "interrupted" | "failed";
export type IngestionStatus = "queued" | "running" | "ready" | "failed" | "deleted";
export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type JobStage = "created" | "validated" | "parsing" | "ocr" | "layout" | "chunking" | "embedding" | "graph" | "completed" | "failed";
export type ThemeMode = "light" | "dark" | "system";
export type CitationDisplay = "inline" | "drawer" | "inline_and_drawer";
export type DocumentType = "pdf" | "image" | "docx" | "pptx" | "xlsx";
export type ContentType = "text" | "table" | "figure" | "image" | "chart" | "diagram";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    correlation_id: string;
  };
};

export type User = {
  id: string;
  workspace_id: string;
  email: string;
  display_name: string;
  roles: Role[];
  status: "active" | "disabled";
  created_at: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthMeResponse = {
  user: User;
  csrf_token: string;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export type Conversation = {
  id: string;
  title: string;
  visibility: Visibility;
  pinned: boolean;
  archived: boolean;
  model_profile?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
};

export type ConversationListResponse = {
  items: Conversation[];
  next_cursor?: string | null;
};

export type CreateConversationRequest = {
  title?: string;
  model_profile?: string;
};

export type UpdateConversationRequest = {
  title?: string;
  pinned?: boolean;
  archived?: boolean;
  visibility?: Visibility;
  shared_user_ids?: string[];
};

export type SearchConversationsRequest = {
  query: string;
  limit?: number;
};

export type MessagePart = {
  type: "text" | "markdown" | "image" | "file";
  text?: string;
  file_id?: string;
  mime_type?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: MessagePart[];
  status: MessageStatus;
  citation_ids?: string[];
  file_ids?: string[];
  created_at: string;
};

export type MessageListResponse = {
  items: Message[];
  next_cursor?: string | null;
};

export type NewUserMessage = {
  content: MessagePart[];
  file_ids?: string[];
};

export type SearchFilters = {
  document_ids?: string[];
  file_ids?: string[];
  document_types?: DocumentType[];
  content_types?: ContentType[];
  page_range?: {
    start?: number;
    end?: number;
  };
  date_range?: {
    from?: string;
    to?: string;
  };
};

export type RetrievalRequest = {
  enabled?: boolean;
  filters?: SearchFilters;
};

export type ChatCompletionRequest = {
  conversation_id: string;
  message: NewUserMessage;
  model_profile?: string;
  retrieval?: RetrievalRequest;
};

export type TokenUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type ChatCompletionResponse = {
  message: Message;
  citations: Citation[];
};

export type FileRecord = {
  id: string;
  original_filename: string;
  content_type: string;
  extension?: string;
  size_bytes: number;
  sha256: string;
  ingestion_status: IngestionStatus;
  document_id?: string | null;
  created_at: string;
};

export type FileListResponse = {
  items: FileRecord[];
  next_cursor?: string | null;
};

export type FileUploadResponse = {
  file: FileRecord;
  ingestion_job: IngestionJob;
};

export type FilePreviewResponse = {
  file_id: string;
  document_id: string;
  pages: Array<{
    page_number: number;
    markdown: string;
  }>;
};

export type IngestionJob = {
  id: string;
  file_id: string;
  document_id?: string | null;
  status: JobStatus;
  stage: JobStage;
  progress: {
    current: number;
    total: number;
    unit: string;
  };
  error?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type SearchRequest = {
  query: string;
  filters?: SearchFilters;
  limit?: number;
};

export type SearchResult = {
  chunk_id: string;
  document_id: string;
  file_id?: string;
  source_title: string;
  score: number;
  text: string;
  page_start: number;
  page_end?: number;
  section?: string;
  retrieval_methods?: string[];
};

export type SearchResponse = {
  query: string;
  results: SearchResult[];
};

export type BoundingBox = {
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

export type Citation = {
  id: string;
  source_title: string;
  document_id: string;
  file_id?: string;
  chunk_id: string;
  page_start: number;
  page_end?: number;
  section?: string;
  confidence: number;
  snippet: string;
  bbox?: BoundingBox;
};

export type CitationSourceResponse = {
  citation: Citation;
  preview_markdown: string;
};

export type UserSettings = {
  theme: ThemeMode;
  default_model_profile: string;
  streaming_enabled: boolean;
  markdown_code_theme: string;
  citation_display: CitationDisplay;
};

export type UserSettingsUpdate = Partial<UserSettings>;

export type ModelProfile = {
  chat_model: string;
  vision_model: string;
  embedding_model: string;
  temperature: number;
  max_output_tokens: number;
  context_window_tokens: number;
};

export type SystemSettings = {
  model_profiles: Record<string, ModelProfile>;
  retrieval: {
    dense_top_k: number;
    bm25_top_k: number;
    graph_top_k: number;
    rerank_top_k: number;
    citation_min_confidence: number;
  };
  uploads: {
    max_file_size_mb: number;
    allowed_extensions: string[];
  };
};

export type ModelStatusResponse = {
  lm_studio: {
    available: boolean;
    endpoint: string;
    loaded_models: string[];
  };
  profiles: Record<string, ModelProfile>;
};

export type HealthResponse = {
  status: "live";
};

export type ReadinessResponse = {
  status: "ready" | "degraded" | "unavailable";
  dependencies: Record<string, "ready" | "degraded" | "unavailable">;
};

export type MetricsSummary = {
  requests: Record<string, unknown>;
  models: Record<string, unknown>;
  retrieval: Record<string, unknown>;
  ingestion: Record<string, unknown>;
  gpu: Record<string, unknown>;
};

export type AuditEvent = {
  id: string;
  event_type: string;
  actor_user_id: string;
  resource_type: string;
  resource_id: string;
  result: "success" | "failure";
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type CreateUserRequest = {
  email: string;
  display_name: string;
  password: string;
  roles: Role[];
};

export type UpdateUserRequest = {
  display_name?: string;
  roles?: Role[];
  status?: "active" | "disabled";
};

export type StreamEvent =
  | {
      event: "message.created";
      data: {
        conversation_id: string;
        message_id: string;
      };
    }
  | {
      event: "retrieval.started";
      data: {
        query_id: string;
      };
    }
  | {
      event: "retrieval.completed";
      data: {
        query_id: string;
        candidate_count: number;
        citation_count: number;
      };
    }
  | {
      event: "token";
      data: {
        delta: string;
      };
    }
  | {
      event: "citation";
      data: Citation;
    }
  | {
      event: "message.completed";
      data: {
        message_id: string;
        finish_reason: string;
        token_usage: TokenUsage;
      };
    }
  | {
      event: "error";
      data: {
        code: string;
        message: string;
        correlation_id: string;
      };
    };
