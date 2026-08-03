"use client";

import { useMemo, useState } from "react";
import { Map as MapIcon, LayoutGrid } from "lucide-react";
import RestaurantCard, { type RestaurantCardData } from "./RestaurantCard";
import KakaoMap from "./KakaoMap";
import RegisterRestaurantModal from "./RegisterRestaurantModal";

type View = "card" | "map";

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

  const markers = useMemo(
    () =>
      restaurants
        .filter((r) => r.lat !== undefined && r.lng !== undefined)
        .map((r) => ({ id: r.id, name: r.name, lat: r.lat!, lng: r.lng! })),
    [restaurants]
  );

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex w-fit rounded-full border border-black/10 bg-white p-1 dark:border-white/10 dark:bg-neutral-900">
            {(
              [
                { key: "card", label: "카드로 보기", icon: LayoutGrid },
                { key: "map", label: "지도로 보기", icon: MapIcon },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                onClick={() => setView(option.key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  view === option.key
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                    : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
          <span className="hidden text-sm text-neutral-400 sm:inline">
            총 {restaurants.length}곳
          </span>
        </div>

        <RegisterRestaurantModal categories={categories} isLoggedIn={isLoggedIn} />
      </div>

      {view === "card" ? (
        restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                {...restaurant}
                isOwner={!!currentUserId && restaurant.ownerId === currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center dark:border-white/10 dark:bg-neutral-900/40">
            <p className="font-medium text-neutral-600 dark:text-neutral-300">
              아직 등록된 맛집이 없어요.
            </p>
            <p className="text-sm text-neutral-400">
              첫 맛집을 등록해보세요.
            </p>
          </div>
        )
      ) : (
        <KakaoMap markers={markers} />
      )}
    </div>
  );
}
