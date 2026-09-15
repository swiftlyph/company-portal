# Execution Loop

For every task:

1. Understand goal
2. Identify affected files/components
3. Choose relevant skill
4. Execute solution
5. Seed test data — see SEEDER RULE below
6. Validate result mentally
7. Finish

Do not repeat steps unless failure occurs.

---

## SEEDER RULE

Every NEW or REVISED task that changes user-facing behavior must ship with a
seeder that puts a known test account into the exact state the feature needs,
so it can be exercised on staging immediately after deploy.

- Create a new seeder, or update the existing one for that feature/account.
- Idempotent: keyed on stable references/emails/account numbers; safe to re-run.
- Self-sufficient: resolve users by EMAIL (never hardcoded ids — ids differ per
  environment); create prerequisites if missing.
- If the feature shows documents, seed real viewable files (generate PDFs),
  not just rows — a hidden button or "Files 0" is an untestable feature.
- Isolate fixtures from an account's real history when that history changes
  the state machine (dedicated fixture records, marker-keyed).
- Demo/test seeders are MANUAL: named Staging*Seeder, never wired into
  DatabaseSeeder, run with `--class=... --force`. Document the run command in
  the seeder docblock and the deploy guide.
- Never destructive: no truncate/delete of shared data; updateOrCreate only.
