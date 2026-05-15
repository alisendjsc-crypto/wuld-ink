# Bug Report — Cowork VM Worker (vmwp.exe) Stale-Cache Writeback

**Status:** FILED 2026-05-15 (K19 close)
**Authored:** K19 (2026-05-15) Cowork session, wuld-ink project
**Issue URL:** https://github.com/anthropics/claude-code/issues/59564
**Label:** bug
**K20 note:** vmwp.exe vector confirmed NOT wuld-ink-specific — targets any C:\ mounted folder when sandbox initiates `.git/` writes. See K20 narrative in CLAUDE.md for expanded scope finding (sibling-folder corruption during library substrate clone attempt).
**Repo:** `anthropics/claude-code` (per search confirmation — Cowork issues land here per #50895, #49276, #27492, #48407)
**Labels (suggest at submission):** `bug`, `cowork`, `desktop-app`, `windows`

---

## Title

```
Cowork VM worker (vmwp.exe) overwrites host-side filesystem changes with stale VM-cached content on session startup
```

---

## Body (paste as-is into issue body)

### Summary

In Cowork mode (research preview, desktop app, Windows 11), the Hyper-V VM worker hosting the Cowork sandbox writes VM-internal-cached copies of mounted-folder files back to the host filesystem at every VM startup. This silently reverts host-side filesystem changes that occurred between Cowork sessions, causing tracked-file drift in git-managed projects.

### Reproduction

1. Open a git-managed project in Cowork (e.g., one with `.gitignore`, `CLAUDE.md`, or any tracked file).
2. Close the Cowork session.
3. Modify a tracked file on the host side via any means (text editor, IDE, external commit, etc.).
4. Re-open the Cowork session on the same project.
5. Observe: the host-side change is reverted to whatever the VM had cached internally. `git status --short` shows the file as `M`.
6. `git show HEAD:$f > $f` restores the host file to the committed state cleanly.

### Forensic Evidence

Sysinternals Process Monitor capture covering Cowork VM startup. Filter: path substring `wuld-ink\.git` (project directory). Captured **2,322 events** in a ~60-second VM-startup window. **1,023 events** from `vmwp.exe` (Hyper-V VM worker, PID 15688).

The critical mutation sequence at `20:11:12` on 2026-05-15:

```
20:11:12.362  vmwp.exe (PID 15688)  SetEndOfFileInformationFile  .gitignore  (truncate)
20:11:12.404  vmwp.exe (PID 15688)  WriteFile                    .gitignore  (765 bytes at offset 0)
20:11:12.734  System (PID 4)        WriteFile                    .gitignore  (4096-byte page flush)
20:11:12.734  System (PID 4)        SetEndOfFileInformationFile  .gitignore
```

The 765-byte write reverted a recent commit's modification to `.gitignore`. The `vmwp.exe` write happens AFTER the host-side commit existed, indicating the VM held a stale snapshot from before the commit and wrote it back on next startup.

### Additional Patterns Observed Across ~13 Cowork Sessions

- **`.git/index.lock` recurrence at session-open** (12+ sessions through K18). Lock is orphan-stale (no live process holds it); clears via `Remove-Item -Force`.
- **`.git/config` line 17 truncation** (sessions K15+). `[branch "main"]` merge key reverted to truncated state (`merge ` orphan with no `= refs/heads/main`); manual repair documented in recovery script.
- **CLAUDE.md content drift** (K9, K10, K12, K13, K15, K16, K18). File reverts to older versions, restored via `git show HEAD:CLAUDE.md > CLAUDE.md`.

All consistent with the same `vmwp.exe` stale-cache-writeback mechanism observed in the trace.

### Operational Impact

- **Not workflow-breaking** — recovery is reliable via `PS Remove-Item` + `git show HEAD:$f > $f` + manual config repair when prompted.
- **Workflow cost:** ~30-60 seconds per session-open for diagnostic + recovery.
- **Risk surface:** uncommitted host-side changes between sessions are silently lost on next VM startup.

### Environment

- Claude desktop app, Cowork mode (research preview)
- Windows 11
- Project on local filesystem (`C:\Users\<user>\Projects\<repo>`)
- Python 3.10 (for `procmon-parser` analysis)
- `procmon-parser` 0.3.13 (PyPI)
- Repo: `github.com/alisendjsc-crypto/wuld-ink` (public; can share state if useful)

### Attachments (offer in comments)

- `k18-trace.csv` (2,322 events, ~600 KB) — Procmon evidence
- `scripts/analyze_procmon.py` (~200 lines) — reproducible methodology, uses `procmon-parser` PyPI package
- Subset of `CLAUDE.md` investigation block (Experiments 1-7) — multi-session forensic narrowing trail

### Known Library Limitation Discovered During Analysis

`procmon-parser` 0.3.13 fails frame-alignment around the 9-9.66M event mark (deterministic across multiple captures). For multi-GB PMLs, only the first ~17-28% of events parse cleanly before the parser starts raising `KeyError` + `ValueError` on random offsets. Worth filing separately with `procmon-parser` maintainers if useful. For this report, the parsed window is sufficient to demonstrate the `vmwp.exe` mechanism.

### Suggested Mitigation Paths (for Anthropic's evaluation)

1. **VM filesystem sync discipline:** flush VM-internal file cache to host before VM shutdown; on startup, read from host (not cache) for any host-mounted folder.
2. **Mount mode change:** use a host-pass-through filesystem mount (e.g., 9P, virtiofs) instead of cached-block-level mount where VM holds dirty pages.
3. **Operator-side workaround documentation:** at minimum, document the recovery cycle (`recover-git.ps1` pattern) in Cowork mode user guide so operators don't lose uncommitted work without knowing why.

---

## Submission notes for operator

After submitting:

1. Note the issue number (e.g., `#NNNNN`) in K19's CLAUDE.md narrative under Experiment 7 section
2. If you want me to attach the trace CSV + analyze_procmon.py to the issue, leave a comment on the issue offering them — Anthropic engineers can request the attachments as comment replies
3. The CLAUDE.md narrative will be updated post-K20 with the actual ticket URL

If Anthropic responds with mitigation guidance or asks for further forensics, capture that in the next coord-doc round (could create a dedicated `docs/anthropic-bug-coord.md` if the back-and-forth gets long).
