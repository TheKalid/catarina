"use client";

import { useEffect, useState } from "react";
import { devices as devicesApi } from "@/lib/api";
import { lttb, type Point } from "./downsample";
import { resolveWindow, type RangeKey } from "./time-range";

export interface MetricSeries {
  metric: string;
  points: Point[]; // ascending by time, downsampled for rendering
  last: Point | null;
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface ReadingsState {
  series: Record<string, MetricSeries>;
  loading: boolean;
  error: string | null;
}

const RENDER_POINTS = 500; // downsample target — smooth without overdrawing
const EMPTY: MetricSeries["last"] = null;

// Session cache keyed by device|metric|range. Readings are largely historical,
// so reusing across range toggles within a session is fine.
const cache = new Map<string, MetricSeries>();

async function loadMetric(
  deviceId: string,
  metric: string,
  range: RangeKey,
): Promise<MetricSeries> {
  const cacheKey = `${deviceId}|${metric}|${range}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { from, to } = resolveWindow(range);
  const res = await devicesApi.getReadings(deviceId, { metric, from, to, limit: 1000 });

  const points: Point[] = res.data
    .map((r) => ({ t: Date.parse(r.recordedAt), v: r.value }))
    .sort((a, b) => a.t - b.t);

  let min: number | null = null;
  let max: number | null = null;
  let sum = 0;
  for (const p of points) {
    min = min === null ? p.v : Math.min(min, p.v);
    max = max === null ? p.v : Math.max(max, p.v);
    sum += p.v;
  }

  const series: MetricSeries = {
    metric,
    points: lttb(points, RENDER_POINTS),
    last: points.length ? points[points.length - 1] : EMPTY,
    min,
    max,
    avg: points.length ? sum / points.length : null,
  };
  cache.set(cacheKey, series);
  return series;
}

/**
 * Fetch readings for several metrics over a range. One request per metric (the
 * API filters to a single metric); results run in parallel. Lives outside the
 * global store — telemetry is high-volume and view-scoped.
 */
interface Resolved {
  key: string;
  series: Record<string, MetricSeries>;
  error: string | null;
}

export function useReadings(
  deviceId: string,
  metrics: string[],
  range: RangeKey,
): ReadingsState {
  const metricsKey = metrics.join(",");
  const requestKey = `${deviceId}|${metricsKey}|${range}`;

  // Only ever set from async callbacks (not synchronously in the effect).
  // `loading` is derived by comparing the resolved key to the requested one,
  // so there's no setState-in-effect to start the load.
  const [resolved, setResolved] = useState<Resolved>({ key: "", series: {}, error: null });

  useEffect(() => {
    let cancelled = false;

    Promise.all(metrics.map((m) => loadMetric(deviceId, m, range)))
      .then((results) => {
        if (cancelled) return;
        const series: Record<string, MetricSeries> = {};
        for (const s of results) series[s.metric] = s;
        setResolved({ key: requestKey, series, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setResolved({
          key: requestKey,
          series: {},
          error: err instanceof Error ? err.message : "Could not load readings",
        });
      });

    return () => {
      cancelled = true;
    };
    // metricsKey/requestKey stand in for the metrics array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, metricsKey, range]);

  const settled = resolved.key === requestKey;
  return {
    series: settled ? resolved.series : {},
    loading: !settled,
    error: settled ? resolved.error : null,
  };
}
