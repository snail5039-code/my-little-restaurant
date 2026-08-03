import { supabase, type Restaurant } from "@/lib/supabase";

export default async function Home() {
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("id");

  return (
    <main>
      <h1>나만의 작은 맛집</h1>
      {error && <p>목록을 불러오지 못했습니다: {error.message}</p>}
      <ul>
        {restaurants?.map((restaurant: Restaurant) => (
          <li key={restaurant.id}>
            {restaurant.name} - {restaurant.food}
          </li>
        ))}
      </ul>
    </main>
  );
}
