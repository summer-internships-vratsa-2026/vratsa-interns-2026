import { getTranslations, setRequestLocale } from "next-intl/server";

import { CreateTaskForm } from "@/components/task/create-task-form";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getAllGroups } from "@/lib/teams/admin-queries";
import { getAllTopics } from "@/lib/topics/queries";

type AdminCreateTaskPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCreateTaskPage({ params }: AdminCreateTaskPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const [groups, topics] = await Promise.all([getAllGroups(), getAllTopics()]);
  const t = await getTranslations("Tasks");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/admin/tasks" className="text-sm text-zinc-500 underline">
          {t("backToTasks")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("createTaskTitle")}</h1>
      </div>

      <div className="max-w-2xl rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <CreateTaskForm locale={locale} variant="admin" groups={groups} topics={topics} />
      </div>
    </section>
  );
}
