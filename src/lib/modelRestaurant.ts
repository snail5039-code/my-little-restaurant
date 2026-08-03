// 행정안전부_모범음식점정보 조회서비스 (data.go.kr, 15155052)
// Base URL: apis.data.go.kr/1741000/excellent_restaurant_info
// 제공 필드: 업소명/주소/전화번호/음식유형/지정일자 등 — 메뉴 정보는 제공하지 않음.
const BASE_URL =
  "https://apis.data.go.kr/1741000/excellent_restaurant_info/info";

type ModelRestaurantItem = {
  BSNSSP_NM: string; // 업소명
  ROAD_NM_ADDR: string; // 도로명주소
  LCTN_ADDR: string; // 소재지주소
  SALS_STTS_NM: string; // 영업상태명
  DSGN_YMD: string; // 지정일자
  DSGN_RTRCN_YMD: string; // 지정취소일자
  FD_OF_TYPE: string; // 음식의유형
  PRINC_FD_KND: string; // 주된음식종류
};

export type ModelRestaurantMatch = {
  name: string;
  designatedAt: string;
  foodType: string;
};

function extractDistrict(address: string): string | null {
  // "구/군"(자치구 단위)이 있으면 우선 사용하고, 세종/제주처럼 없는 경우에만 "시" 단위로 대체
  const tokens = address.trim().split(/\s+/);
  return (
    tokens.find((part) => part.length > 1 && /(구|군)$/.test(part)) ??
    tokens.find((part) => part.length > 1 && /시$/.test(part)) ??
    null
  );
}

export async function checkModelRestaurant(
  name: string,
  address?: string | null
): Promise<ModelRestaurantMatch | null> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey || !name.trim()) return null;

  const params = new URLSearchParams({
    serviceKey,
    pageNo: "1",
    numOfRows: "10",
    returnType: "JSON",
    "cond[BSNSSP_NM::LIKE]": name.trim(),
  });

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 24 }, // 하루 1회 정도만 갱신
    });
    if (!res.ok) return null;

    const data = await res.json();
    // 정상 응답 코드는 "0"/"00" 등으로 실제 응답마다 다르게 내려옴 — 실패 코드(음수)만 걸러낸다.
    const resultCode = data?.response?.header?.resultCode;
    if (resultCode === undefined || String(resultCode).startsWith("-")) {
      return null;
    }

    const rawItems = data?.response?.body?.items?.item;
    const items: ModelRestaurantItem[] = Array.isArray(rawItems)
      ? rawItems
      : rawItems
        ? [rawItems]
        : [];

    const district = address ? extractDistrict(address) : null;

    const match = items.find((item) => {
      const stillDesignated =
        item.SALS_STTS_NM?.includes("영업") && !item.DSGN_RTRCN_YMD;
      if (!stillDesignated) return false;
      if (!district) return true;
      return (
        item.LCTN_ADDR?.includes(district) ||
        item.ROAD_NM_ADDR?.includes(district)
      );
    });

    if (!match) return null;

    return {
      name: match.BSNSSP_NM,
      designatedAt: match.DSGN_YMD,
      foodType: match.FD_OF_TYPE || match.PRINC_FD_KND || "",
    };
  } catch {
    return null;
  }
}
