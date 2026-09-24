export type ApiErrorCode =
  | "NETWORK"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "SERVER"
  | "CANCELLED"
  | "UNKNOWN";

export interface ApiError {
  message: string;
  code: ApiErrorCode;
  status?: number;
  details?: unknown;
}

export interface RequestOptions {
  signal?: AbortSignal;
  delay?: number;
}
