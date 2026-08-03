"use client";

import { useEffect, useRef } from "react";

export type MapMarker = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
};

const SCRIPT_ID = "kakao-maps-sdk";

export default function KakaoMap({ markers }: { markers: MapMarker[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const appkey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appkey || !mapRef.current) return;

    const initMap = () => {
      const kakao = window.kakao;
      if (!kakao) return;

      kakao.maps.load(() => {
        if (!mapRef.current) return;

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

          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:13px;white-space:nowrap;">${marker.name}</div>`,
          });

          kakao.maps.event.addListener(kakaoMarker, "click", () => {
            infowindow.open(map, kakaoMarker);
          });
        });
      });
    };

    if (window.kakao?.maps) {
      initMap();
      return;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", initMap);
    return () => script?.removeEventListener("load", initMap);
  }, [markers]);

  return <div ref={mapRef} className="h-[500px] w-full rounded-2xl" />;
}
