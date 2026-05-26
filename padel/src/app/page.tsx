import { createClient } from "@/utils/supabase/server";
import ClubSwiper from "@/app/components/home/ClubSwiper";
import HowItWorksSection from "@/app/components/home/HowItWorksSection";
import TestimonialsSection from "@/app/components/home/TestimonialsSection";

export default async function Home() {
  const supabase = await createClient();
  const { data: clubs } = await supabase.from("clubs").select("*, courts(*)");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-14">
        <div className="animate-fade-up">
          <div className="accent-badge mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9ff3b] pulse-dot shrink-0" />
            Tbilisi, Georgia
          </div>

          <h1
            className="text-5xl sm:text-7xl font-extrabold text-white leading-[1.02] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            The best padel
            <br />
            courts in{" "}
            <span className="accent-glow-text">Georgia.</span>
          </h1>

          <p
            className="text-white/45 text-lg max-w-lg leading-relaxed mb-8"
            style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
          >
            Browse, filter, and book padel courts across Tbilisi — real-time
            availability, instant confirmation.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/padel-courts"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#c9ff3b] text-black font-bold text-sm hover:bg-[#d9ff60] transition-all duration-200 hover:shadow-[0_0_36px_rgba(201,255,59,0.42)]"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Find a court
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <path d="M1 6h12M7 1l6 5-6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="/#how-it-works"
              className="text-sm text-white/45 hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
            >
              How it works →
            </a>
          </div>
        </div>
      </section>

      {/* ── Featured courts swiper ────────────────────────────────── */}
      {clubs && clubs.length > 0 && (
        <section className="pb-16 animate-fade-up delay-200">
          <div className="max-w-5xl mx-auto px-5 mb-6">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Featured courts
            </h2>
          </div>
          <div className="max-w-5xl mx-auto">
            <ClubSwiper clubs={clubs} />
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── CTA banner ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-20">
        <div
          className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(201,255,59,0.1) 0%, rgba(0,255,135,0.06) 100%)",
            border: "1px solid rgba(201,255,59,0.2)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(201,255,59,0.12) 0%, transparent 60%)",
            }}
          />
          <p
            className="text-xs font-bold uppercase tracking-widest text-[#c9ff3b] mb-4"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Ready to play?
          </p>
          <h3
            className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Book your court today.
          </h3>
          <p
            className="text-white/50 text-base mb-8 max-w-sm mx-auto"
            style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
          >
            Slots fill up fast on weekends. Secure yours now in just a few
            taps.
          </p>
          <a
            href="/padel-courts"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#c9ff3b] text-black font-bold text-sm hover:bg-[#d9ff60] transition-all duration-200 hover:shadow-[0_0_44px_rgba(201,255,59,0.45)]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Browse courts →
          </a>
        </div>
      </section>
    </>
  );
}
