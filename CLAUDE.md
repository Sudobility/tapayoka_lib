# tapayoka_lib

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it. Do not use feature branches; stay on the
> current branch.

`@sudobility/tapayoka_lib` — shared business-logic library for the Tapayoka apps
(web + React Native vendor/buyer). ESM-only (`"type": "module"`). Published to
**GitHub Packages** (not public npm): CI uses `publish-target: github`, and
`.npmrc` scopes `@sudobility` → `https://npm.pkg.github.com`.

## Stack

TypeScript (strict), React hooks, Zustand (stores), `@tanstack/react-query` via
`@sudobility/tapayoka_client`. Built with `tsc`; tested with Vitest; linted with
ESLint flat config + Prettier. Package manager: **bun**.

## Commands

```bash
bun run build        # tsc -p tsconfig.build.json, then scripts/fix-esm-imports.mjs
bun run typecheck    # tsc --noEmit
bun run lint         # eslint src
bun run test:unit    # vitest run   (NOTE: there is no `test` script)
bun run format       # prettier --write src/**/*.ts
```

Combined check: `bun run build && bun run typecheck && bun run lint && bun run test:unit`

## Architecture

Three layers, all re-exported from `src/business/index.ts` (and `src/index.ts`):

1. **Stores** (`src/business/stores/`) — Zustand caches: devices, device slots,
   offerings, models, locations, orders, analytics.
2. **Manager hooks** (`src/business/hooks/`) — wrap a `tapayoka_client` hook + a
   store for entity-scoped caching. Pattern: fetch via client hook → sync into
   store → return `store.isLoaded ? store.data : hook.data`; reset the store when
   `entitySlug` changes; expose create/update/delete that keep the store in sync.
3. **Pure domain helpers** — no React/network deps: `pricing/`, `slots/`,
   `wallet/`, and flat files `currency`, `cards`, `deeplink`, `locations`,
   `models`, `offerings`, `orders`, `schedule`.

Two entry points: `.` (everything) and `./derived` (back-compat re-export of
`@sudobility/tapayoka_types`; derived logic now lives there, not here).

## Conventions & gotchas

- Peer deps (not bundled): `@sudobility/tapayoka_client`, `tapayoka_types`,
  `@sudobility/types`, `react`, `@tanstack/react-query`, `zustand`. `bun install`
  needs the GitHub Packages registry + a `read:packages` token.
- **Build post-step is mandatory.** `moduleResolution: "bundler"` makes `tsc`
  emit extensionless relative imports that Node's ESM loader rejects;
  `scripts/fix-esm-imports.mjs` rewrites them to `.js` paths. Build via
  `bun run build`, never raw `tsc`.
- Only `dist/**` is published (`files` in package.json); `dist/` is gitignored.
- Keep manager-hook `return` shape and pure helpers framework-free (web + RN
  both consume them) — no React/network code in the pure helpers.
- Two ESLint configs exist: `eslint.config.js` is the active one (flat-config
  resolution prefers `.js`); `eslint.config.mjs` is stale/unused.
