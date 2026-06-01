/**
 * Convenience aliases over the auto-generated OpenAPI schema.
 *
 * Import resource shapes from here (not `schema.d.ts` directly) so call sites
 * stay readable and survive regeneration:
 *
 *   import type { Schemas } from "@/lib/api/types";
 *   type Device = Schemas["SafeDevice"];
 */
import type { components } from "./schema";

/** All component schemas, keyed by their OpenAPI name. */
export type Schemas = components["schemas"];

// Frequently-used resource shapes, surfaced as friendly names.
export type Device = Schemas["SafeDevice"];
export type GrowSite = Schemas["SafeGrowSite"];
export type Planting = Schemas["SafePlanting"];
export type Reading = Schemas["SafeReading"];
export type DeviceEvent = Schemas["SafeDeviceEvent"];
export type Share = Schemas["SafeShare"];
export type Crop = Schemas["SafeCrop"];
export type Account = Schemas["AccountWithRole"];
export type User = Schemas["SafeUser"];

/** Standard error envelope returned by the API: `{ statusCode, error, message }`. */
export type ApiErrorBody = Schemas["ErrorResponse"];
