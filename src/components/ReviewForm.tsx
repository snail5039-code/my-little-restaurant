"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createReview, type ActionState } from "@/app/restaurants/actions";
import OAuthLoginButton from "./OAuthLoginButton";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      리뷰 남기기
    </button>
  );
}

export default function ReviewForm({
  restaurantId,
  isLoggedIn,
}: {
  restaurantId: number | string;
  isLoggedIn: boolean;
}) {
  const [state, formAction] = useActionState(createReview, initialState);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-2 border-t border-line px-5 py-4">
        <p className="text-[13px] text-muted">리뷰는 로그인 후 남길 수 있어요.</p>
        <div className="flex gap-2">
          <OAuthLoginButton provider="kakao" size="sm" />
          <OAuthLoginButton provider="google" size="sm" />
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2.5 border-t border-line px-5 py-4"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <label className="flex items-center gap-2 text-[13px] text-muted">
        별점
        <select
          name="rating"
          defaultValue="5"
          className="rounded-md border border-line bg-surface px-2 py-1.5 text-[13px] text-foreground outline-none focus:border-brand"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}점
            </option>
          ))}
        </select>
      </label>

      <textarea
        name="content"
        rows={2}
        required
        placeholder="어떤 점이 좋았나요?"
        className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-[13px] leading-relaxed text-foreground outline-none focus:border-brand"
      />

      {state.error && <p className="text-xs text-red-500">{state.error}</p>}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
