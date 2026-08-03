"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X, MapPin, Loader2 } from "lucide-react";
import { createRestaurant, type ActionState } from "@/app/restaurants/actions";
import LoginRequiredModal from "./LoginRequiredModal";

const GEOCODE_SCRIPT_ID = "kakao-maps-sdk-services";

function loadGeocodeScript() {
  return new Promise<void>((resolve) => {
    if (window.kakao?.maps?.services) {
      resolve();
      return;
    }

    let script = document.getElementById(
      GEOCODE_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (!script) {
      const appkey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
      script = document.createElement("script");
      script.id = GEOCODE_SCRIPT_ID;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services`;
      script.async = true;
      document.head.appendChild(script);
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve);
      return;
    }
    script.addEventListener("load", () => window.kakao?.maps.load(resolve));
  });
}

export default function RegisterRestaurantModal({
  categories,
  isLoggedIn,
}: {
  categories: { id: number; name: string }[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<string | null>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createRestaurant({}, formData);
      setState(result);
      if (result.success) {
        formRef.current?.reset();
        setCoords(null);
        setGeocodeMsg(null);
        setOpen(false);
      }
    });
  };

  const handleGeocode = async () => {
    const address = addressRef.current?.value.trim();
    if (!address) {
      setGeocodeMsg("주소를 먼저 입력해주세요.");
      return;
    }
    setGeocoding(true);
    setGeocodeMsg(null);
    await loadGeocodeScript();
    const kakao = window.kakao;
    if (!kakao) {
      setGeocoding(false);
      setGeocodeMsg("지도 SDK를 불러오지 못했어요.");
      return;
    }
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      setGeocoding(false);
      if (status === kakao.maps.services.Status.OK && result[0]) {
        setCoords({ lat: Number(result[0].y), lng: Number(result[0].x) });
        setGeocodeMsg("좌표를 찾았어요. 지도에 표시됩니다.");
      } else {
        setCoords(null);
        setGeocodeMsg(
          "주소로 좌표를 찾지 못했어요. 등록은 되지만 지도엔 안 나와요."
        );
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
      >
        <Plus className="h-4 w-4" />
        맛집 등록
      </button>

      <LoginRequiredModal
        open={open && !isLoggedIn}
        onClose={() => setOpen(false)}
        message="맛집을 등록하려면 로그인이 필요해요."
      />

      {open && isLoggedIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                맛집 등록
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
              <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
              <input type="hidden" name="longitude" value={coords?.lng ?? ""} />

              <label className="flex flex-col gap-1 text-sm">
                가게 이름
                <input
                  name="name"
                  required
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                카테고리
                <select
                  name="category_id"
                  required
                  defaultValue=""
                  onChange={(e) => {
                    const opt = e.target.selectedOptions[0];
                    const hidden = e.target.form?.elements.namedItem(
                      "category_name"
                    ) as HTMLInputElement | null;
                    if (hidden) hidden.value = opt?.text ?? "";
                  }}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
                >
                  <option value="">선택해주세요</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="category_name" />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                주소
                <div className="flex gap-2">
                  <input
                    ref={addressRef}
                    name="address"
                    className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
                    onChange={() => setCoords(null)}
                  />
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={geocoding}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-60 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    {geocoding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                    좌표 찾기
                  </button>
                </div>
                {geocodeMsg && (
                  <span className="text-xs text-neutral-400">{geocodeMsg}</span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-sm">
                혼밥 난이도 (1~5)
                <select
                  name="alone_ok"
                  defaultValue=""
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
                >
                  <option value="">선택 안 함</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                메모
                <textarea
                  name="memo"
                  rows={2}
                  placeholder="한 줄 메모를 남겨보세요"
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
                />
              </label>

              {state.error && <p className="text-sm text-red-500">{state.error}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
