import { createClient } from "@/utils/supabase/server";
import PadelCourtsClient from "./PadelCourtsClient";

export default async function PadelCourtsPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [{ data: clubs }, { data: slots }] = await Promise.all([
    supabase.from("clubs").select("*, courts(*)").order("name"),
    supabase
      .from("time_slots")
      .select("id, court_id, date, start_time, end_time")
      .eq("is_available", true)
      .gte("date", today)
      .lte("date", maxDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true }),
  ]);

  return (
    <PadelCourtsClient
      clubs={clubs ?? []}
      slots={slots ?? []}
      initialDate={today}
    />
  );
}
