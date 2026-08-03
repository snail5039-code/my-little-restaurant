import { notFound } from "next/navigation";
import {
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Heart,
  UserRound,
  Star,
  MapPin,
} from "lucide-react";
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

  const chipClass =
    "inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-orange-200 to-red-300 text-orange-900 sm:h-64 dark:from-orange-900 dark:to-red-950 dark:text-orange-200">
          <UtensilsCrossed className="h-16 w-16" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-neutral-50">
                  {restaurant.name}
                </h1>
                {categoryName && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                    {categoryName}
                  </span>
                )}
              </div>
              {restaurant.address && (
                <p className="mt-1.5 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {restaurant.address}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-3.5 py-2 text-white">
              <Star className="h-5 w-5 fill-white" />
              <div className="leading-tight">
                <div className="text-lg font-bold">
                  {restaurant.rating !== null ? restaurant.rating.toFixed(1) : "-"}
                </div>
                <div className="text-[10px] text-white/80">
                  리뷰 {reviews?.length ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-black/5 pt-4 dark:border-white/10">
            <span className={chipClass}>
              {restaurant.visited ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 방문 완료
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-neutral-400" /> 아직 안 가봄
                </>
              )}
            </span>
            <span className={chipClass}>
              <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" /> 좋아요{" "}
              {favoriteCount ?? 0}
            </span>
            {restaurant.alone_ok !== null && (
              <span className={chipClass}>
                <UserRound className="h-3.5 w-3.5 text-neutral-400" /> 혼밥 난이도{" "}
                {restaurant.alone_ok}/5
              </span>
            )}
          </div>
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
                    <span className="mr-2 inline-flex items-center gap-1 text-orange-500">
                      <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                      {review.rating.toFixed(1)}
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
                  <span className="inline-flex items-center gap-1.5">
                    {item.is_representative && (
                      <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                    )}
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
