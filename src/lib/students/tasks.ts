import type { ProjectRole } from "@/db/schema/enums";
import { getSubmissionStatus, getSubmissionsForTeam } from "@/lib/submissions/queries";
import { getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";
import { getEligibleTasksForStudent } from "@/lib/tasks/queries";
import type { TaskResponseType } from "@/lib/validations/task";

export type StudentTaskRow = {
  taskGroupId: string;
  taskId: string;
  title: string;
  description: string;
  deadline: Date;
  targetAllRoles: boolean;
  onePerTeam: boolean;
  targetRoles: ProjectRole[] | null;
  responseTypes: TaskResponseType[];
  topicTitle?: string | null;
  topicDescription?: string | null;
};

export type StudentSubmittedTaskRow = StudentTaskRow & {
  submissionId: string;
  submittedAt: Date;
  updatedAt: Date;
};

export type StudentTaskOverview = {
  teamId: string;
  newTasks: StudentTaskRow[];
  submittedTasks: StudentSubmittedTaskRow[];
  newTaskCount: number;
};

export async function getStudentTaskOverview(userId: string): Promise<StudentTaskOverview | null> {
  const student = await getStudentByUserId(userId);

  if (!student) {
    return null;
  }

  const membership = await getTeamMembershipForStudent(student.id);

  if (!membership) {
    return null;
  }

  const [tasks, submissions] = await Promise.all([
    getEligibleTasksForStudent(membership.team.groupId, membership.member.projectRole),
    getSubmissionsForTeam(membership.team.id),
  ]);

  const submissionMap = new Map(submissions.map((submission) => [submission.taskGroupId, submission]));

  const newTasks = tasks.filter((task) => {
    const submission = submissionMap.get(task.taskGroupId) ?? null;
    return getSubmissionStatus(submission, task.deadline) === "not_submitted";
  });

  const submittedTasks = tasks.flatMap((task) => {
    const submission = submissionMap.get(task.taskGroupId);

    if (!submission?.submittedAt) {
      return [];
    }

    return [
      {
        ...task,
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
        updatedAt: submission.updatedAt,
      },
    ];
  });

  submittedTasks.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  return {
    teamId: membership.team.id,
    newTasks,
    submittedTasks,
    newTaskCount: newTasks.length,
  };
}

export async function getStudentNewTaskCount(userId: string): Promise<number> {
  const overview = await getStudentTaskOverview(userId);
  return overview?.newTaskCount ?? 0;
}
