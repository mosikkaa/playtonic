"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-[86vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div
          className="w-[560px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(201,255,59,0.06) 0%, transparent 65%)",
          }}
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
            style={{
              background: "rgba(201,255,59,0.1)",
              border: "1px solid rgba(201,255,59,0.2)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
            >
              <path
                d="M10 1.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Zm0 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5c-1.654 0-3 .448-3 1v.5h6V11.5c0-.552-1.346-1-3-1Z"
                fill="#c9ff3b"
              />
            </svg>
          </div>

          <h1
            className="text-3xl font-extrabold text-white mb-2"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Welcome back
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Enter your email — we&apos;ll send a magic link instantly.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl p-6 text-center"
                style={{
                  background: "rgba(201,255,59,0.07)",
                  border: "1px solid rgba(201,255,59,0.2)",
                }}
              >
                <div className="text-2xl mb-3">📬</div>
                <p
                  className="font-bold text-white mb-1"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  Check your inbox
                </p>
                <p className="text-sm text-white/45">
                  Magic link sent to{" "}
                  <span className="text-[#c9ff3b]">{email}</span>
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
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(201,255,59,0.45)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(201,255,59,0.07)";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.055)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)";
                  }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-black bg-[#c9ff3b] hover:bg-[#d9ff60] transition-all duration-200 hover:shadow-[0_0_32px_rgba(201,255,59,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: "var(--font-syne, Syne, sans-serif)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner" />
                      Sending...
                    </span>
                  ) : (
                    "Send magic link →"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
