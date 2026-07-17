// 앱 셔플 플로우를 모바일 뷰포트로 녹화 → 릴스 인서트 소스.
// dev 서버(localhost:3000)가 떠 있어야 함. 강남역 좌표로 위치 목업(실데이터).
// 실행:  GLOBAL_MODULES="$(npm root -g)" node marketing/record-reel.mjs
// 산출물: marketing/reel/out/*.webm  (gitignore)
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// 전역 playwright는 이 저장소 밖(사용자 머신)에 있어 언제든 사라질 수 있다.
// 실제로 한 번 사라져서 MODULE_NOT_FOUND 스택만 보고 원인을 추적해야 했으므로, 설치법을 직접 알려준다.
const { chromium } = loadPlaywright();
function loadPlaywright() {
  try {
    return require(join(process.env.GLOBAL_MODULES ?? "", "playwright"));
  } catch {
    console.error(
      "\n[릴스 녹화] playwright를 찾지 못했습니다.\n" +
        "  1) 설치:  npm i -g playwright\n" +
        '  2) 실행:  GLOBAL_MODULES="$(npm root -g)" node marketing/record-reel.mjs\n' +
        `  (현재 GLOBAL_MODULES=${process.env.GLOBAL_MODULES ?? "미설정"})\n`,
    );
    process.exit(1);
  }
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "reel", "out");
mkdirSync(outDir, { recursive: true });

const GANGNAM = { latitude: 37.4979, longitude: 127.0276 };
const VP = { width: 390, height: 844 };

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VP,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "no-preference", // 셔플 롤이 재생되도록
  locale: "ko-KR",
  geolocation: GANGNAM,
  permissions: ["geolocation"],
  recordVideo: { dir: outDir, size: VP },
});
const page = await context.newPage();

const wait = (ms) => page.waitForTimeout(ms);

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await wait(1500); // 헤더("맛집 안 찾아줍니다") 노출

// 위치 동의 1탭 → 실제 geolocation(강남역) → /api/recommend 실데이터
await page.getByRole("button", { name: /지금 위치로 3곳 받기/ }).click();

// 첫 3곳 뜰 때까지 (= 셔플 버튼 등장)
const shuffleBtn = page.getByRole("button", { name: /다른 3곳 보기/ });
await shuffleBtn.waitFor({ state: "visible", timeout: 15000 });
await wait(1800); // 첫 3장 감상

// 셔플 롤 반복 — 인서트용으로 여러 번
for (let i = 0; i < 5; i++) {
  await shuffleBtn.click();
  await wait(1700); // 롤(800ms) + 정지 감상
}

// 모드 전환(카페)으로 롤 한 번 더 — 다른 결과 보여주기
const cafe = page.getByRole("button", { name: /카페/ });
if (await cafe.count()) {
  await cafe.first().click();
  await wait(1900);
  await shuffleBtn.click().catch(() => {});
  await wait(1700);
}

await context.close(); // 비디오 flush
await browser.close();

// webm 파일명 정리
const files = readdirSync(outDir).filter((f) => f.endsWith(".webm"));
const latest = files.sort().pop();
if (latest && latest !== "reel-shuffle.webm") {
  renameSync(join(outDir, latest), join(outDir, "reel-shuffle.webm"));
}
console.log("DONE →", join(outDir, "reel-shuffle.webm"));
