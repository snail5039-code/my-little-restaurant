"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: boolean };

export async function createRestaurant(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "가게 이름을 입력해주세요." };
  }

  const categoryId = formData.get("category_id");
  const categoryName = String(formData.get("category_name") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const aloneOkRaw = formData.get("alone_ok");
  const memo = String(formData.get("memo") ?? "").trim();
  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");

  const { error } = await supabase.from("restaurants").insert({
    name,
    food: categoryName || "기타",
    category_id: categoryId ? Number(categoryId) : null,
    address: address || null,
    alone_ok: aloneOkRaw ? Number(aloneOkRaw) : null,
    memo: memo || null,
    latitude: latRaw ? Number(latRaw) : null,
    longitude: lngRaw ? Number(lngRaw) : null,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/restaurants");
  return { success: true };
}

export async function updateMemo(restaurantId: number | string, memo: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase
    .from("restaurants")
    .update({ memo: memo.trim() || null })
    .eq("id", restaurantId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/restaurants");
  return { success: true };
}
