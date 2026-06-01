/**
 * Public surface of the API layer.
 *
 *   import { api, ApiError, devices, auth } from "@/lib/api";
 *   import type { Device } from "@/lib/api";
 */
export {
  api,
  createApiClient,
  setApiToken,
  getApiToken,
  API_BASE_URL,
  type ApiClient,
} from "./client";
export { ApiError, unwrap } from "./errors";
export * as devices from "./resources/devices";
export * as auth from "./resources/auth";
export type * from "./types";
