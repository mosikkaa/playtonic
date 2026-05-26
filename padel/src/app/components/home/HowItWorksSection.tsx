const steps = [
  {
    icon: "🔍",
    label: "01",
    title: "Find",
    description:
      "Browse padel courts across Tbilisi. Filter by date, time, and price to find the court that fits your schedule.",
  },
  {
    icon: "📅",
    label: "02",
    title: "Book",
    description:
      "Reserve your slot in seconds — no back-and-forth, no waiting. Get instant confirmation straight to your inbox.",
  },
  {
    icon: "🤝",
    label: "03",
    title: "Join the Community",
    description:
      "Connect with fellow padel players in Georgia. Level up your game, find partners, and be part of a growing scene.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-5 py-20">
      {/* Section heading */}
      <div className="mb-12">
        <div className="accent-badge mb-4">How it works</div>
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Three steps to your
          <br />
          <span className="accent-glow-text">next match.</span>
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {steps.map((step) => (
          <div
            key={step.label}
            className="glass-card rounded-2xl p-7 relative overflow-hidden group"
          >
            {/* Large ghost number */}
            <span
              className="absolute -top-4 -right-2 text-8xl font-extrabold text-white/[0.03] select-none leading-none"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              aria-hidden
            >
              {step.label}
            </span>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
              style={{
                background: "rgba(201,255,59,0.08)",
                border: "1px solid rgba(201,255,59,0.15)",
              }}
            >
              {step.icon}
            </div>

            <h3
              className="text-xl font-extrabold text-white mb-3 group-hover:text-[#c9ff3b] transition-colors duration-200"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {step.title}
            </h3>

            <p
              className="text-sm text-white/50 leading-relaxed"
              style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
