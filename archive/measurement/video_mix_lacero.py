#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mix_lacero.py - the audio bed for "Illogically Is" / "Alogical Isness" (session 15).

The voice is the anchor. His placement is the score. The mix is COMPUTED around
the voice from the ASR word table -- anticipatory split-band duck, center carve,
entries and exits snapped to words and markers -- and rendered as one file that
drops at 0 in Vegas.

Subcommands
  curve    word table (+ markers) -> duck_curve.json      [no media needed]
  measure  voice / beds / his mix -> measure/*.json       [needs ffmpeg + media]
  design   measure + dump + curve -> mix_plan.json, mix_report.md
  render   mix_plan.json          -> illogically_is_bed.wav (+ _full.wav)
  verify   plan + rendered bed    -> conformance report

Doctrine (session 15, from the S14 close):
  voice   -18 LUFS integrated (dialogue-gated), -1.5 dBTP, NEVER touched except
          an optional +-1 LU per-sentence leveler if the spread demands it
  beds    pre-normalised over their USED RANGE to -23 LUFS, then his envelope
          h(t) rides on top (rescaled per section to meet that section's ceiling),
          then the correction c(t) from the word table
  under speech   bed = voice - 14 LU broadband, - 20 LU in 300-3400 Hz
  pause >= 1.2s  bed = voice - 6
  section gap    bed = voice - 3
  program -16 LUFS integrated, LRA free.  This film keeps its dynamics.

Everything is deterministic. Nothing is chosen by ear inside this script.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

# ---------------------------------------------------------------- constants
SR = 48000                      # render sample rate
CR = 100.0                      # control-rate (Hz) for every gain curve
FPS = 24000.0 / 1001.0
SPINE_S = 2153.854              # the WAV clock
SPINE_N = 103384992             # == round(SPINE_S * SR); asserted at render

# the law's numbers, all overridable from the CLI
VOICE_TARGET_LUFS = -18.0
PROGRAM_TARGET_LUFS = -16.0
TRUE_PEAK_CEIL_DBTP = -1.5
BED_NORM_LUFS = -23.0
DUCK_SPEECH_LU = -14.0          # bed relative to voice, broadband, under speech
DUCK_SPEECH_BAND_LU = -20.0     # ... inside 300-3400 Hz
LIFT_PAUSE_LU = -6.0            # pauses >= PAUSE_MIN_S
LIFT_GAP_LU = -3.0              # section gaps (markers)
PAUSE_MIN_S = 1.2
ATTACK_S = 0.35                 # raised-cosine, COMPLETES at onset - LEAD_S
LEAD_S = 0.12                   # the duck is done 120 ms before the word
RELEASE_TAU_S = 0.80            # exponential, from the last word's end
WORD_PAD_S = 0.15               # speech = inside a word +- 150 ms
BAND_LO, BAND_HI = 300.0, 3400.0
CENTER_CARVE_DB = -3.0          # bed mid vs side under speech
GLUE_SHELF_DB = -2.0            # shared high shelf on the beds
GLUE_SHELF_HZ = 8000.0


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def db2lin(d):
    return 10.0 ** (np.asarray(d, dtype=np.float64) / 20.0)


def lin2db(x, floor=-120.0):
    x = np.asarray(x, dtype=np.float64)
    return np.maximum(20.0 * np.log10(np.maximum(np.abs(x), 1e-12)), floor)


# ================================================================== curve
# The voice-side law.  Depends on nothing but the word table and the markers,
# so it is computable long before Vegas has been asked anything.

def read_cues(path):
    """Cue table from subs_synced.srt (preferred) or align_table.tsv.

    Both carry the same ASR-true boundaries; the SRT is the file that actually
    shipped, so it is the one the pictures were cut against.
    """
    p = Path(path)
    txt = p.read_text(encoding="utf-8", errors="replace")
    cues = []
    if p.suffix.lower() == ".srt" or "-->" in txt[:4000]:
        for m in re.finditer(
                r"(\d\d):(\d\d):(\d\d)[,.](\d\d\d)\s*-->\s*"
                r"(\d\d):(\d\d):(\d\d)[,.](\d\d\d)", txt):
            g = [int(x) for x in m.groups()]
            a = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000.0
            b = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000.0
            cues.append((a, b))
    else:
        for line in txt.splitlines()[1:]:
            f = line.split("\t")
            if len(f) >= 5:
                try:
                    cues.append((float(f[3]), float(f[4])))
                except ValueError:
                    pass
    cues.sort()
    return cues


def load_words(asr_path, align_tsv=None, clamp=True):
    """ASR word table -> [(start, end)], clamped into the cue table when given.

    Whisper stamps the first word after a pause early (S12/S14 both measured
    it).  The cue table's new_start/new_end are waveform-true, so a word that
    falls outside its enclosing cue is pulled back in rather than trusted.
    """
    d = json.loads(Path(asr_path).read_text(encoding="utf-8"))
    words = [(float(w["s"]), float(w["e"])) for w in d["words"]
             if float(w["e"]) > float(w["s"])]
    words.sort()
    n_clamped = 0
    if clamp and align_tsv and Path(align_tsv).exists():
        cues = read_cues(align_tsv)
        if cues:
            ca = np.array(cues, dtype=np.float64)
            out, deltas = [], []
            for (s, e) in words:
                # the cue this word belongs to = the one it overlaps most;
                # a word with no overlap anywhere is left alone (the SRT does
                # not cover every utterance).  Midpoint containment is NOT the
                # test: whisper stamps a post-pause onset early, which pushes
                # the midpoint out of the very cue the word opens.
                ov = np.minimum(e, ca[:, 1]) - np.maximum(s, ca[:, 0])
                k = int(np.argmax(ov))
                if ov[k] <= 0.0:
                    out.append((s, e))
                    continue
                c0, c1 = ca[k]
                ns, ne = max(s, c0), min(e, c1)
                if ne - ns < 0.02:            # clamped to nothing: keep the word
                    ns, ne = s, e
                if abs(ns - s) > 1e-6 or abs(ne - e) > 1e-6:
                    n_clamped += 1
                    deltas.append(max(abs(ns - s), abs(ne - e)))
                out.append((ns, ne))
            words = out
            if deltas:
                dv = np.array(deltas)
                log("  clamp: n=%d  median %.0f ms  p90 %.0f ms  max %.0f ms"
                    % (len(dv), 1000 * np.median(dv),
                       1000 * np.percentile(dv, 90), 1000 * dv.max()))
    return words, n_clamped, float(d.get("duration", SPINE_S))


def load_markers(path):
    """markers_asr.json -> sorted [(name, seconds)]."""
    if not path or not Path(path).exists():
        return []
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    items = data
    if isinstance(data, dict):
        for k in ("markers", "sections"):
            if isinstance(data.get(k), (list, dict)):
                items = data[k]
                break
    if isinstance(items, dict):
        items = [{"name": k, "value": v} for k, v in items.items()]
    out = []
    for it in items:
        if not isinstance(it, dict):
            continue
        name = str(it.get("name", it.get("label", it.get("note", "")))).strip()
        v = None
        for k in ("seconds", "sec", "start", "time", "value", "t"):
            if k in it:
                v = it[k]
                break
        if v is None and "frame" in it:
            v = float(it["frame"]) / FPS
        try:
            v = float(v)
        except (TypeError, ValueError):
            continue
        if name:
            out.append((name, v))
    out.sort(key=lambda kv: kv[1])
    return out


def merge_intervals(iv, pad=0.0, join=0.0):
    """Union of [(s,e)] with each padded by `pad`; neighbours closer than
    `join` are fused."""
    if not iv:
        return []
    a = sorted((s - pad, e + pad) for s, e in iv)
    out = [list(a[0])]
    for s, e in a[1:]:
        if s - out[-1][1] <= join:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return [(s, e) for s, e in out]


def build_duck_curve(words, markers, dur, cr=CR,
                     speech_lu=DUCK_SPEECH_LU, pause_lu=LIFT_PAUSE_LU,
                     gap_lu=LIFT_GAP_LU, pause_min=PAUSE_MIN_S,
                     attack=ATTACK_S, lead=LEAD_S, tau=RELEASE_TAU_S,
                     pad=WORD_PAD_S, gap_win=0.6):
    """The correction curve c(t), in LU relative to the voice anchor.

    Deterministic and non-causal by construction: the attack is COMPLETE
    `lead` seconds before the word it is making room for, which no compressor
    can do, because the future is already written down in the word table.
    """
    n = int(round(dur * cr)) + 1
    t = np.arange(n) / cr

    runs = merge_intervals(words, pad=pad, join=0.0)          # speech runs
    # gaps between runs (plus the head and the tail)
    gaps = []
    if runs:
        if runs[0][0] > 0:
            gaps.append((0.0, runs[0][0]))
        for (a0, a1), (b0, b1) in zip(runs[:-1], runs[1:]):
            gaps.append((a1, b0))
        if runs[-1][1] < dur:
            gaps.append((runs[-1][1], dur))
    else:
        gaps.append((0.0, dur))

    mk = [s for _, s in markers]

    def is_section_gap(g0, g1):
        return any(g0 - gap_win <= m <= g1 + gap_win for m in mk)

    # 1. the floor: everything is at speech level unless a gap lifts it
    lu = np.full(n, speech_lu, dtype=np.float64)

    lifted = []
    for (g0, g1) in gaps:
        glen = g1 - g0
        if glen < pause_min:
            continue                       # short gap: no lift, no pumping
        lvl = gap_lu if is_section_gap(g0, g1) else pause_lu
        lifted.append((g0, g1, lvl))
        i0, i1 = int(math.ceil(g0 * cr)), int(math.floor(g1 * cr))
        if i1 > i0:
            lu[i0:i1] = lvl

    # 2. release: exponential from each lifted gap's start, tau seconds
    for (g0, g1, lvl) in lifted:
        i0 = int(math.ceil(g0 * cr))
        i1 = int(math.floor(g1 * cr))
        if i1 <= i0:
            continue
        k = np.arange(i1 - i0) / cr
        # starts where speech left it, rises toward the lift level
        lu[i0:i1] = lvl + (speech_lu - lvl) * np.exp(-k / tau)

    # 3. attack: raised cosine finishing `lead` before every run's onset
    for (r0, r1) in runs:
        a1 = r0 - lead
        a0 = a1 - attack
        i0, i1 = int(math.ceil(a0 * cr)), int(math.ceil(a1 * cr))
        i0, i1 = max(i0, 0), min(max(i1, 0), n)
        if i1 <= i0:
            continue
        start_lu = lu[i0]
        if start_lu <= speech_lu + 1e-9:
            continue                        # already down; nothing to do
        u = (np.arange(i1 - i0) + 0.5) / (i1 - i0)
        shape = 0.5 * (1.0 - np.cos(math.pi * u))          # 0 -> 1, S-curve
        lu[i0:i1] = start_lu + (speech_lu - start_lu) * shape
        lu[i1:int(math.ceil(r1 * cr))] = speech_lu

    lu = np.minimum(lu, gap_lu)              # never above the loudest lift
    lu = np.maximum(lu, speech_lu)           # never below the speech duck

    stats = {
        "n_words": len(words),
        "n_runs": len(runs),
        "n_gaps": len(gaps),
        "n_lifts": len(lifted),
        "n_section_lifts": sum(1 for g in lifted if g[2] == gap_lu),
        "speech_fraction": float(np.mean(lu <= speech_lu + 1e-6)),
        "lifted_fraction": float(np.mean(lu > speech_lu + 0.5)),
        "mean_lu": float(lu.mean()),
        "min_lu": float(lu.min()),
        "max_lu": float(lu.max()),
    }
    return t, lu, runs, lifted, stats


# ================================================================= measure
# Numbers cross between machines; media never does.  Every measurement is a
# streaming ffmpeg decode + numpy -- no filter beyond ebur128 (the reference
# implementation of the only number that has a standard), so this runs the
# same on ffmpeg 4.4 (the VM) and on whatever is on the host.

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
FFPROBE = os.environ.get("FFPROBE", "ffprobe")


def probe(path):
    cmd = [FFPROBE, "-v", "error", "-select_streams", "a:0",
           "-show_entries", "stream=codec_name,sample_rate,channels,bit_rate",
           "-show_entries", "format=duration,bit_rate,format_name",
           "-of", "json", str(path)]
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout
        d = json.loads(out)
    except Exception as e:                                   # noqa: BLE001
        return {"error": str(e)}
    st = (d.get("streams") or [{}])[0]
    fm = d.get("format") or {}
    return {
        "codec": st.get("codec_name"),
        "sample_rate": int(st.get("sample_rate") or 0) or None,
        "channels": int(st.get("channels") or 0) or None,
        "stream_bit_rate": int(st.get("bit_rate") or 0) or None,
        "format_bit_rate": int(fm.get("bit_rate") or 0) or None,
        "duration": float(fm.get("duration") or 0.0) or None,
        "format": fm.get("format_name"),
    }


def _afilter(reverse=False, sr=None, mono=True):
    f = []
    if reverse:
        f.append("areverse")
    if mono:
        f.append("aformat=channel_layouts=mono")
    if sr:
        f.append("aresample=%d:resampler=soxr:precision=28" % sr)
    return ",".join(f) if f else "anull"


def decode_blocks(path, sr, start=None, dur=None, reverse=False, mono=True,
                  block_s=30.0):
    """Stream a source as float32 numpy blocks.  `areverse` buffers the whole
    range in ffmpeg, so reversed ranges are read whole -- keep them short."""
    ch = 1 if mono else 2
    cmd = [FFMPEG, "-nostdin", "-v", "error"]
    if start is not None and not reverse:
        cmd += ["-ss", "%.6f" % start]
    if reverse and start is not None:
        cmd += ["-ss", "%.6f" % start]
    if dur is not None:
        cmd += ["-t", "%.6f" % dur]
    cmd += ["-i", str(path), "-map", "0:a:0",
            "-af", _afilter(reverse, sr, mono),
            "-f", "f32le", "-acodec", "pcm_f32le", "-"]
    n = int(block_s * sr) * ch
    pr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        while True:
            raw = pr.stdout.read(n * 4)
            if not raw:
                break
            x = np.frombuffer(raw, dtype="<f4").astype(np.float32)
            if ch == 2:
                x = x.reshape(-1, 2)
            yield x
    finally:
        try:
            pr.stdout.close()
        except Exception:                                     # noqa: BLE001
            pass
        pr.wait()


def spectral_profile(path, start=None, dur=None, reverse=False, sr=16000,
                     nfft=1024):
    """Spectral centroid, 300-3400 Hz share and an RMS envelope, in numpy.

    aspectralstats does not exist before ffmpeg 5, and the VM is on 4.4 --
    so this is computed here rather than asked of a filter that may not be
    present on whichever machine runs it.
    """
    win = np.hanning(nfft).astype(np.float32)
    freqs = np.fft.rfftfreq(nfft, 1.0 / sr)
    band = (freqs >= BAND_LO) & (freqs <= BAND_HI)
    acc_p = np.zeros(len(freqs), dtype=np.float64)
    cent_num = cent_den = 0.0
    ssq = 0.0
    ns = 0
    env = []
    carry = np.zeros(0, dtype=np.float32)
    hop = nfft // 2
    for blk in decode_blocks(path, sr, start, dur, reverse, mono=True):
        ssq += float(np.dot(blk.astype(np.float64), blk.astype(np.float64)))
        ns += blk.size
        x = np.concatenate([carry, blk])
        nfr = 0 if len(x) < nfft else 1 + (len(x) - nfft) // hop
        if nfr > 0:
            idx = np.arange(nfft)[None, :] + hop * np.arange(nfr)[:, None]
            fr = x[idx] * win
            sp = np.abs(np.fft.rfft(fr, axis=1)) ** 2
            acc_p += sp.sum(0)
            p = sp.sum(1)
            cent_num += float((sp @ freqs).sum())
            cent_den += float(p.sum())
            env.append(np.sqrt(np.maximum(sp.sum(1) / nfft, 1e-20)))
            carry = x[nfr * hop:]
        else:
            carry = x
    if ns == 0 or cent_den <= 0:
        return {"error": "no audio decoded"}
    tot = acc_p.sum()
    return {
        "centroid_hz": cent_num / cent_den,
        "speech_band_share": float(acc_p[band].sum() / max(tot, 1e-20)),
        "rms_dbfs": float(10.0 * math.log10(max(ssq / ns, 1e-20))),
        "env_hz": sr / hop,
        "env": np.concatenate(env) if env else np.zeros(0),
    }


_EBU_LINE = re.compile(
    r"t:\s*([\d.]+)\s+.*?M:\s*(-?[\d.]+|-inf)\s+S:\s*(-?[\d.]+|-inf)"
    r"\s+I:\s*(-?[\d.]+|-inf)\s+LUFS\s+LRA:\s*(-?[\d.]+)")


def _f(x):
    return float("-70.0") if x == "-inf" else float(x)


def ebur128(path, start=None, dur=None, reverse=False, curves=True):
    """Integrated / LRA / true peak (+ the 10 Hz M and S curves).

    ebur128 is the one number with a standard; it is not reimplemented here.
    """
    # ebur128's per-frame log is emitted at the verbose level; at -v info the
    # summary arrives but the 10 Hz M/S curves silently do not.
    cmd = [FFMPEG, "-nostdin", "-v", "verbose"]
    if start is not None:
        cmd += ["-ss", "%.6f" % start]
    if dur is not None:
        cmd += ["-t", "%.6f" % dur]
    cmd += ["-i", str(path), "-map", "0:a:0"]
    pre = "areverse," if reverse else ""
    cmd += ["-filter_complex",
            pre + "ebur128=peak=true:framelog=verbose", "-f", "null", "-"]
    pr = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    txt = pr.stderr
    t, M, S = [], [], []
    if curves:
        for m in _EBU_LINE.finditer(txt):
            t.append(float(m.group(1)))
            M.append(_f(m.group(2)))
            S.append(_f(m.group(3)))
    tail = txt[txt.rfind("Summary:"):] if "Summary:" in txt else txt[-3000:]

    def grab(label):
        m = re.search(re.escape(label) + r":\s*(-?[\d.]+|-inf)", tail)
        return _f(m.group(1)) if m else None

    return {
        "integrated_lufs": grab("I"),
        "lra_lu": grab("LRA"),
        "true_peak_dbtp": grab("Peak"),
        "threshold_lufs": grab("Threshold"),
        "t": t, "M": M, "S": S,
    }


def measure_source(path, start=None, dur=None, reverse=False, curves=False):
    d = {"path": str(path), "probe": probe(path),
         "start": start, "dur": dur, "reversed": bool(reverse)}
    d["loudness"] = ebur128(path, start, dur, reverse, curves=curves)
    sp = spectral_profile(path, start, dur, reverse)
    env = sp.pop("env", None)
    d["spectrum"] = sp
    if env is not None and env.size:
        d["env_p"] = {q: float(np.percentile(20 * np.log10(env + 1e-12), q))
                      for q in (5, 25, 50, 75, 95)}
    return d


def per_cue_loudness(voice, cues, sr=16000):
    """Integrated-ish loudness per sentence, from one decode of the voice.

    Mean-square in K-ish terms is enough to answer the only question asked of
    it -- is the spread > 2 LU, i.e. does the sentence leveller go in.
    """
    x = np.concatenate(list(decode_blocks(voice, sr, mono=True))) \
        if True else None
    out = []
    for (a, b) in cues:
        i0, i1 = int(a * sr), int(b * sr)
        seg = x[max(i0, 0):min(i1, len(x))]
        if seg.size < sr // 20:
            continue
        ms = float(np.dot(seg.astype(np.float64), seg.astype(np.float64)) / seg.size)
        out.append({"t0": round(a, 3), "t1": round(b, 3),
                    "db": round(10 * math.log10(max(ms, 1e-20)), 2)})
    if out:
        v = np.array([o["db"] for o in out])
        v = v - np.median(v)
        for o, k in zip(out, v):
            o["rel"] = round(float(k), 2)
    return out


# ==================================================================== dump
# His placement, read back out of the project.  This is the score.  Nothing
# here is second-guessed; it is measured, modelled, and then proven against
# his own rendered mix before a single number downstream is believed.

CURVE_P = {            # Vegas fade / envelope curve -> gain(u) = u ** p
    "Linear": 1.0, "Fast": 0.5, "Slow": 2.0, "Sharp": 3.0, "Smooth": None,
    "Hold": None, "None": 1.0, "": 1.0, None: 1.0,
}


def curve_shape(name, u, p_override=None):
    """u in [0,1] -> 0..1.  Vegas does not document these; the fitter
    (`design --fit-curves`) corrects the exponents against his render."""
    u = np.clip(np.asarray(u, dtype=np.float64), 0.0, 1.0)
    nm = (name or "Linear").strip()
    if nm == "Hold":
        return (u >= 1.0).astype(np.float64)
    if nm == "Smooth" and p_override is None:
        return u * u * (3.0 - 2.0 * u)
    p = p_override if p_override is not None else CURVE_P.get(nm, 1.0)
    if p is None:
        p = 1.0
    return u ** p


def resolve_media(win_path, dirs):
    """Windows path from the dump -> a path on this machine, by basename."""
    if not win_path:
        return None
    base = re.split(r"[\\/]", str(win_path))[-1]
    for d in dirs:
        c = Path(d) / base
        if c.exists():
            return str(c)
    for d in dirs:                                # one level down
        try:
            for c in Path(d).iterdir():
                if c.is_dir():
                    q = c / base
                    if q.exists():
                        return str(q)
        except OSError:
            pass
    return None


class Dump:
    def __init__(self, path, media_dirs):
        self.d = json.loads(Path(path).read_text(encoding="utf-8"))
        self.dirs = [str(x) for x in media_dirs]
        self.tracks = self.d.get("tracks", [])
        self.unresolved = []
        self.events = []
        for tr in self.tracks:
            for i, ev in enumerate(tr.get("events", [])):
                e = self._event(tr, ev, i)
                if e:
                    self.events.append(e)

    def _event(self, tr, ev, i):
        if ev.get("mute") or tr.get("mute"):
            return None
        med = ev.get("media") or {}
        # A subclip's `path` is a virtual name ("... - subclip 1 (reversed)"),
        # not a file.  The parent is the file that actually exists on disk.
        src = resolve_media(med.get("path"), self.dirs)
        if src is None and med.get("parent"):
            src = resolve_media(med.get("parent"), self.dirs)
        if src is None:
            self.unresolved.append(med.get("path"))
        rate = float(ev.get("rate") or 1.0) or 1.0
        t0 = float(ev.get("start_ms") or 0.0) / 1000.0
        tl = float(ev.get("length_ms") or 0.0) / 1000.0
        off = float(ev.get("offset_ms") or 0.0) / 1000.0
        sub0 = med.get("sub_start_ms")
        sub0 = (float(sub0) / 1000.0) if sub0 is not None else 0.0
        mlen = float(med.get("length_ms") or 0.0) / 1000.0
        rev = bool(med.get("reversed"))
        dur = tl * rate
        # A reversed subclip's Take.Offset is measured along the REVERSED
        # media, so it must be mapped back into the parent's forward clock
        # before anything is decoded:  tau -> T = L - tau.  Get this wrong and
        # the bed is a different three minutes of the album, backwards.
        if rev and mlen > 0:
            src_start = max(mlen - (sub0 + off) - dur, 0.0)
        else:
            src_start = sub0 + off
        # Vegas 14 exposes an event's gain handle through the fade Gain fields;
        # they are equal when the handle has been pulled down.
        gi = (ev.get("fade_in") or {}).get("gain")
        go = (ev.get("fade_out") or {}).get("gain")
        try:
            egain = float(gi) if gi is not None else 1.0
            if go is not None and abs(float(go) - egain) < 1e-6:
                pass
            elif go is not None:
                egain = 0.5 * (egain + float(go))
        except (TypeError, ValueError):
            egain = 1.0
        return {
            "track": int(tr.get("index") or 0),
            "track_name": tr.get("name") or "",
            "track_volume": float(tr.get("volume") if tr.get("volume") is not None else 1.0),
            "track_pan": float(tr.get("pan") or 0.0),
            "idx": i,
            "name": ev.get("name") or "",
            "t0": t0, "t1": t0 + tl, "len": tl,
            "src": src, "src_path_win": med.get("path"),
            "src_start": src_start,            # seconds into the PARENT, forward
            "src_dur": dur,
            "media_len": mlen,
            "event_gain": egain,
            "rate": rate,
            "reversed": rev,
            "subclip": bool(med.get("subclip")),
            "sample_rate": med.get("sample_rate"),
            "channels": med.get("channels"),
            "normalize": bool(ev.get("normalize")),
            "normalize_gain": ev.get("normalize_gain"),
            "invert_phase": bool(ev.get("invert_phase")) or bool(tr.get("invert_phase")),
            "fade_in": ev.get("fade_in") or {},
            "fade_out": ev.get("fade_out") or {},
            "fx": [f.get("name") for f in (ev.get("fx") or [])],
            "track_fx": [f.get("name") for f in (tr.get("fx") or [])],
        }

    def voice_track(self, hint="ElevenLabs"):
        """The track carrying the spine -- it is the clock, never a bed."""
        for e in self.events:
            if hint.lower() in str(e.get("src_path_win") or "").lower():
                return e["track"]
        return None

    def track_env(self, idx, kind="Volume"):
        for tr in self.tracks:
            if int(tr.get("index") or -1) != idx:
                continue
            for env in tr.get("envelopes") or []:
                if kind.lower() in str(env.get("type") or "").lower():
                    pts = [(float(p["ms"]) / 1000.0, float(p["y"]),
                            p.get("curve")) for p in env.get("points") or []
                           if p.get("ms") is not None and p.get("y") is not None]
                    pts.sort()
                    return pts
        return []


def env_gain(points, t, default=1.0, p_over=None):
    """Vegas volume envelope -> linear gain at times t (1.0 == 0 dB)."""
    t = np.asarray(t, dtype=np.float64)
    if not points:
        return np.full(t.shape, float(default))
    g = np.empty(t.shape, dtype=np.float64)
    xs = np.array([p[0] for p in points])
    ys = np.array([p[1] for p in points])
    g[t <= xs[0]] = ys[0]
    g[t >= xs[-1]] = ys[-1]
    for (x0, y0, c0), (x1, y1, _c1) in zip(points[:-1], points[1:]):
        m = (t > x0) & (t < x1)
        if not m.any() or x1 <= x0:
            continue
        u = (t[m] - x0) / (x1 - x0)
        g[m] = y0 + (y1 - y0) * curve_shape(c0, u, p_over)
    return g


def event_envelope(ev, t, p_over=None):
    """Fades + event gain, as a linear multiplier on `t` (absolute seconds)."""
    t = np.asarray(t, dtype=np.float64)
    g = ((t >= ev["t0"]) & (t < ev["t1"])).astype(np.float64)
    fi = float((ev["fade_in"] or {}).get("ms") or 0.0) / 1000.0
    fo = float((ev["fade_out"] or {}).get("ms") or 0.0) / 1000.0
    if fi > 0:
        m = (t >= ev["t0"]) & (t < ev["t0"] + fi)
        if m.any():
            g[m] *= curve_shape((ev["fade_in"] or {}).get("curve"),
                                (t[m] - ev["t0"]) / fi, p_over)
    if fo > 0:
        m = (t > ev["t1"] - fo) & (t < ev["t1"])
        if m.any():
            g[m] *= curve_shape((ev["fade_out"] or {}).get("curve"),
                                (ev["t1"] - t[m]) / fo, p_over)
    g *= float(ev.get("event_gain") or 1.0)
    if ev.get("normalize") and ev.get("normalize_gain"):
        g *= float(ev["normalize_gain"])
    return g


def cmd_curve(a):
    words, n_clamped, dur = load_words(a.asr, a.cues, clamp=not a.no_clamp)
    markers = load_markers(a.markers)
    if a.duration:
        dur = a.duration
    t, lu, runs, lifted, st = build_duck_curve(
        words, markers, dur, cr=a.cr,
        speech_lu=a.speech_lu, pause_lu=a.pause_lu, gap_lu=a.gap_lu,
        pause_min=a.pause_min, attack=a.attack, lead=a.lead,
        tau=a.release, pad=a.pad)
    st["n_clamped"] = n_clamped
    st["duration"] = dur
    st["cr"] = a.cr
    out = {
        "v": 1,
        "source": {"asr": str(a.asr), "cues": str(a.cues), "markers": str(a.markers)},
        "law": {"speech_lu": a.speech_lu, "pause_lu": a.pause_lu,
                "gap_lu": a.gap_lu, "pause_min_s": a.pause_min,
                "attack_s": a.attack, "lead_s": a.lead,
                "release_tau_s": a.release, "word_pad_s": a.pad,
                "band_hz": [BAND_LO, BAND_HI],
                "band_extra_lu": DUCK_SPEECH_BAND_LU - a.speech_lu},
        "stats": st,
        "runs": [[round(x, 3), round(y, 3)] for x, y in runs],
        "lifts": [[round(x, 3), round(y, 3), z] for x, y, z in lifted],
        "lu": [round(float(x), 3) for x in lu],
    }
    Path(a.out).write_text(json.dumps(out), encoding="utf-8")
    log("curve -> %s" % Path(a.out).resolve())
    log("  words %d (clamped %d) | runs %d | gaps %d | lifts %d (section %d)"
        % (st["n_words"], n_clamped, st["n_runs"], st["n_gaps"],
           st["n_lifts"], st["n_section_lifts"]))
    log("  speech %.1f%% of the film | lifted %.1f%% | mean %.2f LU"
        % (100 * st["speech_fraction"], 100 * st["lifted_fraction"], st["mean_lu"]))
    return out


def cmd_measure(a):
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    dirs = list(a.media_dirs or [])
    report = {"v": 1, "law": {"voice_target_lufs": a.voice_target}}

    # --- the voice: the anchor.  Everything else is measured against it. -----
    if a.voice and Path(a.voice).exists():
        log("voice: %s" % a.voice)
        v = measure_source(a.voice, curves=True)
        ld = v["loudness"]
        cur = {"hz": 10.0,
               "t": [round(x, 2) for x in ld.pop("t", [])],
               "M": [round(x, 2) for x in ld.pop("M", [])],
               "S": [round(x, 2) for x in ld.pop("S", [])]}
        (out / "voice_curve.json").write_text(json.dumps(cur), encoding="utf-8")
        if a.cues and Path(a.cues).exists():
            cues = read_cues(a.cues)
            pc = per_cue_loudness(a.voice, cues, sr=8000)
            (out / "voice_sentences.json").write_text(json.dumps(pc), encoding="utf-8")
            if pc:
                rel = np.array([o["rel"] for o in pc])
                spread = float(np.percentile(rel, 90) - np.percentile(rel, 10))
                v["sentence_spread_p10_p90_db"] = round(spread, 2)
                v["sentence_leveller"] = "IN" if spread > 2.0 else "OUT"
                log("  sentences n=%d  p10-p90 spread %.2f dB -> leveller %s"
                    % (len(pc), spread, v["sentence_leveller"]))
        report["voice"] = v
        log("  I %.2f LUFS  LRA %.2f LU  TP %.2f dBTP  |  centroid %.0f Hz  "
            "speech-band %.1f%%"
            % (ld["integrated_lufs"], ld["lra_lu"], ld["true_peak_dbtp"],
               v["spectrum"]["centroid_hz"],
               100 * v["spectrum"]["speech_band_share"]))

    # --- the beds, over their USED ranges (whole file without a dump) --------
    beds = []
    if a.dump and Path(a.dump).exists():
        dmp = Dump(a.dump, dirs)
        vt = dmp.voice_track()
        report["dump"] = {"project": dmp.d.get("project"),
                          "sample_rate": dmp.d.get("sample_rate"),
                          "length_ms": dmp.d.get("length_ms"),
                          "n_events": len(dmp.events),
                          "voice_track": vt,
                          "unresolved": dmp.unresolved}
        if dmp.unresolved:
            log("!! %d media path(s) did not resolve: %s"
                % (len(dmp.unresolved), dmp.unresolved[:4]))
        for e in dmp.events:
            if vt is not None and e["track"] == vt:
                continue
            if not e["src"]:
                continue
            log("bed t%d [%s] %.1f-%.1f s  <- %s @%.1f+%.1f%s"
                % (e["track"], e["name"][:24], e["t0"], e["t1"],
                   Path(e["src"]).name[:44], e["src_start"], e["src_dur"],
                   " REVERSED" if e["reversed"] else ""))
            m = measure_source(e["src"], e["src_start"], e["src_dur"],
                               e["reversed"], curves=False)
            m["event"] = {k: e[k] for k in
                          ("track", "idx", "name", "t0", "t1", "src_start",
                           "src_dur", "rate", "reversed", "fx", "track_fx",
                           "track_volume", "normalize", "normalize_gain")}
            beds.append(m)
    elif a.beds:
        for b in a.beds:
            src = b if Path(b).exists() else resolve_media(b, dirs)
            if not src:
                log("!! not found: %s" % b)
                continue
            log("bed (whole file) %s" % Path(src).name)
            beds.append(measure_source(src, curves=False))
    report["beds"] = beds

    # --- his mix as rendered: the reference, and the old side of every A/B --
    if a.mix and Path(a.mix).exists():
        log("mix: %s" % a.mix)
        mx = measure_source(a.mix, curves=True)
        ld = mx["loudness"]
        cur = {"hz": 10.0,
               "t": [round(x, 2) for x in ld.pop("t", [])],
               "M": [round(x, 2) for x in ld.pop("M", [])],
               "S": [round(x, 2) for x in ld.pop("S", [])]}
        (out / "mix_curve.json").write_text(json.dumps(cur), encoding="utf-8")
        mx["clipped_samples"] = count_clips(a.mix)
        report["mix"] = mx
        log("  I %.2f LUFS  LRA %.2f LU  TP %.2f dBTP  clipped %d"
            % (ld["integrated_lufs"], ld["lra_lu"], ld["true_peak_dbtp"],
               mx["clipped_samples"]))

    (out / "measure.json").write_text(json.dumps(report, indent=1), encoding="utf-8")
    log("measure -> %s" % out.resolve())
    return report


def count_clips(path, thresh=0.99997, sr=None):
    n = 0
    info = probe(path)
    rate = sr or info.get("sample_rate") or SR
    for blk in decode_blocks(path, rate, mono=False):
        n += int(np.count_nonzero(np.abs(blk) >= thresh))
    return n


# =========================================================== reconstruction
# Rebuild his mix from the dump alone -- track levels x envelopes x event
# gains x fades -- and compare its momentary loudness against his own render.
# Until that matches, NOTHING downstream is believed: not the curve model, not
# the envelope semantics, not the claim that the default track FX are inert.

def reconstruct_curve(dump, curve_hz=10.0, dur=SPINE_S, p_over=None,
                      sr=8000, log_progress=True):
    """Modelled momentary loudness of his mix, at `curve_hz`.

    Each event is decoded once at a low rate (the loudness envelope does not
    need 48 k), scaled by fades x event gain x track envelope x track volume,
    and summed on the timeline.  Loudness is then K-weighted-ish over 400 ms
    windows -- the same window ebur128 uses for M.
    """
    n = int(round(dur * sr))
    acc = np.zeros(n, dtype=np.float64)
    bed = np.zeros(n, dtype=np.float64)
    voi = np.zeros(n, dtype=np.float64)
    vt = dump.voice_track()
    per_ev = []
    for e in dump.events:
        if not e["src"] or e["t1"] <= 0 or e["t0"] >= dur:
            continue
        i0 = max(int(e["t0"] * sr), 0)
        i1 = min(int(e["t1"] * sr), n)
        if i1 <= i0:
            continue
        buf = np.zeros(0, dtype=np.float32)
        for blk in decode_blocks(e["src"], sr, e["src_start"], e["src_dur"],
                                 e["reversed"], mono=True):
            buf = np.concatenate([buf, blk])
            if len(buf) >= (i1 - i0):
                break
        want = i1 - i0
        if len(buf) < want:
            buf = np.concatenate([buf, np.zeros(want - len(buf), np.float32)])
        seg = buf[:want].astype(np.float64)
        t = (np.arange(i0, i1) / sr)
        g = event_envelope(e, t, p_over)
        g = g * env_gain(dump.track_env(e["track"]), t, 1.0, p_over)
        g = g * float(e.get("track_volume") or 1.0)
        if e.get("invert_phase"):
            g = -g
        contrib = seg * g
        acc[i0:i1] += contrib
        if vt is not None and e["track"] == vt:
            voi[i0:i1] += contrib
        else:
            bed[i0:i1] += contrib
        per_ev.append({"track": e["track"], "t0": e["t0"], "t1": e["t1"],
                       "src": Path(e["src"]).name,
                       "reversed": e["reversed"],
                       "peak_gain": float(np.max(np.abs(g))) if g.size else 0.0,
                       "is_voice": (vt is not None and e["track"] == vt)})
        if log_progress:
            log("  + t%d %.0f-%.0f %s%s" % (e["track"], e["t0"], e["t1"],
                                            Path(e["src"]).name[:34],
                                            " REV" if e["reversed"] else ""))
    # momentary loudness: 400 ms rectangular mean-square, hopped at curve_hz
    win = int(0.4 * sr)
    hop = int(sr / curve_hz)
    nfr = max(1 + (n - win) // hop, 0)
    idx = np.arange(win)[None, :] + hop * np.arange(nfr)[:, None]
    def mom(x):
        return 10.0 * np.log10(np.maximum((x[idx] ** 2).mean(1), 1e-20))
    M, Mb, Mv = mom(acc), mom(bed), mom(voi)
    t = np.arange(nfr) / curve_hz
    return t, M, acc, per_ev, Mb, Mv


def compare_curves(t_model, M_model, t_meas, M_meas, floor=-45.0):
    """Offset-corrected agreement between the model and his render."""
    m = np.interp(t_model, t_meas, M_meas)
    ok = (M_model > floor) & (m > floor)
    if ok.sum() < 100:
        return {"error": "not enough overlapping loud frames", "n": int(ok.sum())}
    a, b = M_model[ok], m[ok]
    off = float(np.median(b - a))                 # one global gain offset
    r = float(np.corrcoef(a + off, b)[0, 1])
    d = b - (a + off)
    return {"n": int(ok.sum()), "offset_db": round(off, 2),
            "r": round(r, 4),
            "mae_db": round(float(np.mean(np.abs(d))), 3),
            "p90_db": round(float(np.percentile(np.abs(d), 90)), 3),
            "max_db": round(float(np.abs(d).max()), 3),
            "within_1lu": round(float(np.mean(np.abs(d) <= 1.0)), 4)}


def cmd_reconstruct(a):
    dmp = Dump(a.dump, a.media_dirs or [])
    best = None
    grids = [None]
    if a.fit_curves:
        # correct the exponent family against his render rather than trusting
        # a documented curve shape that Vegas has never documented
        grids = [None, 0.5, 0.7, 1.0, 1.5, 2.0, 3.0]
    meas = json.loads(Path(a.mix_curve).read_text(encoding="utf-8"))
    t_meas = np.array(meas["t"], dtype=np.float64)
    M_meas = np.array(meas["M"], dtype=np.float64)
    for p_over in grids:
        log("model (curve exponent %s)" % ("as-labelled" if p_over is None else p_over))
        t_m, M_m, acc, per, Mb, Mv = reconstruct_curve(
            dmp, dur=a.duration, p_over=p_over,
            log_progress=(p_over is grids[0]))
        cmp_ = compare_curves(t_m, M_m, t_meas, M_meas)
        cmp_["curve_exponent"] = p_over
        log("  r=%s  MAE=%s dB  p90=%s  within1LU=%s  offset=%s"
            % (cmp_.get("r"), cmp_.get("mae_db"), cmp_.get("p90_db"),
               cmp_.get("within_1lu"), cmp_.get("offset_db")))
        if best is None or (cmp_.get("mae_db", 99) < best[0].get("mae_db", 99)):
            best = (cmp_, t_m, M_m, per, Mb, Mv)
    cmp_, t_m, M_m, per, Mb, Mv = best
    verdict = ("PASS" if (cmp_.get("r", 0) > 0.98 and cmp_.get("p90_db", 9) <= 1.0)
               else "FAIL")
    out = {"v": 1, "verdict": verdict, "compare": cmp_,
           "events": per,
           "model_curve": {"hz": 10.0,
                           "M": [round(float(x), 2) for x in M_m],
                           "bed": [round(float(x), 2) for x in Mb],
                           "voice": [round(float(x), 2) for x in Mv]}}
    Path(a.out).write_text(json.dumps(out), encoding="utf-8")
    log("\nRECONSTRUCTION %s -- r=%s  p90 |delta| =%s LU  within 1 LU: %.1f%%"
        % (verdict, cmp_.get("r"), cmp_.get("p90_db"),
           100 * cmp_.get("within_1lu", 0)))
    if verdict == "FAIL":
        log("  the curve model, the envelope semantics, or the 'default track "
            "FX are inert' hypothesis is wrong.  Nothing downstream is trusted.")
    return out


# ================================================================== render
# One streaming pass at 48 k.  Every source gets its own persistent ffmpeg
# decoder, opened when its event starts and read in lockstep with the output
# blocks -- no seeking, no intermediate files, no whole-film buffers.

class EventReader:
    """A persistent float32 stereo decoder for one Vegas event."""

    def __init__(self, ev, sr=SR, at=None):
        """`at` is the timeline second the render starts at.  An event that is
        already playing then must be entered part-way in, not from its head --
        otherwise every excerpt silently time-shifts its own beds."""
        self.ev, self.sr, self.pr, self.done = ev, sr, None, False
        skip = 0.0 if at is None else max(float(at) - ev["t0"], 0.0)
        self.skip_s = skip
        self.n_left = max(int(round((ev["len"] - skip) * sr)), 0)

    def _open(self):
        e = self.ev
        rate = float(e.get("rate") or 1.0) or 1.0
        cmd = [FFMPEG, "-nostdin", "-v", "error"]
        if e["reversed"]:
            # the skip runs backwards along the parent, so it comes off the
            # END of the decoded range, not the start
            ss = e["src_start"]
            dur = max(e["src_dur"] - self.skip_s * rate, 0.0)
        else:
            ss = e["src_start"] + self.skip_s * rate
            dur = max(e["src_dur"] - self.skip_s * rate, 0.0)
        if ss:
            cmd += ["-ss", "%.6f" % ss]
        if dur:
            cmd += ["-t", "%.6f" % dur]
        af = []
        if e["reversed"]:
            af.append("areverse")
        if e.get("rate") and abs(float(e["rate"]) - 1.0) > 1e-9:
            af.append("atempo=%.9f" % float(e["rate"]))
        af.append("aformat=channel_layouts=stereo:sample_fmts=fltp")
        af.append("aresample=%d:resampler=soxr:precision=28" % self.sr)
        cmd += ["-i", e["src"], "-map", "0:a:0", "-af", ",".join(af),
                "-f", "f32le", "-acodec", "pcm_f32le", "-"]
        self.pr = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                                   stderr=subprocess.DEVNULL,
                                   bufsize=1 << 22)

    def read(self, n):
        """n stereo frames -> (n, 2) float32, zero-padded past the end."""
        out = np.zeros((n, 2), dtype=np.float32)
        if self.done:
            return out
        if self.pr is None:
            self._open()
        want = min(n, self.n_left)
        if want <= 0:
            self.close()
            return out
        need = want * 2 * 4
        chunks, got = [], 0
        while got < need:
            b = self.pr.stdout.read(need - got)
            if not b:
                break
            chunks.append(b)
            got += len(b)
        if got:
            x = np.frombuffer(b"".join(chunks), dtype="<f4")
            x = x[: (len(x) // 2) * 2].reshape(-1, 2)
            out[:len(x)] = x
        self.n_left -= want
        if got < need or self.n_left <= 0:
            self.close()
        return out

    def close(self):
        self.done = True
        if self.pr is not None:
            try:
                self.pr.stdout.close()
            except Exception:                                  # noqa: BLE001
                pass
            try:
                self.pr.kill()
            except Exception:                                  # noqa: BLE001
                pass
            self.pr = None


class SpectralGain:
    """Overlap-add STFT with a per-frame, per-bin gain -- the split-band duck,
    the centre carve and the glue shelf, all in one pass.

    A time-varying multiband gain done with IIR crossovers has to recombine
    two phase-shifted bands; done here it does not, and the control resolution
    (hop / sr = 93.75 Hz) already matches the 100 Hz gain curves.
    """

    def __init__(self, sr=SR, nfft=2048, hop=512, shelf_db=GLUE_SHELF_DB):
        self.sr, self.nfft, self.hop = sr, nfft, hop
        self.win = np.hanning(nfft + 1)[:nfft].astype(np.float64)
        # Hann at 75 % overlap sums to a constant; normalise for OLA
        self.win /= np.sqrt((self.win ** 2).sum() / hop) if hop else 1.0
        self.freqs = np.fft.rfftfreq(nfft, 1.0 / sr)
        self.band = (self.freqs >= BAND_LO) & (self.freqs <= BAND_HI)
        self.shelf = np.where(self.freqs >= GLUE_SHELF_HZ,
                              db2lin(shelf_db), 1.0)
        self.tail = np.zeros((0, 2), dtype=np.float64)
        self.carry = np.zeros((0, 2), dtype=np.float64)

    def process(self, x, gain_bb, gain_band, carve_db):
        """x: (n,2).  gain_bb / gain_band: linear gain per output sample.
        carve_db: mid-vs-side trim in dB, per sample (negative = mid down)."""
        n = len(x)
        ncarry = len(self.carry)
        buf = np.concatenate([self.carry, x.astype(np.float64)])
        nfr = 0 if len(buf) < self.nfft else 1 + (len(buf) - self.nfft) // self.hop
        outlen = nfr * self.hop
        acc = np.zeros((max(len(buf), self.nfft), 2), dtype=np.float64)
        if len(self.tail):
            k = min(len(self.tail), len(acc))
            acc[:k] += self.tail[:k]
        for f in range(nfr):
            i0 = f * self.hop
            seg = buf[i0:i0 + self.nfft]
            # the control value for this frame is read at its centre, mapped
            # back out of the carry into this block's own sample index
            c = i0 + self.nfft // 2 - ncarry
            c = int(min(max(c, 0), max(n - 1, 0)))
            gbb = float(gain_bb[c]) if n else 1.0
            gbd = float(gain_band[c]) if n else 1.0
            cv = float(carve_db[c]) if n else 0.0
            gv = np.where(self.band, gbd, gbb) * self.shelf
            mid = 0.5 * (seg[:, 0] + seg[:, 1])
            sid = 0.5 * (seg[:, 0] - seg[:, 1])
            Fm = np.fft.rfft(mid * self.win) * gv * db2lin(cv)
            Fs = np.fft.rfft(sid * self.win) * gv
            m = np.fft.irfft(Fm, self.nfft) * self.win
            sd = np.fft.irfft(Fs, self.nfft) * self.win
            acc[i0:i0 + self.nfft, 0] += m + sd
            acc[i0:i0 + self.nfft, 1] += m - sd
        self.carry = buf[outlen:]
        self.tail = acc[outlen:]
        return acc[:outlen].astype(np.float64)

    @property
    def latency(self):
        return self.nfft


def bus_compressor(x, state, sr=SR, ratio=2.0, thresh_db=-24.0,
                   attack_s=0.300, release_s=1.0, max_gr_db=2.0):
    """Slow 2:1 glue, <= 2 dB GR.  Streaming, state carried between blocks."""
    env = state.get("env", 0.0)
    ga = math.exp(-1.0 / (attack_s * sr))
    gr_ = math.exp(-1.0 / (release_s * sr))
    d = np.maximum(np.abs(x[:, 0]), np.abs(x[:, 1]))
    # one-pole peak follower (vectorised via a simple loop over decimated hops)
    hop = 64
    nh = len(d) // hop
    if nh == 0:
        state["env"] = env
        return x
    dh = d[:nh * hop].reshape(nh, hop).max(1)
    eh = np.empty(nh)
    for i, v in enumerate(dh):
        coef = ga if v > env else gr_
        env = coef * env + (1.0 - coef) * v
        eh[i] = env
    state["env"] = env
    lv = 20.0 * np.log10(np.maximum(eh, 1e-9))
    over = np.maximum(lv - thresh_db, 0.0)
    gr = -np.minimum(over * (1.0 - 1.0 / ratio), max_gr_db)
    g = np.repeat(db2lin(gr), hop)
    if len(g) < len(x):
        g = np.concatenate([g, np.full(len(x) - len(g), g[-1] if len(g) else 1.0)])
    state["gr_min_db"] = min(state.get("gr_min_db", 0.0), float(gr.min()))
    return x * g[:len(x), None]


def softclip(x, thresh_db=-6.0):
    """Memoryless tanh knee above `thresh_db`.

    The spine's peaks are 1,452 isolated sub-millisecond transients (plosives
    and sibilants) at 275 ppm of the file, 26.8 dB above its own integrated
    loudness.  A lookahead limiter would ride 10 dB of gain reduction on them
    once every 1.5 s for 36 minutes; a memoryless knee shaves the same
    transients with no envelope, no pumping and no state.  This is the only
    thing done to the voice besides gain.
    """
    t = db2lin(thresh_db)
    a = np.abs(x)
    over = a > t
    if not over.any():
        return x, 0
    y = x.copy()
    y[over] = np.sign(x[over]) * (t + (1.0 - t) * np.tanh((a[over] - t) / (1.0 - t)))
    return y, int(over.sum())


class TruePeakLimiter:
    """Lookahead limiter driven by a 4x-oversampled peak detector.

    Last in the chain: mp3 decode overshoots 0 dBFS (Glass is already at
    +2.3 dBTP), so nothing upstream is allowed to care about peaks.
    """

    def __init__(self, ceil_db=TRUE_PEAK_CEIL_DBTP, sr=SR, look_ms=2.0,
                 rel_ms=80.0):
        self.ceil = float(db2lin(ceil_db))
        self.look = max(int(look_ms * sr / 1000.0), 1)
        self.a = math.exp(-1.0 / max(rel_ms * sr / 1000.0, 1.0))
        self.buf = np.zeros((self.look, 2), dtype=np.float64)
        self.att = 1.0                      # attenuation state, >= 1
        self.max_gr_db = 0.0
        self.n_reduced = 0

    @staticmethod
    def _tp(x, thresh=0.5):
        """4x-oversampled peak magnitude per sample -- but only computed where
        it can matter.

        Oversampling 103 M samples to find inter-sample peaks costs more than
        the whole rest of the render.  A sample that is 6 dB under the ceiling
        cannot have an inter-sample peak over it, so the expensive estimate is
        run on the few short neighbourhoods that come close and the sample
        magnitude is used everywhere else.
        """
        pk = np.abs(x).max(1)
        n = len(pk)
        hot = pk > thresh
        if n < 16 or not hot.any():
            return pk
        # widen each hot sample into a small neighbourhood
        k = 8
        idx = np.flatnonzero(hot)
        lo = np.maximum(idx - k, 0)
        hi = np.minimum(idx + k + 1, n)
        keep = np.zeros(n, bool)
        for a, b in zip(lo, hi):
            keep[a:b] = True
        seg = np.flatnonzero(np.diff(np.concatenate(([0], keep.view(np.int8),
                                                     [0]))) != 0).reshape(-1, 2)
        out = pk.copy()
        for a, b in seg:
            w = x[a:b]
            if len(w) < 8:
                continue
            X = np.fft.rfft(w, axis=0)
            Y = np.zeros((4 * (len(w) // 2) + 1, 2), dtype=complex)
            Y[:len(X)] = X * 4.0
            up = np.abs(np.fft.irfft(Y, 4 * len(w), axis=0)).max(1)
            m = up[:4 * len(w) // 4 * 4].reshape(-1, 4).max(1)
            out[a:a + len(m)] = np.maximum(out[a:a + len(m)], m)
        return out

    def process(self, x):
        y = np.concatenate([self.buf, x])
        n = len(x)
        pk = self._tp(y)
        need = np.maximum(pk / self.ceil, 1.0)          # required attenuation
        # lookahead: the attenuation must already be in place `look` samples
        # early, so take a running maximum forward over the window
        pad = np.concatenate([need, np.full(self.look, 1.0)])
        win = np.lib.stride_tricks.sliding_window_view(pad, self.look + 1)
        tgt = win.max(1)[:len(need)]
        tgt = tgt[:n] if len(tgt) >= n else np.concatenate(
            [tgt, np.full(n - len(tgt), 1.0)])
        # instant attack, exponential release: att_i = max(tgt_i, a*att_{i-1})
        att = np.empty(n)
        cur = self.att
        chunk = 65536
        for i in range(0, n, chunk):
            seg = tgt[i:i + chunk]
            k = np.arange(len(seg))
            w = self.a ** k
            run = np.maximum.accumulate(seg / w)
            att[i:i + len(seg)] = np.maximum(run * w, cur * self.a ** (k + 1))
            cur = att[i + len(seg) - 1]
        self.att = cur
        g = 1.0 / att
        self.buf = y[len(y) - self.look:]
        out = y[:n] * g[:, None]
        self.max_gr_db = min(self.max_gr_db, float(20 * np.log10(max(g.min(), 1e-9))))
        self.n_reduced += int((g < 0.9995).sum())
        return out


class WavWriter:
    """24-bit PCM, written straight out; the header is patched on close."""

    def __init__(self, path, sr=SR, ch=2, bits=24):
        self.f = open(path, "wb")
        self.sr, self.ch, self.bits, self.n = sr, ch, bits, 0
        self.f.write(b"\0" * 44)

    def write(self, x):
        x = np.clip(np.asarray(x, dtype=np.float64), -1.0, 1.0 - 1.0 / (1 << 23))
        if self.bits == 24:
            q = np.round(x * (1 << 23)).astype("<i4")
            b = q.tobytes()
            b = np.frombuffer(b, dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
        else:
            b = np.round(x * 32767.0).astype("<i2").tobytes()
        self.f.write(b)
        self.n += len(x)

    def close(self):
        byts = self.bits // 8
        data = self.n * self.ch * byts
        self.f.seek(0)
        self.f.write(b"RIFF" + (36 + data).to_bytes(4, "little") + b"WAVEfmt ")
        self.f.write((16).to_bytes(4, "little") + (1).to_bytes(2, "little"))
        self.f.write(self.ch.to_bytes(2, "little") + self.sr.to_bytes(4, "little"))
        self.f.write((self.sr * self.ch * byts).to_bytes(4, "little"))
        self.f.write((self.ch * byts).to_bytes(2, "little"))
        self.f.write(self.bits.to_bytes(2, "little"))
        self.f.write(b"data" + data.to_bytes(4, "little"))
        self.f.close()


def _plan_gains(dmp, meas, curve, dur, mode, cr=CR, p_over=None,
                per_section=False, markers=None):
    """Per-event gain curves at the control rate, plus the shared duck.

    mode "his"      -- his mix exactly: fades x event gain x track envelope
                       x track volume.  Used for the reconstruction check.
    mode "computed" -- beds normalised to BED_NORM_LUFS over their used range,
                       his envelope kept as a SHAPE (peak-normalised, so every
                       relative decision he made survives), the absolute level
                       set by the duck curve.
    """
    n = int(round(dur * cr)) + 1
    t = np.arange(n) / cr
    by_key = {}
    for b in (meas.get("beds") or []):
        e = b.get("event") or {}
        by_key[(e.get("track"), e.get("idx"))] = b
    vt = dmp.voice_track()
    out = []
    for e in dmp.events:
        if not e["src"] or e["t0"] >= dur:
            continue
        is_voice = (vt is not None and e["track"] == vt)
        g = event_envelope(e, t, p_over)
        g = g * env_gain(dmp.track_env(e["track"]), t, 1.0, p_over)
        g = g * float(e.get("track_volume") or 1.0)
        norm = 1.0
        if mode == "computed" and not is_voice:
            b = by_key.get((e["track"], e["idx"]))
            I = ((b or {}).get("loudness") or {}).get("integrated_lufs")
            if I is not None and I > -70:
                norm = float(db2lin(BED_NORM_LUFS - I))
            # his envelope is a SHAPE, not a level: peak-normalise it so the
            # relative gesture survives and the absolute level is the law's
            span = (t >= e["t0"]) & (t < e["t1"])
            pk = float(g[span].max()) if span.any() else 0.0
            if pk > 1e-9:
                if per_section and markers:
                    bounds = [m for _, m in markers]
                    for a0, a1 in zip([0.0] + bounds, bounds + [dur]):
                        sl = span & (t >= a0) & (t < a1)
                        if sl.any():
                            q = float(g[sl].max())
                            if q > 1e-9:
                                g[sl] = g[sl] / q
                else:
                    g = g / pk
        out.append({"ev": e, "gain": g * norm, "is_voice": is_voice,
                    "norm_db": round(float(lin2db(norm)), 2)})
    return t, out


def cmd_render(a):
    if getattr(a, "calib", None) and Path(a.calib).exists():
        cal = json.loads(Path(a.calib).read_text(encoding="utf-8"))
        a.bus_trim_db = float(cal.get("bus_trim_db") or 0.0)
        a.band_trim_db = float(cal.get("band_trim_db") or 0.0)
    dmp = Dump(a.dump, a.media_dirs or [])
    meas = json.loads(Path(a.measure).read_text(encoding="utf-8")) \
        if a.measure and Path(a.measure).exists() else {}
    markers = load_markers(a.markers) if a.markers else []
    dur = a.duration
    n_out = int(round(dur * SR))
    if a.mode == "computed" and abs(dur - SPINE_S) < 1e-6:
        n_out = SPINE_N
    t0_s, t1_s = (a.range or [0.0, dur])
    t0_s = max(t0_s, 0.0)
    t1_s = min(t1_s, dur)
    # State (the STFT carry, the compressor envelope, the limiter release) has
    # to be warmed before the first sample that gets written, or every chunk
    # boundary in a chunked render is an audible seam.
    pre = max(float(getattr(a, "preroll", 0.0) or 0.0), 0.0)
    pre = min(pre, t0_s)
    t0_r = t0_s - pre
    n_skip = int(round(pre * SR))

    tc, plan = _plan_gains(dmp, meas, None, dur, a.mode, p_over=a.curve_exponent,
                           per_section=a.per_section, markers=markers)

    # --- the shared correction ---------------------------------------------
    if a.mode == "computed":
        cur = json.loads(Path(a.curve).read_text(encoding="utf-8"))
        lu = np.array(cur["lu"], dtype=np.float64)
        cr_ = float(cur["stats"]["cr"])
        tl = np.arange(len(lu)) / cr_
        lu = np.interp(tc, tl, lu)
        vI = (((meas.get("voice") or {}).get("loudness") or {})
              .get("integrated_lufs")) or VOICE_TARGET_LUFS
        voice_gain_db = a.voice_target - vI
        # the bed bus target, in dBFS-of-the-normalised-bus
        bed_bb_db = (a.voice_target + lu) - BED_NORM_LUFS
        extra = 0.0                                     # set by the calibration
        # 1 under speech, 0 where the bed is fully lifted.  Getting this the
        # wrong way round puts the band duck and the centre carve in the
        # silences and nowhere near a word.
        # NB the denominator is legitimately NEGATIVE (speech_lu < gap_lu).
        # A max(..., 1e-9) guard here silently collapses depth to zero, which
        # switches off the split-band duck and the centre carve entirely while
        # the broadband duck goes on working -- so the mix sounds plausible
        # and the whole point of the design is missing.
        den = a.speech_lu - a.gap_lu
        den = den if abs(den) > 1e-9 else -1.0
        depth = np.clip((lu - a.gap_lu) / den, 0.0, 1.0)
        bed_bb_db = bed_bb_db + float(getattr(a, "bus_trim_db", 0.0) or 0.0)
        bed_bd_db = bed_bb_db + extra * depth \
            + float(getattr(a, "band_trim_db", 0.0) or 0.0) * depth
        carve_db = CENTER_CARVE_DB * depth
    else:
        voice_gain_db = 0.0
        bed_bb_db = np.zeros_like(tc)
        bed_bd_db = np.zeros_like(tc)
        carve_db = np.zeros_like(tc)

    readers = {i: EventReader(pl["ev"], at=t0_r) for i, pl in enumerate(plan)}
    sg = SpectralGain()
    comp_state = {}
    lim_bed = TruePeakLimiter(a.ceiling)
    lim_full = TruePeakLimiter(a.ceiling)
    bed_w = WavWriter(a.out, bits=24)
    full_w = WavWriter(a.full, bits=24) if a.full else None

    BLK = int(10.0 * SR)
    pos = int(round(t0_r * SR))
    end = int(round(t1_s * SR))
    skip_left = n_skip
    pend = np.zeros((0, 2), dtype=np.float64)
    stats = {"voice_gain_db": round(float(voice_gain_db), 2),
             "softclipped": 0, "n_events": len(plan)}
    log("render mode=%s  %.1f-%.1f s  voice %+.2f dB" %
        (a.mode, t0_s, t1_s, voice_gain_db))
    vg = float(db2lin(voice_gain_db))
    written = 0
    while pos < end:
        m = min(BLK, end - pos)
        ts = pos / SR
        bed = np.zeros((m, 2), dtype=np.float64)
        voice = np.zeros((m, 2), dtype=np.float64)
        ti = np.arange(pos, pos + m) / SR
        for i, pl in enumerate(plan):
            e = pl["ev"]
            if e["t1"] <= ts or e["t0"] >= ts + m / SR:
                continue
            x = readers[i].read(m)
            if not x.any():
                continue
            g = np.interp(ti, tc, pl["gain"])[:, None]
            if pl["is_voice"]:
                voice += x * g
            else:
                bed += x * g
        if a.mode == "computed":
            gb = db2lin(np.interp(ti, tc, bed_bb_db))
            gd = db2lin(np.interp(ti, tc, bed_bd_db))
            cv = np.interp(ti, tc, carve_db)
            # An overlap-add stage returns fewer samples than it is given --
            # it is holding a window's worth of carry.  Padding the shortfall
            # with zeros injects a gap every block and walks the bed out of
            # sync with the voice; the remainder has to be queued instead.
            pend = np.vstack([pend, sg.process(bed, gb, gd, cv)])
            if len(pend) >= m:
                bed, pend = pend[:m], pend[m:]
            else:
                bed = np.vstack([pend, np.zeros((m - len(pend), 2))])
                pend = pend[:0]
            bed = bus_compressor(bed, comp_state)
            voice, nc = softclip(voice * vg, a.softclip_db)
            stats["softclipped"] += nc
        bed = bed[:m] if len(bed) >= m else np.vstack(
            [bed, np.zeros((m - len(bed), 2))])
        if skip_left > 0:
            k = min(skip_left, m)
            # run the limiters over the pre-roll too, then throw it away
            if full_w is not None:
                lim_full.process(bed[:k] + voice[:k])
            if a.limit_bed:
                lim_bed.process(bed[:k])
            skip_left -= k
            bed = bed[k:]
            voice = voice[k:]
            m -= k
            pos += k
            if m <= 0:
                continue
        if full_w is not None:
            fx = bed + voice[:m]
            # "his" mode is a model of his mix, not a deliverable -- limiting
            # it would change the very loudness the check is comparing
            full_w.write(lim_full.process(fx)[:m] if a.mode == "computed" else fx)
        # the bed alone is written unlimited unless asked -- it is a stem, and
        # limiting a stem bakes in gain reduction the master would redo
        bed_w.write(lim_bed.process(bed)[:m] if a.limit_bed else bed)
        pos += m
        written += m
        if (written // BLK) % 12 == 0:
            log("  %.0f / %.0f s" % (pos / SR, end / SR))
    for r in readers.values():
        r.close()
    bed_w.close()
    if full_w:
        full_w.close()
    stats.update({"samples": bed_w.n, "expected": n_out,
                  "bed_limiter_max_gr_db": round(lim_bed.max_gr_db, 2),
                  "full_limiter_max_gr_db": round(lim_full.max_gr_db, 2),
                  "full_limiter_samples_reduced": lim_full.n_reduced,
                  "comp_max_gr_db": round(comp_state.get("gr_min_db", 0.0), 2)})
    log("wrote %s (%d samples)" % (a.out, bed_w.n))
    log("  full limiter max GR %.2f dB on %d samples | comp max GR %.2f dB | "
        "voice softclipped %d samples"
        % (lim_full.max_gr_db, lim_full.n_reduced,
           comp_state.get("gr_min_db", 0.0), stats["softclipped"]))
    if a.stats:
        Path(a.stats).write_text(json.dumps(stats, indent=1), encoding="utf-8")
    return stats


# =============================================================== calibrate
# The law states a TARGET ("the bed sits voice - 14 LU").  Specifying a target
# is not meeting one: the bed bus is a sum of N normalised beds under his
# envelopes, and its level is whatever that sum happens to be.  So render it
# once, measure what it actually did against the voice, and solve for the two
# trims that put it where the doctrine says.  Without this the numbers in the
# plan are decoration.

def _speech_mask(curve, t, speech_lu):
    lu = np.array(curve["lu"], dtype=np.float64)
    cr = float(curve["stats"]["cr"])
    v = np.interp(t, np.arange(len(lu)) / cr, lu)
    return v <= speech_lu + 0.5


def _gate_lufs(x, sr, mask=None):
    """Integrated loudness of x (n,2) over `mask`, via ebur128 on a temp file
    -- the same filter that measured everything else, so the numbers compare."""
    import tempfile
    y = x if mask is None else x[mask]
    if len(y) < sr // 2:
        return None
    fd, pth = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        w = WavWriter(pth, sr=sr)
        w.write(y)
        w.close()
        return ebur128(pth, curves=False)["integrated_lufs"]
    finally:
        try:
            os.remove(pth)
        except OSError:
            pass


def _band(x, sr, lo, hi, nfft=2048):
    """Energy in [lo, hi] as dB, on the mono sum."""
    y = 0.5 * (x[:, 0] + x[:, 1])
    k = (len(y) // nfft) * nfft
    if k < nfft:
        return None
    f = np.fft.rfftfreq(nfft, 1.0 / sr)
    sp = (np.abs(np.fft.rfft(y[:k].reshape(-1, nfft) * np.hanning(nfft),
                             axis=1)) ** 2).mean(0)
    b = (f >= lo) & (f <= hi)
    return float(10 * np.log10(max(sp[b].sum(), 1e-20)))


def cmd_calibrate(a):
    """Sample the film, measure bed-against-voice, solve for the two trims."""
    curve = json.loads(Path(a.curve).read_text(encoding="utf-8"))
    dur = a.duration
    wins = []
    step = dur / (a.n_windows + 1)
    for i in range(a.n_windows):
        t0 = step * (i + 1) - a.window / 2
        wins.append((max(t0, 0.0), min(t0 + a.window, dur)))
    log("calibrating on %d x %.0f s windows" % (len(wins), a.window))

    trim_bb = trim_bd = 0.0
    hist = []
    for it in range(a.iters):
      bed_all, voi_all, msk_all = [], [], []
      for (t0, t1) in wins:
        args = argparse.Namespace(
            dump=a.dump, measure=a.measure, curve=a.curve, markers=a.markers,
            media_dirs=a.media_dirs, mode="computed",
            out=os.path.join(a.tmp, "cal_bed.wav"),
            full=None, range=[t0, t1], duration=dur,
            voice_target=a.voice_target, speech_lu=a.speech_lu,
            gap_lu=a.gap_lu, ceiling=a.ceiling, softclip_db=a.softclip_db,
            curve_exponent=None, per_section=False, limit_bed=False,
            stats=None, bus_trim_db=trim_bb, band_trim_db=trim_bd)
        cmd_render(args)
        bed = _read_wav(args.out)
        voi = _decode_range(a.voice, t0, t1 - t0)
        n = min(len(bed), len(voi))
        bed, voi = bed[:n], voi[:n]
        vI = (((json.loads(Path(a.measure).read_text(encoding="utf-8"))
                .get("voice") or {}).get("loudness") or {})
              .get("integrated_lufs")) or VOICE_TARGET_LUFS
        voi = voi * float(db2lin(a.voice_target - vI))
        t = np.arange(n) / SR + t0
        msk = _speech_mask(curve, t, a.speech_lu)
        bed_all.append(bed)
        voi_all.append(voi)
        msk_all.append(msk)

      bed = np.vstack(bed_all)
      voi = np.vstack(voi_all)
      msk = np.concatenate(msk_all)
      got_bb = _gate_lufs(bed, SR, msk) - _gate_lufs(voi, SR, msk)
      got_bd = _band(bed[msk], SR, BAND_LO, BAND_HI) \
          - _band(voi[msk], SR, BAND_LO, BAND_HI)
      e_bb = a.speech_lu - got_bb
      e_bd = DUCK_SPEECH_BAND_LU - got_bd
      log("  iter %d: broadband %+.2f (err %+.2f) | band %+.2f (err %+.2f)"
          % (it, got_bb, e_bb, got_bd, e_bd))
      hist.append({"iter": it, "bb": round(got_bb, 2), "band": round(got_bd, 2),
                   "bus_trim_db": round(trim_bb, 2),
                   "band_trim_db": round(trim_bd, 2)})
      if abs(e_bb) < a.tol and abs(e_bd) < a.tol:
          break
      # the band sits inside the broadband, so move the bus first and let the
      # band trim carry only the residual difference between the two targets
      trim_bb += e_bb
      trim_bd += (e_bd - e_bb)
    out = {"v": 1, "windows": wins,
           "measured": {"bed_lufs": bL, "voice_lufs": vL,
                        "bed_minus_voice_lu": round(got_bb, 2),
                        "bed_minus_voice_band_lu": round(got_bd, 2)},
           "target": {"broadband_lu": a.speech_lu,
                      "band_lu": DUCK_SPEECH_BAND_LU},
           "bus_trim_db": round(float(trim_bb), 2),
           "band_trim_db": round(float(trim_bd), 2),
           "iterations": hist}
    Path(a.out).write_text(json.dumps(out, indent=1), encoding="utf-8")
    log("\n  bed - voice, broadband : %+.2f LU   (target %+.1f)  -> bus  trim %+.2f dB"
        % (got_bb, a.speech_lu, trim_bb))
    log("  bed - voice, 300-3400  : %+.2f LU   (target %+.1f)  -> band trim %+.2f dB"
        % (got_bd, DUCK_SPEECH_BAND_LU, trim_bd))
    return out


def _read_wav(path):
    f = wave.open(path, "rb")
    n, sw, ch = f.getnframes(), f.getsampwidth(), f.getnchannels()
    raw = f.readframes(n)
    f.close()
    if sw == 3:
        b = np.frombuffer(raw, np.uint8).reshape(-1, 3).astype(np.int32)
        q = b[:, 0] | (b[:, 1] << 8) | (b[:, 2] << 16)
        q = np.where(q >= 1 << 23, q - (1 << 24), q) / float(1 << 23)
    else:
        q = np.frombuffer(raw, "<i2").astype(np.float64) / 32768.0
    return q.reshape(-1, ch)[:, :2] if ch >= 2 else np.repeat(
        q.reshape(-1, 1), 2, axis=1)


def _decode_range(path, start, dur, sr=SR):
    out = []
    for b in decode_blocks(path, sr, start, dur, mono=False):
        out.append(b)
    return np.vstack(out).astype(np.float64) if out else np.zeros((0, 2))


def build_parser():
    ap = argparse.ArgumentParser(prog="mix_lacero.py", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("curve", help="word table -> duck_curve.json")
    c.add_argument("--asr", default="asr_merged.json")
    c.add_argument("--cues", default="subs_synced.srt")
    c.add_argument("--markers", default="markers_asr.json")
    c.add_argument("--out", default="duck_curve.json")
    c.add_argument("--cr", type=float, default=CR)
    c.add_argument("--duration", type=float, default=None)
    c.add_argument("--no-clamp", action="store_true")
    c.add_argument("--speech-lu", dest="speech_lu", type=float, default=DUCK_SPEECH_LU)
    c.add_argument("--pause-lu", dest="pause_lu", type=float, default=LIFT_PAUSE_LU)
    c.add_argument("--gap-lu", dest="gap_lu", type=float, default=LIFT_GAP_LU)
    c.add_argument("--pause-min", dest="pause_min", type=float, default=PAUSE_MIN_S)
    c.add_argument("--attack", type=float, default=ATTACK_S)
    c.add_argument("--lead", type=float, default=LEAD_S)
    c.add_argument("--release", type=float, default=RELEASE_TAU_S)
    c.add_argument("--pad", type=float, default=WORD_PAD_S)
    c.set_defaults(fn=cmd_curve)

    m = sub.add_parser("measure", help="voice / beds / his mix -> measure/")
    m.add_argument("--voice", default=None)
    m.add_argument("--mix", default=None, help="vegas_mix_current.wav")
    m.add_argument("--dump", default=None, help="vegas_audio.json")
    m.add_argument("--beds", nargs="*", default=None,
                   help="measure these whole files (no dump yet)")
    m.add_argument("--media-dirs", dest="media_dirs", nargs="*", default=[])
    m.add_argument("--cues", default="subs_synced.srt")
    m.add_argument("--out", default="measure")
    m.add_argument("--voice-target", dest="voice_target", type=float,
                   default=VOICE_TARGET_LUFS)
    m.set_defaults(fn=cmd_measure)

    r = sub.add_parser("reconstruct", help="model his mix from the dump; prove it")
    r.add_argument("--dump", required=True)
    r.add_argument("--mix-curve", dest="mix_curve", required=True,
                   help="measure/mix_curve.json from `measure --mix`")
    r.add_argument("--media-dirs", dest="media_dirs", nargs="*", default=[])
    r.add_argument("--duration", type=float, default=SPINE_S)
    r.add_argument("--fit-curves", dest="fit_curves", action="store_true")
    r.add_argument("--out", default="reconstruct.json")
    r.set_defaults(fn=cmd_reconstruct)

    d = sub.add_parser("render", help="plan -> illogically_is_bed.wav")
    d.add_argument("--dump", required=True)
    d.add_argument("--measure", default=None, help="measure/measure.json")
    d.add_argument("--curve", default="duck_curve.json")
    d.add_argument("--markers", default="markers_asr.json")
    d.add_argument("--media-dirs", dest="media_dirs", nargs="*", default=[])
    d.add_argument("--mode", choices=["computed", "his"], default="computed")
    d.add_argument("--out", default="illogically_is_bed.wav")
    d.add_argument("--full", default=None, help="also write voice+bed here")
    d.add_argument("--range", nargs=2, type=float, default=None,
                   metavar=("T0", "T1"))
    d.add_argument("--duration", type=float, default=SPINE_S)
    d.add_argument("--voice-target", dest="voice_target", type=float,
                   default=VOICE_TARGET_LUFS)
    d.add_argument("--speech-lu", dest="speech_lu", type=float,
                   default=DUCK_SPEECH_LU)
    d.add_argument("--gap-lu", dest="gap_lu", type=float, default=LIFT_GAP_LU)
    d.add_argument("--ceiling", type=float, default=TRUE_PEAK_CEIL_DBTP)
    d.add_argument("--softclip-db", dest="softclip_db", type=float, default=-6.0)
    d.add_argument("--curve-exponent", dest="curve_exponent", type=float,
                   default=None)
    d.add_argument("--per-section", dest="per_section", action="store_true")
    d.add_argument("--limit-bed", dest="limit_bed", action="store_true")
    d.add_argument("--stats", default=None)
    d.add_argument("--preroll", type=float, default=0.0,
                   help="warm-up seconds decoded but not written (chunked renders)")
    d.add_argument("--bus-trim-db", dest="bus_trim_db", type=float, default=0.0)
    d.add_argument("--band-trim-db", dest="band_trim_db", type=float, default=0.0)
    d.add_argument("--calib", default=None,
                   help="calib.json from `calibrate`; supplies both trims")
    d.set_defaults(fn=cmd_render)

    k = sub.add_parser("calibrate", help="solve the two bus trims so the law is MET")
    k.add_argument("--dump", required=True)
    k.add_argument("--measure", required=True)
    k.add_argument("--voice", required=True)
    k.add_argument("--curve", default="duck_curve.json")
    k.add_argument("--markers", default="markers_asr.json")
    k.add_argument("--media-dirs", dest="media_dirs", nargs="*", default=[])
    k.add_argument("--n-windows", dest="n_windows", type=int, default=8)
    k.add_argument("--window", type=float, default=30.0)
    k.add_argument("--duration", type=float, default=SPINE_S)
    k.add_argument("--voice-target", dest="voice_target", type=float,
                   default=VOICE_TARGET_LUFS)
    k.add_argument("--speech-lu", dest="speech_lu", type=float,
                   default=DUCK_SPEECH_LU)
    k.add_argument("--gap-lu", dest="gap_lu", type=float, default=LIFT_GAP_LU)
    k.add_argument("--ceiling", type=float, default=TRUE_PEAK_CEIL_DBTP)
    k.add_argument("--softclip-db", dest="softclip_db", type=float, default=-6.0)
    k.add_argument("--tmp", default="/tmp")
    k.add_argument("--iters", type=int, default=6)
    k.add_argument("--tol", type=float, default=0.25)
    k.add_argument("--out", default="calib.json")
    k.set_defaults(fn=cmd_calibrate)
    return ap


def main():
    a = build_parser().parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
