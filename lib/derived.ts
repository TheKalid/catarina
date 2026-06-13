/**
 * Derived growing metrics computed client-side from raw readings. These are
 * the "pro grower" signals — VPD and DLI — that the raw sensors don't report
 * directly. All inputs are full-resolution (non-downsampled) point series.
 */
import type { Point } from "./downsample";

/** Saturation vapour pressure (kPa) at temperature T (°C) — Tetens equation. */
function svp(tempC: number): number {
  return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Vapour Pressure Deficit (kPa) per timestamp, joining temperature and humidity
 * by exact recorded time (readings are ingested together, so timestamps align).
 * Lower VPD = more humid; typical leafy-green target sits ~0.8–1.2 kPa.
 */
export function computeVPD(temp: Point[], humidity: Point[]): Point[] {
  const rhByT = new Map(humidity.map((p) => [p.t, p.v]));
  const out: Point[] = [];
  for (const tp of temp) {
    const rh = rhByT.get(tp.t);
    if (rh === undefined) continue;
    const vpd = svp(tp.v) * (1 - rh / 100);
    out.push({ t: tp.t, v: Math.max(0, vpd) });
  }
  return out;
}

/** Recommended VPD corridor (kPa) for vegetative leafy growth. */
export const VPD_IDEAL = { min: 0.8, max: 1.2 };

// Rough lux→PPFD factor for broad-spectrum/white light. Real conversion depends
// on the spectrum; this is a documented approximation for display only.
const LUX_TO_PPFD = 0.0185;

export interface DailyDLI {
  /** Local day start (epoch ms). */
  day: number;
  /** Daily Light Integral, mol/m²/day. */
  dli: number;
}

/**
 * Daily Light Integral per day: integrate PPFD (approximated from lux) over
 * each calendar day. Uses the gap to the next sample as each reading's weight.
 */
export function computeDLIByDay(lux: Point[]): DailyDLI[] {
  if (lux.length < 2) return [];
  const byDay = new Map<number, number>(); // day-start ms -> mol/m²
  for (let i = 0; i < lux.length - 1; i++) {
    const p = lux[i];
    const dtSec = (lux[i + 1].t - p.t) / 1000;
    if (dtSec <= 0 || dtSec > 6 * 3600) continue; // skip gaps > 6h
    const ppfd = p.v * LUX_TO_PPFD; // µmol/m²/s
    const molPerM2 = (ppfd * dtSec) / 1_000_000;
    const dayStart = new Date(p.t).setHours(0, 0, 0, 0);
    byDay.set(dayStart, (byDay.get(dayStart) ?? 0) + molPerM2);
  }
  return [...byDay.entries()]
    .map(([day, dli]) => ({ day, dli }))
    .sort((a, b) => a.day - b.day);
}

export interface Heatmap {
  /** Day-start epoch ms for each row, ascending. */
  days: number[];
  /** rows[dayIndex][hour 0-23] = average value, or null if no data. */
  rows: (number | null)[][];
  min: number;
  max: number;
}

/** Bucket a series into a day × hour-of-day grid of average values. */
export function buildHeatmap(points: Point[]): Heatmap {
  const sums = new Map<number, number[]>(); // day -> [hourSum...]
  const counts = new Map<number, number[]>();
  for (const p of points) {
    const d = new Date(p.t);
    const dayStart = new Date(p.t).setHours(0, 0, 0, 0);
    const hour = d.getHours();
    if (!sums.has(dayStart)) {
      sums.set(dayStart, new Array(24).fill(0));
      counts.set(dayStart, new Array(24).fill(0));
    }
    sums.get(dayStart)![hour] += p.v;
    counts.get(dayStart)![hour] += 1;
  }
  const days = [...sums.keys()].sort((a, b) => a - b);
  let min = Infinity;
  let max = -Infinity;
  const rows = days.map((day) => {
    const s = sums.get(day)!;
    const c = counts.get(day)!;
    return s.map((sum, h) => {
      if (c[h] === 0) return null;
      const avg = sum / c[h];
      if (avg < min) min = avg;
      if (avg > max) max = avg;
      return avg;
    });
  });
  if (!isFinite(min)) {
    min = 0;
    max = 1;
  }
  return { days, rows, min, max };
}
