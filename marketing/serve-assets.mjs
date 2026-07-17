// 폰으로 마케팅 에셋 넘기는 임시 로컬 서버. 터미널에 QR을 찍고, 같은 Wi-Fi의 폰으로 스캔해 접속한다.
// 업로드는 폰에서 해야 한다(트렌딩 오디오는 인스타 앱에서만 붙일 수 있음) → 이 서버는 "저장 + 캡션 복사"까지만.
// 실행:  node marketing/serve-assets.mjs        (Ctrl+C로 종료. 임시용이라 상시 실행 금지)
// 사전:  캐러셀·릴스가 렌더돼 있어야 함(marketing/README.md 참조). 키·dev 서버 불필요.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4321);

// 캡션은 docs/MARKETING_REELS.md · docs/MARKETING_CAROUSEL.md 의 게시용 캡션과 같아야 한다.
// (문구를 고칠 땐 문서를 먼저 고치고 여기로 옮긴다 — 문서가 원본)
const REEL_CAPTIONS = {
  "reel_1_travel.mp4": {
    title: "① 여행·출장 — 숙소 앞인데 뭐 먹지",
    hook: "여행 첫날, 숙소 앞. 여기 뭐가 맛집인지 1도 모를 때",
    caption:
      "여행 가서 제일 귀찮은 거 = 숙소 앞에서 뭐 먹을지 검색하는 거. 위치동의 한 번이면 걸어서 10분 안 맛집 딱 3곳. 가입·앱설치·광고 없음, 평점순 아니라 공정 셔플. 링크는 프로필(matjib.dimad.kr)\n\n#여행맛집 #혼자여행 #출장맛집 #근처맛집 #여행꿀팁",
  },
  "reel_2_moving.mp4": {
    title: "② 이사·새 회사 — 3개월째인데 갈 데를 모름",
    hook: "이사 온 지 3개월인데 아직도 동네에서 갈 밥집이 없는 사람 🙋",
    caption:
      "이사·새 회사로 초행 동네 온 사람들. 리스트 100개 말고 걸어서 5분 딱 3곳. 매일 하나씩 셔플로 동네 뚫는 재미. 가입·광고 없음, 순위 안 매김.\n\n#이사 #동네맛집 #자취맛집 #근처맛집 #새동네탐방",
  },
  "reel_3_appointment.mp4": {
    title: "③ 약속·나들이 — 30분 일찍 도착함",
    hook: "약속 장소 낯선 동네에 30분 일찍 도착. 이 시간에 어디서 뭐하지?",
    caption:
      "약속 장소 일찍 도착했는데 낯선 동네라 어디 갈지 모를 때. 카페 모드로 걸어서 5분 3곳. 끝나면 술집 모드로 2차까지. 위치동의 한 번, 가입·광고 없음.\n\n#약속장소 #데이트코스 #나들이 #근처카페 #낯선동네",
  },
};

const CAROUSEL_CAPTION =
  "여행·출장·이사·약속으로 처음 온 동네. 뭐가 맛집인지도 모르고 검색은 귀찮을 때.\n" +
  "위치 동의 한 번이면 지금 위치에서 걸어서 5~15분, 갈 만한 식당을 딱 3곳만 정해줍니다.\n" +
  "맛집 순위 안 매기고(데이터에 품질 신호 없음), 광고·협찬 없고, 가입·앱설치도 없어요.\n" +
  "정렬은 거리 + 업종 적합도 + 공정 셔플뿐. 다음 낯선 동네에서 켜보게 저장 📌\n" +
  "링크는 프로필 → matjib.dimad.kr\n\n" +
  "#여행맛집 #출장맛집 #이사 #동네맛집 #약속장소 #낯선동네 #근처맛집";

const MIME = { ".mp4": "video/mp4", ".png": "image/png" };

// 서빙 대상은 스캔 결과 화이트리스트로만 — 임시 서버라도 임의 경로를 열어주지 않는다.
async function collect() {
  const pick = async (dir, filter) => {
    try {
      return (await readdir(join(here, dir))).filter(filter).sort();
    } catch {
      return [];
    }
  };
  const reels = await pick("reel/out", (f) => /^reel_\d+_.*\.mp4$/.test(f));
  const slides = await pick("carousel/out", (f) => /^slide-\d+\.png$/.test(f));
  const files = new Map();
  for (const f of reels) files.set(f, join(here, "reel/out", f));
  for (const f of slides) files.set(f, join(here, "carousel/out", f));
  return { reels, slides, files };
}

function lanAddress() {
  for (const list of Object.values(networkInterfaces())) {
    for (const ni of list ?? []) {
      if (ni.family === "IPv4" && !ni.internal) return ni.address;
    }
  }
  return null;
}

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function page({ reels, slides }) {
  const reelCards = reels
    .map((f) => {
      const meta = REEL_CAPTIONS[f] ?? { title: f, hook: "", caption: "" };
      return `<article class="card">
  <h3>${esc(meta.title)}</h3>
  <p class="hook">${esc(meta.hook)}</p>
  <video src="/f/${encodeURIComponent(f)}" controls playsinline preload="metadata"></video>
  <div class="row">
    <button class="primary" data-dl="${esc(f)}">📥 저장</button>
    <button class="share" hidden data-share="${esc(f)}">📤 공유</button>
    <button data-copy="${esc(f)}">📋 캡션</button>
  </div>
  <pre class="cap" id="cap-${esc(f)}">${esc(meta.caption)}</pre>
</article>`;
    })
    .join("\n");

  const slideThumbs = slides
    .map(
      (f, i) => `<figure>
  <img src="/f/${encodeURIComponent(f)}" alt="슬라이드 ${i + 1}" loading="lazy">
  <button data-dl="${esc(f)}">📥 ${i + 1}번 저장</button>
</figure>`,
    )
    .join("\n");

  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>matjib 마케팅 에셋</title>
<style>
  :root { --amber:#fffbeb; --orange:#f97316; --ink:#18181b; --mute:#71717a; }
  *{box-sizing:border-box} body{margin:0;background:var(--amber);color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;padding:16px 14px 48px}
  h1{font-size:20px;margin:0 0 4px} h2{font-size:16px;margin:28px 0 10px}
  .sub{color:var(--mute);font-size:13px;margin:0 0 16px;line-height:1.5}
  .card{background:#fff;border-radius:16px;padding:14px;margin-bottom:16px;box-shadow:0 1px 3px #0001}
  h3{font-size:15px;margin:0 0 2px} .hook{color:var(--mute);font-size:12px;margin:0 0 10px}
  /* 9:16이라 폭을 100%로 두면 영상 하나가 화면을 통째로 먹는다 → 높이로 맞추고 가운데 정렬
     (width:100%+object-fit:contain 은 좌우에 검은 바가 생겨서 안 씀) */
  video{height:46vh;width:auto;max-width:100%;margin:0 auto;border-radius:12px;background:#000;display:block}
  .row{display:flex;gap:8px;margin-top:10px}
  button{flex:1;padding:11px 8px;border:1px solid #e4e4e7;border-radius:10px;background:#fff;
    font-size:13px;font-weight:600;color:var(--ink)}
  button.primary{background:var(--orange);border-color:var(--orange);color:#fff}
  button:active{opacity:.7}
  .cap{white-space:pre-wrap;font-size:11px;color:var(--mute);background:#fafafa;border-radius:10px;
    padding:10px;margin:10px 0 0;font-family:inherit;line-height:1.5;max-height:96px;overflow:auto}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  figure{margin:0;background:#fff;border-radius:12px;padding:8px}
  figure img{width:100%;border-radius:8px;display:block;margin-bottom:8px}
  figure button{width:100%;font-size:12px;padding:8px}
  .note{font-size:12px;color:var(--mute);line-height:1.6;background:#fff;border-radius:12px;padding:12px}
  #toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:var(--ink);color:#fff;
    padding:10px 16px;border-radius:999px;font-size:13px;opacity:0;transition:opacity .2s;pointer-events:none}
  #toast.on{opacity:1}
</style></head><body>
<h1>🍚 matjib 마케팅 에셋</h1>
<p class="sub">폰에 저장 → 인스타 앱에서 업로드(트렌딩 오디오는 앱에서 얹기).<br>
캐러셀 = 지금 올려 <b>고정핀</b> · 릴스 = <b>토요일 오전 10~12시</b> + 첫 60분 시딩.</p>

<h2>릴스 3편 (무음 · 1080×1920)</h2>
${reelCards}

<h2>캐러셀 7장 (1080×1350)</h2>
<div class="card">
  <div class="row"><button class="primary" data-copy="carousel">📋 캐러셀 캡션 복사</button></div>
  <pre class="cap" id="cap-carousel">${esc(CAROUSEL_CAPTION)}</pre>
</div>
<div class="grid">${slideThumbs}</div>

<h2>업로드 순서 (Android)</h2>
<p class="note">① <b>저장</b> → Chrome이 <b>다운로드</b> 폴더에 받습니다(갤러리 ‘Download’ 앨범에 뜸).<br>
② <b>캡션</b> 눌러 복사.<br>
③ 인스타 앱 → 릴스/게시물 → 갤러리에서 선택 → <b>트렌딩 오디오 얹고</b> 캡션 붙여넣기.<br>
※ 저장이 막히면 <b>공유</b>로 인스타에 바로 보내거나, 미리보기를 <b>길게 눌러</b> 저장하세요.</p>

<div id="toast"></div>
<script>
const toast = (m) => { const t = document.getElementById("toast"); t.textContent = m; t.classList.add("on");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 1800); };

// Android 전용. 저장 = 그냥 다운로드가 제일 확실하다 — Chrome이 /Download에 받고 갤러리에 잡혀서
// 인스타 피커에 뜬다. (공유시트는 OEM마다 '갤러리 저장'이 있기도 없기도 해서 기본으로 쓰지 않는다)
function download(name) {
  const a = document.createElement("a");
  a.href = "/f/" + encodeURIComponent(name) + "?dl=1";
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  toast("다운로드 시작 — 갤러리 ‘Download’");
}

// 공유는 보조: 인스타로 바로 보내고 싶을 때. 지원되는 기기에서만 버튼을 띄운다.
async function share(name) {
  try {
    const res = await fetch("/f/" + encodeURIComponent(name));
    const blob = await res.blob();
    const file = new File([blob], name, { type: blob.type });
    if (!(navigator.canShare && navigator.canShare({ files: [file] }))) return download(name);
    await navigator.share({ files: [file] });
  } catch (e) {
    if (e && e.name === "AbortError") return;
    download(name);
  }
}

async function copy(key) {
  const text = document.getElementById("cap-" + key).textContent;
  try { await navigator.clipboard.writeText(text); toast("캡션 복사됨"); }
  catch { const r = document.createRange(); r.selectNodeContents(document.getElementById("cap-" + key));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("길게 눌러 복사하세요"); }
}

document.addEventListener("click", (e) => {
  const d = e.target.closest("[data-dl]"); if (d) return download(d.dataset.dl);
  const s = e.target.closest("[data-share]"); if (s) return share(s.dataset.share);
  const c = e.target.closest("[data-copy]"); if (c) return copy(c.dataset.copy);
});

// 공유 버튼은 실제로 파일 공유가 되는 기기에서만 노출
if (navigator.canShare && navigator.canShare({ files: [new File([new Blob([1])], "a.mp4", { type: "video/mp4" })] })) {
  document.querySelectorAll("button.share").forEach((b) => (b.hidden = false));
}
</script></body></html>`;
}

const { reels, slides, files } = await collect();
if (!reels.length && !slides.length) {
  console.error(
    "\n[에셋 서버] 렌더된 에셋이 없습니다.\n" +
      '  캐러셀:  GLOBAL_MODULES="$(npm root -g)" node marketing/render-carousel.mjs\n' +
      "  릴스:    bash marketing/reel/assemble.sh   (marketing/README.md 참조)\n",
  );
  process.exit(1);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return res.end(page({ reels, slides }));
  }
  if (url.pathname.startsWith("/f/")) {
    const name = decodeURIComponent(url.pathname.slice(3));
    const path = files.get(name); // 화이트리스트에 있는 이름만 — 경로 조작 차단
    if (!path) {
      res.writeHead(404);
      return res.end("not found");
    }
    const { size } = await stat(path);
    const type = MIME[extname(name)] ?? "application/octet-stream";
    // ?dl=1 일 때만 첨부(폴백 다운로드). 기본은 인라인이라야 폰에서 미리보기가 뜬다.
    const disp = url.searchParams.get("dl") ? `attachment; filename="${name}"` : "inline";

    // Range 지원은 필수 — iOS Safari는 <video>에 Range 요청을 보내고 206을 받아야 재생한다.
    // 200으로 통째로 주면 폰에서 미리보기가 안 뜬다.
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start >= size || start > end) {
        res.writeHead(416, { "content-range": `bytes */${size}` });
        return res.end();
      }
      res.writeHead(206, {
        "content-type": type,
        "content-range": `bytes ${start}-${end}/${size}`,
        "content-length": end - start + 1,
        "accept-ranges": "bytes",
        "content-disposition": disp,
      });
      return createReadStream(path, { start, end }).pipe(res);
    }

    res.writeHead(200, {
      "content-type": type,
      "content-length": size,
      "accept-ranges": "bytes",
      "content-disposition": disp,
    });
    return createReadStream(path).pipe(res);
  }
  res.writeHead(404);
  res.end("not found");
});

server.listen(PORT, "0.0.0.0", async () => {
  const ip = lanAddress();
  if (!ip) {
    console.error("LAN IP를 찾지 못했습니다. Wi-Fi에 연결돼 있는지 확인하세요.");
    process.exit(1);
  }
  const url = `http://${ip}:${PORT}`;
  console.log(await QRCode.toString(url, { type: "terminal", small: true }));
  console.log(`  📱 폰으로 스캔:  ${url}`);
  console.log(`  릴스 ${reels.length}편 · 캐러셀 ${slides.length}장`);
  console.log(`  폰과 PC가 같은 Wi-Fi여야 합니다. 안 열리면 Windows 방화벽에서 Node 허용.`);
  console.log(`  Ctrl+C 로 종료 (임시 서버 — 전송 끝나면 끕니다)\n`);
});
