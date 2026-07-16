# SolFix Production Deployment

SolFix public deployments must use PostgreSQL persistence. Do not deploy Vercel with `PERSISTENCE_MODE=local-file` or `PERSISTENCE_MODE=memory`.

## Required Vercel Environment

```bash
NODE_ENV=production
PERSISTENCE_MODE=postgres
DATABASE_URL=<postgres connection string>
NEXT_PUBLIC_APP_URL=<public deployment URL>
SOLANA_MAINNET_RPC_URL=<server-side mainnet RPC URL>
SOLANA_DEVNET_RPC_URL=<server-side devnet RPC URL>
AI_PROVIDER=deterministic
ENABLE_AI_EXPLANATIONS=false
ENABLE_WALLET_ATTESTATION=true
```

Optional:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_GITHUB_URL=
NEXT_PUBLIC_EXPLORER_BASE_URL=https://explorer.solana.com
```

## Build Command

```bash
npm install
npm run db:generate
npm run build
```

`postinstall` is not required because the Vercel build command should run `npm run db:generate` before `npm run build`.

## Database Setup

1. Create a PostgreSQL database, for example Supabase or Vercel Postgres.
2. Set `DATABASE_URL` in Vercel. With the Supabase integration, copy the value of `POSTGRES_PRISMA_URL` into `DATABASE_URL`.
3. Apply migrations from a trusted workstation or CI job:

```bash
npm run db:generate
npx dotenv -e .env.production.local -- npx prisma migrate deploy
```

For Supabase, the pooled Prisma URL may not work with the migration engine. If `migrate status` or `migrate deploy` fails through the pooler, run migrations with `DATABASE_URL` temporarily set to the Supabase `POSTGRES_URL_NON_POOLING` value. Keep runtime `DATABASE_URL` mapped to `POSTGRES_PRISMA_URL`.

4. Verify `/api/readiness` returns HTTP 200 after deployment.

## Readiness Checks

`GET /api/health` reports process health and safe configuration state. It never returns credentials.

`GET /api/readiness` is stricter and returns HTTP 503 unless:

- persistence mode is `postgres`
- PostgreSQL is reachable
- devnet RPC is reachable
- mainnet RPC is reachable
- deterministic analysis is loaded

Optional AI providers do not affect readiness.

Rate limiting currently uses process memory. Configure platform-level protection before high-traffic public launch.

## Public Workflow Verification

1. Open the deployed URL.
2. Paste a real Solana transaction signature.
3. Select `mainnet-beta` or `devnet`.
4. Click `Inspect transaction`.
5. Confirm the report page shows live RPC metadata, instructions, logs, evidence, and JSON export.
6. Refresh the report URL in a new browser session.
7. Confirm `/api/readiness` remains healthy.

## Supabase And Vercel Checklist

- Supabase project: production PostgreSQL database.
- Vercel integration variables present: `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_HOST`, and Supabase public variables.
- Application runtime variable: `DATABASE_URL` must equal the Supabase `POSTGRES_PRISMA_URL` value.
- Production persistence: `PERSISTENCE_MODE=postgres`.
- Deterministic mode: `AI_PROVIDER=deterministic`; OpenAI and Anthropic keys are optional.
- Pull production env locally with `vercel env pull .env.production.local --environment=production`.
- Validate without printing values with `npm run validate:production-env` after loading the env file.
- Verify database CRUD with `npm run verify:postgres` after loading the env file.

## Rollback

1. Use Vercel's deployment history to promote the previous successful production deployment.
2. Do not run destructive Prisma reset commands against production.
3. If a migration caused the issue, create and deploy a forward-fix migration.
4. Re-run `/api/readiness` and a real transaction analysis after rollback or forward fix.

## Manual Wallet Attestation Test

Memo attestation requires a browser wallet and must be manually checked:

1. Open a persisted report.
2. Connect a devnet-capable Solana wallet.
3. Reject once and confirm the UI recovers.
4. Retry, sign, broadcast, and wait for confirmation.
5. Confirm the signature persists and the Explorer link uses `cluster=devnet`.

## Persistence Rules

- `postgres`: production mode; fails clearly if PostgreSQL is unavailable.
- `local-file`: local development only; writes `.data/solfix-reports.json`.
- `memory`: automated tests only; never use in production.

Production must never rely on Vercel filesystem writes for report persistence.
