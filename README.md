# Alpina CRM — a shadcn/ui showcase by Alpina Tech

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React 19](https://img.shields.io/badge/React-19-149eca?logo=react)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)

Live demo: [alpina-pulse.vercel.app](https://alpina-pulse.vercel.app)

## Why this exists

Alpina Tech builds production front-ends on top of shadcn/ui, Next.js, and the Vercel platform. This repository is a public showcase: a plausible B2B sales-intelligence CRM that doubles as a working reference for composition patterns, theming, charts, drag-and-drop, and role-aware navigation. It is backend-free — every visitor gets their own localStorage sandbox — so prospective clients can click through a realistic product in one sitting.

## Feature highlights

- Role-aware dashboards for SDR, Manager, and Exec personas
- Seven analytics reports: pipeline health, activity, revenue scorecard, forecast, sources, team, quality
- Drag-and-drop pipeline kanban (dnd-kit) with stage-aware deal cards
- Public lead capture at `/contact` → scored and routed to the demo inbox
- Lead Splitter workflow for triaging and assigning incoming opportunities
- Theme lab for light/dark and accent tuning across the shadcn token set
- Command palette (⌘K) for fast navigation across leads, deals, and reports — _planned_

## What's inside

29 shadcn/ui primitives live in `src/components/ui/`:

| Primitive   | Primitive     | Primitive    |
| ----------- | ------------- | ------------ |
| accordion   | dialog        | select       |
| avatar      | dropdown-menu | separator    |
| badge       | form          | sheet        |
| button      | input         | skeleton     |
| card        | label         | slider       |
| carousel    | popover       | sonner       |
| chart       | progress      | table        |
| checkbox    | scroll-area   | tabs         |
| collapsible |               | textarea     |
|             |               | toggle       |
|             |               | toggle-group |
|             |               | tooltip      |

Blocks composed on top of those primitives include the role-switching app shell, the leads data table with faceted filters, the kanban pipeline, the analytics chart suite, and the public landing marketing sections.

## Architecture

- **Framework** — Next.js 16 App Router with route groups for `(public)` and `(app)` surfaces
- **State** — Zustand with `persist` middleware (localStorage) for the demo sandbox
- **Data viz** — Recharts for report pages and KPI sparklines
- **Interaction** — dnd-kit for the pipeline kanban and lead triage
- **Motion** — Framer Motion for the welcome tour and micro-interactions
- **UI** — shadcn/ui (new-york) on Radix primitives, Lucide icons, Tailwind v4 tokens
- **Forms** — react-hook-form with Zod validation
- **Seed** — Faker-generated 200 leads, 60 deals, 6 reps

## Running locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4757](http://localhost:4757).

Useful scripts:

```bash
pnpm build    # next build
pnpm start    # next start -p 4757
pnpm lint     # eslint
```

## Deployment

Deployed to Vercel at [alpina-pulse.vercel.app](https://alpina-pulse.vercel.app). With the Vercel GitHub app connected to this repository, every push to `main` triggers a production deployment and every pull request gets a preview URL — no manual CLI step required.

If you prefer the CLI:

```bash
vercel --prod
```

Make sure Deployment Protection is disabled so the public demo is reachable without Vercel authentication:
`Vercel → Project Settings → Deployment Protection → Vercel Authentication: Disabled`.

## Routes

| Route                            | Purpose                       |
| -------------------------------- | ----------------------------- |
| `/`                              | Landing                       |
| `/about`                         | About the demo                |
| `/showcase`                      | Component and block showcase  |
| `/contact`                       | Public lead form              |
| `/thank-you`                     | Submission confirmation       |
| `/app` → `/app/dashboard`        | Role-aware overview           |
| `/app/leads`                     | Leads inbox (table + filters) |
| `/app/leads/[id]`                | Lead detail + score breakdown |
| `/app/pipeline`                  | Kanban (drag to change stage) |
| `/app/pipeline/[id]`             | Deal detail                   |
| `/app/reports/pipeline-health`   | Stage velocity + conversion   |
| `/app/reports/activity`          | Rep activity and touches      |
| `/app/reports/revenue-scorecard` | Revenue attainment            |
| `/app/reports/forecast`          | Weighted pipeline + scenarios |
| `/app/reports/sources`           | Attribution + funnel          |
| `/app/reports/team`              | Rep leaderboard + quota       |
| `/app/reports/quality`           | Score distribution + signals  |
| `/app/settings`                  | Role, theme, reset, replay    |

---

Built by [Alpina Tech](https://alpina-tech.com/shadcn-development/) — shadcn/ui and Next.js engineering for product teams.
