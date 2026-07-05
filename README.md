This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Database setup (migrations and seed)

After creating your Vercel project and adding a production Postgres database (for example [Neon](https://neon.tech)), configure the environment variables from `.env.example` in the Vercel project settings (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, Resend keys, and so on).

Migrations and the seed script are **not** run automatically during the Vercel build. Run them once against the production database from your machine (or another environment with repo access):

1. Point `DATABASE_URL` at your production database. Either export it for the command, or temporarily set it in `.env.local`.
2. Apply all migrations:

```bash
npm run db:migrate
```

3. Seed the initial data (internship groups and the first admin user):

```bash
SEED_ADMIN_PASSWORD="your-secure-password" npm run db:seed
```

Optional seed variables (see `.env.example`):

- `SEED_ADMIN_EMAIL` — admin login email (default: `emo@vratsasoftware.com`)
- `SEED_ADMIN_NAME` — admin display name (default: `Admin`)
- `SEED_CLIENT_PASSWORD` — if set, also creates a sample client account

Example with all values inline:

```bash
DATABASE_URL="postgresql://..." npm run db:migrate

DATABASE_URL="postgresql://..." \
SEED_ADMIN_EMAIL="admin@example.com" \
SEED_ADMIN_PASSWORD="your-secure-password" \
SEED_ADMIN_NAME="Admin" \
npm run db:seed
```

Re-run `npm run db:migrate` after pulling schema changes that add new migration files. The seed script is safe to run again: it skips data that already exists.
