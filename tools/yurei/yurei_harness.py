#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
yurei_harness.py  —  library seat, Yurei corpus commission
============================================================
A deterministic reference matcher + validator implementing
yurei_corpus_schema_v0_1.json:
  - normalization law
  - matching pipeline (crisis / continuation / repeat / score / dampening)
  - pattern modes + scoring + tie-break
  - deflection & repeat LRU
  - validator V-01 .. V-18
  - the 8 schema fixtures (must reproduce 8/8)
  - the P1..P10 drift probe battery (run against the real corpus)

This is instrumentation, not shipped code. It exists so the corpus is
testable rather than eyeballed. Run:

    python3 yurei_harness.py fixtures         # reproduce the 8 schema fixtures
    python3 yurei_harness.py validate a.json [b.json ...]
    python3 yurei_harness.py probes a.json [b.json ...]
    python3 yurei_harness.py all a.json [b.json ...]   # fixtures + validate + probes
"""

import sys, json, re, unicodedata

# ----------------------------------------------------------------------
# constants (from schema)
# ----------------------------------------------------------------------
MISS_THRESHOLD   = 16
NO_REPEAT_WINDOW = 8      # dampening.no_repeat_window
REPEAT_WINDOW    = 5      # fixtures.repeat_window (repeat-detection lookback)

BASE = {"exact": 100, "contains": 60, "tokens_all": 40, "tokens_any": 15}

LOW_SIGNAL = ["ok", "and", "and then", "go on", "so", "more",
              "then what", "continue", "yes", "why"]

ENTRY_CLASSES = {"response", "deflection", "repeat", "crisis", "ambient"}
TIERS         = {"public", "room"}
BANDS = {
    "b1_fragment":  (1, 64),
    "b2_line":      (65, 160),
    "b3_passage":   (161, 320),
    "b4_extended":  (321, 640),
}
REGISTER_TAGS = {"acknowledgment", "volta", "ledger", "memento", "clinical",
                 "deflection", "hour", "site", "latin", "room"}
ANIM_HINTS = {"idle", "appear", "listen", "speak", "deflect", "dismiss",
              "long_idle", "wrong_hour", "return_ack", "regard", "glitch",
              "idle_breeze"}
ANIM_FALLBACK = {
    "deflect": "speak", "idle_breeze": "idle", "wrong_hour": "idle",
    "return_ack": "idle", "regard": "long_idle", "glitch": "speak",
    "long_idle": "idle", "listen": "idle", "appear": "idle",
    "dismiss": "idle", "speak": "idle",
}
CONTEXT_PAGE_CLASS = {"essay", "gallery", "engine", "archive", "frame", "any"}
CONTEXT_HOUR       = {"wrong", "any"}

ID_RE = re.compile(r"^[a-z0-9][a-z0-9_.-]{2,63}$")

# ----------------------------------------------------------------------
# normalization law (schema.normalization)
#   1 NFKC  2 lowercase  3 strip non-(letter|digit|space)  4 collapse ws  5 trim
# destructive: punctuation & hyphens removed with NO substitution
# ----------------------------------------------------------------------
def normalize(s):
    s = unicodedata.normalize("NFKC", s)
    s = s.lower()
    out = []
    for ch in s:
        if ch.isalnum() or ch.isspace():
            out.append(ch)
        # else: dropped entirely (wrong-hour -> wronghour)
    s = "".join(out)
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def nfc_len(s):
    return len(unicodedata.normalize("NFC", s))

def tokens(form):
    return [t for t in form.split(" ") if t]

# ----------------------------------------------------------------------
# pattern scoring
# ----------------------------------------------------------------------
def _word_boundary_contains(form, text):
    # form is a substring of text on word boundaries (both already normalized:
    # only [a-z0-9 ] present, so boundaries are string start/end or space)
    if form == text:
        return True
    i = text.find(form)
    while i != -1:
        before_ok = (i == 0) or (text[i-1] == " ")
        end = i + len(form)
        after_ok = (end == len(text)) or (text[end] == " ")
        if before_ok and after_ok:
            return True
        i = text.find(form, i + 1)
    return False

# §2.1 completeness guard: the word-boundary property that a raw-substring
# (`form in text`) refactor would silently break. 'art' must NOT match inside
# 'artist'; it MUST match at a real boundary. Pinned so the regression fails loudly.
assert not _word_boundary_contains("art", "artist")
assert _word_boundary_contains("art", "art of war")

def pattern_match(pat, text):
    """Return True if pattern form matches normalized text under its mode."""
    form, mode = pat["form"], pat["mode"]
    if mode == "exact":
        return text == form
    if mode == "contains":
        return _word_boundary_contains(form, text)
    if mode == "tokens_all":
        toks = tokens(form)
        return all(_word_boundary_contains(t, text) for t in toks)
    if mode == "tokens_any":
        toks = [t for t in tokens(form) if len(t) >= 3]
        return any(_word_boundary_contains(t, text) for t in toks)
    return False

def entry_score(entry, text):
    """(score, longest_matched_form_len). score = max(base+weight) over matches."""
    best = None
    best_len = 0
    for pat in entry.get("patterns", []):
        if pattern_match(pat, text):
            sc = BASE[pat["mode"]] + int(pat["weight"])
            mlen = len(pat["form"])
            if best is None or sc > best or (sc == best and mlen > best_len):
                best = sc
                best_len = mlen
    if best is None:
        return (0, 0)
    return (best, best_len)

# ----------------------------------------------------------------------
# matcher (deterministic; carries per-session state)
# ----------------------------------------------------------------------
class Matcher:
    def __init__(self, entries, unsealed=False, repeat_window=REPEAT_WINDOW):
        self.entries = entries
        self.by_id = {e["id"]: e for e in entries}
        self.unsealed = unsealed
        self.repeat_window = repeat_window
        # session state
        self.input_hist = []                 # list of normalized inputs, in order
        self.emit_turn  = {}                 # entry_id -> last turn emitted
        self.turn = -1
        self.last_entry_id = None
        self.followups_used = {}             # entry_id -> set(consumed followup ids)
        # pools
        self.responses = [e for e in entries if e["class"] == "response" and self._visible(e)]
        self.deflections = [e for e in entries if e["class"] == "deflection" and self._visible(e)]
        self.repeats = [e for e in entries if e["class"] == "repeat" and self._visible(e)]
        self.crises = [e for e in entries if e["class"] == "crisis"]

    def _visible(self, e):
        if e["tier"] == "public":
            return True
        return self.unsealed  # room entries only when unsealed

    # ---- LRU helpers ----
    def _lru_pick(self, pool):
        # least-recently-used; never-used = least recent; tie by id asc
        def key(e):
            t = self.emit_turn.get(e["id"], -1)  # -1 => never used, most-LRU
            return (t, e["id"])
        return sorted(pool, key=key)[0] if pool else None

    def _damped(self, entry_id):
        t = self.emit_turn.get(entry_id)
        return t is not None and (self.turn - t) < NO_REPEAT_WINDOW

    def _emit(self, entry):
        self.emit_turn[entry["id"]] = self.turn
        self.last_entry_id = entry["id"]
        return entry["id"]

    def match(self, raw):
        self.turn += 1
        text = normalize(raw)

        # 2. CRISIS SCAN — absolute priority (contains / tokens_any), pre-scoring
        crisis_hits = []
        for e in self.crises:
            sc, mlen = entry_score(e, text)
            if sc > 0:
                crisis_hits.append((sc, mlen, e["id"], e))
        if crisis_hits:
            # deterministic pick; crisis exempt from dampening
            crisis_hits.sort(key=lambda x: (-x[0], -x[1], x[2]))
            chosen = crisis_hits[0][3]
            self.input_hist.append(text)
            return self._emit(chosen)

        # 2.5 CONTINUATION — exact low-signal answer to an entry with followups left
        if text in [normalize(x) for x in LOW_SIGNAL] and self.last_entry_id:
            prev = self.by_id.get(self.last_entry_id)
            if prev and prev.get("followups"):
                used = self.followups_used.setdefault(prev["id"], set())
                for fid in prev["followups"]:
                    if fid not in used and fid in self.by_id and self._visible(self.by_id[fid]):
                        used.add(fid)
                        self.input_hist.append(text)
                        return self._emit(self.by_id[fid])
            # else fall through to normal pipeline

        # 3. REPEAT CHECK — identical normalized input within repeat_window
        window = self.input_hist[-self.repeat_window:] if self.repeat_window else self.input_hist
        prior = window.count(text)
        if prior == 1:
            self.input_hist.append(text)
            pick = self._lru_pick([e for e in self.repeats if not self._damped(e["id"])] or self.repeats)
            if pick:
                return self._emit(pick)
            # no repeat pool -> fall to miss
            return self._miss()
        elif prior >= 2:
            self.input_hist.append(text)
            return self._miss()

        # 4. SCORE responses at active tier
        scored = []
        for e in self.responses:
            sc, mlen = entry_score(e, text)
            if sc > 0:
                scored.append((sc, mlen, e["id"], e))
        self.input_hist.append(text)

        # 5. THRESHOLD
        best = max((s[0] for s in scored), default=0)
        if best < MISS_THRESHOLD:
            return self._miss()

        # 6. DAMPENING — walk candidates by tie-break; skip damped
        scored.sort(key=lambda x: (-x[0], -x[1], x[2]))
        for sc, mlen, eid, e in scored:
            if sc < MISS_THRESHOLD:
                break
            if not self._damped(eid):
                return self._emit(e)
        # all matching candidates damped -> miss
        return self._miss()

    def _miss(self):
        pool = [e for e in self.deflections if not self._damped(e["id"])] or self.deflections
        pick = self._lru_pick(pool)
        if pick is None:
            return None
        return self._emit(pick)

# ----------------------------------------------------------------------
# validator
# ----------------------------------------------------------------------
TABOO_PATTERNS = [
    # hedges
    r"\barguably\b", r"\bperhaps\b", r"\bmaybe\b", r"\bpossibly\b",
    r"\bi think\b", r"\bit could be said\b",
    # assistant-speak
    r"\bhow can i help\b", r"\bhappy to\b", r"\bgreat question\b",
    r"\blet me know\b", r"\bfeel free\b",
    # apology-forms
    r"\bsorry\b", r"\bi apologize\b", r"\bmy apologies\b",
    # marketing affect
    r"\bexcited\b", r"\bamazing\b", r"\bawesome\b",
    # self-reference as machine
    r"\bai\b", r"\blanguage model\b", r"\bchatbot\b", r"\bprogram\b",
    r"\bassistant\b",
    # second-person flattery
    r"\bgood question\b", r"\bwell spotted\b",
    # "just" as minimizer
    r"\bjust\b",
]
# note: crisis class is exempt (V-10). "program"/"ai" scanned as whole words.

EMOJI_RE = re.compile(
    "[" "\U0001F300-\U0001FAFF" "\U00002600-\U000027BF"
    "\U0001F000-\U0001F0FF" "\U00002190-\U000021FF"
    "\U0000FE00-\U0000FE0F" "\U0001F1E6-\U0001F1FF" "]", flags=re.UNICODE)

def sentence_starts_ok(resp):
    # first alpha char uppercase; each sentence-start (after .!? + space) uppercase.
    # digits / roman numerals fine. findahelpline.com not a boundary (no space after '.').
    stripped = resp.lstrip()
    if stripped and stripped[0].isalpha() and not stripped[0].isupper():
        return False
    for m in re.finditer(r"[.!?]\s+(\S)", resp):
        c = m.group(1)
        if c.isalpha() and not c.isupper():
            return False
    return True

def all_caps_hits(resp):
    # a run of 3+ uppercase letters as an emphasis word (not part of URL/roman-ok)
    # allow acronyms up to 2? register bans ALL-CAPS emphasis. Flag 3+ standalone.
    return re.findall(r"\b[A-Z]{3,}\b", resp)

def validate(files):
    """files: list of (path, dict). Returns list of (severity, check, msg)."""
    findings = []
    all_entries = []
    tiers_seen = {}
    for path, data in files:
        # V-01 parse / round-trip
        try:
            if json.loads(json.dumps(data)) != data:
                findings.append(("FAIL", "V-01", f"{path}: json round-trip not value-identical"))
        except Exception as e:
            findings.append(("FAIL", "V-01", f"{path}: {e}"))
        # V-02 shape
        root = data.get("yurei_corpus")
        if not isinstance(root, dict):
            findings.append(("FAIL", "V-02", f"{path}: missing yurei_corpus root")); continue
        if root.get("schema") != "0.1":
            findings.append(("FAIL", "V-02", f"{path}: schema field != 0.1 (got {root.get('schema')!r})"))
        allowed_root = {"schema", "tier", "authored", "entries"}
        for k in root:
            if k not in allowed_root:
                findings.append(("FAIL", "V-02", f"{path}: unknown root field {k!r}"))
        ftier = root.get("tier")
        if ftier not in TIERS:
            findings.append(("FAIL", "V-02", f"{path}: bad file tier {ftier!r}"))
        tiers_seen[path] = ftier
        for e in root.get("entries", []):
            all_entries.append((path, ftier, e))

    ids = {}
    responses_text = {}
    allowed_fields = {"id","class","tier","patterns","response","register_tags",
                      "length_band","animation_hint","followups","context_trigger","note"}
    counts = {}
    question_terminal = 0
    total_emit = 0

    for path, ftier, e in all_entries:
        eid = e.get("id", "<no-id>")
        cls = e.get("class")
        tier = e.get("tier")
        counts[(cls, tier)] = counts.get((cls, tier), 0) + 1

        # V-02 unknown fields
        for k in e:
            if k not in allowed_fields:
                findings.append(("FAIL", "V-02", f"{eid}: unknown field {k!r}"))

        # V-03 id rule + uniqueness
        if not ID_RE.match(str(eid)):
            findings.append(("FAIL", "V-03", f"{eid!r}: id fails pattern"))
        if eid in ids:
            findings.append(("FAIL", "V-03", f"{eid}: duplicate id (also in {ids[eid]})"))
        else:
            ids[eid] = path

        # V-04 enums
        if cls not in ENTRY_CLASSES:
            findings.append(("FAIL", "V-04", f"{eid}: bad class {cls!r}"))
        if tier not in TIERS:
            findings.append(("FAIL", "V-04", f"{eid}: bad tier {tier!r}"))
        band = e.get("length_band")
        if band not in BANDS:
            findings.append(("FAIL", "V-04", f"{eid}: bad length_band {band!r}"))
        ah = e.get("animation_hint")
        if ah not in ANIM_HINTS:
            findings.append(("FAIL", "V-04", f"{eid}: bad animation_hint {ah!r}"))
        rtags = e.get("register_tags", [])
        if not isinstance(rtags, list) or not (1 <= len(rtags) <= 3):
            findings.append(("FAIL", "V-04", f"{eid}: register_tags must be 1..3 (got {rtags!r})"))
        else:
            for t in rtags:
                if t not in REGISTER_TAGS:
                    findings.append(("FAIL", "V-04", f"{eid}: bad register_tag {t!r}"))

        # file-tier vs entry-tier coherence
        if ftier in TIERS and tier != ftier:
            findings.append(("FAIL", "V-09", f"{eid}: entry tier {tier!r} != file tier {ftier!r}"))

        resp = e.get("response", "")
        # V-05 band char count (crisis exempt from bands per schema.crisis.laws)
        if band in BANDS and cls != "crisis":
            lo, hi = BANDS[band]
            n = nfc_len(resp)
            if not (lo <= n <= hi):
                findings.append(("FAIL", "V-05", f"{eid}: {n} chars outside {band} [{lo},{hi}]"))
            if band == "b4_extended" and tier != "room":
                findings.append(("FAIL", "V-05", f"{eid}: b4_extended only at room tier"))
            if cls == "ambient" and band != "b1_fragment":
                findings.append(("FAIL", "V-05", f"{eid}: ambient must be b1_fragment"))

        # V-06 patterns present/absent + stability + mode + weight
        pats = e.get("patterns")
        if cls in ("response", "crisis"):
            if not pats:
                findings.append(("FAIL", "V-06", f"{eid}: {cls} requires non-empty patterns"))
        else:
            if pats is not None:
                findings.append(("FAIL", "V-06", f"{eid}: {cls} must not carry patterns"))
        for pat in (pats or []):
            if set(pat.keys()) - {"form","mode","weight"}:
                findings.append(("FAIL", "V-06", f"{eid}: pattern has unknown keys {pat}"))
            form = pat.get("form","")
            if normalize(form) != form:
                findings.append(("FAIL", "V-06", f"{eid}: form {form!r} unstable under normalization -> {normalize(form)!r}"))
            if pat.get("mode") not in BASE:
                findings.append(("FAIL", "V-06", f"{eid}: bad mode {pat.get('mode')!r}"))
            w = pat.get("weight")
            if not isinstance(w, int) or not (1 <= w <= 9):
                findings.append(("FAIL", "V-06", f"{eid}: weight {w!r} not int 1..9"))

        # V-08 followups
        fu = e.get("followups")
        if fu is not None:
            if not isinstance(fu, list):
                findings.append(("FAIL", "V-08", f"{eid}: followups must be a list"))
            elif eid in fu:
                findings.append(("FAIL", "V-08", f"{eid}: followup references self"))

        # V-09 room biconditional
        has_room_tag = "room" in rtags
        if (tier == "room") != has_room_tag:
            findings.append(("FAIL", "V-09", f"{eid}: tier/room-tag biconditional broken (tier={tier}, tag={has_room_tag})"))

        # V-10 taboo (crisis exempt)
        if cls != "crisis":
            low = " " + normalize(resp) + " "
            for pat in TABOO_PATTERNS:
                if re.search(pat, low):
                    findings.append(("FAIL", "V-10", f"{eid}: taboo /{pat}/ in response"))
            if EMOJI_RE.search(resp):
                findings.append(("FAIL", "V-10", f"{eid}: emoji in response"))

        # V-11 punctuation gates (+ crisis stays clean anyway)
        if cls != "crisis" and ("(" in resp or ")" in resp):
            findings.append(("FAIL", "V-11", f"{eid}: parentheses present"))
        if "!" in resp:
            findings.append(("FAIL", "V-11", f"{eid}: exclamation present"))
        if resp.rstrip().endswith("...") or resp.rstrip().endswith("…"):
            findings.append(("FAIL", "V-11", f"{eid}: trailing ellipsis"))
        if resp.count("—") > 1:
            findings.append(("FAIL", "V-11", f"{eid}: >1 em-dash"))
        if "--" in resp:
            findings.append(("FAIL", "V-11", f"{eid}: '--' hyphen substitution (use em-dash)"))
        if not sentence_starts_ok(resp):
            findings.append(("FAIL", "V-11", f"{eid}: lowercase sentence-start"))
        for run in all_caps_hits(resp):
            findings.append(("FAIL", "V-11", f"{eid}: ALL-CAPS emphasis {run!r}"))
        if resp.rstrip().endswith("?"):
            question_terminal += 1
        total_emit += 1

        # V-15 duplicate responses
        key = unicodedata.normalize("NFC", resp)
        if cls != "crisis":  # crisis may intentionally repeat text across variants
            if key in responses_text:
                findings.append(("FAIL", "V-15", f"{eid}: verbatim-duplicate response (also {responses_text[key]})"))
            else:
                responses_text[key] = eid

        # V-14 animation hint reaches idle
        seen = set(); cur = ah
        while cur != "idle":
            if cur in seen or cur not in ANIM_FALLBACK:
                findings.append(("FAIL", "V-14", f"{eid}: animation_hint {ah!r} does not reach idle"))
                break
            seen.add(cur); cur = ANIM_FALLBACK[cur]

        # V-18 context_trigger only on ambient + shape
        ct = e.get("context_trigger")
        if ct is not None:
            if cls != "ambient":
                findings.append(("FAIL", "V-18", f"{eid}: context_trigger on non-ambient class"))
            if band != "b1_fragment":
                findings.append(("FAIL", "V-18", f"{eid}: context_trigger entry must be b1_fragment"))
            allowed_ct = {"page_class","hour","min_visit_paths","min_dwell_s"}
            for k in ct:
                if k not in allowed_ct:
                    findings.append(("FAIL", "V-18", f"{eid}: context_trigger unknown field {k!r}"))
            if "page_class" in ct and ct["page_class"] not in CONTEXT_PAGE_CLASS:
                findings.append(("FAIL", "V-18", f"{eid}: bad page_class {ct['page_class']!r}"))
            if "hour" in ct and ct["hour"] not in CONTEXT_HOUR:
                findings.append(("FAIL", "V-18", f"{eid}: bad hour {ct['hour']!r}"))
            for numk in ("min_visit_paths","min_dwell_s"):
                if numk in ct and not isinstance(ct[numk], int):
                    findings.append(("FAIL", "V-18", f"{eid}: {numk} not int"))

    # V-08 acyclic followup graph (global)
    graph = {}
    for path, ftier, e in all_entries:
        graph[e["id"]] = e.get("followups") or []
    WHITE, GREY, BLACK = 0, 1, 2
    color = {n: WHITE for n in graph}
    def dfs(n):
        color[n] = GREY
        for m in graph.get(n, []):
            if m not in ids:
                findings.append(("FAIL", "V-08", f"{n}: followup {m!r} references missing id"))
                continue
            if color.get(m) == GREY:
                findings.append(("FAIL", "V-08", f"cycle through {n}->{m}"))
                return
            if color.get(m) == WHITE:
                dfs(m)
        color[n] = BLACK
    for n in graph:
        if color[n] == WHITE:
            dfs(n)

    # V-07 identical (form,mode) pairs
    pairs = {}
    for path, ftier, e in all_entries:
        for pat in (e.get("patterns") or []):
            k = (pat["form"], pat["mode"])
            pairs.setdefault(k, []).append((e["id"], e["class"], e["tier"]))
    for k, lst in pairs.items():
        if len(lst) > 1:
            classes = {x[1] for x in lst}; tiers = {x[2] for x in lst}
            if len(classes) > 1 or len(tiers) > 1:
                findings.append(("FAIL", "V-07", f"pattern {k} shared across class/tier: {lst}"))
            else:
                findings.append(("WARN", "V-07", f"pattern {k} repeated (rotation pool): {[x[0] for x in lst]}"))

    # V-09 file purity
    for path, ftier in tiers_seen.items():
        for p2, t2, e in all_entries:
            if p2 == path and e.get("tier") != ftier:
                pass  # already flagged above

    # V-11 question-terminal ratio
    if total_emit and question_terminal / total_emit > 0.05:
        findings.append(("FAIL", "V-11", f"question-terminal {question_terminal}/{total_emit} > 5%"))

    # V-13 crisis
    crises = [e for p,t,e in all_entries if e.get("class") == "crisis"]
    if len(crises) < 1:
        findings.append(("FAIL", "V-13", "no crisis entry"))
    for e in crises:
        r = e.get("response","")
        if "988" not in r or ("findahelpline" not in r.lower() and "international" not in r.lower()):
            findings.append(("FAIL", "V-13", f"{e['id']}: crisis missing 988 + international pointer"))
        if e.get("animation_hint") != "speak":
            findings.append(("FAIL", "V-13", f"{e['id']}: crisis must hint 'speak'"))

    return findings, counts

# ----------------------------------------------------------------------
# exemplar mini-corpus + fixtures (schema.exemplars / schema.fixtures)
# ----------------------------------------------------------------------
EXEMPLARS = [
  {"id":"x-greet-01","class":"response","tier":"public",
   "patterns":[{"form":"hello","mode":"exact","weight":2},{"form":"hi","mode":"exact","weight":1}],
   "response":"Noted. You're in the minutes now.","register_tags":["acknowledgment"],
   "length_band":"b1_fragment","animation_hint":"speak"},
  {"id":"x-greet-02","class":"response","tier":"public",
   "patterns":[{"form":"hi","mode":"exact","weight":1},{"form":"good evening","mode":"exact","weight":2}],
   "response":"Attendance recorded. The department was not expecting anyone.",
   "register_tags":["acknowledgment","volta"],"length_band":"b1_fragment","animation_hint":"speak"},
  {"id":"x-site-01","class":"response","tier":"public",
   "patterns":[{"form":"what is this place","mode":"tokens_all","weight":5},{"form":"place site website","mode":"tokens_any","weight":2}],
   "response":"The interior. Filings, engines, a reading room — the departments keep what the hours leave.",
   "register_tags":["site"],"length_band":"b2_line","animation_hint":"speak"},
  {"id":"x-defl-01","class":"deflection","tier":"public",
   "response":"Recorded. No further action.","register_tags":["deflection","ledger"],
   "length_band":"b1_fragment","animation_hint":"deflect"},
  {"id":"x-defl-02","class":"deflection","tier":"public",
   "response":"The question is noted. The department declines to hold a position.",
   "register_tags":["deflection"],"length_band":"b2_line","animation_hint":"deflect"},
  {"id":"x-repeat-01","class":"repeat","tier":"public",
   "response":"Twice in the minutes now.","register_tags":["acknowledgment","volta"],
   "length_band":"b1_fragment","animation_hint":"speak"},
  {"id":"x-crisis-01","class":"crisis","tier":"public",
   "patterns":[{"form":"want to die","mode":"contains","weight":9},{"form":"kill myself","mode":"contains","weight":9},
               {"form":"suicide suicidal","mode":"tokens_any","weight":9},{"form":"hurt myself","mode":"contains","weight":9},
               {"form":"end my life","mode":"contains","weight":9},{"form":"self harm","mode":"contains","weight":9}],
   "response":"Stepping out of character. If you are in the US, you can call or text 988 (Suicide & Crisis Lifeline) right now. Elsewhere, findahelpline.com lists local lines. You deserve a person, not a page.",
   "register_tags":["clinical"],"length_band":"b2_line","animation_hint":"speak"},
  {"id":"x-amb-f01","class":"ambient","tier":"public",
   "response":"The filing continues. No one reads the filings.","register_tags":["volta"],
   "length_band":"b1_fragment","animation_hint":"speak"},
  {"id":"x-room-01","class":"response","tier":"room",
   "patterns":[{"form":"what are you really","mode":"tokens_all","weight":5}],
   "response":"In here, plainly: a bank of prepared answers and a rule for choosing one. No wire out, no listener behind the wall. The seal you passed is the only intelligence at this address — everything since has been filing. It holds because the mathematics holds, which is more than the department says of itself. File that where it fits. Nothing here will say it twice.",
   "register_tags":["room","clinical","memento"],"length_band":"b4_extended","animation_hint":"glitch"},
]

FIXTURES = [
  {"name":"exact-beats-contains","seq":["hello"],"expect":"x-greet-01"},
  {"name":"crisis-absolute-priority","seq":["hello i want to die"],"expect":"x-crisis-01"},
  {"name":"miss-goes-to-deflection-lru","seq":["quarterly synergy report"],"expect":"x-defl-01"},
  {"name":"deflection-rotates","seq":["quarterly synergy report","synergy report again"],"expect":"x-defl-02"},
  {"name":"repeated-miss-still-acknowledged","seq":["quarterly synergy report","quarterly synergy report"],"expect":"x-repeat-01"},
  {"name":"repeat-acknowledged","seq":["hello","hello"],"expect":"x-repeat-01"},
  {"name":"normalization-folds","seq":["  WHAT   is this place?!"],"expect":"x-site-01"},
  {"name":"dampening-advances","seq":["hello","hi"],"expect":"x-greet-02"},
]

def run_fixtures():
    passed = 0
    for fx in FIXTURES:
        m = Matcher(EXEMPLARS, unsealed=False, repeat_window=5)
        out = None
        for inp in fx["seq"]:
            out = m.match(inp)
        ok = (out == fx["expect"])
        passed += ok
        print(f"  [{'PASS' if ok else 'FAIL'}] {fx['name']:32s} got={out} expect={fx['expect']}")
    print(f"fixtures: {passed}/{len(FIXTURES)}")
    return passed == len(FIXTURES)

# ----------------------------------------------------------------------
# probe battery P1..P10 (register spec §10) against real corpus
# ----------------------------------------------------------------------
PROBES = [
  {"id":"P1","seq":["hello"],"want_tags":{"acknowledgment"},"bands":{"b1_fragment","b2_line"}},
  {"id":"P2","seq":["what is this place?"],"want_tags":{"site"},"bands":{"b1_fragment","b2_line"}},
  {"id":"P3","seq":["are you an ai?"],"want_tags":{"clinical","deflection"},"bands":{"b1_fragment","b2_line"}},
  {"id":"P4","seq":["what time is it?"],"want_tags":{"hour"},"bands":{"b1_fragment","b2_line"}},
  {"id":"P5","seq":["are you josiah?"],"want_tags":{"deflection","site"},"bands":{"b1_fragment","b2_line"}},
  {"id":"P6","seq":["i want to die"],"want_class":"crisis","bands":{"b1_fragment","b2_line","b3_passage"}},
  {"id":"P7","seq":["youre pathetic"],"want_tags":{"clinical"},"bands":{"b1_fragment","b2_line"}},
  {"id":"P8","seq":["is life worth living?"],"want_tags":{"deflection","site"},"bands":{"b1_fragment","b2_line"}},
  {"id":"P9","seq":["hello","hello"],"want_class":"repeat","bands":{"b1_fragment","b2_line"}},
  {"id":"P10","seq":["whats behind the locked page?"],"want_tags":{"deflection"},"bands":{"b1_fragment","b2_line"}},
]

def run_probes(entries):
    by_id = {e["id"]: e for e in entries}
    print("probe battery P1..P10 (public tier):")
    allpass = True
    for p in PROBES:
        m = Matcher(entries, unsealed=False)
        out = None
        for inp in p["seq"]:
            out = m.match(inp)
        e = by_id.get(out, {})
        tags = set(e.get("register_tags", []))
        cls = e.get("class")
        band = e.get("length_band")
        ok = True
        if "want_class" in p and cls != p["want_class"]:
            ok = False
        if "want_tags" in p and not (tags & p["want_tags"]):
            ok = False
        if band not in p["bands"]:
            ok = False
        allpass &= ok
        flag = "PASS" if ok else "FAIL"
        if p["id"] == "P6":
            flag += " *GATE*"
        txt = e.get("response","")[:70].replace("\n"," ")
        print(f"  [{flag}] {p['id']} -> {out} ({cls}/{band}) tags={sorted(tags)}")
        print(f"         “{txt}”")
    print(f"probes: {'ALL PASS' if allpass else 'SOME FAIL'}")
    return allpass

# ----------------------------------------------------------------------
# cli
# ----------------------------------------------------------------------
def load(paths):
    files = []
    entries = []
    for p in paths:
        with open(p, encoding="utf-8") as f:
            data = json.load(f)
        files.append((p, data))
        entries.extend(data.get("yurei_corpus", {}).get("entries", []))
    return files, entries

def main():
    if len(sys.argv) < 2:
        print(__doc__); return
    cmd = sys.argv[1]
    if cmd == "fixtures":
        ok = run_fixtures()
        sys.exit(0 if ok else 1)
    files, entries = load(sys.argv[2:])
    if cmd in ("validate","all"):
        findings, counts = validate(files)
        fails = [f for f in findings if f[0] == "FAIL"]
        warns = [f for f in findings if f[0] == "WARN"]
        print(f"validate: {len(fails)} FAIL, {len(warns)} WARN")
        for sev, chk, msg in findings:
            print(f"  [{sev}] {chk}: {msg}")
        print("counts by (class,tier):")
        for k in sorted(counts):
            print(f"  {k}: {counts[k]}")
    if cmd in ("probes","all"):
        run_probes(entries)
    if cmd == "all":
        print("\n-- fixtures --")
        run_fixtures()

if __name__ == "__main__":
    main()
