/**
 * Crops resource — the global crop catalog and per-crop growing targets.
 * Read-only reference data.
 */
import { api, type ApiClient } from "../client";
import { unwrap } from "../errors";

/** List the crop catalog. */
export function listCrops(client: ApiClient = api) {
  return unwrap(client.GET("/api/v1/crops/", { params: { query: {} } }));
}

/** Fetch a crop with its ideal per-metric target ranges. */
export function getCrop(cropId: string, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/crops/{cropId}", { params: { path: { cropId } } }),
  );
}
