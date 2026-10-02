# Stabilization Notes — 2026-10-01

## Verified

- `index.html` is the primary single-page site and loads `script.js` as a deferred script.
- The runtime currently uses vanilla JavaScript; there is no `i18n-polish.js`, `site-polish-v2.js` or `responsive-fixes.css` dependency.
- Responsive behavior, including the mobile hero and projects carousel, is consolidated in `css/site.css` and `script.js`.
- Contact uses a client-side `mailto:` flow; there is no website-side submission endpoint.
- Privacy and Terms pages exist and use the shared brand assets/styles.
- `robots.txt` points to the public sitemap.
- Keyboard focus visibility and mobile-menu keyboard behavior have been explicitly hardened.
- Broken runtime asset references found during the October 2026 audit were corrected and re-checked against the repository asset tree.

## Follow-up refactor candidates

1. Audit the layered rules in `css/site.css` for safe consolidation only after visual regression checks.
2. Add a lightweight automated smoke-test workflow covering local asset references, key pages and basic HTML validity.
3. Review sitemap `lastmod` values whenever content changes; they should reflect actual content-change dates rather than deployment dates.
4. Keep the `text/markdown` Worker representation aligned with the visible site when meaningful content changes are made.

These are deliberately deferred until the current visual behavior is considered stable.
