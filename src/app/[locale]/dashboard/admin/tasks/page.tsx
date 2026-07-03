import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { formatTaskResponseTypes, formatTaskTarget } from "@/components/task/student-tasks-list";
import { requireRole } from "@/lib/auth/session";
import { getAllTasksWithGroups } from "@/lib/tasks/queries";

type AdminTasksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminTasksPage({ params }: AdminTasksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const tasks = await getAllTasksWithGroups();
  const t = await getTranslations("Tasks");

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Link href="/dashboard/admin" className="text-sm text-zinc-500 underline">
            {t("backToDashboard")}
          </Link>
          <h1 className="text-2xl font-semibold">{t("adminPageTitle")}</h1>
        </div>
        <Link
          href="/dashboard/admin/tasks/create"
          className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {t("createTask")}
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptyTasks")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("title")}</th>
                <th className="px-4 py-3 font-medium">{t("group")}</th>
                <th className="px-4 py-3 font-medium">{t("deadline")}</th>
                <th className="px-4 py-3 font-medium">{t("createdBy")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={`${task.taskId}-${task.groupId}`}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/admin/tasks/${task.taskId}?groupId=${task.groupId}`}
                      className="font-medium underline"
                    >
                      {task.title}
                    </Link>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {formatTaskTarget(task, t)}
                    </p>
                    <p className="mt-1 text-zinc-500">
                      {formatTaskResponseTypes(task.responseTypes, t)}
                    </p>
                  </td>
                  <td className="px-4 py-3">{task.groupName}</td>
                  <td className="px-4 py-3">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(task.deadline)}
                  </td>
                  <td className="px-4 py-3">{task.createdByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
