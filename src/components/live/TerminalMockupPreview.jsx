/**
 * A stylized stand-in for a real Pro Trader screenshot — not a genuine
 * capture of that product, since none exists in this codebase. Renders a
 * fake browser/app chrome around an abstract candlestick-and-line SVG so
 * the layout, framing, and fintech styling are all in place; swap the
 * `<svg>` block below for a real `<img>` of the client's actual Pro Trader
 * screenshots once they're supplied, and this component's chrome wrapper
 * can stay as-is.
 */
export default function TerminalMockupPreview({ large = false }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-hairline-strong/60 bg-void-deep/60 ${
        large ? "aspect-[16/10]" : "aspect-[16/9]"
      }`}
    >
      {/* fake window chrome */}
      <div className="flex items-center gap-1.5 border-b border-hairline bg-navy/60 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-crimson/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-cyan/60" />
        <span className="ml-3 rounded-md bg-void-deep/60 px-2.5 py-0.5 font-mono text-[10px] text-mist-dim">
          app.protrader.example
        </span>
      </div>

      {/* placeholder chart area */}
      <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mockup-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* faint grid */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1="0" x2="400" y1={i * 33 + 10} y2={i * 33 + 10} stroke="#ffffff" strokeOpacity="0.04" />
        ))}
        {/* fake line series */}
        <path
          d="M0,150 L20,140 L40,155 L60,120 L80,130 L100,95 L120,110 L140,80 L160,90 L180,60 L200,75 L220,55 L240,65 L260,40 L280,50 L300,35 L320,45 L340,25 L360,38 L380,20 L400,30"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.5"
        />
        <path
          d="M0,150 L20,140 L40,155 L60,120 L80,130 L100,95 L120,110 L140,80 L160,90 L180,60 L200,75 L220,55 L240,65 L260,40 L280,50 L300,35 L320,45 L340,25 L360,38 L380,20 L400,30 L400,200 L0,200 Z"
          fill="url(#mockup-fill)"
        />
        {/* fake candlesticks */}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 30 + i * 26;
          const up = i % 3 !== 0;
          const bodyTop = 120 - (i % 5) * 6;
          const bodyH = 14 + (i % 4) * 4;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={bodyTop - 8} y2={bodyTop + bodyH + 8} stroke={up ? "#00f0ff" : "#ff2a5f"} strokeOpacity="0.5" />
              <rect x={x - 3} y={bodyTop} width="6" height={bodyH} fill={up ? "#00f0ff" : "#ff2a5f"} fillOpacity="0.6" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
