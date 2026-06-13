// Critical UI review: drive the app through key states + interactions and
// capture screenshots + console errors for inspection.
//   node scripts/review.mjs
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const APP = "http://localhost:3001";
const EXE = "/home/nacho/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome";
const OUT = new URL("./screens/review/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const { email, password, deviceA, deviceB } = JSON.parse(
  readFileSync(new URL("./screens/creds.json", import.meta.url).pathname, "utf8"),
);

const issues = [];
const browser = await chromium.launch({ executablePath: EXE });

async function newPage(width = 1280, height = 900) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push("PAGEERROR " + String(e)));
  page.on("requestfailed", (r) => errs.push("REQFAIL " + r.url() + " " + r.failure()?.errorText));
  page.__errs = errs;
  return page;
}
async function shot(page, name) {
  await page.screenshot({ path: OUT + name + ".png", fullPage: true });
}
async function login(page) {
  await page.goto(`${APP}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

// ---- Desktop pass ----
const page = await newPage();

await page.goto(`${APP}/`);
await page.waitForTimeout(500);
await shot(page, "00-landing");

await page.goto(`${APP}/login`);
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password").fill("wrongpassword");
await page.getByRole("button", { name: "Log in" }).click();
await page.waitForTimeout(1200);
await shot(page, "01-login-error");

await login(page);
await page.getByText("Greenhouse rack").waitFor({ timeout: 15000 });
await shot(page, "02-dashboard");

// Device A detail (24h)
await page.goto(`${APP}/devices/${deviceA}`);
await page.getByText("Temperature").first().waitFor({ timeout: 15000 });
await page.waitForTimeout(900);
await shot(page, "03-deviceA-24h");

// Hover the temperature chart to test synced crosshair
const tempSvg = page.locator("svg").first();
const box = await tempSvg.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.waitForTimeout(500);
  await shot(page, "04-deviceA-hover");
} else {
  issues.push("could not find chart svg to hover");
}

// 30d range (sparse — only 7d of data)
await page.getByRole("button", { name: "30d" }).click();
await page.waitForTimeout(1200);
await shot(page, "05-deviceA-30d");

// 7d + compare to Basil (bands)
await page.getByRole("button", { name: "7d" }).click();
await page.waitForTimeout(800);
await page.locator("select").first().selectOption({ label: "Basil" });
await page.waitForTimeout(900);
await shot(page, "06-deviceA-bands");

// Heatmap -> Temperature toggle
const tempToggle = page.getByRole("button", { name: "Temperature" });
if (await tempToggle.count()) {
  await tempToggle.first().click();
  await page.waitForTimeout(500);
  await shot(page, "07-heatmap-temp");
}

// Device B (no readings)
await page.goto(`${APP}/devices/${deviceB}`);
await page.waitForTimeout(1500);
await shot(page, "08-deviceB-empty");

// Account
await page.goto(`${APP}/account`);
await page.waitForTimeout(1200);
await shot(page, "09-account");

// Register page
await page.goto(`${APP}/register`);
await page.waitForTimeout(400);
await shot(page, "10-register");

const deskErrs = [...page.__errs];

// ---- Mobile pass (iPhone-ish) ----
const m = await newPage(390, 844);
await m.goto(`${APP}/`);
await m.waitForTimeout(500);
await shot(m, "20-m-landing");
await login(m);
await m.getByText("Greenhouse rack").waitFor({ timeout: 15000 });
await shot(m, "21-m-dashboard");
// Is Account reachable from the mobile app top bar?
const accountLinkVisible = await m.getByRole("link", { name: "Account" }).isVisible().catch(() => false);
if (!accountLinkVisible) issues.push("MOBILE: 'Account' nav link not visible in app top bar (no mobile menu?)");
await m.goto(`${APP}/devices/${deviceA}`);
await m.getByText("Temperature").first().waitFor({ timeout: 15000 });
await m.waitForTimeout(900);
await shot(m, "22-m-deviceA");
const mobErrs = [...m.__errs];

await browser.close();

console.log("=== console/page errors (desktop) ===");
console.log(deskErrs.length ? deskErrs.join("\n") : "none");
console.log("=== console/page errors (mobile) ===");
console.log(mobErrs.length ? mobErrs.join("\n") : "none");
console.log("=== scripted issues ===");
console.log(issues.length ? issues.join("\n") : "none");
console.log("screens in", OUT);
