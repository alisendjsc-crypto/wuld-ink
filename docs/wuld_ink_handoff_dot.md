# Handoff to the WULD INK project — "." : its Apparatus page and its home on wuld.ink

Written 2026-09-06 by the Video Editing project (Claude, "." session 3) for whoever works on the site. Josiah decides; this is what exists, where it is, what the site needs to do, and what must happen first. It is the sibling of `wuld-ink-handoff-illogically-is.md` and hangs under it.

## 1. What this is, in five lines

"." is a finished 4:57.8 companion short to *Illogically Is* — the film's last character (the period of HAEC VERBA MENTIUNTUR) given a wall: one shot, a camera pulling back from a painted dot until the wall is past any human scale, the film's own sentences flooding the plaster, one interruption, the dot returning alone. **It is released after the film, never appended to it.** Like the film it carries no credits by design; its credits, sources, method and verification live in one document, **the Apparatus**, which the YouTube description links to at:

    https://wuld.ink/illogically-is/dot/apparatus

That URL is the contract (the description also links `https://wuld.ink/illogically-is`, the film's page). Both must resolve before the video goes public, or the two lines in `description.txt` get changed to whatever the site actually uses — tell Josiah the final URLs; the edit is two lines.

## 2. The files

**In this repo: `docs/dot-handoff/`** — everything the site needs, copied here so no other folder has to be connected. The originals live at `C:\Users\y_m_a\Desktop\Select\Illogically Is\dot\press\` (the 1080p stills are PNGs there; here they are 1280x720 JPEGs), and `Downloads\dot_release\` gets the release copy when the master run finishes. Placement inside `src/` is yours: this folder is an inbox, not a deploy.

| File | What it is | Notes |
|---|---|---|
| `dot-apparatus.html` | **The Apparatus, the page to publish** (~15 KB) | Self-contained: inline CSS, no scripts, no external assets. Light and dark via `prefers-color-scheme`. Tables scroll horizontally on narrow screens. Asks for "IBM Plex Mono" / "IBM Plex Serif" with system fallbacks — the same families the film's Apparatus asks for, so the site's `@font-face` covers it. The H1 is a single period, set large, on purpose. |
| `dot-apparatus.md` | The same text as Markdown | For reference or a CMS; the HTML is the canonical rendering. |
| `dot_sources.json` | The data behind the credits tables | **Not ready: 14 of the 19 cascade sources have no artist yet.** The page renders a red "to confirm" in every gap and a line saying it is not ready to publish. Josiah fills the JSON; `py build_dot_apparatus.py --root "<film root>"` regenerates both files. Do not hand-edit the tables. |
| `description.txt` | The YouTube / Vimeo description (final) | The warning is the first line and stays first, everywhere. Reusable as the page's copy. |
| `tags.txt` | The YouTube tags | Not for the site. |
| `dot.srt` | English captions (sound description + the one sentence) | Goes to YouTube and the Archive; the site does not need it. |
| `UPLOAD-CHECKLIST.md` | The YouTube settings and the order of operations | For Josiah, not the site. |
| `cover_points.jpg` / `thumbnail.jpg` | 1280×720, the dot at macro — **the cover image for the site** | `cover_text.jpg` (the wall as text) and `cover_room.jpg` (a refrain in the plaster, 205 s) are the alternates. |
| `stills/still_1 … still_6` | Six frames the film made (1280×720 here; 1920×1080 PNGs at the source) | For the page and press. |

Generators, if anything changes: on the film's root under `dot\` — `build_dot_apparatus.py` reads the clock, the plans, the QC and `dot_sources.json`, so the page cannot drift from the work. Ask the Video Editing project to regenerate rather than hand-editing; the prose can be hand-edited.

## 3. What the site needs to do

1. **Publish the Apparatus** at `/illogically-is/dot/apparatus` — on Cloudflare Pages, `illogically-is/dot/apparatus/index.html` in the deploy, the `.md` beside it. Wrap it in the site's chrome if you like, but do not restyle the content; the register (black / near-white / Plex / the one red) is the film's own, shared with the film's Apparatus.
2. **A link line at the top once the links exist** (Josiah supplies them): `The film: YouTube · this document as Markdown`, with Vimeo / Internet Archive added when they exist. Nothing else on the page changes.
3. **A page for the short** at `/illogically-is/dot/` — the same shape as the film's page, chrome-less like its sibling: the cover, **the warning verbatim and first** (from `description.txt`), the YouTube embed as a click-to-play facade (never autoplay), the paragraph from the description, four to six stills, the link to its Apparatus and to the film's page. **No credits anywhere on the site that are not in the Apparatus** — no "music by", no "starring". "Voice: none" is the wording. The film's page should carry one line pointing here, after the short is public — not before.
4. **Photosensitivity.** "." has one white frame and three cuts to black and no strobe — lighter than the film, but the same rule: nothing from it auto-plays, and the warning sits above the player.
5. **Corrections channel.** The Apparatus invites corrections and claims ("will be made on this page"); the existing `/contact/` route serves. When a credit changes, the JSON changes and the page is regenerated.

## 4. Order of operations (binding)

1. The film, *Illogically Is*, goes public first. "." waits.
2. Josiah fills the 14 artists; the Apparatus is regenerated and stops marking itself unpublishable.
3. The site publishes `/illogically-is/dot/apparatus` (and the short's page, if it is ready; it is not required for the switch).
4. The YouTube video goes from Unlisted to Public. **The current unlisted upload (`youtu.be/O4SQua3I5iQ`) is the viewing copy, not the master** — the master is uploaded as a new video when the release run finishes, and the ID changes. Do not hard-code the ID until Josiah gives the final one.
5. Vimeo and the Internet Archive follow; the link line gets those URLs.

## 5. Where this came from

The Video Editing project holds the short's canon (`dotcanon-v0_4.md` and later), the worklogs, the generators and the verification record (`dot_qc.txt`, 30 checks). Anything about the short's content, numbers or method is answered there; anything about the site is yours.
