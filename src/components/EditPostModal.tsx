"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, X, Loader2 } from "lucide-react";
import { updatePost } from "@/app/board/actions";
import { CATEGORIES, type PostCategory } from "@/app/board/constants";
import type { ActionState } from "@/app/restaurants/actions";

const FIELD_CLASS =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-wide text-muted";

export default function EditPostModal({
  postId,
  isAdmin,
  category,
  title,
  content,
}: {
  postId: number | string;
  isAdmin: boolean;
  category: PostCategory;
  title: string;
  content: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();

  const selectableCategories = isAdmin
    ? [...CATEGORIES]
    : CATEGORIES.filter((c) => c.value !== "notice" || c.value === category);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setState({});
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updatePost({}, formData);
      setState(result);
      if (result.success) {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-brand"
      >
        <Pencil className="h-3.5 w-3.5" />
        수정
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 sm:items-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-post-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-auto w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 id="edit-post-title" className="text-[15px] font-bold text-foreground">
                글 수정
              </h2>
              <button
                onClick={close}
                aria-label="닫기"
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={handleSubmit} className="flex flex-col gap-3.5 p-5">
              <input type="hidden" name="post_id" value={postId} />

              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>카테고리</span>
                <select
                  name="category"
                  required
                  defaultValue={category}
                  className={FIELD_CLASS}
                >
                  {selectableCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>제목</span>
                <input
                  name="title"
                  required
                  autoFocus
                  defaultValue={title}
                  className={FIELD_CLASS}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>내용</span>
                <textarea
                  name="content"
                  required
                  rows={8}
                  defaultValue={content}
                  className={`${FIELD_CLASS} resize-none leading-relaxed`}
                />
              </label>

              {state.error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {state.error}
                </p>
              )}

              <div className="mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md px-3.5 py-2 text-[13px] font-semibold text-muted transition-colors hover:bg-surface-muted"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
