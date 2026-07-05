import { count, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import {
  groups,
  submissionComments,
  submissionGrades,
  submissions,
  taskGroups,
  tasks,
  teams,
  topics,
  users,
} from "@/db/schema";
import { getClientByUserId } from "@/lib/clients/queries";
import { getGroupsOverview } from "@/lib/mentors/queries";
import { getSubmissionStatus, getSubmissionsListWithContext } from "@/lib/submissions/queries";
import { getStudentTaskOverview } from "@/lib/students/tasks";
import {
  getGroupName,
  getStudentByUserId,
  getTeamMembersWithNames,
  getTeamMembershipForStudent,
} from "@/lib/teams/queries";

export async function getAdminDashboardStats() {
  const [userCount, teamCount, groupCount, taskCount, topicCount, submissionCount] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(teams),
    db.select({ count: count() }).from(groups),
    db.select({ count: count() }).from(tasks),
    db.select({ count: count() }).from(topics),
    db
      .select({ count: count() })
      .from(submissions)
      .where(isNotNull(submissions.submittedAt)),
  ]);

  return {
    users: userCount[0]?.count ?? 0,
    teams: teamCount[0]?.count ?? 0,
    groups: groupCount[0]?.count ?? 0,
    tasks: taskCount[0]?.count ?? 0,
    topics: topicCount[0]?.count ?? 0,
    submissions: submissionCount[0]?.count ?? 0,
  };
}

export async function getMentorDashboardOverview(mentor: { id: string; mainGroupId: string | null }) {
  const [groups, allSubmissions, recentSubmissions] = await Promise.all([
    getGroupsOverview(),
    getSubmissionsListWithContext({ gradeStatus: "all" }),
    getSubmissionsListWithContext({ gradeStatus: "all" }),
  ]);

  const mainGroupName = mentor.mainGroupId ? await getGroupName(mentor.mainGroupId) : null;
  const mainGroupTeams = mentor.mainGroupId
    ? (groups.find((group) => group.id === mentor.mainGroupId)?.teamCount ?? 0)
    : 0;

  let mainGroupTaskCount = 0;
  if (mentor.mainGroupId) {
    const [row] = await db
      .select({ count: count() })
      .from(taskGroups)
      .where(eq(taskGroups.groupId, mentor.mainGroupId));
    mainGroupTaskCount = row?.count ?? 0;
  }

  const submitted = allSubmissions.filter((row) => row.submittedAt);
  const pendingReviews = submitted.filter((row) => row.grade === null).length;

  return {
    mainGroupName,
    mainGroupTeams,
    mainGroupTaskCount,
    groupCount: groups.length,
    pendingReviews,
    recentSubmissions: recentSubmissions.filter((row) => row.submittedAt).slice(0, 5),
  };
}

export async function getStudentDashboardOverview(userId: string) {
  const student = await getStudentByUserId(userId);

  if (!student) {
    return null;
  }

  const membership = await getTeamMembershipForStudent(student.id);

  if (!membership) {
    return null;
  }

  const [groupName, members, taskOverview] = await Promise.all([
    getGroupName(membership.team.groupId),
    getTeamMembersWithNames(membership.team.id),
    getStudentTaskOverview(userId),
  ]);

  if (!taskOverview) {
    return null;
  }

  const upcomingDeadlines = [...taskOverview.newTasks]
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5);

  const recentSubmissions = taskOverview.submittedTasks.slice(0, 5).map((task) => ({
    taskGroupId: task.taskGroupId,
    title: task.title,
    submittedAt: task.submittedAt,
    status: getSubmissionStatus(
      { submittedAt: task.submittedAt },
      task.deadline,
    ) as "submitted" | "late",
  }));

  return {
    team: {
      id: membership.team.id,
      name: membership.team.name,
      groupName,
      memberCount: members.length,
    },
    activeTaskCount: taskOverview.newTaskCount,
    submittedCount: taskOverview.submittedTasks.length,
    upcomingDeadlines,
    recentSubmissions,
  };
}

export async function getClientDashboardOverview(userId: string) {
  const client = await getClientByUserId(userId);

  if (!client) {
    return null;
  }

  const [teamRows, submissionRows, recentComments] = await Promise.all([
    db.select({ id: teams.id, name: teams.name }).from(teams).where(eq(teams.clientId, client.id)),
    getSubmissionsListWithContext({ clientId: client.id, gradeStatus: "all" }),
    db
      .select({
        id: submissionComments.id,
        content: submissionComments.content,
        createdAt: submissionComments.createdAt,
        authorName: users.name,
        taskTitle: tasks.title,
        teamName: teams.name,
        submissionId: submissions.id,
      })
      .from(submissionComments)
      .innerJoin(submissions, eq(submissionComments.submissionId, submissions.id))
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .innerJoin(taskGroups, eq(submissions.taskGroupId, taskGroups.id))
      .innerJoin(tasks, eq(taskGroups.taskId, tasks.id))
      .innerJoin(users, eq(submissionComments.authorUserId, users.id))
      .where(eq(teams.clientId, client.id))
      .orderBy(desc(submissionComments.createdAt))
      .limit(5),
  ]);

  const submittedCount = submissionRows.filter((row) => row.submittedAt).length;

  return {
    teams: teamRows,
    teamCount: teamRows.length,
    submissionCount: submittedCount,
    recentSubmissions: submissionRows.filter((row) => row.submittedAt).slice(0, 5),
    recentComments,
  };
}
