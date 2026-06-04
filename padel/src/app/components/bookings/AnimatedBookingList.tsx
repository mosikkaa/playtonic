"use client";

import { motion, type Variants } from "framer-motion";

interface Booking {
  id: string;
  status: string;
  total_price: number;
  time_slots: {
    date: string;
    start_time: string;
    end_time: string;
    courts: {
      name: string;
      type: string;
      clubs: { name: string };
    };
  };
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  confirmed: { bg: "rgba(5,150,105,0.08)",  text: "#059669", border: "rgba(5,150,105,0.2)",  dot: "#059669" },
  cancelled: { bg: "rgba(220,38,38,0.08)",   text: "#dc2626", border: "rgba(220,38,38,0.2)",  dot: "#dc2626" },
  pending:   { bg: "rgba(217,119,6,0.08)",   text: "#b45309", border: "rgba(217,119,6,0.2)",  dot: "#d97706" },
};

const fallbackStatus = {
  bg: "rgba(15,23,42,0.04)",
  text: "#64748b",
  border: "rgba(15,23,42,0.1)",
  dot: "#94a3b8",
};

export default function AnimatedBookingList({ bookings }: { bookings: Booking[] }) {
  return (
    <motion.div className="grid gap-4" variants={container} initial="hidden" animate="show">
      {bookings.map((booking) => {
        const s = statusConfig[booking.status] ?? fallbackStatus;

        return (
          <motion.div
            key={booking.id}
            variants={card}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2
                  className="font-bold text-[#0f172a] text-base mb-0.5"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {booking.time_slots.courts.clubs.name}
                </h2>
                <p className="text-sm text-slate-500 capitalize">
                  {booking.time_slots.courts.name} · {booking.time_slots.courts.type}
                </p>
              </div>

              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5"
                style={{
                  background: s.bg,
                  color: s.text,
                  border: `1px solid ${s.border}`,
                  fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                {booking.status}
              </span>
            </div>

            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: "1px solid rgba(15,23,42,0.07)" }}
            >
              <div>
                <p className="text-sm text-slate-600">
                  {new Date(booking.time_slots.date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="text-sm text-slate-400 mt-0.5">
                  {booking.time_slots.start_time.slice(0, 5)} —{" "}
                  {booking.time_slots.end_time.slice(0, 5)}
                </p>
              </div>

              <p
                className="text-[#2563eb] font-extrabold text-xl"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {booking.total_price}
                <span className="text-sm font-normal text-slate-400 ml-1">GEL</span>
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
