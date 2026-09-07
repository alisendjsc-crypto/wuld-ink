# "." — YouTube upload checklist

## Before anything goes public (blockers, in order)
1. **Fill the 14 artist names** in `dot\press\dot_sources.json`, then `py build_dot_apparatus.py --root "<root>"` — the page refuses to read as publishable until every cascade source has its artist. The downloads carry no ID3 tags; only you know these.
2. **The film goes first.** "." is released after *Illogically Is*, never before.
3. **The two links in the description must resolve** before the switch to Public: `https://wuld.ink/illogically-is/dot/apparatus` (put `dot-apparatus.html` there, the `.md` beside it) and `https://wuld.ink/illogically-is`. If the site uses other paths, edit the two lines in `description.txt`.

## The files (this folder)
- `dot_master.mp4` — the upload. 1920x1080, 24000/1001, H.264 crf 16, AAC 256k, 4:57.8. Verified RESULT OK against the clock; do not re-encode it.
- `thumbnail.jpg` — 1280x720, the dot at macro (`cover_text.jpg` and `cover_room.jpg` are the alternates).
- `description.txt` — paste whole. The warning is the first line and stays first.
- `tags.txt` — paste whole (under YouTube's 500-character total).
- `dot.srt` — English captions (sound description + the one sentence). Upload under Subtitles → English.
- `dot-apparatus.html`, `dot-apparatus.md` — the credits page for the site, not for YouTube.
- `stills\` — six 1080p frames for press and the site.

## Settings
- **Title:** `"."` (with the quotes — YouTube needs at least one visible character and a bare period vanishes in some views). If you want it findable at all: `"." — a companion to Illogically Is`.
- **Audience:** not made for kids. **Age restriction:** none required; your call given the screaming.
- **Altered or synthetic content:** answer **No**. The disclosure covers realistic synthetic media of real people or events. This is a physically-based render of a wall, and the constructed voice is no one's; the description already says so.
- **Category:** Film & Animation. **Language:** English. **License:** Standard YouTube. **Captions:** `dot.srt`.
- **Visibility:** Unlisted first. Watch it once on YouTube itself (their encode adds banding to the darkest floor — if it is ugly, the master has the headroom for a `-crf 14` re-encode). Then Public after the links resolve.
- **Comments / embedding:** your call. **Monetization:** off.

## What will happen
- **Content ID will claim both songs** (164 s of Rose Tinted World, 293 s of Voices Within). Expect it; do not dispute it; a claim on an unmonetised film costs nothing but a notice. The nineteen cascade recordings are torn past recognition and will not match.
- After it is live: paste the YouTube URL into the Apparatus page's link line and onto the film page; Vimeo (a crf-22 copy) and the Internet Archive (the master + `dot.srt` + `dot-apparatus.md`) follow, as with the film.

## If the sound changes later
The picture does not need re-composing for a sound change: remake `dot\dot_bed.wav` (`python3 mix_dot_bed.py`, or your own Vegas export), then on the host
`py compose_dot.py --root "<root>" --mix "<root>\dot\dot_bed.wav" --point-track dot_point_track.json --point-floor 2.8 --shake dot_shake.json` and `py verify_dot.py --root "<root>"`.
