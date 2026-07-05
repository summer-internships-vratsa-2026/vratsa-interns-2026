import "../load-env";

import postgres from "postgres";

import { getDatabaseUrl } from "../load-env";

const MIGRATION_HASH = "8102a2ed58074fd09627bb867d2c0ec68668d5482f67fd56e856fb562678091e";
const MIGRATION_CREATED_AT = "1783350000000";

async function main() {
  const sql = postgres(getDatabaseUrl());

  const [column] = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'mentors' AND column_name = 'approved_at'
  `;

  if (!column) {
    await sql`ALTER TABLE "mentors" ADD COLUMN "approved_at" timestamp with time zone`;
    await sql`UPDATE "mentors" SET "approved_at" = NOW() WHERE "approved_at" IS NULL`;
    console.log("Added mentors.approved_at column.");
  } else {
    console.log("mentors.approved_at already exists.");
  }

  const [migration] = await sql`
    SELECT id
    FROM drizzle.__drizzle_migrations
    WHERE hash = ${MIGRATION_HASH}
  `;

  if (!migration) {
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${MIGRATION_HASH}, ${MIGRATION_CREATED_AT})
    `;
    console.log("Recorded migration 0008 in drizzle.__drizzle_migrations.");
  } else {
    console.log("Migration 0008 already recorded.");
  }

  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
