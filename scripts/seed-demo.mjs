// Seed a demo account for interactive review. Prints credentials + device ids.
import { mkdirSync, writeFileSync } from "node:fs";

const API = "http://localhost:3000";
const PASSWORD = "sup3rsecret";
const email = `demo+${Date.now()}@example.com`;

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${opts.method ?? "GET"} ${path} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

function readings(days) {
  const out = [];
  const now = Date.now();
  const step = 15 * 60 * 1000;
  const count = days * 96;
  for (let i = count; i >= 0; i--) {
    const t = new Date(now - i * step);
    const iso = t.toISOString();
    const hour = t.getHours() + t.getMinutes() / 60;
    const day = Math.sin((hour / 24) * Math.PI * 2 - Math.PI / 2);
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
    out.push({ metricCode: "temp", recordedAt: iso, value: +(22 + 3.5 * day).toFixed(2) });
    out.push({ metricCode: "humidity", recordedAt: iso, value: +(62 - 9 * day).toFixed(2) });
    out.push({ metricCode: "ec", recordedAt: iso, value: +(1.3 + 0.15 * Math.sin(i / 7)).toFixed(2) });
    out.push({ metricCode: "lux", recordedAt: iso, value: Math.round(12500 * daylight) });
  }
  return out;
}

const { token } = await api("/api/v1/auth/register", {
  method: "POST",
  body: JSON.stringify({ email, password: PASSWORD }),
});
const auth = { Authorization: `Bearer ${token}` };
const accountId = (await api("/api/v1/accounts/", { headers: auth })).data[0].id;

// Device A: full data + grow site + planting + events
const serialA = `DEMO-A-${Date.now()}`;
const devA = await api("/api/v1/devices/", {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ accountId, serial: serialA, deviceModelCode: "rack-pro", name: "Greenhouse rack" }),
});
const rs = readings(7);
for (let i = 0; i < rs.length; i += 1000) {
  await api("/api/v1/ingest/readings", {
    method: "POST",
    headers: { "X-Device-Serial": serialA, "X-Device-Secret": devA.secret },
    body: JSON.stringify({ readings: rs.slice(i, i + 1000) }),
  });
}
const gs = await api(`/api/v1/devices/${devA.id}/grow-sites`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ position: 1, name: "Top tray" }),
});
await api(`/api/v1/grow-sites/${gs.id}/plantings`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ cropCode: "basil", startedAt: new Date(Date.now() - 5 * 864e5).toISOString() }),
});
await api(`/api/v1/devices/${devA.id}/grow-sites`, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ position: 2, name: "Bottom tray" }),
});
const events = [
  { eventType: "sync.completed", recordedAt: new Date(Date.now() - 2 * 36e5).toISOString(), payload: { readings: 96 } },
  { eventType: "pump.cycle", recordedAt: new Date(Date.now() - 6 * 36e5).toISOString(), payload: { durationSec: 30, ml: 250 } },
  { eventType: "water.low", recordedAt: new Date(Date.now() - 26 * 36e5).toISOString(), payload: { level: 0.12 } },
];
await api("/api/v1/ingest/events", {
  method: "POST",
  headers: { "X-Device-Serial": serialA, "X-Device-Secret": devA.secret },
  body: JSON.stringify({ events }),
});

// Device B: empty (no readings) — edge cases
const serialB = `DEMO-B-${Date.now()}`;
const devB = await api("/api/v1/devices/", {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ accountId, serial: serialB, deviceModelCode: "pot-mini", name: "Kitchen pot" }),
});

mkdirSync(new URL("./screens/", import.meta.url).pathname, { recursive: true });
const creds = { email, password: PASSWORD, deviceA: devA.id, deviceB: devB.id };
writeFileSync(new URL("./screens/creds.json", import.meta.url).pathname, JSON.stringify(creds, null, 2));
console.log(JSON.stringify(creds, null, 2));
