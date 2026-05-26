import { createClient } from "@/utils/supabase/server";

async function RecentBookings({ clubId }: { clubId: string }) {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, time_slots(*, courts(*))")
    .eq("time_slots.courts.club_id", clubId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!bookings?.length) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-white/35 text-sm">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {bookings.map(
        (booking: {
          id: string;
          total_price: number;
          status: string;
          time_slots: {
            date: string;
            start_time: string;
            end_time: string;
            courts: { name: string };
          } | null;
        }) => (
          <div
            key={booking.id}
            className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p
                className="font-bold text-white text-sm mb-0.5"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {booking.time_slots?.courts?.name ?? "—"}
              </p>
              <p className="text-sm text-white/40">
                {booking.time_slots?.date
                  ? new Date(booking.time_slots.date).toLocaleDateString(
                      "en-GB",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      },
                    )
                  : "—"}{" "}
                · {booking.time_slots?.start_time?.slice(0, 5)} —{" "}
                {booking.time_slots?.end_time?.slice(0, 5)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-[#c9ff3b] font-bold"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {booking.total_price} GEL
              </p>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block"
                style={{
                  background:
                    booking.status === "confirmed"
                      ? "rgba(0,255,135,0.1)"
                      : "rgba(255,255,255,0.06)",
                  color:
                    booking.status === "confirmed"
                      ? "#00ff87"
                      : "rgba(255,255,255,0.4)",
                  border:
                    booking.status === "confirmed"
                      ? "1px solid rgba(0,255,135,0.22)"
                      : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {booking.status}
              </span>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export default RecentBookings;
