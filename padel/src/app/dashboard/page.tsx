import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import RecentBookings from "@/app/components/bookings/RecentBookings";
import CourtsTab from "@/app/components/dashboard/CourtsTab";
import CalendarTab from "@/app/components/dashboard/CalendarTab";
import ClubInfoTab from "@/app/components/dashboard/ClubInfoTab";

const TABS = [
  { id: "overview",  label: "Overview"  },
  { id: "courts",    label: "Courts"    },
  { id: "calendar",  label: "Calendar"  },
  { id: "club",      label: "Club Info" },
  { id: "photos",    label: "Photos"    },
] as const;

type TabId = typeof TABS[number]["id"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab = "overview" } = await searchParams;
  const tab = (TABS.some((t) => t.id === rawTab) ? rawTab : "overview") as TabId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: club } = await supabase
    .from("clubs")
    .select("*, courts(*)")
    .eq("owner_id", user.id)
    .single();

  if (!club) {
    return (
      <main className="max-w-7xl mx-auto px-5 py-12">
        <div className="glass-card rounded-2xl p-14 text-center">
          <p className="text-slate-400 text-lg">You don&apos;t have a club yet.</p>
          <a href="/register-club" className="inline-flex mt-6 px-6 py-3 rounded-xl bg-[#2563eb] text-white font-bold text-sm hover:bg-[#1d4ed8] transition-colors shadow-sm"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            Register your club →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          {club.name}
        </h1>
        <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-1">
          <svg width="10" height="13" viewBox="0 0 10 13" fill="currentColor" aria-hidden>
            <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8C10 2.24 7.76 0 5 0Zm0 7.5A2.5 2.5 0 1 1 5 2.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
          {club.address}
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-2xl mb-8 overflow-x-auto scrollbar-hide animate-fade-up delay-100"
        style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.08)", width: "fit-content" }}>
        {TABS.map((t) => (
          <Link key={t.id} href={t.id === "overview" ? "/dashboard" : `/dashboard?tab=${t.id}`}
            className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              background: tab === t.id ? "#ffffff" : "transparent",
              color: tab === t.id ? "#0f172a" : "#64748b",
              boxShadow: tab === t.id ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
            }}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-up delay-200">

        {/* ── Overview ───────────────────────────────────────── */}
        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {[
                { label: "Courts",    value: String(club.courts.length) },
                { label: "Status",    value: "Active" },
                { label: "Indoor",    value: club.indoor  ? "Yes" : "No" },
                { label: "Outdoor",   value: club.outdoor ? "Yes" : "No" },
              ].map(({ label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-5">
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>{label}</p>
                  <p className="text-2xl font-extrabold text-[#0f172a]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#0f172a]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Recent Bookings</h2>
              <Link href="/dashboard/bookings" className="text-sm text-slate-400 hover:text-slate-700 transition-colors" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
                View all →
              </Link>
            </div>
            <RecentBookings clubId={club.id} />
          </>
        )}

        {/* ── Courts ─────────────────────────────────────────── */}
        {tab === "courts" && (
          <CourtsTab courts={club.courts} clubId={club.id} />
        )}

        {/* ── Calendar ───────────────────────────────────────── */}
        {tab === "calendar" && (
          <CalendarTab courts={club.courts.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))} />
        )}

        {/* ── Club Info ──────────────────────────────────────── */}
        {tab === "club" && (
          <ClubInfoTab club={{
            id: club.id, name: club.name, description: club.description,
            address: club.address, indoor: club.indoor, outdoor: club.outdoor,
          }} />
        )}

        {/* ── Photos ─────────────────────────────────────────── */}
        {tab === "photos" && (
          <div>
            <h2 className="text-lg font-bold text-[#0f172a] mb-6" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Photos</h2>
            <div className="glass-card rounded-2xl p-14 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="15" rx="2" stroke="#2563eb" strokeWidth="1.5"/>
                  <circle cx="9" cy="11" r="2.5" stroke="#2563eb" strokeWidth="1.5"/>
                  <path d="M2 17l5-5 4 4 3-3 5 5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[#0f172a] font-bold text-lg mb-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Photo uploads coming soon</p>
              <p className="text-slate-400 text-sm">You&apos;ll be able to upload court and club photos here.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
