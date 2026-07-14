// 릴스 훅/CTA 카드 HTML → 1080×1920 PNG. 글로벌 Playwright.
// 실행: GLOBAL_MODULES="$(npm root -g)" node marketing/reel/render-cards.mjs
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(join(process.env.GLOBAL_MODULES, "playwright"));

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "out");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.goto("file:///" + join(here, "cards.html").replace(/\\/g, "/"));
await page.waitForTimeout(400);

for (const id of ["r1h", "r1c", "r2h", "r2c", "r3h", "r3c"]) {
  const el = await page.$("#" + id);
  await el.screenshot({ path: join(outDir, `card-${id}.png`) });
  console.log("rendered card-" + id);
}
await browser.close();
console.log("DONE cards →", outDir);
