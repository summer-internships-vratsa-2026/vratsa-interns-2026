import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, mentors, students } from "@/db/schema";
import type { UserRole } from "@/db/schema/enums";

type DbExecutor = Pick<typeof db, "select" | "insert">;

export async function ensureUserProfileForRole(
  userId: string,
  role: UserRole,
  organizationName?: string | null,
  executor: DbExecutor = db,
) {
  if (role === "STUDENT") {
    const [existing] = await executor
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);

    if (!existing) {
      await executor.insert(students).values({ userId });
    }
    return;
  }

  if (role === "MENTOR") {
    const [existing] = await executor
      .select({ id: mentors.id })
      .from(mentors)
      .where(eq(mentors.userId, userId))
      .limit(1);

    if (!existing) {
      await executor.insert(mentors).values({ userId });
    }
    return;
  }

  if (role === "CLIENT") {
    const [existing] = await executor
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.userId, userId))
      .limit(1);

    if (!existing) {
      await executor.insert(clients).values({
        userId,
        organizationName: organizationName ?? null,
      });
    }
  }
}
