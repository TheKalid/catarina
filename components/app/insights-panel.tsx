"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n";
import { lttb, type Point } from "@/lib/downsample";
import { buildHeatmap, computeDLIByDay, computeVPD, VPD_IDEAL } from "@/lib/derived";
import { metricMeta, formatValue, type MetricMeta } from "@/lib/metrics";
import { type RangeKey } from "@/lib/time-range";
import type { MetricSeries } from "@/lib/use-readings";
import { MetricChartCard } from "@/components/charts/metric-chart-card";
import { Heatmap } from "@/components/charts/heatmap";

const VPD_META: MetricMeta = {
  code: "vpd",
  label: "VPD (vapour pressure deficit)",
  unit: "kPa",
  color: "#5d2a1a",
  precision: 2,
};

function seriesFromPoints(metric: string, raw: Point[]): MetricSeries {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (const p of raw) {
    if (p.v < min) min = p.v;
    if (p.v > max) max = p.v;
    sum += p.v;
  }
  return {
    metric,
    raw,
    points: lttb(raw, 500),
    last: raw.length ? raw[raw.length - 1] : null,
    min: raw.length ? min : null,
    max: raw.length ? max : null,
    avg: raw.length ? sum / raw.length : null,
  };
}

interface InsightsPanelProps {
  /** Selected-range temp & humidity — VPD stays synced with the charts above. */
  tempRaw: Point[];
  humidityRaw: Point[];
  /** Aggregate-window temp & lux — for the daily DLI and heatmap views. */
  aggTempRaw: Point[];
  aggLuxRaw: Point[];
  aggRange: RangeKey;
  selectedRange: RangeKey;
  xDomain: [number, number];
  activeTime: number | null;
  onHoverTime: (t: number | null) => void;
  formatTick: (t: number) => string;
  formatStamp: (t: number) => string;
}

export function InsightsPanel({
  tempRaw,
  humidityRaw,
  aggTempRaw,
  aggLuxRaw,
  aggRange,
  selectedRange,
  xDomain,
  activeTime,
  onHoverTime,
  formatTick,
  formatStamp,
}: InsightsPanelProps) {
  const { t } = useI18n();
  const vpdSeries = useMemo(
    () => seriesFromPoints("vpd", computeVPD(tempRaw, humidityRaw)),
    [tempRaw, humidityRaw],
  );
  const dli = useMemo(() => computeDLIByDay(aggLuxRaw), [aggLuxRaw]);

  const [heatMetric, setHeatMetric] = useState<"temp" | "lux">("lux");
  const heatRaw = heatMetric === "lux" ? aggLuxRaw : aggTempRaw;
  const heatmap = useMemo(() => buildHeatmap(heatRaw), [heatRaw]);
  const heatMeta = metricMeta(heatMetric);
  const heatLabel = t.metrics[heatMetric];

  // When the daily views span a wider window than the user's chart selection,
  // label it so the difference is explicit (e.g. 24h charts, 7-day DLI).
  const windowNote =
    aggRange !== selectedRange ? t.insights.lastWindow(t.insights.rangeLabels[aggRange]) : null;

  const hasVpd = vpdSeries.raw.length > 0;
  const hasDli = dli.length > 0;
  const hasHeat = heatmap.days.length > 0;
  if (!hasVpd && !hasDli && !hasHeat) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-heading font-medium text-ink">{t.insights.title}</h2>
        <p className="text-caption text-muted-stone">
          {t.insights.subtitle}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {hasVpd ? (
          <MetricChartCard
            meta={VPD_META}
            series={vpdSeries}
            xDomain={xDomain}
            activeTime={activeTime}
            onHoverTime={onHoverTime}
            formatTick={formatTick}
            formatStamp={formatStamp}
            band={VPD_IDEAL}
          />
        ) : null}

        {hasDli ? <DliCard dli={dli} note={windowNote} /> : null}
      </div>

      {hasHeat ? (
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-caption text-muted-stone">
              {t.insights.dailyPattern}{windowNote ? ` · ${windowNote.toLowerCase()}` : ""}
            </span>
            <div className="inline-flex items-center gap-1 rounded-pill bg-fog p-1">
              {(["lux", "temp"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setHeatMetric(m)}
                  className={cn(
                    "rounded-pill px-3 py-1 text-caption transition-colors",
                    heatMetric === m ? "bg-canvas text-ink shadow-subtle" : "text-muted-stone hover:text-ink",
                  )}
                >
                  {t.metrics[m]}
                </button>
              ))}
            </div>
          </div>
          <Heatmap
            data={heatmap}
            color={heatMeta.color}
            formatValue={(v) => formatValue(v, heatMeta)}
            label={heatLabel}
          />
        </Card>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------- DLI -- */

function DliCard({ dli, note }: { dli: { day: number; dli: number }[]; note: string | null }) {
  const { t } = useI18n();
  const max = Math.max(...dli.map((d) => d.dli), 0.0001);
  const today = dli[dli.length - 1];

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-caption text-muted-stone">
            {t.insights.dliTitle}{note ? ` · ${note.toLowerCase()}` : ""}
          </span>
          <span className="text-heading-lg font-medium text-ink tabular-nums">
            {today ? t.insights.dliValue(today.dli.toFixed(1)) : "—"}
          </span>
        </div>
        <span className="text-caption text-light-steel">{t.insights.dliUnit}</span>
      </div>

      <div
        className="flex flex-col gap-1.5"
        role="img"
        aria-label={t.insights.dliAria(dli.length, today ? today.dli.toFixed(1) : null)}
      >
        {/* Bars are DIRECT children of a definite-height row so their %-heights
            resolve (a %-height inside an auto-height flex column collapses). */}
        <div className="flex h-28 items-end gap-1.5" aria-hidden="true">
          {dli.map((d) => (
            <div
              key={d.day}
              className="flex-1 rounded-t-[3px] bg-light-steel transition-colors hover:bg-muted-stone"
              style={{ height: `${Math.max(3, (d.dli / max) * 100)}%` }}
              title={`${d.dli.toFixed(1)} mol/m² · ${new Date(d.day).toLocaleDateString()}`}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          {dli.map((d) => (
            <span
              key={d.day}
              className="flex-1 text-center text-caption text-light-steel tabular-nums"
            >
              {new Date(d.day).toLocaleDateString(undefined, { weekday: "narrow" })}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
