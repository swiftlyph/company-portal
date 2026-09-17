# HANDOFF: Gasa workspace

- **Last updated:** 2026-09-18
- **Previous session:** started in `E:\Desktop\company-portal`, continuing in `E:\Desktop\gasa`
- **Location:** `E:\Desktop\gasa\company-portal\docs\tasks\HANDOFF.md`. Moved out of the gasa root on 2026-09-11 (`ai-core/08` FILE PLACEMENT RULE), so it is committed with company-portal and shared with the team.

---

## Current state

| Item | State | Pending |
|---|---|---|
| Last sync (`ai-core/08` SYNC RULE) | 2026-09-18 02:18 +08:00. company-portal `dev-dean` @ `5db5e97`, `origin/main` @ `34a7303`; gasa-api `dev-dean` @ `ecaf13d`, `origin/main` @ `7f53b6b` (PR #6 merged). Both `dev-dean` branches pushed. | Open the gasa-api follow-up PR; sync again at the next session start or by 2026-09-18 10:18 in this session |
| Working branch (`ai-core/08` BRANCH RULE) | `dev-dean` in both repos. company-portal: `dev-dean` pushed at `5db5e97`. gasa-api: `dev-dean` pushed at `ecaf13d`; PR #6 is merged into `main` at `7f53b6b`, and the lint fix is one follow-up commit ahead. merchant-portal untouched, on `main` | Q10: was merchant-portal meant too? |
| gasa-api: Company domain + employee roster | **Committed on `dev-dean` 2026-09-16: `966e1ac` (domain) + `7ffbe60` (seeders); included in PR #6, merged 2026-09-18 at `7f53b6b`** (section 4.3). Pint, Larastan and Pest pass locally (490 passed on the rerun; the only failure is the Redis-only health check) | Open the follow-up PR for `ecaf13d` |
| gasa-api: departments, employee fields, CSV import/export, per-employee allowance grants | **Built, committed and pushed 2026-09-18 on `dev-dean` as `ddc4faf`; PR #6 merged at `7f53b6b`.** The post-merge Pint failure was fixed in follow-up commit `ecaf13d`; allowance consumption in merchant checkout remains Q19 | Open a follow-up PR from `dev-dean` to `main` |
| Local environment | gasa-api `.env` (git-ignored) has the local Postgres credentials and file/sync drivers (no Redis on this machine); databases `gasa` (migrated + seeded) and `gasa_api_test` exist. Both apps ran and were smoke-tested end to end on 2026-09-16 (section 11) | None |
| company-portal: login, shell, dashboard, Employees | **Pushed 2026-09-16: `main` @ `34a7303` (3 commits: scaffold, feature, docs), GitHub's default branch; `dev-dean` pushed from the same commit** (section 7). `build`, `lint`, `test` (26), `typecheck` pass. `CLAUDE.md` added (no AI attribution, like the other repos) | New commits go on `dev-dean` and reach `main` by PR |
| company-portal: departments, employee detail page, import/export, richer form, allowance panel/grant dialog | **Built, committed and pushed 2026-09-18 on `dev-dean` as `289a5fb`** (sections 7.1 and 7.2). `lint`, `typecheck`, `test` (55) and `build` pass | New commits go on `dev-dean` and reach `main` by PR |
| Staging evidence account | `StagingCompanySeeder` (section 4.3), manual, not yet run anywhere | Run on staging after the gasa-api PR merges |
| Workspace `E:\Desktop\gasa` | Set up. We only work in company-portal and gasa-api (`ai-core/08`) | None |
| Old `E:\Desktop\company-portal` | Duplicate of `gasa/company-portal` (verified identical on 2026-09-11) | User deletes it after reopening VS Code at `E:\Desktop\gasa` |
| Merchant integration approach | Recommended (section 5) | Team and API owner sign-off |
| Jira tickets | None yet | None |

### Resume checklist (next session)

1. Load `company-portal/ai-core/00-agent.md` and the modules 01 to 08 it references.
2. Sync company-portal and gasa-api (`ai-core/08` SYNC RULE), confirm both are on `dev-dean`, then update the "Last sync" row.
3. Read this file top to bottom.
4. Run the gasa-api suite (section 11) after any gasa-api change; the local databases are ready.
5. Answer the open questions in section 9, then continue.

---

## 1. Project briefing

Gasa is an employee-benefits (allowance) system. A company grants each employee an allowance, which is a spending entitlement and NOT stored money or e-money, and employees spend it at accredited merchants. Settlement runs through Swiftly, the platform operator: the client company pays Swiftly's invoice and Swiftly pays each merchant. Gasa records the consumption and produces both sets of statements (clarified by the user 2026-09-18, section 5.1). Merchants use Gasa as a mini in-tenant POS for those transactions. The scope below is the MVP; more features will follow.

| Portal | Users | MVP scope |
|---|---|---|
| Platform / System Admin | Gasa staff | Controls companies, merchants, user management (RBAC) |
| Company | Company HR / admin | Employee CRUD + points management; pick which merchants to include/exclude; basic HRIS (payroll) |
| Merchant | Merchant owner / staff | POS, staff management (RBAC), kitchen queues, orders, inventory |
| Employee | Employees | Digital ID, wallet, transactions, pay |

- Every portal has an audit trail.
- **We own the company portal.** `gasa-api` is shared with the other teams.
- Repos that exist today: `gasa-api`, `merchant-portal`, `company-portal`. Admin and employee portal repos are not created yet.
- Task board cards for the company portal (2026-09-16): **Employee Management** (In Progress, assigned to Dean), **Merchants**, **Starter HRIS**, **Audit Trail** (Company, Employee, Merchant, Platform).

---

## 2. Workspace

```text
E:\Desktop\gasa                  local workspace only, NOT a git repo
├── company-portal/              -> github.com/swiftlyph/company-portal.git   (ours)
│   └── docs/tasks/HANDOFF.md    this file
├── gasa-api/                    -> github.com/swiftlyph/gasa-api.git         (we change it, shared with other teams)
└── merchant-portal/             -> github.com/swiftlyph/merchant-portal.git  (read-only reference)
```

Logo images that were in the gasa root (`gasa.png`, `gasa-icon.png`, `Gemini_Generated_Image_*`) are now in `E:\Desktop\archive\gasa_arch\` (as of 2026-09-11). `letter-g.png` was not found on the Desktop.

Rules (full text in `company-portal/ai-core/08-workspace-rules.md`):

- Only work in `company-portal/` and `gasa-api/`. Don't modify, install, build or run git in any other folder unless the user asks for that task.
- Every new file goes in `company-portal/`. Nothing is added to the gasa root.
- Pull both repos at session start, every 8 hours, and before branching, committing or pushing.
- Work on `dev-dean` in both repos. Never commit on `main`; `main` only moves by sync or by a merged PR.
- Never `git init` the gasa root. Run git inside each repo; each pushes/pulls to its own remote.
- Open `E:\Desktop\gasa` in VS Code; Source Control lists all 3 repos.

| Repo | Stack | Branch @ HEAD | Repo rules |
|---|---|---|---|
| gasa-api | Laravel 12, PHP ^8.2 (8.5 locally), Vite 7, Tailwind 4, PHPStan, Pest | `dev-dean` @ `ddc4faf`, pushed; `main` @ `42515dd` remains 4 commits ahead and is not merged | `CLAUDE.md`: no Co-Authored-By or AI attribution in commits; one commit per logical feature |
| merchant-portal | React 18, TypeScript 5.6, Vite 5, Tailwind 4, shadcn (`components.json`), Vitest | `main` @ `252770c` (PR #10: F11 receipt + shift report printing), checked 2026-09-11 | `CLAUDE.md`: no Co-Authored-By or AI attribution in commits; has `.claude/commands/` |
| company-portal | React 19, TypeScript ~6, Vite 8, Tailwind 4, shadcn 4 (Base UI), Turborepo 2 + npm workspaces, Vitest 4 | `main` @ `34a7303` pushed (GitHub default); `dev-dean` @ `289a5fb` pushed, ahead of `main` | `CLAUDE.md`: no Co-Authored-By or AI attribution in commits |

gasa-api remote branches: `main`, `staging` (same commit as `main`), `feat/orders-domain`, `feat/p5-admin-provisioning`, `feat/p6`, `feat/p8-permissions`, `feat/p9-shift-report-receipt`.

### 2.1 company-portal layout

Scaffolded 2026-09-11 with `npx shadcn@latest init --preset b2trRXeawq --template vite --monorepo --pointer`; app code added 2026-09-16 (section 7).

```text
company-portal/
├── ai-core/                agent rules (00 to 08)
├── docs/tasks/             HANDOFF.md (this file)
├── README.md               how to run, check, and add components
├── apps/web/               the portal; `@/` -> apps/web/src
│   ├── .env.example        VITE_API_URL=http://localhost:8001/api/v1 (copy to .env.local)
│   ├── vite.config.ts      port 5174 strictPort; Vitest (jsdom) config
│   └── src/
│       ├── app/            app.tsx, providers.tsx (QueryClient, auth boot gate), router.tsx, dashboard-layout.tsx
│       ├── components/     app-sidebar, nav-main, nav-user, theme-toggle, toaster, full-screen-loader, placeholder-page
│       ├── features/       auth/, company/, dashboard/, employees/ (api, types, hooks, pages, components, tests)
│       ├── lib/api/        client.ts (fetch wrapper), types.ts
│       └── pages/          not-found.tsx
├── packages/ui/            shared shadcn (Base UI) components + hooks + globals.css, imported as `@workspace/ui/*`
├── turbo.json              build, dev, lint, format, typecheck, test
└── package.json            npm workspaces (apps/*, packages/*)
```

| Task | Command (from `company-portal/`) |
|---|---|
| Install | `npx -y npm@11 install` (see the npm note below) |
| Dev server | `npm run dev` (http://localhost:5174, pinned) |
| Build / lint / typecheck / test | `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test` |
| Single workspace | `npm run test -w web`, `npm run lint -w web` |
| Add a shadcn component | `cd apps/web && npx shadcn@latest add <component>` (files land in `packages/ui`; move any hook the CLI writes to `apps/web/src/hooks` into `packages/ui/src/hooks`) |

**npm note (2026-09-16):** the machine's npm 10.9 crashes with `Cannot read properties of null (reading 'edgesOut')` on this tree (an arborist bug in its peer-set resolver, triggered once Vitest 4 was added). `npx -y npm@11 install` works and writes a normal lockfile; every other `npm run ...` command is fine on 10.9. Upgrading the global npm (`npm install -g npm@11`) would also fix it; not done, since it is the user's machine.

shadcn settings (`apps/web/components.json`): style `base-luma`, base color `neutral`, icons `lucide`, pointer cursor on buttons. Fonts: Manrope and Outfit. Base UI components take a `render` element where Radix took `asChild`.

---

## 3. Agent rules (`company-portal/ai-core/`)

| File | Purpose |
|---|---|
| `00-agent.md` | Entry point: module list, priority, workspace rule, ticket-state rule (`company-portal/docs/tasks/HANDOFF.md`), doc rule, output rule |
| `01-senior-dev.md` | Simple, maintainable, minimal changes; ask only when blocked |
| `02-skill-router.md` | Classify the task: planning / coding / debugging / refactoring / testing |
| `03-execution-loop.md` | Execution steps + SEEDER RULE (manual idempotent `Staging*Seeder`, users by email, never destructive) |
| `04-output-rules.md` | Concise output; EM DASH RULE (no mid-sentence em dashes, only as label separators) |
| `05-task-types.md` | Feature / bug / refactor / unknown task flows |
| `06-document-analysis.md` | Mandatory Mermaid diagrams for architecture and flows |
| `07-document-standard.md` | Doc structure: rationale, validation, risks, file impact |
| `08-workspace-rules.md` | Always active: SCOPE RULE (only company-portal + gasa-api), FILE PLACEMENT RULE (new files in company-portal), BRANCH RULE (work on `dev-dean`, never commit on `main`), SYNC RULE (sync at session start, every 8 hours, before branch/commit/push) |

Known issue: `06-document-analysis.md` is truncated. It ends inside the Mermaid example, so the code block is never closed.

---

## 4. gasa-api findings

Read-only inspection on 2026-09-10, 2026-09-11 and 2026-09-16, then the Company domain build on 2026-09-16 (section 4.3).

- **Domains:** `app/Domains/{Auth, CashSessions, Catalog, Company, Merchant, Orders, Platform, Shared}`
- **Routes per audience:** `routes/api/v1/{admin, auth, company, employee, merchant, public}.php`
- **Merchant routes:** behind `auth:sanctum` + `role:merchant` + `EnsureMerchantActive`. Tenant-scoped through the `BelongsToMerchant` global scope, so another merchant's id returns 404 (not 403). The merchant always comes from `$user->merchant()`, never from the URL.
- **Orders:** counter-service model. Payment happens at creation; there is no unpaid state.
- **`PaymentMethod` enum** (`app/Domains/Orders/Enums/PaymentMethod.php`): `cash`, `gcash`, `split`. Adding a case requires a migration widening the `orders.payment_method` CHECK constraint. `split` requires `cash_cents` + `gcash_cents` = `total_cents`.
- **No wallet/points payment exists yet.** This is the core Gasa flow, and every portal depends on it.
- **Kitchen queue:** read-only view over pending orders, polled (no websockets). Status changes only go through the order transition endpoints.
- **Checkout** is idempotent (`IdempotentCheckoutAction`, `CheckoutFingerprint`).
- **`Merchant` model:** profile fields + `status`. No mode or enabled-modules field yet.
- **Conventions that matter for us** (README "Conventions"): thin controllers, FormRequest validation, writes through Actions, Policies for authorization, output through Resources, error shape `{ message, code, errors? }`, single resources flat, paginated lists `{ data, links, meta }`, money in cents. Tests are Pest against real PostgreSQL (`gasa_api_test`), never sqlite.

### 4.1 Auth contract (read 2026-09-11)

- **Bearer tokens only.** Sanctum personal access tokens. `config/cors.php` has `supports_credentials: false` and no stateful domains; `sanctum.guard` is `[]`. Allowed origins come from the comma-separated `FRONTEND_ORIGINS` env var (default `http://localhost:5173`).
- **Login:** `POST /api/v1/auth/login` (throttled), body `{ email, password, portal }`. `portal` is one of `admin`, `company`, `employee`, `merchant`. The company portal sends `portal: "company"`, which requires role `company_admin` (`config/portals.php`).
  - `200 { token, user }` (user includes `roles`, `merchants`, and since 4.3 `company`)
  - `401 invalid_credentials`, `403 portal_forbidden`
- **Session:** `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` (revokes the current token).
- **Token lifetime:** `sanctum.expiration` is `null`, so tokens never expire server-side.

### 4.2 P10: statutory tax + beneficiary discounts (pulled 2026-09-16)

One commit, `69be9c4`, 40 files. Nothing changed on our surface. Philippine VAT and senior/PWD discounts in `config/merchant.php` + `Orders/Support/StatutoryTax.php`; `merchants.vat_registered`; `OrderBeneficiary`; tax fields on checkout/receipt/reports. New `.github/workflows/deploy.yml` deploys `main` to staging over SSH once CI passes (`migrate --force`, config/route/view cache), so a merge to `main` is a staging deploy (TICKET STATE RULE).

### 4.3 Company domain + employee roster (built 2026-09-16, `dev-dean`, pushed 2026-09-18)

Built as the Merchant domain's twin so it merges without friction (user direction 2026-09-16: "follow what gasa-api has"). README section "Company & employees" documents it in the API's own voice.

**Endpoints** (`routes/api/v1/company.php`, group `company.api` = `auth:sanctum` + `role:company_admin` + `EnsureCompanyActive`):

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/v1/company/profile` | The caller's own company, flat |
| `GET` | `/api/v1/company/employees` | Paginated `{ data, links, meta }`; `?status=`, `?search=` (name, email, employee no.), `?per_page=` ≤ 100; ordered last name, first name, id |
| `POST` | `/api/v1/company/employees` | `{ first_name, last_name, email, employee_no?, mobile?, department?, job_title?, hired_at? }` → 201 flat |
| `GET` | `/api/v1/company/employees/{employee}` | Flat |
| `PATCH` | `/api/v1/company/employees/{employee}` | Partial; same fields plus `status` (`active` \| `inactive`) |
| `DELETE` | `/api/v1/company/employees/{employee}` | Soft delete; `200 { message, code: "employee_removed" }` |
| `GET` | `/api/v1/company/whoami` | Kept, like the other portal files |

**Decisions and why:**

| Decision | Why |
|---|---|
| Company membership is `users.company_id` (FK added now), not a pivot | The column has existed since the first migration with the comment "FK to companies added in the tenancy phase"; a user belongs to exactly one company |
| `User::company()` (relation, any status) + `User::activeCompany()` (active only, memoized) | Twin of `merchants()` + `merchant()`; `/auth/me` shows a suspended company's status while tenancy and `EnsureCompanyActive` use the active-only resolver |
| `BelongsToCompany` trait mirrors `BelongsToMerchant` line for line | `BelongsToMerchant`'s docblock asked for exactly this twin |
| `EnsureCompanyActive` → `403 company_inactive` on every `/company/*` route, in the priority list before `SubstituteBindings` | Same reasoning as `EnsureMerchantActive` |
| An employee is an HR record, NOT a login: `employees.user_id` stays null | No invite system for companies yet, and the employee portal repo doesn't exist; mirrors the merchant order (profile first, team after). `has_account` is on the payload already |
| `email` and `employee_no` unique per company among non-deleted rows (Postgres partial unique indexes); email lowercased on write | The same person can be on two rosters; a rehire can reuse both values |
| Uniqueness checked in the Actions, not FormRequests: `422 employee_email_taken` / `422 employee_number_taken`, field named in `errors` | The API's rule (see `AddTeamMemberRequest`); naming the collision is safe inside the caller's own roster |
| Employees soft-delete; `DELETE` returns a 200 body | A future wallet ledger will reference them; the API never returns a bare 204 |
| `CompanyStatus` (`pending`/`active`/`suspended`) with no transition map yet; no `POST /admin/companies` | Nothing moves the status except seeders this phase; the platform-admin provisioning phase adds both, mirroring merchants |
| No permission catalog for companies | Single role (`company_admin`); `CompanyPolicy`/`EmployeePolicy` check ownership only |

**Files:** migrations `2026_09_16_000000_create_companies_table`, `000100_add_company_foreign_key_to_users_table`, `000200_create_employees_table`; `app/Domains/Company/{Enums/CompanyStatus, Enums/EmployeeStatus, Models/Company, Models/Employee, Actions/{Create,Update,Delete}EmployeeAction, Exceptions/Employee{Email,Number}Taken, Http/Middleware/EnsureCompanyActive, Http/Controllers/{CompanyProfile,Employee}Controller, Http/Requests/{Index,Store,Update}Employee(s)Request, Http/Resources/{CompanySummary,CompanyProfile,Employee}Resource, Policies/{Company,Employee}Policy}`; `app/Domains/Shared/Concerns/BelongsToCompany`; `database/factories/{Company,Employee}Factory`; `database/seeders/StagingCompanySeeder`; edits to `User`, `UserResource` (+`company`), `AuthController`/`AcceptInviteController` (eager-load `company`), `bootstrap/app.php`, `routes/api/v1/company.php`, `DevSeeder`, `README.md`; tests `tests/Feature/Company/{Profile,Employee}Test.php`, a COMPANIES block appended to `TenantLeakageTest`, `WhoamiTest` gives `company_admin` an active company.

**Seed data:** `DevSeeder` adds `company2@gasa.test` / `password` (Company Two) alongside `company@gasa.test` (Company One), both active with rosters; `employee@gasa.test` is linked to Company One's "Maria Santos" row (`has_account: true`). `StagingCompanySeeder` (manual, SEEDER RULE): `STAGING_SEED_PASSWORD='<choose>' php artisan db:seed --class=StagingCompanySeeder --force` creates `company.staging@gasa.test` (role `company_admin`, company "Staging Company", active, five employees). Idempotent by email.

**Verification status (2026-09-16):** `composer lint` (Pint) passes; `./vendor/bin/phpstan analyse --memory-limit=1G` passes with no errors (the default 128M limit crashes the parallel worker, hence the flag); `php artisan route:list --path=api/v1/company` shows the 7 routes; `php artisan migrate --seed` ran cleanly on local PostgreSQL 17 (the partial unique indexes and CHECK constraints included). `composer test`: first run **489 passed, 2 failed**, rerun **490 passed, 1 failed**; neither failure is in the Company work: `HealthTest` expects `redis: ok` and this machine has no Redis (CI runs one), and `ZReportTest`'s bounded-query-count case reported 18 vs 17 in the full run but passes in isolation both with our changes and on pristine `main` (verified by stashing the work), so it is order-dependent flakiness in that pre-existing test. Smoke-tested live (section 11): login with the `company` block, profile, employee search, `portal_forbidden` for a merchant account, CORS preflight from 5174. Local `.env` and `.env.example` also gained `http://localhost:5174` in `FRONTEND_ORIGINS`.

**Follow-ups for later phases:** employee invites into the employee portal (needs a company-side invitation table or a generalised `team_invitations`), `POST /admin/companies` + status transitions, audit log entries for company-admin actions (the Audit Trail card), a company permission catalog, `PATCH /company/profile`.

### 4.4 Departments, employee fields, CSV import/export (built 2026-09-18, `dev-dean`, pushed as `ddc4faf`)

The part of section 5.1 that needs nobody's sign-off: it makes the employee record ready for allowance targeting and offboarding without touching money. Sits on top of the two earlier commits of 4.3.

| Method | Route | Notes |
|---|---|---|
| `GET` `POST` | `/api/v1/company/departments` | Unpaginated `{ data }` with `employees_count`; `{ name }` -> 201 |
| `PATCH` `DELETE` | `/api/v1/company/departments/{department}` | Rename (employees follow); delete only when empty |
| `GET` | `/api/v1/company/employees/export` | The filtered roster as CSV (same query string as the list), streamed |
| `POST` | `/api/v1/company/employees/import` | Multipart `file` + `mode` (`preview` default, or `commit`); always a 200 per-row report |
| `GET` | `/api/v1/company/employees` | New filters `employment_type`, `department_id` |

| Decision | Why |
|---|---|
| `departments` table replaces the free-text `employees.department`; the migration turns existing text into rows per company (case-insensitive) before dropping the column | Allowance will target departments; free text gives "Finance" / "finance" / "Fin." as three groups |
| Names unique per company on `lower(name)`; `422 department_name_taken`; a department with employees can't be deleted (`422 department_in_use`) | Un-grouping people behind the caller's back would change who an allowance reaches |
| `422 invalid_department` for a `department_id` that isn't the caller's, never distinguishing "another company's" from "doesn't exist"; checked in the Actions | An `exists:` rule is not tenant-scoped, and the difference would leak |
| New fields: `middle_name`, `suffix`, `birthdate`, `employment_type` (NOT NULL, default `regular`, CHECK), `department_id`, `separated_at`; status gains `separated` | Section 5.1 |
| `status` and `separated_at` move together, decided only in `UpdateEmployeeAction`: separated always has a date (sent, else stored, else today in `config('company.day_timezone')`), anything else never has one | One place for the allowance module to hook offboarding into |
| `mobile` normalized to E.164 before validation (`Support/PhoneNumber`); numbers without a country code are read as PH mobiles; what can't be understood is rejected as typed | OTP and SMS later need a usable number |
| One rules class (`Support/EmployeeFieldRules`) for the create request, the update request and the importer | A row the form would refuse can't get in through a file |
| Import preview and commit run the SAME code in a transaction; preview rolls back. Rows are upserts (employee no., then email); a column in the file is authoritative, an absent one is untouched; `status` is never imported; bad rows are reported and skipped; each row writes in its own savepoint | A preview can't promise what a commit does differently |
| Export's first columns are the import's, so a file round-trips as `unchanged`; cells starting with `=` or `@` get an apostrophe (a leading `+` is left alone: that is a mobile number) | Spreadsheet formula injection |
| `photo_path` NOT added | It needs file storage and an upload endpoint, and nothing can show it until the Digital ID exists; ships with that feature |

**Breaking change to our own unpushed contract:** `department` on an employee is now `{ id, name } | null` plus `department_id`; `mobile` comes back normalized. No consumer exists besides our portal, which was updated in the same session.

**Verification (2026-09-18):** Pint clean; Larastan clean with no suppressions; Pest **541 passed**, with two unrelated pre-existing failures: the Redis health check and a timing-flaky Receipt query-count test; the allowance migration applied on the dev DB; smoke-tested live over HTTP: department create / duplicate / delete / in-use refusal, the new employee payload, import preview over real multipart (also typed `application/vnd.ms-excel`, what Windows browsers send) writing nothing, CSV export, seeded Maria Santos allowance read returning 150,000 cents.

**Finding for the API team (pre-existing, not ours): the "no N+1" query-count tests are timing-flaky.** `AdminMerchantListTest` "the query count is flat" failed 1 run in 3 IN ISOLATION (6 vs 7), `ZReportTest`'s count case failed once in a full run. They reuse one Sanctum token per test, and Sanctum only issues its `last_used_at` UPDATE when the clock's second has changed since the token was last used, so a measured request has one query more or fewer depending on wall-clock timing. Fix on their side: freeze time in those tests (or use a fresh token per measurement). It will randomly redden CI on any PR, including ours. `HealthTest` fails here only because this machine has no Redis.

### 4.5 Per-employee allowance grants (built 2026-09-18, `dev-dean`, pushed as `ddc4faf`)

The first usable allowance slice is implemented without putting a mutable balance or points column on `employees`.

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/v1/company/employees/{employee}/allowance` | Returns the employee's allowance purse, derived balance in cents, and the 20 latest ledger entries |
| `POST` | `/api/v1/company/employees/{employee}/allowance/grants` | `{ amount_cents, reason, idempotency_key }` -> 201; only active employees may receive a grant |

The database has company-scoped `allowance_accounts` and append-only `allowance_ledger_entries`. Grants lock the account while calculating the next balance, record the acting user, and reject reuse of an idempotency key with different details. Cross-company reads and writes resolve as 404 through the existing employee tenancy binding. DevSeeder grants Maria Santos 1,500 pesos and Ramon Villanueva 1,000 pesos. StagingCompanySeeder grants each staging employee 1,000 pesos.

The company portal's employee detail page shows the current balance and recent activity, and active employees have a Grant dialog that accepts pesos and a reason. This does not yet deduct allowance at merchant checkout, create consumption/reversal/expiry entries, or implement allowance plans and schedules. Those need the shared Orders/payment design and are tracked as Q19.

---

## 5. Merchant integration recommendation

Status: **proposed, not agreed.** Answers: "How do we onboard merchants that already have their own POS / inventory system?"

Terminology note (2026-09-18): Gasa is not e-money (section 5.1). Read "wallet" below as the employee's allowance account, and "settlement report" as the merchant payout statement that Swiftly pays (section 5.1).

### Approach

Gasa payment acceptance is the one thing every merchant uses. POS, kitchen queue, inventory and staff management become optional modules, toggled per merchant.

| Mode | For | Uses in Gasa |
|---|---|---|
| Full POS | Merchants with no system | POS, kitchen queue, orders, inventory, staff, payments |
| Pay-only | Merchants with their own POS | Payment screen, transactions, settlement report, staff, audit trail |
| API integration (phase 2) | Merchants whose POS vendor will integrate | Gasa as a payment option inside their own POS |

### Pay-only flow (MVP)

```mermaid
sequenceDiagram
    participant C as Cashier (own POS)
    participant M as Merchant portal
    participant A as gasa-api
    participant E as Employee app
    C->>C: Ring up sale in own POS
    C->>M: Enter amount + POS receipt no.
    M->>A: Create pending charge
    A-->>M: Dynamic QR for the charge
    E->>A: Scan QR and confirm
    A->>A: Check company allows merchant + wallet balance
    A-->>E: Paid, transaction recorded
    A-->>M: Paid, receipt no. stored as reference
```

- Alternative at step 5: the cashier scans the employee's QR from their Digital ID.
- Merchants reconcile against their own POS with a daily settlement report (CSV).

### Target architecture

```mermaid
flowchart TD
    A[Full POS checkout<br/>Orders domain] -->|paid by wallet| W
    B[Pay-only payment screen<br/>no order created] --> W
    C[Phase 2: external POS<br/>via Payment API] --> W
    W[Wallet payments domain<br/>charge, refund, external reference]
    W --> K{Company allows merchant?<br/>Enough balance?}
    K -->|yes| L[(Wallet ledger)]
    K -->|no| R[Reject]
    L --> S[Settlement report]
    L --> T[Audit trail]
```

### Implementation notes for gasa-api (needs API team agreement)

1. New wallet payments domain, separate from `Orders`: ledger, charges, refunds, external reference. One place for all wallet money in every mode.
2. Add a wallet case to `PaymentMethod` (plus the migration widening the CHECK constraint) so full-POS checkout can take wallet payments.
3. Every charge checks the employee's company include/exclude merchant list (managed in our company portal) and the wallet balance.
4. Add a mode or enabled-modules field on `Merchant`, set by Platform Admin at onboarding. Enforce it in the API (middleware), and have merchant-portal hide disabled screens.
5. Phase 2 Payment API: per-merchant API keys, create/refund charge, webhooks, idempotency keys (reuse the `IdempotentCheckoutAction` pattern).

### Out of scope for MVP

- Syncing menus or inventory with external systems. It creates two sources of truth and a connector to maintain per POS vendor. Gasa only needs the amount, reference and merchant.

### 5.1 Employee + allowance data model (proposed 2026-09-18, not agreed)

Asked by the user: which fields and functions should an employee have, given Gasa is an allowance system (company -> employee allowance -> merchant purchase), the physical card is undecided for the MVP, and allowance settings are NOT part of the employee module.

**Business model (clarified by the user 2026-09-18): Gasa is NOT e-money and must not drift into it.** Nobody holds a stored balance: an allowance is a spending entitlement the client company grants, employees consume it at accredited merchants, and money only moves afterwards, in arrears. **Settlement chain (user, 2026-09-18; my first reading, company -> merchant directly, was wrong): client company -> Swiftly (the platform operator, "our company") -> merchant.** Swiftly invoices each company for its employees' consumption and pays each merchant for the sales made there. Gasa authorizes purchases against the entitlement, records them, and produces both sets of statements. Rules that keep it that way: employer-funded only (no employee top-up), no transfers between employees, never redeemable for cash, usable only at accredited merchants, and unspent allowance expires. Avoid the words wallet, e-money, top-up and cash-in in code and UI. (Because Swiftly collects from companies and pays merchants, counsel should confirm the regulatory reading: whether that intermediary role needs any payment-system registration even though it is not e-money, and whether taking prepaid deposits from companies would change the answer. Engineering note, not legal advice.)

**Principle:** the employee record holds identity and eligibility only. The allowance balance lives in an allowance account + append-only ledger, allowance rules in their own module, and QR/card as payment credentials. No `balance`, `allowance_amount` or `card_no` column on `employees`. This keeps every peso explainable (same spirit as "orders are never deleted"), lets allowance rules change over time, survives lost cards, and stops the card decision from blocking the MVP.

```mermaid
flowchart TD
    C[Company] --> D[Department]
    C --> E[Employee<br/>identity + eligibility]
    D --> E
    E --> U[User account<br/>after invite]
    E --> W[Allowance account<br/>one per purse]
    W --> L[(Ledger entries<br/>append-only)]
    E --> P[Payment credential<br/>QR or card]
    C --> A[Allowance plan]
    A --> R[Allowance run]
    R -->|credit| L
    M[Merchant charge] -->|consumption after checks| L
    L --> S[Company invoice<br/>Swiftly bills the company per period]
    L --> X[Merchant payout statement<br/>Swiftly pays the merchant per period]
```

| Add to `employees` | Why |
|---|---|
| `employment_type` (regular, probationary, contractual, part_time, intern) | Allowance eligibility and amounts usually differ by type |
| `department_id` -> new company-scoped `departments` table (replaces free-text `department`) | Allowance and reports target departments; free text breaks bulk targeting |
| `separated_at` + status `separated` (so: active, inactive, separated) | Offboarding is an allowance event: it stops future grants and expires what is left. `inactive` is a pause, `separated` is terminal |
| `mobile` normalized to E.164 | OTP for activation and PIN reset, transaction SMS |
| `photo_path` | Digital ID photo: how a cashier verifies the person behind a QR or card |
| `middle_name`, `suffix`, `birthdate` (nullable) | Name on the ID, identity check on account recovery, HRIS needs them anyway |

Status 2026-09-18: every row of this table is built (section 4.4) except `photo_path`, which ships with the Digital ID.

| Not an employee field | Where it goes |
|---|---|
| Remaining allowance | `allowance_accounts` + `allowance_ledger_entries` (append-only; `amount_cents`, `balance_after_cents`, reference, idempotency key, actor; types `grant`, `consumption`, `reversal`, `expiry`, `adjustment`, and never top-up, transfer or cash-out) |
| Allowance amount and schedule | Allowances module: `allowance_plans` (amount, cadence, rollover or expire, target: all / department / employment type / individuals) + `allowance_runs` (idempotent per plan and period) |
| Card number, QR | `payment_credentials` (type `qr_dynamic` / `qr_static` / `card`, token, status active / blocked / lost / replaced) |
| Spending PIN | On the employee's user account, hashed |
| Spending limits | On the plan or company settings, optional per-employee override |
| Government IDs, salary, bank | Starter HRIS tables, encrypted; not needed for allowance |

| Employee module function | Priority |
|---|---|
| Invite / activate account (sets `user_id`), resend, revoke | MVP: no app, balance or QR without it |
| Employee detail page with a read-only money panel (balance, plan, recent credits and purchases) | MVP |
| Bulk CSV import with validation preview, upsert by employee no. or email; export | MVP: nobody types 300 employees into a dialog |
| Offboarding: separate with a date -> stop allowance, expire the remaining entitlement, block credentials | MVP |
| Departments CRUD | MVP (allowance targets them) |
| Audit entries for every employee change | MVP (Audit Trail card) |
| Credential management: issue, replace, block, report lost | Next |
| Company view of an employee's spending, limited to date, merchant and amount (no item detail; Data Privacy Act) | Next |
| Per-employee allowance override and one-off credit with a reason | Next |
| HRIS fields, org chart, cost centers, several purses | Later |

Status 2026-09-18: built are the detail page (its money panel is a placeholder until the allowance module), CSV import + export, and departments CRUD (sections 4.4, 7.1). Offboarding exists as the `separated` status with its date; stopping allowance and blocking credentials waits for those modules. Invites and audit entries are not started.

**Two calls to make early (cheap now, expensive on a live ledger):** (1) give the allowance account and ledger a `purse` dimension (`allowance` now; `salary_deduction` or separate benefit types later); (2) model QR and card as `payment_credentials` and go QR-first (dynamic QR in the app, static QR on the Digital ID for phone-less employees), so a physical card is just another credential type later.

**Recommended answers to Q15 (2026-09-18, awaiting confirmation):**

| # | Decision | Call | Why |
|---|---|---|---|
| a | Card in the MVP? | No. QR-first: dynamic QR in the employee app, static QR on the printed Digital ID + PIN for phone-less employees. Keep `payment_credentials` so a card is a later credential type | With no stored value a card is only an identifier, so it adds cost and logistics (printing, loss, replacement) without adding capability |
| b | Rollover or expire? | Expire at the end of each allowance period. Rollover later as a per-plan option | The company only pays for what was consumed, so expiry costs employees a lapsed benefit but caps the company's exposure and keeps statements simple. It is also one of the traits that keeps this away from stored value |
| c | Leftover at offboarding? | It lapses on the separation date, written as an `expiry` ledger entry | No money was ever handed over, so there is nothing to return |
| d | What may the company see? | Per transaction: date, merchant, amount, reference. Never the items | The company pays Swiftly's invoice, so it must be able to check each line of it; what someone ate is not needed for that (Data Privacy Act: state this in the employee notice) |
| e | One purse or several? | One (`allowance`) in the MVP, with the `purse` column present from day one | The likely second purse is `salary_deduction` (spend beyond the allowance, recovered through payroll), which the Starter HRIS card would consume |

**Further calls this model raises:**

- **Over the limit:** hard decline in the MVP. "Excess charged to salary" is a later, opt-in feature (second purse, capped, feeds payroll).
- **Denomination:** pesos in integer cents, as everywhere in the API. If "points" is wanted as branding keep it strictly 1 point = 1 peso, because the merchant's bill is in pesos.
- **Authorization checks on every charge:** company `active`, within its credit limit and with no invoice overdue past the grace period; employee `active`; merchant accredited by that company; remaining entitlement; per-transaction and daily caps. A suspended or over-limit company therefore stops all its employees' spending at once, which is Swiftly's protection, since Swiftly is the one paying the merchants.
- **Reversals:** a voided order writes a `reversal` entry that restores the entitlement and drops off the statement; nothing is ever edited or deleted.

**Settlement: client company -> Swiftly -> merchant (two statement layers, a core feature):**

```mermaid
flowchart TD
    P[Purchases in the period<br/>consumption entries] --> CI[Company invoice<br/>Swiftly to the company: all merchants, plus fees]
    P --> MP[Merchant payout statement<br/>Swiftly to the merchant: all companies, less commission]
    CI --> V{Company reviews lines}
    V -->|dispute a line| D[Swiftly mediates with the merchant<br/>reversal entry, credit on the next invoice]
    V -->|accept| PAY[Company pays Swiftly<br/>uploads proof]
    PAY --> CONF[Swiftly confirms receipt<br/>invoice marked paid]
    MP --> OUT[Swiftly pays the merchant on schedule<br/>marked paid with reference]
    CONF -.->|funds the float| OUT
```

- `company_invoices`: company, period, consumption total, fees, tax, amount due, status (open, issued, disputed, partially_paid, paid, overdue), issued / due / paid dates, payment proof, confirmed_by (a Swiftly admin; a company can never mark its own invoice paid).
- `merchant_payouts`: merchant, period, gross sales, commission, net payable, status (open, issued, paid), paid date, payment reference.
- Each consumption ledger entry carries `company_invoice_id` and `merchant_payout_id` once billed; a reversal after billing becomes a credit line on the next invoice and payout.
- `companies`: `credit_limit_cents`, billing cycle, payment terms (due days), fee settings. `merchants`: payout cycle, `commission_bps`. Set by a Swiftly admin.
- `company_merchants` stays: which merchants a company's employees may use (include / exclude).
- Company portal (ours): a **Billing** area: invoices, line drill-down by merchant, department and employee, dispute a line, upload payment proof, statement of account, credit-limit meter. Merchant portal: payout statements from one counterparty (Swiftly) instead of many companies. Admin portal: issue invoices and payouts, confirm receipts, overdue view, suspend.

**Calls for this chain (2026-09-18, awaiting confirmation, Q16):**

| Decision | Call | Why |
|---|---|---|
| Prepaid or post-paid companies? | Post-paid: invoice in arrears, with a per-company credit limit | Prepaid deposits mean Swiftly holds client funds, which is the direction to avoid; a credit limit controls the same risk without holding money |
| What stops a company that does not pay? | Automatic: purchases are declined when outstanding consumption reaches the credit limit, or an invoice is overdue past a grace period | Swiftly pays the merchants, so Swiftly carries each company's credit risk |
| Merchant payouts tied to collection? | Fixed schedule (for example weekly), not pay-when-paid | It is the merchant's reason to join; keep the float small with semi-monthly company invoices and conservative limits. Swiftly finance must confirm it can fund the float |
| Cycles | Company invoices semi-monthly (matches PH payroll), merchant payouts weekly | Short company cycles shrink the exposure |
| Who marks things paid? | A Swiftly admin only, on both layers; the company uploads proof, the merchant can acknowledge receipt | Separation of duties |
| Revenue model | Undecided: platform fee to the company, merchant commission, or both. The schema above supports both | Business decision for Swiftly |

Decisions: Q15 and Q16 (recommendations above, awaiting confirmation).

---

## 6. company-portal API client

Status: **implemented 2026-09-16** (no axios). `apps/web/src/lib/api/client.ts` is merchant-portal's fetch wrapper with the merchant hooks replaced by `registerOnCompanyInactive`. TanStack Query holds all server state; zustand holds the token.

Axios and Sanctum are not alternatives. Sanctum is the API's auth layer: it issues and checks the token. The frontend still needs an HTTP client to send requests with that token, and the API is Bearer-only (no XSRF cookies), so axios's Laravel perk is unused. Revisit axios only if a feature needs upload progress (for example a bulk employee CSV import with a progress bar).

### Request flow

```mermaid
sequenceDiagram
    participant U as Company admin
    participant W as apps/web
    participant A as gasa-api
    U->>W: Email + password
    W->>A: POST /auth/login {email, password, portal: "company"}
    A->>A: Check password + role company_admin
    A-->>W: 200 {token, user{company}}
    W->>W: Save token (zustand + localStorage), user in memory only
    W->>A: GET /company/employees with Bearer token
    A-->>W: 200 {data, links, meta}
    Note over W,A: Any 401 clears the token and returns to /login
    Note over W,A: A 403 company_inactive refetches /auth/me and routes to /inactive
```

---

## 7. company-portal app (built 2026-09-16, `dev-dean`, pushed 2026-09-18)

Follows merchant-portal's structure and conventions (features folder, fetch client, zustand auth store, TanStack Query, URL-driven list filters, additive-tolerant parsers), adapted to React 19 + Base UI shadcn.

```mermaid
flowchart TD
    B[Boot: token in localStorage?] -->|no| L[/login]
    B -->|yes| M[GET /auth/me]
    M -->|401| L
    M -->|ok| G{company.status active?}
    L -->|login ok| G
    G -->|no| I[/inactive: pending, suspended or no company]
    G -->|yes| S[/app shell: sidebar + breadcrumb]
    S --> D[/app/dashboard]
    S --> E[/app/employees]
    S --> P[/app/merchants, /app/hris, /app/audit-trail: placeholders]
    E --> F[Add / edit dialog]
    E --> R[Remove confirm]
```

| Route | What exists |
|---|---|
| `/login` | Email + password, `portal: "company"`; field errors, invalid-credentials and portal-forbidden messages, 60s cooldown on 429, session-expired notice |
| `/inactive` | Copy for no company / pending / suspended, log out |
| `/app/dashboard` | Company name (profile), employee totals (all, active) from the list meta, links to Employees and the coming-soon sections |
| `/app/employees` | Search (name, email, employee no.), status filter, server pagination, add/edit dialog (all fields, status on edit only), remove confirm, toasts. Filters live in the URL |
| `/app/merchants`, `/app/hris`, `/app/audit-trail` | Placeholder pages ("This section is coming soon") so the nav is complete |
| `*` | 404 |

Tests (Vitest 4 + Testing Library, 26 passing): API client, auth store, employees API parsing, employees page (list, URL filters, empty, error, add and edit dialogs).

Not done: employee detail page, CSV import, sorting controls, the three placeholder sections, a `CLAUDE.md`, a CI workflow for company-portal (merchant-portal's `.github` can be copied when the repo is first pushed).

### 7.1 Added 2026-09-18 (`dev-dean`, pushed as `289a5fb`)

| Route | What exists |
|---|---|
| `/app/employees` | Filters for department and employment type (all filters live in the URL); names link to the detail page; header actions Departments, Import, Export (downloads exactly what the filters match), Add employee |
| `/app/employees/:id` | Detail page: personal and employment cards, portal-account card, allowance balance/activity panel and grant dialog; one-click Set inactive / Reactivate / Reinstate, a dated "Mark as separated" dialog, Edit, Remove |
| `/app/employees/departments` | List with head counts (linking to the filtered roster), add, rename, delete; a department with employees explains why it can't be deleted instead of offering it |
| `/app/employees/import` | Choose a CSV -> automatic preview (summary, per-row result and errors, ignored columns) -> "Import N employees" -> result; template download |
| Employee form | Middle name, suffix, birthdate, department and employment type selects, mobile hint; status and separation date on edit |

Client: `lib/api/client.ts` now passes a `FormData` body through untouched (CSV upload) and has `api.download` (a bearer-token API can't be reached with a plain link). Tests: a URL-aware `mockApi` helper, shared fixtures and `renderPage` under `src/test/`; **53 tests** (was 26).

### 7.2 Added 2026-09-18: employee allowance panel and grant dialog

The employee detail page now fetches `GET /company/employees/{id}/allowance`, displays the derived PHP balance and recent ledger activity, and lets an active employee receive a grant through a dialog. Grant requests send amount in cents, a reason and a client-generated idempotency key. The portal shows 55 passing tests after this addition. Allowance spending at merchant checkout is not connected yet.

---

## 8. Session log

| Date | What happened |
|---|---|
| 2026-09-10 | Loaded `ai-core` rules. Received the Gasa briefing. |
| 2026-09-10 | Used the existing `E:\Desktop\gasa` folder (only logo images) as the root. Cloned `gasa-api` and `merchant-portal`. Copied `company-portal` in (copy, not move, because VS Code and the session had it open). Verified remotes. |
| 2026-09-10 | Read gasa-api domains, routes and `PaymentMethod`. Gave the merchant integration recommendation (section 5). |
| 2026-09-11 | Wrote this handoff. Seeded Claude memory for the gasa workspace path. |
| 2026-09-11 | Loaded `ai-core` rules and this handoff. Ran the shadcn init (section 2.1) in the Claude scratchpad, copied the result into company-portal without its own `.git` and `node_modules`, then ran `npm install` (0 vulnerabilities) and `npm run build` (passes). |
| 2026-09-11 | Read the gasa-api auth contract (login, portals, CORS, Sanctum) and merchant-portal's API client. Recommended no axios (section 6). |
| 2026-09-11 | User set workspace rules: only touch company-portal and gasa-api, every new file goes in company-portal, pull at session start and every 8 hours. Added `ai-core/08-workspace-rules.md`, updated `00-agent.md`, moved this file from the gasa root into `company-portal/docs/tasks/`. First pull under the new rule: gasa-api already up to date. Deleted the scratchpad scaffold copy. |
| 2026-09-16 | User reported a new gasa-api push. Pulled both repos (SYNC RULE): gasa-api `668c37e` -> `69be9c4` (P10, section 4.2); company-portal remote still empty. No files changed by us. |
| 2026-09-16 | User asked for a `dev-dean` branch on all repos as our workspace. Synced, then created and checked out local `dev-dean` in company-portal and gasa-api (not pushed). Skipped merchant-portal under the SCOPE RULE (Q10). Added the BRANCH RULE to `ai-core/08` and reworked its sync script for a workspace branch. |
| 2026-09-16 | User shared the task board and asked for the project state, at least dead links for dashboard/login/features, and to start Employee Management, following gasa-api's own patterns. Found `app/Domains/Company` empty. Read the Merchant domain end to end (tenancy, provisioning, team, tests, seeders), installed gasa-api's Composer deps, built the Company domain + employee roster (section 4.3) with Pest tests, Pint and Larastan clean. Pest not run: Postgres credentials needed (Q11). |
| 2026-09-16 | Built the company-portal app (section 7): API client, auth, shell, login, inactive screen, dashboard, Employees CRUD, placeholders, 26 Vitest tests. Hit an npm 10.9 arborist crash on install; `npx -y npm@11 install` works (section 2.1). `build`, `lint`, `typecheck`, `test` all pass. Replaced the scaffold README. |
| 2026-09-16 | Added the GASA icon (favicon, sidebar brand tile, login card). End of day: synced, committed company-portal on `main` (3 commits) and pushed `main` + `dev-dean`; added `CLAUDE.md` and `.gitattributes`. Committed gasa-api on `dev-dean` (2 commits); push denied with 403 for `dinmaku` (Q14). |
| 2026-09-16 | User supplied the local Postgres password. Set it in gasa-api `.env`, switched cache/session/queue to file/sync (no Redis), created `gasa` + `gasa_api_test`, ran `migrate --seed`, started both servers (API :8001, portal :5174) and smoke-tested login, profile, employee search, wrong-portal login and CORS. Ran the Pest suite: 489 passed, 2 failed (Redis-only health check; flaky Z-report count case, verified not ours by stashing). |
| 2026-09-18 | Synced (nothing moved). User asked what fields and functions an employee should have for an allowance system with the card still undecided. Recommendation recorded as section 5.1 (proposed): employee = identity + eligibility; wallet + ledger, allowance plans and payment credentials as separate entities; QR-first; purse dimension. Refreshed two stale lines in `ai-core/08`. No code changed. |
| 2026-09-18 | User clarified the business model: Gasa is not e-money. (I read the money flow as company -> merchant directly; WRONG, corrected in the next row.) Reworded section 5.1 (allowance account instead of wallet; ledger entry types; rules that keep it non-e-money), added the recommended answers to Q15 and the merchant statement / settlement flow, corrected the section 1 briefing sentence. No code changed. |
| 2026-09-18 | User corrected the settlement chain: client company -> Swiftly (platform operator) -> merchant, not company -> merchant directly. Rewrote the settlement part of section 5.1 as two statement layers (company invoices, merchant payouts), added the credit-limit authorization check and the calls in Q16, fixed section 1 and the section 5 note, corrected the memory. No code changed. |
| 2026-09-18 | User said go ahead on the no-sign-off part of 5.1, and asked whether gasa-api was pushed (no: checked the remote, `dev-dean` is not there, Q14). Built departments, the new employee fields, the status/separation coupling, mobile normalization, and CSV import (preview/commit) + export in gasa-api (section 4.4); built the portal's departments page, employee detail page, import screen, export, and the richer form and filters (section 7.1). Found and explained the API's timing-flaky query-count tests. Nothing committed. |
| 2026-09-18 | User asked to implement per-employee points/allowance. Built company-scoped allowance accounts and an append-only ledger, idempotent grants, read/grant API routes, local and staging fixtures, and the employee detail balance/activity panel with a grant dialog (sections 4.5 and 7.2). Focused API tests (7), portal tests (55), typecheck, lint, build, Pint and Larastan pass. Full Pest: 541 passed; two unrelated pre-existing failures remain, the local Redis health check and timing-flaky Receipt query-count test. Live smoke test: Company One's Maria Santos returns 150,000 cents. Committed and pushed as company-portal `289a5fb` and gasa-api `ddc4faf`. |
| 2026-09-18 | User asked to push both affected repos. Pushed `dev-dean` to company-portal (`289a5fb`) and gasa-api (`ddc4faf`, new remote branch). User resolved and merged gasa-api PR #6; post-merge Pint found unused imports and an extra EOF blank line in `TenantLeakageTest.php`, fixed and pushed as `ecaf13d`. |

---

## 9. Open questions and next steps

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Write section 5 up as an architecture doc with diagrams for team review? | User | Awaiting answer |
| 2 | Keep `ai-core/` in company-portal (gets pushed to that repo) or move it to the gasa root (local only)? | User | Done 2026-09-11: stays in company-portal |
| 3 | Pick the company-portal stack | User | Done 2026-09-11: shadcn Vite monorepo (section 2.1) |
| 4 | Inspect `app/Domains/Company` | Claude | Done 2026-09-16: it was empty; built in section 4.3 |
| 5 | Delete old `E:\Desktop\company-portal` | User | Pending |
| 6 | Fix the truncated `ai-core/06-document-analysis.md` | User | Optional |
| 7 | Confirm the API client approach (no axios, section 6) | User | Implemented 2026-09-16 following merchant-portal; say so if axios is still wanted |
| 8 | Pin the company-portal dev port and add it to gasa-api `FRONTEND_ORIGINS` | Claude | Done 2026-09-16: 5174 strictPort; `.env` and `.env.example` updated in gasa-api |
| 9 | First commit + push of company-portal | User | Done 2026-09-16: three commits on `main`, pushed first so it is GitHub's default; `dev-dean` pushed from the same commit; `CLAUDE.md` added with the no-AI-attribution rule |
| 10 | Was `dev-dean` meant for merchant-portal too? Skipped under the SCOPE RULE (`ai-core/08`) | User | Awaiting answer |
| 11 | Postgres credentials so `composer test` can run locally | User | Done 2026-09-16: credentials in gasa-api `.env` (git-ignored), `gasa` and `gasa_api_test` created, suite run (section 4.3) |
| 12 | gasa-api commit plan | User | Done: `966e1ac` feat(company) + `7ffbe60` chore(seed) plus `ddc4faf` employee and allowance work on `dev-dean`, no attribution lines. Branch pushed 2026-09-18; PR remains pending |
| 13 | Employee invites (portal accounts) and `POST /admin/companies`: raise with the API team as the next Company phases (section 4.3 follow-ups) | User / API team | Not started |
| 14 | `git push` to `swiftlyph/gasa-api` was denied for GitHub user `dinmaku` (HTTP 403). | User | **Resolved 2026-09-18: `dev-dean` pushed as `ddc4faf`; opening the PR remains pending** |
| 15 | Employee + allowance model (section 5.1): (a) card in the MVP, or QR-first with the card as a later credential type? (b) rollover or expire unspent allowance? (c) leftover balance at offboarding: back to the company, or spendable until a date? (d) how much of an employee's spending may the company see? (e) one purse or several from day one? | User / team | Recommendations given 2026-09-18 (section 5.1): QR-first, expire at period end, lapse at separation, transaction-level visibility without items, one purse with the column in place. Awaiting confirmation |
| 16 | Settlement chain client company -> Swiftly -> merchant (section 5.1): (a) post-paid with a credit limit, or prepaid? (b) merchant payouts on a fixed schedule, or pay-when-paid? (c) company billing and merchant payout cycles; (d) revenue model: company fee, merchant commission, or both; (e) counsel's view on Swiftly's intermediary role | User / Swiftly finance and counsel | Recommendations given 2026-09-18 (section 5.1): post-paid with a credit limit and automatic decline when over it or overdue, fixed weekly payouts, semi-monthly invoices, only a Swiftly admin marks anything paid. To be confirmed |
| 17 | Commit and push the 2026-09-18 employee-management and allowance work on `dev-dean` | User | **Done 2026-09-18: company-portal `289a5fb`; gasa-api `ddc4faf`** |
| 18 | Tell the API team their query-count ("no N+1") tests are timing-flaky and why (section 4.4); the fix is to freeze time in them | User | Not started |
| 19 | Connect allowance consumption, reversals and expiry to merchant checkout and the future allowance plans module | User / API and merchant teams | Not started; current grant and read-only ledger slice is in section 4.5 |

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| `ZReportTest`'s query-count case is flaky in a full local run (pre-existing, not ours) | A red CI run on the PR that has nothing to do with the change | Rerun; if it repeats in CI, raise it with the API team as a test-order issue |
| Two copies of company-portal until the old folder is deleted | Work done in the old folder never reaches the workspace | Only work in `E:\Desktop\gasa\company-portal`; delete the old folder |
| gasa-api is shared across teams | Breaking changes affect the merchant and other portals | Feature branches + PRs; the Company domain touches shared files only additively (`User`, `UserResource`, `bootstrap/app.php`, auth controllers) |
| `users.company_id` FK migration | Fails if any existing `users.company_id` value points at a non-existent company | The column has never been written before this phase (it was reserved), so it is null everywhere |
| Teammates push while we work | Stale code, conflicts at commit time | `ai-core/08` SYNC RULE |
| Wallet payments do not exist in the API | Company and employee features that spend points are blocked | Raise section 5 with the API team early |
| Stack differs from merchant-portal (React 19, Vite 8, TS 6, Base UI vs React 18, Vite 5, TS 5.6, Radix) | Copied code needs adapting (`render` vs `asChild`, Select `items`) | Done for everything copied so far; documented in section 2.1 |
| npm 10.9 install crash | A teammate on npm 10.9 can't `npm install` | README and section 2.1 give the `npx -y npm@11 install` workaround |
| Sanctum tokens never expire and the portal keeps them in `localStorage` | A token stolen via XSS stays valid until logout | Raise a token expiry with the API team; the 401 -> logout hook is in place |
| Production bundle is one 643 kB chunk | Slower first load | Route-level code splitting later (`React.lazy` per feature); not needed for the MVP |
| This file and `ai-core/` are committed with company-portal | Internal notes and local paths are visible to collaborators | Never put secrets, tokens or credentials in them |
| Claude memory is stored per folder path | A session in `E:\Desktop\gasa` can't see memory saved under `company-portal` | Memory seeded for the gasa path; this file is the source of truth |

---

## 11. Validation

Run from Git Bash to confirm the workspace:

```bash
cd /e/Desktop/gasa
git rev-parse --show-toplevel     # expect: fatal: not a git repository
for r in company-portal gasa-api; do
  echo "$r: $(git -C "$r" remote get-url origin) @ $(git -C "$r" branch --show-current)"
done
# expect each repo on github.com/swiftlyph/<repo>.git, both on dev-dean
```

gasa-api (needs `.env` with a working Postgres connection for the last line):

```bash
cd /e/Desktop/gasa/gasa-api
composer lint                                        # Pint: passed
./vendor/bin/phpstan analyse --memory-limit=1G       # [OK] No errors
php artisan route:list --path=api/v1/company         # 15 routes
composer test                                        # Pest: 541 passed on 2026-09-18 (HealthTest needs Redis; a query-count test may flake, section 4.4)
```

company-portal:

```bash
cd /e/Desktop/gasa/company-portal
npx -y npm@11 install
npm run typecheck && npm run lint && npm run test && npm run build
# expect: 2 typechecks clean, eslint clean, 55 tests passed, web:build successful
```

---

## 12. File impact

### 2026-09-18

| Path | Change |
|---|---|
| `gasa-api/app/Domains/Company/` | New: `Enums/EmploymentType`, `Models/Department`, `Support/{PhoneNumber, EmployeeFieldRules, EmployeeFilters, DepartmentOwnership}`, `Actions/{Create,Update,Delete}DepartmentAction`, `Actions/ImportEmployeesAction`, `Exceptions/{DepartmentNameTaken, DepartmentInUse, InvalidDepartment, InvalidImportFile}`, `Http/Controllers/{Department, EmployeeImport, EmployeeExport}Controller`, `Http/Requests/{SaveDepartment, ImportEmployees}Request`, `Http/Resources/DepartmentResource`, `Policies/DepartmentPolicy`. Changed: `Employee`, `Company`, `EmployeeStatus`, both employee Actions, the three employee requests, `EmployeeResource`, `EmployeeController` |
| `gasa-api/` elsewhere | `config/company.php`; migrations `2026_09_18_000000_create_departments_table` and `000100_add_employment_columns_to_employees_table`; `DepartmentFactory`, `EmployeeFactory`; `routes/api/v1/company.php`; `DevSeeder`, `StagingCompanySeeder` (departments by name); `README.md`; tests `Company/{Department, EmployeeFields, EmployeeImport}Test` new, `Company/EmployeeTest` and `TenantLeakageTest` extended |
| `company-portal/apps/web/src/` | New: `features/departments/*`, `features/employees/{import-template.ts, components/separate-employee-dialog.tsx, pages/employee-detail-page.tsx, pages/employee-import-page.tsx}`, `lib/download.ts`, `test/{mock-api.ts, render.tsx, location-probe.tsx, fixtures.ts}`, four page test files. Changed: `lib/api/client.ts`, `app/router.tsx`, the employees `types`, `api`, hooks, `format`, `errors`, form, table, status badge, remove dialog, list page, and the three rewritten test files |
| `company-portal/docs/tasks/HANDOFF.md`, `ai-core/08-workspace-rules.md` | Sections 4.4, 5.1, 7.1, Q15 to Q18; two stale lines in the rules |

| `gasa-api/app/Domains/Allowance/`, `gasa-api/database/migrations/2026_09_18_000200_create_allowance_accounts_and_ledger_entries_tables.php` | New allowance account, append-only ledger, grant action, validation, resources, controller, exceptions and schema |
| `gasa-api/routes/api/v1/company.php`, `gasa-api/app/Domains/Company/Policies/EmployeePolicy.php` | Allowance read/grant routes and company-owned employee allowance authorization |
| `gasa-api/database/seeders/DevSeeder.php`, `gasa-api/database/seeders/StagingCompanySeeder.php`, `gasa-api/tests/Feature/Company/AllowanceTest.php` | Known local/staging allowance fixtures and seven API tests |
| `company-portal/apps/web/src/features/employees/` | Allowance types, API functions, query/mutation hooks, grant dialog, balance/activity panel, formatter and tests |

2026-09-18 work is committed and pushed: company-portal `289a5fb`, gasa-api `ddc4faf`. merchant-portal unchanged (read only).

### 2026-09-16 (Employee Management)

| Path | Change |
|---|---|
| `gasa-api/` (section 4.3 file list) | Company domain, migrations, factories, seeders, tests, README; edits to `User`, `UserResource`, auth controllers, `bootstrap/app.php`, `routes/api/v1/company.php`, `DevSeeder`, `TenantLeakageTest`, `WhoamiTest`. `.env` created (git-ignored): app key, local DB credentials, file/sync drivers, `FRONTEND_ORIGINS` + 5174; `.env.example` gained 5174. Local Postgres: databases `gasa` (migrated + seeded) and `gasa_api_test` created |
| `company-portal/apps/web/` (section 7) | App code, tests, `vite.config.ts`, `vitest.setup.ts`, `.env.example`, `.env.local` (git-ignored), `index.html`, `package.json` (deps + `test` script), `tsconfig.app.json` (includes the setup file). Scaffold `App.tsx` removed |
| `company-portal/packages/ui/` | shadcn components added (input, label, card, table, dialog, alert-dialog, select, badge, dropdown-menu, sidebar, sheet, tooltip, separator, skeleton, avatar, breadcrumb, field, alert, pagination); `hooks/use-mobile.ts` moved in from the app; generated `sonner.tsx` removed (the app has its own Toaster) |
| `company-portal/` root | `README.md` rewritten; `turbo.json` + `package.json` gained `test`; `.gitignore` allows `.env.example`; `package-lock.json` regenerated by npm 11 |
| `company-portal/CLAUDE.md`, `.gitattributes` | Added: the no-AI-attribution commit rule; `* text=auto eol=lf` like gasa-api, so Windows checkouts stop warning about CRLF on every commit |
| `company-portal/asset/gasa-icon.png` (user-supplied source) -> `apps/web/public/gasa-icon.png` | Cropped to the circle, 512x512, transparent corners. Used as the favicon (`index.html`), the sidebar brand tile (`app-sidebar.tsx`) and on the login card + brand panel (`login-page.tsx`, replacing the screenshot placeholder) |
| `company-portal/docs/tasks/HANDOFF.md` | Rewritten for this session |

company-portal: committed and pushed (`main` @ `34a7303`; `dev-dean` @ `5db5e97`). gasa-api: PR #6 merged at `main` @ `7f53b6b`; follow-up lint fix `dev-dean` @ `ecaf13d` is pushed and awaits a new PR. merchant-portal unchanged (read only).

### 2026-09-16 (earlier)

| Path | Change |
|---|---|
| `gasa-api/` | Fetched + fast-forward pulled `main` to `69be9c4`; local `dev-dean` created from it |
| `company-portal` branches | Local `dev-dean` created (unborn, like `main`) |
| `company-portal/ai-core/08-workspace-rules.md` | BRANCH RULE, SYNC RULE script for the workspace branch |

### 2026-09-11

| Path | Change |
|---|---|
| `company-portal/` | shadcn Vite monorepo scaffold; `ai-core/08-workspace-rules.md` created; `00-agent.md` updated; this file moved here from the gasa root |

### 2026-09-10

| Path | Change |
|---|---|
| `E:\Desktop\gasa\gasa-api\`, `merchant-portal\` | Cloned |
| `E:\Desktop\gasa\company-portal\` | Copied from `E:\Desktop\company-portal` (includes `.git`) |
