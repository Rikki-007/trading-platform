# Meridian — Final Pre-Meeting Report

**Prepared:** 2026-09-04 · **Repo:** [github.com/Rikki-007/trading-platform](https://github.com/Rikki-007/trading-platform) · **Companion doc:** `MERIDIAN_CLIENT_READY_AUDIT.md` (fuller build/cost breakdown — this report is the tighter, meeting-day version plus new broker/referral analysis)

---

## 1. Current Website Inventory (What's Built & Deployed)

| Feature | Status |
|---|---|
| Cinematic loading animation → **1.2s** top-to-bottom slide entrance (`easeInOut`) | ✅ Live |
| Hero branding ("Lodestar Meridian Exchange") with micro-parallax; wordmark is **locked/static**, not a nav link | ✅ Live |
| 4 water-glass 3D feature cards, cursor-tilt parallax | ✅ Live — see ⚠️ below |
| 4-tab top nav (Main Dashboard, Live Trading, Virtual Trading, Mentorship) + Sign-Up/Auth button with matching glass-pill styling | ✅ Live |
| Unified Virtual Trading page — $100,000 practice capital, instrument picker, order execution, fill history, top-up/reset control | ✅ Live |
| First-time tutorial modal — 1.2s scale/fade entrance, dismissible, shown once | ✅ Live |
| Three.js/R3F celestial background — scroll/cursor-reactive, subdued reactivity | ✅ Live |

**⚠️ One open item carried from the last audit:** the 4 feature cards are titled "Live Trading," "Training," "Call the Expert," and "Video Call" — not literally "Virtual Trading"/"Mentorship" as the nav now reads, and two pairs of cards route to the same destination. Cosmetic only (nothing is broken), but worth a copy pass before the client sees it live. See `MERIDIAN_CLIENT_READY_AUDIT.md` §1 for the full breakdown.

**Also already built, inert until configured** (full detail in the companion audit): Supabase auth/DB schema, Stripe checkout + webhook with the €250 minimum wired in, Polygon.io live-data panel, Daily.co video rooms, notify-only trade broadcasts, **and** a self-serve `STARTBOOST` promo code system — seeded in the database today, unlimited redemptions, credits practice-tier equity instantly with no manual review step. That last one is directly relevant to §2 and §3.4 below.

---

## 2. Broker Integration & Referral Analysis (TradeQuo & Jotform)

### What the client's message describes
Today, before Meridian, the client's workflow is stitched together from three separate external tools:

1. **TradeQuo** — a real-money broker, reached via an **affiliate/referral link**. Users register directly on TradeQuo's own site; the client earns a referral commission. Meridian has no relationship with TradeQuo today.
2. **Jotform** — an external form used to claim the `STARTBOOST` bonus. A user fills it out; presumably the client (or a Jotform automation) processes it manually or semi-manually.
3. **Pro Trader** — an external charting terminal used for real technical analysis, separate from anything Meridian renders.

### Finding: `STARTBOOST` already exists twice, doing two different things

This is the one piece of this analysis that isn't just a design decision — it's a live conflict:

- **The client's version:** Jotform intake → (manual/semi-manual) → bonus granted.
- **Meridian's version, already shipped:** `promo_codes`/`promo_redemptions` tables, seeded with `STARTBOOST` today, unlimited redemptions, self-serve via the onboarding flow, credits **$25,000 in practice-tier equity instantly**, with a unique-per-user constraint preventing double-claims — **zero manual review anywhere in the code path** (`src/lib/promo/redeemPromoCode.js`).

These are not the same system talking to each other — they're two independent implementations of the same promo code that will disagree the moment both are live. This has to be resolved explicitly in the meeting (see §3.4); it can't be deferred as a "figure it out later" detail.

### Integration target — recommendation per tool

| Tool | Absorb into our UI | Link out / embed | Recommendation |
|---|---|---|---|
| **TradeQuo** | Would require TradeQuo to expose a real API/white-label mode — unlikely for an affiliate-tier relationship, and a much bigger lift than referral marketing implies | Replace the Live Trading page's current placeholder notice with a real, working "Continue to TradeQuo" CTA carrying the affiliate link | **Link out.** Matches the client's actual commercial relationship with TradeQuo (referral commission, not custody) and ships in a day, not a quarter. Confirm with the client whether TradeQuo offers *any* embeddable/API option before ruling this out entirely |
| **Jotform (`STARTBOOST`)** | Our own system already does this — instantly, self-serve, fraud-resistant | Could keep Jotform as a front door and webhook its submissions into our system, but that adds engineering for no clear gain | **Absorb — retire Jotform for this flow.** Our built system is strictly more capable and is already deployed; the only reason to keep Jotform is if it's collecting something ours doesn't (e.g., marketing consent, KYC-adjacent fields) — ask |
| **Pro Trader** | Building a professional charting terminal (indicators, drawing tools, multi-timeframe) from scratch is a major build — comparable in scope to a TradingView clone | If Pro Trader offers an embeddable widget/iframe, embed it directly on Live Trading or Virtual Trading | **Confirm embeddability first.** If yes → embed (moderate effort, ships fast). If no → link out in a new tab as the near-term answer while a native charting build is scoped separately |

---

## 3. Comprehensive Client Meeting Question List

### 3.1 UI/UX & Art Direction
- Color scheme: keep the current dark navy/cyan/gold palette, or explore alternatives?
- Dark-mode only, or does a light-mode variant matter for this audience?
- Typography direction: lean further into clean/minimalist, or push toward a bolder, more "institutional trading desk" feel?
- Glow/lighting intensity on the 3D background and glass cards — current build was deliberately toned down from an earlier, more intense pass; confirm that's the right final level, not just a temporary compromise.
- Confirm final brand name (**Lodestar Meridian Exchange**, currently shipped) and logo direction, if either is still open.

### 3.2 Technical Video Call Architecture
- WebRTC provider: stay on **Daily.co** (already integrated — room creation, scoped tokens, embedded room UI all built) or evaluate **Agora** or **Twilio** instead? Switching providers means re-doing that integration layer, not a config change.
- Screen-sharing: needed at all, and if so, any participant-count or bandwidth limits to plan around?
- Recording: required? If yes — who can access recordings, how long are they retained, and does that trigger any consent/disclosure requirement?
- Room model: 1:1 expert consultations, group live-trading/coaching rooms, or both? *(Both are already built on the Mentorship page.)*
- Scheduling: self-serve booking (client picks a slot) or admin-invited only? *(Nothing scheduling-related exists yet — today's flow is "admin starts a room, shares the room name out of band.")*

### 3.3 Broker & Financial Compliance
- Do users register **directly on TradeQuo** via our affiliate link for real-money trading, or do they execute simulated trades on Meridian first, with a deliberate "graduate to live" handoff moment?
- If there's a handoff moment, what triggers it — a milestone in practice trading, a manual admin decision, or just a visible CTA available at any time?
- **Notify-only trade broadcasts, or automatic replication into follower accounts?** This single answer determines whether MiFID II portfolio-management authorization is required in the EU — a legal decision, not a product preference. *(Built today: notify-only.)*
- Does the €250 minimum deposit apply to TradeQuo's own onboarding, to a Meridian-side funded tier, or both — and is that even still the right number given TradeQuo is now in the picture as the actual execution venue?
- Who is the GDPR data controller once EU user data is genuinely in scope, and where is it stored/processed?

### 3.4 Bonus & Promo System
- **Should `STARTBOOST` credit mock balance instantly, or trigger manual admin review?** As-built today it's fully instant and automatic — if manual review is actually wanted, that's a real code change (adding an approval step and a pending state), not a toggle.
- Given the finding in §2 — do we retire the Jotform-based claim flow entirely and point users at the built-in, self-serve one, or does Jotform need to stay for a reason not yet visible from here (data collection, marketing opt-in, etc.)?
- Is `STARTBOOST` meant to stay unlimited/evergreen, or should it expire or cap at a redemption count? *(Currently seeded with no expiry and no redemption cap.)*
- Are more promo codes planned (different bonus amounts, tier grants), or is `STARTBOOST` the only one for now? *(The schema already supports multiple codes with independent bonus amounts, expiry, and tier grants — no engineering blocker either way.)*

---

## 4. Post-Meeting Roadmap & Next Goals

What ships immediately after client sign-off, in rough priority order:

- **Supabase — go live.** The schema, RLS policies, and auth flows are already written; this is standing up a real project, running the migration, and setting 3 env vars — not new engineering.
- **Polygon.io — go live.** Live-data panel is built; this is acquiring a real-time API key (the free tier is delayed data) and setting one env var.
- **Stripe — €250 deposits.** Checkout + webhook are built and the minimum is already wired in; this step is business-side verification (real Stripe account, live keys) plus the explicit legal sign-off required before `PAYMENTS_LIVE_MODE` can ever be set to `true`.
- **Video rooms — go live.** Daily.co integration is built; confirm in the meeting whether it stays Daily.co or moves to Agora/Twilio (§3.2) before spending the config effort twice.
- **TradeQuo referral CTA.** Replace the Live Trading page's "not yet connected" placeholder with a real, working affiliate link — low effort, high value, ships independently of everything else on this list.
- **Resolve the `STARTBOOST` conflict.** Implement whatever §3.4 decides (keep instant, add manual review, and/or retire Jotform) before both systems are simultaneously live and start disagreeing with each other.
- **Pro Trader embed feasibility spike.** Short technical investigation into whether Pro Trader offers an embeddable widget, to unblock the §2 recommendation either way.

---

*This report reflects the codebase as of commit `197b27f`. Regenerate after client sign-off once the open questions above have real answers, so the roadmap section stops being "what we'll do" and starts being "what we're doing."*
