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
      clubs: {
        name: string;
      };
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

const statusConfig: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  confirmed: {
    bg: "rgba(0,255,135,0.08)",
    text: "#00ff87",
    border: "rgba(0,255,135,0.22)",
    dot: "#00ff87",
  },
  cancelled: {
    bg: "rgba(255,59,92,0.08)",
    text: "#ff3b5c",
    border: "rgba(255,59,92,0.22)",
    dot: "#ff3b5c",
  },
  pending: {
    bg: "rgba(251,191,36,0.08)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.22)",
    dot: "#fbbf24",
  },
};

const fallbackStatus = {
  bg: "rgba(255,255,255,0.05)",
  text: "rgba(255,255,255,0.45)",
  border: "rgba(255,255,255,0.1)",
  dot: "rgba(255,255,255,0.4)",
};

export default function AnimatedBookingList({
  bookings,
}: {
  bookings: Booking[];
}) {
  return (
    <motion.div
      className="grid gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {bookings.map((booking) => {
        const s = statusConfig[booking.status] ?? fallbackStatus;

        return (
          <motion.div
            key={booking.id}
            variants={card}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2
                  className="font-bold text-white text-base mb-0.5"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {booking.time_slots.courts.clubs.name}
                </h2>
                <p className="text-sm text-white/40 capitalize">
                  {booking.time_slots.courts.name} ·{" "}
                  {booking.time_slots.courts.type}
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
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: s.dot }}
                />
                {booking.status}
              </span>
            </div>

            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <p className="text-sm text-white/45">
                  {new Date(booking.time_slots.date).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    },
                  )}
                </p>
                <p className="text-sm text-white/25 mt-0.5">
                  {booking.time_slots.start_time.slice(0, 5)} —{" "}
                  {booking.time_slots.end_time.slice(0, 5)}
                </p>
              </div>

              <p
                className="text-[#c9ff3b] font-extrabold text-xl"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {booking.total_price}
                <span className="text-sm font-normal text-white/30 ml-1">
                  GEL
                </span>
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
