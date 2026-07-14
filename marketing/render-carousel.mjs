// 캐러셀 슬라이드 HTML → 1080×1350 PNG 렌더. 글로벌 Playwright 사용.
// 실행:  GLOBAL_MODULES="$(npm root -g)" node marketing/render-carousel.mjs
// 산출물: marketing/carousel/out/slide-1..7.png  (gitignore)
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

// ESM은 NODE_PATH를 무시 → 글로벌 설치 경로에서 직접 require.
const require = createRequire(import.meta.url);
const { chromium } = require(join(process.env.GLOBAL_MODULES, "playwright"));

const here = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(here, "carousel", "slides.html");
const outDir = join(here, "carousel", "out");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 }); // 2x = 선명
await page.goto("file:///" + htmlPath.replace(/\\/g, "/"));
await page.waitForTimeout(400); // 폰트 렌더 안정화

for (let i = 1; i <= 7; i++) {
  const el = await page.$("#s" + i);
  const out = join(outDir, `slide-${i}.png`);
  await el.screenshot({ path: out });
  console.log("rendered", out);
}

await browser.close();
console.log("DONE 7 slides →", outDir);
