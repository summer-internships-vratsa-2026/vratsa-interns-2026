import { getTranslations, setRequestLocale } from "next-intl/server";

import { CreateTaskForm } from "@/components/task/create-task-form";
import { MentorNav } from "@/components/mentor/mentor-nav";
import { Link } from "@/i18n/navigation";
import { requireMentorProfile } from "@/lib/auth/session";
import { hasMainGroupAssigned } from "@/lib/permissions";
import { getAllTopics } from "@/lib/topics/queries";

type MentorCreateTaskPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorCreateTaskPage({ params }: MentorCreateTaskPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);
  const t = await getTranslations("Tasks");

  if (!hasMainGroupAssigned(mentor)) {
    return (
      <section className="space-y-6">
        <MentorNav current="tasks" />
        <p className="text-sm text-red-600">{t("errors.no_main_group")}</p>
        <Link href="/dashboard/mentor/tasks" className="text-sm underline">
          {t("backToTasks")}
        </Link>
      </section>
    );
  }

  const topics = await getAllTopics();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/dashboard/mentor/tasks" className="text-sm text-zinc-500 underline">
          {t("backToTasks")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("createTaskTitle")}</h1>
      </div>

      <MentorNav current="tasks" />

      <div className="max-w-2xl rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <CreateTaskForm locale={locale} variant="mentor" topics={topics} />
      </div>
    </section>
  );
}
