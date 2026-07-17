# marketing/ — 릴스·캐러셀 생성 파이프라인

인스타 릴스/캐러셀 에셋을 **코드로 재생성**한다. 기획·카피는 `docs/MARKETING_REELS.md`·`docs/MARKETING_CAROUSEL.md` 참조.

> **git 경계**: 소스(이 HTML·스크립트)와 편집용 녹화 원본 `reel/out/reel-shuffle.mp4`는 **커밋**한다.
> 렌더로 다시 만들어지는 결과물(슬라이드 PNG·카드 PNG·최종 릴스 mp4·raw webm)은 `.gitignore`로 제외 → 다른 PC에서 pull 후 재생성.
> 마케팅 폴더는 Next 빌드가 서비스하지 않으므로(app/·public/만) 배포에 노출되지 않는다.

## 사전 준비 (다른 PC에서 처음 할 때)
- **Node + `npm install`** (레포 루트)
- **Playwright 글로벌 설치**: `npm i -g playwright && npx playwright install chromium`
  (스크립트는 `GLOBAL_MODULES="$(npm root -g)"` 로 글로벌 모듈을 참조)
- **ffmpeg** (릴스 조립·프레임 추출)
- 앱 **재녹화**할 때만: 레포 루트에 `.env.local`(실 API 키) + **프로덕션 서버**
  (`npm run build && npm start`) 필요. **dev 서버로 녹화하지 말 것** — Next.js dev 인디케이터(N 배지)가
  영상에 찍힌다(`record-reel.mjs`가 감지해서 중단시킨다). 카드·캐러셀 렌더와 릴스 조립은 키 불필요.

## 캐러셀 재생성 (7장 PNG)
```bash
# 문구는 marketing/carousel/slides.html 수정
GLOBAL_MODULES="$(npm root -g)" node marketing/render-carousel.mjs
# → marketing/carousel/out/slide-1..7.png
```

## 릴스 재생성 (무음 mp4 3개)
```bash
# 1) 훅/CTA 문구는 marketing/reel/cards.html 수정 후 카드 렌더
GLOBAL_MODULES="$(npm root -g)" node marketing/reel/render-cards.mjs
# → marketing/reel/out/card-r1h..r3c.png

# 2) 카드 + 앱 셔플 화면(reel-shuffle.mp4) 조립
bash marketing/reel/assemble.sh
# → marketing/reel/out/reel_1_travel.mp4 / reel_2_moving.mp4 / reel_3_appointment.mp4
```
- 컷 길이·타임스탬프는 `assemble.sh` 상단 변수/인자에서 조정. **크롭은 없다** — 녹화가 이미 9:16.
- 앱 컷은 "롤(0.8s) → 3곳 정지(2.4s)" 사이클에 맞춰 자른다. **롤 도중에 끝나면 안 된다**(3곳을 못 보여줌).
- 인스타 업로드 시 **트렌딩 오디오는 직접** 얹는다(무음 출력).

## 앱 화면 재녹화 (키 필요, 보통 불필요)
```bash
npm run build && npm start                    # 레포 루트, .env.local 필요. dev 서버 금지(N 배지)
GLOBAL_MODULES="$(npm root -g)" node marketing/record-reel.mjs   # → reel/out/reel-shuffle.webm (576x1024)
bash marketing/reel/prep-recording.sh         # webm → 트림·1080x1920 정규화 → reel-shuffle.mp4
```
- 뷰포트는 **576×1024(9:16)** 고정. 폰 비율(390×844)로 찍으면 조립 때 잘라내야 하고, 실제로 헤더
  태그라인과 모드·도보 탭이 잘려나갔다. 자세한 근거는 `docs/DECISIONS.md` D23.
- `recordVideo.size`는 **뷰포트와 같아야 한다**(playwright는 페이지를 축소만 하고 확대하지 않음 —
  키우면 좌상단에 원본 크기로 박히고 나머지가 회색이 된다). 1080폭 확대는 `prep-recording.sh`가 한다.

## 검수 (필수 — "파일이 생겼다"는 확인이 아니다)
릴스는 **1080×1920 프레임 전체를 눈으로** 볼 것. 축소 타일·샘플 몇 장으로는 잘림과 여백을 놓친다
(실제로 두 번 놓쳤다). 최소한 아래 3개를 본다:
```bash
cd marketing/reel/out
ffmpeg -ss 5 -i reel_1_travel.mp4 -frames:v 1 /tmp/f.png    # 앱 구간 프레임 전체
```
- ① 앱이 프레임을 가장자리까지 채우는가(회색 여백 = `recordVideo.size` 오설정)
- ② N 배지가 없는가(= dev 서버로 녹화함)
- ③ 헤더 두 줄 + 3카드 + 모드·도보 탭이 다 보이는가

## 폰으로 전송 (업로드 직전)
업로드는 **폰에서** 해야 한다 — 트렌딩 오디오는 인스타 앱에서만 얹을 수 있다. 이 서버가 QR·저장·캡션 복사까지 해준다.
```bash
node marketing/serve-assets.mjs      # 터미널에 QR → 폰으로 스캔 (같은 Wi-Fi). Ctrl+C로 종료
```
- **Android 대상**. 저장 = Chrome 다운로드 → 갤러리 `Download` 앨범 → 인스타 피커에 뜬다.
- 캡션은 `docs/MARKETING_REELS.md`·`MARKETING_CAROUSEL.md`의 게시용 캡션과 **같아야 한다**
  (문서가 원본 — 문구를 바꾸면 문서를 먼저 고치고 `serve-assets.mjs`로 옮긴다).
- 안 열리면: 폰·PC가 같은 Wi-Fi인지 → Windows 방화벽에서 Node 허용.
- **임시 서버다.** 전송 끝나면 끈다(상시 실행 금지). 배포에 포함되지 않는다(Next는 `app/`·`public/`만 서비스).

## 파일
| 경로 | 역할 | git |
|---|---|---|
| `carousel/slides.html` | 캐러셀 7장 목업 | 커밋 |
| `render-carousel.mjs` | 슬라이드 → PNG | 커밋 |
| `reel/cards.html` | 릴스 훅/CTA 카드 | 커밋 |
| `reel/render-cards.mjs` | 카드 → PNG | 커밋 |
| `record-reel.mjs` | 앱 화면 녹화(Playwright) | 커밋 |
| `reel/prep-recording.sh` | webm → 편집용 mp4 | 커밋 |
| `reel/assemble.sh` | 카드+앱 → 릴스 mp4 | 커밋 |
| `serve-assets.mjs` | 폰 전송용 임시 서버(QR·저장·캡션 복사) | 커밋 |
| `reel/reel-shuffle.mp4` | 편집용 녹화 원본 (out/ 바깥) | **커밋** |
| `*/out/**` (PNG·최종 릴스 mp4·raw webm) | 렌더 결과물 전부 | 제외 (out/ 통째) |
