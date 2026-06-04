"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authFailed = searchParams.get("error") === "auth_failed";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (otpError) setError(otpError.message);
    else setSubmitted(true);
  }

  return (
    <main className="min-h-[86vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient blue glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div
          className="w-[560px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 65%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="glass-card rounded-2xl p-8">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
            style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M10 1.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Zm0 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5c-1.654 0-3 .448-3 1v.5h6V11.5c0-.552-1.346-1-3-1Z"
                fill="#2563eb"
              />
            </svg>
          </div>

          <h1
            className="text-3xl font-extrabold text-[#0f172a] mb-2"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Enter your email — we&apos;ll send a magic link instantly.
          </p>

          {authFailed && (
            <div
              className="rounded-xl px-4 py-3 mb-6 text-sm"
              style={{
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.18)",
                color: "#dc2626",
                fontFamily: "var(--font-outfit, Outfit, sans-serif)",
              }}
            >
              Magic link expired or already used. Please request a new one.
            </div>
          )}

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl p-6 text-center"
                style={{
                  background: "rgba(37,99,235,0.05)",
                  border: "1px solid rgba(37,99,235,0.15)",
                }}
              >
                <div className="text-2xl mb-3">📬</div>
                <p className="font-bold text-[#0f172a] mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                  Check your inbox
                </p>
                <p className="text-sm text-slate-500">
                  Magic link sent to <span className="text-[#2563eb] font-medium">{email}</span>
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleLogin}
                className="flex flex-col gap-4"
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-[#0f172a] placeholder-slate-400 outline-none transition-all duration-200"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(15,23,42,0.12)",
                    fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(37,99,235,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(15,23,42,0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                      Sending...
                    </span>
                  ) : (
                    "Send magic link →"
                  )}
                </button>

                {error && (
                  <p
                    className="text-sm text-center text-red-600"
                    style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                  >
                    {error}
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
