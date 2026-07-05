import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mentors } from "@/db/schema";

export async function isMentorApproved(userId: string) {
  const [mentor] = await db
    .select({ approvedAt: mentors.approvedAt })
    .from(mentors)
    .where(eq(mentors.userId, userId))
    .limit(1);

  return Boolean(mentor?.approvedAt);
}

export async function approveMentor(userId: string) {
  await db
    .update(mentors)
    .set({
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mentors.userId, userId));
}
