import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RecentBookings from "@/app/components/bookings/RecentBookings";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: club } = await supabase
    .from("clubs")
    .select("*, courts(*)")
    .eq("owner_id", user.id)
    .single();

  if (!club) {
    return (
      <main className="max-w-5xl mx-auto px-5 py-12">
        <div className="glass-card rounded-2xl p-14 text-center">
          <p className="text-white/40 text-lg">
            You don&apos;t have a club yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-white mb-1 tracking-tight"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          {club.name}
        </h1>
        <p className="text-white/35 text-sm flex items-center gap-1.5 mt-1">
          <svg
            width="11"
            height="13"
            viewBox="0 0 11 13"
            fill="none"
            aria-hidden
          >
            <path
              d="M5.5 0C3.014 0 1 2.014 1 4.5c0 3.375 4.5 8.5 4.5 8.5S10 7.875 10 4.5C10 2.014 7.986 0 5.5 0Zm0 6.5A2 2 0 1 1 5.5 2.5a2 2 0 0 1 0 4Z"
              fill="currentColor"
            />
          </svg>
          {club.address}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 animate-fade-up delay-100">
        {[
          { label: "Courts", value: String(club.courts.length) },
          { label: "Status", value: "Active" },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <p
              className="text-xs text-white/35 mb-2 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {label}
            </p>
            <p
              className="text-3xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Courts section */}
      <div className="mb-10 animate-fade-up delay-200">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Courts
          </h2>
          <a
            href="/dashboard/courts/new"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#c9ff3b] text-black hover:bg-[#d9ff60] transition-all duration-200 hover:shadow-[0_0_24px_rgba(201,255,59,0.38)]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            + Add court
          </a>
        </div>

        <div className="grid gap-3">
          {club.courts.map(
            (court: {
              id: string;
              name: string;
              type: string;
              price_per_hour: number;
            }) => (
              <div
                key={court.id}
                className="glass-card rounded-2xl p-5 flex items-center justify-between"
              >
                <div>
                  <h3
                    className="font-bold text-white mb-0.5"
                    style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                  >
                    {court.name}
                  </h3>
                  <p className="text-sm text-white/40 capitalize">
                    {court.type} ·{" "}
                    <span className="text-[#c9ff3b] font-semibold">
                      {court.price_per_hour} GEL
                    </span>{" "}
                    / hour
                  </p>
                </div>
                <a
                  href={`/dashboard/courts/${court.id}`}
                  className="text-sm text-white/40 hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/[0.08] hover:border-white/25"
                  style={{
                    fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                  }}
                >
                  Manage
                </a>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="animate-fade-up delay-300">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Recent Bookings
          </h2>
          <a
            href="/dashboard/bookings"
            className="text-sm text-white/35 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
          >
            View all →
          </a>
        </div>
        <RecentBookings clubId={club.id} />
      </div>
    </main>
  );
}
