# Project Baton — instructions for the receiving Claude

**Read this whole file once (it is short). Then do exactly what the "Your task" section says. Do not over-deliver.**

## Context

Josiah maintains a *primary* Claude session (in Cowork) that holds a master index of his projects. You are not that Claude. Your job is to **hand off a compact summary of THIS project** so that primary Claude can ingest it without bloating its context.

## Your task

Produce **one filled-in summary block** using the template below, describing the project this conversation has been about. Then stop. Do not include preamble, explanation, or follow-up offers — just the block.

## Hard rules

1. **Do not re-read the entire conversation or any uploaded files in this project.** Use what is already in your working memory. If you genuinely don't know a field, write `unknown` — that is more useful than a guess.
2. **Total length cap: 200 words across the whole block.** Compression is the point. If you go over, cut.
3. **No marketing voice.** No "exciting," "innovative," "ambitious." Plain description. If the project is stalled, say stalled.
4. **One project per file.** If this conversation covers multiple projects, summarize only the dominant one and add a one-line note: `OTHER PROJECTS TOUCHED HERE: [names].`
5. **Output the block verbatim in the format below — same field names, same order — so it can be parsed downstream.**

---

## Template — fill this in and return it as your entire response

```
PROJECT NAME: 
MEDIUM: (e.g. short film, game, essay collection, software tool, music, etc.)
STATUS: (alive / orbiting / shelved / dormant / dead — pick one, no hedging)
LAST TOUCHED: (rough date or "months ago" / "this week" — whatever you can infer)
PURPOSE: (one sentence — what is this for, what is it trying to be?)
CURRENT STATE: (one or two sentences — how far along, what exists, what doesn't)
BLOCKERS: (the actual reason it isn't moving — be honest, not diplomatic)
NEXT MEANINGFUL STEP: (one concrete action that would move it, OR "none — needs to be shelved or killed")
PULSE: (1–10 — how alive does this still feel to Josiah, based on the conversation's tone? 1 = corpse, 10 = on fire)
NOTES: (optional, ≤ 30 words — anything the primary Claude would lose without)
```

---

## Example of a good filled block (for calibration only — do not copy)

```
PROJECT NAME: NothinGist (short film)
MEDIUM: short film + companion script
STATUS: orbiting
LAST TOUCHED: ~14 months ago
PURPOSE: A short experimental piece exploring anomic identity through a fictional corporate persona (W.U.L.D. Inc.).
CURRENT STATE: Script drafted and uploaded to Drive; no further production work. Existing video on YouTube.
BLOCKERS: No production resources committed; unclear whether this is a finished artifact already or a seed for something larger.
NEXT MEANINGFUL STEP: Decide whether the existing YouTube version IS the finished work. If yes, mark complete and move on.
PULSE: 3
NOTES: Tied thematically to other nihilism-adjacent work (see Drive folder).
```

---

**Reminder before you respond: output ONLY the filled-in block, no preamble.**

---

## Filled block — Illogically Is / Alogical Isness

```
PROJECT NAME: Illogically Is / Alogical Isness (essay-film)
MEDIUM: essay-film (video) + Python bridge tooling for Cowork-assisted editing
STATUS: alive
LAST TOUCHED: 2026-04-24 (session 5, same-day burst)
PURPOSE: Hour-long essay-film treatise on metaphysical nihilism, composed against a fixed 35:53 ElevenLabs TTS narration spine, citing reference cinema as source material rather than mood.
CURRENT STATE: DaVinci Resolve timeline imported and verified. Three bridges built and working: asset_surveyor.py, script_to_edl.py, storyboard_to_xml.py. Populated storyboard.yaml with 37 clips across 10 sections (8 gap placeholders). V1/V2/V3 + A1 spine + 11 markers all land correctly in DaVinci.
BLOCKERS: None mechanical — pipeline is verified end-to-end. Remaining work is curatorial: refining source-clip in/out points against actual viewing, deciding music underlay strategy, triaging gap acquisitions (Mirror, 2001, Koyaanisqatsi, Tree of Life, etc.). Section 9 is 100% gaps.
NEXT MEANINGFUL STEP: Solo viewing pass against storyboard.yaml's first-draft timecodes; refine; re-run bridge v3; re-import.
PULSE: 9
NOTES: Companion to but distinct from Alogical Isness book. Phantom <name>→<n> patch retired session 5. Manual marker nudges live only in .drp; motivates silencedetect v2.
```
