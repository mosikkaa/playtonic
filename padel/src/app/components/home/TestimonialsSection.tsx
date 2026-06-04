const testimonials = [
  {
    name: "Nino Beridze",
    role: "Padel player, Tbilisi",
    avatar: "NB",
    quote:
      "I used to spend 20 minutes on the phone just to book a court. Now I do it in 30 seconds. PadelGeo changed my morning routine completely.",
    stars: 5,
  },
  {
    name: "Giorgi Kvaratskhelia",
    role: "Club manager, Vake",
    avatar: "GK",
    quote:
      "Our bookings went up 40% in the first month. The platform is clean, our clients love it, and we love the dashboard.",
    stars: 5,
  },
  {
    name: "Luka Tabatadze",
    role: "Beginner player",
    avatar: "LT",
    quote:
      "Found my first padel partner through the community here. We play every Saturday now. Best decision I made this year.",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-amber-400 text-sm">★</span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-20">
      <div className="mb-12">
        <div className="accent-badge mb-4">Testimonials</div>
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Trusted by players
          <br />
          <span className="accent-glow-text">across Tbilisi.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
            <Stars count={t.stars} />

            <p
              className="text-sm text-slate-600 leading-relaxed flex-1"
              style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>

            <div
              className="flex items-center gap-3 pt-2"
              style={{ borderTop: "1px solid rgba(15,23,42,0.07)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "#2563eb" }}
              >
                {t.avatar}
              </div>
              <div>
                <p
                  className="text-sm font-bold text-[#0f172a]"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {t.name}
                </p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
