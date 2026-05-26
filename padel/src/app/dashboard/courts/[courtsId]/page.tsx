import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import AddSlotForm from "../../../components/courts/AddSlotForm";

export default async function ManageCourtPage({
  params,
}: {
  params: Promise<{ courtId: string }>;
}) {
  const { courtId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: court } = await supabase
    .from("courts")
    .select("*, clubs(*)")
    .eq("id", courtId)
    .single();

  if (!court || court.clubs.owner_id !== user.id) notFound();

  const { data: slots } = await supabase
    .from("time_slots")
    .select("*")
    .eq("court_id", courtId)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  const groupedSlots = slots?.reduce((acc: any, slot: any) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <a
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block"
      >
        ← Back to dashboard
      </a>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">{court.name}</h1>
          <p className="text-gray-500 mt-1 capitalize">
            {court.type} · {court.price_per_hour} GEL / hour
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        {/* Add slot form */}
        <div>
          <h2 className="text-xl font-medium mb-4">Add time slot</h2>
          <AddSlotForm courtId={courtId} />
        </div>

        {/* Existing slots */}
        <div>
          <h2 className="text-xl font-medium mb-4">Upcoming slots</h2>
          {!slots?.length && (
            <p className="text-gray-500 text-sm">No slots added yet.</p>
          )}
          <div className="grid gap-6">
            {groupedSlots &&
              Object.entries(groupedSlots).map(([date, daySlots]: any) => (
                <div key={date}>
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    {new Date(date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <div className="grid gap-2">
                    {daySlots.map((slot: any) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
                      >
                        <p className="text-sm font-medium">
                          {slot.start_time.slice(0, 5)} –{" "}
                          {slot.end_time.slice(0, 5)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-medium ${
                            slot.is_available
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {slot.is_available ? "Available" : "Booked"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
