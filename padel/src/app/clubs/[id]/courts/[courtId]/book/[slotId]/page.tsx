import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string; courtId: string; slotId: string }>;
}) {
  const { id, courtId, slotId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: slot } = await supabase
    .from("time_slots")
    .select("*, courts(*, clubs(*))")
    .eq("id", slotId)
    .single();

  if (!slot) notFound();

  async function confirmBooking() {
    "use server";
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    await supabase.from("bookings").insert({
      court_id: courtId,
      user_id: user.id,
      slot_id: slotId,
      total_price: slot.courts.price_per_hour,
      status: "confirmed",
      payment_status: "unpaid",
    });

    await supabase
      .from("time_slots")
      .update({ is_available: false })
      .eq("id", slotId);

    redirect(`/bookings`);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <a
        href={`/clubs/${id}/courts/${courtId}`}
        className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block"
      >
        ← Back to slots
      </a>

      <h1 className="text-3xl font-semibold mb-8">Confirm booking</h1>

      <div className="border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Club</span>
            <span className="font-medium">{slot.courts.clubs.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Court</span>
            <span className="font-medium">{slot.courts.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">
              {new Date(slot.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time</span>
            <span className="font-medium">
              {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between">
            <span className="text-gray-500">Total</span>
            <span className="text-lg font-semibold">
              {slot.courts.price_per_hour} GEL
            </span>
          </div>
        </div>
      </div>

      {user ? (
        <form action={confirmBooking}>
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Confirm booking
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-4">You need to be logged in to book</p>

          <a
            href="/login"
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors inline-block text-center"
          >
            Log in to continue
          </a>
        </div>
      )}
    </main>
  );
}
