/**
 * Known device model codes.
 *
 * The backend has no model-catalog endpoint yet, so this list is maintained by
 * hand to populate the add-device form. When a `GET /device-models` endpoint
 * lands, replace this with a fetch and drop the constant.
 */
export interface DeviceModelOption {
  code: string;
  name: string;
  size: string;
  tier: string;
}

export const DEVICE_MODELS: DeviceModelOption[] = [
  { code: "pot-mini", name: "Pot Mini", size: "pot", tier: "entry" },
  { code: "counter-std", name: "Countertop Std", size: "countertop", tier: "mid" },
  { code: "rack-pro", name: "Rack Pro", size: "rack", tier: "premium" },
];
