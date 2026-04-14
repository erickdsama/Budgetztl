@AGENTS.md

# BudgetZTL

Personal budget management application.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database/Auth**: Supabase (via `@supabase/ssr`)
- **Deployment**: Vercel
- **Design**: Local screens in `stitch_couple_budget_tracker/` (source of truth)
- **Package Manager**: pnpm

## Project Structure

```
src/
  app/                    # Next.js App Router pages and layouts
    {feature}/
      page.tsx            # Page (Server Component by default)
      actions.ts          # Server Actions
      components/         # Feature-specific Client Components
  components/             # Shared components
  lib/
    supabase/
      client.ts           # Browser client (Client Components)
      server.ts           # Server client (Server Components, Route Handlers, Server Actions)
      middleware.ts        # Proxy session refresh helper
      types.ts            # Generated database types (run: pnpm db:types)
  proxy.ts                # Next.js proxy (auth session refresh, replaces middleware)
docs/
  specs/                  # Feature specs (written by PM agent)
  deploy/                 # Deployment checklists (written by Infra agent)
stitch_couple_budget_tracker/
  {screen-name}/
    screen.png            # Visual reference
    code.html             # HTML/CSS implementation
```

## Commands

```bash
pnpm dev          # Start dev server on port 3001 (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript type checking
pnpm check        # Full validation: lint + typecheck + build
pnpm db:types     # Generate Supabase types (requires SUPABASE_PROJECT_ID)
```

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/project:pm {feature}` | Start PM workflow — clarify requirements, reference local screens, write spec |
| `/project:dev {feature}` | Start Dev workflow — implement feature from spec |
| `/project:infra {feature}` | Start Infra workflow — deployment checklist and production readiness |
| `/project:spec {feature}` | Quick spec creation |
| `/project:deploy {feature}` | Run deployment checklist |
| `/project:review` | Review current changes for quality and security |
| `/project:visual-diff {screen}` | Compare running app vs local Stitch designs using Playwright |
| `/project:navigate` | Walk app routes with Playwright, report broken/missing pages |

## Agents

Three specialized agents work in a pipeline. See `AGENTS.md` for full definitions.

| Agent | Role | Artifacts |
|-------|------|-----------|
| **PM** | Define specs + reference local screens | `docs/specs/{feature}.md` |
| **Dev** | Implement code from specs | Source code in `src/` |
| **Infra** | Validate, configure, deploy | `docs/deploy/{feature}.md` |

**Pipeline**: `User → PM → Dev → Infra → Production`

Agent definitions live in `.claude/agents/` (pm.md, dev.md, infra.md).

## Conventions

- Use Server Components by default; only add `"use client"` when needed (hooks, interactivity)
- Use `@/` import alias for all project imports
- Supabase client usage:
  - **Server Components / Route Handlers / Server Actions**: use `createClient()` from `@/lib/supabase/server`
  - **Client Components**: use `createClient()` from `@/lib/supabase/client`
- Environment variables: copy `.env.example` to `.env.local` and fill in Supabase credentials
- Never commit `.env.local` or any file containing secrets
- All database types should be generated from Supabase and placed in `src/lib/supabase/types.ts`
- No `any` types, no `@ts-ignore` — fix the type instead
- Tailwind CSS v4 only — no CSS modules, no styled-components
- One feature per spec — split large features into multiple specs

## Deployment

Deployed to Vercel. Environment variables must be set in the Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## UI Design Source

All screen designs live in `stitch_couple_budget_tracker/`. Each folder contains:
- `screen.png` — visual reference
- `code.html` — HTML/CSS implementation to guide component structure

**Full index**: see `docs/screen-index.md` — maps every folder to its app route and description.
