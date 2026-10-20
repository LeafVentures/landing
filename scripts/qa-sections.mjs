import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(2000);
await page.locator("#impact").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/qa-impact.png" });
await page.locator("#how").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: "/workspace/screenshots/qa-how.png" });
await page.locator("#reviews").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: "/workspace/screenshots/qa-reviews.png" });
await page.locator("#join").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: "/workspace/screenshots/qa-join.png" });
console.log("ok");
await browser.close();
