# Deployment and release verification

## Production target

- GitHub repository: `BurionStudio/burionstudio-website`
- Production branch: `main`
- Cloudflare Worker: `burionstudio-web`
- Canonical host: `https://burionstudio.com/`
- Agent mode: `https://burionstudio.com/?mode=agent`

Cloudflare Workers Builds watches `main`. Its build command runs the Worker behavior tests, static-site smoke tests, and JavaScript syntax checks before `npx wrangler deploy`. A failed check should prevent that build from deploying. GitHub Actions runs the checks independently. GitHub Pages is a separate deployment path and its success is not evidence that the production Worker has updated.

## Release verification

For each production change:

1. Confirm the latest GitHub commit on `main` is the intended change.
2. Confirm Cloudflare Workers Builds has a build for that exact commit SHA and the build outcome is `success`.
3. Confirm Cloudflare's active production deployment routes 100% of traffic to the newly deployed version.
4. Check `https://burionstudio.com/` returns the normal homepage.
5. Check `https://burionstudio.com/?mode=agent` returns HTTP 200 with `Content-Type: application/json` and `kind: "agent-mode"`.
6. Check `https://burionstudio.com/llms.txt` and `https://burionstudio.com/robots.txt` remain accessible.

A normal HTML homepage response for `?mode=agent` means the intended Worker code is not active for that request. Do not mark the release as verified based on a GitHub Pages build alone.

## Rollback and safety

Do not delete the Worker, its custom domains, or the repository connection to address an isolated build failure. Investigate the failing build logs first. Change production configuration only when the change has been reviewed and can be verified after deployment.

## Automatic-trigger check

A low-risk documentation commit can be used to test the GitHub-to-Cloudflare trigger. Verify that Cloudflare records a build for the exact commit and advances the active production version before calling the trigger healthy.
