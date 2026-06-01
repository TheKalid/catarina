"use client";

import { cn } from "@/lib/cn";
import type { Heatmap as HeatmapData } from "@/lib/derived";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

const HOUR_LABELS = [0, 6, 12, 18];

/**
 * Hour-of-day × day heatmap. Each cell's tint = the hour's average value,
 * normalized across the grid. Reveals daily cycles (e.g. the light period).
 */
export function Heatmap({
  data,
  color,
  formatValue,
}: {
  data: HeatmapData;
  color: string;
  formatValue: (v: number) => string;
}) {
  const [r, g, b] = hexToRgb(color);
  const span = data.max - data.min || 1;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-0.5">
        {data.rows.map((row, i) => (
          <div key={data.days[i]} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-right text-caption text-light-steel tabular-nums">
              {new Date(data.days[i]).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <div className="flex flex-1 gap-px">
              {row.map((v, h) => {
                const alpha = v === null ? 0 : 0.12 + 0.88 * ((v - data.min) / span);
                return (
                  <div
                    key={h}
                    title={v === null ? `${h}:00 — no data` : `${h}:00 — ${formatValue(v)}`}
                    className={cn("h-4 flex-1 rounded-[2px]", v === null && "bg-fog")}
                    style={v === null ? undefined : { backgroundColor: `rgba(${r},${g},${b},${alpha})` }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Hour axis */}
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0" />
        <div className="relative h-4 flex-1">
          {HOUR_LABELS.map((h) => (
            <span
              key={h}
              className="absolute text-caption text-hint-of-grey tabular-nums"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {h}:00
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
