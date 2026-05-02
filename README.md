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
NEXTAUTH_SECRET="<fresh-long-random-secret>"
NEXTAUTH_URL="http://localhost:3000"
```

For production, set `NEXTAUTH_URL` to the exact deployed domain.

## Run

```bash
bun dev
```

## Build

```bash
bun run build
```

## Vercel

Set the project build settings to:

```text
Build command: bun run vercel-build
Install command: bun install
Output directory: .next
```
