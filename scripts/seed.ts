import "dotenv/config";

import { sql } from "drizzle-orm";

import { db } from "../src/db";

async function seed() {
  console.log("Seeding database...");

  await db.execute(sql`select 1`);

  // Full seed data is added in Step 16 of the implementation plan.
  console.log("Database connection verified. No seed data yet.");
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
