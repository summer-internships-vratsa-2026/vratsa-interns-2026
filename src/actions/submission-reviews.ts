"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { submissionComments, submissionGrades } from "@/db/schema";
import { canCommentSubmission, canGradeSubmission } from "@/lib/permissions/mentor";
import { canAccessSubmission } from "@/lib/permissions/submission";
import { getSubmissionDetailById } from "@/lib/submissions/queries";
import {
  addSubmissionCommentSchema,
  deleteSubmissionGradeSchema,
  type SubmissionReviewActionState,
  upsertSubmissionGradeSchema,
} from "@/lib/validations/submission-review";

function revalidateSubmissionPaths(locale: string, submissionId: string, taskGroupId: string) {
  revalidatePath(`/${locale}/dashboard/mentor/submissions`);
  revalidatePath(`/${locale}/dashboard/mentor/submissions/${submissionId}`);
  revalidatePath(`/${locale}/dashboard/admin/submissions`);
  revalidatePath(`/${locale}/dashboard/admin/submissions/${submissionId}`);
  revalidatePath(`/${locale}/dashboard/client/submissions`);
  revalidatePath(`/${locale}/dashboard/client/submissions/${submissionId}`);
  revalidatePath(`/${locale}/dashboard/student/tasks/${taskGroupId}`);
}

export async function addSubmissionCommentAction(
  locale: string,
  _prevState: SubmissionReviewActionState,
  formData: FormData,
): Promise<SubmissionReviewActionState> {
  const session = await auth();

  if (!session?.user || !canCommentSubmission(session.user.role)) {
    return { error: "forbidden" };
  }

  const parsed = addSubmissionCommentSchema.safeParse({
    submissionId: formData.get("submissionId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const detail = await getSubmissionDetailById(parsed.data.submissionId);

  if (!detail) {
    return { error: "submission_not_found" };
  }

  if (!(await canAccessSubmission(session.user.id, session.user.role, detail.teamId))) {
    return { error: "forbidden" };
  }

  await db.insert(submissionComments).values({
    submissionId: parsed.data.submissionId,
    authorUserId: session.user.id,
    content: parsed.data.content,
  });

  revalidateSubmissionPaths(locale, parsed.data.submissionId, detail.taskGroupId);
  return { success: "comment_added" };
}

export async function upsertSubmissionGradeAction(
  locale: string,
  _prevState: SubmissionReviewActionState,
  formData: FormData,
): Promise<SubmissionReviewActionState> {
  const session = await auth();

  if (!session?.user || !canGradeSubmission(session.user.role)) {
    return { error: "forbidden" };
  }

  const parsed = upsertSubmissionGradeSchema.safeParse({
    submissionId: formData.get("submissionId"),
    grade: formData.get("grade"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: "invalid_grade" };
  }

  const detail = await getSubmissionDetailById(parsed.data.submissionId);

  if (!detail) {
    return { error: "submission_not_found" };
  }

  if (detail.grade && session.user.role === "MENTOR" && detail.grade.gradedByUserId !== session.user.id) {
    return { error: "cannot_edit_other_grade" };
  }

  const now = new Date();

  if (detail.grade) {
    await db
      .update(submissionGrades)
      .set({
        grade: parsed.data.grade,
        gradedByUserId: session.user.id,
        updatedAt: now,
      })
      .where(eq(submissionGrades.id, detail.grade.id));
  } else {
    await db.insert(submissionGrades).values({
      submissionId: parsed.data.submissionId,
      gradedByUserId: session.user.id,
      grade: parsed.data.grade,
    });
  }

  if (parsed.data.content) {
    await db.insert(submissionComments).values({
      submissionId: parsed.data.submissionId,
      authorUserId: session.user.id,
      content: parsed.data.content,
    });
  }

  revalidateSubmissionPaths(locale, parsed.data.submissionId, detail.taskGroupId);
  return { success: "grade_saved" };
}

export async function deleteSubmissionGradeAction(
  locale: string,
  _prevState: SubmissionReviewActionState,
  formData: FormData,
): Promise<SubmissionReviewActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "forbidden" };
  }

  const parsed = deleteSubmissionGradeSchema.safeParse({
    submissionId: formData.get("submissionId"),
  });

  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const detail = await getSubmissionDetailById(parsed.data.submissionId);

  if (!detail) {
    return { error: "submission_not_found" };
  }

  if (!detail.grade) {
    return { error: "grade_not_found" };
  }

  await db.delete(submissionGrades).where(eq(submissionGrades.id, detail.grade.id));

  revalidateSubmissionPaths(locale, parsed.data.submissionId, detail.taskGroupId);
  return { success: "grade_deleted" };
}
