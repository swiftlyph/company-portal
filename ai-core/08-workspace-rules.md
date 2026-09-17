# Workspace Rules

Always active, in every session and every task. Overrides task-specific modules.
Only an explicit user instruction for a specific task can override it.

Workspace: `E:\Desktop\gasa` (local folder, NOT a git repo).

---

## SCOPE RULE (user, 11 Sep 2026)

We only work in:

- `company-portal/` (ours)
- `gasa-api/` (shared with other teams: feature branch + PR, never commit straight to `main`)

Every other folder (`merchant-portal/`, the gasa root, any future repo):

- Do NOT create, edit, move or delete files there.
- Do NOT run installs, builds or git commands there.
- Reading for reference is allowed (e.g. copying a pattern into company-portal).
- Work there only when the user explicitly asks for that task.

---

## FILE PLACEMENT RULE (user, 11 Sep 2026)

- Every file we add (docs, handoffs, plans, notes, scripts) goes inside `company-portal/`.
- Docs live in `company-portal/docs/`. The handoff is `company-portal/docs/tasks/HANDOFF.md`.
- `gasa-api/` only gets the API code a task needs (routes, domains, migrations, seeders, tests).
- Never add files to the gasa root.

---

## BRANCH RULE (user, 16 Sep 2026)

Our working branch in both repos is `dev-dean`.

- All commits go on `dev-dean`. Never commit on `main`.
- `main` only moves by fast-forwarding to `origin/main` (SYNC RULE) or by a PR merged on GitHub.
- gasa-api ships through a PR `dev-dean` -> `main`. CI + `deploy.yml` then deploy `main` to staging.
- company-portal: `main` is GitHub's default branch (first push 16 Sep 2026). New commits go on `dev-dean` and reach `main` by PR.
- gasa-api: `dev-dean` is not on the remote yet; the push is blocked on repo access (HANDOFF Q14).
- Ask before merging `main` into `dev-dean`.

---

## SYNC RULE (user, 11 Sep 2026)

Both repos are shared with collaborators, so sync `company-portal` and `gasa-api`:

- At the start of every session, before any other work.
- Every 8 hours when the same session or conversation keeps running.
- Before creating a branch, committing or pushing.

```bash
cd /e/Desktop/gasa
for r in company-portal gasa-api; do
  git -C "$r" fetch --prune origin
  git -C "$r" fetch origin main:main            # fast-forward local main without checking it out
  git -C "$r" pull --ff-only                    # current branch; needs an upstream
  git -C "$r" rev-list --count dev-dean..main   # > 0 means main moved ahead of dev-dean
done
```

- Fast-forward only. Never force, reset, rebase or stash to make a sync succeed.
- Expected failure: `pull --ff-only` has no upstream in gasa-api until `dev-dean` is pushed (HANDOFF Q14). Any other failure (diverged, conflicting local changes): stop and tell the user.
- When `main` is ahead of `dev-dean`, report it and ask before merging `main` into `dev-dean`.
- Record the time, each repo's branch and HEAD in the HANDOFF "Last sync" row. Before new work, check that row: if it is 8+ hours old, sync again.
