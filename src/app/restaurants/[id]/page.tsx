import Link from "next/link";
import { notFound } from "next/navigation";
import {
  UtensilsCrossed,
  Coffee,
  CheckCircle2,
  Clock,
  Heart,
  UserRound,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Rating from "@/components/Rating";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [
    { data: restaurant },
    { data: menu },
    { data: reviews },
    { count: favoriteCount },
  ] = await Promise.all([
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

  const categoryName =
    (restaurant as { categories?: { name: string } | null }).categories?.name ??
    restaurant.food;
  const CategoryIcon = categoryName === "카페" ? Coffee : UtensilsCrossed;

  const facts = [
    {
      label: "방문 여부",
      icon: restaurant.visited ? CheckCircle2 : Clock,
      iconClass: restaurant.visited ? "text-brand" : "text-muted",
      value: restaurant.visited ? "다녀왔어요" : "아직 안 가봤어요",
    },
    {
      label: "좋아요",
      icon: Heart,
      iconClass: "text-muted",
      value: `${favoriteCount ?? 0}명`,
    },
    ...(restaurant.alone_ok !== null
      ? [
          {
            label: "혼밥 난이도",
            icon: UserRound,
            iconClass: "text-muted",
            value: `${restaurant.alone_ok} / 5`,
          },
        ]
      : []),
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/restaurants"
        className="inline-flex w-fit items-center gap-1 text-[13px] text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        맛집 리스트
      </Link>

      {/* 헤더 */}
      <header className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex h-40 items-center justify-center border-b border-line bg-surface-muted sm:h-52">
          <CategoryIcon className="h-12 w-12 text-muted" strokeWidth={1.2} />
        </div>

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {restaurant.name}
              </h1>
              {categoryName && (
                <span className="rounded border border-line px-1.5 py-0.5 text-[11px] font-semibold text-muted">
                  {categoryName}
                </span>
              )}
            </div>
            {restaurant.address && (
              <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                {restaurant.address}
              </p>
            )}
            {restaurant.memo && (
              <p className="mt-3 border-l-2 border-brand/40 pl-3 text-[13px] leading-relaxed text-muted">
                {restaurant.memo}
              </p>
            )}
          </div>

          {/* 평점 요약 */}
          <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg border border-line bg-surface-muted px-5 py-3">
            <span className="tnum text-[28px] font-bold leading-none text-brand">
              {restaurant.rating !== null ? restaurant.rating.toFixed(2) : "–"}
            </span>
            <Rating value={restaurant.rating} showNumber={false} size={12} />
            <span className="tnum text-[11px] text-muted">
              리뷰 {reviews?.length ?? 0}
            </span>
          </div>
        </div>

        {/* 기본 정보 */}
        <dl className="grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 px-5 py-3.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {fact.label}
              </dt>
              <dd className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <fact.icon
                  className={`h-3.5 w-3.5 ${fact.iconClass}`}
                  strokeWidth={2}
                />
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 메뉴 */}
        <section className="rounded-lg border border-line bg-surface">
          <h2 className="border-b border-line px-5 py-3 text-sm font-bold text-foreground">
            메뉴
          </h2>
          {menu && menu.length > 0 ? (
            <ul className="divide-y divide-line">
              {menu.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                      {item.name}
                      {item.is_representative && (
                        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                          대표
                        </span>
                      )}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.price !== null && (
                    <span className="tnum shrink-0 text-[13px] text-muted">
                      {item.price.toLocaleString()}원
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-[13px] text-muted">
              등록된 메뉴가 없어요.
            </p>
          )}
        </section>

        {/* 리뷰 */}
        <section className="rounded-lg border border-line bg-surface">
          <h2 className="flex items-baseline gap-1.5 border-b border-line px-5 py-3 text-sm font-bold text-foreground">
            리뷰
            <span className="tnum text-xs font-normal text-muted">
              {reviews?.length ?? 0}
            </span>
          </h2>
          {reviews && reviews.length > 0 ? (
            <ul className="divide-y divide-line">
              {reviews.map((review) => (
                <li key={review.id} className="px-5 py-3.5">
                  {review.rating !== null && (
                    <Rating value={review.rating} size={12} />
                  )}
                  {review.content && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-foreground">
                      {review.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-[13px] text-muted">
              아직 리뷰가 없어요.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
