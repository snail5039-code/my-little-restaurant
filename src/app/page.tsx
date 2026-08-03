import Link from "next/link";
import { BookmarkPlus, NotebookPen, MapPinned, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import OAuthLoginButton from "@/components/OAuthLoginButton";
import Rating from "@/components/Rating";

const STEPS = [
  {
    icon: BookmarkPlus,
    title: "저장",
    desc: "가고 싶은 가게를 주소만 넣어 저장해두세요. 좌표는 자동으로 찾아둡니다.",
  },
  {
    icon: NotebookPen,
    title: "기록",
    desc: "다녀온 곳은 방문 체크. 별점과 한 줄 메모로 그날의 기억을 남겨요.",
  },
  {
    icon: MapPinned,
    title: "지도",
    desc: "저장한 가게가 지도 위에 핀으로 모입니다. 근처에 뭐가 있는지 한눈에.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const nickname =
    (user?.user_metadata?.nickname as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 md:px-8 md:py-16">
      {/* 히어로 */}
      <section className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold tracking-wide text-brand">
          맛집 도장깨기
        </span>

        <h1 className="mt-5 text-[30px] font-bold leading-[1.25] tracking-tight text-foreground sm:text-[42px] sm:leading-[1.2]">
          혼밥도, 같이도 좋았던 가게를
          <br />
          <span className="text-brand">나만의 목록</span>으로 남겨두세요.
        </h1>

        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          저장해둔 가게에 다녀오면 체크하고 별점과 메모를 남깁니다. 남이 만든
          랭킹이 아니라, 내가 직접 채워가는 맛집 기록장.
        </p>

        {user ? (
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/restaurants"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              맛집 리스트로 이동
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-muted">
              {nickname ? `${nickname}님, 환영해요.` : "환영해요."}
            </span>
          </div>
        ) : (
          <>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <OAuthLoginButton provider="kakao" />
              <OAuthLoginButton provider="google" />
            </div>

            <Link
              href="/restaurants"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
            >
              먼저 둘러보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </section>

      {/* 카드 미리보기 — 실제 리스트가 어떻게 보이는지 */}
      <section className="mt-14 rounded-lg border border-line bg-surface p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          리스트 미리보기
        </p>
        <div className="mt-3 flex gap-3.5">
          <div className="flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-md border border-line bg-surface-muted">
            <MapPinned className="h-7 w-7 text-muted" strokeWidth={1.4} />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="truncate text-[15px] font-bold text-foreground">
              할머니 손칼국수
            </p>
            <div className="mt-1">
              <Rating value={4.2} reviewCount={3} />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              한식 <span className="text-line">·</span> 혼밥 2/5
            </p>
            <p className="mt-1.5 truncate text-xs text-muted">
              웨이팅 15분, 1인석 있어서 혼밥 편했음
            </p>
          </div>
        </div>
      </section>

      {/* 사용 흐름 — 카드 3장 대신 구분선으로 나눈 한 덩어리 */}
      <section className="mt-10 grid grid-cols-1 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex flex-col gap-2 p-5">
            <div className="flex items-center gap-2">
              <step.icon className="h-4 w-4 text-brand" strokeWidth={2} />
              <span className="tnum text-[11px] font-bold text-muted">
                0{i + 1}
              </span>
            </div>
            <h2 className="text-[15px] font-bold text-foreground">
              {step.title}
            </h2>
            <p className="text-[13px] leading-relaxed text-muted">
              {step.desc}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
