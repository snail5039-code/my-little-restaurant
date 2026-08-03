"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Star,
  UtensilsCrossed,
  Coffee,
  Pencil,
  Check,
  X,
  MapPin,
} from "lucide-react";
import { updateMemo } from "@/app/restaurants/actions";

export type RestaurantCardData = {
  id: number | string;
  name: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  aloneOk?: number;
  memo?: string | null;
  lat?: number;
  lng?: number;
  ownerId?: string | null;
};

export default function RestaurantCard({
  id,
  name,
  category,
  rating,
  reviewCount,
  address,
  aloneOk,
  memo,
  isOwner,
}: RestaurantCardData & { isOwner?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(memo ?? "");
  const [currentMemo, setCurrentMemo] = useState(memo ?? "");
  const [isPending, startTransition] = useTransition();

  const CategoryIcon = category === "카페" ? Coffee : UtensilsCrossed;

  const saveMemo = () => {
    startTransition(async () => {
      const result = await updateMemo(id, draft);
      if (!result?.error) {
        setCurrentMemo(draft);
        setEditing(false);
      }
    });
  };

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
      <Link href={`/restaurants/${id}`} className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-200 to-red-300 text-orange-900 dark:from-orange-900 dark:to-red-950 dark:text-orange-200">
          <CategoryIcon className="h-9 w-9" strokeWidth={1.5} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-base font-bold leading-tight text-neutral-900 group-hover:text-orange-600 dark:text-neutral-50 dark:group-hover:text-orange-400">
            {name}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            {category && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {category}
              </span>
            )}
            {aloneOk !== undefined && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                혼밥 {aloneOk}/5
              </span>
            )}
          </div>

          {rating !== undefined && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-orange-600 px-1.5 py-0.5 text-xs font-bold text-white">
                <Star className="h-3 w-3 fill-white" />
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400">
                리뷰 {reviewCount ?? 0}
              </span>
            </div>
          )}

          {address && (
            <p className="mt-auto flex items-center gap-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
              <MapPin className="h-3 w-3 shrink-0" />
              {address}
            </p>
          )}
        </div>
      </Link>

      <div className="border-t border-black/5 pt-3 dark:border-white/10">
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="메모를 남겨보세요"
              className="w-full rounded-lg border border-black/10 px-2 py-1.5 text-xs dark:border-white/10 dark:bg-neutral-800"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDraft(currentMemo);
                  setEditing(false);
                }}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-3.5 w-3.5" />
                취소
              </button>
              <button
                onClick={saveMemo}
                disabled={isPending}
                className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {currentMemo || (isOwner ? "메모를 남겨보세요." : "")}
            </p>
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                className="shrink-0 text-neutral-400 hover:text-orange-500"
                aria-label="메모 수정"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
