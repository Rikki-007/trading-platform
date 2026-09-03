# Meridian — Paper Trading Terminal

A simulated (paper) trading dashboard with a scroll- and cursor-reactive 3D
background: a navigation-instrument motif (rings + a pulsing core, evoking a
compass/log rather than any literal grid or logo) drifting in a deep-void
particle field that shifts color depth as you scroll — from a cyan-teal
"shallows" tone at the top, through a deep navy void, to a warm gold
"treasure" tone near the bottom.

No real money, no real brokerage connection — everything trades against a
simulated, randomly-walking market so the UI and UX can be iterated on
without any of the licensing/compliance weight a real-money platform carries.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** (CSS-first `@theme` tokens — see `src/app/globals.css`)
- **Framer Motion** for UI transitions, staggered entrances, and micro-interactions
- **React Three Fiber + drei + three.js** for the 3D background, with a hand-written GLSL point shader for the particle field
- **Lucide React** for icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Structure

```
src/
├── app/
│   ├── layout.js         — fonts (Geist, Cinzel for the wordmark), metadata
│   ├── page.js            — orchestrates layout + all sections
│   └── globals.css        — design tokens (color, font, keyframes) as Tailwind v4 @theme
├── components/
│   ├── canvas/
│   │   ├── OnePieceTradingCanvas.jsx  — Canvas wrapper, scene composition, depth fog
│   │   ├── CompassRig.jsx             — the rotating ring instrument + pulsing core
│   │   ├── VoidField.jsx              — custom-shader particle field
│   │   └── CameraRig.jsx              — cursor-parallax + scroll-driven camera movement
│   ├── layout/
│   │   ├── Navbar.jsx, Sidebar.jsx, Footer.jsx  — glassmorphic chrome
│   └── trading/
│       ├── PortfolioSummary.jsx   — equity/cash/holdings + equity sparkline
│       ├── Watchlist.jsx          — instrument grid, click to select
│       ├── PriceChart.jsx         — larger chart for the selected instrument
│       ├── OrderBook.jsx          — live bid/ask depth ladder
│       ├── TradeExecution.jsx     — buy/sell form with instant feedback
│       ├── ActivityLog.jsx        — recent fills
│       ├── AnimatedNumber.jsx     — spring-tweened numeric readout
│       └── Sparkline.jsx          — minimal axis-less line/area chart (no charting lib)
└── lib/
    ├── market.js           — pure helpers: instruments, price stepping, order book synthesis, formatting
    └── MarketProvider.jsx  — the "backend": ticking prices, cash/positions, trade execution, equity history
```

## How the mock market works

`MarketProvider` owns everything trading-related: it ticks every instrument's
price on an interval, tracks cash/positions/trade history, and exposes
`executeTrade({ symbol, side, qty })`. There's no server — it's an in-memory
simulation that resets on page reload, which is the right tradeoff for
iterating on product/UX before any real backend or brokerage integration
exists.

**A note on hydration:** anything that calls `Math.random()` (price ticks,
the order book) is carefully kept out of the first render. State starts
pinned to a deterministic value, and the random values are only computed
inside a `useEffect` — which never runs during server rendering. That's what
keeps the server-rendered HTML and the client's first paint identical, and
avoids React hydration mismatches on a page that's inherently full of live,
random data.

## Known simplifications (by design, for a v1)

- Portfolio state is in-memory only — no persistence, no auth, no backend.
- Limit orders check fill eligibility once at submission time rather than
  resting in an order book until matched.
- Selling is long-only (no short positions) and clamps to what you actually
  hold.
