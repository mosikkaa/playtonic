"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Court { id: string; name: string; type: string; price_per_hour: number; club_id: string; }
interface Club { id: string; name: string; address: string; description: string | null; indoor: boolean; outdoor: boolean; courts: Court[]; }
interface Slot { id: string; court_id: string; date: string; start_time: string; end_time: string; }

type Sport = "padel" | "tennis" | "pickleball";
type TimeFilter = "all" | "morning" | "afternoon" | "evening";

const SPORTS = [
  { value: "padel" as Sport, label: "Padel", active: true },
  { value: "tennis" as Sport, label: "Tennis", active: false },
  { value: "pickleball" as Sport, label: "Pickleball", active: false },
];

const TIME_OPTIONS: { value: TimeFilter; label: string; sub: string }[] = [
  { value: "all",       label: "All day",   sub: "00:00 – 23:59" },
  { value: "morning",   label: "Morning",   sub: "06:00 – 12:00" },
  { value: "afternoon", label: "Afternoon", sub: "12:00 – 18:00" },
  { value: "evening",   label: "Evening",   sub: "18:00 – 24:00" },
];

const GRADIENTS = [
  "linear-gradient(145deg, #eff6ff 0%, #bfdbfe 55%, #dbeafe 100%)",
  "linear-gradient(145deg, #f0fdf4 0%, #bbf7d0 55%, #dcfce7 100%)",
  "linear-gradient(145deg, #fdf4ff 0%, #e9d5ff 55%, #f5f3ff 100%)",
  "linear-gradient(145deg, #fff7ed 0%, #fed7aa 55%, #ffedd5 100%)",
];

function parseMinutes(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function matchesTime(start: string, f: TimeFilter) {
  const m = parseMinutes(start);
  if (f === "all") return true;
  if (f === "morning") return m >= 360 && m < 720;
  if (f === "afternoon") return m >= 720 && m < 1080;
  if (f === "evening") return m >= 1080;
  return true;
}
function fmtDate(iso: string) { return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function fmtDateLabel(iso: string, todayIso: string) {
  const diff = Math.round((new Date(iso + "T00:00:00").getTime() - new Date(todayIso + "T00:00:00").getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function CourtLines() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 213" preserveAspectRatio="none" fill="none" aria-hidden style={{ opacity: 0.18 }}>
      <rect x="24" y="18" width="272" height="178" stroke="rgba(15,23,42,0.35)" strokeWidth="2" />
      <line x1="24" y1="107" x2="296" y2="107" stroke="rgba(15,23,42,0.25)" strokeWidth="1.5" />
      <line x1="160" y1="18" x2="160" y2="196" stroke="rgba(15,23,42,0.35)" strokeWidth="2" />
      <line x1="68" y1="18" x2="68" y2="196" stroke="rgba(15,23,42,0.2)" strokeWidth="1" strokeDasharray="5 4" />
      <line x1="252" y1="18" x2="252" y2="196" stroke="rgba(15,23,42,0.2)" strokeWidth="1" strokeDasharray="5 4" />
      <ellipse cx="160" cy="107" rx="28" ry="28" stroke="rgba(15,23,42,0.2)" strokeWidth="1" />
    </svg>
  );
}

export default function PadelCourtsClient({ clubs, slots, initialDate }: { clubs: Club[]; slots: Slot[]; initialDate: string; }) {
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState<Sport>("padel");
  const [selectedDates, setSelectedDates] = useState<string[]>([initialDate]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const timeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (timeMenuRef.current && !timeMenuRef.current.contains(e.target as Node)) setShowTimeMenu(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const dateOptions = useMemo(() => {
    const base = new Date(initialDate + "T00:00:00");
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base); d.setDate(base.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      return { iso, label: fmtDateLabel(iso, initialDate), short: fmtDate(iso) };
    });
  }, [initialDate]);

  function toggleDate(iso: string) {
    setSelectedDates((prev) => {
      if (prev.includes(iso)) return prev.length > 1 ? prev.filter((d) => d !== iso) : prev;
      if (prev.length >= 3) return prev;
      return [...prev, iso].sort();
    });
  }

  const slotsByCourtId = useMemo(() => {
    const m: Record<string, Slot[]> = {};
    slots.forEach((s) => { if (!m[s.court_id]) m[s.court_id] = []; m[s.court_id].push(s); });
    return m;
  }, [slots]);

  const filteredClubs = useMemo(() => {
    const q = search.toLowerCase();
    return clubs.filter((club) => {
      if (q && !club.name.toLowerCase().includes(q) && !club.address.toLowerCase().includes(q)) return false;
      return club.courts.some((court) =>
        (slotsByCourtId[court.id] ?? []).some((s) => selectedDates.includes(s.date) && matchesTime(s.start_time, timeFilter))
      );
    });
  }, [clubs, search, selectedDates, timeFilter, slotsByCourtId]);

  function getSlotsForClub(club: Club) {
    const grouped: Record<string, Slot[]> = {};
    for (const court of club.courts) {
      for (const s of slotsByCourtId[court.id] ?? []) {
        if (selectedDates.includes(s.date) && matchesTime(s.start_time, timeFilter)) {
          if (!grouped[s.date]) grouped[s.date] = [];
          grouped[s.date].push(s);
        }
      }
    }
    return selectedDates.filter((d) => grouped[d]?.length).map((d) => ({ date: d, slots: grouped[d].sort((a, b) => a.start_time.localeCompare(b.start_time)) }));
  }

  const currentTimeOption = TIME_OPTIONS.find((o) => o.value === timeFilter)!;

  return (
    <main className="min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-[57px] z-40" style={{ background: "rgba(248,250,252,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(15,23,42,0.08)" }}>
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            Book a Padel Court
          </h1>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10.5 10.5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="text" placeholder="Search clubs or locations…" value={search}
              onChange={(e) => setSearch(e.target.value)} suppressHydrationWarning
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[#0f172a] placeholder-slate-400 outline-none transition-all duration-200"
              style={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.12)", fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(37,99,235,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.07)"; }}
              onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(15,23,42,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sport */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.08)" }}>
              {SPORTS.map((s) => (
                <button key={s.value} onClick={() => s.active && setSport(s.value)} suppressHydrationWarning
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-syne, Syne, sans-serif)",
                    background: sport === s.value ? "#2563eb" : "transparent",
                    color: sport === s.value ? "#fff" : s.active ? "#64748b" : "#cbd5e1",
                    cursor: s.active ? "pointer" : "not-allowed",
                  }}
                  title={s.active ? undefined : "Coming soon"}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {dateOptions.map((opt) => {
                const selected = selectedDates.includes(opt.iso);
                return (
                  <button key={opt.iso} onClick={() => toggleDate(opt.iso)} suppressHydrationWarning
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-syne, Syne, sans-serif)",
                      background: selected ? "rgba(37,99,235,0.08)" : "rgba(15,23,42,0.04)",
                      border: selected ? "1px solid rgba(37,99,235,0.35)" : "1px solid rgba(15,23,42,0.08)",
                      color: selected ? "#2563eb" : "#64748b",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Time filter */}
            <div ref={timeMenuRef} className="relative ml-auto shrink-0">
              <button onClick={() => setShowTimeMenu((v) => !v)} suppressHydrationWarning
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                  background: timeFilter !== "all" ? "rgba(37,99,235,0.08)" : "rgba(15,23,42,0.04)",
                  border: timeFilter !== "all" ? "1px solid rgba(37,99,235,0.3)" : "1px solid rgba(15,23,42,0.08)",
                  color: timeFilter !== "all" ? "#2563eb" : "#64748b",
                }}
              >
                🕐 {currentTimeOption.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </button>

              <AnimatePresence>
                {showTimeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 z-50"
                    style={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.1)", boxShadow: "0 12px 32px rgba(15,23,42,0.1)" }}
                  >
                    {TIME_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => { setTimeFilter(opt.value); setShowTimeMenu(false); }} suppressHydrationWarning
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all duration-150 hover:bg-slate-50"
                        style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                      >
                        <span className="text-sm font-semibold" style={{ color: timeFilter === opt.value ? "#2563eb" : "#0f172a", fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                          {opt.label}
                        </span>
                        <span className="text-xs text-slate-400">{opt.sub}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-5 py-8">
        <p className="text-xs text-slate-400 mb-6" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
          {filteredClubs.length} club{filteredClubs.length !== 1 ? "s" : ""} available
        </p>

        {filteredClubs.length === 0 ? (
          <div className="glass-card rounded-2xl p-14 text-center">
            <p className="text-3xl mb-3">🎾</p>
            <p className="text-[#0f172a] font-bold text-xl mb-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>No courts found</p>
            <p className="text-slate-500 text-sm">Try adjusting your filters or selecting a different date.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          >
            {filteredClubs.map((club, i) => (
              <ClubCard
                key={club.id} club={club} gradient={GRADIENTS[i % GRADIENTS.length]}
                slotGroups={getSlotsForClub(club)} isFav={favorites.has(club.id)}
                onToggleFav={() => setFavorites((prev) => { const n = new Set(prev); n.has(club.id) ? n.delete(club.id) : n.add(club.id); return n; })}
                multiDay={selectedDates.length > 1}
              />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}

function ClubCard({ club, gradient, slotGroups, isFav, onToggleFav, multiDay }: {
  club: Club; gradient: string; slotGroups: { date: string; slots: Slot[] }[];
  isFav: boolean; onToggleFav: () => void; multiDay: boolean;
}) {
  const router = useRouter();
  const minPrice = club.courts.length ? Math.min(...club.courts.map((c) => c.price_per_hour)) : null;
  const cardDate = slotGroups[0]?.date ?? "";

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } }}
      whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={() => router.push(`/clubs/${club.id}${cardDate ? `?date=${cardDate}` : ""}`)}
      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{ height: "380px", border: "1px solid rgba(15,23,42,0.08)", background: "#ffffff", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden shrink-0" style={{ flex: "0 0 calc(100% * 2 / 3)", background: gradient }}>
        <CourtLines />

        {/* Favourite */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }} suppressHydrationWarning
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", border: "1px solid rgba(15,23,42,0.1)" }}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          <span className="text-base leading-none" style={{ color: isFav ? "#ef4444" : "rgba(15,23,42,0.35)" }}>
            {isFav ? "♥" : "♡"}
          </span>
        </button>

        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)" }} />

        {/* Club name */}
        <div className="absolute bottom-3 left-3 right-20 z-10">
          <h3 className="text-slate-900 font-bold text-sm truncate" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>{club.name}</h3>
        </div>

        {/* Price */}
        {minPrice !== null && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-[11px] font-bold text-[#2563eb] px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.9)", fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
              1h from {minPrice} GEL
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col px-4 pt-3 pb-3 gap-2 overflow-hidden" style={{ flex: "0 0 calc(100% / 3)" }}>
        <p className="text-xs text-slate-400 truncate shrink-0">📍 {club.address}, Tbilisi</p>

        <div className="flex flex-col gap-1.5 overflow-hidden flex-1">
          {slotGroups.slice(0, multiDay ? 3 : 1).map(({ date, slots }) => (
            <div key={date} className="flex items-center gap-2 min-w-0">
              {multiDay && (
                <span className="text-[10px] font-bold text-slate-400 shrink-0 w-12" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                  {fmtDate(date)}
                </span>
              )}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-nowrap">
                {slots.map((slot) => (
                  <a key={slot.id}
                    href={`/clubs/${club.id}?date=${slot.date}&time=${slot.start_time.slice(0, 5)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-150 hover:bg-[#2563eb] hover:text-white"
                    style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.15)", color: "#2563eb", fontFamily: "var(--font-dm-mono, DM Mono, monospace)" }}
                  >
                    {slot.start_time.slice(0, 5)}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
