# 작업 로그

새 세션은 이 파일을 먼저 읽고 이어서 작업한다. 최신 항목이 맨 위.
형식: `## YYYY-MM-DD` 아래에 한 일 / 현재 상태 / 다음 할 것.

> 역할 구분: **DECISIONS** = 왜(결정·근거) / **ROADMAP** = 무엇을 어떤 순서로 / **WORKLOG** = 실제로 무엇을 했고 지금 어디까지.

---

## 2026-07-17 — 검색 색인 준비: 네이버·구글 소유확인 + robots/sitemap
**한 일**
- **소유확인 메타 2종**: `app/layout.tsx` metadata `verification`에 네이버(`other["naver-site-verification"]`)와
  **구글 서치콘솔**(`verification.google`) 추가 → `<meta name="naver-site-verification" ...>` / `<meta name="google-site-verification" ...>` 렌더.
  소유확인 통과 후에도 태그는 **유지**해야 함(지우면 해제됨).
- **`app/robots.ts` 신규**: 전체 Allow, `/api/`·`/share/` Disallow(공유 URL은 개인 처방전 일회성 링크 — 색인 대상 아님,
  OG 미리보기는 크롤 없이 동작), `Sitemap: {siteUrl}/sitemap.xml` 명시.
- **`app/sitemap.ts` 신규**: 랜딩 `/` 한 건(결과 화면은 위치 기반 클라 상태라 URL 없음).
- **`lib/site.ts` 신규**: `resolveSiteUrl()`/`siteUrl`을 layout에서 분리 — robots·sitemap·layout 3곳이 공유(중복 제거).

**현재 상태**
- 로컬 dev(`SITE_URL=https://matjib.dimad.kr`)에서 전부 실측 확인: robots.txt·sitemap.xml 정상 출력, 홈 HTML에 네이버·구글 메타 2종 존재. `tsc --noEmit` 통과.

**다음 할 것 (사용자 액션)**
1. 배포(push→Vercel) 후 **네이버 서치어드바이저 / 구글 서치콘솔 양쪽에서 "소유확인"** 클릭 → 사이트 등록.
2. 양쪽에 **사이트맵 제출**: `https://matjib.dimad.kr/sitemap.xml` (네이버는 요청 메뉴에서 robots.txt 검증도 함께).
3. Vercel 환경변수 `SITE_URL=https://matjib.dimad.kr` 세팅 여부 재확인(미설정 시 robots/sitemap이 vercel.app 도메인으로 나감).

---

## 2026-07-14 — 마케팅: 캐러셀 기획·목업·렌더 + 릴스 앱화면 녹화(로컬)
**한 일**
- **캐러셀(넘기는 이미지) 신규**: 릴스=도달/감정, **캐러셀=저장/이해(제품 철학 '안 하는 것' 설명)** 로 역할 분담.
  기획·카피 7장 → `docs/MARKETING_CAROUSEL.md`(커밋). 슬라이드 골격: 훅→문제공감→리프레임("어디 갈지를 못 정하는 것")
  →해결(위치1번·걸어서5~15분·딱3곳)→안 하는 3가지(순위X/광고X/가입X)→작동방식(거리+적합도+공정셔플)→CTA(matjib.dimad.kr).
- **목업·렌더**: `marketing/carousel/slides.html`(브랜드 amber-50/orange-500) → Playwright(글로벌)로 **1080×1350 PNG 7장** 렌더.
- **릴스 앱화면 녹화**: dev 서버(백그라운드) + Playwright 모바일뷰(390×844)·강남역 좌표 목업으로 **위치동의→셔플 5회→카페 전환**
  플로우를 **실데이터로 녹화** → ffmpeg로 트리밍·1080폭 mp4(17s). 녹화 후 백그라운드 서버 정리.
- **git 경계(재현성·무관리)**: 다른 PC에서 pull 후 수정·재생성하려고, **소스(HTML·스크립트)와 편집용 녹화 원본
  `reel/reel-shuffle.mp4`(out/ 바깥)는 커밋**. 렌더 결과물은 전부 `out/`에 떨어지므로 **`.gitignore`는 `*/out/` 통째 제외**
  → 앞으로 뭘 새로 렌더하든 out/로 가서 .gitignore 재관리 불필요. 재생성 방법·사전준비는 `marketing/README.md`(커밋).
  앱 재녹화만 `.env.local`(키) 필요, 카드/캐러셀 렌더·릴스 조립은 키 불필요. (커밋 바이너리는 mp4 1개 3.4MB뿐, 재녹화 때만 갱신)
- **주의**: `PushNotification`은 텍스트 전용 → mp4·PNG는 폰 자동전송 불가, 로컬 경로로 전달.

- **A안 릴스 3개 완성**: 촬영 없이 **훅/CTA 텍스트 카드(1080×1920) + 앱 셔플 실화면**을 ffmpeg로 이어붙여 무음 mp4 3개
  (여행/이사=밥집, 약속=카페, 각 ~10~12s). 앱 구간은 녹화본에서 세로 크롭(하단 네이버 N로고 제거). 트렌딩 오디오는 업로드 때 사용자가 얹음.
  (`marketing/reel/cards.html`·`render-cards.mjs`·`assemble.sh`, `docs/MARKETING_REELS.md` E절)

**현재 상태**
- 산출물(로컬, gitignore):
  - 캐러셀 `marketing/carousel/out/slide-1..7.png`
  - 릴스 `marketing/reel/out/reel_1_travel.mp4`·`reel_2_moving.mp4`·`reel_3_appointment.mp4` (+카드 `out/card-r*.png`, raw `out/reel-shuffle.webm`)
  - 편집 원본(커밋): `marketing/reel/reel-shuffle.mp4`
- 재생성 스크립트(로컬): `marketing/render-carousel.mjs`, `marketing/record-reel.mjs`, `marketing/reel/render-cards.mjs`, `marketing/reel/assemble.sh`
  (실행: `GLOBAL_MODULES="$(npm root -g)" node marketing/…`).
- 커밋 대상: `docs/MARKETING_CAROUSEL.md`, `docs/MARKETING_REELS.md`(E절), `.gitignore`, 이 WORKLOG,
  `marketing/README.md` + 소스(`carousel/slides.html`, `reel/cards.html`, `render-carousel.mjs`, `reel/render-cards.mjs`,
  `record-reel.mjs`, `reel/assemble.sh`, `reel/prep-recording.sh`) + 편집 소스 `reel/out/reel-shuffle.mp4`.

**다음 할 것**
- 사용자: 캐러셀 PNG·릴스 mp4 3개 육안 확인 → 인스타 게시(릴스는 트렌딩 오디오 얹기, 캐러셀 1개는 프로필 고정핀 후보).
- (선택) 반응 좋은 훅은 B안(실사+앱)으로 업그레이드, 셔플 롤 구간만 잘라 루프 클립화.

## 2026-07-13 (추가) — 결과 화면 재배치(셔플 한 뷰에) + 태그 접기 + 공유 복사 폴백 (D20)
**한 일**
- **문제(사용자)**: 셔플 눌러도 3장 롤이 한 화면에 안 담김 — 위에 헤더+모드+태그(여러 줄)+도보가 공간을 다 먹어 카드·셔플이
  아래로 밀림. 셔플 애니메이션(D19)이 안 보이면 무의미.
- **수정(최종 Config B)**: 결과 화면에서 **카드덱+셔플+공유를 헤더 바로 아래(화면 위)로** 올리고, 모드/도보/상황태그는
  데크 아래로. **헤더(큰 2줄)·태그(펼침)는 그대로 유지** — 데크가 위면 아래 컨트롤 크기는 fit에 무관해서, 처음 했던
  슬림헤더+태그접기는 과해서 폐기(사용자 지적). `app/page.tsx` 재구성.
- **공유 버그 수정**: 폰 LAN(http)에선 `navigator.clipboard` 미존재라 복사 실패 → `execCommand` 폴백 + 최후 `window.prompt`.
- **검증**: build 통과, Playwright 실측 — 셔플버튼 하단 y=622(<844, 아이폰 SE 667도 OK), 태그 펼침 표시. 스크린샷 육안 확인. (DECISIONS D20)

## 2026-07-13 (추가) — 셔플 슬롯머신 롤 애니메이션 (D19)
**한 일**
- 셔플/새 결과 시 3장이 즉시 툭 바뀌던 걸 **pool을 빠르게 굴리다 슬롯별 순차 정지(1→2→3, ~0.8초) + 정지 pop** 연출로.
  `components/CardDeck.tsx`가 `pool` 받아 `setInterval`(70ms)+`sample`로 플래시, `app/globals.css`에 `card-settle` 키프레임.
  `prefers-reduced-motion`이면 즉시. 롤 중 탭 방지·버튼 "🎰 뽑는 중…"(비활성).
- **왜**: 릴스 전략(D18)의 "돌다 멈추는 순간=훅"이 화면에 없던 마케팅 병목 해소 + "대신 정해준다" 리추얼 각인. (DECISIONS D19)
- **검증**: tsc/build 통과, Playwright 5/5(롤 중 상호 4회 변화→정지 고정, 버튼 전환/복귀), 정지 화면 육안 확인.

## 2026-07-13 (추가) — 제품 컨셉 재정의 "낯선 동네에서 어디 가지" + 카피 전면 개편 (D18)
**한 일**
- **컨셉 못박음**: 사용자가 "이건 메뉴 골라주는 앱이 아니라, **낯선 동네에서 걸어서 갈 만한 곳을 검색 없이 찾아주는**
  앱"이라고 정정 → DECISIONS **D18** 신설. 타깃 = 여행/출장·이사·약속 장소·낯선 지역.
- **카피 개편(서브에이전트 토론)**: 카피라이터 3방향(실용/위트/대담) 병렬 + 심사역 채점·합성.
  - 헤더 = **"맛집 안 찾아줍니다. 갈 데를 정해줍니다."** / 서브 = "낯선 동네에서 검색·비교 없이, 걸어서 갈 식당 3곳만."
    (안전 폴백 "📍 낯선 동네, 걸어서 갈 3곳").
  - 반영: `app/page.tsx`(헤더·서브·로딩·셔플/공유 버튼·share text), `app/layout.tsx`(OG 제목/설명),
    `components/LocationGate.tsx`·`CardDeck.tsx`(버튼), `app/share/[rx]/page.tsx`·`opengraph-image.tsx`(점심/처방→낯선 동네 3곳),
    `README.md`·`CLAUDE.md` 인트로. '처방/클리닉/점심/AI 결정장애' 프레임 제거.
- **릴스 플레이북 재작성**: `docs/MARKETING_REELS.md`를 여행/이사/약속 상황 대본 3개로 교체(+대본 속 "AI가"→"앱이" 정직 교정).
- **정직 유지**: "AI가 추천/맛 평가" 주장 없음(규칙 필터+공정 셔플).

**현재 상태**: 컨셉·카피·공유·릴스 문서까지 일관 정렬. `tsc`/`build`/Playwright 재검증 예정 → 커밋.

## 2026-07-13 (추가) — 처방전 공유 링크 + OG 이미지(바이럴 루프) + 릴스 플레이북 (D17)
**한 일**
- **공유 기능(바이럴 증폭기)**: 결과 3곳을 **링크로 공유** → 열면 **그 3곳 재현(읽기전용) + "나도 받기" CTA**(옵션 A).
  - `lib/shareLink.ts`: 3곳을 **URL(base64url)에 인코딩/디코딩** — DB·세션 없이 링크가 곧 데이터.
  - `app/share/[rx]/page.tsx`(서버): 읽기전용 뷰 + 길찾기 + CTA. `generateMetadata`로 OG 제목/설명에 상호명
    (카톡 미리보기 훅) + `noindex`(무작위 UGC라 색인 대신 미리보기만 — 사용자와 색인 논의 결론).
  - `app/share/[rx]/opengraph-image.tsx` + `lib/ogFont.ts`: 카톡/SNS 붙여넣기 미리보기 이미지(1200×630 3장 카드).
    satori가 한글 못 그려서 **Pretendard OTF 런타임 fetch+캐시**로 해결. (path param이라 OG 이미지도 같은 payload 수신)
  - `app/page.tsx`: "💊 이 처방전 공유하기" 버튼 — `navigator.share`(모바일)→클립보드 복사 폴백.
- **검증**: `tsc`/`build` 통과. **Playwright 8/8**(공유버튼→클립보드 URL→공유페이지 3장·길찾기·CTA→OG 200/image),
  OG 이미지 **한글 렌더 육안 확인**(레이아웃 넘침·헤더겹침 수정까지).
- **릴스 마케팅 리서치**(병행, 서브에이전트): 터지는 숏폼 공식 + **즉시 촬영 대본 3개** + 운영 팁 → `docs/MARKETING_REELS.md`.
  (촬영·게시는 사용자 몫. 릴스=씨앗, 공유 링크=증폭기.)
- **색인 판단(사용자 제기)**: 공유 링크 = 무작위 3곳 조합이라 검색 색인은 thin/doorway 위험 → **noindex**. SEO는
  향후 큐레이션 지역 랜딩("강남역 맛집")으로 별도.

**현재 상태**: D16(뒤로가기)+D17(공유·릴스) 완료·검증. 배포는 사용자가 push 후. **이번 커밋에 D16+배포문서+D17 묶음.**

## 2026-07-13 (추가) — 배포 라이브 확인 + 백로그 정리 + 뒤로가기 UX 이슈 발견
**한 일 / 확인**
- **배포 라이브**: Vercel 배포 완료 + 커스텀 도메인 `matjib.dimad.kr` 연결 라이브(사용자 확인). 인터랙티브 지도(D12)도 실동작.
  → ROADMAP Phase 4 완료 처리. 남아있던 선택 항목 2개(도보 경로선·kakao fallback)는 **불필요로 종결**.
- **뒤로가기 UX 수정 완료(D16)**: `PlaceSheet`·`MapModal`이 브라우저 히스토리 미연동이라 폰 뒤로가기가 오버레이만
  닫는 게 아니라 페이지를 이탈시키던 문제 해결. `lib/useHistoryDismiss.ts` 신설(두 오버레이 공통 훅): 열 때
  `pushState`(단조 id), `popstate`로 "내 칸"이 빠질 때만 onClose(중첩=시트 위 지도에서 하나씩 닫힘), 버튼/ESC로
  닫으면 `history.back()`으로 칸 소비(잔여 히스토리 없음). StrictMode(dev) mount→unmount→mount 리허설도
  pendingConsume 슬롯으로 흡수(자기 자신 닫힘 방지). **Playwright 12/12 통과 — dev(StrictMode)·prod 양쪽**
  (시트 뒤로가기, 중첩 지도 뒤로가기, 버튼 닫기 후 잔여 히스토리 없음까지).

**현재 상태**: 기능·배포·뒤로가기 UX 전부 완료. 바이럴 시책(공유 처방전 카드 등)은 논의 중.

## 2026-07-13 — 도보 시간 = 누적 반경 → 겹치지 않는 구간(밴드) (D14)
**한 일**
- **문제**: 5/10/15분 버튼이 0부터 누적되는 최대 반경(300/600/1000m)이라, 강남역처럼 밀집한 상권에선
  어떤 버튼을 눌러도 풀이 거리 0부터 시작 → 거의 다 **도보 1분 미만**만 뽑혀 버튼이 무의미.
- **수정**: 겹치지 않는 **도보 구간(밴드)**으로 전환 — 5분=0~5분 이내 / 10분=5~10분 / 15분=10~15분.
  - `lib/walkBands.ts` **신설**(단일 원천): `WALK_BANDS`(band·label·minMin·maxMin·radiusM), `resolveBand`,
    `inBand`(minMin<walkMin<=maxMin), `DEFAULT_BAND=10`.
  - 타입 `WalkRadius(300|600|1000)` → `WalkBand(5|10|15)`, 요청 필드 `radius` → `band` (`types/index.ts`).
  - `lib/shuffle.ts` `buildPool`: `meters<=radius` → 밴드 walkMin 구간 필터. `lib/sangwon.ts` `searchInRadius`:
    조회 반경을 밴드 상한 커버값(450/850/1250m)으로 받음(number). `app/api/recommend/route.ts`: band 검증+resolveBand.
  - `app/page.tsx`: 상태 `radius`→`band`, 버튼을 `WALK_BANDS`로 렌더, 빈결과 문구 "이 도보 구간엔 없어요".
- **검증**: `tsc --noEmit` 통과. dev(3000) 라이브 `/api/recommend` 강남역 3밴드 실측 —
  band5 walkMin `[1~1]` / band10 `[6~6]` / band15 `[11~11]`로 **겹침 없이 구간별로 분리** 확인. (Claude가 띄운 dev 서버는 정리함.)

**이어서 (같은 날, 사용자 피드백 반영) — D15**
- **밀집지 처리(핵심)**: "5분 버튼인데 강남역은 1분만 나온다" 지적 반영. 원인 = 밴드 안에서 다시 **최근접 20개**로
  잘라 밀집지는 1분대가 20개를 다 차지. → `lib/shuffle.ts`에 `sample()`(Fisher–Yates n개) 추가, `route.ts`가
  최근접 대신 **밴드 내 공정 랜덤 20**을 풀로. 실측: band5 pool 분값 `[1~5]`, band10 `[6~10]`, band15 `[11~15]`
  — 5분 버튼이 1·2·3·4·5분 섞여 처방됨 확인.
- **"AI" 표기 정리(문구만, A안)**: 실제는 규칙 필터라, 사용자 노출 카피에서 "AI가 처방"의 AI 제거
  (`app/layout.tsx` OG 설명, `README.md` 태그라인). "처방/클리닉" 톤·프로젝트명은 유지. (진짜 AI화는 D5/D10 충돌로 미채택.)
- **지도 미리보기 로딩(4번)**: (1) `PlaceSheet` 이미지에 **로딩 스피너** + `onLoad` 페이드인, place 바뀔 때 상태 리셋.
  (2) `app/api/staticmap`을 **edge/서울 리전**으로(콜드스타트↓). (3) 요청 이미지 600×320→**440×176**(박스 대비 과대라 바이트만 낭비였음).
- **도보 경로선 = 최종 보류/종결**: 조사 결과 **NAVER는 도보 경로 API 자체가 없음**(자동차 전용). 이전 WORKLOG의
  "NAVER 도보 API 필요"는 오기. Tmap 보행자 API(무료 1,000건/일, 별도 키)가 유일 옵션이나 미니멀 원칙 대비 과투자라
  안 그림. 두 점 표시 + 기존 내비앱 딥링크로 종결. (DECISIONS D15)

**현재 상태**
- D14(밴드) + D15(밴드 내 랜덤·문구·지도로딩) 완성, `tsc` 통과, 강남역 런타임 검증 완료. 도보 경로선은 종결(안 함).
- 문서 동기화: DECISIONS D14·D15, ARCHITECTURE, STRUCTURE, MVP_SCOPE, WORKLOG.
- 미커밋(사용자 요청 시 묶어 커밋). push는 사용자가.

**결정 마무리**
- #4 프리페치: **안 함(스피너로 충분)** — 사용자 확정. 지도 로딩 개선은 스피너+edge+이미지축소 선에서 종결.
- 남은 미커밋 변경은 사용자 요청 시 D14+D15 묶어 한 커밋으로.

## 2026-07-10 (추가) — 클론 세팅 + 후원 기능 철회(무료 유지, D13 개정)
**한 일**
- **개발환경 세팅**(새로 클론): `npm install`(361 pkg) → `.env.local` 생성 후 사용자가 키 입력
  (`SANGWON_API_KEY` + NCP 지도 키 4종) → `tsc`·`next build`·실 `/api/recommend` 200(강남역 3카드) 검증.
- **후원 수익화 재검토 → 전면 철회**. 경위:
  - 토스아이디로 후원 링크를 붙이려다, **토스아이디(`toss.me`) 서비스가 종료**된 것을 확인(미인증 익명송금
    범죄악용 우려, 대체 미출시). 이게 실명·계좌 둘 다 가려주던 유일 수단이었음.
  - 대안 조사: 카카오페이/토스 "돈 받기" 링크(=결제 API 아님, 송금 링크)는 **실명 노출**. BMC는 한국 payout
    미지원, Ko-fi는 USD·국내 전환율 바닥, GitHub Sponsors는 정산되나 후원자=개발자 한정. 국내 개발자 후원은
    실질 수익 없는 상징 수준.
  - 결론(사용자): **후원 제거 + 무료 유지**. 트래픽 크면 애드센스만 향후 고민. (인스타 캐러셀/릴스로 유입은 별개 마케팅)
- **제거**: `components/SupportButton.tsx` 삭제, `app/page.tsx` 마운트/import 제거, `.env.example`·`.env.local`의
  `NEXT_PUBLIC_SUPPORT_URL` 제거.
- **문서**: DECISIONS **D13 개정**(후원 무산 경위+무수익화 결론), STRUCTURE(컴포넌트·env 행 삭제),
  MVP_SCOPE(IN 후원 삭제, OUT에 "후원/수익화" 명시).

**현재 상태**
- 후원 흔적 완전 제거. 앱은 무광고·무수익·원클릭 상태로 더 순수해짐. `tsc`/`build` 통과, 런타임 정상.
- 미커밋(사용자 요청 시 묶어 커밋). push는 사용자가.

## 2026-07-10 — 후원 버튼 「💉 개발자 카페인 수혈」 (수익화 D13)
**한 일**
- 수익화 논의: 애드센스 vs Buy Me a Coffee → **애드센스 미채택, 후원 링크 버튼 채택**(원칙 `광고 없음`·
  Zero-Scroll·원클릭과 충돌 없음). 결정 근거 **DECISIONS D13** 신규.
- 카피 = **「💉 개발자 카페인 수혈」**(클리닉 톤), 구현 = **외부 송금 링크만**(toss.me/카카오페이). PG·키·서버 0.
- `components/SupportButton.tsx` 신설: 푸터 후원 버튼. `NEXT_PUBLIC_SUPPORT_URL`(공개 송금 링크) **있을 때만 렌더**.
  `app/page.tsx`에 `<SupportButton/>` 마운트(3카드 상호작용엔 개입 없는 조용한 푸터).
- `.env.example`에 `NEXT_PUBLIC_SUPPORT_URL` 추가(공개 링크라 시크릿 아님 — D6 위배 아님).
- 문서: DECISIONS D13, STRUCTURE(컴포넌트·env 행), MVP_SCOPE(IN 추가 + OUT 결제항목에 후원 링크 예외 명시).
- 검증: `tsc --noEmit` 통과.

**현재 상태**
- 코드 완성. **버튼은 아직 화면에 안 뜸** — `NEXT_PUBLIC_SUPPORT_URL` 미설정이라 의도적으로 숨김.

**송금 수단 결정(2026-07-10)**: **토스 아이디(Toss ID)** 채택 — 계좌번호·실명 둘 다 후원자에게 비노출(카카오페이는
  실명 노출 불가피). 토스 표시 닉은 **전역 하나뿐**이라 프로젝트 전용("맛집 클리닉") 대신 **범용 개인 핸들**로,
  프로젝트 감성은 버튼 카피가 담당. 후원 전용 계좌 권장(대포통장 격리). 근거 DECISIONS D13.

**다음 할 것 (사용자 액션)**
- 토스에서 **토스 아이디 받기 링크** 생성(표시 닉=범용 개인 핸들) → `.env.local`의 `NEXT_PUBLIC_SUPPORT_URL`에 넣기 →
  로컬에서 버튼 노출 확인. 배포 시 **Vercel 환경변수에도 동일 값** 세팅(`NEXT_PUBLIC_*`는 빌드타임 주입).

## 2026-07-09 (추가) — 메타데이터 커스텀 도메인(`matjib.dimad.kr`) 고정
**한 일**
- `app/layout.tsx` 메타데이터 강화: 이전 세션이 넣은 `metadataBase` 폴백에 **두 약점**을 수정 —
  (1) `SITE_URL`을 프로토콜 없이 넣으면 `new URL()` 크래시 → `resolveSiteUrl()`로 `https://` 자동 보강 + 끝 슬래시 제거,
  (2) `metadataBase`만 있고 canonical/OG/twitter 부재 → `alternates.canonical`·`openGraph`·`twitter` 추가로 도메인 고정.
- 우선순위: `SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `http://localhost:3000`.
- `.env.local`에 `SITE_URL=https://matjib.dimad.kr` 추가(`.env.example`엔 이미 키 존재).
- 검증: `next build` 후 `next start`(3222)로 head 확인 — canonical·og:url·og:image·twitter:image 전부
  `https://matjib.dimad.kr`. `resolveSiteUrl` 프로토콜 보강 3케이스 통과.

**남은 사용자 액션**: 배포 시 **Vercel 환경변수에도 `SITE_URL=https://matjib.dimad.kr` 세팅** 필요
  (안 넣으면 프로덕션은 `VERCEL_PROJECT_PRODUCTION_URL`=vercel.app으로 폴백). `.env.local`은 배포에 안 나감.

## 2026-07-09 (추가) — 출발/도착 라벨 + 배포 도메인 확정 (D12 확장)
**한 일**
- 인터랙티브 지도 마커를 **출발(파랑)/도착(주황) 글자 라벨**형으로 교체(`MapModal` `pinIcon`), 모달 헤더·정적
  썸네일 범례 문구도 "출발/도착" 명시. 색만으론 헷갈리던 걸 라벨로 해소.
- **실제 도보 경로선(길 모양)은 보류 결정**(사용자 선택 "나중"): NAVER Directions(도보) API 필요 —
  접근 제한/추가 비용이라 별도 작업으로. 지금은 출발·도착 두 지점 표시까지.
- **배포 커스텀 도메인 = `matjib.dimad.kr`** 확정(사용자가 NCP Web 서비스 URL에 등록 완료). DECISIONS D12 반영.
- 검증: `tsc`/`eslint`/`next build` 통과. 인터랙티브 지도 런타임(라벨 렌더)은 도메인 등록된 `matjib.dimad.kr`
  배포 후 확인 예정(localhost는 미등록이라 로컬 authFailure).

## 2026-07-09 (추가) — 지도 탭→전체화면 인터랙티브 지도 (NAVER Dynamic Map, D12)
**한 일**
- 사용자 선택: 시트 정적 썸네일 **탭 → 전체화면 인터랙티브 지도**(핀줌·이동). "지도 JS 키는 노출이 정상이냐"
  질문 정리 → 지도 SDK 키는 **도메인 제한으로 보호되는 공개 키**라 D6/CLAUDE.md의 **명시적 예외**로 결정(D12 신규).
- `components/MapModal.tsx` 신설: NAVER **Web Dynamic Map** 전체화면 오버레이. 스크립트 온디맨드 로드
  (`oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=…`), 식당(주황)·내위치(파랑) 마커, `fitBounds`로 두 점 프레이밍,
  `navermap_authFailure`/에러 시 안내 폴백, ESC·스크롤락.
- `components/PlaceSheet.tsx`: 정적 썸네일을 **탭 가능**(🔍 탭하여 확대)하게 + **"🔵 내 위치 · 🟠 상호" 범례** 추가
  (출발/도착 구분 명확화, Q 대응). `NEXT_PUBLIC_NCP_MAP_CLIENT_ID` 있을 때만 인터랙티브 활성.
- env: `.env.local`/`.env.example`에 `NEXT_PUBLIC_NCP_MAP_CLIENT_ID`(= 같은 Application이면 Static과 동일 Client ID).
- 문서: DECISIONS **D12** 신규, **CLAUDE.md 보안규칙에 지도 SDK JS 키 예외** 카브아웃 추가, STRUCTURE.
- 검증: `tsc`/`eslint`/`next build` 통과. 별도 정적서버(8899)+Playwright로 SDK 실동작 확인 →
  **AUTH_FAILURE**(Client ID 유효, URI `localhost:8899` **도메인 미등록**이 원인). 로더 param `ncpKeyId` 정확 확인.

**현재 상태**
- 코드 완성·빌드 통과. 사용자가 **커스텀 도메인을 붙이고 그 도메인을 NCP Web 서비스 URL에 등록** 완료.
- **배포로 최종 검증 예정**: Vercel에 env 4개(`SANGWON_API_KEY`, `NCP_MAP_CLIENT_ID`, `NCP_MAP_CLIENT_SECRET`,
  `NEXT_PUBLIC_NCP_MAP_CLIENT_ID`) 세팅 후 배포하면 정적 지도(즉시)·인터랙티브 지도(등록 도메인)까지 라이브 확인 가능.
  (`NEXT_PUBLIC_*`는 빌드타임 주입이라 배포 전 세팅 필수. 도메인 등록은 재배포 없이 런타임 반영.)
- 이 커밋에 D11(길찾기 감싸기)·D12(인터랙티브 지도)·문서 동기화까지 묶어 커밋. push는 사용자가.

## 2026-07-09 (추가) — 시트 실지도 미리보기(NCP Static Map) + 모바일 dev 접속 (D11 확장)
**한 일**
- 사용자 결정: 길찾기 시트에 "B안"(실지도 썸네일)까지. 최신 문서 확인 후 **NCP Static Map** 채택
  (Kakao 정적지도는 JS SDK=클라 키라 D6 위배 → 제외).
- `app/api/staticmap/route.ts` 신설: NCP Static Map 서버 프록시. `GET ?plat,plng,ulat,ulng` →
  마커 2점(식당 주황/사용자 파랑) 이미지 반환. **키는 서버에만**(`NCP_MAP_CLIENT_ID/SECRET`).
  키 미설정 시 **501** 반환.
- `components/PlaceSheet.tsx`: 로케이터 영역을 **실지도 `<img>` 우선 + onError 폴백**으로 개편.
  키없음/실패(501·502)면 기존 방향·거리 나침반 로케이터로 자동 폴백 → 앱 안 깨짐.
- `.env.example`에 NCP 키 2개 추가. `next.config.ts`에 `allowedDevOrigins`(핫스팟 192.168.137.1 /
  이더넷 192.168.219.46) — 모바일에서 dev 접속 시 Next16 cross-origin 차단 해제(dev 전용).
- 검증: `tsc`/`eslint`/`next build` 통과. 사용자 dev(3000) 라이브로 `/api/staticmap` **501** 확인
  (=키 전엔 폴백). Next16이 같은 repo 2번째 dev 서버를 막아 별도 캡처 서버는 미기동.
- 모바일 dev 메모: http+IP는 secure context가 아니라 **실 GPS 미동작이 정상** — "강남역 둘러보기"로 테스트,
  실 GPS까지 보려면 `next dev --experimental-https`.

**현재 상태**
- 실지도 미리보기 **라이브 검증 완료**. 사용자가 NCP Static Map 키를 `.env.local`에 넣고 dev 재시작 →
  라우트 200 `image/png`(1200×640), 강남역=파랑·식당=주황 마커 실지도 확인.
- 미커밋.

**NCP 디버깅 로그(실측)**: 처음 401 → 원인은 **구 엔드포인트**. 신 `maps.apigw.ntruss.com/map-static/v2/raster`로 교체해 해결.
  이후 403 → 원인은 마커 **`type:e`**. 둘 다 `type:d`(색상 구분)로 교체해 해결. 라우트의 엔드포인트/마커 확정.

**Dynamic Map 키**: 사용자가 만일 대비 발급해둠. 현재 미사용(용도=인터랙티브 임베드 지도, 클라 JS 키라 D6와 충돌).
  당장 필요 없어 보류 — 향후 "지도 위 경로선/주변 탐색" 같은 기능 갈 때 D6 예외 두고 검토(WORKLOG만 기록, DECISIONS 미변경).

## 2026-07-09 (추가) — 길찾기 in-app 감싸기: PlaceSheet 바텀시트 (D11)
**한 일**
- 문제: 카드 "길찾기"가 곧장 `map.kakao.com` 새 탭으로 튕겨 브랜드 밖 이탈. → **앱 안에서 올라오는
  장소 상세 바텀시트**로 감싸고, 최종 외부 진입만 사용자가 고르게 함(의도된 핸드오프). D11 신규.
- 목업 먼저: 폰 프레임 3단계 플로우 아티팩트로 방향 합의(정적지도 vs 인터랙티브 vs 무지도 3안 제시).
  결정 = **키 없이 v1 먼저, 더 자연스러운 실지도 필요해지면 NCP Static Map 키 추가**.
- `components/PlaceSheet.tsx` 신설(client): 미니 로케이터(방향 나침반+거리+도보) + 상호/업종 + 주소 복사(토스트)
  + 내비앱 선택(카카오맵/네이버지도). 배경 딤·ESC·배경 스크롤 잠금·슬라이드업(reduced-motion 대응).
- `lib/navlinks.ts` 신설: `NAV_APPS` 딥링크 빌더 — 카카오맵 `link/to`(웹·앱), 네이버 `nmap://route/walk`.
  **전부 키 불필요**. 티맵은 차량 내비라 도보 서비스 컨셉과 안 맞아 제외.
- `lib/distance.ts`: `bearingDeg`(방위각) + `compass8`(8방위 한글) 추가 — 실지도 타일 없이 방향 표시(키 0).
- `Card.tsx`: 길찾기 `<a>` 외부링크 → `onOpen(restaurant)` 버튼으로. `CardDeck`·`page.tsx`가 `onOpen`/`openPlace`
  상태로 시트 마운트. `globals.css`에 시트 진입 애니메이션 키프레임.
- 검증: `tsc`/`eslint`/`next build` 통과. dev(3111) 백그라운드 + Playwright 캡처로 **실 공공데이터** 흐름 확인
  (강남 둘러보기 → 카드 길찾기 → 시트: 방향/거리/주소/복사됨✓/내비앱). 폰으로 2장 전송, 서버 정리.

**현재 상태**
- 길찾기가 외부 즉시 이탈에서 **앱 내부 감싸기**로 전환 완료. 지도 미리보기는 방향·거리 로케이터(키 없음)까지.
- 미커밋(사용자 확인 후 커밋 예정). 다음(선택): 더 자연스러운 실지도 → NCP Static Map 키 발급 후 `/api/staticmap` 프록시.

## 2026-07-09 (추가) — 검색 모드 밥집/카페/술집 (D10)
**한 일**
- 문제 발견: 음식 대분류(I2)에 카페(비알코올)·주점(술집)이 섞여 밥집 검색에 커피숍이 뜸.
- 상단 **모드 토글(🍚밥집/☕카페/🍺술집, 기본 밥집)** 추가. `lib/modes.ts` 신설 —
  소분류명으로 3모드 분리(카페=카페·빵/도넛·아이스크림/빙수, 술집=주점 4종, 나머지=밥집) + 모드별 태그.
- `lib/tags.ts`: `SITUATION_TAGS` → `MEAL_TAGS`/`CAFE_TAGS`/`BAR_TAGS`로 분리('가볍게'에서 카페 키워드 제거).
- `lib/match.ts`: `filterByTags(pool, ids, tags)`로 일반화(모드 태그셋 인자).
- `app/api/recommend`: 요청에 `mode` 추가 → `buildPool` 후 `mode.match`로 업종 분리 → 모드 태그 필터.
- `app/page.tsx`: 모드 상태·토글 UI, 모드 전환 시 태그 초기화, `MODES[mode].tags`를 SituationInput에 주입.
  `SituationInput`은 `tags` prop을 받도록 변경. 빈결과 문구도 모드명 반영.
- **`lib/persona.ts` 삭제**: 헤더/태그칩과 중복이라 미사용 확정(D5 페르소나 항목 폐기, D10).
- 검증: `tsc`/`eslint`/`next build` 통과. 라이브 캡처로 3모드 확인 — 밥집=분식·백반(카페 안섞임),
  카페=빵/카페, 술집=주점. 폰으로 3장 전송.

**현재 상태**
- 커피숍 섞임 문제 해결 + 카페/술집 모드 신설. MVP 스코프를 "식당 편"→밥집/카페/술집으로 확장(D10).
- 미커밋(사용자 확인 후 커밋 예정). 커밋 후 push→Vercel 자동 재배포.

## 2026-07-09 (추가) — 배포 준비 (Edge/리전/metadataBase/lang)
**한 일**
- `/api/recommend`에 `runtime="edge"` + `preferredRegion=["icn1"]`(서울) 지정 — 콜드스타트 ~ms,
  한국 유저·공공데이터 API 양쪽에 가까워 왕복 지연 최소. Edge 호환 확인(전부 fetch+순수로직).
- `app/layout.tsx`: `metadataBase`를 `VERCEL_PROJECT_PRODUCTION_URL`로 **자동 설정**(도메인 하드코딩 없이
  배포하면 og:image 절대경로 자동 완성, 로컬은 localhost 폴백). `lang="en"`→`"ko"` 수정.
- 검증: `tsc`·`eslint`·`next build` 전부 통과. `/api/recommend`=Dynamic(ƒ), `/`·`icon.svg`·`opengraph-image`=정적(○).

**현재 상태**
- 배포에 필요한 코드 준비 완료. **남은 건 사용자 액션**: (1) `git push`, (2) Vercel에서 레포 import,
  (3) 환경변수 `SANGWON_API_KEY` 등록(⚠️ 없으면 502). metadataBase는 배포 시 자동 채워짐.
- 이번 세션 변경(Phase3 이후분) 커밋 예정.

## 2026-07-09 (추가) — 개발 캡처 루프 도입 (Playwright)
**한 일**
- 개발 중 시각 확인용 스크린샷 워크플로 도입: Claude가 dev 서버를 백그라운드로 띄우고
  **글로벌 설치한 Playwright**로 헤드리스 크롬 캡처 → 모바일 전송. `CLAUDE.md` 규칙 갱신
  (dev 서버 캡처 목적 한정 허용 + 알림 `[맛집]` 접두어).
- Playwright는 **글로벌 설치**(`npm i -g playwright`, 브라우저는 머신 공유 캐시). 맛집 레포
  `package.json`은 안 건드림. 캡처 스크립트는 세션 스크래치 폴더(`capture.js`)에 격리.
- 첫 실전: 강남역 좌표 주입 → 위치버튼 → 실 `/api/recommend`(200) → 3카드 캡처.
  '해장' 태그 선택 시 국수/국밥집으로 필터되는 것 화면으로 확인, 2장 모바일 전송. 캡처 후 dev 서버 정리.

## 2026-07-09 — Phase 3: 공공데이터 실연동 (sdsc2) + 서버 오케스트레이션
**한 일**
- 공공데이터 키 발급·검증: 실 API로 엔드포인트/파라미터/음식코드 확정 (DECISIONS D2 갱신).
  - 엔드포인트 `…/api/open/sdsc2/storeListInRadius` (구버전 sdsc는 폐기), **음식 대분류=`I2`**,
    cx=경도/cy=위도(축 뒤집힘), 필드매핑 bizesId/bizesNm/indsSclsNm/lon/lat/rdnmAdr 확인.
  - 초기 "Forbidden"은 키 활성화 지연(최대 1h)이었고, 재입력 후 `resultCode:00` 정상.
- `lib/sangwon.ts`: `searchInRadius()` 실구현 — I2 필터, JSON 파싱/게이트웨이오류 방어, `RestaurantSource[]` 매핑.
- `app/api/recommend/route.ts`: 스텁 → 오케스트레이션. `POST{lat,lng,radius,tags}` →
  sangwon → buildPool(거리순) → filterByTags → **거리순 상위 20 캡** → pickThree. `{cards, pool}` 반환. 키는 서버에서만.
- `app/page.tsx`: 클라 mock 직접호출 제거 → `/api/recommend` fetch, **로딩/에러 상태** 추가. 셔플은 반환된 pool로 로컬 pickThree.
- `types`: `RecommendResponse.poolToken` → `pool: Restaurant[]` (셔플용 실체화).
- `lib/tags.ts`: 8개 태그 키워드를 **실제 sdsc2 소분류명**(백반/한정식·국/탕/찌개류·중국집 등)에 맞게 튜닝.
- `lib/mock.ts`: 제품 런타임에서 제거(파일은 개발용 보존). 위치 거부 시 `MOCK_CENTER`(강남역) 좌표로 동일 실 API 호출.
- 결정 기록: DECISIONS **D9 신규**(서버 조회 + 셔플 풀 상한 20 + 1000페이지 한계 + 폴백).
- 검증: `tsc --noEmit`·`eslint` 에러 0. 실 API 데이터로 파이프라인 스모크 테스트 — 8개 태그 전부 실업종 매칭,
  상위20 풀·3장 선정 정상, 결과 전부 도보 1~2분권 확인.

**현재 상태**
- **ROADMAP Phase 3 완료**(카카오 보강 제외): 실데이터로 위치→태그필터→3카드→셔플이 서버 오케스트레이션으로 동작.
- 미커밋 상태(사용자 요청 시 묶어서 커밋 예정). dev 서버 확인·배포는 사용자 몫.
- 알려진 한계(D9): 초밀집 반경은 API 1페이지(1,000개) 상한으로 최근접 일부 누락 이론상 가능 — 실측 영향 없어 MVP에선 미보완.

**다음 할 것 — Vercel 배포 (PC에서 진행 예정)**
1. `git push` (로컬 main이 origin보다 앞섬).
2. Vercel에서 GitHub 레포 `DodamKing/matjib` import.
3. **환경변수 `SANGWON_API_KEY`를 Vercel 프로젝트 설정에 등록** (⚠️ `.env.local`은 커밋 안 되므로
   Vercel에 직접 넣어야 함 — 안 넣으면 `/api/recommend`가 502). (KAKAO 키는 선택, 미발급이라 생략 가능)
4. metadataBase는 코드에서 `VERCEL_PROJECT_PRODUCTION_URL`로 자동 채워짐 → 별도 작업 불필요.
5. 배포 후 폰에서 **실제 GPS로 실사용 테스트** (https라 위치권한 정상 동작) + 카톡에 링크 붙여 OG 미리보기 확인.

**그 외 남은 것**
- 페르소나 카피(`lib/persona.ts`)는 헤더/태그칩과 중복이라 **미연결로 정리**(스킵 결정, 2026-07-09).
- (선택) `lib/kakao.ts` 고도화: 상호명+좌표 → 카카오 로컬로 정확 길찾기 링크/주소 보강. `KAKAO_REST_API_KEY` 미발급.

## 2026-07-07 (밤) — Phase 4 착수 (배포 전까지): 상태 처리 + 로깅 정책
**한 일**
- 실행 순서 결정(DECISIONS D8): Phase 4(배포 제외) → 공공데이터 키+Phase 3 → 카카오 고도화 순으로 진행하기로 함.
- `components/LocationGate.tsx`: 에러 상태를 `denied`(권한 거부)/`error`(그 외: timeout·미지원 등)로 분리,
  거부 시 전용 안내 문구 표시. `console.error`로 실패 원인 로깅.
- `docs/DECISIONS.md`: D7(런타임 로깅 = console만, 외부 모니터링 미도입) 신규 추가.
  D6에서 Anthropic 키 언급 제거(D5 개정으로 미사용).
- "결과없음"(반경 내 후보 없음) 상태는 Phase 1에서 이미 구현돼 있어 추가 작업 없음(`app/page.tsx`).
- 검증: `tsc --noEmit`/`eslint` 에러 0.
- **Vercel 배포는 보류** — 사용자가 별도로 지시할 때 진행하기로 함(외부 배포는 확인 후 진행).

**현재 상태**
- Phase 4 중 배포를 제외한 항목(상태 처리·로깅 정책) 완료. ROADMAP 체크박스 갱신.
- 미커밋 상태. 다음 커밋 시 이번 세션 변경(태그 매칭 + 파비콘/OG + 상태처리) 한 번에 묶을 예정.

**다음 할 것**
- 공공데이터(`data.go.kr`) API 키 발급 → `lib/sangwon.ts` 실연동 → `page.tsx`를 fetch 기반으로 전환(Phase 3).
- 그다음 카카오 로컬 API로 `lib/kakao.ts` 고도화(선택, fallback 유지).
- 사용자가 배포를 지시하면 `metadataBase` 채우고 Vercel 배포.

## 2026-07-07 (저녁) — 파비콘 + 공유 미리보기 이미지
**한 일**
- `app/icon.svg` 신규: 브랜드 마크(오렌지 3카드 팬 모양) — "항상 카드 3개" 정체성을 아이콘화.
  기본 Next.js `favicon.ico`(로고)는 제거하고 이 SVG로 대체.
- `app/opengraph-image.tsx` 신규: `next/og`(`ImageResponse`)로 카톡/슬랙 등 링크 공유 시
  미리보기 이미지를 정적 생성 (1200x630). 같은 3카드 마크 + 타이틀/태그라인.
  Next.js 파일 컨벤션이 `og:image`/`twitter:image` 메타태그에 자동 연결.
- `app/layout.tsx`: 기본 `metadata`("Create Next App")를 실제 타이틀/설명으로 교체.
  `metadataBase`는 Vercel 배포 도메인 정해지면 채우기로 TODO 남김(현재는 로컬호스트로 폴백, 빌드 경고만 있고 에러 아님).
- `public/*.svg`(create-next-app 스캐폴딩 잔재, 미사용 확인 후 삭제).
- 검증: `npx next build` 성공, `/icon.svg`·`/opengraph-image` 둘 다 정적(○) 생성 확인.
  `sharp`로 아이콘을 256px·32px 렌더링해 실제 파비콘 크기에서도 3카드 모양이 인식되는지 육안 확인.

**현재 상태**
- 파비콘·공유 미리보기 이미지 완성. 도메인 없어서 실제 배포 후 카톡 등에서 og:image 반영 여부는
  Vercel 배포 시 `metadataBase` 채우고 재확인 필요.

## 2026-07-07 — Phase 2: 상황 태그 매칭 (D5 개정, LLM 제거)
**한 일**
- 설계 변경: 자연어+Claude 매칭 → **고정 상황 태그(다중 선택) + 키워드 필터**로 전환.
  이유: 원클릭·선택지 축소 철학에 태그 클릭이 더 맞고, LLM 키/지연/비용 없이 결정론적으로 동작.
  태그로 전체 업종을 커버하려 하면 태그 수가 늘어나 정체성이 깨지므로, 커버리지는 포기하고
  태그 미선택/미매칭은 "아무거나"+D3 공정 셔플이 흡수하도록 함. 상세 근거: `DECISIONS.md` D5.
- `lib/tags.ts` 신설: 태그 8개(해장/든든하게/가볍게/매콤하게/뜨끈한 국물/이국음식/분위기 있게/빠르게 한끼).
- `lib/match.ts`: Claude 스텁 제거 → `filterByTags()`(키워드 포함 매칭, 미매칭 시 원본 풀 반환).
- `lib/persona.ts`: Claude 스텁 제거 → 템플릿 기반 `prescribe()`(선택 태그 있으면 반영, 없으면 랜덤 일반 문구).
- `components/SituationInput.tsx`: 자연어 입력 스텁 → 태그 다중 선택 칩 UI로 구현.
- `types/index.ts`: `SituationTag` 추가, `RecommendRequest.query` → `tags?: string[]`.
- `app/page.tsx`: 태그 선택 상태 연결, `buildPool → filterByTags → pickThree` 흐름으로 변경.
- `.env.example`에서 `ANTHROPIC_API_KEY` 제거(v1 스코프에서 불필요).
- 문서 동기화: `DECISIONS.md`(D5 개정) · `MVP_SCOPE.md` · `ROADMAP.md`(Phase2 체크) · `ARCHITECTURE.md`
  (데이터 흐름·폴더·타입·env) · `STRUCTURE.md`(상태 ✅ 갱신) · `CLAUDE.md`(기술스택/원칙/보안 문구) · `README.md`.
- 검증: `tsc --noEmit` 에러 0, `eslint` 에러 0 (Phase3 스텁 미사용 파라미터 warning 2개만 남음).

**현재 상태**
- **ROADMAP Phase 2 완료**: 태그 선택 → 키워드 필터 → 3카드 → 셔플이 전부 클라이언트에서 동작(더미데이터).
- `/api/recommend` API Route는 여전히 빈 스텁 — 매칭에 서버/키가 필요 없어져서 Phase 3(실데이터 조회 시
  공공데이터 키 은닉 목적)까지 그대로 미룸.
- 미커밋 상태(사용자 요청 시 묶어서 커밋 예정). dev 서버 확인은 사용자 몫.

**다음 할 것**
- 공공데이터 API 키 발급되면 Phase 3: `lib/sangwon.ts` 실연동, `/api/recommend`에 서버 오케스트레이션 이전.
- (선택) 태그 라벨/키워드가 실제 소분류명과 안 맞으면 튜닝.

## 2026-06-19 (저녁) — Phase 0 마무리 + Phase 1
**한 일**
- `lib/mock.ts`: 강남역 주변 더미 식당 26개 (≈90m~1.4km 분산). `MOCK_CENTER` 추가.
- `lib/distance.ts`: haversine 거리 + walkMinutes(80m/분) 구현.
- `lib/shuffle.ts`: `buildPool`(반경 필터+walkMin 부착, 거리순) + `pickThree`(Fisher–Yates) 구현.
- `types`: `RestaurantSource`(walkMin/mapUrl 제외 원천 타입) 추가.
- 컴포넌트 구현: `LocationGate`(위치동의+강남역 fallback), `Card`(카카오맵 길찾기 링크), `CardDeck`(3카드+셔플).
- `app/page.tsx`: CNA 랜딩 → 본 서비스 화면 교체 (위치 → 도보 5/10/15 필터 → 3카드 → 셔플, 빈결과 처리).
- 검증: `tsc` 에러 0, `lint` 에러 0 (warning 6개는 Phase2/3 스텁 미사용 파라미터).

**현재 상태**
- **ROADMAP Phase 1 완료**: 더미데이터로 위치→3카드→셔플 흐름이 화면에서 동작.
- 미커밋 상태(사용자 push 예정). dev 서버 확인은 사용자 몫.
- AI(자연어 입력)·실데이터·persona는 아직 (Phase 2~3). `SituationInput`은 스텁.

**다음 할 것**
- Phase 2: `SituationInput` 연결 + `/api/recommend` + `lib/match.ts`(Claude 자연어→업종) + `persona.ts`.
- API 키 발급되면 Phase 3: `lib/sangwon.ts` 실연동.

## 2026-06-19 (오후) — Phase 0 스캐폴딩
**한 일**
- 코드맵 문서 `docs/STRUCTURE.md` 추가 (코드 안 읽고 파악하는 파일 색인).
- `create-next-app`으로 스캐폴딩: Next.js(App Router)+TS+Tailwind+ESLint, git 초기화됨.
- 뼈대 스텁 생성: `types/index.ts`(✅ 구현), `lib/*`·`components/*`·`app/api/recommend/route.ts`(🟡 스텁), `.env.example`.
- `npx tsc --noEmit` 통과(에러 0). STRUCTURE.md 상태 갱신.

**현재 상태**
- 빌드 가능한 빈 뼈대 완성. dev 서버 정상 구동 확인됨. 메인 화면(`app/page.tsx`)은 아직 CNA 기본 랜딩.
- 커밋 완료(뼈대+문서). 원격 연결: origin = https://github.com/DodamKing/matjib.git (**공개 레포**).
  push는 사용자가 직접 (`git push -u origin main`).
- `.gitignore`에 `!.env.example` 예외 추가(키 이름 파일은 커밋, 실제 키는 제외).
- 공공데이터 API 키: 여전히 미발급.
- 참고: create-next-app이 만든 기본 `AGENTS.md` 존재(정리 여부 추후 결정).

**다음 할 것**
- ROADMAP Phase 0 마무리: `lib/mock.ts`에 더미 식당 20~30개 채우기.
- ROADMAP Phase 1: `distance.ts`/`shuffle.ts` 구현 → LocationGate→CardDeck UX 연결.

## 2026-06-19 (오전)
**한 일**
- 기획서(PDF) 분석, 방향 토론.
- 핵심 결정 확정: Next.js+TS / 공공데이터 API 1차 소스 / 풀스택 MVP.
- 공공데이터 「반경내 상가업소 조회」 API 검증 — 반경·좌표·업종·상호명 제공 확인.
- 데이터 함정 발견·정리: 품질/평점 신호 없음 → "최적"=거리+업종+공정셔플 (DECISIONS D3).
- 문서 작성: CLAUDE.md, DECISIONS.md, ARCHITECTURE.md, MVP_SCOPE.md, ROADMAP.md, WORKLOG.md.

**현재 상태**
- 코드 없음. 기획/문서 단계 완료. git 미초기화.
- 공공데이터 API 키: 미발급 (나중에 발급 예정).

**다음 할 것**
- ROADMAP Phase 0: 프로젝트 세팅(Next.js 스캐폴딩 + git init + 더미데이터)부터 시작.
