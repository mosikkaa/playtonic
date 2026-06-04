import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnimatedBookingList from "@/app/components/bookings/AnimatedBookingList";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, time_slots(*, courts(*, clubs(*)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const initial = user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <main className="max-w-7xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <div className="flex items-center gap-5 mb-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shrink-0"
            style={{ background: "#2563eb", fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            {initial}
          </div>
          <div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              My Profile
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="animate-fade-up delay-100">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold text-[#0f172a]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            My Bookings
          </h2>
          <span className="text-sm text-slate-400">{bookings?.length ?? 0} total</span>
        </div>

        {!bookings?.length ? (
          <div className="glass-card rounded-2xl p-14 text-center">
            <p className="text-3xl mb-4">🎾</p>
            <p
              className="text-[#0f172a] font-extrabold text-xl mb-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              No bookings yet
            </p>
            <p className="text-slate-500 text-sm mb-7">Find a court and make your first booking</p>
            <a
              href="/padel-courts"
              className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Browse courts →
            </a>
          </div>
        ) : (
          <AnimatedBookingList bookings={bookings} />
        )}
      </div>
    </main>
  );
}
