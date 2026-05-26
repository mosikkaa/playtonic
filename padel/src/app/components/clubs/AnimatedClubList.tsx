"use client";

import { motion, type Variants } from "framer-motion";

interface Court {
  id: string;
  price_per_hour: number;
}

interface Club {
  id: string;
  name: string;
  address: string;
  description: string;
  indoor: boolean;
  outdoor: boolean;
  courts: Court[];
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function AnimatedClubList({ clubs }: { clubs: Club[] }) {
  return (
    <motion.div
      className="grid gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {clubs.map((club) => {
        const prices = club.courts.map((c) => c.price_per_hour);
        const minPrice = prices.length ? Math.min(...prices) : 0;

        return (
          <motion.div
            key={club.id}
            variants={card}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="glass-card rounded-2xl p-6 group"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-bold text-white mb-1.5 group-hover:text-[#c9ff3b] transition-colors duration-200 truncate"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {club.name}
                </h2>
                <p className="text-sm text-white/40 mb-3 flex items-center gap-1.5">
                  <svg
                    width="11"
                    height="13"
                    viewBox="0 0 11 13"
                    fill="none"
                    className="shrink-0 opacity-60"
                  >
                    <path
                      d="M5.5 0C3.014 0 1 2.014 1 4.5c0 3.375 4.5 8.5 4.5 8.5S10 7.875 10 4.5C10 2.014 7.986 0 5.5 0Zm0 6.5A2 2 0 1 1 5.5 2.5a2 2 0 0 1 0 4Z"
                      fill="currentColor"
                    />
                  </svg>
                  {club.address}
                </p>
                <p className="text-sm text-white/55 leading-relaxed line-clamp-2">
                  {club.description}
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {club.indoor && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-center">
                    Indoor
                  </span>
                )}
                {club.outdoor && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center">
                    Outdoor
                  </span>
                )}
              </div>
            </div>

            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm text-white/35">
                From{" "}
                <span
                  className="text-[#c9ff3b] font-bold text-lg"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {minPrice}
                </span>
                <span className="text-white/30 ml-1">GEL / hr</span>
              </p>

              <a
                href={`/clubs/${club.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:bg-[#c9ff3b] hover:text-black hover:shadow-[0_0_20px_rgba(201,255,59,0.3)]"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-outfit, Outfit, sans-serif)",
                }}
              >
                View courts
                <span className="text-xs opacity-70">→</span>
              </a>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
