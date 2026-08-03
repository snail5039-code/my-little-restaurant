import Link from "next/link";
import { UtensilsCrossed, ClipboardList, MapPinned, Search } from "lucide-react";
import OAuthLoginButton from "@/components/OAuthLoginButton";

const STEPS = [
  { title: "맛집 등록", desc: "가고 싶은 식당을 저장해두세요.", icon: ClipboardList },
  { title: "체크 & 메모", desc: "다녀온 곳은 체크하고 별점·메모를 남겨요.", icon: Search },
  { title: "지도로 확인", desc: "저장한 맛집을 지도에서 한눈에 봐요.", icon: MapPinned },
];

const CATEGORIES = ["한식", "중식", "일식", "양식", "카페", "분식"];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-neutral-400">
          나만의 맛집 도장깨기
        </span>
        <div className="flex flex-wrap gap-2">
          <OAuthLoginButton
            provider="kakao"
            className="rounded-full bg-[#FEE500] px-5 py-2 text-sm font-semibold text-black/85 shadow-sm transition-colors hover:brightness-95"
          >
            카카오로 시작하기
          </OAuthLoginButton>
          <OAuthLoginButton
            provider="google"
            className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
          >
            구글로 시작하기
          </OAuthLoginButton>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="flex flex-col justify-center gap-6 rounded-2xl bg-white p-6 shadow-sm sm:p-10 dark:bg-neutral-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-300 to-red-400 text-white sm:h-24 sm:w-24">
            <UtensilsCrossed className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
              나만의 작은 맛집
            </h1>
            <p className="mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
              혼밥 또는 친구들과 먹기 좋은 식당들을 저장하고, 다녀온 곳은
              체크하면서 별점과 메모를 남겨보세요. 나만의 맛집 지도를 만드는
              가장 쉬운 방법.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
              >
                {c}
              </span>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-2xl bg-orange-500 p-6 text-white shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">시작하기</h2>
          <ol className="flex flex-1 flex-col gap-4">
            {STEPS.map((step) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <step.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-white/80">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/restaurants"
            className="rounded-full bg-white px-5 py-2 text-center text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
          >
            맛집 둘러보기
          </Link>
        </section>
      </div>
    </main>
  );
}
