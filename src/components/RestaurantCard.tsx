import Link from "next/link";

export type RestaurantCardData = {
  id: number | string;
  name: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  aloneOk?: number;
  emoji?: string;
  lat?: number;
  lng?: number;
};

export default function RestaurantCard({
  id,
  name,
  category,
  rating,
  reviewCount,
  address,
  aloneOk,
  emoji,
}: RestaurantCardData) {
  return (
    <Link
      href={`/restaurants/${id}`}
      className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-200 to-red-300 text-3xl dark:from-orange-900 dark:to-red-900">
        {emoji ?? "🍽️"}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-neutral-900 dark:text-neutral-50">
            {name}
          </h3>
          {category && (
            <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              {category}
            </span>
          )}
        </div>

        {rating !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-orange-500">★</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {rating.toFixed(1)}
            </span>
            <span className="text-neutral-400">
              리뷰 {reviewCount ?? 0}
            </span>
          </div>
        )}

        {address && (
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {address}
          </p>
        )}

        {aloneOk !== undefined && (
          <span className="mt-auto w-fit rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            혼밥 난이도 {aloneOk}/5
          </span>
        )}

        <span className="mt-auto self-end text-xs font-medium text-orange-500">
          상세보기 →
        </span>
      </div>
    </Link>
  );
}
