"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { type Device } from "@/lib/api";
import { useI18n, type Dictionary } from "@/lib/i18n";

const STATUS_DOT: Record<Device["status"], string> = {
  active: "bg-terracotta",
  provisioned: "bg-light-steel",
  offline: "bg-hint-of-grey",
  retired: "bg-hint-of-grey",
};

export function DeviceCard({ device }: { device: Device }) {
  const { t } = useI18n();

  return (
    <Link href={`/devices/${device.id}`} className="group block">
      <Card className="flex flex-col gap-4 p-5 transition-transform group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-body font-medium text-ink">
              {device.name ?? device.serial}
            </span>
            <span className="text-caption text-light-steel">
              {device.deviceModelCode} · {device.serial}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-fog px-2.5 py-1 text-caption text-muted-stone">
            <span className={cn("size-1.5 rounded-pill", STATUS_DOT[device.status])} />
            {t.deviceStatus[device.status]}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-ink/5 pt-3 text-caption text-muted-stone">
          <span>{t.deviceCard.lastSeen}</span>
          <span className="text-ink">{formatLastSeen(device.lastSeenAt, t.deviceCard)}</span>
        </div>
      </Card>
    </Link>
  );
}

function formatLastSeen(value: string | null, t: Dictionary["deviceCard"]): string {
  if (!value) return t.never;
  const then = new Date(value).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return t.minsAgo(mins);
  const hours = Math.round(mins / 60);
  if (hours < 24) return t.hoursAgo(hours);
  const days = Math.round(hours / 24);
  if (days < 30) return t.daysAgo(days);
  return new Date(value).toLocaleDateString();
}
