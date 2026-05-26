"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface NavLinksProps {
  isLoggedIn: boolean;
  hasClub: boolean;
}

const dropVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.14 },
  },
};

export default function NavLinks({ isLoggedIn, hasClub }: NavLinksProps) {
  const [showPlayers, setShowPlayers] = useState(false);
  const playersRef = useRef<HTMLLIElement>(null);

  /* close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (playersRef.current && !playersRef.current.contains(e.target as Node)) {
        setShowPlayers(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkCls =
    "text-sm text-white/55 hover:text-white transition-colors duration-200";

  return (
    <div className="flex items-center gap-8">
      {/* Navigation list */}
      <ul
        className="hidden md:flex items-center gap-7 list-none m-0 p-0"
        style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
      >
        {/* For Players with dropdown */}
        <li
          ref={playersRef}
          className="relative"
          onMouseEnter={() => setShowPlayers(true)}
          onMouseLeave={() => setShowPlayers(false)}
        >
          <button
            onClick={() => setShowPlayers((v) => !v)}
            suppressHydrationWarning
            className={`${linkCls} flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0`}
          >
            For Players
            <motion.svg
              width="11"
              height="7"
              viewBox="0 0 11 7"
              fill="none"
              animate={{ rotate: showPlayers ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path
                d="M1 1l4.5 4.5L10 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </button>

          <AnimatePresence>
            {showPlayers && (
              <motion.div
                variants={dropVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-60 rounded-2xl py-2 z-50"
                style={{
                  background: "rgba(12,12,12,0.96)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                }}
              >
                <div className="px-3 pb-2 pt-1">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25 px-2 mb-1"
                    style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                  >
                    Book
                  </p>
                  <a
                    href="/padel-courts"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-all duration-150 group"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      style={{ background: "rgba(201,255,59,0.1)" }}
                    >
                      🎾
                    </span>
                    <div>
                      <p
                        className="font-semibold text-white/90 group-hover:text-white"
                        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "13px" }}
                      >
                        Book a padel court
                      </p>
                      <p className="text-[11px] text-white/35 mt-0.5">
                        Find &amp; reserve instantly
                      </p>
                    </div>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        <li>
          <a href="/for-clubs" className={linkCls}>
            For Clubs
          </a>
        </li>

        <li>
          <a href="/blog" className={linkCls}>
            Blog
          </a>
        </li>
      </ul>

      {/* Auth section */}
      <div
        className="flex items-center gap-5"
        style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
      >
        {isLoggedIn ? (
          <>
            {hasClub && (
              <a href="/dashboard" className={linkCls}>
                Dashboard
              </a>
            )}
            <a href="/bookings" className={linkCls}>
              My Bookings
            </a>
            <form action="/auth/signout" method="post">
              <button
                suppressHydrationWarning
                className="text-sm text-white/25 hover:text-white/55 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0"
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <a
            href="/login"
            className="text-sm font-semibold px-5 py-2 rounded-full bg-[#c9ff3b] text-black hover:bg-[#d9ff60] transition-all duration-200 hover:shadow-[0_0_24px_rgba(201,255,59,0.45)]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Log in
          </a>
        )}
      </div>
    </div>
  );
}
