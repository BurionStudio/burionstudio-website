# Deployment notes

## Cloudflare Worker

The `burionstudio-web` Worker is connected to this repository and uses `main` as its production branch. Worker code and GitHub Pages deployments are separate deployment paths; a successful Pages workflow does not prove that the Worker has been updated.

## Agent-mode smoke test

After a Worker deployment from the intended `main` commit, request:

```sh
curl -i 'https://burionstudio.com/?mode=agent'
```

Expected result: HTTP `200`, `Content-Type: application/json`, and the structured agent-view JSON. A normal homepage HTML response means the agent-mode Worker code is not active for that request and should not be marked as verified.

Also check that `https://burionstudio.com/` still serves the normal homepage and that `https://burionstudio.com/llms.txt` remains available.

## Release verification

1. Confirm the active Cloudflare production deployment points to the intended commit on `main`.
2. Confirm the build/deploy result is successful.
3. Test the agent-mode URL and the normal homepage after deployment.
4. Do not treat a GitHub Pages deployment as evidence of a Cloudflare Worker deployment.

## Automatic trigger verification

A change to this file can be used as a low-risk trigger test for the `main` branch. After pushing it, verify that Cloudflare Workers Builds records a new build for the exact commit SHA and that the production deployment advances to that commit. If no build appears, investigate the GitHub-to-Cloudflare repository grant and webhook integration; do not assume that a GitHub Pages workflow updated the Worker.
