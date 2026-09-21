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

| Token | Value | Use |
|---|---|---|
| Ink | `#0a0a0a` | Body text on white, dark section backgrounds |
| White | `#ffffff` | Light backgrounds, text on ink |
| Brand orange | `#ff6a00` | Button fills, accents on dark backgrounds |
| Deep orange | `#c2410c` | Orange **text** on white backgrounds only |
| Slate | `#525252` | Secondary text |

Two oranges exist on purpose. The bright brand orange measures only 2.87:1
against white, which fails the WCAG AA minimum of 4.5:1, so it is never used
for text on a light background. Where orange text sits on white, the deeper
`#c2410c` is used instead at 5.18:1. Ink on brand orange measures 6.90:1,
which is why every orange button uses black text rather than white.

Fonts are Lexend for headings and Source Sans 3 for body, loaded from Google
Fonts. To self host them, download both families into `assets/fonts/` and
replace the `@import` at the top of `styles.css`.

## Accessibility

Built against WCAG 2.1 AA. Implemented: skip link, visible focus rings on
every interactive element, 48px minimum control height, labelled form fields
with inline errors plus a focusable error summary, keyboard operable mobile
navigation that closes on Escape, and `prefers-reduced-motion` support.

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
