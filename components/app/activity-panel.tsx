"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { devices as devicesApi, type DeviceEvent } from "@/lib/api";

export function ActivityPanel({ deviceId }: { deviceId: string }) {
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    devicesApi
      .getEvents(deviceId, { limit: 50 })
      .then((res) => {
        if (!cancelled) setEvents(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load activity");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-heading font-medium text-ink">Activity</h2>

      {loading ? (
        <Card className="flex flex-col gap-4 p-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-1.5 rounded-pill" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </Card>
      ) : error ? (
        <Card variant="fog" className="p-5">
          <p className="text-body text-terracotta">{error}</p>
        </Card>
      ) : events.length === 0 ? (
        <Card variant="fog" className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <p className="text-body text-muted-stone text-pretty">
            No events yet. Device activity — sync, pump cycles, alerts — will
            appear here.
          </p>
        </Card>
      ) : (
        <Card className="flex flex-col p-0">
          <ul className="flex flex-col divide-y divide-ink/5">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-pill bg-terracotta" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-body font-medium text-ink">{labelize(e.eventType)}</span>
                    <span className="text-caption text-light-steel tabular-nums">
                      {formatStamp(e.recordedAt)}
                    </span>
                  </div>
                  {summarize(e.payload) ? (
                    <span className="text-caption text-muted-stone">{summarize(e.payload)}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

function labelize(eventType: string): string {
  return eventType.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function summarize(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const entries = Object.entries(payload as Record<string, unknown>).slice(0, 3);
  return entries
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ");
}

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
