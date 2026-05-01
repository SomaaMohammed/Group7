# Group 7 Web App

Next.js 16 + Prisma + PostgreSQL project.

## Setup

Use Bun:

```bash
bun install
```

Create `.env` (Prisma CLI):

```env
DATABASE_URL="postgresql://<pooler-user>:<password>@<pooler-host>:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

Create `.env.local` (runtime):

```env
DATABASE_URL="postgresql://<pooler-user>:<password>@<pooler-host>:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
AUTH_SECRET="<long-random-secret>"
AUTH_URL="http://localhost:3000"
```

## Run

```bash
bun dev
```

## Build

```bash
bun run build
```
