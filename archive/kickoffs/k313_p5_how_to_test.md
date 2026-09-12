# P5 — two ways to look at it

## 1. The paste-in snippet — works on the LIVE site right now

`wuld_live_test.js`. Open any library page, F12 → Console, paste, Enter.

This is the whole layer inlined — palette, type scale, bezel, glow, magnifier, **and now sound** — so
it does not need
the new files and does not care that the site has not been pushed yet. It works on
`library.wuld.ink` exactly as it stands today. Verified against an un-integrated page: all three
stylesheets byte-identical to the build, stage built by the fallback, **0 of 601 text elements below
WCAG AA**, no console errors.

```
Power button (chin, bottom-right)   descends:  vfx -> cosmetic -> off -> vfx
Magnifier                           SHIFT + scroll, or the ⌕ button. 1x–4x.
Exit the magnifier                  Escape, or the ⌕ button again
Sound on / off                      the ● button, left of the magnifier
Tutorial for this view              the ? button, leftmost in the chin
Reset the remembered tier           localStorage.removeItem('wz-tier')
Reset the remembered mute           localStorage.removeItem('wz-muted')
Replay every tutorial               Object.keys(localStorage).filter(k=>k.startsWith('wz-tour:'))
                                      .forEach(k=>localStorage.removeItem(k))
```

### The tutorials

Each view has its own short walkthrough that runs **once per browser**, the first time you open that
view — the library, and on the flagship also the mechanism web, the dependency graph, the argument
flow map and the examples view. Three steps each; the library's is longer because it introduces the
chin controls as well. Skip and Escape work at every step, arrow keys move both ways, and clicking
anywhere off the card ends it. Nothing runs under `prefers-reduced-motion`.

Because it is once per browser, it will not appear again after your first look — which reads as "it
broke" unless you know the way back. Two ways back:

- the **?** button in the chin, which runs the tutorial for whatever view is in front of you
- `wzTour()` in the console, which does the same thing

To see them all fresh again, clear the keys with the line in the table above and reload.

### About the sound, on the live site specifically

The snippet fetches its sounds from `/sfx/`, **which is not on `library.wuld.ink` until the sfx
deploy lands**. So on the live site today the page will be silent — and the script says so, in the
console, in amber:

> `SFX: /sfx/ NOT on this host yet - the page will be silent. That is the deploy not having landed,
> not the sound layer failing.`

Once `P5_deploy_sfx.ps1` has run and you have pushed, the same paste prints the green line instead
and the first click on a card or `<summary>` unlocks audio. This distinction is deliberate: a silent
page and a broken page look identical, and guessing between them is not a test.

Sound is gated the same way the glow is — **vfx tier, dark ground, motion allowed, not muted**. Step
the power button down once, or switch to LEGIBLE, and the ambience fades out and the clicks stop. It
will not make a sound before your first click, by autoplay policy, and it makes none at all under
`prefers-reduced-motion`.

Tune anything live, no reload:

```js
var R = document.documentElement.style;
R.setProperty('--wz-pan','3px');          // camera travel ('0px' disables)
R.setProperty('--wz-glow-mix','65%');     // plain-text glow
R.setProperty('--wz-tint','#FF8195');     // warm cast: LED rose .. #FFA85C amber
R.setProperty('--wz-grille-max','.25');   // phosphor strength at full zoom
R.setProperty('--wz-zoom-max','6');       // how far the magnifier goes
```

## 2. The actual committed files — needs a local server

**Double-clicking the HTML will not work**, and it is worth knowing why rather than wondering. The
pages link `/wuld-layer.css` — an absolute path. Under `file://` that resolves to the root of your C:
drive, not the repo, so the layer silently never loads. The wings also fetch their corpus JSON, which
`file://` blocks outright, so you would get an empty page with no styling and no error you could act
on.

Serve the repo root instead:

```powershell
cd 'C:\Users\y_m_a\Projects\efilist-argument-library'
python -m http.server 8080
```

then open `http://localhost:8080/right-to-die/combined.html`. Ctrl-C in the terminal stops it.

Verified on an exact replica of the repo layout: stylesheet loaded, script ran, tier at vfx, the
stage wrapper coming from the markup as `BODY child #0`, magnifier present, all 17 objections
loaded, zero errors.

**The difference between the two routes** is only *how* the layer arrives. Route 1 injects it and
builds the stage wrapper itself; route 2 is the real thing, with the wrapper in the markup — which is
what makes CLS 0.000 instead of a visible reflow on load. Everything else is identical.

## What is not live

All three commits — `9077927`, `09665d9`, and the sfx one once you run `P5_deploy_sfx.ps1` — are
**local**. Cloudflare Pages deploys on push, so
`library.wuld.ink` is still the old build until you `git push`.

Also sitting untracked in that repo: a `CLAUDE.md`. Not mine, and not staged by either block — but a
stray untracked file in a deploy repo is worth knowing about.
