import "../load-env";

import { eq } from "drizzle-orm";

import { groups, users } from "../src/db/schema";
import { db } from "../src/db";
import { createClientUser, getUserByEmail } from "../src/lib/auth/users";
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

async function seedSampleClient() {
  const clientEmail = (process.env.SEED_CLIENT_EMAIL ?? "client@example.com").toLowerCase();
  const clientPassword = process.env.SEED_CLIENT_PASSWORD;
  const clientName = process.env.SEED_CLIENT_NAME ?? "Sample Client";
  const organizationName = process.env.SEED_CLIENT_ORGANIZATION ?? "Sample Organization";

  const existingUser = await getUserByEmail(clientEmail);

  if (existingUser) {
    console.log(`Client user already exists: ${clientEmail}`);
    return;
  }

  if (!clientPassword) {
    console.log("Skipping sample client (SEED_CLIENT_PASSWORD not set).");
    return;
  }

  const passwordHash = await hashPassword(clientPassword);

  await createClientUser({
    email: clientEmail,
    passwordHash,
    name: clientName,
    organizationName,
  });

  console.log(`Created sample client: ${clientEmail}`);
}

async function seed() {
  console.log("Seeding database...");

  await seedGroups();
  await seedAdminUser();
  await seedSampleClient();
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
