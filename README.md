# Alpina CRM

> Lead intelligence for B2B sales teams — a client-facing demo by [Alpina Tech](https://alpina.tech).

Demo flow:

1. Landing — explains the product in under 30 seconds.
2. `/contact` — public lead-capture form, scored the moment it submits.
3. `/app` — demo workspace: inbox, pipeline kanban, analytics, role switcher (SDR / Manager / Exec).

No backend, no sign-up. Every visitor gets their own localStorage-backed sandbox.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript (strict)
- Tailwind v4 · shadcn/ui (new-york) · Radix primitives · Lucide icons
- Zustand + persist (localStorage) · Faker-generated seed (200 leads, 60 deals, 6 reps)
- Recharts · @dnd-kit (pipeline kanban) · react-hook-form + Zod
- Framer Motion (welcome tour)
- Deployed on Vercel

## Scripts

```bash
pnpm dev      # next dev (Turbopack)
pnpm build    # next build
pnpm start    # next start
pnpm lint     # eslint
```

## Routes

| Route                     | Purpose                       |
| ------------------------- | ----------------------------- |
| `/`                       | Landing                       |
| `/contact`                | Public lead form              |
| `/thank-you`              | Submission confirmation       |
| `/app` → `/app/dashboard` | Role-aware overview           |
| `/app/leads`              | Leads inbox (table + filters) |
| `/app/leads/[id]`         | Lead detail + score breakdown |
| `/app/pipeline`           | Kanban (drag to change stage) |
| `/app/pipeline/[id]`      | Deal detail                   |
| `/app/analytics/sources`  | Attribution + funnel          |
| `/app/analytics/team`     | Rep leaderboard + quota       |
| `/app/analytics/forecast` | Weighted pipeline + scenarios |
| `/app/analytics/quality`  | Score distribution + signals  |
| `/app/settings`           | Role, theme, reset, replay    |

## Deployment

Deploy to Vercel with the Vercel CLI:

```bash
vercel --prod
```

**Important:** Disable Deployment Protection for production so the demo is publicly accessible:

`Vercel → Project Settings → Deployment Protection → Vercel Authentication: Disabled`
