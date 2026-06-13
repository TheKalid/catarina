"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

/**
 * Small, abstract product mockups used as the hero's "floating UI" and in the
 * feature sections. Pure presentation — illustrative, not real data. Steep's
 * imagery direction favors clean UI snapshots inside rounded cards.
 */

/** A compact device status snapshot. */
export function DeviceMock({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Card className={cn("w-72 p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-body font-medium text-ink">{t.mocks.deviceName}</span>
          <span className="text-caption text-light-steel">pot-mini · CAT-000123</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-fog px-2.5 py-1 text-caption text-muted-stone">
          <span className="size-1.5 rounded-pill bg-terracotta" />
          {t.mocks.deviceActive}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label={t.mocks.tempLabel} value="22.4°" />
        <Metric label={t.mocks.humidityLabel} value="61%" />
        <Metric label={t.mocks.waterLabel} value="84%" />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-image bg-fog px-3 py-2.5">
      <div className="text-caption text-light-steel">{label}</div>
      <div className="text-body font-medium text-ink">{value}</div>
    </div>
  );
}

/**
 * A sample notification embodying "explain, don't just alert" — what happened,
 * why it matters, what to do.
 */
export function NotificationMock({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Card variant="warmMist" className={cn("w-80 border border-terracotta/15 p-4", className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-pill bg-terracotta/15 text-terracotta">
          <DropIcon className="size-4" />
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium text-ink">{t.mocks.notifTitle}</span>
          <p className="text-caption text-muted-stone text-pretty">
            {t.mocks.notifBody}
          </p>
          <span className="mt-1 text-caption font-medium text-terracotta">
            {t.mocks.notifAction}
          </span>
        </div>
      </div>
    </Card>
  );
}

function DropIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
