#!/usr/bin/env python3
"""Build a single file interactive preview of the Rafter Technologies site.

The live site is five separate pages, which is correct for hosting and for
search engines. Some preview sandboxes will not navigate between separate
html files, so this bundles everything into one self contained file with
client side routing: all five pages, the stylesheet and the script inlined,
nothing loaded from disk except the web fonts.

Output: preview.html, in this same folder. Open it directly in a browser.

Usage:  python3 build_preview.py
"""

import os
import re
import sys

PAGES = [
    ("index", "Home"),
    ("training", "Training"),
    ("resume", "Resume and Support"),
    ("services", "IT Services"),
    ("contact", "Talk to us"),
]

HERE = os.path.dirname(os.path.abspath(__file__))


def read(*parts):
    with open(os.path.join(HERE, *parts), encoding="utf-8") as handle:
        return handle.read()


def main_of(html):
    """Pull the <main> block out of a page."""
    match = re.search(r"<main id=\"main\">(.*?)</main>", html, re.S)
    if not match:
        raise SystemExit("No main block found in one of the pages.")
    return match.group(1)


def footer_of(html):
    match = re.search(r"<footer class=\"foot\">(.*?)</footer>", html, re.S)
    return match.group(1) if match else ""


def rewrite_links(fragment):
    """Point page links at the router instead of at files on disk."""
    names = "|".join(name for name, _ in PAGES)

    # page.html#anchor  ->  #/page/anchor
    fragment = re.sub(
        r'href="(' + names + r')\.html#([A-Za-z0-9_-]+)"',
        r'href="#/\1/\2"',
        fragment,
    )
    # page.html  ->  #/page
    fragment = re.sub(
        r'href="(' + names + r')\.html"',
        r'href="#/\1"',
        fragment,
    )
    return fragment


def build():
    css = read("assets", "css", "styles.css")
    js = read("assets", "js", "main.js")

    sources = {name: read(name + ".html") for name, _ in PAGES}

    sections = []
    for name, _ in PAGES:
        body = rewrite_links(main_of(sources[name]))
        hidden = "" if name == "index" else " hidden"
        sections.append(
            '<div class="routed" id="page_{0}" role="region" '
            'aria-label="{1}"{2}>{3}</div>'.format(
                name, dict(PAGES)[name], hidden, body
            )
        )

    nav = "\n      ".join(
        '<a href="#/{0}" data_route="{0}"{1}>{2}</a>'.format(
            name,
            ' class="btn primary"' if name == "contact" else "",
            label,
        )
        for name, label in PAGES
    )

    footer = rewrite_links(footer_of(sources["index"]))

    brand_mark = (
        '<svg class="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">'
        '<path d="M2 27 16 5l14 22" stroke="#ff6a00" stroke-width="3.4" '
        'stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M8.4 27 16 15l7.6 12" stroke="#ffffff" stroke-width="3.4" '
        'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    )

    router = """
(function () {
  'use strict';
  var pages = %s;

  function show(name, anchor) {
    if (pages.indexOf(name) === -1) { name = 'index'; }

    pages.forEach(function (p) {
      var el = document.getElementById('page_' + p);
      if (el) { el.hidden = (p !== name); }
    });

    document.querySelectorAll('[data_route]').forEach(function (a) {
      if (a.getAttribute('data_route') === name) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });

    var titles = %s;
    document.title = titles[name] || 'Rafter Technologies';

    if (anchor) {
      var target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }

  function route() {
    var raw = (location.hash || '#/index').replace(/^#\\//, '');
    var bits = raw.split('/');
    show(bits[0] || 'index', bits[1]);
  }

  window.addEventListener('hashchange', route);
  route();
})();
""" % (
        repr([name for name, _ in PAGES]).replace("'", '"'),
        repr({name: re.search(r"<title>(.*?)</title>", sources[name], re.S).group(1)
              for name, _ in PAGES}).replace("'", '"'),
    )

    banner = (
        '<div class="previewbar">This is a single file preview of the five page '
        'site. Every link, menu and form on it works. The contact form is live '
        'and will send a real message.</div>'
    )

    extra_css = """
.previewbar {
  background: #171717;
  color: #d4d4d4;
  font-family: var(--font-body);
  font-size: 0.87rem;
  text-align: center;
  padding: 10px 16px;
  border-bottom: 1px solid #262626;
}
.routed[hidden] { display: none; }
"""

    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rafter Technologies</title>
<style>
%s
%s
</style>
</head>
<body>

<a class="skiplink" href="#main">Skip to main content</a>
%s

<header class="masthead">
  <div class="wrap">
    <a class="brand" href="#/index">
      %s
      <span>Rafter<em>.</em></span>
    </a>
    <button class="navtoggle" type="button" aria-expanded="false" aria-controls="sitenav">
      <span class="visually_hidden">Open menu</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <nav class="nav" id="sitenav" aria-label="Main">
      %s
    </nav>
  </div>
</header>

<main id="main">
%s
</main>

<footer class="foot">
%s
</footer>

<script>
%s
</script>
<script>
%s
</script>
</body>
</html>
""" % (css, extra_css, banner, brand_mark, nav,
       "\n".join(sections), footer, js, router)

    out = os.path.join(HERE, "preview.html")
    with open(out, "w", encoding="utf-8") as handle:
        handle.write(html)

    size = os.path.getsize(out)
    print("Wrote preview.html ({:,} bytes) with {} pages inlined.".format(
        size, len(PAGES)))
    return 0


if __name__ == "__main__":
    sys.exit(build())
