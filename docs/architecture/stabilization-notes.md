# Stabilization notes — updated 2026-10-20

## Verified

- The site is a static HTML/CSS/vanilla-JavaScript project deployed through the `burionstudio-web` Cloudflare Worker.
- `index.html` loads the main stylesheet and deferred `script.js`; no framework runtime is required.
- Responsive behavior, mobile hero, and project/capability carousels live in `css/site.css` and `script.js`.
- Contact uses a `mailto:` flow; no website-side form submission endpoint exists.
- Canonical public pages, privacy/terms documents, sitemap, `llms.txt`, robots policy, and `.well-known/security.txt` are part of the release surface.
- Worker behavior tests and static-site smoke tests run in GitHub Actions.
- Cloudflare Workers Builds runs the Node test suite and JavaScript syntax checks before the production deploy command.
- The live agent-mode JSON, homepage, and `llms.txt` were manually verified on 2026-10-20.

## Follow-up candidates

1. Consolidate repeated rules in `css/site.css` only after visual regression tests on representative desktop and mobile viewports.
2. Review sitemap `lastmod` only when page content changes; do not change it merely to make a deployment look fresh.
3. Keep the Markdown page mapping and `llms.txt` aligned with actual public capabilities when pages or projects change.
4. Optimize the large PNG favicon/app-icon source images in a separate asset-focused change after checking output quality and Apple touch-icon requirements.
