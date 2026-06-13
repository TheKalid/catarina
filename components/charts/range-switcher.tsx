"use client";

import { cn } from "@/lib/cn";
import { RANGES, type RangeKey } from "@/lib/time-range";

/** Segmented pill control for the telemetry time range. */
export function RangeSwitcher({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (key: RangeKey) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-pill bg-fog p-1">
      {RANGES.map((r) => {
        const active = r.key === value;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onChange(r.key)}
            className={cn(
              "rounded-pill px-3.5 py-1.5 text-caption transition-colors",
              active ? "bg-canvas text-ink shadow-subtle" : "text-muted-stone hover:text-ink",
            )}
          >
            {r.key}
          </button>
        );
      })}
    </div>
  );
}
