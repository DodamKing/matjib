#!/usr/bin/env bash
# 훅카드 + 앱 셔플구간 + CTA카드 → 릴스 3개(무음, 1080x1920, 30fps).
# 인스타 업로드 때 트렌딩 오디오는 사용자가 얹음.
set -e
cd "$(dirname "$0")/out"

# 앱 영상 크롭: 1080x2338 → 세로 1080x1920, y=140 (헤더 일부+3카드+셔플+모드 유지, 하단 N로고 제거)
CROP="scale=1080:-2,crop=1080:1920:0:140,fps=30,setsar=1"
CARD="scale=1080:1920,fps=30,setsar=1"
ENC="-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart"

SRC=../reel-shuffle.mp4  # 편집용 녹화 원본(커밋됨, out/ 바깥)

build () { # $1 hook  $2 app_ss  $3 app_dur  $4 cta  $5 out
  ffmpeg -y -loglevel error \
    -loop 1 -t 2.6 -i "$1" \
    -ss "$2" -t "$3" -i "$SRC" \
    -loop 1 -t 3.0 -i "$4" \
    -filter_complex "[0:v]${CARD}[a];[1:v]${CROP}[b];[2:v]${CARD}[c];[a][b][c]concat=n=3:v=1:a=0[v]" \
    -map "[v]" $ENC "$5"
  echo "built $5 ($(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$5")s)"
}

build card-r1h.png 2.5 6.5 card-r1c.png reel_1_travel.mp4      # 여행/출장 (밥집)
build card-r2h.png 4.0 6.0 card-r2c.png reel_2_moving.mp4      # 이사/새동네 (밥집)
build card-r3h.png 13.0 4.3 card-r3c.png reel_3_appointment.mp4 # 약속/나들이 (카페)

echo "--- DONE ---"
ls -la reel_*_*.mp4
