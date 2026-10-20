# Website architecture

## Current stack

The site is deliberately lightweight: static HTML, local CSS, vanilla JavaScript, brand assets, and a Cloudflare Worker using the Workers Static Assets binding.

## Runtime entry points

- `index.html` — main landing page and project sections.
- `about.html`, `contact.html`, `privacy.html`, `terms.html` — public informational/legal pages.
- `404.html` — not-found experience.
- `css/site.css`, `css/fonts.css`, `css/legal.css` — site and legal-page styling with self-hosted fonts.
- `script.js` — mobile navigation and project/capability carousels.
- `worker.js` — JSON agent view for `/?mode=agent`, Markdown content negotiation for mapped public pages (`/`, `/about`, `/contact`, `/privacy`, `/terms`), and redirects from legacy `.html` URLs.
- `_headers` and `_redirects` — Cloudflare Workers Static Assets response-header and redirect configuration.
- `llms.txt`, `robots.txt`, `sitemap.xml`, `.well-known/security.txt` — public discovery and security metadata.

The regular browser experience is served from static assets. Agent mode describes public website content and intentionally reports that no public application API or remote-action endpoint is available. Contact uses `mailto:`; there is no server-side contact API.

## Accessibility and behavior

- The landing page provides a skip link, semantic landmarks, labelled navigation, and keyboard-visible focus states.
- The mobile menu exposes `aria-expanded`/`aria-controls`, focuses the first link when opened, and returns focus to the menu button on Escape.
- Carousel controls have accessible names; reduced-motion preferences are respected.

## Refactoring rule

Do not add a framework or consolidate the layered stylesheet merely for cleanliness. Preserve the visual and behavioral output unless an intentional design change is being made, and require visual regression checks for broad CSS changes.
