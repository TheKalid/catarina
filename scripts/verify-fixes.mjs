import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const APP = "http://localhost:3001";
const EXE = "/home/nacho/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome";
const { email, password, deviceA } = JSON.parse(
  readFileSync(new URL("./screens/creds.json", import.meta.url).pathname, "utf8"),
);
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// login
await page.goto(`${APP}/login`);
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password").fill(password);
await page.getByRole("button", { name: "Log in" }).click();
await page.waitForURL("**/dashboard");

// --- chart a11y ---
await page.goto(`${APP}/devices/${deviceA}`);
await page.getByText("Temperature").first().waitFor();
await page.waitForTimeout(700);
const charts = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('[role="img"]')];
  return {
    count: imgs.length,
    focusable: imgs.filter((e) => e.tabIndex === 0).length,
    sample: imgs[0]?.getAttribute("aria-label"),
    svgHidden: [...document.querySelectorAll("svg")].every(
      (s) => s.closest('[role="img"]') == null || s.getAttribute("aria-hidden") === "true",
    ),
  };
});
console.log("CHARTS a11y:", JSON.stringify(charts, null, 2));

// keyboard: focus first chart via Tab-ish (focus directly) and confirm it's the active element
const focused = await page.evaluate(() => {
  const el = document.querySelector('[role="img"][tabindex="0"]');
  el?.focus();
  return document.activeElement === el;
});
console.log("CHART focusable via keyboard:", focused);

// --- contrast ---
const colors = await page.evaluate(() => {
  const find = (txt) => [...document.querySelectorAll("span")].find((s) => s.textContent?.trim() === txt);
  const rangeEl = find("range");
  return { range: rangeEl ? getComputedStyle(rangeEl).color : "n/a" };
});
console.log("CONTRAST colors:", colors, "(expect rgb(105, 109, 120) = #696d78)");

// --- 401 session expiry ---
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("catarina.auth"));
  raw.state.token = "ey.invalid.token";
  localStorage.setItem("catarina.auth", JSON.stringify(raw));
});
await page.goto(`${APP}/dashboard`); // rehydrate bad token -> fetchAll 401 -> handler
let redirected = false;
try {
  await page.waitForURL("**/login**", { timeout: 10000 });
  redirected = true;
} catch {}
console.log("401 -> redirected to login:", redirected, "| url:", page.url());

await browser.close();
