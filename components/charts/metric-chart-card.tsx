"use client";

import { ParentSize } from "@visx/responsive";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatValue, type MetricMeta } from "@/lib/metrics";
import type { MetricSeries } from "@/lib/use-readings";
import { LineChart, pointAt, type TargetBand } from "./line-chart";

interface MetricChartCardProps {
  meta: MetricMeta;
  series: MetricSeries | undefined;
  xDomain: [number, number];
  activeTime: number | null;
  onHoverTime: (t: number | null) => void;
  formatTick: (t: number) => string;
  formatStamp: (t: number) => string;
  /** Ideal-range corridor from the comparison crop, if any. */
  band?: TargetBand | null;
}

function isOutOfRange(v: number, band: TargetBand): boolean {
  return (band.min != null && v < band.min) || (band.max != null && v > band.max);
}

export function MetricChartCard({
  meta,
  series,
  xDomain,
  activeTime,
  onHoverTime,
  formatTick,
  formatStamp,
  band,
}: MetricChartCardProps) {
  const points = series?.points ?? [];
  const hovered = activeTime !== null ? pointAt(points, activeTime) : null;
  const shown = hovered ?? series?.last ?? null;

  // Net change across the visible range.
  const first = points[0];
  const lastPt = points[points.length - 1];
  const delta = first && lastPt ? lastPt.v - first.v : null;

  const hasBand = !!band && (band.min != null || band.max != null);
  const outCount = hasBand ? points.filter((p) => isOutOfRange(p.v, band!)).length : 0;
  const shownOut = hasBand && shown ? isOutOfRange(shown.v, band!) : false;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-caption text-muted-stone">{meta.label}</span>
          <span
            className={cn(
              "text-heading-lg font-medium tabular-nums",
              shownOut ? "text-terracotta" : "text-ink",
            )}
          >
            {shown ? formatValue(shown.v, meta) : "—"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {hasBand ? (
            <span
              className={cn(
                "rounded-pill px-2 py-0.5 text-caption",
                outCount > 0 ? "bg-warm-mist text-terracotta" : "bg-fog text-muted-stone",
              )}
            >
              {outCount > 0 ? `${outCount} out of range` : "in range"}
            </span>
          ) : delta !== null ? (
            <span
              className={cn(
                "text-caption tabular-nums",
                delta > 0 ? "text-terracotta" : delta < 0 ? "text-light-steel" : "text-muted-stone",
              )}
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {formatValue(Math.abs(delta), meta)}
            </span>
          ) : null}
          <span className="text-caption text-hint-of-grey tabular-nums">
            {hovered ? formatStamp(hovered.t) : "range"}
          </span>
        </div>
      </div>

      <div className="h-32">
        <ParentSize>
          {({ width, height }) => (
            <LineChart
              width={width}
              height={height}
              points={points}
              color={meta.color}
              xDomain={xDomain}
              activeTime={activeTime}
              onHoverTime={onHoverTime}
              formatTick={formatTick}
              band={band}
            />
          )}
        </ParentSize>
      </div>
    </Card>
  );
}
