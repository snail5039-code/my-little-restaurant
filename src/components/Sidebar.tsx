"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, UtensilsCrossed, CircleUserRound, Menu, X } from "lucide-react";
import AuthStatus from "./AuthStatus";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/restaurants", label: "맛집 리스트", icon: UtensilsCrossed },
  { href: "/mypage", label: "마이페이지", icon: CircleUserRound },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                : "text-neutral-600 hover:bg-orange-100/70 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur md:hidden dark:border-white/5 dark:bg-neutral-950/90">
        <span className="text-lg font-bold tracking-tight text-orange-600 dark:text-orange-400">
          나만의 작은 맛집
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="메뉴 열기"
          className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col gap-6 bg-white p-4 shadow-xl dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                나만의 작은 맛집
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="메뉴 닫기"
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <div className="mt-auto">
              <AuthStatus />
            </div>
          </div>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-black/5 bg-white/60 p-5 md:flex dark:border-white/5 dark:bg-neutral-950/40">
        <div className="px-1 text-lg font-bold tracking-tight text-orange-600 dark:text-orange-400">
          나만의 작은 맛집
        </div>
        <NavLinks />
        <div className="mt-auto">
          <AuthStatus />
        </div>
      </aside>
    </>
  );
}
