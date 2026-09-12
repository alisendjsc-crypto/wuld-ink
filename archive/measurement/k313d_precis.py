# -*- coding: utf-8 -*-
"""Methodology-panel précis, v2 -- PER-CLAUSE sourcing, per the library seat's ratification (K232).

v1 asserted one source sentence per LINE while the lines carried several claims each, so "20 lines,
0 unsourced" was true and misleading. v2 stores every line as a list of (clause, source) pairs: the
clauses concatenate to the line the reader sees, and EVERY clause must have a verbatim ancestor in
the panel. Two clauses from the ratified wording itself do not survive this and are noted below.

Ratified wording applied: RSI frame-first; MW "original" restored, line 3 collapsed; DG six lines;
AFM blended line added, caveats merged; label START HERE; no id on the block."""
import json, pathlib, sys, unicodedata
P = json.loads(pathlib.Path('methodology_panels.json').read_text(encoding='utf-8'))
def norm(s):
    s = unicodedata.normalize('NFKC', s)
    for a,b in [('—','--'),('–','-'),('’',"'"),('“','"'),('”','"'),
                ('×','x'),('≥','>='),('→','->'),(' ',' '),('**','')]:
        s = s.replace(a,b)
    return ' '.join(s.split()).lower()
N = {k: norm(v) for k,v in P.items()}

# A line is a list of (clause, source). Clauses concatenate verbatim to form the line.
PRECIS = [
 ("rsi-methodology-panel", "Rebuttal Strength Index", [
  [("It grades the structure of the argument, not whether the position is right.",
    "The scoring reflects structural analysis of argument quality — not agreement or disagreement with the philosophical position.")],
  [("Five axes scored 0–1, combined as a geometric mean",
    "five independent axes scored 0–1. The composite is the geometric mean"),
   (" — so one fatal weakness sinks the whole score,",
    "a fatal weakness on any single axis drags the composite score down regardless of strength on other axes"),
   (" and a zero anywhere is a zero overall.",
    "A score of 0 on any axis yields RSI = 0.")],
  [("Autonomy asks whether the response would convince someone who grants none of the framework",
    "A fully autonomous response (A = 1.0) could convince someone who has never encountered antinatalism."),
   (" — it is the axis that caps persuasive reach.",
    "limiting its persuasive reach to those already sympathetic.")],
  [("Scores are depth-adjusted:",
    "Scores shown are depth-adjusted."),
   (" PUNCH loses roughly 12 points of Completeness and 6 of Robustness by construction,",
    "PUNCH responses lose approximately 12 on Completeness and 6 on Robustness."),
   (" and only DISMANTLE carries the base score.",
    "DISMANTLE responses carry the base score.")],
  [("The percentage is for reading only.",
    "for reading only, never an input to the grade"),
   (" Grades band the unrounded mean,",
    "Grades band the **unrounded** geometric mean"),
   (" which is why an entry can display 88.0 and still be a B.",
    "Boundary cells legitimately read **88.0/B**")],
 ]),
 ("map-methodology-panel", "Mechanism Web", [
  [("It answers why the interlocutor is saying this, not what they are saying.",
    "Most argument preparation focuses on what the opponent says. This map focuses on why they say it.")],
  [("35 mechanism clusters, 82 objections, 142 edges",
    "35 canonical mechanism clusters connected to 82 objection nodes via 142 edges"),
   (" — and the clusters were derived bottom-up from the original objections, not imposed from an existing taxonomy.",
    "The 35 mechanism clusters were derived bottom-up from the original 81 objections, not imposed top-down from a pre-existing taxonomy.")],
  [("Responding well starts with knowing the mechanism:",
    "Before you can respond to an objection effectively, you need to understand whether it originates from genuine philosophical inquiry or from a psychological defense mechanism"),
   (" a defense has to be acknowledged before what it defends can be engaged.",
    "The response strategy must acknowledge the defense before engaging the content.")],
  [("Genuine philosophical engagement is the class diagnosis cannot touch",
    "they cannot be dismissed through mechanism identification"),
   (" — those objections need a substantive answer,",
    "they require substantive philosophical response"),
   (" and they are where Tier 4 and Tier 5 live.",
    "The library's Tier 4 and Tier 5 entries are overwhelmingly populated by genuine engagement mechanisms.")],
  [("The practical payoff: an interlocutor who abandons one objection usually moves to another driven by the same mechanism,",
    "When an interlocutor abandons one objection, they typically move to another driven by the same mechanism."),
   (" so the cluster predicts the next move.",
    "Knowing the mechanism lets you predict the trajectory.")],
 ]),
 ("dep-methodology-panel", "Dependency Graph", [
  [("It answers what each response actually rests on.",
    "what does each response actually depend on?")],
  [("Thirteen premises:", "13 premise nodes"),
   (" nine foundational,", "**Foundational Premises (9)**"),
   (" four diagnostic.", "**Diagnostic Premises (4)**")],
  [("The difference is load-bearing — defeat a foundational premise and every response depending on it loses force;",
    "If a foundational premise is defeated, any response that depends on it loses argumentative force."),
   (" a diagnostic one is a tool for understanding opposition, not a structural dependency of the case.",
    "They are not structural dependencies of the case itself — they are tools for understanding opposition.")],
  [("Strong and weak edges are separated by one precise test: would the response collapse if the premise were removed entirely?",
    "The classification test is precise: would this response structurally collapse if you removed this premise entirely?")],
  [("Consent Impossibility dominates — 26% of all dependencies —",
    "Consent Impossibility's dominance (67 edges — 42 strong, 25 weak — 26% of all dependencies)"),
   (" which the panel itself calls both a strength and a vulnerability.",
    "is both a strength and a vulnerability.")],
  [("PROVISIONAL badges mark assignments that still need validation;",
    "**PROVISIONAL** — Manual assignments that need validation."),
   (" REVIEW badges mark edges that may need reclassifying.",
    "**REVIEW** — Strength upgrades or undercount concerns. These entries may have edges that should be reclassified")],
 ]),
 ("map1-methodology-panel", "Argument Flow Map", [
  [("It answers which objection comes next.",
    "which objection are they most likely to deploy next?")],
  [("Three interlocutor models, each with its own matrix:",
    "generating three separate transition matrices"),
   (" the sophisticate attacks the premise your response invoked,",
    "the sophisticate's next move attacks P directly"),
   (" the defender retreats to another objection driven by the same mechanism,",
    "they retreat to another objection driven by M"),
   (" the drifter moves one tier at a time.",
    "real debates drift one tier at a time")],
  [("The blended view is the union of all three,",
    "**BLENDED mode (default)** — Union of all three."),
   (" with every edge tagged by the modes that contributed it.",
    "Edges tagged with contributing modes.")],
  [("78% of edges appear in only one mode.",
    "The observed 78.0% single-mode distribution"),
   (" The three models mostly disagree, and that disagreement is the whole point",
    "a Sophisticate, a Defender, and a Drifter confronting the same objection select substantively different next moves. This is the central strategic payoff of Map 1."),
   (" — a single averaged matrix would have hidden it.",
    "A single blended prediction matrix would average these disagreements into uselessness.")],
  [("Weights are categorical reasoned judgments, not measured frequencies;",
    "Weights are categorical reasoned judgments, not empirical frequencies;"),
   (" percentages would imply a precision that does not exist.",
    "percentages would imply false precision."),
   (" Two things are candidates for correction:",
    "candidates for correction in future methodology passes"),
   (" the 15 canonical sophisticate overrides were applied without independent expert validation,",
    "They were applied without independent expert validation"),
   (" and the disengagement badge is a coarse, uncalibrated heuristic.",
    "The heuristic is coarse and not empirically calibrated.")],
 ]),
]

# Clauses from the RATIFIED wording that this gate rejects, and what replaced them:
DROPPED = [
 ("RSI-3", "the axis most often misread", "no panel sentence; replaced with 'caps persuasive reach' (sourced)"),
 ("RSI-4", "so a PUNCH B and a DISMANTLE B are not the same object", "an inference the panel does not state; replaced with 'only DISMANTLE carries the base score' (sourced). Worth restoring if the seat judges it entailed."),
 ("DG-5",  "the case has a spine rather than 82 independent arguments", "the seat's own image; 'dominance' is the panel's word, so the line now opens 'Consent Impossibility dominates'"),
 ("DG-6",  "They are not decoration.", "commentary, not the panel's voice"),
 ("AFM-3", "it is a union, not a fourth model", "'not a fourth model' is not stated; 'edges tagged with contributing modes' is"),
 ("AFM-5", "provisional on that account", "the two items are provisional for their own stated reasons, not because weights are categorical"),
]

bad = 0; total = 0
for pid, name, lines in PRECIS:
    body = N[pid]
    print("\n%s  (#%s)" % (name, pid))
    for line in lines:
        text = ''.join(c for c,_ in line)
        oks = []
        for clause, src in line:
            total += 1
            ok = norm(src) in body
            if not ok: bad += 1
            oks.append(ok)
        flag = "OK " if all(oks) else "*** "
        print("   %s %s" % (flag, text[:96] + ("..." if len(text) > 96 else "")))
        for (clause, src), ok in zip(line, oks):
            if not ok: print("        NOT IN PANEL: %r  <- %r" % (clause[:50], src[:70]))
    words = sum(len(''.join(c for c,_ in l).split()) for l in lines)
    print("   -- %d lines, %d clauses, %d words" % (len(lines), sum(len(l) for l in lines), words))
print("\n%d clauses across %d lines; %d unsourced" % (total, sum(len(l) for _,_,l in PRECIS), bad))
print("%d clauses of the ratified wording rejected by this gate (see DROPPED)" % len(DROPPED))
sys.exit(1 if bad else 0)
