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
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-fit rounded-full border border-black/10 bg-neutral-100 p-1 dark:border-white/10 dark:bg-neutral-900">
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
                  ? "bg-orange-500 text-white"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>

        <RegisterRestaurantModal categories={categories} isLoggedIn={isLoggedIn} />
      </div>

      {view === "card" ? (
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
        <KakaoMap markers={markers} />
      )}
    </div>
  );
}
