import { getTranslations, setRequestLocale } from "next-intl/server";

import { MentorNav } from "@/components/mentor/mentor-nav";
import { requireMentorProfile } from "@/lib/auth/session";
import { getAllTasksWithGroups } from "@/lib/mentors/queries";
import { canApplyTaskToGroup, canCreateTaskForGroup } from "@/lib/permissions";

type MentorTasksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorTasksPage({ params }: MentorTasksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);

  const tasks = await getAllTasksWithGroups();
  const t = await getTranslations("MentorDashboard");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("tasksPageTitle")}</h1>
      </div>

      <MentorNav current="tasks" />

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptyTasks")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("tasksColumns.title")}</th>
                <th className="px-4 py-3 font-medium">{t("tasksColumns.group")}</th>
                <th className="px-4 py-3 font-medium">{t("tasksColumns.deadline")}</th>
                <th className="px-4 py-3 font-medium">{t("tasksColumns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isMainGroup =
                  canCreateTaskForGroup(mentor, task.groupId) &&
                  canApplyTaskToGroup(mentor, task.groupId);

                return (
                  <tr
                    key={`${task.taskId}-${task.groupId}`}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 line-clamp-2 text-zinc-600 dark:text-zinc-400">
                        {task.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">{task.groupName}</td>
                    <td className="px-4 py-3">
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(task.deadline)}
                    </td>
                    <td className="px-4 py-3">
                      {isMainGroup ? (
                        <span className="text-green-700 dark:text-green-400">
                          {t("tasksMainGroup")}
                        </span>
                      ) : (
                        <span className="text-zinc-500">{t("tasksViewOnly")}</span>
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
