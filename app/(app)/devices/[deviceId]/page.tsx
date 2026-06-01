"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { METRIC_ORDER, metricMeta } from "@/lib/metrics";
import { resolveWindow, type RangeKey } from "@/lib/time-range";
import { useReadings } from "@/lib/use-readings";
import { useDevicesStore } from "@/stores/devices";
import { MetricChartCard } from "@/components/charts/metric-chart-card";
import { RangeSwitcher } from "@/components/charts/range-switcher";

const METRICS = [...METRIC_ORDER];

export default function DeviceDetailPage() {
  const params = useParams<{ deviceId: string }>();
  const deviceId = params.deviceId;

  const device = useDevicesStore((s) => s.byId[deviceId]);
  const fetchOne = useDevicesStore((s) => s.fetchOne);

  const [range, setRange] = useState<RangeKey>("24h");
  const [activeTime, setActiveTime] = useState<number | null>(null);

  const { series, loading, error } = useReadings(deviceId, METRICS, range);

  useEffect(() => {
    if (!device) fetchOne(deviceId).catch(() => {});
  }, [device, deviceId, fetchOne]);

  const xDomain = useMemo(() => {
    const w = resolveWindow(range);
    return [Date.parse(w.from), Date.parse(w.to)] as [number, number];
  }, [range]);

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

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="text-caption text-muted-stone underline-offset-4 hover:text-ink hover:underline"
        >
          ← Devices
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
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
          <RangeSwitcher value={range} onChange={setRange} />
        </div>
      </div>

      {error ? (
        <Card variant="fog" className="p-6">
          <p className="text-body text-terracotta">{error}</p>
        </Card>
      ) : loading && !hasAnyData ? (
        <p className="text-body text-muted-stone">Loading readings…</p>
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
            />
          ))}
        </div>
      )}
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
