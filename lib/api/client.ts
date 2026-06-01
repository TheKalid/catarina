import createClient, { type Client, type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Base URL of the Catarina backend. Defaults to the local backend on :3000.
 * The Next dev server runs on :3001 (see `package.json`) to avoid the clash.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export type ApiClient = Client<paths>;

// ---------------------------------------------------------------------------
// Browser singleton
// ---------------------------------------------------------------------------
// The app is store-centric: a single client instance is shared across the
// browser session. Auth is a JWT bearer token held here in module scope and
// kept in sync by the auth store via `setApiToken`. Keeping the token out of
// the store's import graph avoids a client <-> store import cycle.

let authToken: string | null = null;

/** Set (or clear, with `null`) the bearer token used by the browser client. */
export function setApiToken(token: string | null): void {
  authToken = token;
}

/** Current bearer token, or `null` if unauthenticated. */
export function getApiToken(): string | null {
  return authToken;
}

const browserAuthMiddleware: Middleware = {
  onRequest({ request }) {
    if (authToken) {
      request.headers.set("Authorization", `Bearer ${authToken}`);
    }
    return request;
  },
};

/** Shared browser client. Reads its token from `setApiToken`. */
export const api: ApiClient = createClient<paths>({ baseUrl: API_BASE_URL });
api.use(browserAuthMiddleware);

// ---------------------------------------------------------------------------
// Per-request factory (Server Components / Route Handlers)
// ---------------------------------------------------------------------------
// On the server there is no shared session, so never use the browser singleton
// — a module-level token would leak between concurrent requests. Build a fresh
// client per request with that request's token instead.

export interface CreateApiClientOptions {
  /** Bearer token to attach to every request from this client. */
  token?: string | null;
  /** Override the base URL (defaults to {@link API_BASE_URL}). */
  baseUrl?: string;
}

/** Create an isolated client bound to a single token (use on the server). */
export function createApiClient(options: CreateApiClientOptions = {}): ApiClient {
  const client = createClient<paths>({ baseUrl: options.baseUrl ?? API_BASE_URL });
  const { token } = options;
  if (token) {
    client.use({
      onRequest({ request }) {
        request.headers.set("Authorization", `Bearer ${token}`);
        return request;
      },
    });
  }
  return client;
}
