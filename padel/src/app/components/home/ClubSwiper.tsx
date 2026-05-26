"use client";

import { useRef } from "react";
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
  "linear-gradient(145deg, #062918 0%, #0e4d2a 55%, #072d1b 100%)",
  "linear-gradient(145deg, #08112e 0%, #112052 55%, #081228 100%)",
  "linear-gradient(145deg, #1e0808 0%, #3d1212 55%, #1e0909 100%)",
  "linear-gradient(145deg, #1a1200 0%, #332600 55%, #1a1400 100%)",
];

function CourtLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 320 240"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      style={{ opacity: 0.12 }}
    >
      <rect
        x="24"
        y="18"
        width="272"
        height="204"
        stroke="white"
        strokeWidth="2"
      />
      <line
        x1="24"
        y1="120"
        x2="296"
        y2="120"
        stroke="white"
        strokeWidth="1.5"
      />
      <line x1="160" y1="18" x2="160" y2="222" stroke="white" strokeWidth="2" />
      <line
        x1="68"
        y1="18"
        x2="68"
        y2="222"
        stroke="white"
        strokeWidth="1"
        strokeDasharray="5 4"
      />
      <line
        x1="252"
        y1="18"
        x2="252"
        y2="222"
        stroke="white"
        strokeWidth="1"
        strokeDasharray="5 4"
      />
      <ellipse
        cx="160"
        cy="120"
        rx="28"
        ry="28"
        stroke="white"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function ClubSwiper({ clubs }: { clubs: Club[] }) {
  const swiperRef = useRef<SwiperType | null>(null);

  const btnCls =
    "absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 select-none";
  const btnStyle = {
    background: "rgba(201,255,59,0.1)",
    border: "1px solid rgba(201,255,59,0.3)",
    color: "#c9ff3b",
    backdropFilter: "blur(8px)",
  };

  return (
    <div className="relative px-8 sm:px-12">
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className={`${btnCls} left-0`}
        style={btnStyle}
        aria-label="Previous"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <path
            d="M17 7H1M7 1L1 7l6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        className={`${btnCls} right-0`}
        style={btnStyle}
        aria-label="Next"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <path
            d="M1 7h16M11 1l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView={1.1}
        spaceBetween={16}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        style={{ overflow: "visible" }}
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
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                {/* Photo area */}
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", background: gradient }}
                >
                  <CourtLines />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                    {club.indoor && (
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-blue-300"
                        style={{
                          background: "rgba(59,130,246,0.22)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        Indoor
                      </span>
                    )}
                    {club.outdoor && (
                      <span
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-emerald-300"
                        style={{
                          background: "rgba(16,185,129,0.22)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        Outdoor
                      </span>
                    )}
                  </div>

                  {/* Gradient overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-24"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                    }}
                  />

                  {/* Club name — bottom left */}
                  <div className="absolute bottom-3 left-3 right-16 z-10">
                    <h3
                      className="text-white font-bold text-sm truncate group-hover:text-[#c9ff3b] transition-colors duration-200"
                      style={{
                        fontFamily: "var(--font-syne, Syne, sans-serif)",
                      }}
                    >
                      {club.name}
                    </h3>
                  </div>

                  {/* Price — bottom right */}
                  {minPrice !== null && (
                    <div className="absolute bottom-3 right-3 z-10">
                      <span
                        className="text-[11px] font-bold text-[#c9ff3b] px-2 py-0.5 rounded-lg"
                        style={{
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(6px)",
                          fontFamily: "var(--font-syne, Syne, sans-serif)",
                        }}
                      >
                        From {minPrice} GEL
                      </span>
                    </div>
                  )}
                </div>

                {/* Info strip */}
                <div
                  className="px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <p className="text-xs text-white/40 truncate">
                    📍 {club.address}
                  </p>
                </div>
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
