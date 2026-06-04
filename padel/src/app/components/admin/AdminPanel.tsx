"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { approveApplication, rejectApplication, type Application } from "@/app/admin/actions";

type Filter = "pending" | "approved" | "rejected" | "all";

const STATUS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: "Pending",  bg: "rgba(217,119,6,0.08)",  color: "#b45309", border: "rgba(217,119,6,0.22)"  },
  approved: { label: "Approved", bg: "rgba(5,150,105,0.08)",  color: "#059669", border: "rgba(5,150,105,0.22)"  },
  rejected: { label: "Rejected", bg: "rgba(220,38,38,0.08)",  color: "#dc2626", border: "rgba(220,38,38,0.22)"  },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function AdminPanel({ applications: initial }: { applications: Application[] }) {
  const [apps, setApps] = useState<Application[]>(initial);
  const [filter, setFilter] = useState<Filter>("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = {
    all:      apps.length,
    pending:  apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const visible = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  function optimisticUpdate(id: string, status: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  async function handleApprove(app: Application) {
    setActionId(app.id); setActionError(null);
    startTransition(async () => {
      optimisticUpdate(app.id, "approved");
      const { error } = await approveApplication(app);
      if (error) { optimisticUpdate(app.id, "pending"); setActionError(error); }
      setActionId(null);
    });
  }

  async function handleReject(id: string) {
    setActionId(id); setActionError(null);
    startTransition(async () => {
      optimisticUpdate(id, "rejected");
      const { error } = await rejectApplication(id);
      if (error) { optimisticUpdate(id, "pending"); setActionError(error); }
      setActionId(null);
    });
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", letterSpacing: "0.16em" }}>
          Playtonic
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          Applications
        </h1>
        <p className="text-slate-500 text-sm" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
          {counts.pending} pending review
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8 animate-fade-up delay-100">
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((k) => {
          const cfg = STATUS[k];
          return (
            <div key={k} className="glass-card rounded-2xl p-4" style={cfg ? { borderColor: cfg.border } : {}}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                color: cfg ? cfg.color : "#64748b",
                letterSpacing: "0.1em",
              }}>
                {k}
              </p>
              <p className="text-2xl font-extrabold" style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                color: cfg ? cfg.color : "#0f172a",
              }}>
                {counts[k]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl animate-fade-up delay-100" style={{
        background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.07)", width: "fit-content",
      }}>
        {(["pending", "all", "approved", "rejected"] as Filter[]).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className="relative px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors duration-200"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", color: filter === k ? "#ffffff" : "#64748b", letterSpacing: "0.06em" }}>
            {filter === k && (
              <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-lg" style={{ background: "#2563eb" }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} />
            )}
            <span className="relative z-10">{k}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {actionError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 rounded-xl px-5 py-3 text-sm"
            style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)", color: "#dc2626", fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
            {actionError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {visible.length === 0 ? (
        <div className="glass-card rounded-2xl p-14 text-center animate-fade-up">
          <p className="text-slate-400 text-sm" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
            No {filter === "all" ? "" : filter} applications.
          </p>
        </div>
      ) : (
        <motion.div className="grid gap-4" variants={container} initial="hidden" animate="show" key={filter}>
          {visible.map((app) => {
            const st = STATUS[app.status];
            const isActioning = actionId === app.id;
            const isPending = app.status === "pending";

            return (
              <motion.div key={app.id} variants={item} layout className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h2 className="text-lg font-extrabold text-[#0f172a]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                        {app.name}
                      </h2>
                      <div className="flex gap-1.5">
                        {app.indoor && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-blue-700"
                            style={{ background: "rgba(219,234,254,0.8)", border: "1px solid rgba(59,130,246,0.25)" }}>Indoor</span>
                        )}
                        {app.outdoor && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-700"
                            style={{ background: "rgba(209,250,229,0.8)", border: "1px solid rgba(16,185,129,0.25)" }}>Outdoor</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
                      Applied {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {st && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontFamily: "var(--font-syne, Syne, sans-serif)", letterSpacing: "0.06em" }}>
                      {st.label}
                    </span>
                  )}
                </div>

                {app.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
                    {app.description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 pt-4 flex-wrap" style={{ borderTop: "1px solid rgba(15,23,42,0.07)" }}>
                  <div className="flex items-center gap-4 flex-wrap">
                    {app.address && <p className="text-xs text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>📍 {app.address}</p>}
                    <p className="text-xs text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>✉ {app.owner_email}</p>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleReject(app.id)} disabled={isActioning}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40"
                        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", letterSpacing: "0.06em" }}>
                        {isActioning ? "…" : "Reject"}
                      </button>
                      <button onClick={() => handleApprove(app)} disabled={isActioning}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:bg-[#1d4ed8] disabled:opacity-40 shadow-sm"
                        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", background: "#2563eb", color: "white", letterSpacing: "0.06em" }}>
                        {isActioning ? "…" : "Approve"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
