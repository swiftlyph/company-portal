# GASA Company Portal

The company-side portal of the GASA employee-benefits platform: company
admins manage their employee roster here, and later their allowances,
merchant list, HRIS and audit trail. Talks to
[gasa-api](https://github.com/swiftlyph/gasa-api) over `/api/v1/company/*`
with a Sanctum bearer token, the same way merchant-portal does.

## Layout

```
apps/web/        the portal (React 19, Vite 8, TanStack Query, zustand, react-router 7)
packages/ui/     shared shadcn (Base UI) components + globals.css, imported as @workspace/ui/*
ai-core/         working rules for the AI agent that helps on this repo
docs/tasks/      HANDOFF.md, the session-to-session state of the work
```

`apps/web/src` follows merchant-portal's shape: `app/` (router, providers,
layout), `components/` (shell pieces), `features/<feature>/` (api, types,
hooks, pages, components), `lib/api/` (the fetch client).

## Run it

```bash
npx -y npm@11 install   # npm 10.9 crashes on this tree (arborist "edgesOut" bug); 11 is fine, and every other npm command works on 10.9
cp apps/web/.env.example apps/web/.env.local   # VITE_API_URL, defaults to http://localhost:8001/api/v1
npm run dev                                    # http://localhost:5174 (pinned; add it to gasa-api's FRONTEND_ORIGINS)
```

Sign in with a `company_admin` account whose company is `active`. Locally,
gasa-api's `DevSeeder` provides `company@gasa.test` / `password`
(Company One) and `company2@gasa.test` / `password` (Company Two).

## Checks

```bash
npm run typecheck   # tsc, both workspaces
npm run lint        # eslint
npm run test        # vitest (apps/web)
npm run build       # tsc -b && vite build
```

## Adding a shadcn component

```bash
cd apps/web && npx shadcn@latest add <component>
```

Files land in `packages/ui/src/components`. Hooks the CLI writes to
`apps/web/src/hooks` belong in `packages/ui/src/hooks` (import them as
`@workspace/ui/hooks/<name>`), so the UI package stays self-contained.
