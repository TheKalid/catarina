"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ChipIcon } from "@/components/ui/icons";
import { AddDeviceDialog } from "@/components/app/add-device-dialog";
import { DeviceCard } from "@/components/app/device-card";
import { useDevicesStore } from "@/stores/devices";

export default function DashboardPage() {
  const byId = useDevicesStore((s) => s.byId);
  const allIds = useDevicesStore((s) => s.allIds);
  const loaded = useDevicesStore((s) => s.loaded);
  const error = useDevicesStore((s) => s.error);
  const fetchAll = useDevicesStore((s) => s.fetchAll);
  const devices = allIds.map((id) => byId[id]);

  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  // Show loading until the first fetch resolves, so we never flash the empty
  // state before devices arrive.
  const loading = !loaded && devices.length === 0;

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-display text-ink">Devices</h1>
          <p className="text-body text-muted-stone">
            Monitor and manage your growing hardware.
          </p>
        </div>
        {devices.length > 0 ? (
          <Button onClick={() => setAdding(true)}>Add device</Button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-body text-muted-stone">Loading devices…</p>
      ) : error && devices.length === 0 ? (
        <Card variant="fog" className="p-6">
          <p className="text-body text-terracotta">{error}</p>
        </Card>
      ) : devices.length === 0 ? (
        <EmptyState onAdd={() => setAdding(true)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      <AddDeviceDialog open={adding} onClose={() => setAdding(false)} />
    </Container>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card variant="fog" className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-image bg-canvas text-ink">
        <ChipIcon className="size-6" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-heading font-medium text-ink">No devices yet</h2>
        <p className="max-w-sm text-body text-muted-stone text-pretty">
          Register your first Catarina device to start monitoring your plants.
        </p>
      </div>
      <Button onClick={onAdd}>Add your first device</Button>
    </Card>
  );
}
