/**
 * Devices resource — thin, typed wrappers over the API for the `/devices`
 * endpoints. These are pure transport: they make a request and return data (or
 * throw {@link ApiError}). They hold no state — the Zustand store owns state and
 * calls these from its actions.
 *
 * Every function accepts an optional `client` so the same wrappers work for the
 * browser singleton (default) and for per-request server clients.
 */
import { api, type ApiClient } from "../client";
import { unwrap } from "../errors";
import type { Schemas } from "../types";

export interface ListDevicesQuery {
  /** Restrict to one account the caller belongs to. */
  accountId?: string;
  /** Page size (max 100). */
  limit?: number;
  /** Items to skip. */
  offset?: number;
}

/** List devices the caller can see (owned across accounts + shared-with-them). */
export function listDevices(query: ListDevicesQuery = {}, client: ApiClient = api) {
  return unwrap(client.GET("/api/v1/devices/", { params: { query } }));
}

/** Fetch a single device by id. */
export function getDevice(deviceId: string, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/devices/{deviceId}", { params: { path: { deviceId } } }),
  );
}

export interface ReadingsQuery {
  /** Filter to one metric code (e.g. "temp"). */
  metric?: string;
  /** Inclusive lower bound on recordedAt (ISO date-time). */
  from?: string;
  /** Inclusive upper bound on recordedAt (ISO date-time). */
  to?: string;
  /** Page size, max 1000. */
  limit?: number;
}

/** Fetch sensor readings for a device within a time window. */
export function getReadings(deviceId: string, query: ReadingsQuery = {}, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/devices/{deviceId}/readings", {
      params: { path: { deviceId }, query },
    }),
  );
}

export interface EventsQuery {
  from?: string;
  to?: string;
  limit?: number;
}

/** Fetch device events (activity stream) within a time window. */
export function getEvents(deviceId: string, query: EventsQuery = {}, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/devices/{deviceId}/events", {
      params: { path: { deviceId }, query },
    }),
  );
}

/**
 * Register/claim a device under an account. Response includes a one-time
 * plaintext device secret — surface it to the user immediately, it is never
 * returned again.
 */
export function registerDevice(body: Schemas["RegisterDeviceBody"], client: ApiClient = api) {
  return unwrap(client.POST("/api/v1/devices/", { body }));
}

/** Update mutable device fields (name, firmware version). */
export function updateDevice(
  deviceId: string,
  body: Schemas["UpdateDeviceBody"],
  client: ApiClient = api,
) {
  return unwrap(
    client.PATCH("/api/v1/devices/{deviceId}", {
      params: { path: { deviceId } },
      body,
    }),
  );
}

/** Soft-delete (unclaim) a device. */
export function deleteDevice(deviceId: string, client: ApiClient = api) {
  return unwrap(
    client.DELETE("/api/v1/devices/{deviceId}", { params: { path: { deviceId } } }),
  );
}

/** Transfer device ownership to another account. */
export function transferDevice(
  deviceId: string,
  body: Schemas["TransferDeviceBody"],
  client: ApiClient = api,
) {
  return unwrap(
    client.POST("/api/v1/devices/{deviceId}/transfer", {
      params: { path: { deviceId } },
      body,
    }),
  );
}
