# Historical deployment proposal — superseded

This file documents an earlier deployment proposal and is retained for project history only. It is **not current operational guidance**.

## Current production configuration

- GitHub repository: `BurionStudio/burionstudio-website`
- Production branch: `main`
- Cloudflare Worker: `burionstudio-web`
- Canonical host: `https://burionstudio.com/`
- Static content is served through the Worker's `ASSETS` binding.
- Worker behavior and static-site checks run before the production `wrangler deploy` command.

## Superseded proposal items

- The former Worker name `cool-wind-2ec9` is not the current production Worker.
- The proposed `/api/contact` endpoint was not implemented. The public Contact page uses `mailto:support@burionstudio.com`.
- Do not add a server-side contact endpoint, email delivery, secrets, or spam controls as part of an unrelated maintenance change. Design and test that feature separately if it becomes a product requirement.
