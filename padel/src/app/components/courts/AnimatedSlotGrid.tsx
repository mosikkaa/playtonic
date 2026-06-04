"use client";

import { motion, type Variants } from "framer-motion";

interface Slot { id: string; start_time: string; end_time: string; date: string; }
interface GroupedSlots { [date: string]: Slot[]; }

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const section: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.44, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const slotItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.32, ease: "easeOut" } },
};

export default function AnimatedSlotGrid({ groupedSlots, clubId, courtId, pricePerHour }: {
  groupedSlots: GroupedSlots; clubId: string; courtId: string; pricePerHour: number;
}) {
  return (
    <motion.div className="grid gap-8" variants={container} initial="hidden" animate="show">
      {Object.entries(groupedSlots).map(([date, daySlots]) => (
        <motion.div key={date} variants={section}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(daySlots as Slot[]).map((slot) => (
              <motion.a
                key={slot.id}
                href={`/clubs/${clubId}/courts/${courtId}/book/${slot.id}`}
                variants={slotItem}
                whileHover={{ scale: 1.04, borderColor: "rgba(37,99,235,0.5)", boxShadow: "0 4px 16px rgba(37,99,235,0.12)" }}
                whileTap={{ scale: 0.96 }}
                className="rounded-xl p-4 text-center group cursor-pointer glass-card"
              >
                <p className="font-bold text-[#0f172a] text-sm group-hover:text-[#2563eb] transition-colors" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                  {slot.start_time.slice(0, 5)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 mb-2.5">— {slot.end_time.slice(0, 5)}</p>
                <span className="inline-block text-xs font-semibold text-[#2563eb] px-2.5 py-1 rounded-full" style={{ background: "rgba(37,99,235,0.07)" }}>
                  {pricePerHour} GEL
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
