"use client";

import { useMemo } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { curveMonotoneX } from "@visx/curve";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear, scaleTime } from "@visx/scale";
import { AreaClosed, Bar, Line, LinePath } from "@visx/shape";
import { bisector } from "d3-array";
import type { Point } from "@/lib/downsample";

const MARGIN = { top: 8, right: 14, bottom: 22, left: 38 };
const bisectT = bisector<Point, number>((d) => d.t).left;

/** Nearest point to a timestamp (snaps the crosshair across synced charts). */
export function pointAt(points: Point[], t: number): Point | null {
  if (points.length === 0) return null;
  const i = bisectT(points, t, 1);
  const a = points[i - 1];
  const b = points[i];
  if (!b) return a ?? null;
  if (!a) return b;
  return t - a.t <= b.t - t ? a : b;
}

interface LineChartProps {
  width: number;
  height: number;
  points: Point[];
  color: string;
  /** Shared x-domain (epoch ms) so crosshairs line up across charts. */
  xDomain: [number, number];
  /** Active (hovered) timestamp shared across charts, or null. */
  activeTime: number | null;
  onHoverTime: (t: number | null) => void;
  /** Few-tick time formatter chosen by the page for the current range. */
  formatTick: (t: number) => string;
}

export function LineChart({
  width,
  height,
  points,
  color,
  xDomain,
  activeTime,
  onHoverTime,
  formatTick,
}: LineChartProps) {
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const xScale = useMemo(
    () => scaleTime({ domain: [new Date(xDomain[0]), new Date(xDomain[1])], range: [0, innerW] }),
    [xDomain, innerW],
  );

  const yScale = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const p of points) {
      if (p.v < min) min = p.v;
      if (p.v > max) max = p.v;
    }
    if (!isFinite(min)) {
      min = 0;
      max = 1;
    }
    const pad = (max - min || Math.abs(max) || 1) * 0.12;
    return scaleLinear({ domain: [min - pad, max + pad], range: [innerH, 0], nice: true });
  }, [points, innerH]);

  const active = activeTime !== null ? pointAt(points, activeTime) : null;

  if (innerW <= 0 || innerH <= 0) return null;

  function handleMove(event: React.MouseEvent | React.TouchEvent) {
    const loc = localPoint(event);
    if (!loc) return;
    const t = xScale.invert(loc.x - MARGIN.left).getTime();
    const p = pointAt(points, t);
    onHoverTime(p ? p.t : null);
  }

  const gradId = `grad-${color.replace("#", "")}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <LinearGradient id={gradId} from={color} to={color} fromOpacity={0.16} toOpacity={0} />
      <Group left={MARGIN.left} top={MARGIN.top}>
        <GridRows scale={yScale} width={innerW} numTicks={3} stroke="#17191c" strokeOpacity={0.06} />

        {points.length > 0 ? (
          <>
            <AreaClosed
              data={points}
              x={(d) => xScale(d.t) ?? 0}
              y={(d) => yScale(d.v) ?? 0}
              yScale={yScale}
              curve={curveMonotoneX}
              fill={`url(#${gradId})`}
            />
            <LinePath
              data={points}
              x={(d) => xScale(d.t) ?? 0}
              y={(d) => yScale(d.v) ?? 0}
              curve={curveMonotoneX}
              stroke={color}
              strokeWidth={1.75}
            />
          </>
        ) : null}

        {active ? (
          <>
            <Line
              from={{ x: xScale(active.t), y: 0 }}
              to={{ x: xScale(active.t), y: innerH }}
              stroke="#17191c"
              strokeOpacity={0.25}
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <circle cx={xScale(active.t)} cy={yScale(active.v)} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
          </>
        ) : null}

        <AxisLeft
          scale={yScale}
          numTicks={3}
          hideAxisLine
          hideTicks
          tickLabelProps={() => ({ fill: "#777b86", fontSize: 10, dx: -2, dy: 3, textAnchor: "end" })}
        />
        <AxisBottom
          scale={xScale}
          top={innerH}
          numTicks={4}
          hideAxisLine
          hideTicks
          tickFormat={(v) => formatTick(+v)}
          tickLabelProps={() => ({ fill: "#777b86", fontSize: 10, dy: 2, textAnchor: "middle" })}
        />

        {/* Transparent capture layer for hover. */}
        <Bar
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          onMouseLeave={() => onHoverTime(null)}
        />
      </Group>
    </svg>
  );
}
