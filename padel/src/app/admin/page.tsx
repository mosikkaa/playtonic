import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import AdminPanel from "@/app/components/admin/AdminPanel";
import type { Application } from "@/app/admin/actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-5">
        <div className="text-center">
          <p
            className="text-red-600 text-xs font-bold uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Access denied
          </p>
          <h1
            className="text-3xl font-extrabold text-[#0f172a] mb-4"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Not authorised
          </h1>
          <a
            href="/"
            className="text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            ← Go home
          </a>
        </div>
      </main>
    );
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("club_applications")
    .select("*")
    .order("created_at", { ascending: false });

  const applications: Application[] = data ?? [];

  return <AdminPanel applications={applications} />;
}
