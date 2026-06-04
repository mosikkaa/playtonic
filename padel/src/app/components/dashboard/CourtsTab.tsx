"use client";

import { useState, useTransition } from "react";
import { updateCourt, deleteCourt, addCourt } from "@/app/dashboard/actions";

interface Court {
  id: string;
  name: string;
  type: string;
  price_per_hour: number;
}

function CourtRow({ court, onDeleted }: { court: Court; onDeleted: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(court.name);
  const [type, setType] = useState(court.type);
  const [price, setPrice] = useState(String(court.price_per_hour));
  const [err, setErr] = useState("");
  const [, startTransition] = useTransition();

  function handleSave() {
    setErr("");
    startTransition(async () => {
      const { error } = await updateCourt(court.id, { name, type, price_per_hour: parseFloat(price) });
      if (error) { setErr(error); return; }
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${court.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const { error } = await deleteCourt(court.id);
      if (error) { setErr(error); return; }
      onDeleted(court.id);
    });
  }

  const inputCls = "rounded-lg px-3 py-1.5 text-sm text-[#0f172a] outline-none transition-all duration-150";
  const inputStyle = { background: "#f8fafc", border: "1px solid rgba(15,23,42,0.12)" };

  return (
    <div className="glass-card rounded-2xl p-5">
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(37,99,235,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.07)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls} style={{ ...inputStyle, width: "100%" }}>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>GEL/hr</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} style={inputStyle}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(37,99,235,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.07)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; }} />
            </div>
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Save</button>
            <button onClick={() => { setEditing(false); setName(court.name); setType(court.type); setPrice(String(court.price_per_hour)); }} className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[#0f172a] mb-0.5" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>{court.name}</p>
            <p className="text-sm text-slate-500 capitalize">{court.type} · <span className="text-[#2563eb] font-semibold">{court.price_per_hour} GEL</span> / hr</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors" style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.09)", fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
              Edit
            </button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors" style={{ border: "1px solid rgba(220,38,38,0.2)", fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourtsTab({ courts: initial, clubId }: { courts: Court[]; clubId: string }) {
  const [courts, setCourts] = useState<Court[]>(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState("indoor");
  const [addPrice, setAddPrice] = useState("");
  const [addErr, setAddErr] = useState("");
  const [, startTransition] = useTransition();

  function handleAdd() {
    if (!addName.trim() || !addPrice) { setAddErr("All fields required"); return; }
    setAddErr("");
    startTransition(async () => {
      const { error } = await addCourt(clubId, { name: addName.trim(), type: addType, price_per_hour: parseFloat(addPrice) });
      if (error) { setAddErr(error); return; }
      // optimistic — reload will get real data
      setCourts((prev) => [...prev, { id: crypto.randomUUID(), name: addName.trim(), type: addType, price_per_hour: parseFloat(addPrice) }]);
      setAddName(""); setAddType("indoor"); setAddPrice(""); setShowAdd(false);
    });
  }

  const inputCls = "rounded-lg px-3 py-1.5 text-sm text-[#0f172a] outline-none transition-all duration-150";
  const inputStyle = { background: "#f8fafc", border: "1px solid rgba(15,23,42,0.12)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          Courts <span className="text-slate-400 font-normal text-sm">({courts.length})</span>
        </h2>
        <button onClick={() => setShowAdd((v) => !v)}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          + Add court
        </button>
      </div>

      {showAdd && (
        <div className="glass-card rounded-2xl p-5 mb-4" style={{ borderColor: "rgba(37,99,235,0.2)" }}>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb] mb-4" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>New court</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Name</label>
              <input placeholder="Court 1" value={addName} onChange={(e) => setAddName(e.target.value)} className={inputCls} style={{ ...inputStyle, width: "100%" }}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(37,99,235,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.07)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Type</label>
              <select value={addType} onChange={(e) => setAddType(e.target.value)} className={inputCls} style={{ ...inputStyle, width: "100%" }}>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>GEL/hr</label>
              <input type="number" placeholder="40" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} className={inputCls} style={{ ...inputStyle, width: "100%" }}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(37,99,235,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.07)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; }} />
            </div>
          </div>
          {addErr && <p className="text-xs text-red-600 mb-2">{addErr}</p>}
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Add</button>
            <button onClick={() => { setShowAdd(false); setAddErr(""); }} className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {courts.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-slate-400 text-sm">No courts yet. Add your first court above.</p>
          </div>
        )}
        {courts.map((c) => (
          <CourtRow key={c.id} court={c} onDeleted={(id) => setCourts((prev) => prev.filter((x) => x.id !== id))} />
        ))}
      </div>
    </div>
  );
}
