import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 노트북 핫스팟/사내망 IP로 모바일 접속 시, Next 16이 non-localhost 오리진의
  // /_next/* (HMR·청크) 요청을 cross-origin으로 막는 걸 허용. dev 전용이라 배포엔 영향 없음.
  allowedDevOrigins: ["192.168.137.1", "192.168.219.46"],
};

export default nextConfig;
