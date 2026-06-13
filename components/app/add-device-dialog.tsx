"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { DEVICE_MODELS } from "@/lib/device-models";
import { useI18n } from "@/lib/i18n";
import { useAccountsStore } from "@/stores/accounts";
import { useDevicesStore } from "@/stores/devices";

export function AddDeviceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const register = useDevicesStore((s) => s.register);
  const { t } = useI18n();

  const byId = useAccountsStore((s) => s.byId);
  const allIds = useAccountsStore((s) => s.allIds);
  const accountsStatus = useAccountsStore((s) => s.status);
  const fetchAccounts = useAccountsStore((s) => s.fetchAll);
  // Only accounts the caller can register under (owner/admin).
  const manageableAccounts = allIds
    .map((id) => byId[id])
    .filter((a) => a.role === "owner" || a.role === "admin");

  const accountsLoading = accountsStatus === "loading" && allIds.length === 0;
  // No account to register under — e.g. the signed-in user has none yet.
  const noManageableAccount = !accountsLoading && manageableAccounts.length === 0;

  const [accountId, setAccountId] = useState("");
  // Derived default avoids a setState-in-effect: fall back to the first
  // manageable account until the user explicitly picks one.
  const selectedAccountId = accountId || manageableAccounts[0]?.id || "";
  const selectedAccount = manageableAccounts.find((a) => a.id === selectedAccountId);
  const [serial, setSerial] = useState("");
  const [modelCode, setModelCode] = useState(DEVICE_MODELS[0]?.code ?? "");
  const [name, setName] = useState("");
  const [firmware, setFirmware] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  // Make sure we have accounts to register under, and default the selection.
  useEffect(() => {
    if (open && allIds.length === 0) fetchAccounts().catch(() => {});
  }, [open, allIds.length, fetchAccounts]);

  function close() {
    onClose();
    // Reset after the close transition so the form is fresh next open.
    setTimeout(() => {
      setSerial("");
      setName("");
      setFirmware("");
      setModelCode(DEVICE_MODELS[0]?.code ?? "");
      setError(null);
      setSecret(null);
      setSubmitting(false);
    }, 150);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const issued = await register({
        accountId: selectedAccountId,
        serial: serial.trim(),
        deviceModelCode: modelCode,
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(firmware.trim() ? { firmwareVersion: firmware.trim() } : {}),
      });
      setSecret(issued);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.addDevice.registerError);
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title={secret ? t.addDevice.titleRegistered : t.addDevice.titleAdd}>
      {secret ? (
        <SecretReveal secret={secret} onDone={close} />
      ) : accountsLoading ? (
        <p className="text-body text-muted-stone">{t.addDevice.loadingAccounts}</p>
      ) : noManageableAccount ? (
        <NoAccountNotice onClose={close} />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {manageableAccounts.length > 1 ? (
            <label className="flex flex-col gap-2">
              <span className="text-caption font-medium text-ink">{t.addDevice.account}</span>
              <select
                value={selectedAccountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="h-11 rounded-input border border-hint-of-grey/60 bg-canvas px-4 text-body text-ink focus:border-ink focus:outline-none"
              >
                {manageableAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-input bg-fog px-4 py-2.5">
              <span className="text-caption text-muted-stone">{t.addDevice.account}</span>
              <span className="text-body text-ink">{selectedAccount?.name}</span>
            </div>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-caption font-medium text-ink">{t.addDevice.model}</span>
            <select
              value={modelCode}
              onChange={(e) => setModelCode(e.target.value)}
              className="h-11 rounded-input border border-hint-of-grey/60 bg-canvas px-4 text-body text-ink focus:border-ink focus:outline-none"
            >
              {DEVICE_MODELS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name} ({m.tier})
                </option>
              ))}
            </select>
          </label>

          <Field
            label={t.addDevice.serial}
            placeholder="CAT-000123"
            required
            maxLength={128}
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            hint={t.addDevice.serialHint}
          />

          <Field
            label={t.addDevice.nameOptional}
            placeholder={t.addDevice.namePlaceholder}
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Field
            label={t.addDevice.firmwareOptional}
            placeholder="1.4.2"
            maxLength={64}
            value={firmware}
            onChange={(e) => setFirmware(e.target.value)}
          />

          {error ? (
            <p className="rounded-input bg-warm-mist px-4 py-3 text-caption text-terracotta">
              {error}
            </p>
          ) : null}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={submitting || !selectedAccountId || !serial.trim()}>
              {submitting ? t.addDevice.registering : t.addDevice.registerCta}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ----------------------------------------------------------- NoAccountNotice -- */

function NoAccountNotice({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-muted-stone text-pretty">
        {t.addDevice.noAccountBody}
      </p>
      <div className="rounded-input bg-fog px-4 py-3 text-caption text-muted-stone text-pretty">
        {t.addDevice.noAccountManagePre}
        <a href="/account" className="font-medium text-ink underline-offset-4 hover:underline">
          {t.addDevice.noAccountManageLink}
        </a>
        {t.addDevice.noAccountManagePost}
      </div>
      <div className="mt-1 flex justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          {t.common.close}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ SecretReveal -- */

function SecretReveal({ secret, onDone }: { secret: string; onDone: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the value is still selectable below */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-muted-stone text-pretty">
        {t.addDevice.secretIntroPre}
        <span className="font-medium text-ink">{t.addDevice.secretIntroEmphasis}</span>
        {t.addDevice.secretIntroPost}
      </p>

      <div className="flex items-center gap-2 rounded-input border border-ink/10 bg-fog p-2">
        <Input
          readOnly
          value={secret}
          onFocus={(e) => e.currentTarget.select()}
          className="h-9 border-0 bg-transparent font-mono text-caption"
        />
        <Button type="button" size="sm" onClick={copy} className="shrink-0">
          {copied ? (
            <>
              <CheckIcon className="size-4" /> {t.common.copied}
            </>
          ) : (
            t.common.copy
          )}
        </Button>
      </div>

      <div
        className={cn(
          "rounded-input bg-warm-mist px-4 py-3 text-caption text-terracotta",
        )}
      >
        {t.addDevice.secretSafe}
      </div>

      <div className="mt-1 flex justify-end">
        <Button type="button" onClick={onDone}>
          {t.common.done}
        </Button>
      </div>
    </div>
  );
}
