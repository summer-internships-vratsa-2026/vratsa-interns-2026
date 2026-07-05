import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, mentors, students, users } from "@/db/schema";
import type { UserRole } from "@/db/schema/enums";

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return user ?? null;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function getUserByVerificationToken(token: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

  return user ?? null;
}

export async function getUserByPasswordResetToken(token: string) {
  const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);

  return user ?? null;
}

export async function createUserWithProfile(input: {
  email: string;
  passwordHash: string;
  name: string;
  role: Extract<UserRole, "STUDENT" | "MENTOR">;
  verificationToken: string;
  verificationExpiresAt: Date;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        name: input.name,
        role: input.role,
        emailVerificationToken: input.verificationToken,
        emailVerificationTokenExpiresAt: input.verificationExpiresAt,
      })
      .returning();

    if (input.role === "STUDENT") {
      await tx.insert(students).values({ userId: user.id });
    }

    if (input.role === "MENTOR") {
      await tx.insert(mentors).values({ userId: user.id });
    }

    return user;
  });
}

export async function createClientUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  organizationName?: string | null;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        name: input.name,
        role: "CLIENT",
        emailVerifiedAt: new Date(),
      })
      .returning();

    await tx.insert(clients).values({
      userId: user.id,
      organizationName: input.organizationName ?? null,
    });

    return user;
  });
}

export async function markEmailVerified(userId: string) {
  await db
    .update(users)
    .set({
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function setPasswordResetToken(userId: string, token: string, expiresAt: Date) {
  await db
    .update(users)
    .set({
      passwordResetToken: token,
      passwordResetTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function resetUserPassword(userId: string, passwordHash: string) {
  await db
    .update(users)
    .set({
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function resendVerificationToken(userId: string, token: string, expiresAt: Date) {
  await db
    .update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
