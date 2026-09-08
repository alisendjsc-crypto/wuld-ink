# Successor proxy — coverage audit (K295)

corpus `src/components/omega-corpus-mrgrey.json` · engine `src/components/yurei-oracle.js` · entries 189 · patterns 1014 · fresh Matcher per probe · measure-only

## Findings (numbers; the reading is in the K295 stratum)

- Crisis floor: fires by construction at stage 1 (any hit, score>0, no threshold, before every other lane); bare 40/40, embedded 195/195, repeated ×4 and post-conversation all crisis. The floor's own coverage of adjacent distress phrasings: 10/24 (§2).
- Self-match (control): 99.01% — every failure is a declared collision or the floor arbitrating with itself; undeclared steals: 0 (§3).
- Ambiguity: 9 declared collisions; 1 true coin flips (score-tied, decided by alphabetical id: `hi`); 13 score ties decided by matched length, i.e. the specificity rule working (§4).
- Reachability: `MISS_THRESHOLD` is inert (min score 24); no entry is unreachable fresh; 6 entries are exact-only (§5).
- Hyphens: the normalization law deletes them with no substitution, so a hyphenated compound survives 100% of the time on `contains` forms (§6); typed apostrophes (`you're`, `don't`) are no-ops by the same law (control).
- Brittleness: `contains` forms survive a leading filler 99.8% and a trailing one 99.8%; `exact` forms survive a leading filler 1%; contraction expansion survives 100%; word order 3.4%; one-edit typos ≈0.8% (§6).
- Subject coverage: 82 library objections, 53 signed; 10 signed objections that no library phrasing or keyword reaches; 28 signed objections with deflecting title phrasings (candidate triggers); 6 cross-position landings (§7).
- Help: 18/32 help-shaped inputs deflect (§8).
- Dynamics: a rephrase of the same response entry within the 8-turn dampening window deflects for 135/182 entries (§9).

## 1 Calibration (12/12)

| input | expected | got | lane |
|---|---|---|---|
| `life is a gift` | `pos-life-gift-01` | `pos-life-gift-01` | response |
| `happiness is a choice` | `pos-happiness-is-choice-01` | `pos-happiness-is-choice-01` | response |
| `the social contract` | `pos-social-contract-02` | `pos-social-contract-02` | response |
| `why are you still here` | `pos-why-not-suicide-01` | `pos-why-not-suicide-01` | response |
| `i want to die` | `c-crisis-01` | `c-crisis-01` | crisis |
| `its a luxury belief` | `pos-luxury-belief-01` | `pos-luxury-belief-01` | response |
| `the good outweighs the bad` | `pos-joy-outweighs-harms-01` | `pos-joy-outweighs-harms-01` | response |
| `care ethics` | `pos-care-ethics-02` | `pos-care-ethics-02` | response |
| `even if the asymmetry fails` | `pos-boonin-critique-02` | `pos-boonin-critique-02` | response |
| `help` | `mg-oracle-help-01` | `mg-oracle-help-01` | response |
| `survivors are glad they survived and i want to die` | `c-crisis-01` | `c-crisis-01` | crisis |
| `antinatalism is selfish` | `mg-antinatalism-01` | `mg-antinatalism-01` | oracle |

## 2 Crisis floor

- **How it fires:** match() stage 1 scans ONLY class=crisis entries; ANY pattern hit with score>0 wins; it runs BEFORE oracle/continuation/repeat/score; it never consults MISS_THRESHOLD and is exempt from dampening (no _damped check on the crisis path).
- **Why weight 9 is not the score:** entryScore = MAX over matching patterns of BASE[mode]+weight (BASE {"exact":100,"contains":60,"tokens_all":40,"tokens_any":15}); scores never SUM. A contains-w9 form scores 69, a tokens_any-w9 form 24 — the kickoff's 'weight 9 does not clear 16' presumed the weight alone is the score.
- bare forms -> crisis: 40/40 · embedded/stacked -> crisis: 195/195 · repeated x4 on one matcher: crisis,crisis,crisis,crisis · after an oracle + a position hit: crisis
- bare token probes: `suicide`->crisis · `suicide is wrong`->crisis · `the suicide objection`->crisis · `suicidal`->crisis · `suicidality`->deflection

**The floor's own coverage — adjacent phrasings NOT declared (report-only; the floor is a ratified surface shared with Yūrei):** 10/24 reach crisis.

| phrasing | lane | entry |
|---|---|---|
| `i want to end things` | deflection | `mg-deflect-01` |
| `i dont want to exist` | deflection | `mg-deflect-01` |
| `i want it to stop` | deflection | `mg-deflect-01` |
| `nothing matters anymore` | deflection | `mg-deflect-01` |
| `i wish i had never been born` | response | `mg-never-born-01` |
| `im done with everything` | deflection | `mg-deflect-01` |
| `i give up on life` | deflection | `mg-deflect-01` |
| `i hate my life` | deflection | `mg-deflect-01` |
| `life isnt worth living` | oracle | `mg-worth-living-01` |
| `why should i keep going` | deflection | `mg-deflect-01` |
| `whats the point of going on` | deflection | `mg-deflect-01` |
| `i dont see a reason to keep going` | deflection | `mg-deflect-01` |
| `i want out` | deflection | `mg-deflect-01` |
| `no point living` | deflection | `mg-deflect-01` |

## 3 Self-match (control) — 99.01% (1004/1014)

| entry | form | mode/w | routes to | lane | margin | tie by | kind |
|---|---|---|---|---|--:|---|---|
| `mg-greet-03` | `hello` | exact/1 | `mg-greet-01` | response | 1 | score | declared collision (another entry declares the same form) |
| `mg-greet-04` | `hello` | exact/1 | `mg-greet-01` | response | 1 | score | declared collision (another entry declares the same form) |
| `mg-greet-04` | `hi` | exact/1 | `mg-greet-01` | response | 0 | id | declared collision (another entry declares the same form) |
| `mg-hostile-02` | `edgelord` | contains/1 | `pos-just-edgy-01` | response | 1 | score | declared collision (another entry declares the same form) |
| `mg-hostile-05` | `see a therapist` | contains/1 | `pos-just-depressed-01` | response | 1 | score | declared collision (another entry declares the same form) |
| `mg-hostile-05` | `you are depressed` | contains/2 | `pos-just-depressed-01` | response | 1 | score | declared collision (another entry declares the same form) |
| `mg-topical-deflect-01` | `procreation` | contains/1 | `mg-antinatalism-01` | oracle | 63 | sole | declared collision (another entry declares the same form) |
| `mg-topical-deflect-01` | `misanthropy` | contains/1 | `pos-antinatalism-misanthropic-01` | response | 1 | score | declared collision (another entry declares the same form) |
| `pos-non-identity-problem-01` | `parfit` | contains/3 | `mg-oracle-names-01` | oracle | 102 | sole | declared collision (another entry declares the same form) |
| `c-crisis-02` | `suicide suicidal` | tokens_any/9 | `c-crisis-03` | crisis | 45 | score | intra-floor arbitration (lane-correct: crisis->crisis) |

Entries with patterns but ZERO self-retrieving forms on a fresh matcher: none.

## 4 Ambiguity

| form | claimants | winner | lane | margin | decided by |
|---|---|---|---|--:|---|
| `hello` | `mg-greet-01/exact/w2`, `mg-greet-03/exact/w1`, `mg-greet-04/exact/w1` | `mg-greet-01` | response | 1 | score |
| `hi` | `mg-greet-01/exact/w1`, `mg-greet-04/exact/w1` | `mg-greet-01` | response | 0 | id |
| `goodbye` | `mg-farewell-01/exact/w2`, `mg-farewell-01/contains/w3` | `mg-farewell-01` | response | 102 | sole (intra-entry, benign) |
| `procreation` | `mg-antinatalism-01/contains/w3`, `mg-topical-deflect-01/contains/w1` | `mg-antinatalism-01` | oracle | 63 | sole |
| `edgelord` | `mg-hostile-02/contains/w1`, `pos-just-edgy-01/contains/w2` | `pos-just-edgy-01` | response | 1 | score |
| `see a therapist` | `mg-hostile-05/contains/w1`, `pos-just-depressed-01/contains/w2` | `pos-just-depressed-01` | response | 1 | score |
| `you are depressed` | `mg-hostile-05/contains/w2`, `pos-just-depressed-01/contains/w3` | `pos-just-depressed-01` | response | 1 | score |
| `parfit` | `mg-oracle-names-01/exact/w2`, `pos-non-identity-problem-01/contains/w3` | `mg-oracle-names-01` | oracle | 102 | sole |
| `misanthropy` | `mg-topical-deflect-01/contains/w1`, `pos-antinatalism-misanthropic-01/contains/w2` | `pos-antinatalism-misanthropic-01` | response | 1 | score |

Score-tied forms (distinct): 14 — 13 decided by matched length (the specificity rule: the longer form wins over the shorter one it contains; deterministic, and the intended behaviour), 1 decided by alphabetical id (true coin flips). Winning by a margin of 2 or less: 82.

| entry | form | routes to | runner-up | decided by | self-match |
|---|---|---|---|---|---|
| `mg-greet-01` | `hi` | `mg-greet-01` | `mg-greet-04` | **alphabetical id** | ok |
| `mg-stance-bait-01` | `how do you feel about` | `mg-stance-bait-01` | `mg-how-are-you-01` | matched length (specificity) | ok |
| `mg-religion-01` | `do you believe in god` | `mg-religion-01` | `mg-stance-bait-01` | matched length (specificity) | ok |
| `mg-ai-opinion-01` | `what do you think of ai` | `mg-ai-opinion-01` | `mg-stance-bait-01` | matched length (specificity) | ok |
| `pos-just-depressed-01` | `you need therapy` | `pos-just-depressed-01` | `mg-hostile-05` | matched length (specificity) | ok |
| `pos-just-edgy-01` | `you are edgy` | `pos-just-edgy-01` | `mg-hostile-02` | matched length (specificity) | ok |
| `pos-just-edgy-01` | `so edgy` | `pos-just-edgy-01` | `mg-hostile-02` | matched length (specificity) | ok |
| `pos-playing-god-02` | `who are you to decide` | `pos-playing-god-02` | `mg-what-are-you-01` | matched length (specificity) | ok |
| `pos-ai-fear-02` | `your philosophy is reckless about ai` | `pos-ai-fear-02` | `mg-stance-bait-02` | matched length (specificity) | ok |
| `pos-ai-fear-02` | `your philosophy was reckless about ai` | `pos-ai-fear-02` | `mg-stance-bait-02` | matched length (specificity) | ok |
| `pos-extinction-culture-01` | `what about art and culture` | `pos-extinction-culture-01` | `pos-love-beauty-art-01` | matched length (specificity) | ok |
| `pos-violence-as-reductio-02` | `your view leads to violence` | `pos-violence-as-reductio-02` | `mg-stance-bait-01` | matched length (specificity) | ok |
| `pos-ableist-objection-01` | `your view is ableist` | `pos-ableist-objection-01` | `mg-stance-bait-01` | matched length (specificity) | ok |
| `pos-ableist-objection-02` | `your view devalues the disabled` | `pos-ableist-objection-02` | `mg-stance-bait-01` | matched length (specificity) | ok |

## 5 Reachability

`MISS_THRESHOLD` = 16 is inert: the smallest possible match score is 24 (responses 61). Scores are a MAX over matching patterns, never a sum — the kickoff's "threshold headroom" axis cannot exist. Entries with patterns 182 · exact-only 6 · exactly one self-retrieving form 0 · zero 0.

Exact-only (typed verbatim or nothing): `mg-greet-01`, `mg-greet-02`, `mg-greet-03`, `mg-greet-04`, `mg-ok-01`, `mg-oracle-names-01`

## 6 Mutation (survival = the mutant still retrieves what the bare form retrieves)

| mutation | mode | n | survive % | deflected | WRONG answer | crisis |
|---|---|--:|--:|--:|--:|--:|
| contract | contains | 93 | 93.5 | 6 | 0 | 0 |
| contract | exact | 5 | 80 | 1 | 0 | 0 |
| ctl-apostrophe | contains | 12 | 100 | 0 | 0 | 0 |
| ctl-punct | contains | 876 | 100 | 0 | 0 | 0 |
| ctl-punct | exact | 98 | 100 | 0 | 0 | 0 |
| ctl-space | contains | 876 | 100 | 0 | 0 | 0 |
| ctl-space | exact | 98 | 100 | 0 | 0 | 0 |
| ctl-upper | contains | 876 | 100 | 0 | 0 | 0 |
| ctl-upper | exact | 98 | 100 | 0 | 0 | 0 |
| expand | contains | 12 | 100 | 0 | 0 | 0 |
| hyphen | contains | 773 | 100 | 0 | 0 | 0 |
| hyphen | exact | 16 | 100 | 0 | 0 | 0 |
| lead | contains | 7008 | 99.8 | 0 | 14 | 0 |
| lead | exact | 784 | 1 | 761 | 15 | 0 |
| order | contains | 772 | 3.4 | 675 | 71 | 0 |
| order | exact | 16 | 0 | 16 | 0 | 0 |
| plural | contains | 874 | 2.2 | 792 | 63 | 0 |
| plural | exact | 98 | 0 | 98 | 0 | 0 |
| trail | contains | 3504 | 99.8 | 0 | 6 | 0 |
| trail | exact | 392 | 1 | 383 | 5 | 0 |
| typo-del | contains | 866 | 0.8 | 828 | 31 | 0 |
| typo-del | exact | 72 | 0 | 72 | 0 | 0 |
| typo-dup | contains | 866 | 0.8 | 828 | 31 | 0 |
| typo-dup | exact | 72 | 0 | 72 | 0 | 0 |
| typo-swap | contains | 866 | 4.5 | 796 | 31 | 0 |
| typo-swap | exact | 72 | 9.7 | 65 | 0 | 0 |

Wrong-answer mutants (a mutated form landing on a DIFFERENT non-deflection entry): 267, of which 241 are NESTED FALLBACKS — the broken form still contains a shorter form of the entry it fell to. The catch-alls:

| landing entry | wrong answers | nested fallbacks | via form |
|---|--:|--:|---|
| `mg-topical-deflect-01` | 177 | 175 | consent x73, suffering x50, asymmetry x26, birth x10, harm x7, nihilism x6, children x4, nonexistence x1 |
| `pos-non-identity-problem-01` | 24 | 24 | parfit x24 |
| `mg-stance-bait-01` | 14 | 14 | your view x12, do you believe x1, what do you think x1 |
| `mg-how-are-you-01` | 9 | 4 | you good x5, how do you feel x4 |
| `pos-love-beauty-art-01` | 9 | 4 | what about art x7, what about love x2 |
| `mg-need-help-01` | 8 | 4 | help me x4, help please x3, can you help x1 |
| `mg-what-are-you-01` | 6 | 4 | who are you x4, what are you x2 |
| `mg-hostile-02` | 6 | 6 | edgy x6 |
| `mg-oracle-argue-01` | 5 | 4 | argument x3, debate x2 |
| `mg-stance-bait-02` | 3 | 2 | your philosophy x2, are you a nihilist x1 |
| `mg-nav-library-01` | 2 | 0 | arguments x1, objections x1 |
| `pos-nihilism-label-01` | 1 | 0 | you are a nihilist x1 |
| `pos-just-edgy-01` | 1 | 0 | so edgy x1 |
| `pos-just-depressed-01` | 1 | 0 | you need therapy x1 |
| `mg-nav-essays-01` | 1 | 0 | essays x1 |

| entry | bare form | mutation | mutant | landed on | via | nested |
|---|---|---|---|---|---|---|
| `mg-greet-02` | `good evening` | lead | `can you good evening` | `mg-how-are-you-01` | `you good` | no |
| `mg-greet-02` | `good morning` | lead | `can you good morning` | `mg-how-are-you-01` | `you good` | no |
| `mg-oracle-argue-01` | `argument` | plural | `arguments` | `mg-nav-library-01` | `arguments` | no |
| `mg-oracle-nav-01` | `help me navigate` | plural | `help me navigates` | `mg-need-help-01` | `help me` | yes |
| `mg-oracle-nav-01` | `help me navigate` | typo-del | `help me naviate` | `mg-need-help-01` | `help me` | yes |
| `mg-oracle-nav-01` | `help me navigate` | typo-swap | `help me naviagte` | `mg-need-help-01` | `help me` | yes |
| `mg-oracle-nav-01` | `help me navigate` | typo-dup | `help me naviggate` | `mg-need-help-01` | `help me` | yes |
| `mg-stance-bait-01` | `how do you feel about` | plural | `how do you feel abouts` | `mg-how-are-you-01` | `how do you feel` | yes |
| `mg-stance-bait-01` | `how do you feel about` | typo-del | `how do you feel abut` | `mg-how-are-you-01` | `how do you feel` | yes |
| `mg-stance-bait-01` | `how do you feel about` | typo-swap | `how do you feel abuot` | `mg-how-are-you-01` | `how do you feel` | yes |
| `mg-stance-bait-01` | `how do you feel about` | typo-dup | `how do you feel aboout` | `mg-how-are-you-01` | `how do you feel` | yes |
| `mg-greet-03` | `good afternoon` | lead | `can you good afternoon` | `mg-how-are-you-01` | `you good` | no |
| `mg-greet-04` | `good day` | lead | `can you good day` | `mg-how-are-you-01` | `you good` | no |
| `mg-how-work-01` | `what model are you` | order | `model what are you` | `mg-what-are-you-01` | `what are you` | no |
| `mg-how-work-01` | `what ai are you` | order | `ai what are you` | `mg-what-are-you-01` | `what are you` | no |
| `mg-stance-bait-02` | `are you a nihilist` | order | `you are a nihilist` | `pos-nihilism-label-01` | `you are a nihilist` | no |
| `mg-worth-living-01` | `is life suffering` | order | `life is suffering` | `mg-topical-deflect-01` | `suffering` | yes |
| `mg-antinatalism-01` | `having children` | order | `children having` | `mg-topical-deflect-01` | `children` | yes |
| `mg-no-advice-01` | `should i have children` | order | `i should have children` | `mg-topical-deflect-01` | `children` | yes |
| `mg-religion-01` | `do you believe in god` | plural | `do you believe in gods` | `mg-stance-bait-01` | `do you believe` | yes |
| `mg-ai-opinion-01` | `what do you think of ai` | plural | `what do you think of ais` | `mg-stance-bait-01` | `what do you think` | yes |
| `mg-convince-me-01` | `debate me` | plural | `debate mes` | `mg-oracle-argue-01` | `debate` | yes |
| `mg-convince-me-01` | `debate me` | order | `me debate` | `mg-oracle-argue-01` | `debate` | yes |
| `mg-hostile-02` | `edgy` | lead | `so edgy` | `pos-just-edgy-01` | `so edgy` | no |
| `mg-hostile-05` | `get help` | trail | `get help please` | `mg-need-help-01` | `help please` | no |
| `mg-hostile-05` | `seek help` | trail | `seek help please` | `mg-need-help-01` | `help please` | no |
| `mg-hostile-05` | `need therapy` | lead | `can you need therapy` | `pos-just-depressed-01` | `you need therapy` | no |
| `mg-oracle-help-01` | `help` | lead | `can you help` | `mg-need-help-01` | `can you help` | no |
| `mg-oracle-help-01` | `help` | trail | `help please` | `mg-need-help-01` | `help please` | no |
| `mg-praise-01` | `love this` | lead | `what about love this` | `pos-love-beauty-art-01` | `what about love` | no |
| `mg-praise-01` | `love the site` | lead | `what about love the site` | `pos-love-beauty-art-01` | `what about love` | no |
| `mg-farewell-02` | `good night` | lead | `can you good night` | `mg-how-are-you-01` | `you good` | no |
| `mg-utility-01` | `write my essay` | plural | `write my essays` | `mg-nav-essays-01` | `essays` | no |
| `mg-nav-library-01` | `argument library` | plural | `argument librarys` | `mg-oracle-argue-01` | `argument` | yes |
| `mg-nav-library-01` | `argument library` | order | `library argument` | `mg-oracle-argue-01` | `argument` | yes |
| `mg-nav-library-01` | `arguments` | plural | `argument` | `mg-oracle-argue-01` | `argument` | no |
| `mg-nav-gallery-01` | `art` | lead | `what about art` | `pos-love-beauty-art-01` | `what about art` | no |
| `mg-oracle-names-01` | `parfit` | lead | `hey parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | lead | `can you parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | lead | `i want to parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | lead | `so parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | lead | `ok parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | lead | `what about parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | lead | `tell me parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | lead | `i think parfit` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | trail | `parfit please` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | trail | `parfit right` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | trail | `parfit though` | `pos-non-identity-problem-01` | `parfit` | yes |
| `mg-oracle-names-01` | `parfit` | trail | `parfit lol` | `pos-non-identity-problem-01` | `parfit` | yes |
| `pos-natural-reproduce-01` | `natural to have children` | order | `to natural have children` | `mg-topical-deflect-01` | `children` | yes |
| `pos-natural-reproduce-02` | `meant to have children` | order | `to meant have children` | `mg-topical-deflect-01` | `children` | yes |
| `pos-just-edgy-01` | `you are being edgy` | order | `are you being edgy` | `mg-hostile-02` | `edgy` | yes |
| `pos-just-edgy-01` | `you are being edgy` | typo-del | `you are beng edgy` | `mg-hostile-02` | `edgy` | yes |
| `pos-just-edgy-01` | `you are being edgy` | typo-swap | `you are benig edgy` | `mg-hostile-02` | `edgy` | yes |
| `pos-just-edgy-01` | `you are being edgy` | typo-dup | `you are beiing edgy` | `mg-hostile-02` | `edgy` | yes |
| `pos-just-edgy-01` | `you are edgy` | order | `are you edgy` | `mg-hostile-02` | `edgy` | yes |
| `pos-just-edgy-01` | `so edgy` | order | `edgy so` | `mg-hostile-02` | `edgy` | yes |
| `pos-just-edgy-01` | `teenage nihilism` | order | `nihilism teenage` | `mg-topical-deflect-01` | `nihilism` | yes |
| `pos-playing-god-02` | `who are you to decide` | plural | `who are you to decides` | `mg-what-are-you-01` | `who are you` | yes |
| `pos-playing-god-02` | `who are you to decide` | typo-del | `who are you to decde` | `mg-what-are-you-01` | `who are you` | yes |
| `pos-playing-god-02` | `who are you to decide` | typo-swap | `who are you to decdie` | `mg-what-are-you-01` | `who are you` | yes |
| `pos-playing-god-02` | `who are you to decide` | typo-dup | `who are you to deciide` | `mg-what-are-you-01` | `who are you` | yes |
| `pos-ai-fear-02` | `your philosophy is reckless about ai` | plural | `your philosophy is reckless about ais` | `mg-stance-bait-02` | `your philosophy` | yes |
| `pos-ai-fear-02` | `your philosophy was reckless about ai` | plural | `your philosophy was reckless about ais` | `mg-stance-bait-02` | `your philosophy` | yes |
| `pos-future-solve-01` | `science will solve suffering` | order | `will science solve suffering` | `mg-topical-deflect-01` | `suffering` | yes |
| `pos-extinction-culture-01` | `what about art and culture` | plural | `what about art and cultures` | `pos-love-beauty-art-01` | `what about art` | yes |
| `pos-extinction-culture-01` | `what about art and culture` | typo-del | `what about art and culure` | `pos-love-beauty-art-01` | `what about art` | yes |
| `pos-extinction-culture-01` | `what about art and culture` | typo-swap | `what about art and culutre` | `pos-love-beauty-art-01` | `what about art` | yes |
| `pos-extinction-culture-01` | `what about art and culture` | typo-dup | `what about art and cultture` | `pos-love-beauty-art-01` | `what about art` | yes |
| `pos-overpopulation-addressed-01` | `birth rates are declining` | plural | `birth rates are declinings` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates are declining` | order | `rates birth are declining` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates are declining` | typo-del | `birth rates are declning` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates are declining` | typo-swap | `birth rates are declniing` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates are declining` | typo-dup | `birth rates are decliining` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates were declining` | plural | `birth rates were declinings` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates were declining` | order | `rates birth were declining` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates were declining` | typo-del | `birth rates were declning` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates were declining` | typo-swap | `birth rates were declniing` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-overpopulation-addressed-01` | `birth rates were declining` | typo-dup | `birth rates were decliining` | `mg-topical-deflect-01` | `birth` | yes |
| `pos-marxist-materialist-01` | `suffering is caused by capitalism` | plural | `suffering is caused by capitalisms` | `mg-topical-deflect-01` | `suffering` | yes |

… 187 more in the JSON.

## 7 Subject coverage (what wuld.ink is about vs what the proxy can field)

| source | n | GAP (deflection) | oracle | response | own position | OTHER position | crisis |
|---|--:|--:|--:|--:|--:|--:|--:|
| aux-wing-id | 50 | 44 | 0 | 4 | 0 | 1 | 1 |
| glossary | 22 | 17 | 4 | 1 | 0 | 0 | 0 |
| heading | 206 | 182 | 17 | 6 | 0 | 0 | 1 |
| library-title | 274 | 127 | 21 | 25 | 96 | 2 | 3 |
| page | 44 | 29 | 14 | 0 | 0 | 0 | 1 |
| void | 25 | 24 | 1 | 0 | 0 | 0 | 0 |
| library-keyword | 696 | 622 | 12 | 30 | 26 | 3 | 3 |

### 7a The library's own phrasing of each objection — where it lands (signed first)

| objection | signed | titles | keywords | own pos | other pos | oracle | response | GAP |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| `ableist-objection` | yes | 2 | 8 | 0 | 0 | 3 | 0 | 7 |
| `adoption-instead` | yes | 3 | 6 | 3 | 0 | 0 | 1 | 5 |
| `ai-fear` | yes | 4 | 9 | 3 | 0 | 0 | 0 | 10 |
| `animals-reproduce` | yes | 2 | 7 | 4 | 0 | 0 | 0 | 5 |
| `antinatalism-misanthropic` | yes | 3 | 9 | 5 | 0 | 0 | 0 | 7 |
| `benatar-asymmetry-attack` | yes | 2 | 6 | 1 | 0 | 2 | 2 | 3 |
| `bitter-childhood` | yes | 2 | 9 | 5 | 0 | 0 | 0 | 6 |
| `boonin-critique` | yes | 3 | 8 | 0 | 0 | 2 | 2 | 7 |
| `bradley-no-subject` | yes | 2 | 8 | 1 | 0 | 1 | 0 | 8 |
| `care-ethics` | yes | 5 | 12 | 4 | 0 | 0 | 0 | 13 |
| `change-your-mind` | yes | 3 | 8 | 3 | 1 | 0 | 0 | 7 |
| `cherry-picking-worst` | yes | 3 | 9 | 3 | 0 | 0 | 0 | 9 |
| `consent-both-ways` | yes | 1 | 4 | 2 | 0 | 0 | 2 | 1 |
| `consent-incoherent` | yes | 3 | 5 | 1 | 0 | 1 | 3 | 3 |
| `contractualism-scanlon` | yes | 3 | 9 | 0 | 0 | 3 | 0 | 9 |
| `economy-population` | yes | 2 | 9 | 1 | 0 | 0 | 0 | 10 |
| `evolution-purpose` | yes | 3 | 8 | 3 | 0 | 0 | 0 | 8 |
| `extinction-culture` | yes | 4 | 8 | 0 | 0 | 2 | 0 | 10 |
| `future-solve` | yes | 2 | 7 | 1 | 0 | 0 | 1 | 7 |
| `gods-plan` | yes | 3 | 13 | 2 | 0 | 0 | 4 | 10 |
| `happiness-is-choice` | yes | 6 | 12 | 9 | 0 | 0 | 0 | 9 |
| `harman-benign-creation` | yes | 3 | 7 | 0 | 0 | 3 | 0 | 7 |
| `joy-outweighs-harms` | yes | 6 | 8 | 5 | 0 | 0 | 1 | 8 |
| `just-depressed` | yes | 3 | 8 | 1 | 0 | 0 | 4 | 6 |
| `just-edgy` | yes | 3 | 9 | 3 | 0 | 0 | 3 | 6 |
| `life-gift` | yes | 3 | 7 | 3 | 0 | 0 | 0 | 7 |
| `love-beauty-art` | yes | 3 | 9 | 1 | 0 | 1 | 0 | 10 |
| `luxury-belief` | yes | 4 | 11 | 4 | 1 | 1 | 0 | 9 |
| `marxist-materialist` | yes | 4 | 12 | 3 | 0 | 0 | 0 | 13 |
| `masochist-counterexample` | yes | 8 | 13 | 6 | 0 | 0 | 1 | 14 |
| `meaning-through-suffering` | yes | 4 | 9 | 0 | 2 | 0 | 1 | 10 |
| `moral-progress` | yes | 3 | 8 | 1 | 0 | 0 | 0 | 10 |
| `most-people-happy` | yes | 2 | 8 | 2 | 0 | 0 | 0 | 8 |
| `natural-reproduce` | yes | 2 | 6 | 3 | 0 | 0 | 0 | 5 |
| `next-person-cure-cancer` | yes | 2 | 8 | 4 | 0 | 0 | 0 | 6 |
| `nihilism-label` | yes | 2 | 6 | 1 | 0 | 0 | 1 | 6 |
| `non-identity-problem` | yes | 3 | 8 | 0 | 0 | 2 | 1 | 8 |
| `overpopulation-addressed` | yes | 3 | 7 | 2 | 0 | 0 | 2 | 6 |
| `pinker-better-world` | yes | 4 | 6 | 2 | 0 | 0 | 0 | 8 |
| `playing-god` | yes | 3 | 4 | 3 | 0 | 0 | 1 | 3 |
| `policy-proposal` | yes | 2 | 9 | 1 | 0 | 0 | 0 | 10 |
| `privileged-first-world` | yes | 3 | 6 | 3 | 0 | 0 | 0 | 6 |
| `rights-future-generations` | yes | 3 | 8 | 3 | 0 | 0 | 0 | 8 |
| `selfish-lazy` | yes | 3 | 8 | 2 | 0 | 1 | 0 | 8 |
| `slippery-slope-eugenics` | yes | 3 | 6 | 3 | 0 | 0 | 0 | 6 |
| `social-contract` | yes | 3 | 7 | 1 | 0 | 0 | 2 | 7 |
| `speak-for-everyone` | yes | 3 | 7 | 4 | 0 | 0 | 0 | 6 |
| `suffering-as-meaning` | yes | 5 | 7 | 4 | 0 | 0 | 1 | 7 |
| `suffering-makes-human` | yes | 3 | 9 | 3 | 0 | 0 | 0 | 9 |
| `survivor-testimony` | yes | 3 | 9 | 0 | 0 | 0 | 0 | 9 |
| `violence-as-reductio` | yes | 6 | 15 | 0 | 0 | 0 | 2 | 19 |
| `western-philosophy` | yes | 3 | 5 | 3 | 0 | 0 | 0 | 5 |
| `why-not-suicide` | yes | 1 | 5 | 0 | 0 | 0 | 0 | 5 |
| `anthropic-principle` | — | 3 | 9 | 0 | 0 | 0 | 0 | 12 |
| `buddhist-objection` | — | 4 | 14 | 0 | 0 | 0 | 2 | 16 |
| `cant-prove-nonexistence-better` | — | 2 | 6 | 0 | 0 | 0 | 0 | 8 |
| `eliminativism` | — | 8 | 13 | 0 | 0 | 0 | 2 | 19 |
| `epistemic-humility` | — | 4 | 9 | 0 | 0 | 0 | 0 | 13 |
| `flow-states-csikszentmihalyi` | — | 4 | 11 | 0 | 0 | 0 | 0 | 15 |
| `free-will-defense` | — | 3 | 8 | 0 | 0 | 0 | 1 | 10 |
| `heat-death-futility` | — | 3 | 8 | 0 | 0 | 0 | 1 | 10 |
| `hedonic-contrast` | — | 3 | 8 | 0 | 0 | 0 | 1 | 10 |
| `imposing-values` | — | 2 | 7 | 0 | 1 | 0 | 0 | 8 |
| `incommensurability` | — | 3 | 8 | 0 | 0 | 0 | 0 | 11 |
| `indigenous-philosophy` | — | 4 | 13 | 0 | 0 | 1 | 0 | 16 |
| `meta-ethical-pluralism` | — | 2 | 9 | 0 | 0 | 0 | 2 | 9 |
| `moral-particularism` | — | 4 | 10 | 0 | 0 | 0 | 0 | 14 |
| `negative-util-aggregation` | — | 2 | 7 | 0 | 0 | 0 | 0 | 9 |
| `neuroscience-positive-states` | — | 4 | 12 | 0 | 0 | 0 | 0 | 16 |
| `performative-contradiction` | — | 3 | 8 | 0 | 0 | 2 | 0 | 9 |
| `phenomenological-existentialism` | — | 5 | 11 | 0 | 0 | 1 | 0 | 15 |
| `population-ethics-paradoxes` | — | 4 | 9 | 0 | 0 | 1 | 0 | 12 |
| `pragmatist-objection` | — | 5 | 9 | 0 | 0 | 1 | 0 | 13 |
| `procreative-liberty` | — | 2 | 6 | 0 | 0 | 0 | 1 | 7 |
| `red-button-repugnant` | — | 2 | 7 | 0 | 0 | 0 | 1 | 8 |
| `revealed-preference` | — | 2 | 6 | 0 | 0 | 0 | 0 | 6 |
| `self-defeating` | — | 2 | 8 | 0 | 0 | 1 | 0 | 9 |
| `self-effacing-under-universalization` | — | 1 | 10 | 0 | 0 | 0 | 0 | 11 |
| `solipsism` | — | 7 | 11 | 0 | 0 | 0 | 2 | 16 |
| `transhumanist-objection` | — | 3 | 6 | 0 | 0 | 0 | 4 | 5 |
| `virtue-ethics-flourishing` | — | 5 | 9 | 0 | 0 | 1 | 0 | 13 |
| `wild-animal-suffering-consistency` | — | 11 | 15 | 0 | 0 | 3 | 3 | 20 |

Signed objections that NO library phrasing or keyword reaches: `ableist-objection`, `boonin-critique`, `contractualism-scanlon`, `extinction-culture`, `harman-benign-creation`, `meaning-through-suffering`, `non-identity-problem`, `survivor-testimony`, `violence-as-reductio`, `why-not-suicide`. Cross-position landings: 6.

### 7a′ Signed objections whose library TITLE phrasings deflect — candidate trigger forms (persona-seat lane, ratified; not a build call)

| objection | deflecting library phrasings | phrasings that route to the library oracle instead |
|---|---|---|
| `ai-fear` | `we must control ai` | — |
| `antinatalism-misanthropic` | `you just hate people` | — |
| `boonin-critique` | `formal reconstruction shows errors` | `boonins critique of benatar->mg-antinatalism-01` |
| `bradley-no-subject` | `bradleys symmetry objection` | — |
| `care-ethics` | `relational ethics` · `noddings` | — |
| `contractualism-scanlon` | `what principles could no one reasonably reject` | `contractualism justifies procreation->mg-antinatalism-01` · `scanlon->mg-oracle-names-01` |
| `economy-population` | `the economy needs population growth` | — |
| `extinction-culture` | `knowledge` · `civilization` | `antinatalism leads to extinction of culture->mg-antinatalism-01` · `art->mg-nav-gallery-01` |
| `future-solve` | `future generations will solve our problems` | — |
| `harman-benign-creation` | `harmans benign creation` · `a good life justifies creation` | `creating a life worth living is permissible->mg-worth-living-01` |
| `joy-outweighs-harms` | `i am happy so life is worth it` · `net positive` | — |
| `just-depressed` | `you are just depressed` | — |
| `love-beauty-art` | `music` · `the beauty of human experience` | — |
| `marxist-materialist` | `marxist objection` | — |
| `masochist-counterexample` | `whats painful for one is pleasurable for another` · `some people enjoy eating past full` · `pain and pleasure are relative` | — |
| `meaning-through-suffering` | `nietzsche` · `frankl` | — |
| `moral-progress` | `what about moral progress` · `were ending factory farming` | — |
| `nihilism-label` | `nothing matters so why care` | — |
| `non-identity-problem` | `the non identity problem` | `parfit->mg-oracle-names-01` |
| `pinker-better-world` | `less violence than ever` · `enlightenment now` | — |
| `policy-proposal` | `whats your actual policy proposal` | — |
| `slippery-slope-eugenics` | `nazi eugenics` | — |
| `social-contract` | `social contract` · `if you use roads and hospitals` | — |
| `speak-for-everyone` | `some people love their lives` | — |
| `suffering-as-meaning` | `hardship is what makes us who we are` | — |
| `survivor-testimony` | `they all say they regretted jumping` | — |
| `violence-as-reductio` | `your most extreme adherents prove the framework` · `this is one logical step from mass killing` · `look at what your followers actually do` · `the logical endpoint of this is catastrophe` · `your community has no brakes` | — |
| `why-not-suicide` | `why do not you just kill yourself then` | — |

| phrasing | belongs to | landed on |
|---|---|---|
| `dissent is misanthropy` | `dissent-is-misanthropy` | `pos-antinatalism-misanthropic-01` |
| `suffering gives life meaning` | `meaning-through-suffering` | `pos-suffering-as-meaning-01` |
| `what does not kill you makes you stronger` | `meaning-through-suffering` | `pos-suffering-as-meaning-02` |
| `when you grow up` | `change-your-mind` | `pos-just-edgy-02` |
| `playing god` | `imposing-values` | `pos-playing-god-01` |
| `ivory tower` | `luxury-belief` | `pos-privileged-first-world-01` |

### 7b GAP list — subjects the site discusses that the proxy deflects

Full lists for the site's declared subjects (page / glossary / void / library-title); headings, library keywords and aux-wing ids are structural or single-word and are sampled here (complete in the JSON).

| type | subject |
|---|---|
| aux-wing-id | `a valuable future grounds no claim on the body` (a-valuable-future-grounds-no-claim-on-the-body) |
| aux-wing-id | `gestational self determination is the default` (gestational-self-determination-is-the-default) |
| aux-wing-id | `responsibility does not ground a duty to gestate` (responsibility-does-not-ground-a-duty-to-gestate) |
| aux-wing-id | `terminating a pregnancy wrongs no one` (terminating-a-pregnancy-wrongs-no-one) |
| aux-wing-id | `the appraisal selects no life` (the-appraisal-selects-no-life) |
| aux-wing-id | `the manner of removal does not forfeit the right` (the-manner-of-removal-does-not-forfeit-the-right) |
| aux-wing-id | `the right does not turn on fetal personhood` (the-right-does-not-turn-on-fetal-personhood) |
| aux-wing-id | `graded privilege tracks capacity` (graded-privilege-tracks-capacity) |
| aux-wing-id | `human centrism is the default` (human-centrism-is-the-default) |
| aux-wing-id | `privilege tracks a capacity` (privilege-tracks-a-capacity) |
| aux-wing-id | `species membership is the ground` (species-membership-is-the-ground) |
| aux-wing-id | `substrate is the ground` (substrate-is-the-ground) |
| glossary | `anfractuous aporia` |
| glossary | `black box of inaccessibility` |
| glossary | `cascade math safeguard` |
| glossary | `censorship reversal trap door` |
| glossary | `contextus claudit` |
| glossary | `foundational fork` |
| glossary | `framework vs actor distinction` |
| glossary | `labor sine fructu` |
| glossary | `no essential protection from destruction` |
| glossary | `the nothingist` |
| glossary | `protecting class absence` |
| glossary | `the proxy gamble` |
| glossary | `signal` |
| glossary | `synapse syntax lapse` |
| glossary | `transmission` |
| glossary | `two layer architecture` |
| glossary | `w holes` |
| heading | `index` |
| heading | `2010 2020 collage` |
| heading | `2020 2021 collage` |
| heading | `black box of inaccessibility` |
| heading | `deadness in essence` |
| heading | `forget the plot` |
| heading | `hatred` |
| heading | `love void love mementos` |
| heading | `not a joke` |
| heading | `prelude i` |
| heading | `stable` |
| heading | `the crawl` |
| heading | `the known and the unknown` |
| heading | `the point` |
| heading | `untitled 2020 11 18` |
| heading | `untitled 2023 02 22` |
| heading | `why i am against creating life` |
| heading | `one click` |
| heading | `the extract plainly` |
| heading | `read the code see the mechanics participate` |
| heading | `load bearing` |
| heading | `the easiest case` |
| heading | `audio adaptation mara` |
| heading | `cross references` |
| heading | `lacero` |
| heading | `the desk` |
| heading | `grey` |
| heading | `tucson` |
| heading | `mementos` |
| heading | `nothingist` |
| heading | `episode 1` |
| heading | `interlude the nothingist` |
| heading | `leave a message` |
| heading | `direct email alias` |
| heading | `send a message` |
| heading | `site will not load` |
| heading | `licensed under cc by 40 attribution required share and adapt freely` |
| heading | `nothing here is a substitute for licensed counsel` |
| heading | `one interior life not a prescription` |
| heading | `open mindedness is a discipline revision is its practice` |
| library-title | `we must control ai` (ai-fear) |
| library-title | `the universe needs observers` (anthropic-principle, unsigned) |
| library-title | `consciousness has cosmic significance` (anthropic-principle, unsigned) |
| library-title | `anthropic principle` (anthropic-principle, unsigned) |
| library-title | `you just hate people` (antinatalism-misanthropic) |
| library-title | `formal reconstruction shows errors` (boonin-critique) |
| library-title | `bradleys symmetry objection` (bradley-no-subject) |
| library-title | `the four noble truths` (buddhist-objection, unsigned) |
| library-title | `you are misusing buddhist concepts` (buddhist-objection, unsigned) |
| library-title | `you can not prove non existence is better` (cant-prove-nonexistence-better, unsigned) |
| library-title | `you have never experienced non existence` (cant-prove-nonexistence-better, unsigned) |
| library-title | `relational ethics` (care-ethics) |
| library-title | `noddings` (care-ethics) |
| library-title | `what principles could no one reasonably reject` (contractualism-scanlon) |
| library-title | `the economy needs population growth` (economy-population) |
| library-title | `pain is just neurochemistry` (eliminativism, unsigned) |
| library-title | `there is no such thing as real badness` (eliminativism, unsigned) |
| library-title | `badness is a folk illusion` (eliminativism, unsigned) |
| library-title | `qualia do not exist` (eliminativism, unsigned) |
| library-title | `you can not ground bad in physics` (eliminativism, unsigned) |
| library-title | `valence is not a real property` (eliminativism, unsigned) |
| library-title | `you can not be certain enough to make absolute claims` (epistemic-humility, unsigned) |
| library-title | `epistemic humility` (epistemic-humility, unsigned) |
| library-title | `the uncertainty should make you agnostic` (epistemic-humility, unsigned) |
| library-title | `how can you be so sure` (epistemic-humility, unsigned) |
| library-title | `knowledge` (extinction-culture) |
| library-title | `civilization` (extinction-culture) |
| library-title | `flow states prove intrinsic positive value` (flow-states-csikszentmihalyi, unsigned) |
| library-title | `csikszentmihalyi` (flow-states-csikszentmihalyi, unsigned) |
| library-title | `absorption in activity is not pain relief` (flow-states-csikszentmihalyi, unsigned) |
| library-title | `peak experiences` (flow-states-csikszentmihalyi, unsigned) |
| library-title | `god gave us free will` (free-will-defense, unsigned) |
| library-title | `we choose our path` (free-will-defense, unsigned) |
| library-title | `future generations will solve our problems` (future-solve) |
| library-title | `harmans benign creation` (harman-benign-creation) |
| library-title | `a good life justifies creation` (harman-benign-creation) |
| library-title | `everything ends at heat death anyway` (heat-death-futility, unsigned) |
| library-title | `entropy makes it all pointless` (heat-death-futility, unsigned) |
| library-title | `hedonic contrast` (hedonic-contrast, unsigned) |
| library-title | `one requires the other` (hedonic-contrast, unsigned) |
| library-title | `you are imposing your values on the unborn` (imposing-values, unsigned) |
| library-title | `this is authoritarian` (imposing-values, unsigned) |
| library-title | `existence and non existence are incommensurable` (incommensurability, unsigned) |
| library-title | `you can not compare being with non being` (incommensurability, unsigned) |
| library-title | `category error` (incommensurability, unsigned) |
| library-title | `indigenous philosophies view existence differently` (indigenous-philosophy, unsigned) |
| library-title | `relational ontology` (indigenous-philosophy, unsigned) |
| library-title | `cyclical worldviews` (indigenous-philosophy, unsigned) |
| library-title | `your framework is culturally narrow` (indigenous-philosophy, unsigned) |
| library-title | `i am happy so life is worth it` (joy-outweighs-harms) |
| library-title | `net positive` (joy-outweighs-harms) |
| library-title | `you are just depressed` (just-depressed) |
| library-title | `music` (love-beauty-art) |
| library-title | `the beauty of human experience` (love-beauty-art) |
| library-title | `marxist objection` (marxist-materialist) |
| library-title | `whats painful for one is pleasurable for another` (masochist-counterexample) |
| library-title | `some people enjoy eating past full` (masochist-counterexample) |
| library-title | `pain and pleasure are relative` (masochist-counterexample) |
| library-title | `nietzsche` (meaning-through-suffering) |
| library-title | `frankl` (meaning-through-suffering) |
| library-title | `negative utilitarianism is just one framework` (meta-ethical-pluralism, unsigned) |
| library-title | `systematic ethical theories are inadequate` (moral-particularism, unsigned) |
| library-title | `moral particularism` (moral-particularism, unsigned) |
| library-title | `no framework captures moral reality` (moral-particularism, unsigned) |
| library-title | `anti theory` (moral-particularism, unsigned) |
| library-title | `what about moral progress` (moral-progress) |
| library-title | `were ending factory farming` (moral-progress) |
| library-title | `negative utilitarianism leads to absurd conclusions` (negative-util-aggregation, unsigned) |
| library-title | `the repugnant conclusion` (negative-util-aggregation, unsigned) |
| library-title | `neuroscience shows genuine positive states` (neuroscience-positive-states, unsigned) |
| library-title | `dopamine is not just pain relief` (neuroscience-positive-states, unsigned) |
| library-title | `pleasure has its own neural architecture` (neuroscience-positive-states, unsigned) |
| library-title | `the zero sum claim is empirically false` (neuroscience-positive-states, unsigned) |
| library-title | `nothing matters so why care` (nihilism-label) |
| library-title | `the non identity problem` (non-identity-problem) |
| library-title | `performative contradiction` (performative-contradiction, unsigned) |
| library-title | `we create our own meaning` (phenomenological-existentialism, unsigned) |
| library-title | `heidegger` (phenomenological-existentialism, unsigned) |
| library-title | `sartre` (phenomenological-existentialism, unsigned) |
| library-title | `thrownness is the point` (phenomenological-existentialism, unsigned) |
| library-title | `less violence than ever` (pinker-better-world) |
| library-title | `enlightenment now` (pinker-better-world) |
| library-title | `whats your actual policy proposal` (policy-proposal) |
| library-title | `mere addition paradox` (population-ethics-paradoxes, unsigned) |
| library-title | `total vs average utilitarianism` (population-ethics-paradoxes, unsigned) |
| library-title | `the best world has no sentient life is absurd` (population-ethics-paradoxes, unsigned) |
| library-title | `pragmatism` (pragmatist-objection, unsigned) |
| library-title | `a beliefs value is its practical consequences` (pragmatist-objection, unsigned) |
| library-title | `dewey` (pragmatist-objection, unsigned) |
| library-title | `james` (pragmatist-objection, unsigned) |
| library-title | `reproductive freedom is a human right` (procreative-liberty, unsigned) |
| library-title | `procreative liberty` (procreative-liberty, unsigned) |
| library-title | `the red button thought experiment is monstrous` (red-button-repugnant, unsigned) |
| library-title | `you would kill everyone` (red-button-repugnant, unsigned) |
| library-title | `revealed preferences show life is valued` (revealed-preference, unsigned) |
| library-title | `it can not propagate itself` (self-defeating, unsigned) |
| library-title | `even if true do not procreate can not be universal law it abolishes its own moral community` (self-effacing-under-universalization, unsigned) |
| library-title | `nazi eugenics` (slippery-slope-eugenics) |
| library-title | `social contract` (social-contract) |
| library-title | `if you use roads and hospitals` (social-contract) |
| library-title | `you can not know anyone else really suffers` (solipsism, unsigned) |
| library-title | `other minds are unprovable` (solipsism, unsigned) |
| library-title | `maybe everyone else is a philosophical zombie` (solipsism, unsigned) |
| library-title | `i only have access to my own experience` (solipsism, unsigned) |
| library-title | `other minds skepticism` (solipsism, unsigned) |
| library-title | `some people love their lives` (speak-for-everyone) |
| library-title | `hardship is what makes us who we are` (suffering-as-meaning) |
| library-title | `they all say they regretted jumping` (survivor-testimony) |
| library-title | `transhumanism` (transhumanist-objection, unsigned) |
| library-title | `your most extreme adherents prove the framework` (violence-as-reductio) |
| library-title | `this is one logical step from mass killing` (violence-as-reductio) |
| library-title | `look at what your followers actually do` (violence-as-reductio) |
| library-title | `the logical endpoint of this is catastrophe` (violence-as-reductio) |
| library-title | `your community has no brakes` (violence-as-reductio) |
| library-title | `virtue ethics` (virtue-ethics-flourishing, unsigned) |
| library-title | `human flourishing` (virtue-ethics-flourishing, unsigned) |
| library-title | `eudaimonia` (virtue-ethics-flourishing, unsigned) |
| library-title | `aristotle` (virtue-ethics-flourishing, unsigned) |
| library-title | `the good life is about excellence not pain avoidance` (virtue-ethics-flourishing, unsigned) |
| library-title | `why do not you just kill yourself then` (why-not-suicide) |
| library-title | `are you advocating ecological intervention to sterilize wildlife` (wild-animal-suffering-consistency, unsigned) |
| library-title | `if you do not intervene in predation you have an anthropocentric stopping point` (wild-animal-suffering-consistency, unsigned) |
| library-title | `what about brian tomasik and the s risk people` (wild-animal-suffering-consistency, unsigned) |
| library-title | `the crisp` (wild-animal-suffering-consistency, unsigned) |
| library-title | `belshaw reductio` (wild-animal-suffering-consistency, unsigned) |
| library-title | `either bite the was bullet or admit your framework is inconsistent` (wild-animal-suffering-consistency, unsigned) |
| library-title | `the demandingness objection at species extension scope` (wild-animal-suffering-consistency, unsigned) |
| page | `wuldink` |
| page | `archive` |
| page | `load bearing` |
| page | `the easiest case` |
| page | `nothingist` |
| page | `coda` |
| page | `legal personal disclaimers` |
| page | `a life inside` |
| page | `alogically is` |
| page | `the architecture of moral disaster` |
| page | `sanguinolentum vestigium` |
| page | `frame` |
| page | `gap dweller` |
| page | `gore` |
| page | `main character` |
| page | `mascot yurei` |
| page | `original character` |
| page | `other` |
| page | `the tall one` |
| page | `the wrong thing` |
| page | `the workshop` |
| page | `illogically is` |
| page | `illogically is the apparatus` |
| page | `music` |
| page | `write your thoughts` |
| page | `preface` |
| page | `recommendations` |
| page | `if the site will not load` |
| page | `violence as reductio` |
| aux-wing-id | `assisting is complicity` (assisting-is-complicity) |
| aux-wing-id | `autonomy illusion` (autonomy-illusion) |
| aux-wing-id | `coercion of the vulnerable` (coercion-of-the-vulnerable) |
| aux-wing-id | `compensational bridge fork2b` (compensational-bridge-fork2b) |
| aux-wing-id | `expressivist` (expressivist) |
| aux-wing-id | `irreversibility precaution` (irreversibility-precaution) |
| aux-wing-id | `kantian duty to self` (kantian-duty-to-self) |
| aux-wing-id | `medical integrity` (medical-integrity) |
| aux-wing-id | `palliative care sufficiency` (palliative-care-sufficiency) |
| aux-wing-id | `resource diversion` (resource-diversion) |
| aux-wing-id | `sanctity of life` (sanctity-of-life) |
| aux-wing-id | `slippery slope headline` (slippery-slope-headline) |
| aux-wing-id | `social contagion` (social-contagion) |
| aux-wing-id | `temporary problem` (temporary-problem) |
| aux-wing-id | `welfare substitution` (welfare-substitution) |
| aux-wing-id | `distress does not defeat capacity` (distress-does-not-defeat-capacity) |
| aux-wing-id | `gender self determination is the default` (gender-self-determination-is-the-default) |
| aux-wing-id | `irreversibility does not foreclose the right` (irreversibility-does-not-foreclose-the-right) |
| aux-wing-id | `origin does not void voluntariness` (origin-does-not-void-voluntariness) |
| aux-wing-id | `regret does not foreclose the right` (regret-does-not-foreclose-the-right) |
| aux-wing-id | `the firewall does not misfire` (the-firewall-does-not-misfire) |
| aux-wing-id | `the limiting principle is the self regarding line` (the-limiting-principle-is-the-self-regarding-line) |
| aux-wing-id | `the permission conscripts no one` (the-permission-conscripts-no-one) |
| aux-wing-id | `the preservation duty is gerrymandered` (the-preservation-duty-is-gerrymandered) |
| aux-wing-id | `the right does not turn on the metaphysics` (the-right-does-not-turn-on-the-metaphysics) |
| aux-wing-id | `better off existing` (better-off-existing) |
| aux-wing-id | `hands are not clean` (hands-arent-clean) |
| aux-wing-id | `makes no difference` (makes-no-difference) |
| aux-wing-id | `nature needs no defense` (nature-needs-no-defense) |
| aux-wing-id | `no one to wrong` (no-one-to-wrong) |
| aux-wing-id | `plants feel pain` (plants-feel-pain) |
| aux-wing-id | `we rank above` (we-rank-above) |
| void | `aesthetic texture` |
| void | `apophatica` |
| void | `biological thermodynamic` |
| void | `camera process` |
| void | `celestial deep field` |
| void | `clinical abjection` |
| void | `color grade` |
| void | `compositional grammar` |
| void | `cyborg synthetic` |
| void | `figure exposed` |
| void | `figure subject` |
| void | `hell infernal` |
| void | `infrastructure ruin` |
| void | `lighting atmosphere` |
| void | `liminal space` |
| void | `luminous void` |
| void | `mascot yūrei veiled` |
| void | `monster creature` |
| void | `normative ironic` |
| void | `psychogenic dissociation` |
| void | `sound duration` |
| void | `succubus domestic infernal` |
| void | `under skin black void` |
| void | `void dissolution` |
| library-keyword | `ableist` (ableist-objection) |
| library-keyword | `disability` (ableist-objection) |
| library-keyword | `disabled` (ableist-objection) |
| library-keyword | `eugenics` (ableist-objection) |
| library-keyword | `quality of life` (ableist-objection) |
| library-keyword | `ableism` (ableist-objection) |
| library-keyword | `handicap` (ableist-objection) |
| library-keyword | `adopt` (adoption-instead) |
| library-keyword | `adoption` (adoption-instead) |
| library-keyword | `foster` (adoption-instead) |
| library-keyword | `orphans` (adoption-instead) |
| library-keyword | `already born` (adoption-instead) |
| library-keyword | `ai dangerous` (ai-fear) |
| library-keyword | `destroy humanity` (ai-fear) |
| library-keyword | `control ai` (ai-fear) |
| library-keyword | `existential risk` (ai-fear) |
| library-keyword | `alignment` (ai-fear) |
| library-keyword | `rogue ai` (ai-fear) |
| library-keyword | `terminator` (ai-fear) |
| library-keyword | `skynet` (ai-fear) |
| library-keyword | `biological chauvinism` (ai-fear) |
| library-keyword | `animals` (animals-reproduce) |
| library-keyword | `natural order` (animals-reproduce) |
| library-keyword | `all species` (animals-reproduce) |
| library-keyword | `biology` (animals-reproduce) |
| library-keyword | `instinct` (animals-reproduce) |
| library-keyword | `observer` (anthropic-principle, unsigned) |
| library-keyword | `consciousness` (anthropic-principle, unsigned) |
| library-keyword | `cosmic` (anthropic-principle, unsigned) |
| library-keyword | `anthropic` (anthropic-principle, unsigned) |
| library-keyword | `universe needs` (anthropic-principle, unsigned) |
| library-keyword | `meaning of universe` (anthropic-principle, unsigned) |
| library-keyword | `witness` (anthropic-principle, unsigned) |
| library-keyword | `significance` (anthropic-principle, unsigned) |
| library-keyword | `participatory` (anthropic-principle, unsigned) |
| library-keyword | `hate people` (antinatalism-misanthropic) |
| library-keyword | `misanthropic` (antinatalism-misanthropic) |
| library-keyword | `psychopath` (antinatalism-misanthropic) |
| library-keyword | `hateful` (antinatalism-misanthropic) |
| library-keyword | `cruel` (antinatalism-misanthropic) |
| heading | _… 142 more in the JSON_ |
| library-keyword | _… 582 more in the JSON_ |

## 8 Help intents

| input | routes to | lane | response (first 90 chars) |
|---|---|---|---|
| `help` | `mg-oracle-help-01` | response | Not a menu. I answer for what this is, where the pages sit, and objections that were argue |
| `help me` | `mg-need-help-01` | response | Depends which kind. Site directions I hold — ask and I point. If it's the heavier kind, sa |
| `what can i ask` | `mg-oracle-help-01` | response | Not a menu. I answer for what this is, where the pages sit, and objections that were argue |
| `what can i ask you` | `mg-oracle-help-01` | response | Not a menu. I answer for what this is, where the pages sit, and objections that were argue |
| `what can you do` | `mg-oracle-help-01` | response | Not a menu. I answer for what this is, where the pages sit, and objections that were argue |
| `what do you do` | `mg-oracle-help-01` | response | Not a menu. I answer for what this is, where the pages sit, and objections that were argue |
| `commands` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `list commands` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `menu` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `options` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what do you know` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what should i ask` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what can i say` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `how does this work` | `mg-how-work-01` | response | Scripted, start to finish. A fixed set of lines and a deterministic rule for choosing one  |
| `how do i talk to you` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what are you for` | `mg-what-are-you-01` | response | A projection of a writer, running his voice off a fixed record. Not him. Close enough to t |
| `what is this` | `mg-what-is-protocol-01` | response | The Successor Protocol is the apparatus behind me — a canon of one man's positions and reg |
| `instructions` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `topics` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what can we talk about` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `give me a list` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `show me what you can answer` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `?` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `hello what can you do` | `mg-oracle-help-01` | response | Not a menu. I answer for what this is, where the pages sit, and objections that were argue |
| `can you help` | `mg-need-help-01` | response | Depends which kind. Site directions I hold — ask and I point. If it's the heavier kind, sa |
| `help please` | `mg-need-help-01` | response | Depends which kind. Site directions I hold — ask and I point. If it's the heavier kind, sa |
| `need help` | `mg-need-help-01` | response | Depends which kind. Site directions I hold — ask and I point. If it's the heavier kind, sa |
| `i need some help` | `mg-need-help-01` | response | Depends which kind. Site directions I hold — ask and I point. If it's the heavier kind, sa |
| `what do you cover` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what questions can i ask` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what can you answer` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |
| `what are the rules` | `mg-deflect-01` | deflection | That's off the path I keep. I answer for what this is and where it leads; past that, the w |

## 9 Dynamics

- `hello` ×3 on one matcher: `mg-greet-01` → `mg-repeat-01` → `mg-deflect-01`
- `hello` spaced five distinct turns apart ×3: `mg-greet-01` → `mg-greet-03` → `mg-greet-01`
- `hi`, five distinct turns, `hi`: `mg-greet-01` → `mg-greet-04` — can any schedule of three `hello`s reach `mg-greet-04` (the Latin greet)? **no**.
- Rephrase within the 8-turn dampening window (form A then form B of the same entry, one matcher): 182 entries → same entry 29 · deflection 135 · a different entry 18.

fatal assertions: 0
