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

    if (!club) {
      setError("No club found");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("courts").insert({
      club_id: club.id,
      name,
      type,
      price_per_hour: parseFloat(price),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputBase: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontFamily: "var(--font-outfit, Outfit, sans-serif)",
  };

  return (
    <main className="max-w-lg mx-auto px-5 py-12">
      <a
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/75 mb-8 transition-colors duration-200"
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
          className="text-4xl font-extrabold text-white mb-8 tracking-tight"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Add a Court
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label
              className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-2 block"
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
              className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(201,255,59,0.45)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,255,59,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.055)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label
              className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-2 block"
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
                    background: type === t ? "#c9ff3b" : "rgba(255,255,255,0.04)",
                    color: type === t ? "#000" : "rgba(255,255,255,0.45)",
                    border: type === t
                      ? "1px solid #c9ff3b"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: type === t ? "0 0 20px rgba(201,255,59,0.3)" : "none",
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
              className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-2 block"
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
              className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(201,255,59,0.45)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,255,59,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.055)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-[#ff3b5c]"
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
            className="w-full py-4 rounded-xl font-extrabold text-base text-black bg-[#c9ff3b] hover:bg-[#d9ff60] transition-all duration-200 hover:shadow-[0_0_36px_rgba(201,255,59,0.4)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
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
