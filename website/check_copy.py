#!/usr/bin/env python3
"""House style check for the Rafter Technologies site.

No dash or hyphen character may appear in any text a visitor can read. This
reads every page, strips the markup, and reports anything that slipped in.
Hyphens inside CSS property names, class names and HTML attributes are
unavoidable and are not checked.

Usage:  python3 check_copy.py
Exits 0 when clean, 1 when a dash is found.
"""

import glob
import os
import re
import sys
from html.parser import HTMLParser

# Hyphen minus, the unicode dash block, and the minus sign.
DASH = re.compile(r"[‐-―−\-]")

# Attributes whose value is shown to a person rather than used by the browser.
READABLE_ATTRS = ("title", "alt", "placeholder", "aria-label")


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.found = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "svg"):
            self.skip += 1
            return
        d = dict(attrs)
        for key in READABLE_ATTRS:
            if key in d:
                self.found.append((self.getpos()[0], "@" + key, d[key]))
        if d.get("name") == "description" and "content" in d:
            self.found.append((self.getpos()[0], "@description", d["content"]))

    def handle_endtag(self, tag):
        if tag in ("script", "style", "svg") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip and data.strip():
            self.found.append((self.getpos()[0], "text", data.strip()))


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    pages = sorted(glob.glob(os.path.join(here, "*.html")))
    if not pages:
        print("No pages found next to this script.")
        return 1

    problems = 0
    for path in pages:
        parser = VisibleText()
        with open(path, encoding="utf-8") as handle:
            parser.feed(handle.read())
        for line, kind, value in parser.found:
            for match in DASH.finditer(value):
                start = max(0, match.start() - 45)
                snippet = value[start:match.start() + 45].replace("\n", " ")
                print("{}:{} [{}]  ...{}...".format(
                    os.path.basename(path), line, kind, snippet))
                problems += 1

    if problems:
        print("\n{} dash character(s) found in visible copy.".format(problems))
        return 1

    print("Clean. {} pages checked, no dashes in visible copy.".format(len(pages)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
