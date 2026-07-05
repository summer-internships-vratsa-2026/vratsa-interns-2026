import { getTranslations } from "next-intl/server";

import { SubmissionStatusBadge } from "@/components/task/submission-status-badge";
import { Link } from "@/i18n/navigation";
import type { ProjectRole } from "@/db/schema/enums";
import { getSubmissionStatus } from "@/lib/submissions/queries";
import type { TaskResponseType } from "@/lib/validations/task";

type TaskTargetInfo = {
  targetAllRoles: boolean;
  onePerTeam: boolean;
  targetRoles: ProjectRole[] | null;
};

type StudentTaskRow = TaskTargetInfo & {
  taskGroupId: string;
  taskId: string;
  title: string;
  description: string;
  deadline: Date;
  responseTypes: TaskResponseType[];
  topicTitle?: string | null;
  topicDescription?: string | null;
};

type SubmissionSummary = {
  taskGroupId: string;
  submittedAt: Date | null;
};

type StudentTasksListProps = {
  locale: string;
  tasks: StudentTaskRow[];
  submissions?: SubmissionSummary[];
};

export async function StudentTasksList({ locale, tasks, submissions = [] }: StudentTasksListProps) {
  const t = await getTranslations("Tasks");
  const tSub = await getTranslations("Submissions");

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("studentEmptyTasks")}</p>
    );
  }

  const submissionMap = new Map(submissions.map((s) => [s.taskGroupId, s]));

  const statusLabels = {
    not_submitted: tSub("status.not_submitted"),
    submitted: tSub("status.submitted"),
    late: tSub("status.late"),
  } as const;

  return (
    <ul className="space-y-3">
      {tasks.map((task) => {
        const submission = submissionMap.get(task.taskGroupId) ?? null;
        const status = getSubmissionStatus(submission, task.deadline);
        const isPastDeadline = new Date() > task.deadline;

        return (
          <li
            key={task.taskGroupId}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <SubmissionStatusBadge status={status} label={statusLabels[status]} />
                </div>
                {task.topicTitle ? (
                  <p className="text-sm text-zinc-500">
                    {t("topicLabel", { topic: task.topicTitle })}
                  </p>
                ) : null}
              </div>
              <p className={`text-sm ${isPastDeadline ? "font-medium text-red-600 dark:text-red-400" : "text-zinc-500"}`}>
                {t("deadline")}:{" "}
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(task.deadline)}
              </p>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{formatTaskTarget(task, t)}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {t("responseTypesLabel", { types: formatTaskResponseTypes(task.responseTypes, t) })}
            </p>
            <div className="mt-3">
              <Link
                href={`/dashboard/student/tasks/${task.taskGroupId}`}
                className="text-sm font-medium underline text-zinc-800 dark:text-zinc-200"
              >
                {status === "not_submitted" ? tSub("openToSubmit") : tSub("viewSubmission")}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function formatTaskTarget(
  task: TaskTargetInfo,
  t: (key: string, values?: Record<string, string>) => string,
) {
  if (task.onePerTeam) {
    return t("onePerTeam");
  }

  if (task.targetAllRoles) {
    return t("allRoles");
  }

  return t("selectedRolesLabel", {
    roles: (task.targetRoles ?? []).map((role) => t(`roles.${role}`)).join(", "),
  });
}

export function formatTaskResponseTypes(
  responseTypes: TaskResponseType[],
  t: (key: string, values?: Record<string, string>) => string,
) {
  return responseTypes.map((type) => t(`responseTypeOptions.${type}`)).join(", ");
}

/** @deprecated Use formatTaskTarget instead */
export function formatTaskRoles(
  targetAllRoles: boolean,
  targetRoles: ProjectRole[] | null,
  t: (key: string, values?: Record<string, string>) => string,
  onePerTeam = false,
) {
  return formatTaskTarget({ targetAllRoles, onePerTeam, targetRoles }, t);
}
