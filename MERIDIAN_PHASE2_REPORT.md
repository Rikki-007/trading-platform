# Meridian — Phase 2 Report

**Project:** trading-platform ("Meridian")
**Report type:** Phase 2 feature scope, architecture, pricing, and stakeholder discovery
**Status:** v1 is shipped and demoable (paper trading only). Everything in Sections 3.2–3.4 below is **proposed, not built** — this report scopes it before any of it is coded.

---

## 1. Executive Summary & System Architecture

Meridian v1 is a Next.js 16 / React 19 app: Tailwind v4 for styling, Framer Motion for
animation, and a Three.js / React Three Fiber 3D background canvas with a custom GLSL
particle shader. That stack is unchanged and needs no rework for Phase 2 — the new
features layer on top of it.

Phase 2 proposes a **hybrid model**: the existing paper-trading demo, plus two new
pillars —

- **Live trade broadcasting** — subscribers get notified the instant an admin/expert
  executes a trade.
- **Video consulting rooms** — admin-hosted 1:1 or group video sessions.
- **A funded tier** — real deposits starting at **€250**, alongside the existing free
  $100k practice mode.

> **Read this before scoping anything below.** Adding real deposits and trade
> broadcasting doesn't just add features — it changes what kind of business this is.
> A demo app with fake money is software. A platform that takes real deposits and
> tells subscribers what trades to copy is a **financial service**, and in the EU
> specifically, copy-trading has an established regulatory classification (Section
> 3.3) that determines whether this needs a licensed authorization before launch —
> not after. Nothing below is a reason not to build this; it's the reason to sequence
> it correctly, which Section 7 lays out.

---

## 2. What's Actually Built Today (v1 — unchanged)

For reference, so this report stands alone:

- 3D background canvas (compass-ring instrument, particle field, scroll/cursor
  parallax) — done.
- Paper trading engine: 6 mock instruments, $100,000 mock starting balance, live
  order book, Market/Limit execution, portfolio + activity log — done.
- **Not built:** accounts/login, any data persistence, real market data, video, trade
  notifications, real money in any form.

---

## 3. Phase 2 — Proposed Feature Inventory

### 3.1 3D Background Canvas — *unchanged, already built*

No changes proposed here. Carries over as-is.

### 3.2 Video Call & Communication Suite — *proposed*

**What it is:** admin/expert-hosted video consultations (1:1) and/or live trading
rooms (group), plus a direct-message support channel.

**Architecture:** embed a hosted WebRTC provider rather than building signaling/TURN
infrastructure from scratch.

| Option | Fit |
|---|---|
| **Daily.co** | Simpler, flatter pricing (pure per-minute, no tiers to navigate); prebuilt embeddable UI components; fastest to ship a 1:1 or small-group room. |
| **Agora** | Stronger at very large scale / true one-to-many live-streaming; pricing is more tiered and requires picking a plan or credit pack. |

**Recommendation:** Daily.co for launch — the pricing model alone (flat per-minute,
free tier, no subscription commitment) removes a decision point, and its use case
(admin-to-client rooms, not mass live-streaming) fits Daily's strength.

**Messaging/support:** keep this a separate concern from video. Recommend building it
on Supabase Realtime (already the auth/database choice — see Section 5) rather than
adding a third vendor for chat.

**Scheduling:** 1:1 consultations need a booking flow (admin availability, client
picks a slot). This is its own subcomponent — a scheduling library or an embedded
tool (e.g. Cal.com) rather than something to hand-build.

### 3.3 Trade Broadcast Notification System — *proposed*

**What it is:** the instant an admin/expert executes a trade, subscribed users get an
alert — in-app and/or push.

**Architecture:** a websocket/realtime channel (Supabase Realtime again — same
infrastructure, no new vendor) for in-app alerts, plus a push layer (Web Push API for
browser notifications, or a service like OneSignal/Firebase Cloud Messaging if a
mobile app is ever in scope) for users not actively on the page.

> **This is the single most important compliance fork in the whole document.**
> EU regulators (ESMA, under MiFID II) have published explicit guidance on this
> exact feature: if the platform **automatically executes the trade into a
> follower's account**, that is legally "portfolio management" and requires MiFID
> authorization — full stop, regardless of how small the deposit. If instead the
> system **only notifies** the user and a person must manually decide to place their
> own order, it does **not** trigger that classification.
>
> **Recommendation:** build Phase 2 as notify-only, by design, not as a cost-cutting
> shortcut — auto-replication is a separate, later decision that needs its own legal
> engagement before a line of code is written for it.

### 3.4 Trading Dashboard & Capital Tiers — *proposed expansion*

- **Practice tier** — unchanged: $100,000 mock balance, no real money, no KYC.
- **Funded tier** — new: real deposits starting at **€250 minimum**.

The same custody principle from the original cost roadmap applies: **route funds
through a licensed broker partner** (Section 5) rather than holding client money
directly — self-custody requires money-transmitter/broker-dealer licensing running
into six figures, a licensed partner avoids that entirely.

Two things specific to this tier that don't apply to the practice tier:

- **KYC becomes mandatory the moment a real deposit is possible** — identity
  verification, not optional, not later.
- **The € currency signals EU/UK users**, which means the broker partner needs EU/UK
  regulatory coverage — a US-only partner (e.g. a US-only Alpaca account) isn't
  sufficient on its own. This is a partner-selection question, not just a technical
  integration question.
- Combined with 3.3: if funded-tier deposits are ever invested via automatic
  replication of the admin's trades, the MiFID portfolio-management trigger above
  applies directly to this tier's money. Notify-only avoids it; auto-replication
  does not.

### 3.5 Order Execution & Order Book — *unchanged for practice tier*

Already built and working for the mock/practice tier. For the funded tier, "order
execution" stops being an internal mock and becomes a real order routed to the
broker partner's API — this is new integration work, not a UI change; the
`OrderBook`/`TradeExecution` components' shape stays the same, what's behind them
changes.

---

## 4. Brand Identity & Trademark-Safe Names & Logos (Retained & Validated)

Carried over from the prior branding pass — still current.

| Name | Trademark Risk |
|---|---|
| Apex Meridian | None — extends the existing name |
| Voidpoint Capital | None — original, matches existing design tokens |
| Lodestar Exchange | None — real historical navigation term |

Names avoided: *GrandLine Capital*, *LogPose Financial*, *New World Capital*, *Pone
Markets* — all draw on specific One Piece terms/artifacts, not generic language.

**Logo shortlist:** The Anchor · The Pulse/Sonar Orb · The Chart + Starburst — all
original marks, zero trademark exposure.

---

## 5. Annual Pricing & Financial Infrastructure

| Service | Responsible For | Est. Cost / Year | Recommended |
|---|---|---|---|
| **Supabase** | User accounts, trade history, secure state management | $0–300+ (scales with users) | ✓ |
| **Polygon.io** | Unified stock/crypto/forex price feeds | $0–2,400 | ✓ |
| **Daily.co** (video) | Consultation & live trading rooms | $0–3,000+ (free to 10,000 participant-min/mo, then $0.004/min) | ✓ |
| Agora (video, alt.) | Same, larger-scale alternative | $0–3,000+ (tiered/subscription, from $45.99/mo) | |
| **Stripe** | Subscriptions and/or €250 deposit processing | No fixed fee — 2.9% + $0.30 per charge | ✓ |
| **Broker partner** (funded tier custody) | Actually holding & moving real client funds | Custom — request a quote once volume/jurisdiction is known | ✓ |
| Holding funds directly (not recommended) | Same, without a partner | $250,000+ in licensing before legally possible | |

*Estimates as of this session — confirm current vendor pricing before budgeting.*

**Recommendation & Solution:** Supabase + Polygon.io + Daily.co + Stripe covers
accounts, data, video, and subscription billing with zero licensing exposure on
their own. The only line item that turns into a business decision rather than a
vendor choice is the broker partner for the funded tier — get a quote *and* legal
input on EU/UK coverage before committing to one.

---

## 6. Updated Stakeholder Discovery Questionnaire

### 6.1 Trading Basics & Asset Classes

1. Which asset classes are in scope for the funded tier — stocks, crypto, forex?
2. Does the €250 minimum apply platform-wide, or only to specific asset classes/tiers?
3. Is €250 a one-time minimum to open the tier, or also a minimum for each top-up?
4. Are practice-tier users required to graduate through any step before the funded
   tier, or can they join the funded tier directly?

### 6.2 Video & Communication Rules

5. One-on-one consultations, group live-trading rooms, or both?
6. Who can host a room — only the admin/expert, or designated staff too?
7. Is scheduling self-serve (client books a slot) or admin-invited only?
8. Should sessions be recorded? If yes, who can access recordings, and for how long?

### 6.3 Trade Broadcast Notifications

9. Notify-only (user manually places their own order) or automatic replication into
   follower accounts? **This single answer determines whether MiFID portfolio-
   management authorization is required (Section 3.3) — treat it as a legal
   decision, not a product preference.**
10. Which channels — in-app, push, email, SMS, or a mix per user preference?
11. Does every trade get broadcast, or only ones the admin explicitly flags for
    sharing?
12. Do notifications include trade rationale/commentary, or just the raw fill data?

### 6.4 Look, Branding & Data Security

13. Confirm final naming: Apex Meridian, Voidpoint Capital, or Lodestar Exchange?
14. Confirm final logo direction: the anchor, the pulse/sonar orb, or the chart +
    starburst?
15. Since EU users are now explicitly in scope (the € deposit), GDPR applies — who
    is the data controller, and where is user data stored/processed?
16. Any additional jurisdictions beyond the EU/UK planned for the funded tier?

---

## 7. Recommended Build Sequence

1. **Accounts & persistence (Supabase)** — needed before anything else in this
   report, including the practice tier's own trade history.
2. **Real market data (Polygon.io)** — replaces the client-side random walk.
3. **Notify-only trade broadcasting** — in-app + push, built on Supabase Realtime;
   explicitly *not* auto-replicating trades.
4. **Video consulting (Daily.co)** — 1:1 rooms first, group rooms once 1:1 is
   validated.
5. **Funded tier (€250 minimum)** — only after a broker partner with EU/UK coverage
   is contracted, KYC is implemented, and legal has confirmed the notify-only
   broadcast design doesn't trigger portfolio-management authorization for the
   jurisdictions in scope.

Steps 1–4 are engineering-led. Step 5 is legal-led with engineering support — it
should not start until Section 6.3, Question 9 has a confirmed answer.

---

*Generated from the current codebase (v1, unchanged) plus the Phase 2 scope defined
in this session. Figures and regulatory notes are directional, sourced from public
vendor pricing and ESMA/MiFID II guidance as of this session — confirm before
committing budget or launch dates.*
