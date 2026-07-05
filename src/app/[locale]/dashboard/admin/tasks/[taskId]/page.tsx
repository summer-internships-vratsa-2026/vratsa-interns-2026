import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TaskDescriptionContent } from "@/components/task/task-description-content";
import { TaskStatusBadge } from "@/components/task/task-status-badge";
import { formatTaskResponseTypes, formatTaskTarget } from "@/components/task/student-tasks-list";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { canEditTask } from "@/lib/permissions";
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
  const session = await requireRole(locale, "ADMIN");

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

  const canEdit = selectedAssignment
    ? await canEditTask(
        session.user.id,
        session.user.role,
        taskId,
        selectedAssignment.groupId,
      )
    : false;

  const statusLabels = {
    DRAFT: t("status.draft"),
    PUBLISHED: t("status.published"),
  } as const;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/admin/tasks" className="text-sm text-muted-foreground underline">
          {t("backToTasks")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{taskDetail.task.title}</h1>
          <TaskStatusBadge
            status={taskDetail.task.status}
            label={statusLabels[taskDetail.task.status]}
          />
        </div>
        {canEdit && selectedAssignment ? (
          <Link
            href={`/dashboard/admin/tasks/${taskId}/edit?groupId=${selectedAssignment.groupId}`}
            className="inline-flex text-sm font-medium text-brand-accent underline-offset-4 hover:underline"
          >
            {t("editTask")}
          </Link>
        ) : null}
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted-foreground">{t("createdBy")}</dt>
            <dd>{taskDetail.createdByName}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("targetRoles")}</dt>
            <dd>{formatTaskTarget(taskDetail.task, t)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("responseTypes")}</dt>
            <dd>{formatTaskResponseTypes(taskDetail.task.responseTypes, t)}</dd>
          </div>
          {taskDetail.topic ? (
            <div>
              <dt className="font-medium text-muted-foreground">{t("topic")}</dt>
              <dd>
                <span className="font-medium">{taskDetail.topic.title}</span>
                <span className="text-muted-foreground">
                  {" — "}
                  {taskDetail.topic.description}
                </span>
              </dd>
            </div>
          ) : null}
        </dl>
        <div>
          <h2 className="mb-2 font-medium">{t("description")}</h2>
          <TaskDescriptionContent content={taskDetail.task.description} />
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
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
        <p className="text-sm text-muted-foreground">
          {t("viewingGroup", { group: selectedAssignment.groupName })}
        </p>
      ) : null}
    </section>
  );
}
