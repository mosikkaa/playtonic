"use client";

import { useState, useTransition } from "react";
import { updateClub } from "@/app/dashboard/actions";

interface Club {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  indoor: boolean;
  outdoor: boolean;
}

export default function ClubInfoTab({ club }: { club: Club }) {
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description ?? "");
  const [address, setAddress] = useState(club.address ?? "");
  const [indoor, setIndoor] = useState(club.indoor);
  const [outdoor, setOutdoor] = useState(club.outdoor);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function handleSave() {
    setError(""); setSaved(false);
    startTransition(async () => {
      const { error } = await updateClub(club.id, { name, description, address, indoor, outdoor });
      if (error) { setError(error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm text-[#0f172a] placeholder-slate-400 outline-none transition-all duration-200";
  const inputStyle = { background: "#ffffff", border: "1px solid rgba(15,23,42,0.12)", fontFamily: "var(--font-outfit, Outfit, sans-serif)" };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.target.style.border = "1px solid rgba(37,99,235,0.5)";
      e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.target.style.border = "1px solid rgba(15,23,42,0.12)";
      e.target.style.boxShadow = "none";
    },
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold text-[#0f172a] mb-6" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
        Club Information
      </h2>

      <div className="flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Club name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tbilisi Padel Club" className={inputCls} style={inputStyle} {...focusHandlers} />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell players what makes your club special..." rows={4}
            className={`${inputCls} resize-none`} style={{ ...inputStyle, lineHeight: "1.7" }} {...focusHandlers} />
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="14 Rustaveli Ave, Tbilisi" className={inputCls} style={inputStyle} {...focusHandlers} />
        </div>

        {/* Facility types */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Facility types</label>
          <div className="flex gap-3">
            {[
              { key: "indoor" as const, label: "Indoor", val: indoor, set: setIndoor },
              { key: "outdoor" as const, label: "Outdoor", val: outdoor, set: setOutdoor },
            ].map(({ key, label, val, set }) => (
              <button key={key} type="button" onClick={() => set(!val)}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                  background: val ? "rgba(37,99,235,0.07)" : "#ffffff",
                  border: val ? "1px solid rgba(37,99,235,0.35)" : "1px solid rgba(15,23,42,0.12)",
                  color: val ? "#2563eb" : "#64748b",
                  boxShadow: val ? "0 2px 8px rgba(37,99,235,0.1)" : "none",
                }}>
                <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: val ? "#2563eb" : "rgba(15,23,42,0.08)", transition: "background 0.2s" }}>
                  {val && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>{error}</p>}
        {saved && (
          <p className="text-sm text-emerald-600 flex items-center gap-1.5" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5l4 4L13 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Changes saved
          </p>
        )}

        <button onClick={handleSave}
          className="self-start px-7 py-3 rounded-xl text-sm font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          Save changes
        </button>
      </div>
    </div>
  );
}
