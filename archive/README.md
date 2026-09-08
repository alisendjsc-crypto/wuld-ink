# archive/

Session material that is finished but should not be lost. Nothing here is served, built,
or read by any tool — it is the record, kept so a later session can **re-derive rather than
inherit** (cclxii: a pin you copy is a pin you did not measure).

| folder | what goes in |
|---|---|
| `kickoffs/` | session kickoffs, next-session prompts, strata, reviews, rulings, seat correspondence (TX receipts) |
| `ship-scripts/` | the operator PowerShell block each session actually shipped with — base/result md5 guards, staged-count gates, deploy verification |
| `measurement/` | one-off instruments: the `.cjs` / `.py` scripts that produced a measured claim, kept so the claim can be re-run |

**Why the ship scripts are here.** Every PowerShell hazard in `CLAUDE.md` (the `curl` alias,
`-o $null`, `Select-String -AllMatches` under `-SimpleMatch`, the `H` helper colliding with
`Get-History`, array-literal paste collapse, `.NET` relative paths, cwd anchoring) was found
in one of these files. The corpus is the only place that history exists — the shipped bytes
are in git, but the gates that let them ship are not.

**Naming.** `k<NNN>_<what>.<ext>`. Session numbers are the `K` strata in `CLAUDE.md`.
`_SUPERSEDED` marks a file kept only because something later corrected it; `_SHIPPED` marks
the variant that actually ran.

**This is a public repository.** Nothing goes in here that would not be published: no keys,
no tokens, no third-party material. Screenshots and payload copies do not belong here either —
the payloads are already in git history, and the findings are in the strata.
