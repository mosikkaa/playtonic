import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AnimatedBookingList from "@/app/components/bookings/AnimatedBookingList";

export default async function BookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, time_slots(*, courts(*, clubs(*)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-white mb-1 tracking-tight"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          My Bookings
        </h1>
        <p className="text-white/30 text-sm mt-1">
          {user.email}
        </p>
      </div>

      {!bookings?.length ? (
        <div className="glass-card rounded-2xl p-14 text-center animate-fade-up delay-100">
          <p className="text-4xl mb-4">🎾</p>
          <p
            className="text-white font-extrabold text-xl mb-2"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            No bookings yet
          </p>
          <p className="text-white/40 text-sm mb-7">
            Find a court and make your first booking
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl bg-[#c9ff3b] text-black hover:bg-[#d9ff60] transition-all duration-200 hover:shadow-[0_0_32px_rgba(201,255,59,0.38)]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Browse clubs →
          </a>
        </div>
      ) : (
        <div className="animate-fade-up delay-100">
          <AnimatedBookingList bookings={bookings} />
        </div>
      )}
    </main>
  );
}
