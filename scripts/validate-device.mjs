// End-to-end visual validation: seed a device with telemetry via the API,
// then drive the browser to log in and screenshot the device detail view.
//
//   node scripts/validate-device.mjs
//
// Screenshots are written to scripts/screens/. Requires the backend (:3000)
// and the Next dev server (:3001) to be running.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const API = process.env.API_BASE_URL ?? "http://localhost:3000";
const APP = process.env.APP_BASE_URL ?? "http://localhost:3001";
const OUT = new URL("./screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const PASSWORD = "sup3rsecret";
const email = `viz+${Date.now()}@example.com`;

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${opts.method ?? "GET"} ${path} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

function seedReadings() {
  // Two days of 15-min diurnal data for the four metrics.
  const readings = [];
  const now = Date.now();
  const step = 15 * 60 * 1000;
  const count = 2 * 96;
  for (let i = count; i >= 0; i--) {
    const t = new Date(now - i * step);
    const iso = t.toISOString();
    const hour = t.getHours() + t.getMinutes() / 60;
    const day = Math.sin((hour / 24) * Math.PI * 2 - Math.PI / 2); // -1..1
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI)); // 0 at night
    readings.push({ metricCode: "temp", recordedAt: iso, value: +(22 + 3.5 * day).toFixed(2) });
    readings.push({ metricCode: "humidity", recordedAt: iso, value: +(62 - 9 * day).toFixed(2) });
    readings.push({ metricCode: "ec", recordedAt: iso, value: +(1.3 + 0.15 * Math.sin(i / 7)).toFixed(2) });
    readings.push({ metricCode: "lux", recordedAt: iso, value: Math.round(12500 * daylight) });
  }
  return readings;
}

async function seed() {
  const { token } = await api("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const auth = { Authorization: `Bearer ${token}` };
  const accounts = await api("/api/v1/accounts/", { headers: auth });
  const accountId = accounts.data[0].id;
  const serial = `VIZ-${Date.now()}`;
  const dev = await api("/api/v1/devices/", {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ accountId, serial, deviceModelCode: "rack-pro", name: "Greenhouse rack" }),
  });
  // Ingest in batches of <=1000 via device auth.
  const readings = seedReadings();
  for (let i = 0; i < readings.length; i += 1000) {
    await api("/api/v1/ingest/readings", {
      method: "POST",
      headers: { "X-Device-Serial": serial, "X-Device-Secret": dev.secret },
      body: JSON.stringify({ readings: readings.slice(i, i + 1000) }),
    });
  }
  console.log(`seeded device ${dev.id} (${serial}) with ${readings.length} readings as ${email}`);
  return { deviceId: dev.id };
}

async function shoot() {
  const { deviceId } = await seed();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  // Log in.
  await page.goto(`${APP}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.getByText("Greenhouse rack").waitFor({ timeout: 15000 });
  await page.screenshot({ path: OUT + "01-dashboard.png", fullPage: true });

  // Device detail — wait for charts to render.
  await page.goto(`${APP}/devices/${deviceId}`);
  await page.getByText("Temperature").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(800); // let visx settle
  await page.screenshot({ path: OUT + "02-device-detail.png", fullPage: true });

  // Healthy-range bands: compare to Basil.
  await page.locator("select").first().selectOption({ label: "Basil" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "03-bands-basil.png", fullPage: true });

  // 7-day range.
  await page.getByRole("button", { name: "7d" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + "04-7d.png", fullPage: true });

  await browser.close();
  console.log("console/page errors:", errors.length ? errors : "none");
  console.log("screenshots in", OUT);
}

shoot().catch((e) => {
  console.error(e);
  process.exit(1);
});
