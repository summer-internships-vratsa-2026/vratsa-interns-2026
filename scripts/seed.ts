import "../load-env";

import { eq } from "drizzle-orm";

import { groups, users } from "../src/db/schema";
import { db } from "../src/db";
import { getUserByEmail } from "../src/lib/auth/users";
import { hashPassword } from "../src/lib/password";
import { INTERNSHIP_GROUP_NAMES } from "../src/lib/teams/constants";

const DEFAULT_ADMIN_EMAIL = "emo@vratsasoftware.com";

async function seedGroups() {
  await db
    .insert(groups)
    .values(INTERNSHIP_GROUP_NAMES.map((name) => ({ name })))
    .onConflictDoNothing({ target: groups.name });

  console.log(`Ensured ${INTERNSHIP_GROUP_NAMES.length} internship groups exist.`);
}

async function seedAdminUser() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

  const [existingAdmin] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.role, "ADMIN"))
    .limit(1);

  if (existingAdmin) {
    console.log(`Admin user already exists: ${existingAdmin.email}`);
    return;
  }

  const existingUser = await getUserByEmail(adminEmail);

  if (existingUser) {
    await db
      .update(users)
      .set({
        role: "ADMIN",
        emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));

    console.log(`Promoted existing user to admin: ${adminEmail}`);
    return;
  }

  if (!adminPassword) {
    throw new Error(
      "SEED_ADMIN_PASSWORD is not set. Add it to .env.local to create the initial admin user.",
    );
  }

  const passwordHash = await hashPassword(adminPassword);

  await db.insert(users).values({
    email: adminEmail,
    passwordHash,
    name: adminName,
    role: "ADMIN",
    emailVerifiedAt: new Date(),
  });

  console.log(`Created admin user: ${adminEmail}`);
}

async function seed() {
  console.log("Seeding database...");

  await seedGroups();
  await seedAdminUser();
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
