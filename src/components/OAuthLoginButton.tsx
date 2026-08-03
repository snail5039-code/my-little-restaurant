"use client";

import { createClient } from "@/lib/supabase/client";

export default function OAuthLoginButton({
  provider,
  className,
  children,
}: {
  provider: "kakao" | "google";
  className?: string;
  children: React.ReactNode;
}) {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <button onClick={handleLogin} className={className}>
      {children}
    </button>
  );
}
