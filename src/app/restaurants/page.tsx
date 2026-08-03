import { supabase, type Restaurant } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import RestaurantsView from "@/components/RestaurantsView";

export default async function RestaurantsPage() {
  const supabaseServer = await createClient();

  const [
    { data: restaurants, error },
    { data: categories },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from("restaurants").select("*").order("id"),
    supabase.from("categories").select("id, name").order("id"),
    supabaseServer.auth.getUser(),
  ]);

  const cards = (restaurants ?? []).map((restaurant: Restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    category: restaurant.food,
    address: restaurant.address ?? undefined,
    rating: restaurant.rating ?? undefined,
    aloneOk: restaurant.alone_ok ?? undefined,
    memo: restaurant.memo,
    lat: restaurant.latitude ?? undefined,
    lng: restaurant.longitude ?? undefined,
    ownerId: restaurant.user_id,
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        맛집 리스트
      </h1>

      {error && (
        <p className="text-red-500">목록을 불러오지 못했습니다: {error.message}</p>
      )}

      <RestaurantsView
        restaurants={cards}
        categories={categories ?? []}
        isLoggedIn={!!user}
        currentUserId={user?.id ?? null}
      />
    </main>
  );
}
