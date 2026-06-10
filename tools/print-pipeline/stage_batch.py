#!/usr/bin/env python3
r"""stage_batch.py -- wuld.ink print-pipeline batch stager (K97; K99 helpers).

NOTE: this docstring is RAW (r) -- it carries Windows paths; \u and \b
sequences would otherwise be escape-parsed (SyntaxError / silent backspace).

Three subcommands:

  pull    Resolve each plate's BEST source into <dest>/<batch>/in/ with
          deterministic names <id>.<ext>:
            1. ORIG  -- the pre-shrink original found by content-hash stem
                        match under --local-src (default: the operator's
                        "AI Images and Videos" Downloads tree). Originals
                        are typically 4096x4096 JPG vs the site's 2048
                        webp -- always prefer them.
            2. R2    -- fallback: download the site copy from public R2.
          Idempotent: a plate with ANY in/<id>.* already present is
          skipped, so an interrupted run resumes by re-running.

  verify  Check Upscayl outputs in <dest>/<batch>/out/ against in/.
          Matches outputs by filename stem PREFIX (Upscayl appends a
          suffix like _upscayl_4x_<model> -- do not rename outputs).
          Gates on ABSOLUTE output size: long edge >= --min-edge px
          (default 8000 -- i.e. ~341 DPI at 24x24 in). Scale factor is
          reported informationally. K99: out/ is scanned RECURSIVELY
          (Upscayl batch mode nests outputs in out\upscayl_png_<model>\);
          print-ready-* subfolders are excluded from matching.

  downscale  Cap the long edge of oversized outputs (default 8192 px
          -- still 341 DPI at 24 in) into <dir>/print-ready-<edge>/
          copies for upload-hostile vendors. PNG default; --format jpg
          --quality 95 when a hard upload cap bites (e.g. 10 MB).
          Recursive, idempotent (HAVE-skip); originals untouched.

Stdlib-only. Pillow is OPTIONAL (pip install pillow) -- without it,
dimension checks are skipped and verify degrades to count+naming.

Usage (Windows operator side):
  python stage_batch.py pull   D:\print-batch-01.json
  python stage_batch.py verify D:\print-batch-01.json
  python stage_batch.py downscale D:\print-staging\batch-01\out --max-edge 8192

Default dest = <folder of the batch JSON>\print-staging
(i.e. D:\print-batch-01.json -> D:\print-staging\batch-01\{in,out}).
"""
import argparse
import json
import os
import re
import shutil
import sys
import urllib.request
from pathlib import Path

try:
    from PIL import Image
    HAVE_PIL = True
    # K99: 4096-px sources upscale to 16384-px masters (~270 MP) -- over
    # Pillow's DecompressionBomb default; without this, dims read "?".
    Image.MAX_IMAGE_PIXELS = None
except ImportError:
    HAVE_PIL = False

UA = "wuld-ink-print-pipeline/1.0"
DEFAULT_LOCAL = r"C:\Users\y_m_a\Downloads\AI Images and Videos"
IMG_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def load_batch(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    plates = data.get("plates", [])
    images = [p for p in plates if p.get("kind", "image") == "image"]
    skipped = [p["id"] for p in plates if p.get("kind", "image") != "image"]
    return data, images, skipped


def dims_of(path):
    if not HAVE_PIL:
        return None
    try:
        with Image.open(path) as im:
            return im.size
    except Exception:
        return None


def fmt_dims(d):
    return ("%dx%d" % d) if d else "?"


def norm_stem(name):
    return re.sub(r"\s*\(\d+\)$", "", name).lower()


def build_local_index(root):
    """stem -> [paths] by filename only (no per-file stat -- fast on big trees);
    image extensions only; ' (N)' dupes normalized; code-env dirs pruned."""
    if not os.path.isdir(root):
        return None
    skip = {"__pycache__", "site-packages", "node_modules", ".git", "include"}
    idx = {}
    for dp, dns, fns in os.walk(root, onerror=lambda e: None):
        dns[:] = [d for d in dns if d.lower() not in skip]
        for fn in fns:
            stem, ext = os.path.splitext(fn)
            if ext.lower() in IMG_EXTS:
                idx.setdefault(norm_stem(stem), []).append(os.path.join(dp, fn))
    return idx


def cmd_pull(args):
    data, images, skipped = load_batch(args.batch_json)
    dest = Path(args.dest) if args.dest else Path(args.batch_json).resolve().parent / "print-staging"
    in_dir = dest / data["batch"] / "in"
    in_dir.mkdir(parents=True, exist_ok=True)
    idx = None
    if not args.r2_only:
        idx = build_local_index(args.local_src)
        if idx is None:
            print("NOTE: --local-src not found (%s) -- every plate falls back to R2." % args.local_src)
        else:
            print("local index: %d image stems under %s" % (len(idx), args.local_src))
    print("batch: %s  plates: %d image (skipped %d non-image: %s)"
          % (data["batch"], len(images), len(skipped), ", ".join(skipped) or "-"))
    print("dest:  %s" % in_dir)
    failures = []
    for p in images:
        have = list(in_dir.glob(p["id"] + ".*"))
        if have and have[0].stat().st_size > 0:
            print("  HAVE  %-46s %9d B  %s" % (have[0].name, have[0].stat().st_size, fmt_dims(dims_of(have[0]))))
            continue
        stem = norm_stem(Path(p["r2key"]).stem)
        src = None
        if idx and stem in idx:
            src = sorted(idx[stem], key=lambda f: -os.path.getsize(f))[0]
        if src is not None:
            target = in_dir / (p["id"] + os.path.splitext(src)[1].lower())
            try:
                shutil.copyfile(src, str(target))
                note = "" if len(idx[stem]) == 1 else " (%d stem matches, largest taken)" % len(idx[stem])
                print("  ORIG  %-46s %9d B  %s%s" % (target.name, target.stat().st_size, fmt_dims(dims_of(target)), note))
            except Exception as e:
                failures.append((p["id"], "copy: %s" % e))
                print("  FAIL  %-46s copy: %s" % (p["id"], e))
            continue
        target = in_dir / (p["id"] + Path(p["r2key"]).suffix.lower())
        try:
            req = urllib.request.Request(p["url"], headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
                clen = r.headers.get("Content-Length")
            if clen is not None and int(clen) != len(body):
                raise IOError("short read %d != Content-Length %s" % (len(body), clen))
            target.write_bytes(body)
            print("  R2    %-46s %9d B  %s" % (target.name, len(body), fmt_dims(dims_of(target))))
        except Exception as e:
            failures.append((p["id"], str(e)))
            print("  FAIL  %-46s %s" % (p["id"], e))
    print("-" * 76)
    have = sorted(f.name for f in in_dir.iterdir() if f.is_file())
    print("in/ holds %d files; batch expects %d." % (len(have), len(images)))
    if not HAVE_PIL:
        print("NOTE: Pillow not installed -- dimensions unchecked (pip install pillow).")
    if failures:
        print("FAILED %d: %s" % (len(failures), ", ".join(i for i, _ in failures)))
        return 1
    print("PULL OK -- next: Upscayl batch over in/ -> out/, then: stage_batch.py verify")
    return 0


def cmd_verify(args):
    data, images, _ = load_batch(args.batch_json)
    dest = Path(args.dest) if args.dest else Path(args.batch_json).resolve().parent / "print-staging"
    in_dir = dest / data["batch"] / "in"
    out_dir = dest / data["batch"] / "out"
    if not out_dir.is_dir():
        print("out/ missing: %s -- run Upscayl with this as the output folder." % out_dir)
        return 1
    # K99: Upscayl batch mode nests outputs (out\upscayl_png_<model>\) --
    # scan recursively; print-ready-* derivative folders are excluded.
    out_files = [f for f in out_dir.rglob("*") if f.is_file()
                 and not any(part.lower().startswith("print-ready")
                             for part in f.relative_to(out_dir).parts[:-1])]
    missing, warns, rows = [], [], []
    for p in images:
        stem = p["id"]
        srcs = list(in_dir.glob(stem + ".*"))
        src = srcs[0] if srcs else None
        cands = sorted([f for f in out_files if f.stem.startswith(stem)],
                       key=lambda f: f.stat().st_size, reverse=True)
        if src is None:
            missing.append(stem); rows.append((stem, "in/ MISSING", "", "", "MISS")); continue
        if not cands:
            missing.append(stem); rows.append((stem, fmt_dims(dims_of(src)), "no out file", "", "MISS")); continue
        out = cands[0]
        note = "" if len(cands) == 1 else "(%d matches, largest taken)" % len(cands)
        d_in, d_out = dims_of(src), dims_of(out)
        if d_in and d_out:
            long_px = max(d_out)
            scale = d_out[0] / float(d_in[0])
            status = "PASS" if long_px >= args.min_edge else "WARN<%dpx" % args.min_edge
            if status != "PASS":
                warns.append(stem)
            sizes = "  ".join("%ddpi<=%.1f in" % (dpi, long_px / float(dpi)) for dpi in (300, 200, 150))
            rows.append((stem, fmt_dims(d_in), fmt_dims(d_out) + " (x%.1f) %s" % (scale, note), sizes, status))
        else:
            rows.append((stem, "?", out.name + " " + note, "(no Pillow -- dims unchecked)", "PASS?"))
    print("batch: %s   in: %d   out matched: %d   missing: %d   size-warn: %d"
          % (data["batch"], len(images), len(images) - len(missing), len(missing), len(warns)))
    print("-" * 76)
    for r in rows:
        print("  %-40s in %-11s out %-36s %s  [%s]" % r)
    print("-" * 76)
    if missing:
        print("VERIFY FAIL -- missing: %s" % ", ".join(missing)); return 1
    if not HAVE_PIL:
        print("VERIFY PARTIAL (no Pillow): count+naming OK; dims unchecked."); return 0
    if warns:
        print("VERIFY OK with WARNINGS -- %d plate(s) under %dpx long edge; cap their"
              " product sizes (see README print math) or re-upscale." % (len(warns), args.min_edge))
        return 0
    print("VERIFY OK -- outputs are product-ready. Create products, then hand the URLs back to Cowork.")
    return 0


def cmd_downscale(args):
    """K99: cap long edge into print-ready copies (originals untouched)."""
    if not HAVE_PIL:
        print("downscale needs Pillow: python -m pip install pillow"); return 1
    src_dir = Path(args.dir)
    if not src_dir.is_dir():
        print("not a directory: %s" % src_dir); return 1
    out_dir = Path(args.out) if args.out else src_dir / ("print-ready-%d" % args.max_edge)
    out_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(f for f in src_dir.rglob("*") if f.is_file()
                   and f.suffix.lower() in IMG_EXTS
                   and out_dir not in f.parents
                   and not any(part.lower().startswith("print-ready")
                               for part in f.relative_to(src_dir).parts[:-1]))
    done, skipped, fails = 0, 0, []
    for f in files:
        target = out_dir / (f.stem + (".jpg" if args.format == "jpg" else ".png"))
        if target.exists() and target.stat().st_size > 0:
            print("  HAVE  %s" % target.name); skipped += 1; continue
        try:
            with Image.open(f) as im:
                w, h = im.size
                if max(w, h) <= args.max_edge:
                    print("  SKIP  %-46s %dx%d <= %d" % (f.name, w, h, args.max_edge)); skipped += 1; continue
                sc = args.max_edge / float(max(w, h))
                nw, nh = max(1, int(round(w * sc))), max(1, int(round(h * sc)))
                im2 = im.resize((nw, nh), Image.LANCZOS)
                if args.format == "jpg":
                    im2.convert("RGB").save(str(target), "JPEG", quality=args.quality)
                else:
                    im2.save(str(target), "PNG")
            print("  DOWN  %-46s %dx%d -> %dx%d  %9d B"
                  % (target.name, w, h, nw, nh, target.stat().st_size)); done += 1
        except Exception as e:
            fails.append(f.name); print("  FAIL  %-46s %s" % (f.name, e))
    print("-" * 76)
    print("downscaled %d, skipped %d, failed %d -> %s" % (done, skipped, len(fails), out_dir))
    return 1 if fails else 0


def main():
    ap = argparse.ArgumentParser(description="wuld.ink print-pipeline batch stager")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name, fn in (("pull", cmd_pull), ("verify", cmd_verify)):
        s = sub.add_parser(name)
        s.add_argument("batch_json", help="path to print-batch JSON (e.g. D:\\print-batch-01.json)")
        s.add_argument("--dest", default=None, help="staging root (default: <batch dir>/print-staging)")
        s.set_defaults(fn=fn)
        if name == "pull":
            s.add_argument("--local-src", default=DEFAULT_LOCAL,
                           help="originals tree searched by content-hash stem (default: %s)" % DEFAULT_LOCAL)
            s.add_argument("--r2-only", action="store_true", help="skip local originals, pull site copies from R2")
        else:
            s.add_argument("--min-edge", type=int, default=8000,
                           help="min output long edge in px (default 8000 ~ 341dpi at 24in)")
    d = sub.add_parser("downscale")
    d.add_argument("dir", help="Upscayl output folder (scanned recursively; print-ready-* skipped)")
    d.add_argument("--max-edge", type=int, default=8192,
                   help="long-edge cap in px (default 8192 -- 341dpi at 24in)")
    d.add_argument("--out", default=None, help="output folder (default: <dir>/print-ready-<max-edge>)")
    d.add_argument("--format", choices=["png", "jpg"], default="png")
    d.add_argument("--quality", type=int, default=95, help="JPEG quality for --format jpg (default 95)")
    d.set_defaults(fn=cmd_downscale)
    args = ap.parse_args()
    sys.exit(args.fn(args))


if __name__ == "__main__":
    main()
