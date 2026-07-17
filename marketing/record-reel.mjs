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
// 뷰포트는 릴스와 같은 9:16(576x1024)으로 녹화한다. 폰 비율(390x844=0.462)로 찍으면
// 9:16(0.5625)에 안 맞아 조립 때 crop으로 418px을 버리게 되고, 실제로 헤더 태그라인과
// 모드·도보 탭이 잘려 나갔다. 세로를 줄이는 건 답이 아니다 — 콘텐츠 높이(1024)는 뷰포트에
// 따라 리플로우되지 않아서 잘리는 위치만 브라우저로 옮겨간다. 가로를 넓히면 앱이
// max-width로 가운데 정렬되고 남는 폭이 같은 배경색(#fffbeb)으로 채워져 여백처럼 보인다.
// 576x1024 실측: overflow 0 (스크롤 없이 헤더~상황태그 전부 노출).
const VP = { width: 576, height: 1024 };

// 페이싱: 롤 애니메이션은 800ms. 예전엔 클릭 간격이 1700ms라 3곳이 멈춘 뒤 읽을 시간이
// 900ms뿐이었다(상호명 3개를 읽기엔 불가능 — 클라이맥스가 깜빡이고 지나감).
// 대본(MARKETING_REELS.md 컷5)이 요구하는 "3장 카드 멈춤 3s"에 맞춰 정지 구간을 확보한다.
const ROLL_MS = 800; // 셔플 롤 애니메이션
const HOLD_MS = 2400; // 멈춘 3곳을 읽는 시간
const SHUFFLE_CYCLE = ROLL_MS + HOLD_MS;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VP,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "no-preference", // 셔플 롤이 재생되도록
  locale: "ko-KR",
  geolocation: GANGNAM,
  permissions: ["geolocation"],
  // size는 반드시 뷰포트와 같아야 한다. recordVideo.size는 페이지를 축소만 하고 확대는 하지 않는다 —
  // size를 1080x1920으로 키웠더니 576x1024 페이지가 좌상단에 원본 크기로 박히고 나머지가 회색으로
  // 남았다(실측 확인). 1080폭 정규화는 prep-recording.sh가 ffmpeg으로 처리한다.
  recordVideo: { dir: outDir, size: VP },
});
const page = await context.newPage();

const wait = (ms) => page.waitForTimeout(ms);

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// dev 서버로 녹화하면 Next.js dev 인디케이터(N 배지)가 영상에 그대로 찍힌다.
// 예전 조립 스크립트의 crop이 이걸 우연히 가리고 있었어서, crop을 없애자 릴스에 드러났다.
// 반드시 프로덕션 빌드(npm run build && npm start)로 녹화한다.
if (await page.locator("nextjs-portal").count()) {
  console.error(
    "\n[릴스 녹화] dev 서버입니다 — N 배지가 영상에 찍힙니다.\n" +
      "  npm run build && npm start  로 띄운 뒤 다시 녹화하세요.\n",
  );
  await context.close();
  await browser.close();
  process.exit(1);
}

await wait(1500); // 헤더("맛집 안 찾아줍니다") 노출

// 위치 동의 1탭 → 실제 geolocation(강남역) → /api/recommend 실데이터
await page.getByRole("button", { name: /지금 위치로 3곳 받기/ }).click();

// 첫 3곳 뜰 때까지 (= 셔플 버튼 등장)
const shuffleBtn = page.getByRole("button", { name: /다른 3곳 보기/ });
await shuffleBtn.waitFor({ state: "visible", timeout: 15000 });
await wait(2600); // 첫 3장 감상

// 셔플 롤 반복 — 인서트용으로 여러 번
for (let i = 0; i < 5; i++) {
  await shuffleBtn.click();
  await wait(SHUFFLE_CYCLE); // 롤 + 3곳 정지 감상
}

// 모드 전환(카페)으로 롤 한 번 더 — 다른 결과 보여주기
const cafe = page.getByRole("button", { name: /카페/ });
if (await cafe.count()) {
  await cafe.first().click();
  await wait(2600);
  await shuffleBtn.click().catch(() => {});
  await wait(SHUFFLE_CYCLE);
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
