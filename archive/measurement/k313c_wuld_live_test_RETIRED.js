/* ============================================================================
   WULD.INK presentation + cosmetic layer -- LIVE TEST
   Paste into the console on any library page (F12 -> Console). Works on the
   flagship /combined, on every wing, and on /troubleshooting/.
   Nothing is saved to the page; reload to remove it.

   THE POWER BUTTON DESCENDS:  vfx -> cosmetic -> off -> vfx
   It starts at vfx and remembers where you left it, per browser.
     Reset with:  localStorage.removeItem('wz-tier')

   THE MAGNIFIER:  hold SHIFT and scroll, or click the magnifier button in the
   chin. 1x to 4x, anchored to the pointer. Escape or the button returns to 1x.
   The phosphor grille is at zero opacity until you start zooming.

   WHAT IS ALWAYS ON (no tier, no JS needed on a real deploy): the palette and
   type scale. Every text colour clears WCAG AA on every ground, and the wings'
   sub-10px text is gone. Stepping the power button to off keeps those and
   removes only the cosmetics.

   THE GLOW FOLLOWS THE BACKGROUND, NOT THE MODE NAME. Live wherever the ground
   is dark -- standard, legible, high-contrast, both -- and silent on the cream
   grounds. The mode name does not predict which is which: the flagship is dark
   in legible and cream in high-contrast; the umbrella is the reverse.

   Tune live, no reload:
     var R = document.documentElement.style;
     R.setProperty('--wz-pan','3px');          // camera travel ('0px' disables)
     R.setProperty('--wz-glow-mix','65%');     // plain-text glow
     R.setProperty('--wz-tint','#FF8195');     // warm cast: LED rose .. #FFA85C
     R.setProperty('--wz-grille-max','.25');   // phosphor strength at full zoom
     R.setProperty('--wz-zoom-max','6');       // how far the magnifier goes
   ============================================================================ */
(function(){
  document.querySelectorAll('.wz-frame,.wz-chin,.wz-vig,.wz-grille,.wz-soft-l,.wz-soft-r,.wz-hint,#wz-css-t,#wz-css-b,#wz-css-v')
    .forEach(function(e){e.remove();});
  document.documentElement.classList.remove('wz-on','wz-vfx','wz-lightbg','wz-zoomed','wz-mag-on','wz-zooming');
  document.documentElement.style.setProperty('--wz-zoom','1');
  function style(id, txt){ var s=document.createElement('style'); s.id=id; s.textContent=txt;
                           document.head.appendChild(s); }
  style('wz-css-t', `/* wuld-type.css -- shared presentation tokens for library.wuld.ink
 *
 * PART A: THE PALETTE. Four declarations, and they fix 473 failing elements per wing.
 *
 * THE FIRST ATTEMPT AT THIS FILE WAS A SELECTOR LIST and it was the wrong mechanism -- exactly the
 * failure wuld-vfx.css carries a comment warning about. It enumerated .rsi-axis-label, .rwe-byline,
 * .lbl, .kw and a dozen more, harvested from a probe's top-3-per-colour output, and it moved the
 * wing from 78.7% of elements below WCAG AA to 40.9%. Half the page, because a list of names can
 * only ever reach the names on it. The largest remaining group was 175 unclassed <span>s inside
 * div.kw -- and div.kw sets no colour at all, so they were inheriting from somewhere the list did
 * not go.
 *   The page does not style by selector. It styles by VARIABLE: nine of them in :root, redefined
 * per mode. Every one of the six surfaces -- right-to-die, abortion, veganism, transgenderism,
 * anthropocentrism, and the libraries umbrella -- declares the identical nine names. So the fix is
 * to redefine the variables, which reaches every element in every mode and cannot go stale, because
 * there is no list.
 *
 * MEASURED, all visible text >=3 chars, 1440x900, per mode, contrast against the painted ground:
 *
 *   mode            shipped                                    after
 *   STANDARD        dim 4.35!  faint 2.13!  accent 3.37!       dim 7.58  faint 5.28  accent 4.84
 *   legible                    faint 3.32!                               faint 5.06
 *   high-contrast   all pass                                   untouched
 *   both            all pass                                   untouched
 *
 * NOTHING THAT ALREADY PASSED WAS MOVED. legible's --dim (5.99) and --accent (6.40) clear AA and
 * are left exactly as designed; only --faint moves. Two of the four modes are not touched at all.
 * This is a correctness patch, not a re-design.
 *
 * WHY THESE VALUES. The ink is warm (#d8d4cc, #f0ebe5) so the dim tiers are warm too -- a neutral
 * grey reads cold beside it. They are chosen with headroom rather than at the 4.5 minimum: a
 * palette that scrapes the line fails again the next time a background moves one shade. And the
 * hierarchy survives: 13.31 > 7.58 > 5.28 is a wider, more legible ladder than 13.31 > 4.35 > 2.13,
 * which was drawing its bottom distinction between "dim" and "cannot be read".
 *
 * THE CRIMSON IS NOT SWAPPED FOR THE FLAGSHIP'S #FF3333. It is lifted in lightness with the hue
 * held -- #c41e3a -> #e83a56, 3.37:1 -> 4.84:1. The signature colour survives. --accent also draws
 * 1px hairlines, where contrast minima do not apply and where the change is imperceptible. */

/* SCOPING. The first version of this patch put the STANDARD values on :root and made LEGIBLE and
 * BOTH catastrophically worse -- BOTH went from 2.8% of elements failing to 81.5%. :root and
 * [data-mode="..."] carry the SAME specificity (0,1,0), so an injected :root that arrives after the
 * page's own mode blocks beats all of them, and the dark-ground values leaked onto the cream
 * grounds. Scope to the mode being fixed and nothing else; never restate a value that already
 * passes, so nothing here can drift out of sync with the page's own palette.
 *   This was caught only because the harness sweeps four modes on six surfaces rather than the one
 * mode being fixed. cccxxiv's counter-discipline, working: vary the property while holding the
 * mechanism fixed, and a regression you were not looking for shows up in a row you did not need. */
:root:not([data-mode]),
[data-mode="standard"]{
  --dim:    #a6a096;   /* was #7a766e -- 4.35:1, failing in 288 places per wing */
  --faint:  #88847c;   /* was #4a4742 -- 2.13:1, the worst text on the site */
  --accent: #ef3a58;   /* was #c41e3a -- 3.37:1 as text; hue held, lightness lifted */
}
/* /troubleshooting/ is NOT part of the nine-variable family -- its own palette (--ink #f0ebe5,
 * --dim #9a938b, --accent #c41e3a) sits on three grounds: #0a0a0a, --panel #141210 and --panel-2
 * #1b1815. Measured: --ink 16.7:1 and --dim 6.5:1 both clear everywhere and are left alone; only
 * the crimson fails, in six places, at 3.39 / 3.20 / 3.03.
 *   ONE CRIMSON FOR THE WHOLE LIBRARY. #e83a56 cleared the wings at 4.84 but dipped to 4.35 on
 * troubleshooting's deepest panel, which would have meant two reds. #ef3a58 clears every ground in
 * the library -- wings 5.07, and 5.11 / 4.82 / 4.56 here -- so there is one value, not a family of
 * near-identical ones that drift apart.
 *   Keyed to [data-mode="dark"], which cccxxiii called out as DECORATION on this page. That is
 * exactly why it is safe here: it identifies the page rather than standing proxy for a reader
 * preference, and it is the only page that carries it. The hazard is keying a rule to a name that
 * SUBSTITUTES for the property you care about; using an attribute as a page identifier, knowingly,
 * is a different thing. */
[data-mode="dark"]{ --accent: #ef3a58; }
[data-mode="legible"]{
  --faint:  #6b6559;   /* was #8a8275 -- 3.32:1 on the cream ground */
  /* GROUND IS NOT ALWAYS THE PAGE GROUND. --stub clears 4.56:1 against --bg (#f5efe6) and was read
   * as passing on that basis -- but .rwe>.lbl sits on --panel (#ebe3d4), where the same gold is
   * 4.09:1. Eight elements per wing, failing only where they happen to be inside a panel. Contrast
   * is a property of a PAIR, so a colour does not "pass"; it passes against a named ground, and a
   * palette with two grounds has to clear the darker one. Dropped to 84% lightness, hue held:
   * 5.96:1 on bg, 5.35:1 on panel. */
  --stub:   #71571b;   /* was #876820 */
}
/* [data-mode="high-contrast"] and [data-mode="both"] are deliberately absent: every value in them
 * already clears AA and changing a passing colour is not a fix, it is churn. */

/* THE ONE COLOUR THAT IS NOT A VARIABLE. .rsi-badge is hardcoded #6699CC in every mode -- it is the
 * only text colour on the page that does not come from the nine. On the dark grounds it is fine
 * (6.29:1). On the light ones it is 3.00:1 on white and 2.63:1 on cream, and it was the ONLY thing
 * still failing after the palette patch: 17 elements on right-to-die, 2.8-6.5% of every wing, and a
 * failure that predates this work rather than one it introduced.
 * Hue held, lightness dropped to 66%: #6699CC -> #436587, 6.09:1 on white and 5.33:1 on cream. Only
 * the light modes are touched; the dark ones keep the original blue exactly. */
/* !important IS REQUIRED AND IS NOT LAZINESS. The badge colour is set INLINE -- 17 style attributes
 * carrying a colour on right-to-die, exactly the 17 badges -- and an inline declaration outranks any
 * author-stylesheet rule at normal weight regardless of specificity. !important in a sheet is the
 * only thing that beats it. The count was sitting in an earlier probe's output ("inline style=
 * attributes: 102, of which set colour: 17") and went unread until the fix silently did nothing. */
[data-mode="legible"] .rsi-badge,
[data-mode="both"] .rsi-badge{ color:#436587 !important; border-color:#436587 !important; }


/* ==============================================================================================
 * PART B: THE TYPE SCALE. Filed at first as an aesthetic item. That was wrong, and the numbers say
 * so: the wings put the MAJORITY of their text elements below 10px, and the flagship essentially
 * never does.
 *
 *   surface         elements   under 10px            distinct sizes
 *   flagship            274    1  (0.4 pct)          5   (9, 10, 11, 13, 14)
 *   right-to-die        601  429 (71.4 pct)         12   (8.3 .. 16.3)
 *   veganism            296  187 (63.2 pct)         10
 *   libraries            45   22 (48.9 pct)          8
 *
 * 429 of 601 elements under 10px, 327 of them at exactly 9.92px, and 17 at 8.3px. Sub-10px is below
 * any practical reading floor, and it is the larger part of what the operator was seeing as "unique
 * awkward looking text" -- and of why the palette patch, which was real, was hard to SEE: 324 of its
 * 473 changed elements sit at 9.9px, and only 46 of them are above the fold of an 8,394px document.
 * A contrast fix on type this small is a compliance win before it is a reading one.
 *
 * THE SELECTOR LIST BELOW IS NOT INFERRED. It is every rule in the page's own stylesheet that sets a
 * font-size, extracted by parsing that sheet with comments stripped first -- 36 rules, bucketed by
 * computed px. Part A taught the lesson: a list assembled from a probe's top-N output reaches only
 * the names on it, but a list that IS the stylesheet's own font-size rules is exhaustive by
 * construction. If the page gains a rule, re-extract; never add names by hand.
 *
 * Expressed in rem, not px, so [data-mode="legible"]'s 17px root still scales them -- that is the
 * whole purpose of the mode, and px would silently defeat it.
 * Three sizes, mapped onto the flagship's: 10 / 11 / 13. */

:root{ --wt-s: .625rem;  --wt-m: .6875rem;  --wt-b: .8125rem; }

/* --- 10px: labels, badges, chips, meta (20 rules across all six surfaces) --- */
.badge,
.ctl-label,
.obj-access,
.kw span,
.diag .lbl,
.resp .lbl,
.rwe>.lbl,
.rwe-src a::after,
.rwe-byline,
.rwe-more summary,
.rwe-meta,
.mode-toggle button,
.resp-d>summary,
.rsi-badge,
.rsi-detail .rsi-axis,
.rsi-detail .rsi-formula,
.register-toggle button,
.obj.lay .lay-lbl,
.sources .lbl,
.lib-meta{ font-size:var(--wt-s); }

/* --- 11px: secondary (10 rules) --- */
.eyebrow,
.tab,
.chip,
.count,
.obj-meta,
.mech,
.permalink,
footer.site,
.sources,
.psych{ font-size:var(--wt-m); }

/* --- 13px: body (9 rules) --- */
.sub,
.notice,
.search input,
.diag,
.resp p,
.rwe-src a,
.rwe-quote,
.rwe-more p,
.lib-card p{ font-size:var(--wt-b); }

/* WEIGHT IS THE OTHER HALF. The wings are font-weight 400 on every element on the page; the flagship
 * uses 400 / 500 / 700 with heavy tracking as structure. That is WHY the wings had to reach for a
 * third dim tier at 2.13:1 to build hierarchy -- brightness was the only axis they were using. With
 * weight and tracking carrying it, one readable ink tier is enough, which is what Part A assumed. */
.resp p, .diag, .rwe-quote{ font-weight:500; }
.badge, .rsi-badge, .diag .lbl, .resp .lbl, .rwe>.lbl, .ctl-label, .obj-access{
  font-weight:700; letter-spacing:.1em;
}
/* TAP TARGETS. WCAG 2.5.8 (AA) wants 24x24. Audited on a wing: 91 of 122 interactive elements were
 * under it. Most of that count is INLINE prose links, which the success criterion explicitly
 * exempts -- a target "in a sentence or whose size is constrained by the line-height of non-target
 * text" is not required to meet the minimum, and padding them would only make hit boxes on adjacent
 * lines overlap. The block-level ones have no such excuse: <summary> measured 870x15, which is a
 * disclosure control 9px short of usable, x22 per page.
 * Padding only, no size change, so nothing about the type reflows. */
 * A bare \`summary\` rule reached only half of them: .resp-d>summary carries its own padding at
 * (0,1,1) specificity and kept its 2.4px, landing at 22px -- two short. Named explicitly, from the
 * stylesheet, same discipline as the font-size buckets above. */
summary{ padding-block:.3rem; }
.resp-d>summary, .rwe-more summary{ padding-block:.3rem; }
.permalink{ display:inline-block; padding-block:.24rem; }

/* Hard edges are the flagship's identity; 2-3px is the visible tell that a wing is a different site. */
.obj, .card, .panel, .diag, .resp, .chip, .kw span, .badge, .rsi-badge, .lbl,
.mode-toggle button, .register-toggle button, .tab, .search input{ border-radius:0 !important; }


/* ==============================================================================================
 * THE WARM CAST, AS COLOUR RATHER THAN AS A BLEND LAYER.
 * The brief was "give all of the text a subtle orangish tint, like the chin's LED panels have."
 * The first build did it with a fixed soft-light overlay and it cost half the frame rate -- see the
 * measurement in wuld-vfx.css. These are the same colours the overlay was producing, pre-mixed 16%
 * toward --wz-tint (#FF9A78) and written as literals, because color-mix() cannot reference the
 * variable it is redefining without a cycle.
 *
 * ONLY WHERE THE GLOW IS, AND ONLY AT THE VFX TIER: stepping the power button down to cosmetic or
 * off restores the neutral palette, because html.wz-vfx is in every selector. The light modes are
 * untouched -- warming a cream ground muddies it -- and so is high-contrast, deliberately: that mode
 * exists to maximise separation and a tint spends a little of it for a look.
 *
 * Every value re-checked against its own ground; the worst is --faint at 5.58:1, so the AA result
 * survives the warming with room to spare. */
html.wz-vfx:not([data-mode]),
html.wz-vfx[data-mode="standard"]{
  --fg:     #decbbf;   /* from #d8d4cc  12.55:1 */
  --dim:    #b49f91;   /* from #a6a096   7.78:1 */
  --faint:  #9b887b;   /* from #88847c   5.81:1 */
  --accent: #f2495d;   /* from #ef3a58   5.51:1 */
  --stub:   #c39236;   /* from #b8902a   7.01:1 */
}
html.wz-vfx[data-mode="dark"]{     /* /troubleshooting/, its own palette */
  --ink:    #f2ded4;   /* from #f0ebe5  15.25:1 */
  --dim:    #aa9488;   /* from #9a938b   6.88:1 */
  --accent: #f2495d;   /* from #c41e3a   5.55:1 */
}
`);

  style('wz-css-b', `/* wuld-bezel.css -- the monitor frame for library.wuld.ink
 *
 * GEOMETRY IS THE CORRECTED SET (handoff §1, after the 2026-09-10 correction). The earlier draft's
 * top lip of 20 px was BEZEL_CROP_TOP -- picture rows discarded off the top of the scaled footage,
 * not a bezel dimension -- and its 34 px was the chin's own depth rather than the whole band under
 * the picture. The tell was arithmetic: 20 + 1018 + 34 = 1072 against a 1080 frame. These close.
 *   film   1920x1080 frame, 1892x1018 opening, 14 px lip all four sides, chin adds 34 below
 *          14 + 1018 + 48 = 1080
 *   ratios side 0.740% of opening width | top 1.375% | bottom band 4.715% of opening height
 *
 * THE FILM CROPS; A PAGE MUST NOT. 46 picture rows are discarded in the film (20 top, 26 bottom).
 * A film frame is a fixed composition and can afford that. A page's top nav is functional, so this
 * builds the frame as an INSET -- the furniture is pushed in by the lip -- rather than as an overlay
 * painted over whatever happens to be at the viewport edge.
 */

:root{
  --wz-lip-x: 0.740vw;      /* side lip   */
  --wz-lip-y: 1.375vh;      /* top lip    */
  --wz-band:  4.715vh;      /* bottom band: lip + chin */
  --wz-body:  #0F0F11;      /* bezel body */
  /* INNER LIP. The handoff gives #191A1C-ish, measured off the film -- where the monitor is a small
   * bright object in a dark room. At full-screen 1:1 that same value is 11 luma above the bezel body
   * and effectively invisible; the frame read as a flat border, which §1 warns is the failure mode.
   * Re-derived by scanning the edge: body 15.1, and the lip line lands at
   *     #191A1C 25.9 (+10.8)   #2E3136 48.7 (+33.6)   #43474E 70.7 (+55.5)   #53585F 87.4 (+72.3)
   * #43474E reads as an edge at a glance without becoming a highlight. Same class of correction as
   * the bezel geometry: a film constant that does not survive the change of scale. */
  --wz-lip:      #43474E;
  --wz-lip-w:    1px;                       /* solid core -- thin; the ramp does the work */
  --wz-lip-mid:  rgba(67,71,78,.60);        /* first fall-off */
  --wz-lip-soft: rgba(67,71,78,.26);        /* second, reaching ~10px inward */
  --wz-led:   #FF8195;      /* idle. SPEC HEX, not eyedropped: the film renders (221,170,177),
                               which is the same hue at under half the saturation because only the
                               idle state was ever rendered and the render compresses it. */
  --wz-mark:  rgba(255,129,149,.62);
}

/* --- the frame ------------------------------------------------------------------------------- */
.wz-frame{
  position:fixed; inset:0; pointer-events:none; z-index:2147483000;
  border-style:solid; border-color:var(--wz-body);
  border-width:var(--wz-lip-y) var(--wz-lip-x) var(--wz-band) var(--wz-lip-x);
  /* Only the inward vignette lives on the frame itself now; the lip moved to ::before so its
   * gradient can face OUTWARD. */
  box-shadow: inset 0 0 26px 8px rgba(0,0,0,.5);
}

/* THE LIP FALLS OFF OUTWARD, ONTO THE FRAME -- NOT INWARD ONTO THE PICTURE.
 * The first ramp spread into the content, which reads as the screen being fogged at its edge. A real
 * bezel's inner lip catches light coming OFF the panel and scatters it onto the frame, so the bright
 * core sits exactly on the opening and the falloff runs outward across the bezel band.
 * Mechanically that needs a non-inset shadow: ::before is sized to .wz-frame's padding box, which IS
 * the content opening, so a plain box-shadow spreads outward into the border region and paints above
 * it (a child paints over its parent's border). Inset shadows can only ever go the other way, which
 * is why the first attempt faced the wrong direction. */
.wz-frame::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  box-shadow: 0 0 0 var(--wz-lip-w) var(--wz-lip),
              0 0 4px  calc(var(--wz-lip-w) + 1px) var(--wz-lip-mid),
              0 0 11px calc(var(--wz-lip-w) + 2px) var(--wz-lip-soft);
}

/* THE CHIN NEEDS ITS OWN LIP. The frame's ::before draws a lip on all four sides, but the chin is a
 * separate fixed element painted ABOVE the frame (z 2147483001 vs 2147483000), so it covered the
 * bottom one -- three edges lit and one dark. Its own edge sits at the chin's TOP, which is where the
 * opening is, and falls off DOWNWARD into the chin: same rule as the other three, away from the
 * picture. Absolutely positioned so it is not a flex item in the chin's own layout. */
.wz-chin::before{
  content:''; position:absolute; left:0; right:0; top:0; height:13px; pointer-events:none;
  /* A REAL GRADIENT, NOT STACKED SHADOWS. The first attempt wrote \`0 4px <blur>\` where the 4px is
   * box-shadow's OFFSET-Y, not its blur radius, so it painted two displaced bands instead of a ramp:
   * the scan read 15, 16, 22, 30, 22, 16 going down -- a second bright ring 4px below the edge.
   * A linear-gradient states the falloff directly and is monotonic by construction. */
  background:linear-gradient(to bottom,
    var(--wz-lip)      0,
    var(--wz-lip)      var(--wz-lip-w),
    var(--wz-lip-mid)  calc(var(--wz-lip-w) + 1px),
    var(--wz-lip-soft) 5px,
    transparent        100%);
}

/* --- the chin, and its furniture ------------------------------------------------------------- */
.wz-chin{
  position:fixed; left:0; right:0; bottom:0; height:var(--wz-band);
  pointer-events:none; z-index:2147483001;
  display:flex; align-items:center; justify-content:center; gap:4.2vw;
  background:var(--wz-body);
  font:500 clamp(9px,1.15vh,13px)/1 ui-monospace,"IBM Plex Mono",Menlo,Consolas,monospace;
  letter-spacing:.42em;
}
.wz-perf{                                   /* speaker perforation */
  width:4.6vw; height:38%; opacity:.5;
  background-image:radial-gradient(circle, var(--wz-mark) 34%, transparent 36%);
  background-size:0.30vw 0.30vw;
}
.wz-mark{ display:flex; align-items:center; gap:.30em; color:var(--wz-mark); }
/* THE ORNAMENT YIELDS TO THE CONTROLS. The chin row is now four 44px buttons reaching 194px from
   the right edge, and the centred wordmark runs under the leftmost of them below a measured 476px.
   The first threshold here was 420px -- derived when the row had THREE buttons and never re-derived
   when the fourth was added, so between 421 and 468px the ? button sat under the wordmark and
   chinfit never noticed, because it sampled 1440/768/390/320 and nothing in between. 500 leaves a
   margin over the measured clash rather than a coincidence. The mark is aria-hidden decoration; the
   buttons are the only route to the tier, the magnifier, the sound and the tutorial. */
@media (max-width: 500px){ .wz-mark, .wz-perf{ display:none; } }
.wz-led{                                    /* the periods ARE the status lights */
  width:.42em; height:.42em; border-radius:50%;
  background:var(--wz-led); opacity:.55;
  box-shadow:0 0 .45em .06em var(--wz-led);
  transition:opacity .18s linear, box-shadow .18s linear;
}
/* THE POWER BUTTON IS A 44px TARGET WEARING A SMALL GLYPH. Measured at 13x16 desktop and 12x15 on
 * a 390px phone -- under the 24x24 WCAG 2.5.8 floor and far under the 44x44 that a thumb needs. It
 * matters more than it looks: with the tier defaulting to vfx this is the ONLY way out of the
 * effect, and the first-visit hint points straight at it. The glyph stays its old size; the button
 * grows around it, centred, so nothing about the chin's look changes.
 *   The hit area is allowed to exceed the chin's height and overhang upward -- the chin is
 * pointer-events:none, so the overhang costs the page nothing and gives the thumb somewhere to
 * land on a short chin. */
.wz-power{
  position:absolute; right:max(1.0vw, 6px); bottom:50%; transform:translateY(50%);
  min-width:44px; min-height:44px;
  display:flex; align-items:center; justify-content:center;
  color:var(--wz-mark); opacity:.75; font-size:1.5em; line-height:1;
  pointer-events:auto; cursor:pointer; background:none; border:0; padding:0;
  border-radius:50%;
}
.wz-power:hover{ opacity:1; }
/* Focus must be visible on a near-black chin, and the UA's default \`outline:auto\` is not reliably
 * so. :focus-visible only, so a mouse click does not leave a ring behind. */
.wz-power:focus-visible{
  outline:2px solid var(--wz-led); outline-offset:-6px; opacity:1;
}

/* --- THE INSET. Without this the frame is an overlay and eats whatever is pinned to the edge. -- */
/* THE INSET GOES ON THE STAGE, NOT ON <body>. Measured: \`html.wz-on body{padding-inline:...}\` lost
 * the cascade outright -- computed padding-left came back 0px -- and even had it won, three elements
 * on the graph views (nav.rl-wing, nav.top-nav and the coda div) carry an explicit width:1440px and
 * would have escaped a padded parent anyway. The result was ~10 px of the coda text living under the
 * left lip: "ecause suffering", "emands more of us", "o: yes". The stage is this layer's own element,
 * so nothing competes for it. */
html.wz-on body{ padding-bottom:var(--wz-band) !important; }
html.wz-on .wz-stage{ box-sizing:border-box; padding-inline:var(--wz-lip-x); }
/* nav.top-nav is the ONLY pinned element on this page -- enumerated, not assumed: every
   fixed/sticky box touching a viewport edge at 1440x900 was listed, and there is one.
   It is sticky and spans edge to edge, so the BAR keeps its full width (correct under a bezel)
   and its CONTENTS are pushed in. Insetting \`top\` alone left "LIBRARY" reading as "IBRARY". */
html.wz-on nav.top-nav{
  top:calc(var(--wz-lip-y) + 2px);
  box-sizing:border-box;
  padding-left:calc(var(--wz-lip-x) + 6px);
  padding-right:calc(var(--wz-lip-x) + 6px);
}

@media (prefers-reduced-motion:reduce){ .wz-led{ transition:none; } }

/* The mute button, third in the chin's control cluster. 44px like the others, and offset to clear
 * BOTH of them -- the magnifier sits at +50px and is itself 44px wide, so anything under +100px
 * overlaps it. That arithmetic is the same mistake the magnifier made against the power button
 * (offset 42 against a 44px target, 2px of overlap at every width); once is a bug, twice would be
 * not reading the note. */
/* The way back into a tour once it has been seen. Fourth in the chin row rather than a top-of-page
   label, because the tours are the layer's own artefact and the layer's controls live here -- and
   because it runs the tour for the view in front of you rather than offering a menu of five. At
   320px the row now reaches 194px from the right edge, which is why the wordmark hides below 420. */
.wz-help{
  position:absolute; right:calc(max(1.0vw,6px) + 150px); top:50%; transform:translateY(-50%);
  width:44px; height:44px; display:flex; align-items:center; justify-content:center;
  background:none; border:0; cursor:pointer; padding:0;
  color:var(--wz-mark); opacity:.75; font:700 .95em/1 ui-monospace,"IBM Plex Mono",Menlo,monospace;
}
.wz-help:hover{ opacity:1; }
.wz-help:focus-visible{ outline:2px solid var(--wz-led); outline-offset:-6px; opacity:1; }
.wz-mute{
  position:absolute; right:calc(max(1.0vw,6px) + 100px); bottom:50%; transform:translateY(50%);
  min-width:44px; min-height:44px;
  display:flex; align-items:center; justify-content:center;
  color:var(--wz-mark); opacity:.75; font-size:.80em; line-height:1;
  pointer-events:auto; cursor:pointer; background:none; border:0; padding:0; border-radius:50%;
}
.wz-mute:hover{ opacity:1; }
.wz-mute:focus-visible{ outline:2px solid var(--wz-led); outline-offset:-6px; opacity:1; }
html.wz-muted .wz-mute{ opacity:.45; }

/* --- THE FIRST-VISIT HINT ----------------------------------------------------------------------
 * The tier defaults to vfx, so the reader did not ask for the effect -- which is the objection that
 * used to be answered by "it defaults to off", and is not any more. The answer now is that they are
 * TOLD, once, where the exit is. Shown once per browser session, above the chin, beside the button
 * it is pointing at.
 * It lives OUTSIDE .wz-stage, so it neither glows nor pans -- a hint that is hard to read because it
 * is participating in the effect it offers to turn off would be a joke at the reader's expense. */
.wz-hint{
  position:fixed; right:max(1.0vw,6px); bottom:calc(var(--wz-band) + 8px);
  z-index:2147483002; max-width:min(19rem, calc(100vw - 24px));
  display:flex; align-items:flex-start; gap:.5rem;
  padding:.55rem .65rem .55rem .8rem;
  background:#16161a; border:1px solid var(--wz-lip);
  box-shadow:0 2px 14px rgba(0,0,0,.55);
  color:#ddd8d0; font:400 12px/1.45 ui-monospace,"IBM Plex Mono",Menlo,Consolas,monospace;
  letter-spacing:.01em;
  opacity:0; transform:translateY(6px); transition:opacity .35s ease, transform .35s ease;
}
.wz-hint.wz-in{ opacity:1; transform:none; }
.wz-hint b{ color:var(--wz-led); font-weight:700; }
.wz-hint button{
  flex:none; min-width:24px; min-height:24px; margin:-.2rem -.2rem 0 0;
  display:flex; align-items:center; justify-content:center;
  background:none; border:0; padding:0; cursor:pointer;
  color:#8a857d; font:inherit; font-size:15px; line-height:1;
}
.wz-hint button:hover{ color:#ddd8d0; }
.wz-hint button:focus-visible{ outline:2px solid var(--wz-led); outline-offset:1px; }
@media (prefers-reduced-motion:reduce){
  .wz-hint{ transition:none; transform:none; }
}

/* --- PRINT: THE LAYER IS NOT PART OF THE DOCUMENT ---------------------------------------------
 * Measured before this block existed: on emulate_media('print') the frame, chin, vignette, warm
 * wash, peripheral blur AND the power button all still painted, body kept its 42px chin reserve,
 * and the text kept its halo. Printing a reference page would have produced a black monitor frame
 * around haloed type with a vignette down the margins.
 * These pages are argument libraries -- people print them to argue from. The furniture is CHROME:
 * it belongs on a screen and nowhere else. Everything the layer adds comes off, the reserved band
 * comes back, and the page prints as the document it is. */
@media print{
  .wz-frame, .wz-chin, .wz-vig, .wz-soft-l, .wz-soft-r, .wz-hint{ display:none !important; }
  html.wz-on body{ padding-bottom:0 !important; }
  html.wz-on .wz-stage{ padding-inline:0 !important; }
  html.wz-vfx .wz-stage, html.wz-vfx .wz-stage *{
    text-shadow:none !important; box-shadow:none !important; filter:none !important;
    transform:none !important;
  }
}


/* ==============================================================================================
   PER-CARD FEEDBACK  --  .wz-fb
   Lives INSIDE .wz-stage, unlike the chin and the hint, because it belongs to its card: it should
   pan and scale with the card it reports on. What it does not do is glow -- the halo is for text
   the page wants read, and a report control is function, not emitter.
   Visible at every tier including \`off\`: cosmetics are optional, a way to report an error is not.
   ============================================================================================== */
/* ANCHORED, NOT FLOATED. A float is only contained by a block taller than itself, and .obj-meta is
   a 17px strip while the control has to be 26px to clear the WCAG 2.5.8 target floor -- so 9px of
   it hung past the strip and shortened the first line of every headline. Measured: the h2 rewrapped.
   Absolute positioning against the card touches no line box at all. The card measured position
   static, so making it relative changes nothing it does today; the meta strip reserves the lane by
   padding, keyed to the attribute the injector sets, so a card without a control reserves nothing. */
/* Scoped to cards the injector has actually marked: \`.obj{position:relative}\` unscoped would have
   applied to any element on any page that happens to use that class name. */
.obj[data-wz-fb]{ position:relative; }
.obj[data-wz-fb] > .obj-meta{ padding-right:5rem; }
.wz-fb{
  position:absolute; top:.6rem; right:.85rem;
  display:inline-flex; align-items:center; justify-content:center;
  min-width:26px; height:26px; padding:0 .4rem;   /* WCAG 2.5.8 AA floor is 24x24 */
  font:700 10px/1 ui-monospace,"IBM Plex Mono",Menlo,Consolas,monospace;
  letter-spacing:1px; text-transform:uppercase; text-decoration:none; white-space:nowrap;
  color:var(--dim);
  border:1px solid transparent; border-radius:3px;
  transition:color .16s ease, border-color .16s ease;
}
/* A WORD, NOT A GLYPH. The first build used an envelope; rendered at 12px in the card's mono stack
   it read as a small outlined box -- closer to a close button than to mail, and an ambiguous icon
   repeated on 82 cards is worse than a plain label. The card already speaks in tracked uppercase
   micro-labels (DIAGNOSIS, RESPONSE - PUNCH) at 10px/700/1px, so this borrows that voice exactly
   and reads as native rather than as something bolted on.
   NO OPACITY. The first version dimmed to .62 and measured 3.56:1 on the dark ground but 2.58:1 on
   the cream one -- under WCAG 1.4.11's 3:1 floor for a UI component. Opacity is the trap:
   getComputedStyle hands back the token, the compositor draws something else, and only a pixel
   sample can tell you which. At --dim, full strength, the worst mode measures 5.37:1.
   Hover raises it rather than revealing it: a control that only appears on hover does not exist on
   a touch screen. */
.wz-fb:hover{ color:var(--fg); border-color:var(--faint); }
.wz-fb:focus-visible{ outline:2px solid var(--accent); outline-offset:1px; }
html.wz-vfx .wz-fb{ text-shadow:none !important; }
@media print{ .wz-fb{ display:none !important; }
              .obj[data-wz-fb] > .obj-meta{ padding-right:0 !important; } }


/* ==============================================================================================
   FIRST-VISIT WALKTHROUGH  --  .wz-tour-*
   The darkening is one element with an enormous box-shadow spread, not a stack of four panels and
   not mix-blend-mode. The blend route is what cost half the frame rate when the warm wash used it;
   a spread shadow is plain paint on a single fixed box and moves by changing four lengths.
   Outside .wz-stage: the spotlight must not pan with the camera or glow, or it would drift off the
   thing it is pointing at.
   ============================================================================================== */
.wz-tour-mask{
  /* ABOVE THE FRAME AND THE CHIN, which sit at 2147483000/1. Under them the panels darkened the
     page but left the whole chin at full brightness and hid the ring behind it -- a spotlight
     pointing at a button nobody could see was being pointed at. The tour is the topmost thing on
     the page while it runs, by definition: that is what it is for. */
  position:fixed; z-index:2147483100; pointer-events:none;
  background:rgba(0,0,0,.74);
  transition:top .2s ease, left .2s ease, width .2s ease, height .2s ease;
}
.wz-tour-ring{
  position:fixed; z-index:2147483110; pointer-events:none;
  border:2px solid var(--wz-led, #FF8195); border-radius:6px;
  transition:top .2s ease, left .2s ease, width .2s ease, height .2s ease;
}
.wz-tour-card{
  position:fixed; z-index:2147483120; box-sizing:border-box;
  padding:.85rem .95rem .7rem;
  background:#131315; color:#ddd8d0;
  border:1px solid #34313a; border-radius:7px;
  box-shadow:0 10px 30px rgba(0,0,0,.6);
  font:400 12.5px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  transition:top .22s ease, left .22s ease;
}
.wz-tour-text{ margin:0 0 .7rem; }
.wz-tour-nav{ display:flex; align-items:center; gap:.5rem; }
.wz-tour-dots{
  margin-left:auto; font:700 10px/1 ui-monospace,"IBM Plex Mono",Menlo,Consolas,monospace;
  letter-spacing:1px; color:#8b8690;
}
.wz-tour-nav button{
  min-width:30px; height:30px; padding:0 .5rem;   /* over the 24x24 floor on both axes */
  background:#1d1d21; color:#ddd8d0; cursor:pointer;
  border:1px solid #3a3740; border-radius:5px;
  font:600 12px/1 ui-sans-serif,system-ui,sans-serif;
}
.wz-tour-nav button:hover{ background:#26262c; }
.wz-tour-nav button:focus-visible{ outline:2px solid var(--wz-led, #FF8195); outline-offset:1px; }
.wz-tour-nav button[disabled]{ opacity:.4; cursor:default; }
.wz-tour-skip{ margin-right:auto; background:transparent !important; border-color:transparent !important;
               color:#9b9690 !important; font-weight:400 !important; }
.wz-tour-skip:hover{ color:#ddd8d0 !important; }
@media (prefers-reduced-motion:reduce){ .wz-tour-mask, .wz-tour-ring, .wz-tour-card{ transition:none; } }
@media print{ .wz-tour-mask, .wz-tour-ring, .wz-tour-card{ display:none !important; } }
`);

  style('wz-css-v', `/* wuld-vfx.css -- the opt-in second tier. Requires wuld-bezel.css.
 *
 * THE POWER BUTTON CYCLES: off -> cosmetic -> vfx -> off. Right-click was considered and rejected --
 * undiscoverable, hijacks the context menu, no touch equivalent, unreachable from a keyboard. On a
 * site shipping LEGIBLE and HIGH-CONTRAST modes, a control only a mouse user can find is not a
 * control, and §3's argument is that this button is what makes the layer legitimate rather than imposed.
 *
 * WHAT THE FILM'S GLOW ACTUALLY IS. The film scales 1892 px of content down into a monitor a few
 * hundred px wide, which CONCENTRATES each glyph's energy into fewer, brighter pixels, and blooms
 * that. At 1:1 there is nothing to concentrate: a text-shadow sweep from nothing to past-legible
 * moved mean luma 19.90 -> 20.20 and was indistinguishable by eye at every step. So the bloom is
 * built where it reads in the film -- on POINT SOURCES (badges, graph nodes, LEDs) -- plus a whisper
 * on prose that costs nothing (background median held at exactly 17.00 across the whole sweep, glyph
 * contrast 10.28 -> 10.27) and contributes against the vignette below.
 */

:root{
  --wz-vig-in:   42%;    --wz-vig-mid:  74%;
  --wz-vig-a1:   .26;    --wz-vig-a2:   .58;
  --wz-glow:      rgba(255,150,165,.45);
  --wz-glow-hot:  rgba(255,196,206,.55);
  /* Glow the colour the thing actually emits: a rose glow measured +24.1% where white measured
   * +36.3% at comparable alpha, because rose's luma is 173 against white's 255 -- a tinted glow
   * throws away a third of the light before it starts. currentColor generalises that per element. */
  --wz-glow-mix:       80%;    --wz-text-blur:      10px;   /* plain text  */
  --wz-glow-mix-bold: 100%;    --wz-text-blur-bold: 16px;   /* bold / bright */
  /* THE WARM CAST. The chin's LEDs are #FF8195 and the operator reads the picture as lit by them:
   * "give all of the text a subtle orangish tint, like the chin's LED panels have." Two mechanisms,
   * because one cannot do it. The HALO mixes toward --wz-tint, which warms the emitted light where
   * the bloom actually lives. The WASH is a fixed soft-light overlay that warms the glyph cores and
   * everything else without touching any element's declared colour -- the reason a per-element
   * \`color:\` override is not used is that \`currentColor\` INSIDE the color property resolves to the
   * INHERITED colour, so \`* { color: color-mix(currentColor ...) }\` would replace every tier badge
   * and accent with a value derived from its parent and destroy the palette. soft-light warms
   * highlights and leaves black at black, which is what a phosphor does. */
  --wz-tint:       #FF9A78;   /* between the LED rose (#FF8195) and amber; see the tint strip */
  --wz-tint-glow:  34%;       /* share of the halo that is tint rather than the text's own colour */
  --wz-dark-max:   90;
  /* --- THE MAGNIFIER ------------------------------------------------------------------------
   * Clamped at 1 on the low side, and that clamp is load-bearing: below 1 the stage shrinks away
   * from the frame and the bezel stops being a frame around anything. Above 1 the content always
   * overflows, so the camera pan can never expose an edge -- the no-void guarantee gets STRONGER
   * as you zoom, which is the opposite of what was feared when this was written up as a risk. */
  --wz-zoom:       1;
  --wz-zoom-max:   4;
  --wz-grille:     3px;   /* phosphor triad pitch at 1x, before zoom multiplies it */
  /* THE FIRST BUILD OF THIS RAMP HIT FULL OPACITY BY 2.6x AND DROWNED THE PAGE -- at 4x the type was
   * behind a curtain of RGB stripes rather than lit by them. Without a blend mode the grille ADDS
   * light instead of modulating it, so its alpha has to stay low enough to read as texture. Ramp is
   * linear across the whole zoom range and peaks here, not at 1. */
  --wz-grille-max: .42;        /* background luma at or under which the layer is allowed to glow */
  --wz-svg-blur:  4px;
  --wz-svg-glow:  rgba(255,255,255,.45);   /* one glow for the whole graph; per-node currentColor
                                            * measured inert and cost more */

  /* THE CLAMP IS THE WHOLE DESIGN. The handoff's "immersive at 2, nauseating at 8" was written for
   * a camera move in a film, where the whole frame swings. On a page the reader's eye is fixed on
   * text, and 2deg reads as the page sliding rather than as a camera. Dropped to 0.7 on the
   * operator's call -- "just enough to give the user a sense of movement". */
  --wz-pan:      6px;      /* camera travel. MUST stay under the lip width (10.7px at 1440) or a
                            * gap opens outside the frame -- that is the whole no-void guarantee. */
  --wz-pan-ease: 260ms;
  --wz-soft-w:   34%;      /* how far in from the edge the far-side blur reaches */
  --wz-tilt-ease: 220ms;
}

/* --- 1. VIGNETTE -- and it is load-bearing, not decoration ------------------------------------
 * A bloom is perceived against its surround. The earlier glow test ran against a flat luma of 17
 * across the whole frame, which is why a real lift measured as nothing. Darkening the periphery is
 * what lets the centre's bright things read as emitting. A plain gradient also always paints, unlike
 * the masked backdrop-filter below, which measured inert to six decimal places. */
html.wz-vfx .wz-vig{
  position:fixed; inset:0; pointer-events:none; z-index:2147481500;
  /* DEFAULT (farthest-corner) SIZING, DELIBERATELY. The first build wrote \`125% 135%\`, which put
   * the ending shape so far outside the viewport that a point 180 px from the corner sat at
   * normalised radius 0.371 -- inside the 38% transparent stop. The whole frame was in the clear
   * zone and the measured centre/corner ratio moved 0.947 -> 0.942, i.e. nothing. With the default,
   * 100% IS the farthest corner and the stops mean what they say. Third time today a parameter was
   * carried over without checking it against the geometry it lands on. */
  background:radial-gradient(ellipse at 50% 45%,
             transparent var(--wz-vig-in),
             rgba(0,0,0,var(--wz-vig-a1)) var(--wz-vig-mid),
             rgba(0,0,0,var(--wz-vig-a2)) 100%);
}

/* --- 2. BLOOM ON POINT SOURCES ---------------------------------------------------------------- */
/* currentColor so each tier halos in its OWN hue rather than everything blooming rose. */
html.wz-vfx .tier-badge{
  box-shadow:0 0 11px 1px currentColor, 0 0 3px var(--wz-glow-hot);
}
/* --- THE GRAPH VIEWS, now measured rather than guessed --------------------------------------
 * d3 is vendored into the local test fixture, so the mechanism web, dependency graph and argument
 * flow render for real. What they are made of: SVG <text> for every label (116-233 of them), plus
 * circles, lines and rects for the structure.
 *   SVG <text> NEEDS NOTHING. It inherits text-shadow from .wz-stage like any other text and was
 *   already glowing: +29.7% on the annulus with no SVG rule at all.
 *   PER-ELEMENT FILTERS ARE INERT HERE. drop-shadow on every circle measured 43.074 against 43.045
 *   for no rule -- indistinguishable, on 82-199 filtered elements. Not shipped: an effect that
 *   changes nothing is the thing this whole harness exists to catch.
 *   ONE FILTER ON THE SVG ROOT WINS ON BOTH AXES: +63.3% against +38.8% for circles+lines, and a
 *   cheaper repaint (21.6 ms vs 24.3 ms) because it is one filter instead of ~600. */
html.wz-vfx .wz-stage svg{
  filter:drop-shadow(0 0 var(--wz-svg-blur) var(--wz-svg-glow));
}
/* Graph LABELS get a tighter, hotter glow than body prose. They render at ~10px against 13px in the
 * cards, so the same 10px blur spreads the same light over proportionally more area and reads as
 * less. Measured A/B on one page instance with the force layout frozen -- two separate page loads
 * cannot be compared here, because d3 re-simulates and the node positions move. */
html.wz-vfx .wz-stage svg text{
  text-shadow:0 0 5px color-mix(in srgb, currentColor 100%, transparent),
              0 0 2px color-mix(in srgb, currentColor 70%, transparent);
}
html.wz-vfx .wz-led{ opacity:.95; box-shadow:0 0 .8em .09em var(--wz-led); }

/* --- 3. THE GLOW ON THE TEXT ITSELF -----------------------------------------------------------
 * INHERITED FROM THE STAGE, AND KEYED TO currentColor. text-shadow inherits, so one rule reaches
 * every text node on every view -- no selector list to go stale, which is what went wrong twice:
 * an earlier build listed (p, span, td, h1, h3, h4) and matched NONE of the 82 \`div.trigger-text\`
 * elements that hold the bright prose, then concluded from that silence that a glow does not
 * transfer to prose at 1:1. That was a claim about a selector, not about the page.
 * currentColor makes it self-scaling: white text glows white, grey text glows grey. A fixed white
 * glow would put a white halo around a grey letter, which is the wrong picture and reads as haze.
 *
 * MEASURED on the annulus around the glyphs (light added NEAR a glyph, not ON it), against the
 * page's own pixels, with the dim-text ring watched separately so the tint stays proportionate:
 *      55% / 8px   +60.6%      70% / 9,14px  +81.8%      80% / 10,16px  +83.5%      92% / 12,18px  +78.9%
 * IT PEAKS AND THEN DEGRADES. Past ~80% the same light spreads over a wider ring and the halo
 * flattens -- more alpha is not more glow. 80/100 is the measured maximum and is what ships.
 * Background median held at exactly 17.00 at every level, so none of it costs legibility. */
html.wz-vfx .wz-stage{
  text-shadow:0 0 var(--wz-text-blur)
                color-mix(in srgb, color-mix(in srgb, currentColor calc(100% - var(--wz-tint-glow)),
                          var(--wz-tint)) var(--wz-glow-mix), transparent),
              0 0 2px color-mix(in srgb, currentColor 40%, transparent);
}
/* STRUCTURAL PROMINENCE TAKES MORE -- not brightness, which is what an earlier version of this
 * comment claimed and which is measurably the wrong rule. Audited across the wings: editorial <em>
 * renders at colour luma 160 while <strong> renders at 95, because <strong> mostly sits inside
 * deliberately quiet blocks (.rsi-formula) and inherits their colour. So the brighter element is
 * the one NOT on this list, and correctly so -- <em> is stress inside a sentence and appears 35
 * times in running prose on one wing, where the loudest paint on the view has no business. What
 * this list actually selects is text that is prominent by structure: headings, table headers,
 * definition terms, badges, and the trigger line. \`.trigger-text\` is w500 rather than w700 but is
 * a single isolated headline element, which is why it belongs here despite its weight.
 * Also audited and deliberately left on the base glow: <code> (luma 62 on the accent red -- a glow
 * scales with currentColor, so dark text cannot smear) and <pre> (rendered and inspected; the
 * monospace stays crisp at 10px blur). */
html.wz-vfx .wz-stage :is(strong,b,h1,h2,h3,h4,h5,h6,th,dt,.tier-badge,.trigger-text){
  text-shadow:0 0 var(--wz-text-blur-bold)
                color-mix(in srgb, color-mix(in srgb, currentColor calc(100% - var(--wz-tint-glow)),
                          var(--wz-tint)) var(--wz-glow-mix-bold), transparent),
              0 0 3px color-mix(in srgb, currentColor 55%, transparent);
}
/* THE WASH WAS CUT, AND THE REASON IS A NUMBER. It was a fixed full-viewport overlay with
 * mix-blend-mode:soft-light, and it cost HALF THE FRAME RATE. Measured over a scripted full-document
 * scroll at 1440x900, frame intervals in ms:
 *       original page, no layer     median 16.70   p95 16.70   0.0% of frames over 32ms
 *       vfx with the wash           median 33.30   p95 50.00  85.4%
 *       vfx with the wash removed   median 16.70   p95 16.75   1.1%
 * Isolated one mechanism at a time: killing the vignette, the peripheral blur, the text glow, the
 * stage transform, the SVG drop-shadow or the badge shadows changed NOTHING. Only the wash did. A
 * blend mode has to re-composite its whole backdrop every frame, and on an 8,400px document that
 * backdrop is the document. With the tier now defaulting to vfx, every visitor would have got a
 * 30fps scroll.
 *   The look did not have to go with it. The warmth is now baked into the PALETTE -- the same nine
 * variables, pre-mixed 16% toward --wz-tint and written out as literals in wuld-type.css. Same
 * picture, no compositing, and it is closer to the brief anyway: the operator asked for the TEXT to
 * be tinted, and the wash was tinting panels and grounds along with it.
 *   --wz-tint stays as the value those literals were derived from; --wz-tint-glow still tints the
 * halo, which costs nothing because a text-shadow is paint, not blend. */
/* THE GATE IS MEASURED, NOT NAMED. Three gates were written here and the first two were wrong in
 * the same way -- both asked WHICH MODE, and the answer to that question does not determine whether
 * a glow is a good idea.
 *   v1  html.wz-vfx[data-mode="legible"]          vacuous on the flagship, which sets body classes.
 *   v2  body.legible + [data-mode]:not(standard)  correct on both conventions, and still wrong:
 *       it fired on /troubleshooting/, whose data-mode="dark" is DECORATION (no rule selects on it,
 *       no switcher on the page), silencing the whole tier there. Measured: p and h1 both none.
 *   v3  detect whether [data-mode] is wired to any stylesheet rule. That repaired v2 and left the
 *       real defect untouched, which the operator found by looking: THE MODE NAME DOES NOT PREDICT
 *       THE BACKGROUND. The flagship is DARK in legible and CREAM in high-contrast; the libraries
 *       umbrella is CREAM in legible and BOTH, and DARK in high-contrast. One name, two grounds.
 * So the gate now measures the thing it actually cares about. wuld-vfx.js reads the computed
 * background of <body> (falling through to <html> when it is transparent), takes its Rec.709 luma,
 * and sets html.wz-lightbg above --wz-dark-max. A MutationObserver re-grades on every mode change,
 * so the toggles drive it without the layer knowing a single mode name. Unknown background -> light
 * -> silent, so the failure direction is unchanged.
 *   THE ACCESSIBILITY FLOOR MOVED TO WHERE IT BELONGS. Suppressing on a mode named "high-contrast"
 * was always a proxy; prefers-contrast and forced-colors are the real signals, they come from the
 * OS rather than from one site's vocabulary, and they are what a low-vision reader actually sets.
 *   ONE RESERVATION, RECORDED AND OVERRULED: a halo fills the luminance step at the glyph edge, so
 * on a dark high-contrast ground it does cost some of the contrast that mode exists to provide.
 * The operator's call is that the tier is opt-in behind a power button that defaults to off, so a
 * reader who switched it on has asked for it. The OS-level floor below is what remains of it.
 *
 * SCOPED TO .wz-stage, NOT TO \`*\`. The first version used a bare universal selector and stripped the
 * bezel's own inner shadow and the LED glow along with the content effects -- measured in legible
 * mode as frameShadow:none, ledShadow:none. The frame is CHROME, not an effect: a reader who wants
 * plain type still wants the monitor around it. Scoping to the stage spares the furniture for free,
 * because the furniture already lives outside the stage so that it cannot pivot -- one structural
 * decision paying twice. */
html.wz-vfx.wz-lightbg .wz-stage *{
  text-shadow:none !important; box-shadow:none !important; filter:none !important;
}
html.wz-vfx.wz-lightbg .wz-vig,
html.wz-vfx.wz-lightbg .wz-soft-l,
html.wz-vfx.wz-lightbg .wz-soft-r{ display:none !important; }

/* The floor. Not keyed to any site vocabulary, and it outranks a dark background. */
@media (prefers-contrast: more), (forced-colors: active){
  html.wz-vfx .wz-stage *{
    text-shadow:none !important; box-shadow:none !important; filter:none !important;
  }
  html.wz-vfx .wz-vig,
  html.wz-vfx .wz-soft-l, html.wz-vfx .wz-soft-r{ display:none !important; }
}

/* --- 4. PERIPHERAL SOFTENING -- CUT, AND THE REASON MATTERS ----------------------------------
 * Not shipped. Three mechanisms were built and all three measured INERT to the last decimal:
 *     unmasked backdrop-filter child        max abs delta 0.000, 0.0000% of pixels moved
 *     masked parent + filtered child        max abs delta 0.000
 *     + near-transparent background on it   max abs delta 0.000
 * backdrop-filter inside a mask-image'd parent does not composite in this engine. An effect that is
 * configured, rendered and changes nothing is exactly what §11 exists to catch, so it is cut rather
 * than tuned -- shipping it would be the failure this whole harness was built to prevent.
 * THE VIGNETTE DOES ITS PERCEPTUAL JOB. "The edges recede" is carried by darkening, measured at
 * centre/corner 0.964 -> 1.468; the film's own retention table already says the softening lives in
 * the corners (centre 100%, mid-edge 95.2%, corner 54.3%) where the vignette is strongest.
 * It comes back if a mechanism composites: a real duplicated layer with \`filter: blur()\` on a copy,
 * masked -- which costs a second paint of the subtree and should be measured before it is believed. */

/* --- 5. THE CAMERA -------------------------------------------------------------------------
 * A PAN, NOT A TILT. This was rotate3d, and a rotation bends the subject: the page visibly skewed,
 * the rules sloped, and the corners pulled away to show the ground behind. A camera that follows a
 * cursor translates -- the frame stays square to the picture and you simply see a little further to
 * one side. Nothing about the page's own geometry changes.
 * THE AMPLITUDE IS BOUNDED BY THE LIP, which is why no void can appear: the stage slides at most
 * --wz-pan, and the fixed bezel lip is wider than that, so the gap opened at one edge is always
 * underneath the frame that is painted on top of it. One number, derived from another number,
 * rather than two numbers that have to be kept in agreement by hand. */
/* TRANSFORM-ORIGIN IS 0 0, AND THAT IS THE DIFFERENCE BETWEEN A MAGNIFIER THAT WORKS AND ONE THAT
 * EATS THE PAGE. Measured with the origin at 50%: at zoom 2 the stage grows 720px past each side of
 * the viewport and only the RIGHT 714px is reachable, because there is no negative scroll -- the
 * left 726px of every line is permanently unreachable. With origin 0 0 the growth is right-and-down
 * only, maxScrollX matches the growth exactly at every zoom tested, and nothing is lost.
 *   The translate stays OUTSIDE the scale in the composed matrix, so the camera pan is a constant
 * pixel amount at any zoom rather than being multiplied by it: scale(3) with --wz-px:-10px composes
 * to matrix(3,0,0,3,-10,0). Verified on the computed style, not assumed from the spec. */
html.wz-vfx .wz-stage{
  will-change:transform;
  transition:transform var(--wz-pan-ease) cubic-bezier(.22,.61,.36,1);
  transform-origin:0 0;
  transform:translate3d(var(--wz-px,0px), var(--wz-py,0px), 0) scale(var(--wz-zoom,1));
}
/* While zooming, the transition would fight the scroll compensation and the anchor point would
 * visibly slide. Zoom steps are instant; the pan keeps its easing. */
html.wz-zooming .wz-stage{ transition:none !important; }

/* --- 6. PERIPHERAL BLUR, ON THE FAR SIDE FROM THE CAMERA -------------------------------------
 * RETRACTION: an earlier build cut this as "inert -- three mechanisms, max abs delta 0.000". That
 * was true of the form tested (a full-viewport element with a RADIAL mask) and false as a general
 * claim about backdrop-filter, which is how it was written down. Re-tested as a strip with a LINEAR
 * mask: max delta 167.93, 16.3% of pixels moved on the treated side and exactly 0.00 on the other.
 * The mechanism was never the problem; the configuration was. Same error as concluding a glow does
 * not transfer to prose from a selector that matched no prose.
 * Opacity is driven from the cursor, so the blur sits opposite the camera: look right, the left edge
 * softens. */
html.wz-vfx .wz-soft-l, html.wz-vfx .wz-soft-r{
  position:fixed; top:0; height:100%; width:var(--wz-soft-w);
  z-index:2147481200; pointer-events:none;
  backdrop-filter:blur(var(--wz-soft-blur)); -webkit-backdrop-filter:blur(var(--wz-soft-blur));
  transition:opacity var(--wz-pan-ease) linear;
}
html.wz-vfx .wz-soft-l{ left:0;  opacity:var(--wz-sl,0);
  -webkit-mask-image:linear-gradient(to right,#000 0%,transparent 100%);
          mask-image:linear-gradient(to right,#000 0%,transparent 100%); }
html.wz-vfx .wz-soft-r{ right:0; opacity:var(--wz-sr,0);
  -webkit-mask-image:linear-gradient(to left,#000 0%,transparent 100%);
          mask-image:linear-gradient(to left,#000 0%,transparent 100%); }

/* --- MOTION IS NOT NEGOTIABLE. The pivot is vestibular, not photosensitive: reduced-motion KILLS
 * it rather than softening it. Vignette, bloom and softening carry no motion and may stay. */
@media (prefers-reduced-motion:reduce){
  html.wz-vfx .wz-stage{ transform:none !important; transition:none !important; }
  html.wz-vfx .wz-soft-l, html.wz-vfx .wz-soft-r{ opacity:0 !important; }
}


/* --- THE PHOSPHOR --------------------------------------------------------------------------------
 * What there is to zoom INTO. Invisible at 1x by construction -- opacity is driven from the zoom by
 * wuld-vfx.js and is literally 0 until you magnify -- and it resolves into an aperture grille and
 * scanlines as the triad pitch grows past what the eye can resolve.
 *
 * A FIXED OVERLAY, NOT ONE INSIDE THE STAGE, AND NO BLEND MODE. Both are the warm wash's lesson paid
 * forward: a blend layer cost half the frame rate, and a texture painted across a 25,000px scaled
 * document would be worse. Fixed means one compositor layer the size of the viewport however far in
 * you go. It is also the better fiction -- phosphor belongs to the glass, not to the image -- and
 * growing its pitch with zoom is what sells "getting closer to the screen" rather than "the picture
 * got bigger". */
html.wz-vfx .wz-grille{
  position:fixed; inset:0; pointer-events:none; z-index:2147481250;
  opacity:var(--wz-grille-a, 0);
  background-image:
    repeating-linear-gradient(90deg,
      rgba(255,86,86,.34) 0 33.34%, rgba(86,255,130,.30) 33.34% 66.67%, rgba(110,130,255,.34) 66.67% 100%),
    repeating-linear-gradient(0deg,
      rgba(0,0,0,.30) 0 42%, rgba(0,0,0,0) 42% 100%);
  background-size:
    calc(var(--wz-grille) * var(--wz-zoom, 1)) 100%,
    100% calc(var(--wz-grille) * var(--wz-zoom, 1));
  transition:opacity .18s linear;
}
/* Zoom is part of the effect, so it dies with the effect -- with the ground and with the OS signals,
 * exactly like the glow. */
html.wz-vfx.wz-lightbg .wz-grille{ display:none !important; }
@media (prefers-contrast: more), (forced-colors: active){
  html.wz-vfx .wz-grille{ display:none !important; }
}
@media print{ .wz-grille{ display:none !important; } }
@media (prefers-reduced-motion:reduce){ .wz-grille{ transition:none; } }

/* The magnifier button, beside the power button in the chin. Same 44px target, same focus ring.
 * The offset must clear the power button's FULL 44px, not most of it: at +42px the two hit areas
 * overlapped by 2px at every width tested, and overlapping tap targets mean the thumb lands on
 * whichever the stacking order favours rather than the one it aimed at. +50px leaves a 6px gap. */
.wz-mag{
  position:absolute; right:calc(max(1.0vw,6px) + 50px); bottom:50%; transform:translateY(50%);
  min-width:44px; min-height:44px;
  display:flex; align-items:center; justify-content:center;
  color:var(--wz-mark); opacity:.75; font-size:1.05em; line-height:1;
  pointer-events:auto; cursor:pointer; background:none; border:0; padding:0; border-radius:50%;
}
.wz-mag:hover{ opacity:1; }
.wz-mag:focus-visible{ outline:2px solid var(--wz-led); outline-offset:-6px; opacity:1; }
html.wz-mag-on .wz-mag{ opacity:1; color:var(--wz-led); }
`);

  document.body.insertAdjacentHTML('beforeend', `<!-- append as the last children of <body>; add class wz-on to <html> -->
<div class="wz-frame" aria-hidden="true"></div>
<div class="wz-chin" aria-hidden="true">
  <span class="wz-perf"></span>
  <span class="wz-mark">W<i class="wz-led"></i>U<i class="wz-led"></i>L<i class="wz-led"></i>D<i class="wz-led"></i></span>
  <span class="wz-perf"></span>
  <button class="wz-mag" title="Magnifier" aria-label="Magnifier. Shift and scroll to zoom.">&#x2315;</button>
  <button class="wz-power" title="Cosmetics" aria-label="Toggle cosmetics">&#x23FB;</button>
</div>
`);

/* wuld-vfx.js -- power-button cycling and the clamped pivot. Pairs with wuld-vfx.css. */
(function () {
  /* THE LADDER DESCENDS. vfx -> cosmetic -> off -> vfx. The operator's call, and it is the better
     mental model independently of what the default is: a power button that DIMS reads correctly,
     one that builds up reads like a feature you have to discover. The tier persists per reader, so
     stepping down is not re-imposed on the next page; localStorage can throw (private windows,
     blocked site data) so every touch of it is wrapped and the layer works fine without it.
     To reset while testing:  localStorage.removeItem('wz-tier')  */
  var H = document.documentElement, TIERS = ['off', 'cosmetic', 'vfx'], START = 2, i = START;
  function remember(v) { try { localStorage.setItem('wz-tier', v); } catch (e) {} }
  function recall() {
    try { var v = localStorage.getItem('wz-tier');
          if (v !== null && +v >= 0 && +v <= 2) return +v; } catch (e) {}
    return START;
  }

  /* ADOPT, don't build. When the page ships <div class="wz-stage"> in its own markup the wrapper
     already exists at first paint and there is no reparent, no reflow and no flash -- which is the
     whole reason the wrapper moved into the markup. Building one is the fallback for the console
     snippet and for any page that has not been integrated yet. */
  function wrapStage() {
    if (document.querySelector('.wz-stage')) return;
    var s = document.createElement('div'); s.className = 'wz-stage';
    var keep = ['wz-frame', 'wz-chin'];
    [].slice.call(document.body.children).forEach(function (el) {
      if (keep.indexOf(el.className) === -1 && el.tagName !== 'SCRIPT') s.appendChild(el);
    });
    document.body.insertBefore(s, document.body.firstChild);
  }


  /* THE GATE IS MEASURED, NOT NAMED -- see the long note in wuld-vfx.css. The mode name does not
     predict the background: the flagship is dark in legible and cream in high-contrast, the
     libraries umbrella is the other way round. So read the ground and grade it. */
  function bgLuma() {
    var els = [document.body, document.documentElement], i, c, m;
    for (i = 0; i < els.length; i++) {
      if (!els[i]) continue;
      c = getComputedStyle(els[i]).backgroundColor;
      m = c && c.match(/[\d.]+/g);
      if (!m || m.length < 3) continue;
      if (m.length > 3 && parseFloat(m[3]) < 0.5) continue;      // see-through: keep looking
      return 0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2];
    }
    return 255;                       // unreadable ground -> treat as light -> stay silent
  }
  function gradeBg() {
    var want = bgLuma() > num(getComputedStyle(H).getPropertyValue('--wz-dark-max'), 90);
    if (H.classList.contains('wz-lightbg') !== want) H.classList.toggle('wz-lightbg', want);
  }

  function apply() {
    H.classList.toggle('wz-on',  i >= 1);
    H.classList.toggle('wz-vfx', i === 2);
    var b = document.querySelector('.wz-power');
    if (b) { b.setAttribute('title', 'Display: ' + TIERS[i] + ' — click to cycle');
             b.setAttribute('aria-label', 'Display mode: ' + TIERS[i] + '. Click to cycle.'); }
    document.querySelectorAll('.wz-led').forEach(function (l, n) {   // the LEDs REPORT the tier
      l.style.opacity = i === 0 ? .18 : i === 1 ? .55 : (n < 2 ? .55 : .95);
    });
    if (i !== 2) { rest(); clearZoom(); }
  }

  var rest = function () {};
  var raf = null;
  function num(v, d){ var n = parseFloat(v); return isNaN(n) ? d : n; }

  function onMove(e) {
    if (i !== 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var cs  = getComputedStyle(H),
          pan = num(cs.getPropertyValue('--wz-pan'), 6),   // read, never restated: cccxvii
          dx  = (e.clientX / innerWidth  - 0.5) * 2,       // -1 .. 1
          dy  = (e.clientY / innerHeight - 0.5) * 2;
      // The camera moves TOWARD the cursor, so the picture slides the other way and you see a little
      // further to that side. Bounded by --wz-pan, which is bounded by the lip, so the gap that opens
      // at the trailing edge is always underneath the frame.
      H.style.setProperty('--wz-px', (-dx * pan).toFixed(2) + 'px');
      H.style.setProperty('--wz-py', (-dy * pan * 0.6).toFixed(2) + 'px');
      // Blur the end the camera is NOT at.
      H.style.setProperty('--wz-sl', Math.max(0,  dx).toFixed(3));
      H.style.setProperty('--wz-sr', Math.max(0, -dx).toFixed(3));
    });
  }

  /* Shown once per BROWSER SESSION, not once ever: a reader who closes the tab and comes back
     tomorrow has plausibly forgotten. sessionStorage can throw (private windows, blocked site
     data) and every touch is wrapped -- a hint that fails to record itself is shown again, which
     is the harmless direction. Never shown if the reader is not actually at the vfx tier, because
     then there is nothing to offer to turn down. */
  function hint() {
    if (i !== 2) return;
    var KEY = 'wz-hint-seen';
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    var d = document.createElement('div');
    d.className = 'wz-hint';
    // role=status + aria-live=polite: announced in turn, never stealing focus, and appended last
    // so it is not the first thing a screen reader meets on the page.
    d.setAttribute('role', 'status');
    d.setAttribute('aria-live', 'polite');
    var span = document.createElement('span');
    span.innerHTML = 'Screen effects are on. The <b>\u23FB</b> button in the frame dims them.';
    var x = document.createElement('button');
    x.type = 'button'; x.textContent = '\u00D7';
    x.setAttribute('aria-label', 'Dismiss');
    var gone = false;
    function close() {
      if (gone) return; gone = true;
      d.classList.remove('wz-in');
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 400);
    }
    x.addEventListener('click', close);
    d.appendChild(span); d.appendChild(x);
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add('wz-in'); });
    setTimeout(close, 9000);
    // Using the button is the best possible dismissal: they found what the hint was for.
    var b = document.querySelector('.wz-power');
    if (b) b.addEventListener('click', close, { once: true });
  }

  /* ---- THE MAGNIFIER --------------------------------------------------------------------------
     Two ways in, one state: Shift+wheel always zooms, and the chin's magnifier button arms a mode
     in which a plain wheel zooms. NOT Ctrl+wheel -- that is the browser's own zoom, and trackpad
     pinch arrives as ctrl+wheel too, so binding it would take real accessible zoom AND pinch away
     in exchange for an aesthetic one. Shift+wheel is free here: measured, it fires a cancelable
     wheel event and its native job (horizontal scroll) is a no-op on a page with no horizontal
     overflow. Once zoomed there IS horizontal overflow, so the mode releases it again below 1.02.

     Zoom is anchored to the POINTER, not to the viewport centre: the document point under the
     cursor stays under the cursor. Measured drift on the equivalent centre-anchored version: 0px. */
  var zoom = 1;
  function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
  function zmax(){ return num(getComputedStyle(H).getPropertyValue('--wz-zoom-max'), 4); }

  function setZoom(next, cx, cy) {
    if (i !== 2) return;                       // zoom belongs to the vfx tier and nowhere else
    next = clamp(next, 1, zmax());
    if (Math.abs(next - zoom) < 0.0005) return;
    var k0 = zoom, k1 = next;
    // the document point under the cursor, in unscaled coordinates
    var docX = (scrollX + cx) / k0, docY = (scrollY + cy) / k0;
    H.classList.add('wz-zooming');
    H.style.setProperty('--wz-zoom', k1.toFixed(4));
    // opacity ramps from nothing at 1x, so the grille cannot show up uninvited
    var gmax = num(getComputedStyle(H).getPropertyValue('--wz-grille-max'), 0.42);
    H.style.setProperty('--wz-grille-a',
      (clamp((k1 - 1) / Math.max(0.001, zmax() - 1), 0, 1) * gmax).toFixed(3));
    zoom = k1;
    scrollTo(Math.round(docX * k1 - cx), Math.round(docY * k1 - cy));
    H.classList.toggle('wz-zoomed', k1 > 1.0001);
    if (k1 <= 1.0001) H.classList.remove('wz-mag-on');
    clearTimeout(setZoom._t);
    setZoom._t = setTimeout(function(){ H.classList.remove('wz-zooming'); }, 90);
    var b = document.querySelector('.wz-mag');
    if (b) b.setAttribute('aria-label', 'Magnifier, ' + k1.toFixed(1) + 'x. Shift and scroll to zoom.');
  }
  function resetZoom(){ setZoom(1, innerWidth / 2, innerHeight / 2); }
  /* Stepping the power button DOWN has to drop the zoom with the tier, and it cannot go through
     setZoom() to do it: apply() has already moved `i` off 2 by the time it runs, and setZoom's
     first line is a guard on exactly that. Routing a teardown through a function gated on the state
     you just left is a bug that reads as correct -- it left the page stuck at 1.35x with no visible
     control, because the magnifier button is also gated on the vfx tier. Unconditional, and it
     restores the scroll position the zoom was anchored from. */
  function clearZoom(){
    if (zoom <= 1.0001) return;
    var docX = scrollX / zoom, docY = scrollY / zoom;
    zoom = 1;
    H.style.setProperty('--wz-zoom', '1');
    H.style.setProperty('--wz-grille-a', '0');
    H.classList.remove('wz-zoomed', 'wz-mag-on');
    scrollTo(Math.round(docX), Math.round(docY));
  }

  function onWheel(e) {
    if (i !== 2) return;
    var armed = e.shiftKey || H.classList.contains('wz-mag-on');
    if (!armed) return;
    if (e.ctrlKey) return;                     // leave browser zoom and trackpad pinch alone
    e.preventDefault();
    // wheel deltas differ wildly between mice, trackpads and OSes; use only the sign
    var step = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setZoom(zoom * step, e.clientX, e.clientY);
  }

  /* ---- THE STAGE BREAKS `body >` SELECTORS, SO MIRROR THEM ------------------------------------
     The stage wrapper is what carries the camera transform, and it has to be a real element between
     <body> and the content -- which silently stops every `body > #x` rule in the page's own
     stylesheet from matching. On the wings nothing uses that shape. On the FLAGSHIP the three
     top-level sections are switched with exactly that shape:

         body > #combined-library, body > #combined-rwe, body > #combined-coda { display: none; }
         body[data-active-view="rwe"] > #combined-rwe { display: block; }

     so wrapping turned the whole top-level navigation off: every section rendered at once, the
     library tour fired against a page showing five views simultaneously, and the page's own script
     threw setting textContent on an element it no longer expected to find. Measured before and
     after the wrap on the same page, which is the only way to tell this from a page behaviour.

     The fix is mechanical rather than hand-written: walk the page's own rules, and for any selector
     with a `body ... >` combinator, inject a copy with `.wz-stage` spliced in. Every mirrored rule
     gains exactly one class of specificity, so their order relative to each other is preserved, and
     the originals no longer match anything at all. Rules are mirrored, never edited. */
  function mirrorBodyChildRules() {
    if (!document.querySelector('.wz-stage')) return 0;
    if (document.getElementById('wz-stage-shim')) return 0;
    var RE = /\bbody((?:[.#\[:][^\s>,]*)*)\s*>/g, out = [], n = 0;
    function walk(rules) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.cssRules && r.conditionText !== undefined) {          // @media / @supports
          var inner = [];
          for (var j = 0; j < r.cssRules.length; j++) {
            var t = one(r.cssRules[j]); if (t) inner.push(t);
          }
          /* Re-emit under the rule's OWN at-keyword. '@media ' + conditionText was wrong for
             @supports, which also has conditionText -- it would have produced an @media rule with a
             supports condition, which parses as a media query that never matches. */
          var at = r.cssText.slice(0, r.cssText.indexOf('{')).trim();
          if (inner.length) out.push(at + '{' + inner.join('') + '}');
          continue;
        }
        var t2 = one(r); if (t2) out.push(t2);
      }
    }
    function one(r) {
      if (!r.selectorText || !r.style) return null;
      RE.lastIndex = 0;
      if (!RE.test(r.selectorText)) return null;
      RE.lastIndex = 0;
      n++;
      return r.selectorText.replace(RE, 'body$1 .wz-stage >') + '{' + r.style.cssText + '}';
    }
    for (var s = 0; s < document.styleSheets.length; s++) {
      var rules; try { rules = document.styleSheets[s].cssRules; } catch (e) { continue; }
      if (rules) walk(rules);
    }
    if (!out.length) return 0;
    var el = document.createElement('style');
    el.id = 'wz-stage-shim';
    el.textContent = '/* mirrored from the page\'s own `body >` rules, which the stage wrapper\n'
                   + '   would otherwise stop matching. ' + n + ' rule(s). */\n' + out.join('\n');
    document.head.appendChild(el);
    return n;
  }
  window.wzStageShim = mirrorBodyChildRules;

  window.wzInit = function () {
    wrapStage();
    gradeBg();
    // The toggles change a class on <body> or an attribute on <html>; either way the ground may
    // flip, so re-grade on any of it. gradeBg only writes when the verdict changes, so the
    // observer cannot feed itself.
    if (window.MutationObserver) {
      var mo = new MutationObserver(gradeBg);
      mo.observe(H, { attributes: true, attributeFilter: ['class', 'data-mode', 'style'] });
      mo.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-mode', 'style'] });
    }
    addEventListener('click', function () { setTimeout(gradeBg, 0); }, true);
    ['wz-vig','wz-grille','wz-soft-l','wz-soft-r'].forEach(function (c) {
      if (document.querySelector('.' + c)) return;
      var d = document.createElement('div'); d.className = c; d.setAttribute('aria-hidden', 'true');
      document.body.appendChild(d);
    });
    var b = document.querySelector('.wz-power');
    if (b) b.addEventListener('click', function () { i = (i + 2) % 3; remember(i); apply(); });

    var mg = document.querySelector('.wz-mag');
    if (mg) mg.addEventListener('click', function () {
      if (i !== 2) return;
      if (H.classList.contains('wz-mag-on') || zoom > 1.0001) { H.classList.remove('wz-mag-on'); resetZoom(); }
      else { H.classList.add('wz-mag-on'); setZoom(1.35, innerWidth / 2, innerHeight / 2); }
    });
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && zoom > 1.0001) { H.classList.remove('wz-mag-on'); resetZoom(); }
    });
    addEventListener('mousemove', onMove, { passive: true });
    // Rest at a slight angle rather than snapping flat: the POV reading is what makes it stop
    // looking like a plain page, and it should not depend on the cursor still moving.
    rest = function () {
      H.style.setProperty('--wz-px','0px'); H.style.setProperty('--wz-py','0px');
      H.style.setProperty('--wz-sl','0');   H.style.setProperty('--wz-sr','0');
    };
    addEventListener('mouseleave', rest);
    window.wzRest = rest;
    i = recall();
    mirrorBodyChildRules();
    apply(); rest(); hint();
  };
})();


/* wuld-sfx.js -- the sound layer for library.wuld.ink. Pairs with wuld-vfx.js and shares its tier.
 *
 * THE SOUNDS ARE SYNTHESIZED, NOT SAMPLED. See P5_SFX_SPEC.md: the reference recording was segmented
 * into 100 events and measured, the operator's "no high-pitched" instruction turned out to be a clean
 * filter (centroid <1200 Hz, <5% of energy above 3 kHz) keeping 76 of them, and these seven were
 * generated from the surviving profile. Nothing here is cut from anyone's recording.
 *
 * THE DESIGN RULE, inherited from that profile: the longer the sound, the lower it sits. Hover near
 * 900 Hz, mode changes near 175 Hz. That inverse relation is most of why the set coheres, so if a
 * sound is ever added, place it on that line rather than beside it. */
(function () {
  var H = document.documentElement;
  var SRC = '/sfx/';
  /* gain per sound. Hover is the quietest by a wide margin because it is the one that fires most --
     82 objection cards on the flagship -- and an event that common has to sit under the reading
     rather than on top of it. */
  var BANK = {
    hover:        { f: 'wz-hover.ogg',        g: 0.18 },
    click:        { f: 'wz-click.ogg',        g: 0.42 },
    expand:       { f: 'wz-expand.ogg',       g: 0.38 },
    collapse:     { f: 'wz-collapse.ogg',     g: 0.34 },
    magnifier_in: { f: 'wz-magnifier_in.ogg', g: 0.40 },
    tier_step:    { f: 'wz-tier_step.ogg',    g: 0.46 }
  };
  var AMB = { f: 'wz-ambience_loop.ogg', g: 0.30 };

  var ctx = null, buf = {}, raw = {}, dec = {}, ambNode = null, ambGain = null, unlocked = false;
  var HOVER_MS = 120, lastHover = 0;
  /* A sound asked for before its buffer existed, and when. PENDING_MS is how long a late arrival
     still reads as a response to the click that asked for it rather than as a stray noise. */
  var pending = null, pendingAt = 0, PENDING_MS = 400;

  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function muted() { try { return localStorage.getItem('wz-muted') === '1'; } catch (e) { return false; } }
  function setMuted(v) { try { localStorage.setItem('wz-muted', v ? '1' : '0'); } catch (e) {} paint(); }

  /* Audible only at the vfx tier, on a dark ground, with motion allowed and sound not muted.
     Same gate shape as the glow, deliberately: one power button should mean one thing. */
  function live() {
    return H.classList.contains('wz-vfx') && !H.classList.contains('wz-lightbg')
           && !reduced() && !muted();
  }

  /* NETWORK EARLY, CONTEXT LATE. The ArrayBuffers are fetched on idle -- plain fetch needs no
     AudioContext and no gesture -- while decodeAudioData and resume() wait for the first real
     gesture, which is what the autoplay policy actually requires. Creating a context before a
     gesture is legal but starts it suspended and earns a console warning; doing the network first
     means the first click is audible instead of silently arming. */
  function prefetch() {
    var all = Object.keys(BANK).map(function (k) { return [k, BANK[k].f]; });
    all.push(['_amb', AMB.f]);
    all.forEach(function (p) {
      fetch(SRC + p[1]).then(function (r) { return r.ok ? r.arrayBuffer() : null; })
        .then(function (b) { if (b) { raw[p[0]] = b; decodeOne(p[0]); } })
        .catch(function () {});         // a missing sound is silence, never an error the reader sees
    });
  }

  function unlock() {
    if (unlocked) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { unlocked = true; return; }
    unlocked = true;
    try { ctx = new AC(); } catch (e) { return; }
    if (ctx.state === 'suspended') ctx.resume();
    Object.keys(raw).forEach(decodeOne);
  }

  /* DECODE IS ARRIVAL-DRIVEN, NOT GESTURE-DRIVEN. It used to be a single pass over raw{} inside
     unlock(), which meant any sound whose download had not landed by the first gesture was never
     decoded at all -- silent for the rest of the session, not just for that click. Measured: with
     the sound files arriving 3s late, a click at 1.2s left every later click silent too. So both
     sides call this, it is idempotent, and whichever of the two happens second does the decoding. */
  function decodeOne(k) {
    if (!ctx || buf[k] || !raw[k] || dec[k]) return;
    dec[k] = 1;
    try {
      ctx.decodeAudioData(raw[k].slice(0),
        function (d) { buf[k] = d; onDecoded(k); },
        function () { dec[k] = 0; });
    } catch (e) { dec[k] = 0; }
  }

  /* The first gesture creates the context and schedules the decodes in the same tick, so the click
     that unlocks audio asks for a buffer that is ~45ms from existing (measured) and used to get
     silence -- the one click most likely to be a reader testing whether sound works. play() leaves
     the name here; this fires it once, if the tier still allows it. */
  function onDecoded(k) {
    if (k === '_amb') { ambMaybeStart(); return; }
    if (pending === k && performance.now() - pendingAt < PENDING_MS) { pending = null; play(k); }
  }

  /* ONE DECODED BUFFER PER SAMPLE, a fresh source node per play. BufferSourceNodes are single-use by
     spec -- reusing one throws -- so the pooling that matters is of the decoded PCM, which is the
     expensive part, not of the node, which is nearly free. */
  function play(name) {
    if (!live()) return;
    if (!ctx || !buf[name]) {
      if (ctx && raw[name]) { pending = name; pendingAt = performance.now(); decodeOne(name); }
      return;
    }
    try {
      var s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = buf[name];
      g.gain.value = (BANK[name] || { g: 0.3 }).g;
      s.connect(g); g.connect(ctx.destination);
      s.start(0);
    } catch (e) {}
  }

  function ambMaybeStart() {
    if (!ctx || !buf._amb) return;
    if (!live()) { ambStop(); return; }
    if (ambNode) return;
    try {
      ambNode = ctx.createBufferSource(); ambGain = ctx.createGain();
      ambNode.buffer = buf._amb; ambNode.loop = true;
      ambGain.gain.value = 0;
      ambNode.connect(ambGain); ambGain.connect(ctx.destination);
      ambNode.start(0);
      ambGain.gain.linearRampToValueAtTime(AMB.g, ctx.currentTime + 1.6);   // no sudden arrival
    } catch (e) { ambNode = null; }
  }
  function ambStop() {
    if (!ambNode) return;
    var n = ambNode, g = ambGain; ambNode = null; ambGain = null;
    try {
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(function () { try { n.stop(); } catch (e) {} }, 700);
    } catch (e) { try { n.stop(); } catch (e2) {} }
  }

  /* DELEGATION, not 82 listeners. The wings build their objection list from JSON after load, so
     anything bound at init would miss every card on the page. One listener on the document survives
     that, and survives the list being re-rendered by a filter. */
  function hoverable(t) { return t && t.closest && t.closest('.obj, .card, .lib-card, button, summary, a'); }
  function onOver(e) {
    if (!live()) return;
    var el = hoverable(e.target); if (!el) return;
    if (e.relatedTarget && el.contains(e.relatedTarget)) return;   // moving WITHIN a card is not a new hover
    var now = performance.now();
    if (now - lastHover < HOVER_MS) return;                        // drop, never queue
    lastHover = now;
    play('hover');
  }
  function onClick(e) {
    unlock();
    if (!live()) return;
    var d = e.target.closest && e.target.closest('details');
    if (e.target.closest && e.target.closest('summary') && d) { play(d.open ? 'collapse' : 'expand'); return; }
    if (e.target.closest && e.target.closest('.wz-power')) { play('tier_step'); return; }
    if (e.target.closest && e.target.closest('.wz-mag'))   { play('magnifier_in'); return; }
    if (e.target.closest && e.target.closest('button, a, summary')) play('click');
  }

  function paint() {
    var b = document.querySelector('.wz-mute');
    if (!b) return;
    var off = muted() || reduced();
    b.textContent = off ? '✕' : '●';
    b.setAttribute('aria-pressed', off ? 'true' : 'false');
    b.setAttribute('aria-label', off ? 'Sound off. Turn on.' : 'Sound on. Turn off.');
    b.setAttribute('title', off ? 'Sound off' : 'Sound on');
    H.classList.toggle('wz-muted', off);
    if (off) ambStop(); else ambMaybeStart();
  }

  window.wzSfxInit = function () {
    var chin = document.querySelector('.wz-chin');
    if (chin && !document.querySelector('.wz-mute')) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'wz-mute';
      chin.appendChild(b);
      b.addEventListener('click', function (e) { e.stopPropagation(); unlock(); setMuted(!muted()); });
    }
    paint();
    if ('requestIdleCallback' in window) requestIdleCallback(prefetch, { timeout: 3000 });
    else setTimeout(prefetch, 1200);
    ['pointerdown', 'keydown'].forEach(function (t) {
      addEventListener(t, unlock, { once: true, passive: true });
    });
    addEventListener('pointerover', onOver, { passive: true });
    addEventListener('click', onClick, true);
    /* The tier can change under us -- the power button, or the ground flipping with a mode toggle.
       gradeBg's observer already watches for that; this one keeps the ambience honest about it. */
    /* The observer fires on EVERY class change of <html>, and the magnifier toggles wz-zooming on
       every wheel event (added on the event, removed 90ms later) -- so a fast wheel gesture was
       running paint()'s five DOM writes per tick for a state that had not changed. paint() now
       runs only when the answer it paints has actually moved. */
    if (window.MutationObserver) {
      var lastLive = live(), lastOff = muted() || reduced();
      new MutationObserver(function () {
        var l = live(), off = muted() || reduced();
        var liveChanged = (l !== lastLive), offChanged = (off !== lastOff);
        lastLive = l; lastOff = off;
        if (liveChanged) { if (l) ambMaybeStart(); else ambStop(); }
        if (liveChanged || offChanged) paint();
      }).observe(H, { attributes: true, attributeFilter: ['class', 'data-mode'] });
    }
  };
})();


/* wuld-fb.js -- per-card feedback. One mailto per objection, carrying the card's own id.
 *
 * WHY PER-CARD AND NOT A CORNER BUTTON. A corner button produces "something's broken somewhere";
 * a per-card one arrives with the objection id already attached, which is the difference between a
 * report you can act on and one you have to chase. Site-wide comments already have a route --
 * wuld.ink/contact -- so a fourth chin button would add a channel without adding information, and
 * at 320px the chin row is already as wide as it can be.
 *
 * NO BACKEND. A mailto: costs nothing, needs no form, no storage and no consent banner. A form
 * needs all four, and that is a bigger decision than it looks.
 *
 * INJECTED, NOT DELEGATED, AND OBSERVED. The wings build their card list from JSON after load --
 * measured: 0 of 5 wings have a single `class="obj"` in their static HTML -- and re-render it when
 * a filter changes. A one-shot pass at boot would find nothing at all. */
(function () {
  var TO = 'contact@wuld.ink';
  var SEL = 'article.obj[id^="obj-"]:not([data-wz-fb])';

  function heading(card) {
    var h = card.querySelector('h2, h3, h4');
    return h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  /* THE CARD DESCRIBES ITSELF. A report that says only "this one is wrong" costs whoever reads it
     a hunt through five libraries to work out which card it was. So the draft arrives carrying the
     card's own context -- the library, the headline, the colloquial names on its chips, and its
     classification strip -- pulled from the card at the moment of the click, which means it cannot
     drift out of date the way a hand-written note would.
     The strip is read child by child rather than with textContent, because the control is itself a
     DOM child of that strip and would otherwise append the word "feedback" to its own report. */
  function strip(card) {
    var m = card.querySelector('.obj-meta');
    if (!m) return '';
    var out = '';
    for (var i = 0; i < m.childNodes.length; i++) {
      var n = m.childNodes[i];
      if (n.nodeType === 1 && String(n.className || '').indexOf('wz-fb') > -1) continue;
      out += n.textContent || '';
    }
    return out.replace(/\s+/g, ' ').trim();
  }
  function chips(card) {
    var k = card.querySelector('.kw');
    if (!k) return [];
    var out = [];
    for (var i = 0; i < k.children.length && out.length < 8; i++) {
      var t = k.children[i].textContent.replace(/\s+/g, ' ').trim();
      if (t && t.length <= 40) out.push(t);
    }
    return out;
  }
  function clip(s, n) { return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '\u2026' : s; }

  /* The writing space goes FIRST. Mail clients drop the cursor at the top of the body, so anything
     above the prompt is something the reader has to scroll past before they can type. Everything
     the machine contributed sits below the rule, out of the way but travelling with the message.
     MAILTO LENGTH IS A REAL LIMIT -- Windows passes the whole URL through a shell, and clients
     start truncating well before 2000 characters. So the body is built longest-first and the
     optional parts are dropped, in order, until the encoded URL fits under the budget. */
  var MAX_URL = 1800;
  function href(card) {
    var id   = card.id;
    var url  = location.href.split('#')[0] + '#' + id;
    var lib  = (document.title.split('\u2014')[0] || '').trim();
    var head = clip(heading(card), 240);
    var cls  = strip(card);
    var kw   = chips(card);
    var lead = "(what's wrong, or what's missing?)\n\n\n"
             + "-- added automatically, so you needn't describe which card --\n";
    function build(withKw, headLen) {
      var b = lead;
      if (lib)  b += 'library:        ' + lib + '\n';
      if (head) b += 'objection:      "' + clip(head, headLen) + '"\n';
      if (withKw && kw.length) b += 'also called:    ' + kw.join(' \u00b7 ') + '\n';
      if (cls)  b += 'classification: ' + cls + '\n';
      return b + 'id:             ' + id + '\nlink:           ' + url + '\n';
    }
    var subj = 'library feedback \u2014 ' + id;
    var tries = [[true, 240], [true, 140], [false, 140], [false, 80]];
    var out;
    for (var i = 0; i < tries.length; i++) {
      out = 'mailto:' + TO + '?subject=' + encodeURIComponent(subj)
          + '&body=' + encodeURIComponent(build(tries[i][0], tries[i][1]));
      if (out.length <= MAX_URL) break;
    }
    return out;
  }

  function pass() {
    var cards = document.querySelectorAll(SEL), n = 0;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], m = c.querySelector('.obj-meta');
      c.setAttribute('data-wz-fb', '1');            // set even when there is no meta strip, so a
      if (!m) continue;                             // card without one is not re-examined forever
      var a = document.createElement('a');
      a.className = 'wz-fb';
      a.href = href(c);
      a.rel = 'nofollow';
      a.textContent = 'feedback';   // uppercased by CSS, like every other micro-label on the card
      a.title = 'Email a correction or comment about this objection';
      a.setAttribute('aria-label', 'Email a correction or comment about this objection: ' + (heading(c) || c.id));
      /* Appended, not prepended. While the control was floated it had to precede the meta text to
         sit beside it; anchored, its position is set by CSS and DOM order is free to match reading
         order instead -- so a keyboard lands on the meta text first and the utility after it. */
      m.appendChild(a);
      n++;
    }
    return n;
  }

  window.wzFbInit = function () {
    var n = pass();
    if (window.MutationObserver) {
      var queued = false;
      new MutationObserver(function () {
        if (queued) return;                          // a filter re-render is hundreds of mutations;
        queued = true;                               // coalesce them into one pass on the next frame
        requestAnimationFrame(function () { queued = false; pass(); });
      }).observe(document.body, { childList: true, subtree: true });
    }
    return n;
  };
})();


/* wuld-tour.js -- per-view walkthroughs. One feature at a time, everything else darkened.
 *
 * ONE TOUR PER VIEW, NOT ONE PER PAGE. The flagship is five surfaces behind one URL -- the library,
 * the mechanism web, the dependency graph, the argument flow map and the real-world examples -- and
 * a reader who opens the dependency graph for the first time three weeks after their first visit
 * has had no introduction to it at all. Each view therefore carries its own short tour and its own
 * once-ever flag, fired when that view is ACTIVATED rather than when the page loads.
 *
 * THREE STEPS EACH, except the library's six. A tour is a tax on the reader's attention and the
 * only honest justification for it is that the thing genuinely is not self-evident. The last step
 * of every view tour is its METHODOLOGY button, because that is the affordance readers most often
 * never find and the one that most changes how the view should be read.
 *
 * ALWAYS SKIPPABLE: Skip, Escape, and clicking anywhere off the card, at every step. Never runs
 * under prefers-reduced-motion. The chin's ? button re-opens the tour for whatever view you are
 * looking at, seen or not.
 *
 * THE COPY BELOW IS A DRAFT. Edit the `text` strings freely; nothing else reads them. */
(function () {
  var H = document.documentElement;
  var PREFIX = 'wz-tour:';

  function vis(e) { return !!(e && e.getClientRects().length); }
  function q(s) { return document.querySelector(s); }

  /* Views are resolved most-specific first: `library` is the fallback, so it must be last or it
     would answer for every page that has a card on it -- including the graph views, which sit
     inside the same library section. */
  var TOURS = [
    /* THE GRAPH-VIEW COPY BELOW IS SOURCE-GATED, LIKE THE PRECIS. It describes the operator's own
       apparatus, and the first draft got three things wrong that no test noticed: it said to click
       an EDGE on the mechanism web (nodes are what is clickable -- 117 with pointer cursors, 142
       lines with none), described that web's edges as relations between mechanisms (they join an
       objection to a mechanism), and called the dependency graph's weak edges "low-confidence"
       (weak means the response would survive the premise's removal; confidence is what the REVIEW
       and PROVISIONAL badges mark). tourcopy_gate.py now holds a source sentence for every claim
       in these steps and fails on any it cannot find verbatim in the panel. */
    { key: 'map', name: 'the mechanism web',
      when: function () { return vis(q('#map-view')); },
      steps: [
        { sel: '#map-graph',
          text: 'The mechanism web. Two kinds of node \u2014 objections, and the psychological mechanisms that generate them \u2014 with an edge wherever an objection runs on a mechanism. It answers why an interlocutor says a thing, not what they said. Click a node to see everything it connects to.' },
        { sel: '#map-view .map-toolbar button:not(.map-methodology-btn)|union',
          text: 'Legend explains the node types; Reset puts the layout back where it started, which is worth knowing before you drag anything. Bigger mechanism nodes are more common patterns.' },
        { sel: '.map-methodology-btn',
          text: 'Methodology. Why this map exists, the five mechanism types and what each one wants as a response, and how the assignments were derived.' }
      ] },
    { key: 'dep', name: 'the dependency graph',
      when: function () { return vis(q('#dep-view')); },
      steps: [
        { sel: '#dep-graph',
          text: 'The dependency graph. An edge joins a premise to an objection whose response invokes it. Solid means load-bearing \u2014 remove the premise and the response collapses; dashed means the response would survive without it.' },
        { sel: '#dep-view .map-toolbar button:not(.dep-methodology-btn)|union',
          text: 'Toggle weak hides the dashed edges, which is the fastest way to see the structure that is actually carrying the argument.' },
        { sel: '.dep-methodology-btn',
          text: 'Methodology. Which premises are foundational and which are diagnostic, the test that decides strong from weak, and where the graph is still marked provisional.' }
      ] },
    { key: 'map1', name: 'the argument flow map',
      when: function () { return vis(q('#map1-view')); },
      steps: [
        { sel: '#m1-graph',
          text: 'The argument flow map. Given the objection just made and your response to it, which objection is most likely to come next \u2014 the library as a move tree rather than a dictionary.' },
        { sel: '#m1btn-blended,#m1btn-sophisticate,#m1btn-defender,#m1btn-drifter|union',
          text: 'Three interlocutor models and a blend. The sophisticate attacks the premise your response invoked, the defender retreats within the same mechanism, the drifter moves one tier at a time. Most edges appear in only one of them \u2014 the disagreement is the signal.' },
        { sel: '.m1-methodology-btn',
          text: 'Methodology. How the three matrices are generated, what the weights are and are not, and which edges were applied without independent validation.' }
      ] },
    { key: 'examples', name: 'the examples view',
      when: function () { return vis(q('#combined-rwe')) && !vis(q('#map-view')) && !vis(q('#dep-view')) && !vis(q('#map1-view')); },
      steps: [
        { sel: '#view-tabs',
          text: 'Real-world examples \u2014 things people actually said \u2014 grouped three ways: by the objection they instantiate, by who said it, or by the archetype they fit.' },
        { sel: '.filter-bar',
          text: 'Filters narrow by polarity, archetype and speaker type. Reset clears them all at once.' },
        { sel: '#sidebar',
          text: 'The left column narrows the instances shown on the right; every instance arrives with its source.' }
      ] },
    { key: 'library', name: 'this page',
      /* The wings and the flagship are different markup for the same idea: the wings render
         `article.obj` cards, the flagship renders `.objection-header` rows into #results. Steps
         below are written for both and resolve() drops whichever set is not on this page, so the
         wings land on six and the flagship on seven without either being a special case. Visibility
         matters here, not mere presence: on the flagship the cards stay in the DOM while a graph
         view is showing, and this is the fallback tour checked last. */
      when: function () { return vis(q('article.obj, .lib-card, .objection-header[id^="obj-"]')); },
      steps: [
        { sel: '.wz-power',
          text: 'Screen effects. This steps the whole layer down — full effects, then colour and type only, then nothing at all. It remembers what you chose.' },
        { sel: '.wz-mag',
          text: 'Magnifier. Hold Shift and scroll to zoom anywhere on the page, or press this and zoom with a plain wheel. Escape returns to 1×.' },
        { sel: '.wz-mute',
          text: 'Sound. A quiet mechanical room tone and small cues, only while effects are on. This switches it off and keeps it off.' },
        { sel: '#mode-standard,#mode-legible,#mode-hc,#mode-both|union',
          text: 'Reading modes. Legible lightens the page, High contrast strengthens it, Both does both. Your choice is remembered.' },
        { sel: '.view-switcher',
          text: 'Four views of the same corpus \u2014 the library, the mechanism web, the dependency graph and the argument flow map. Each has its own short tour the first time you open it.' },
        { sel: 'article.obj',
          text: 'Every objection is a card: the claim as people actually put it, the words they use for it, a diagnosis of where it goes wrong, and the full response behind [+].' },
        { sel: '.objection-header',
          text: 'Every objection is a row: its tier, the register it belongs to, and the claim as people actually put it. Click one to open the response underneath it.' },
        { sel: '.rsi-methodology-btn',
          text: 'RSI methodology. How every response here was graded, what the five inputs are, and what a grade is not claiming.' },
        { sel: '.wz-fb',
          text: 'Something wrong, or missing? Feedback opens a mail draft that already names the card — so you never have to describe which one you meant.' }
      ] }
  ];

  var live = [], idx = 0, mask = [], ring, card, body, dots, prevFocus, open = false, current = null, placeGen = 0;

  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function seen(k) { try { return localStorage.getItem(PREFIX + k) === '1'; } catch (e) { return true; } }
  function mark(k) { try { localStorage.setItem(PREFIX + k, '1'); } catch (e) {} }

  function activeTour() {
    for (var i = 0; i < TOURS.length; i++) { if (TOURS[i].when()) return TOURS[i]; }
    return null;
  }

  /* "a,b,c|union" spotlights the box containing all matches; a plain selector spotlights one. A step
     whose target is not on this page is not a step -- resolving per view rather than assuming keeps
     an empty spotlight pointing at nothing from ever being drawn. */
  function resolve(tour) {
    var out = [];
    for (var i = 0; i < tour.steps.length; i++) {
      var sel = tour.steps[i].sel, uni = false;
      if (sel.slice(-6) === '|union') { sel = sel.slice(0, -6); uni = true; }
      var els = uni ? [].slice.call(document.querySelectorAll(sel)) : [q(sel)];
      els = els.filter(vis);
      if (els.length) out.push({ els: els, text: tour.steps[i].text });
    }
    return out;
  }

  function build() {
    /* FOUR PANELS AROUND THE TARGET, not one overlay with a hole. The single-element version used a
       huge box-shadow spread and then had to raise the spotlit element above it -- which, for a chin
       button, meant raising the whole chin, leaving the row undarkened and the ring stranded behind
       it. Panels cover everything EXCEPT the target, so nothing is covered and no z-index of anyone
       else's has to be touched. */
    for (var m = 0; m < 4; m++) {
      var d = document.createElement('div');
      d.className = 'wz-tour-mask'; d.setAttribute('aria-hidden', 'true');
      document.body.appendChild(d); mask.push(d);
    }
    ring = document.createElement('div');
    ring.className = 'wz-tour-ring'; ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);

    card = document.createElement('div');
    card.className = 'wz-tour-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    body = document.createElement('p'); body.className = 'wz-tour-text';
    dots = document.createElement('span'); dots.className = 'wz-tour-dots';
    var nav = document.createElement('div'); nav.className = 'wz-tour-nav';
    var skip = mkbtn('Skip', 'Skip the tour', function () { finish(); }); skip.className = 'wz-tour-skip';
    var prev = mkbtn('←', 'Previous', function () { go(idx - 1); });
    var next = mkbtn('→', 'Next', function () { go(idx + 1); });
    nav.appendChild(skip); nav.appendChild(dots); nav.appendChild(prev); nav.appendChild(next);
    card.appendChild(body); card.appendChild(nav);
    card._prev = prev; card._next = next;
    document.body.appendChild(card);
  }
  function mkbtn(label, aria, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.setAttribute('aria-label', aria);
    b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
    return b;
  }

  function unionRect(els) {
    var r = els[0].getBoundingClientRect();
    if (els.length === 1) return r;
    var t = r.top, l = r.left, bo = r.bottom, g = r.right;
    for (var i = 1; i < els.length; i++) {
      var z = els[i].getBoundingClientRect();
      t = Math.min(t, z.top); l = Math.min(l, z.left);
      bo = Math.max(bo, z.bottom); g = Math.max(g, z.right);
    }
    return { top: t, left: l, bottom: bo, right: g, width: g - l, height: bo - t };
  }

  function paint(els) {
    var r = unionRect(els), pad = 6;
    var x = r.left - pad, y = r.top - pad, w = r.width + pad * 2, h = r.height + pad * 2;
    var W = innerWidth, Hh = innerHeight;
    function set(e, a, b, c, d) {
      e.style.left = Math.max(0, a) + 'px'; e.style.top = Math.max(0, b) + 'px';
      e.style.width = Math.max(0, c) + 'px'; e.style.height = Math.max(0, d) + 'px';
    }
    set(mask[0], 0, 0, W, y);
    set(mask[1], 0, y + h, W, Hh - (y + h));
    set(mask[2], 0, y, x, h);
    set(mask[3], x + w, y, W - (x + w), h);
    set(ring, x, y, w, h);
    return [Math.round(r.top), Math.round(r.left), Math.round(r.width), Math.round(r.height)];
  }

  function place(els) {
    /* A TALL TARGET IS NOT CENTRED. A card or a graph can exceed the viewport, and block:'center'
       then puts its middle in the middle -- both ring edges off-screen, so the spotlight has no
       visible boundary at all. Showing the top of it is what a reader needs. */
    var tall = unionRect(els).height > innerHeight * 0.7;
    /* INSTANT SCROLL, DELIBERATELY. Smooth scrolling produced two different bugs in this function.
       First a rect read two frames after the call was a rect in flight, drawing a box that spanned
       two cards. The settle loop below fixed that -- and then smooth scroll's STARTUP latency
       (about two frames before anything moves) satisfied "stable for two frames" before the scroll
       had begun, so on the flagship the loop exited with the toolbar still at its pre-scroll
       position and the ring eased, via its own CSS transition, onto the view switcher 130px above.
       Frame-by-frame: loop out at 39ms, page still scrolling until 221ms. The wings passed by
       timing luck. A reader in a tour is watching the ring, not the page scroll; the ring's own
       0.2s transition carries the continuity, and an instant scroll has no latency to be fooled by. */
    els[0].scrollIntoView({ block: tall ? 'start' : 'center', behavior: 'auto' });

    /* STILL WAIT FOR LAYOUT TO SETTLE -- pages adjust themselves after a scroll (sticky headers,
       the flagship's own scroll handlers), so the rect is re-read until it stops moving. The
       MINIMUM time is the part that matters: no stability observed inside the first 150ms counts,
       because that is exactly the window in which a not-yet-started motion looks like rest. */
    /* ONE LOOP AT A TIME. Two quick arrow presses used to start two settle loops, each closing over
       its own target; both painted every frame and whichever happened to run last won -- so a fast
       reader could end a step with the ring on the previous step's target. Each call now takes a
       generation number and a loop that is no longer current stops painting. */
    var gen = ++placeGen;
    var stable = 0, last = null, t0 = performance.now();
    (function tick() {
      if (!open || gen !== placeGen) return;
      var now = paint(els);
      if (last && now[0] === last[0] && now[1] === last[1] && now[2] === last[2] && now[3] === last[3]) stable++;
      else stable = 0;
      last = now;
      var age = performance.now() - t0;
      if ((stable < 2 || age < 150) && age < 900) { requestAnimationFrame(tick); return; }
      var r = unionRect(els), cw = Math.min(340, innerWidth - 24);
      card.style.width = cw + 'px';
      var ch = card.offsetHeight || 120;
      var below = r.bottom + 18;
      var top = (below + ch < innerHeight - 12) ? below : Math.max(12, r.top - 18 - ch);
      card.style.top = Math.min(top, Math.max(12, innerHeight - ch - 12)) + 'px';
      card.style.left = Math.max(12, Math.min(r.left + r.width / 2 - cw / 2, innerWidth - cw - 12)) + 'px';
    })();
  }

  function go(n) {
    if (n < 0) return;
    if (n >= live.length) { finish(); return; }
    idx = n;
    body.textContent = live[idx].text;
    dots.textContent = (idx + 1) + ' / ' + live.length;
    card._prev.disabled = (idx === 0);
    card._next.textContent = (idx === live.length - 1) ? 'Done' : '→';
    card._next.setAttribute('aria-label', (idx === live.length - 1) ? 'Finish' : 'Next');
    place(live[idx].els);
  }

  function onKey(e) {
    if (!open) return;
    /* The tour is modal while it is open, so the keys it answers do not also reach the page --
       the flagship has its own Escape and arrow handling for the graphs, and a reader closing the
       tour should not also close a legend or nudge a graph. Capture-phase listener, so this runs
       before any page handler; stopPropagation is what keeps it from getting there. */
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(idx - 1); }
    else if (e.key === 'Tab') {
      /* Focus stays inside the dialog. Without this a keyboard reader tabs straight out into a page
         that is visually blacked out, which is the worst of both. */
      var f = card.querySelectorAll('button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function onDown(e) { if (open && !card.contains(e.target)) finish(); }

  function finish() {
    if (!open) return;
    open = false;
    if (current) mark(current.key);
    current = null;
    H.classList.remove('wz-touring');
    removeEventListener('keydown', onKey, true);
    removeEventListener('pointerdown', onDown, true);
    removeEventListener('resize', onResize);
    mask.forEach(function (d) { if (d.parentNode) d.parentNode.removeChild(d); });
    mask = [];
    if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
    if (card && card.parentNode) card.parentNode.removeChild(card);
    try { if (prevFocus && prevFocus.focus) prevFocus.focus(); } catch (e) {}
  }
  function onResize() { if (open && live[idx]) place(live[idx].els); }

  function start(tour) {
    if (open || !tour) return 0;
    live = resolve(tour);
    if (live.length < 2) return 0;          // one lonely spotlight is not a walkthrough
    current = tour;
    prevFocus = document.activeElement;
    build(); open = true;
    H.classList.add('wz-touring');
    addEventListener('keydown', onKey, true);
    addEventListener('pointerdown', onDown, true);
    addEventListener('resize', onResize);
    go(0);
    card._next.focus();
    return live.length;
  }

  /* A VIEW CHANGES ONLY WHEN SOMETHING IS CLICKED, so the check rides on clicks rather than on a
     standing observer over the whole document. The delay lets the view actually swap first. */
  var pending = null;
  function maybe() {
    if (open) return;
    var t = activeTour();
    if (t && !seen(t.key)) start(t);
  }
  function onClickCheck() { clearTimeout(pending); pending = setTimeout(maybe, 420); }

  window.wzTour = function () { return start(activeTour()); };   // console entry point

  window.wzTourInit = function () {
    /* The ? button is not gated on anything: it is the way back in after a tour has been seen, and
       it runs the tour for whatever view is in front of you rather than offering a menu of five. */
    /* NO BUTTON WHERE THERE IS NOTHING TO SHOW. The chin exists on every page the layer touches,
       so /troubleshooting/ was getting a ? that returned 0 and opened nothing -- a control whose
       only behaviour is to do nothing when pressed, which is worse than its absence. The same test
       that gates the auto-run gates the button: a library surface, detected by the mode buttons'
       stable ids, which are in the static HTML of every wing and the index and absent there. */
    var chin = q('.wz-chin');
    if (chin && !q('.wz-help') && q('#mode-standard, #mode-legible')) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'wz-help'; b.textContent = '?';
      b.setAttribute('title', 'Tutorial for this view');
      b.setAttribute('aria-label', 'Show the tutorial for this view');
      b.addEventListener('click', function (e) { e.stopPropagation(); start(activeTour()); });
      chin.appendChild(b);
    }
    if (reduced()) return 0;                 // a moving spotlight is the whole idea
    addEventListener('click', onClickCheck, true);
    /* Cards and graphs are built after load, so the first check waits for one rather than assuming.
       If none ever arrives, no tour runs and no flag is spent -- /troubleshooting/ has a chin but no
       library surface, and a walkthrough of screen effects is the last thing wanted by someone who
       landed there because the site would not load. */
    if (q('article.obj, .lib-card, #map-view')) { setTimeout(maybe, 300); return 1; }
    if (window.MutationObserver) {
      var obs = new MutationObserver(function () {
        if (q('article.obj, .lib-card')) { obs.disconnect(); setTimeout(maybe, 300); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { obs.disconnect(); }, 6000);
    }
    return 1;
  };

  /* PARSE TIME, not init time. The one-line hint in wuld-vfx.js says the same thing as the library
     tour's first step, and wzInit() fires hint() during boot -- before any init function here could
     run. Claiming the hint's key here is what stops a first-time reader being told twice, and it is
     claimed only on a page that can actually run that tour. */
  if (!reduced() && !seen('library') && q('#mode-standard, #mode-legible')) {
    try { sessionStorage.setItem('wz-hint-seen', '1'); } catch (e) {}
  }
})();


  window.wzInit();
  if (window.wzSfxInit) window.wzSfxInit();
  if (window.wzFbInit)  window.wzFbInit();
  if (window.wzTourInit) window.wzTourInit();
  console.log('%cWULD VFX loaded - power button bottom-right cycles off / cosmetic / vfx',
              'color:#FF8195;font-weight:bold');
  console.log('%cTOUR: runs once per browser. To see it again: wzTour()',
              'color:#9aa7ff;font-weight:bold');
  fetch('/sfx/wz-click.ogg', {method:'HEAD'}).then(function(r){
    if (r.ok) console.log('%cSFX: /sfx/ is present - click a card or summary to unlock audio',
                          'color:#8ecf9a;font-weight:bold');
    else throw 0;
  }).catch(function(){
    console.log('%cSFX: /sfx/ NOT on this host yet - the page will be silent. That is the\ndeploy not having landed, not the sound layer failing. Everything else on this script works.',
                'color:#e8b24a;font-weight:bold');
  });
})();
