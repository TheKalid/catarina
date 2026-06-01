/** Telemetry time-range presets for the device detail view. */
export type RangeKey = "24h" | "7d" | "30d";

interface RangeDef {
  key: RangeKey;
  label: string;
  durationMs: number;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const RANGES: RangeDef[] = [
  { key: "24h", label: "24 hours", durationMs: DAY },
  { key: "7d", label: "7 days", durationMs: 7 * DAY },
  { key: "30d", label: "30 days", durationMs: 30 * DAY },
];

export function rangeDef(key: RangeKey): RangeDef {
  return RANGES.find((r) => r.key === key) ?? RANGES[0];
}

/** Resolve a preset to a concrete `{ from, to }` ISO window ending now. */
export function resolveWindow(key: RangeKey, now = Date.now()): { from: string; to: string } {
  const { durationMs } = rangeDef(key);
  return {
    from: new Date(now - durationMs).toISOString(),
    to: new Date(now).toISOString(),
  };
}
