# Rafter Technologies website

Static site, no build step, no framework. Open `index.html` in a browser or
upload the whole `website/` folder to any host.

The site has two sides. IT services for companies come first and are the
home page. Career Services for job seekers sit behind their own item in the
top navigation, with a second navigation row across those pages.

```
website/
  index.html        IT services: web development, software, cyber security
  career.html       Career Services overview
  training.html     Career Services: training tracks, method, questions
  resume.html       Career Services: resume writing, interviews, job support
  contact.html      Contact form
  login.html        Login gateway, passes the visitor on to the login
  assets/css/styles.css
  assets/js/main.js
  assets/img/logo.png, favicon.png
  assets/fonts/lexend.woff2
```

## Login

The Login button opens `login.html`, a small page of this site with the
logo and a single button. On real hosting it passes the visitor straight on
to the login after about a second, without showing the address:

    https://sites.google.com/view/rafter-technologies-outsource/full-page-embed?hl=en-IN

The "Continue to login" button is there for cases where an automatic move
is not allowed. To change the address, edit the two places it appears in
`login.html`: the `meta http-equiv="refresh"` line and the button.

An earlier version showed the login inside a frame. That was dropped: it is
blocked in the preview, and Google may refuse to be framed on a real host
too, which would have left a blank page.

## Logo

`assets/img/logo.png` is the supplied logo, resized only, with its colours
and proportions untouched. It has a transparent background and dark artwork,
so it is placed only on white or light grey.

## Interactive preview

`preview.html` is a single file build of the whole site: every page, the
stylesheet, the script, the font and the logo inlined, with client side routing. Open it directly
in a browser, no server needed. It exists because some preview sandboxes will
not navigate between separate html files, so the normal multi page build
cannot be clicked through in them.

It is generated, not hand written. Regenerate it after any content change:

```bash
python3 build_preview.py
```

Edit the real pages and re-run that. Do not edit `preview.html` by hand, the
next build overwrites it. The multi page version in this folder remains the
one you deploy: separate pages are better for hosting and for search engines.

Note that the contact form inside the preview is live, not a mockup. Anything
submitted from it really is sent.

## Contact form delivery

The form posts to [FormSubmit](https://formsubmit.co) which forwards each
enquiry to **support@raftertechnologies.com**. Nothing is stored on the site.

**One time activation.** The first time anyone submits the form, FormSubmit
sends a confirmation email to support@raftertechnologies.com asking you to
approve the address. **Click that link once.** Until you do, submissions are
held and will not reach you. Send yourself one test message after the site is
live and confirm it.

The address and the service are set as attributes on the form in
`contact.html`, so neither is buried in the JavaScript:

```html
<form class="form" id="enquiry" novalidate
      data_endpoint="https://formsubmit.co/ajax/"
      data_inbox="support@raftertechnologies.com">
```

To change the inbox, edit `data_inbox`. To move to a different provider
(Formspree, Basin, your own script), change `data_endpoint` to a service that
accepts JSON and returns `{"success": "true"}`.

If the request fails for any reason, the visitor is shown your email address
and asked to write directly, so an enquiry is never silently lost.

### Note on privacy

Submissions pass through FormSubmit's servers on the way to you. If you would
rather enquiries never touch a third party, you need a small server side
script on your own hosting instead. Worth considering given you collect
people's career details.

## Contact details on the site

| Where | Value |
|---|---|
| Contact page and every footer | support@raftertechnologies.com |
| Contact page and every footer | +91 80528 39537 |

There is no office address or opening hours shown anywhere. If you want them
added later, they belong in the `contactlist` block in `contact.html`.

## Design system

A light, commercial layout in the style of a premium IT agency template:
split hero with an illustration, service cards with icons, a why us section,
a numbered process track, call to action panels and a light footer. Rules
come from the design skills in this repository (ui-ux-pro-max,
design-system, brand).

**Colour.** White first, with a warm tint for depth. There is no dark theme
and no black section. Roughly 70 percent white and soft surfaces, 25 percent
ink for text, and about 5 percent orange. Orange marks the primary button,
icons, links, small labels and progress, and is never a full section
background.

| Token | Value | Use |
|---|---|---|
| Ink | `#15151c` | Headings, the secondary button |
| Body | `#50505c` | Paragraph text |
| Muted | `#6b6b78` | Small print |
| Soft | `#f7f7fa` | Alternate sections, footer |
| Tint | `#fff6ee` and `#ffeede` | Hero, panels, icon boxes, labels |
| Accent | `#ff6a00` | Primary button, icons, progress |
| Accent text | `#b3390a` | Orange text and links |

White text on the orange measures 2.87:1 and fails WCAG AA, so orange
buttons carry ink text at 6.33:1, and orange text on light surfaces uses the
deeper `#b3390a` at 5.29:1 or better. All colours are CSS variables at the
top of `styles.css`.

**Type.** Lexend throughout, served from `assets/fonts/` so the text never
depends on another server (SIL Open Font License, text included beside the
file). Headings use weight 600, body 400, labels and buttons 500. Body text
is about 16.5px with a 1.7 line height, and lines stay under roughly 70
characters.

**Space.** An 8px rhythm, 112px between sections on desktop and 76px on
phones, content in a 1200px column, 20px corner radius on cards.

**Two sides, two shapes.** The IT services page and the Career Services
page are built from different parts on purpose, so one never reads as a copy
of the other.

| | IT services (`index.html`) | Career Services (`career.html`) |
|---|---|---|
| Hero | Split, with a dashboard illustration | Centred, with a five stage journey |
| Then | Sliding band of services | A sentence that lights up as you scroll |
| Offer | Three numbered cards | Alternating rows, each with its own illustration |
| Detail | Why us tiles, four step process track | Tracks behind two tabs |
| Close | Centred panel | Words left, buttons right |

**Illustrations.** The hero pictures are built from markup and CSS, not
image files, so they stay sharp at any size and add nothing to download.

## Motion

- **Settle.** Headline lines rise out of a mask, and cards and sections rise
  into place the first time they scroll into view, a beat apart.
- **Scrub.** The floating cards in the hero drift apart as you scroll, the
  band of services slides sideways, the process track fills and switches
  each step on, and a thin bar at the top shows reading progress.
- **Idle.** The floating cards bob slowly and the chart bars grow on load.
- **Pointer.** The hero window leans a few degrees toward the cursor, and
  cards lift with an accent line on hover.

Everything that hides content at rest sits behind a `js_anim` class that the
script adds only when JavaScript runs and the visitor has not asked for
reduced motion. With either of those the page is fully visible and still.

## Accessibility

Built against WCAG 2.1 AA: skip link, visible focus rings, controls at least
44px tall, labelled form fields with inline errors and a focusable error
summary, keyboard operable mobile menu that closes on Escape, and
`prefers-reduced-motion` support.

## House style

There are no dash or hyphen characters anywhere in the visible copy. This is
deliberate. If you add new content, keep to it: write "one to one", not the
hyphenated form. A checker is included:

```bash
python3 check_copy.py
```

It reads every page, strips the markup, and fails if a dash appears in any
text a visitor can read. Hyphens inside CSS property names and HTML
attributes are unavoidable and are ignored.
