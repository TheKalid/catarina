"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Tabs } from "@/components/ui/tabs";
import { ChartCardSkeleton, SkeletonGrid } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { METRIC_ORDER, metricMeta } from "@/lib/metrics";
import { resolveWindow, type RangeKey } from "@/lib/time-range";
import { useReadings } from "@/lib/use-readings";
import { useDevicesStore } from "@/stores/devices";
import { useCropsStore } from "@/stores/crops";
import { MetricChartCard } from "@/components/charts/metric-chart-card";
import { RangeSwitcher } from "@/components/charts/range-switcher";
import type { TargetBand } from "@/components/charts/line-chart";
import { GrowPanel } from "@/components/app/grow-panel";
import { ActivityPanel } from "@/components/app/activity-panel";
import { InsightsPanel } from "@/components/app/insights-panel";

const METRICS = [...METRIC_ORDER];
// DLI and the heatmap are daily/aggregate views — meaningless over 24h — so
// they always use at least a 7-day window regardless of the chart range.
const AGG_METRICS = ["temp", "lux"];

export default function DeviceDetailPage() {
  const params = useParams<{ deviceId: string }>();
  const deviceId = params.deviceId;

  const device = useDevicesStore((s) => s.byId[deviceId]);
  const fetchOne = useDevicesStore((s) => s.fetchOne);

  const [range, setRange] = useState<RangeKey>("24h");
  const [activeTime, setActiveTime] = useState<number | null>(null);
  const [cropId, setCropId] = useState("");

  const { series, loading, error } = useReadings(deviceId, METRICS, range);

  // Aggregate insights window — floored to 7d (cache-deduped when it equals the
  // selected range, so no extra fetch for 7d/30d).
  const insightsRange: RangeKey = range === "24h" ? "7d" : range;
  const agg = useReadings(deviceId, AGG_METRICS, insightsRange);

  const cropList = useCropsStore((s) => s.list);
  const targetsById = useCropsStore((s) => s.targetsById);
  const fetchCropList = useCropsStore((s) => s.fetchList);
  const fetchCropTargets = useCropsStore((s) => s.fetchTargets);

  useEffect(() => {
    if (!device) fetchOne(deviceId).catch(() => {});
  }, [device, deviceId, fetchOne]);

  useEffect(() => {
    fetchCropList().catch(() => {});
  }, [fetchCropList]);

  useEffect(() => {
    if (cropId) fetchCropTargets(cropId).catch(() => {});
  }, [cropId, fetchCropTargets]);

  // Map the comparison crop's targets to a band per metric code.
  const bandByMetric = useMemo(() => {
    const map: Record<string, TargetBand> = {};
    for (const t of (cropId && targetsById[cropId]) || []) {
      map[t.metricCode] = { min: t.minValue ?? null, max: t.maxValue ?? null };
    }
    return map;
  }, [cropId, targetsById]);

  // Clamp the x-domain to the earliest available reading so a wide range with
  // little history doesn't cram the line into the right edge with dead space.
  const { xDomain, limited } = useMemo(() => {
    const w = resolveWindow(range);
    const start = Date.parse(w.from);
    const end = Date.parse(w.to);
    let earliest = Infinity;
    for (const m of METRICS) {
      const raw = series[m]?.raw;
      if (raw && raw.length) earliest = Math.min(earliest, raw[0].t);
    }
    const clampedStart = Number.isFinite(earliest) ? Math.max(start, earliest) : start;
    // "limited" when data covers noticeably less than the requested window.
    const isLimited = Number.isFinite(earliest) && clampedStart > start + 12 * 60 * 60 * 1000;
    return { xDomain: [clampedStart, end] as [number, number], limited: isLimited };
  }, [range, series]);

  const fmt = useMemo(() => {
    const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
    const day = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    const stamp = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      tick: (t: number) => (range === "24h" ? time.format(t) : day.format(t)),
      stamp: (t: number) => stamp.format(t),
    };
  }, [range]);

  const hasAnyData = METRICS.some((m) => (series[m]?.points.length ?? 0) > 0);

  const telemetry = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2">
            <span className="text-caption text-muted-stone">Compare to</span>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="h-9 rounded-pill border border-hint-of-grey/60 bg-canvas pl-3 pr-7 text-caption text-ink focus:border-ink focus:outline-none"
            >
              <option value="">No crop</option>
              {cropList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <RangeSwitcher value={range} onChange={setRange} />
        </div>
        {cropId ? (
          <p className="text-caption text-muted-stone">
            Shaded band shows the ideal range for the selected crop. Out-of-range
            readings are flagged per metric.
          </p>
        ) : null}
        {limited ? (
          <p className="text-caption text-light-steel">
            Limited history — showing all readings available so far.
          </p>
        ) : null}
      </div>

      {error ? (
        <Card variant="fog" className="p-6">
          <p className="text-body text-terracotta">{error}</p>
        </Card>
      ) : loading && !hasAnyData ? (
        <SkeletonGrid count={4} className="sm:grid-cols-2">
          {() => <ChartCardSkeleton />}
        </SkeletonGrid>
      ) : !hasAnyData ? (
        <Card variant="fog" className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <h2 className="text-heading font-medium text-ink">No readings in this range</h2>
          <p className="max-w-sm text-body text-muted-stone text-pretty">
            This device hasn’t reported sensor data for the selected window yet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {METRICS.map((code) => (
            <MetricChartCard
              key={code}
              meta={metricMeta(code)}
              series={series[code]}
              xDomain={xDomain}
              activeTime={activeTime}
              onHoverTime={setActiveTime}
              formatTick={fmt.tick}
              formatStamp={fmt.stamp}
              band={cropId ? bandByMetric[code] ?? null : null}
            />
          ))}
        </div>
      )}

      {hasAnyData ? (
        <InsightsPanel
          tempRaw={series.temp?.raw ?? []}
          humidityRaw={series.humidity?.raw ?? []}
          aggTempRaw={agg.series.temp?.raw ?? []}
          aggLuxRaw={agg.series.lux?.raw ?? []}
          aggRange={insightsRange}
          selectedRange={range}
          xDomain={xDomain}
          activeTime={activeTime}
          onHoverTime={setActiveTime}
          formatTick={fmt.tick}
          formatStamp={fmt.stamp}
        />
      ) : null}
    </div>
  );

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="text-caption text-muted-stone underline-offset-4 hover:text-ink hover:underline"
        >
          ← Devices
        </Link>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-display text-ink">
            {device?.name ?? device?.serial ?? "Device"}
          </h1>
          <p className="text-caption text-muted-stone">
            {device ? (
              <>
                {device.deviceModelCode} · {device.serial} ·{" "}
                <StatusText status={device.status} />
              </>
            ) : (
              "Loading device…"
            )}
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "telemetry", label: "Telemetry", content: telemetry },
          { key: "grow", label: "Grow", content: <GrowPanel deviceId={deviceId} /> },
          { key: "activity", label: "Activity", content: <ActivityPanel deviceId={deviceId} /> },
        ]}
      />
    </Container>
  );
}

function StatusText({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "capitalize",
        status === "active" ? "text-terracotta" : "text-muted-stone",
      )}
    >
      {status}
    </span>
  );
}
