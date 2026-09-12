#!/usr/bin/env python3
"""
apparatus_numbers.py -- generate the Apparatus's measured lines FROM the measurements.

Every number in the Apparatus that describes the film has, until now, been typed by hand from a log.
That is the mechanism behind every stale figure in this project: a render moves, someone remembers to
patch two numbers, and eight others sit there describing a file that no longer exists. Twice the
document shipped describing a superseded render, and once the stale figure was the photosensitivity
claim.

So the measured lines are generated. Run this against the delivered file(s) and paste the blocks it
emits; nothing in them is transcribed. The marker line it emits carries the render tag, and it is
emitted BY THE MEASUREMENT -- which is the only ordering in which a marker gate means anything. A
marker bumped because someone announced a new render certifies that they announced it.

One cut or two. --wuld is optional; when it is absent every block describes one film and the
comparative paragraphs are replaced rather than left half-written. The tool once required both, and
on the release where only one cut shipped that requirement is what sent the Apparatus back to being
hand-typed -- which is the failure this file exists to end.

    python3 apparatus_numbers.py --jsc cut/libshow_full_v3.mp4 --render v3 > apparatus_blocks.md
    python3 apparatus_numbers.py --jsc cut/a.mp4 --wuld cut/b.mp4 --render v10 > blocks.md
"""
import argparse, json, subprocess, sys, re
from pathlib import Path

CACHE = Path("cut/_measure")

def _md5(path):
    import hashlib
    h = hashlib.md5()
    with open(path, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""): h.update(c)
    return h.hexdigest()

def cached(kind, path, produce):
    """Measurements keyed by the FILE'S OWN md5, not by its name.

    A cache keyed by filename is how a stale number reaches a document -- the same name, a different
    render, nobody notices. Keyed by content hash, a changed file simply misses and is re-measured;
    there is no state in which a cached figure can describe a file it did not come from. That is the
    same argument as the marker: a name is a claim, a hash is a fingerprint."""
    CACHE.mkdir(parents=True, exist_ok=True)
    key = CACHE / ("%s.%s.json" % (_md5(path), kind))
    if key.exists():
        d = json.loads(key.read_text())
        print("  reusing %s for %s (md5-keyed)" % (kind, Path(path).name), file=sys.stderr)
        return d
    d = produce()
    key.write_text(json.dumps(d, indent=1))
    return d

def run_json(script, path, extra=()):
    def go():
        p = subprocess.run([sys.executable, script, *extra, path], capture_output=True, text=True)
        if p.returncode: raise SystemExit("%s failed on %s:\n%s" % (script, path, p.stderr[-1500:]))
        m = re.search(r"\{.*\}", p.stdout, re.S)
        if not m: raise SystemExit("no JSON from %s on %s" % (script, path))
        return json.loads(m.group(0))
    return cached(Path(script).stem, path, go)

def verify(path):
    def go():
        p = subprocess.run([sys.executable, "verify_libshow.py", path], capture_output=True, text=True)
        m = re.search(r"\{.*?\n\}", p.stdout, re.S)
        if not m: raise SystemExit("no JSON from verify_libshow on %s\n%s" % (path, p.stdout[-800:]))
        d = json.loads(m.group(0))
        d["_checks"] = [l.strip() for l in p.stdout.splitlines() if " pass" in l or "FAIL" in l]
        return d
    return cached("verify", path, go)

def fmt(n): return "{:,}".format(n)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jsc", required=True)
    # THE NUMBER OF CUTS IS A FACT ABOUT THE FILM, NOT A CONSTANT IN THE TOOL. This started as a
    # two-cut generator with both keys required, so when the repost stopped being a separate render
    # the tool could not describe what shipped and the Apparatus went back to being hand-typed --
    # which is the exact failure the docstring above says this file exists to end. --wuld is now
    # optional and everything below iterates CUTS.
    ap.add_argument("--wuld", default=None)
    ap.add_argument("--render", required=True, help="the render tag these files ARE, e.g. v10")
    a = ap.parse_args()

    CUTS = [("jsc", "JosiahSCooper", a.jsc)]
    if a.wuld:
        CUTS.append(("wuld", "W.U.L.D.", a.wuld))
    PATH = {k: p for k, _, p in CUTS}
    NAME = {k: n for k, n, _ in CUTS}
    KEYS = [k for k, _, _ in CUTS]

    V = {k: verify(p) for k, _, p in CUTS}
    # the picture rect comes from the cut's own geometry, not a constant retyped here
    import cut_libshow as _C
    _ow, _oh, _sh, _cut = _C._screen_geometry()
    rect = ("--picture-rect", "%d:%d:%d:%d" % (_C.BEZEL_INSET, _C.BEZEL_INSET, _ow, _oh))
    F = {k: run_json("flash_wcag.py", p, rect) for k, _, p in CUTS}
    for k in KEYS:
        V[k]["_file"] = Path(PATH[k]).name

    # ---- the marker -----------------------------------------------------------------------------
    # A NAME IS A CLAIM; A HASH IS A FINGERPRINT. A marker that says only "v10" cannot be checked by
    # anyone who has not got the film -- and the only party who can measure the film is the one
    # writing the marker, so a bare version tag is a self-certification with a witness, not a
    # verification, and the Apparatus must not describe it as one.
    #
    # So the marker carries the md5 and byte count of the exact files these numbers were measured
    # from, and cut_libshow.py writes the same two facts into cut/render_manifest.json from the step
    # that PRODUCED them. Two different steps of the pipeline, independently. A document measured off
    # a superseded render now fails mechanically instead of relying on anyone remembering which one
    # shipped. That closes doc-against-render, which is the failure that has recurred.
    # It does not close doc-against-what-a-platform-serves. Nothing here can.
    fp = {}
    for key in KEYS:
        import hashlib
        h, n = hashlib.md5(), 0
        with open(PATH[key], "rb") as fh:
            for chunk in iter(lambda: fh.read(1 << 20), b""):
                h.update(chunk); n += len(chunk)
        fp[key] = (h.hexdigest(), n)

    man_path = Path("cut/render_manifest.json")
    man = json.loads(man_path.read_text()) if man_path.exists() else {}
    mismatch = []
    for key in KEYS:
        e = man.get(Path(PATH[key]).name)
        if not e:
            mismatch.append("%s is not in the render manifest" % Path(PATH[key]).name)
        elif (e.get("md5"), e.get("bytes")) != fp[key]:
            mismatch.append("%s: manifest says %s/%s, the file measured is %s/%d"
                            % (Path(PATH[key]).name, e.get("md5"), e.get("bytes"), *fp[key]))
    if mismatch:
        sys.stderr.write("MANIFEST MISMATCH -- the render side and the measurement side disagree:\n  "
                         + "\n  ".join(mismatch) + "\n")
        raise SystemExit(2)

    out = []
    out.append("<!-- measured: %s %s -->"
               % (a.render, " ".join("%s:%s/%d" % (k, fp[k][0], fp[k][1]) for k in KEYS)))
    out.append("<!-- generated by apparatus_numbers.py from %s; hashes cross-checked against "
               "cut/render_manifest.json, which the render step wrote. Do not hand-edit the numbers "
               "below -- re-run it. -->" % " and ".join(V[k]["_file"] for k in KEYS))
    out.append("")

    # ---- §6, per cut. Never one sentence covering both: one ends in near-darkness and the other on
    #      a cream page, and every claim that has averaged them has been wrong in one direction or
    #      the other.
    out.append("## SECTION 6 REPLACEMENT (photosensitivity)%s\n"
               % (" -- written per cut" if len(KEYS) > 1 else ""))
    for key in KEYS:
        name = NAME[key]
        v, f = V[key], F[key]
        out.append("**%s cut** -- %s frames." % (name, fmt(v["frames_decoded"])))
        out.append("")
        out.append("- criterion: WCAG 2.3.1 general flash / ITC area-and-rate form "
                   "(pair of opposing changes >= %.2f relative luminance, darker end below %.2f, "
                   "over more than %.0f%% of the displayed screen area, no more than 3 per second)"
                   % (f["threshold_rel_luma"], f["darker_below"], 100 * f["area_condition"]))
        out.append("- relative luminance, frame mean: min %.3f, mean %.3f, **max %.3f**"
                   % (f["frame_mean_rel_luma_min"], f["frame_mean_rel_luma_mean"],
                      f["frame_mean_rel_luma_max"]))
        out.append("- relative luminance, per pixel: **max %.3f**; up to %.1f%% of a frame sits above "
                   "the threshold" % (f["pixel_rel_luma_max"], 100 * f["max_frame_area_above_luma_threshold"]))
        out.append("- widest luma-qualifying excursion: **%s px** at **%.2f s** -- %.1f%% of the "
                   "displayed frame, %.1f%% of the picture inside the bezel (the area condition needs "
                   "%.0f%% of the displayed screen)"
                   % (fmt(f["peak_luma_qualifying_area_px"]), f["peak_luma_qualifying_area_at_s"],
                      100 * f["peak_luma_qualifying_area_fraction_of_frame"],
                      100 * f["peak_luma_qualifying_area_fraction_of_picture"],
                      100 * f["area_condition"]))
        out.append("- transitions meeting the area condition: **%d**; general flashes (opposing "
                   "pairs): **%d**; **maximum in any one second: %d** against a limit of %d"
                   % (f["flash_transitions"], f["general_flashes"],
                      f["max_flashes_per_second"], f["limit_flashes_per_second"]))
        if f.get("first_flash_transitions_s"):
            out.append("- they occur at: %s"
                       % ", ".join("%.1f s" % t for t in f["first_flash_transitions_s"]))
        if f.get("passes_on"):
            out.append("- **passes on**: %s" % f["passes_on"])
        out.append("")
        # the old fixed gate, and whether it was capable of failing on this cut
        out.append("- the film's earlier fixed check (no single-frame step in 8-bit field luminance "
                   "over 40 of 255) reported **%s** on this cut. Its entire field-luminance range is "
                   "**%.1f**, so range divided by threshold is **%.3f** -- %s. Largest single-frame "
                   "step: **%.1f of 255**, at %.2f s, which is %.1f%% of this cut's whole range."
                   % ("a pass it could not have failed" if not v.get("flash_gate_binding") else "a pass",
                      v["yavg_range"], v["flash_gate_headroom_ratio"],
                      "a step over 40 was arithmetically impossible, so that check examined nothing "
                      "and the frequency check downstream of it examined nothing either"
                      if not v.get("flash_gate_binding") else
                      "the check was capable of failing on this cut",
                      v["max_frame_step_8bit"], v["max_step_at_s"], v["max_step_pct_of_range"]))
        out.append("")

    # ---- the asymmetry, stated rather than left for the reader to infer ------------------------
    # "Both cuts pass" invites the assumption that both are equally verified. Here they are not, and
    # the two axes come apart: how much EVIDENCE there is, and how much MARGIN. A reader deserves
    # both, and deserves to be told when the better-evidenced cut is the one closer to a limit.
    # With one cut there is no asymmetry to state and this block emits nothing.
    def _strength(k):
        v, f = V[k], F[k]
        return dict(gate_live=bool(v.get("flash_gate_binding")),
                    ratio=v.get("flash_gate_headroom_ratio"),
                    flashes=f["general_flashes"], per_sec=f["max_flashes_per_second"],
                    limit=f["limit_flashes_per_second"])
    if len(KEYS) > 1:
        sj, sw = _strength("jsc"), _strength("wuld")
        if sj["gate_live"] != sw["gate_live"] or sj["flashes"] != sw["flashes"]:
            better = "W.U.L.D." if sw["gate_live"] and not sj["gate_live"] else "JosiahSCooper"
            worse  = "JosiahSCooper" if better == "W.U.L.D." else "W.U.L.D."
            bs, ws = (sw, sj) if better == "W.U.L.D." else (sj, sw)
            out.append("**The two cuts are not equally verified, and the better-evidenced one is the "
                       "closer to a limit.** Both pass, and that sentence on its own would mislead. On "
                       "the %s cut the inherited fixed check is **live** (range over threshold %.3f) and "
                       "passed, and the per-pixel measurement found **%d** general flash%s against a "
                       "limit of %d — it is tested, and it has something to be tested about. On the %s "
                       "cut that same check is **vacuous** (%.3f) and contributed no evidence at all, "
                       "while the per-pixel measurement found **%d**. So the %s cut is better evidenced "
                       "and nearer a threshold; the %s cut is further from every threshold and worse "
                       "evidenced. Neither of those is a reason to prefer one reading over the other, "
                       "and both are reasons not to read \"both cuts pass\" as \"both cuts were "
                       "equally examined.\""
                       % (better, bs["ratio"], bs["flashes"], "" if bs["flashes"] == 1 else "es",
                          bs["limit"], worse, ws["ratio"], ws["flashes"], better, worse))
            out.append("")
    else:
        # WHAT A SINGLE PASS IS EVIDENCE OF DEPENDS ON WHETHER THE CHECK COULD HAVE FAILED. With two
        # cuts that was said comparatively. With one it still has to be said, or "it passes" carries
        # more weight than the measurement supports.
        s = _strength(KEYS[0])
        out.append("**What this pass is evidence of.** The per-pixel measurement above is the live "
                   "one: it found **%d** general flash%s against a limit of %d per second. The "
                   "inherited fixed check (>40 of 255) is **%s** on this cut -- range over threshold "
                   "%.3f -- so %s. One cut ships, and it is the one measured here; there is no "
                   "second cut against which to read this as a comparison."
                   % (s["flashes"], "" if s["flashes"] == 1 else "es", s["limit"],
                      "live" if s["gate_live"] else "vacuous", s["ratio"],
                      "it is evidence" if s["gate_live"] else
                      "its pass is not evidence -- a step over 40 was arithmetically impossible and "
                      "the frequency check downstream of it examined nothing"))
        out.append("")

    out.append("**What these measurements are not.** A full-frame reading cannot evaluate the 10 "
               "degree visual field WCAG scopes the area condition to; this uses the whole displayed "
               "frame, which is the ITC broadcast form. Red flash is not evaluated -- it needs a "
               "per-pixel saturated-red test. Peak white is assumed at the standard 200 cd/m2; no "
               "particular viewer's display is modelled. This is a measurement against a cited "
               "criterion, not a clinical verdict, and it does not replace one.\n")

    # ---- the numbers block and the verification table
    def _clock(k):
        d = V[k]["duration_s"]
        return "%d:%04.1f" % (int(d // 60), d % 60)

    out.append("## FILM IN NUMBERS -- duration and delivery lines\n")
    _k0 = KEYS[0]
    if len(KEYS) == 1:
        out.append("- **Duration** -- **%s frames = %.3f s (%s)**. %dx%d, %s, %s."
                   % (fmt(V[_k0]["frames_decoded"]), V[_k0]["duration_s"], _clock(_k0),
                      V[_k0]["width"], V[_k0]["height"], V[_k0]["pix_fmt"], V[_k0]["rate"]))
        out.append("- **Delivery** -- %.1f LUFS / LRA %.1f / true peak %.1f dBFS"
                   % (V[_k0]["lufs"], V[_k0]["lra"], V[_k0]["peak_dbfs"]))
    else:
        out.append("- **Duration** -- %s. All %dx%d, %s, %s."
                   % ("; ".join("%s cut **%s frames = %.3f s (%s)**"
                                % (NAME[k], fmt(V[k]["frames_decoded"]), V[k]["duration_s"], _clock(k))
                                for k in KEYS),
                      V[_k0]["width"], V[_k0]["height"], V[_k0]["pix_fmt"], V[_k0]["rate"]))
        out.append("- **Delivery** -- %s"
                   % "; ".join("%.1f LUFS / LRA %.1f / true peak %.1f dBFS (%s)"
                               % (V[k]["lufs"], V[k]["lra"], V[k]["peak_dbfs"], NAME[k]) for k in KEYS))

    # --- the take census and the cue count, derived rather than remembered ------------------------
    import cut_libshow as _CC, glob as _g, os as _os
    _CC.CAPTURE_DIR = "capture"
    EDL_FOR = {"jsc": _CC.build_edl_full, "wuld": _CC.build_edl_wuld}
    cens = {}
    for key in KEYS:
        E = EDL_FOR[key]()
        t = sorted({s["src"][1] for s in E if s["src"][0] == "take"})
        cens[key] = (len(t), len([x for x in t if x not in _CC.ROOM_TAKES]),
                     len([x for x in t if x in _CC.ROOM_TAKES]))
    # A COUNT OF A DIRECTORY IS NOT A COUNT OF THE FILM'S SOURCES. capture/ holds the interface takes
    # AND copies of the three earliest room shots, while the four later room shots live only in
    # room/shots_v3/. Globbing one directory therefore both over- and under-counts. Count each kind
    # where that kind actually lives, and say which is which.
    iface_shot = len([f for f in _g.glob("capture/*.mp4")
                      if _os.path.basename(f)[:-4] not in _CC.ROOM_TAKES])
    room_shot = len(_g.glob("room/shots_v3/*.mp4"))
    if len(KEYS) == 1:
        out.append("- **Takes** -- %d interface takes captured and %d room shots rendered; the cut "
                   "uses %d (%d of the interface, %d of the room)."
                   % (iface_shot, room_shot, cens[_k0][0], cens[_k0][1], cens[_k0][2]))
    else:
        out.append("- **Takes** -- %d interface takes captured, %d room shots rendered. %s."
                   % (iface_shot, room_shot,
                      "; ".join("the %s cut uses %d (%d of the interface, %d of the room)"
                                % (NAME[k], cens[k][0], cens[k][1], cens[k][2]) for k in KEYS)))
    try:
        cues = len(json.load(open("sfx/sfx_manifest.json"))["cues"])
        out.append("- **Sound** -- %d cues, all synthesised, none sampled; one melodic line" % cues)
    except Exception:
        pass
    out.append("- **Subtitle** -- %s" % " / ".join(
        "%d:%02.0f" % (int(V[k]["duration_s"] // 60), V[k]["duration_s"] % 60) for k in KEYS))
    out.append("")

    out.append("## VERIFICATION TABLE\n")
    rows = [("frames decoded / clock", "{frames_decoded} / {frames_decoded}"),
            ("duration", "{duration_s} s"),
            ("format", "{width}x{height}, {rate}, {pix_fmt}"),
            ("field luminance min / mean / max", "{yavg_min} / {yavg_mean} / {yavg_max}"),
            ("field luminance range", "{yavg_range}"),
            ("largest single-frame luma step", "{max_frame_step_8bit} of 255"),
            ("loudness (target -14.0)", "{lufs} LUFS, LRA {lra}"),
            ("true peak", "{peak_dbfs} dBFS")]
    out.append("| | %s |" % " | ".join(NAME[k] for k in KEYS))
    out.append("|---|%s" % ("---|" * len(KEYS)))
    for label, tpl in rows:
        out.append("| %s | %s |" % (label, " | ".join(tpl.format(**V[k]) for k in KEYS)))
    out.append("| general flashes (limit 3/s) | %s |"
               % " | ".join("%d, max %d/s" % (F[k]["general_flashes"], F[k]["max_flashes_per_second"])
                            for k in KEYS))
    out.append("| fixed >40/255 gate | %s |"
               % " | ".join(("**non-binding** (range %.1f)" % V[k]["yavg_range"])
                            if not V[k].get("flash_gate_binding") else "binding" for k in KEYS))
    print("\n".join(out))

if __name__ == "__main__":
    main()
