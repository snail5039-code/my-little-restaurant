"use client";

import { useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { searchModelRestaurantsByRegion } from "@/lib/modelRestaurant";
import { loadKakaoMaps } from "@/lib/kakao";
import type { CertifiedMapMarker } from "./KakaoMap";

export default function NearbyModelRestaurantSearch({
  onResults,
}: {
  onResults: (markers: CertifiedMapMarker[]) => void;
}) {
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState(false);

  const handleSearch = async () => {
    const trimmed = region.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setStatus(null);

    try {
      const { items, totalCount, usedKeyword } =
        await searchModelRestaurantsByRegion(trimmed);

      if (items.length === 0) {
        setHasResults(false);
        onResults([]);
        setStatus(`'${usedKeyword}' 검색 결과가 없어요.`);
        return;
      }

      await loadKakaoMaps();
      const kakao = window.kakao;
      if (!kakao) {
        setStatus("카카오맵을 불러오지 못했어요.");
        return;
      }
      const geocoder = new kakao.maps.services.Geocoder();

      const geocoded = await Promise.all(
        items.map(
          (item) =>
            new Promise<CertifiedMapMarker | null>((resolve) => {
              geocoder.addressSearch(item.address, (geoResult, geoStatus) => {
                if (
                  geoStatus === kakao.maps.services.Status.OK &&
                  geoResult[0]
                ) {
                  resolve({
                    id: `${item.name}-${item.address}`,
                    name: item.name,
                    address: item.address,
                    foodType: item.foodType,
                    lat: Number(geoResult[0].y),
                    lng: Number(geoResult[0].x),
                  });
                } else {
                  resolve(null);
                }
              });
            })
        )
      );

      const markers = geocoded.filter((m): m is CertifiedMapMarker => m !== null);
      setHasResults(markers.length > 0);
      onResults(markers);
      setStatus(
        totalCount > items.length
          ? `'${usedKeyword}' 총 ${totalCount}곳 중 ${markers.length}곳을 지도에 표시했어요.`
          : `'${usedKeyword}' ${markers.length}곳을 지도에 표시했어요.`
      );
    } catch {
      setStatus("검색 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRegion("");
    setStatus(null);
    setHasResults(false);
    onResults([]);
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-line bg-surface-muted px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="구/군/시 이름 한 단어로 검색 (예: 강남구, 수원시)"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !region.trim()}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          우리 동네 모범업소 찾기
        </button>
        {hasResults && (
          <button
            onClick={handleClear}
            className="inline-flex shrink-0 items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <X className="h-3 w-3" />
            지우기
          </button>
        )}
      </div>
      {status && <p className="pl-6 text-[11px] text-muted">{status}</p>}
    </div>
  );
}
