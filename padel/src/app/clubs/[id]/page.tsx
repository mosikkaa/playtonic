import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ClubDetailClient from "./ClubDetailClient";

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string | string[]; time?: string | string[] }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 13);
    return d.toISOString().split("T")[0];
  })();

  const initialDate = Array.isArray(sp.date) ? sp.date[0] : sp.date;
  const initialTime = Array.isArray(sp.time) ? sp.time[0] : sp.time;

  const { data: club } = await supabase
    .from("clubs")
    .select(
      "id, name, address, description, indoor, outdoor, courts(id, name, type, price_per_hour)"
    )
    .eq("id", id)
    .single();

  if (!club) notFound();

  const courtIds = (club.courts as { id: string }[]).map((c) => c.id);

  const { data: slots } = courtIds.length
    ? await supabase
        .from("time_slots")
        .select("id, court_id, date, start_time, end_time, is_available")
        .in("court_id", courtIds)
        .gte("date", today)
        .lte("date", maxDate)
        .order("date")
        .order("start_time")
    : { data: [] };

  return (
    <ClubDetailClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      club={club as any}
      slots={slots ?? []}
      today={today}
      initialDate={initialDate}
      initialTime={initialTime}
    />
  );
}
