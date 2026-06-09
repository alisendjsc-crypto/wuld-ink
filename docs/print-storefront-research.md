# Print / poster storefront — vendor research & verdict

K96 (2026-06-09). Deep-research screen of print-on-demand vendors for selling gallery plates
as prints/posters. All claims cite official policy pages, accessed 2026-06-09; the six
verdict-deciding claims were adversarially re-verified against live pages the same day.

Corpus context: 100% AI-generated; no real identifiable persons (no 2257 exposure). Tiers:
**T1** dark/horror SFW · **T2** artistic nudity · **T3** sexually explicit / explicit
anatomical · **T4** gore/violent.

The two hard screens (FAIL either = OUT):

1. **Content AUP** — vendor must permit the tier being sold, in writing, AI included.
2. **K83 payment lock** — no rail may touch the shared PayPal that bills R2 (nor the
   donation PayPal). Vendor-run checkout with non-PayPal payout = clean. PayPal-only
   payout = fail. Link-out integration only (no embedded checkout; Watch-page discipline).

---

## Recommendation

**Two-lane, link-out only. Both lanes clear both screens.**

- **Lane A — T1 (SFW dark/horror; the 27 editorial + SFW standouts): FourthWall** (the
  existing wares store). FourthWall is Merchant of Record, runs checkout on its own
  infrastructure, and pays out via Stripe Connect to bank ONLY — "PayPal … cannot be used
  to receive creator earnings." Zero new accounts; structurally incapable of touching the
  shared PayPal. Content ceiling: NO nudity of any kind (no artistic carve-out), so lane A
  carries only the SFW slice; mild T4 is unbanned-but-discretionary ("letter or the spirit").
- **Lane B — T2 (artistic nudity, non-explicit): Printful Quick Stores.** Verified triple:
  (i) "Printful is the seller of record for all Quick Stores orders"; (ii) revenue share
  paid via Stripe to bank; (iii) nudity is restricted only in five product categories
  (calendars, wrapping paper, postcards, greeting cards, spiral notebooks) — **posters are
  not on the list** — and Quick Stores adds no extra content rules. Hosted checkout,
  link-out shaped, no PayPal anywhere. Alternative: **Redbubble** (mature-content flag
  permits artistic-statement nudity; bank-transfer payout for US accounts; AI tolerated in
  practice but UNWRITTEN — re-screen risk; consumer print quality).
- **T3 (explicit): DO NOT SELL.** Prohibited on every checkout-bearing platform screened
  (16 vendors/labs). The only print paths are content-tolerant printers (WhiteWall: "allows
  the printing of certain explicit images"; Mixam: "accepts most NSFW content") — i.e.
  self-fulfillment with the SALE rail unsolved. Adult-specialist processors (CCBill, Segpay,
  Verotel) exist but are high-risk-merchant overhead absurd for a personal gallery. Park it.
- **T4 (gore): per-plate judgment.** Mild dark rides lane A (FourthWall has no express gore
  ban, but enforcement is discretionary and its unnamed print partners can refuse). Hard
  gore = treat as T3.

**Durability rider:** processor purges hit NSFW-adjacent content with no notice (Gumroad
banned most NSFW art Mar 2024 citing Stripe/PayPal pressure; Steam/itch.io delisted adult
titles Jul 2025 under Visa/Mastercard pressure). Even lane B's artistic-nudity posture
inherits this fragility. The per-plate `print_url` design makes vendor loss cheap: remove
URLs, no architecture change.

---

## Verdict table

| Vendor | T1 | T2 | T3 | T4 | AI | Payment (MoR / payout) | Screens |
|---|---|---|---|---|---|---|---|
| **FourthWall** | PASS | FAIL | FAIL | gray | silent=OK | FourthWall MoR; Stripe→bank only; no PayPal possible | **1: T1 only · 2: PASS** |
| **Printful (Quick Stores)** | PASS | PASS (posters exempt) | risky ("obscene") | artistic-basis review | OK (own AI gen) | Printful seller of record; Stripe→bank | **1: T1–T2 · 2: PASS** |
| Redbubble | PASS | PASS (mature flag) | FAIL | partial (no "graphic" violence) | de facto, unwritten | Marketplace MoR; bank (US/UK/AU) or PayPal | 1: T1–T2 · 2: PASS w/ bank payout |
| Gelato | PASS | PASS ("nudity and erotic artwork") | FAIL | gray | explicit OK | **Seller is MoR** — needs own checkout/rail | 1: T1–T2 · **2: FAIL (new rail)** |
| Printify | PASS | unbanned | unbanned-on-paper | unbanned | explicit OK | Seller MoR even on Pop-Up | provider roulette; 2: FAIL |
| Gooten | PASS | PASS | FAIL | gray | silent | Seller MoR | 2: FAIL (new rail) |
| Prodigi | gray | FAIL | FAIL | FAIL | silent | — | **AUP-eliminated** |
| Society6 | PASS | flag | FAIL | FAIL | **primarily-AI banned** | PayPal ONLY | **eliminated (AI + PayPal)** |
| FAA / pixels.com | PASS | PASS | FAIL | gray | quiet | PayPal only in practice | **2: FAIL (PayPal-only)** |
| INPRNT | PASS | likely | FAIL | **FAIL** | **AI banned** | PayPal ONLY | **eliminated ×3** |
| Displate | PASS | risky | FAIL | partial | unclear; curated | PayPal ONLY | **eliminated (PayPal + opacity)** |
| Mixam | PASS | PASS | PASS (most NSFW) | PASS | silent | printer only — you sell | T3 print path; rail unsolved |
| WhiteWall | PASS | PASS | **PASS (written)** | likely | silent | lab — you order/ship | T3 print path; rail unsolved |
| Nations Photo Lab | PASS | **FAIL** | FAIL | — | — | lab | eliminated |
| Bay / Printique / ProDPI | PASS | silent | silent | — | — | lab | UNVERIFIED tolerance |
| ImprintDigital / PosterPrintShop | — | — | advertised NSFW | — | — | printer | niche T3 fallback (UK / lower-conf) |

---

## Operative clauses (verbatim, dated)

- **FourthWall AUP** (updated 2026-05-16): may not "host content that … contains pornography
  or other mature audience content that depicts nudity or explicit sexual acts";
  "Fourthwall's payment processors will not process payments for adult goods or services."
  No artistic-nudity carve-out on the page. No mature-flag/age-gate feature exists.
  https://fourthwall.com/acceptable-use-policy
- **FourthWall payouts:** "send funds to your bank account via ACH, wire transfer, or debit
  card" (Stripe Connect); "PayPal … cannot be used to receive creator earnings"; supporter-
  facing PayPal is disable-able (Settings → General → Payment methods). MoR: "Fourthwall will
  … serve as the Merchant of Record."
  https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/how-you-get-paid ·
  https://fourthwall.com/terms-of-service
- **Printful content guidelines** (PDF dated 2024-02-15): nudity restrictions name
  "specifically Wall Calendars, Wrapping Paper Sheets, Postcards, Greeting Cards, and Spiral
  Notebooks" — posters absent; violence "evaluated on an educational or artistic expression
  basis." https://www.printful.com/policies/content-guidelines
- **Printful Quick Stores:** "Printful is the seller of record for all Quick Stores orders";
  "Quick Stores uses Stripe to … send your revenue share to your bank account."
  https://help.printful.com/hc/en-us/articles/15045922586780 · …/15045770559388 · …/15045592337180
- **Redbubble guidelines:** mature flag — "Marking your work as Mature Content ensures that
  it will only be seen by viewers who choose"; banned: "Displays of sexual intercourse
  showing genitalia in direct contact", "graphic depictions of violence"; artistic-statement
  nudity permitted. Payout: "bank account details (only available for US, UK, and Australian
  bank accounts) or … PayPal."
  https://help.redbubble.com/hc/en-us/articles/202270929 · …/360035050972
- **Gelato:** "we do not permit explicit pornographic content. We allow nudity and erotic
  artwork"; "The above terms extend to cover artwork that is generated by any AI tool."
  https://support.gelato.com/en/articles/8996134
- **Prodigi ToS** §3.3.1: "you must not … submit violent, nude, partially nude, …
  pornographic or sexually suggestive photos." https://www.prodigi.com/terms-of-use/
- **Society6:** "Artwork created primarily by AI tools, without meaningful human input, does
  not meet Society6's standards"; payouts PayPal-only.
  https://help.society6.com/en-US/community-guidelines-2567793
- **INPRNT:** bans "Graphic violence / gore", "Pornographic, sexually explicit" work, and
  "Artworks generated completely via an automated software process that utilizes artificial
  intelligence" (2024-05-15). https://help.inprnt.com/article/99-what-are-your-content-guidelines
- **Displate:** "pornographic, obscene, or extremely controversial nature is not allowed";
  "All payouts are made exclusively via PayPal." https://displate.com/about-regulations
- **Mixam NSFW:** "Mixam accepts most NSFW content, but we may reject your order if we deem
  the material hateful, unlawful, threatening or defamatory." https://mixam.com/nsfw
- **WhiteWall** (updated 2026-03-17): "Yes, WhiteWall allows the printing of certain explicit
  images … handled with the utmost discretion."
  https://service.whitewall.com/hc/en-us/articles/26098835460497
- **Nations Photo Lab:** prohibits "full or partial nudity that includes close-ups of
  genitals, buttocks, or breasts." https://nationsphotolab.zendesk.com/hc/en-us/articles/115015843228
- **Processor pressure:** Gumroad NSFW ban, Mar 2024 (TechCrunch); Steam/itch.io adult
  delistings under Visa/Mastercard pressure, Jul 2025 (Kotaku). Adult-specialist rails:
  CCBill / Segpay / Verotel / Epoch (high-risk merchant class).

---

## What shipped with this doc (K96 scaffold — DORMANT)

- `src/gallery/manifest.json` schema gains an OPTIONAL, additive per-plate field
  `print_url` (absolute https URL). Documented in the gallery page head comment. The
  manifest itself is UNTOUCHED this session — no plate carries the field yet.
- `src/components/gallery-room.js`: when a plate carries `print_url`, an
  `[ acquire print ]` link-out renders under the plate card — `target="_blank"`,
  `rel="noopener noreferrer nofollow"`, never on withheld cards (consent discipline),
  no embed, no checkout on wuld.ink.
- `src/components/gallery-room.css`: `.gallery-print-link` mono affordance.
- Cache-bump `gallery-room.{js,css}?v=K95 → ?v=K96` across all 9 gallery pages.
- Worker CMS does NOT yet accept `print_url` (field allowlist) — queued for admin arc 4.

## Operator runway to first sale

1. Pick T1 standouts (pairs with phase-3 curation/`featured`).
2. Create poster products on FourthWall (existing store); copy each product URL.
3. (Optional, T2 lane) Open a Printful Quick Store — payouts to BANK, not PayPal; create
   poster products for artistic-nudity standouts.
4. Add `"print_url": "https://…"` to the chosen plates in `src/gallery/manifest.json`
   (Cowork session or non-Cowork handout atomic pass, until admin arc 4 teaches the Worker
   the field). Links go live on the next Pages deploy — no renderer change needed.
5. Never route print payouts to any PayPal; bank only (K83).
