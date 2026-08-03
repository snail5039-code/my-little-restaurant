import { supabase, type Restaurant } from "@/lib/supabase";
import RestaurantsView from "@/components/RestaurantsView";

export default async function RestaurantsPage() {
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("id");

  const cards = (restaurants ?? []).map((restaurant: Restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    category: restaurant.food,
    address: restaurant.address ?? undefined,
    rating: restaurant.rating ?? undefined,
    aloneOk: restaurant.alone_ok ?? undefined,
    lat: restaurant.latitude ?? undefined,
    lng: restaurant.longitude ?? undefined,
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        맛집 리스트
      </h1>

      {error && (
        <p className="text-red-500">목록을 불러오지 못했습니다: {error.message}</p>
      )}

      <RestaurantsView restaurants={cards} />
    </main>
  );
}
