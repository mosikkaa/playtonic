import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  confirmed: { bg: "rgba(5,150,105,0.08)",  color: "#059669", border: "1px solid rgba(5,150,105,0.2)"  },
  pending:   { bg: "rgba(217,119,6,0.08)",   color: "#b45309", border: "1px solid rgba(217,119,6,0.2)"  },
  cancelled: { bg: "rgba(220,38,38,0.08)",   color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)"  },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? { bg: "rgba(15,23,42,0.04)", color: "#64748b", border: "1px solid rgba(15,23,42,0.1)" };
}

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: club } = await supabase
    .from("clubs").select("id, name").eq("owner_id", user.id).single();

  if (!club) {
    return (
      <main className="max-w-7xl mx-auto px-5 py-12">
        <div className="glass-card rounded-2xl p-14 text-center">
          <p className="text-slate-400 text-lg">You don&apos;t have a club yet.</p>
        </div>
      </main>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, time_slots(*, courts(*))")
    .eq("time_slots.courts.club_id", club.id)
    .order("created_at", { ascending: false });

  const rows = (bookings ?? []).filter((b) => b.time_slots !== null);
  const total = rows.reduce((sum, b) => sum + (b.total_price ?? 0), 0);
  const confirmed = rows.filter((b) => b.status === "confirmed").length;

  return (
    <main className="max-w-7xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 animate-fade-up">
        <div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-3"
            style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
          >
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
              <path d="M11 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </a>
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            All Bookings
          </h1>
          <p className="text-slate-500 text-sm mt-1">{club.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10 animate-fade-up delay-100">
        {[
          { label: "Total",     value: String(rows.length),            accent: false },
          { label: "Confirmed", value: String(confirmed),              accent: false },
          { label: "Revenue",   value: `${total.toLocaleString()} GEL`, accent: true  },
        ].map(({ label, value, accent }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <p
              className="text-xs text-slate-400 mb-2 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {label}
            </p>
            <p
              className={`text-2xl sm:text-3xl font-extrabold ${accent ? "text-[#2563eb]" : "text-[#0f172a]"}`}
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="animate-fade-up delay-200">
        {rows.length === 0 ? (
          <div className="glass-card rounded-2xl p-14 text-center">
            <p className="text-slate-400 text-sm">No bookings yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {rows.map((booking) => {
              const slot = booking.time_slots as {
                date: string; start_time: string; end_time: string; courts: { name: string };
              };
              const style = statusStyle(booking.status);
              const dateStr = slot.date
                ? new Date(slot.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                : "—";

              return (
                <div key={booking.id} className="glass-card rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className="font-bold text-[#0f172a] text-sm truncate mb-0.5"
                      style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                    >
                      {slot.courts?.name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dateStr} · {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p
                      className="text-[#2563eb] font-bold text-sm"
                      style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                    >
                      {booking.total_price} GEL
                    </p>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={style}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
