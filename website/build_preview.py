#!/usr/bin/env python3
"""Build a single file interactive preview of the Rafter Technologies site.

The live site is separate pages, which is right for hosting and for search
engines. Some preview sandboxes will not navigate between separate html
files, so this bundles everything into one self contained file with client
side routing: every page, the stylesheet, the script and the logo inlined.
Only the web font is loaded from outside.

Output: preview.html, in this same folder. Open it directly in a browser.

Usage:  python3 build_preview.py
"""

import base64
import json
import os
import re
import sys

PAGES = ["index", "career", "training", "resume", "contact"]
CAREER = ["career", "training", "resume"]

HERE = os.path.dirname(os.path.abspath(__file__))


def read(*parts):
    with open(os.path.join(HERE, *parts), encoding="utf-8") as handle:
        return handle.read()


def block(html, pattern, what):
    match = re.search(pattern, html, re.S)
    if not match:
        raise SystemExit("Could not find the %s block in a page." % what)
    return match.group(1)


def rewrite_links(fragment):
    """Point page links at the router instead of at files on disk."""
    names = "|".join(PAGES)
    fragment = re.sub(r'href="(' + names + r')\.html#([A-Za-z0-9_]+)"',
                      r'href="#/\1/\2"', fragment)
    fragment = re.sub(r'href="(' + names + r')\.html"', r'href="#/\1"', fragment)
    return fragment


def build():
    css = read("assets", "css", "styles.css")
    js = read("assets", "js", "main.js")
    sources = {name: read(name + ".html") for name in PAGES}

    with open(os.path.join(HERE, "assets", "img", "logo.png"), "rb") as handle:
        logo = "data:image/png;base64," + base64.b64encode(handle.read()).decode("ascii")

    # The header comes from a Career Services page, because that one carries
    # the section navigation as well. The router shows it only where it applies.
    header = block(sources["career"], r'(<header class="masthead">.*?</header>)', "header")
    header = header.replace(' aria-current="page"', "")
    header = rewrite_links(header)

    sections = []
    for name in PAGES:
        body = rewrite_links(block(sources[name], r'<main id="main">(.*?)</main>', "main"))
        # links to a section of the same page go through the router too
        body = re.sub(r'href="#([A-Za-z0-9_]+)"', 'href="#/%s/\\1"' % name, body)
        hidden = "" if name == "index" else " hidden"
        sections.append('<div class="routed" id="page_%s"%s>%s</div>' % (name, hidden, body))

    footer = rewrite_links(block(sources["index"], r'(<footer class="foot">.*?</footer>)', "footer"))

    titles = {name: block(sources[name], r"<title>(.*?)</title>", "title") for name in PAGES}

    router = """
(function () {
  'use strict';
  var pages = %s;
  var career = %s;
  var titles = %s;

  function show(name, anchor) {
    if (pages.indexOf(name) === -1) { name = 'index'; }
    var inCareer = career.indexOf(name) !== -1;

    pages.forEach(function (p) {
      document.getElementById('page_' + p).hidden = (p !== name);
    });

    var local = document.querySelector('.localnav');
    if (local) { local.hidden = !inCareer; }

    document.querySelectorAll('.masthead a[href^="#/"]').forEach(function (a) {
      var target = a.getAttribute('href').slice(2);
      var on = a.closest('.localnav')
        ? target === name
        : (target === name || (target === 'career' && inCareer));
      if (a.classList.contains('brand')) { on = false; }
      if (on) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });

    document.title = titles[name] || 'Rafter Technologies';

    var target = anchor ? document.getElementById(anchor) : null;
    if (target) { target.scrollIntoView({ block: 'start' }); } else { window.scrollTo(0, 0); }
  }

  function route() {
    /* A plain fragment such as the skip link is not a route. */
    if (location.hash && location.hash.indexOf('#/') !== 0) { return; }
    var bits = (location.hash || '#/index').slice(2).split('/');
    show(bits[0] || 'index', bits[1]);
  }

  window.addEventListener('hashchange', route);
  route();
})();
""" % (json.dumps(PAGES), json.dumps(CAREER), json.dumps(titles))

    banner = ('<div class="previewbar">Single file preview of the site. '
              'The contact form is live and sends a real message.</div>')

    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rafter Technologies</title>
<style>
%s
</style>
</head>
<body>

<a class="skiplink" href="#main">Skip to main content</a>
%s

%s

<main id="main">
%s
</main>

%s

<script>
%s
</script>
<script>
%s
</script>
</body>
</html>
""" % (css, banner, header, "\n".join(sections), footer, router, js)

    html = html.replace("assets/img/logo.png", logo)

    out = os.path.join(HERE, "preview.html")
    with open(out, "w", encoding="utf-8") as handle:
        handle.write(html)

    print("Wrote preview.html ({:,} bytes) with {} pages inlined.".format(
        os.path.getsize(out), len(PAGES)))
    return 0


if __name__ == "__main__":
    sys.exit(build())
