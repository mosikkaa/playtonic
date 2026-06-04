import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string; courtId: string; slotId: string }>;
}) {
  const { id, courtId, slotId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: slot } = await supabase
    .from("time_slots")
    .select("*, courts(*, clubs(*))")
    .eq("id", slotId)
    .single();

  if (!slot) notFound();

  async function confirmBooking() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    await supabase.from("bookings").insert({
      court_id: courtId,
      user_id: user.id,
      slot_id: slotId,
      total_price: slot.courts.price_per_hour,
      status: "confirmed",
      payment_status: "unpaid",
    });

    await supabase.from("time_slots").update({ is_available: false }).eq("id", slotId);
    redirect(`/bookings`);
  }

  const formattedDate = new Date(slot.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  const rows = [
    { label: "Club",  value: slot.courts.clubs.name },
    { label: "Court", value: slot.courts.name },
    { label: "Date",  value: formattedDate },
    { label: "Time",  value: `${slot.start_time.slice(0, 5)} — ${slot.end_time.slice(0, 5)}` },
  ];

  return (
    <main className="max-w-lg mx-auto px-5 py-12">
      <a
        href={`/clubs/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 mb-8 transition-colors duration-200"
        style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
      >
        ← Back to club
      </a>

      <h1
        className="text-4xl font-extrabold text-[#0f172a] mb-8 animate-fade-up"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        Confirm Booking
      </h1>

      {/* Summary card */}
      <div className="glass-card rounded-2xl p-6 mb-5 animate-fade-up delay-100">
        <p
          className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em] mb-5"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Booking Summary
        </p>

        <div className="flex flex-col gap-4">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
                {label}
              </span>
              <span className="text-sm font-medium text-[#0f172a] text-right" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
                {value}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 mt-1" style={{ borderTop: "1px solid rgba(15,23,42,0.07)" }}>
            <span className="text-sm text-slate-500" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>Total</span>
            <span className="text-3xl font-extrabold text-[#2563eb]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
              {slot.courts.price_per_hour}
              <span className="text-sm font-normal text-slate-400 ml-1">GEL</span>
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fade-up delay-200">
        {user ? (
          <form action={confirmBooking}>
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-extrabold text-base text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Confirm Booking →
            </button>
          </form>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-slate-500 mb-5 text-sm" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
              You need to be logged in to book this court.
            </p>
            <a
              href="/login"
              className="inline-block w-full py-4 rounded-xl font-extrabold text-base text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md text-center"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Log in to continue →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
