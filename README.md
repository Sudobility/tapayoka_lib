# @sudobility/tapayoka_lib

Shared business-logic library for the Tapayoka apps. It layers entity-scoped
client-side caching (Zustand stores + manager hooks over `@sudobility/tapayoka_client`)
on top of a set of pure, dependency-free domain helpers (pricing, slots, wallet,
currency, cards, deep links, locations, models, offerings, orders, schedule).
Shared so the web and React Native vendor/buyer apps apply the same product rules.

ESM-only (`"type": "module"`). Published to GitHub Packages, not the public npm registry.

## Installation

This package lives on GitHub Packages under the `@sudobility` scope, so the scope
must be pointed at that registry (this repo's `.npmrc` already does so for local
dev; consumer projects need the same line) and you must be authenticated with a
GitHub token that has `read:packages`:

```
# .npmrc
@sudobility:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_PACKAGES_READ_TOKEN}
```

```bash
bun add @sudobility/tapayoka_lib
```

Peer dependencies (provided by the consuming app, not bundled):
`@sudobility/tapayoka_client`, `@sudobility/tapayoka_types`, `@sudobility/types`,
`@tanstack/react-query` (>=5), `react` (>=18), `zustand` (>=5).

## Usage

```typescript
import { useVendorDevicesManager, useOrdersManager } from '@sudobility/tapayoka_lib';

// Manager hooks fetch via a tapayoka_client hook, sync results into a Zustand
// store, and return the cached data (falling back to live hook data until the
// store has loaded). Stores reset when the entity slug changes.
const { devices, isLoading, error, refresh, addDevice, updateDevice, deleteDevice } =
  useVendorDevicesManager(networkClient, baseUrl, entitySlug, token, offeringId);

const { orders, createOrder, processPayment, refresh } =
  useOrdersManager(networkClient, baseUrl, entitySlug, token);
```

Pure helpers are imported the same way, e.g.:

```typescript
import { formatOrderAmount, parseDeviceDeepLink, generateWalletAddress } from '@sudobility/tapayoka_lib';
```

### Entry points

- `@sudobility/tapayoka_lib` — everything (stores, manager hooks, pure helpers).
- `@sudobility/tapayoka_lib/derived` — back-compat re-export of
  `@sudobility/tapayoka_types` (derived logic moved there so the backend can share it).

## Architecture

Three layers, all re-exported from `src/business/index.ts`:

1. **Zustand stores** (`src/business/stores/`) — in-memory caches for devices,
   device slots, offerings, models, locations, orders, analytics.
2. **Manager hooks** (`src/business/hooks/`) — wrap a `tapayoka_client` hook and
   its store for entity-scoped caching: fetch via the client hook, sync into the
   store, return store data (or live data until loaded), and expose
   create/update/delete actions that keep the store in sync. Exports include
   `useVendorDevicesManager`, `useVendorAllDevicesManager`, `useOrdersManager`,
   `useAnalyticsManager`, `useVendorLocationsManager`, `useVendorModelsManager`,
   `useVendorOfferingsManager`, `useVendorDeviceSlotsManager`,
   `useOfferingPricingTiersManager`, `useOfferingScheduleManager`.
3. **Pure domain helpers** — framework-free functions with no React/network
   dependencies: `pricing/`, `slots/`, `wallet/`, plus `currency`, `cards`,
   `deeplink`, `locations`, `models`, `offerings`, `orders`, `schedule`.

## Development

```bash
bun install          # install deps (uses .npmrc / GitHub Packages registry)
bun run build        # tsc -p tsconfig.build.json, then fix-esm-imports.mjs → dist/
bun run build:watch  # tsc --watch
bun run typecheck    # tsc --noEmit
bun run lint         # eslint src
bun run format       # prettier --write src/**/*.ts
bun run test:unit    # vitest run
```

The build runs `scripts/fix-esm-imports.mjs` after `tsc`: `moduleResolution`
is `bundler`, so `tsc` emits extensionless relative imports that Node's native
ESM loader rejects. The script rewrites them to fully-qualified `.js` paths.

## Related Packages

- `@sudobility/tapayoka_client` — API/React-Query hooks (peer dependency)
- `@sudobility/tapayoka_types` — shared type definitions and derived logic
- `tapayoka_vendor_app` / `tapayoka_buyer_app_rn` — consumer apps

## License

BUSL-1.1
