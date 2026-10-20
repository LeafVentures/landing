import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function shot(name, viewport, waitMs, extraWait = 0) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(waitMs);
  const canvas = await page.locator("canvas").count();
  await page.screenshot({ path: `/workspace/screenshots/${name}.png`, fullPage: false });
  if (extraWait) {
    await page.waitForTimeout(extraWait);
    await page.screenshot({ path: `/workspace/screenshots/${name}-grown.png`, fullPage: false });
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  console.log(JSON.stringify({ name, canvas, overflow, errors }));
  await page.close();
}

await shot("qa-desktop", { width: 1280, height: 800 }, 4000, 9000);
await shot("qa-mobile", { width: 390, height: 844 }, 4000, 9000);

const login = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await login.goto("http://127.0.0.1:8080/login", { waitUntil: "domcontentloaded", timeout: 20000 });
await login.waitForTimeout(800);
await login.screenshot({ path: "/workspace/screenshots/qa-login.png" });
await login.close();

await browser.close();
