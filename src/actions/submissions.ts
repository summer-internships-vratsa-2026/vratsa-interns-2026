"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { submissions, taskGroups } from "@/db/schema";
import { students, teamMembers } from "@/db/schema";
import { getSubmissionForTeamTask } from "@/lib/submissions/queries";
import { canSubmitTask } from "@/lib/permissions";
import { getTeamMembershipForStudent } from "@/lib/teams/queries";
import {
  type SubmissionActionState,
  upsertSubmissionSchema,
} from "@/lib/validations/submission-form";

async function requireStudentMembership() {
  const session = await auth();

  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("forbidden");
  }

  const [studentRow] = await db
    .select()
    .from(students)
    .where(eq(students.userId, session.user.id))
    .limit(1);

  if (!studentRow) {
    throw new Error("forbidden");
  }

  const membership = await getTeamMembershipForStudent(studentRow.id);

  if (!membership) {
    throw new Error("forbidden");
  }

  return { session, student: studentRow, membership };
}

export async function upsertSubmissionAction(
  locale: string,
  taskGroupId: string,
  _prevState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "forbidden" };
  }

  if (!(await canSubmitTask(session.user.id, session.user.role, taskGroupId))) {
    return { error: "forbidden" };
  }

  let membership: Awaited<ReturnType<typeof requireStudentMembership>>["membership"];

  try {
    ({ membership } = await requireStudentMembership());
  } catch {
    return { error: "forbidden" };
  }

  const teamId = membership.team.id;

  const raw: Record<string, unknown> = {
    textReply: formData.get("textReply"),
    urlCount: formData.get("urlCount"),
  };

  const urlCount = Number(formData.get("urlCount") ?? 0);

  for (let i = 0; i < urlCount; i++) {
    raw[`url_${i}`] = formData.get(`url_${i}`);
  }

  const parsed = upsertSubmissionSchema.safeParse(raw);

  if (!parsed.success) {
    const hasUrlError = parsed.error.issues.some((issue) => issue.message === "invalid_url");
    return { error: hasUrlError ? "invalid_url" : "invalid_input", fieldError: hasUrlError ? "urls" : undefined };
  }

  const existing = await getSubmissionForTeamTask(teamId, taskGroupId);
  const now = new Date();

  if (existing) {
    await db
      .update(submissions)
      .set({
        textReply: parsed.data.textReply,
        urls: parsed.data.urls,
        submittedAt: now,
        updatedAt: now,
      })
      .where(and(eq(submissions.teamId, teamId), eq(submissions.taskGroupId, taskGroupId)));
  } else {
    await db.insert(submissions).values({
      teamId,
      taskGroupId,
      textReply: parsed.data.textReply,
      urls: parsed.data.urls,
      submittedAt: now,
    });
  }

  revalidatePath(`/${locale}/dashboard/student/tasks/${taskGroupId}`);
  revalidatePath(`/${locale}/dashboard/student/team`);

  return { success: "submission_saved" };
}

export async function withdrawSubmissionAction(
  locale: string,
  taskGroupId: string,
  _prevState: SubmissionActionState,
  _formData: FormData,
): Promise<SubmissionActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "forbidden" };
  }

  if (!(await canSubmitTask(session.user.id, session.user.role, taskGroupId))) {
    return { error: "forbidden" };
  }

  let membership: Awaited<ReturnType<typeof requireStudentMembership>>["membership"];

  try {
    ({ membership } = await requireStudentMembership());
  } catch {
    return { error: "forbidden" };
  }

  const teamId = membership.team.id;

  const [taskGroup] = await db
    .select()
    .from(taskGroups)
    .where(eq(taskGroups.id, taskGroupId))
    .limit(1);

  if (!taskGroup) {
    return { error: "forbidden" };
  }

  await db
    .update(submissions)
    .set({ submittedAt: null, updatedAt: new Date() })
    .where(and(eq(submissions.teamId, teamId), eq(submissions.taskGroupId, taskGroupId)));

  revalidatePath(`/${locale}/dashboard/student/tasks/${taskGroupId}`);
  revalidatePath(`/${locale}/dashboard/student/team`);

  return { success: "submission_withdrawn" };
}
