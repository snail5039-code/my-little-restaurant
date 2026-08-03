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

export type CertifiedMapMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  foodType?: string;
};

const CERTIFIED_MARKER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="36" viewBox="0 0 30 36">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 21 15 21s15-10 15-21C30 6.7 23.3 0 15 0z" fill="#059669"/>
      <circle cx="15" cy="14" r="7.5" fill="#fff"/>
      <path d="M11 14.3l2.6 2.6 5.4-5.4" stroke="#059669" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  );

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function KakaoMap({
  markers,
  certifiedMarkers = [],
}: {
  markers: MapMarker[];
  certifiedMarkers?: CertifiedMapMarker[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    loadKakaoMaps().then(() => {
      if (cancelled || !mapRef.current) return;
      const kakao = window.kakao;
      if (!kakao) return;

      const centerSource = markers[0] ?? certifiedMarkers[0];
      const center = centerSource
        ? new kakao.maps.LatLng(centerSource.lat, centerSource.lng)
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

      const markerImage = new kakao.maps.MarkerImage(
        CERTIFIED_MARKER_IMAGE,
        new kakao.maps.Size(30, 36)
      );

      certifiedMarkers.forEach((marker) => {
        const position = new kakao.maps.LatLng(marker.lat, marker.lng);
        const kakaoMarker = new kakao.maps.Marker({
          position,
          map,
          image: markerImage,
        });

        const addressHtml = marker.address
          ? `<p style="margin:4px 0 0;font-size:12px;color:#78716c;max-width:200px;white-space:normal;">${escapeHtml(
              marker.address
            )}</p>`
          : "";

        const infowindow = new kakao.maps.InfoWindow({
          content: `
            <div style="padding:8px 12px;font-size:13px;">
              <strong style="display:block;">${escapeHtml(marker.name)}</strong>
              <span style="display:inline-block;margin-top:2px;padding:1px 6px;border-radius:9999px;background:#05966922;color:#059669;font-size:10px;font-weight:600;">모범음식점</span>
              ${addressHtml}
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
  }, [markers, certifiedMarkers]);

  return <div ref={mapRef} className="h-[420px] w-full sm:h-[540px]" />;
}
