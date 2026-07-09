// 외부 지도 앱 "길찾기" 딥링크 빌더. 전부 키 불필요 (URL 스킴/공개 링크). DECISIONS D11.
// 실제 화면 전환은 PlaceSheet 안에서만 일어나고, 여기선 URL 문자열만 만든다.
import type { Restaurant } from "@/types";

export type NavApp = {
  id: "kakao" | "naver";
  label: string;
  href: (r: Restaurant) => string;
};

// 카카오맵 길찾기(도착지). 웹·앱 모두 동작하는 공개 링크. 키 없음.
function kakaoTo(r: Restaurant): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(r.name)},${r.lat},${r.lng}`;
}

// 네이버지도 도보 길찾기. 모바일 앱 스킴(nmap://). appname은 식별 문자열일 뿐 키 아님.
function naverWalk(r: Restaurant): string {
  const dname = encodeURIComponent(r.name);
  return `nmap://route/walk?dlat=${r.lat}&dlng=${r.lng}&dname=${dname}&appname=matjib`;
}

// 걸어서 5~15분권 서비스라 도보 길찾기를 지원하는 앱만 노출(티맵=차량 내비라 제외, D11).
export const NAV_APPS: NavApp[] = [
  { id: "kakao", label: "카카오맵", href: kakaoTo },
  { id: "naver", label: "네이버지도", href: naverWalk },
];
