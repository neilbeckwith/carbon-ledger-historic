# Carbon Ledger

[![Deploy to GitHub Pages](https://github.com/neilbeckwith/carbon-ledger-historic/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/neilbeckwith/carbon-ledger-historic/actions/workflows/deploy-pages.yml)

**Live site:** [neilbeckwith.github.io/carbon-ledger-historic](https://neilbeckwith.github.io/carbon-ledger-historic/) · **Live demo:** [Carbon Ledger](https://carbon-ledger-2026.grok.me/)

A single page that counts CO₂ in the air and the fluxes that move it between rock, vegetation, soils, cropland, the mixed layer, and the deep ocean. It runs entirely in the browser — open the live site and it starts counting, no sign-in or install needed. It integrates the 2026 annual rates into running tonne totals, and shows a reconstructed Mauna Loa concentration beside a global-mean concentration used for the atmospheric mass. The same page draws where this year’s emissions go, a compartment diagram (filterable, and clickable by box or arrow), source and sink rows, fast-cycle and slow-geology rows kept out of the books, and a chart of rounded Mauna Loa annual means from 1959 to 2025.

The page says it is not a live sensor. Between published daily means the station trace follows a seasonal curve plus the yearly trend. The tonne counters spread the annual rates evenly across the year. Rates, stocks, fluxes, the Keeling series, and the cited sources live in `src/lib/budget.ts` and in the methods footer.

## Stack

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite 8
- Tailwind CSS 4
- Recharts, imported for the Mauna Loa chart
- Nitro, deployed to Vercel on the Node.js 22 runtime (`nodejs22.x`)

Sign-in is off (`VITE_AUTH_ENABLED` is `false` in `.grok/app-env.json`). The ledger figures are computed in the browser from `src/lib/budget.ts`.

## Prerequisites

- Node.js 22. The deployed function runtime is `nodejs22.x`, and `@types/node` is `^22`. `package.json` has no `engines` field.
- npm. Dependencies are locked in `package-lock.json`.

## Scripts

`package.json` has no `start` script. Install, develop, build, and serve the production build with:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Those `scripts` entries are:

| Script | Command |
| --- | --- |
| `dev` | `node scripts/with-app-env.mjs vite dev --host 0.0.0.0 --port 8080` |
| `build` | `node scripts/with-app-env.mjs vite build && npm run db:migrate` |
| `preview` | `node scripts/with-app-env.mjs vite preview` |

`npm run dev` listens on port 8080. `npm run preview` serves the production build on `127.0.0.1:8081` (`vite.config.ts`). Vercel’s install command, from `vercel.json`, is `npm install --omit=dev --no-audit --no-fund`.

Other scripts in `package.json`:

| Script | Command |
| --- | --- |
| `build:dev` | `node scripts/with-app-env.mjs vite build --mode development` |
| `db:migrate` | `node scripts/migrate.mjs` |
| `preview:restart` | `node scripts/preview.mjs restart` |
| `preview:stop` | `node scripts/preview.mjs stop` |
| `typecheck` | `tsc --noEmit` |
| `check:auth` | `node scripts/check-auth-invariant.mjs` |
| `lint` | `eslint .` |
| `format` | `prettier --write .` |
| `test` | `node --test 'scripts/**/*.test.mjs' && node --experimental-strip-types --test src/lib/app-data/app-data.test.ts src/lib/app-data/readiness-schedule.test.ts src/lib/auth/gate-identity.test.ts src/lib/auth/sign-in-gate.test.ts src/lib/preview-path-prefix.test.ts` |

## Environment variables

Local `npm run dev` needs none of these set. `scripts/with-app-env.mjs` copies `VITE_`-prefixed string keys from `.grok/app-env.json` into the dev and build environment. That file currently names `VITE_AUTH_ENABLED`.

Names the repo reads (names only):

- `VITE_AUTH_ENABLED`
- `VITE_PUBLIC_HOSTNAME`
- `VITE_PROJECT_ID`
- `VITE_GROK_EXTENSIONS`
- `VITE_OG_SERVICE_URL`
- `VITE_STUN_URLS`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GROK_AUTH_ISSUER`
- `GROK_AUTH_CLIENT_ID`
- `GROK_AUTH_CLIENT_SECRET`
- `GROK_PROJECT_ID`
- `GROK_GATE_ORIGIN`
- `GROK_CONNECTORS_URL`
- `GROK_CONNECTOR_ACCESS_TOKEN`
- `NODE_ENV`
- `BROWSER_ALLOW_EXTERNAL_HOST`
- `BROWSER_SMOKE_TIMEOUT_MS`
- `PREVIEW_READY_TIMEOUT_MS`
- `PREVIEW_THUMBNAIL_TIMEOUT_MS`

The page takes its figures from `src/lib/budget.ts`. The names above are read by the shared auth, database, connector, and publish code, and by the preview and smoke-test scripts.

## Database

`.grok/app-env.json` sets `deploy.database` to `false`. This repo’s only SQL file is `migrations/auth/0001_auth.sql`.

`npm run build` still runs `npm run db:migrate` (`node scripts/migrate.mjs`). That script applies pending `*.sql` files that sit directly in `migrations/` to `DATABASE_URL`, each in one transaction, and records them in `_migrations`. With `DATABASE_URL` unset it skips and exits 0. It does not look in subdirectories, so `migrations/auth/0001_auth.sql` is left unapplied. A build of this tree applies no migrations.

## Project structure

```text
src/routes/index.tsx              the only route
src/routes/__root.tsx             document shell
src/components/ledger-app.tsx     counters, tables, and methods
src/components/cycle-plate.tsx    compartment diagram
src/components/keeling-chart.tsx  Mauna Loa annual-mean chart
src/lib/budget.ts                 rates, stocks, fluxes, and the series
src/styles.css
public/                           favicon and share image
migrations/auth/0001_auth.sql     auth schema; not applied by the migrator
scripts/                          env wrapper, migrator, preview, checks
server/                           deploy middleware
.grok/app-env.json                client build flags
vite.config.ts
package.json
vercel.json
```

## Author

Neil Beckwith ([neilbeckwith.net](https://neilbeckwith.net))
