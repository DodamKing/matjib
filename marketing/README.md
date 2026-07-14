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
- 앱 **재녹화**할 때만: 레포 루트에 `.env.local`(실 API 키) + `npm run dev` 필요.
  카드·캐러셀 렌더와 릴스 조립은 키 불필요.

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
- 컷 길이·크롭·타임스탬프는 `assemble.sh` 상단 변수/인자에서 조정.
- 인스타 업로드 시 **트렌딩 오디오는 직접** 얹는다(무음 출력).

## 앱 화면 재녹화 (키 필요, 보통 불필요)
```bash
npm run dev                                   # 레포 루트, .env.local 필요
GLOBAL_MODULES="$(npm root -g)" node marketing/record-reel.mjs   # → reel/out/reel-shuffle.webm
bash marketing/reel/prep-recording.sh         # webm → 트림·1080폭 reel-shuffle.mp4
```

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
| `reel/reel-shuffle.mp4` | 편집용 녹화 원본 (out/ 바깥) | **커밋** |
| `*/out/**` (PNG·최종 릴스 mp4·raw webm) | 렌더 결과물 전부 | 제외 (out/ 통째) |
