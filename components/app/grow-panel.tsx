"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n";
import { growSites as growApi, type GrowSite, type Planting } from "@/lib/api";
import { useCropsStore } from "@/stores/crops";

const PLANTING_STATUS: Record<Planting["status"], string> = {
  active: "bg-warm-mist text-terracotta",
  harvested: "bg-fog text-muted-stone",
  failed: "bg-fog text-muted-stone",
  ended: "bg-fog text-muted-stone",
};

export function GrowPanel({ deviceId }: { deviceId: string }) {
  const { t } = useI18n();
  const [sites, setSites] = useState<GrowSite[]>([]);
  const [plantings, setPlantings] = useState<Record<string, Planting[]>>({});
  const [loading, setLoading] = useState(true);
  // Holds the server-provided message, or "" to mean "use the localized
  // fallback" — localized at render so a locale switch updates it live without
  // re-running the fetch. `null` means no error.
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [plantFor, setPlantFor] = useState<GrowSite | null>(null);

  // Pure fetch (no setState) so the loader can be reused in both the mount
  // effect and refetches while keeping setState in async callbacks only.
  const fetchData = useCallback(async () => {
    const { data } = await growApi.listDeviceGrowSites(deviceId);
    const ordered = [...data].sort((a, b) => a.position - b.position);
    const entries = await Promise.all(
      ordered.map(async (s) => [s.id, (await growApi.listPlantings(s.id)).data] as const),
    );
    return { sites: ordered, plantings: Object.fromEntries(entries) };
  }, [deviceId]);

  const reload = useCallback(() => {
    fetchData()
      .then((r) => {
        setSites(r.sites);
        setPlantings(r.plantings);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "");
      })
      .finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;
    fetchData()
      .then((r) => {
        if (cancelled) return;
        setSites(r.sites);
        setPlantings(r.plantings);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const nextPosition = sites.reduce((max, s) => Math.max(max, s.position), 0) + 1;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading font-medium text-ink">{t.grow.title}</h2>
        <Button size="sm" variant="ghost" onClick={() => setAddOpen(true)}>
          {t.grow.addGrowSite}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i} className="flex items-center justify-between gap-3 p-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded-pill" />
            </Card>
          ))}
        </div>
      ) : error !== null ? (
        <Card variant="fog" className="p-5">
          <p className="text-body text-terracotta">{error || t.grow.loadError}</p>
        </Card>
      ) : sites.length === 0 ? (
        <Card variant="fog" className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <p className="text-body text-muted-stone text-pretty">
            {t.grow.emptyBody}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sites.map((site) => {
            const active = (plantings[site.id] ?? []).find((p) => p.status === "active");
            return (
              <Card key={site.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-body font-medium text-ink">
                    {site.name ?? t.grow.slot(site.position)}
                  </span>
                  {active ? (
                    <span className="flex items-center gap-2 text-caption text-muted-stone">
                      <span className={cn("rounded-pill px-2 py-0.5 capitalize", PLANTING_STATUS[active.status])}>
                        {active.cropCode}
                      </span>
                      {t.grow.since(formatDate(active.startedAt))}
                    </span>
                  ) : (
                    <span className="text-caption text-light-steel">{t.grow.empty}</span>
                  )}
                </div>
                {active ? (
                  <EndButton planting={active} onDone={reload} />
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setPlantFor(site)}>
                    {t.grow.startPlanting}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AddGrowSiteModal
        deviceId={deviceId}
        open={addOpen}
        defaultPosition={nextPosition}
        onClose={() => setAddOpen(false)}
        onAdded={reload}
      />
      <StartPlantingModal
        site={plantFor}
        onClose={() => setPlantFor(null)}
        onStarted={reload}
      />
    </section>
  );
}

function EndButton({ planting, onDone }: { planting: Planting; onDone: () => void }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await growApi.updatePlanting(planting.id, { status: "ended" });
          onDone();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? t.grow.ending : t.grow.end}
    </Button>
  );
}

/* ------------------------------------------------------------ Add grow site -- */

function AddGrowSiteModal({
  deviceId,
  open,
  defaultPosition,
  onClose,
  onAdded,
}: {
  deviceId: string;
  open: boolean;
  defaultPosition: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { t } = useI18n();
  const [position, setPosition] = useState(String(defaultPosition));
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the suggested position in sync when the modal opens.
  const shownPosition = open ? position || String(defaultPosition) : position;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await growApi.createGrowSite(deviceId, {
        position: Number(shownPosition),
        ...(name.trim() ? { name: name.trim() } : {}),
      });
      onAdded();
      onClose();
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.grow.addError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t.grow.addModalTitle}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label={t.grow.position}
          type="number"
          min={1}
          required
          value={shownPosition}
          onChange={(e) => setPosition(e.target.value)}
          hint={t.grow.positionHint}
        />
        <Field
          label={t.grow.nameOptional}
          placeholder={t.grow.namePlaceholder}
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error ? <p className="text-caption text-terracotta">{error}</p> : null}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? t.grow.adding : t.grow.add}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ----------------------------------------------------------- Start planting -- */

function StartPlantingModal({
  site,
  onClose,
  onStarted,
}: {
  site: GrowSite | null;
  onClose: () => void;
  onStarted: () => void;
}) {
  const { t } = useI18n();
  const crops = useCropsStore((s) => s.list);
  const fetchCrops = useCropsStore((s) => s.fetchList);
  const [cropCode, setCropCode] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (site) fetchCrops().catch(() => {});
  }, [site, fetchCrops]);

  const selectedCrop = cropCode || crops[0]?.code || "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!site) return;
    setBusy(true);
    setError(null);
    try {
      await growApi.startPlanting(site.id, {
        cropCode: selectedCrop,
        startedAt: new Date().toISOString(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      onStarted();
      onClose();
      setNotes("");
      setCropCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.grow.startError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={site !== null} onClose={onClose} title={t.grow.startModalTitle}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-ink">{t.grow.crop}</span>
          <select
            value={selectedCrop}
            onChange={(e) => setCropCode(e.target.value)}
            className="h-11 rounded-input border border-hint-of-grey/60 bg-canvas px-4 text-body text-ink focus:border-ink focus:outline-none"
          >
            {crops.map((c) => (
              <option key={c.id} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Field
          label={t.grow.notesOptional}
          placeholder={t.grow.notesPlaceholder}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {error ? <p className="text-caption text-terracotta">{error}</p> : null}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={busy || !selectedCrop}>
            {busy ? t.grow.starting : t.grow.start}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
