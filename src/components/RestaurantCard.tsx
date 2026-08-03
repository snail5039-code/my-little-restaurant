"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  UtensilsCrossed,
  Coffee,
  Pencil,
  Check,
  X,
  MapPin,
  StickyNote,
} from "lucide-react";
import { updateMemo } from "@/app/restaurants/actions";
import Rating from "./Rating";

export type RestaurantCardData = {
  id: number | string;
  name: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  aloneOk?: number;
  memo?: string | null;
  visited?: boolean;
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
  visited,
  isOwner,
}: RestaurantCardData & { isOwner?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(memo ?? "");
  const [currentMemo, setCurrentMemo] = useState(memo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const CategoryIcon = category === "카페" ? Coffee : UtensilsCrossed;

  const saveMemo = () => {
    startTransition(async () => {
      const result = await updateMemo(id, draft);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setCurrentMemo(draft);
      setError(null);
      setEditing(false);
    });
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-brand/40">
      <Link href={`/restaurants/${id}`} className="flex gap-3.5 p-3.5">
        {/* 사진이 아직 없으므로 그라데이션 대신 차분한 플레이스홀더 */}
        <div className="relative flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-md border border-line bg-surface-muted text-muted">
          <CategoryIcon className="h-7 w-7" strokeWidth={1.4} />
          {visited && (
            <span className="absolute -right-1 -top-1 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
              방문
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-[15px] font-bold leading-snug text-foreground transition-colors group-hover:text-brand">
            {name}
          </h3>

          <div className="mt-1">
            <Rating value={rating} reviewCount={reviewCount ?? 0} />
          </div>

          {/* 메타 정보는 가운뎃점으로 구분해 한 줄로 압축 */}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
            {category && <span>{category}</span>}
            {category && aloneOk !== undefined && (
              <span className="text-line">·</span>
            )}
            {aloneOk !== undefined && <span>혼밥 {aloneOk}/5</span>}
          </p>

          {address && (
            <p className="mt-auto flex items-center gap-1 pt-1.5 text-xs text-muted">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.8} />
              <span className="truncate">{address}</span>
            </p>
          )}
        </div>
      </Link>

      {/* 메모: 본인이 등록한 가게만 편집 가능 */}
      {(currentMemo || isOwner) && (
        <div className="border-t border-line bg-surface-muted px-3.5 py-2.5">
          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                autoFocus
                placeholder="예: 웨이팅 30분, 2인석 많음"
                className="w-full resize-none rounded-md border border-line bg-surface px-2.5 py-2 text-xs leading-relaxed text-foreground outline-none focus:border-brand"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => {
                    setDraft(currentMemo);
                    setError(null);
                    setEditing(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface"
                >
                  <X className="h-3.5 w-3.5" />
                  취소
                </button>
                <button
                  onClick={saveMemo}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <StickyNote
                className="mt-px h-3.5 w-3.5 shrink-0 text-muted"
                strokeWidth={1.8}
              />
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted">
                {currentMemo || "메모를 남겨보세요."}
              </p>
              {isOwner && (
                <button
                  onClick={() => setEditing(true)}
                  aria-label="메모 수정"
                  className="shrink-0 rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-brand focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
