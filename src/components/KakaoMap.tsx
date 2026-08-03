"use client";

import { useEffect, useRef } from "react";
import { loadKakaoMaps } from "@/lib/kakao";

export type MapMarker = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  memo?: string | null;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function KakaoMap({ markers }: { markers: MapMarker[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    loadKakaoMaps().then(() => {
      if (cancelled || !mapRef.current) return;
      const kakao = window.kakao;
      if (!kakao) return;

      const center = markers.length
        ? new kakao.maps.LatLng(markers[0].lat, markers[0].lng)
        : new kakao.maps.LatLng(37.5665, 126.978);

      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 6,
      });

      markers.forEach((marker) => {
        const position = new kakao.maps.LatLng(marker.lat, marker.lng);
        const kakaoMarker = new kakao.maps.Marker({ position, map });

        const memoHtml = marker.memo
          ? `<p style="margin:4px 0 0;font-size:12px;color:#78716c;max-width:180px;white-space:normal;">${escapeHtml(
              marker.memo
            )}</p>`
          : "";

        const infowindow = new kakao.maps.InfoWindow({
          content: `
            <div style="padding:8px 12px;font-size:13px;">
              <strong style="display:block;">${escapeHtml(marker.name)}</strong>
              ${memoHtml}
              <a href="/restaurants/${marker.id}" style="display:inline-block;margin-top:6px;font-size:12px;font-weight:600;color:#d24d17;text-decoration:underline;">
                상세보기 →
              </a>
            </div>
          `,
        });

        kakao.maps.event.addListener(kakaoMarker, "click", () => {
          infowindow.open(map, kakaoMarker);
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [markers]);

  return <div ref={mapRef} className="h-[420px] w-full sm:h-[540px]" />;
}
