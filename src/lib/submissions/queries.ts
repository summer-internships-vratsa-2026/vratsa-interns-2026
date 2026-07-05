import { and, asc, desc, eq, isNotNull, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { groups, submissionComments, submissionGrades, submissions, taskGroups, tasks, teams, topics } from "@/db/schema";
import type { ProjectRole } from "@/db/schema/enums";
import { users } from "@/db/schema/users";
import type { SubmissionListFilters } from "@/lib/submissions/filters";
import { getClientByUserId } from "@/lib/clients/queries";

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

function buildRoleFilter(role: ProjectRole) {
  return or(
    eq(tasks.targetAllRoles, true),
    eq(tasks.onePerTeam, true),
    sql`${tasks.targetRoles} @> ${JSON.stringify([role])}::jsonb`,
  );
}

function buildSubmissionFilterConditions(filters: SubmissionListFilters) {
  const conditions = [];

  if (filters.clientId) {
    conditions.push(eq(teams.clientId, filters.clientId));
  }

  if (filters.groupId) {
    conditions.push(eq(teams.groupId, filters.groupId));
  }

  if (filters.teamId) {
    conditions.push(eq(submissions.teamId, filters.teamId));
  }

  if (filters.taskId) {
    conditions.push(eq(tasks.id, filters.taskId));
  }

  if (filters.role) {
    conditions.push(buildRoleFilter(filters.role));
  }

  if (filters.gradeStatus === "graded") {
    conditions.push(isNotNull(submissionGrades.id));
  } else if (filters.gradeStatus === "ungraded") {
    conditions.push(isNull(submissionGrades.id));
  }

  return conditions;
}

export async function getSubmissionsListWithContext(filters: SubmissionListFilters = { gradeStatus: "all" }) {
  const conditions = buildSubmissionFilterConditions(filters);

  const query = db
    .select({
      submissionId: submissions.id,
      taskGroupId: submissions.taskGroupId,
      teamId: teams.id,
      teamName: teams.name,
      groupId: groups.id,
      groupName: groups.name,
      taskId: tasks.id,
      taskTitle: tasks.title,
      deadline: taskGroups.deadline,
      submittedAt: submissions.submittedAt,
      textReply: submissions.textReply,
      urlCount: sql<number>`jsonb_array_length(${submissions.urls})`.mapWith(Number),
      updatedAt: submissions.updatedAt,
      grade: submissionGrades.grade,
      gradedByName: users.name,
    })
    .from(submissions)
    .innerJoin(teams, eq(submissions.teamId, teams.id))
    .innerJoin(groups, eq(teams.groupId, groups.id))
    .innerJoin(taskGroups, eq(submissions.taskGroupId, taskGroups.id))
    .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
    .leftJoin(submissionGrades, eq(submissionGrades.submissionId, submissions.id))
    .leftJoin(users, eq(submissionGrades.gradedByUserId, users.id))
    .orderBy(desc(submissions.updatedAt));

  if (conditions.length === 0) {
    return query;
  }

  return query.where(and(...conditions));
}

export async function getSubmissionFilterOptions() {
  const [groupRows, teamRows, taskRows] = await Promise.all([
    db
      .selectDistinct({ id: groups.id, name: groups.name })
      .from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .innerJoin(groups, eq(teams.groupId, groups.id))
      .orderBy(groups.name),
    db
      .selectDistinct({ id: teams.id, name: teams.name })
      .from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .orderBy(teams.name),
    db
      .selectDistinct({ id: tasks.id, title: tasks.title })
      .from(submissions)
      .innerJoin(taskGroups, eq(submissions.taskGroupId, taskGroups.id))
      .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
      .orderBy(tasks.title),
  ]);

  return { groups: groupRows, teams: teamRows, tasks: taskRows };
}

export async function getSubmissionFilterOptionsForClient(clientId: string) {
  const clientTeamCondition = eq(teams.clientId, clientId);

  const [groupRows, teamRows, taskRows] = await Promise.all([
    db
      .selectDistinct({ id: groups.id, name: groups.name })
      .from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .innerJoin(groups, eq(teams.groupId, groups.id))
      .where(clientTeamCondition)
      .orderBy(groups.name),
    db
      .selectDistinct({ id: teams.id, name: teams.name })
      .from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .where(clientTeamCondition)
      .orderBy(teams.name),
    db
      .selectDistinct({ id: tasks.id, title: tasks.title })
      .from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .innerJoin(taskGroups, eq(submissions.taskGroupId, taskGroups.id))
      .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
      .where(clientTeamCondition)
      .orderBy(tasks.title),
  ]);

  return { groups: groupRows, teams: teamRows, tasks: taskRows };
}

export async function getSubmissionsForClientUser(
  userId: string,
  filters: SubmissionListFilters = { gradeStatus: "all" },
) {
  const client = await getClientByUserId(userId);

  if (!client) {
    return [];
  }

  return getSubmissionsListWithContext({ ...filters, clientId: client.id });
}

export async function getSubmissionFilterOptionsForClientUser(userId: string) {
  const client = await getClientByUserId(userId);

  if (!client) {
    return { groups: [], teams: [], tasks: [] };
  }

  return getSubmissionFilterOptionsForClient(client.id);
}

export async function getSubmissionDetailById(submissionId: string) {
  const [row] = await db
    .select({
      submission: submissions,
      teamId: teams.id,
      teamName: teams.name,
      groupId: groups.id,
      groupName: groups.name,
      taskGroupId: taskGroups.id,
      deadline: taskGroups.deadline,
      task: tasks,
      topicTitle: topics.title,
    })
    .from(submissions)
    .innerJoin(teams, eq(submissions.teamId, teams.id))
    .innerJoin(groups, eq(teams.groupId, groups.id))
    .innerJoin(taskGroups, eq(submissions.taskGroupId, taskGroups.id))
    .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
    .leftJoin(topics, eq(tasks.topicId, topics.id))
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!row) {
    return null;
  }

  const comments = await db
    .select({
      id: submissionComments.id,
      content: submissionComments.content,
      authorUserId: submissionComments.authorUserId,
      authorName: users.name,
      createdAt: submissionComments.createdAt,
    })
    .from(submissionComments)
    .innerJoin(users, eq(submissionComments.authorUserId, users.id))
    .where(eq(submissionComments.submissionId, submissionId))
    .orderBy(asc(submissionComments.createdAt));

  const [grade] = await db
    .select({
      id: submissionGrades.id,
      grade: submissionGrades.grade,
      gradedByUserId: submissionGrades.gradedByUserId,
      gradedByName: users.name,
      updatedAt: submissionGrades.updatedAt,
    })
    .from(submissionGrades)
    .innerJoin(users, eq(submissionGrades.gradedByUserId, users.id))
    .where(eq(submissionGrades.submissionId, submissionId))
    .limit(1);

  return {
    ...row,
    comments,
    grade: grade ?? null,
  };
}

export async function getSubmissionWithFeedback(teamId: string, taskGroupId: string) {
  const submission = await getSubmissionForTeamTask(teamId, taskGroupId);

  if (!submission) {
    return null;
  }

  return getSubmissionDetailById(submission.id);
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

/** @deprecated Use getSubmissionsListWithContext from submissions/queries */
export async function getAllSubmissionsWithContext() {
  return getSubmissionsListWithContext({ gradeStatus: "all" });
}
