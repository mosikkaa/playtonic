const footerLinks = {
  Players: [
    { label: "Book a Court", href: "/padel-courts" },
    { label: "My Bookings", href: "/bookings" },
    { label: "How it works", href: "/#how-it-works" },
  ],
  Clubs: [
    { label: "List your club", href: "/for-clubs" },
    { label: "Club dashboard", href: "/dashboard" },
  ],
  Company: [
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="relative z-10 mt-24 bg-white"
      style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
    >
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <span
                className="text-base font-extrabold tracking-tighter text-[#0f172a]"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                PADEL<span className="text-[#2563eb]">GEO</span>
              </span>
            </div>
            <p
              className="text-sm text-slate-500 leading-relaxed max-w-[180px]"
              style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
            >
              The fastest way to book padel courts in Tbilisi, Georgia.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4
                className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 mb-4"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200"
                      style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8"
          style={{ borderTop: "1px solid rgba(15,23,42,0.07)" }}
        >
          <p className="text-xs text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
            © {new Date().getFullYear()} PadelGeo. All rights reserved.
          </p>
          <p className="text-xs text-slate-400" style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}>
            Made with ♥ in Tbilisi&nbsp;🇬🇪
          </p>
        </div>
      </div>
    </footer>
  );
}
