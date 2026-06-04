"use client";

import { motion, type Variants } from "framer-motion";

interface Court { id: string; name: string; type: string; price_per_hour: number; }

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const card: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function AnimatedCourtList({ courts, clubId }: { courts: Court[]; clubId: string }) {
  return (
    <motion.div className="grid gap-3" variants={container} initial="hidden" animate="show">
      {courts.map((court) => (
        <motion.div
          key={court.id} variants={card}
          whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="glass-card rounded-2xl p-5 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="font-bold text-[#0f172a] text-lg mb-0.5 group-hover:text-[#2563eb] transition-colors duration-200"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {court.name}
              </h3>
              <p className="text-sm text-slate-500 capitalize">{court.type} court</p>
            </div>
            <div className="text-right">
              <p className="text-[#2563eb] font-extrabold text-2xl leading-none" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                {court.price_per_hour}
                <span className="text-sm font-normal text-slate-400 ml-1">GEL</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">per hour</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(15,23,42,0.07)" }} className="pt-4">
            <a
              href={`/clubs/${clubId}/courts/${court.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-slate-700 transition-all duration-200 hover:bg-[#2563eb] hover:text-white hover:shadow-md"
              style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.1)", fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
            >
              Check availability <span className="text-xs opacity-60">→</span>
            </a>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
