"use client";

import { X, LogIn } from "lucide-react";
import OAuthLoginButton from "./OAuthLoginButton";

export default function LoginRequiredModal({
  open,
  onClose,
  message = "로그인 후 이용할 수 있는 기능이에요.",
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-neutral-900"
      >
        <button
          onClick={onClose}
          className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40">
          <LogIn className="h-6 w-6" />
        </div>

        <div>
          <h2 className="font-bold text-neutral-900 dark:text-neutral-50">
            로그인이 필요해요
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {message}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <OAuthLoginButton
            provider="kakao"
            className="w-full rounded-full bg-[#FEE500] px-5 py-2 text-sm font-semibold text-black/85 shadow-sm transition-colors hover:brightness-95"
          >
            카카오로 로그인
          </OAuthLoginButton>
          <OAuthLoginButton
            provider="google"
            className="w-full rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
          >
            구글로 로그인
          </OAuthLoginButton>
        </div>
      </div>
    </div>
  );
}
