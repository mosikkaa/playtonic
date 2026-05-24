import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">My bookings</h1>
      <p className="text-gray-500 mb-8">{user.email}</p>

      {!bookings?.length && (
        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <p className="font-medium mb-1">No bookings yet</p>
          <p className="text-gray-500 text-sm mb-4">
            Find a court and make your first booking
          </p>

          <a
            href="/"
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors
          inline-block"
          >
            Browse clubs
          </a>
        </div>
      )}

      <div className="grid gap-4">
        {bookings?.map((booking: any) => (
          <div
            key={booking.id}
            className="border border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-medium">
                  {booking.time_slots.courts.clubs.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.time_slots.courts.name} ·{" "}
                  {booking.time_slots.courts.type}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-md font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-50 text-green-700"
                    : booking.status === "cancelled"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(booking.time_slots.date).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.time_slots.start_time.slice(0, 5)} –{" "}
                  {booking.time_slots.end_time.slice(0, 5)}
                </p>
              </div>
              <p className="font-medium">{booking.total_price} GEL</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
