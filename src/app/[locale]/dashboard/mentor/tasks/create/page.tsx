import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormErrorMessage } from "@/components/ui/form-error-message";

import { CreateTaskForm } from "@/components/task/create-task-form";
import { Link } from "@/i18n/navigation";
import { requireMentorProfile } from "@/lib/auth/session";
import { canCreateTask } from "@/lib/permissions";
import { getAllTopics } from "@/lib/topics/queries";

type MentorCreateTaskPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MentorCreateTaskPage({ params }: MentorCreateTaskPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { mentor } = await requireMentorProfile(locale);
  const t = await getTranslations("Tasks");

  if (!canCreateTask("MENTOR", mentor)) {
    return (
      <section className="space-y-6">
        <FormErrorMessage>{t("errors.no_main_group")}</FormErrorMessage>
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
        <Link href="/dashboard/mentor/tasks" className="text-sm text-muted-foreground underline">
          {t("backToTasks")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("createTaskTitle")}</h1>
      </div>

      <div className="max-w-2xl rounded-lg border border-border p-4">
        <CreateTaskForm locale={locale} variant="mentor" topics={topics} mode="create" />
      </div>
    </section>
  );
}
