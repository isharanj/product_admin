import axios, { AxiosError, isCancel } from "axios";
import type { ApiError, ApiErrorCode } from "@/types/api";

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (typeof record.error === "string") return record.error;
  return undefined;
}

export function normalizeApiError(error: unknown): ApiError {
  if (isCancel(error)) {
    return {
      message: "Request was cancelled.",
      code: "CANCELLED",
    };
  }

  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error);
  }

  if (error instanceof Error) {
    return {
      message: error.message || "Something went wrong.",
      code: "UNKNOWN",
    };
  }

  return {
    message: "Something went wrong. Please try again.",
    code: "UNKNOWN",
  };
}

function normalizeAxiosError(error: AxiosError): ApiError {
  if (!error.response) {
    return {
      message:
        "Unable to reach the server. Check your connection and try again.",
      code: "NETWORK",
    };
  }

  const status = error.response.status;
  const apiMessage = extractMessage(error.response.data);
  const code = statusToCode(status);

  return {
    message: apiMessage ?? defaultMessageForCode(code),
    code,
    status,
    details: error.response.data,
  };
}

function statusToCode(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 400 || status === 422) return "VALIDATION";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

function defaultMessageForCode(code: ApiErrorCode): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "Your session has expired. Please sign in again.";
    case "FORBIDDEN":
      return "You do not have permission to perform this action.";
    case "NOT_FOUND":
      return "The requested resource was not found.";
    case "VALIDATION":
      return "Some of the provided data is invalid.";
    case "SERVER":
      return "The server encountered an error. Please try again.";
    case "NETWORK":
      return "Network error. Please check your connection.";
    case "CANCELLED":
      return "Request was cancelled.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function isCancelledError(error: unknown): boolean {
  return normalizeApiError(error).code === "CANCELLED";
}
