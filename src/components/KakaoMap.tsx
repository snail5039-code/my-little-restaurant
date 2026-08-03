"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

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
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const center = markers.length
          ? new window.kakao.maps.LatLng(markers[0].lat, markers[0].lng)
          : new window.kakao.maps.LatLng(37.5665, 126.978);

        const map = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: 6,
        });

        markers.forEach((marker) => {
          const position = new window.kakao.maps.LatLng(marker.lat, marker.lng);
          const kakaoMarker = new window.kakao.maps.Marker({ position, map });

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:13px;white-space:nowrap;">${marker.name}</div>`,
          });

          window.kakao.maps.event.addListener(kakaoMarker, "click", () => {
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
