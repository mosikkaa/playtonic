import { createClient } from "@/utils/supabase/server";

const STATUS: Record<string, { bg: string; color: string; border: string }> = {
  confirmed: { bg: "rgba(5,150,105,0.08)",  color: "#059669", border: "1px solid rgba(5,150,105,0.2)"  },
  pending:   { bg: "rgba(217,119,6,0.08)",   color: "#b45309", border: "1px solid rgba(217,119,6,0.2)"  },
  cancelled: { bg: "rgba(220,38,38,0.08)",   color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)"  },
};

function statusStyle(s: string) {
  return STATUS[s] ?? { bg: "rgba(15,23,42,0.04)", color: "#64748b", border: "1px solid rgba(15,23,42,0.1)" };
}

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
        <p className="text-slate-400 text-sm">No bookings yet.</p>
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
                className="font-bold text-[#0f172a] text-sm mb-0.5"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {booking.time_slots?.courts?.name ?? "—"}
              </p>
              <p className="text-sm text-slate-500">
                {booking.time_slots?.date
                  ? new Date(booking.time_slots.date).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "—"}{" "}
                · {booking.time_slots?.start_time?.slice(0, 5)} —{" "}
                {booking.time_slots?.end_time?.slice(0, 5)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-[#2563eb] font-bold"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {booking.total_price} GEL
              </p>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block"
                style={statusStyle(booking.status)}
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
