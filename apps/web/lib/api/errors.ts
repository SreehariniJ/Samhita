import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  status: number;
  code: string;
  correlationId?: string;
  details?: Record<string, unknown>;

  constructor(status: number, body: ApiErrorBody | null, fallbackMessage: string) {
    super(body?.error.message ?? fallbackMessage);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.error.code ?? "api_error";
    this.correlationId = body?.error.correlation_id;
    this.details = body?.error.details;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "The request could not be completed.";
}
