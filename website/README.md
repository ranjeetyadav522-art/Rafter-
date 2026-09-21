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

## Before you go live

Three things need your real information. Search for these strings:

| Where | What to replace |
|---|---|
| `contact.html` | `REPLACE_WITH_YOUR_EMAIL` and `REPLACE_WITH_YOUR_NUMBER` |
| `contact.html` | "Add your office address here" and "Add your working hours here" |
| `contact.html` | The form does not send anything yet. See below. |

### Connecting the contact form

The form validates in the browser but nothing is delivered anywhere. To make
it live, give the form a real endpoint and remove the demo flag:

```html
<form class="form" id="enquiry" novalidate
      action="https://your-endpoint-here" method="post">
```

Delete the `data_demo="true"` attribute. Any form service works (Formspree,
Basin, Netlify Forms) or your own server script.

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
