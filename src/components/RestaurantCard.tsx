"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Star, UtensilsCrossed, Coffee, Pencil, Check, X } from "lucide-react";
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
    <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
      <Link href={`/restaurants/${id}`} className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-200 to-red-300 text-orange-900 dark:from-orange-900 dark:to-red-900 dark:text-orange-200">
          <CategoryIcon className="h-8 w-8" />
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
              <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {rating.toFixed(1)}
              </span>
              <span className="text-neutral-400">리뷰 {reviewCount ?? 0}</span>
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
