import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TaskDescriptionContent } from "@/components/task/task-description-content";
import { formatTaskResponseTypes, formatTaskTarget } from "@/components/task/student-tasks-list";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTaskAssignment, getTaskWithGroups } from "@/lib/tasks/queries";

type AdminTaskDetailPageProps = {
  params: Promise<{ locale: string; taskId: string }>;
  searchParams: Promise<{ groupId?: string }>;
};

export default async function AdminTaskDetailPage({
  params,
  searchParams,
}: AdminTaskDetailPageProps) {
  const { locale, taskId } = await params;
  const { groupId } = await searchParams;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const taskDetail = await getTaskWithGroups(taskId);

  if (!taskDetail) {
    notFound();
  }

  const t = await getTranslations("Tasks");
  const selectedAssignment = groupId
    ? await getTaskAssignment(taskId, groupId)
    : taskDetail.assignments[0]
      ? await getTaskAssignment(taskId, taskDetail.assignments[0].groupId)
      : null;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/admin/tasks" className="text-sm text-zinc-500 underline">
          {t("backToTasks")}
        </Link>
        <h1 className="text-2xl font-semibold">{taskDetail.task.title}</h1>
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-zinc-500">{t("createdBy")}</dt>
            <dd>{taskDetail.createdByName}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">{t("targetRoles")}</dt>
            <dd>{formatTaskTarget(taskDetail.task, t)}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">{t("responseTypes")}</dt>
            <dd>{formatTaskResponseTypes(taskDetail.task.responseTypes, t)}</dd>
          </div>
        </dl>
        <div>
          <h2 className="mb-2 font-medium">{t("description")}</h2>
          <TaskDescriptionContent content={taskDetail.task.description} />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-medium">{t("groupAssignments")}</h2>
        <ul className="space-y-2 text-sm">
          {taskDetail.assignments.map((assignment) => (
            <li key={assignment.taskGroupId}>
              <Link
                href={`/dashboard/admin/tasks/${taskId}?groupId=${assignment.groupId}`}
                className={
                  selectedAssignment?.groupId === assignment.groupId
                    ? "font-medium underline"
                    : "underline"
                }
              >
                {assignment.groupName}
              </Link>
              {" — "}
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(assignment.deadline)}
            </li>
          ))}
        </ul>
      </div>

      {selectedAssignment ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t("viewingGroup", { group: selectedAssignment.groupName })}
        </p>
      ) : null}
    </section>
  );
}
