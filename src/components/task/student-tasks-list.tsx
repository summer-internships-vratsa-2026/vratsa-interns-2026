import { getTranslations } from "next-intl/server";

import { TaskDescriptionContent } from "@/components/task/task-description-content";
import type { ProjectRole } from "@/db/schema/enums";
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
};

type StudentTasksListProps = {
  locale: string;
  tasks: StudentTaskRow[];
};

export async function StudentTasksList({ locale, tasks }: StudentTasksListProps) {
  const t = await getTranslations("Tasks");

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("studentEmptyTasks")}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.taskGroupId}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-medium">{task.title}</h3>
              <TaskDescriptionContent
                content={task.description}
                className="text-zinc-600 dark:text-zinc-400"
              />
            </div>
            <p className="text-sm text-zinc-500">
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
          <p className="mt-3 text-sm text-zinc-500">{t("submissionComingSoon")}</p>
        </li>
      ))}
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
