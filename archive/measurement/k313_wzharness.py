"""Shared harness preamble.

THE TOUR RUNS IN EVERY FRESH CONTEXT. Playwright gives each context an empty localStorage, so the
first-visit walkthrough fires on every page every harness opens -- and it covers the viewport with
a 74% black mask. Any harness that samples PIXELS then measures the mask instead of the page:
fbcontrast.py went from eight cells at 5.37-13.89:1 to eight cells at 1.00-1.74:1 in one run, with
no CSS change at all, and two of them read exactly 1.00 because the mask had flattened glyph and
ground to the same colour. A harness that cannot tell a regression from its own overlay is worse
than no harness.

Import SUPPRESS and pass it to add_init_script on any context that measures pixels or geometry.
Do NOT use it in tourtest.py, which is the one place the tour is the subject."""
SUPPRESS = "try{localStorage.setItem('wz-tour-done','1')}catch(e){}"
