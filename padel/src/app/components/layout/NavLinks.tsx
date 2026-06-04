"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface NavLinksProps {
  isLoggedIn: boolean;
  hasClub: boolean;
}

const dropVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  show:  { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit:  { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } },
};

export default function NavLinks({ isLoggedIn, hasClub }: NavLinksProps) {
  const [showPlayers, setShowPlayers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const playersRef = useRef<HTMLLIElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (playersRef.current && !playersRef.current.contains(e.target as Node))
        setShowPlayers(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setShowProfile(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkCls = "text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200";

  /* ── Club owner: minimal nav ─────────────────────────────── */
  if (isLoggedIn && hasClub) {
    return (
      <div className="flex items-center gap-6" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
        <a href="/dashboard" className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-200">
          Dashboard
        </a>
        <form action="/auth/signout" method="post">
          <button suppressHydrationWarning className="text-sm text-slate-400 hover:text-slate-600 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
            Log out
          </button>
        </form>
      </div>
    );
  }

  /* ── Regular user ────────────────────────────────────────── */
  if (isLoggedIn && !hasClub) {
    return (
      <div className="flex items-center gap-8" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
        <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0">
          {/* For Players dropdown */}
          <li ref={playersRef} className="relative" onMouseEnter={() => setShowPlayers(true)} onMouseLeave={() => setShowPlayers(false)}>
            <button onClick={() => setShowPlayers((v) => !v)} suppressHydrationWarning
              className={`${linkCls} flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0`}>
              For Players
              <motion.svg width="11" height="7" viewBox="0 0 11 7" fill="none" animate={{ rotate: showPlayers ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {showPlayers && (
                <motion.div variants={dropVariants} initial="hidden" animate="show" exit="exit"
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-60 rounded-2xl py-2 z-50"
                  style={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 12px 32px rgba(15,23,42,0.1)" }}>
                  <div className="px-3 pb-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 px-2 mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Book</p>
                    <a href="/padel-courts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150 group">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: "rgba(37,99,235,0.07)" }}>🎾</span>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-slate-900" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "13px" }}>Book a padel court</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Find &amp; reserve instantly</p>
                      </div>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          <li><a href="/blog" className={linkCls}>Blog</a></li>
        </ul>

        <div className="flex items-center gap-5">
          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button onClick={() => setShowProfile((v) => !v)} suppressHydrationWarning
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:bg-slate-100"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", color: "#0f172a", border: "1px solid rgba(15,23,42,0.1)" }}>
              <span className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold">P</span>
              Profile
              <motion.svg width="10" height="6" viewBox="0 0 10 6" fill="none" animate={{ rotate: showProfile ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div variants={dropVariants} initial="hidden" animate="show" exit="exit"
                  className="absolute top-full right-0 mt-3 w-52 rounded-2xl py-2 z-50"
                  style={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 12px 32px rgba(15,23,42,0.1)" }}>
                  <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    My Profile
                  </a>
                  <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/></svg>
                    My Bookings
                  </a>
                  <div style={{ borderTop: "1px solid rgba(15,23,42,0.07)", margin: "4px 12px" }} />
                  <form action="/auth/signout" method="post" className="px-1">
                    <button suppressHydrationWarning className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150 cursor-pointer bg-transparent border-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Log out
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not logged in ───────────────────────────────────────── */
  return (
    <div className="flex items-center gap-8">
      <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
        <li ref={playersRef} className="relative" onMouseEnter={() => setShowPlayers(true)} onMouseLeave={() => setShowPlayers(false)}>
          <button onClick={() => setShowPlayers((v) => !v)} suppressHydrationWarning
            className={`${linkCls} flex items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0`}>
            For Players
            <motion.svg width="11" height="7" viewBox="0 0 11 7" fill="none" animate={{ rotate: showPlayers ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <path d="M1 1l4.5 4.5L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {showPlayers && (
              <motion.div variants={dropVariants} initial="hidden" animate="show" exit="exit"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-60 rounded-2xl py-2 z-50"
                style={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 12px 32px rgba(15,23,42,0.1)" }}>
                <div className="px-3 pb-2 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 px-2 mb-1" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>Book</p>
                  <a href="/padel-courts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150 group">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: "rgba(37,99,235,0.07)" }}>🎾</span>
                    <div>
                      <p className="font-semibold text-slate-800 group-hover:text-slate-900" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "13px" }}>Book a padel court</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Find &amp; reserve instantly</p>
                    </div>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>
        <li><a href="/register-club" className={linkCls}>For Clubs</a></li>
        <li><a href="/blog" className={linkCls}>Blog</a></li>
      </ul>
      <a href="/login" className="text-sm font-semibold px-5 py-2 rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all duration-200 shadow-sm hover:shadow-md" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
        Log in
      </a>
    </div>
  );
}
