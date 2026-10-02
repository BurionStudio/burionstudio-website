Website Architecture

## Current stack

The site is intentionally kept as a lightweight static website:

- HTML pages
- CSS stylesheets
- Vanilla JavaScript
- Local brand assets
- Cloudflare Worker/Pages-compatible deployment configuration

## Current runtime entry points

- `index.html` — primary single-page site
- `privacy.html` — privacy page
- `terms.html` — terms page
- `script.js` — primary interaction, mobile navigation and carousel behavior
- `worker.js` — optional `text/markdown` representation for `/`, `/privacy` and `/terms`; normal browser requests are served from the static asset layer

## Accessibility and behavior

- Keyboard-visible focus states are defined in `css/site.css`.
- The mobile navigation exposes `aria-expanded`/`aria-controls`, moves focus to its first link when opened, and returns focus to the menu button on Escape.
- `prefers-reduced-motion` is respected for smooth scrolling and carousel transition locking.

## Refactoring rule

Do not introduce a framework or restructure the application solely for cleanliness. Any future refactor must preserve the existing visual and behavioral output unless an intentional design change is being made.
