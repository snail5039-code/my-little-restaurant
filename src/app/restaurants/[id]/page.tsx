import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: restaurant }, { data: menu }, { data: reviews }, { count: favoriteCount }] =
    await Promise.all([
      supabase
        .from("restaurants")
        .select("*, categories(name)")
        .eq("id", id)
        .single(),
      supabase
        .from("menu")
        .select("*")
        .eq("restaurant_id", id)
        .order("is_representative", { ascending: false }),
      supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", id),
    ]);

  if (!restaurant) {
    notFound();
  }

  const categoryName = (restaurant as { categories?: { name: string } | null })
    .categories?.name;

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-200 to-red-300 text-7xl dark:from-orange-900 dark:to-red-900">
          🍽️
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {restaurant.name}
              </h1>
              {categoryName && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  {categoryName}
                </span>
              )}
            </div>
            {restaurant.address && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {restaurant.address}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-white p-5 text-sm shadow-sm dark:bg-neutral-900">
            <span>{restaurant.visited ? "✅ 방문 완료" : "🕓 아직 안 가봄"}</span>
            <span>❤️ 좋아요 {favoriteCount ?? 0}</span>
            {restaurant.alone_ok !== null && (
              <span>🧍 혼밥 난이도 {restaurant.alone_ok}/5</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          평점
        </span>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-orange-500">★</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">
            {restaurant.rating !== null ? restaurant.rating.toFixed(1) : "아직 평점 없음"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
            리뷰 {reviews?.length ?? 0}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800"
                >
                  {review.rating !== null && (
                    <span className="mr-2 text-orange-500">
                      ★ {review.rating.toFixed(1)}
                    </span>
                  )}
                  {review.content}
                </li>
              ))
            ) : (
              <li className="text-sm text-neutral-400">아직 리뷰가 없어요.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
            메뉴
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {menu && menu.length > 0 ? (
              menu.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {item.is_representative && "⭐ "}
                    {item.name}
                  </span>
                  {item.price !== null && (
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {item.price.toLocaleString()}원
                    </span>
                  )}
                </li>
              ))
            ) : (
              <li className="text-sm text-neutral-400">등록된 메뉴가 없어요.</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
