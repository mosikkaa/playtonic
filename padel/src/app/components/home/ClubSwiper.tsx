"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

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

const gradients = [
  "linear-gradient(145deg, #eff6ff 0%, #bfdbfe 55%, #dbeafe 100%)",
  "linear-gradient(145deg, #f0fdf4 0%, #bbf7d0 55%, #dcfce7 100%)",
  "linear-gradient(145deg, #fdf4ff 0%, #e9d5ff 55%, #f5f3ff 100%)",
  "linear-gradient(145deg, #fff7ed 0%, #fed7aa 55%, #ffedd5 100%)",
];

function CourtLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 320 240"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      style={{ opacity: 0.18 }}
    >
      <rect x="24" y="18" width="272" height="204" stroke="rgba(15,23,42,0.35)" strokeWidth="2" />
      <line x1="24" y1="120" x2="296" y2="120" stroke="rgba(15,23,42,0.25)" strokeWidth="1.5" />
      <line x1="160" y1="18" x2="160" y2="222" stroke="rgba(15,23,42,0.35)" strokeWidth="2" />
      <line x1="68" y1="18" x2="68" y2="222" stroke="rgba(15,23,42,0.2)" strokeWidth="1" strokeDasharray="5 4" />
      <line x1="252" y1="18" x2="252" y2="222" stroke="rgba(15,23,42,0.2)" strokeWidth="1" strokeDasharray="5 4" />
      <ellipse cx="160" cy="120" rx="28" ry="28" stroke="rgba(15,23,42,0.2)" strokeWidth="1" />
    </svg>
  );
}

export default function ClubSwiper({ clubs }: { clubs: Club[] }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const btnCls =
    "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full items-center justify-center transition-all duration-200 hover:scale-110 select-none";
  const btnStyle = {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(15,23,42,0.1)",
    color: "#2563eb",
    backdropFilter: "blur(8px)",
    boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
  };

  return (
    <div className="relative px-4 sm:px-14">
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className={`${btnCls} left-0`}
        style={btnStyle}
        aria-label="Previous"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <path d="M17 7H1M7 1L1 7l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        className={`${btnCls} right-0`}
        style={btnStyle}
        aria-label="Next"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <path d="M1 7h16M11 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        slidesPerView={1}
        spaceBetween={16}
        loop={true}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        breakpoints={{
          640:  { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
      >
        {clubs.map((club, i) => {
          const prices = club.courts.map((c) => c.price_per_hour);
          const minPrice = prices.length ? Math.min(...prices) : null;
          const gradient = gradients[i % gradients.length];

          return (
            <SwiperSlide key={club.id}>
              <a
                href={`/clubs/${club.id}`}
                className="block rounded-2xl overflow-hidden group"
                style={{
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
              >
                {/* Photo area */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: gradient }}>
                  <CourtLines />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                    {club.indoor && (
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-blue-700"
                        style={{ background: "rgba(219,234,254,0.9)", border: "1px solid rgba(59,130,246,0.3)" }}
                      >
                        Indoor
                      </span>
                    )}
                    {club.outdoor && (
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-emerald-700"
                        style={{ background: "rgba(209,250,229,0.9)", border: "1px solid rgba(16,185,129,0.3)" }}
                      >
                        Outdoor
                      </span>
                    )}
                  </div>

                  {/* Gradient overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-20"
                    style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)" }}
                  />

                  {/* Club name */}
                  <div className="absolute bottom-3 left-3 right-16 z-10">
                    <h3
                      className="text-slate-900 font-bold text-sm truncate group-hover:text-[#2563eb] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                    >
                      {club.name}
                    </h3>
                  </div>

                  {/* Price */}
                  {minPrice !== null && (
                    <div className="absolute bottom-3 right-3 z-10">
                      <span
                        className="text-[11px] font-bold text-[#2563eb] px-2 py-0.5 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.9)", fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                      >
                        From {minPrice} GEL
                      </span>
                    </div>
                  )}
                </div>

                {/* Info strip */}
                <div className="px-4 py-3" style={{ background: "#fafafa" }}>
                  <p className="text-xs text-slate-400 truncate">📍 {club.address}</p>
                </div>
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Dot pagination — mobile only */}
      <div className="flex sm:hidden justify-center gap-2 mt-5">
        {clubs.map((_, i) => (
          <button
            key={i}
            onClick={() => swiperRef.current?.slideToLoop(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              height: 6,
              width: activeIndex === i ? 22 : 6,
              borderRadius: 9999,
              background: activeIndex === i ? "#2563eb" : "rgba(15,23,42,0.18)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s ease",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
