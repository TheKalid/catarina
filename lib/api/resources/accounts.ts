/**
 * Accounts resource — thin typed wrappers for the `/accounts` endpoints.
 * Pure transport; the accounts store owns state.
 */
import { api, type ApiClient } from "../client";
import { unwrap } from "../errors";
import type { Schemas } from "../types";

export interface ListQuery {
  limit?: number;
  offset?: number;
}

/** List accounts the caller is a member of, each annotated with their role. */
export function listAccounts(query: ListQuery = {}, client: ApiClient = api) {
  return unwrap(client.GET("/api/v1/accounts/", { params: { query } }));
}

/** Fetch a single account (caller must be a member). */
export function getAccount(accountId: string, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/accounts/{accountId}", { params: { path: { accountId } } }),
  );
}

/** Rename an account (owner/admin only). */
export function updateAccount(
  accountId: string,
  body: Schemas["UpdateAccountBody"],
  client: ApiClient = api,
) {
  return unwrap(
    client.PATCH("/api/v1/accounts/{accountId}", {
      params: { path: { accountId } },
      body,
    }),
  );
}

/** List members of an account. */
export function listMembers(accountId: string, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/accounts/{accountId}/members", {
      params: { path: { accountId } },
    }),
  );
}
