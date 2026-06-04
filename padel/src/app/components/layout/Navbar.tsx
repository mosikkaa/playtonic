import { createClient } from "@/utils/supabase/server";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: club } = user
    ? await supabase.from("clubs").select("id").eq("owner_id", user.id).single()
    : { data: null };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(248,250,252,0.92)",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 shrink-0 select-none">
          <span className="w-2 h-2 rounded-full bg-[#2563eb] pulse-dot shrink-0" />
          <span
            className="text-base font-extrabold tracking-tighter text-[#0f172a]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            PADEL<span className="text-[#2563eb]">GEO</span>
          </span>
        </a>

        <NavLinks isLoggedIn={!!user} hasClub={!!club} />
      </div>
    </nav>
  );
}
