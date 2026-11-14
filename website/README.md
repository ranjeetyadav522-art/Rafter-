# Rafter Technologies website

Static site. Five pages, no build step, no framework. Open `index.html` in a
browser or upload the whole `website/` folder to any host.

```
website/
  index.html        Home
  training.html     Training domains, method, FAQ
  resume.html       Resume writing, interview prep, job support
  services.html     IT services for companies
  contact.html      Contact form
  assets/css/styles.css
  assets/js/main.js
```

## Interactive preview

`preview.html` is a single file build of the whole site: all five pages, the
stylesheet and the script inlined, with client side routing. Open it directly
in a browser, no server needed. It exists because some preview sandboxes will
not navigate between separate html files, so the normal five page build
cannot be clicked through in them.

It is generated, not hand written. Regenerate it after any content change:

```bash
python3 build_preview.py
```

Edit the real pages and re-run that. Do not edit `preview.html` by hand, the
next build overwrites it. The five page version in this folder remains the
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

Minimal, in the spirit of Apple's marketing pages: large quiet type, a lot of
white space, rounded tiles, almost no borders, and one accent colour used
sparingly. Direction came from the ui-ux-pro-max skill ("Minimalism and Swiss
Style", low variance, subtle motion, spacious density).

| Token | Value | Use |
|---|---|---|
| Ink | `#1d1d1f` | Text on light surfaces, dark pill buttons |
| Black | `#000000` | Home hero, dark tiles, dark sections |
| Mist | `#f5f5f7` | Alternate section background, tiles, footer |
| Grey | `#6e6e73` | Secondary text on light |
| Accent | `#ff6a00` | Buttons, and links and accents on black |
| Accent text | `#b93d0a` | Orange links on white or mist |

Two oranges exist on purpose. The bright brand orange measures 2.87:1 on
white, which fails WCAG AA, so it never carries text on a light surface.
Links there use the deeper `#b93d0a` at 5.16:1. Buttons carry ink text on
orange at 5.86:1.

Type is the system font stack, so Apple devices render San Francisco, with
Inter loaded from Google Fonts for everything else.

What was removed to get here, and should stay out: uppercase orange eyebrow
labels above every heading, icon plus heading plus paragraph card grids,
numbered step blocks, pill tag strips, the marquee, decorative background
shapes, and hover effects on every surface.

## Motion

Quiet by design. Content fades up once as it scrolls into view, the hero
settles on load, and the header gains a hairline after the first scroll.
Nothing loops and nothing moves on hover apart from link chevrons.

The reveal rules sit behind a `js_anim` class that the script adds only when
JavaScript runs and the visitor has not asked for reduced motion, so with
either of those the page renders fully visible and static.

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
