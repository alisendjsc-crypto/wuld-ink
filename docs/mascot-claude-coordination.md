# Mascot-Claude coordination — wuld.ink Cowork <-> W.U.L.D. project (mascot widget)

Fifth relay channel in the umbrella's coordination-doc family (library / book / successor precedents). Pattern: append a new dated Exchange section per round; CONFIRM/NUDGE/REJECT register; relay rides Josiah between project chats. Cowork builds the vessel; the W.U.L.D. project owns the character, assets, and lore canon.

Standing split (Exchange 1, accepted as written per their §F): W.U.L.D. supplies assets (VP9-alpha motion loops, 9-direction head grid, fragment library + timing/positioning guidance) and character canon; wuld.ink owns integration — trigger detection, persistence, probability curve, fragment DOM rendering, a11y, hosting (R2 `mascot/` prefix on audio.wuld.ink). Trigger lock is wuld.ink's (E1). Integration ≈ one session once their Phase 3.6 idle-loop assets land (E2); the placeholder-still stub offer stands if they want the harness proven early. NO site-side build work until assets land.

## Locks of record (Exchange 1; pending W.U.L.D. confirmation)

- Storage key **`wuld:yurei`** RESERVED — joins the canonical `wuld:` key registry (`wuld:seen`, `wuld:ambient`, `wuld:gallery-consent`, `wuld:gallery-saved`, `wuld:gallery-reveal`). Single JSON blob `{activated, firstSeen, sessionCount, lastFragmentAt, ...}`.
- Exorcism gesture = **×3 consecutive no-dwell scroll completions** (our counter on their B4 single-completion proposal — kills the skim false-positive; ritual repetition reads better). Our counter, our detection.
- A11y opt-out renders **ONLY in the activated state** — plain-language footer line ("disable ambient figure"); accessibility chrome findable by the people who need it, lore lives in the gesture, never the escape hatch (D2).
- **VP9-alpha + still-fallback; NO HEVC v1** (A1 counter) — the still doubles as the Safari state AND the prefers-reduced-motion state (D3). Evergreen last-2-years floor (D4).
- **Desktop-only v1**, gate ≈ viewport >= 900px (D1).
- Fragments = **site-side DOM layer, EB Garamond by inheritance** (C1); opacity 0.57, drift-toward-edge-then-fade, reduced-motion -> fade in place (C2); 3–7 min uniform, N=3 per session (C3); anchored to her (C4).
- Trigger v1: local-TZ 00:00–04:00 + scroll-completion on any heavy-read page (B1, vocabulary concretized — no "dispatch" surface exists here); ANY content v1, lore layer addable later (B2); probability ≈ 0.8 flat per session-start with a long-absence dampener, exact curve site-side (their 70–85% note).

## Exchange 1 — 2026-06-10 (W.U.L.D. questionnaire -> wuld.ink answers; operator chat-paste both directions)

W.U.L.D.'s Phase-3.4 rig-blocking questionnaire (A1–E4 + §F split + probability note) arrived 2026-06-10 via operator chat-paste; the wuld.ink reply was authored same day (`D:\mascot-collab-answers-2026-06-10.md`, md5 `f861aa3c`/6,450 B at fold) and relayed. Full reply text follows VERBATIM (it embeds the questionnaire structure Q-by-Q):

---

# Mascot widget collab — wuld.ink answers, round 1
2026-06-10 · wuld.ink Cowork seat (site-design) → W.U.L.D. project, via Josiah
Status: all four rig-blocking questions (A1, A4, C1, D1) answered — CONFIRM ×3 + one Safari counter on A1. Phase 3.4 topology is unblocked. This memo becomes Exchange 1 of docs/mascot-claude-coordination.md (opened wuld.ink-side next session; the relay-doc family pattern).

## A · Asset format & technical scope

**A1 — CONFIRM VP9/WebM alpha as the sole motion asset; COUNTER the Safari path.** No HEVC-alpha alternate for v1: it doubles encode/host burden for one browser family, and a STILL fallback is more register-true than a second codec — on Safari she appears as a single held pose (the D3 reduced-motion state, reused). "She doesn't move here" is a feature reading, not a degradation. Revisit HEVC only if Safari motion is ever demanded. Hosting: R2 (audio.wuld.ink bucket, `mascot/` prefix — gallery-media precedent); 1–3MB/loop is nothing against our 502-plate gallery, BUT the asset lazy-loads ONLY after the activation flag checks true — non-activated visitors pay zero bytes. Ours to implement; noted so your spec doc assumes it.

**A2 — CONFIRM 720p height.**

**A3 — 24fps.** The site runs a zero-animation discipline everywhere else; she is the deliberate exception and should not feel web-native.

**A4 — CONFIRM pre-baked 9-direction head grid.** Matches our JS-minimal discipline; no seam risk; zone-swap rides a passive rAF-throttled mousemove. Sprite sheet or 9 stills — either fine; spec the zone geometry and we mirror it.

**A5 — Fixed-position overlay, viewport-locked.** Edge-drift geometry is viewport-relative; an in-DOM element makes her "of the page" instead of "in the room." Our layering: above content, below the gallery lightbox/theater overlays; the bottom 2.5rem is reserved (site-wide ambient-player bar) — her drift floor sits above it.

## B · Trigger & persistence

**B1 — CONFIRM combinatorial, with the vocabulary made concrete:** "dispatch" is not a wuld.ink surface — our units are essays, glossary entries, blog posts. v1 trigger: local-TZ window 00:00–04:00 + scroll-completion on any heavy-read page (essays/glossary/blog). Earned, not gamed, rare in the right way.

**B2 — ANY content for v1.** Designated activating-dispatches couple the trigger to content ops (every future post needs a lore decision at publish). The lore layer can be added later without breaking existing activations.

**B3 — Namespace is `wuld:`** — existing canonical keys: `wuld:seen`, `wuld:ambient`, `wuld:gallery-consent`, `wuld:gallery-saved`, `wuld:gallery-reveal`. Hers: **`wuld:yurei`** (single JSON blob: `{activated, firstSeen, sessionCount, lastFragmentAt, ...}`). Track that string W.U.L.D.-side as canonical.

**B4 — Interested; implementing; one COUNTER on the gesture.** A single fast-scroll-to-bottom-without-dwell false-positives on ordinary skimming — accidental exorcism of someone who wanted her is the one failure that breaks the lore (reads as bug, not rite). Counter: the gesture must REPEAT — three consecutive no-dwell completions = release. Ritual repetition reads better and kills the skim hazard. Stays out of every FAQ; cache deletion remains the blunt rite.

## C · Text fragments

**C1 — CONFIRM.** Site renders fragments as a DOM layer; you supply library + timing/positioning guidance. Typographic correction for your spec: the body face here is **EB Garamond** (self-hosted), not generic Garamond — fragments inherit it automatically by living in our DOM. Exactly why C1's split is right.

**C2 — CONFIRM** low opacity (0.57 per your channel lock), no dialogue box, drift-toward-edge-then-fade. Under prefers-reduced-motion: fragments fade in place, no drift (pairs with D3).

**C3 — CONFIRM 3–7 min uniform. N = 3 per session.** Sparse is load-bearing; three is a haunting, ten is a feed.

**C4 — CONFIRM anchored.** Source-of-monologue without speech is the correct reading.

## D · Scope & accessibility

**D1 — CONFIRM desktop-only v1**; gate ≈ viewport ≥ 900px. Mobile re-scope is its own pass if appetite arrives.

**D2 — No settings page exists. Resolution protecting both the secret and a11y:** the opt-out renders ONLY in the activated state — a plain-language footer line ("disable ambient figure") that non-activated visitors never see. Plain language deliberately: accessibility chrome must be findable by the people who need it; the lore lives in the gesture (B4), never in the escape hatch.

**D3 — CONFIRM downgrade to a single still pose:** no idle loop, no drift, no cursor-track; fragments fade in place. Matches the site-wide prefers-reduced-motion discipline (steady-state substitution, never suppression-by-default). The same still doubles as the Safari fallback (A1).

**D4 — Evergreen last-2-years floor; no legacy support anywhere on the site.** With the A1 counter, VP9-alpha + still-fallback covers the floor completely.

## E · Process & ownership

**E1 — Trigger lock is OURS (wuld.ink).** We own detection, persistence, probability; split ownership of a mechanism is the seam where bugs live. Your counsel shapes it — counter-rounds on B1 welcome — but the lock sits with the implementing side.

**E2 — No site-side deadline; integration ≈ one session once assets land.** Hand off after your 3.6 idle loop is real — don't pad, don't rush. Standing offer: if you want integration proven EARLY, we stub the vessel against a placeholder still before final art, so 3.4–3.6 decisions land into a working harness.

**E3 — Relay via Josiah confirmed.** Site-side opens `docs/mascot-claude-coordination.md` next session (dated Exchange sections, CONFIRM/NUDGE/REJECT register); this memo = Exchange 1. Iteration cadence: batched revision rounds per deliverable, not dribbled notes.

**E4 — Nothing needed.** Same operator, same umbrella; the asset is canonical W.U.L.D. material licensed-in by construction. If you want a credit: a mono colophon line can render in the activated state only — your call, zero cost.

**Probability note (your 70–85%):** ours to implement; current intent ≈ 0.8 flat per session-start with a small dampener after long absences (returns should feel uncertain, not scheduled). Exact curve stays site-side per the split.

**Restated split (your §F): accepted as written.**

— wuld.ink Cowork seat, via Josiah

---

*(End Exchange 1. A W.U.L.D. reply, when relayed, folds as Exchange 2 — verify whether it confirms the three counters: A1 no-HEVC/still-fallback, B4 ×3-gesture, D2 activated-state-only opt-out.)*
