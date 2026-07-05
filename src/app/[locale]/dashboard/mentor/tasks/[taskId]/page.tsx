import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ApplyTaskForm } from "@/components/task/apply-task-form";
import { TaskDescriptionContent } from "@/components/task/task-description-content";
import { formatTaskResponseTypes, formatTaskTarget } from "@/components/task/student-tasks-list";
import { Link } from "@/i18n/navigation";
import { requireMentorProfile } from "@/lib/auth/session";
import { getGroupName } from "@/lib/teams/queries";
import {
  getRootSourceTaskId,
  getTaskAssignment,
  isTaskAssignedToGroup,
} from "@/lib/tasks/queries";
import { canApplyTaskToGroup } from "@/lib/permissions";

type MentorTaskDetailPageProps = {
  params: Promise<{ locale: string; taskId: string }>;
  searchParams: Promise<{ groupId?: string }>;
};

export default async function MentorTaskDetailPage({
  params,
  searchParams,
}: MentorTaskDetailPageProps) {
  const { locale, taskId } = await params;
  const { groupId } = await searchParams;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);

  if (!groupId) {
    notFound();
  }

  const assignment = await getTaskAssignment(taskId, groupId);

  if (!assignment) {
    notFound();
  }

  const t = await getTranslations("Tasks");
  const mainGroupName = mentor.mainGroupId ? await getGroupName(mentor.mainGroupId) : null;
  const rootId = getRootSourceTaskId(assignment.task);
  const alreadyApplied =
    mentor.mainGroupId !== null
      ? await isTaskAssignedToGroup(rootId, mentor.mainGroupId)
      : false;

  const canApply =
    mentor.mainGroupId !== null &&
    groupId !== mentor.mainGroupId &&
    canApplyTaskToGroup(mentor, mentor.mainGroupId) &&
    !alreadyApplied;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/mentor/tasks" className="text-sm text-muted-foreground underline">
          {t("backToTasks")}
        </Link>
        <h1 className="text-2xl font-semibold">{assignment.task.title}</h1>
      </div>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted-foreground">{t("group")}</dt>
            <dd>{assignment.groupName}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("deadline")}</dt>
            <dd>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(assignment.deadline)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("responseTypes")}</dt>
            <dd>{formatTaskResponseTypes(assignment.task.responseTypes, t)}</dd>
          </div>
          {assignment.task.topicId ? (
            <div>
              <dt className="font-medium text-muted-foreground">{t("topic")}</dt>
              <dd>
                {assignment.topicTitle}
                {assignment.topicDescription ? (
                  <span className="text-muted-foreground">
                    {" — "}
                    {assignment.topicDescription}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">{t("targetRoles")}</dt>
            <dd>
              {formatTaskTarget(assignment.task, t)}
            </dd>
          </div>
        </dl>
        <div>
          <h2 className="mb-2 font-medium">{t("description")}</h2>
          <TaskDescriptionContent content={assignment.task.description} />
        </div>
        {assignment.task.sourceTaskId ? (
          <p className="text-sm text-muted-foreground">{t("reusedTaskNote")}</p>
        ) : null}
      </div>

      {canApply && mainGroupName ? (
        <ApplyTaskForm
          locale={locale}
          sourceTaskId={taskId}
          sourceGroupId={groupId}
          mainGroupName={mainGroupName}
        />
      ) : null}

      {alreadyApplied ? (
        <p className="text-sm text-muted-foreground">{t("alreadyAppliedNote")}</p>
      ) : null}
    </section>
  );
}
