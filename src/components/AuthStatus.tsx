"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import OAuthLoginButton from "./OAuthLoginButton";

export default function AuthStatus() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const readUser = (user: { user_metadata?: Record<string, unknown>; email?: string } | null | undefined) => {
      const metadata = user?.user_metadata ?? {};
      const name =
        (metadata.nickname as string | undefined) ??
        (metadata.name as string | undefined) ??
        (metadata.full_name as string | undefined) ??
        user?.email ??
        null;
      setNickname(name);
    };

    supabase.auth.getUser().then(({ data }) => {
      readUser(data.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        readUser(session?.user);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return null;
  }

  if (!nickname) {
    return (
      <div className="flex flex-col gap-2">
        <OAuthLoginButton
          provider="kakao"
          className="rounded-lg bg-[#FEE500] px-3 py-2 text-sm font-medium text-black/85 transition-colors hover:brightness-95"
        >
          카카오 로그인
        </OAuthLoginButton>
        <OAuthLoginButton
          provider="google"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
        >
          구글 로그인
        </OAuthLoginButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-orange-100/60 p-3 text-sm dark:bg-neutral-800">
      <span className="font-medium text-neutral-800 dark:text-neutral-200">
        {nickname}님
      </span>
      <button
        onClick={handleLogout}
        className="text-left text-xs text-neutral-500 hover:underline dark:text-neutral-400"
      >
        로그아웃
      </button>
    </div>
  );
}
