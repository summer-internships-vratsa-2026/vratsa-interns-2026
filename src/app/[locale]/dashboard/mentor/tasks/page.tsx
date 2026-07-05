import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { requireMentorProfile } from "@/lib/auth/session";
import { getAllTasksWithGroups, getRootSourceTaskId, isTaskAssignedToGroup } from "@/lib/tasks/queries";
import { canApplyTaskToGroup, canCreateTaskForGroup, hasMainGroupAssigned } from "@/lib/permissions";
import { formatTaskResponseTypes, formatTaskTarget } from "@/components/task/student-tasks-list";

type MentorTasksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorTasksPage({ params }: MentorTasksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);

  const tasks = await getAllTasksWithGroups();
  const t = await getTranslations("Tasks");
  const canCreate = hasMainGroupAssigned(mentor);

  const applyChecks = await Promise.all(
    tasks.map(async (task) => {
      if (!mentor.mainGroupId || task.groupId === mentor.mainGroupId) {
        return { key: `${task.taskId}-${task.groupId}`, canApply: false };
      }

      const rootId = getRootSourceTaskId({
        id: task.taskId,
        sourceTaskId: task.sourceTaskId,
      });
      const alreadyApplied = await isTaskAssignedToGroup(rootId, mentor.mainGroupId);

      return {
        key: `${task.taskId}-${task.groupId}`,
        canApply:
          canApplyTaskToGroup(mentor, mentor.mainGroupId) &&
          !alreadyApplied,
      };
    }),
  );

  const applyMap = new Map(applyChecks.map((row) => [row.key, row.canApply]));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("mentorPageTitle")}</h1>
        {canCreate ? (
          <Link
            href="/dashboard/mentor/tasks/create"
            className="inline-flex h-9 items-center justify-center rounded-md bg-brand-accent px-4 text-sm font-medium text-white hover:bg-brand-accent-hover"
          >
            {t("createTask")}
          </Link>
        ) : null}
      </div>
      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
          {t("emptyTasks")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-brand-dark/30 /50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("title")}</th>
                <th className="px-4 py-3 font-medium">{t("group")}</th>
                <th className="px-4 py-3 font-medium">{t("deadline")}</th>
                <th className="px-4 py-3 font-medium">{t("targetRoles")}</th>
                <th className="px-4 py-3 font-medium">{t("responseTypes")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const rowKey = `${task.taskId}-${task.groupId}`;
                const isMainGroup = canCreateTaskForGroup(mentor, task.groupId);
                const canApply = applyMap.get(rowKey) ?? false;

                return (
                  <tr
                    key={rowKey}
                    className="border-b border-white/10 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/mentor/tasks/${task.taskId}?groupId=${task.groupId}`}
                        className="font-medium underline"
                      >
                        {task.title}
                      </Link>
                      {task.topicTitle ? (
                        <p className="mt-1 text-muted-foreground">
                          {t("topicLabel", { topic: task.topicTitle })}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{task.groupName}</td>
                    <td className="px-4 py-3">
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(task.deadline)}
                    </td>
                    <td className="px-4 py-3">
                      {formatTaskTarget(task, t)}
                    </td>
                    <td className="px-4 py-3">
                      {formatTaskResponseTypes(task.responseTypes, t)}
                    </td>
                    <td className="px-4 py-3">
                      {isMainGroup ? (
                        <span className="text-green-700 dark:text-green-400">{t("mainGroupTask")}</span>
                      ) : canApply ? (
                        <Link
                          href={`/dashboard/mentor/tasks/${task.taskId}?groupId=${task.groupId}`}
                          className="underline"
                        >
                          {t("applyToMyGroup")}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{t("viewOnly")}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
