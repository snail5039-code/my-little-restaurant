"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/mypage/actions";
import type { ActionState } from "@/app/restaurants/actions";

const initialState: ActionState = {};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      저장
    </button>
  );
}

export default function ProfileEditForm({
  nickname,
  phone,
}: {
  nickname: string;
  phone: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
      <button
        onClick={() => setEditOpen((open) => !open)}
        className="flex w-full items-center justify-between text-left font-semibold text-neutral-900 dark:text-neutral-50"
      >
        개인정보 수정
        {editOpen ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>

      {editOpen && (
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            닉네임
            <input
              name="nickname"
              defaultValue={nickname}
              required
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            전화번호
            <input
              name="phone"
              defaultValue={phone}
              placeholder="010-0000-0000"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
            />
          </label>
          <p className="text-xs text-neutral-400">
            이메일/비밀번호는 소셜 로그인 계정 정보라 수정할 수 없어요.
          </p>

          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          {state.success && (
            <p className="text-sm text-green-600">저장했어요.</p>
          )}

          <div>
            <SaveButton />
          </div>
        </form>
      )}
    </section>
  );
}
