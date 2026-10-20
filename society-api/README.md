# Garden Society API

Cloudflare Worker behind the **Garden Society** section of yvygrounds.com: members send journal
entries, project updates and compost photos (with a passcode); Yvy approves them on
`society-admin.html` and logs compost temperatures there.

- **Worker**: `src/index.js` (routes listed at the top of the file)
- **Database**: Cloudflare D1 `yvygrounds-society` (tables in `migrations/`)
- **Photos**: Workers KV namespace `yvygrounds-society-photos` (free tier, no card needed; only approved photos are public)
- **Address**: `https://api.yvygrounds.com` (set in `wrangler.jsonc` and in `js/data.js` → `society.api`)

## Secrets (never committed)

| Name | What it's for |
|---|---|
| `SOCIETY_PASSCODE` | What members type on the submit form. Share it in person; change it any time. |
| `ADMIN_PASSWORD` | What Yvy types on `society-admin.html`. Use a long one. 8 wrong tries locks it for 15 minutes. |

## First deploy

```bash
cd society-api
npm install
npx wrangler login                                  # opens a browser to sign in to Cloudflare
npx wrangler d1 create yvygrounds-society           # copy the database_id into wrangler.jsonc
npx wrangler kv namespace create yvygrounds-society-photos   # copy the id into wrangler.jsonc
npm run migrate:remote                              # creates the tables
npx wrangler secret put SOCIETY_PASSCODE            # type it when asked
npx wrangler secret put ADMIN_PASSWORD              # type it when asked
npm run deploy                                      # also sets up api.yvygrounds.com
```

To change the passcode later, run `npx wrangler secret put SOCIETY_PASSCODE` again (takes effect right away).

## Local testing

```bash
cd society-api
npm run migrate:local
npm run dev            # API on http://localhost:8787
```

Put throwaway test values in `society-api/.dev.vars` (git-ignored):

```
SOCIETY_PASSCODE=some-test-passcode
ADMIN_PASSWORD=some-test-admin-password
```

The site switches to the local API automatically when opened from `http://localhost:8080`.
