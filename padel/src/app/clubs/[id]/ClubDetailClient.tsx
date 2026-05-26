"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/* ─── Types ───────────────────────────────────────────────── */
interface Court {
  id: string;
  name: string;
  type: string;
  price_per_hour: number;
}

interface Club {
  id: string;
  name: string;
  address: string;
  description: string | null;
  indoor: boolean;
  outdoor: boolean;
  courts: Court[];
}

interface Slot {
  id: string;
  court_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

/* ─── Constants ───────────────────────────────────────────── */
const DURATIONS = [60, 90, 120] as const;

const GRADIENTS = [
  "linear-gradient(145deg, #062918 0%, #0e4d2a 55%, #072d1b 100%)",
  "linear-gradient(145deg, #08112e 0%, #112052 55%, #081228 100%)",
  "linear-gradient(145deg, #1e0808 0%, #3d1212 55%, #1e0909 100%)",
  "linear-gradient(145deg, #1a1200 0%, #332600 55%, #1a1400 100%)",
];

/* ─── Helpers ─────────────────────────────────────────────── */
function parseMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmtDateChip(iso: string, today: string): string {
  const d = new Date(iso + "T00:00:00");
  const diff = Math.round(
    (d.getTime() - new Date(today + "T00:00:00").getTime()) / 86400000
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tmrw";
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

/* ─── Court lines SVG ─────────────────────────────────────── */
function CourtLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 280"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden
      style={{ opacity: 0.1 }}
    >
      <rect x="30" y="24" width="340" height="232" stroke="white" strokeWidth="2" />
      <line x1="30" y1="140" x2="370" y2="140" stroke="white" strokeWidth="1.5" />
      <line x1="200" y1="24" x2="200" y2="256" stroke="white" strokeWidth="2" />
      <line x1="85" y1="24" x2="85" y2="256" stroke="white" strokeWidth="1" strokeDasharray="6 4" />
      <line x1="315" y1="24" x2="315" y2="256" stroke="white" strokeWidth="1" strokeDasharray="6 4" />
      <ellipse cx="200" cy="140" rx="36" ry="36" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

/* ─── Main component ──────────────────────────────────────── */
export default function ClubDetailClient({
  club,
  slots,
  today,
  initialDate,
  initialTime,
}: {
  club: Club;
  slots: Slot[];
  today: string;
  initialDate?: string;
  initialTime?: string;
}) {
  /* 14-day date options */
  const dateOptions = useMemo(() => {
    const base = new Date(today + "T00:00:00");
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [today]);

  /* Initial date: URL param if valid, else today */
  const validInitialDate = useMemo(
    () =>
      initialDate && dateOptions.includes(initialDate) ? initialDate : today,
    [initialDate, dateOptions, today]
  );

  /* Initial time: URL param if there's an available slot at that time */
  const validInitialTime = useMemo(() => {
    if (!initialTime) return null;
    const has = slots.some(
      (s) =>
        s.date === validInitialDate &&
        s.start_time.slice(0, 5) === initialTime &&
        s.is_available
    );
    return has ? initialTime : null;
  }, [initialTime, slots, validInitialDate]);

  /* State */
  const [selectedDate, setSelectedDate] = useState<string>(validInitialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(validInitialTime);
  const [openCourts, setOpenCourts] = useState<Set<string>>(new Set());
  const [isFav, setIsFav] = useState(false);

  /* Handlers */
  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
    setOpenCourts(new Set());
  }

  function handleTimeSelect(time: string) {
    setSelectedTime((t) => (t === time ? null : time));
    setOpenCourts(new Set());
  }

  function toggleCourt(id: string) {
    setOpenCourts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* Computed */
  const slotsForDate = useMemo(
    () => slots.filter((s) => s.date === selectedDate),
    [slots, selectedDate]
  );

  /* Unique available times for selected date */
  const availableTimes = useMemo(() => {
    const set = new Set<string>();
    slotsForDate.forEach((s) => {
      if (s.is_available) set.add(s.start_time.slice(0, 5));
    });
    return Array.from(set).sort();
  }, [slotsForDate]);

  /* Whether a court has an available slot at the selected time */
  function courtAvailableAtTime(courtId: string): boolean {
    if (!selectedTime) return false;
    return slotsForDate.some(
      (s) =>
        s.court_id === courtId &&
        s.start_time.slice(0, 5) === selectedTime &&
        s.is_available
    );
  }

  /* Find slot for a court+duration combo at the selected time */
  function slotForDuration(courtId: string, durationMins: number): Slot | null {
    if (!selectedTime) return null;
    return (
      slotsForDate.find(
        (s) =>
          s.court_id === courtId &&
          s.start_time.slice(0, 5) === selectedTime &&
          s.is_available &&
          parseMinutes(s.end_time) - parseMinutes(s.start_time) === durationMins
      ) ?? null
    );
  }

  return (
    <main className="min-h-screen pb-24">
      {/* ── Photo swiper ──────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: "280px" }}>
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop
          className="w-full h-full"
          style={
            {
              "--swiper-pagination-color": "#c9ff3b",
              "--swiper-pagination-bullet-inactive-color": "rgba(255,255,255,0.28)",
              "--swiper-pagination-bullet-inactive-opacity": "1",
              "--swiper-pagination-bottom": "12px",
            } as React.CSSProperties
          }
        >
          {GRADIENTS.map((gradient, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full" style={{ background: gradient }}>
                <CourtLines />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Back button */}
        <a
          href="/padel-courts"
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-colors"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "var(--font-outfit, Outfit, sans-serif)",
          }}
        >
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden>
            <path d="M12 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </a>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
          style={{ background: "linear-gradient(to top, #080808 0%, transparent 100%)" }}
        />
      </div>

      {/* ── Club header ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 pt-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {club.name}
            </h1>
            <p className="text-sm text-white/40 mt-1 flex items-center gap-1.5">
              <svg width="10" height="13" viewBox="0 0 10 13" fill="currentColor" aria-hidden>
                <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8C10 2.24 7.76 0 5 0Zm0 7.5A2.5 2.5 0 1 1 5 2.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              {club.address}
            </p>
            <div className="flex gap-1.5 mt-2">
              {club.indoor && (
                <span
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-blue-300"
                  style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)" }}
                >
                  Indoor
                </span>
              )}
              {club.outdoor && (
                <span
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-emerald-300"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.22)" }}
                >
                  Outdoor
                </span>
              )}
            </div>
          </div>

          {/* Favourite */}
          <button
            onClick={() => setIsFav((v) => !v)}
            suppressHydrationWarning
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110"
            style={{
              background: isFav ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.06)",
              border: isFav ? "1px solid rgba(255,59,92,0.35)" : "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label="Favourite"
          >
            <span style={{ color: isFav ? "#ff3b5c" : "rgba(255,255,255,0.4)", fontSize: "18px", lineHeight: 1 }}>
              {isFav ? "♥" : "♡"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Sticky date strip ─────────────────────────────────── */}
      <div
        className="sticky top-[57px] z-30"
        style={{
          background: "rgba(8,8,8,0.94)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto px-5 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {dateOptions.map((iso) => {
              const active = iso === selectedDate;
              return (
                <button
                  key={iso}
                  onClick={() => handleDateSelect(iso)}
                  suppressHydrationWarning
                  className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-syne, Syne, sans-serif)",
                    background: active ? "#c9ff3b" : "rgba(255,255,255,0.04)",
                    border: active ? "1px solid #c9ff3b" : "1px solid rgba(255,255,255,0.07)",
                    color: active ? "#000" : "rgba(255,255,255,0.5)",
                    boxShadow: active ? "0 0 16px rgba(201,255,59,0.28)" : "none",
                  }}
                >
                  {fmtDateChip(iso, today)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 pt-7 flex flex-col gap-10">
        {/* ── Available times ────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold text-white flex items-center gap-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Available Times
              {availableTimes.length > 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(201,255,59,0.1)",
                    border: "1px solid rgba(201,255,59,0.2)",
                    color: "#c9ff3b",
                  }}
                >
                  {availableTimes.length}
                </span>
              )}
            </h2>
            {selectedTime && (
              <button
                onClick={() => setSelectedTime(null)}
                suppressHydrationWarning
                className="text-xs text-white/30 hover:text-white/60 transition-colors duration-150"
                style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
              >
                Clear selection
              </button>
            )}
          </div>

          {availableTimes.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-2xl mb-2">⏰</p>
              <p className="text-white/35 text-sm" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
                No available times on this date
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTimes.map((time) => {
                const active = selectedTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    suppressHydrationWarning
                    className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
                    style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      background: active ? "#c9ff3b" : "rgba(255,255,255,0.05)",
                      border: active ? "1px solid #c9ff3b" : "1px solid rgba(255,255,255,0.09)",
                      color: active ? "#000" : "rgba(255,255,255,0.8)",
                      boxShadow: active ? "0 0 20px rgba(201,255,59,0.35)" : "none",
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Courts ────────────────────────────────────────────── */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold text-white flex items-center gap-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Courts
              <span className="text-sm font-normal text-white/30">({club.courts.length})</span>
            </h2>
            {!selectedTime && availableTimes.length > 0 && (
              <p
                className="text-xs text-white/30"
                style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
              >
                Select a time slot first
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {club.courts.map((court) => {
              const available = courtAvailableAtTime(court.id);
              const isOpen = openCourts.has(court.id);
              const canInteract = selectedTime !== null && available;

              return (
                <div
                  key={court.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: canInteract ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
                    border: isOpen
                      ? "1px solid rgba(201,255,59,0.22)"
                      : canInteract
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(255,255,255,0.04)",
                    opacity: !selectedTime || !available ? 0.45 : 1,
                    transition: "opacity 0.2s, border-color 0.2s, background 0.2s",
                  }}
                >
                  {/* Header row */}
                  <div
                    className="flex items-center gap-3 px-4 py-4"
                    style={{ cursor: canInteract ? "pointer" : "default" }}
                    onClick={() => canInteract && toggleCourt(court.id)}
                  >
                    {/* Chevron */}
                    <button
                      onClick={(e) => { e.stopPropagation(); canInteract && toggleCourt(court.id); }}
                      suppressHydrationWarning
                      disabled={!canInteract}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: isOpen ? "rgba(201,255,59,0.1)" : "rgba(255,255,255,0.05)",
                        border: isOpen ? "1px solid rgba(201,255,59,0.25)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <motion.svg
                        width="11"
                        height="7"
                        viewBox="0 0 11 7"
                        fill="none"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path
                          d="M1 1l4.5 4.5L10 1"
                          stroke={isOpen ? "#c9ff3b" : "rgba(255,255,255,0.5)"}
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-sm"
                        style={{
                          fontFamily: "var(--font-syne, Syne, sans-serif)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        {court.name}
                      </p>
                      <p
                        className="text-[11px] mt-0.5 capitalize"
                        style={{
                          color: "rgba(255,255,255,0.32)",
                          fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                        }}
                      >
                        {court.type}
                      </p>
                    </div>

                    {/* Price hint */}
                    {canInteract && (
                      <span
                        className="text-[11px] font-bold shrink-0"
                        style={{
                          color: "#c9ff3b",
                          fontFamily: "var(--font-syne, Syne, sans-serif)",
                        }}
                      >
                        from {court.price_per_hour} GEL/h
                      </span>
                    )}
                  </div>

                  {/* Accordion: duration cards */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="durations"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
                            opacity: { duration: 0.2, delay: 0.05 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: { height: { duration: 0.22 }, opacity: { duration: 0.12 } },
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          className="px-4 pb-4 pt-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div className="flex gap-3 flex-wrap">
                            {DURATIONS.map((dur) => {
                              const slot = slotForDuration(court.id, dur);
                              const price = Math.round((court.price_per_hour * dur) / 60);
                              const canBook = slot !== null;

                              if (canBook) {
                                return (
                                  <a
                                    key={dur}
                                    href={`/clubs/${club.id}/courts/${court.id}/book/${slot!.id}`}
                                    className="flex flex-col items-center justify-center px-5 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.04]"
                                    style={{
                                      background: "rgba(201,255,59,0.06)",
                                      border: "1px solid rgba(201,255,59,0.2)",
                                      minWidth: "90px",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "rgba(201,255,59,0.14)";
                                      e.currentTarget.style.border = "1px solid rgba(201,255,59,0.4)";
                                      e.currentTarget.style.boxShadow = "0 0 20px rgba(201,255,59,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "rgba(201,255,59,0.06)";
                                      e.currentTarget.style.border = "1px solid rgba(201,255,59,0.2)";
                                      e.currentTarget.style.boxShadow = "none";
                                    }}
                                  >
                                    <span
                                      className="text-lg font-extrabold leading-tight"
                                      style={{ color: "#c9ff3b", fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                                    >
                                      {price} GEL
                                    </span>
                                    <span
                                      className="text-xs mt-1"
                                      style={{
                                        color: "rgba(255,255,255,0.4)",
                                        fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                                      }}
                                    >
                                      {dur} min
                                    </span>
                                  </a>
                                );
                              }

                              return (
                                <div
                                  key={dur}
                                  className="flex flex-col items-center justify-center px-5 py-3.5 rounded-xl"
                                  style={{
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                    minWidth: "90px",
                                    opacity: 0.35,
                                    cursor: "not-allowed",
                                  }}
                                >
                                  <span
                                    className="text-lg font-extrabold leading-tight"
                                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                                  >
                                    {price} GEL
                                  </span>
                                  <span
                                    className="text-xs mt-1"
                                    style={{
                                      color: "rgba(255,255,255,0.25)",
                                      fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                                    }}
                                  >
                                    {dur} min
                                  </span>
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
