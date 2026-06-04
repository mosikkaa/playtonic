"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NewCourtPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"indoor" | "outdoor">("indoor");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: club } = await supabase.from("clubs").select("id").single();
    if (!club) { setError("No club found"); setLoading(false); return; }

    const { error } = await supabase.from("courts").insert({
      club_id: club.id,
      name,
      type,
      price_per_hour: parseFloat(price),
    });

    if (error) { setError(error.message); setLoading(false); return; }

    router.push("/dashboard");
    router.refresh();
  }

  const inputBase: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.12)",
    fontFamily: "var(--font-outfit, Outfit, sans-serif)",
    color: "#0f172a",
  };

  return (
    <main className="max-w-lg mx-auto px-5 py-12">
      <a
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 mb-8 transition-colors duration-200"
        style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
      >
        ← Back to dashboard
      </a>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        <h1
          className="text-4xl font-extrabold text-[#0f172a] mb-8 tracking-tight"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Add a Court
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label
              className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Court name
            </label>
            <input
              type="text"
              placeholder="Court 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              suppressHydrationWarning
              className="w-full rounded-xl px-4 py-3.5 text-sm placeholder-slate-400 outline-none transition-all duration-200"
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(37,99,235,0.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(15,23,42,0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label
              className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Type
            </label>
            <div className="flex gap-3">
              {(["indoor", "outdoor"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setType(t)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                    background: type === t ? "#2563eb" : "#ffffff",
                    color: type === t ? "#ffffff" : "#64748b",
                    border: type === t ? "1px solid #2563eb" : "1px solid rgba(15,23,42,0.12)",
                    boxShadow: type === t ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label
              className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Price per hour (GEL)
            </label>
            <input
              type="number"
              placeholder="40"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
              suppressHydrationWarning
              className="w-full rounded-xl px-4 py-3.5 text-sm placeholder-slate-400 outline-none transition-all duration-200"
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(37,99,235,0.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(15,23,42,0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-600"
                style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="w-full py-4 rounded-xl font-extrabold text-base text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Adding...
              </span>
            ) : (
              "Add court →"
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
