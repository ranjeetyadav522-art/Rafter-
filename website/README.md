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
  assets/css/styles.css
  assets/js/main.js
  assets/img/logo.png, favicon.png
```

## Login

The Login button in the header, and the Login link in the footer, open the
client portal in a new tab:

    https://sites.google.com/view/rafter-technologies-outsource/full-page-embed?hl=en-IN

To change the address, search the pages for `sites.google.com`.

## Logo

`assets/img/logo.png` is the supplied logo, resized only, with its colours
and proportions untouched. It has a transparent background and dark artwork,
so it is placed only on white or light grey. Do not put it on the black
sections, where the shield would disappear.

## Interactive preview

`preview.html` is a single file build of the whole site: every page, the
stylesheet, the script and the logo inlined, with client side routing. Open it directly
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

Minimal: large quiet type, generous white space, rounded tiles, hairline
rows, and one accent colour. Rules taken from the design skills in this
repository (ui-ux-pro-max, design-system, brand):

**Colour.** Roughly 60 percent white and light grey, 30 percent black, and
well under 10 percent orange. Orange is reserved for the primary button,
text links, one headline accent in each hero, and the progress and process
lines. It is never a section background.

| Token | Value | Use |
|---|---|---|
| Ink | `#1d1d1f` | Text on light surfaces, the Login button |
| Black | `#000000` | Home hero, dark cards, closing tile |
| Mist | `#f5f5f7` | Alternate sections, tiles, footer |
| Grey | `#6e6e73` | Secondary text on light |
| Accent | `#ff6a00` | Buttons, and links and accents on black |
| Accent text | `#b93d0a` | Orange links on white or mist |

The bright orange measures 2.87:1 on white, which fails WCAG AA, so it never
carries text on a light surface. Links there use `#b93d0a` at 5.16:1, and
buttons carry ink text on orange at 5.86:1. All colours are CSS variables at
the top of `styles.css`.

**Type.** One family: the system font stack, with Inter as the web font
fallback. One weight for headings (600), one for body (400). Body text is
17px with lines kept under about 70 characters. Headline sizes scale with
the screen through `clamp()`.

**Space.** Spacing follows an 8px rhythm, sections are separated by 120px
on desktop and 80px on phones, and content sits in a 1120px column.

## Motion

Three kinds, and no more than one or two moving things in any one view:

- **Settle.** Headline lines rise out of a mask on load, and content rises
  into place the first time it scrolls into view.
- **Scrub.** A few elements follow the scroll position directly: the hero
  eases back into a rounded card, the statement lights up word by word, the
  three service cards stack over each other, the large word band slides
  sideways, the process line fills, and a thin bar at the top shows how far
  down the page you are.
- **Pointer.** A soft light follows the cursor on the black hero and tiles.

All of it sits behind a `js_anim` class that the script adds only when
JavaScript runs and the visitor has not asked for reduced motion. With
either of those the page is fully visible and static. Card stacking is also
switched off on small or short screens, where a card would not fit.

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
