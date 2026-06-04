"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { deleteSlot, addSlot } from "@/app/dashboard/actions";

interface Court { id: string; name: string; }
interface Slot  { id: string; court_id: string; date: string; start_time: string; end_time: string; is_available: boolean; }

function fmtChip(iso: string, today: string) {
  const diff = Math.round(
    (new Date(iso + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tmrw";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

/* Per-court add form — isolated state */
function AddSlotForm({
  courtId,
  date,
  onAdded,
  onCancel,
}: {
  courtId: string;
  date: string;
  onAdded: (slot: Slot) => void;
  onCancel: () => void;
}) {
  const [start, setStart] = useState("09:00");
  const [end,   setEnd]   = useState("10:00");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  async function handleAdd() {
    setErr("");
    if (!start || !end) { setErr("Enter both times"); return; }
    if (start >= end)   { setErr("End must be after start"); return; }
    setBusy(true);
    const { error } = await addSlot({ court_id: courtId, date, start_time: start, end_time: end });
    setBusy(false);
    if (error) { setErr(error); return; }
    // Fetch the newly created slot so we can add it to the list
    const supabase = createClient();
    const { data } = await supabase
      .from("time_slots")
      .select("*")
      .eq("court_id", courtId)
      .eq("date", date)
      .eq("start_time", start)
      .eq("end_time", end)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data?.[0]) onAdded(data[0]);
    onCancel();
  }

  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.15)" }}>
      <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb] mb-3" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
        New slot
      </p>
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">Start</label>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm text-[#0f172a] outline-none"
            style={{ background: "#fff", border: "1px solid rgba(15,23,42,0.12)" }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(37,99,235,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.07)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; }} />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">End</label>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm text-[#0f172a] outline-none"
            style={{ background: "#fff", border: "1px solid rgba(15,23,42,0.12)" }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(37,99,235,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.07)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; }} />
        </div>
        <div className="flex gap-2">
          <button onClick={handleAdd} disabled={busy}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            {busy ? "Adding…" : "Add"}
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.08)" }}>
            Cancel
          </button>
        </div>
      </div>
      {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
    </div>
  );
}

export default function CalendarTab({ courts }: { courts: Court[] }) {
  const today = new Date().toISOString().split("T")[0];
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  /* Fetch slots for selected date */
  useEffect(() => {
    if (!courts.length) return;
    setLoading(true);
    setAddingFor(null);
    const supabase = createClient();
    supabase
      .from("time_slots")
      .select("*")
      .in("court_id", courts.map((c) => c.id))
      .eq("date", selectedDate)
      .order("start_time")
      .then(({ data }) => {
        setSlots(data ?? []);
        setLoading(false);
      });
  }, [selectedDate, courts]);

  function handleDelete(slotId: string) {
    startTransition(async () => {
      const { error } = await deleteSlot(slotId);
      if (!error) setSlots((prev) => prev.filter((s) => s.id !== slotId));
    });
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0f172a] mb-5" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
        Time Slots
      </h2>

      {/* Date chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
        {dates.map((iso) => {
          const active = iso === selectedDate;
          return (
            <button key={iso} onClick={() => setSelectedDate(iso)}
              className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                background: active ? "#2563eb" : "rgba(15,23,42,0.04)",
                border:     active ? "1px solid #2563eb" : "1px solid rgba(15,23,42,0.08)",
                color:      active ? "#fff" : "#64748b",
                boxShadow:  active ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
              }}>
              {fmtChip(iso, today)}
            </button>
          );
        })}
      </div>

      {/* Per-court slot lists */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="spinner" />
        </div>
      ) : (
        <div className="grid gap-4">
          {courts.map((court) => {
            const courtSlots = slots.filter((s) => s.court_id === court.id);
            const isOpen = addingFor === court.id;

            return (
              <div key={court.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-[#0f172a] text-sm" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                    {court.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {courtSlots.length} slot{courtSlots.length !== 1 ? "s" : ""}
                    </span>
                  </p>
                  <button
                    onClick={() => setAddingFor(isOpen ? null : court.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-syne, Syne, sans-serif)",
                      background: isOpen ? "rgba(15,23,42,0.06)" : "rgba(37,99,235,0.07)",
                      color:      isOpen ? "#64748b" : "#2563eb",
                      border:     isOpen ? "1px solid rgba(15,23,42,0.1)" : "1px solid rgba(37,99,235,0.2)",
                    }}>
                    {isOpen ? "Cancel" : "+ Add slot"}
                  </button>
                </div>

                {isOpen && (
                  <AddSlotForm
                    courtId={court.id}
                    date={selectedDate}
                    onAdded={(slot) => setSlots((prev) => [...prev, slot].sort((a, b) => a.start_time.localeCompare(b.start_time)))}
                    onCancel={() => setAddingFor(null)}
                  />
                )}

                {courtSlots.length === 0 ? (
                  <p className="text-xs text-slate-400 py-1">No slots for this date.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {courtSlots.map((slot) => (
                      <div key={slot.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                        style={{
                          background: slot.is_available ? "rgba(37,99,235,0.07)" : "rgba(220,38,38,0.06)",
                          border:     slot.is_available ? "1px solid rgba(37,99,235,0.18)" : "1px solid rgba(220,38,38,0.15)",
                        }}>
                        <span className="text-xs font-semibold"
                          style={{ color: slot.is_available ? "#2563eb" : "#dc2626", fontFamily: "var(--font-dm-mono, DM Mono, monospace)" }}>
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </span>
                        <span className="text-[10px]" style={{ color: slot.is_available ? "#94a3b8" : "#dc2626" }}>
                          {slot.is_available ? "free" : "booked"}
                        </span>
                        {slot.is_available && (
                          <button onClick={() => handleDelete(slot.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors leading-none font-bold text-sm">
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
