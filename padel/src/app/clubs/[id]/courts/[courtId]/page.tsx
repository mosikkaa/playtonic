import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function CourtPage({
  params,
}: {
  params: Promise<{ id: string; courtId: string }>;
}) {
  const { id, courtId } = await params;
  const supabase = await createClient();

  const { data: court } = await supabase
    .from("courts")
    .select("*, clubs(*)")
    .eq("id", courtId)
    .single();

  if (!court) notFound();

  const { data: slots } = await supabase
    .from("time_slots")
    .select("*")
    .eq("court_id", courtId)
    .eq("is_available", true)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  const groupedSlots = slots?.reduce((acc: any, slot: any) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <a
        href={`/clubs/${id}`}
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
        ← Back to {court.clubs.name}
      </a>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold">{court.name}</h1>
        <p className="mt-1 text-gray-500 capitalize">
          {court.type} · {court.price_per_hour} GEL / hour
        </p>
      </div>

      <h2 className="mb-4 text-xl font-medium">Available slots</h2>

      {!slots?.length && (
        <p className="text-gray-500">No available slots at the moment.</p>
      )}

      <div className="grid gap-6">
        {groupedSlots &&
          Object.entries(groupedSlots).map(([date, daySlots]: any) => (
            <div key={date}>
              <p className="mb-3 text-sm font-medium text-gray-500">
                {new Date(date).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {daySlots.map((slot: any) => (
                  <a
                    key={slot.id}
                    href={`/clubs/${id}/courts/${courtId}/book/${slot.id}`}
                    className="rounded-xl border border-gray-200 p-4 text-center transition-colors hover:border-black"
                  >
                    <p className="font-medium">
                      {slot.start_time.slice(0, 5)} –{" "}
                      {slot.end_time.slice(0, 5)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {court.price_per_hour} GEL
                    </p>
                  </a>
                ))}
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
