import type { ApiErrorBody } from "./types";

/**
 * Normalized error thrown by `unwrap`. Carries the server's error envelope
 * (`{ statusCode, error, message }`) when present, plus the raw `Response` for
 * callers that need headers/status beyond the body.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  /** Short error label, e.g. "Bad Request". */
  readonly error: string;
  readonly response: Response;

  constructor(message: string, statusCode: number, error: string, response: Response) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
    this.response = response;
  }

  /** Build an ApiError from openapi-fetch's `error` body + `Response`. */
  static from(body: unknown, response: Response): ApiError {
    if (isApiErrorBody(body)) {
      return new ApiError(body.message, body.statusCode, body.error, response);
    }
    return new ApiError(
      response.statusText || "Request failed",
      response.status,
      "Error",
      response,
    );
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    "statusCode" in value &&
    "error" in value
  );
}

/** Shape of every openapi-fetch result (`api.GET(...)`, `api.POST(...)`, …). */
export interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/**
 * Unwrap an openapi-fetch result into its `data`, throwing {@link ApiError} on
 * failure. Lets store actions use plain async/await + try/catch instead of
 * threading `{ data, error }` through every call.
 *
 *   const devices = await unwrap(api.GET("/api/v1/devices/"));
 */
export async function unwrap<T>(promise: Promise<FetchResult<T>>): Promise<T> {
  const { data, error, response } = await promise;
  if (error !== undefined || !response.ok) {
    throw ApiError.from(error, response);
  }
  return data as T;
}
