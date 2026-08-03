"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createPost } from "@/app/board/actions";
import { CATEGORIES, type PostCategory } from "@/app/board/constants";
import type { ActionState } from "@/app/restaurants/actions";

const initialState: ActionState = {};

const FIELD_CLASS =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-wide text-muted";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      등록하기
    </button>
  );
}

export default function NewPostForm({ isAdmin }: { isAdmin: boolean }) {
  const [state, formAction] = useActionState(createPost, initialState);
  const router = useRouter();

  const selectableCategories: { value: PostCategory; label: string }[] =
    isAdmin ? [...CATEGORIES] : CATEGORIES.filter((c) => c.value !== "notice");

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5"
    >
      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>카테고리</span>
        <select name="category" required defaultValue="" className={FIELD_CLASS}>
          <option value="" disabled>
            선택해주세요
          </option>
          {selectableCategories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>제목</span>
        <input name="title" required className={FIELD_CLASS} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>내용</span>
        <textarea
          name="content"
          required
          rows={8}
          className={`${FIELD_CLASS} resize-none leading-relaxed`}
        />
      </label>

      {state.error && <p className="text-[13px] text-red-500">{state.error}</p>}

      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/board")}
          className="rounded-md px-3.5 py-2 text-[13px] font-semibold text-muted transition-colors hover:bg-surface-muted"
        >
          취소
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
