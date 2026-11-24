# Deployment and release verification

## Production target

- GitHub repository: `BurionStudio/burionstudio-website`
- Production branch: `main`
- Cloudflare Worker: `burionstudio-web`
- Canonical site: `https://burionstudio.com/`
- Agent mode: `https://burionstudio.com/?mode=agent`

## Verified deployment model

As of 24 November 2026, Cloudflare Workers Builds is connected to this GitHub repository.

The verified Cloudflare configuration is:

- Git repository: `BurionStudio/burionstudio-website` (GitHub, BurionStudio)
- Production branch: `main`
- Automatic builds: enabled
- Pull request previews: enabled
- Root directory: `/`
- Production build command:
  `node --test tests/worker.test.mjs tests/site-smoke.test.mjs && node --check worker.js && node --check script.js`
- Production deploy command:
  `npx --yes wrangler@4.151.2 deploy`
- Preview deploy command:
  `npx --yes wrangler@4.151.2 versions upload`

Cloudflare runs the configured build checks, then deploys the Worker for commits on `main`. Pull requests use the preview command and do not promote the preview to production. The repository also has GitHub Actions for independent tests and a separate GitHub Pages deployment workflow.

## Worker release verification

For each Worker change:

1. Open a pull request and wait for the Cloudflare `Workers Builds: burionstudio-web` check and required GitHub Actions checks to finish.
2. Confirm the Cloudflare PR preview is successful before merging.
3. After merge, confirm Workers Builds has a successful production build for the exact `main` commit SHA.
4. Confirm Cloudflare's active production deployment routes 100% of traffic to the version produced by that build.
5. Verify the homepage, `/?mode=agent`, `/llms.txt`, `/robots.txt`, canonical routes, redirects, and security headers.

A successful GitHub Pages deployment alone does not prove that the Worker has updated. Verify the Worker build and active deployment independently.

## GitHub Pages release process

For static-site changes:

1. Confirm the intended commit is on `main`.
2. Confirm the `pages build and deployment` workflow completed successfully.
3. Confirm the live production smoke workflow passed.

If a change affects both Worker logic and static assets served by the Worker, verify the Worker and Pages paths independently.

## Rollback and safety

Do not delete the Worker, its custom domains, or the GitHub repository connection to address an isolated build failure. Investigate the failing build logs first. Change production configuration only when the change has been reviewed and can be verified after deployment.

## Maintenance notes

- Keep the Cloudflare production branch and `wrangler.jsonc` Worker name aligned with the repository.
- Keep the pinned Wrangler version in the Cloudflare deploy command intentional; review the changelog and run the full test suite before upgrading it.
- Worker Observability is not currently configured. Enable logs or traces only after choosing sampling and reviewing cost and data-retention implications.
- The GitHub Actions secret values are not exposed through the repository connector; no claim is made about unrelated repository secrets.
