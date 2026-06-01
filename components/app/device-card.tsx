import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { type Device } from "@/lib/api";

const STATUS_STYLES: Record<Device["status"], { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-terracotta" },
  provisioned: { label: "Provisioned", dot: "bg-light-steel" },
  offline: { label: "Offline", dot: "bg-hint-of-grey" },
  retired: { label: "Retired", dot: "bg-hint-of-grey" },
};

export function DeviceCard({ device }: { device: Device }) {
  const status = STATUS_STYLES[device.status];

  return (
    <Card className="flex flex-col gap-4 p-5">
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
          <span className={cn("size-1.5 rounded-pill", status.dot)} />
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-ink/5 pt-3 text-caption text-muted-stone">
        <span>Last seen</span>
        <span className="text-ink">{formatLastSeen(device.lastSeenAt)}</span>
      </div>
    </Card>
  );
}

function formatLastSeen(value: string | null): string {
  if (!value) return "Never";
  const then = new Date(value).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}
