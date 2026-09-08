#!/usr/bin/env python3
"""
Build the Dravaka static site.

Each file in tools/pages/<slug>.html is a page body. Its first three lines are
front matter:

    <!--slug: home-->
    <!--title: Page title-->
    <!--desc: Meta description-->

The body is injected into tools/layout.html and written to <slug>.html in the
project root. Run:  python3 tools/build.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, "tools", "pages")
LAYOUT = os.path.join(ROOT, "tools", "layout.html")

FM = re.compile(r"<!--\s*(slug|title|desc)\s*:\s*(.*?)\s*-->\s*")


def build():
    with open(LAYOUT, encoding="utf-8") as fh:
        layout = fh.read()

    if not os.path.isdir(PAGES):
        sys.exit("No tools/pages directory found.")

    built = []
    for name in sorted(os.listdir(PAGES)):
        if not name.endswith(".html"):
            continue
        path = os.path.join(PAGES, name)
        with open(path, encoding="utf-8") as fh:
            raw = fh.read()

        meta = {"slug": name[:-5], "title": name[:-5].title(), "desc": ""}
        pos = 0
        while True:
            m = FM.match(raw, pos)
            if not m:
                break
            meta[m.group(1)] = m.group(2)
            pos = m.end()
        body = raw[pos:].rstrip() + "\n"

        title = meta["title"]
        if "Dravaka" not in title:
            title = f"{title} | Dravaka Adventure Club"

        html = (layout
                .replace("{{TITLE}}", title)
                .replace("{{DESC}}", meta["desc"])
                .replace("{{PAGE}}", meta["slug"])
                .replace("{{BODY}}", body))

        out = os.path.join(ROOT, meta["slug"] + ".html")
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(html)
        built.append(meta["slug"] + ".html")

    print(f"Built {len(built)} pages: " + ", ".join(built))


if __name__ == "__main__":
    build()
