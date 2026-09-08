#!/usr/bin/env python3
"""Verify every internal link, anchor and asset reference in the built site."""
import os, re, glob, sys

pages = sorted(glob.glob("*.html"))
ids = {p: set(re.findall(r'id="([^"]+)"', open(p, encoding="utf-8").read())) for p in pages}
bad = []

for p in pages:
    s = open(p, encoding="utf-8").read()

    for href in re.findall(r'href="([^"]+)"', s):
        if href.startswith(("http", "mailto:", "tel:", "data:")):
            continue
        if href.startswith("#"):
            if href[1:] and href[1:] not in ids[p]:
                bad.append((p, href, "missing anchor on this page"))
            continue
        file, _, frag = href.partition("#")
        file = file.split("?")[0]
        if file and not os.path.exists(file):
            bad.append((p, href, "missing file"))
        elif frag and file.endswith(".html") and frag not in ids.get(file, set()):
            bad.append((p, href, "missing anchor in " + file))

    for src in re.findall(r'src="([^"]+)"', s):
        if not src.startswith("http") and not os.path.exists(src.split("?")[0]):
            bad.append((p, src, "missing asset"))

if bad:
    print("BROKEN (%d):" % len(bad))
    for b in bad:
        print("  %-16s %-42s %s" % b)
    sys.exit(1)
print("OK — %d pages, all internal links, anchors and assets resolve." % len(pages))
