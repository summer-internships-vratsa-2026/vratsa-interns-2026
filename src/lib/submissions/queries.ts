import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { submissionComments, submissionGrades, submissions } from "@/db/schema/submissions";
import { users } from "@/db/schema/users";

export async function getSubmissionForTeamTask(teamId: string, taskGroupId: string) {
  const [submission] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.teamId, teamId), eq(submissions.taskGroupId, taskGroupId)))
    .limit(1);

  return submission ?? null;
}

export async function getSubmissionsForTeam(teamId: string) {
  return db
    .select({
      id: submissions.id,
      taskGroupId: submissions.taskGroupId,
      submittedAt: submissions.submittedAt,
      updatedAt: submissions.updatedAt,
    })
    .from(submissions)
    .where(eq(submissions.teamId, teamId));
}

export async function getSubmissionWithFeedback(teamId: string, taskGroupId: string) {
  const submission = await getSubmissionForTeamTask(teamId, taskGroupId);

  if (!submission) {
    return null;
  }

  const comments = await db
    .select({
      id: submissionComments.id,
      content: submissionComments.content,
      authorName: users.name,
      createdAt: submissionComments.createdAt,
    })
    .from(submissionComments)
    .innerJoin(users, eq(submissionComments.authorUserId, users.id))
    .where(eq(submissionComments.submissionId, submission.id))
    .orderBy(asc(submissionComments.createdAt));

  const [grade] = await db
    .select({
      id: submissionGrades.id,
      grade: submissionGrades.grade,
      gradedByName: users.name,
      updatedAt: submissionGrades.updatedAt,
    })
    .from(submissionGrades)
    .innerJoin(users, eq(submissionGrades.gradedByUserId, users.id))
    .where(eq(submissionGrades.submissionId, submission.id))
    .limit(1);

  return {
    submission,
    comments,
    grade: grade ?? null,
  };
}

export function getSubmissionStatus(
  submission: { submittedAt: Date | null } | null,
  deadline: Date,
): "not_submitted" | "submitted" | "late" {
  if (!submission || !submission.submittedAt) {
    return "not_submitted";
  }

  return submission.submittedAt <= deadline ? "submitted" : "late";
}
