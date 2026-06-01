/**
 * Sensor metric catalog (mirrors the backend `metrics` table). No catalog API
 * endpoint exists yet, so the display metadata — label, unit, color, value
 * formatting — is kept here. When a metrics endpoint lands, fetch the codes and
 * keep only the presentation map.
 */
export interface MetricMeta {
  code: string;
  label: string;
  unit: string;
  /** Steep-palette stroke color for this metric's chart. */
  color: string;
  /** Decimal places for display. */
  precision: number;
}

export const METRICS: Record<string, MetricMeta> = {
  temp: { code: "temp", label: "Temperature", unit: "°C", color: "#5d2a1a", precision: 1 },
  humidity: { code: "humidity", label: "Humidity", unit: "%", color: "#17191c", precision: 0 },
  ec: { code: "ec", label: "Nutrients (EC)", unit: "mS/cm", color: "#4c4c4c", precision: 2 },
  lux: { code: "lux", label: "Light", unit: "lux", color: "#777b86", precision: 0 },
};

/** Display order for the small-multiples grid. */
export const METRIC_ORDER = ["temp", "humidity", "ec", "lux"] as const;

export function metricMeta(code: string): MetricMeta {
  return METRICS[code] ?? { code, label: code, unit: "", color: "#17191c", precision: 2 };
}

/** Format a value with its unit, e.g. `22.4 °C`. Compacts large lux values. */
export function formatValue(value: number, meta: MetricMeta): string {
  if (meta.unit === "lux" && value >= 1000) {
    return `${(value / 1000).toFixed(1)}k ${meta.unit}`;
  }
  return `${value.toFixed(meta.precision)} ${meta.unit}`;
}
