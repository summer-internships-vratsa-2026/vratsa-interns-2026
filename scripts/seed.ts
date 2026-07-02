import "../load-env";

import { groups } from "../src/db/schema";
import { db } from "../src/db";

const INTERNSHIP_GROUPS = ["Group 1", "Group 2", "Group 3"] as const;

async function seed() {
  console.log("Seeding database...");

  await db
    .insert(groups)
    .values(INTERNSHIP_GROUPS.map((name) => ({ name })))
    .onConflictDoNothing({ target: groups.name });

  console.log(`Ensured ${INTERNSHIP_GROUPS.length} internship groups exist.`);
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
