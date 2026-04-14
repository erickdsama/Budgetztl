Run the deployment checklist for **$ARGUMENTS**.

## Steps

1. If `docs/deploy/$ARGUMENTS.md` exists, read it and walk through each checklist item.
2. If it doesn't exist, run the Infra agent workflow:
   - `pnpm build` — report pass/fail
   - `pnpm lint` — report pass/fail
   - Check `.env.example` for completeness
   - Check `next.config.ts` for issues
   - Generate the checklist at `docs/deploy/$ARGUMENTS.md`
3. For each failing check, attempt to fix the issue automatically.
4. Report the final status of all checks.

If $ARGUMENTS is empty, run a general health check:
- `pnpm build`
- `pnpm lint`
- Verify all `.env.example` vars are documented
- Report overall project health
