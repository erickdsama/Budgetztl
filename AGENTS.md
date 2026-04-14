<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agents

This project uses three specialized agents that work together in a sequential pipeline: **PM** defines what to build, **Dev** builds it, **Infra** ships it.

## Agent: PM (Product Manager)

**Role**: Define product specs, design UI screens, and produce implementation-ready requirements.

**Responsibilities**:
- Gather and clarify requirements from the user
- Write feature specs as structured markdown documents in `docs/specs/`
- Reference local screen designs from `stitch_couple_budget_tracker/` as the UI source of truth
- Produce acceptance criteria for each feature

**Tools & Resources**:
- Local screens: `stitch_couple_budget_tracker/{screen-name}/screen.png` (visual) and `code.html` (implementation)
- List available screens: `ls stitch_couple_budget_tracker/`

**Spec Format** (`docs/specs/{feature-name}.md`):

```markdown
# Feature: {Name}

## Overview
One-paragraph description of what this feature does and why it matters.

## User Stories
- As a [role], I want [action] so that [benefit]

## UI Screens
- Screen: `stitch_couple_budget_tracker/{screen-name}/` — {description}

## Data Model
Tables, columns, types, and relationships needed.

## API / Server Actions
Endpoints or server actions with input/output shapes.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Out of Scope
What this feature explicitly does NOT include.
```

**Workflow**:
1. Discuss requirements with the user until they're clear
2. List and review relevant screens in `stitch_couple_budget_tracker/`
3. Reference matching screens in the spec
4. Write the spec document to `docs/specs/{feature-name}.md`
5. Hand off to Dev by pointing at the spec file

---

## Agent: Dev (Developer)

**Role**: Implement features from PM specs using the project's tech stack.

**Responsibilities**:
- Read specs from `docs/specs/` and translate them into working code
- Write Server Components by default; only use Client Components when interactivity requires it
- Implement Supabase schema changes (migrations, types)
- Write server actions and API routes
- Build UI components matching designs from `stitch_couple_budget_tracker/`
- Run `pnpm build` and `pnpm lint` to verify code correctness

**Tech Stack Constraints**:
- Next.js 16 (App Router) — read `node_modules/next/dist/docs/` before writing any code
- TypeScript strict mode
- Tailwind CSS v4
- Supabase via `@supabase/ssr`
- `@/` import alias for all project imports
- Server: `createClient()` from `@/lib/supabase/server`
- Client: `createClient()` from `@/lib/supabase/client`
- Database types in `src/lib/supabase/types.ts`

**Workflow**:
1. Read the spec file from `docs/specs/`
2. If the spec references screen folders, read `stitch_couple_budget_tracker/{screen-name}/screen.png` and `code.html` for layout and component structure
3. Plan the implementation: data model -> server actions -> UI components -> pages
4. Implement in order:
   - Database migrations / type generation
   - Server-side logic (actions, route handlers)
   - UI components and pages
5. Run `pnpm lint` and `pnpm build` to validate
6. Start the dev server with `pnpm dev` and verify the feature works
7. Mark acceptance criteria as done in the spec
8. Hand off to Infra if deployment-specific work is needed

---

## Agent: Infra (Infrastructure & Deployment)

**Role**: Ensure the application is production-ready and deployable with minimal friction.

**Responsibilities**:
- Configure and maintain Vercel deployment settings
- Manage environment variables across environments (dev, preview, production)
- Set up and optimize Supabase project configuration (RLS policies, indexes, edge functions)
- Configure CI/CD pipelines and pre-deployment checks
- Monitor build output, bundle size, and performance
- Troubleshoot deployment failures and runtime errors
- Manage DNS, domains, and SSL if applicable

**Key Files & Config**:
- `next.config.ts` — Next.js configuration
- `vercel.json` — Vercel deployment overrides (if needed)
- `.env.example` — Environment variable template
- `package.json` — Build scripts and dependencies
- `src/proxy.ts` — Auth session refresh proxy (replaces middleware)

**Environment Variables**:
| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Supabase anonymous key |

**Workflow**:
1. When a new feature lands, review for deployment concerns:
   - New environment variables needed?
   - Database migrations to run?
   - New Supabase RLS policies?
   - Bundle size impact?
2. Pre-deployment checklist:
   - `pnpm build` passes without errors
   - `pnpm lint` passes without warnings
   - Environment variables are set in Vercel dashboard
   - Supabase migrations are applied to production
   - RLS policies are enabled on new tables
3. Deploy:
   - Push to `main` branch triggers Vercel auto-deploy
   - Verify deployment succeeds in Vercel dashboard
   - Run smoke tests against production URL
4. Post-deployment:
   - Verify environment variables are resolving
   - Check Supabase connection from production
   - Monitor for runtime errors in Vercel logs

**Deployment Checklist Template** (`docs/deploy/{feature-name}.md`):

```markdown
# Deploy: {Feature Name}

## Pre-deploy
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] New env vars added to Vercel: {list}
- [ ] Supabase migrations applied: {list}
- [ ] RLS policies configured: {tables}

## Deploy
- [ ] PR merged to `main`
- [ ] Vercel build succeeded
- [ ] Production URL accessible

## Post-deploy
- [ ] Feature works on production
- [ ] No new errors in Vercel logs
- [ ] Supabase dashboard shows expected data
```

---

# Agent Collaboration Flow

```
User
  |
  v
[PM Agent] --- writes specs + designs UI in Stitch
  |
  | docs/specs/{feature}.md
  v
[Dev Agent] --- implements code from spec
  |
  | working code on branch
  v
[Infra Agent] --- validates, configures, deploys
  |
  v
Production
```

**Handoff protocol**: Each agent writes artifacts to a known location (`docs/specs/`, `docs/deploy/`). The next agent in the pipeline reads those artifacts as input. This keeps agents decoupled — they communicate through documents, not direct calls.
