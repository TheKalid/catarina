/**
 * Auth resource — register & login. Both return `{ token, user }`; the caller
 * (the auth store) is responsible for persisting the token and handing it to
 * the client via `setApiToken`.
 */
import { api, type ApiClient } from "../client";
import { unwrap } from "../errors";
import type { Schemas } from "../types";

/** Create a new account + user, returning a JWT and the safe user. */
export function register(body: Schemas["RegisterBody"], client: ApiClient = api) {
  return unwrap(client.POST("/api/v1/auth/register", { body }));
}

/** Verify credentials, returning a JWT and the safe user. */
export function login(body: Schemas["LoginBody"], client: ApiClient = api) {
  return unwrap(client.POST("/api/v1/auth/login", { body }));
}
