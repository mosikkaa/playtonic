"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Court { id: string; name: string; type: string; price_per_hour: number; }
interface Club { id: string; name: string; address: string; description: string | null; indoor: boolean; outdoor: boolean; courts: Court[]; }
interface Slot { id: string; court_id: string; date: string; start_time: string; end_time: string; is_available: boolean; }

const DURATIONS = [60, 90, 120] as const;

const GRADIENTS = [
  "linear-gradient(145deg, #eff6ff 0%, #bfdbfe 55%, #dbeafe 100%)",
  "linear-gradient(145deg, #f0fdf4 0%, #bbf7d0 55%, #dcfce7 100%)",
  "linear-gradient(145deg, #fdf4ff 0%, #e9d5ff 55%, #f5f3ff 100%)",
  "linear-gradient(145deg, #fff7ed 0%, #fed7aa 55%, #ffedd5 100%)",
];

function parseMinutes(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function fmtDateChip(iso: string, today: string) {
  const d = new Date(iso + "T00:00:00");
  const diff = Math.round((d.getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tmrw";
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function CourtLines() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden style={{ opacity: 0.18 }}>
      <rect x="30" y="24" width="340" height="232" stroke="rgba(15,23,42,0.35)" strokeWidth="2" />
      <line x1="30" y1="140" x2="370" y2="140" stroke="rgba(15,23,42,0.25)" strokeWidth="1.5" />
      <line x1="200" y1="24" x2="200" y2="256" stroke="rgba(15,23,42,0.35)" strokeWidth="2" />
      <line x1="85" y1="24" x2="85" y2="256" stroke="rgba(15,23,42,0.2)" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="315" y1="24" x2="315" y2="256" stroke="rgba(15,23,42,0.2)" strokeWidth="1" strokeDasharray="6 4" />
      <ellipse cx="200" cy="140" rx="36" ry="36" stroke="rgba(15,23,42,0.2)" strokeWidth="1.2" />
    </svg>
  );
}

export default function ClubDetailClient({ club, slots, today, initialDate, initialTime }: {
  club: Club; slots: Slot[]; today: string; initialDate?: string; initialTime?: string;
}) {
  const dateOptions = useMemo(() => {
    const base = new Date(today + "T00:00:00");
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(base); d.setDate(base.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [today]);

  const validInitialDate = useMemo(() =>
    initialDate && dateOptions.includes(initialDate) ? initialDate : today,
    [initialDate, dateOptions, today]
  );

  const validInitialTime = useMemo(() => {
    if (!initialTime) return null;
    const has = slots.some((s) => s.date === validInitialDate && s.start_time.slice(0, 5) === initialTime && s.is_available);
    return has ? initialTime : null;
  }, [initialTime, slots, validInitialDate]);

  const [selectedDate, setSelectedDate] = useState(validInitialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(validInitialTime);
  const [openCourts, setOpenCourts] = useState<Set<string>>(new Set());
  const [isFav, setIsFav] = useState(false);

  function handleDateSelect(date: string) { setSelectedDate(date); setSelectedTime(null); setOpenCourts(new Set()); }
  function handleTimeSelect(time: string) { setSelectedTime((t) => (t === time ? null : time)); setOpenCourts(new Set()); }
  function toggleCourt(id: string) { setOpenCourts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const slotsForDate = useMemo(() => slots.filter((s) => s.date === selectedDate), [slots, selectedDate]);
  const availableTimes = useMemo(() => {
    const set = new Set<string>();
    slotsForDate.forEach((s) => { if (s.is_available) set.add(s.start_time.slice(0, 5)); });
    return Array.from(set).sort();
  }, [slotsForDate]);

  function courtAvailableAtTime(courtId: string) {
    if (!selectedTime) return false;
    return slotsForDate.some((s) => s.court_id === courtId && s.start_time.slice(0, 5) === selectedTime && s.is_available);
  }

  function slotForDuration(courtId: string, durationMins: number): Slot | null {
    if (!selectedTime) return null;
    return slotsForDate.find((s) =>
      s.court_id === courtId && s.start_time.slice(0, 5) === selectedTime && s.is_available &&
      parseMinutes(s.end_time) - parseMinutes(s.start_time) === durationMins
    ) ?? null;
  }

  return (
    <main className="min-h-screen pb-24">
      {/* Photo swiper */}
      <div className="relative w-full" style={{ height: "280px" }}>
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop className="w-full h-full"
          style={{ "--swiper-pagination-color": "#2563eb", "--swiper-pagination-bullet-inactive-color": "rgba(15,23,42,0.2)", "--swiper-pagination-bullet-inactive-opacity": "1", "--swiper-pagination-bottom": "12px" } as React.CSSProperties}
        >
          {GRADIENTS.map((gradient, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full" style={{ background: gradient }}><CourtLines /></div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Back button */}
        <a href="/padel-courts"
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", border: "1px solid rgba(15,23,42,0.1)", fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
        >
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
            <path d="M12 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </a>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10" style={{ background: "linear-gradient(to top, #f8fafc 0%, transparent 100%)" }} />
      </div>

      {/* Club header */}
      <div className="max-w-7xl mx-auto px-5 pt-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
              {club.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <svg width="10" height="13" viewBox="0 0 10 13" fill="currentColor" aria-hidden>
                <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8C10 2.24 7.76 0 5 0Zm0 7.5A2.5 2.5 0 1 1 5 2.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              {club.address}
            </p>
            <div className="flex gap-1.5 mt-2">
              {club.indoor && <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-blue-700" style={{ background: "rgba(219,234,254,0.8)", border: "1px solid rgba(59,130,246,0.25)" }}>Indoor</span>}
              {club.outdoor && <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-emerald-700" style={{ background: "rgba(209,250,229,0.8)", border: "1px solid rgba(16,185,129,0.25)" }}>Outdoor</span>}
            </div>
          </div>

          <button onClick={() => setIsFav((v) => !v)} suppressHydrationWarning
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110"
            style={{ background: isFav ? "rgba(239,68,68,0.08)" : "rgba(15,23,42,0.04)", border: isFav ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(15,23,42,0.1)" }}
            aria-label="Favourite"
          >
            <span style={{ color: isFav ? "#ef4444" : "rgba(15,23,42,0.35)", fontSize: "18px", lineHeight: 1 }}>{isFav ? "♥" : "♡"}</span>
          </button>
        </div>
      </div>

      {/* Sticky date strip */}
      <div className="sticky top-[57px] z-30" style={{ background: "rgba(248,250,252,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(15,23,42,0.08)" }}>
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {dateOptions.map((iso) => {
              const active = iso === selectedDate;
              return (
                <button key={iso} onClick={() => handleDateSelect(iso)} suppressHydrationWarning
                  className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-syne, Syne, sans-serif)",
                    background: active ? "#2563eb" : "rgba(15,23,42,0.04)",
                    border: active ? "1px solid #2563eb" : "1px solid rgba(15,23,42,0.08)",
                    color: active ? "#fff" : "#64748b",
                    boxShadow: active ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                  }}
                >
                  {fmtDateChip(iso, today)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 pt-7 flex flex-col gap-10">
        {/* Available times */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
              Available Times
              {availableTimes.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)", color: "#2563eb" }}>
                  {availableTimes.length}
                </span>
              )}
            </h2>
            {selectedTime && (
              <button onClick={() => setSelectedTime(null)} suppressHydrationWarning className="text-xs text-slate-400 hover:text-slate-700 transition-colors duration-150" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
                Clear selection
              </button>
            )}
          </div>

          {availableTimes.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.07)" }}>
              <p className="text-2xl mb-2">⏰</p>
              <p className="text-slate-400 text-sm" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>No available times on this date</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTimes.map((time) => {
                const active = selectedTime === time;
                return (
                  <button key={time} onClick={() => handleTimeSelect(time)} suppressHydrationWarning
                    className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
                    style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      background: active ? "#2563eb" : "rgba(15,23,42,0.04)",
                      border: active ? "1px solid #2563eb" : "1px solid rgba(15,23,42,0.08)",
                      color: active ? "#fff" : "#374151",
                      boxShadow: active ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Courts */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
              Courts <span className="text-sm font-normal text-slate-400">({club.courts.length})</span>
            </h2>
            {!selectedTime && availableTimes.length > 0 && (
              <p className="text-xs text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>Select a time slot first</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {club.courts.map((court) => {
              const available = courtAvailableAtTime(court.id);
              const isOpen = openCourts.has(court.id);
              const canInteract = selectedTime !== null && available;

              return (
                <div key={court.id} className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: canInteract ? "#ffffff" : "rgba(15,23,42,0.02)",
                    border: isOpen ? "1px solid rgba(37,99,235,0.3)" : canInteract ? "1px solid rgba(15,23,42,0.1)" : "1px solid rgba(15,23,42,0.05)",
                    boxShadow: isOpen ? "0 2px 8px rgba(37,99,235,0.08)" : canInteract ? "0 1px 3px rgba(15,23,42,0.06)" : "none",
                    opacity: !selectedTime || !available ? 0.45 : 1,
                    transition: "opacity 0.2s, border-color 0.2s, background 0.2s",
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-3 px-4 py-4" style={{ cursor: canInteract ? "pointer" : "default" }} onClick={() => canInteract && toggleCourt(court.id)}>
                    <button onClick={(e) => { e.stopPropagation(); canInteract && toggleCourt(court.id); }} suppressHydrationWarning disabled={!canInteract}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{ background: isOpen ? "rgba(37,99,235,0.08)" : "rgba(15,23,42,0.05)", border: isOpen ? "1px solid rgba(37,99,235,0.25)" : "1px solid rgba(15,23,42,0.09)" }}
                    >
                      <motion.svg width="11" height="7" viewBox="0 0 11 7" fill="none" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <path d="M1 1l4.5 4.5L10 1" stroke={isOpen ? "#2563eb" : "#64748b"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#0f172a]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>{court.name}</p>
                      <p className="text-[11px] mt-0.5 capitalize text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>{court.type}</p>
                    </div>

                    {canInteract && (
                      <span className="text-[11px] font-bold shrink-0 text-[#2563eb]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                        from {court.price_per_hour} GEL/h
                      </span>
                    )}
                  </div>

                  {/* Accordion */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div key="durations"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1, transition: { height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }, opacity: { duration: 0.2, delay: 0.05 } } }}
                        exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.22 }, opacity: { duration: 0.12 } } }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(15,23,42,0.07)" }}>
                          <div className="flex gap-3 flex-wrap">
                            {DURATIONS.map((dur) => {
                              const slot = slotForDuration(court.id, dur);
                              const price = Math.round((court.price_per_hour * dur) / 60);
                              const canBook = slot !== null;

                              if (canBook) {
                                return (
                                  <a key={dur} href={`/clubs/${club.id}/courts/${court.id}/book/${slot!.id}`}
                                    className="flex flex-col items-center justify-center px-5 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.04]"
                                    style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", minWidth: "90px" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; e.currentTarget.style.border = "1px solid rgba(37,99,235,0.4)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(37,99,235,0.15)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(37,99,235,0.06)"; e.currentTarget.style.border = "1px solid rgba(37,99,235,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                                  >
                                    <span className="text-lg font-extrabold leading-tight text-[#2563eb]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>{price} GEL</span>
                                    <span className="text-xs mt-1 text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>{dur} min</span>
                                  </a>
                                );
                              }

                              return (
                                <div key={dur} className="flex flex-col items-center justify-center px-5 py-3.5 rounded-xl"
                                  style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.06)", minWidth: "90px", opacity: 0.35, cursor: "not-allowed" }}
                                >
                                  <span className="text-lg font-extrabold leading-tight text-slate-400" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>{price} GEL</span>
                                  <span className="text-xs mt-1 text-slate-300" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>{dur} min</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
