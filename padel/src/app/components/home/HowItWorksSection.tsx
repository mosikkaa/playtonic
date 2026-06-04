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
    <section id="how-it-works" className="max-w-7xl mx-auto px-5 py-20">
      <div className="mb-12">
        <div className="accent-badge mb-4">How it works</div>
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Three steps to your
          <br />
          <span className="accent-glow-text">next match.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {steps.map((step) => (
          <div
            key={step.label}
            className="glass-card rounded-2xl p-7 relative overflow-hidden group"
          >
            <span
              className="absolute -top-4 -right-2 text-8xl font-extrabold select-none leading-none"
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                color: "rgba(15,23,42,0.03)",
              }}
              aria-hidden
            >
              {step.label}
            </span>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.12)",
              }}
            >
              {step.icon}
            </div>

            <h3
              className="text-xl font-extrabold text-[#0f172a] mb-3 group-hover:text-[#2563eb] transition-colors duration-200"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {step.title}
            </h3>

            <p
              className="text-sm text-slate-500 leading-relaxed"
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
