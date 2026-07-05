import { eq } from "drizzle-orm";

import { db } from "@/db";
import { submissionGrades, submissions, teams } from "@/db/schema";
import type { ProjectRole } from "@/db/schema/enums";
import { getSubmissionStatus } from "@/lib/submissions/queries";
import { getEligibleTasksForStudent, getTasksForGroup } from "@/lib/tasks/queries";
import type { TaskResponseType } from "@/lib/validations/task";

export type TeamTaskSubmission = {
  id: string;
  textReply: string | null;
  urls: string[];
  submittedAt: Date | null;
};

export type TeamTaskWithSubmission = {
  taskGroupId: string;
  taskId: string;
  title: string;
  description: string;
  deadline: Date;
  targetAllRoles: boolean;
  onePerTeam: boolean;
  targetRoles: ProjectRole[] | null;
  responseTypes: TaskResponseType[];
  topicTitle: string | null;
  submission: TeamTaskSubmission | null;
  grade: number | null;
  status: "not_submitted" | "submitted" | "late";
};

type GetTeamTasksOptions = {
  projectRole?: ProjectRole;
};

export async function getTeamTasksWithSubmissions(
  teamId: string,
  options: GetTeamTasksOptions = {},
): Promise<TeamTaskWithSubmission[]> {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);

  if (!team) {
    return [];
  }

  const taskRows = options.projectRole
    ? await getEligibleTasksForStudent(team.groupId, options.projectRole)
    : await getTasksForGroup(team.groupId);

  const [submissionRows, gradeRows] = await Promise.all([
    db.select().from(submissions).where(eq(submissions.teamId, teamId)),
    db
      .select({
        submissionId: submissionGrades.submissionId,
        grade: submissionGrades.grade,
      })
      .from(submissionGrades)
      .innerJoin(submissions, eq(submissionGrades.submissionId, submissions.id))
      .where(eq(submissions.teamId, teamId)),
  ]);

  const submissionMap = new Map(submissionRows.map((row) => [row.taskGroupId, row]));
  const gradeMap = new Map(gradeRows.map((row) => [row.submissionId, row.grade]));

  return taskRows.map((task) => {
    const submission = submissionMap.get(task.taskGroupId) ?? null;
    const status = getSubmissionStatus(submission, task.deadline);

    return {
      taskGroupId: task.taskGroupId,
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      targetAllRoles: task.targetAllRoles,
      onePerTeam: task.onePerTeam,
      targetRoles: task.targetRoles,
      responseTypes: task.responseTypes,
      topicTitle: task.topicTitle,
      submission: submission
        ? {
            id: submission.id,
            textReply: submission.textReply,
            urls: submission.urls,
            submittedAt: submission.submittedAt,
          }
        : null,
      grade: submission ? (gradeMap.get(submission.id) ?? null) : null,
      status,
    };
  });
}
