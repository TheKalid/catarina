/**
 * Grow-sites & plantings resource. A device has grow-sites (slot positions);
 * each grow-site can hold one active planting (a crop, over time).
 */
import { api, type ApiClient } from "../client";
import { unwrap } from "../errors";
import type { Schemas } from "../types";

/** List a device's grow-sites. */
export function listDeviceGrowSites(deviceId: string, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/devices/{deviceId}/grow-sites", {
      params: { path: { deviceId } },
    }),
  );
}

/** Add a grow-site (slot position) to a device. */
export function createGrowSite(
  deviceId: string,
  body: Schemas["CreateGrowSiteBody"],
  client: ApiClient = api,
) {
  return unwrap(
    client.POST("/api/v1/devices/{deviceId}/grow-sites", {
      params: { path: { deviceId } },
      body,
    }),
  );
}

/** Delete a grow-site. */
export function deleteGrowSite(growSiteId: string, client: ApiClient = api) {
  return unwrap(
    client.DELETE("/api/v1/grow-sites/{growSiteId}", {
      params: { path: { growSiteId } },
    }),
  );
}

/** List plantings (current + historical) for a grow-site. */
export function listPlantings(growSiteId: string, client: ApiClient = api) {
  return unwrap(
    client.GET("/api/v1/grow-sites/{growSiteId}/plantings", {
      params: { path: { growSiteId } },
    }),
  );
}

/** Start a planting (crop) in a grow-site. */
export function startPlanting(
  growSiteId: string,
  body: Schemas["StartPlantingBody"],
  client: ApiClient = api,
) {
  return unwrap(
    client.POST("/api/v1/grow-sites/{growSiteId}/plantings", {
      params: { path: { growSiteId } },
      body,
    }),
  );
}

/** Update a planting (status, notes). */
export function updatePlanting(
  plantingId: string,
  body: Schemas["UpdatePlantingBody"],
  client: ApiClient = api,
) {
  return unwrap(
    client.PATCH("/api/v1/plantings/{plantingId}", {
      params: { path: { plantingId } },
      body,
    }),
  );
}
