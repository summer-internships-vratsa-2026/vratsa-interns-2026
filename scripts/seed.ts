import "../load-env";

import { groups } from "../src/db/schema";
import { db } from "../src/db";
import { INTERNSHIP_GROUP_NAMES } from "../src/lib/teams/constants";

async function seed() {
  console.log("Seeding database...");

  await db
    .insert(groups)
    .values(INTERNSHIP_GROUP_NAMES.map((name) => ({ name })))
    .onConflictDoNothing({ target: groups.name });

  console.log(`Ensured ${INTERNSHIP_GROUP_NAMES.length} internship groups exist.`);
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
