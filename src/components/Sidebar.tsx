"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, CircleUserRound } from "lucide-react";
import AuthStatus from "./AuthStatus";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/restaurants", label: "맛집 리스트", icon: UtensilsCrossed },
  { href: "/mypage", label: "마이페이지", icon: CircleUserRound },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col gap-1 border-r border-black/10 bg-orange-50/60 p-4 dark:border-white/10 dark:bg-neutral-900">
      <div className="mb-6 px-2 text-lg font-bold text-orange-600 dark:text-orange-400">
        나만의 작은 맛집
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-orange-500 text-white"
                : "text-neutral-700 hover:bg-orange-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}

      <div className="mt-auto">
        <AuthStatus />
      </div>
    </aside>
  );
}
