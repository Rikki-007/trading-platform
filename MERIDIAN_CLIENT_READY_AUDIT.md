# Meridian — Client-Ready Audit

**Prepared:** 2026-09-04 · **Repo:** [github.com/Rikki-007/trading-platform](https://github.com/Rikki-007/trading-platform) · **Live branch:** `main` (auto-deploys to Vercel)

**Purpose:** a single, accurate reference for what exists in the codebase today, what
still has to happen before Meridian can take a real client's real money, and what
that's likely to cost — meant to be read before a client meeting, not during a
demo.

**How to read this doc:** Section 1 is what a visitor can already click through on
the live Vercel URL. Section 2 is graded by *code status*, not just "done/not
done" — most of Phase 2's backend is already written and shipped with the app,
just switched off until it has real credentials and a real business decision
behind it. That distinction matters: it's the difference between a feature
request and a config/legal task.

---

## 1. What's Already Built & Deployed (Current v1 Vercel Demo)

Everything below works right now, with zero environment configuration, on the
public URL.

| Area | What's live | Notes |
|---|---|---|
| **Loading & entrance** | Cinematic loading screen → 1.2s top-to-bottom slide reveal (`easeInOut`) into the home page | Choreographed via `AppReveal` context so the loader's exit and the hero's entrance cross-dissolve instead of cutting |
| **Hero branding** | "Lodestar Meridian Exchange" wordmark + tagline, subtle micro-parallax on scroll/cursor | Wordmark is intentionally **static** — not a nav link — per the latest navbar cleanup |
| **4 feature cards** | Water-glass glassmorphic cards with cursor-tilt parallax (3D tilt + cursor-tracking glow) | See ⚠️ finding below — card titles/copy don't 1:1 match current nav taxonomy |
| **Top navigation** | 4-tab bar — Main Dashboard, Live Trading, Virtual Trading, Mentorship — plus a Sign-Up/Auth trigger styled with identical button DNA (same glass-pill, same `text-sm`/padding/hover treatment) | "Main Dashboard" now points at `/` itself — the hero + 4 cards *is* the dashboard, no separate page |
| **Auth UI** | Glassmorphic `AuthModal` (login/signup, mode-switch in place, OAuth buttons for Google/Apple, email/password) | Fully styled; **inert** until Supabase env vars are set (see §2) — falls back to a clear "accounts aren't configured yet" message |
| **Virtual Trading** | Unified page: instrument picker, order book, order execution, portfolio summary, fill history, all against a **$100,000** simulated starting balance | Includes a working **top-up/reset balance** control (confirm-gated, instant, client-side) |
| **First-time tutorial modal** | 3-point walkthrough, 1.2s scale/fade entrance, dismissible (backdrop/✕/Escape), shown once via `localStorage` | Mounts on Virtual Trading only |
| **Live Trading page** | Honest placeholder: live-data panel (inert without a Polygon key) + an explicit "broker execution not yet connected" notice | Does **not** claim to execute real trades |
| **Mentorship page** | Consultation + coaching-room UI (Daily.co panel) + trade-broadcast feed | Fully styled; inert until Daily.co + Supabase are configured |
| **3D background** | React Three Fiber celestial/compass canvas, scroll- and cursor-reactive, camera parallax + compass tilt tuned to a moderate, non-distracting range | Tuned down from an earlier, more aggressive pass per explicit feedback |
| **Profile/wallet dropdown** | Signed-in state shows wallet balance, cash available, last 3 trades, sign-out | Reads from client-side state today — becomes real, persistent account data once Supabase is wired up |

### ⚠️ Audit finding — feature-card copy vs. nav taxonomy

The 4 home cards were built and explicitly "locked" (design approved) before the
nav was renamed twice since. As shipped today:

| Card title | Routes to | Collides with |
|---|---|---|
| "Live Trading" | `/virtual-trading` (**paper** trading) | The nav tab literally named "Live Trading" goes to `/live-trading` (real data) — same words, different destinations |
| "Training" | `/virtual-trading` | Duplicate destination with the card above |
| "Call the Expert" | `/mentorship` | Duplicate destination with the card below |
| "Video Call" | `/mentorship` | Duplicate destination with the card above |

Nothing is broken — every link resolves correctly — but a first-time visitor
reading "Live Trading" on a card and landing on the paper-trading page is a real
point of confusion worth a copy pass before a client demo. Flagging it here
rather than changing it unilaterally, since the card copy has been treated as
locked/approved in prior rounds.

---

## 2. What's Missing / Needed for Full Production (Phase 2)

**Important context this section leads with:** the backend code for four of the
five Phase 2 systems already exists in this repo and ships with every deploy —
Postgres schema, API routes, webhook handlers, and client SDKs are all written.
What's actually missing is *credentials, a live vendor account, and — for two of
these — a legal/compliance decision*, not new engineering. The table below is
graded honestly on that basis.

| System | Code status | What's actually missing | Est. effort to activate |
|---|---|---|---|
| **Database & Auth** (Supabase) | ✅ Full schema shipped — `profiles`, `wallets`, `positions`, `trades`, `promo_codes`, `promo_redemptions`, `deposits`, `broadcasts` (`supabase/migrations/0001_init.sql`, 220 lines); browser/server/admin clients wired; RLS + a privilege-escalation-blocking trigger already in place | A real Supabase project, running the migration against it, and 3 env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) | **Low** — config only, ~1 day incl. testing |
| **Live Market Data** (Polygon.io) | ✅ REST snapshot integration built (`src/lib/market/polygon.js`), live panel on the Live Trading page, explicit "not connected" fallback state | A Polygon.io API key (`POLYGON_API_KEY`) — free tier is delayed data; a paid plan is needed for real-time | **Low** — config only, ~1 day |
| **Payments & Deposits** (Stripe) | ✅ Checkout session + signature-verified webhook built (`src/app/api/stripe/checkout`, `.../webhook`); €250 minimum deposit constant already wired (`NEXT_PUBLIC_MIN_DEPOSIT_CENTS=25000`) | A real (not test-mode) Stripe account, business verification, live keys, webhook endpoint registered in the Stripe dashboard — **and see the compliance gate below** | **Medium** — mostly Stripe-side verification, not code |
| **Video Consulting** (Daily.co) | ✅ Room creation + scoped meeting tokens, admin start-room / participant join-by-name UI, embedded video room component | A Daily.co account, domain, and API key | **Low** — config only, ~1 day |
| **Real-money broker execution** | ❌ **Not built.** Live Trading explicitly shows "broker execution not yet connected" rather than faking it | A licensed broker-partner API integration (e.g. Alpaca, Interactive Brokers, DriveWealth, or a white-label provider), KYC flow, and jurisdiction-specific compliance sign-off | **High** — this is a business/legal engagement first, engineering second |

### The one gate that isn't just a config value

`src/lib/stripe/config.js` defines `PAYMENTS_LIVE_MODE` — a flag, separate from
Stripe's own test/live key pair, that decides whether a completed deposit
actually credits a real ledger balance (`wallets.live_balance_cents`). It
defaults to `false` and is **deliberately** not something to flip casually: doing
so makes this platform directly hold client funds, which requires either
$250,000+ in money-transmitter/broker-dealer licensing to do legally on your own,
or routing deposits through an already-licensed broker partner instead. Do not
set it to `true` until a broker partner is contracted for the relevant
jurisdictions **and** legal has signed off specifically on this deposit flow.

---

## 3. Production Cost & Pricing Breakdown (Annual Estimates)

*Figures below are directional, sourced from public vendor pricing as of this
session — confirm current rates before budgeting or quoting a client.*

| Service | Responsible for | Est. cost / year | Notes |
|---|---|---|---|
| **Vercel** (hosting) | Deployment, CDN, serverless functions | **$0** (Hobby) or **$240** (Pro, $20/mo) | ⚠️ **Vercel's Hobby tier prohibits commercial use in its ToS.** Since Meridian is a fee/deposit-taking product, budget for **Pro at minimum** before any real client traffic — this isn't optional scaling headroom, it's a terms-of-service requirement |
| **Supabase** (DB + auth) | User accounts, trade history, wallet balances | **$0 – $300+** | Free tier covers early testing; Pro ($25/mo = $300/yr) once there's real user volume or the project needs to stay warm (free-tier projects pause after inactivity) |
| **Polygon.io** (market data) | Real-time stock/crypto/forex feeds | **$0 – $2,400** | Free tier = delayed data only; real-time, multi-asset-class plans scale from roughly $200/mo upward depending on how many asset classes and how much call volume |
| **Stripe** (payments) | €250 deposit processing, subscriptions | **No fixed fee** — 2.9% + $0.30 per transaction | Scales with revenue, not a budget line item — model this as a % of deposit volume, not a flat annual cost |
| **Daily.co** (video) | 1:1 consultations, live coaching rooms | **$0 – $3,000+** | Free up to 10,000 participant-minutes/mo, then ~$0.004/min beyond that. Agora is a comparable alternative from ~$45.99/mo if Daily.co's pricing shape doesn't fit |
| **Broker partner** (funded-tier custody) | Actually holding/moving real client funds | **Custom quote** | The single biggest unknown in this whole budget — get a quote once expected volume and target jurisdictions (EU/UK vs. wider) are confirmed. This is a business relationship, not a SaaS subscription |
| Self-custody (not recommended) | Same, without a partner | **$250,000+** in licensing before it's legally possible | Listed for contrast only — see the compliance gate in §2 |

### Rough all-in range

Excluding Stripe's per-transaction cut and the broker partner's custom fee (both
volume-dependent, not fixed line items): **roughly $0/yr** to bootstrap and
demo on free tiers, up to **roughly $6,000/yr** for Vercel Pro + Supabase Pro +
a mid-tier real-time Polygon plan + moderate Daily.co video volume. That range
does **not** include payment-processing fees or a broker-partner contract —
budget those separately once volume is known.

---

## 4. Client Meeting Cheat Sheet

Organized by topic. Each question is paired with what's already decided/built,
so it's clear which answers change code vs. which just confirm current defaults.

### 4.1 Asset classes & the practice tier
- Which asset classes are actually in scope for the **funded** tier — stocks,
  crypto, forex, or all three? *(Practice tier already supports a fictional
  multi-instrument set today — this question is about the real-money tier.)*
- Should practice-tier users be required to "graduate" through any milestone
  before the funded tier unlocks, or can they go straight to funding an account?

### 4.2 The €250 minimum deposit
- Does €250 apply platform-wide, or only to specific asset classes/tiers?
  *(Currently wired as one global constant — `NEXT_PUBLIC_MIN_DEPOSIT_CENTS`.)*
- Is it a one-time minimum to open the funded tier, or also a minimum for every
  subsequent top-up?
- Confirm currency handling: is €250 literal (EUR), or should it convert per the
  user's region? *(Everything client-facing today is priced/formatted in USD —
  this is a real decision, not just a label swap, if EUR is the actual intent.)*

### 4.3 Video consulting workflow
- 1:1 consultations, group live-trading/coaching rooms, or both? *(Both are
  already built — Mentorship page supports both room kinds.)*
- Who can host a room — only a designated admin, or other staff too?
- Self-serve booking (client picks a slot) or admin-invited only? *(Nothing
  scheduling-related is built yet — today's flow is "admin starts a room, shares
  the room name out of band.")*
- Should sessions be recorded? If so, who can access recordings, and for how
  long?

### 4.4 Compliance & broker partnership — the critical path
- **Notify-only trade broadcasts, or automatic replication into follower
  accounts?** This single answer determines whether MiFID II
  portfolio-management authorization is required in the EU — treat it as a
  legal decision, not a product preference. *(Built today: notify-only. Nothing
  auto-replicates a trade into anyone else's account.)*
- Which broker partner (or shortlist) is being evaluated for real-money
  execution, and which jurisdictions do they cover?
- Who is the data controller for GDPR purposes, given EU users are explicitly
  in scope via the € deposit, and where will user data be stored/processed?
- Any jurisdictions beyond EU/UK planned for the funded tier?

### 4.5 Brand & naming — confirm before the next round of client-facing material
- Final name: **Lodestar Meridian Exchange** (currently shipped) vs. any other
  shortlisted name from earlier rounds.
- Final logo direction, if not already locked.

---

## 5. Appendix

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 ·
Framer Motion · React Three Fiber/drei/three.js · Supabase · Stripe · Polygon.io
· Daily.co

**Recent build history** (`git log --oneline`, newest first):
```
36634c4 Unify navbar button styling, consolidate dashboard into the home route
0f4b225 Redesign auth UI as glassmorphic modal, clean up navbar
6956432 Restructure to strict 5-tab nav, unify Virtual Trading, add profile dropdown
92f5dd1 Restructure nav, unify practice-trading module, add first-time intro modal
9abc3c7 Relocate practice capital to /training, refine entrance transition, subdue 3D reactivity
5cca069 feat: multi-page routing, choreographed loading transition, 3D reactivity
c5ee411 feat: landing page redesign — cinematic loader, hero rebrand, glass feature cards
dc7e9e5 feat: Phase 2 — accounts, payments, live data, video, trade broadcasts
7f92c5c feat: complete initial setup of trading platform with 3D canvas and paper trading
```

**Where each Phase 2 integration lives in the codebase**, for a follow-up
engineering scoping session:
- Supabase: `src/lib/supabase/`, `supabase/migrations/0001_init.sql`
- Stripe: `src/lib/stripe/`, `src/app/api/stripe/`
- Polygon.io: `src/lib/market/polygon.js`, `useLiveQuotes.js`
- Daily.co: `src/lib/video/daily.js`, `src/app/api/video/`
- Trade broadcasts: `src/app/api/broadcast/`, `src/lib/notifications/`
- Full env var reference: `.env.example` (every integration documented with the
  exact variable names needed to switch it on)

**Related documents already in this repo:** `MERIDIAN_PHASE2_REPORT.md` (the
earlier proposal this audit supersedes for anything now actually built) and
`Meridian — Client Discovery & Requirements.docx`.

---

*This audit reflects the codebase as of commit `36634c4`. Regenerate or update
it after any change that adds/removes a major feature or shifts a Phase 2
system's status, so it stays trustworthy as a pre-meeting reference.*
