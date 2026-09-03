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

- The practice-tier paper trading engine (`MarketProvider`) is in-memory only
  when unauthenticated — no persistence for anonymous visitors.
- Limit orders check fill eligibility once at submission time rather than
  resting in an order book until matched.
- Selling is long-only (no short positions) and clamps to what you actually
  hold.

---

## Phase 2 — accounts, payments, live data, video, broadcasts

Everything below is real, working code — not a mockup — but every integration
is **inert until you configure it**. With no environment variables set, the
app builds and runs exactly like v1: the paper-trading demo works, nothing
else is reachable, and no page crashes because a service isn't configured.
See `MERIDIAN_PHASE2_REPORT.md` for the product/architecture rationale behind
each piece, and the compliance note below before touching `PAYMENTS_LIVE_MODE`.

### Setup

1. **Copy the env template:** `cp .env.example .env.local` and fill in real
   values for whichever services you're turning on (see the comments in that
   file for where each key comes from — you don't need all of them at once).
2. **Create the database:** in your Supabase project's SQL Editor, run
   `supabase/migrations/0001_init.sql`. This creates every table (`profiles`,
   `wallets`, `positions`, `trades`, `promo_codes`, `promo_redemptions`,
   `deposits`, `broadcasts`), Row Level Security policies, the
   `STARTBOOST` promo code, and the signup trigger that provisions a
   profile + wallet for every new auth user.
3. **Grant an admin:** video-room hosting and trade broadcasting are
   admin-only. After your first signup, run this once in the SQL Editor:
   `update public.profiles set is_admin = true where email = 'you@example.com';`
4. **Enable OAuth providers** (optional): Google/Apple sign-in need to be
   turned on and configured in Supabase Dashboard → Authentication →
   Providers — that's Supabase/Google/Apple configuration, not code here.

### What each piece does

| Area | Key files |
|---|---|
| Auth | `src/lib/supabase/`, `middleware.js`, `src/app/login`, `src/app/signup`, `src/app/auth/callback` |
| Onboarding & promo codes | `src/app/onboarding`, `src/lib/promo/`, `src/app/api/promo/redeem` |
| Payments (Stripe) | `src/lib/stripe/`, `src/app/api/stripe/checkout`, `src/app/api/stripe/webhook` |
| Live market data (Polygon.io) | `src/lib/market/polygon.js`, `src/app/api/market/quotes`, `src/components/trading/LiveMarketsPanel.jsx` |
| Video consulting (Daily.co) | `src/lib/video/daily.js`, `src/app/api/video/rooms`, `src/app/api/video/join`, `src/components/video/` |
| Trade broadcasts (notify-only) | `src/app/api/broadcast`, `src/lib/notifications/useBroadcastFeed.js`, `src/components/notifications/BroadcastFeed.jsx` |

### ⚠️ Before setting `PAYMENTS_LIVE_MODE=true`

The Stripe webhook (`src/app/api/stripe/webhook/route.js`) records every
completed deposit for audit purposes regardless of this flag, but only
credits `wallets.live_balance_cents` — a real, spendable balance — when
`PAYMENTS_LIVE_MODE` is explicitly `"true"`. With it unset/false, deposits
run safely against Stripe in test mode with no real money ever becoming
spendable.

Turning it on makes this platform directly hold client funds, which
`MERIDIAN_PHASE2_REPORT.md` (Sections 3.4 and 5) recommends against — the
report's advice is to route real deposits through a licensed broker partner
instead, since self-custody requires $250,000+ in money-transmitter/
broker-dealer licensing. Don't flip this flag until that decision has
actually been made, ideally with legal input specific to your target
jurisdictions.

### Trade broadcasts are notify-only, on purpose

`src/app/api/broadcast/route.js` inserts a row that every signed-in client
sees in real time — it never places an order in anyone else's account. Per
EU ESMA guidance under MiFID II, automatically replicating a trade into
follower accounts is legally "portfolio management" and requires a license
this platform doesn't have; a notify-only alert does not trigger that
classification. If you ever want auto-replication, that's a legal
conversation before it's an engineering one — see
`MERIDIAN_PHASE2_REPORT.md` Section 3.3.
