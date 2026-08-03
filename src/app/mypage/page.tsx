"use client";

import { useState } from "react";

export default function MyPage() {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        마이페이지
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-neutral-900">
              <span className="text-2xl font-bold text-orange-500">0</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                방문한 맛집
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-neutral-900">
              <span className="text-2xl font-bold text-orange-500">0</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                즐겨찾기
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              최애 맛집
            </h2>
            <p className="text-sm text-neutral-400">
              로그인하면 즐겨찾기한 맛집이 여기에 표시돼요.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
          <button
            onClick={() => setEditOpen((open) => !open)}
            className="flex w-full items-center justify-between text-left font-semibold text-neutral-900 dark:text-neutral-50"
          >
            개인정보 수정
            <span className="text-neutral-400">{editOpen ? "▲" : "▼"}</span>
          </button>

          {editOpen && (
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                닉네임
                <input
                  type="text"
                  disabled
                  placeholder="로그인 후 이용 가능"
                  className="rounded-lg border border-black/10 bg-neutral-50 px-3 py-2 text-sm disabled:text-neutral-400 dark:border-white/10 dark:bg-neutral-800"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                전화번호
                <input
                  type="text"
                  disabled
                  placeholder="로그인 후 이용 가능"
                  className="rounded-lg border border-black/10 bg-neutral-50 px-3 py-2 text-sm disabled:text-neutral-400 dark:border-white/10 dark:bg-neutral-800"
                />
              </label>
              <p className="text-xs text-neutral-400">
                이메일/비밀번호는 소셜 로그인 계정 정보라 수정할 수 없어요.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
