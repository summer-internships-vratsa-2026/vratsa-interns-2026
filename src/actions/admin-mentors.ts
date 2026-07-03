"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { mentors } from "@/db/schema";
import {
  updateMentorMainGroupSchema,
  type AdminMentorActionState,
} from "@/lib/validations/admin-mentor";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function updateMentorMainGroupAction(
  locale: string,
  _prevState: AdminMentorActionState,
  formData: FormData,
): Promise<AdminMentorActionState> {
  if (!(await requireAdmin())) {
    return { error: "forbidden" };
  }

  const parsed = updateMentorMainGroupSchema.safeParse({
    mentorId: formData.get("mentorId"),
    mainGroupId: formData.get("mainGroupId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const [mentor] = await db
    .select({ id: mentors.id })
    .from(mentors)
    .where(eq(mentors.id, parsed.data.mentorId))
    .limit(1);

  if (!mentor) {
    return { error: "mentor_not_found" };
  }

  await db
    .update(mentors)
    .set({
      mainGroupId: parsed.data.mainGroupId,
      updatedAt: new Date(),
    })
    .where(eq(mentors.id, parsed.data.mentorId));

  revalidatePath(`/${locale}/dashboard/admin/mentors`);
  revalidatePath(`/${locale}/dashboard/mentor`);

  return { success: "main_group_updated" };
}
