#!/usr/bin/env python3
"""K299 - bump the engine cache-bust in both widget loaders.

yurei-oracle.js is injected with ?v=<VER> by omega-assistant.js (K255) and yurei-assistant.js
(K243). sw.js does NOT precache it, but `?v` assets are cache-first-on-miss, so an installed
phone would keep the K298 engine on the K299 corpus without a new URL. successor-stage.js
loads the engine UNVERSIONED and needs no bump (network on miss).
"""
import sys, pathlib
BUMPS = [("src/components/omega-assistant.js", 'var VER = "K255";', 'var VER = "K299";'),
         ("src/components/yurei-assistant.js", 'var VER = "K243";', 'var VER = "K299";')]
def main(root):
    root = pathlib.Path(root)
    for rel, old, new in BUMPS:
        p = root / rel; s = p.read_text(encoding="utf-8")
        assert s.count(old) == 1, "%s: expected exactly 1 %r, found %d" % (rel, old, s.count(old))
        p.write_text(s.replace(old, new), encoding="utf-8", newline="")
        print("  %-38s %s -> %s" % (rel, old.split('"')[1], new.split('"')[1]))
    return 0
if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "."))
