# Deployment and release verification

## Production target

- GitHub repository: `BurionStudio/burionstudio-website`
- Production branch: `main`
- Cloudflare Worker: `burionstudio-web`
- Canonical site: `https://burionstudio.com/`
- Agent mode: `https://burionstudio.com/?mode=agent`

## Verified deployment model

As of 24 November 2026, the repository has separate GitHub Pages and Cloudflare Worker deployment paths:

- GitHub Actions runs the Worker behavior tests, static-site smoke tests, and JavaScript syntax checks.
- GitHub Pages is deployed by its own workflow.
- The Cloudflare account API currently returns no Workers Builds configuration for `burionstudio-web`. Therefore, a push to `main` does **not** automatically deploy the production Worker.
- The Worker has a separate Wrangler deployment history. The latest deployment must be checked independently from the GitHub Pages workflow.

Do not treat a successful GitHub Pages build as proof that the production Worker has been updated.

## Worker release process

When a change affects `worker.js`, `wrangler.jsonc`, Worker routing, or Worker-served assets:

1. Confirm the intended commit is on `main`.
2. Run the repository checks from a trusted development environment:
   `node --test tests/worker.test.mjs tests/site-smoke.test.mjs`
   `node --check worker.js`
   `node --check script.js`
3. Deploy the Worker from an authenticated environment with the intended Cloudflare account selected, using the pinned Wrangler version:
   `npx wrangler@4.151.2 deploy`
4. In Cloudflare, confirm the new Worker version is deployed and receives 100% of production traffic.
5. Verify the homepage, `/?mode=agent`, `/llms.txt`, `/robots.txt`, canonical routes, redirects, and security headers.

A Worker version upload alone is not sufficient; verify the deployment allocation as well.

## GitHub Pages release process

For static-site changes:

1. Confirm the intended commit is on `main`.
2. Confirm the `pages build and deployment` workflow completed successfully.
3. Run the live production smoke workflow and confirm its checks passed.

If a change affects both Worker logic and static assets served by the Worker, verify both deployment paths independently.

## Rollback and safety

Do not delete the Worker, its custom domains, or the repository connection to address an isolated build failure. Investigate the failing build or deployment logs first. Change production configuration only when the change has been reviewed and can be verified after deployment.

## Future automation

A GitHub-to-Cloudflare automatic Worker deployment is not currently configured. To enable it, create a narrowly scoped Cloudflare API token and store it as a GitHub Actions repository secret named `CLOUDFLARE_API_TOKEN`. Then add a reviewed deployment workflow that runs only after the existing checks pass and uses the pinned Wrangler version. Do not commit the token, place it in workflow logs, or use a broad account-wide token.

The current repository connection does not expose GitHub Actions secret values, so the presence or absence of that secret has not been verified.
