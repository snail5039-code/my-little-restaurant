"use client";

import { useMemo, useState } from "react";
import { Map as MapIcon, LayoutGrid, Search, SearchX } from "lucide-react";
import RestaurantCard, { type RestaurantCardData } from "./RestaurantCard";
import KakaoMap, { type CertifiedMapMarker } from "./KakaoMap";
import RegisterRestaurantModal from "./RegisterRestaurantModal";
import RecommendModal from "./RecommendModal";
import NearbyModelRestaurantSearch from "./NearbyModelRestaurantSearch";

type View = "card" | "map";

const VIEW_OPTIONS = [
  { key: "card", label: "카드", icon: LayoutGrid },
  { key: "map", label: "지도", icon: MapIcon },
] as const;

export default function RestaurantsView({
  restaurants,
  categories,
  isLoggedIn,
  currentUserId,
}: {
  restaurants: RestaurantCardData[];
  categories: { id: number; name: string }[];
  isLoggedIn: boolean;
  currentUserId: string | null;
}) {
  const [view, setView] = useState<View>("card");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [certifiedMarkers, setCertifiedMarkers] = useState<CertifiedMapMarker[]>(
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.address ?? "").toLowerCase().includes(q);
      const matchesCategory = !activeCategory || r.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [restaurants, query, activeCategory]);

  const markers = useMemo(
    () =>
      filtered
        .filter((r) => r.lat !== undefined && r.lng !== undefined)
        .map((r) => ({
          id: r.id,
          name: r.name,
          lat: r.lat!,
          lng: r.lng!,
          memo: r.memo,
        })),
    [filtered]
  );

  // 실제로 등록된 가게가 있는 카테고리만 필터로 노출
  const usedCategories = useMemo(() => {
    const names = new Set(restaurants.map((r) => r.category).filter(Boolean));
    return categories.filter((c) => names.has(c.name));
  }, [restaurants, categories]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* 검색 + 등록 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="가게 이름 · 지역 검색"
            className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand"
          />
        </div>
        <RecommendModal
          restaurants={restaurants}
          categories={categories}
          currentUserId={currentUserId}
          isLoggedIn={isLoggedIn}
        />
        <RegisterRestaurantModal
          categories={categories}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* 카테고리 칩 */}
      {usedCategories.length > 0 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === null
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-muted hover:text-foreground"
            }`}
          >
            전체
          </button>
          {usedCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.name)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === c.name
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-muted hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* 결과 수 + 뷰 전환 */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-2.5">
        <p className="text-[13px] text-muted">
          <span className="tnum font-bold text-foreground">
            {filtered.length}
          </span>
          곳
          {filtered.length !== restaurants.length && (
            <span className="tnum text-muted"> / 전체 {restaurants.length}곳</span>
          )}
        </p>

        <div className="flex rounded-md border border-line bg-surface p-0.5">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setView(option.key)}
              aria-pressed={view === option.key}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                view === option.key
                  ? "bg-brand text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <option.icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {view === "card" ? (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                {...restaurant}
                isOwner={!!currentUserId && restaurant.ownerId === currentUserId}
                isLoggedIn={isLoggedIn}
                categories={categories}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line py-20 text-center">
            <SearchX className="h-6 w-6 text-muted" strokeWidth={1.6} />
            <p className="text-sm font-medium text-foreground">
              {restaurants.length === 0
                ? "아직 등록된 맛집이 없어요"
                : "조건에 맞는 맛집이 없어요"}
            </p>
            <p className="text-xs text-muted">
              {restaurants.length === 0
                ? "오른쪽 위 맛집 등록으로 첫 가게를 추가해보세요."
                : "검색어나 카테고리를 바꿔보세요."}
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <NearbyModelRestaurantSearch onResults={setCertifiedMarkers} />
          <div className="overflow-hidden rounded-lg border border-line">
            <KakaoMap markers={markers} certifiedMarkers={certifiedMarkers} />
          </div>
        </div>
      )}
    </div>
  );
}
