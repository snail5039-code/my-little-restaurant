import { UtensilsCrossed, CheckCircle2, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProfileEditForm from "@/components/ProfileEditForm";
import OAuthLoginButton from "@/components/OAuthLoginButton";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:p-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          마이페이지
        </h1>
        <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          로그인 후 이용할 수 있는 페이지예요. 방문 기록과 즐겨찾기를 보려면
          로그인해주세요.
        </p>
        <div className="flex gap-2">
          <OAuthLoginButton
            provider="kakao"
            className="rounded-full bg-[#FEE500] px-5 py-2 text-sm font-semibold text-black/85 shadow-sm transition-colors hover:brightness-95"
          >
            카카오로 로그인
          </OAuthLoginButton>
          <OAuthLoginButton
            provider="google"
            className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
          >
            구글로 로그인
          </OAuthLoginButton>
        </div>
      </main>
    );
  }

  const [
    { data: profile },
    { count: visitedCount },
    { count: favoriteCount },
    { data: favoriteRestaurants },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, phone")
      .eq("id", user.id)
      .single(),
    supabase
      .from("restaurants")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("visited", true),
    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("favorites")
      .select("restaurant_id, restaurants(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const favoriteNames = (favoriteRestaurants ?? [])
    .map((f) => (f as unknown as { restaurants?: { name: string } }).restaurants?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          마이페이지
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {profile?.nickname ?? "회원"}님, 오늘도 좋은 한 끼 되세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-neutral-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {visitedCount ?? 0}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                방문한 맛집
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-neutral-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-400 dark:bg-red-900/30">
                <Heart className="h-5 w-5 fill-current" />
              </span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {favoriteCount ?? 0}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                즐겨찾기
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              최애 맛집
            </h2>
            {favoriteNames.length > 0 ? (
              <ul className="flex flex-col gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                {favoriteNames.map((name, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-orange-400" />
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">
                아직 즐겨찾기한 맛집이 없어요.
              </p>
            )}
          </div>
        </section>

        <ProfileEditForm
          nickname={profile?.nickname ?? ""}
          phone={profile?.phone ?? ""}
        />
      </div>
    </main>
  );
}
