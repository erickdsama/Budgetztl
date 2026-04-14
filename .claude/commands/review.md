Review the current changes for quality, security, and correctness.

## Steps

1. Run `git diff` to see all unstaged changes and `git diff --cached` for staged changes.
2. Review each changed file for:
   - **Correctness**: Does the logic do what it claims?
   - **Security**: No SQL injection, XSS, exposed secrets, missing auth checks, disabled RLS
   - **TypeScript**: No `any`, no `@ts-ignore`, proper null handling
   - **Performance**: No N+1 queries, unnecessary re-renders, or missing memoization
   - **Conventions**: Server Components by default, `@/` imports, proper Supabase client usage
3. If $ARGUMENTS is a PR number, fetch the PR with `gh pr view $ARGUMENTS --json` and review those changes instead.
4. Report findings organized by severity: **Blocking** > **Should fix** > **Nit**.
5. For blocking issues, suggest the exact fix.
