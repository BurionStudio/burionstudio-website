# Burion Studio website

The official lightweight website for Burion Studio. Production uses static HTML, CSS, vanilla JavaScript, and a Cloudflare Worker for agent-friendly responses.

## Runtime

- `index.html` — landing page and project sections.
- `about.html`, `contact.html`, `privacy.html`, `terms.html` — public pages served on canonical extensionless routes.
- `worker.js` — `?mode=agent` JSON, Markdown content negotiation, and legacy `.html` redirects.
- `assets/`, `css/`, `script.js` — media, styling, navigation, and carousels.
- `llms.txt`, `robots.txt`, `sitemap.xml`, `.well-known/security.txt` — discovery and security metadata.

The Worker publishes only implemented capabilities. There is no public application API, account system, or server-side contact form; contact uses email.

## Quality checks

The test suite uses Node's built-in test runner and does not require third-party packages. Use Node.js 22 or newer:

```sh
node --test tests/worker.test.mjs tests/site-smoke.test.mjs
node --check worker.js
node --check script.js
```

GitHub Actions runs Worker behavior and static-site smoke tests on pushes to `main` and pull requests. Cloudflare Workers Builds runs the Node tests and syntax checks before deploying the production Worker.

## Deployment

- GitHub repository: `BurionStudio/burionstudio-website`
- Production branch: `main`
- Cloudflare Worker: `burionstudio-web`
- Canonical site: https://burionstudio.com/

GitHub Pages and Cloudflare Worker deployments are separate paths. A successful GitHub Pages run alone does not prove that the production Worker is updated. See [DEPLOYMENT.md](DEPLOYMENT.md).
