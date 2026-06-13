import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Card } from "./card";

/** A soft pulsing placeholder block. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-image bg-fog", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Placeholder for a metric chart card (header line + chart area). */
export function ChartCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-32 w-full" />
    </Card>
  );
}

/** Placeholder for a device card on the dashboard. */
export function DeviceCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-6 w-16 rounded-pill" />
      </div>
      <div className="flex items-center justify-between border-t border-ink/5 pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </Card>
  );
}

/** A grid of skeletons. */
export function SkeletonGrid({
  count,
  children,
  className,
}: {
  count: number;
  children: () => React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{children()}</div>
      ))}
    </div>
  );
}
