import { desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { groups, mentors, submissions, taskGroups, tasks, teams, users } from "@/db/schema";

export async function getMentorByUserId(userId: string) {
  const [mentor] = await db.select().from(mentors).where(eq(mentors.userId, userId)).limit(1);
  return mentor ?? null;
}

export async function getMentorsWithMainGroup() {
  return db
    .select({
      id: mentors.id,
      userId: mentors.userId,
      mainGroupId: mentors.mainGroupId,
      name: users.name,
      email: users.email,
      mainGroupName: groups.name,
    })
    .from(mentors)
    .innerJoin(users, eq(mentors.userId, users.id))
    .leftJoin(groups, eq(mentors.mainGroupId, groups.id))
    .orderBy(users.name);
}

export async function getGroupsOverview() {
  const allGroups = await db.select().from(groups).orderBy(groups.name);

  const [teamCounts, mentorRows] = await Promise.all([
    db
      .select({
        groupId: teams.groupId,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(teams)
      .groupBy(teams.groupId),
    db
      .select({
        groupId: mentors.mainGroupId,
        mentorName: users.name,
      })
      .from(mentors)
      .innerJoin(users, eq(mentors.userId, users.id))
      .where(isNotNull(mentors.mainGroupId)),
  ]);

  const teamCountByGroup = new Map(teamCounts.map((row) => [row.groupId, row.count]));
  const mentorsByGroup = new Map<string, string[]>();

  for (const row of mentorRows) {
    if (!row.groupId) {
      continue;
    }

    const names = mentorsByGroup.get(row.groupId) ?? [];
    names.push(row.mentorName);
    mentorsByGroup.set(row.groupId, names);
  }

  return allGroups.map((group) => ({
    id: group.id,
    name: group.name,
    teamCount: teamCountByGroup.get(group.id) ?? 0,
    mainMentors: mentorsByGroup.get(group.id) ?? [],
  }));
}

export async function getAllTasksWithGroups() {
  return db
    .select({
      taskId: tasks.id,
      title: tasks.title,
      description: tasks.description,
      groupId: taskGroups.groupId,
      groupName: groups.name,
      deadline: taskGroups.deadline,
      targetAllRoles: tasks.targetAllRoles,
      targetRoles: tasks.targetRoles,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .innerJoin(taskGroups, eq(tasks.id, taskGroups.taskId))
    .innerJoin(groups, eq(taskGroups.groupId, groups.id))
    .orderBy(desc(taskGroups.deadline));
}

export async function getAllSubmissionsWithContext() {
  return db
    .select({
      submissionId: submissions.id,
      teamId: teams.id,
      teamName: teams.name,
      groupId: groups.id,
      groupName: groups.name,
      taskId: tasks.id,
      taskTitle: tasks.title,
      submittedAt: submissions.submittedAt,
      textReply: submissions.textReply,
      urlCount: sql<number>`jsonb_array_length(${submissions.urls})`.mapWith(Number),
      updatedAt: submissions.updatedAt,
    })
    .from(submissions)
    .innerJoin(teams, eq(submissions.teamId, teams.id))
    .innerJoin(groups, eq(teams.groupId, groups.id))
    .innerJoin(taskGroups, eq(submissions.taskGroupId, taskGroups.id))
    .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
    .orderBy(desc(submissions.updatedAt));
}

export type MentorProfile = NonNullable<Awaited<ReturnType<typeof getMentorByUserId>>>;
