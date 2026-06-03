import { getApiCsrfToken, setApiCsrfToken } from "./session";
import { ApiError } from "./errors";
import { createSseDecoder } from "./stream";
import type {
  ApiErrorBody,
  AuditEvent,
  AuthMeResponse,
  ChangePasswordRequest,
  ChatCompletionRequest,
  ChatCompletionResponse,
  Conversation,
  ConversationListResponse,
  CreateConversationRequest,
  CreateUserRequest,
  FileListResponse,
  FilePreviewResponse,
  FileRecord,
  FileUploadResponse,
  IngestionJob,
  LoginRequest,
  MessageListResponse,
  MetricsSummary,
  ModelStatusResponse,
  ReadinessResponse,
  SearchConversationsRequest,
  SearchRequest,
  SearchResponse,
  StreamEvent,
  SystemSettings,
  UpdateConversationRequest,
  UpdateUserRequest,
  User,
  UserSettings,
  UserSettingsUpdate,
  Visibility
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  formData?: FormData;
  csrf?: boolean;
};

function url(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function parseError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const csrfToken = getApiCsrfToken();
  const method = options.method ?? "GET";

  if (options.csrf !== false && method !== "GET" && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(url(path), {
    ...options,
    method,
    headers,
    body,
    credentials: "include"
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response), response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export async function apiDownload(path: string) {
  const response = await fetch(url(path), {
    credentials: "include"
  });
  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response), response.statusText);
  }
  return response.blob();
}

export const AuthApi = {
  async login(request: LoginRequest) {
    const response = await apiFetch<AuthMeResponse>("/auth/login", {
      method: "POST",
      body: request,
      csrf: false
    });
    setApiCsrfToken(response.csrf_token);
    return response;
  },
  async logout() {
    await apiFetch<void>("/auth/logout", {
      method: "POST"
    });
    setApiCsrfToken(null);
  },
  async me() {
    const response = await apiFetch<AuthMeResponse>("/auth/me", {
      csrf: false
    });
    setApiCsrfToken(response.csrf_token);
    return response;
  },
  changePassword(request: ChangePasswordRequest) {
    return apiFetch<void>("/auth/password", {
      method: "POST",
      body: request
    });
  }
};

export const ConversationApi = {
  list(params: { archived?: boolean; limit?: number; cursor?: string } = {}) {
    const query = new URLSearchParams();
    if (params.archived !== undefined) query.set("archived", String(params.archived));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.cursor) query.set("cursor", params.cursor);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<ConversationListResponse>(`/conversations${suffix}`);
  },
  create(request: CreateConversationRequest) {
    return apiFetch<Conversation>("/conversations", {
      method: "POST",
      body: request
    });
  },
  get(conversationId: string) {
    return apiFetch<Conversation>(`/conversations/${encodeURIComponent(conversationId)}`);
  },
  update(conversationId: string, request: UpdateConversationRequest) {
    return apiFetch<Conversation>(`/conversations/${encodeURIComponent(conversationId)}`, {
      method: "PATCH",
      body: request
    });
  },
  remove(conversationId: string) {
    return apiFetch<void>(`/conversations/${encodeURIComponent(conversationId)}`, {
      method: "DELETE"
    });
  },
  messages(conversationId: string, params: { limit?: number; cursor?: string } = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", String(params.limit));
    if (params.cursor) query.set("cursor", params.cursor);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<MessageListResponse>(`/conversations/${encodeURIComponent(conversationId)}/messages${suffix}`);
  },
  search(request: SearchConversationsRequest) {
    return apiFetch<ConversationListResponse>("/conversations/search", {
      method: "POST",
      body: request
    });
  }
};

export const ChatApi = {
  complete(request: ChatCompletionRequest) {
    return apiFetch<ChatCompletionResponse>("/chat/completions", {
      method: "POST",
      body: request
    });
  },
  title(conversationId: string) {
    return apiFetch<{ conversation: Conversation }>("/chat/title", {
      method: "POST",
      body: { conversation_id: conversationId }
    });
  },
  async stream(request: ChatCompletionRequest, handlers: { onEvent: (event: StreamEvent) => void; onError?: (error: Error) => void }, signal?: AbortSignal) {
    const headers = new Headers({ "Content-Type": "application/json" });
    const csrfToken = getApiCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }

    const response = await fetch(url("/chat/completions/stream"), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(request),
      signal
    });

    if (!response.ok) {
      throw new ApiError(response.status, await parseError(response), response.statusText);
    }
    if (!response.body) {
      throw new Error("Streaming response body is unavailable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const sse = createSseDecoder((raw) => {
      try {
        handlers.onEvent({ event: raw.event, data: JSON.parse(raw.data) } as StreamEvent);
      } catch (error) {
        handlers.onError?.(error instanceof Error ? error : new Error("Unable to parse stream event."));
      }
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      sse.push(decoder.decode(value, { stream: true }));
    }
    sse.push(decoder.decode());
    sse.flush();
  }
};

export const FilesApi = {
  list(params: { limit?: number; cursor?: string } = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", String(params.limit));
    if (params.cursor) query.set("cursor", params.cursor);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<FileListResponse>(`/files${suffix}`);
  },
  get(fileId: string) {
    return apiFetch<FileRecord>(`/files/${encodeURIComponent(fileId)}`);
  },
  preview(fileId: string) {
    return apiFetch<FilePreviewResponse>(`/files/${encodeURIComponent(fileId)}/preview`);
  },
  download(fileId: string) {
    return apiDownload(`/files/${encodeURIComponent(fileId)}/download`);
  },
  remove(fileId: string) {
    return apiFetch<void>(`/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE"
    });
  },
  upload(file: File, visibility: Visibility, onProgress?: (progress: number) => void) {
    return uploadFileWithProgress(file, visibility, onProgress);
  }
};

export const IngestionApi = {
  create(fileId: string) {
    return apiFetch<IngestionJob>("/ingestion/jobs", {
      method: "POST",
      body: { file_id: fileId }
    });
  },
  get(jobId: string) {
    return apiFetch<IngestionJob>(`/ingestion/jobs/${encodeURIComponent(jobId)}`);
  },
  retry(jobId: string) {
    return apiFetch<IngestionJob>(`/ingestion/jobs/${encodeURIComponent(jobId)}/retry`, {
      method: "POST"
    });
  }
};

export const SearchApi = {
  search(request: SearchRequest) {
    return apiFetch<SearchResponse>("/search", {
      method: "POST",
      body: request
    });
  }
};

export const CitationApi = {
  get(citationId: string) {
    return apiFetch<import("./types").Citation>(`/citations/${encodeURIComponent(citationId)}`);
  },
  source(citationId: string) {
    return apiFetch<import("./types").CitationSourceResponse>(`/citations/${encodeURIComponent(citationId)}/source`);
  }
};

export const SettingsApi = {
  me() {
    return apiFetch<UserSettings>("/settings/me");
  },
  updateMe(request: UserSettingsUpdate) {
    return apiFetch<UserSettings>("/settings/me", {
      method: "PATCH",
      body: request
    });
  },
  system() {
    return apiFetch<SystemSettings>("/settings/system");
  },
  updateSystem(request: SystemSettings) {
    return apiFetch<SystemSettings>("/settings/system", {
      method: "PATCH",
      body: request
    });
  }
};

export const ModelsApi = {
  list() {
    return apiFetch<ModelStatusResponse>("/models");
  }
};

export const HealthApi = {
  ready() {
    return apiFetch<ReadinessResponse>("/health/ready", {
      csrf: false
    });
  }
};

export const AdminApi = {
  metrics() {
    return apiFetch<MetricsSummary>("/metrics/summary");
  },
  auditEvents(params: { event_type?: string; actor_user_id?: string; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.event_type) query.set("event_type", params.event_type);
    if (params.actor_user_id) query.set("actor_user_id", params.actor_user_id);
    if (params.limit) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<{ items: AuditEvent[] }>(`/admin/audit-events${suffix}`);
  },
  users() {
    return apiFetch<{ items: User[] }>("/admin/users");
  },
  createUser(request: CreateUserRequest) {
    return apiFetch<User>("/admin/users", {
      method: "POST",
      body: request
    });
  },
  updateUser(userId: string, request: UpdateUserRequest) {
    return apiFetch<User>(`/admin/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: request
    });
  }
};

function uploadFileWithProgress(file: File, visibility: Visibility, onProgress?: (progress: number) => void) {
  return new Promise<FileUploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("visibility", visibility);

    xhr.open("POST", url("/files"));
    xhr.withCredentials = true;

    const csrfToken = getApiCsrfToken();
    if (csrfToken) {
      xhr.setRequestHeader("X-CSRF-Token", csrfToken);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(JSON.parse(xhr.responseText) as FileUploadResponse);
        return;
      }
      try {
        reject(new ApiError(xhr.status, JSON.parse(xhr.responseText) as ApiErrorBody, xhr.statusText));
      } catch {
        reject(new ApiError(xhr.status, null, xhr.statusText));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed before the server responded."));
    xhr.send(formData);
  });
}
