"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

type FormState = {
  name: string;
  description: string;
  address: string;
  indoor: boolean;
  outdoor: boolean;
  owner_email: string;
};

type Errors = Record<string, string>;

const STEPS = [
  { num: "01", label: "Identity" },
  { num: "02", label: "Location" },
  { num: "03", label: "Facilities" },
  { num: "04", label: "Submit" },
];

function IndoorIcon({ on }: { on: boolean }) {
  const c = on ? "#2563eb" : "rgba(15,23,42,0.25)";
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path d="M3 9 L18 3 L33 9" stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="3" y="9" width="30" height="24" rx="1" stroke={c} strokeWidth="1.4" />
      <line x1="18" y1="9" x2="18" y2="33" stroke={c} strokeWidth="1" />
      <line x1="3" y1="21" x2="33" y2="21" stroke={c} strokeWidth="1" />
      <line x1="9" y1="9" x2="9" y2="33" stroke={c} strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="27" y1="9" x2="27" y2="33" stroke={c} strokeWidth="0.8" strokeDasharray="3 3" />
    </svg>
  );
}

function OutdoorIcon({ on }: { on: boolean }) {
  const c = on ? "#2563eb" : "rgba(15,23,42,0.25)";
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="7" r="3" stroke={c} strokeWidth="1.4" />
      <line x1="18" y1="2" x2="18" y2="0.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="11.5" x2="18" y2="13" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22.5" y1="7" x2="24" y2="7" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="7" x2="13.5" y2="7" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="3" y="13" width="30" height="22" rx="1" stroke={c} strokeWidth="1.4" />
      <line x1="18" y1="13" x2="18" y2="35" stroke={c} strokeWidth="1" />
      <line x1="3" y1="24" x2="33" y2="24" stroke={c} strokeWidth="1" />
      <line x1="9" y1="13" x2="9" y2="35" stroke={c} strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="27" y1="13" x2="27" y2="35" stroke={c} strokeWidth="0.8" strokeDasharray="3 3" />
    </svg>
  );
}

const fieldBase: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(15,23,42,0.12)",
  color: "#0f172a",
  padding: "12px 0",
  fontSize: "1rem",
  outline: "none",
  width: "100%",
  fontFamily: "var(--font-outfit, Outfit, sans-serif)",
  transition: "border-color 0.2s",
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: "block",
        fontSize: "0.65rem",
        fontWeight: 700,
        fontFamily: "var(--font-syne, Syne, sans-serif)",
        color: "rgba(15,23,42,0.4)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.14em",
        marginBottom: 10,
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: "#dc2626", fontSize: "0.72rem", marginTop: 6 }}>{error}</p>}
    </div>
  );
}

export default function RegisterClubPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>({ name: "", description: "", address: "", indoor: false, outdoor: false, owner_email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); setForm((f) => ({ ...f, owner_email: user.email ?? "" })); }
    });
  }, []);

  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate(s: number): boolean {
    const e: Errors = {};
    if (s === 0) { if (!form.name.trim()) e.name = "Required"; if (!form.description.trim()) e.description = "Required"; }
    if (s === 1) { if (!form.address.trim()) e.address = "Required"; }
    if (s === 2) { if (!form.indoor && !form.outdoor) e.facilities = "Select at least one"; }
    if (s === 3) {
      if (!form.owner_email.trim()) e.owner_email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.owner_email)) e.owner_email = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function go(next: number) { setDirection(next > step ? 1 : -1); setStep(next); setErrors({}); }
  function handleNext() { if (validate(step)) go(step + 1); }
  function handleBack() { go(step - 1); }

  async function handleSubmit() {
    if (!validate(3)) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("club_applications").insert({
      name: form.name.trim(), description: form.description.trim(), address: form.address.trim(),
      indoor: form.indoor, outdoor: form.outdoor, owner_email: form.owner_email.trim(),
      owner_id: userId, status: "pending",
    });
    setLoading(false);
    if (error) setErrors({ owner_email: error.message });
    else setSuccess(true);
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  if (success) {
    return (
      <main className="min-h-[82vh] flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
          style={{ maxWidth: 480 }}
        >
          <div
            className="mx-auto mb-8 flex items-center justify-center"
            style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)" }}
          >
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <path d="M2 11L9.5 19L26 2" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", letterSpacing: "0.18em" }}>
            Application received
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] mb-5 leading-tight" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            You&apos;re on<br />the list.
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-10" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
            We&apos;ve received the application for <span className="text-slate-800 font-semibold">{form.name}</span>.
            Our team reviews each venue personally — we&apos;ll reach out to <span className="text-[#2563eb]">{form.owner_email}</span> soon.
          </p>
          <a href="/" className="text-sm text-slate-400 hover:text-slate-700 transition-colors" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
            ← Back to Playtonic
          </a>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-[90vh] px-5 py-16">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mb-12">
          <p className="text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", letterSpacing: "0.18em" }}>
            Join the network
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0f172a] leading-[1.05] tracking-tight" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            Register your<br /><span className="accent-glow-text">padel club.</span>
          </h1>
        </motion.div>

        {/* Step indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.4 }} className="mb-10">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 800, fontFamily: "var(--font-syne, Syne, sans-serif)",
                  transition: "all 0.3s ease",
                  background: i < step ? "#2563eb" : i === step ? "rgba(37,99,235,0.1)" : "rgba(15,23,42,0.05)",
                  border: i === step ? "1.5px solid rgba(37,99,235,0.5)" : i < step ? "none" : "1px solid rgba(15,23,42,0.1)",
                  color: i < step ? "#ffffff" : i === step ? "#2563eb" : "rgba(15,23,42,0.3)",
                }}>
                  {i < step ? (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : s.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, margin: "0 6px", background: i < step ? "#2563eb" : "rgba(15,23,42,0.1)", transition: "background 0.4s ease" }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex mt-2.5">
            {STEPS.map((s, i) => (
              <p key={i} style={{
                flex: i < STEPS.length - 1 ? 1 : "none",
                fontSize: "0.6rem", fontWeight: 700, fontFamily: "var(--font-syne, Syne, sans-serif)",
                textTransform: "uppercase" as const, letterSpacing: "0.1em",
                color: i === step ? "#2563eb" : "rgba(15,23,42,0.3)", transition: "color 0.3s ease",
              }}>
                {s.label}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Form card */}
        <div className="glass-card rounded-3xl overflow-hidden relative" style={{ minHeight: 320 }}>
          <div aria-hidden style={{
            position: "absolute", bottom: -10, right: 16, fontSize: "8.5rem", fontWeight: 900,
            fontFamily: "var(--font-syne, Syne, sans-serif)", color: "rgba(15,23,42,0.025)",
            lineHeight: 1, pointerEvents: "none", userSelect: "none",
          }}>
            {STEPS[step].num}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step} custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 sm:p-10"
            >
              {step === 0 && (
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0f172a] mb-8" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Tell us about your club</h2>
                  <div className="space-y-8">
                    <Field label="Club name" error={errors.name}>
                      <input type="text" placeholder="e.g. Tbilisi Padel Club" value={form.name} onChange={(e) => patch("name", e.target.value)} style={fieldBase}
                        onFocus={(e) => (e.target.style.borderBottomColor = "#2563eb")}
                        onBlur={(e) => (e.target.style.borderBottomColor = "rgba(15,23,42,0.12)")} />
                    </Field>
                    <Field label="Description" error={errors.description}>
                      <textarea placeholder="Describe your venue and what makes it special..." value={form.description} onChange={(e) => patch("description", e.target.value)}
                        rows={4} style={{ ...fieldBase, resize: "none", lineHeight: 1.75 }}
                        onFocus={(e) => (e.target.style.borderBottomColor = "#2563eb")}
                        onBlur={(e) => (e.target.style.borderBottomColor = "rgba(15,23,42,0.12)")} />
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Where are you located?</h2>
                  <p className="text-slate-500 text-sm mb-8" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>We currently operate in Tbilisi, Georgia.</p>
                  <Field label="Street address" error={errors.address}>
                    <input type="text" placeholder="e.g. 14 Rustaveli Ave, Tbilisi" value={form.address} onChange={(e) => patch("address", e.target.value)} style={fieldBase}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#2563eb")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "rgba(15,23,42,0.12)")} />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>What do you offer?</h2>
                  <p className="text-slate-500 text-sm mb-8" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>Select all that apply.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { key: "indoor" as const, label: "Indoor", sub: "Covered courts" },
                      { key: "outdoor" as const, label: "Outdoor", sub: "Open-air courts" },
                    ] as const).map(({ key, label, sub }) => {
                      const on = form[key];
                      return (
                        <motion.button key={key} type="button" whileTap={{ scale: 0.97 }} onClick={() => patch(key, !on)}
                          style={{
                            background: on ? "rgba(37,99,235,0.06)" : "#ffffff",
                            border: on ? "1px solid rgba(37,99,235,0.35)" : "1px solid rgba(15,23,42,0.1)",
                            borderRadius: 16, padding: "28px 20px", cursor: "pointer", textAlign: "left",
                            transition: "border-color 0.2s, background 0.2s",
                            boxShadow: on ? "0 2px 8px rgba(37,99,235,0.1)" : "none",
                          }}>
                          <div className="mb-4 pointer-events-none">
                            {key === "indoor" ? <IndoorIcon on={on} /> : <OutdoorIcon on={on} />}
                          </div>
                          <p style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontWeight: 700, fontSize: "0.9375rem", color: on ? "#2563eb" : "#374151", marginBottom: 3, transition: "color 0.2s", pointerEvents: "none" }}>{label}</p>
                          <p style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)", fontSize: "0.73rem", color: on ? "rgba(37,99,235,0.7)" : "#9ca3af", transition: "color 0.2s", pointerEvents: "none" }}>{sub}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.facilities && <p style={{ color: "#dc2626", fontSize: "0.72rem", marginTop: 12 }}>{errors.facilities}</p>}
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0f172a] mb-8" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Review &amp; submit</h2>
                  <div className="rounded-2xl p-5 mb-8 space-y-3.5" style={{ background: "rgba(15,23,42,0.025)", border: "1px solid rgba(15,23,42,0.06)" }}>
                    {[
                      { label: "Club", value: form.name },
                      { label: "Address", value: form.address },
                      { label: "Courts", value: [form.indoor && "Indoor", form.outdoor && "Outdoor"].filter(Boolean).join(" · ") || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-6">
                        <span style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "0.65rem", fontWeight: 700, color: "rgba(15,23,42,0.35)", textTransform: "uppercase" as const, letterSpacing: "0.1em", flexShrink: 0, paddingTop: 2 }}>{label}</span>
                        <span style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)", fontSize: "0.875rem", color: "#374151", textAlign: "right" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <Field label="Contact email" error={errors.owner_email}>
                    <input type="email" placeholder="your@email.com" value={form.owner_email} onChange={(e) => patch("owner_email", e.target.value)} style={fieldBase}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#2563eb")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "rgba(15,23,42,0.12)")} />
                  </Field>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.4 }} className="flex items-center justify-between mt-5">
          <button type="button" onClick={handleBack}
            style={{
              visibility: step === 0 ? "hidden" : "visible",
              background: "transparent", border: "1px solid rgba(15,23,42,0.12)", color: "#64748b",
              borderRadius: 9999, padding: "10px 22px", fontSize: "0.875rem",
              fontFamily: "var(--font-outfit, Outfit, sans-serif)", cursor: "pointer", transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(15,23,42,0.25)"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(15,23,42,0.12)"; e.currentTarget.style.color = "#64748b"; }}
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2563eb] text-white font-bold text-sm hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2563eb] text-white font-bold text-sm hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
              {loading ? (<><span className="spinner" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />Submitting…</>) : "Submit application"}
            </button>
          )}
        </motion.div>
      </div>
    </main>
  );
}
