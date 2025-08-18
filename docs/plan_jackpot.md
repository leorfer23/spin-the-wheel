## Jackpot Product Delivery Plan

### Purpose

Create a modular, customizable 3‑reel jackpot product that mirrors the quality and composability of the Wheel, integrates into the dashboard and widget, and supports Tienda Nube coupons, analytics, and scheduling. This plan is developer‑ready with milestones, tasks, and acceptance criteria.

### References

- Core principles and constraints: `CLAUDE.md`
- Product scaffolding guide: `docs/ADDING_A_NEW_PRODUCT.md`
- Existing scaffold to leverage:
  - `src/components/dashboard/products/jackpot/` (types, config, sections, selector)
  - `src/stores/jackpotStore.ts`
  - `src/services/jackpotService.ts`
  - `test/jackpot/` prototypes (`JackpotMachine.tsx`, `Reel.tsx`, etc.)

### Goals

- Beautiful, tactile handle interaction that starts a smooth 3‑reel spin
- Configurable symbols and weighted probabilities per reel
- Payout mapping from symbol patterns to reward tiers
- Cohesive theming, effects, and sound design
- Works in dashboard preview and embeddable widget
- Analytics and Tienda Nube coupon issuance on wins

### Non‑Goals (for v1)

- N‑reel support beyond 3 (design for extension)
- Progressive jackpots and multi‑spin narratives
- Server‑authoritative outcomes (client RNG + analytics; can add server auth later)

### Success Criteria

- TypeScript: zero errors; ESLint clean
- All new files < 300 lines and follow clean‑code standards
- Dashboard: create/select/edit jackpot; live preview spins; settings persist
- Widget: embeddable, performant on mid‑range mobile
- Analytics: complete spin lifecycle events with `spinId`
- Coupons: successful issuance or graceful fallback with idempotency

---

## Architecture Overview

### Config Slices (data model)

- Symbols/strips (per reel)
  - reels: [{ id, symbols: SymbolId[], weights: Record<SymbolId, number>, visibleWindow: 3, stopMode: "index" | "symbol" }]
- Payouts
  - rules: [{ id, pattern: [SymbolId, SymbolId, SymbolId], rewardTierId, nearMiss?: boolean }]
- Appearance/theme
  - machineFrame, reelMask, symbolStyle, lights, glow, shadow, background, designThemeId
- Handle/interaction
  - style (shape, size, color), behavior (pull distance threshold, elasticity, haptics), cta text
- Sounds
  - handlePull, reelTick, reelStop, winFanfare, nearMiss; volumes
- Shared (reuse from Wheel)
  - widgetConfig, captureConfig, scheduleConfig
- Rewards
  - tiers: [{ id, name, description, couponConfig }]

### Runtime (gameplay)

- State machine: Idle → HandlePulling → Spinning → Reel1Stopped → Reel2Stopped → Reel3Stopped → ResultReveal → Reset
- RNG: crypto‑based seed per spin; reproducible outcome with `spinId`
- Outcome pipeline: resolve win tier → choose pattern → align reel stops → animate
- Performance: GPU transforms; virtualized reel lists; debounced updates

### Key Components (runtime)

- `JackpotMachine` (composition and state machine)
- `Reel` (looping strip, precise stop alignment, tick events)
- `Symbol` (visual asset rendering)
- `Handle` (drag/pull interaction, keyboard activation)
- `LightsMarquee` (reactive lights tied to phases)
- `WinOverlay` (result presentation, confetti)
- `SoundController` (SFX cues by phase)

### Dashboard UI (reuse where possible)

- Tabs (extend `jackpotConfigConstants.ts` as needed): Symbols, Payouts, Appearance, Handle, Capture, Schedule, Embed
- Sections (existing and new):
  - Symbols (reels + weights) — may extend `sections/SegmentsSection.tsx` or create `SymbolsSection.tsx`
  - Payouts — rule builder UI
  - Appearance — reuse Wheel appearance inputs plus jackpot‑specific
  - Handle — reuse Wheel HandleSection with jackpot props

### Services & Storage

- Start with in‑memory in `src/services/jackpotService.ts`; then switch to Supabase
- Supabase schema mirrors `wheels` with JSONB per config slice and RLS

### Analytics

- Events: `jackpot_impression`, `jackpot_handle_pull`, `jackpot_spin_start`, `jackpot_reel_stop`, `jackpot_result`, `jackpot_coupon_issued`, `jackpot_error`
- Payload includes `spinId`, `rngSeed`, storeId, jackpotId, reelIndex, stopIndex, symbolIds, result

---

## Milestones, Deliverables, and Acceptance Criteria

### M0 — Foundations & UX Spec (0.5–1 day)

- Deliverables
  - Finalize UX flows, motion timings, and Spanish copy
  - Confirm config slice shapes; update `src/components/dashboard/products/jackpot/types.ts` if needed
- Acceptance
  - Align with `CLAUDE.md` principles
  - Clear motion spec for handle and reels

### M1 — Runtime MVP (gameplay core) (2–3 days)

- Deliverables
  - `src/components/jackpot/JackpotMachine.tsx`
  - `src/components/jackpot/Reel.tsx`
  - `src/components/jackpot/Handle.tsx`
  - `src/components/jackpot/Symbol.tsx`
  - Integrate prototypes from `test/jackpot/` where useful
- Acceptance
  - Pull handle (mouse/touch/keyboard) starts spin
  - Three reels spin with stagger, stop precisely at computed indices
  - Deterministic outcome from seed; events emitted for analytics
  - Reduced‑motion respected

### M2 — Dashboard Configuration (2–3 days)

- Deliverables
  - Symbols editor: reels manager, strip order DnD, weight sliders
  - Payouts editor: pattern → reward tier table with validation
  - Appearance and Handle sections wired; live preview via `JackpotMachine`
  - Extend `jackpotStore` actions: `updateSymbols`, `updatePayouts`, `updateAppearance`, `updateHandle`, `updateWidgetConfig`, `updateSchedule`
- Acceptance
  - Create/select jackpot; edits persist (in‑memory service ok)
  - Invalid patterns flagged (e.g., symbol not on reel)
  - Files < 300 lines; zero TS errors

### M3 — Supabase Schema & Service (1–2 days)

- Deliverables
  - Migration `supabase/migrations/011_jackpots_schema.sql`
  - Service methods in `src/services/jackpotService.ts` backed by Supabase
  - RLS policies mirroring `wheels`; index on `tiendanube_store_id`
- Acceptance
  - CRUD works; dashboard loads/saves from DB using `tiendanube_store_id`
  - Auth and RLS verified via dev flows

### M4 — Widget Integration (1–2 days)

- Deliverables
  - `src/widget/JackpotWidget.tsx` using shared config slices
  - Embed examples in `public/` (reuse wheel test pages pattern)
  - Connect `widgetAnalyticsService`
- Acceptance
  - Widget spins smoothly on mobile; analytics events appear

### M5 — Coupons & Rewards (1 day)

- Deliverables
  - Reward tiers mapped to `services/integrations/tiendanube/couponsService.ts`
  - Idempotent issuance by `spinId`; graceful fallback messaging
- Acceptance
  - Successful coupon creation on wins; error path covered

### M6 — QA, Perf, A11y, Tests (1–2 days)

- Deliverables
  - Unit tests: RNG/weights/pattern resolution/stop alignment
  - Component tests: handle threshold, reduced motion, reel stop precision
  - Integration tests: coupon issuance + analytics
  - Performance tune: virtualized reels; audio sprites; effect toggles
- Acceptance
  - 60fps target on mid‑range devices; Lighthouse a11y ≥ 90 for widget view
  - Test suite green; lint clean

---

## Work Breakdown by Area

### Runtime Components (new in `src/components/jackpot/`)

- `JackpotMachine.tsx`
  - Compose frame, three `Reel`s, `Handle`, `LightsMarquee`, `WinOverlay`
  - Own state machine; orchestrate spin timings and result reveal
- `Reel.tsx`
  - Looping transform animation; tick sound per symbol crossing
  - Precise stop alignment with easing and optional overshoot
- `Handle.tsx`
  - Drag distance threshold; elastic feedback; keyboard support
- `Symbol.tsx`
  - Render emoji/SVG/sprite; theme‑driven styles
- `LightsMarquee.tsx` and `WinOverlay.tsx`
  - Reactive lights; confetti on significant wins only
- `SoundController.tsx`
  - Centralize SFX cues and volume preferences

### Dashboard (extend existing jackpot scaffold)

- `sections/SegmentsSection.tsx` → extend to support per‑reel strips & weights (or create `SymbolsSection.tsx` and wire tabs)
- `sections/PayoutsSection.tsx` → add rule builder, validation, tier mapping
- `jackpotConfigConstants.ts` → ensure tabs: Symbols, Payouts, Appearance, Handle, Capture, Schedule, Embed
- `JackpotConfiguration.tsx` → preview hooks and props wiring to runtime component

### Store & Service

- `src/stores/jackpotStore.ts`
  - Add/verify actions: load/create/select/update for all slices
  - Derived selectors: `hasJackpotSelected`, `activeConfigSection`
- `src/services/jackpotService.ts`
  - Phase 1: in‑memory; Phase 2: Supabase (mirror `wheelService` contract)

### Supabase Schema (new)

- `spinawheel.jackpots` table
  - Columns: `id` uuid pk, `tiendanube_store_id` text, `name` text, `is_active` boolean
  - JSONB columns: `symbols_config`, `payouts_config`, `appearance_config`, `handle_config`, `widget_config`, `schedule_config`, `rewards_config`
  - Index: (`tiendanube_store_id`)
  - RLS and permissions mirroring `wheels`

### Analytics

- Implement event emission at state transitions and reel stops
- Include correlation fields: `spinId`, `rngSeed`, storeId, jackpotId

### Accessibility & UX

- Keyboard: Enter/Space to pull; ARIA roles for handle and status
- Live region to announce results; focus retention during spin
- Respect `prefers-reduced-motion` for spin duration and effects

---

## Validation & Guardrails

- Weight normalization per reel; reject negative/NaN weights
- Patterns validated against configured reel strips
- Prevent accidental wins on loss outcomes unless near‑miss enabled
- Idempotent coupon issuance keyed by `spinId`

---

## Deliverable Checklist (per milestone)

- M1 Runtime
  - [ ] Handle pull starts spin (mouse/touch/keyboard)
  - [ ] 3 reels spin with stagger and stop precisely
  - [ ] Deterministic outcome from seed; analytics events emitted
  - [ ] Reduced motion supported
- M2 Dashboard
  - [ ] Reels and weights editable; strips reorderable
  - [ ] Patterns → reward tiers mapping with validation
  - [ ] Appearance and handle settings update preview
  - [ ] Persist via service
- M3 Supabase
  - [ ] Migration applied; RLS working; index present
  - [ ] Service reads/writes using `tiendanube_store_id`
- M4 Widget
  - [ ] Widget spins on mobile; analytics recorded
  - [ ] Example embed pages available
- M5 Coupons
  - [ ] Coupons issued on win; fallback on errors
- M6 QA & Tests
  - [ ] Unit, component, integration tests green
  - [ ] Perf targets met; a11y checks pass

---

## Risks & Mitigations

- Performance on low‑end devices → virtualize reels, cap effects, reduce blur
- Conflicting weights/payouts → strong validators and inline error UI
- Coupon service failures → retries with backoff; user messaging; idempotency
- Complexity drift → enforce file size limit and focused components

---

## Open Decisions

- Keep `SegmentsSection.tsx` vs. rename to `SymbolsSection.tsx` for clarity
- Default symbol asset set (emoji vs. SVG pack) for v1
- Near‑miss feature default off/on

---

## Implementation Order (Developer‑friendly Sequence)

1. Wire runtime MVP from `test/jackpot` into `src/components/jackpot/*`
2. Integrate runtime into `JackpotConfiguration` preview
3. Build Symbols editor (reels + weights) and connect to store
4. Build Payouts editor and validators
5. Wire Appearance and Handle sections; polish handle interaction
6. Switch service to Supabase; add migration and RLS
7. Implement widget variant; add analytics
8. Add coupon issuance flow; finalize win overlay
9. QA: tests, perf, a11y; finalize Spanish copy

---

## Definition of Done

- All acceptance criteria satisfied and checklists complete
- Zero TypeScript and ESLint errors
- Files remain < 300 lines and readable
- Documentation updated (this plan and any relevant dev notes)
