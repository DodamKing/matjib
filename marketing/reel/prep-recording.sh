#!/usr/bin/env bash
# 재녹화한 raw 캡처(reel-shuffle.webm) → 편집 소스 reel-shuffle.mp4 로 변환.
# (record-reel.mjs 가 webm을 뽑고, 이 스크립트가 앞 1.2s 블랭크 트림 + 1080폭 정규화)
# reel-shuffle.mp4 는 커밋되는 편집 소스라, 보통은 재녹화할 때만 이 스크립트가 필요.
set -e
cd "$(dirname "$0")"
# 입력: out/reel-shuffle.webm (raw, ignore) → 출력: reel-shuffle.mp4 (편집 원본, 커밋)
ffmpeg -y -loglevel error -ss 1.2 -i out/reel-shuffle.webm \
  -vf "scale=1080:-2" -c:v libx264 -pix_fmt yuv420p -crf 20 -an -movflags +faststart \
  reel-shuffle.mp4
echo "reel-shuffle.mp4 ($(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 reel-shuffle.mp4)s)"
