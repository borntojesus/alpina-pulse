# Deploy runbook — Alpina CRM

Production: <https://alpina-pulse.vercel.app>
GitHub: <https://github.com/borntojesus/alpina-pulse>
Vercel project: `alpinas-projects/alpina-pulse`
Dev server port (local): **4757**

---

## Before you deploy

1. Dev server running clean

   ```bash
   pnpm dev            # http://localhost:4757
   ```

2. Type-check + lint + prod build all pass

   ```bash
   pnpm exec tsc --noEmit
   pnpm lint
   pnpm build
   ```

3. Smoke-test key routes locally

   ```bash
   /usr/bin/curl -sL -o /dev/null -w "%{http_code}  %{url_effective}\n" \
     http://localhost:4757/ \
     http://localhost:4757/contact \
     http://localhost:4757/app/dashboard \
     http://localhost:4757/app/conversations \
     http://localhost:4757/app/calls \
     http://localhost:4757/app/market
   ```

   Expect all `200` (or `307` on `/app` which redirects to `/app/dashboard`).

---

## Option A — Deploy via git push (preferred, once GitHub integration is connected)

**One-time setup** (not yet done on this project — see "Connect GitHub app" below):

```bash
# Commit on a clean tree
git add -A
git commit -m "<meaningful message>"
git push origin main
# Vercel auto-builds + deploys to prod on push to main
# Preview URL on any PR
```

### Connect Vercel GitHub app (one-time)

1. Open the Vercel project: <https://vercel.com/alpinas-projects/alpina-pulse/settings/git>
2. Click **Connect Git Repository** → pick GitHub → `borntojesus/alpina-pulse`
3. If Vercel GitHub app isn't installed on the account, Vercel will prompt to install — allow on `borntojesus`
4. After connect: every push to `main` = auto-prod deploy, every PR = preview URL

---

## Option B — Deploy via Vercel CLI (what we currently use)

```bash
# From /Users/dmitroantonuk/Docs/GitHub/shad-demo

# 1. Make sure you're logged in as engineering-4636 (has access to alpinas-projects scope)
vercel whoami           # → engineering-4636

# 2. Commit whatever you want to ship — Vercel CLI packages current tree, not remote
git add -A && git commit -m "..."

# 3. Push to GitHub so prod artefact matches what's in the repo
git push origin main

# 4. Deploy to production
vercel deploy --prod --yes

# The command prints two URLs:
#   Production: https://alpina-pulse-<hash>-alpinas-projects.vercel.app
#   Aliased:    https://alpina-pulse.vercel.app  ← the canonical one
```

### Preview deploys

```bash
vercel deploy --yes     # no --prod → creates a preview URL on a throwaway subdomain
```

### Rollback

```bash
vercel deployments list
vercel rollback <deployment-url>       # promote an older deployment to production alias
```

---

## Post-deploy verification

```bash
PROD=https://alpina-pulse.vercel.app
for p in / /contact /app /app/dashboard /app/leads /app/pipeline \
         /app/conversations /app/calls /app/signals /app/sequences \
         /app/market /app/reports /app/settings /about /showcase; do
  code=$(/usr/bin/curl -sL -o /dev/null -w "%{http_code}" "$PROD$p")
  echo "$code  $p"
done
```

All should be `200`. If any returns `401`, **Deployment Protection** re-enabled itself — see next section.

---

## Deployment Protection (KEEP DISABLED for this public demo)

`Vercel Project → Settings → Deployment Protection → Vercel Authentication: Disabled (Production)`

If a team-wide policy re-enables it, add a **Protection Bypass for Automation** secret or set per-environment override:

```bash
vercel project inspect
# Use the Vercel dashboard for Deployment Protection toggles —
# CLI flags for this are inconsistent across versions.
```

---

## Environment variables

None required for the demo. Seed data generates client-side from
`src/lib/seed.ts` + `src/lib/seed-intel.ts`; persistence is localStorage.

If we add real integrations later:

```bash
vercel env add OPENAI_API_KEY production
vercel env pull .env.local                  # sync to local dev
```

---

## Common pitfalls

| Symptom                                                                    | Cause                                                                        | Fix                                                                                         |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Build fails on `Event handlers cannot be passed to Client Component props` | You put `onClick` on an element inside an SSR component                      | Mark the parent `"use client"` or move the handler out                                      |
| `Cannot find module '@/components/...'` on prod but works locally          | Case mismatch in file name vs import on a case-insensitive macOS file system | Match the file name exactly                                                                 |
| 401 on prod routes                                                         | Deployment Protection toggled back on                                        | Dashboard → Deployment Protection → disable                                                 |
| Prod shows old data but localhost fresh                                    | `SEED_VERSION` bump not shipped; user's browser has stale localStorage       | Bump `SEED_VERSION` in `src/lib/store.ts`; users hitting prod will auto-reseed on next load |
| Port 4757 in use                                                           | Another `next dev` still alive                                               | `lsof -ti:4757 \| xargs kill`                                                               |
| Vercel CLI links to wrong project                                          | Stale `.vercel/` folder                                                      | `rm -rf .vercel && vercel link --yes --project alpina-pulse --scope alpinas-projects`       |

---

## GitHub repo hygiene

There is still an **empty** `borntojesus/shad-demo` repo left over from
scaffolding. Delete it (requires `delete_repo` scope):

```bash
gh auth refresh -s delete_repo
gh repo delete borntojesus/shad-demo --yes
```

Active repo: `borntojesus/alpina-pulse` (do not touch).

---

## Versioning reminder

When you change the shape of `leads / deals / reps / conversations / calls /
signals / sequences`, bump `SEED_VERSION` in `src/lib/store.ts`:

```ts
const SEED_VERSION = 4; // was 3
```

This forces every visitor's localStorage to re-seed on next load. Without
this, users of a prior version will see broken data until they clear
storage or click **Reset demo** in settings.

---

## Release checklist copy-paste

```text
[ ] pnpm exec tsc --noEmit      clean
[ ] pnpm lint                   clean (or only warnings)
[ ] pnpm build                  clean
[ ] local smoke test passes
[ ] SEED_VERSION bumped if shape changed
[ ] git commit with meaningful message
[ ] git push origin main
[ ] vercel deploy --prod --yes  (or wait for GitHub auto-deploy)
[ ] prod smoke test — all 200
[ ] deployment-protection still OFF
```
