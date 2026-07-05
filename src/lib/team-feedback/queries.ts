import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  students,
  teamFeedback,
  teamFeedbackComments,
  teamMembers,
  users,
  type UserRole,
} from "@/db/schema";
import {
  isClientAssignedToTeam,
} from "@/lib/clients/queries";

export { getClientByUserId, getClientTeamsByUserId, isClientAssignedToTeam } from "@/lib/clients/queries";

export async function isStudentInTeamByUserId(userId: string, teamId: string) {
  const [membership] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .innerJoin(students, eq(teamMembers.studentId, students.id))
    .where(and(eq(students.userId, userId), eq(teamMembers.teamId, teamId)))
    .limit(1);

  return !!membership;
}

export async function canAccessTeamFeedback(userId: string, role: UserRole, teamId: string) {
  if (role === "ADMIN" || role === "MENTOR") {
    return true;
  }

  if (role === "STUDENT") {
    return isStudentInTeamByUserId(userId, teamId);
  }

  return isClientAssignedToTeam(userId, teamId);
}

export async function canCreateTeamFeedback(userId: string, role: UserRole, teamId: string) {
  if (role === "ADMIN" || role === "MENTOR") {
    return true;
  }

  if (role === "CLIENT") {
    return isClientAssignedToTeam(userId, teamId);
  }

  return false;
}

export async function canCommentTeamFeedback(userId: string, role: UserRole, teamId: string) {
  return canAccessTeamFeedback(userId, role, teamId);
}

export async function canMarkTeamFeedbackDone(userId: string, role: UserRole, teamId: string) {
  if (role !== "STUDENT") {
    return false;
  }

  return isStudentInTeamByUserId(userId, teamId);
}

export async function getTeamFeedbackForTeam(teamId: string) {
  const feedbackRows = await db
    .select({
      id: teamFeedback.id,
      teamId: teamFeedback.teamId,
      category: teamFeedback.category,
      title: teamFeedback.title,
      content: teamFeedback.content,
      status: teamFeedback.status,
      authorUserId: teamFeedback.authorUserId,
      authorName: users.name,
      doneByUserId: teamFeedback.doneByUserId,
      doneAt: teamFeedback.doneAt,
      createdAt: teamFeedback.createdAt,
      updatedAt: teamFeedback.updatedAt,
    })
    .from(teamFeedback)
    .innerJoin(users, eq(teamFeedback.authorUserId, users.id))
    .where(eq(teamFeedback.teamId, teamId))
    .orderBy(desc(teamFeedback.createdAt));

  const commentRows = await db
    .select({
      id: teamFeedbackComments.id,
      feedbackId: teamFeedbackComments.feedbackId,
      content: teamFeedbackComments.content,
      authorUserId: teamFeedbackComments.authorUserId,
      authorName: users.name,
      createdAt: teamFeedbackComments.createdAt,
      updatedAt: teamFeedbackComments.updatedAt,
    })
    .from(teamFeedbackComments)
    .innerJoin(users, eq(teamFeedbackComments.authorUserId, users.id))
    .innerJoin(teamFeedback, eq(teamFeedbackComments.feedbackId, teamFeedback.id))
    .where(eq(teamFeedback.teamId, teamId))
    .orderBy(asc(teamFeedbackComments.createdAt));

  return feedbackRows.map((feedback) => ({
    ...feedback,
    comments: commentRows.filter((comment) => comment.feedbackId === feedback.id),
  }));
}
