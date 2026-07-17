#!/usr/bin/env bash
# 훅카드 + 앱 셔플구간 + CTA카드 → 릴스 3개(무음, 1080x1920, 30fps).
# 인스타 업로드 때 트렌딩 오디오는 사용자가 얹음.
set -e
cd "$(dirname "$0")/out"

# 앱 영상은 record-reel.mjs가 9:16(1080x1920)으로 바로 녹화하므로 크롭하지 않는다.
# (예전엔 폰 비율 1080x2338을 crop=1080:1920:0:140으로 깎았는데, 세로 418px이 잘리면서
#  헤더 태그라인 "맛집 안 찾아줍니다"가 글자 중간에서 잘리고 모드·도보 탭이 날아갔다.)
APP="scale=1080:1920,fps=30,setsar=1"
CARD="scale=1080:1920,fps=30,setsar=1"
ENC="-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart"

SRC=../reel-shuffle.mp4  # 편집용 녹화 원본(커밋됨, out/ 바깥)

build () { # $1 hook  $2 app_ss  $3 app_dur  $4 cta  $5 out
  ffmpeg -y -loglevel error \
    -loop 1 -t 2.6 -i "$1" \
    -ss "$2" -t "$3" -i "$SRC" \
    -loop 1 -t 3.0 -i "$4" \
    -filter_complex "[0:v]${CARD}[a];[1:v]${APP}[b];[2:v]${CARD}[c];[a][b][c]concat=n=3:v=1:a=0[v]" \
    -map "[v]" $ENC "$5"
  echo "built $5 ($(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$5")s)"
}

# 앱 컷은 "롤(0.8s) → 3곳 정지(2.4s)" 한 사이클(3.2s)에 맞춰 자른다. 각 컷은 셔플 직전에 시작해
# 정지 구간에서 끝나야 한다(롤 도중에 끊기면 3곳을 못 보여주고 CTA로 넘어감).
# 녹화 타임라인(트림 후): 첫 3곳 ~2.0s · 셔플 클릭 4.6/7.8/11.0/14.2/17.4s · 카페 전환 20.6s · 카페 셔플 23.2s
build card-r1h.png 4.3 6.5 card-r1c.png reel_1_travel.mp4      # 여행/출장 (밥집) — 셔플 2사이클
build card-r2h.png 7.5 6.0 card-r2c.png reel_2_moving.mp4      # 이사/새동네 (밥집) — 셔플 2사이클
build card-r3h.png 20.3 5.5 card-r3c.png reel_3_appointment.mp4 # 약속/나들이 (카페) — 모드전환+셔플

echo "--- DONE ---"
ls -la reel_*_*.mp4
